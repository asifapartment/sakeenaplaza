'use client';
import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';

// Lazy load FontAwesome icons - only load what's needed
const loadIcons = async () => {
    const { faSearch, faSync, faFileExport, faEye } = await import('@fortawesome/free-solid-svg-icons');
    return { faSearch, faSync, faFileExport, faEye };
};

// Lazy load components
const PaymentStats = lazy(() => import('./PaymentStats'));
const PaymentFilters = lazy(() => import('./PaymentFilters'));
const PaymentsTable = lazy(() => import('./PaymentsTable'));
const PaymentDetailsModal = lazy(() => import('./PaymentDetailsModal'));
const Snackbar = lazy(() => import('./Snackbar'));

// Loading components
const LoadingSpinner = () => (
    <div className="h-screen text-white p-6 flex items-center justify-center"
        style={{ maxHeight: 'calc(100vh - 96px)' }}
    >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>
);

// 403 Forbidden Component
const ForbiddenPage = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* 403 Icon */}
                <div className="mb-8">
                    <div className="w-24 h-24 mx-auto bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/30">
                        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </div>

                {/* Error Code */}
                <h1 className="text-8xl font-bold text-red-500 mb-2">403</h1>
                <h2 className="text-2xl font-semibold text-white mb-4">Access Forbidden</h2>

                <p className="text-gray-400 mb-8">
                    You don't have permission to access this page. This area is restricted to administrators only.
                </p>

                {/* Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition"
                    >
                        Go to Dashboard
                    </button>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

// 401 Unauthorized Component
const UnauthorizedPage = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* 401 Icon */}
                <div className="mb-8">
                    <div className="w-24 h-24 mx-auto bg-yellow-500/10 rounded-full flex items-center justify-center border-2 border-yellow-500/30">
                        <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </div>

                {/* Error Code */}
                <h1 className="text-8xl font-bold text-yellow-500 mb-2">401</h1>
                <h2 className="text-2xl font-semibold text-white mb-4">Authentication Required</h2>

                <p className="text-gray-400 mb-8">
                    Please login to access this page. Your session may have expired.
                </p>

                {/* Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/login')}
                        className="w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white font-semibold transition"
                    >
                        Go to Login
                    </button>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

const PaymentManagement = () => {
    const router = useRouter();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });
    const [filters, setFilters] = useState({ status: 'all', search: '', startDate: '', endDate: '' });
    const [paymentDetails, setPaymentDetails] = useState({ open: false, payment: null });
    const [exportLoading, setExportLoading] = useState(false);
    const [iconsLoaded, setIconsLoaded] = useState(false);

    // Auth state
    const [authStatus, setAuthStatus] = useState({
        isAuthenticated: false,
        isAuthorized: false,
        checking: true
    });

    // Check authentication and authorization on mount
    useEffect(() => {
        checkAuthAndRole();
    }, []);

    const checkAuthAndRole = async () => {
        try {
            // First check if user is authenticated
            const authResponse = await fetch('/api/auth/me', {
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            if (!authResponse.ok) {
                // 401 - Not authenticated
                if (authResponse.status === 401) {
                    setAuthStatus({
                        isAuthenticated: false,
                        isAuthorized: false,
                        checking: false
                    });
                    return;
                }
                throw new Error('Auth check failed');
            }

            const userData = await authResponse.json();

            // Check if user is admin (role-based authorization)
            // Only admin can access this page, not staff
            if (userData.role !== 'admin') {
                // 403 - Forbidden - Staff or other roles trying to access admin page
                setAuthStatus({
                    isAuthenticated: true,
                    isAuthorized: false,
                    checking: false
                });
                return;
            }

            // User is admin - authorized
            setAuthStatus({
                isAuthenticated: true,
                isAuthorized: true,
                checking: false
            });

            // Load data only if authorized
            fetchPayments();
            fetchStats();

        } catch (err) {
            console.error('Auth check error:', err);
            setAuthStatus({
                isAuthenticated: false,
                isAuthorized: false,
                checking: false
            });
        }
    };

    // Load icons on component mount
    useEffect(() => {
        loadIcons().then(() => setIconsLoaded(true));
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.status && filters.status !== 'all') {
                queryParams.append('status', filters.status);
            }

            const res = await fetch(`/api/admin/payments?${queryParams}`);

            // Handle 401 Unauthorized
            if (res.status === 401) {
                setAuthStatus({
                    isAuthenticated: false,
                    isAuthorized: false,
                    checking: false
                });
                showSnackbar('Session expired. Please login again.', 'error');
                setTimeout(() => router.push('/login'), 2000);
                return;
            }
            
            // Handle 403 Forbidden
            if (res.status === 403) {
                setAuthStatus({
                    isAuthenticated: true,
                    isAuthorized: false,
                    checking: false
                });
                showSnackbar('Access denied. Admin privileges required.', 'error');
                return;
            }

            const data = await res.json();
            if (res.ok) setPayments(data.payments || []);
        } catch (err) {
            console.error(err);
            showSnackbar('Failed to fetch payments', 'error');
        }
        setLoading(false);
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`/api/admin/payments/stats`);

            // Handle 401 Unauthorized
            if (res.status === 401) {
                setAuthStatus({
                    isAuthenticated: false,
                    isAuthorized: false,
                    checking: false
                });
                return;
            }

            // Handle 403 Forbidden
            if (res.status === 403) {
                setAuthStatus({
                    isAuthenticated: true,
                    isAuthorized: false,
                    checking: false
                });
                return;
            }

            const data = await res.json();
            if (res.ok) setStats(data);
        } catch (err) {
            console.error(err);
        }
    };

    const exportToCSV = async () => {
        setExportLoading(true);
        try {
            const queryParams = new URLSearchParams();

            if (filters.status && filters.status !== 'all') {
                queryParams.append('status', filters.status);
            }
            if (filters.startDate) {
                queryParams.append('startDate', filters.startDate);
            }
            if (filters.endDate) {
                queryParams.append('endDate', filters.endDate);
            }

            const response = await fetch(`/api/admin/payments/export?${queryParams}`);

            // Handle 401 Unauthorized
            if (response.status === 401) {
                showSnackbar('Session expired. Please login again.', 'error');
                setTimeout(() => router.push('/login'), 2000);
                setExportLoading(false);
                return;
            }

            // Handle 403 Forbidden
            if (response.status === 403) {
                showSnackbar('Access denied. Admin privileges required.', 'error');
                setExportLoading(false);
                return;
            }

            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;

            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `payments-${new Date().toISOString().split('T')[0]}.csv`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch.length === 2) {
                    filename = filenameMatch[1];
                }
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showSnackbar('Payments exported successfully', 'success');
        } catch (error) {
            console.error('Export error:', error);
            showSnackbar('Failed to export payments', 'error');
        }
        setExportLoading(false);
    };

    const showSnackbar = (message, type = 'success') => {
        setSnackbar({ open: true, message, type });
        setTimeout(() => setSnackbar({ open: false, message: '', type: 'success' }), 3000);
    };

    // Memoized filtered payments to avoid recalculating on every render
    const filteredPayments = useMemo(() => {
        if (!filters.search) return payments;

        return payments.filter(payment =>
            payment.user_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
            payment.apartment_title?.toLowerCase().includes(filters.search.toLowerCase()) ||
            payment.razorpay_payment_id?.toLowerCase().includes(filters.search.toLowerCase()) ||
            payment.id?.toString() === filters.search ||
            payment.booking_id?.toString() === filters.search ||
            payment.refund_id?.toLowerCase().includes(filters.search.toLowerCase())
        );
    }, [payments, filters.search]);

    const handleRefund = async (refundData) => {
        try {
            const response = await fetch('/api/admin/payments/refund', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(refundData),
                credentials: 'include',
            });

            // Handle 401 Unauthorized
            if (response.status === 401) {
                showSnackbar('Session expired. Please login again.', 'error');
                setTimeout(() => router.push('/login'), 2000);
                throw new Error('Session expired');
            }

            // Handle 403 Forbidden
            if (response.status === 403) {
                showSnackbar('Access denied. Admin privileges required.', 'error');
                throw new Error('Access denied');
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Refund failed');
            }

            const result = await response.json();

            // Update local state
            setPayments(prevPayments =>
                prevPayments.map(payment =>
                    payment.id === refundData.paymentId
                        ? { ...payment, status: 'refunded' }
                        : payment
                )
            );

            // Show success message
            showSnackbar(result.message || 'Refund processed successfully', 'success');

            return result;
        } catch (error) {
            console.error('Refund error:', error);
            throw error;
        }
    };

    // Show loading state while checking auth
    if (authStatus.checking) {
        return <LoadingSpinner />;
    }

    // Show 401 Unauthorized page (Not authenticated)
    if (!authStatus.isAuthenticated) {
        return <UnauthorizedPage />;
    }

    // Show 403 Forbidden page (Authenticated but not admin)
    if (!authStatus.isAuthorized) {
        return <ForbiddenPage />;
    }

    // Show loading state for data
    if (loading && payments.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-black h-full text-neutral-100 p-4 sm:p-6">
            <Suspense fallback={null}>
                {snackbar.open && (
                    <Snackbar message={snackbar.message} type={snackbar.type} />
                )}
            </Suspense>

            {/* Filters - Load only when icons are ready */}
            {iconsLoaded && (
                <Suspense fallback={<div className="h-16 bg-neutral-800 rounded-xl animate-pulse mb-8" />}>
                    <PaymentFilters
                        filters={filters}
                        setFilters={setFilters}
                        loading={loading}
                        exportLoading={exportLoading}
                        onRefresh={fetchPayments}
                        onExport={exportToCSV}
                    />
                </Suspense>
            )}

            {/* Table - Load with payments data */}
            <Suspense fallback={<div className="h-64 bg-neutral-800 rounded-xl animate-pulse" />}>
                <PaymentsTable
                    payments={filteredPayments}
                    loading={loading}
                    filters={filters}
                    onViewDetails={setPaymentDetails}
                    onRefund={handleRefund}
                />
            </Suspense>

            {/* Modal - Only load when needed */}
            {paymentDetails.open && (
                <Suspense fallback={null}>
                    <PaymentDetailsModal
                        payment={paymentDetails.payment}
                        onClose={() => setPaymentDetails({ open: false, payment: null })}
                    />
                </Suspense>
            )}
        </div>
    );
};

export default PaymentManagement;