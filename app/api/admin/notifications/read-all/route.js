import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAdmin } from "@/lib/adminAuth";

export async function PUT(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        const auth = await verifyAdmin(token);
        if (!auth.valid) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        const admin_id = auth.decoded.id;

        if (!admin_id) {
            return NextResponse.json(
                { error: "Missing admin id" },
                { status: 400 }
            );
        }

        const [result] = await pool.query(
            `
            INSERT INTO admin_notification_reads (notification_id, admin_id)
            SELECT id, ?
            FROM admin_notifications
            ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP
            `,
            [admin_id]
        );

        return NextResponse.json({
            success: true,
            message: "All notifications marked as read",
            affectedRows: result.affectedRows
        });

    } catch (err) {
        console.error("❌ Mark All Read Error:", err);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}