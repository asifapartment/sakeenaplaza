// app/api/admin/blocked-dates/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';
import { verifyAdmin } from '@/lib/adminAuth';

// Cookie parser
export function parseCookies(cookieHeader) {
    if (!cookieHeader) return {};
    return Object.fromEntries(
        cookieHeader.split(';').map(c => {
            const [k, v] = c.trim().split('=');
            return [k, decodeURIComponent(v)];
        })
    );
}

// GET - Fetch all blocked dates for an apartment
export async function GET(req) {
    try {
        const cookieHeader = req.headers.get("cookie");
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const adminCheck = await verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }

        const url = new URL(req.url);
        const apartment_id = url.searchParams.get("apartment_id");

        if (!apartment_id) {
            return NextResponse.json({ error: 'Apartment ID required' }, { status: 400 });
        }

        const blockedDates = await query(
            `SELECT id, start_date, end_date, block_reason, created_at
             FROM bookings 
             WHERE apartment_id = ? 
             AND blocked_by_admin = 1
             ORDER BY start_date DESC`,
            [parseInt(apartment_id)]
        );

        return NextResponse.json({ blocked_dates: blockedDates });
    } catch (err) {
        console.error('Error fetching blocked dates:', err);
        return NextResponse.json({ error: 'Failed to fetch blocked dates' }, { status: 500 });
    }
}

// POST - Add a new blocked date range
export async function POST(req) {
    try {
        const cookieHeader = req.headers.get("cookie");
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const adminCheck = await verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }

        const body = await req.json();
        const { apartment_id, start_date, end_date, reason } = body;

        if (!apartment_id || !start_date || !end_date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Calculate nights
        const start = new Date(start_date);
        const end = new Date(end_date);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        if (nights < 1) {
            return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
        }

        // Convert parameters to proper types
        const aptId = parseInt(apartment_id);
        const blockReason = reason || 'Blocked by admin';
        const totalAmount = 0;
        const guests = 1;
        const blockedByAdmin = 1; // tinyint(1)

        // Create a blocked booking record matching your schema
        const insertSql = `
            INSERT INTO bookings 
            (apartment_id,user_id, start_date, end_date, nights, status, blocked_by_admin, block_reason, total_amount, guests) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            aptId,
            adminCheck.decoded.id, // Use admin's user ID for tracking
            start_date,
            end_date,
            nights,
            'blocked', // status
            blockedByAdmin,
            blockReason,
            totalAmount,
            guests
        ];

        const result = await query(insertSql, values);

        return NextResponse.json({
            message: 'Blocked dates added successfully',
            id: result.insertId
        }, { status: 201 });

    } catch (err) {
        console.error('Error adding blocked dates:', err);
        return NextResponse.json({
            error: 'Failed to add blocked dates',
            details: err.message
        }, { status: 500 });
    }
}

// DELETE - Remove a blocked date range
export async function DELETE(req) {
    try {
        const cookieHeader = req.headers.get("cookie");
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const adminCheck = await verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }

        const url = new URL(req.url);
        const booking_id = url.searchParams.get("booking_id");

        if (!booking_id) {
            return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
        }

        const result = await query(
            'DELETE FROM bookings WHERE id = ? AND blocked_by_admin = 1',
            [parseInt(booking_id)]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Blocked date not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Blocked dates removed successfully' });
    } catch (err) {
        console.error('Error removing blocked dates:', err);
        return NextResponse.json({ error: 'Failed to remove blocked dates' }, { status: 500 });
    }
}