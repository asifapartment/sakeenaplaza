import { NextResponse } from "next/server";
import { query } from "@/lib/mysql-wrapper";
import { verifyToken } from "@/lib/jwt";
import { parseCookies } from "@/lib/cookies";
import { createNotification } from "@/lib/notification-service";

// Cache configuration
const CACHE_DURATION = 300; // 5 minutes in seconds
const MAX_REVIEWS_PER_REQUEST = 50;
const MIN_COMMENT_LENGTH = 10;
const MAX_COMMENT_LENGTH = 1000;

// In-memory cache for apartment reviews
const reviewCache = new Map();

// Clean up expired cache entries every hour
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of reviewCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION * 1000) {
            reviewCache.delete(key);
        }
    }
}, 3600000);

// Helper function to get cached reviews
const getCachedReviews = (apartmentId) => {
    const cached = reviewCache.get(apartmentId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION * 1000) {
        return cached.data;
    }
    return null;
};

// Helper function to set cached reviews
const setCachedReviews = (apartmentId, data) => {
    reviewCache.set(apartmentId, {
        data,
        timestamp: Date.now()
    });
};

// Helper function to validate review input
const validateReviewInput = (rating, comment) => {
    if (!rating || !comment) {
        return { valid: false, error: "Missing required fields" };
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return { valid: false, error: "Rating must be between 1 and 5" };
    }

    if (comment.length < MIN_COMMENT_LENGTH) {
        return { valid: false, error: `Comment must be at least ${MIN_COMMENT_LENGTH} characters` };
    }

    if (comment.length > MAX_COMMENT_LENGTH) {
        return { valid: false, error: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters` };
    }

    return { valid: true, rating: ratingNum };
};

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const apartmentId = searchParams.get("apartmentId");
        const limit = Math.min(
            parseInt(searchParams.get("limit") || MAX_REVIEWS_PER_REQUEST),
            MAX_REVIEWS_PER_REQUEST
        );
        const offset = parseInt(searchParams.get("offset") || 0);

        // Validate apartmentId if provided
        if (apartmentId && (isNaN(parseInt(apartmentId)) || parseInt(apartmentId) <= 0)) {
            return NextResponse.json(
                { success: false, error: "Invalid apartment ID" },
                { status: 400 }
            );
        }

        // Extract and verify token efficiently
        const cookieHeader = req.headers.get("cookie");
        let userIdFromToken = null;
        let isAuthenticated = false;

        if (cookieHeader) {
            const cookies = parseCookies(cookieHeader);
            const token = cookies?.token;

            if (token) {
                try {
                    const { valid, decoded } = verifyToken(token);
                    if (valid && decoded?.id) {
                        userIdFromToken = decoded.id;
                        isAuthenticated = true;
                    }
                } catch (tokenError) {
                    // Token verification failed, continue as unauthenticated
                    console.warn("Token verification failed:", tokenError.message);
                }
            }
        }

        /* ───────────────────────────
           GET REVIEWS BY APARTMENT (with caching & pagination)
        ─────────────────────────── */
        if (apartmentId) {
            // Check cache first (only for first page)
            let responseData = offset === 0 ? getCachedReviews(apartmentId) : null;

            if (!responseData) {
                // Get total count for pagination
                const countResult = await query(
                    `
                    SELECT COUNT(*) as total
                    FROM reviews r
                    WHERE r.apartment_id = ?
                    `,
                    [apartmentId]
                );

                const total = countResult[0]?.total || 0;

                // Optimized query with pagination
                const reviews = await query(
                    `
                    SELECT 
                        r.id,
                        r.rating,
                        r.comment,
                        r.created_at,
                        u.name AS user_name,
                        DATE_FORMAT(r.created_at, '%b %d, %Y') AS formatted_date,
                        CASE 
                            WHEN r.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN true 
                            ELSE false 
                        END AS is_recent
                    FROM reviews r
                    INNER JOIN users u ON r.user_id = u.id
                    WHERE r.apartment_id = ?
                    ORDER BY r.created_at DESC
                    LIMIT ${limit} OFFSET ${offset}
                    `,
                    [apartmentId]
                );

                // Calculate rating statistics
                const stats = await query(
                    `
                    SELECT 
                        ROUND(AVG(rating), 1) as average_rating,
                        COUNT(*) as total_reviews,
                        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
                    FROM reviews r
                    WHERE r.apartment_id = ?
                    `,
                    [apartmentId]
                );

                responseData = {
                    reviews,
                    pagination: {
                        total,
                        limit,
                        offset,
                        hasMore: offset + limit < total,
                        currentPage: Math.floor(offset / limit) + 1,
                        totalPages: Math.ceil(total / limit)
                    },
                    stats: {
                        average_rating: parseFloat(stats[0]?.average_rating || 0),
                        total_reviews: stats[0]?.total_reviews || 0,
                        distribution: {
                            5: stats[0]?.five_star || 0,
                            4: stats[0]?.four_star || 0,
                            3: stats[0]?.three_star || 0,
                            2: stats[0]?.two_star || 0,
                            1: stats[0]?.one_star || 0
                        }
                    }
                };

                // Cache only first page results
                if (offset === 0) {
                    setCachedReviews(apartmentId, responseData);
                }
            }

            // Set cache headers for CDN/browser caching
            const headers = new Headers();
            headers.set('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=60`);
            headers.set('Vary', 'Accept-Encoding');

            return NextResponse.json({
                success: true,
                mode: "apartment_reviews",
                ...responseData
            }, { headers });
        }

        /* ───────────────────────────
           GET REVIEWS FOR LOGGED-IN USER (with pagination)
        ─────────────────────────── */
        if (userIdFromToken) {
            // Get total count for user
            const userCountResult = await query(
                `
                SELECT COUNT(*) as total
                FROM reviews r
                WHERE r.user_id = ? AND r.is_deleted = 0
                `,
                [userIdFromToken]
            );

            const userTotal = userCountResult[0]?.total || 0;

            // Get paginated user reviews
            const reviews = await query(
                `
                SELECT 
                    r.id,
                    r.rating,
                    r.comment,
                    r.created_at,
                    a.title AS apartment_name,
                    a.id AS apartment_id,
                    DATE_FORMAT(r.created_at, '%b %d, %Y') AS formatted_date,
                    
                FROM reviews r
                INNER JOIN apartments a ON r.apartment_id = a.id
                WHERE r.user_id = ? AND r.is_deleted = 0
                ORDER BY r.created_at DESC
                LIMIT ${limit} OFFSET ${offset}
                `,
                [userIdFromToken]
            );

            return NextResponse.json({
                success: true,
                mode: "user_reviews",
                reviews,
                pagination: {
                    total: userTotal,
                    limit,
                    offset,
                    hasMore: offset + limit < userTotal,
                    currentPage: Math.floor(offset / limit) + 1,
                    totalPages: Math.ceil(userTotal / limit)
                }
            });
        }

        // If no parameters provided, return helpful error
        return NextResponse.json(
            {
                success: false,
                error: "Please provide an apartmentId or authenticate to view your reviews"
            },
            { status: 400 }
        );

    } catch (err) {
        console.error("GET reviews error:", {
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
            timestamp: new Date().toISOString()
        });

        return NextResponse.json(
            {
                success: false,
                error: "Unable to fetch reviews. Please try again later."
            },
            { status: 500 }
        );
    }
}

