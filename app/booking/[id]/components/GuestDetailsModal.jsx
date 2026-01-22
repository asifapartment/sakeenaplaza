"use client";

import { X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faPen,
    faCakeCandles,
    faUserClock,
    faVenusMars,
    faChevronDown,
    faPhone,
    faMobileAlt,
    faInfoCircle,
    faExclamationCircle,
    faSpinner,
    faSave,
    faCheck,
    faChevronUp,
} from '@fortawesome/free-solid-svg-icons';

export default function GuestDetailsModal({
    isOpen,
    onClose,
    guestCount,
    onSave,
    initialData
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999] px-4 py-6">
            <div className="relative bg-neutral-900 rounded-2xl w-full max-w-md border border-neutral-800 shadow-2xl shadow-black/50 overflow-hidden">

                {/* X Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-neutral-400 hover:text-white 
                        hover:bg-neutral-800 p-2 rounded-full transition duration-200"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Modal Header */}
                <div className="bg-gradient-to-r from-white/5 to-transparent p-4 border-l border-neutral-700">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-400 absolute -left-3"></div>
                            <FontAwesomeIcon icon={faUser} className="text-lg text-neutral-300" />
                        </div>
                        <div>
                            <h2 className="text-xl font-light text-white tracking-wide">Guest Details</h2>
                            <div className="w-20 h-0.5 bg-gradient-to-r from-blue-500 to-transparent mt-1"></div>
                        </div>
                    </div>
                </div>

                {/* Form Container */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <GuestDetailsFormWrapper
                        guestCount={guestCount}
                        initialData={initialData}
                        onComplete={onSave}
                    />
                </div>
            </div>
        </div>
    );
}

