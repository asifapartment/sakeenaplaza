// app/api/csrf/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyToken } from '@/lib/jwt';

export async function GET(req) {
    try {
        // Verify user is authenticated
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({
                error: 'Unauthorized'
            }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json({
                error: 'Invalid token'
            }, { status: 401 });
        }

        // Get CSRF token from cookie or generate new one
        let csrfToken = req.cookies.get('csrfToken')?.value;

        if (!csrfToken) {
            csrfToken = crypto.randomBytes(32).toString('hex');
        }

        const response = NextResponse.json({
            csrfToken,
            success: true
        });

        // Set CSRF token cookie if not exists
        if (!req.cookies.get('csrfToken')?.value) {
            response.cookies.set('csrfToken', csrfToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
            });
        }

        return response;
    } catch (error) {
        console.error('CSRF Token Error:', error);
        return NextResponse.json({
            error: 'Failed to generate CSRF token'
        }, { status: 500 });
    }
}