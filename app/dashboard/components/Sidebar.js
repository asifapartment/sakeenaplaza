'use client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartSimple,
    faCalendarCheck,
    faCreditCard,
    faGear,
    faHouse,
    faQuestionCircle,
    faRightFromBracket,
    faBars,
    faXmark,
    faBuilding,
    faExclamationCircle,
    faStar,
    faWandSparkles,
    faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(null);
    const sidebarRef = useRef(null);
    const overlayRef = useRef(null);

    // Fixed dimensions to prevent layout shifts
    const DIMENSIONS = {
        sidebar: { width: '288px' }, // 72 * 4 = 288px
        header: { height: '80px' },
        navItem: { height: '56px' }, // 3.5rem * 16 = 56px
        quickLink: { height: '52px' }, // 3.25rem * 16 = 52px
        footer: { height: '88px' },
        mobileHeader: { height: '64px' },
        iconContainer: { width: '32px', height: '32px' },
        logo: { width: '48px', height: '48px' }
    };

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: faChartSimple, href: '/dashboard' },
        { id: 'bookings', label: 'Bookings', icon: faCalendarCheck, href: '/dashboard/bookings' },
        { id: 'payments', label: 'Payments', icon: faCreditCard, href: '/dashboard/payments' },
        { id: 'reviews', label: 'Reviews', icon: faStar, href: '/dashboard/reviews' },
        { id: 'settings', label: 'Settings', icon: faGear, href: '/dashboard/settings' },
    ];

    const quickLinks = [
        { label: 'Home', icon: faHouse, href: '/' },
        { label: 'Apartments', icon: faBuilding, href: '/apartments' },
        { label: 'About Us', icon: faExclamationCircle, href: '/about' },
        { label: 'Help', icon: faQuestionCircle, href: '/help' },
    ];

    const isActive = (href) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    const handleLogout = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!res.ok) throw new Error('Logout failed');
            window.location.href = '/';
        } catch (error) {
            console.error('Logout Error:', error);
            alert('Something went wrong while logging out.');
        } finally {
            setLoading(false);
        }
    };

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = '0px';
        } else {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [sidebarOpen]);

    // Handle escape key to close sidebar
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && sidebarOpen) {
                setSidebarOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [sidebarOpen, setSidebarOpen]);

    // Optimized close on resize
    useEffect(() => {
        let resizeTimer;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth >= 1024 && sidebarOpen) {
                    setSidebarOpen(false);
                }
            }, 150);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(resizeTimer);
            window.removeEventListener('resize', handleResize);
        };
    }, [sidebarOpen, setSidebarOpen]);

    // Preload icons
    useEffect(() => {
        // Create a hidden element to preload icons
        const preloadContainer = document.createElement('div');
        preloadContainer.style.cssText = 'position: absolute; width: 0; height: 0; overflow: hidden;';
        document.body.appendChild(preloadContainer);

        // Preload all icons used in the sidebar
        const icons = [
            faChartSimple, faCalendarCheck, faCreditCard, faGear, faHouse,
            faQuestionCircle, faRightFromBracket, faBars, faXmark, faBuilding,
            faExclamationCircle, faStar, faWandSparkles, faChevronRight
        ];

        return () => {
            if (document.body.contains(preloadContainer)) {
                document.body.removeChild(preloadContainer);
            }
        };
    }, []);

    return (
        <>
            {/* Mobile overlay - Fixed positioned to prevent layout shifts */}
            {sidebarOpen && (
                <div
                    ref={overlayRef}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100vw',
                        height: '100vh'
                    }}
                />
            )}

            {/* Sidebar - Fixed dimensions to prevent layout shifts */}
            <div
                ref={sidebarRef}
                className={`
                    fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 
                    border-r border-neutral-700/50 shadow-2xl shadow-black/50 transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                    lg:translate-x-0 lg:static
                `}
                style={{
                    width: DIMENSIONS.sidebar.width,
                    minWidth: DIMENSIONS.sidebar.width,
                    maxWidth: DIMENSIONS.sidebar.width,
                    willChange: 'transform'
                }}
            >
                <div className="flex flex-col h-full relative" style={{ minHeight: '100vh' }}>
                    {/* Animated background elements - Fixed positioned */}
                    <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-teal-500/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-1/3 -left-10 w-32 h-32 bg-neutral-800/10 rounded-full blur-3xl"></div>
                    </div>

                    {/* Header - Fixed height */}
                    <div
                        className="relative border-b border-neutral-700/50"
                        style={{
                            minHeight: DIMENSIONS.header.height,
                            height: DIMENSIONS.header.height
                        }}
                    >
                        <div className="flex items-center justify-between lg:justify-start gap-4 h-full p-5">
                            <div className="relative flex-shrink-0">
                                <div
                                    className="flex justify-center items-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-400 shadow-lg shadow-teal-500/30"
                                    style={{
                                        width: DIMENSIONS.logo.width,
                                        height: DIMENSIONS.logo.height
                                    }}
                                >
                                    <span className="font-bold text-neutral-900 text-xl">R4U</span>
                                </div>
                                <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-teal-400 to-teal-300 rounded-full flex items-center justify-center border-2 border-neutral-900">
                                    <FontAwesomeIcon
                                        icon={faWandSparkles}
                                        className="text-[8px] text-neutral-900"
                                        style={{ width: '8px', height: '8px' }}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent truncate">
                                    Rooms4U
                                </h1>
                                <p className="text-xs text-neutral-400 mt-0.5 truncate">Premium Stays & Luxury</p>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden p-2 rounded-xl hover:bg-neutral-800/50 transition-all duration-200 border border-neutral-700/50 flex-shrink-0 flex items-center justify-center"
                                aria-label="Close sidebar"
                                style={{
                                    width: DIMENSIONS.iconContainer.width,
                                    height: DIMENSIONS.iconContainer.height
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faXmark}
                                    className="text-neutral-300"
                                    style={{ width: '16px', height: '16px' }}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Navigation - Scrollable area with fixed item heights */}
                    <nav className="flex-1 p-5 space-y-6 overflow-y-auto">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 px-3 mb-3" style={{ height: '24px' }}>
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent"></div>
                                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider whitespace-nowrap">
                                    Dashboard
                                </span>
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent"></div>
                            </div>

                            {menuItems.map((item) => {
                                const active = isActive(item.href);
                                const hovered = isHovered === item.id;

                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        onMouseEnter={() => setIsHovered(item.id)}
                                        onMouseLeave={() => setIsHovered(null)}
                                        className={`relative grid grid-cols-[auto_1fr_auto] items-center px-4 rounded-xl text-left transition-all duration-300 group ${active
                                            ? 'bg-gradient-to-r from-teal-500/15 to-teal-400/10 border border-teal-500/20'
                                            : 'bg-neutral-800/30 border border-transparent hover:border-teal-500/10 hover:bg-neutral-800/50'
                                            }`}
                                        style={{
                                            height: DIMENSIONS.navItem.height,
                                            minHeight: DIMENSIONS.navItem.height
                                        }}
                                    >
                                        {/* Active indicator */}
                                        {active && (
                                            <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-teal-400 to-teal-300 rounded-r-full"></div>
                                        )}

                                        {/* Icon - Column 1 */}
                                        <div
                                            className={`flex items-center justify-center rounded-lg ${active ? 'bg-gradient-to-br from-teal-500 to-teal-400' : 'bg-neutral-800/50 group-hover:bg-teal-500/10'}`}
                                            style={{
                                                width: DIMENSIONS.iconContainer.width,
                                                height: DIMENSIONS.iconContainer.height
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                icon={item.icon}
                                                className={active ? 'text-neutral-900' : 'text-neutral-300 group-hover:text-teal-400'}
                                                style={{ width: '16px', height: '16px' }}
                                            />
                                        </div>

                                        {/* Label - Column 2 */}
                                        <span className={`ml-3 font-medium truncate ${active ? 'text-teal-300' : 'text-neutral-200 group-hover:text-teal-200'}`}>
                                            {item.label}
                                        </span>

                                        {/* Active indicator or Chevron - Column 3 */}
                                        <div className="justify-self-end">
                                            {active ? (
                                                <div className="animate-pulse">
                                                    <div
                                                        className="rounded-full bg-teal-400"
                                                        style={{ width: '8px', height: '8px' }}
                                                    ></div>
                                                </div>
                                            ) : (
                                                <FontAwesomeIcon
                                                    icon={faChevronRight}
                                                    className="text-neutral-500 group-hover:text-teal-400/50 transition-colors"
                                                    style={{ width: '16px', height: '16px' }}
                                                />
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Quick Links - Fixed heights */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 px-3 mb-3" style={{ height: '24px' }}>
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent"></div>
                                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider whitespace-nowrap">
                                    Quick Access
                                </span>
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent"></div>
                            </div>

                            <div className="space-y-2">
                                {quickLinks.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className="w-full grid grid-cols-[auto_1fr_auto] items-center px-4 rounded-xl text-neutral-300 hover:bg-neutral-800/50 hover:text-white transition-all duration-200 group border border-transparent hover:border-neutral-700/50"
                                        style={{
                                            height: DIMENSIONS.quickLink.height,
                                            minHeight: DIMENSIONS.quickLink.height
                                        }}
                                    >
                                        {/* Icon - Column 1 */}
                                        <div
                                            className="flex items-center justify-center rounded-lg bg-neutral-800/50 group-hover:bg-teal-500/10"
                                            style={{
                                                width: DIMENSIONS.iconContainer.width,
                                                height: DIMENSIONS.iconContainer.height
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                icon={link.icon}
                                                className="text-neutral-300 group-hover:text-teal-400"
                                                style={{ width: '16px', height: '16px' }}
                                            />
                                        </div>

                                        {/* Label - Column 2 */}
                                        <span className="ml-3 font-medium group-hover:text-teal-200 truncate">
                                            {link.label}
                                        </span>

                                        {/* Chevron - Column 3 */}
                                        <FontAwesomeIcon
                                            icon={faChevronRight}
                                            className="text-neutral-600 group-hover:text-teal-400/50 transition-colors justify-self-end"
                                            style={{ width: '16px', height: '16px' }}
                                        />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </nav>

                    {/* Footer - Fixed height */}
                    <div
                        className="border-t border-neutral-700/50"
                        style={{
                            minHeight: DIMENSIONS.footer.height,
                            height: DIMENSIONS.footer.height
                        }}
                    >
                        <div className="h-full p-5">
                            <button
                                onClick={handleLogout}
                                disabled={loading}
                                onMouseEnter={() => setIsHovered('logout')}
                                onMouseLeave={() => setIsHovered(null)}
                                className={`relative flex justify-between items-center px-4 rounded-xl transition-all duration-300 overflow-hidden group w-full
                                    ${loading
                                        ? 'bg-gradient-to-r from-rose-900/30 to-rose-800/30 border border-rose-700/30 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 hover:from-rose-900/40 hover:to-rose-800/40 border border-neutral-700/50 hover:border-rose-700/30'
                                    }`}
                                style={{
                                    height: DIMENSIONS.navItem.height,
                                    minHeight: DIMENSIONS.navItem.height
                                }}
                            >
                                {/* Icon - Column 1 */}
                                <div
                                    className={`flex items-center justify-center rounded-lg ${loading ? 'bg-rose-900/30' : 'bg-rose-900/20 group-hover:bg-rose-800/30'}`}
                                    style={{
                                        width: DIMENSIONS.iconContainer.width,
                                        height: DIMENSIONS.iconContainer.height
                                    }}
                                >
                                    <FontAwesomeIcon
                                        icon={faRightFromBracket}
                                        className={`${loading ? 'text-rose-300' : 'text-rose-400 group-hover:text-rose-300'}`}
                                        style={{ width: '16px', height: '16px' }}
                                    />
                                </div>

                                {/* Text - Column 2 */}
                                <span className={`font-medium truncate ${loading ? 'text-rose-300' : 'text-neutral-200 group-hover:text-rose-200'}`}>
                                    {loading ? 'Logging out...' : 'Logout'}
                                </span>

                                {/* Chevron - Column 3 */}
                                {!loading && (
                                    <FontAwesomeIcon
                                        icon={faChevronRight}
                                        className="text-neutral-600 group-hover:text-rose-400/50 transition-colors justify-self-end"
                                        style={{ width: '16px', height: '16px' }}
                                    />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile header - Fixed position and height */}
            <div
                className="lg:hidden fixed top-0 left-0 right-0 flex items-center bg-gradient-to-r from-neutral-900 to-neutral-950 shadow-lg z-30 border-b border-neutral-700/50 backdrop-blur-sm"
                style={{
                    height: DIMENSIONS.mobileHeader.height,
                    minHeight: DIMENSIONS.mobileHeader.height
                }}
            >
                <div className="w-full flex items-center px-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2.5 rounded-xl hover:bg-neutral-800/50 transition-colors flex-shrink-0 flex items-center justify-center"
                        aria-label="Open sidebar"
                        style={{
                            width: DIMENSIONS.iconContainer.width,
                            height: DIMENSIONS.iconContainer.height
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faBars}
                            className="text-neutral-300"
                            style={{ width: '20px', height: '20px' }}
                        />
                    </button>

                    <div className="ml-4 min-w-0 flex-1">
                        <h2 className="text-lg font-semibold bg-gradient-to-r from-teal-300 to-teal-200 bg-clip-text text-transparent truncate">
                            {menuItems.find(item => isActive(item.href))?.label || 'Dashboard'}
                        </h2>
                        <p className="text-xs text-neutral-400 truncate">Premium Dashboard</p>
                    </div>

                    {/* <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                        <div
                            className="rounded-full bg-teal-400 animate-pulse"
                            style={{ width: '8px', height: '8px' }}
                        ></div>
                        <span className="text-xs text-neutral-400 whitespace-nowrap">Online</span>
                    </div> */}
                </div>
            </div>
        </>
    );
}