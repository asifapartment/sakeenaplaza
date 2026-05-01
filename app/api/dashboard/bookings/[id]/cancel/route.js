import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(request, { params }) {
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

        if (booking[0].status === 'cancelled') {
            connection.release();
            return NextResponse.json(
                { error: 'Booking is already cancelled' },
                { status: 400 }
            );
        }

        if (booking[0].status === 'expired') {
            connection.release();
            return NextResponse.json(
                { error: 'Cannot cancel an expired booking' },
                { status: 400 }
            );
        }

        await connection.execute(
            'UPDATE bookings SET status = ?, cancelled_at = NOW() WHERE id = ? AND user_id = ?',
            ['cancelled', id, userId]
        );

        await connection.execute(
            'INSERT INTO user_activity (user_id, message) VALUES (?, ?)',
            [userId, `Cancelled booking #${id}`]
        );

        connection.release();

        return NextResponse.json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        return NextResponse.json(
            { error: 'Failed to cancel booking' },
            { status: 500 }
        );
    }
}