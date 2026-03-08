import { query } from '@/lib/mysql-wrapper';

const ALLOWED_TYPES = [
    'system',
    'booking',
    'payment',
    'user',
    'security'
];

const ALLOWED_LEVELS = [
    'info',
    'success',
    'warning',
    'error'
];

export async function createNotification({
    type = 'system',
    title,
    content = null,
    userId = null,
    bookingId = null,
    meta = null,
    level = 'info'
}) {
    if (!title) {
        throw new Error("Notification title is required");
    }

    if (!ALLOWED_TYPES.includes(type)) {
        type = 'system';
    }

    if (!ALLOWED_LEVELS.includes(level)) {
        level = 'info';
    }

    let metaData = null;

    if (meta) {
        try {
            metaData = JSON.stringify(meta);
        } catch {
            console.warn("Invalid meta JSON in notification");
        }
    }

    const sql = `
        INSERT INTO admin_notifications
        (type, title, content, user_id, booking_id, meta, level)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
        type,
        title,
        content,
        userId,
        bookingId,
        metaData,
        level
    ]);

    return {
        id: result.insertId,
        type,
        title
    };
}