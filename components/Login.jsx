'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEnvelope,
    faLock,
    faEye,
    faEyeSlash,
    faSignInAlt,
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm({ isModal = false, onSuccess, redirectPath: propRedirectPath }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [redirectPath, setRedirectPath] = useState('/dashboard');

    useEffect(() => {
        // Determine redirect path
        if (typeof window !== 'undefined') {
            const urlRedirect = searchParams?.get('redirect');
            const sessionRedirect = sessionStorage.getItem('redirectAfterLogin');
            const finalRedirect = propRedirectPath || urlRedirect || sessionRedirect || '/dashboard';
            setRedirectPath(finalRedirect);
        }
    }, [searchParams, propRedirectPath]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Login successful! Redirecting...');

                // Store user data if needed
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }

                // If modal has onSuccess callback, use it (for modal flow)
                if (onSuccess) {
                    setTimeout(() => {
                        onSuccess();
                    }, 500);
                } else {
                    // Direct page login (not modal)
                    setTimeout(() => {
                        // Clear any stored redirect
                        sessionStorage.removeItem('redirectAfterLogin');
                        router.push(redirectPath);
                        router.refresh();
                    }, 500);
                }
            } else {
                setMessage(data.error || 'Login failed. Please try again.');
            }
        } catch (error) {
            setMessage('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={`min-h-full flex flex-col ${isModal ? '' : 'items-center justify-center'}`}>
            <h2 className="text-2xl font-bold text-center text-white mb-2">
                Welcome Back
            </h2>
            <p className="text-center text-gray-400 mb-8 text-sm">
                Sign in to your account
            </p>

            <form onSubmit={handleLogin} className="space-y-5 w-full max-w-md">
                {/* Email Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                    </label>
                    <div className="flex items-center border border-white/20 rounded-lg px-4 py-3 bg-black focus-within:border-white transition-colors">
                        <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 mr-3" />
                        <input
                            type="email"
                            className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password
                    </label>
                    <div className="flex items-center border border-white/20 rounded-lg px-4 py-3 bg-black focus-within:border-white transition-colors">
                        <FontAwesomeIcon icon={faLock} className="text-gray-400 mr-3" />
                        <input
                            type={showPassword ? "text" : "password"}
                            className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="text-gray-400 hover:text-white focus:outline-none"
                        >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                    </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                    <Link
                        href="/forgot-password"
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Forgot Password?
                    </Link>
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-black py-3 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                    {loading ? (
                        'Logging in...'
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                            Sign In
                        </>
                    )}
                </button>

                {/* Register Link */}
                <div className="text-center pt-4">
                    <p className="text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link
                            href="/register"
                            className="text-white hover:underline font-semibold"
                        >
                            Create an account
                        </Link>
                    </p>
                </div>
            </form>

            {/* Message Display */}
            {message && (
                <div className={`mt-6 text-center text-sm ${message.includes('successful') ? 'text-green-500' : 'text-red-500'
                    }`}>
                    {message}
                </div>
            )}
        </div>
    );
}