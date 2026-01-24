import { verifyToken } from "@/lib/jwt";
import { query } from "@/lib/mysql-wrapper";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const { valid, decoded, error } = verifyToken(token);
        if (!valid) {
            return NextResponse.json(
                { success: false, message: 'Invalid token: ' + error },
                { status: 401 }
            );
        }

        // 🔥 STEP 1: Expire stale bookings
        await query(
            `
            UPDATE bookings
            SET status = 'expired',
                expired_at = NOW()
            WHERE status IN ('pending', 'confirmed', 'ongoing')
              AND expires_at IS NOT NULL
              AND expires_at <= NOW();
            `
        );

        const body = await request.json();
        const { checkin, checkout, apartment_id } = body;

        if (!checkin || !checkout) {
            return NextResponse.json(
                { error: "Check-in and Check-out dates are required" },
                { status: 400 }
            );
        }

        if (!apartment_id) {
            return NextResponse.json(
                { error: "Apartment ID is required" },
                { status: 400 }
            );
        }

        // 🔎 STEP 2: Conflict check
        const [{ hasConflict }] = await query(
            `
            SELECT EXISTS (
                SELECT 1
                FROM bookings
                WHERE apartment_id = ?
                  AND status IN ('confirmed', 'ongoing', 'pending')
                  AND start_date < ?
                  AND end_date > ?
            ) AS hasConflict
            `,
            [apartment_id, checkout, checkin]
        );

        if (Number(hasConflict) === 1) {
            return NextResponse.json(
                { success: false, message: 'Apartment not available for selected dates' },
                { status: 409 }
            );
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error('Booking availability error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
