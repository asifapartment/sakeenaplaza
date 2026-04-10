import { NextResponse } from "next/server";
import { query } from "@/lib/mysql-wrapper";
import { verifyToken } from "@/lib/jwt";
import { parseCookies } from "@/lib/cookies";

export async function PATCH(req) {
    try {
        const { booking_id } = await req.json();
        const cookieHeader = req.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { valid, decoded, error } = verifyToken(token);
        if (!valid) {
            return NextResponse.json({ success: false, error: error || "Invalid token" }, { status: 401 });
        }

        if (!booking_id) {
            return NextResponse.json(
                { success: false, error: "Missing booking_id" },
                { status: 400 }
            );
        }

        // ✅ Get user details including role
        const [user] = await query(
            "SELECT id, role FROM users WHERE id = ?",
            [decoded.id]
        );

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        // ✅ Get booking details with user_id check
        const [booking] = await query(
            "SELECT * FROM bookings WHERE id = ?",
            [booking_id]
        );

        if (!booking) {
            return NextResponse.json(
                { success: false, error: "Booking not found" },
                { status: 404 }
            );
        }

        // ✅ Check if user is admin or booking owner
        const isAdmin = user.role === 'admin';
        const isOwner = booking.user_id === decoded.id;

        if (!isAdmin && !isOwner) {
            return NextResponse.json(
                { success: false, error: "Unauthorized to cancel this booking" },
                { status: 403 }
            );
        }

        // ✅ Prevent duplicate cancel
        if (["cancelled", "expired"].includes(booking.status)) {
            return NextResponse.json(
                { success: false, error: `Booking already ${booking.status}` },
                { status: 400 }
            );
        }

        // ✅ Admin can cancel anytime - skip all time restrictions
        if (!isAdmin) {
            const now = new Date();
            const checkInDate = new Date(booking.start_date);
            const bookingDate = new Date(booking.created_at || booking.booking_date); // Adjust field name as needed
            const timeUntilCheckIn = checkInDate.getTime() - now.getTime();
            const hoursUntilCheckIn = timeUntilCheckIn / (1000 * 60 * 60);

            // ✅ Check if check-in date has passed
            if (checkInDate <= now) {
                return NextResponse.json(
                    { success: false, error: "Cannot cancel after check-in date" },
                    { status: 400 }
                );
            }

            // ✅ Logic for bookings made 1 day before check-in (within 24 hours)
            const hoursBetweenBookingAndCheckIn = (checkInDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60);
            const isBookedOneDayBefore = hoursBetweenBookingAndCheckIn <= 24;

            if (isBookedOneDayBefore) {
                // Only 6 hours cancellation window for last-minute bookings
                const hoursSinceBooking = (now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60);

                if (hoursSinceBooking > 6) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: "Cancellation period expired. For bookings made within 24 hours of check-in, you only have 6 hours to cancel."
                        },
                        { status: 400 }
                    );
                }
            } else {
                // Standard 48 hours cancellation policy
                if (hoursUntilCheckIn < 48) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: "Cancellation period expired. You can only cancel bookings at least 48 hours before check-in time."
                        },
                        { status: 400 }
                    );
                }
            }
        }

        // ✅ Cancel booking
        await query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [booking_id]);

        return NextResponse.json({
            success: true,
            message: `Booking #${booking_id} cancelled successfully`,
            updatedStatus: "cancelled"
        });

    } catch (err) {
        console.error("❌ Cancel Booking API Error:", err);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}