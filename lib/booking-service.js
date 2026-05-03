import { emailService } from '@/services/email/Service'; // Import the instance, not the class
import pool from './db';
import { query } from './mysql-wrapper';

// Add this helper function before createTempBooking
async function getApplicableOffer(connection, apartmentId) {
    const [offerResult] = await connection.execute(
        `SELECT id, discount_percentage 
         FROM offers 
         WHERE is_active = 1
             AND DATE(valid_from) <= CURDATE()
             AND DATE(valid_until) >= CURDATE()
             AND (apartment_ids IS NULL 
                  OR apartment_ids = '[]' 
                  OR JSON_CONTAINS(apartment_ids, CAST(? AS JSON)))`,
        [apartmentId]
    );

    if (offerResult.length > 0) {
        // Return the best discount (highest percentage)
        return offerResult.reduce((best, current) =>
            current.discount_percentage > best.discount_percentage ? current : best
            , offerResult[0]);
    }

    return null;
}

export async function createTempBooking(bookingData, document_reference, userIdFromToken) {
    const connection = await pool.getConnection();
    try {
        await connection.query('START TRANSACTION');

        // === 1. CHECK APARTMENT EXISTS ===
        const [apartmentResult] = await connection.execute(
            `SELECT id, price_per_night, max_guests, title FROM apartments WHERE id = ?`,
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

        // === 3. CONFLICT CHECK ===
        const [conflictResult] = await connection.execute(
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

        if (Number(conflictResult[0].hasConflict) === 1) {
            await connection.query('ROLLBACK');
            return {
                success: false,
                error: 'Apartment not available for selected dates',
                code: 'CONFLICT',
                statusCode: 409
            };
        }

        // === 4. GET USER DETAILS FOR EMAIL ===
        const [userResult] = await connection.execute(
            `SELECT name, email FROM users WHERE id = ?`,
            [userIdFromToken]
        );

        if (userResult.length === 0) {
            await connection.query('ROLLBACK');
            return {
                success: false,
                error: 'User not found',
                code: 'USER_NOT_FOUND',
                statusCode: 404
            };
        }

        const user = userResult[0];

        // === 5. CALCULATE EXPIRATION TIME ===
        const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 hours

        // === 6. FIND APPLICABLE OFFER ===
        const applicableOffer = await getApplicableOffer(connection, bookingData.apartment_id);
        const offerId = applicableOffer?.id || null;
        const appliedDiscount = applicableOffer?.discount_percentage || 0;

        // Calculate discounted total if needed (optional)
        let finalTotalAmount = bookingData.total_amount;
        if (appliedDiscount > 0) {
            finalTotalAmount = bookingData.total_amount * (1 - appliedDiscount / 100);
        }

        // === 7. INSERT TEMP BOOKING WITH OFFER ===
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
                guest_details,
                offer_id,
                applied_discount_percentage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userIdFromToken,
                bookingData.apartment_id,
                bookingData.check_in,
                bookingData.check_out,
                bookingData.guests,
                finalTotalAmount, // Use discounted amount if offer applied
                bookingData.nights,
                'pending',
                expiresAt,
                JSON.stringify(bookingData.guest_details),
                offerId,
                appliedDiscount
            ]
        );

        // === 8. UPDATE DOCUMENT REFERENCE ===
        if (document_reference) {
            await connection.execute(
                `UPDATE user_documents 
                 SET booking_id = ? 
                 WHERE booking_id = ? AND user_id = ?`,
                [insertResult.insertId, document_reference, userIdFromToken]
            );
        }

        await connection.query('COMMIT');

        // === 9. SEND ADMIN EMAIL ===
        try {
            const emails = await query(
                `SELECT email FROM users WHERE role IN ('admin', 'staff')`
            );
            await emailService.sendAdminBookingEmail({
                customerName: user.name,
                customerEmail: user.email,
                apartmentName: apartment.title,
                checkIn: bookingData.check_in,
                checkOut: bookingData.check_out,
                totalPrice: bookingData.total_amount,
                adminEmails: emails.map(e => e.email)
            });
        } catch (emailError) {
            console.error('Failed to send admin email:', emailError);
            // Don't rollback transaction - email failure shouldn't block booking
        }

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