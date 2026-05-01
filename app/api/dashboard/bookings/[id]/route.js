import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get('token')?.value;

        if (!sessionToken) {
            return NextResponse.json(
                { error: 'Authentication required', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const tokenResult = verifyToken(sessionToken);
        if (!tokenResult.valid) {
            return NextResponse.json(
                { error: 'Invalid or expired session', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const userId = tokenResult.decoded.id;
        const connection = await pool.getConnection();

        // First, get the booking data
        const [booking] = await connection.execute(`
            SELECT 
                b.*,
                a.title as apartment_title,
                a.location as apartment_location,
                a.price_per_night,
                a.description as apartment_description,
                a.max_guests,
                u.name as guest_name,
                u.email as guest_email,
                u.phone_number as guest_phone,
                p.amount as payment_amount,
                p.status as payment_status,
                p.method as payment_method,
                p.paid_at as payment_paid_at,
                p.razorpay_payment_id
            FROM bookings b
            JOIN apartments a ON b.apartment_id = a.id
            JOIN users u ON b.user_id = u.id
            LEFT JOIN payments p ON p.booking_id = b.id
            WHERE b.id = ? AND b.user_id = ?
        `, [id, userId]);

        if (booking.length === 0) {
            connection.release();
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        // Then, get document verification data separately to avoid collation issues
        const [documents] = await connection.execute(`
            SELECT 
                status,
                review_message,
                document_type,
                created_at as document_uploaded_at
            FROM user_documents 
            WHERE booking_id = ? AND user_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        `, [String(id), userId]);

        connection.release();

        const bookingData = booking[0];

        // Add document data if exists
        if (documents.length > 0) {
            bookingData.document_status = documents[0].status;
            bookingData.review_message = documents[0].review_message;
            bookingData.document_type = documents[0].document_type;
            bookingData.document_uploaded_at = documents[0].document_uploaded_at;
        } else {
            bookingData.document_status = null;
            bookingData.review_message = null;
            bookingData.document_type = null;
            bookingData.document_uploaded_at = null;
        }

        // Parse guest_details if exists
        if (bookingData.guest_details) {
            try {
                bookingData.guest_details = typeof bookingData.guest_details === 'string'
                    ? JSON.parse(bookingData.guest_details)
                    : bookingData.guest_details;
            } catch (e) {
                bookingData.guest_details = [];
            }
        } else {
            bookingData.guest_details = [];
        }

        return NextResponse.json(bookingData);
    } catch (error) {
        console.error('Error fetching booking:', error);
        return NextResponse.json(
            { error: 'Failed to fetch booking details' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { start_date, end_date, guests } = body;
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get('token')?.value;

        if (!sessionToken) {
            return NextResponse.json(
                { error: 'Authentication required', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const tokenResult = verifyToken(sessionToken);
        if (!tokenResult.valid) {
            return NextResponse.json(
                { error: 'Invalid or expired session', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const userId = tokenResult.decoded.id;
        const connection = await pool.getConnection();

        try {
            const [existing] = await connection.execute(
                `SELECT id, apartment_id, start_date as current_start, end_date as current_end 
                 FROM bookings WHERE id = ? AND user_id = ?`,
                [id, userId]
            );

            if (existing.length === 0) {
                return NextResponse.json(
                    { error: 'Booking not found' },
                    { status: 404 }
                );
            }

            const booking = existing[0];
            const apartmentId = booking.apartment_id;

            let updateFields = [];
            let updateValues = [];

            if (start_date) {
                updateFields.push('start_date = ?');
                updateValues.push(start_date);
            }
            if (end_date) {
                updateFields.push('end_date = ?');
                updateValues.push(end_date);
            }
            if (guests) {
                updateFields.push('guests = ?');
                updateValues.push(guests);
            }

            if (start_date || end_date) {
                const finalStartDate = start_date || booking.current_start;
                const finalEndDate = end_date || booking.current_end;

                if (new Date(finalStartDate) >= new Date(finalEndDate)) {
                    return NextResponse.json(
                        { error: 'End date must be after start date' },
                        { status: 400 }
                    );
                }

                const [conflicts] = await connection.execute(
                    `SELECT id, start_date, end_date 
                     FROM bookings 
                     WHERE apartment_id = ? 
                     AND id != ? 
                     AND status IN ('confirmed', 'pending')
                     AND (
                         (start_date BETWEEN ? AND DATE_SUB(?, INTERVAL 1 DAY)) OR
                         (end_date BETWEEN DATE_ADD(?, INTERVAL 1 DAY) AND ?) OR
                         (? BETWEEN start_date AND DATE_SUB(end_date, INTERVAL 1 DAY)) OR
                         (? BETWEEN DATE_ADD(start_date, INTERVAL 1 DAY) AND end_date)
                     )`,
                    [
                        apartmentId,
                        id,
                        finalStartDate, finalEndDate,
                        finalStartDate, finalEndDate,
                        finalStartDate,
                        finalEndDate
                    ]
                );

                if (conflicts.length > 0) {
                    return NextResponse.json(
                        {
                            error: 'Date conflict: The selected dates are already booked',
                            code: 'DATE_CONFLICT',
                            conflictingDates: {
                                requested: { start: finalStartDate, end: finalEndDate },
                                conflicts: conflicts.map(c => ({
                                    id: c.id,
                                    start: c.start_date,
                                    end: c.end_date
                                }))
                            }
                        },
                        { status: 409 }
                    );
                }
            }

            if (guests) {
                const [apartment] = await connection.execute(
                    'SELECT max_guests FROM apartments WHERE id = ?',
                    [apartmentId]
                );
                if (apartment.length > 0 && guests > apartment[0].max_guests) {
                    return NextResponse.json(
                        { error: `Number of guests exceeds maximum capacity of ${apartment[0].max_guests}` },
                        { status: 400 }
                    );
                }
            }

            if (updateFields.length > 0) {
                updateValues.push(id, userId);
                await connection.execute(
                    `UPDATE bookings SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
                    updateValues
                );
                await connection.execute(
                    'INSERT INTO user_activity (user_id, message) VALUES (?, ?)',
                    [userId, `Updated booking #${id}`]
                );
            }

            return NextResponse.json({ success: true, message: 'Booking updated successfully' });

        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error updating booking:', error);
        return NextResponse.json(
            { error: 'Failed to update booking' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get('token')?.value;

        if (!sessionToken) {
            return NextResponse.json(
                { error: 'Authentication required', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const tokenResult = verifyToken(sessionToken);
        if (!tokenResult.valid) {
            return NextResponse.json(
                { error: 'Invalid or expired session', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const userId = tokenResult.decoded.id;
        const connection = await pool.getConnection();

        const [booking] = await connection.execute(
            'SELECT id, status FROM bookings WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (booking.length === 0) {
            connection.release();
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        if (booking[0].status !== 'cancelled' && booking[0].status !== 'expired') {
            connection.release();
            return NextResponse.json(
                { error: 'Only cancelled or expired bookings can be deleted' },
                { status: 400 }
            );
        }

        await connection.execute(
            'DELETE FROM bookings WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        await connection.execute(
            'INSERT INTO user_activity (user_id, message) VALUES (?, ?)',
            [userId, `Deleted booking #${id}`]
        );

        connection.release();

        return NextResponse.json({
            success: true,
            message: 'Booking deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting booking:', error);
        return NextResponse.json(
            { error: 'Failed to delete booking' },
            { status: 500 }
        );
    }
}