/* ─────────────────────────────── POST (Submit review) ─────────────────────────────── */
export async function POST(req) {
    try {
        // Extract token from cookies
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const cookies = parseCookies(cookieHeader);
        const token = cookies?.token;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        // ✅ Verify JWT
        let decoded;
        try {
            const { valid, decoded: userData, error } = verifyToken(token);
            if (!valid) {
                return NextResponse.json(
                    { success: false, error: error || "Invalid token" },
                    { status: 401 }
                );
            }
            decoded = userData;
        } catch (verifyError) {
            console.error("Token verification error:", verifyError);
            return NextResponse.json(
                { success: false, error: "Authentication failed" },
                { status: 401 }
            );
        }

        // Parse and validate request body
        const body = await req.json();
        const { apartment_id, rating, comment } = body;

        // Validate input
        const validation = validateReviewInput(rating, comment);
        if (!validation.valid) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        // Check if apartment exists
        const apartmentExists = await query(
            `SELECT id FROM apartments WHERE id = ? AND is_deleted = 0`,
            [apartment_id]
        );

        if (!apartmentExists || apartmentExists.length === 0) {
            return NextResponse.json(
                { success: false, error: "Apartment not found" },
                { status: 404 }
            );
        }

        // Check for duplicate review (only if not already deleted)
        const existingReview = await query(
            `SELECT id, status FROM reviews WHERE user_id = ? AND apartment_id = ? AND is_deleted = 0`,
            [decoded.id, apartment_id]
        );

        if (existingReview.length > 0) {
            const reviewStatus = existingReview[0].status;
            let errorMessage = "You have already submitted a review for this apartment.";

            if (reviewStatus === 'pending') {
                errorMessage = "You have already submitted a review that is pending approval.";
            } else if (reviewStatus === 'approved') {
                errorMessage = "You have already reviewed this apartment.";
            }

            return NextResponse.json(
                { success: false, error: errorMessage },
                { status: 409 }
            );
        }

        // Insert review
        const insertRes = await query(
            `
            INSERT INTO reviews (user_id, apartment_id, rating, comment, status, created_at)
            VALUES (?, ?, ?, ?, 'pending', NOW())
            `,
            [decoded.id, apartment_id, validation.rating, comment.trim()]
        );

        // Clear cache for this apartment
        if (reviewCache.has(apartment_id)) {
            reviewCache.delete(apartment_id);
        }

        // Create notification (non-blocking)
        try {
            await createNotification({
                type: 'review',
                title: 'New Review Submitted',
                content: `User ${decoded.id} submitted a ${validation.rating}-star review for apartment ${apartment_id}`,
                userId: decoded.id,
                meta: {
                    apartment_id,
                    rating: validation.rating,
                    review_id: insertRes.insertId,
                    status: 'pending'
                },
                level: 'info'
            });
        } catch (notifyError) {
            // Don't fail the request if notification fails
            console.warn("Failed to create notification:", notifyError);
        }

        return NextResponse.json(
            {
                success: true,
                message: "Review submitted successfully and pending approval",
                reviewId: insertRes.insertId,
                status: 'pending'
            },
            { status: 201 }
        );

    } catch (err) {
        console.error("POST review error:", {
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
            timestamp: new Date().toISOString()
        });

        return NextResponse.json(
            {
                success: false,
                error: "Unable to submit review. Please try again later."
            },
            { status: 500 }
        );
    }
}