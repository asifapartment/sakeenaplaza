"use client";

import { useEffect, useState } from "react";

export default function GuestDetailsForm({ initialData, onComplete }) {
    const [guest, setGuest] = useState({
        name: "",
        age: "",
        gender: "",
        phone: "",
        countryCode: "+91",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Country codes for phone
    const countryCodes = [
        { code: "+91", country: "India", flag: "IN" },
        { code: "+1", country: "USA", flag: "US" },
        { code: "+44", country: "UK", flag: "GB" },
        { code: "+61", country: "Australia", flag: "AU" },
        { code: "+65", country: "Singapore", flag: "SG" },
        { code: "+971", country: "UAE", flag: "AE" },
    ];

    // INIT DATA (Edit mode)
    useEffect(() => {
        if (initialData) {
            const data = { ...initialData };

            // Extract country code
            const matchedCode = countryCodes.find(c =>
                data.phone.startsWith(c.code)
            );

            if (matchedCode) {
                data.countryCode = matchedCode.code;
                data.phone = data.phone.replace(matchedCode.code, "");
            } else {
                data.countryCode = "+91";
            }

            setGuest(data);
        }
    }, [initialData]);

    // UPDATE FIELD
    const updateField = (field, value) => {
        setGuest(prev => ({ ...prev, [field]: value }));

        // Clear error when changing field
        setErrors(prev => {
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });
    };

    // VALIDATION
    const validate = () => {
        const newErrors = {};

        if (!guest.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!guest.age) {
            newErrors.age = "Age is required";
        } else if (guest.age < 1 || guest.age > 120) {
            newErrors.age = "Please enter a valid age";
        }

        if (!guest.gender) {
            newErrors.gender = "Gender is required";
        }

        if (!guest.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\d{10}$/.test(guest.phone)) {
            newErrors.phone = "Enter a valid 10-digit number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // SCROLL TO FIRST ERROR
    const scrollToFirstError = (errObj) => {
        const firstKey = Object.keys(errObj)[0];
        const element = document.querySelector(`[data-field="${firstKey}"]`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    // SUBMIT
    const handleSubmit = async () => {
        if (!validate()) {
            scrollToFirstError(errors);
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                ...guest,
                phone: guest.countryCode + guest.phone,
            };

            delete payload.countryCode;

            await onComplete(payload);
        } catch (err) {
            console.error(err);
        }

        setIsSubmitting(false);
    };

    return (
        <div className="bg-gradient-to-br from-neutral-900 to-black py-8 px-4">
            <div className="max-w-sm mx-auto">

                {/* Form Container */}
                <div className="bg-neutral-800/50 rounded-2xl border border-neutral-700 p-6 md:p-8 shadow-xl">

                    {/* Form Header */}
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-neutral-700">
                        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-700">
                            <i className="fas fa-id-card text-xl text-blue-400"></i>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Guest Details</h2>
                            <p className="text-sm text-neutral-400">Personal information section</p>
                        </div>
                    </div>

                    <div className="space-y-8">

                        {/* NAME Field */}
                        <div className="space-y-3" data-field="name">
                            <label className="text-sm font-medium text-white flex items-center gap-2">
                                <i className="fas fa-user text-sm text-blue-400"></i>
                                Full Name <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    value={guest.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    className={`w-full p-4 rounded-xl bg-neutral-900 border-2 ${errors.name
                                        ? "border-red-500 focus:border-red-500"
                                        : "border-neutral-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        } transition-all duration-200`}
                                    placeholder="Enter your full name"
                                />
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-500">
                                    <i className="fas fa-pen"></i>
                                </div>
                            </div>
                            {errors.name && (
                                <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                                    <i className="fas fa-exclamation-circle text-sm"></i>
                                    {errors.name}
                                </div>
                            )}
                        </div>

                        {/* AGE & GENDER - Single Row on All Screens */}
                        <div className="flex flex-col sm:flex-row gap-6">

                            {/* AGE Field */}
                            <div className="flex-1 space-y-3" data-field="age">
                                <label className="text-sm font-medium text-white flex items-center gap-2">
                                    <i className="fas fa-birthday-cake text-sm text-blue-400"></i>
                                    Age <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        max="120"
                                        value={guest.age}
                                        onChange={(e) => updateField("age", e.target.value)}
                                        className={`w-full p-4 rounded-xl bg-neutral-900 border-2 ${errors.age
                                            ? "border-red-500 focus:border-red-500"
                                            : "border-neutral-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                            } transition-all duration-200`}
                                        placeholder="e.g., 25"
                                    />
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-500">
                                        <i className="fas fa-user-clock"></i>
                                    </div>
                                </div>
                                {errors.age && (
                                    <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                                        <i className="fas fa-exclamation-circle text-sm"></i>
                                        {errors.age}
                                    </div>
                                )}
                            </div>

                            {/* GENDER Field */}
                            <div className="flex-1 space-y-3" data-field="gender">
                                <label className="text-sm font-medium text-white flex items-center gap-2">
                                    <i className="fas fa-venus-mars text-sm text-blue-400"></i>
                                    Gender <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={guest.gender}
                                        onChange={(e) => updateField("gender", e.target.value)}
                                        className={`w-full p-4 rounded-xl bg-neutral-900 border-2 appearance-none ${errors.gender
                                            ? "border-red-500 focus:border-red-500"
                                            : "border-neutral-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                            } transition-all duration-200`}
                                    >
                                        <option value="" className="bg-neutral-900">Select gender</option>
                                        <option value="male" className="bg-neutral-900">Male</option>
                                        <option value="female" className="bg-neutral-900">Female</option>
                                        <option value="other" className="bg-neutral-900">Other</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-neutral-500">
                                        <i className="fas fa-chevron-down"></i>
                                    </div>
                                </div>
                                {errors.gender && (
                                    <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                                        <i className="fas fa-exclamation-circle text-sm"></i>
                                        {errors.gender}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* PHONE Field - Single Row on All Screens */}
                        <div className="space-y-3" data-field="phone">
                            <label className="text-sm font-medium text-white flex items-center gap-2">
                                <i className="fas fa-phone text-sm text-blue-400"></i>
                                Phone Number <span className="text-red-400">*</span>
                            </label>

                            {/* Country Code & Phone Input in Single Row */}
                            <div className="flex flex-col sm:flex-row gap-4">

                                {/* Country Code Selector */}
                                <div className="relative sm:w-48">
                                    <div className="flex items-center p-4 rounded-xl bg-neutral-900 border-2 border-neutral-700 hover:border-blue-500/50 transition-all duration-200">
                                        <select
                                            value={guest.countryCode}
                                            onChange={(e) => updateField("countryCode", e.target.value)}
                                            className="w-full bg-transparent appearance-none focus:outline-none text-white"
                                        >
                                            {countryCodes.map(c => (
                                                <option key={c.code} value={c.code} className="bg-neutral-900">
                                                    {c.flag} {c.code}
                                                </option>
                                            ))}
                                        </select>
                                        <i className="fas fa-chevron-down text-neutral-500 ml-2"></i>
                                    </div>
                                </div>

                                {/* Phone Input */}
                                <div className="flex-1 relative">
                                    <input
                                        value={guest.phone}
                                        onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, ""))}
                                        type="text"
                                        maxLength={10}
                                        className={`w-full p-4 rounded-xl bg-neutral-900 border-2 ${errors.phone
                                            ? "border-red-500 focus:border-red-500"
                                            : "border-neutral-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                            } transition-all duration-200`}
                                        placeholder="Enter 10-digit number"
                                    />
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-500">
                                        <i className="fas fa-mobile-alt"></i>
                                    </div>
                                </div>
                            </div>

                            {errors.phone && (
                                <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                                    <i className="fas fa-exclamation-circle text-sm"></i>
                                    {errors.phone}
                                </div>
                            )}

                            <p className="text-xs text-neutral-500 mt-2">
                                <i className="fas fa-info-circle mr-1"></i>
                                We'll only contact you for important updates regarding your stay
                            </p>
                        </div>

                        {/* Submit Section */}
                        <div className="pt-8 mt-6 border-t border-neutral-700">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${isSubmitting
                                    ? 'bg-blue-500/70 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-3">
                                    {isSubmitting ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin text-white"></i>
                                            <span className="text-white">Saving Details...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save text-white"></i>
                                            <span className="text-white">Save Guest Details</span>
                                        </>
                                    )}
                                </div>
                            </button>

                            <div className="flex items-center justify-center gap-2 mt-4 text-neutral-500 text-sm">
                                <i className="fas fa-shield-alt"></i>
                                <span>Your information is securely encrypted</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
