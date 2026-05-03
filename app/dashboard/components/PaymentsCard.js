'use client';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheckCircle,
    faClock,
    faTimesCircle,
    faUndo,
    faSyncAlt,
    faBan,
    faCreditCard,
    faFingerprint,
    faCalendarAlt,
    faCopy,
    faShieldAlt,
    faInfoCircle,
    faEye,
    faDownload,
    faReceipt,
    faRupeeSign,
    faUniversity,
    faWallet,
    faMoneyBill
} from '@fortawesome/free-solid-svg-icons';
import { faApple,faGoogle, faStripe ,faPaypal} from '@fortawesome/free-brands-svg-icons';

const getStatusColor = (status) => {
    const colors = {
        paid: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        pending: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        failed: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        refunded: "bg-blue-500/20 text-blue-300 border-blue-500/40",
        processing: "bg-sky-500/20 text-sky-300 border-sky-500/40",
        cancelled: "bg-neutral-500/20 text-neutral-300 border-neutral-500/40"
    };
    return colors[status?.toLowerCase()] || "bg-neutral-500/20 text-neutral-300 border-neutral-500/40";
};

const getStatusIcon = (status) => {
    const icons = {
        paid: faCheckCircle,
        pending: faClock,
        failed: faTimesCircle,
        refunded: faUndo,
        processing: faSyncAlt,
        cancelled: faBan
    };
    return icons[status?.toLowerCase()] || faCheckCircle;
};

const getMethodIcon = (method) => {
    const icons = {
        credit_card: faCreditCard,
        debit_card: faCreditCard,
        paypal: faPaypal,
        bank_transfer: faUniversity,
        wallet: faWallet,
        cash: faMoneyBill,
        stripe: faStripe,
        apple_pay: faApple,
        google_pay: faGoogle
    };
    return icons[method?.toLowerCase()] || faCreditCard;
};

