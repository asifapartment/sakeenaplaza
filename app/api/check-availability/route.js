// app/api/calendar-booked-dates/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';

export async function POST(req) {
    try {
        const { apartment_id } = await req.json();

        if (!apartment_id) {
            return NextResponse.json(
                { error: 'Apartment ID is required' },
                { status: 400 }
            );
        }

        // Get all bookings (confirmed, ongoing, and pending that haven't expired)
        const bookings = await query(`
            SELECT 
                start_date,
                end_date,
                status
            FROM bookings
            WHERE apartment_id = ?
            AND (
                status IN ('confirmed', 'ongoing')
                OR (status = 'pending' AND expires_at > NOW())
            )
            AND end_date > CURDATE()
            ORDER BY start_date ASC
        `, [apartment_id]);

        // Convert to Date objects and create date ranges
        const disabledRanges = bookings.map(booking => {
            const from = new Date(booking.start_date);
            const to = new Date(booking.end_date);

            // Important: checkout day is NOT occupied
            to.setDate(to.getDate() - 1);

            // For single day bookings
            if (to < from) {
                return { from, to: from };
            }

            return { from, to };
        }).filter(Boolean); // Remove any null entries

        // Also create individual booked dates for highlighting
        const bookedDates = [];
        bookings.forEach(booking => {
            const start = new Date(booking.start_date);
            const end = new Date(booking.end_date);
            const current = new Date(start);

            // Add all dates in the booking range (except checkout day)
            while (current < end) {
                bookedDates.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
        });

        // Remove duplicate dates
        const uniqueBookedDates = [...new Set(bookedDates.map(d =>
            d.toISOString().split('T')[0]
        ))].map(dateStr => new Date(dateStr));

        return NextResponse.json({
            success: true,
            data: {
                // Array of individual booked dates for highlighting
                bookedDates: uniqueBookedDates,

                // Array of ranges for DayPicker disabled prop
                disabledRanges: disabledRanges,

                // Simple stats
                stats: {
                    totalBookings: bookings.length,
                    bookedDays: uniqueBookedDates.length,
                    dateRange: {
                        from: bookings[0]?.start_date || 'No bookings',
                        to: bookings[bookings.length - 1]?.end_date || 'No bookings'
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error fetching booked dates:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch booked dates',
                message: error.message
            },
            { status: 500 }
        );
    }
}