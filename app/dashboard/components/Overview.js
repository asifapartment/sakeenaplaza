"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarCheck,
    faClock,
    faUser,
    faCalendarDays,
    faBed,
    faUsers,
    faMoneyBillWave,
    faChevronRight,
    faArrowRight,
    faPhone,
    faPlus,
    faCalendarAlt,
    faHome,
    faRupeeSign,
    faCheckCircle,
    faTimesCircle,
    faBuilding,
    faMapMarkerAlt,
    faReceipt,
    faEye,
    faCalendar,
    faCheck,
    faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
import Card from "./Card";

export default function Overview() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isHovered, setIsHovered] = useState({});

    async function getOverviewData() {
        try {
            setLoading(true);
            const [overviewRes, statsRes, upBookings] = await Promise.all([
                fetch(`/api/dashboard/overview`, {
                    credentials: "include",
                    cache: "no-store",
                }),
                fetch(`/api/dashboard/stats`, {
                    credentials: "include",
                    cache: "no-store",
                }),
                fetch(`/api/dashboard/bookings`, {
                    credentials: "include",
                    cache: "no-store",
                }),
            ]);

            if (!overviewRes.ok || !statsRes.ok) {
                throw new Error("Unauthorized or failed to fetch data");
            }

            const overview = await overviewRes.json();
            const stats = await statsRes.json();
            const bookings = await upBookings.json();
            setData({ ...overview, ...stats, ...bookings });
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getOverviewData();
    }, []);

    const safeData = {
        totalBookings: data?.totalBookings || 0,
        totalPayments: data?.totalPayments || 0,
        paidPayments: data?.paidPayments || 0,
        refundedPayments: data?.refundedPayments || 0,
        lastBooking: data?.lastBooking || {
            id: null,
            apartment: "No bookings yet",
            status: "N/A",
            checkIn: "",
            total: 0,
            guestName: "",
            guests: 0
        },
        nextBooking: data?.nextBooking || {
            apartment: "No upcoming bookings",
            daysUntil: null,
            checkIn: "",
            guestName: "",
            guests: 0
        },
        upcomingCheckins: Array.isArray(data?.upcomingCheckins)
            ? data.upcomingCheckins
            : [],
    };

    // Helper function to get status colors
    const getStatusColor = (status) => {
        const colors = {
            confirmed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
            pending: "bg-amber-500/20 text-amber-300 border-amber-500/40",
            cancelled: "bg-rose-500/20 text-rose-300 border-rose-500/40",
            expired: "bg-neutral-500/20 text-neutral-300 border-neutral-500/40",
            ongoing: "bg-blue-500/20 text-blue-300 border-blue-500/40",
            paid: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
            unpaid: "bg-amber-500/20 text-amber-300 border-amber-500/40"
        };
        return colors[status] || "bg-neutral-500/20 text-neutral-300 border-neutral-500/40";
    };

    const statsCards = [
        {
            title: "Total Bookings",
            value: safeData.totalBookings,
            subtext: "Last 30 days",
            icon: faCalendarCheck,
            iconColor: "text-teal-400",
            bgColor: "bg-gradient-to-br from-neutral-800/60 to-neutral-900/60",
            borderColor: "border-neutral-700/30",
            iconBg: "bg-gradient-to-br from-teal-500/10 to-teal-400/5",
            gradient: "from-teal-500/5 to-transparent"
        },
        {
            title: "Total Revenue",
            value: `₹${safeData.totalPayments.toLocaleString()}`,
            subtext: `Paid: ₹${safeData.paidPayments.toLocaleString()}`,
            icon: faRupeeSign,
            iconColor: "text-blue-400",
            bgColor: "bg-gradient-to-br from-neutral-800/60 to-neutral-900/60",
            borderColor: "border-neutral-700/30",
            iconBg: "bg-gradient-to-br from-blue-500/10 to-blue-400/5",
            gradient: "from-blue-500/5 to-transparent"
        },
        {
            title: "Last Booking",
            value: safeData.lastBooking.id ? `#${safeData.lastBooking.id}` : "No bookings",
            subtext: safeData.lastBooking.apartment,
            icon: faCalendarAlt,
            iconColor: "text-violet-400",
            bgColor: "bg-gradient-to-br from-neutral-800/60 to-neutral-900/60",
            borderColor: "border-neutral-700/30",
            iconBg: "bg-gradient-to-br from-violet-500/10 to-violet-400/5",
            gradient: "from-violet-500/5 to-transparent"
        },
        {
            title: "Next Check-in",
            value:
                safeData.nextBooking.daysUntil > 0
                    ? `In ${safeData.nextBooking.daysUntil} days`
                    : safeData.nextBooking.daysUntil === 0
                        ? "Today"
                        : "None",
            subtext: safeData.nextBooking.apartment,
            icon: faCheckCircle,
            iconColor: "text-rose-400",
            bgColor: "bg-gradient-to-br from-neutral-800/60 to-neutral-900/60",
            borderColor: "border-neutral-700/30",
            iconBg: "bg-gradient-to-br from-rose-500/10 to-rose-400/5",
            gradient: "from-rose-500/5 to-transparent"
        },
    ];

    const quickActions = [
        {
            title: "New Booking",
            description: "Create a new booking",
            icon: faPlus,
            iconColor: "text-teal-400",
            iconBg: "bg-gradient-to-br from-teal-500/10 to-teal-400/5",
            borderColor: "border-teal-500/20",
            gradient: "from-teal-500/5 to-transparent",
            action: () => console.log("New Booking")
        },
        {
            title: "View All Bookings",
            description: "Manage all bookings",
            icon: faCalendarDays,
            iconColor: "text-blue-400",
            iconBg: "bg-gradient-to-br from-blue-500/10 to-blue-400/5",
            borderColor: "border-blue-500/20",
            gradient: "from-blue-500/5 to-transparent",
            action: () => console.log("View Bookings")
        },
        {
            title: "Contact Support",
            description: "Get help quickly",
            icon: faPhone,
            iconColor: "text-violet-400",
            iconBg: "bg-gradient-to-br from-violet-500/10 to-violet-400/5",
            borderColor: "border-violet-500/20",
            gradient: "from-violet-500/5 to-transparent",
            action: () => console.log("Contact Support")
        },
    ];

    // Skeleton Loaders
    const StatsSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="relative overflow-hidden bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700/30 rounded-2xl p-6 animate-pulse"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-neutral-700/50 rounded-xl"></div>
                        <div className="flex-1">
                            <div className="h-4 w-24 bg-neutral-700/50 rounded mb-3"></div>
                            <div className="h-7 w-16 bg-neutral-700/50 rounded mb-2"></div>
                            <div className="h-3 w-32 bg-neutral-700/50 rounded"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const QuickActionsSkeleton = () => (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="relative overflow-hidden bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700/30 rounded-2xl p-5 animate-pulse"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-neutral-700/50 rounded-xl"></div>
                            <div className="flex-1">
                                <div className="h-5 w-32 bg-neutral-700/50 rounded mb-2"></div>
                                <div className="h-4 w-40 bg-neutral-700/50 rounded"></div>
                            </div>
                        </div>
                        <div className="w-5 h-5 bg-neutral-700/50 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    const UpcomingBookingsSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="relative overflow-hidden bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700/30 rounded-2xl p-6 animate-pulse"
                >
                    <div className="flex items-start justify-between mb-6 pb-4 border-b border-neutral-700/30">
                        <div className="flex-1 min-w-0">
                            <div className="h-4 w-20 bg-neutral-700/50 rounded mb-1"></div>
                            <div className="h-6 w-32 bg-neutral-700/50 rounded"></div>
                        </div>
                        <div className="h-6 w-20 bg-neutral-700/50 rounded-full"></div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-neutral-700/50 rounded-lg"></div>
                            <div className="flex-1">
                                <div className="h-4 w-24 bg-neutral-700/50 rounded mb-1"></div>
                                <div className="h-3 w-32 bg-neutral-700/50 rounded"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <div className="h-3 w-16 bg-neutral-700/50 rounded"></div>
                                <div className="h-4 w-20 bg-neutral-700/50 rounded"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-12 bg-neutral-700/50 rounded"></div>
                                <div className="h-4 w-16 bg-neutral-700/50 rounded"></div>
                            </div>
                        </div>
                        <div className="h-10 w-full bg-neutral-700/50 rounded-xl"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="relative overflow-hidden bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-rose-500/30 rounded-2xl p-8 mb-4">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-rose-500/20 to-rose-600/20 rounded-full flex items-center justify-center border border-rose-500/30">
                            <FontAwesomeIcon icon={faTimesCircle} className="text-3xl text-rose-400" />
                        </div>
                        <div>
                            <p className="text-rose-300 font-medium text-lg mb-1">Failed to load dashboard</p>
                            <p className="text-neutral-400 text-sm">Please check your connection and try again</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={getOverviewData}
                    className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-black p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">
                    Dashboard Overview
                </h1>
                <p className="text-neutral-400 mt-2">
                    Welcome back! Here's what's happening with your properties.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Overview</h2>
                </div>

                {loading ? (
                    <StatsSkeleton />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statsCards.map((card, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700/30 rounded-2xl p-6 hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 backdrop-blur-sm"
                                onMouseEnter={() => setIsHovered(prev => ({ ...prev, [`stats-${index}`]: true }))}
                                onMouseLeave={() => setIsHovered(prev => ({ ...prev, [`stats-${index}`]: false }))}
                            >
                                {/* Animated background gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isHovered[`stats-${index}`] ? 'opacity-100' : ''}`}></div>

                                <div className="relative flex items-center gap-4">
                                    <div className={`p-3 rounded-xl border ${card.iconBg} ${card.borderColor}`}>
                                        <FontAwesomeIcon
                                            icon={card.icon}
                                            className={`text-xl ${card.iconColor}`}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-neutral-400 font-medium mb-1">{card.title}</p>
                                        <p className="text-2xl font-bold text-white mb-2">{card.value}</p>
                                        <p className="text-xs text-neutral-500 truncate">{card.subtext}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions & Recent Bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Quick Actions */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                    {loading ? (
                        <QuickActionsSkeleton />
                    ) : (
                        <div className="space-y-4">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={action.action}
                                    className="group relative w-full overflow-hidden bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700/30 rounded-2xl p-5 text-left hover:border-teal-500/30 transition-all duration-500 backdrop-blur-sm"
                                    onMouseEnter={() => setIsHovered(prev => ({ ...prev, [`action-${index}`]: true }))}
                                    onMouseLeave={() => setIsHovered(prev => ({ ...prev, [`action-${index}`]: false }))}
                                >
                                    {/* Animated background gradient */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isHovered[`action-${index}`] ? 'opacity-100' : ''}`}></div>

                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl border ${action.iconBg} ${action.borderColor}`}>
                                                <FontAwesomeIcon
                                                    icon={action.icon}
                                                    className={`text-lg ${action.iconColor}`}
                                                />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white mb-1">{action.title}</p>
                                                <p className="text-sm text-neutral-400">{action.description}</p>
                                            </div>
                                        </div>
                                        <FontAwesomeIcon
                                            icon={faArrowRight}
                                            className="text-neutral-500 group-hover:text-teal-400 transition-colors duration-300"
                                        />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Bookings - 2 columns */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold text-white mb-4">Recent Bookings</h2>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="relative overflow-hidden bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700/30 rounded-2xl p-6 animate-pulse"
                                >
                                    <div className="flex items-start justify-between mb-6 pb-4 border-b border-neutral-700/30">
                                        <div className="flex-1 min-w-0">
                                            <div className="h-4 w-20 bg-neutral-700/50 rounded mb-1"></div>
                                            <div className="h-6 w-32 bg-neutral-700/50 rounded"></div>
                                        </div>
                                        <div className="h-6 w-16 bg-neutral-700/50 rounded-full"></div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-neutral-700/50 rounded-lg"></div>
                                            <div className="flex-1">
                                                <div className="h-4 w-24 bg-neutral-700/50 rounded mb-1"></div>
                                                <div className="h-3 w-32 bg-neutral-700/50 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <div className="h-3 w-16 bg-neutral-700/50 rounded"></div>
                                                <div className="h-4 w-20 bg-neutral-700/50 rounded"></div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-3 w-12 bg-neutral-700/50 rounded"></div>
                                                <div className="h-4 w-16 bg-neutral-700/50 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="h-10 w-full bg-neutral-700/50 rounded-xl"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Last Booking */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700/30 rounded-2xl p-6 hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 backdrop-blur-sm">
                                {/* Animated background gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                                <div className="relative flex items-start justify-between mb-6 pb-4 border-b border-neutral-700/30">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <FontAwesomeIcon icon={faReceipt} className="text-teal-400/60 text-sm" />
                                            <p className="text-neutral-400 text-sm font-medium">
                                                #{safeData.lastBooking.id || 'N/A'}
                                            </p>
                                        </div>
                                        <h3 className="text-xl font-bold text-neutral-100 truncate">
                                            {safeData.lastBooking.apartment}
                                        </h3>
                                    </div>

                                    {safeData.lastBooking.status && safeData.lastBooking.status !== 'N/A' && (
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(safeData.lastBooking.status)} backdrop-blur-sm`}>
                                            <FontAwesomeIcon
                                                icon={safeData.lastBooking.status === 'confirmed' ? faCheckCircle : faClock}
                                                className="text-xs"
                                            />
                                            {safeData.lastBooking.status}
                                        </span>
                                    )}
                                </div>

                                <div className="relative space-y-6">
                                    {safeData.lastBooking.guestName && (
                                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-neutral-800/40 to-transparent rounded-xl border border-neutral-700/20">
                                            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
                                                {safeData.lastBooking.guestName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-neutral-100 font-semibold text-sm truncate">
                                                    {safeData.lastBooking.guestName}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <FontAwesomeIcon icon={faUsers} className="text-teal-400/60 text-xs" />
                                                        <span className="text-neutral-300 text-xs">
                                                            {safeData.lastBooking.guests || 1} guest{safeData.lastBooking.guests > 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 p-3 rounded-xl border border-neutral-700/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="p-1.5 bg-teal-500/10 rounded-lg">
                                                    <FontAwesomeIcon icon={faCalendar} className="text-teal-400 text-sm" />
                                                </div>
                                                <span className="text-neutral-400 text-xs font-medium">Check-in</span>
                                            </div>
                                            <p className="text-neutral-100 font-semibold text-sm">{safeData.lastBooking.checkIn || 'N/A'}</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 p-3 rounded-xl border border-neutral-700/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="p-1.5 bg-teal-500/10 rounded-lg">
                                                    <FontAwesomeIcon icon={faRupeeSign} className="text-teal-400 text-sm" />
                                                </div>
                                                <span className="text-neutral-400 text-xs font-medium">Total</span>
                                            </div>
                                            <p className="text-teal-400 font-bold text-lg">₹{safeData.lastBooking.total || 0}</p>
                                        </div>
                                    </div>

                                    <button className="w-full px-4 py-2.5 bg-gradient-to-r from-neutral-700/60 to-neutral-800/60 hover:from-neutral-600/60 hover:to-neutral-700/60 text-neutral-200 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-neutral-600/30 hover:border-teal-500/30 hover:text-teal-100">
                                        <FontAwesomeIcon icon={faEye} />
                                        View Details
                                    </button>
                                </div>
                            </div>

                            {/* Next Booking */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700/30 rounded-2xl p-6 hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 backdrop-blur-sm">
                                {/* Animated background gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                                <div className="relative flex items-start justify-between mb-6 pb-4 border-b border-neutral-700/30">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <FontAwesomeIcon icon={faCalendarCheck} className="text-blue-400/60 text-sm" />
                                            <p className="text-neutral-400 text-sm font-medium">
                                                Next Check-in
                                            </p>
                                        </div>
                                        <h3 className="text-xl font-bold text-neutral-100 truncate">
                                            {safeData.nextBooking.apartment}
                                        </h3>
                                    </div>

                                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 bg-blue-500/20 text-blue-300 border-blue-500/40 backdrop-blur-sm">
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                                        Upcoming
                                    </span>
                                </div>

                                <div className="relative space-y-6">
                                    {safeData.nextBooking.daysUntil !== null ? (
                                        <>
                                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-800/20 to-transparent rounded-xl border border-blue-700/20">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                                                    <FontAwesomeIcon icon={faUser} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-neutral-100 font-semibold text-sm">
                                                        {safeData.nextBooking.guestName || 'Guest'}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <FontAwesomeIcon icon={faUsers} className="text-blue-400/60 text-xs" />
                                                            <span className="text-neutral-300 text-xs">
                                                                {safeData.nextBooking.guests || 1} guest{safeData.nextBooking.guests > 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 p-3 rounded-xl border border-neutral-700/20">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                                                            <FontAwesomeIcon icon={faCalendar} className="text-blue-400 text-sm" />
                                                        </div>
                                                        <span className="text-neutral-400 text-xs font-medium">Check-in</span>
                                                    </div>
                                                    <p className="text-neutral-100 font-semibold text-sm">{safeData.nextBooking.checkIn || 'N/A'}</p>
                                                </div>

                                                <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 p-3 rounded-xl border border-neutral-700/20">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="p-1.5 bg-teal-500/10 rounded-lg">
                                                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-teal-400 text-sm" />
                                                        </div>
                                                        <span className="text-neutral-400 text-xs font-medium">Remaining</span>
                                                    </div>
                                                    <p className={`font-bold text-lg ${safeData.nextBooking.daysUntil === 0 ? 'text-teal-400' : 'text-blue-400'}`}>
                                                        {safeData.nextBooking.daysUntil > 1
                                                            ? `${safeData.nextBooking.daysUntil} days`
                                                            : safeData.nextBooking.daysUntil === 1
                                                                ? "1 day"
                                                                : "Today"}
                                                    </p>
                                                </div>
                                            </div>

                                            <button className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 border border-blue-500/50 hover:border-blue-400 shadow-lg shadow-blue-500/20">
                                                <FontAwesomeIcon icon={faEye} />
                                                View Details
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <div className="w-16 h-16 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-full flex items-center justify-center border border-neutral-700/50 mb-4">
                                                <FontAwesomeIcon icon={faCalendar} className="text-3xl text-neutral-500" />
                                            </div>
                                            <p className="text-neutral-400 text-center">No upcoming check-ins</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Upcoming Check-ins */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Upcoming Check-ins</h2>
                        <p className="text-sm text-neutral-500">Confirmed bookings arriving soon</p>
                    </div>
                    {!loading && data?.bookings?.filter(b => b.status === "confirmed").length > 0 && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border border-neutral-700/30 rounded-xl text-sm text-neutral-400 hover:text-white hover:border-teal-500/30 transition-all duration-300">
                            View all <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                        </button>
                    )}
                </div>

                {loading ? (
                    <UpcomingBookingsSkeleton />
                ) : (
                    <>
                        {(!data?.bookings || data.bookings.filter(b => b.status === "confirmed").length === 0) ? (
                            // Empty state - outside the grid
                            <div className="flex flex-col items-center justify-center py-12">
                                    <div className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700/30 rounded-2xl p-8 w-full min-h-[400px]">
                                    <div className="flex flex-col items-center justify-center gap-3 w-full">
                                        <div className="w-16 h-16 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-full flex items-center justify-center border border-neutral-700/50">
                                            <FontAwesomeIcon icon={faCalendar} className="text-3xl text-neutral-500" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-neutral-300 font-medium mb-1">No upcoming check-ins</p>
                                            <p className="text-neutral-500 text-sm">All confirmed bookings will appear here</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Grid with bookings - only shown when there are bookings
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {data?.bookings
                                    ?.filter((b) => b.status === "confirmed")
                                    .slice(0, 3)
                                    .map((b) => {
                                        const today = new Date().setHours(0, 0, 0, 0);
                                        const checkInDate = new Date(b.checkIn).setHours(0, 0, 0, 0);
                                        const diffMs = checkInDate - today;
                                        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                                        return (
                                            <div
                                                key={b.id}
                                                className="group relative overflow-hidden bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700/30 rounded-2xl p-6 hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 backdrop-blur-sm"
                                            >
                                                {/* Status Badge */}
                                                <div className={`absolute top-4 right-4 px-2 py-1 text-xs rounded-full ${b.paymentStatus === 'paid'
                                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                                    }`}>
                                                    {b.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                                                </div>

                                                <div className="relative space-y-4">
                                                    {/* Apartment Info */}
                                                    <div>
                                                        <p className="font-bold text-white text-lg mb-1 truncate">{b.apartment}</p>
                                                        <div className="flex items-center gap-2 text-neutral-500">
                                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs" />
                                                            <span className="text-sm truncate">{b.guestName}</span>
                                                        </div>
                                                    </div>

                                                    {/* Info Grid */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-neutral-500">
                                                                <FontAwesomeIcon icon={faCalendarDays} className="text-xs" />
                                                                <span className="text-xs">Check-in</span>
                                                            </div>
                                                            <p className="text-sm font-medium text-white">{b.checkIn}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-neutral-500">
                                                                <FontAwesomeIcon icon={faBed} className="text-xs" />
                                                                <span className="text-xs">Nights</span>
                                                            </div>
                                                            <p className="text-sm font-medium text-white">{b.nights || 1}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-neutral-500">
                                                                <FontAwesomeIcon icon={faUsers} className="text-xs" />
                                                                <span className="text-xs">Guests</span>
                                                            </div>
                                                            <p className="text-sm font-medium text-white">{b.guests}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-neutral-500">
                                                                <FontAwesomeIcon icon={faRupeeSign} className="text-xs" />
                                                                <span className="text-xs">Total</span>
                                                            </div>
                                                            <p className="text-sm font-medium text-white">₹{b.total}</p>
                                                        </div>
                                                    </div>

                                                    {/* Countdown */}
                                                    <div className={`px-3 py-2 rounded-xl border ${days === 0
                                                        ? 'bg-teal-500/10 border-teal-500/30'
                                                        : days < 0
                                                            ? 'bg-rose-500/10 border-rose-500/30'
                                                            : 'bg-blue-500/10 border-blue-500/30'
                                                        }`}>
                                                        <p className={`text-sm font-semibold ${days === 0
                                                            ? 'text-teal-400'
                                                            : days < 0
                                                                ? 'text-rose-400'
                                                                : 'text-blue-400'
                                                            }`}>
                                                            ⏳ {days > 1
                                                                ? `${days} days remaining`
                                                                : days === 1
                                                                    ? "1 day remaining"
                                                                    : days === 0
                                                                        ? "Check-in today"
                                                                        : "Past due"}
                                                        </p>
                                                    </div>

                                                    {/* View Button */}
                                                    <button className="w-full px-4 py-2.5 bg-gradient-to-r from-neutral-700/60 to-neutral-800/60 hover:from-neutral-600/60 hover:to-neutral-700/60 text-neutral-200 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-neutral-600/30 hover:border-teal-500/30 hover:text-teal-100">
                                                        <FontAwesomeIcon icon={faEye} />
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </>
                )}
            </div>
        
            {/* Animated Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neutral-800/5 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}