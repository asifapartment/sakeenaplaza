import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faChevronDown, faCheckCircle, faBan, faTrash, faTimes, faExclamationTriangle, faPlusCircle, faClock, faHourglassHalf, faCalendarCheck, faInfoCircle, faSpinner, faCloudUploadAlt, faIdCard } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import NoBookingsEmptyState from "./EmptyBooking";

export const TableSkeleton = () => {
    return (
        <div className="bg-black rounded-xl shadow-xl overflow-hidden border border-neutral-700/50 backdrop-blur-sm animate-pulse">
            {/* Pagination Skeleton */}
            <div className="bg-black px-6 py-4 border-b border-neutral-800/70">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-4 bg-neutral-800 rounded w-24 shimmer"></div>
                        <div className="h-4 bg-neutral-800 rounded w-8 shimmer"></div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Previous Button Skeleton */}
                        <div className="h-10 bg-neutral-800 rounded-lg w-16 shimmer"></div>

                        {/* Page Numbers Skeleton */}
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className={`h-10 w-10 rounded-lg shimmer ${i === 1 ? "bg-blue-900/50" : "bg-neutral-800"
                                        }`}
                                ></div>
                            ))}
                        </div>

                        {/* Next Button Skeleton */}
                        <div className="h-10 bg-neutral-800 rounded-lg w-16 shimmer"></div>
                    </div>
                </div>
            </div>

            {/* Table Skeleton */}
            <div
                style={{
                    maxHeight: "calc(100vh - 320px)",
                    minHeight: "400px",
                    overflowY: "auto",
                    overflowX: "auto"
                }}
                className="scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900"
            >
                <table className="w-full text-left border-collapse text-neutral-50 min-w-[1024px]">
                    {/* Table Header Skeleton */}
                    <thead className="bg-gradient-to-r from-neutral-900 to-neutral-950 sticky top-0 z-20 text-sm border-b border-neutral-800/70">
                        <tr>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <th key={i} className="p-4">
                                    <div className="h-4 bg-neutral-800 rounded w-20 shimmer"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Table Body Skeleton */}
                    <tbody className="divide-y divide-neutral-700/50">
                        {Array.from({ length: 10 }).map((_, rowIndex) => (
                            <tr key={rowIndex} className="group hover:bg-neutral-800/80">
                                {/* Booking ID */}
                                <td className="p-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="space-y-2">
                                            <div className="h-4 bg-neutral-800 rounded w-16 shimmer"></div>
                                            <div className="h-3 bg-neutral-800 rounded w-24 shimmer"></div>
                                        </div>
                                    </div>
                                </td>

                                {/* User */}
                                <td className="p-4 whitespace-nowrap">
                                    <div className="space-y-2">
                                        <div className="h-4 bg-neutral-800 rounded w-20 shimmer"></div>
                                        <div className="h-3 bg-neutral-800 rounded w-32 shimmer"></div>
                                        <div className="h-3 bg-neutral-800 rounded w-24 shimmer"></div>
                                        <div className="h-5 bg-neutral-800 rounded w-16 shimmer"></div>
                                    </div>
                                </td>

                                {/* Apartment */}
                                <td className="p-4 whitespace-nowrap">
                                    <div className="space-y-2">
                                        <div className="h-4 bg-neutral-800 rounded w-32 shimmer"></div>
                                        <div className="h-3 bg-neutral-800 rounded w-16 shimmer"></div>
                                    </div>
                                </td>

                                {/* Dates */}
                                <td className="p-4 whitespace-nowrap">
                                    <div className="space-y-2">
                                        <div className="h-4 bg-neutral-800 rounded w-24 shimmer"></div>
                                        <div className="h-3 bg-neutral-800 rounded w-8 mx-auto shimmer"></div>
                                        <div className="h-4 bg-neutral-800 rounded w-24 shimmer"></div>
                                    </div>
                                </td>

                                {/* Status */}
                                <td className="p-4 whitespace-nowrap">
                                    <div className="h-8 bg-neutral-800 rounded-full w-20 shimmer"></div>
                                </td>

                                {/* Payment */}
                                <td className="p-4 whitespace-nowrap">
                                    <div className="h-8 bg-neutral-800 rounded-full w-24 shimmer"></div>
                                </td>

                                {/* Amount */}
                                <td className="p-4 whitespace-nowrap">
                                    <div className="space-y-2">
                                        <div className="h-4 bg-neutral-800 rounded w-16 shimmer"></div>
                                        <div className="h-3 bg-neutral-800 rounded w-20 shimmer"></div>
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="p-4 whitespace-nowrap">
                                    <div className="flex flex-wrap gap-2">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-8 bg-neutral-800 rounded-lg w-16 shimmer"></div>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% {
                    background-position: -1000px 0;
                    }
                    100% {
                    background-position: 1000px 0;
                    }
                }
                
                .shimmer {
                    background: linear-gradient(
                    90deg,
                    rgba(38, 38, 38, 0.4) 25%,
                    rgba(64, 64, 64, 0.8) 50%,
                    rgba(38, 38, 38, 0.4) 75%
                    );
                    background-size: 1000px 100%;
                    animation: shimmer 2s infinite linear;
                }
                
                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                
                @keyframes pulse {
                    0%, 100% {
                    opacity: 1;
                    }
                    50% {
                    opacity: 0.7;
                    }
                }
                `}
            </style>
        </div>

    );
};

const BookingsList = ({
    bookings,
    loading,
    pagination,
    onPageChange,
    onViewBooking,
    onStatusUpdate,
    onDeleteBooking,
}) => {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [cancelReason, setCancelReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [documentType, setDocumentType] = useState('');
    const [documentData, setDocumentData] = useState({});
    const [documentErrors, setDocumentErrors] = useState({});
    const [documentUrls, setDocumentUrls] = useState({});
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [activeDocumentTab, setActiveDocumentTab] = useState('front');
    const [initialDocumentData, setInitialDocumentData] = useState({});
    const [selectedBookingDocument, setSelectedBookingDocument] = useState(null);

    const documentSchemas = {
        aadhaar: {
            required: ['aadhaar_number', 'name', 'dob', 'gender', 'address', 'state', 'pincode', 'front_image_url', 'back_image_url'],
            labels: {
                aadhaar_number: 'Aadhaar Number',
                name: 'Full Name',
                dob: 'Date of Birth',
                gender: 'Gender',
                address: 'Address',
                state: 'State',
                pincode: 'Pincode',
                front_image_url: 'Front Image URL',
                back_image_url: 'Back Image URL'
            }
        },
        pan: {
            required: ['pan_number', 'name', 'father_name', 'dob', 'front_image_url'],
            labels: {
                pan_number: 'PAN Number',
                name: 'Full Name',
                father_name: "Father's Name",
                dob: 'Date of Birth',
                front_image_url: 'Photo URL'
            }
        },
        driving_license: {
            required: ['dl_number', 'name', 'dob', 'validity_from', 'validity_to', 'address', 'rto', 'front_image_url', 'back_image_url'],
            labels: {
                dl_number: 'Driving License Number',
                name: 'Full Name',
                dob: 'Date of Birth',
                validity_from: 'Validity From',
                validity_to: 'Validity To',
                address: 'Address',
                rto: 'RTO',
                front_image_url: 'Front Image URL',
                back_image_url: 'Back Image URL'
            }
        },
        passport: {
            required: ['passport_number', 'name', 'dob', 'nationality', 'place_of_issue', 'expiry_date', 'front_image_url'],
            labels: {
                passport_number: 'Passport Number',
                name: 'Full Name',
                dob: 'Date of Birth',
                nationality: 'Nationality',
                place_of_issue: 'Place of Issue',
                expiry_date: 'Expiry Date',
                front_image_url: 'Front Image URL'
            }
        },
        voter_id: {
            required: ['epic_number', 'name', 'father_or_mother_name', 'dob', 'address', 'front_image_url'],
            labels: {
                epic_number: 'EPIC Number',
                name: 'Full Name',
                father_or_mother_name: "Father's/Mother's Name",
                dob: 'Date of Birth',
                address: 'Address',
                front_image_url: 'Front Image URL'
            }
        }
    };

    const getDocumentTypeLabel = (type) => {
        const labels = {
            aadhaar: "Aadhaar Card",
            pan: "PAN Card",
            driving_license: "Driving License",
            passport: "Passport",
            voter_id: "Voter ID"
        };
        return labels[type] || type;
    };

    const getDocumentActionConfig = (documentStatus) => {
        const configs = {
            approved: {
                icon: faCheckCircle,
                label: 'Verified',
                variant: 'success',
                disabled: true,
                tooltip: 'Document already verified'
            },
            pending: {
                icon: faSpinner,
                label: 'Verify Pending',
                variant: 'warning',
                disabled: false,
                tooltip: 'Document pending verification'
            },
            rejected: {
                icon: faCloudUploadAlt,
                label: 'Re-upload Required',
                variant: 'danger',
                disabled: false,
                tooltip: 'Please re-upload your document'
            },
            not_submitted: {
                icon: faIdCard,
                label: 'Verify Now',
                variant: 'primary',
                disabled: false,
                tooltip: 'Click to verify document'
            },
            submitted: {
                icon: faHourglassHalf,
                label: 'Under Review',
                variant: 'info',
                disabled: true,
                tooltip: 'Document is being reviewed'
            }
        };

        return configs[documentStatus] || configs.not_submitted;
    };

    const canShowCancelButton = (bookingStatus) => {
        return !["confirmed", "expired", "ongoing", "cancelled","blocked","completed"].includes(bookingStatus);
    };

    const canShowVerifyButton = (bookingStatus) => {
        return !["confirmed","completed","expired","cancelled","blocked"].includes(bookingStatus);
    };
    const handleDocumentTypeChange = (type) => {
        setDocumentType(type);
        const initialData = {};
        documentSchemas[type]?.required.forEach(field => {
            initialData[field] = '';
        });

        Object.entries(initialDocumentData).forEach(([fieldName, url]) => {
            if (documentSchemas[type]?.required.includes(fieldName)) {
                initialData[fieldName] = url;
            }
        });

        setDocumentData(initialData);
        setDocumentErrors({});
    };

    const handleDocumentFieldChange = (field, value) => {
        setDocumentData(prev => ({
            ...prev,
            [field]: value
        }));

        if (documentErrors[field]) {
            setDocumentErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateDocument = () => {
        if (!documentType) {
            alert('Please select a document type');
            return false;
        }

        const errors = {};
        const schema = documentSchemas[documentType];

        schema.required.forEach(field => {
            if (!documentData[field]?.trim()) {
                errors[field] = `${schema.labels[field]} is required`;
            }
        });

        setDocumentErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: {
                color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                icon: faClock,
                label: "Pending"
            },
            confirmed: {
                color: "bg-green-500/20 text-green-400 border-green-500/30",
                icon: faCheckCircle,
                label: "Confirmed"
            },
            completed: {
                color: "bg-green-500/20 text-green-400 border-green-500/30",
                icon: faCheckCircle,
                label: "Confirmed"
            },
            cancelled: {
                color: "bg-red-500/20 text-red-400 border-red-500/30",
                icon: faBan,
                label: "Cancelled"
            },
            expired: {
                color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
                icon: faHourglassHalf,
                label: "Expired"
            },
            ongoing: {
                color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                icon: faCalendarCheck,
                label: "Ongoing"
            },
            blocked:{
                color: "bg-red-500/20 text-red-400 border-red-500/30",
                icon: faBan,
                label: "Blocked"
            }
        };

        const config = statusConfig[status] || {
            color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
            icon: faInfoCircle,
            label: status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"
        };

        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}
            >
                <FontAwesomeIcon icon={config.icon} className="text-xs" />
                {config.label}
            </span>
        );
    };

    const getPaymentBadge = (paymentStatus) => {
        const paymentColors = {
            paid: "bg-green-500/20 text-green-400",
            failed: "bg-red-500/20 text-red-400",
            refunded: "bg-blue-500/20 text-blue-400",
            cancelled: "bg-gray-500/20 text-gray-400",
        };
        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${paymentColors[paymentStatus] || "bg-gray-500/20 text-gray-400"
                    }`}
            >
                {paymentStatus
                    ? paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)
                    : "N/A"}
            </span>
        );
    };

    // New function to fetch document directly by booking ID
    const fetchDocumentByBookingId = async (bookingId) => {
        try {
            setLoadingDocuments(true);
            const response = await fetch(`/api/admin/documents?booking_id=${bookingId}`);
            const data = await response.json();

            if (data.success && data.documents && data.documents.length > 0) {
                // Get the most recent document for this booking
                const document = data.documents.sort((a, b) =>
                    new Date(b.created_at) - new Date(a.created_at)
                )[0];

                setSelectedBookingDocument(document);

                // Set document type
                setDocumentType(document.document_type);

                // Parse document data
                let docData = {};
                try {
                    docData = typeof document.document_data === 'string'
                        ? JSON.parse(document.document_data)
                        : { ...document.document_data };
                } catch {
                    docData = {};
                }

                // Extract URLs
                const urls = {};
                if (docData.front_image_url) urls.front = docData.front_image_url;
                if (docData.back_image_url) urls.back = docData.back_image_url;
                if (docData.photo_image_url) urls.photo = docData.photo_image_url;

                // Handle nested structure if present
                if (!docData.front_image_url && docData.front?.url) {
                    docData.front_image_url = docData.front.url;
                    urls.front = docData.front.url;
                }
                if (!docData.back_image_url && docData.back?.url) {
                    docData.back_image_url = docData.back.url;
                    urls.back = docData.back.url;
                }
                if (!docData.photo_image_url && docData.photo?.url) {
                    docData.photo_image_url = docData.photo.url;
                    urls.photo = docData.photo.url;
                }

                setDocumentUrls(urls);
                setDocumentData(docData);

                // Set active tab to first available
                const availableTabs = Object.keys(urls);
                if (availableTabs.length > 0) {
                    setActiveDocumentTab(availableTabs[0]);
                }

                setShowConfirmModal(true);
            } else {
                alert('No document found for this booking');
            }
        } catch (error) {
            console.error('Error fetching document:', error);
            alert('Failed to fetch document');
        } finally {
            setLoadingDocuments(false);
        }
    };

    const handleQuickStatusUpdate = async (bookingId, newStatus) => {
        if (newStatus === "cancelled") {
            setSelectedBooking(bookingId);
            setCancelReason("");
            setShowCancelModal(true);
        } else if (newStatus === "confirmed") {
            const booking = bookings.find(b => b.id === bookingId);
            if (booking) {
                setSelectedBooking(bookingId);
                // Directly fetch document for this booking ID
                await fetchDocumentByBookingId(bookingId);
            }
        } else {
            await onStatusUpdate(bookingId, newStatus);
        }
    };

    const handleConfirmBooking = async () => {
        if (!validateDocument()) {
            alert('Please fill all required document fields correctly');
            return;
        }

        setActionLoading(true);
        try {
            const booking = bookings.find(b => b.id === selectedBooking);

            if (!selectedBookingDocument) {
                throw new Error('No document found for this booking');
            }

            const isFirstTimeBooking = selectedBookingDocument.booking_id &&
                selectedBookingDocument.booking_id.toString().startsWith('TEMP_');

            if (isFirstTimeBooking) {

                // Create the booking first
                const bookingResponse = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: booking.user_id,
                        vehicle_id: booking.vehicle_id,
                        start_date: booking.start_date,
                        end_date: booking.end_date,
                        document_reference: selectedBookingDocument.booking_id,
                        document_id: selectedBookingDocument.id
                    })
                });

                const newBooking = await bookingResponse.json();

                if (!newBooking.success && !newBooking.id) {
                    throw new Error(newBooking.message || 'Failed to create booking');
                }

                const verificationResponse = await fetch('/api/admin/verify-document', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: booking.user_id,
                        booking_id: newBooking.id,
                        document_type: documentType,
                        document_data: documentData,
                        status: 'approved',
                        verification_notes: 'Verified during booking confirmation',
                        review_message: 'Document verified and booking approved'
                    })
                });

                const verificationData = await verificationResponse.json();

                if (!verificationData.success) {
                    throw new Error(verificationData.message || 'Document verification failed');
                }

                const linkResponse = await fetch('/api/documents/link-to-booking', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        temp_reference: selectedBookingDocument.booking_id,
                        real_booking_id: newBooking.id,
                        document_id: selectedBookingDocument.id,
                        user_id: booking.user_id
                    })
                });

                const linkData = await linkResponse.json();

                if (!linkData.success) {
                    console.warn('Document linking warning:', linkData.message);
                }

                if (onStatusUpdate) {
                    await onStatusUpdate(newBooking.id, "confirmed");
                }

            } else if (booking) {

                const verificationResponse = await fetch('/api/admin/verify-document', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: booking.user_id,
                        booking_id: selectedBooking,
                        document_type: documentType,
                        document_data: documentData,
                        status: 'approved',
                        verification_notes: 'Document verified',
                        review_message: 'Document verified successfully'
                    })
                });

                const verificationData = await verificationResponse.json();

                if (!verificationData.success) {
                    throw new Error(verificationData.message || 'Document verification failed');
                }

                if (onStatusUpdate) {
                    await onStatusUpdate(selectedBooking, "confirmed");
                }
            } else {
                throw new Error('Unable to process: Missing booking information');
            }

            closeModals();

        } catch (error) {
            console.error('Error confirming booking:', error);
            alert(`Failed to confirm booking: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectDocument = async () => {
        if (!window.confirm('Are you sure you want to reject this document? This will mark the document as rejected but you can still proceed with booking confirmation.')) {
            return;
        }

        setActionLoading(true);
        try {
            const booking = bookings.find(b => b.id === selectedBooking);

            if (booking && booking.user_id) {
                const verificationResponse = await fetch('/api/admin/reject-document', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: booking.user_id,
                        booking_id: selectedBooking,
                        document_type: documentType,
                        document_data: documentData,
                        status: 'rejected',
                        verification_notes: 'Document rejected by admin',
                        review_message: 'Document verification failed'
                    })
                });

                const verificationData = await verificationResponse.json();

                if (!verificationData.success) {
                    throw new Error(verificationData.message || 'Failed to reject document');
                }

                alert('Document marked as rejected. You can still confirm the booking.');
                closeModals();
            }
        } catch (error) {
            console.error('Error rejecting document:', error);
            alert(`Failed to reject document: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmCancel = async () => {
        if (selectedBooking && cancelReason.trim()) {
            setActionLoading(true);
            try {
                await onStatusUpdate(selectedBooking, "cancelled", cancelReason);
                setShowCancelModal(false);
                setSelectedBooking(null);
                setCancelReason("");
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleDeleteClick = (bookingId) => {
        setSelectedBooking(bookingId);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedBooking) {
            setActionLoading(true);
            try {
                await onDeleteBooking(selectedBooking);
                setShowDeleteModal(false);
                setSelectedBooking(null);
            } finally {
                setActionLoading(false);
            }
        }
    };

    const closeModals = () => {
        setShowCancelModal(false);
        setShowDeleteModal(false);
        setShowConfirmModal(false);
        setSelectedBooking(null);
        setCancelReason("");
        setActionLoading(false);
        setLoadingDocuments(false);
        setActiveDocumentTab('front');
        setDocumentType('');
        setDocumentData({});
        setDocumentErrors({});
        setDocumentUrls({});
        setSelectedBookingDocument(null);
    };

    const ActionButton = ({
        onClick,
        icon,
        label,
        variant = "default",
        disabled = false,
        className = ""
    }) => {
        const variants = {
            // Original variants
            default: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30",
            confirm: "bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30",
            cancel: "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/30",
            delete: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30",

            // Document status variants
            success: "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30",
            warning: "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30",
            danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30",
            primary: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30",
            info: "bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30",

            // Additional variants
            purple: "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30",
            indigo: "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30",
            pink: "bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border border-pink-500/30",
            teal: "bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 border border-teal-500/30",
        };

        return (
            <button
                onClick={onClick}
                disabled={disabled}
                className={`
                    inline-flex items-center gap-2 px-3 py-1.5 rounded-lg 
                    transition-all duration-200 font-medium text-sm 
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${variants[variant] || variants.default}
                    ${className}
                `}
            >
                <FontAwesomeIcon
                    icon={icon}
                    className={`w-4 h-4 ${icon === faSpinner ? 'animate-spin' : ''}`}
                />
                {label}
            </button>
        );
    };

    if (bookings.length === 0 && !loading) {
        return (
            <NoBookingsEmptyState />
        );
    }

    return (
        <>
            {loading ? (
                <TableSkeleton />
            ) : (
                <div className="bg-black rounded-xl shadow-xl overflow-hidden border border-neutral-700/50">
                    {/* Enhanced Pagination - Now at the top */}
                    {pagination?.pages > 1 && (
                        <div className="bg-black px-6 py-4 border-b border-neutral-800/70">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-neutral-400 font-medium">
                                        Page {pagination.page} of {pagination.pages}
                                    </span>
                                    <span className="text-xs text-neutral-500">•</span>
                                    <span className="text-sm text-neutral-400">
                                        {pagination.total || bookings.length} total bookings
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Previous Button */}
                                    <button
                                        onClick={() => onPageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="relative group inline-flex items-center px-3 py-2 rounded-lg border border-neutral-800 bg-black text-sm font-medium text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-800/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-x-0.5 disabled:hover:translate-x-0"
                                    >
                                        <svg className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Prev
                                    </button>

                                    {/* Page Numbers with Animation */}
                                    <div className="flex items-center gap-1">
                                        {(() => {
                                            const pages = Array.from({ length: pagination.pages }, (_, i) => i + 1);
                                            const maxVisible = 5;
                                            let visiblePages = pages;

                                            if (pagination.pages > maxVisible) {
                                                const current = pagination.page;
                                                let start = Math.max(1, current - 2);
                                                let end = Math.min(pagination.pages, current + 2);

                                                if (current <= 3) {
                                                    end = maxVisible;
                                                } else if (current >= pagination.pages - 2) {
                                                    start = pagination.pages - maxVisible + 1;
                                                }

                                                visiblePages = pages.slice(start - 1, end);

                                                if (start > 1) {
                                                    visiblePages = [1, '...', ...visiblePages.slice(1)];
                                                }
                                                if (end < pagination.pages) {
                                                    visiblePages = [...visiblePages.slice(0, -1), '...', pagination.pages];
                                                }
                                            }

                                            return visiblePages.map((pageNum, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
                                                    disabled={typeof pageNum !== 'number'}
                                                    className={`relative min-w-[2.5rem] h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${typeof pageNum === 'number'
                                                        ? pageNum === pagination.page
                                                            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105"
                                                            : "bg-black border border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white hover:border-neutral-700"
                                                        : "text-neutral-600 cursor-default"
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            ));
                                        })()}
                                    </div>

                                    {/* Next Button */}
                                    <button
                                        onClick={() => onPageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.pages}
                                        className="relative group inline-flex items-center px-3 py-2 rounded-lg border border-neutral-800 bg-black text-sm font-medium text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-800/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 transform hover:translate-x-0.5 disabled:hover:translate-x-0"
                                    >
                                        Next
                                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Scrollable Table with Enhanced Styling */}
                    <div
                        style={{
                            maxHeight: "calc(100vh - 320px)",
                            overflowY: "auto",
                            overflowX: "auto"
                        }}
                        className="scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900 hover:scrollbar-thumb-neutral-600"
                    >
                        <table className="w-full text-left border-collapse text-neutral-50 min-w-[1024px]">
                            <thead className="bg-black sticky top-0 z-20 text-sm border-b border-neutral-800/70">
                                <tr>
                                    {[
                                        "Booking ID",
                                        "User",
                                        "Apartment",
                                        "Dates",
                                        "Status",
                                        "Payment",
                                        "Amount",
                                        "Actions",
                                    ].map((th, idx) => (
                                        <th
                                            key={idx}
                                            className="p-4 text-left font-semibold text-neutral-300 uppercase tracking-wide group"
                                        >
                                            <div className="flex items-center gap-2">
                                                {th}
                                                <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                </svg>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-neutral-700/50 bg-black">
                                {bookings.map((booking, index) => (
                                    <tr
                                        key={booking.id}
                                        className="group hover:bg-neutral-900/80 transition-all duration-300 animate-fadeIn"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <div className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">
                                                        #{booking.id}
                                                    </div>
                                                    <div className="text-xs text-neutral-500 group-hover:text-neutral-400 transition-colors">
                                                        {new Date(booking.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* User Column */}
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">
                                                    {booking.user_name}
                                                </div>
                                                <div className="text-xs text-neutral-500 group-hover:text-neutral-400 transition-colors">
                                                    {booking.user_email}
                                                </div>
                                                <div className="text-xs text-neutral-500 group-hover:text-neutral-400 transition-colors">
                                                    {booking.user_phone}
                                                </div>
                                                {(() => {
                                                    const docStatus = booking.document_status || "pending";

                                                    const statusStyles = {
                                                        approved:
                                                            "bg-gradient-to-r from-green-500/20 to-green-600/10 text-green-400 border border-green-500/30",
                                                        rejected:
                                                            "bg-gradient-to-r from-red-500/20 to-red-600/10 text-red-400 border border-red-500/30",
                                                        pending:
                                                            "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 text-yellow-400 border border-yellow-500/30",
                                                    };

                                                    return (
                                                        <div
                                                            className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block transition-all duration-300 hover:scale-105 ${statusStyles[docStatus]}`}
                                                        >
                                                            Doc: {docStatus.charAt(0).toUpperCase() + docStatus.slice(1)}
                                                        </div>
                                                    );
                                                })()}

                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-neutral-200">
                                                {booking.apartment_title}
                                            </div>
                                            <div className="text-xs text-neutral-400">
                                                {booking.total_nights} nights
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="text-sm text-neutral-200">
                                                {new Date(booking.start_date).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-neutral-500 text-center">
                                                to
                                            </div>
                                            <div className="text-sm text-neutral-200">
                                                {new Date(booking.end_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            {getStatusBadge(booking.status)}
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            {getPaymentBadge(booking.payment_status)}
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-neutral-200">
                                                ₹{booking.total_amount || booking.paid_amount || "0"}
                                            </div>
                                            {booking.paid_amount && (
                                                <div className="text-xs text-neutral-400">
                                                    Paid: ₹{booking.paid_amount}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex flex-wrap gap-2">
                                                <ActionButton
                                                    onClick={() => onViewBooking(booking)}
                                                    icon={faEye}
                                                    label="View"
                                                    variant="default"
                                                />

                                                {/* Document Verify / Verified Button */}
                                                {canShowVerifyButton(booking.status) && (() => {
                                                    const docConfig = getDocumentActionConfig(booking.document_status);

                                                    return (
                                                        <div className="relative group">
                                                            <ActionButton
                                                                onClick={() => {
                                                                    if (!docConfig.disabled) {
                                                                        handleQuickStatusUpdate(booking.id, "confirmed");
                                                                    }
                                                                }}
                                                                icon={docConfig.icon}
                                                                label={docConfig.label}
                                                                variant={docConfig.variant}
                                                                disabled={docConfig.disabled}
                                                                className={docConfig.disabled ? 'cursor-not-allowed opacity-60' : ''}
                                                            />
                                                            {docConfig.disabled && docConfig.tooltip && (
                                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                                    {docConfig.tooltip}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}

                                                {/* Cancel button — fully hidden when not allowed */}
                                                {canShowCancelButton(booking.status) && (
                                                    <ActionButton
                                                        onClick={() => handleQuickStatusUpdate(booking.id, "cancelled")}
                                                        icon={faBan}
                                                        label="Cancel"
                                                        variant="cancel"
                                                    />
                                                )}

                                                <ActionButton
                                                    onClick={() => handleDeleteClick(booking.id)}
                                                    icon={faTrash}
                                                    label="Delete"
                                                    variant="delete"
                                                />
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-black rounded-xl border border-neutral-800 p-6 w-full max-w-5xl my-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <div className="bg-green-500/20 p-2 rounded-lg mr-3">
                                    <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6 text-green-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-200">
                                    Confirm Booking with Document Verification
                                </h3>
                            </div>
                            <button
                                onClick={closeModals}
                                className="text-neutral-400 hover:text-neutral-300 transition"
                            >
                                <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Document Images */}
                            <div className="space-y-4">
                                <h4 className="text-md font-medium text-neutral-300 mb-2">
                                    Document Images
                                </h4>

                                {loadingDocuments ? (
                                    <div className="flex items-center justify-center h-64 bg-neutral-800/50 rounded-lg border border-neutral-700">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                                    </div>
                                ) : Object.keys(documentUrls).length > 0 ? (
                                    <>
                                        {/* Tab Navigation */}
                                        <div className="flex space-x-2 border-b border-neutral-700">
                                            {Object.keys(documentUrls).map(tab => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveDocumentTab(tab)}
                                                    className={`px-4 py-2 text-sm font-medium transition ${activeDocumentTab === tab
                                                        ? 'text-green-400 border-b-2 border-green-400'
                                                        : 'text-neutral-400 hover:text-neutral-300'
                                                        }`}
                                                >
                                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Image Display */}
                                        <div className="bg-neutral-800/50 rounded-lg border border-neutral-700 p-4">
                                            {documentUrls[activeDocumentTab] && (
                                                <div className="space-y-3">
                                                    <img
                                                        src={documentUrls[activeDocumentTab]}
                                                        alt={`${activeDocumentTab} view`}
                                                        className="w-full h-auto max-h-72 object-contain rounded-lg"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23222'/%3E%3Ctext x='100' y='75' text-anchor='middle' fill='%23666' font-family='Arial' font-size='14'%3EImage not available%3C/text%3E%3C/svg%3E";
                                                        }}
                                                    />
                                                    <div className="text-xs text-neutral-400 text-center">
                                                        Click on tabs to switch between views
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Image URLs List */}
                                        <div className="bg-neutral-800/30 rounded-lg p-4 border border-neutral-700">
                                            <h5 className="text-sm font-medium text-neutral-300 mb-2">Document URLs</h5>
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {Object.entries(documentUrls).map(([key, url]) => (
                                                    <div key={key} className="flex items-center justify-between text-xs">
                                                        <span className="text-neutral-400">{key}:</span>
                                                        <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-green-400 hover:text-green-300 truncate max-w-[200px]"
                                                            title={url}
                                                        >
                                                            Open in new tab
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 bg-neutral-800/50 rounded-lg border border-neutral-700 p-4">
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="w-12 h-12 text-neutral-600 mb-3" />
                                        <p className="text-neutral-400 text-center">No document images found for this booking</p>
                                        <p className="text-neutral-500 text-sm text-center mt-1">
                                            The user may not have uploaded any documents for this booking.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Document Details Form */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-md font-medium text-neutral-300">
                                        Enter Document Details
                                    </h4>
                                    <span className="text-xs text-neutral-500">
                                        Verify against the images
                                    </span>
                                </div>

                                {/* Document Type Display */}
                                {selectedBookingDocument && (
                                    <div className="bg-neutral-800/30 rounded-lg p-4 border border-neutral-700">
                                        <p className="text-sm text-neutral-300">
                                            <span className="font-medium">Document Type:</span>{' '}
                                            {getDocumentTypeLabel(selectedBookingDocument.document_type)}
                                        </p>
                                        <p className="text-xs text-neutral-400 mt-1">
                                            Uploaded: {new Date(selectedBookingDocument.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                {/* Document Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Select Document Type <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={documentType}
                                            onChange={(e) => handleDocumentTypeChange(e.target.value)}
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/30 appearance-none"
                                        >
                                            <option value="">-- Select Document Type --</option>
                                            <option value="aadhaar">Aadhaar Card</option>
                                            <option value="pan">PAN Card</option>
                                            <option value="driving_license">Driving License</option>
                                            <option value="passport">Passport</option>
                                            <option value="voter_id">Voter ID</option>
                                        </select>
                                        <FontAwesomeIcon
                                            icon={faChevronDown}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none"
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Form Fields */}
                                {documentType && (
                                    <div className="space-y-4 max-h-96 overflow-y-auto px-2 py-1">
                                        {documentSchemas[documentType]?.required.map((field) => (
                                            <div key={field} className="space-y-2">
                                                <label className="block text-sm font-medium text-neutral-300">
                                                    {documentSchemas[documentType].labels[field]} <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    type={field.includes('_url') ? 'url' :
                                                        field.includes('dob') || field.includes('date') ? 'date' : 'text'}
                                                    value={documentData[field] || ''}
                                                    onChange={(e) => handleDocumentFieldChange(field, e.target.value)}
                                                    placeholder={`Enter ${documentSchemas[documentType].labels[field]}`}
                                                    className={`w-full bg-neutral-800 border ${documentErrors[field] ? 'border-red-500/50' : 'border-neutral-700'} rounded-lg px-4 py-3 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/30`}
                                                />
                                                {documentErrors[field] && (
                                                    <p className="text-sm text-red-400">{documentErrors[field]}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <p className="text-neutral-400 text-sm pt-4 border-t border-neutral-800">
                                    Compare the document details with the images before confirming the booking.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-neutral-800">
                            <button
                                onClick={closeModals}
                                disabled={actionLoading}
                                className="flex items-center px-4 py-2 text-neutral-400 hover:text-neutral-300 transition disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2" />
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (validateDocument()) {
                                        handleConfirmBooking();
                                    }
                                }}
                                disabled={actionLoading || Object.keys(documentUrls).length === 0}
                                className="flex items-center px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition disabled:opacity-50"
                                title={Object.keys(documentUrls).length === 0 ? "No document images available" : ""}
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-2"></div>
                                        Confirming...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-2" />
                                        Confirm with Document Verification
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleRejectDocument}
                                className="flex items-center px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition disabled:opacity-50"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-black rounded-xl border border-neutral-800 p-6 w-xl">
                        <div className="flex items-center mb-4">
                            <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                                <FontAwesomeIcon icon={faBan} className="w-6 h-6 text-yellow-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-200">
                                Cancel Booking
                            </h3>
                        </div>
                        <p className="text-neutral-400 mb-4">
                            Please provide a reason for cancellation:
                        </p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Enter cancellation reason..."
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            rows="3"
                        />
                        <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-neutral-800">
                            <button
                                onClick={closeModals}
                                disabled={actionLoading}
                                className="flex items-center px-4 py-2 text-neutral-400 hover:text-neutral-300 transition disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2" />
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmCancel}
                                disabled={actionLoading}
                                className="flex items-center px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faBan} className="w-4 h-4 mr-2" />
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-black rounded-xl border border-neutral-800 p-6 w-full max-w-md">
                        <div className="flex items-center mb-4">
                            <div className="bg-red-500/20 p-2 rounded-lg mr-3">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-200">
                                Delete Booking
                            </h3>
                        </div>
                        <p className="text-neutral-400 mb-6">
                            Are you sure you want to delete this booking? This action cannot be undone and all booking data will be permanently removed.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeModals}
                                disabled={actionLoading}
                                className="flex items-center px-4 py-2 text-neutral-400 hover:text-neutral-300 transition disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2" />
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={actionLoading}
                                className="flex items-center px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4 mr-2" />
                                        Delete Booking
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BookingsList;