'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLock,
    faSignInAlt,
    faUserPlus,
    faKey,
    faExclamationTriangle,
    faArrowRight,
    faShieldAlt,
    faBan,
    faHourglassHalf,
} from '@fortawesome/free-solid-svg-icons';
import AuthModal from '@/components/AuthModal';

export default function UnauthorizedPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('login');
    const [isVisible, setIsVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [errorType, setErrorType] = useState(null);
    const [redirectPath, setRedirectPath] = useState('/');

    useEffect(() => {
        if (redirectPath) {
            sessionStorage.setItem('redirectAfterLogin', redirectPath);
        }
    }, [redirectPath]);
    
    useEffect(() => {
        setMounted(true);

        // Get error type from URL params
        const type = searchParams.get('error');
        const redirect = searchParams.get('redirect') || '/';

        setErrorType(type);
        setRedirectPath(redirect);

        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, [searchParams]);

    const handleOpenModal = (tab = 'login') => {
        setActiveTab(tab);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        // Refresh the page or redirect after modal close
        if (errorType === 'unauthorized') {
            router.refresh();
        }
    };

    const handleRedirect = () => {
        router.push(redirectPath);
    };

    // Content based on error type
    const getErrorContent = () => {
        switch (errorType) {
            case 'forbidden':
                return {
                    icon: faBan,
                    iconColor: 'text-orange-500',
                    badgeText: 'Access Forbidden - Insufficient Permissions',
                    badgeColor: 'border-orange-500/30 bg-orange-500/10',
                    textColor: 'text-orange-400',
                    title: 'Access Denied',
                    highlightText: 'You don\'t have permission to access this page.',
                    description: 'Your account does not have the required permissions to view this resource. Please contact your administrator if you believe this is a mistake.',
                    showLoginButton: false,
                    showRegisterButton: false,
                    showBackButton: true,
                };
            case 'session_expired':
                return {
                    icon: faHourglassHalf,
                    iconColor: 'text-yellow-500',
                    badgeText: 'Session Expired - Please Login Again',
                    badgeColor: 'border-yellow-500/30 bg-yellow-500/10',
                    textColor: 'text-yellow-400',
                    title: 'Session Expired',
                    highlightText: 'Your session has expired.',
                    description: 'For security reasons, your session has timed out. Please log in again to continue.',
                    showLoginButton: true,
                    showRegisterButton: false,
                    showBackButton: true,
                };
            default: // unauthorized / 401
                return {
                    icon: faLock,
                    iconColor: 'text-red-500',
                    badgeText: 'Access Restricted - Authentication Required',
                    badgeColor: 'border-red-500/30 bg-red-500/10',
                    textColor: 'text-red-400',
                    title: 'Authentication Required',
                    highlightText: 'Please log in to continue.',
                    description: 'You need to be authenticated to access this page. Please sign in or create an account.',
                    showLoginButton: true,
                    showRegisterButton: true,
                };
        }
    };

    const content = getErrorContent();

    if (!mounted) return null;

    return (
        <>
            <div className="relative max-h-screen bg-black overflow-hidden">
                {/* Animated Shapes - Color based on error type */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Rotating Square */}
                    <div className={`absolute top-10 left-10 w-32 h-32 border-2 ${content.iconColor}/20 animate-rotate-slow`} />

                    {/* Floating Circle */}
                    <div className={`absolute bottom-20 right-20 w-48 h-48 rounded-full border-2 ${content.iconColor}/20 animate-float-slow`} />

                    {/* Pulsing Ring */}
                    <div className={`absolute top-1/3 right-1/4 w-24 h-24 rounded-full border ${content.iconColor}/20 animate-ping-slow`} />

                    {/* Moving Dot */}
                    <div className={`absolute bottom-1/3 left-10 w-2 h-2 ${content.iconColor}/50 rounded-full animate-move-horizontal`} />

                    {/* Second floating shape */}
                    <div className={`absolute top-1/2 left-1/4 w-16 h-16 rounded-full border-2 ${content.iconColor}/20 animate-float-reverse`} />

                    {/* Bouncing line */}
                    <div className={`absolute bottom-10 left-1/2 w-px h-20 ${content.iconColor}/20 animate-bounce-subtle`} />

                    {/* Rotating triangle effect */}
                    <div className={`absolute top-20 right-20 w-20 h-20 border-2 ${content.iconColor}/20 animate-rotate-slow animation-delay-500`} style={{ transform: 'rotate(45deg)' }} />

                    {/* Wavy dots */}
                    <div className="absolute top-1/2 right-10 flex flex-col gap-2">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`w-1.5 h-1.5 ${content.iconColor}/30 rounded-full animate-wave`}
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex items-center justify-center min-h-screen px-4 py-12 md:py-20 relative z-10">
                    <div className="max-w-3xl w-full">
                        <div
                            className={`transition-all duration-700 ease-out
                                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                        >
                            <div className="p-6 sm:p-10 lg:p-14">
                                {/* Icon with subtle float */}
                                <div className="flex justify-center mb-6">
                                    <div className={`border ${content.iconColor}/30 rounded-full w-32 h-32 flex items-center justify-center animate-float-slow bg-black/20`}>
                                        <FontAwesomeIcon
                                            icon={content.icon}
                                            className={content.iconColor}
                                            style={{ width: '56px', height: '56px' }}
                                        />
                                    </div>
                                </div>

                                {/* Error Badge */}
                                <div className="flex justify-center mb-6">
                                    <div className={`${content.badgeColor} border ${content.iconColor}/30 rounded-full px-5 py-2.5 transition-transform duration-300 hover:scale-105`}>
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon
                                                icon={faExclamationTriangle}
                                                className={content.iconColor}
                                                style={{ width: '18px', height: '18px' }}
                                            />
                                            <span className={`${content.textColor} text-sm font-semibold`}>
                                                {content.badgeText}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* HTTP Status Code */}
                                <div className="text-center mb-4">
                                    <h1 className={`text-7xl font-mono font-bold ${content.iconColor} opacity-50`}>
                                        {errorType === 'forbidden' ? '403' : errorType === 'session_expired' ? '401' : '401'}
                                    </h1>
                                </div>

                                {/* Title */}
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-5">
                                    <span className="text-white">
                                        {content.title}
                                    </span>
                                </h1>

                                {/* Description */}
                                <p className="text-gray-300 text-center mb-8 text-base leading-relaxed">
                                    <span className={`${content.textColor} font-semibold`}>
                                        {content.highlightText}
                                    </span>
                                    <br />
                                    {content.description}
                                </p>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    {content.showLoginButton && (
                                        <button
                                            onClick={() => handleOpenModal('login')}
                                            className={`group px-8 py-4 ${errorType === 'session_expired' ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-red-600 hover:bg-red-500'} rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20`}
                                        >
                                            <span className="flex items-center gap-3 text-base">
                                                <FontAwesomeIcon
                                                    icon={faSignInAlt}
                                                    className="text-white"
                                                    style={{ width: '18px', height: '18px' }}
                                                />
                                                Sign In to Continue
                                                <FontAwesomeIcon
                                                    icon={faArrowRight}
                                                    className="text-white transition-transform duration-300 group-hover:translate-x-1"
                                                    style={{ width: '16px', height: '16px' }}
                                                />
                                            </span>
                                        </button>
                                    )}

                                    {content.showRegisterButton && (
                                        <button
                                            onClick={() => handleOpenModal('register')}
                                            className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg font-semibold text-white transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95 flex items-center gap-3 justify-center text-base"
                                        >
                                            <FontAwesomeIcon
                                                icon={faUserPlus}
                                                className="text-white"
                                                style={{ width: '18px', height: '18px' }}
                                            />
                                            Create New Account
                                        </button>
                                    )}

                                    {content.showBackButton && (
                                        <button
                                            onClick={handleRedirect}
                                            className="px-8 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-lg font-semibold text-gray-300 transition-all duration-300 hover:bg-gray-700/50 hover:scale-105 active:scale-95 flex items-center gap-3 justify-center text-base"
                                        >
                                            <FontAwesomeIcon
                                                icon={faArrowRight}
                                                className="text-gray-400"
                                                style={{ width: '16px', height: '16px' }}
                                            />
                                            Go Back to Safety
                                        </button>
                                    )}
                                </div>

                                {/* Info Cards */}
                                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
                                    {[
                                        { icon: faShieldAlt, text: '256-bit SSL Encryption', color: errorType === 'forbidden' ? 'orange' : 'red' },
                                        { icon: faKey, text: 'Multi-Factor Authentication', color: errorType === 'forbidden' ? 'orange' : 'red' },
                                        { icon: faLock, text: 'Privacy Protected Access', color: errorType === 'forbidden' ? 'amber' : 'red' },
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-all duration-300 hover:scale-105 cursor-default group
                                                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                                            style={{
                                                transitionDelay: `${idx * 100}ms`,
                                                transitionProperty: 'all',
                                                transitionDuration: '500ms',
                                                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                icon={item.icon}
                                                className={`text-${item.color}-400 group-hover:text-${item.color}-300`}
                                                style={{ width: '16px', height: '16px' }}
                                            />
                                            <span>{item.text}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Security Note */}
                                <div className="mt-6 text-center">
                                    <p className="text-xs text-gray-500">
                                        {errorType === 'forbidden'
                                            ? 'Access violations are logged and monitored. Unauthorized access attempts may be reported.'
                                            : 'This area is restricted. All access attempts are logged and monitored.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <style jsx>{`
                @keyframes float-slow {
                    0%, 100% {
                        transform: translateY(0px) translateX(0px);
                    }
                    25% {
                        transform: translateY(-15px) translateX(5px);
                    }
                    75% {
                        transform: translateY(10px) translateX(-5px);
                    }
                }
                
                @keyframes float-reverse {
                    0%, 100% {
                        transform: translateY(0px) translateX(0px);
                    }
                    25% {
                        transform: translateY(10px) translateX(-10px);
                    }
                    75% {
                        transform: translateY(-10px) translateX(10px);
                    }
                }
                
                @keyframes rotate-slow {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
                
                @keyframes ping-slow {
                    0% {
                        transform: scale(0.8);
                        opacity: 0.5;
                    }
                    50% {
                        transform: scale(1.2);
                        opacity: 0.1;
                    }
                    100% {
                        transform: scale(0.8);
                        opacity: 0.5;
                    }
                }
                
                @keyframes move-horizontal {
                    0%, 100% {
                        transform: translateX(0px);
                    }
                    25% {
                        transform: translateX(50px);
                    }
                    75% {
                        transform: translateX(-50px);
                    }
                }
                
                @keyframes bounce-subtle {
                    0%, 100% {
                        transform: translateY(0px);
                        opacity: 0.3;
                    }
                    50% {
                        transform: translateY(-20px);
                        opacity: 0.8;
                    }
                }
                
                @keyframes wave {
                    0%, 100% {
                        transform: translateY(0px);
                        opacity: 0.2;
                    }
                    50% {
                        transform: translateY(-15px);
                        opacity: 0.8;
                    }
                }
                
                .animate-float-slow {
                    animation: float-slow 6s ease-in-out infinite;
                    will-change: transform;
                }
                
                .animate-float-reverse {
                    animation: float-reverse 7s ease-in-out infinite;
                    will-change: transform;
                }
                
                .animate-rotate-slow {
                    animation: rotate-slow 12s linear infinite;
                    will-change: transform;
                }
                
                .animate-ping-slow {
                    animation: ping-slow 4s ease-in-out infinite;
                    will-change: transform, opacity;
                }
                
                .animate-move-horizontal {
                    animation: move-horizontal 8s ease-in-out infinite;
                    will-change: transform;
                }
                
                .animate-bounce-subtle {
                    animation: bounce-subtle 3s ease-in-out infinite;
                    will-change: transform, opacity;
                }
                
                .animate-wave {
                    animation: wave 2s ease-in-out infinite;
                    will-change: transform, opacity;
                }
                
                .animation-delay-500 {
                    animation-delay: 500ms;
                }
            `}</style>
        </>
    );
}