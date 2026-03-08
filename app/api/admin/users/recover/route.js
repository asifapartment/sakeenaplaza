import { query } from '@/lib/mysql-wrapper';
import { verifyToken } from '@/lib/jwt';
import { NextResponse } from 'next/server';
import { logActivity } from '@/lib/logActivity';

export async function POST(req) {
    try {
        // Verify admin token
        const token = req.cookies.get('token')?.value;
        const decoded = await verifyToken(token);

        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({
                error: 'Admin access required'
            }, { status: 403 });
        }

        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({
                error: 'User ID is required'
            }, { status: 400 });
        }

        // Reactivate user account
        await query(
            `UPDATE users SET 
                is_active = 1,
                deleted_at = NULL,
                updated_at = NOW()
            WHERE id = ?`,
            [userId]
        );

        await logActivity(decoded.id, `Reactivated user account: ${userId}`);

        return NextResponse.json({
            success: true,
            message: 'Account reactivated successfully'
        });

    } catch (err) {
        console.error('Account Recovery Error:', err);
        return NextResponse.json({
            error: 'Failed to recover account'
        }, { status: 500 });
    }
}