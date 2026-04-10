"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import BookingCalendar from "@/components/bookingCalender";
import Toast from "@/components/toast";
import { Calendar, CreditCard, Loader2, Plus, ShieldCheck, Tag, Users } from "lucide-react";
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
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [loadCallender, setLoadCallender] = useState(false);
    const [id, setId] = useState(null);
    const [guestsInfo, setGuestsInfo] = useState([]);
    const [showGuestModal, setShowGuestModal] = useState(false);


    const applicableOffers = useMemo(() => {
        return getApplicableOffers(offers, apartmentId);
    }, [offers, apartmentId]);

    // Check if any guest is 18+ years old
    const hasAdultGuest = useMemo(() => {
        return guestsInfo.some(guest => {
            const age = guest.age;
            return age && Number(age) >= 18;
        });
    }, [guestsInfo]);

    // Fixed check-in and check-out times
    const fixedCheckinTime = "15:00"; // 3:00 PM
    const fixedCheckoutTime = "11:00"; // 11:00 AM

    // Calculate price summary with offers applied
    useEffect(() => {
        if (formData.checkin && formData.checkout) {
            const nights = calculateNights(formData.checkin, formData.checkout);

            // Apply offer to daily rate
            const discountedDailyRate = applyOffer(dailyRate, offers, apartmentId);
            const hasDailyDiscount = discountedDailyRate < dailyRate;

            const basePrice = nights * discountedDailyRate;
            const total = basePrice + cleaningFee;

            // Calculate discount details
            let appliedOffer = null;
            if (hasDailyDiscount && applicableOffers.length > 0) {
                // Find which offer was applied
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

        // Check if there's an adult guest
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
            // Call API to check for existing bookings
            const response = await fetch('/api/bookings/check-dates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
            // If no existing booking, proceed with verification
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
            console.log("Reference ID from verification:", referenceId);
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

            // Check again for adult guest before confirming
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
            setShowFeedbackModal(true);
            setLoadCallender(true);
            router.push('/dashboard')
        } catch (err) {
            console.error("Booking error:", err);
            setError("Something went wrong. Please try again.");
            setShowVerificationModal(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section>
            <div
                className="
        sticky top-24
        relative overflow-hidden
        rounded-2xl p-5 sm:p-8
        bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800
        border border-white/10
        shadow-2xl shadow-black/40
        space-y-8
        w-full max-w-md
    "
            >
                {/* Error Toast */}
                {(formError || error) && (
                    <div className="animate-fade-in">
                        <Toast
                            message={formError || error}
                            type="error"
                            onClose={() => { setFormError(""); setError(""); }}
                        />
                    </div>
                )}

                {/* Offer Banner */}
                {!offersLoading && applicableOffers.length > 0 && (
                    <div className="animate-fade-in">
                        <div className="relative overflow-hidden bg-gradient-to-r from-teal-900/40 via-teal-800/40 to-emerald-900/30 border border-teal-600/40 rounded-xl p-4 backdrop-blur-sm">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full -translate-y-12 translate-x-12 blur-xl"></div>
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="flex-shrink-0 p-2 bg-teal-900/50 rounded-lg border border-teal-700/50">
                                    <Tag className="w-5 h-5 text-teal-300" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-bold text-teal-300 text-lg">🎉 Special Offer Applied!</span>
                                        <span className="px-2 py-1 bg-teal-900/60 text-teal-200 text-xs font-medium rounded-full">
                                            {applicableOffers.length} offer{applicableOffers.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {applicableOffers.map((offer) => (
                                            <div key={offer.id} className="p-3 bg-black/30 rounded-lg border border-white/5">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold text-white">{offer.title}</p>
                                                        {offer.description && (
                                                            <p className="text-gray-300 text-sm mt-1">{offer.description}</p>
                                                        )}
                                                    </div>
                                                    <span className="px-3 py-1 bg-gradient-to-r from-teal-700 to-emerald-700 text-white font-bold rounded-full text-sm">
                                                        {offer.discount_percentage}% OFF
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                                                    <Calendar className="w-3 h-3" />
                                                    Valid until: {new Date(offer.valid_until).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Booking Form */}
                <div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Calendar Section */}
                        <div className="p-4 max-sm:p-0">
                            <BookingCalendar
                                apartmentId={apartmentId}
                                formData={formData}
                                setFormData={setFormData}
                                size="medium"
                            />
                        </div>

                        {/* Check-in/out Times - Compact */}
                        <div className="bg-neutral-800/50 rounded-xl p-3 border border-white/10">
                            <h3 className="font-semibold text-white text-sm mb-3">Check-in & Check-out</h3>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-xs text-gray-300">Check-in</span>
                                    </div>
                                    <div className="p-3 rounded-lg bg-gradient-to-r from-neutral-800 to-neutral-900 border border-white/10">
                                        <div className="text-lg font-bold text-white">{fixedCheckinTime}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">3:00 PM • Fixed</div>
                                    </div>
                                </div>

                                <div className="text-gray-400 text-xs">→</div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                        <span className="text-xs text-gray-300">Check-out</span>
                                    </div>
                                    <div className="p-3 rounded-lg bg-gradient-to-r from-neutral-800 to-neutral-900 border border-white/10">
                                        <div className="text-lg font-bold text-white">{fixedCheckoutTime}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">11:00 AM • Fixed</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Guests Section */}
                        <div className="bg-neutral-800/50 rounded-xl p-4 border border-white/10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <Users className="w-5 h-5 text-teal-400" />
                                    Guests
                                </h3>
                                <span className="px-3 py-1 bg-neutral-700/50 text-gray-300 text-sm rounded-full">
                                    {guestsInfo.length} {guestsInfo.length === 1 ? 'guest' : 'guests'}
                                </span>
                            </div>

                            <GuestList
                                guests={guestsInfo}
                                hasAdultGuest={hasAdultGuest}
                                onEdit={(index) => {
                                    setFormData({ ...formData, editIndex: index });
                                    setShowGuestModal(true);
                                }}
                                onDelete={(index) => {
                                    const updated = [...guestsInfo];
                                    updated.splice(index, 1);
                                    setGuestsInfo(updated);
                                    setFormData({ ...formData, guests: updated.length });
                                }}
                            />

                            {/* Adult Guest Requirement */}
                            {guestsInfo.length > 0 && !hasAdultGuest && (
                                <div className="mt-4 p-3 bg-gradient-to-r from-red-900/20 to-red-800/10 rounded-lg border border-red-800/30 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-red-300 font-medium text-sm">Age Requirement</p>
                                        <p className="text-red-400/80 text-sm">At least one guest must be 18 years or older to book.</p>
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => setShowGuestModal(true)}
                                className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-white/20 hover:border-teal-500/50 hover:bg-teal-900/10 transition-all duration-300 text-gray-300 hover:text-white group flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5 group-hover:text-teal-400 transition-colors" />
                                Add Guest
                            </button>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl p-6 border border-white/10 shadow-lg">
                            <div className="flex justify-between items-center mb-6 relative">
                                <div>
                                    <h3 className="font-bold text-xl text-white">Price Summary</h3>
                                    <p className="text-gray-400 text-sm">Detailed breakdown of your stay</p>
                                </div>
                                {bookingSummary?.hasDiscount && bookingSummary.appliedOffer && (
                                    <span className="absolute top-[-40px] right-0 px-4 py-2 bg-gradient-to-r from-teal-800/40 to-emerald-800/40 backdrop-blur-sm border border-teal-500/30 text-white rounded-full text-xs shadow-lg shadow-teal-900/20 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faTag} className="text-emerald-300" />
                                        {bookingSummary.appliedOffer.discount_percentage}% OFF
                                    </span>
                                )}
                            </div>

                            {bookingSummary ? (
                                <div className="space-y-4">
                                    {/* Stay Details */}
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-black/20 rounded-xl">
                                        <div>
                                            <p className="text-gray-400 text-sm">Check-in</p>
                                            <p className="font-medium text-white">{formData.checkin}</p>
                                            <p className="text-gray-400 text-xs">{fixedCheckinTime}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">Check-out</p>
                                            <p className="font-medium text-white">{formData.checkout}</p>
                                            <p className="text-gray-400 text-xs">{fixedCheckoutTime}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">Nights</p>
                                            <p className="font-medium text-white">{bookingSummary.nights}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">Guests</p>
                                            <p className="font-medium text-white">{formData.guests}</p>
                                        </div>
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-300">Nightly Rate</span>
                                                {bookingSummary.hasDiscount && (
                                                    <span className="text-xs line-through text-gray-500">₹{bookingSummary.originalDailyRate}</span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-white font-medium">
                                                    {bookingSummary.hasDiscount && (
                                                        <span className="text-teal-300 mr-2">₹{bookingSummary.dailyRate}</span>
                                                    )}
                                                    × {bookingSummary.nights} nights
                                                </div>
                                                <div className="text-gray-300">₹{bookingSummary.basePrice}</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between py-2 border-b border-white/10">
                                            <span className="text-gray-300">Cleaning Fee</span>
                                            <span className="text-white">₹{cleaningFee}</span>
                                        </div>

                                        {bookingSummary.hasDiscount && (
                                            <div className="flex justify-between py-3 bg-gradient-to-r from-teal-900/20 to-emerald-900/10 rounded-lg px-4">
                                                <div>
                                                    <span className="text-teal-300 font-medium">Discount</span>
                                                    <p className="text-teal-400/80 text-xs">
                                                        {bookingSummary.appliedOffer?.discount_percentage}% OFF
                                                    </p>
                                                </div>
                                                <span className="text-teal-300 font-bold">-₹{bookingSummary.discountAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Total */}
                                    <div className="pt-4 border-t border-white/20">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-gray-300 text-sm">Total Amount</p>
                                                {bookingSummary.hasDiscount && (
                                                    <p className="text-teal-400 text-xs">
                                                        You save ₹{bookingSummary.discountAmount.toFixed(2)}!
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                                                    ₹{bookingSummary.total}
                                                </p>
                                                <p className="text-gray-400 text-xs">Including all taxes & fees</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-400">Select dates to see price details</p>
                                </div>
                            )}
                        </div>

                        {/* Secure Payment */}
                        <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-teal-900/10 to-emerald-900/10 rounded-xl border border-teal-800/30">
                            <div className="p-2 bg-teal-900/30 rounded-lg">
                                <ShieldCheck className="w-6 h-6 text-teal-400" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Secure & Encrypted</p>
                                <p className="text-gray-400 text-sm">Your payment information is protected</p>
                            </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="p-4 bg-neutral-800/30 rounded-xl border border-white/10">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={agreeTerms}
                                        onChange={() => setAgreeTerms(!agreeTerms)}
                                        className="w-5 h-5 accent-teal-600 rounded border-white/20 focus:ring-2 focus:ring-teal-500/50"
                                    />
                                </div>
                                <label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer">
                                    <span className="font-medium text-white">I agree to the booking terms</span>
                                    <p className="mt-1">
                                        By proceeding, I confirm that I have read and accept the{" "}
                                        <a href="/terms-conditions" className="text-teal-400 hover:text-teal-300 hover:underline transition-colors">
                                            Terms & Conditions
                                        </a>{" "}
                                        and{" "}
                                        <a href="/cancellation-refund" className="text-teal-400 hover:text-teal-300 hover:underline transition-colors">
                                            Cancellation Policy
                                        </a>.
                                    </p>
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !agreeTerms || !bookingSummary || !hasAdultGuest}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl
                        ${!hasAdultGuest || loading || !agreeTerms || !bookingSummary
                                    ? 'bg-gradient-to-r from-gray-700 to-gray-800 cursor-not-allowed opacity-70'
                                    : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>Processing Your Request...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-3">
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
                    initialData={
                        formData.editIndex !== undefined
                            ? guestsInfo[formData.editIndex]
                            : null
                    }
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
        </section>
    );
}

function GuestList({ guests, hasAdultGuest, onEdit, onDelete }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Guests</span>
                {guests.length > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full ${hasAdultGuest ? 'bg-green-900/30 text-green-400 border border-green-800/50' : 'bg-red-900/30 text-red-400 border border-red-800/50'}`}>
                        {hasAdultGuest ? '✓ Adult present' : '⚠️ No adult'}
                    </span>
                )}
            </div>

            {guests.length === 0 && (
                <div className="text-gray-500 text-sm">No guest details added.</div>
            )}

            <div className="space-y-2">
                {guests.map((guest, index) => {
                    const age = guest.age ? Number(guest.age) : null;
                    const isAdult = age !== null && age >= 18;

                    return (
                        <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg border ${isAdult ? 'bg-green-900/10 border-green-800/30' : 'bg-red-900/10 border-red-800/30'}`}
                        >
                            <div className="text-white">
                                <div className="font-medium">{guest.name || `Guest ${index + 1}`}</div>
                                <div className="text-xs text-gray-400">
                                    {age !== null ? `${age} years old` : 'Age not specified'}
                                    {guest.email && ` • ${guest.email}`}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Age indicator */}
                                <span className={`text-xs px-2 py-1 rounded ${isAdult ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                                    {age !== null ? (isAdult ? '18+' : `<18`) : 'No age'}
                                </span>

                                {/* Edit */}
                                <button
                                    type="button"
                                    onClick={() => onEdit(index)}
                                    className="text-teal-400 hover:text-teal-300"
                                >
                                    <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
                                </button>

                                {/* Delete */}
                                <button
                                    type="button"
                                    onClick={() => onDelete(index)}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default BookingForm;