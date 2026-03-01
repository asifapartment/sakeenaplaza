// app/dashboard/components/UserActivity.js
'use client';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCircle,
    faUser,
    faCalendar,
    faEdit,
    faLock,
    faCheck,
    faWarning,
    faClock,
    faArrowRight,
    faReceipt,
    faHome,
    faUsers,
    faPaperPlane,
    faCreditCard,
    faBan,
    faCheckCircle,
    faExclamationTriangle,
    faSpinner,
    faStar,
    faMapMarkerAlt,
    faBed,
    faCalendarAlt,
    faEye,
    faTrash,
    faChevronDown,
    faChevronUp,
    faFilter,
    faSearch,
    faTimes,
    faBell,
    faHistory,
    faSync
} from '@fortawesome/free-solid-svg-icons';

// Activity type configurations
const ACTIVITY_TYPES = {
    PROFILE_UPDATE: {
        icon: faEdit,
        color: 'amber',
        label: 'Profile Update',
        gradient: 'from-amber-500/20 to-amber-600/20',
        border: 'border-amber-500/40'
    },
    SECURITY: {
        icon: faLock,
        color: 'emerald',
        label: 'Security',
        gradient: 'from-emerald-500/20 to-emerald-600/20',
        border: 'border-emerald-500/40'
    },
    SUCCESS: {
        icon: faCheckCircle,
        color: 'emerald',
        label: 'Success',
        gradient: 'from-emerald-500/20 to-emerald-600/20',
        border: 'border-emerald-500/40'
    },
    WARNING: {
        icon: faWarning,
        color: 'rose',
        label: 'Warning',
        gradient: 'from-rose-500/20 to-rose-600/20',
        border: 'border-rose-500/40'
    },
    BOOKING: {
        icon: faCalendar,
        color: 'blue',
        label: 'Booking',
        gradient: 'from-blue-500/20 to-blue-600/20',
        border: 'border-blue-500/40'
    },
    PAYMENT: {
        icon: faCreditCard,
        color: 'amber',
        label: 'Payment',
        gradient: 'from-amber-500/20 to-amber-600/20',
        border: 'border-amber-500/40'
    },
    CANCELLATION: {
        icon: faBan,
        color: 'rose',
        label: 'Cancellation',
        gradient: 'from-rose-500/20 to-rose-600/20',
        border: 'border-rose-500/40'
    },
    EMAIL: {
        icon: faPaperPlane,
        color: 'emerald',
        label: 'Email',
        gradient: 'from-emerald-500/20 to-emerald-600/20',
        border: 'border-emerald-500/40'
    },
    VIEW: {
        icon: faEye,
        color: 'blue',
        label: 'Viewed',
        gradient: 'from-blue-500/20 to-blue-600/20',
        border: 'border-blue-500/40'
    },
    DELETE: {
        icon: faTrash,
        color: 'rose',
        label: 'Deleted',
        gradient: 'from-rose-500/20 to-rose-600/20',
        border: 'border-rose-500/40'
    }
};

// Helper function to get activity configuration
const getActivityConfig = (type) => {
    const config = ACTIVITY_TYPES[type?.toUpperCase()] || ACTIVITY_TYPES.PROFILE_UPDATE;
    return {
        ...config,
        iconColor: `text-${config.color}-400`,
        bgColor: `bg-${config.color}-500/10`,
        borderColor: `border-${config.color}-500/20`
    };
};

