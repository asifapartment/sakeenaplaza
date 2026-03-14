import pool from './db';

export async function createTempBooking(bookingData, document_reference, userIdFromToken) {
    const connection = await pool.getConnection();

    try {
        await connection.query('START TRANSACTION');

        // === 1. CHECK APARTMENT EXISTS ===
        const [apartmentResult] = await connection.execute(
            `SELECT id, price_per_night, max_guests FROM apartments WHERE id = ?`,
            [bookingData.apartment_id]
        );

        if (apartmentResult.length === 0) {
            await connection.query('ROLLBACK');
            return {
                success: false,
                error: 'Apartment not found',
                code: 'APARTMENT_NOT_FOUND',
                statusCode: 404
            };
        }

        const apartment = apartmentResult[0];

        // === 2. VALIDATE GUEST COUNT ===
        if (bookingData.guests > apartment.max_guests) {
            await connection.query('ROLLBACK');
            return {
                success: false,
                error: `Maximum ${apartment.max_guests} guests allowed for this apartment`,
                code: 'EXCEEDS_MAX_GUESTS',
                statusCode: 400
            };
        }

        // 🔎 STEP 2: Conflict check
        const [{ hasConflict }] = await connection.execute(
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
            [bookingData.apartment_id, bookingData.check_out, bookingData.check_in]
        );

        if (Number(hasConflict) === 1) {
            return NextResponse.json(
                { success: false, message: 'Apartment not available for selected dates' },
                { status: 409 }
            );
        }

        // === 4. CALCULATE EXPIRATION TIME ===
        const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 hours

        // === 5. INSERT TEMP BOOKING (WITH GUEST DETAILS JSON) ===
        const [insertResult] = await connection.execute(
            `INSERT INTO bookings (
                user_id,
                apartment_id,
                start_date,
                end_date,
                guests,
                total_amount,
                nights,
                status,
                expires_at,
                guest_details
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userIdFromToken,
                bookingData.apartment_id,
                bookingData.check_in,
                bookingData.check_out,
                bookingData.guests,
                bookingData.total_amount,
                bookingData.nights,
                'pending',
                expiresAt,
                JSON.stringify(bookingData.guest_details)  // <-- 🔥 Save guest details JSON
            ]
        );

        if (document_reference) {
            await connection.execute(
                `UPDATE user_documents 
                 SET booking_id = ? 
                 WHERE booking_id = ? AND user_id = ?`,
                [insertResult.insertId, document_reference, userIdFromToken]
            );
        }

        await connection.query('COMMIT');

        return {
            success: true,
            bookingId: insertResult.insertId,
            expiresAt
        };

    } catch (error) {
        await connection.query('ROLLBACK');
        console.error({
            context: 'createTempBooking',
            message: error.message,
            stack: error.stack
        });

        return {
            success: false,
            error: error.message || 'Database operation failed',
            code: 'DATABASE_ERROR',
            statusCode: 500
        };
    } finally {
        connection.release();
    }
}
