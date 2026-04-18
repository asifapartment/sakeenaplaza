'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import NextImage from "next/image";
import Link from 'next/link';

// Updated Skeleton with black background
const ApartmentCardSkeleton = () => {
    return (
        <div className="bg-black rounded-2xl overflow-hidden border border-white/10">
            <div className="h-64 bg-black relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
                <div className="absolute bottom-4 right-4 bg-white/10 w-20 h-7 rounded-full"></div>
            </div>
            <div className="p-6 space-y-4">
                <div className="h-7 bg-white/10 rounded-lg w-3/4"></div>
                <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-white/10 rounded-full"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="h-5 w-5 bg-white/10 rounded-full"></div>
                        <div className="h-4 bg-white/10 rounded w-20"></div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {[...Array(3)].map((_, idx) => (
                        <div key={idx} className="h-6 bg-white/10 rounded-full w-16"></div>
                    ))}
                </div>
                <div className="w-full bg-white/10 h-12 rounded-xl"></div>
            </div>
        </div>
    );
};

// Offer Tag Component
const OfferTag = ({ offer }) => {
    return (
        <div className="absolute top-4 left-4 z-20">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={solidIcons.faTag} className="h-3 w-3 text-white" />
                        <span className="text-xs font-bold text-white whitespace-nowrap">
                            {offer.discount_percentage}% OFF
                        </span>
                    </div>
                </div>
                {/* Tooltip on hover */}
                <div className="absolute mb-2 mt-6 hidden group-hover:block">
                    <div className="bg-black/95 text-white text-xs rounded-lg p-3 w-48 border border-white/10">
                        <div className="font-bold text-yellow-400 mb-1">{offer.title}</div>
                        <p className="text-gray-300 mb-2">{offer.description}</p>
                        <div className="text-xs text-gray-400">
                            Valid until: {new Date(offer.valid_until).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ApartmentImage Component
const ApartmentImage = ({ apartment, index, offer }) => {
    const [imageError, setImageError] = useState(false);

    const finalPrice = offer
        ? (apartment.price - (apartment.price * Number(offer.discount_percentage) / 100)).toFixed(2)
        : apartment.price;

    const hasDiscount = offer !== null;

    const PriceTag = () => (
        <div className="absolute bottom-4 right-4 z-20 flex items-end">
            {hasDiscount ? (
                <span className="bg-gradient-to-r from-teal-500 to-emerald-500 px-3 py-1 rounded-full text-sm font-bold text-black">
                    <span className="text-sm line-through font-medium mr-3 text-white/70">
                        &#8377;{apartment.price}
                    </span>
                    &#8377;{finalPrice}/night
                </span>
            ) : (
                <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2 rounded-full text-sm font-bold text-black">
                    &#8377;{apartment.price}/night
                </div>
            )}
        </div>
    );

    if (!apartment?.image || imageError) {
        return (
            <div className="h-64 relative flex items-center justify-center bg-black">
                <div className="text-center p-6">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FontAwesomeIcon icon={solidIcons.faHome} className="h-8 w-8 text-gray-600" />
                    </div>
                    <p className="text-gray-600 text-sm">Image not available</p>
                </div>
                {offer && <OfferTag offer={offer} />}
                <PriceTag />
            </div>
        );
    }

    return (
        <div className="h-64 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>

            <NextImage
                src={apartment.image}
                alt={apartment.title || 'Apartment'}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                onError={() => setImageError(true)}
                priority={index <= 2}
            />

            {offer && <OfferTag offer={offer} />}
            <PriceTag />
        </div>
    );
};

export default function FeaturedApartments() {
    const router = useRouter();
    const [apartments, setApartments] = useState([]);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const aptRes = await fetch('/api/apartment');
                if (!aptRes.ok) throw new Error('Failed to fetch apartments');
                const aptData = await aptRes.json();
                setApartments(Array.isArray(aptData) ? aptData : []);

                const offersRes = await fetch('/api/offers');
                if (offersRes.ok) {
                    const offersData = await offersRes.json();
                    setOffers(offersData.offers || []);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setApartments([]);
                setOffers([]);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const getApartmentOffer = (apartmentId) => {
        if (!offers.length) return null;

        const now = new Date();
        const activeOffers = offers.filter(offer => {
            const validFrom = new Date(offer.valid_from);
            const validUntil = new Date(offer.valid_until);
            const isActive = offer.is_active === 1 || offer.is_active === true;
            const isInDateRange = now >= validFrom && now <= validUntil;
            return isActive && isInDateRange;
        });

        if (!activeOffers.length) return null;

        const specificOffer = activeOffers.find(offer => {
            if (offer.apartment_ids === null) return false;
            let apartmentIds = offer.apartment_ids;
            if (typeof apartmentIds === "string") {
                try {
                    apartmentIds = JSON.parse(apartmentIds);
                } catch (e) {
                    return false;
                }
            }
            return Array.isArray(apartmentIds) && apartmentIds.includes(apartmentId);
        });

        if (specificOffer) return specificOffer;
        return activeOffers.find(offer => offer.apartment_ids === null) || null;
    };

    const featuredApartments = useMemo(() => {
        if (!Array.isArray(apartments)) return [];
        return apartments.slice(0, 3);
    }, [apartments]);

    return (
        <section className="relative w-full bg-black py-16 sm:py-20 lg:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
                        Featured Apartments
                    </h2>
                    <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto">
                        Experience luxury living in our handpicked premium apartments
                    </p>
                </div>

                {/* Apartment Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                    {loading || !isClient
                        ? [...Array(3)].map((_, idx) => (
                            <ApartmentCardSkeleton key={`skeleton-${idx}`} />
                        ))
                        : featuredApartments.map((apartment, index) => {
                            const offer = getApartmentOffer(apartment.id);
                            return (
                                <div
                                    key={apartment.id}
                                    className="group relative"
                                >
                                    <div className="relative bg-black rounded-2xl overflow-hidden border border-white/10 group-hover:border-teal-400/30 transition-all duration-300">
                                        <ApartmentImage
                                            apartment={apartment}
                                            index={index}
                                            offer={offer}
                                        />

                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="font-bold text-white text-xl line-clamp-1 group-hover:text-teal-400 transition-colors">
                                                    {apartment.title || 'Untitled Apartment'}
                                                </h3>
                                                {offer && (
                                                    <div className="flex-shrink-0 ml-2">
                                                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                            SAVE {offer.discount_percentage}%
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center text-gray-400 mb-4">
                                                <FontAwesomeIcon
                                                    icon={solidIcons.faMapMarkerAlt}
                                                    className="h-4 w-4 mr-2 text-teal-400"
                                                />
                                                <span className="text-sm">{apartment.location || 'Location not specified'}</span>
                                            </div>

                                            <div className="flex items-center justify-between mb-5">
                                                <div className="flex items-center">
                                                    <div className="flex items-center bg-yellow-500/10 px-3 py-1 rounded-full">
                                                        <FontAwesomeIcon
                                                            icon={solidIcons.faStar}
                                                            className="h-3 w-3 mr-1 text-yellow-500"
                                                        />
                                                        <span className="text-sm font-bold text-white">
                                                            {apartment.reviews?.rating || '4.5'}
                                                        </span>
                                                    </div>
                                                    <span className="ml-2 text-sm text-gray-500">
                                                        ({apartment.reviews?.totalReviews || 0} reviews)
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Features */}
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {Array.isArray(apartment.feature_texts) ? apartment.feature_texts.slice(0, 3).map((feat, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
                                                    >
                                                        <span className="text-xs text-gray-400 capitalize">
                                                            {feat}
                                                        </span>
                                                    </div>
                                                )) : null}
                                            </div>

                                            {/* Book Now Button */}
                                            <button
                                                onClick={() => apartment.id && router.push(`/booking/${apartment.id}`)}
                                                className="w-full group/btn relative overflow-hidden bg-teal-400 text-black font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center"
                                                disabled={!apartment.id}
                                            >
                                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500"></div>
                                                <span className="relative z-10 font-semibold text-black text-base flex items-center gap-2">
                                                    Book Now
                                                    <FontAwesomeIcon
                                                        icon={solidIcons.faArrowRight}
                                                        className="h-3 w-3 transform group-hover/btn:translate-x-1 transition-transform duration-300"
                                                    />
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>

                {/* View All Apartments Link */}
                {isClient && !loading && apartments.length >= 3 && (
                    <div className="text-center mt-16">
                        <Link
                            href="/apartments"
                            className="group inline-flex items-center gap-2 border border-white/20 hover:border-teal-400/40 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 hover:bg-white/5"
                        >
                            <span>Explore All Properties</span>
                            <FontAwesomeIcon
                                icon={solidIcons.faChevronRight}
                                className="w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-300"
                            />
                        </Link>
                    </div>
                )}

                {/* No Apartments Message */}
                {isClient && !loading && featuredApartments.length === 0 && (
                    <div className="text-center py-16">
                        <div className="bg-black rounded-2xl p-10 border border-white/10 max-w-md mx-auto">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FontAwesomeIcon
                                    icon={solidIcons.faHome}
                                    className="h-10 w-10 text-gray-600"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">No Featured Apartments</h3>
                            <p className="text-gray-500">
                                Check back soon for our exclusive collection of premium apartments.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}