'use client';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTimes,
    faCalendar,
    faClock,
    faInfoCircle,
    faCheckCircle,
    faExclamationTriangle,
    faTrash,
    faBan,
    faArrowLeft,
    faRupeeSign,
    faUser,
    faUsers,
    faAddressCard,
    faBed,
    faTag,
    faDoorOpen,
    faPhone,
    faHourglassHalf,
    faSpinner,
    faChartLine,
    faRupee,
    faUpload,
    faIndianRupee,
    faFileAlt,
    faShieldAlt,
    faCloudUploadAlt,
    faSync,
    faPaperPlane,
    faEnvelope,
    faEye,
    faCreditCard,
    faReceipt,
    faHome,
    faCrown
} from "@fortawesome/free-solid-svg-icons";
import VerificationModal from "@/app/booking/[id]/components/VerificationModal";
import { useState, useEffect } from "react";

export default function BookingInfoModal({
    booking,
    isOpen,
    onClose,
    onCancel,
    onDelete,
    updateBookingInState, // Updated: This prop is now available
    onDocumentUploadSuccess, // New prop for updating parent state
    onDocumentUploadStart, // New: For tracking upload start
    onDocumentUploadEnd // New: For tracking upload end
}) {


    const [loading, setLoading] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [localBooking, setLocalBooking] = useState(booking);
    const [isHovered, setIsHovered] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Sync with parent booking data
    useEffect(() => {
        setLocalBooking(booking);
    }, [booking]);

    if (!isOpen || !localBooking) return null;
    
    // Handle successful document upload
    const handleDocumentUploadSuccess = (response) => {
        // Update local state immediately
        const updatedBooking = {
            ...localBooking,
            document_verification: {
                ...localBooking.document_verification,
                status: "in_progress",
                reviewMessage: null // Clear previous rejection message
            }
        };

        setLocalBooking(updatedBooking);

        // Notify parent component to update global state
        if (onDocumentUploadSuccess) {
            onDocumentUploadSuccess(localBooking.id);
        }

        // Also update via updateBookingInState if available
        if (updateBookingInState) {
            updateBookingInState(localBooking.id, {
                document_verification: updatedBooking.document_verification
            });
        }
    };

    // Handle upload start
    const handleUploadStart = () => {
        setIsUploading(true);
        if (onDocumentUploadStart) {
            onDocumentUploadStart(localBooking.id);
        }
    };

    // Handle upload end
    const handleUploadEnd = () => {
        setIsUploading(false);
        if (onDocumentUploadEnd) {
            onDocumentUploadEnd(localBooking.id);
        }
    };

    // ---- Progress Logic ----
    const getProgress = () => {
        if (localBooking.status === "pending") return 50;
        if (localBooking.status === "confirmed" && localBooking.paymentStatus !== "paid")
            return 90;
        if (localBooking.paymentStatus === "paid") return 100;
        return 0;
    };

    const handleConfirmBooking = () => {
        setLoading(true);
        setShowVerificationModal(false);
    };

    const getVerificationColor = (status) => {
        return {
            in_progress: "text-amber-400",
            verified: "text-emerald-400",
            rejected: "text-rose-400",
        }[status] || "text-neutral-400";
    };

    const getVerificationIcon = (status) => {
        return {
            in_progress: faSpinner,
            verified: faCheckCircle,
            rejected: faExclamationTriangle,
        }[status] || faClock;
    };

    const getStatusColor = (status) => {
        return {
            pending: "text-amber-400",
            confirmed: "text-emerald-400",
            cancelled: "text-rose-400",
            expired: "text-neutral-400",
        }[status] || "text-neutral-400";
    };

    const getPaymentColor = (status) => {
        return {
            unpaid: "text-rose-400",
            paid: "text-emerald-400",
        }[status] || "text-neutral-400";
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[9999] p-4">
            <div
                className="w-full max-h-[700px] max-w-2xl 
             bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 
             rounded-2xl shadow-2xl border border-neutral-700/30 
             p-6 max-sm:p-3 
             animate-[fadeIn_.3s_ease] 
             hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/10 
             transition-all duration-500 
             flex flex-col min-h-0"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >

                {/* Animated background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 transition-opacity duration-500 ${isHovered ? 'opacity-100' : ''}`}></div>

                {/* Header */}
                <div className="relative flex justify-between items-center mb-6 pb-4 border-b border-neutral-700/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-teal-500/20 to-teal-600/20 rounded-xl border border-teal-500/30">
                            <FontAwesomeIcon icon={faCrown} className="text-teal-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <FontAwesomeIcon icon={faReceipt} className="text-teal-400/60 text-sm" />
                                <p className="text-neutral-400 text-sm font-medium tracking-wide">
                                    #{localBooking.id}
                                </p>
                            </div>
                            <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
                                <FontAwesomeIcon icon={faInfoCircle} className="text-teal-400" />
                                Booking Details
                            </h2>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/50 rounded-xl transition-all duration-300 border border-transparent hover:border-neutral-600/50"
                    >
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                </div>

                {/* Booking Info */}
                <div className="relative flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">

                    <div className="space-y-4">
                        {/* Progress Bar */}
                        <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 p-4 rounded-xl border border-neutral-700/20">
                            <h3 className="text-sm text-neutral-300 mb-3 flex items-center gap-2">
                                <FontAwesomeIcon icon={faChartLine} className="text-teal-400" />
                                Booking Progress
                            </h3>

                            <div className="relative w-full h-1.5 bg-neutral-700/50 rounded-full overflow-hidden">
                                <div
                                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-500"
                                    style={{ width: `${getProgress()}%` }}
                                ></div>
                            </div>

                            <div className="flex justify-between items-center mt-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                                    <p className="text-xs text-neutral-400">
                                        {getProgress() === 100 ? 'Complete' :
                                            getProgress() >= 90 ? 'Almost there' :
                                                'In progress'}
                                    </p>
                                </div>
                                <p className="text-xs font-semibold text-teal-400">
                                    {getProgress()}%
                                </p>
                            </div>
                        </div>

                        {/* Main Booking Details */}
                        <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 p-4 rounded-xl border border-neutral-700/20">
                            <h3 className="text-lg text-teal-400 font-semibold mb-4 flex items-center gap-2">
                                <div className="p-2 bg-gradient-to-br from-teal-500/20 to-teal-600/20 rounded-lg border border-teal-500/30">
                                    <FontAwesomeIcon icon={faBed} />
                                </div>
                                <span className="text-neutral-100">{localBooking.apartment}</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Check-in */}
                                <div className="p-3 bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 rounded-xl border border-neutral-700/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 bg-teal-500/10 rounded-lg">
                                            <FontAwesomeIcon icon={faCalendar} className="text-teal-400 text-sm" />
                                        </div>
                                        <span className="text-neutral-400 text-xs font-medium">Check-in</span>
                                    </div>
                                    <p className="text-neutral-100 font-semibold text-sm">{localBooking.checkIn}</p>
                                </div>

                                {/* Check-out */}
                                <div className="p-3 bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 rounded-xl border border-neutral-700/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 bg-teal-500/10 rounded-lg">
                                            <FontAwesomeIcon icon={faCalendar} className="text-teal-400 text-sm" />
                                        </div>
                                        <span className="text-neutral-400 text-xs font-medium">Check-out</span>
                                    </div>
                                    <p className="text-neutral-100 font-semibold text-sm">{localBooking.checkOut}</p>
                                </div>

                                {/* Booked On */}
                                <div className="p-3 bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 rounded-xl border border-neutral-700/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 bg-teal-500/10 rounded-lg">
                                            <FontAwesomeIcon icon={faClock} className="text-teal-400 text-sm" />
                                        </div>
                                        <span className="text-neutral-400 text-xs font-medium">Booked On</span>
                                    </div>
                                    <p className="text-neutral-100 font-semibold text-sm">{localBooking.created_at}</p>
                                </div>

                                {/* Expires */}
                                <div className="p-3 bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 rounded-xl border border-neutral-700/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 bg-teal-500/10 rounded-lg">
                                            <FontAwesomeIcon icon={faHourglassHalf} className="text-teal-400 text-sm" />
                                        </div>
                                        <span className="text-neutral-400 text-xs font-medium">Expires</span>
                                    </div>
                                    <p className="text-neutral-100 font-semibold text-sm">{localBooking.expires_at || "N/A"}</p>
                                </div>

                                {/* Status */}
                                <div className="p-3 bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 rounded-xl border border-neutral-700/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`p-1.5 rounded-lg ${getStatusColor(localBooking.status).replace('text-', 'bg-')}/10`}>
                                            <FontAwesomeIcon icon={faTag} className={`text-lg ${getStatusColor(localBooking.status)}`} />
                                        </div>
                                        <span className="text-neutral-400 text-xs font-medium">Status</span>
                                    </div>
                                    <p className={`text-sm font-semibold ${getStatusColor(localBooking.status)}`}>
                                        {localBooking.status.toUpperCase()}
                                    </p>
                                </div>

                                {/* Payment */}
                                <div className="p-3 bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 rounded-xl border border-neutral-700/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`p-1.5 rounded-lg ${getPaymentColor(localBooking.paymentStatus).replace('text-', 'bg-')}/10`}>
                                            <FontAwesomeIcon icon={faCreditCard} className={`text-lg ${getPaymentColor(localBooking.paymentStatus)}`} />
                                        </div>
                                        <span className="text-neutral-400 text-xs font-medium">Payment</span>
                                    </div>
                                    <p className={`text-sm font-semibold ${getPaymentColor(localBooking.paymentStatus)}`}>
                                        {localBooking.paymentStatus?.toUpperCase() || "UNPAID"}
                                    </p>
                                </div>

                                {/* Total Amount */}
                                <div className="col-span-full p-4 bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 rounded-xl border border-teal-500/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-br from-teal-500/20 to-teal-600/20 rounded-lg border border-teal-500/30">
                                                <FontAwesomeIcon icon={faIndianRupee} className="text-teal-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-neutral-400">Total Amount</p>
                                                <p className="text-2xl font-bold text-teal-400">₹{localBooking.total}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Document Verification */}
                        {localBooking.document_verification && (
                            <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 p-4 rounded-xl border border-neutral-700/20">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-500/30">
                                            <FontAwesomeIcon icon={faShieldAlt} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-neutral-100">
                                                Document Verification
                                            </h3>
                                            <p className="text-xs text-neutral-400 mt-0.5">
                                                {localBooking.document_verification.document_type || "ID Proof"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getVerificationColor(localBooking.document_verification.status)} backdrop-blur-sm`}>
                                        <FontAwesomeIcon
                                            icon={getVerificationIcon(localBooking.document_verification.status)}
                                            spin={localBooking.document_verification.status === "in_progress"}
                                            className="text-xs"
                                        />
                                        {localBooking.document_verification.status.replace("_", " ").toUpperCase()}
                                    </div>
                                </div>

                                {/* Reupload Button — ONLY IF REJECTED */}
                                {localBooking.document_verification.status === "rejected" && (
                                    <div className="mt-4 p-4 bg-gradient-to-br from-rose-500/10 to-rose-600/10 rounded-xl border border-rose-500/20">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-rose-500/20 rounded-lg">
                                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-rose-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-neutral-100 font-medium">
                                                        Document Rejected
                                                    </p>
                                                    <p className="text-xs text-neutral-400 mt-0.5">
                                                        Please upload a new document to continue
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setShowVerificationModal(true);
                                                }}
                                                disabled={isUploading}
                                                className="px-4 py-2 bg-gradient-to-r from-rose-500/20 to-rose-600/20 hover:from-rose-500/30 hover:to-rose-600/30 text-rose-300 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-rose-500/30 hover:border-rose-400/50 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                                            >
                                                <FontAwesomeIcon
                                                    icon={isUploading ? faSpinner : faCloudUploadAlt}
                                                    spin={isUploading}
                                                    className="group-hover/btn:scale-110 transition-transform"
                                                />
                                                {isUploading ? 'Uploading...' : 'Re-upload'}
                                            </button>
                                        </div>

                                        {/* Admin Message */}
                                        {localBooking.document_verification.reviewMessage && (
                                            <div className="mt-3 p-3 bg-neutral-800/60 rounded-lg border border-neutral-700/50">
                                                <p className="text-xs text-neutral-400 mb-1 flex items-center gap-1.5">
                                                    <FontAwesomeIcon icon={faInfoCircle} className="text-neutral-500" />
                                                    Reviewer's Note
                                                </p>
                                                <p className="text-sm text-neutral-300">
                                                    {localBooking.document_verification.reviewMessage}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* In Progress State */}
                                {localBooking.document_verification.status === "in_progress" && (
                                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-teal-500/10 to-teal-600/10 rounded-xl border border-teal-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-8 h-8 border-2 border-teal-500/30 rounded-full"></div>
                                                <div className="w-8 h-8 border-2 border-transparent border-t-teal-400 rounded-full animate-spin absolute top-0 left-0"></div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-neutral-100 font-medium">
                                                    Verification in Progress
                                                </p>
                                                <p className="text-xs text-neutral-400">
                                                    Your document is being reviewed
                                                </p>
                                            </div>
                                        </div>
                                        <FontAwesomeIcon icon={faSync} spin className="text-teal-400" />
                                    </div>
                                )}

                                {/* Verified State */}
                                {localBooking.document_verification.status === "verified" && (
                                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl border border-emerald-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-neutral-100 font-medium">
                                                    Document Verified
                                                </p>
                                                <p className="text-xs text-neutral-400">
                                                    Your document has been approved
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-emerald-400 font-medium">
                                            ✓ Approved
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Guest Details */}
                        {Array.isArray(localBooking.guest_details) && localBooking.guest_details.length > 0 && (
                            <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 p-4 rounded-xl border border-neutral-700/20">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-500/30">
                                        <FontAwesomeIcon icon={faUsers} className="text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-neutral-100">
                                            Guest Details
                                        </h3>
                                        <p className="text-xs text-neutral-400 mt-0.5">
                                            {localBooking.guest_details.length} guest{localBooking.guest_details.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {localBooking.guest_details.map((g, index) => {
                                        const initial = g.name?.charAt(0)?.toUpperCase() || "G";
                                        return (
                                            <div
                                                key={index}
                                                className="p-4 bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700/20 rounded-xl shadow-md group hover:border-teal-500/30 transition-all duration-300"
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Avatar Circle */}
                                                    <div className="relative">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                            {initial}
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-neutral-900 border-2 border-neutral-800 rounded-full flex items-center justify-center">
                                                            <FontAwesomeIcon icon={faUser} className="text-teal-400 text-xs" />
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="text-neutral-100 font-semibold text-sm truncate">
                                                                {g.name}
                                                            </p>
                                                            <span className="text-xs text-neutral-400 bg-neutral-800/50 px-2 py-1 rounded">
                                                                Guest {index + 1}
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-wrap gap-3">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                                                                <span className="text-neutral-300 text-xs">
                                                                    Age: {g.age}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <FontAwesomeIcon icon={faUser} className="text-teal-400/60 text-xs" />
                                                                <span className="text-neutral-300 text-xs">
                                                                    {g.gender}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 mt-3 p-2 bg-neutral-800/40 rounded-lg">
                                                            <FontAwesomeIcon icon={faPhone} className="text-neutral-400 text-sm" />
                                                            <span className="text-neutral-300 text-sm font-mono">
                                                                {g.phone}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                {/* Hover effect line */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500/0 via-teal-500 to-teal-500/0 transform scale-x-0 transition-transform duration-500 ${isHovered ? 'scale-x-100' : ''}`}></div>

                {/* Footer Buttons */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-700/30">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 bg-gradient-to-r from-neutral-700/60 to-neutral-800/60 hover:from-neutral-600/60 hover:to-neutral-700/60 text-neutral-200 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-neutral-600/30 hover:border-teal-500/30 hover:text-teal-100 group/btn"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="group-hover/btn:-translate-x-1 transition-transform" />
                        Back
                    </button>

                    <div className="flex gap-3">
                        {localBooking.status !== "cancelled" &&
                            localBooking.status !== "expired" && (
                                <button
                                    onClick={() => onCancel(localBooking)}
                                    className="px-4 py-2.5 bg-gradient-to-r from-rose-500/20 to-rose-600/20 hover:from-rose-500/30 hover:to-rose-600/30 text-rose-300 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-rose-500/30 hover:border-rose-400/50 group/btn"
                                >
                                    <FontAwesomeIcon icon={faBan} className="group-hover/btn:rotate-12 transition-transform" />
                                    Cancel Booking
                                </button>
                            )}
                    </div>
                </div>
            </div>

            {/* Verification Modal */}
            <VerificationModal
                isOpen={showVerificationModal}
                onClose={() => {
                    setShowVerificationModal(false);
                    setIsUploading(false);
                }}
                onConfirm={handleConfirmBooking}
                loading={loading}
                bookingId={localBooking.id}
                onUploadSuccess={handleDocumentUploadSuccess}
                onUploadStart={handleUploadStart}
                onUploadEnd={handleUploadEnd}
            />
        </div>
    );
}