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
    faHourglassHalf,
    faSpinner,
    faIndianRupee,
    faShieldAlt,
    faCloudUploadAlt,
    faSync,
    faCreditCard,
    faReceipt,
    faInfoCircle,
    faChartLine
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

    // Fetch booking details
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

    // Handle booking cancellation
    const handleCancelBooking = async () => {
        try {
            const response = await fetch(`/api/dashboard/bookings/${bookingId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to cancel booking');
            }

            const data = await response.json();

            // Update local booking state
            setBooking(prev => ({
                ...prev,
                status: 'cancelled'
            }));

            return data;
        } catch (error) {
            console.error('Error cancelling booking:', error);
            throw error;
        }
    };

    // Handle document upload success
    const handleDocumentUploadSuccess = async () => {
        await fetchBookingDetails();
    };

    const getProgress = () => {
        if (!booking) return 0;
        if (booking.status === "pending") return 50;
        if (booking.status === "confirmed" && booking.paymentStatus !== "paid") return 90;
        if (booking.paymentStatus === "paid") return 100;
        return 0;
    };

    const getStatusColor = (status) => {
        return {
            pending: "text-yellow-400",
            confirmed: "text-green-400",
            cancelled: "text-red-400",
            expired: "text-gray-500",
        }[status] || "text-gray-400";
    };

    const getPaymentColor = (status) => {
        return {
            unpaid: "text-red-400",
            paid: "text-green-400",
        }[status] || "text-gray-400";
    };

    const getVerificationStatus = () => {
        if (!booking?.document_verification) return null;
        const status = booking.document_verification.status;
        return {
            in_progress: { text: "text-yellow-400", bg: "bg-yellow-500/10", icon: faSpinner, label: "IN PROGRESS" },
            verified: { text: "text-green-400", bg: "bg-green-500/10", icon: faCheckCircle, label: "VERIFIED" },
            rejected: { text: "text-red-400", bg: "bg-red-500/10", icon: faExclamationTriangle, label: "REJECTED" }
        }[status] || { text: "text-gray-400", bg: "bg-gray-500/10", icon: faClock, label: "PENDING" };
    };

    useEffect(() => {
        if (bookingId) {
            fetchBookingDetails();
        }
    }, [bookingId]);

    // Skeleton Loading Component
    const Skeleton = () => (
        <div className="min-h-screen bg-black">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <div className="h-10 w-32 bg-gray-800 rounded animate-pulse mb-4"></div>
                    <div className="h-8 w-64 bg-gray-800 rounded animate-pulse"></div>
                </div>

                {/* Progress Bar Skeleton */}
                <div className="bg-gray-900 rounded-lg p-6 mb-6">
                    <div className="h-5 w-32 bg-gray-800 rounded animate-pulse mb-4"></div>
                    <div className="h-2 bg-gray-800 rounded animate-pulse"></div>
                </div>

                {/* Main Details Skeleton */}
                <div className="bg-gray-900 rounded-lg p-6 mb-6">
                    <div className="h-7 w-48 bg-gray-800 rounded animate-pulse mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-gray-800/50 rounded-lg p-4">
                                <div className="h-4 w-20 bg-gray-700 rounded animate-pulse mb-2"></div>
                                <div className="h-5 w-32 bg-gray-700 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Document Section Skeleton */}
                <div className="bg-gray-900 rounded-lg p-6">
                    <div className="h-6 w-40 bg-gray-800 rounded animate-pulse mb-4"></div>
                    <div className="h-20 bg-gray-800/50 rounded animate-pulse"></div>
                </div>
            </div>
        </div>
    );

    if (loading) return <Skeleton />;

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error || 'Booking not found'}</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const verificationStatus = getVerificationStatus();
    const progress = getProgress();

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-gray-400 hover:text-teal-400 transition mb-4 inline-flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Back to Dashboard
                    </button>

                    <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                <FontAwesomeIcon icon={faReceipt} />
                                <span>#{booking.id}</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                <FontAwesomeIcon icon={faInfoCircle} className="text-teal-500" />
                                Booking Details
                            </h1>
                        </div>

                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)} bg-gray-800`}>
                            {booking.status?.toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Progress Section */}
                <div className="bg-gray-900 rounded-lg p-6 mb-6">
                    <h2 className="text-gray-300 text-sm mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faChartLine} className="text-teal-500" />
                        Booking Progress
                    </h2>
                    <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="absolute left-0 top-0 h-full bg-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-3">
                        <span className="text-xs text-gray-500">
                            {progress === 100 ? 'Complete' : progress >= 90 ? 'Almost there' : 'In progress'}
                        </span>
                        <span className="text-xs font-semibold text-teal-500">{progress}%</span>
                    </div>
                </div>

                {/* Main Details */}
                <div className="bg-gray-900 rounded-lg p-6 mb-6">
                    <h2 className="text-xl text-teal-500 font-semibold mb-4 flex items-center gap-2">
                        <FontAwesomeIcon icon={faBed} />
                        {booking.apartment_title || booking.apartment}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                <FontAwesomeIcon icon={faCalendar} />
                                <span>Check-in</span>
                            </div>
                            <p className="text-white font-semibold">
                                {new Date(booking.start_date || booking.checkIn).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                <FontAwesomeIcon icon={faCalendar} />
                                <span>Check-out</span>
                            </div>
                            <p className="text-white font-semibold">
                                {new Date(booking.end_date || booking.checkOut).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                <FontAwesomeIcon icon={faClock} />
                                <span>Nights</span>
                            </div>
                            <p className="text-white font-semibold">{booking.nights}</p>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                <FontAwesomeIcon icon={faUsers} />
                                <span>Guests</span>
                            </div>
                            <p className="text-white font-semibold">{booking.guests}</p>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                <FontAwesomeIcon icon={faClock} />
                                <span>Booked On</span>
                            </div>
                            <p className="text-white font-semibold">
                                {new Date(booking.created_at).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                <FontAwesomeIcon icon={faTag} />
                                <span>Status</span>
                            </div>
                            <p className={`font-semibold ${getStatusColor(booking.status)}`}>
                                {booking.status?.toUpperCase()}
                            </p>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                <FontAwesomeIcon icon={faCreditCard} />
                                <span>Payment</span>
                            </div>
                            <p className={`font-semibold ${getPaymentColor(booking.paymentStatus)}`}>
                                {booking.paymentStatus?.toUpperCase() || "UNPAID"}
                            </p>
                        </div>

                        <div className="md:col-span-2 bg-teal-500/10 rounded-lg p-4 border border-teal-500/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FontAwesomeIcon icon={faIndianRupee} className="text-teal-500 text-xl" />
                                    <div>
                                        <p className="text-xs text-gray-400">Total Amount</p>
                                        <p className="text-2xl font-bold text-teal-500">₹{booking.total_amount || booking.total}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Guest Details */}
                {booking.guest_details && booking.guest_details.length > 0 && (
                    <div className="bg-gray-900 rounded-lg p-6 mb-6">
                        <h2 className="text-gray-300 text-lg font-semibold mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faUsers} className="text-teal-500" />
                            Guest Details
                        </h2>
                        <div className="space-y-3">
                            {booking.guest_details.map((guest, index) => (
                                <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
                                            {guest.name?.charAt(0)?.toUpperCase() || "G"}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-semibold">{guest.name}</p>
                                            <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-400">
                                                <span>Age: {guest.age}</span>
                                                <span>{guest.gender}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                                                <FontAwesomeIcon icon={faPhone} />
                                                <span>{guest.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Document Verification */}
                {booking.document_verification && (
                    <div className="bg-gray-900 rounded-lg p-6 mb-6">
                        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faShieldAlt} className="text-teal-500" />
                                <h2 className="text-gray-300 text-lg font-semibold">Document Verification</h2>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${verificationStatus.text} ${verificationStatus.bg}`}>
                                <FontAwesomeIcon icon={verificationStatus.icon} className="mr-1" spin={verificationStatus.label === "IN PROGRESS"} />
                                {verificationStatus.label}
                            </div>
                        </div>

                        {booking.document_verification.status === "rejected" && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                <div className="flex justify-between items-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400" />
                                        <div>
                                            <p className="text-white font-medium">Document Rejected</p>
                                            <p className="text-gray-400 text-sm">Please upload a new document to continue</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowVerificationModal(true)}
                                        disabled={isUploading}
                                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <FontAwesomeIcon icon={isUploading ? faSpinner : faCloudUploadAlt} spin={isUploading} />
                                        {isUploading ? 'Uploading...' : 'Re-upload'}
                                    </button>
                                </div>
                                {booking.document_verification.reviewMessage && (
                                    <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Reviewer's Note</p>
                                        <p className="text-sm text-gray-300">{booking.document_verification.reviewMessage}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {booking.document_verification.status === "in_progress" && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FontAwesomeIcon icon={faSync} spin className="text-yellow-400" />
                                    <div>
                                        <p className="text-white font-medium">Verification in Progress</p>
                                        <p className="text-gray-400 text-sm">Your document is being reviewed</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {booking.document_verification.status === "verified" && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" />
                                    <div>
                                        <p className="text-white font-medium">Document Verified</p>
                                        <p className="text-gray-400 text-sm">Your document has been approved</p>
                                    </div>
                                </div>
                                <span className="text-xs text-green-400 font-medium">✓ Approved</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between gap-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Back
                    </button>

                    {booking.status !== "cancelled" && booking.status !== "expired" && (
                        <button
                            onClick={handleCancelBooking}
                            className="px-6 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faBan} />
                            Cancel Booking
                        </button>
                    )}
                </div>
            </div>

            {/* Verification Modal */}
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