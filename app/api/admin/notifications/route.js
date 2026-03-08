import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        const auth = await verifyAdmin(token);
        if (!auth.valid) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        const admin_id = auth.decoded.id;

        const { searchParams } = new URL(req.url);

        const booking_id = searchParams.get("booking_id");
        const user_id = searchParams.get("user_id");
        const type = searchParams.get("type");
        const unread = searchParams.get("unread");
        const start_date = searchParams.get("start_date");
        const end_date = searchParams.get("end_date");

        if (!admin_id) {
            return NextResponse.json(
                { success: false, error: "admin_id required" },
                { status: 400 }
            );
        }

        let query = `
        SELECT 
            n.*,
            CAST(IF(r.notification_id IS NULL, 0, 1) AS UNSIGNED) AS is_read
        FROM admin_notifications n
        LEFT JOIN admin_notification_reads r
            ON n.id = r.notification_id
            AND r.admin_id = ?
        WHERE 1=1
        `;

        let params = [admin_id];

        // FILTER: Booking ID
        if (booking_id) {
            query += ` AND n.booking_id = ?`;
            params.push(booking_id);
        }

        // FILTER: User ID
        if (user_id) {
            query += ` AND n.user_id = ?`;
            params.push(user_id);
        }

        // FILTER: Notification Type
        if (type) {
            query += ` AND n.type = ?`;
            params.push(type);
        }

        // FILTER: Unread Only
        if (unread === "true") {
            query += ` AND r.notification_id IS NULL`;
        }

        // FILTER: Date range
        if (start_date && end_date) {
            query += ` AND n.created_at BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        } else if (start_date) {
            query += ` AND n.created_at >= ?`;
            params.push(start_date);
        } else if (end_date) {
            query += ` AND n.created_at <= ?`;
            params.push(end_date);
        }

        query += ` ORDER BY n.created_at DESC`;

        const [rows] = await pool.query(query, params);
        const notifications = rows.map(n => ({
            ...n,
            is_read: Number(n.is_read)
        }));
        return NextResponse.json({ success: true, notifications });

    } catch (error) {
        console.error("❌ Filter Notification Error:", error);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}