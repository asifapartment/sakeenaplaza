import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';

/**
 * Utility to calculate trend + percentage change
 */
function calcTrend(current, previous) {
  if (!previous || previous === 0) {
    return { trend: 'neutral', change: 0 };
  }

  const diff = ((current - previous) / previous) * 100;

  return {
    trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
    change: Math.abs(Number(diff.toFixed(1)))
  };
}

export async function GET() {
  try {
    /**
     * ===============================
     * Current 30 days stats
     * ===============================
     */
    const [current] = await query(`
            SELECT 
                COUNT(*) as totalPayments,
                SUM(CASE WHEN status IN ('paid','refunded') THEN amount ELSE 0 END) as totalRevenue,
                SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END) as totalRefunds,
                COUNT(CASE WHEN status IN ('paid','refunded') THEN 1 END) as successfulPayments,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failedPayments,
                COUNT(CASE WHEN status = 'refunded' THEN 1 END) as refundedPayments
            FROM payments
            WHERE paid_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);

    /**
     * ===============================
     * Previous 30 days stats
     * ===============================
     */
    const [previous] = await query(`
            SELECT 
                SUM(CASE WHEN status IN ('paid','refunded') THEN amount ELSE 0 END) as prevRevenue,
                SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END) as prevRefunds,
                COUNT(CASE WHEN status = 'paid' THEN 1 END) as prevSuccessful,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as prevFailed
            FROM payments
            WHERE paid_at BETWEEN
                DATE_SUB(NOW(), INTERVAL 60 DAY)
                AND DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);

    /**
     * ===============================
     * Trend calculations
     * ===============================
     */
    const revenueTrend = calcTrend(
      current.totalRevenue,
      previous.prevRevenue
    );

    const refundTrend = calcTrend(
      current.totalRefunds,
      previous.prevRefunds
    );

    const successfulTrend = calcTrend(
      current.successfulPayments,
      previous.prevSuccessful
    );

    const failedTrend = calcTrend(
      current.failedPayments,
      previous.prevFailed
    );

    /**
     * ===============================
     * Rate calculations
     * ===============================
     */
    const successRate = current.totalPayments
      ? Number(
        ((current.successfulPayments / current.totalPayments) * 100).toFixed(1)
      )
      : 0;

    const refundRate = current.totalPayments
      ? Number(
        ((current.refundedPayments / current.totalPayments) * 100).toFixed(1)
      )
      : 0;

    const failureRate = current.totalPayments
      ? Number(
        ((current.failedPayments / current.totalPayments) * 100).toFixed(1)
      )
      : 0;

    /**
     * ===============================
     * Recent payments
     * ===============================
     */
    const recentPayments = await query(`
            SELECT 
                p.*,
                u.name AS user_name,
                a.title AS apartment_title
            FROM payments p
            LEFT JOIN bookings b ON p.booking_id = b.id
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN apartments a ON b.apartment_id = a.id
            ORDER BY p.paid_at DESC
            LIMIT 5
        `);

    /**
     * ===============================
     * Monthly revenue (chart)
     * ===============================
     */
    const monthlyRevenue = await query(`
            SELECT 
                DATE_FORMAT(paid_at, '%Y-%m') AS month,
                SUM(amount) AS revenue,
                COUNT(*) AS payment_count
            FROM payments
            WHERE status IN ('paid','refunded')
              AND paid_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(paid_at, '%Y-%m')
            ORDER BY month
        `);

    /**
     * ===============================
     * Final response
     * ===============================
     */
    return NextResponse.json({
      overview: {
        totalRevenue: current.totalRevenue || 0,
        totalRefunds: current.totalRefunds || 0,
        successfulPayments: current.successfulPayments || 0,
        failedPayments: current.failedPayments || 0,

        revenueTrend: revenueTrend.trend,
        revenueChange: revenueTrend.change,

        refundTrend: refundTrend.trend,
        refundChange: refundTrend.change,

        successfulTrend: successfulTrend.trend,
        successfulChange: successfulTrend.change,

        failedTrend: failedTrend.trend,
        failedChange: failedTrend.change,

        successRate,
        refundRate,
        failureRate
      },
      recentPayments,
      monthlyRevenue
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment statistics' },
      { status: 500 }
    );
  }
}
