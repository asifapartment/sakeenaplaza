// app/api/dashboard/settings/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { query } from '@/lib/mysql-wrapper';
import { logActivity } from '@/lib/logActivity';
import bcrypt from 'bcrypt';

export async function GET(request) {
    try {
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

        // Get user profile
        const [user] = await connection.execute(`
            SELECT 
                id, name, email, alternate_email as altEmail, 
                phone_number as phone, alternate_phone as altPhone,
                role, plan, created_at
            FROM users 
            WHERE id = ?
        `, [userId]);

        // Get user activity
        const [activities] = await connection.execute(`
            SELECT message, date
            FROM user_activity
            WHERE user_id = ?
            ORDER BY date DESC
            LIMIT 10
        `, [userId]);

        connection.release();

        const settingsData = {
            profile: user[0] || {},
            preferences: {
                dateFormat: 'DD/MM/YYYY',
                timezone: 'IST',
                currency: 'INR',
                emailNotifications: true,
                smsNotifications: false
            },
            activities: activities || []
        };

        return NextResponse.json(settingsData);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    let connection;
    try {
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
        const body = await request.json();

        // Support both individual field updates and bulk updates
        const updates = {};
        const allowedFields = ['name', 'email', 'altEmail', 'phone', 'altPhone'];

        // Filter only allowed fields that are present in the request
        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        });

        // If no valid fields to update
        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        connection = await pool.getConnection();

        // Build dynamic UPDATE query based on provided fields
        const setClauses = [];
        const values = [];

        if (updates.name !== undefined) {
            setClauses.push('name = ?');
            values.push(updates.name);
        }
        if (updates.email !== undefined) {
            setClauses.push('email = ?');
            values.push(updates.email);
        }
        if (updates.altEmail !== undefined) {
            setClauses.push('alternate_email = ?');
            values.push(updates.altEmail);
        }
        if (updates.phone !== undefined) {
            setClauses.push('phone_number = ?');
            values.push(updates.phone);
        }
        if (updates.altPhone !== undefined) {
            setClauses.push('alternate_phone = ?');
            values.push(updates.altPhone);
        }

        values.push(userId);

        const updateQuery = `
            UPDATE users 
            SET ${setClauses.join(', ')}
            WHERE id = ?
        `;

        const [result] = await connection.execute(updateQuery, values);

        if (result.affectedRows === 0) {
            throw new Error('User not found or no changes made');
        }

        // Log activity - include which field was updated
        const updatedFields = Object.keys(updates).join(', ');
        await connection.execute(`
            INSERT INTO user_activity (user_id, message)
            VALUES (?, ?)
        `, [userId, `Updated profile fields: ${updatedFields}`]);

        connection.release();

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            updatedFields: Object.keys(updates)
        });

    } catch (error) {
        if (connection) {
            connection.release();
        }
        console.error('Error updating profile:', error);

        if (error.message.includes('Duplicate entry') || error.message.includes('email')) {
            return NextResponse.json(
                { error: 'Email already exists', code: 'DUPLICATE_EMAIL' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to update profile' },
            { status: 500 }
        );
    }
}

export async function DELETE(req) {
    let userId = null;

    try {
        /* ----------------------------------
           Get Cookies
        ---------------------------------- */
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("token")?.value;

        if (!sessionToken) {
            return NextResponse.json(
                { error: "Authentication required", code: "UNAUTHORIZED" },
                { status: 401 }
            );
        }

        /* ----------------------------------
           Verify JWT
        ---------------------------------- */
        const tokenResult = verifyToken(sessionToken);

        if (!tokenResult?.valid || !tokenResult?.decoded?.id) {
            return NextResponse.json(
                { error: "Invalid or expired session", code: "UNAUTHORIZED" },
                { status: 401 }
            );
        }

        userId = tokenResult.decoded.id;

        /* ----------------------------------
           CSRF Validation
        ---------------------------------- */
        const csrfHeader = req.headers.get("x-csrf-token");
        const cookieCsrfToken = cookieStore.get("csrfToken")?.value;

        if (!csrfHeader || !cookieCsrfToken || csrfHeader !== cookieCsrfToken) {
            return NextResponse.json(
                { error: "Invalid CSRF token" },
                { status: 403 }
            );
        }

        /* ----------------------------------
           Parse Body Safely
        ---------------------------------- */
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        const { password, confirmText } = body;

        if (!password) {
            return NextResponse.json(
                { error: "Password required" },
                { status: 400 }
            );
        }

        if (confirmText !== "DELETE") {
            return NextResponse.json(
                { error: "Please type DELETE to confirm account deletion" },
                { status: 400 }
            );
        }

        /* ----------------------------------
           Fetch User
        ---------------------------------- */
        const users = await query(
            `SELECT id, email, password, is_active
         FROM users
         WHERE id = ?
         LIMIT 1`,
            [userId]
        );

        if (!users.length) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const user = users[0];

        if (user.is_active === 0) {
            return NextResponse.json(
                { error: "Account already deleted" },
                { status: 400 }
            );
        }

        /* ----------------------------------
           Password Verify
        ---------------------------------- */
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            await logActivity(user.id, "Failed account deletion - incorrect password");

            return NextResponse.json(
                { error: "Incorrect password" },
                { status: 401 }
            );
        }

        /* ----------------------------------
           TRANSACTION START
        ---------------------------------- */
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 1️⃣ Soft delete user
            await connection.execute(
                `UPDATE users SET 
                    is_active = 0,
                    deleted_at = NOW(),
                    updated_at = NOW()
                WHERE id = ?`,
                [user.id]
            );

            // 2️⃣ Delete sessions
            await connection.execute(
                `DELETE FROM sessions WHERE user_id = ?`,
                [user.id]
            );

            // 3️⃣ Anonymize data
            const anonymizedEmail =
                `deleted_${user.id}_${Date.now()}@deleted.user`;

            await connection.execute(
                `UPDATE users SET
                    email = ?,
                    name = 'Deleted User',
                    alternate_email = NULL,
                    phone_number = NULL,
                    alternate_phone = NULL
                WHERE id = ?`,
                [anonymizedEmail, user.id]
            );

            await connection.commit();

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        /* ----------------------------------
           Log Success
        ---------------------------------- */
        await logActivity(userId, "Account deleted successfully");

        /* ----------------------------------
           Clear Cookies
        ---------------------------------- */
        const response = NextResponse.json({
            success: true,
            message: "Your account has been deleted successfully",
        });

        response.cookies.set("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 0,
            path: "/",
        });

        response.cookies.set("csrfToken", "", {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 0,
            path: "/",
        });

        return response;

    } catch (err) {
        console.error("Account Deletion Error:", err);

        if (userId) {
            await logActivity(userId, "Account deletion failed");
        }

        return NextResponse.json(
            { error: "Failed to delete account. Please try again." },
            { status: 500 }
        );
    }
  }