'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome, faUsers, faCalendar, faCreditCard,
    faBars, faXmark, faRightFromBracket, faBuilding,
    faChevronDown, faChevronUp, faImages,
    faEnvelope, faMessage,
    faBell, faBellSlash,
    faTags, faCircle, faCheckCircle, faClock,
    faInfoCircle, faExclamationTriangle, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { formatDistanceToNow } from 'date-fns';

const navItems = [
    { id: 'overview', label: 'Overview', icon: faHome, path: '/admin' },
    { id: 'apartments', label: 'Apartments', icon: faBuilding, path: '/admin/apartments' },
    { id: 'users', label: 'Users', icon: faUsers, path: '/admin/users' },
    { id: 'bookings', label: 'Bookings', icon: faCalendar, path: '/admin/bookings' },
    { id: 'payments', label: 'Payments', icon: faCreditCard, path: '/admin/payments' },
    { id: 'gallery', label: 'Gallery', icon: faImages, path: '/admin/gallery' },
    { id: 'notifications', label: 'Notifications', icon: faBell, path: '/admin/notifications' },
    { id: 'reviews', label: 'Reviews & Feedbacks', icon: faMessage, path: '/admin/feedback-reviews' },
    { id: 'offers', label: 'Offers', icon: faTags, path: '/admin/offers' },
    { id: 'home', label: 'Home', icon: faHome, path: '/' }
];

// Notification type to route mapping (based on your enum values)
const notificationRoutes = {
    booking: '/admin/bookings',
    payment: '/admin/payments',
    message: '/admin/messages',
    feedback: '/admin/feedback-reviews',
    system: '/admin/notifications',
    review: '/admin/feedback-reviews',
};