export default function PaymentCard({
    payment,
    onViewReceipt,
    onDownloadReceipt,
    getPaymentProperty,
    getSafePaymentId,
    safeFormatCurrency,
    safePaymentMethod,
    safeFormatDate,
    safeToString,
    isViewLoading = false,
    isDownloadLoading = false,
    currentPaymentId = null,
    currentAction = null
}) {
    const [isHovered, setIsHovered] = useState(false);

    if (!payment || typeof payment !== 'object') return null;

    const paymentId = getSafePaymentId(payment);
    const bookingId = getPaymentProperty(payment, 'bookingId');
    const status = getPaymentProperty(payment, 'status');
    const amount = getPaymentProperty(payment, 'amount');
    const method = getPaymentProperty(payment, 'method');
    const paidAt = getPaymentProperty(payment, 'paidAt');
    const gatewayId = getPaymentProperty(payment, 'gatewayId');
    const refundId = getPaymentProperty(payment, 'refundId');
    const refundTime = getPaymentProperty(payment, 'refundTime');
    const apartmentTitle = getPaymentProperty(payment, 'apartmentTitle');

    const formattedAmount = safeFormatCurrency(amount);
    const formattedMethod = safePaymentMethod(method);
    const formattedDate = safeFormatDate(paidAt);
    const safeGatewayId = safeToString(gatewayId).substring(0, 12);
    const formattedTime = paidAt ? new Date(paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    const StatusIcon = getStatusIcon(status);
    const MethodIcon = getMethodIcon(method);

    // Check loading states
    const isViewActionLoading = isViewLoading && currentPaymentId === paymentId && currentAction === 'view';
    const isDownloadActionLoading = isDownloadLoading && currentPaymentId === paymentId && currentAction === 'download';

    return (
        <div
            className="group relative overflow-hidden bg-neutral-950 border border-neutral-700/30 rounded-2xl p-5 hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 backdrop-blur-sm"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Header - Compact */}
            <div className="relative flex items-start justify-between mb-5 pb-4 border-b border-neutral-700/30">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <FontAwesomeIcon icon={faReceipt} className="text-teal-400/70 text-xs" />
                        <p className="text-neutral-300 text-sm font-medium">#{paymentId.substring(0, 8)}</p>
                        <span className="text-xs text-neutral-400">•</span>
                        <span className="px-2 py-0.5 bg-neutral-700/50 rounded text-xs text-neutral-400">
                            RazorPay
                        </span>
                    </div>
                    <h3 className="text-base font-semibold text-neutral-100 truncate">
                        {apartmentTitle || 'Payment'}
                    </h3>
                </div>

                <div className="relative">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(status)} backdrop-blur-sm`}>
                        <FontAwesomeIcon
                            icon={StatusIcon}
                            className={`text-xs ${status?.toLowerCase() === 'processing' ? 'animate-spin' : ''}`}
                        />
                        {status?.charAt(0).toUpperCase() + status?.slice(1)}
                    </span>
                </div>
            </div>

            {/* Main Content - Optimized Grid */}
            <div className="relative mb-5">
                {/* Amount Row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-500/10 rounded-lg">
                            <FontAwesomeIcon icon={faRupeeSign} className="text-teal-400 text-base" />
                        </div>
                        <div>
                            <p className="text-xs text-neutral-400">Amount</p>
                            <p className="text-lg font-bold text-teal-400">{formattedAmount}</p>
                        </div>
                    </div>

                    {/* Booking ID if exists */}
                    {bookingId && (
                        <div className="text-right">
                            <p className="text-xs text-neutral-400">Booking ID</p>
                            <p className="text-sm font-medium text-neutral-200">
                                #{safeToString(bookingId).substring(0, 6)}...
                            </p>
                        </div>
                    )}
                </div>

                {/* Details Grid - 2x2 */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Payment Method */}
                    <div className="bg-neutral-800/40 border border-neutral-700/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <FontAwesomeIcon icon={MethodIcon} className="text-sky-400 text-xs" />
                            <span className="text-xs text-neutral-400">Method</span>
                        </div>
                        <p className="text-sm font-medium text-neutral-100 truncate">{formattedMethod}</p>
                    </div>

                    {/* Date */}
                    <div className="bg-neutral-800/40 border border-neutral-700/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-emerald-400 text-xs" />
                            <span className="text-xs text-neutral-400">Date</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-neutral-100">{formattedDate}</p>
                            {formattedTime && (
                                <p className="text-xs text-neutral-400 mt-0.5">{formattedTime}</p>
                            )}
                        </div>
                    </div>

                    {/* Gateway ID */}
                    <div className="bg-neutral-800/40 border border-neutral-700/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <FontAwesomeIcon icon={faFingerprint} className="text-violet-400 text-xs" />
                            <span className="text-xs text-neutral-400">Gateway ID</span>
                        </div>
                        <p className="text-sm font-medium text-neutral-100 truncate">
                            {safeGatewayId.substring(0, 8)}...
                        </p>
                    </div>

                    {/* Transaction Time */}
                    <div className="bg-neutral-800/40 border border-neutral-700/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <FontAwesomeIcon icon={faClock} className="text-teal-400 text-xs" />
                            <span className="text-xs text-neutral-400">Transaction</span>
                        </div>
                        <p className="text-sm font-medium text-neutral-100">
                            {formattedTime || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Refund Section - Only if exists */}
            {refundId && refundTime && (
                <div className="mb-5 p-3 bg-gradient-to-r from-blue-900/20 to-blue-800/10 border border-blue-800/30 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUndo} className="text-blue-300 text-xs" />
                            <div>
                                <p className="text-xs text-blue-200 font-medium">Refund Issued</p>
                                <p className="text-xs text-blue-300/70">ID: {refundId.substring(0, 8)}...</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-blue-300">{safeFormatDate(refundTime)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons - Compact */}
            <div className="relative flex gap-2">
                <button
                    onClick={() => onViewReceipt(paymentId, 'view')}
                    disabled={isViewActionLoading || isDownloadActionLoading}
                    className="flex-1 px-3 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-200 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-neutral-700/50 hover:border-teal-500/30 hover:text-teal-100 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isViewActionLoading ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    ) : (
                        <FontAwesomeIcon icon={faEye} className="text-xs" />
                    )}
                    {isViewActionLoading ? 'Loading...' : 'View'}
                </button>

                <button
                    onClick={() => onDownloadReceipt(paymentId, 'download')}
                    disabled={isViewActionLoading || isDownloadActionLoading}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 border border-teal-500/50 hover:border-teal-400 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isDownloadActionLoading ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    ) : (
                        <FontAwesomeIcon icon={faDownload} className="text-xs" />
                    )}
                    {isDownloadActionLoading ? '...' : 'Download'}
                </button>
            </div>

            {/* Hover effect line */}
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500/0 via-teal-500 to-teal-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ${isHovered ? 'scale-x-100' : ''}`}></div>
        </div>
    );
}