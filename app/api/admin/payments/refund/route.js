import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import crypto from 'crypto';
import { verifyAdmin } from '@/lib/adminAuth';
import { parseCookies } from '@/lib/cookies';

// Generate unique refund ID
function generateRefundId() {
    return `rfnd_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

export async function POST(request) {
    try {
        const connection = await pool.getConnection();

        try {
            const data = await request.json();
            const {
                paymentId,
                bookingId,
                refundAmount,
            } = data;

            let totalBalance = 0;
            const cookies = parseCookies(request.headers.get("cookie"));
            const token = cookies.token;

            // ✅ Use adminAuth helper
            const { valid, decoded, error } = await verifyAdmin(token);
            if (!valid) {
                return NextResponse.json({ error }, { status: 401 });
            }

            // Validate required fields
            if (!paymentId || !refundAmount) {
                return NextResponse.json(
                    { error: 'Missing required fields' },
                    { status: 400 }
                );
            }

            // Start transaction
            await connection.beginTransaction();

            // 1. Get payment details
            const [paymentRows] = await connection.execute(
                `SELECT * FROM payments WHERE id = ? AND status = 'paid' FOR UPDATE`,
                [paymentId]
            );

            if (paymentRows.length === 0) {
                await connection.rollback();
                return NextResponse.json(
                    { error: 'Payment not found or not eligible for refund' },
                    { status: 404 }
                );
            }

            const payment = paymentRows[0];

            // Validate refund amount doesn't exceed original amount
            if (parseFloat(refundAmount) > parseFloat(payment.amount)) {
                await connection.rollback();
                return NextResponse.json(
                    { error: 'Refund amount cannot exceed original payment amount' },
                    { status: 400 }
                );
            }

            // Generate refund ID
            const refundId = generateRefundId();
            const refundTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

            // Update total balance if provided
            totalBalance = parseFloat(payment.amount);
            totalBalance = totalBalance - refundAmount;

            // 2. Update payment status and refund info
            await connection.execute(
                `UPDATE payments 
                 SET status = 'refunded',
                    amount = ?,
                    refund_id = ?,
                    refund_time = ?,
                    refunded = ?
                 WHERE id = ?`,
                [totalBalance, refundId, refundTime, refundAmount, paymentId]
            );


            // 3. Update booking status to cancelled if full refund
            await connection.execute(
                `UPDATE bookings 
                 SET status = 'cancelled',
                    expires_at = NULL,
                    updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [bookingId || payment.booking_id]
            );

            // 4. Create refund record (optional - you might want to create a separate refunds table)
            // For now, we'll update the payments table
            // If you want detailed refund tracking, create a refunds table:
            /*
            CREATE TABLE refunds (
                id INT AUTO_INCREMENT PRIMARY KEY,
                payment_id INT NOT NULL,
                refund_id VARCHAR(100) UNIQUE,
                refund_amount DECIMAL(10,2),
                original_amount DECIMAL(10,2),
                platform_fee DECIMAL(10,2),
                net_refund DECIMAL(10,2),
                refund_type ENUM('full','partial','percentage','custom'),
                refund_value DECIMAL(10,2),
                reason TEXT,
                processed_by INT,
                status ENUM('pending','completed','failed') DEFAULT 'completed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
                FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
            );
            */

            // 5. Create activity log
            const adminId = await decoded.id; // Get from session/token in production
            await connection.execute(
                `INSERT INTO user_activity (user_id, message, date)
                 VALUES (?, ?, CURRENT_TIMESTAMP)`,
                [adminId, `Processed refund ${refundId} for payment #${paymentId} - Amount: ${refundAmount}`]
            );

            // 6. Update booking_records if needed
            if (bookingId) {
                await connection.execute(
                    `UPDATE booking_records 
                     SET total_payments = total_payments - ?,
                         last_payment_status = 'refunded'
                     WHERE user_id = (
                         SELECT user_id FROM bookings WHERE id = ?
                     )`,
                    [refundAmount, bookingId]
                );
            }

            // Commit transaction
            await connection.commit();

            // In production: Integrate with actual payment gateway (Razorpay, Stripe, etc.)
            /*
            Example for Razorpay:
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET
            });
            
            const razorpayRefund = await razorpay.payments.refund(payment.razorpay_payment_id, {
                amount: refundAmount * 100, // Convert to paise
                speed: "normal",
                notes: {
                    reason: reason,
                    refund_type: refundType,
                    admin_id: adminId
                }
            });
            */

            return NextResponse.json({
                success: true,
                message: 'Refund processed successfully',
                data: {
                    refundId,
                    refundAmount,
                    totalBalance,
                    originalAmount: payment.amount,
                    refundTime,
                    paymentId: payment.id,
                    razorpayPaymentId: payment.razorpay_payment_id
                }
            });

        } catch (error) {
            await connection.rollback();
            console.error('Refund error:', error);
            return NextResponse.json(
                { error: 'Failed to process refund', details: error.message },
                { status: 500 }
            );
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Database connection error:', error);
        return NextResponse.json(
            { error: 'Database connection failed' },
            { status: 500 }
        );
    }
}