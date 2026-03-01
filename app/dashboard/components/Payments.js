// app/dashboard/components/Payments.js
'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCreditCard,
    faReceipt,
    faDownload,
    faCheckCircle,
    faClock,
    faTimesCircle,
    faUndo,
    faSyncAlt,
    faBan,
    faUniversity,
    faWallet,
    faMoneyBill,
    faCalendarAlt,
    faMoneyBillWave,
    faCalendarCheck,
    faFingerprint,
    faBuilding,
    faEye,
    faCircle,
    faRedo,
    faFilter,
    faSearch,
    faWandSparkles
} from '@fortawesome/free-solid-svg-icons';
import {
    faPaypal,
    faStripe,
    faApple,
    faGoogle
} from '@fortawesome/free-brands-svg-icons';
import FilterPills from './FilterPills';
import PaymentCard from './PaymentsCard';

// Default empty data structure
const DEFAULT_DATA = {
    payments: []
};

// Updated color scheme with amber/dark theme
const STATUS_COLORS = {
    paid: 'bg-emerald-900/20 text-emerald-300 border border-emerald-800/30',
    refunded: 'bg-blue-900/20 text-blue-300 border border-blue-800/30',
    cancelled: 'bg-rose-900/20 text-rose-300 border border-rose-800/30',
    failed: 'bg-neutral-800 text-neutral-300 border border-neutral-700/50'
};

const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'paid', label: 'Paid' },
    { id: 'refunded', label: 'Refunded' },
    { id: 'failed', label: 'Failed' }
];

const PAYMENT_METHODS = {
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    upi: 'UPI',
    netbanking: 'Net Banking',
    wallet: 'Digital Wallet'
};

// Skeleton Loading Component
const PaymentCardSkeleton = () => {
    return (
        <div className="relative bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 rounded-2xl p-5 animate-pulse">
            {/* Status Badge Skeleton */}
            <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-20 bg-neutral-700 rounded-full"></div>
                <div className="h-8 w-8 bg-neutral-700 rounded-lg"></div>
            </div>

            {/* Payment Info Skeleton */}
            <div className="h-6 w-3/4 bg-neutral-700 rounded-lg mb-2"></div>

            {/* Amount Skeleton */}
            <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-neutral-700 rounded"></div>
                    <div className="h-4 w-32 bg-neutral-700 rounded"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-neutral-700 rounded"></div>
                    <div className="h-4 w-40 bg-neutral-700 rounded"></div>
                </div>
            </div>

            {/* Payment Details Skeleton */}
            <div className="bg-neutral-800/50 rounded-xl p-4 mb-4 border border-neutral-700/30">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="h-3 w-16 bg-neutral-700 rounded mb-2"></div>
                        <div className="h-4 w-28 bg-neutral-700 rounded"></div>
                    </div>
                    <div>
                        <div className="h-3 w-16 bg-neutral-700 rounded mb-2"></div>
                        <div className="h-4 w-28 bg-neutral-700 rounded"></div>
                    </div>
                </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-2">
                <div className="flex-1 h-10 bg-neutral-700 rounded-xl"></div>
                <div className="flex-1 h-10 bg-neutral-700 rounded-xl"></div>
            </div>
        </div>
    );
};

// Safe data access helper with validation
const getSafeData = (data) => {
    try {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            return DEFAULT_DATA;
        }

        return {
            payments: Array.isArray(data.payments)
                ? data.payments.map(payment => ({
                    // Transform API snake_case to camelCase for component use
                    id: payment?.id,
                    bookingId: payment?.booking_id,
                    amount: payment?.amount,
                    method: payment?.method,
                    status: payment?.status,
                    paidAt: payment?.paid_at,
                    gatewayId: payment?.gatewayId,
                    refundId: payment?.refund_id,
                    refundTime: payment?.refund_time,
                    apartmentTitle: payment?.apartment_title,
                    startDate: payment?.start_date,
                    endDate: payment?.end_date
                })).filter(payment =>
                    payment &&
                    typeof payment === 'object' &&
                    !Array.isArray(payment) &&
                    // Ensure payment has basic required structure
                    (payment.id || payment.bookingId)
                )
                : DEFAULT_DATA.payments
        };
    } catch (error) {
        console.error('Error processing payment data:', error);
        return DEFAULT_DATA;
    }
};