// Level-based styling and icons
const levelConfig = {
    info: {
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-400',
        borderColor: 'border-blue-500/20',
        icon: faInfoCircle,
        dotColor: 'text-blue-500'
    },
    warning: {
        bgColor: 'bg-yellow-500/10',
        textColor: 'text-yellow-400',
        borderColor: 'border-yellow-500/20',
        icon: faExclamationTriangle,
        dotColor: 'text-yellow-500'
    },
    danger: {
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-400',
        borderColor: 'border-red-500/20',
        icon: faExclamationCircle,
        dotColor: 'text-red-500'
    }
};

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
    const [logoHover, setLogoHover] = useState(false);
    const [collapseHover, setCollapseHover] = useState(false);

    // Notification states
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(false);
    const [markingAsRead, setMarkingAsRead] = useState(null);

    // NEW: Separate counts for bookings and payments
    const [bookingCount, setBookingCount] = useState(0);
    const [paymentCount, setPaymentCount] = useState(0);
    const [lastOpenedPages, setLastOpenedPages] = useState({});

    const notificationRef = useRef(null);
    const pathname = usePathname();
    const router = useRouter();

    // Fetch notifications and calculate counts
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            // Fetch unread notifications with limit
            const response = await fetch('/api/admin/notifications?unread=true&limit=50', {
                credentials: 'include' // Ensure cookies are sent for authentication
            });
            const data = await response.json();

            if (data.success) {
                setNotifications(data.notifications);

                // Calculate unread count from fetched notifications
                const unread = data.notifications.filter(n => !n.is_read).length;
                setUnreadCount(unread);

                // Calculate booking and payment counts from unread notifications
                const bookings = data.notifications.filter(
                    n => !n.is_read && n.type === 'booking'
                ).length;

                const payments = data.notifications.filter(
                    n => !n.is_read && n.type === 'payment'
                ).length;

                setBookingCount(bookings);
                setPaymentCount(payments);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and polling setup
    useEffect(() => {
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, []);

    // Mark notification as read
    const markAsRead = async (notificationId, event) => {
        event.stopPropagation();

        try {
            setMarkingAsRead(notificationId);
            const response = await fetch(`/api/admin/notifications/read?id=${notificationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                // Find the notification to check its type
                const notification = notifications.find(n => n.id === notificationId);

                // Update local state
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notificationId ? { ...n, is_read: 1 } : n
                    )
                );

                // Update specific counts based on notification type
                if (notification?.type === 'booking') {
                    setBookingCount(prev => Math.max(0, prev - 1));
                } else if (notification?.type === 'payment') {
                    setPaymentCount(prev => Math.max(0, prev - 1));
                }

                setUnreadCount(prev => Math.max(0, prev - 1));
            } else {
                console.error('Failed to mark as read:', data.error);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        } finally {
            setMarkingAsRead(null);
        }
    };

    // Handle notification click
    const handleNotificationClick = async (notification) => {
        // Mark as read if not already read
        if (!notification.is_read) {
            await markAsRead(notification.id, { stopPropagation: () => { } });
        }

        // Navigate based on notification type
        const baseRoute = notificationRoutes[notification.type] || '/admin/notifications';
        let route = baseRoute;

        // Parse meta JSON if it exists
        let meta = {};
        if (notification.meta) {
            try {
                meta = typeof notification.meta === 'string'
                    ? JSON.parse(notification.meta)
                    : notification.meta;
            } catch (e) {
                console.error('Error parsing meta:', e);
            }
        }

        // Add query parameters based on notification data
        const params = new URLSearchParams();
        if (notification.booking_id) params.set('booking_id', notification.booking_id);
        if (notification.user_id) params.set('user_id', notification.user_id);

        // Add any additional IDs from meta
        if (meta.payment_id) params.set('payment_id', meta.payment_id);
        if (meta.review_id) params.set('review_id', meta.review_id);
        if (meta.offer_id) params.set('offer_id', meta.offer_id);

        const queryString = params.toString();
        if (queryString) {
            route += `?${queryString}`;
        }

        router.push(route);
        setShowNotifications(false);
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/admin/notifications/read-all', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            const data = await response.json();
            if (data.success) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
                setUnreadCount(0);
                setBookingCount(0);
                setPaymentCount(0);
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };
    const markNotificationsByType = async (type) => {
        try {
            await fetch('/api/admin/notifications/read-by-type', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ type })
            });

            setNotifications(prev =>
                prev.map(n =>
                    n.type === type ? { ...n, is_read: 1 } : n
                )
            );

        } catch (error) {
            console.error("Error:", error);
        }
    };
    useEffect(() => {

        if (pathname.startsWith('/admin/bookings') && bookingCount > 0) {
            setBookingCount(0);
            markNotificationsByType('booking');
        }

        if (pathname.startsWith('/admin/payments') && paymentCount > 0) {
            setPaymentCount(0);
            markNotificationsByType('payment');
        }

    }, [pathname]);

    // Handle click outside to close notification dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle scroll for navbar shadow
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close sidebar when route changes (mobile only)
    useEffect(() => {
        setSidebarOpen(false);
        setMobileDropdownOpen(false);
        setShowNotifications(false);
    }, [pathname]);

    // Close sidebar on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setSidebarOpen(false);
                setMobileDropdownOpen(false);
                setShowNotifications(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Auto-collapse sidebar on desktop, keep closed on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarCollapsed(false);
                setSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            router.push('/');
        }
    };

    const getActiveLabel = () => {
        return navItems.find(item => item.path === pathname)?.label || 'Dashboard';
    };

    // Get level-specific styling
    const getLevelStyle = (level = 'info') => {
        return levelConfig[level] || levelConfig.info;
    };

    // Notification Dropdown Component
    const NotificationDropdown = () => (
        <div
            ref={notificationRef}
            className="absolute right-0 mt-2 w-96 bg-neutral-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden z-50"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-black">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faBell} className="w-4 h-4 text-gray-400" />
                    <h3 className="font-semibold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {unreadCount} new
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
                {loading && notifications.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <FontAwesomeIcon icon={faBellSlash} className="w-12 h-12 text-gray-600 mb-3" />
                        <p className="text-gray-400 text-sm">No notifications yet</p>
                        <p className="text-gray-500 text-xs mt-1">We'll notify you when something arrives</p>
                    </div>
                ) : (
                    notifications.map((notification) => {
                        const levelStyle = getLevelStyle(notification.level);

                        return (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`relative px-4 py-3 border-b border-gray-700 hover:bg-neutral-700 cursor-pointer transition-colors ${!notification.is_read ? 'bg-neutral-750' : ''
                                    }`}
                            >
                                <div className="flex gap-3">
                                    {/* Status Indicator with level-based color */}
                                    {!notification.is_read && (
                                        <FontAwesomeIcon
                                            icon={faCircle}
                                            className={`w-2 h-2 ${levelStyle.dotColor} absolute top-3 left-2`}
                                        />
                                    )}

                                    {/* Level Icon */}
                                    <div className={`mt-0.5 ${levelStyle.textColor}`}>
                                        <FontAwesomeIcon icon={levelStyle.icon} className="w-4 h-4" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${!notification.is_read ? 'text-white' : 'text-gray-300'}`}>
                                            {notification.title}
                                        </p>
                                        {notification.content && (
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                                {notification.content}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                            <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            <span className="mx-1">•</span>
                                            <span className="capitalize">{notification.type}</span>
                                        </p>
                                    </div>

                                    {/* Mark as read button */}
                                    {!notification.is_read && (
                                        <button
                                            onClick={(e) => markAsRead(notification.id, e)}
                                            disabled={markingAsRead === notification.id}
                                            className="text-gray-400 hover:text-blue-400 transition-colors self-center"
                                            title="Mark as read"
                                        >
                                            {markingAsRead === notification.id ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                            ) : (
                                                <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-700 bg-black">
                <button
                    onClick={() => {
                        router.push('/admin/notifications');
                        setShowNotifications(false);
                    }}
                    className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                    View all notifications
                </button>
            </div>
        </div>
    );

    const Sidebar = (
        <aside
            className={`bg-black border-r border-gray-700 h-full flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'w-16' : 'w-72'}`}
            aria-label="Rooms4u sidebar"
        >
            {/* Sidebar Header - unchanged */}
            <div className="p-3 flex border-b border-gray-700 items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (sidebarCollapsed) setSidebarCollapsed(false);
                        }}
                        onMouseEnter={() => setLogoHover(true)}
                        onMouseLeave={() => setLogoHover(false)}
                        className="flex items-center gap-3 focus:outline-none"
                        aria-label="Rooms4u"
                    >
                        <div className="flex items-center justify-center rounded-md bg-neutral-800 border border-gray-600 w-10 h-10">
                            {sidebarCollapsed ? (
                                logoHover ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-white">
                                        <path d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.538L16.6299 14.3378C16.7074 14.121 16.7605 13.8478 16.792 13.4618C16.8347 12.9394 16.835 12.2712 16.835 11.3271V8.66301C16.835 7.71885 16.8347 7.05065 16.792 6.52824C16.7605 6.14232 16.7073 5.86904 16.6299 5.65227L16.5439 5.45207C16.32 5.01264 15.9796 4.64498 15.5615 4.3886L15.3779 4.28606C15.1308 4.16013 14.8165 4.08006 14.3018 4.03801C13.7794 3.99533 13.1112 3.99504 12.167 3.99504H8.16406C8.16407 3.99667 8.16504 3.99829 8.16504 3.99992L8.16406 15.995Z"></path>
                                    </svg>
                                ) : (
                                    <span className="text-lg font-bold text-white">SP</span>
                                )
                            ) : (
                                <span className="text-lg font-bold text-white">SP</span>
                            )}
                        </div>

                        {!sidebarCollapsed && (
                            <div className="leading-tight flex flex-col justify-left">
                                <h2 className="text-lg font-semibold text-white">Sakeena Plaza</h2>
                                <p className="text-xs text-gray-400">Admin Management</p>
                            </div>
                        )}
                    </button>
                </div>

                <div
                    className={`${sidebarCollapsed ? 'hidden' : ''} cursor-pointer`}
                    onClick={() => {
                        if (window.innerWidth < 768) {
                            setSidebarOpen(false);
                        } else {
                            setSidebarCollapsed(true);
                        }
                    }}
                    onMouseEnter={() => setCollapseHover(true)}
                    onMouseLeave={() => setCollapseHover(false)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`w-6 h-6 transition-colors duration-200 ${collapseHover ? 'text-gray-400' : 'text-white'}`}
                    >
                        <path d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.538L16.6299 14.3378C16.7074 14.121 16.7605 13.8478 16.792 13.4618C16.8347 12.9394 16.835 12.2712 16.835 11.3271V8.66301C16.835 7.71885 16.8347 7.05065 16.792 6.52824C16.7605 6.14232 16.7073 5.86904 16.6299 5.65227L16.5439 5.45207C16.32 5.01264 15.9796 4.64498 15.5615 4.3886L15.3779 4.28606C15.1308 4.16013 14.8165 4.08006 14.3018 4.03801C13.7794 3.99533 13.1112 3.99504 12.167 3.99504H8.16406C8.16407 3.99667 8.16504 3.99829 8.16504 3.99992L8.16406 15.995Z"></path>
                    </svg>
                </div>
            </div>

            {/* Navigation - MODIFIED to show counts on bookings and payments */}
            <nav className="flex-1 p-3 space-y-1">
                {navItems.map(({ id, label, icon, path }) => (
                    <button
                        key={id}
                        onClick={() => router.push(path)}
                        className={`
            w-full flex items-center gap-3 px-3 py-2.5 
            rounded-md transition-all duration-150 relative
            ${pathname === path
                                ? 'text-white bg-white/10 font-medium'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }
            ${sidebarCollapsed ? 'justify-center' : ''}
            group
        `}
                        title={sidebarCollapsed ? label : ''}
                    >
                        <div className="relative">
                            <FontAwesomeIcon
                                icon={icon}
                                className={`
                    w-4.5 h-4.5 transition-all duration-200
                    ${pathname === path
                                        ? 'text-white'
                                        : 'text-gray-400 group-hover:text-white'
                                    }
                `}
                            />

                            {/* Badges with Vercel-style design */}
                            {!sidebarCollapsed && id === 'bookings' && bookingCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border border-black/20 shadow-sm">
                                    {bookingCount}
                                </span>
                            )}

                            {!sidebarCollapsed && id === 'payments' && paymentCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border border-black/20 shadow-sm">
                                    {paymentCount}
                                </span>
                            )}

                            {!sidebarCollapsed && id === 'notifications' && unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border border-black/20 shadow-sm">
                                    {unreadCount}
                                </span>
                            )}
                        </div>

                        {!sidebarCollapsed && (
                            <span className={`
                text-sm transition-all duration-200
                ${pathname === path
                                    ? 'text-white font-medium'
                                    : 'text-gray-400 group-hover:text-white'
                                }
            `}>
                                {label}
                            </span>
                        )}

                        {/* Active indicator line (Vercel-style) */}
                        {!sidebarCollapsed && pathname === path && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-full" />
                        )}

                        {/* For collapsed sidebar - show badges */}
                        {sidebarCollapsed && id === 'bookings' && bookingCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border border-black/20 shadow-sm">
                                {bookingCount}
                            </span>
                        )}

                        {sidebarCollapsed && id === 'payments' && paymentCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border border-black/20 shadow-sm">
                                {paymentCount}
                            </span>
                        )}

                        {sidebarCollapsed && id === 'notifications' && unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border border-black/20 shadow-sm">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Logout Section - unchanged */}
            <div className="p-2 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-red-700/10 hover:bg-red-700/20 text-red-300 hover:text-red-200 transition-all duration-150 border border-red-700/20 ${sidebarCollapsed ? 'justify-center' : ''
                        }`}
                    title={sidebarCollapsed ? 'Logout' : ''}
                >
                    <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
                    {!sidebarCollapsed && (
                        <span className="font-medium text-sm">Logout</span>
                    )}
                </button>
            </div>
        </aside>
    );

    const MobileNavbar = (
        <nav className={`fixed md:hidden top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-neutral-800" : "bg-black"
            }`}>
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-300 hover:text-white transition-colors p-2"
                    >
                        <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-2 text-white border border-white/10 rounded-lg bg-neutral-700 hover:bg-neutral-600 transition-colors"
                        >
                            <span className="font-medium">{getActiveLabel()}</span>
                            <FontAwesomeIcon
                                icon={mobileDropdownOpen ? faChevronUp : faChevronDown}
                                className="w-3 h-3"
                            />
                        </button>

                        {mobileDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-black border border-white/10 rounded-lg shadow-xl z-60">
                                {navItems.map(({ id, label, icon, path }) => (
                                    <button
                                        key={id}
                                        onClick={() => {
                                            router.push(path);
                                            setMobileDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors relative ${pathname === path
                                                ? 'bg-neutral-800 text-white'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                            } first:rounded-t-lg last:rounded-b-lg`}
                                    >
                                        <div className="relative">
                                            <FontAwesomeIcon icon={icon} className="w-4 h-4" />
                                            {/* Show count badges for mobile dropdown */}
                                            {id === 'bookings' && bookingCount > 0 && (
                                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                                    {bookingCount}
                                                </span>
                                            )}
                                            {id === 'payments' && paymentCount > 0 && (
                                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                                    {paymentCount}
                                                </span>
                                            )}
                                        </div>
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400 hidden xs:inline">
                        Welcome, Admin
                    </span>
                </div>
            </div>
        </nav>
    );

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Mobile Navbar */}
            {MobileNavbar}

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0`}>
                {Sidebar}
            </div>

            {/* Main Content */}
            <div className={`h-full transition-all duration-200 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'
                } max-md:pt-16`}>
                {/* Desktop Header with Notification Bell */}
                <header className={`hidden md:flex items-center h-[96px] justify-between p-6 border-b border-gray-700 bg-black`}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="sm:hidden text-gray-300 hover:text-white transition-colors p-2"
                        >
                            <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{getActiveLabel()}</h1>
                            <p className="text-gray-400 text-sm mt-1">
                                Manage your {getActiveLabel().toLowerCase()} and monitor activities
                            </p>
                        </div>
                    </div>

                    {/* Notification Bell and User Info */}
                    <div className="flex items-center gap-4">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-300 hover:text-white transition-colors focus:outline-none"
                                aria-label="Notifications"
                            >
                                <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && <NotificationDropdown />}
                        </div>

                        <span className="text-gray-300">Welcome back, Admin</span>
                    </div>
                </header>

                {/* Main Content Area */}
                <main
                    className="h-screen overflow-hidden"
                    style={{ maxHeight: 'calc(100vh - 96px)' }}
                >
                    <div className="mx-auto overflow-hidden">
                        {children}
                    </div>
                </main>
            </div>

            {/* Close dropdown when clicking outside */}
            {mobileDropdownOpen && (
                <div
                    className="fixed inset-0 z-40 md:hidden"
                    onClick={() => setMobileDropdownOpen(false)}
                />
            )}
        </div>
    );
}