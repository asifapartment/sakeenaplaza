import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faReceipt,
    faMoneyBillWave,
    faArrowRotateLeft,
    faCircleExclamation,
    faArrowTrendDown,
    faArrowTrendUp
} from '@fortawesome/free-solid-svg-icons';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const PaymentStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
                icon={faReceipt}
                label="Total Revenue"
                value={formatCurrency(stats.overview.totalRevenue)}
                trend={stats.overview.revenueTrend}
                change={stats.overview.revenueChange}
                rate={null} // No rate for revenue, only change percentage
                rateLabel="vs last month"
                iconBg="from-emerald-500/20 to-emerald-600/20"
                iconColor="text-emerald-400"
                borderColor="border-emerald-500/30"
                gradient="bg-gradient-to-br from-neutral-900 via-neutral-900 to-emerald-900/20"
            />
            <StatCard
                icon={faMoneyBillWave}
                label="Successful Payments"
                value={stats.overview.successfulPayments}
                trend={stats.overview.successfulTrend}
                change={stats.overview.successfulChange}
                rate={stats.overview.successRate}
                rateLabel="Success Rate"
                iconBg="from-blue-500/20 to-blue-600/20"
                iconColor="text-blue-400"
                borderColor="border-blue-500/30"
                gradient="bg-gradient-to-br from-neutral-900 via-neutral-900 to-blue-900/20"
                formatNumber={true}
            />
            <StatCard
                icon={faArrowRotateLeft}
                label="Total Refunds"
                value={formatCurrency(stats.overview.totalRefunds)}
                trend={stats.overview.refundTrend}
                change={stats.overview.refundChange}
                rate={stats.overview.refundRate}
                rateLabel="Refund Rate"
                iconBg="from-amber-500/20 to-amber-600/20"
                iconColor="text-amber-400"
                borderColor="border-amber-500/30"
                gradient="bg-gradient-to-br from-neutral-900 via-neutral-900 to-amber-900/20"
            />
            <StatCard
                icon={faCircleExclamation}
                label="Failed Payments"
                value={stats.overview.failedPayments}
                trend={stats.overview.failedTrend}
                change={stats.overview.failedChange}
                rate={stats.overview.failureRate}
                rateLabel="Failure Rate"
                iconBg="from-rose-500/20 to-rose-600/20"
                iconColor="text-rose-400"
                borderColor="border-rose-500/30"
                gradient="bg-gradient-to-br from-neutral-900 via-neutral-900 to-rose-900/20"
                formatNumber={true}
            />
        </div>
    );
};

const StatCard = ({
    icon,
    label,
    value,
    trend = 'neutral',
    change = 0,
    rate = null,
    rateLabel = '',
    iconBg = 'from-neutral-700 to-neutral-800',
    iconColor = 'text-neutral-300',
    borderColor = 'border-neutral-700',
    gradient = 'bg-neutral-900',
    formatNumber = false
}) => {
    const isPositive = trend === 'up';
    const hasChange = change !== 0 && trend !== 'neutral';

    // Determine if this is a rate card (success/failure/refund rates)
    const isRateCard = rate !== null && rateLabel;

    return (
        <div className={`relative ${gradient} border ${borderColor} rounded-2xl p-6 overflow-hidden group hover:scale-[1.02] transition-all duration-300 hover:shadow-xl hover:shadow-neutral-900/50`}>
            {/* Decorative background element */}
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-current to-transparent opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                    {/* Icon container */}
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${iconBg} border ${borderColor} shadow-lg`}>
                        <FontAwesomeIcon
                            icon={icon}
                            className={`w-5 h-5 ${iconColor}`}
                        />
                    </div>

                    {/* Trend indicator */}
                    {hasChange && (
                        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                            <FontAwesomeIcon
                                icon={isPositive ? faArrowTrendUp : faArrowTrendDown}
                                className={`w-3 h-3 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}
                            />
                            <span className="font-semibold">
                                {isPositive ? '+' : ''}{change}%
                            </span>
                        </div>
                    )}
                </div>

                {/* Value */}
                <div className="mb-1">
                    <p className="text-2xl font-bold text-white tracking-tight">
                        {formatNumber ?
                            new Intl.NumberFormat().format(value).replace('₹', '') :
                            value
                        }
                    </p>
                </div>

                {/* Label */}
                <p className="text-sm font-medium text-neutral-400 mb-2">
                    {label}
                </p>

                {/* Progress bar (for revenue only) - showing actual percentage of target */}
                {label.toLowerCase().includes('revenue') && (
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-neutral-500 mb-1">
                            <span>Monthly Progress</span>
                            <span>{change > 0 ? '+' : ''}{change}%</span>
                        </div>
                        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${isPositive ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'}`}
                                style={{ width: `${Math.min(Math.abs(change) * 5, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Rate information (for success/failure/refund cards) */}
                {isRateCard && (
                    <div className="mt-4 pt-4 border-t border-neutral-800/50">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-neutral-500">
                                {rateLabel}
                            </span>
                            <span className={`text-sm font-semibold ${label.includes('Successful') ? 'text-emerald-400' :
                                    label.includes('Failed') ? 'text-rose-400' :
                                        'text-amber-400'
                                }`}>
                                {rate}%
                            </span>
                        </div>
                    </div>
                )}

                {/* Change percentage (for non-rate cards like Revenue) */}
                {!isRateCard && hasChange && (
                    <div className="mt-4 pt-4 border-t border-neutral-800/50">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-neutral-500">
                                vs last month
                            </span>
                            <span className={`text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'
                                }`}>
                                {isPositive ? '+' : ''}{change}%
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Hover effect border */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/10 transition-all duration-300"></div>

            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className={`absolute inset-0 ${borderColor.split('/')[0]}/5 blur-xl`}></div>
            </div>
        </div>
    );
};

// Optional: Animated loading skeleton
const StatCardSkeleton = () => (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 animate-pulse">
        <div className="flex items-start justify-between mb-6">
            <div className="p-3 rounded-xl bg-neutral-800">
                <div className="w-5 h-5 bg-neutral-700 rounded"></div>
            </div>
            <div className="w-16 h-6 bg-neutral-800 rounded-full"></div>
        </div>
        <div className="mb-1">
            <div className="h-7 w-24 bg-neutral-800 rounded mb-2"></div>
            <div className="h-4 w-32 bg-neutral-800 rounded"></div>
        </div>
        <div className="mt-4">
            <div className="h-1.5 bg-neutral-800 rounded-full"></div>
        </div>
    </div>
);

// Optional: Empty state component
const EmptyStats = ({ onRefresh }) => (
    <div className="col-span-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
            <FontAwesomeIcon icon={faReceipt} className="w-7 h-7 text-neutral-500" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-300 mb-2">No Payment Data</h3>
        <p className="text-neutral-500 mb-4">Payment statistics will appear here once transactions are processed.</p>
        <button
            onClick={onRefresh}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm transition-colors"
        >
            Refresh Data
        </button>
    </div>
);

export default PaymentStats;
export { StatCardSkeleton, EmptyStats };