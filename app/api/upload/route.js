import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { verifyToken } from "@/lib/jwt";
import db from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req) {
    try {
        // === AUTHENTICATION ===
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("token")?.value;

        if (!sessionToken) {
            return NextResponse.json(
                { error: "Authentication required", code: "UNAUTHORIZED" },
                { status: 401 }
            );
        }

        const tokenResult = verifyToken(sessionToken);
        if (!tokenResult.valid) {
            return NextResponse.json(
                { error: "Invalid or expired session", code: "UNAUTHORIZED" },
                { status: 401 }
            );
        }

        const userId = tokenResult.decoded.id;

        // === PARSE FORM DATA ===
        const data = await req.formData();
        const files = data.getAll("files[]");
        const documentType = data.get("document_type");
        const sides = data.getAll("sides[]");
        const bookingId = data.get("booking_id"); // Optional booking ID

        if (!files.length || !documentType || !sides.length) {
            return NextResponse.json(
                { error: "files, document_type, and sides are required" },
                { status: 400 }
            );
        }

        if (files.length !== sides.length) {
            return NextResponse.json(
                { error: "Number of files must match number of sides" },
                { status: 400 }
            );
        }

        // === DOCUMENT TYPE MAP ===
        const documentTypeMap = {
            "Aadhaar Card": "aadhaar",
            "PAN Card": "pan",
            "Driving License": "driving_license",
            "Passport": "passport",
            "Voter ID": "voter_id"
        };

        const dbDocumentType = documentTypeMap[documentType];
        if (!dbDocumentType) {
            return NextResponse.json(
                { error: "Invalid document type" },
                { status: 400 }
            );
        }

        // === CHECK FOR EXISTING DOCUMENT ===
        let existingDocument = null;
        let oldPublicIds = [];

        // Build query based on whether bookingId is provided
        let existingQuery = `SELECT id, document_data FROM user_documents 
                             WHERE user_id = ? AND document_type = ?`;
        const queryParams = [userId, dbDocumentType];

        if (bookingId) {
            existingQuery += ` AND booking_id = ?`;
            queryParams.push(bookingId);
        } else {
            existingQuery += ` AND booking_id IS NULL`;
        }

        // Execute query
        const [existingRows] = await db.execute(existingQuery, queryParams);

        if (existingRows.length > 0) {
            existingDocument = existingRows[0];

            // Extract old public_ids for cleanup
            if (existingDocument.document_data) {
                const oldData =
                    typeof existingDocument.document_data === "string"
                        ? JSON.parse(existingDocument.document_data)
                        : existingDocument.document_data;

                // Extract public_ids from all sides
                Object.values(oldData).forEach(doc => {
                    if (doc?.public_id) {
                        oldPublicIds.push(doc.public_id);
                    }
                });
                
            }
        }

        // === DELETE OLD IMAGES FROM CLOUDINARY ===
        if (oldPublicIds.length) {
            await cloudinary.api.delete_resources(oldPublicIds, {
                resource_type: "image",
                type: "upload",
                invalidate: true
            });
        }

        // === UPLOAD NEW FILES ===
        const uploadPromises = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const side = sides[i];

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/jpg",
                "application/pdf"
            ];

            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json(
                    { error: `Invalid file type for ${side}` },
                    { status: 400 }
                );
            }

            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json(
                    { error: `File too large for ${side} (5MB max)` },
                    { status: 400 }
                );
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            const uniqueIdentifier = `${userId}_${dbDocumentType}_${side}_${Date.now()}`;

            uploadPromises.push(
                new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: `secure_uploads/${userId}/${dbDocumentType}`,
                            public_id: uniqueIdentifier,
                            type: "authenticated",
                            access_mode: "authenticated",
                            resource_type: "auto",
                            tags: [dbDocumentType, side]
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve({ result, file, side });
                        }
                    );
                    stream.end(buffer);
                })
            );
        }

        const uploadResults = await Promise.all(uploadPromises);

        // === PREPARE DB JSON ===
        const documentsJson = {};

        uploadResults.forEach(({ result, file, side }) => {
            // Store the full public_id path as shown in your example data
            const publicId = result.public_id; // This should already be the full path

            const authenticatedUrl = cloudinary.url(result.public_id, {
                secure: true,
                sign_url: true,
                type: "authenticated" // Use authenticated for generating URLs
            });

            documentsJson[side] = {
                public_id: publicId, // Store the full public_id
                url: authenticatedUrl,
                file_name: file.name,
                file_type: file.type,
                size: file.size,
                uploaded_at: new Date().toISOString()
            };
        });

        // === SAVE/UPDATE METADATA ===
        if (existingDocument) {
            // Update existing document
            await db.execute(
                `UPDATE user_documents 
                 SET document_data = ?, status = 'pending', updated_at = NOW()
                 WHERE id = ? AND user_id = ?`,
                [JSON.stringify(documentsJson), existingDocument.id, userId]
            );
        } else {
            // Insert new document
            await db.execute(
                `INSERT INTO user_documents (user_id, document_type, document_data, status)
                 VALUES (?, ?, ?, 'pending')`,
                [userId, dbDocumentType, JSON.stringify(documentsJson)]
            );
        }

        return NextResponse.json({
            success: true,
            message: existingDocument ? "Documents updated successfully" : "Documents uploaded successfully",
            booking_id: bookingId || null,
            document_type: documentType,
            data: documentsJson,
            old_files_deleted: oldPublicIds.length,
            old_public_ids: oldPublicIds // For debugging
        });

    } catch (err) {
        console.error("Upload error:", err);
        console.error("Error stack:", err.stack);

        return NextResponse.json(
            {
                error: err.message || "Upload failed",
                details: process.env.NODE_ENV === 'development' ? err.stack : undefined
            },
            { status: 500 }
        );
    }
}