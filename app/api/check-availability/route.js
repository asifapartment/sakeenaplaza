import { query } from "@/lib/mysql-wrapper";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { apartment_id } = await req.json();

        if (!apartment_id) {
            return NextResponse.json(
                { error: "Apartment ID required" },
                { status: 400 }
            );
        }

        const bookings = await query(`
            SELECT start_date, end_date
            FROM bookings
            WHERE apartment_id = ?
            AND status IN ('confirmed','ongoing','pending')
            AND end_date >= CURDATE()
            ORDER BY start_date ASC
        `, [apartment_id]);

        const blockedSet = new Set();

        const checkins = new Set();
        const checkouts = new Set();

        // helper: local YYYY-MM-DD (no UTC shift)
        const localDate = d => d.toLocaleDateString("en-CA");

        for (const b of bookings) {

            const start = new Date(b.start_date);
            const end = new Date(b.end_date);

            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);

            const startStr = localDate(start);
            const endStr = localDate(end);

            checkins.add(startStr);
            checkouts.add(endStr);

            let night = new Date(start);

            // block occupied nights (hotel style)
            while (night < end) {
                blockedSet.add(localDate(night));
                night.setDate(night.getDate() + 1);
            }
        }

        // block touching boundaries (no same-day turnover)
        for (const d of checkins) {
            if (checkouts.has(d)) {
                blockedSet.add(d);
            }
        }

        const blockedDates = [...blockedSet].sort();

        return NextResponse.json({
            success: true,
            data: {
                blockedDates,
                totalBlocked: blockedDates.length,
                range: {
                    from: blockedDates[0] || null,
                    to: blockedDates[blockedDates.length - 1] || null
                }
            }
        });

    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { success: false, error: "Calendar fetch failed" },
            { status: 500 }
        );
    }
}
