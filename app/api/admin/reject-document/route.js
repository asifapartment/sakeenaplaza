// app/api/admin/reject-document/route.js

import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { parseCookies } from '@/lib/cookies';
import pool from '@/lib/db';

export async function POST(request) {
    try {
        const cookies = parseCookies(request.headers.get("cookie"));
        const token = cookies.token;

        const { valid, decoded, error } = await verifyAdmin(token);
        if (!valid) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const {
            user_id,
            booking_id,
            document_type,
            status = "rejected",
            review_message = "",
            verification_notes = ""
        } = await request.json();

        if (!user_id || !booking_id || !document_type) {
            return NextResponse.json(
                { success: false, message: "user_id, booking_id, document_type required" },
                { status: 400 }
            );
        }

        const validDocumentTypes = ['aadhaar', 'pan', 'driving_license', 'passport', 'voter_id'];
        if (!validDocumentTypes.includes(document_type)) {
            return NextResponse.json({ success: false, message: "Invalid document type" }, { status: 400 });
        }

        const reviewer_id = decoded.id;
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 🔹 Load existing document safely
            const [rows] = await connection.query(
                `SELECT id, document_data FROM user_documents
         WHERE user_id = ? AND booking_id = ?`,
                [user_id, booking_id]
            );

            if (!rows.length) {
                return NextResponse.json(
                    { success: false, message: "Document not found" },
                    { status: 404 }
                );
            }

            const documentId = rows[0].id;

            const existingData =
                typeof rows[0].document_data === "string"
                    ? JSON.parse(rows[0].document_data)
                    : rows[0].document_data;

            // 🛡 Safety guard (prevents corruption forever)
            if (
                JSON.stringify(existingData).includes("cloudinary") &&
                !JSON.stringify(existingData).includes("public_id")
            ) {
                throw new Error("Corrupted document data — public_id missing");
            }

            // 🔹 Only annotate — never replace
            const mergedData = {
                ...existingData,
                review: {
                    status: "rejected",
                    reviewer_id,
                    review_message,
                    verification_notes,
                    reviewed_at: new Date().toISOString()
                }
            };

            await connection.execute(
                `UPDATE user_documents
         SET document_type = ?,
             document_data = ?,
             status = 'rejected',
             reviewer_id = ?,
             review_message = ?,
             verification_notes = ?,
             updated_at = NOW()
         WHERE id = ?`,
                [
                    document_type,
                    JSON.stringify(mergedData),
                    reviewer_id,
                    review_message,
                    verification_notes,
                    documentId
                ]
            );

            // 🔹 Audit log
            await connection.query(
                `INSERT INTO admin_activity_logs
         (admin_id, action_type, target_type, target_id, description, metadata)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    reviewer_id,
                    'document_rejected',
                    'booking',
                    booking_id,
                    'Document rejected',
                    JSON.stringify({
                        document_type,
                        document_id: documentId,
                        verification_notes
                    })
                ]
            );

            await connection.commit();

            return NextResponse.json({
                success: true,
                message: "Document rejected successfully",
                document_id: documentId
            });

        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("Reject document error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Reject failed",
                error: error.message
            },
            { status: 500 }
        );
    }
}
