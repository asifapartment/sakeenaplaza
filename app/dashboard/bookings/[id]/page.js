'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faCalendar,
    faClock,
    faCheckCircle,
    faExclamationTriangle,
    faBan,
    faUser,
    faUsers,
    faBed,
    faTag,
    faPhone,
    faSpinner,
    faIndianRupee,
    faShieldAlt,
    faCloudUploadAlt,
    faSync,
    faCreditCard,
    faReceipt,
    faInfoCircle,
    faChartLine,
    faLocationDot,
    faBath,
    faDoorOpen,
    faCalendarCheck,
    faMoneyBillWave,
    faIdCard,
    faHourglassHalf,
    faBuilding,
    faCheck,
    faTimes
} from "@fortawesome/free-solid-svg-icons";
import VerificationModal from '@/app/booking/[id]/components/VerificationModal';

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.id;

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const fetchBookingDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/dashboard/bookings/${bookingId}`);
            if (!response.ok) {
                if (response.status === 401) {
                    router.push('/login');
                    return;
                }
                throw new Error('Failed to fetch booking details');
            }
            const data = await response.json();
            setBooking(data);
        } catch (err) {
            console.error('Error fetching booking:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        try {
            const response = await fetch(`/api/dashboard/bookings/${bookingId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error('Failed to cancel booking');
            const data = await response.json();
            setBooking(prev => ({ ...prev, status: 'cancelled' }));
            return data;
        } catch (error) {
            console.error('Error cancelling booking:', error);
            throw error;
        }
    };

    const handleDocumentUploadSuccess = async () => {
        await fetchBookingDetails();
    };

    const getProgress = () => {
        if (!booking) return 0;
        if (booking.status === 'pending') return 50;
        if (booking.status === 'confirmed' && booking.payment_status !== 'paid') return 90;
        if (booking.payment_status === 'paid') return 100;
        return 0;
    };

    const getStatusInfo = () => {
        if (!booking) return { text: 'text-neutral-400', border: 'border-neutral-600', bg: 'bg-neutral-800/50', icon: faInfoCircle };
        switch (booking.status) {
            case 'confirmed':
                return { text: 'text-teal-400', border: 'border-teal-500/50', bg: 'bg-teal-500/10', icon: faCheckCircle };
            case 'pending':
                return { text: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-500/10', icon: faClock };
            case 'cancelled':
                return { text: 'text-red-400', border: 'border-red-500/50', bg: 'bg-red-500/10', icon: faBan };
            case 'expired':
                return { text: 'text-neutral-400', border: 'border-neutral-600', bg: 'bg-neutral-800/50', icon: faHourglassHalf };
            default:
                return { text: 'text-neutral-400', border: 'border-neutral-600', bg: 'bg-neutral-800/50', icon: faInfoCircle };
        }
    };

    useEffect(() => {
        if (bookingId) fetchBookingDetails();
    }, [bookingId]);

    const Skeleton = () => (
        <div className="min-h-screen bg-black">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 rounded-lg border border-neutral-800">
                        <div className="h-4 w-4 bg-neutral-700 rounded animate-pulse"></div>
                        <div className="h-4 w-12 bg-neutral-700 rounded animate-pulse"></div>
                    </div>

                    <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-4 w-4 bg-neutral-700 rounded animate-pulse"></div>
                                <div className="h-4 w-32 bg-neutral-700 rounded animate-pulse"></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-teal-500/20 rounded-lg animate-pulse"></div>
                                <div className="h-8 w-48 bg-neutral-700 rounded animate-pulse"></div>
                            </div>
                        </div>
                        <div className="h-8 w-24 bg-neutral-800 rounded-full animate-pulse border border-neutral-800"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Left Side Skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Apartment Info Card Skeleton */}
                        <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-teal-500/20 rounded-lg animate-pulse"></div>
                                    <div className="h-6 w-48 bg-neutral-700 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-4 w-4 bg-neutral-700 rounded animate-pulse"></div>
                                <div className="h-4 w-32 bg-neutral-700 rounded animate-pulse"></div>
                            </div>
                            <div className="mb-4">
                                <div className="h-4 w-full bg-neutral-700 rounded animate-pulse mb-2"></div>
                                <div className="h-4 w-3/4 bg-neutral-700 rounded animate-pulse"></div>
                            </div>
                            <div className="flex flex-wrap gap-4 pt-3 border-t border-neutral-800">
                                <div className="h-8 w-32 bg-neutral-800 rounded-lg animate-pulse"></div>
                                <div className="h-8 w-32 bg-neutral-800 rounded-lg animate-pulse"></div>
                            </div>
                        </div>

                        {/* Booking Dates Card Skeleton */}
                        <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-teal-500/20 rounded-lg animate-pulse"></div>
                                <div className="h-6 w-32 bg-neutral-700 rounded animate-pulse"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
                                    <div className="h-3 w-16 bg-neutral-700 rounded animate-pulse mb-2"></div>
                                    <div className="h-6 w-40 bg-neutral-700 rounded animate-pulse mb-2"></div>
                                    <div className="flex items-center gap-1 mt-2">
                                        <div className="h-3 w-3 bg-neutral-700 rounded animate-pulse"></div>
                                        <div className="h-3 w-20 bg-neutral-700 rounded animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
                                    <div className="h-3 w-16 bg-neutral-700 rounded animate-pulse mb-2"></div>
                                    <div className="h-6 w-40 bg-neutral-700 rounded animate-pulse mb-2"></div>
                                    <div className="flex items-center gap-1 mt-2">
                                        <div className="h-3 w-3 bg-neutral-700 rounded animate-pulse"></div>
                                        <div className="h-3 w-20 bg-neutral-700 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 p-4 bg-teal-500/10 rounded-xl border border-teal-500/20">
                                <div className="flex justify-between items-center">
                                    <div className="h-4 w-24 bg-neutral-700 rounded animate-pulse"></div>
                                    <div className="h-6 w-32 bg-neutral-700 rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* Guest Details Card Skeleton */}
                        <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-teal-500/20 rounded-lg animate-pulse"></div>
                                <div className="h-6 w-32 bg-neutral-700 rounded animate-pulse"></div>
                                <div className="h-4 w-20 bg-neutral-700 rounded animate-pulse"></div>
                            </div>
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 bg-teal-500/20 rounded-xl animate-pulse"></div>
                                            <div className="flex-1">
                                                <div className="h-5 w-32 bg-neutral-700 rounded animate-pulse mb-2"></div>
                                                <div className="flex flex-wrap gap-4 mt-2">
                                                    <div className="h-4 w-24 bg-neutral-700 rounded animate-pulse"></div>
                                                    <div className="h-4 w-24 bg-neutral-700 rounded animate-pulse"></div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="h-3 w-3 bg-neutral-700 rounded animate-pulse"></div>
                                                    <div className="h-3 w-32 bg-neutral-700 rounded animate-pulse"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Right Side Skeleton */}
                    <div className="space-y-6">
                        {/* Price Summary Card Skeleton */}
                        <div className="bg-neutral-950 rounded-2xl border border-teal-500/30 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-teal-500/20 rounded-lg animate-pulse"></div>
                                <div className="h-6 w-32 bg-neutral-700 rounded animate-pulse"></div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <div className="h-4 w-32 bg-neutral-700 rounded animate-pulse"></div>
                                    <div className="h-4 w-24 bg-neutral-700 rounded animate-pulse"></div>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-teal-500/20">
                                    <div className="h-5 w-24 bg-neutral-700 rounded animate-pulse"></div>
                                    <div className="h-8 w-32 bg-neutral-700 rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Status Card Skeleton */}
                        <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-teal-500/20 rounded-lg animate-pulse"></div>
                                <div className="h-6 w-32 bg-neutral-700 rounded animate-pulse"></div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-neutral-900">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <div className="h-5 w-5 bg-neutral-700 rounded animate-pulse"></div>
                                    <div className="h-5 w-20 bg-neutral-700 rounded animate-pulse"></div>
                                </div>
                                <div className="h-4 w-32 mx-auto bg-neutral-700 rounded animate-pulse"></div>
                            </div>
                        </div>

                        {/* Progress Card Skeleton */}
                        <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-teal-500/20 rounded-lg animate-pulse"></div>
                                <div className="h-6 w-32 bg-neutral-700 rounded animate-pulse"></div>
                            </div>
                            <div className="relative w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
                                <div className="absolute left-0 top-0 h-full bg-teal-500 rounded-full w-1/2 animate-pulse"></div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <div className="h-4 w-20 bg-neutral-700 rounded animate-pulse"></div>
                                <div className="h-4 w-24 bg-neutral-700 rounded animate-pulse"></div>
                            </div>
                        </div>

                        {/* Document Verification Card Skeleton */}
                        <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-teal-500/20 rounded-lg animate-pulse"></div>
                                    <div className="h-6 w-32 bg-neutral-700 rounded animate-pulse"></div>
                                </div>
                                <div className="h-6 w-24 bg-neutral-800 rounded-full animate-pulse"></div>
                            </div>
                            <div className="h-12 w-full bg-neutral-800 rounded-xl animate-pulse"></div>
                        </div>

                        {/* Action Button Skeleton */}
                        <div className="h-12 w-full bg-neutral-800 rounded-xl animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) return <Skeleton />;
    if (error || !booking) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center bg-neutral-950 rounded-2xl border border-neutral-800 p-8 max-w-md">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400 text-5xl mb-4" />
                    <p className="text-red-400 mb-4">{error || 'Booking not found'}</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-300 shadow-lg"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const progress = getProgress();
    const statusInfo = getStatusInfo();

    return (
        <div className="min-h-screen bg-black">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-neutral-500 text-sm mb-2">
                                <FontAwesomeIcon icon={faReceipt} />
                                <span className="font-mono">Booking ID: #{booking.id}</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
                                <FontAwesomeIcon icon={faCalendarCheck} className="text-teal-500" />
                                Booking Details
                            </h1>
                            <button
                                onClick={() => router.back()}
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-neutral-400 hover:text-white transition-colors duration-200 bg-neutral-900 rounded-lg border border-neutral-800 hover:border-neutral-600"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
                                <span>Back</span>
                            </button>
                        </div>

                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${statusInfo.text} ${statusInfo.border} ${statusInfo.bg}`}>
                            <FontAwesomeIcon icon={statusInfo.icon} className="text-sm" />
                            <span>{booking.status?.toUpperCase()}</span>
                        </div>

                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Left Side */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Apartment Info Card */}
                        <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <h2 className="text-xl font-semibold text-neutral-200 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
                                        <FontAwesomeIcon icon={faBed} className="text-teal-400 text-sm" />
                                    </div>
                                    {booking.apartment_title}
                                </h2>
                            </div>

                            <div className="flex items-center gap-2 text-neutral-400 text-sm mb-4">
                                <FontAwesomeIcon icon={faLocationDot} className="text-teal-400" />
                                <span>{booking.apartment_location}</span>
                            </div>

                            {booking.apartment_description && (
                                <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                                    {booking.apartment_description}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-4 pt-3 border-t border-neutral-800">
                                <div className="flex items-center gap-2 text-neutral-300 text-sm bg-neutral-800/50 px-3 py-1.5 rounded-lg">
                                    <FontAwesomeIcon icon={faUsers} className="text-teal-400" />
                                    <span>Max {booking.max_guests} guests</span>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-300 text-sm bg-neutral-800/50 px-3 py-1.5 rounded-lg">
                                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-teal-400" />
                                    <span>₹{booking.price_per_night}/night</span>
                                </div>
                            </div>
                        </div>

                        <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
                            {/* Booking Dates Card */}
                            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                                <h2 className="text-neutral-200 font-semibold mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
                                        <FontAwesomeIcon icon={faCalendar} className="text-teal-400 text-sm" />
                                    </div>
                                    Stay Period
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800">
                                        <div className="text-neutral-500 text-xs mb-1">Check-in</div>
                                        <div className="text-white font-semibold text-lg">
                                            {new Date(booking.start_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-1 text-neutral-500 text-xs mt-2">
                                            <FontAwesomeIcon icon={faClock} className="text-teal-400" />
                                            <span>After 2:00 PM</span>
                                        </div>
                                    </div>
                                    <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800">
                                        <div className="text-neutral-500 text-xs mb-1">Check-out</div>
                                        <div className="text-white font-semibold text-lg">
                                            {new Date(booking.end_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-1 text-neutral-500 text-xs mt-2">
                                            <FontAwesomeIcon icon={faClock} className="text-teal-400" />
                                            <span>Before 11:00 AM</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-teal-500/10 rounded-xl border border-teal-500/20">
                                    <div className="flex justify-between items-center">
                                        <span className="text-neutral-300">Total Nights</span>
                                        <span className="text-teal-400 font-bold text-2xl">{booking.nights} <span className="text-sm">nights</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Guest Details Card */}
                            {booking.guest_details && booking.guest_details.length > 0 && (
                                <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                                    <h2 className="text-neutral-200 font-semibold mb-4 flex items-center gap-2">
                                        <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
                                            <FontAwesomeIcon icon={faUsers} className="text-teal-400 text-sm" />
                                        </div>
                                        Guest Details
                                        <span className="text-neutral-500 text-sm ml-2">({booking.guest_details.length} guest{booking.guest_details.length > 1 ? 's' : ''})</span>
                                    </h2>
                                    <div className="space-y-3">
                                        {booking.guest_details.map((guest, index) => (
                                            <div key={index} className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 hover:border-neutral-800 transition-all duration-300">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 font-bold text-lg">
                                                        {guest.name?.charAt(0)?.toUpperCase() || "G"}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-white font-semibold text-lg">{guest.name}</p>
                                                        <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                                            <span className="text-neutral-400">Age: <span className="text-white">{guest.age}</span></span>
                                                            <span className="text-neutral-400">Gender: <span className="text-white">{guest.gender}</span></span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2 text-neutral-500 text-sm">
                                                            <FontAwesomeIcon icon={faPhone} className="text-teal-400" />
                                                            <span>{guest.phone}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Right Side */}
                    <div className="space-y-6">
                        {/* Price Summary Card */}
                        <div className="bg-neutral-950 rounded-2xl border border-teal-500/30 p-6 shadow-sm sticky top-8">
                            <h2 className="text-neutral-200 font-semibold mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
                                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-teal-400 text-sm" />
                                </div>
                                Price Summary
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">₹{Number(booking.price_per_night).toLocaleString()} x {booking.nights} nights</span>
                                    <span className="text-white font-medium">₹{(Number(booking.price_per_night) * booking.nights).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-teal-500/20">
                                    <span className="text-neutral-200 font-semibold">Total Amount</span>
                                    <span className="text-teal-400 font-bold text-3xl">₹{Number(booking.total_amount).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Status Card */}
                        <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                            <h2 className="text-neutral-200 font-semibold mb-3 flex items-center gap-2">
                                <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
                                    <FontAwesomeIcon icon={faCreditCard} className="text-teal-400 text-sm" />
                                </div>
                                Payment Status
                            </h2>
                            <div className={`text-center p-4 rounded-xl ${booking.payment_status === 'paid' ? 'bg-teal-500/10 border border-teal-500/30' : 'bg-amber-500/10 border border-amber-500/30'
                                }`}>
                                <div className={`text-xl font-bold flex items-center justify-center gap-2 ${booking.payment_status === 'paid' ? 'text-teal-400' : 'text-amber-400'
                                    }`}>
                                    <FontAwesomeIcon icon={booking.payment_status === 'paid' ? faCheckCircle : faClock} />
                                    {booking.payment_status?.toUpperCase() || 'UNPAID'}
                                </div>
                                {booking.payment_method && (
                                    <div className="text-neutral-400 text-sm mt-2">Via {booking.payment_method}</div>
                                )}
                                {booking.payment_paid_at && (
                                    <div className="text-neutral-500 text-xs mt-2">
                                        Paid on {new Date(booking.payment_paid_at).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Progress Card */}
                        <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                            <h2 className="text-neutral-200 font-semibold mb-3 flex items-center gap-2">
                                <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
                                    <FontAwesomeIcon icon={faChartLine} className="text-teal-400 text-sm" />
                                </div>
                                Booking Progress
                            </h2>
                            <div className="relative w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
                                <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-neutral-500 text-sm">{progress}% Complete</span>
                                <span className="text-teal-400 text-sm font-medium">
                                    {progress === 100 ? 'Completed' : progress >= 90 ? 'Final Step' : 'In Progress'}
                                </span>
                            </div>
                        </div>

                        {/* Document Verification Card */}
                        {booking.document_status === 'rejected' && (
                            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-neutral-200 font-semibold flex items-center gap-2">
                                        <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
                                            <FontAwesomeIcon icon={faShieldAlt} className="text-teal-400 text-sm" />
                                        </div>
                                        ID Verification
                                    </h2>
                                    <div className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full ${booking.document_status === 'approved' ? 'text-teal-400 border border-teal-500/30 bg-teal-500/10' :
                                        booking.document_status === 'rejected' ? 'text-red-400 border border-red-500/30 bg-red-500/10' :
                                            'text-amber-400 border border-amber-500/30 bg-amber-500/10'
                                        }`}>
                                        <FontAwesomeIcon icon={
                                            booking.document_status === 'approved' ? faCheckCircle :
                                                booking.document_status === 'rejected' ? faTimes : faClock
                                        } className="text-xs" />
                                        <span>{booking.document_status === 'approved' ? 'Verified' :
                                            booking.document_status === 'rejected' ? 'Rejected' : 'Pending'}</span>
                                    </div>
                                </div>

                                {booking.document_status === 'rejected' && (
                                    <div className="mt-3">
                                        <button
                                            onClick={() => setShowVerificationModal(true)}
                                            disabled={isUploading}
                                            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                                        >
                                            <FontAwesomeIcon icon={isUploading ? faSpinner : faCloudUploadAlt} spin={isUploading} />
                                            {isUploading ? 'Uploading...' : 'Re-upload Document'}
                                        </button>
                                        {booking.review_message && (
                                            <p className="text-xs text-red-400/80 mt-2 flex items-center gap-1">
                                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                                {booking.review_message}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {(!booking.document_status || booking.document_status === 'pending') && (
                                    <button
                                        onClick={() => setShowVerificationModal(true)}
                                        className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <FontAwesomeIcon icon={faIdCard} />
                                        Upload ID Proof
                                    </button>
                                )}

                                {booking.document_status === 'approved' && (
                                    <div className="flex items-center gap-3 text-teal-400 bg-teal-500/10 p-3 rounded-xl justify-center border border-teal-500/30">
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-lg" />
                                        <span className="font-medium">Document Verified</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        {booking.status !== 'cancelled' && booking.status !== 'expired' && booking.status !== 'completed' && (
                            <button
                                onClick={handleCancelBooking}
                                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg"
                            >
                                <FontAwesomeIcon icon={faBan} />
                                Cancel Booking
                            </button>
                        )}

                        {booking.status === 'cancelled' && booking.cancelled_at && (
                            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6 text-center">
                                <FontAwesomeIcon icon={faHourglassHalf} className="text-neutral-600 text-3xl mb-3" />
                                <p className="text-neutral-500 text-sm">Cancelled on</p>
                                <p className="text-neutral-300 font-semibold text-lg">{new Date(booking.cancelled_at).toLocaleDateString()}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <VerificationModal
                isOpen={showVerificationModal}
                onClose={() => {
                    setShowVerificationModal(false);
                    setIsUploading(false);
                }}
                bookingId={booking.id}
                onUploadSuccess={handleDocumentUploadSuccess}
                onUploadStart={() => setIsUploading(true)}
                onUploadEnd={() => setIsUploading(false)}
            />
        </div>
    );
}