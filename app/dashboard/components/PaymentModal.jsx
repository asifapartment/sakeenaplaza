'use client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faClock,
    faCheckCircle,
    faBan,
    faCreditCard
} from '@fortawesome/free-solid-svg-icons';

export default function PaymentModal({
    showVerificationModal,
    setShowVerificationModal,
    verificationStatus,
    setVerificationStatus,
    verificationMessage,
    setVerificationMessage,
    paymentDetails,
    booking,
    handlePayment
}) {
    if (!showVerificationModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="relative bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                {/* Modal Header */}
                <div className="p-6 border-b border-neutral-700/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${verificationStatus === 'verifying' ? 'bg-teal-500/20' :
                                verificationStatus === 'success' ? 'bg-emerald-500/20' :
                                    'bg-rose-500/20'
                                }`}>
                                <FontAwesomeIcon
                                    icon={
                                        verificationStatus === 'verifying' ? faClock :
                                            verificationStatus === 'success' ? faCheckCircle :
                                                faBan
                                    }
                                    className={`${verificationStatus === 'verifying' ? 'text-teal-400' :
                                        verificationStatus === 'success' ? 'text-emerald-400' :
                                            'text-rose-400'
                                        } text-xl`}
                                />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-neutral-100">
                                    {verificationStatus === 'verifying' ? 'Verifying Payment' :
                                        verificationStatus === 'success' ? 'Payment Successful' :
                                            'Payment Failed'}
                                </h3>
                                <p className="text-neutral-400 text-sm mt-1">
                                    Booking #{booking.id}
                                </p>
                            </div>
                        </div>

                        {/* Close button - always visible except when auto-closing */}
                        {verificationStatus !== 'verifying' && (
                            <button
                                onClick={() => {
                                    setShowVerificationModal(false);
                                    setVerificationStatus(null);
                                    setVerificationMessage('');
                                }}
                                className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/50 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                    {/* Loading/Verifying State */}
                    {verificationStatus === 'verifying' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="relative inline-flex">
                                    <div className="w-16 h-16 border-4 border-teal-500/30 rounded-full"></div>
                                    <div className="w-16 h-16 border-4 border-transparent border-t-teal-400 rounded-full animate-spin absolute"></div>
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-neutral-100 font-medium text-lg">
                                    Please wait...
                                </p>
                                <p className="text-neutral-400 mt-2">
                                    We're verifying your payment. This may take a few moments.
                                </p>
                            </div>

                            <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-neutral-400">Amount</p>
                                        <p className="text-neutral-100 font-semibold">₹{booking.total}</p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-400">Booking ID</p>
                                        <p className="text-neutral-100 font-semibold">#{booking.id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success State */}
                    {verificationStatus === 'success' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FontAwesomeIcon
                                        icon={faCheckCircle}
                                        className="text-emerald-400 text-3xl"
                                    />
                                </div>

                                <p className="text-neutral-100 font-medium text-lg mb-2">
                                    Payment Verified Successfully!
                                </p>
                                <p className="text-neutral-400">
                                    Your payment has been confirmed and your booking is now active.
                                </p>
                            </div>

                            <div className="bg-neutral-800/50 rounded-xl p-4 border border-emerald-500/20">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Payment ID:</span>
                                        <span className="text-neutral-100 font-mono text-sm">
                                            {paymentDetails?.razorpay_payment_id?.slice(-8)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Amount Paid:</span>
                                        <span className="text-emerald-400 font-bold">₹{booking.total}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Booking Status:</span>
                                        <span className="text-emerald-400 font-semibold">Confirmed</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center text-sm text-neutral-500">
                                This window will close automatically in a few seconds...
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {verificationStatus === 'error' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FontAwesomeIcon
                                        icon={faBan}
                                        className="text-rose-400 text-3xl"
                                    />
                                </div>

                                <p className="text-neutral-100 font-medium text-lg mb-2">
                                    Verification Failed
                                </p>
                                <p className="text-neutral-400">
                                    {verificationMessage}
                                </p>
                            </div>

                            <div className="bg-neutral-800/50 rounded-xl p-4 border border-rose-500/20">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Booking ID:</span>
                                        <span className="text-neutral-100 font-semibold">#{booking.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Amount:</span>
                                        <span className="text-teal-400 font-semibold">₹{booking.total}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Status:</span>
                                        <span className="text-rose-400 font-semibold">Payment Failed</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowVerificationModal(false);
                                        setVerificationStatus(null);
                                        setVerificationMessage('');
                                    }}
                                    className="flex-1 px-4 py-3 bg-neutral-700/50 hover:bg-neutral-700 text-neutral-200 rounded-xl font-medium transition-colors border border-neutral-600/50"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setShowVerificationModal(false);
                                        setVerificationStatus(null);
                                        setVerificationMessage('');
                                        handlePayment(); // Retry payment
                                    }}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white rounded-xl font-medium transition-all"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Progress bar for verifying state */}
                {verificationStatus === 'verifying' && (
                    <div className="h-1 bg-neutral-700 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 animate-pulse"></div>
                    </div>
                )}
            </div>
        </div>
    );
}