// Safe string conversion with XSS protection
const safeToString = (value, defaultValue = '') => {
    if (value == null) return defaultValue;

    try {
        const stringValue = String(value).trim();
        // Basic XSS protection - remove script tags and dangerous attributes
        return stringValue
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+=["'][^"']*["']/g, '')
            .replace(/javascript:/gi, '')
            .substring(0, 500); // Limit length to prevent abuse
    } catch (error) {
        console.warn('Error converting to string:', error);
        return defaultValue;
    }
};

// Safe number formatting with validation
const safeFormatNumber = (value, defaultValue = 'N/A') => {
    if (value == null) return defaultValue;

    try {
        const num = Number(value);
        if (isNaN(num) || !isFinite(num)) return defaultValue;

        // Validate reasonable number ranges for payments
        if (num < 0 || num > 100000000) { // 100 million upper limit
            console.warn('Suspicious payment amount:', num);
            return 'Invalid';
        }

        return num.toLocaleString('en-IN');
    } catch (error) {
        console.warn('Error formatting number:', error);
        return defaultValue;
    }
};

// Safe currency formatting
const safeFormatCurrency = (value, currency = '₹', defaultValue = 'N/A') => {
    if (value == null) return defaultValue;

    try {
        const num = Number(value);
        if (isNaN(num) || !isFinite(num)) return defaultValue;

        // Additional security: validate amount range
        if (num < 0 || num > 100000000) {
            console.warn('Suspicious payment amount detected:', num);
            return `${currency}Invalid`;
        }

        return `${currency}${num.toLocaleString('en-IN')}`;
    } catch (error) {
        console.warn('Error formatting currency:', error);
        return defaultValue;
    }
};

// Safe date formatting
const safeFormatDate = (dateString, defaultValue = 'N/A') => {
    if (!dateString) return defaultValue;

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return defaultValue;

        // Validate date is not in the future (unless it's a scheduled payment)
        const now = new Date();
        if (date > new Date(now.getTime() + 86400000)) { // 1 day in future
            console.warn('Suspicious future date:', dateString);
            return 'Invalid Date';
        }

        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.warn('Error formatting date:', error);
        return defaultValue;
    }
};

// Safe payment method validation
const safePaymentMethod = (method) => {
    const safeMethod = safeToString(method).toLowerCase();
    return PAYMENT_METHODS[safeMethod] || safeToString(method, 'Unknown');
};

