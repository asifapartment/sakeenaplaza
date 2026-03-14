import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { verifyToken } from "@/lib/jwt";
import db from "@/lib/db";
import { cookies } from "next/headers";
import { queueImageDeletion } from "@/lib/ImageDeletion";

// Generate TEMP reference for first booking
function generateDocumentReference() {
    return `TEMP_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// Safe JSON parse
function safeParseJSON(data) {
    try {
        return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
        return {};
    }
}

export async function POST(req) {
    try {

        /* ===============================
           AUTHENTICATION
        =============================== */

        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("token")?.value;

        if (!sessionToken) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const token = verifyToken(sessionToken);

        if (!token.valid) {
            return NextResponse.json(
                { error: "Invalid or expired session" },
                { status: 401 }
            );
        }

        const userId = token.decoded.id;

        /* ===============================
           PARSE FORM DATA
        =============================== */

        const data = await req.formData();

        const files = data.getAll("files[]");
        const sides = data.getAll("sides[]");
        const documentType = data.get("document_type");

        let bookingId = data.get("booking_id")?.toString().trim();

        if (!bookingId) bookingId = null;

        if (!files.length || !documentType || !sides.length) {
            return NextResponse.json(
                { error: "files, sides and document_type are required" },
                { status: 400 }
            );
        }

        if (files.length !== sides.length) {
            return NextResponse.json(
                { error: "Files count must match sides count" },
                { status: 400 }
            );
        }

        /* ===============================
           DOCUMENT TYPE MAP
        =============================== */

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

        /* ===============================
           DETERMINE BOOKING REFERENCE
        =============================== */

        const documentReference = bookingId || generateDocumentReference();

        /* ===============================
           FIND EXISTING DOCUMENT
        =============================== */

        let existingDocument = null;
        let oldImages = [];

        let query = `
            SELECT id, document_data, booking_id 
            FROM user_documents
            WHERE user_id=? AND document_type=?
        `;

        const params = [userId, dbDocumentType];

        if (bookingId) {
            query += ` AND booking_id=?`;
            params.push(bookingId);
        } else {
            query += ` AND (booking_id IS NULL OR booking_id LIKE 'TEMP_%')`;
        }

        query += ` ORDER BY created_at DESC LIMIT 1`;

        const [rows] = await db.execute(query, params);

        if (rows.length) {

            existingDocument = rows[0];

            const parsed = safeParseJSON(existingDocument.document_data);

            Object.values(parsed).forEach(doc => {

                if (doc?.public_id && doc?.url) {

                    oldImages.push({
                        public_id: doc.public_id,
                        url: doc.url
                    });

                }

            });

        }

        /* ===============================
           QUEUE OLD IMAGES FOR DELETION
        =============================== */
        console.log("Old images to delete:", oldImages);
        if (oldImages.length) {

            try {

                await queueImageDeletion(
                    oldImages,
                    "document",
                    existingDocument?.id || null,
                    "reupload"
                );

            } catch (err) {

                console.error("Failed to queue deletion:", err);

            }

        }

        /* ===============================
           VALIDATE & UPLOAD FILES
        =============================== */

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "application/pdf"
        ];

        const uploadPromises = files.map(async (file, i) => {

            const side = sides[i];

            if (!allowedTypes.includes(file.type)) {
                throw new Error(`Invalid file type for ${side}`);
            }

            if (file.size > 5 * 1024 * 1024) {
                throw new Error(`File too large for ${side}`);
            }

            const buffer = Buffer.from(await file.arrayBuffer());

            const publicId = `${userId}_${dbDocumentType}_${side}_${Date.now()}`;

            return new Promise((resolve, reject) => {

                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: `secure_uploads/${userId}/${dbDocumentType}`,
                        public_id: publicId,
                        type: "authenticated",
                        access_mode: "authenticated",
                        resource_type: "auto",
                        tags: [dbDocumentType, side, documentReference]
                    },
                    (err, result) => {
                        if (err) reject(err);
                        else resolve({ result, file, side });
                    }
                );

                stream.end(buffer);

            });

        });

        const uploadResults = await Promise.all(uploadPromises);

        /* ===============================
           BUILD DOCUMENT JSON
        =============================== */

        const documentsJson = {};

        uploadResults.forEach(({ result, file, side }) => {

            const authenticatedUrl = cloudinary.url(result.public_id, {
                secure: true,
                sign_url: true,
                type: "authenticated"
            });

            documentsJson[side] = {
                public_id: result.public_id,
                url: authenticatedUrl,
                file_name: file.name,
                file_type: file.type,
                size: file.size,
                uploaded_at: new Date().toISOString()
            };

        });

        /* ===============================
           FINAL BOOKING ID
        =============================== */

        let bookingIdToStore;

        if (
            existingDocument?.booking_id &&
            !existingDocument.booking_id.toString().startsWith("TEMP_")
        ) {

            bookingIdToStore = existingDocument.booking_id;

        } else {

            bookingIdToStore = documentReference;

        }

        if (!bookingIdToStore) {
            bookingIdToStore = generateDocumentReference();
        }

        /* ===============================
           SAVE / UPDATE DATABASE
        =============================== */

        if (existingDocument) {

            await db.execute(
                `
                UPDATE user_documents
                SET document_data=?,
                    status='pending',
                    updated_at=NOW()
                WHERE id=? AND user_id=?
                `,
                [JSON.stringify(documentsJson), existingDocument.id, userId]
            );

            return NextResponse.json({
                success: true,
                message: "Documents updated",
                document_id: existingDocument.id,
                booking_id: bookingIdToStore,
                is_reupload: true,
                data: documentsJson
            });

        } else {

            const [result] = await db.execute(
                `
                INSERT INTO user_documents
                (user_id, document_type, document_data, status, booking_id)
                VALUES (?, ?, ?, 'pending', ?)
                `,
                [userId, dbDocumentType, JSON.stringify(documentsJson), bookingIdToStore]
            );

            return NextResponse.json({
                success: true,
                message: "Documents uploaded",
                document_id: result.insertId,
                booking_id: bookingIdToStore,
                is_reupload: false,
                data: documentsJson
            });

        }

    } catch (err) {

        console.error("Upload error:", err);

        return NextResponse.json(
            {
                success: false,
                error: err.message || "Upload failed"
            },
            { status: 500 }
        );

    }
}