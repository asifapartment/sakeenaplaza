'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTags,
    faPlusCircle,
    faEdit,
    faTrashAlt,
    faPaperPlane,
    faSpinner,
    faPercent,
    faCalendarAlt,
    faClock,
    faBolt,
    faCalendarTimes,
    faCalendar,
    faBuilding,
    faHashtag,
    faInfoCircle,
    faBell,
    faSave,
    faMagic,
    faGift,
    faAlignLeft,
    faHeading,
    faTimes,
    faList,
    faEnvelope,
    faGridHorizontal
} from '@fortawesome/free-solid-svg-icons';

export default function OffersPage() {
    const router = useRouter();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [sendingEmail, setSendingEmail] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [filterStatus, setFilterStatus] = useState('all');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discount_percentage: '',
        apartment_ids: '',
        valid_from: '',
        valid_until: ''
    });

    // Fetch all offers
    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const response = await fetch('/api/offers');
            const data = await response.json();

            if (data.success) {
                setOffers(data.offers);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
            toast.error('Failed to load offers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                ...formData,
                apartment_ids: formData.apartment_ids
                    ? formData.apartment_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
                    : null,
                discount_percentage: parseFloat(formData.discount_percentage)
            };

            if (isEditing && editingId) {
                payload.id = editingId;

                const response = await fetch('/api/offers', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (data.success) {
                    toast.success('Offer updated successfully!');
                    resetFormAndCloseModal();
                    fetchOffers();
                } else {
                    toast.error(data.error || 'Failed to update offer');
                }
            } else {
                const response = await fetch('/api/offers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (data.success) {
                    toast.success('Offer created successfully!');
                    resetFormAndCloseModal();
                    fetchOffers();

                    if (confirm('Offer created successfully! Do you want to send email notifications to all users now?')) {
                        handleSendEmail(data.offerId);
                    }
                } else {
                    toast.error(data.error || 'Failed to create offer');
                }
            }
        } catch (error) {
            console.error('Error saving offer:', error);
            toast.error(`Failed to ${isEditing ? 'update' : 'create'} offer`);
        }
    };

    const handleSendEmail = async (offerId) => {
        setSendingEmail(offerId);

        try {
            const response = await fetch('/api/offers', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ offerId }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);

                setOffers(prevOffers =>
                    prevOffers.map(offer =>
                        offer.id === offerId
                            ? { ...offer, last_sent_at: new Date().toISOString() }
                            : offer
                    )
                );
            } else {
                toast.error(data.error || 'Failed to send emails');
            }
        } catch (error) {
            console.error('Error sending emails:', error);
            toast.error('Failed to send emails');
        } finally {
            setSendingEmail(null);
        }
    };

    const parseApartmentIds = (value) => {
        if (!value) return '';

        if (Array.isArray(value)) {
            return value.join(', ');
        }

        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);

                if (Array.isArray(parsed)) {
                    return parsed.join(', ');
                }

                if (parsed?.ids && Array.isArray(parsed.ids)) {
                    return parsed.ids.join(', ');
                }

                return value;
            } catch {
                return value;
            }
        }

        return '';
    };

    const handleEdit = (offer) => {
        setIsEditing(true);
        setEditingId(offer.id);

        setFormData({
            title: offer.title,
            description: offer.description || '',
            discount_percentage: offer.discount_percentage.toString(),
            apartment_ids: parseApartmentIds(offer.apartment_ids),
            valid_from: new Date(offer.valid_from).toISOString().split('T')[0],
            valid_until: new Date(offer.valid_until).toISOString().split('T')[0],
        });

        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this offer?')) return;

        try {
            const response = await fetch(`/api/offers/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Offer deleted successfully');
                fetchOffers();
            } else {
                toast.error(data.error || 'Failed to delete offer');
            }
        } catch (error) {
            console.error('Error deleting offer:', error);
            toast.error('Failed to delete offer');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetFormAndCloseModal = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({
            title: '',
            description: '',
            discount_percentage: '',
            apartment_ids: '',
            valid_from: '',
            valid_until: ''
        });
        setShowModal(false);
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({
            title: '',
            description: '',
            discount_percentage: '',
            apartment_ids: '',
            valid_from: '',
            valid_until: ''
        });
        setShowModal(true);
    };

    const getOfferStatus = (offer) => {
        const now = new Date();
        const start = new Date(offer.valid_from);
        const end = new Date(offer.valid_until);

        if (end < now) return 'expired';
        if (start > now) return 'upcoming';
        return 'active';
    };

    const filteredOffers = offers.filter(offer => {
        if (filterStatus === 'all') return true;
        return getOfferStatus(offer) === filterStatus;
    });

    const InteractiveFlipCard = ({ offer, onEdit, onSend, onDelete, sendingEmail }) => {
        const status = getOfferStatus(offer);
        const isActive = status === 'active';
        const daysLeft = Math.ceil((new Date(offer.valid_until) - new Date()) / (1000 * 60 * 60 * 24));

        // Get status-based gradient colors
        const getFrontGradient = () => {
            switch (status) {
                case 'active': return 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)';
                case 'upcoming': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                case 'expired': return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
                default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }
        };

        const getBackGradient = () => {
            switch (status) {
                case 'active': return 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)';
                case 'upcoming': return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
                case 'expired': return 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)';
                default: return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
            }
        };

        return (
            <div className="flip-card">
                <div className="flip-card-inner">
                    {/* Front of card - Promotional View */}
                    <div
                        className="flip-card-front p-6 flex flex-col items-center justify-between"
                        style={{ background: getFrontGradient() }}
                    >
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                        {/* Content */}
                        <div className="relative z-10 w-full">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-white/80 text-sm font-medium uppercase tracking-wider">
                                    Limited Time
                                </span>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${status === 'active' ? 'bg-green-400 text-green-900' :
                                    status === 'upcoming' ? 'bg-yellow-400 text-yellow-900' :
                                        'bg-gray-400 text-gray-900'
                                    }`}>
                                    {status}
                                </span>
                            </div>

                            <div className="text-center mb-6">
                                <div className="text-6xl font-bold text-white mb-2">
                                    {offer.discount_percentage}%
                                </div>
                                <div className="text-2xl font-semibold text-white mb-1">
                                    OFF
                                </div>
                                <div className="text-white/90 text-lg font-medium">
                                    {offer.title}
                                </div>
                            </div>

                            <div className="text-white/80 text-sm text-center">
                                {new Date(offer.valid_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(offer.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                        </div>

                        <div className="relative z-10 text-white/60 text-xs mt-4">
                            Hover to see details
                        </div>
                    </div>

                    {/* Back of card - Management View */}
                    <div
                        className="flip-card-back p-6 flex flex-col justify-between"
                        style={{ background: getBackGradient() }}
                    >
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mt-16"></div>
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mb-12"></div>

                        <div className="relative z-10">
                            <h3 className="text-white text-xl font-bold mb-4 text-center">
                                {offer.title}
                            </h3>

                            <div className="space-y-3 text-white/90">
                                {/* Apartment IDs */}
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faBuilding} className="w-4 h-4" />
                                    <span className="text-sm">
                                        {offer.apartment_ids ? parseApartmentIds(offer.apartment_ids) : 'All apartments'}
                                    </span>
                                </div>

                                {/* Email stats */}
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
                                    <span className="text-sm">
                                        {offer.last_sent_at ? `Sent: ${new Date(offer.last_sent_at).toLocaleDateString()}` : 'Not sent yet'}
                                    </span>
                                </div>

                                {/* Days left */}
                                {isActive && (
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
                                        <span className="text-sm">
                                            {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                                        </span>
                                    </div>
                                )}

                                {/* Description if exists */}
                                {offer.description && (
                                    <div className="mt-3 pt-3 border-t border-white/20">
                                        <p className="text-sm text-white/80 line-clamp-2">
                                            {offer.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="relative z-10 flex justify-center gap-3 mt-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(offer);
                                }}
                                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center text-white"
                                title="Edit Offer"
                            >
                                <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSend(offer.id);
                                }}
                                disabled={sendingEmail === offer.id || !isActive}
                                className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${isActive
                                    ? 'bg-white/20 hover:bg-white/30 text-white'
                                    : 'bg-gray-500/30 text-gray-300 cursor-not-allowed'
                                    }`}
                                title={isActive ? "Send Email" : "Cannot send email"}
                            >
                                {sendingEmail === offer.id ? (
                                    <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                                ) : (
                                    <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                                )}
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(offer.id);
                                }}
                                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center text-white"
                                title="Delete Offer"
                            >
                                <FontAwesomeIcon icon={faTrashAlt} className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Skeleton Loading Component - Matches InteractiveFlipCard structure
    const SkeletonCard = () => (
        <div className="flip-card animate-pulse">
            <div className="flip-card-inner">
                {/* Front Skeleton */}
                <div className="flip-card-front bg-gradient-to-r from-gray-300 to-gray-400 dark:from-neutral-700 dark:to-neutral-600 p-6 flex flex-col items-center justify-between">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                    {/* Content skeleton */}
                    <div className="relative z-10 w-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-4 bg-white/30 rounded w-20"></div>
                            <div className="h-6 bg-white/30 rounded-full w-16"></div>
                        </div>

                        <div className="text-center mb-6">
                            <div className="h-16 bg-white/30 rounded-lg w-24 mx-auto mb-2"></div>
                            <div className="h-8 bg-white/30 rounded w-16 mx-auto mb-1"></div>
                            <div className="h-6 bg-white/30 rounded w-32 mx-auto"></div>
                        </div>

                        <div className="h-4 bg-white/30 rounded w-40 mx-auto"></div>
                    </div>

                    <div className="h-3 bg-white/30 rounded w-24 mx-auto"></div>
                </div>

                {/* Back Skeleton */}
                <div className="flip-card-back bg-gradient-to-r from-gray-400 to-gray-500 dark:from-neutral-600 dark:to-neutral-700 p-6 flex flex-col justify-between">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mt-16"></div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mb-12"></div>

                    <div className="relative z-10">
                        <div className="h-6 bg-white/30 rounded w-32 mx-auto mb-4"></div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-white/30 rounded"></div>
                                <div className="h-4 bg-white/30 rounded flex-1"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-white/30 rounded"></div>
                                <div className="h-4 bg-white/30 rounded flex-1"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-white/30 rounded"></div>
                                <div className="h-4 bg-white/30 rounded flex-1"></div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-white/20">
                                <div className="h-4 bg-white/30 rounded w-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons skeleton */}
                    <div className="relative z-10 flex justify-center gap-3 mt-4">
                        <div className="w-10 h-10 bg-white/30 rounded-full"></div>
                        <div className="w-10 h-10 bg-white/30 rounded-full"></div>
                        <div className="w-10 h-10 bg-white/30 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Header Skeleton Component
    const HeaderSkeleton = () => (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 animate-pulse">
            <div className="space-y-2">
                <div className="h-8 bg-gray-300 dark:bg-neutral-700 rounded w-48"></div>
                <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-64"></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex bg-gray-200 dark:bg-neutral-800 rounded-lg p-1">
                    <div className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-neutral-700 w-16"></div>
                    <div className="px-4 py-2 rounded-lg w-16"></div>
                </div>
                <div className="h-10 bg-gray-300 dark:bg-neutral-700 rounded-lg w-32"></div>
            </div>
        </div>
    );

    // Filter Tabs Skeleton
    const FilterSkeleton = () => (
        <div className="flex flex-wrap gap-2 mb-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-gray-200 dark:bg-neutral-800 rounded-xl w-24"></div>
            ))}
        </div>
    );

    // Stats Cards Skeleton
    const StatsSkeleton = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gradient-to-r from-gray-300 to-gray-400 dark:from-neutral-700 dark:to-neutral-600 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 bg-white/30 rounded-xl"></div>
                        <div className="w-12 h-8 bg-white/30 rounded"></div>
                    </div>
                    <div className="h-4 bg-white/30 rounded w-20"></div>
                </div>
            ))}
        </div>
    );

    // Grid View Skeleton
    const GridSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );

    // Compact List View Skeleton
    const CompactListSkeleton = () => (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-200 dark:bg-neutral-700/50 border-b dark:border-neutral-700">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`h-4 bg-gray-300 dark:bg-neutral-600 rounded ${i === 1 ? 'col-span-4' : 'col-span-2'}`}></div>
                ))}
            </div>

            {/* Rows */}
            {[1, 2, 3, 4].map((row) => (
                <div key={row} className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b dark:border-neutral-700">
                    <div className="col-span-4 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-1/2"></div>
                    </div>
                    <div className="col-span-2">
                        <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-16"></div>
                    </div>
                    <div className="col-span-2 space-y-1">
                        <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-12"></div>
                        <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-16"></div>
                    </div>
                    <div className="col-span-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-300 dark:bg-neutral-600 rounded-full"></div>
                            <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-12"></div>
                        </div>
                    </div>
                    <div className="col-span-2 flex justify-end gap-2">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-neutral-700 rounded-lg"></div>
                        <div className="w-8 h-8 bg-gray-200 dark:bg-neutral-700 rounded-lg"></div>
                        <div className="w-8 h-8 bg-gray-200 dark:bg-neutral-700 rounded-lg"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                {/* Add flip card styles for skeleton too */}
                <style jsx global>{`
                    .flip-card {
                        background-color: transparent;
                        perspective: 1000px;
                        height: 280px;
                    }
                    .flip-card-inner {
                        position: relative;
                        width: 100%;
                        height: 100%;
                        transform-style: preserve-3d;
                    }
                    .flip-card-front, .flip-card-back {
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        backface-visibility: hidden;
                        -webkit-backface-visibility: hidden;
                        border-radius: 1rem;
                        overflow: hidden;
                    }
                    .flip-card-front {
                        transform: rotateY(0deg);
                    }
                    .flip-card-back {
                        transform: rotateY(180deg);
                    }
                `}</style>

                <HeaderSkeleton />
                <FilterSkeleton />
                <StatsSkeleton />

                {/* Conditionally show grid or list skeleton based on viewMode */}
                {viewMode === 'grid' ? <GridSkeleton /> : <CompactListSkeleton />}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Add flip card styles - Using global style to ensure they apply */}
            <style jsx global>{`
                .flip-card {
                    background-color: transparent;
                    perspective: 1000px;
                    height: 280px;
                }

                .flip-card-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    text-align: center;
                    transition: transform 0.8s cubic-bezier(0.4, 0.2, 0.2, 1);
                    transform-style: preserve-3d;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }

                .flip-card:hover .flip-card-inner {
                    transform: rotateY(180deg);
                }

                .flip-card-front, .flip-card-back {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                    border-radius: 1rem;
                    overflow: hidden;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .flip-card-front {
                    transform: rotateY(0deg);
                }

                .flip-card-back {
                    transform: rotateY(180deg);
                }

                /* Ensure 3D effect works in all browsers */
                .flip-card-inner {
                    -webkit-transform-style: preserve-3d;
                    -moz-transform-style: preserve-3d;
                    transform-style: preserve-3d;
                }

                .flip-card-front, .flip-card-back {
                    -webkit-backface-visibility: hidden;
                    -moz-backface-visibility: hidden;
                    backface-visibility: hidden;
                }
            `}</style>

            {/* Header with Add Button and Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Special Offers
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Create and manage promotional offers for your apartments</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    {/* View Mode Toggle */}
                    <div className="flex bg-gray-100 dark:bg-neutral-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${viewMode === 'grid'
                                ? 'bg-white dark:bg-neutral-700 shadow-md text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            <FontAwesomeIcon icon={faGridHorizontal} className="w-4 h-4" />
                            <span className="hidden sm:inline">Grid</span>
                        </button>
                        <button
                            onClick={() => setViewMode('compact')}
                            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${viewMode === 'compact'
                                ? 'bg-white dark:bg-neutral-700 shadow-md text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            <FontAwesomeIcon icon={faList} className="w-4 h-4" />
                            <span className="hidden sm:inline">Compact</span>
                        </button>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5"
                    >
                        <FontAwesomeIcon icon={faPlusCircle} className="w-4 h-4" />
                        Add New Offer
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {[
                    { value: 'all', label: 'All Offers', icon: faTags },
                    { value: 'active', label: 'Active', icon: faBolt },
                    { value: 'upcoming', label: 'Upcoming', icon: faClock },
                    { value: 'expired', label: 'Expired', icon: faCalendarTimes }
                ].map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setFilterStatus(filter.value)}
                        className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${filterStatus === filter.value
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
                            }`}
                    >
                        <FontAwesomeIcon icon={filter.icon} className="w-4 h-4" />
                        {filter.label}
                        {filter.value !== 'all' && (
                            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/20">
                                {offers.filter(o => getOfferStatus(o) === filter.value).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <FontAwesomeIcon icon={faTags} className="w-6 h-6" />
                        </div>
                        <span className="text-4xl font-bold">{offers.length}</span>
                    </div>
                    <p className="text-blue-100">Total Offers</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <FontAwesomeIcon icon={faBolt} className="w-6 h-6" />
                        </div>
                        <span className="text-4xl font-bold">
                            {offers.filter(o => getOfferStatus(o) === 'active').length}
                        </span>
                    </div>
                    <p className="text-green-100">Active Now</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <FontAwesomeIcon icon={faClock} className="w-6 h-6" />
                        </div>
                        <span className="text-4xl font-bold">
                            {offers.filter(o => getOfferStatus(o) === 'upcoming').length}
                        </span>
                    </div>
                    <p className="text-yellow-100">Upcoming</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <FontAwesomeIcon icon={faPaperPlane} className="w-6 h-6" />
                        </div>
                        <span className="text-4xl font-bold">
                            {offers.filter(o => o.last_sent_at).length}
                        </span>
                    </div>
                    <p className="text-purple-100">Emails Sent</p>
                </div>
            </div>

            {/* Offers Grid/List */}
            {filteredOffers.length === 0 ? (
                <div className="text-center py-16 px-4 bg-gradient-to-br from-white to-gray-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl shadow-xl">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
                        <FontAwesomeIcon icon={faTags} className="text-gray-400 text-3xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {filterStatus === 'all' ? 'No offers yet' : `No ${filterStatus} offers`}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        {filterStatus === 'all'
                            ? 'Create your first special offer to attract more customers'
                            : `No offers are currently ${filterStatus}. Try creating a new offer or changing the filter.`}
                    </p>
                    <button
                        onClick={openCreateModal}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-3 transform hover:-translate-y-0.5"
                    >
                        <FontAwesomeIcon icon={faMagic} className="w-5 h-5" />
                        Create New Offer
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                // Grid View - Interactive Flip Cards
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOffers.map((offer) => (
                        <InteractiveFlipCard
                            key={offer.id}
                            offer={offer}
                            onEdit={handleEdit}
                            onSend={handleSendEmail}
                            onDelete={handleDelete}
                            sendingEmail={sendingEmail}
                        />
                    ))}
                </div>
            ) : (
                        // Compact List View - Streamlined Design
                        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-neutral-700/50 border-b dark:border-neutral-700 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <div className="col-span-4">Offer</div>
                                <div className="col-span-2">Discount</div>
                                <div className="col-span-2">Validity</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-2 text-right">Actions</div>
                            </div>

                            {/* Table Rows */}
                            <div className="divide-y dark:divide-neutral-700">
                                {filteredOffers.map((offer) => {
                                    const status = getOfferStatus(offer);
                                    const isActive = status === 'active';
                                    const canSendEmail = isActive;
                                    const daysLeft = Math.ceil((new Date(offer.valid_until) - new Date()) / (1000 * 60 * 60 * 24));

                                    return (
                                        <div
                                            key={offer.id}
                                            className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
                                        >
                                            {/* Offer - Title & Description */}
                                            <div className="col-span-4">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {offer.title}
                                                </div>
                                                {offer.description && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                                        {offer.description}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Discount */}
                                            <div className="col-span-2">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-semibold ${status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        status === 'upcoming' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {offer.discount_percentage}% OFF
                                                </span>
                                            </div>

                                            {/* Validity */}
                                            <div className="col-span-2">
                                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                                    <div>{new Date(offer.valid_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                                    <div className="text-gray-400 dark:text-gray-500">to {new Date(offer.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                                </div>
                                            </div>

                                            {/* Status with Days Left */}
                                            <div className="col-span-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse' :
                                                            status === 'upcoming' ? 'bg-yellow-500' :
                                                                'bg-gray-400'
                                                        }`}></span>
                                                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                                        {status}
                                                    </span>
                                                    {isActive && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            ({daysLeft}d left)
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Apartment IDs - Compact */}
                                                {offer.apartment_ids && (
                                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate max-w-[120px]">
                                                        <FontAwesomeIcon icon={faBuilding} className="w-3 h-3 mr-1" />
                                                        {parseApartmentIds(offer.apartment_ids)}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="col-span-2 flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleEdit(offer)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleSendEmail(offer.id)}
                                                    disabled={sendingEmail === offer.id || !canSendEmail}
                                                    className={`p-2 rounded-lg transition-colors ${canSendEmail
                                                            ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                                                            : 'text-gray-400 cursor-not-allowed'
                                                        }`}
                                                    title={canSendEmail ? "Send Email" : "Cannot send"}
                                                >
                                                    {sendingEmail === offer.id ? (
                                                        <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(offer.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <FontAwesomeIcon icon={faTrashAlt} className="w-4 h-4" />
                                                </button>

                                                {/* Email Sent Indicator */}
                                                {offer.last_sent_at && (
                                                    <div className="ml-1 text-xs text-gray-400 dark:text-gray-500" title={`Last sent: ${new Date(offer.last_sent_at).toLocaleString()}`}>
                                                        <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                </div>
            )}

            {/* Modal for Create/Edit Offer Form */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-neutral-700 animate-slideUp">
                        {/* Modal Header */}
                        <div className="p-6 border-b dark:border-neutral-700 bg-gradient-to-r from-gray-50 to-white dark:from-neutral-800 dark:to-neutral-900">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${isEditing ? 'from-yellow-400 to-orange-400' : 'from-blue-400 to-indigo-400'}`}>
                                        <FontAwesomeIcon icon={isEditing ? faEdit : faGift} className="text-white w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {isEditing ? 'Edit Offer' : 'Create New Offer'}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {isEditing ? 'Update your offer details' : 'Create an amazing offer for your customers'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={resetFormAndCloseModal}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="text-xl text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                            <FontAwesomeIcon icon={faHeading} className="mr-2 text-blue-500 w-4 h-4" />
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:text-white transition-all duration-200"
                                            placeholder="e.g., Summer Special 2024"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                            <FontAwesomeIcon icon={faPercent} className="mr-2 text-green-500 w-4 h-4" />
                                            Discount Percentage *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="discount_percentage"
                                                value={formData.discount_percentage}
                                                onChange={handleChange}
                                                min="1"
                                                max="100"
                                                step="0.01"
                                                className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-neutral-800 dark:text-white transition-all duration-200"
                                                placeholder="20"
                                                required
                                            />
                                            <div className="absolute left-4 top-3 text-gray-500">
                                                <FontAwesomeIcon icon={faPercent} className="w-4 h-4" />
                                            </div>
                                            <div className="absolute right-4 top-3 text-gray-500 text-sm">
                                                % OFF
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                        <FontAwesomeIcon icon={faAlignLeft} className="mr-2 text-purple-500 w-4 h-4" />
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-neutral-800 dark:text-white transition-all duration-200 resize-none"
                                        rows="3"
                                        placeholder="Describe what makes this offer special and any terms & conditions..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                            <FontAwesomeIcon icon={faCalendar} className="mr-2 text-blue-500 w-4 h-4" />
                                            Start Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="valid_from"
                                            value={formData.valid_from}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:text-white transition-all duration-200"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                            <FontAwesomeIcon icon={faCalendarTimes} className="mr-2 text-red-500 w-4 h-4" />
                                            End Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="valid_until"
                                            value={formData.valid_until}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-neutral-800 dark:text-white transition-all duration-200"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                            <FontAwesomeIcon icon={faBuilding} className="mr-2 text-yellow-500 w-4 h-4" />
                                            Apartment IDs
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="apartment_ids"
                                                value={formData.apartment_ids}
                                                onChange={handleChange}
                                                placeholder="101, 205, 307"
                                                className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-neutral-800 dark:text-white transition-all duration-200"
                                            />
                                            <div className="absolute left-4 top-3 text-gray-500">
                                                <FontAwesomeIcon icon={faHashtag} className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            <FontAwesomeIcon icon={faInfoCircle} className="mr-1 w-3 h-3" />
                                            Leave empty to apply to all apartments
                                        </p>
                                    </div>
                                </div>

                                {/* Email Notice */}
                                {!isEditing && (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                                                <FontAwesomeIcon icon={faBell} className="text-blue-500 w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-blue-800 dark:text-blue-300">Email Notification</h4>
                                                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                                    After creating this offer, we'll ask if you want to notify all registered users via email immediately.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Modal Footer */}
                                <div className="flex justify-end gap-4 pt-6 border-t dark:border-neutral-700">
                                    <button
                                        type="button"
                                        onClick={resetFormAndCloseModal}
                                        className="px-6 py-3 border border-gray-300 dark:border-neutral-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-all duration-200 flex items-center gap-2"
                                    >
                                        <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5"
                                    >
                                        <FontAwesomeIcon icon={isEditing ? faSave : faPlusCircle} className="w-4 h-4" />
                                        {isEditing ? 'Update Offer' : 'Create Offer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}