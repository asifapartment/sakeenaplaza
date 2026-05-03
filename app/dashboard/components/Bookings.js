'use client';
import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faFilter,
    faBan,
    faEnvelope,
    faCreditCard,
    faTrash,
    faCalendar,
    faRupeeSign,
    faTimes,
    faCheck,
    faExclamationTriangle,
    faCalendarAlt,
    faXmark
} from '@fortawesome/free-solid-svg-icons';
import FilterPills from './FilterPills';
import BookingCard from './BookingCard';
import { loadRazorpay } from '@/utils/razorpay';
import BookingInfoModal from './BookingInfoModal';

// Skeleton Loading Component
const BookingCardSkeleton = () => {
    return (
        <div className="relative bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 rounded-2xl p-5 animate-pulse">
            {/* Status Badge Skeleton */}
            <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-20 bg-neutral-700 rounded-full"></div>
                <div className="h-8 w-8 bg-neutral-700 rounded-lg"></div>
            </div>

            {/* Apartment Name Skeleton */}
            <div className="h-6 w-3/4 bg-neutral-700 rounded-lg mb-2"></div>

            {/* Guest Info Skeleton */}
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

            {/* Date Section Skeleton */}
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

            {/* Price Skeleton */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="h-3 w-20 bg-neutral-700 rounded mb-1"></div>
                    <div className="h-5 w-24 bg-neutral-700 rounded"></div>
                </div>
                <div className="h-9 w-24 bg-neutral-700 rounded-lg"></div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-2">
                <div className="flex-1 h-10 bg-neutral-700 rounded-xl"></div>
                <div className="flex-1 h-10 bg-neutral-700 rounded-xl"></div>
                <div className="w-10 h-10 bg-neutral-700 rounded-xl"></div>
            </div>
        </div>
    );
};

// Skeleton for Search and Filter Bar
const SearchFilterSkeleton = () => {
    return (
        <div className="flex flex-col lg:flex-row gap-4 mt-6 animate-pulse">
            {/* Search Input Skeleton */}
            <div className="flex-1">
                <div className="w-full h-12 bg-neutral-800/50 rounded-xl"></div>
            </div>

            {/* Date Range Button Skeleton */}
            <div className="w-40 h-12 bg-neutral-800/50 rounded-xl"></div>
        </div>
    );
};

// Skeleton for Filter Pills
const FilterPillsSkeleton = () => {
    return (
        <div className="flex flex-wrap gap-2 mb-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="h-9 w-20 bg-neutral-800/50 rounded-full"></div>
            ))}
        </div>
    );
};

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [resendMessage, setResendMessage] = useState('');
    const [paymentMessage, setPaymentMessage] = useState('');
    // 1. Add a state for document uploads (optional, if you need to track upload status globally)
    const [uploadingDocuments, setUploadingDocuments] = useState({});

    // 2. Update the handleDocumentUploadSuccess function
    const handleDocumentUploadSuccess = (bookingId) => {
        // Update the specific booking's document status
        setBookings(prev => prev.map(booking =>
            booking.id === bookingId
                ? {
                    ...booking,
                    document_verification: {
                        ...booking.document_verification,
                        status: "in_progress",
                        reviewMessage: null // Clear any rejection messages
                    }
                }
                : booking
        ));

        // Also update selectedBooking if it's the same booking
        if (selectedBooking && selectedBooking.id === bookingId) {
            setSelectedBooking(prev => ({
                ...prev,
                document_verification: {
                    ...prev.document_verification,
                    status: "in_progress",
                    reviewMessage: null
                }
            }));
        }
    };

    // 3. Add handlers for upload start/end (optional for loading states)
    const handleDocumentUploadStart = (bookingId) => {
        setUploadingDocuments(prev => ({
            ...prev,
            [bookingId]: true
        }));
    };

    const handleDocumentUploadEnd = (bookingId) => {
        setUploadingDocuments(prev => ({
            ...prev,
            [bookingId]: false
        }));
    };
    // Date range filter
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Initialize Razorpay
    useEffect(() => {
        loadRazorpay();
    }, []);

    // Fetch bookings
    const fetchBookings = useCallback(async () => {
        try {
            const res = await fetch('/api/dashboard/bookings', {
                method: 'GET',
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setBookings(data.bookings || []);
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Optimized booking update (single booking update)
    const updateBookingInState = (bookingId, updates) => {
        setBookings(prev => prev.map(booking =>
            booking.id === bookingId ? { ...booking, ...updates } : booking
        ));
    };

    // Cancel booking with optimistic update
    const handleCancelBooking = async (booking) => {
        if (!confirm(`Are you sure you want to cancel booking #${booking.id}?`)) return;

        // Optimistic update
        updateBookingInState(booking.id, { status: 'cancelled' });

        try {
            const res = await fetch('/api/bookings/cancel', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ booking_id: booking.id }),
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                // Revert on failure
                updateBookingInState(booking.id, { status: booking.status });
                setPaymentMessage(`❌ Failed to cancel booking: ${result.error}`);
            } else {
                setPaymentMessage(`✅ Booking #${booking.id} cancelled successfully`);
            }
        } catch (error) {
            // Revert on error
            updateBookingInState(booking.id, { status: booking.status });
            setPaymentMessage('❌ Failed to cancel booking. Please try again.');
        }
    };

    // Resend email
    const handleResendEmail = async (booking) => {
        try {
            const res = await fetch("/api/notify/to-admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    bookingId: booking.id,
                    customerName: booking.guestName,
                    customerEmail: booking.guestEmail,
                    apartmentName: booking.apartment,
                    checkIn: booking.checkIn,
                    checkOut: booking.checkOut,
                    totalPrice: booking.total,
                }),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                setResendMessage(`✅ Email resent successfully for Booking #${booking.id}`);
            } else {
                setResendMessage(`⚠️ ${result.error || "Could not resend email"}`);
            }
        } catch (error) {
            setResendMessage("❌ Failed to resend email. Try again later.");
        }
    };

    // Date range filter functions
    const handleDateRangeApply = () => {
        setShowDatePicker(false);
    };

    const handleDateRangeClear = () => {
        setDateRange({ startDate: '', endDate: '' });
        setShowDatePicker(false);
    };

    const isDateInRange = (dateString, startDate, endDate) => {
        if (!startDate && !endDate) return true;
        const date = new Date(dateString);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && end) return date >= start && date <= end;
        if (start) return date >= start;
        if (end) return date <= end;
        return true;
    };

    // Filter bookings
    const filteredBookings = bookings.filter((booking) => {
        if (!booking || typeof booking !== 'object') return false;

        // Filter by status
        const matchesFilter = filter === 'all' || booking.status === filter;

        // Normalize search
        const searchLower = searchTerm.toLowerCase();

        // Filter by search term (ID + existing fields)
        const matchesSearch =
            !searchLower ||
            (booking.id && booking.id.toString().toLowerCase().includes(searchLower)) ||
            (booking.bookingId && booking.bookingId.toLowerCase().includes(searchLower)) ||
            (booking.apartment && booking.apartment.toLowerCase().includes(searchLower)) ||
            (booking.guestName && booking.guestName.toLowerCase().includes(searchLower));

        // Filter by date range
        const matchesDateRange =
            isDateInRange(booking.checkIn, dateRange.startDate, dateRange.endDate) ||
            isDateInRange(booking.checkOut, dateRange.startDate, dateRange.endDate);

        return matchesFilter && matchesSearch && matchesDateRange;
    });
    

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'pending', label: 'Pending' },
        { id: 'confirmed', label: 'Confirmed' },
        { id: 'cancelled', label: 'Cancelled' },
        { id: 'ongoing', label: 'Ongoing' },
        { id: 'expired', label: 'Expired' },
    ];

    // Loading skeleton for the entire page
    if (loading) {
        return (
            <div className="min-h-screen bg-black p-6">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <div className="h-8 w-48 bg-neutral-800 rounded-lg mb-2 animate-pulse"></div>
                            <div className="h-4 w-64 bg-neutral-800 rounded animate-pulse"></div>
                        </div>
                        <div className="h-9 w-24 bg-neutral-800 rounded-xl animate-pulse"></div>
                    </div>

                    {/* Search and Filter Skeleton */}
                    <SearchFilterSkeleton />
                </div>

                {/* Filter Pills Skeleton */}
                <FilterPillsSkeleton />

                {/* Bookings Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[...Array(8)].map((_, i) => (
                        <BookingCardSkeleton key={i} />
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

    return (
        <div className="min-h-screen bg-black p-6">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">
                            Bookings
                        </h1>
                        <p className="text-neutral-400 mt-1">
                            Manage and track all your property reservations
                        </p>
                    </div>
                    <div className="text-sm px-4 py-2 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
                        <span className="text-neutral-400">Total: </span>
                        <span className="text-teal-400 font-semibold">{bookings.length}</span>
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
                            placeholder="Search by apartment or guest name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="relative w-full pl-12 pr-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-xl focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:outline-none text-neutral-100 placeholder-neutral-500 transition-all"
                        />
                    </div>

                    {/* Date Range Filter */}
                    <div className="relative">
                        <button
                            className="flex items-center gap-2 px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-xl hover:bg-neutral-800 hover:border-teal-500/30 text-neutral-200 transition-all group"
                            onClick={() => setShowDatePicker(!showDatePicker)}
                        >
                            <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="text-neutral-400 group-hover:text-teal-400 transition-colors"
                            />
                            <span>Date Range</span>
                            {(dateRange.startDate || dateRange.endDate) && (
                                <span className="ml-1 px-2 py-1 text-xs bg-teal-500/20 text-teal-300 rounded-full">
                                    Active
                                </span>
                            )}
                        </button>

                        {showDatePicker && (
                            <div className="absolute top-full right-0 mt-2 bg-neutral-800 border border-neutral-700 rounded-xl p-5 shadow-2xl shadow-black/50 backdrop-blur-sm z-50 min-w-96 animate-fadeIn">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-neutral-100">Select Date Range</h3>
                                    <button
                                        onClick={() => setShowDatePicker(false)}
                                        className="p-1 hover:bg-neutral-700 rounded-lg transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faXmark} className="text-neutral-400" />
                                    </button>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">From Date</label>
                                        <div className="relative">
                                            <FontAwesomeIcon
                                                icon={faCalendar}
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
                                            />
                                            <input
                                                type="date"
                                                value={dateRange.startDate}
                                                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                                className="w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">To Date</label>
                                        <div className="relative">
                                            <FontAwesomeIcon
                                                icon={faCalendar}
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
                                            />
                                            <input
                                                type="date"
                                                value={dateRange.endDate}
                                                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                                className="w-full pl-10 pr-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDateRangeClear}
                                        className="flex-1 px-4 py-2.5 bg-neutral-700/50 hover:bg-neutral-700 border border-neutral-600 text-neutral-300 rounded-lg transition-colors font-medium"
                                    >
                                        Clear All
                                    </button>
                                    <button
                                        onClick={handleDateRangeApply}
                                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white rounded-lg transition-all font-medium shadow-lg shadow-teal-500/20"
                                    >
                                        Apply Filter
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Active Filters Display */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <FilterPills filters={filters} activeFilter={filter} onFilterChange={setFilter} />

                {(dateRange.startDate || dateRange.endDate) && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-teal-500/10 to-transparent border border-teal-500/20 rounded-full px-4 py-2 animate-fadeIn">
                        <FontAwesomeIcon icon={faFilter} className="text-teal-400 text-sm" />
                        <span className="text-teal-300 text-sm font-medium">
                            {dateRange.startDate && dateRange.endDate
                                ? `${dateRange.startDate} → ${dateRange.endDate}`
                                : dateRange.startDate
                                    ? `From ${dateRange.startDate}`
                                    : `Until ${dateRange.endDate}`}
                        </span>
                        <button
                            onClick={handleDateRangeClear}
                            className="ml-2 p-1 hover:bg-teal-500/20 rounded-full transition-colors"
                        >
                            <FontAwesomeIcon icon={faTimes} className="text-teal-400 text-xs" />
                        </button>
                    </div>
                )}
            </div>

            {/* Bookings Grid */}
            {filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-neutral-800/30 border-2 border-dashed border-neutral-700/50 rounded-2xl">
                    <div className="w-20 h-20 mb-4 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-full flex items-center justify-center border border-neutral-700/50">
                        <FontAwesomeIcon icon={faCalendar} className="text-3xl text-neutral-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-200 mb-2">No bookings found</h3>
                    <p className="text-neutral-400 text-center max-w-md">
                        {searchTerm || dateRange.startDate || dateRange.endDate || filter !== 'all'
                            ? 'Try adjusting your filters or search term'
                            : 'No bookings available yet'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredBookings.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            onViewDetails={() => {
                                setSelectedBooking(booking);
                                setShowInfoModal(true);
                            }}
                            onCancel={handleCancelBooking}
                            onResendEmail={handleResendEmail}
                            updateBookingInState={updateBookingInState}
                        />
                    ))}
                </div>
            )}

            {/* Toast Messages */}
            {resendMessage && (
                <div className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-emerald-900/90 to-emerald-800/90 border border-emerald-700/50 backdrop-blur-sm rounded-xl text-emerald-100 shadow-2xl shadow-black/50 max-w-sm animate-slideIn">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <FontAwesomeIcon icon={faCheck} className="text-emerald-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{resendMessage}</p>
                        </div>
                        <button
                            onClick={() => setResendMessage('')}
                            className="p-1 hover:bg-emerald-700/50 rounded-lg transition-colors"
                        >
                            <FontAwesomeIcon icon={faTimes} className="text-sm" />
                        </button>
                    </div>
                </div>
            )}

            {paymentMessage && (
                <div className="fixed bottom-6 left-6 p-4 bg-gradient-to-r from-rose-900/90 to-rose-800/90 border border-rose-700/50 backdrop-blur-sm rounded-xl text-rose-100 shadow-2xl shadow-black/50 max-w-sm animate-slideIn">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-500/20 rounded-lg">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-rose-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{paymentMessage}</p>
                        </div>
                        <button
                            onClick={() => setPaymentMessage('')}
                            className="p-1 hover:bg-rose-700/50 rounded-lg transition-colors"
                        >
                            <FontAwesomeIcon icon={faTimes} className="text-sm" />
                        </button>
                    </div>
                </div>
            )}

            {/* Booking Info Modal */}
            <BookingInfoModal
                booking={selectedBooking}
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                onCancel={handleCancelBooking}
                onDelete={() => { }}
                updateBookingInState={updateBookingInState}
                onDocumentUploadSuccess={handleDocumentUploadSuccess}
                onDocumentUploadStart={handleDocumentUploadStart}
                onDocumentUploadEnd={handleDocumentUploadEnd}
            />

            {/* Animated Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neutral-800/5 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}