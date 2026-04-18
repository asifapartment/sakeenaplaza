'use client';

import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faPaperPlane, faUser, faPhone, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';

export default function RegisterForm({ isModal = false, setTab }) {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState(Array(6).fill(''));
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [attemptsLeft, setAttemptsLeft] = useState(3);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();
    const [timer, setTimer] = useState(0);
    const otpRefs = useRef([]);

    // Countdown timer
    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    // Focus OTP input
    useEffect(() => {
        if (step === 2 && otpRefs.current[0]) otpRefs.current[0].focus();
    }, [step]);

    const isFormValid = () => {
        return name && email && phone && password && confirmPassword &&
            password === confirmPassword && password.length >= 6;
    };

    const handleOtpChange = (value, index) => {
        if (/^\d*$/.test(value)) {
            let newOtp = [...otp];
            if (value.length > 1) {
                value.split('').slice(0, 6).forEach((char, idx) => (newOtp[idx] = char));
                setOtp(newOtp);
                otpRefs.current[Math.min(value.length, 5)].focus();
            } else {
                newOtp[index] = value;
                setOtp(newOtp);
                if (value && index < 5) otpRefs.current[index + 1].focus();
            }
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1].focus();
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setMessage('Passwords do not match!');
        }

        if (password.length < 6) {
            return setMessage('Password must be at least 6 characters!');
        }

        setLoading(true);
        setMessage('');
        setTimer(60);

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, purpose: 'registration' }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage(`OTP sent to ${email}.`);
                setStep(2);
                setAttemptsLeft(3);
            } else {
                setMessage(data.error || 'Failed to send OTP.');
            }
        } catch (error) {
            setMessage('Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (otp.join('').length !== 6) {
            return setMessage('Please enter complete OTP');
        }

        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    password,
                    otp: otp.join("")
                }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage('Registration successful! Redirecting to login...');
                setTimeout(() => {
                    setTab('login');
                }, 2000);
            } else {
                setMessage(data.message || 'Registration failed.');
                if (data.message?.includes('OTP')) {
                    setAttemptsLeft(prev => prev - 1);
                }
            }
        } catch (error) {
            setMessage('Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className={`min-h-full flex flex-col ${isModal ? '' : 'items-center justify-center'}`}>
            <h2 className="text-2xl font-bold text-center text-white mb-2">
                {step === 1 ? 'Create Account' : 'Verify OTP'}
            </h2>
            <p className="text-center text-gray-400 mb-8 text-sm">
                {step === 1 ? 'Sign up to get started' : `Enter OTP sent to ${email}`}
            </p>

            {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-5 w-full max-w-md">
                    {/* Full Name Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Full Name
                        </label>
                        <div className="flex items-center border border-white/20 rounded-lg px-4 py-3 bg-black focus-within:border-white transition-colors">
                            <FontAwesomeIcon icon={faUser} className="text-gray-400 mr-3" />
                            <input
                                type="text"
                                className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                                placeholder="John Doe"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

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
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Phone Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Phone Number
                        </label>
                        <div className="flex items-center border border-white/20 rounded-lg px-4 py-3 bg-black focus-within:border-white transition-colors">
                            <FontAwesomeIcon icon={faPhone} className="text-gray-400 mr-3" />
                            <input
                                type="tel"
                                className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                                placeholder="+1 234 567 8900"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
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
                                placeholder="Create a password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
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
                        {password && password.length < 6 && (
                            <p className="mt-1 text-xs text-red-500">Password must be at least 6 characters</p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Confirm Password
                        </label>
                        <div className="flex items-center border border-white/20 rounded-lg px-4 py-3 bg-black focus-within:border-white transition-colors">
                            <FontAwesomeIcon icon={faLock} className="text-gray-400 mr-3" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={toggleConfirmPasswordVisibility}
                                className="text-gray-400 hover:text-white focus:outline-none"
                            >
                                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                            <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                        )}
                    </div>

                    {/* Register Button */}
                    <button
                        type="submit"
                        disabled={loading || !isFormValid()}
                        className="w-full bg-white text-black py-3 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                        {loading ? 'Sending OTP...' : (
                            <>
                                <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                                Send OTP
                            </>
                        )}
                    </button>

                    {/* Login Link */}
                    <div className="text-center pt-4">
                        <p className="text-sm text-gray-400">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => setTab('login')}
                                className="text-white hover:underline font-semibold"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleRegister} className="space-y-5 w-full max-w-md">
                    {/* OTP Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Enter OTP
                        </label>
                        <div className="flex justify-between gap-2">
                            {otp.map((d, i) => (
                                <input
                                    key={i}
                                    ref={el => otpRefs.current[i] = el}
                                    type="text"
                                    maxLength="1"
                                    className="w-12 h-12 text-center font-bold rounded-lg outline-none bg-black text-white border border-white/20 focus:border-white transition-colors"
                                    value={d}
                                    onChange={e => handleOtpChange(e.target.value, i)}
                                    onKeyDown={e => handleOtpKeyDown(e, i)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Timer and Attempts */}
                    <div className="text-center">
                        {timer > 0 && (
                            <p className="text-sm text-gray-400">Resend OTP in {timer}s</p>
                        )}
                        {attemptsLeft > 0 && attemptsLeft < 3 && (
                            <p className="text-sm text-red-400">Attempts left: {attemptsLeft}</p>
                        )}
                    </div>

                    {/* Verify Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black py-3 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                        {loading ? 'Verifying...' : 'Verify & Register'}
                    </button>

                    {/* Back Button */}
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full bg-transparent border border-white/20 text-white py-3 rounded-lg hover:bg-white/5 transition-colors font-semibold"
                    >
                        Back
                    </button>
                </form>
            )}

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