// Skeleton Loading Component
export const UserActivitySkeleton = () => {
    return (
        <div className="relative bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 rounded-2xl overflow-hidden animate-pulse">
            {/* Header skeleton */}
            <div className="p-6 border-b border-neutral-700/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-neutral-700/80 rounded-xl"></div>
                        <div>
                            <div className="h-5 w-40 bg-neutral-700 rounded mb-2"></div>
                            <div className="h-3 w-60 bg-neutral-700 rounded"></div>
                        </div>
                    </div>
                    <div className="h-9 w-32 bg-neutral-700 rounded-xl"></div>
                </div>
            </div>

            {/* Filter bar skeleton */}
            <div className="p-4 border-b border-neutral-700/50">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-full bg-neutral-700/80 rounded-xl"></div>
                    <div className="h-9 w-20 bg-neutral-700/80 rounded-xl"></div>
                </div>
            </div>

            {/* Activities skeleton */}
            <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-neutral-800/30 rounded-xl">
                        <div className="h-10 w-10 bg-neutral-700 rounded-lg mt-1"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 bg-neutral-700 rounded"></div>
                            <div className="flex items-center gap-4">
                                <div className="h-3 w-20 bg-neutral-700 rounded"></div>
                                <div className="h-3 w-16 bg-neutral-700 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Stats skeleton */}
            <div className="p-4 border-t border-neutral-700/50">
                <div className="grid grid-cols-3 gap-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-3 bg-neutral-800/30 rounded-xl">
                            <div className="h-6 w-12 bg-neutral-700 rounded-lg mx-auto mb-2"></div>
                            <div className="h-3 w-16 bg-neutral-700 rounded mx-auto"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Activity Item Component
const ActivityItem = ({ activity, isLast, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const config = getActivityConfig(activity.type);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHour < 24) return `${diffHour}h ago`;
        if (diffDay < 7) return `${diffDay}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const hasDetails = activity.details || activity.metadata || activity.bookingId;

    return (
        <div
            className={`group relative ${!isLast ? 'mb-3' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Timeline line */}
            {!isLast && (
                <div className={`absolute left-5 top-14 w-0.5 h-full transition-all duration-300 ${isHovered ? `bg-${config.color}-500/40` : 'bg-neutral-700/20'
                    }`}></div>
            )}

            <div
                className={`relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 ${isHovered
                        ? `bg-gradient-to-r from-neutral-800/80 to-neutral-900/80 border-${config.color}-500/30 shadow-lg shadow-${config.color}-500/10 translate-x-2`
                        : 'bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 border-neutral-700/30'
                    }`}
            >
                {/* Icon with gradient background */}
                <div className={`relative flex-shrink-0 p-3 rounded-xl border ${config.bgColor} ${config.borderColor} transition-all duration-300 ${isHovered ? 'scale-110 rotate-3' : ''
                    }`}>
                    <FontAwesomeIcon
                        icon={config.icon}
                        className={`${config.iconColor} text-base`}
                    />

                    {activity.important && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center border border-neutral-800">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-white text-[8px]" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                    {/* Header with type and actions */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-100 leading-tight">
                                {activity.message || activity.action || activity.description}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.iconColor} bg-${config.color}-500/10 border ${config.borderColor}`}>
                                {config.label}
                            </span>

                            {hasDetails && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className={`p-1.5 rounded-lg transition-all ${isHovered ? 'opacity-100' : 'opacity-0'} ${isExpanded ? 'bg-neutral-700/50' : 'bg-transparent'
                                        }`}
                                    aria-label={isExpanded ? "Collapse details" : "Expand details"}
                                >
                                    <FontAwesomeIcon
                                        icon={isExpanded ? faChevronUp : faChevronDown}
                                        className="text-neutral-400 text-xs"
                                    />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Metadata and timestamp */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faClock} className="text-neutral-500 text-xs" />
                            <span className="text-xs text-neutral-400">
                                {formatDate(activity.timestamp || activity.date)}
                            </span>
                        </div>

                        {activity.bookingId && (
                            <div className="flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faReceipt} className="text-neutral-500 text-xs" />
                                <span className="text-xs text-neutral-400">
                                    Booking #{activity.bookingId}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Expanded details */}
                    {isExpanded && hasDetails && (
                        <div className="mt-3 pt-3 border-t border-neutral-700/30 animate-fadeIn">
                            <div className="space-y-2">
                                {activity.details && (
                                    <p className="text-xs text-neutral-300 leading-relaxed">
                                        {activity.details}
                                    </p>
                                )}

                                {activity.metadata && (
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        {Object.entries(activity.metadata).map(([key, value]) => (
                                            <div key={key} className="flex items-center gap-2 p-2 bg-neutral-900/30 rounded">
                                                <span className="text-neutral-400">{key}:</span>
                                                <span className="text-neutral-300">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Hover arrow indicator */}
                <div className={`flex-shrink-0 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                    }`}>
                    <FontAwesomeIcon
                        icon={faArrowRight}
                        className={`text-${config.color}-400 text-sm`}
                    />
                </div>
            </div>
        </div>
    );
};

// Main Component
export default function UserActivity({
    activities,
    loading = false,
    className = '',
    onViewAll,
    onRefresh,
    showFilters = true
}) {
    const [filteredActivities, setFilteredActivities] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [showAll, setShowAll] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const scrollContainerRef = useRef(null);

    // Filter activities
    useEffect(() => {
        if (!activities) {
            setFilteredActivities([]);
            return;
        }

        let result = [...activities];

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(activity =>
                activity.message?.toLowerCase().includes(query) ||
                activity.description?.toLowerCase().includes(query) ||
                activity.bookingId?.toString().includes(query)
            );
        }

        // Filter by type
        if (selectedType !== 'all') {
            result = result.filter(activity =>
                activity.type?.toLowerCase() === selectedType.toLowerCase()
            );
        }

        setFilteredActivities(result);
    }, [activities, searchQuery, selectedType]);

    // Handle refresh
    const handleRefresh = async () => {
        if (!onRefresh) return;

        setIsRefreshing(true);
        try {
            await onRefresh();
        } catch (error) {
            console.error('Refresh error:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Get unique activity types
    const activityTypes = activities ? [...new Set(activities.map(a => a.type).filter(Boolean))] : [];

    // Calculate statistics
    const stats = activities ? {
        total: activities.length,
        today: activities.filter(a => {
            const date = new Date(a.timestamp || a.date);
            const today = new Date();
            return date.toDateString() === today.toDateString();
        }).length,
        thisWeek: activities.filter(a => {
            const date = new Date(a.timestamp || a.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return date >= weekAgo;
        }).length
    } : { total: 0, today: 0, thisWeek: 0 };

    // If loading, show skeleton
    if (loading) {
        return <UserActivitySkeleton />;
    }

    // If no activities
    if (!activities || activities.length === 0) {
        return (
            <div className={`relative bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 rounded-2xl overflow-hidden ${className}`}>
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Header */}
                <div className="p-6 border-b border-neutral-700/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-xl">
                                <FontAwesomeIcon icon={faHistory} className="text-amber-400 text-lg" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-neutral-100">Activity Log</h3>
                                <p className="text-neutral-400 text-sm mt-1">Your account activity history</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-sm px-3 py-1.5 bg-neutral-800/50 border border-neutral-700/50 rounded-lg">
                                <span className="text-neutral-400">Updated </span>
                                <span className="text-amber-400 font-medium">Just now</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Empty state */}
                <div className="p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border border-neutral-700/50 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faBell} className="text-3xl text-neutral-500" />
                    </div>
                    <h4 className="text-lg font-semibold text-neutral-100 mb-2">No Activity Yet</h4>
                    <p className="text-neutral-400 text-sm max-w-xs mx-auto mb-6">
                        Your account activity will appear here as you use the platform
                    </p>
                    {onRefresh && (
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-neutral-700/60 to-neutral-800/60 hover:from-neutral-600/60 hover:to-neutral-700/60 text-neutral-200 rounded-xl text-sm font-medium transition-all duration-300 border border-neutral-600/30 hover:border-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FontAwesomeIcon
                                icon={isRefreshing ? faSpinner : faSync}
                                className={`${isRefreshing ? 'animate-spin' : ''}`}
                            />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Determine activities to show
    const activitiesToShow = showAll ? filteredActivities : filteredActivities.slice(0, 5);
    const hasMoreActivities = filteredActivities.length > 5;

    return (
        <div className={`relative bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 rounded-2xl overflow-hidden ${className}`}>
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Header */}
            <div className="p-6 border-b border-neutral-700/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-xl">
                            <FontAwesomeIcon icon={faHistory} className="text-amber-400 text-lg" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-neutral-100">Activity Log</h3>
                            <p className="text-neutral-400 text-sm mt-1">Your account activity history</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {onRefresh && (
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="p-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-xl hover:bg-neutral-700/50 hover:border-amber-500/30 transition-all duration-300 group"
                                aria-label="Refresh activities"
                            >
                                <FontAwesomeIcon
                                    icon={isRefreshing ? faSpinner : faSync}
                                    className={`text-neutral-400 group-hover:text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`}
                                />
                            </button>
                        )}

                        <div className="text-sm px-3 py-1.5 bg-neutral-800/50 border border-neutral-700/50 rounded-lg">
                            <span className="text-neutral-400">Last updated: </span>
                            <span className="text-amber-400 font-medium">Now</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter bar */}
            {showFilters && (
                <div className="p-4 border-b border-neutral-700/50 bg-neutral-800/30">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search input */}
                        <div className="flex-1 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl blur opacity-0 focus-within:opacity-100 transition-opacity"></div>
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
                            />
                            <input
                                type="text"
                                placeholder="Search activities..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="relative w-full pl-10 pr-10 py-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-neutral-700/50 rounded-lg transition-colors"
                                    aria-label="Clear search"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="text-neutral-400 text-sm" />
                                </button>
                            )}
                        </div>

                        {/* Type filter */}
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faFilter} className="text-neutral-400" />
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="px-3 py-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-neutral-100 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm min-w-[120px]"
                            >
                                <option value="all">All Types</option>
                                {activityTypes.map(type => {
                                    const config = getActivityConfig(type);
                                    return (
                                        <option key={type} value={type}>
                                            {config.label}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    {/* Active filters indicator */}
                    {(searchQuery || selectedType !== 'all') && (
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-neutral-400">Active filters:</span>
                            <div className="flex items-center gap-2">
                                {searchQuery && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                        <span className="text-xs text-amber-300">Search: {searchQuery}</span>
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="p-0.5 hover:bg-amber-500/20 rounded"
                                            aria-label="Remove search filter"
                                        >
                                            <FontAwesomeIcon icon={faTimes} className="text-amber-300 text-[10px]" />
                                        </button>
                                    </div>
                                )}
                                {selectedType !== 'all' && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                        <span className="text-xs text-blue-300">Type: {selectedType}</span>
                                        <button
                                            onClick={() => setSelectedType('all')}
                                            className="p-0.5 hover:bg-blue-500/20 rounded"
                                            aria-label="Remove type filter"
                                        >
                                            <FontAwesomeIcon icon={faTimes} className="text-blue-300 text-[10px]" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Activities list */}
            <div
                ref={scrollContainerRef}
                className="p-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent"
            >
                {activitiesToShow.length === 0 ? (
                    <div className="text-center py-8">
                        <FontAwesomeIcon icon={faSearch} className="text-3xl text-neutral-500 mb-3" />
                        <p className="text-neutral-300 font-medium mb-1">No matching activities</p>
                        <p className="text-neutral-500 text-sm">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {activitiesToShow.map((activity, index) => (
                            <ActivityItem
                                key={`${activity.id || index}-${activity.timestamp}`}
                                activity={activity}
                                isLast={index === activitiesToShow.length - 1}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Stats and actions */}
            <div className="p-4 border-t border-neutral-700/50 bg-neutral-800/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Stats */}
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-amber-400">{stats.total}</div>
                            <div className="text-xs text-neutral-400">Total</div>
                        </div>
                        <div className="h-8 w-px bg-neutral-700/50"></div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-emerald-400">{stats.today}</div>
                            <div className="text-xs text-neutral-400">Today</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-blue-400">{stats.thisWeek}</div>
                            <div className="text-xs text-neutral-400">This Week</div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {hasMoreActivities && !showAll && (
                            <button
                                onClick={() => setShowAll(true)}
                                className="px-4 py-2.5 bg-gradient-to-r from-neutral-700/60 to-neutral-800/60 hover:from-neutral-600/60 hover:to-neutral-700/60 text-neutral-200 rounded-xl text-sm font-medium transition-all duration-300 border border-neutral-600/30 hover:border-amber-500/30 hover:text-amber-100 flex items-center gap-2"
                            >
                                <span>Show All ({filteredActivities.length})</span>
                                <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                            </button>
                        )}

                        {showAll && (
                            <button
                                onClick={() => setShowAll(false)}
                                className="px-4 py-2.5 bg-gradient-to-r from-neutral-700/60 to-neutral-800/60 hover:from-neutral-600/60 hover:to-neutral-700/60 text-neutral-200 rounded-xl text-sm font-medium transition-all duration-300 border border-neutral-600/30 hover:border-amber-500/30 hover:text-amber-100 flex items-center gap-2"
                            >
                                <span>Show Less</span>
                                <FontAwesomeIcon icon={faChevronUp} className="text-xs" />
                            </button>
                        )}

                        {onViewAll && (
                            <button
                                onClick={onViewAll}
                                className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl text-sm font-bold transition-all duration-300 border border-amber-500/50 hover:border-amber-400 flex items-center gap-2 shadow-lg shadow-amber-500/20"
                            >
                                <span>View Full Log</span>
                                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}