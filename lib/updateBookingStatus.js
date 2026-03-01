import { query } from "./mysql-wrapper";

export async function updateBookingStatus() {

    // 1. Pending → Expired
    await query(`
        UPDATE bookings
        SET status = 'expired',
            expired_at = NOW()
        WHERE status = 'pending'
          AND expires_at IS NOT NULL
          AND expires_at <= NOW()
    `);

    // 2. Confirmed → Ongoing
    await query(`
        UPDATE bookings
        SET status = 'ongoing'
        WHERE status = 'confirmed'
          AND CURDATE() >= start_date
          AND CURDATE() < end_date
    `);

    // 3. Ongoing → Completed (fallback only)
    await query(`
        UPDATE bookings
        SET status = 'completed'
        WHERE status = 'ongoing'
          AND CURDATE() > end_date
    `);
}

