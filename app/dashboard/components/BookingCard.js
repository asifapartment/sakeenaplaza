'use client';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendar,
    faRupeeSign,
    faBan,
    faEnvelope,
    faCreditCard,
    faTrash,
    faEye,
    faUser,
    faHome,
    faUsers,
    faReceipt,
    faClock,
    faCheckCircle,
    faPaperPlane
} from '@fortawesome/free-solid-svg-icons';
import PaymentModal from './PaymentModal'; // Import the modal component

const getStatusColor = (status) => {
    const colors = {
        pending: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        confirmed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        cancelled: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        expired: "bg-neutral-500/20 text-neutral-300 border-neutral-500/40",
        ongoing: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    };
    return colors[status] || "bg-neutral-500/20 text-neutral-300 border-neutral-500/40";
};

const getStatusIcon = (status) => {
    const icons = {
        pending: faClock,
        confirmed: faCheckCircle,
        cancelled: faBan,
        expired: faClock,
        ongoing: faClock,
    };
    return icons[status] || faClock;
};

export default function BookingCard({
    booking,
    onViewDetails,
    onCancel,
    onResendEmail,
    updateBookingInState
}) {
    const [processingPayment, setProcessingPayment] = useState(false);
    const [resendingEmail, setResendingEmail] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [verificationMessage, setVerificationMessage] = useState('');
    const [paymentDetails, setPaymentDetails] = useState(null);

    const handlePayment = async () => {
        setProcessingPayment(true);

        try {

            // Create order
            const order = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ booking_id: booking.id, amount: booking.total }),
            }).then(res => res.json());

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency || 'INR',
                name: "Rooms4U",
                description: `Payment for Booking #${booking.id}`,
                order_id: order.order_id,
                handler: async function (response) {
                    // Show verification modal
                    setVerificationStatus('verifying');
                    setVerificationMessage('Verifying your payment...');
                    setPaymentDetails(response);
                    setShowVerificationModal(true);

                    try {
                        // Verify payment on server with comprehensive data
                        const verifyRes = await fetch('/api/payments/verify-payment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                bookingId: booking.id,
                                amount: order.amount,
                                method: 'razorpay'
                            }),
                        });

                        const result = await verifyRes.json();

                        if (result.success) {
                            // Optimistic update
                            updateBookingInState(booking.id, { paymentStatus: 'paid' });
                            setVerificationStatus('success');
                            setVerificationMessage('Payment verified successfully!');

                            // Auto-close after 3 seconds
                            setTimeout(() => {
                                setShowVerificationModal(false);
                                setVerificationStatus(null);
                                setVerificationMessage('');
                            }, 3000);
                        } else {
                            setVerificationStatus('error');
                            setVerificationMessage(result.error || 'Payment verification failed');
                        }
                    } catch (error) {
                        setVerificationStatus('error');
                        setVerificationMessage('Verification failed. Please try again.');
                        console.error('Verification error:', error);
                    }
                },
                prefill: {
                    name: booking.guestName,
                    email: booking.guestEmail,
                    contact: booking.guestPhone || ''
                },
                notes: {
                    bookingId: booking.id.toString(),
                    apartment: booking.apartment
                },
                theme: {
                    color: '#f59e0b'
                }
            };

            const razorpayInstance = new window.Razorpay(options);

            // Add payment failure handler
            razorpayInstance.on('payment.failed', function (response) {
                setVerificationStatus('error');
                setVerificationMessage(response.error.description || 'Payment failed. Please try again.');
                setShowVerificationModal(true);
            });

            // Add close handler for verification scenario
            razorpayInstance.on('close', function () {
                if (verificationStatus === 'verifying') {
                    setVerificationStatus('error');
                    setVerificationMessage('Payment process was interrupted. Please check your payment status.');
                    setShowVerificationModal(true);
                }
            });

            razorpayInstance.open();

        } catch (error) {
            console.error('Payment initiation error:', error);
            setVerificationStatus('error');
            setVerificationMessage('Failed to initiate payment. Please try again.');
            setShowVerificationModal(true);
        } finally {
            setProcessingPayment(false);
        }
    };

    const handleResendClick = async () => {
        setResendingEmail(true);
        await onResendEmail(booking);
        setResendingEmail(false);
    };

    // Calculate days between dates
    const calculateNights = (checkIn, checkOut) => {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const nights = calculateNights(booking.checkIn, booking.checkOut);

    return (
        <>
            <div
                className="group relative overflow-hidden bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700/30 rounded-2xl p-6 hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 backdrop-blur-sm"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Animated background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isHovered ? 'opacity-100' : ''}`}></div>

                {/* Header with booking ID and status */}
                <div className="relative flex items-start justify-between mb-6 pb-4 border-b border-neutral-700/30">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <FontAwesomeIcon icon={faReceipt} className="text-teal-400/60 text-sm" />
                            <p className="text-neutral-400 text-sm font-medium tracking-wide">
                                #{booking.id}
                            </p>
                        </div>
                        <h3 className="text-xl font-bold text-neutral-100 truncate">
                            {booking.apartment}
                        </h3>
                    </div>

                    <div className="relative">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(booking.status)} backdrop-blur-sm`}>
                            <FontAwesomeIcon icon={getStatusIcon(booking.status)} className="text-xs" />
                            {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                        </span>
                    </div>
                </div>

                {/* Guest Info with Avatar */}
                <div className="relative mb-6">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-neutral-800/40 to-transparent rounded-xl border border-neutral-700/20">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {booking.guestName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-neutral-900 border-2 border-neutral-800 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faUser} className="text-teal-400 text-xs" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-neutral-100 font-semibold text-sm truncate">
                                {booking.guestName}
                            </p>
                            <p className="text-neutral-400 text-xs mt-0.5">
                                {booking.guestEmail}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faUsers} className="text-teal-400/60 text-xs" />
                                    <span className="text-neutral-300 text-xs">
                                        {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faHome} className="text-teal-400/60 text-xs" />
                                    <span className="text-neutral-300 text-xs">
                                        {nights} night{nights > 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Details Grid */}
                <div className="flex flex-col gap-3 mb-6">
                    <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 p-3 rounded-xl border border-neutral-700/20 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-teal-500/10 rounded-lg">
                                    <FontAwesomeIcon icon={faCalendar} className="text-teal-400 text-sm" />
                                </div>
                                <span className="text-neutral-400 text-xs font-medium">Check-in</span>
                            </div>
                            <p className="text-neutral-100 font-semibold text-sm">{booking.checkIn}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-teal-500/10 rounded-lg">
                                    <FontAwesomeIcon icon={faCalendar} className="text-teal-400 text-sm" />
                                </div>
                                <span className="text-neutral-400 text-xs font-medium">Check-out</span>
                            </div>
                            <p className="text-neutral-100 font-semibold text-sm">{booking.checkOut}</p>
                        </div>
                    </div>

                    <div className="col-span-2 bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 p-3 rounded-xl border border-neutral-700/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-teal-500/10 rounded-lg">
                                    <FontAwesomeIcon icon={faRupeeSign} className="text-teal-400 text-sm" />
                                </div>
                                <span className="text-neutral-400 text-xs font-medium">Total Amount</span>
                            </div>
                            <div className="text-right">
                                <p className="text-teal-400 font-bold text-lg">₹{booking.total}</p>
                                <p className="text-neutral-500 text-xs mt-0.5">
                                    ₹{Math.round(booking.total / nights)}/night
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="relative flex gap-2">
                    <button
                        onClick={onViewDetails}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-neutral-700/60 to-neutral-800/60 hover:from-neutral-600/60 hover:to-neutral-700/60 text-neutral-200 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-neutral-600/30 hover:border-teal-500/30 hover:text-teal-100 group/btn"
                    >
                        <FontAwesomeIcon icon={faEye} className="group-hover/btn:scale-110 transition-transform" />
                        Details
                    </button>

                    {booking.status !== 'cancelled' && booking.status !== 'expired' && (
                        <button
                            onClick={() => onCancel(booking)}
                            className="px-4 py-2.5 bg-gradient-to-r from-rose-500/20 to-rose-600/20 hover:from-rose-500/30 hover:to-rose-600/30 text-rose-300 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-rose-500/30 hover:border-rose-400/50 group/btn"
                        >
                            <FontAwesomeIcon icon={faBan} className="group-hover/btn:rotate-12 transition-transform" />
                            Cancel
                        </button>
                    )}

                    {booking.status === 'pending' && (
                        <button
                            onClick={handleResendClick}
                            disabled={resendingEmail}
                            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:to-emerald-600/30 text-emerald-300 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-emerald-500/30 hover:border-emerald-400/50 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                        >
                            <FontAwesomeIcon
                                icon={resendingEmail ? faPaperPlane : faEnvelope}
                                className={`group-hover/btn:scale-110 transition-transform ${resendingEmail ? 'animate-pulse' : ''}`}
                            />
                            {resendingEmail ? 'Sending...' : 'Resend'}
                        </button>
                    )}

                    {booking.status === 'confirmed' && booking.paymentStatus !== 'paid' && (
                        <button
                            onClick={handlePayment}
                            disabled={processingPayment}
                            className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 border border-teal-500/50 hover:border-teal-400 shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                        >
                            <FontAwesomeIcon
                                icon={processingPayment ? faClock : faCreditCard}
                                className={`group-hover/btn:scale-110 transition-transform ${processingPayment ? 'animate-spin' : ''}`}
                            />
                            {processingPayment ? 'Processing...' : 'Pay'}
                        </button>
                    )}
                </div>

                {/* Hover effect line */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500/0 via-teal-500 to-teal-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ${isHovered ? 'scale-x-100' : ''}`}></div>
            </div>

            {/* Payment Modal */}
            <PaymentModal
                showVerificationModal={showVerificationModal}
                setShowVerificationModal={setShowVerificationModal}
                verificationStatus={verificationStatus}
                setVerificationStatus={setVerificationStatus}
                verificationMessage={verificationMessage}
                setVerificationMessage={setVerificationMessage}
                paymentDetails={paymentDetails}
                booking={booking}
                handlePayment={handlePayment}
            />
        </>
    );
}