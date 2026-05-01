'use client'
import { Star } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faTag, faCalendarAlt, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useOffers, applyOffer, getApplicableOffers } from "@/hooks/useOffers";
import { useEffect, useState } from "react";

function HeaderSection({ plan }) {
    const { offers, loading, error } = useOffers(plan?.id);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Calculate prices
    const originalPrice = plan.price || 0;
    const discountedPrice = applyOffer(originalPrice, offers, plan?.id);
    const hasDiscount = discountedPrice < originalPrice;
    const discountPercentage = hasDiscount
        ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
        : 0;

    // Get applicable offers for display
    const applicableOffers = getApplicableOffers(offers, plan?.id);

    // Function to scroll to booking form
    const scrollToBookingForm = () => {
        // Check if we're on desktop or mobile based on viewport
        const isDesktop = window.innerWidth >= 1024; // 1024px is the lg breakpoint

        // Select the appropriate booking form based on screen size
        const bookingForm = isDesktop
            ? document.getElementById('booking-form-desktop')
            : document.getElementById('booking-form-mobile');

        if (bookingForm) {
            // Get the header height for better offset calculation
            const header = document.querySelector('header');
            const headerHeight = header ? header.offsetHeight : 80;

            const elementPosition = bookingForm.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        } else {
            // Fallback: try to find any booking form by class or attribute
            const fallbackForm = document.querySelector('[id*="booking-form"]');
            if (fallbackForm) {
                fallbackForm.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    };

    // Only render interactive elements after mounting to avoid hydration issues
    if (!isMounted) {
        return (
            <section className="w-full bg-black border-b border-white/10 mt-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <div className="animate-pulse">
                        <div className="h-8 bg-white/10 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full bg-black border-b border-white/10 mt-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Main Content */}
                <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-12">
                    {/* Left Column - Title and Details */}
                    <div className="flex-1 space-y-6">
                        {/* Title */}
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                                {plan.title || "Untitled Plan"}
                            </h1>

                            {/* Rating and Location Row */}
                            <div className="flex flex-wrap items-center gap-4 text-gray-400">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center">
                                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                        <span className="ml-1 font-semibold text-white">
                                            {plan?.reviews?.rating || 0}
                                        </span>
                                    </div>
                                    <span className="text-sm">
                                        ({plan?.reviews?.totalReviews || 0} reviews)
                                    </span>
                                </div>

                                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>

                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon
                                        icon={faLocationDot}
                                        className="text-teal-400 w-4 h-4"
                                    />
                                    <span className="text-gray-300">
                                        {plan?.city}, {plan?.country}
                                    </span>
                                </div>
                            </div>

                            {/* Full Address */}
                            {plan?.location && (
                                <p className="text-sm text-gray-500">
                                    📍 {plan.location}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        {plan?.description && (
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-2">About this apartment</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    {plan.description}
                                </p>
                            </div>
                        )}

                        {/* Active Offers Display */}
                        {!loading && applicableOffers.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <FontAwesomeIcon icon={faTag} className="w-4 h-4 text-teal-400" />
                                    Active Offers
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {applicableOffers.map((offer) => (
                                        <div
                                            key={offer.id}
                                            className="group relative bg-teal-400/10 border border-teal-400/30 rounded-lg px-4 py-2 hover:bg-teal-400/20 transition-all duration-300"
                                        >
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-teal-400 text-sm font-semibold">
                                                        {offer.discount_percentage}% OFF
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {offer.title}
                                                    </span>
                                                </div>
                                                {offer.description && (
                                                    <p className="text-xs text-gray-500">
                                                        {offer.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                                                    <span>
                                                        Valid until {new Date(offer.valid_until).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Price Card */}
                    <div className="lg:w-80 flex-shrink-0">
                        <div className="sticky top-24 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                            {/* Price Header */}
                            <div className="p-6 border-b border-white/10">
                                {hasDiscount ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Original Price</span>
                                            <span className="text-lg line-through text-gray-500">
                                                ₹{originalPrice.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-sm text-teal-400 font-semibold">
                                                Discounted Price
                                            </span>
                                            <div>
                                                <span className="text-3xl font-bold text-teal-400">
                                                    ₹{discountedPrice.toLocaleString()}
                                                </span>
                                                <span className="text-sm text-gray-400"> /day</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 pt-2">
                                            <span className="bg-red-500/20 text-red-400 text-xs font-semibold px-2 py-1 rounded">
                                                Save {discountPercentage}%
                                            </span>
                                            {applicableOffers.length > 0 && (
                                                <span className="text-xs text-gray-500">
                                                    {applicableOffers[0].title}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-teal-400 mb-1">
                                            ₹{originalPrice.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-400">per day</div>
                                    </div>
                                )}
                            </div>

                            {/* Price Breakdown */}
                            <div className="p-6 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Base Price</span>
                                    <span className="text-white">₹{originalPrice.toLocaleString()}/day</span>
                                </div>
                                {hasDiscount && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Discount</span>
                                        <span className="text-teal-400">-{discountPercentage}%</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm pt-3 border-t border-white/10">
                                    <span className="text-gray-300 font-semibold">Total per day</span>
                                    <span className="text-white font-bold text-lg">
                                        ₹{hasDiscount ? discountedPrice.toLocaleString() : originalPrice.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="p-6 pt-0">
                                <button
                                    onClick={scrollToBookingForm}
                                    className="w-full bg-teal-400 hover:bg-teal-500 text-black font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                                >
                                    <span>Book Now</span>
                                    <FontAwesomeIcon
                                        icon={faChevronRight}
                                        className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                                    />
                                </button>
                                <p className="text-xs text-center text-gray-500 mt-3">
                                    Free cancellation • Instant confirmation
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeaderSection;