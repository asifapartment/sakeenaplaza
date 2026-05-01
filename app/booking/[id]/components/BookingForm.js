"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import BookingCalendar from "@/components/bookingCalender";
import Toast from "@/components/toast";
import { Calendar, CreditCard, Loader2, Plus, ShieldCheck, Tag, Users, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import VerificationModal from "./VerificationModal";
import GuestDetailsModal from "./GuestDetailsModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTag, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useOffers, applyOffer, getApplicableOffers } from "@/hooks/useOffers";

function formatForMySQL(date) {
    const pad = (n) => n.toString().padStart(2, "0");
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mi = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function calculateNights(checkin, checkout) {
    if (!checkin || !checkout) return 0;
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return nights > 0 ? nights : 0;
}

function BookingForm({ apartmentId, disabledRanges, lockedRanges, dailyRate = 200, cleaningFee = 500 }) {
    const router = useRouter();
    const { offers, loading: offersLoading } = useOffers(apartmentId);
    const [formData, setFormData] = useState({ checkin: "", checkout: "", guests: 1 });
    const [formError, setFormError] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [bookingSummary, setBookingSummary] = useState(null);
    const [loadCallender, setLoadCallender] = useState(false);
    const [id, setId] = useState(null);
    const [guestsInfo, setGuestsInfo] = useState([]);
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [showPriceDetails, setShowPriceDetails] = useState(false);

    const applicableOffers = useMemo(() => {
        return getApplicableOffers(offers, apartmentId);
    }, [offers, apartmentId]);

    const hasAdultGuest = useMemo(() => {
        return guestsInfo.some(guest => {
            const age = guest.age;
            return age && Number(age) >= 18;
        });
    }, [guestsInfo]);

    const fixedCheckinTime = "15:00";
    const fixedCheckoutTime = "11:00";

    useEffect(() => {
        if (formData.checkin && formData.checkout) {
            const nights = calculateNights(formData.checkin, formData.checkout);
            const discountedDailyRate = applyOffer(dailyRate, offers, apartmentId);
            const hasDailyDiscount = discountedDailyRate < dailyRate;
            const basePrice = nights * discountedDailyRate;
            const total = basePrice + cleaningFee;

            let appliedOffer = null;
            if (hasDailyDiscount && applicableOffers.length > 0) {
                applicableOffers.sort((a, b) => b.discount_percentage - a.discount_percentage);
                appliedOffer = applicableOffers[0];
            }

            setBookingSummary({
                nights,
                dailyRate: discountedDailyRate,
                originalDailyRate: dailyRate,
                basePrice,
                cleaningFee,
                total,
                guests: formData.guests,
                hasDiscount: hasDailyDiscount,
                discountAmount: hasDailyDiscount ? (dailyRate - discountedDailyRate) * nights : 0,
                appliedOffer: appliedOffer
            });
        } else {
            setBookingSummary(null);
        }
    }, [formData.checkin, formData.checkout, formData.guests, dailyRate, cleaningFee, apartmentId, applicableOffers]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!hasAdultGuest) {
            setFormError("At least one guest must be 18 years or older.");
            return;
        }

        if (!agreeTerms) {
            setFormError("You must agree to the Terms & Conditions to continue.");
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!formData.checkin || !formData.checkout) {
            setFormError("Please select check-in and check-out dates.");
            return;
        }

        const checkinDateTime = new Date(`${formData.checkin}T${fixedCheckinTime}`);
        const checkoutDateTime = new Date(`${formData.checkout}T${fixedCheckoutTime}`);

        if (checkinDateTime < today) {
            setFormError("Check-in date cannot be in the past.");
            return;
        }
        if (checkoutDateTime <= checkinDateTime) {
            setFormError("Check-out must be after check-in.");
            return;
        }

        try {
            const response = await fetch('/api/bookings/check-dates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    checkin: formData.checkin,
                    checkout: formData.checkout,
                    apartment_id: Number(apartmentId),
                }),
            });

            const result = await response.json();

            if (response.status === 409) {
                setFormError(result.message);
                return;
            }

            if (!response.ok) {
                setFormError('Unexpected error occurred');
                return;
            }

            setFormError("");
            setError("");
            setShowVerificationModal(true);

        } catch (err) {
            console.error('Error checking booking dates:', err);
            setFormError("Unable to verify booking availability. Please try again.");
        }
    };

    const handleConfirmBooking = async (referenceId) => {
        try {
            setLoading(true);

            if (!formData.guests || formData.guests < 1) {
                setFormError("Please select number of guests.");
                setShowVerificationModal(false);
                return;
            }

            if (!bookingSummary) {
                setFormError("Please select valid dates.");
                setShowVerificationModal(false);
                return;
            }

            if (!hasAdultGuest) {
                setFormError("At least one guest must be 18 years or older.");
                setShowVerificationModal(false);
                return;
            }

            const checkinSQL = formatForMySQL(new Date(`${formData.checkin}T${fixedCheckinTime}`));
            const checkoutSQL = formatForMySQL(new Date(`${formData.checkout}T${fixedCheckoutTime}`));

            const bookingRes = await fetch("/api/bookings/create-temp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    apartment_id: Number(apartmentId),
                    check_in: checkinSQL,
                    check_out: checkoutSQL,
                    guests: Number(formData.guests),
                    total_amount: Number(bookingSummary.total),
                    nights: Number(bookingSummary.nights),
                    guest_details: guestsInfo,
                    document_reference: referenceId
                }),
            });

            const bookingData = await bookingRes.json();

            if (!bookingRes.ok) {
                setFormError(bookingData.error || "Apartment not available.");
                return;
            }

            setId(bookingData.id);
            setShowVerificationModal(false);
            setLoadCallender(true);
            router.push('/dashboard');
        } catch (err) {
            console.error("Booking error:", err);
            setError("Something went wrong. Please try again.");
            setShowVerificationModal(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="book" className="sticky top-24 bg-black rounded-2xl border border-white/10 overflow-hidden w-full max-w-md">
            <div className="p-5 space-y-4">
                {/* Error Toast */}
                {(formError || error) && (
                    <Toast
                        message={formError || error}
                        type="error"
                        onClose={() => { setFormError(""); setError(""); }}
                    />
                )}

                {/* Offer Banner - Compact */}
                {!offersLoading && applicableOffers.length > 0 && (
                    <div className="bg-teal-500/10 border border-teal-400/30 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-teal-400 flex-shrink-0" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-teal-400 text-sm">Special Offer!</span>
                                    <span className="px-2 py-0.5 bg-teal-400/20 text-teal-300 text-xs rounded-full">
                                        {applicableOffers[0].discount_percentage}% OFF
                                    </span>
                                </div>
                                {applicableOffers.length > 1 && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        +{applicableOffers.length - 1} more offer{applicableOffers.length - 1 > 1 ? 's' : ''} available
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Calendar - Compact */}
                    <BookingCalendar
                        apartmentId={apartmentId}
                        formData={formData}
                        setFormData={setFormData}
                        size="compact"
                    />

                    {/* Check-in/out Times - Compact Row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="flex items-center gap-1.5 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                                <span className="text-xs text-gray-400">Check-in</span>
                            </div>
                            <div className="font-semibold text-white text-base">{fixedCheckinTime}</div>
                            <div className="text-xs text-gray-600">Fixed</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="flex items-center gap-1.5 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                                <span className="text-xs text-gray-400">Check-out</span>
                            </div>
                            <div className="font-semibold text-white text-base">{fixedCheckoutTime}</div>
                            <div className="text-xs text-gray-600">Fixed</div>
                        </div>
                    </div>

                    {/* Guests Section - Compact */}
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <button
                                type="button"
                                onClick={() => setShowGuestModal(true)}
                                className="flex items-center gap-2 text-white hover:text-teal-400 transition-colors"
                            >
                                <Users className="w-4 h-4 text-teal-400" />
                                <span className="text-sm font-medium">
                                    {guestsInfo.length} {guestsInfo.length === 1 ? 'Guest' : 'Guests'}
                                </span>
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                            {guestsInfo.length > 0 && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${hasAdultGuest
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {hasAdultGuest ? 'Adult ✓' : 'Need Adult'}
                                </span>
                            )}
                        </div>

                        {guestsInfo.length > 0 && (
                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                {guestsInfo.map((guest, index) => {
                                    const age = guest.age ? Number(guest.age) : null;
                                    const isAdult = age !== null && age >= 18;
                                    return (
                                        <div key={index} className="flex items-center justify-between text-xs p-2 bg-black/30 rounded">
                                            <div>
                                                <span className="text-gray-300">{guest.name || `Guest ${index + 1}`}</span>
                                                {age && <span className="text-gray-500 ml-2">({age}y)</span>}
                                            </div>
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => {
                                                    setFormData({ ...formData, editIndex: index });
                                                    setShowGuestModal(true);
                                                }} className="text-teal-400 hover:text-teal-300">
                                                    <FontAwesomeIcon icon={faPen} className="w-3 h-3" />
                                                </button>
                                                <button type="button" onClick={() => {
                                                    const updated = [...guestsInfo];
                                                    updated.splice(index, 1);
                                                    setGuestsInfo(updated);
                                                    setFormData({ ...formData, guests: updated.length });
                                                }} className="text-red-400 hover:text-red-300">
                                                    <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {guestsInfo.length > 0 && !hasAdultGuest && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-red-400">
                                <AlertCircle className="w-3 h-3" />
                                <span>Need at least one guest 18+</span>
                            </div>
                        )}
                    </div>

                    {/* Price Summary - Collapsible */}
                    {bookingSummary && (
                        <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setShowPriceDetails(!showPriceDetails)}
                                className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-teal-400" />
                                    <span className="text-sm font-medium text-white">Price Summary</span>
                                    {bookingSummary.hasDiscount && (
                                        <span className="px-2 py-0.5 bg-teal-400/20 text-teal-300 text-xs rounded-full">
                                            Save ₹{bookingSummary.discountAmount.toFixed(0)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-teal-400">₹{bookingSummary.total}</span>
                                    {showPriceDetails ? (
                                        <ChevronUp className="w-4 h-4 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                            </button>

                            {showPriceDetails && (
                                <div className="p-3 pt-0 space-y-2 text-sm border-t border-white/10">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">
                                            ₹{bookingSummary.dailyRate} × {bookingSummary.nights} nights
                                        </span>
                                        <span className="text-white">₹{bookingSummary.basePrice}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Cleaning fee</span>
                                        <span className="text-white">₹{cleaningFee}</span>
                                    </div>
                                    {bookingSummary.hasDiscount && (
                                        <div className="flex justify-between text-teal-400">
                                            <span>Discount ({bookingSummary.appliedOffer?.discount_percentage}%)</span>
                                            <span>-₹{bookingSummary.discountAmount}</span>
                                        </div>
                                    )}
                                    <div className="pt-2 border-t border-white/10 flex justify-between font-semibold">
                                        <span className="text-white">Total</span>
                                        <span className="text-teal-400 text-lg">₹{bookingSummary.total}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Terms - Compact */}
                    <div className="flex items-start gap-2">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={agreeTerms}
                            onChange={() => setAgreeTerms(!agreeTerms)}
                            className="w-3.5 h-3.5 mt-0.5 accent-teal-500"
                        />
                        <label htmlFor="terms" className="text-xs text-gray-400">
                            I agree to the <a href="/terms-conditions" className="text-teal-400">Terms</a> &{" "}
                            <a href="/cancellation-refund" className="text-teal-400">Cancellation Policy</a>
                        </label>
                    </div>

                    {/* Secure Payment - Compact */}
                    <div className="flex items-center gap-2 p-2 bg-teal-500/5 rounded-lg border border-teal-500/20">
                        <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
                        <span className="text-xs text-gray-400">Secure & encrypted payment</span>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !agreeTerms || !bookingSummary || !hasAdultGuest}
                        className={`w-full py-3 rounded-lg font-semibold text-base transition-all duration-300
                            ${!hasAdultGuest || loading || !agreeTerms || !bookingSummary
                                ? 'bg-gray-700 cursor-not-allowed opacity-50'
                                : 'bg-teal-500 hover:bg-teal-600 text-black'
                            }`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Processing...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                <span>Request Booking</span>
                            </div>
                        )}
                    </button>
                </form>
            </div>

            {/* Modals */}
            <GuestDetailsModal
                isOpen={showGuestModal}
                guestCount={formData.guests}
                initialData={formData.editIndex !== undefined ? guestsInfo[formData.editIndex] : null}
                onClose={() => {
                    setShowGuestModal(false);
                    setFormData({ ...formData, editIndex: undefined });
                }}
                onSave={(data) => {
                    if (formData.editIndex !== undefined) {
                        const updated = [...guestsInfo];
                        updated[formData.editIndex] = data;
                        setGuestsInfo(updated);
                        setFormData({ ...formData, guests: updated.length, editIndex: undefined });
                    } else {
                        const updated = [...guestsInfo, data];
                        setGuestsInfo(updated);
                        setFormData({ ...formData, guests: updated.length });
                    }
                    setShowGuestModal(false);
                }}
            />

            <VerificationModal
                loadCallender={loadCallender}
                setLoadCallender={setLoadCallender}
                isOpen={showVerificationModal}
                onClose={() => setShowVerificationModal(false)}
                onConfirm={(data) => handleConfirmBooking(data.referenceId)}
                loading={loading}
                bookingId={id}
            />
        </div>
    );
}

export default BookingForm;