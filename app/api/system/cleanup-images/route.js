import db from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function GET(req) {

    const authHeader = req.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {

        const [rows] = await db.execute(`
            SELECT id, cloudinary_public_id
            FROM pending_image_deletions
            WHERE status='pending'
            AND scheduled_delete_at <= NOW()
            LIMIT 100
        `);

        for (const img of rows) {

            try {

                await cloudinary.uploader.destroy(img.cloudinary_public_id);

                await db.execute(`
                    UPDATE pending_image_deletions
                    SET status='deleted', deleted_at=NOW()
                    WHERE id=?
                `, [img.id]);

            } catch (err) {

                await db.execute(`
                    UPDATE pending_image_deletions
                    SET status='failed'
                    WHERE id=?
                `, [img.id]);

            }

        }

        return NextResponse.json({ success: true });

    } catch (error) {

        return NextResponse.json(
            { error: "Cleanup failed" },
            { status: 500 }
        );

    }

}