export default function Payments() {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentsData, setPaymentsData] = useState(DEFAULT_DATA);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [receiptHTML, setReceiptHTML] = useState('');
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [receiptLoading, setReceiptLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [currentAction, setCurrentAction] = useState('');
    const [currentPaymentId, setCurrentPaymentId] = useState('');

    // Fetch payments data
    const fetchPayments = useCallback(async (pageNum = page) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `/api/dashboard/payments?page=${pageNum}&limit=${limit}`,
                { cache: 'no-store' }
            ).then(res => res.json());

            if (response && typeof response === 'object') {
                setPaymentsData(response);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching payments:', err);
            setError('Failed to load payments. Please try again.');
            setPaymentsData(DEFAULT_DATA);
        } finally {
            setLoading(false);
        }
    }, [page, limit]);

    // Initial data fetch
    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    // Refetch function that can be called manually
    const handleRefetch = useCallback(() => {
        fetchPayments();
    }, [fetchPayments]);

    // Safely process the data
    const safeData = useMemo(() => getSafeData(paymentsData), [paymentsData]);

    // Safe filter handler
    const handleFilterChange = useCallback((newFilter) => {
        try {
            if (typeof newFilter === 'string' && FILTERS.some(f => f.id === newFilter)) {
                setFilter(newFilter);
            }
        } catch (error) {
            console.warn('Error changing filter:', error);
        }
    }, []);

    // Memoized filtered payments for performance
    const filteredPayments = useMemo(() => {
        return safeData.payments.filter(payment => {
            if (!payment || typeof payment !== 'object') return false;

            try {
                if (filter === 'all') return true;

                const paymentStatus = safeToString(payment.status);
                return paymentStatus === filter;
            } catch (error) {
                console.warn('Error filtering payment:', error, payment);
                return false;
            }
        });
    }, [safeData.payments, filter]);

    const getStatusColor = useCallback((status) => {
        const safeStatus = safeToString(status);
        return STATUS_COLORS[safeStatus] || 'bg-neutral-800 text-neutral-300 border border-neutral-700/50';
    }, []);

    // Safe payment property access
    const getPaymentProperty = useCallback((payment, property, defaultValue = '') => {
        if (!payment || typeof payment !== 'object') return defaultValue;

        try {
            const value = payment[property];
            return value != null ? value : defaultValue;
        } catch (error) {
            console.warn(`Error accessing payment property ${property}:`, error);
            return defaultValue;
        }
    }, []);

    // Safe payment ID generation
    const getSafePaymentId = useCallback((payment) => {
        try {
            const id = getPaymentProperty(payment, 'id');
            const bookingId = getPaymentProperty(payment, 'bookingId');

            if (id) return safeToString(id);
            if (bookingId) return `payment-${safeToString(bookingId)}`;

            return `payment-${Math.random().toString(36).substr(2, 9)}`;
        } catch (error) {
            return `payment-${Math.random().toString(36).substr(2, 9)}`;
        }
    }, [getPaymentProperty]);

    const handleReceiptAction = useCallback(async (paymentId, action) => {
        console.log(`🚀 Starting receipt action: ${action} for payment:`, paymentId);

        try {
            setCurrentAction(action);
            setCurrentPaymentId(paymentId);

            const url = `/api/test-receipt/${paymentId}`;

            /* ================================
               ✅ VIEW RECEIPT (NO FETCH)
               ================================ */
            if (action === 'view') {
                setReceiptLoading(true);

                // Directly load API URL into iframe
                setReceiptHTML(url);
                setShowReceiptModal(true);

                setReceiptLoading(false);
                return;
            }

            /* ================================
               ✅ DOWNLOAD RECEIPT (FETCH NEEDED)
               ================================ */
            if (action === 'download') {
                setDownloadLoading(true);

                console.log('📡 Fetching for download:', url);

                const res = await fetch(url);

                if (!res.ok) {
                    throw new Error(`Failed to fetch receipt (${res.status})`);
                }

                const pdfBlob = await res.blob();

                if (!pdfBlob || pdfBlob.size === 0) {
                    throw new Error('Received empty receipt');
                }

                const blobUrl = URL.createObjectURL(pdfBlob);

                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = `receipt-${paymentId}.pdf`;
                document.body.appendChild(a);
                a.click();

                a.remove();
                URL.revokeObjectURL(blobUrl);

                setDownloadLoading(false);
            }

        } catch (error) {
            console.error('❌ Receipt error:', error);
            alert(error.message || 'Failed to process receipt. Please try again.');
            setReceiptLoading(false);
            setDownloadLoading(false);
        } finally {
            setCurrentAction('');
            if (action === 'download') {
                setCurrentPaymentId('');
            }
        }
    }, []);

    const handleRefundAction = useCallback((paymentId) => {
        try {
            const safePaymentId = safeToString(paymentId);
        } catch (error) {
            console.error('Error processing refund:', error);
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-950 p-6">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <div className="h-8 w-48 bg-neutral-800 rounded-lg mb-2 animate-pulse"></div>
                            <div className="h-4 w-64 bg-neutral-800 rounded animate-pulse"></div>
                        </div>
                        <div className="h-9 w-24 bg-neutral-800 rounded-xl animate-pulse"></div>
                    </div>

                    {/* Search Bar Skeleton */}
                    <div className="flex flex-col lg:flex-row gap-4 mt-6 animate-pulse">
                        <div className="flex-1">
                            <div className="w-full h-12 bg-neutral-800/50 rounded-xl"></div>
                        </div>
                    </div>
                </div>

                {/* Filter Pills Skeleton */}
                <div className="flex flex-wrap gap-2 mb-6 animate-pulse">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-9 w-20 bg-neutral-800/50 rounded-full"></div>
                    ))}
                </div>

                {/* Payments Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[...Array(8)].map((_, i) => (
                        <PaymentCardSkeleton key={i} />
                    ))}
                </div>

                {/* Animated Background Elements */}
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neutral-800/5 rounded-full blur-3xl"></div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-950 p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                                Payments
                            </h1>
                            <p className="text-neutral-400 mt-1">
                                Track and manage all your payment transactions
                            </p>
                        </div>
                        <div className="text-sm px-4 py-2 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
                            <span className="text-neutral-400">Total: </span>
                            <span className="text-amber-400 font-semibold">{safeData.payments.length}</span>
                        </div>
                    </div>
                </div>

                {/* Error Card */}
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-br from-neutral-800/30 to-neutral-900/30 border-2 border-dashed border-neutral-700/50 rounded-2xl">
                    <div className="w-20 h-20 mb-4 bg-gradient-to-br from-rose-900/20 to-rose-800/20 rounded-full flex items-center justify-center border border-rose-700/30">
                        <FontAwesomeIcon icon={faTimesCircle} className="text-3xl text-rose-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-200 mb-2">Error Loading Payments</h3>
                    <p className="text-neutral-400 text-center max-w-md mb-6">{error}</p>
                    <button
                        onClick={handleRefetch}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25"
                    >
                        <FontAwesomeIcon icon={faRedo} className="text-sm" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-950 p-6">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">
                            Payments
                        </h1>
                        <p className="text-neutral-400 mt-1">
                            Track and manage all your payment transactions
                        </p>
                    </div>
                    <div className="text-sm px-4 py-2 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
                        <span className="text-neutral-400">Total: </span>
                        <span className="text-teal-400 font-semibold">{safeData.payments.length}</span>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col lg:flex-row gap-4 mt-6">
                    {/* Search Input */}
                    <div className="flex-1 relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-transparent rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-teal-400 transition-colors"
                        />
                        <input
                            type="text"
                            placeholder="Search by payment ID, apartment, or gateway ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="relative w-full pl-12 pr-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-xl focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:outline-none text-neutral-100 placeholder-neutral-500 transition-all"
                        />
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={handleRefetch}
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25"
                    >
                        <FontAwesomeIcon icon={faRedo} className="text-sm" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <FilterPills filters={FILTERS} activeFilter={filter} onFilterChange={setFilter} />
            </div>

            {/* Payments Grid */}
            {filteredPayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-br from-neutral-800/30 to-neutral-900/30 border-2 border-dashed border-neutral-700/50 rounded-2xl">
                    <div className="w-20 h-20 mb-4 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-full flex items-center justify-center border border-neutral-700/50">
                        <FontAwesomeIcon icon={faCreditCard} className="text-3xl text-neutral-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-200 mb-2">No payments found</h3>
                    <p className="text-neutral-400 text-center max-w-md">
                        {filter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'No payments available yet'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredPayments.map((payment, index) => (
                        <PaymentCard
                            key={getSafePaymentId(payment)}
                            payment={payment}
                            onViewReceipt={handleReceiptAction}
                            onDownloadReceipt={handleReceiptAction}
                            getPaymentProperty={getPaymentProperty}
                            getSafePaymentId={getSafePaymentId}
                            safeFormatCurrency={safeFormatCurrency}
                            safePaymentMethod={safePaymentMethod}
                            safeFormatDate={safeFormatDate}
                            safeToString={safeToString}
                            isViewLoading={receiptLoading}
                            isDownloadLoading={downloadLoading}
                            currentPaymentId={currentPaymentId}
                            currentAction={currentAction}
                        />
                    ))}
                </div>
            )}

            {/* Receipt Modal */}
            {showReceiptModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-4xl h-[85vh] overflow-hidden border border-neutral-700/50">

                        {/* ---------------- Header ---------------- */}
                        <div className="flex items-center justify-between p-5 border-b border-neutral-700/50 bg-neutral-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500/10 to-teal-400/5">
                                    <FontAwesomeIcon icon={faReceipt} className="text-teal-400" />
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-neutral-100">
                                        Payment Receipt
                                    </h3>
                                    <p className="text-sm text-neutral-400">
                                        Payment ID: {currentPaymentId}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">

                                {/* -------- Download PDF -------- */}
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await fetch(
                                                `/api/test-receipt/${currentPaymentId}`
                                            );

                                            if (!res.ok) throw new Error("Download failed");

                                            const blob = await res.blob();
                                            const url = window.URL.createObjectURL(blob);

                                            const a = document.createElement("a");
                                            a.href = url;
                                            a.download = `receipt-${currentPaymentId}.pdf`;
                                            document.body.appendChild(a);
                                            a.click();
                                            a.remove();

                                            // revoke AFTER download
                                            setTimeout(() => URL.revokeObjectURL(url), 2000);
                                        } catch (err) {
                                            console.error(err);
                                            alert("Failed to download receipt");
                                        }
                                    }}
                                    className="p-2 rounded-xl hover:bg-neutral-800/50 transition-colors border border-neutral-700/50"
                                    title="Download PDF"
                                >
                                    <FontAwesomeIcon
                                        icon={faDownload}
                                        className="text-neutral-400 hover:text-teal-400"
                                    />
                                </button>

                                {/* -------- Close Modal -------- */}
                                <button
                                    className="p-2 rounded-xl hover:bg-neutral-800/50 transition-colors border border-neutral-700/50"
                                    onClick={() => {
                                        setShowReceiptModal(false);

                                        // safely revoke blob url
                                        if (receiptHTML?.startsWith("blob:")) {
                                            URL.revokeObjectURL(receiptHTML);
                                        }

                                        setReceiptHTML("");
                                        setCurrentPaymentId("");
                                    }}
                                >
                                    <FontAwesomeIcon
                                        icon={faTimesCircle}
                                        className="text-neutral-400 hover:text-rose-400"
                                    />
                                </button>
                            </div>
                        </div>

                        {/* ---------------- PDF Viewer ---------------- */}
                        <div className="w-full h-[calc(100%-80px)] bg-neutral-800/30">
                            {receiptHTML ? (
                                <iframe
                                    key={receiptHTML}
                                    src={receiptHTML}
                                    title="Receipt PDF"
                                    className="w-full h-full"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                                    Loading receipt...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Global Loading Modal for Receipt Actions */}
            {(receiptLoading || downloadLoading) && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl shadow-2xl shadow-black/50 p-8 max-w-md mx-4 border border-neutral-700/50">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-teal-500/20 rounded-full"></div>
                                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-neutral-100 mb-2">
                                    {currentAction === 'view' ? 'Loading Receipt' : 'Downloading Receipt'}
                                </h3>
                                <p className="text-neutral-400 text-sm">
                                    {currentAction === 'view'
                                        ? 'Please wait while we prepare your receipt...'
                                        : 'Your download will start shortly...'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Animated Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neutral-800/5 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}