// /api/documents/link-to-booking/route.js
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(req) {
    try {
        // Authentication
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("token")?.value;

        if (!sessionToken) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const tokenResult = verifyToken(sessionToken);
        if (!tokenResult.valid) {
            return NextResponse.json(
                { error: "Invalid or expired session" },
                { status: 401 }
            );
        }

        const { temp_reference, real_booking_id, document_id, user_id } = await req.json();

        if (!temp_reference || !real_booking_id || !document_id || !user_id) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Update the document with the real booking ID
        const [result] = await db.execute(
            `UPDATE user_documents 
             SET booking_id = ? 
             WHERE id = ? AND user_id = ? AND (booking_id = ? OR booking_id IS NULL)`,
            [real_booking_id, document_id, user_id, temp_reference]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({
                success: false,
                message: "Document not found or already linked"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Document linked to booking successfully"
        });

    } catch (error) {
        console.error("Error linking document to booking:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}