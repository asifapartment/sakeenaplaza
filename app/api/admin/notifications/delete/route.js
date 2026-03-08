import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(req) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing notification id" }, { status: 400 });
        }

        const [result] = await pool.query(
            `DELETE FROM admin_notifications WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Notification deleted"
        });

    } catch (error) {
        console.error("❌ Notification Delete Error:", error);
        return NextResponse.json(
            { error: "Failed to delete" },
            { status: 500 }
        );
    }
}