// Custom Dropdown Component for Country Codes with Flag Icons
function CountryCodeDropdown({ value, onChange, countryCodes }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedCountry = countryCodes.find(c => c.code === value);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Selected Item - Compact width */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between p-3 rounded-lg bg-neutral-800 border border-neutral-700 hover:border-blue-500 transition-colors focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 min-w-[100px]"
            >
                <div className="flex items-center gap-2">
                    <span className={`text-base fi fi-${selectedCountry?.code.toLowerCase().slice(1)}`}></span>
                    <span className="text-white text-sm font-medium">{selectedCountry?.code}</span>
                </div>
                <FontAwesomeIcon
                    icon={isOpen ? faChevronUp : faChevronDown}
                    className="text-xs text-neutral-500 ml-1"
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 rounded-lg bg-neutral-800 border border-neutral-700 shadow-lg shadow-black/50 z-50 overflow-hidden min-w-[180px]">
                    <div className="max-h-30 overflow-y-auto custom-scrollbar">
                        {countryCodes.map((country) => (
                            <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                    onChange(country.code);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-700/80 transition-colors ${value === country.code ? 'bg-neutral-700/60' : ''
                                    }`}
                            >
                                <span className={`text-base fi fi-${country.code.toLowerCase().slice(1)}`}></span>
                                <span className="text-white text-sm font-medium">{country.code}</span>
                                <span className="text-neutral-400 text-xs ml-auto">{country.name}</span>
                                {value === country.code && (
                                    <FontAwesomeIcon icon={faCheck} className="text-xs text-blue-400 ml-2" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Guest Details Form Component
function GuestDetailsFormWrapper({ guestCount, initialData, onComplete }) {
    const [guest, setGuest] = useState(initialData || {
        name: '',
        age: '',
        gender: '',
        countryCode: '+1',
        phone: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const countryCodes = [
        { code: '+1', name: 'United States' },
        { code: '+44', name: 'United Kingdom' },
        { code: '+91', name: 'India' },
        { code: '+61', name: 'Australia' },
        { code: '+81', name: 'Japan' },
        { code: '+33', name: 'France' },
        { code: '+49', name: 'Germany' },
        { code: '+86', name: 'China' },
        { code: '+971', name: 'UAE' },
        { code: '+65', name: 'Singapore' },
        { code: '+60', name: 'Malaysia' },
        { code: '+92', name: 'Pakistan' },
        { code: '+94', name: 'Sri Lanka' },
        { code: '+880', name: 'Bangladesh' },
        { code: '+977', name: 'Nepal' }
    ];

    const updateField = (field, value) => {
        setGuest(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!guest.name.trim()) {
            newErrors.name = 'Full name is required';
        }

        if (!guest.age || guest.age < 1 || guest.age > 120) {
            newErrors.age = 'Please enter a valid age (1-120)';
        }

        if (!guest.gender) {
            newErrors.gender = 'Please select gender';
        }

        if (!guest.phone || guest.phone.length < 10) {
            newErrors.phone = 'Valid 10-digit phone number required';
        }

        return newErrors;
    };

    const handleSubmit = async () => {
        const formErrors = validateForm();

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await onComplete(guest);
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* NAME Field */}
            <div className="space-y-2" data-field="name">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                    <FontAwesomeIcon icon={faUser} className="text-xs text-blue-400" />
                    Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                    <input
                        value={guest.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className={`w-full p-3 rounded-lg bg-neutral-800 border ${errors.name
                            ? "border-red-500"
                            : "border-neutral-700 focus:border-blue-500"
                            } focus:ring-1 focus:ring-blue-500/30 transition-colors`}
                        placeholder="Enter full name"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                        <FontAwesomeIcon icon={faPen} className="text-xs" />
                    </div>
                </div>
                {errors.name && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                        <FontAwesomeIcon icon={faExclamationCircle} className="text-xs" />
                        {errors.name}
                    </div>
                )}
            </div>

            {/* AGE + GENDER - Single Row */}
            <div className="grid grid-cols-2 gap-4">
                {/* AGE */}
                <div className="space-y-2" data-field="age">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faCakeCandles} className="text-xs text-blue-400" />
                        Age <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            min="1"
                            max="120"
                            value={guest.age}
                            onChange={(e) => updateField("age", e.target.value)}
                            className={`w-full p-3 rounded-lg bg-neutral-800 border ${errors.age
                                ? "border-red-500"
                                : "border-neutral-700 focus:border-blue-500"
                                } focus:ring-1 focus:ring-blue-500/30 transition-colors`}
                            placeholder="Age"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                            <FontAwesomeIcon icon={faUserClock} className="text-xs" />
                        </div>
                    </div>
                    {errors.age && (
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                            <FontAwesomeIcon icon={faExclamationCircle} className="text-xs" />
                            {errors.age}
                        </div>
                    )}
                </div>

                {/* GENDER */}
                <div className="space-y-2" data-field="gender">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faVenusMars} className="text-xs text-blue-400" />
                        Gender <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                        <select
                            value={guest.gender}
                            onChange={(e) => updateField("gender", e.target.value)}
                            className={`w-full p-3 rounded-lg bg-neutral-800 border appearance-none ${errors.gender
                                ? "border-red-500"
                                : "border-neutral-700 focus:border-blue-500"
                                } focus:ring-1 focus:ring-blue-500/30 transition-colors`}
                        >
                            <option value="" className="bg-neutral-800">Select</option>
                            <option value="male" className="bg-neutral-800">Male</option>
                            <option value="female" className="bg-neutral-800">Female</option>
                            <option value="other" className="bg-neutral-800">Other</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-neutral-500">
                            <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                        </div>
                    </div>
                    {errors.gender && (
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                            <FontAwesomeIcon icon={faExclamationCircle} className="text-xs" />
                            {errors.gender}
                        </div>
                    )}
                </div>
            </div>

            {/* PHONE - Single Row */}
            <div className="space-y-2" data-field="phone">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                    <FontAwesomeIcon icon={faPhone} className="text-xs text-blue-400" />
                    Phone <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-3">
                    {/* Country Code - Custom Dropdown (Small width) */}
                    <div className="w-28">
                        <CountryCodeDropdown
                            value={guest.countryCode}
                            onChange={(value) => updateField("countryCode", value)}
                            countryCodes={countryCodes}
                        />
                    </div>

                    {/* Phone Input - Takes remaining space (Wider) */}
                    <div className="flex-1 min-w-0">
                        <div className="relative">
                            <input
                                value={guest.phone}
                                onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, ""))}
                                type="text"
                                maxLength={15}
                                className={`w-full p-3 rounded-lg bg-neutral-800 border ${errors.phone
                                    ? "border-red-500"
                                    : "border-neutral-700 focus:border-blue-500"
                                    } focus:ring-1 focus:ring-blue-500/30 transition-colors`}
                                placeholder="1234567890"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                                <FontAwesomeIcon icon={faMobileAlt} className="text-xs" />
                            </div>
                        </div>
                    </div>
                </div>
                {errors.phone && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                        <FontAwesomeIcon icon={faExclamationCircle} className="text-xs" />
                        {errors.phone}
                    </div>
                )}
                <p className="text-xs text-neutral-500 mt-1">
                    <FontAwesomeIcon icon={faInfoCircle} className="mr-1 text-xs" />
                    Enter your phone number (10-15 digits)
                </p>
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 mt-4 ${isSubmitting
                    ? 'bg-blue-600/70 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
                    }`}
            >
                <div className="flex items-center justify-center gap-2">
                    {isSubmitting ? (
                        <>
                            <FontAwesomeIcon icon={faSpinner} className="text-white animate-spin" />
                            <span className="text-white">Saving...</span>
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faSave} className="text-white" />
                            <span className="text-white">Save Guest Details</span>
                        </>
                    )}
                </div>
            </button>

        </div>
    );
}