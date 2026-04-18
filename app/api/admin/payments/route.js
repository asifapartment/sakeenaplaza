import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';
import { verifyAdmin } from '@/lib/adminAuth';
import { parseCookies } from '@/lib/cookies';

export async function GET(request, { params }) {
    try {
        const cookies = parseCookies(request.headers.get("cookie"));
        const token = cookies.token;

        const { valid, decoded, error } = await verifyAdmin(token);
        if (!valid) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const userId = params.id;

        const users = await query(`
            SELECT 
                u.*,
                COUNT(DISTINCT b.id) as total_bookings,
                COALESCE(SUM(p.amount), 0) as total_spent
            FROM users u
            LEFT JOIN bookings b ON u.id = b.user_id
            LEFT JOIN payments p ON b.id = p.booking_id AND p.status = 'paid'
            WHERE u.id = ?
            GROUP BY u.id
        `, [userId]);

        if (users.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get user's recent bookings
        const bookings = await query(`
            SELECT 
                b.*,
                a.title as apartment_title,
                a.location as apartment_location,
                a.price_per_night
            FROM bookings b
            LEFT JOIN apartments a ON b.apartment_id = a.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
            LIMIT 10
        `, [userId]);

        // Get user's reviews
        const reviews = await query(`
            SELECT 
                r.*,
                a.title as apartment_title
            FROM reviews r
            LEFT JOIN apartments a ON r.apartment_id = a.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
            LIMIT 10
        `, [userId]);

        return NextResponse.json({
            ...users[0],
            bookings,
            reviews
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user details' },
            { status: 500 }
        );
    }
}