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

        const { type } = await req.json();

        if (!type) {
            return NextResponse.json(
                { error: "Notification type required" },
                { status: 400 }
            );
        }

        const connection = await pool.getConnection();

        await connection.query(
            `
            INSERT INTO admin_notification_reads (notification_id, admin_id)
            SELECT n.id, ?
            FROM admin_notifications n
            LEFT JOIN admin_notification_reads r
                ON n.id = r.notification_id AND r.admin_id = ?
            WHERE n.type = ?
            AND r.notification_id IS NULL
            `,
            [admin_id, admin_id, type]
        );

        connection.release();

        return NextResponse.json({
            success: true,
            message: `All ${type} notifications marked as read`
        });

    } catch (err) {
        console.error("❌ Mark Read By Type Error:", err);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}