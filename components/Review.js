'use client'

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import Toast from "./toast";

function ReviewText({ text }) {
    const [expanded, setExpanded] = useState(false);
    const isLong = text.length > 120;
    const shortText = text.slice(0, 120);

    return (
        <p className="text-gray-300 leading-relaxed">
            {expanded || !isLong ? text : `${shortText}... `}
            {isLong && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-teal-400 hover:text-teal-300 hover:underline ml-1 transition"
                >
                    {expanded ? 'Show less' : 'Read more'}
                </button>
            )}
        </p>
    );
}

const ReviewSkeleton = () => (
    <div className="bg-black border border-white/10 rounded-2xl p-6 animate-pulse">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
                <div className="h-3 bg-white/10 rounded w-3/4"></div>
            </div>
        </div>
        <div className="space-y-2">
            <div className="h-3 bg-white/10 rounded"></div>
            <div className="h-3 bg-white/10 rounded w-5/6"></div>
            <div className="h-3 bg-white/10 rounded w-4/6"></div>
        </div>
    </div>
);

const ReviewSection = ({ id }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ message: "", type: "" });

    const apartmentId = parseInt(id, 10);

    const resetForm = () => {
        setComment('');
        setRating(0);
        setHover(0);
    };

    useEffect(() => {
        document.body.style.overflow = showModal ? "hidden" : "auto";
        return () => { document.body.style.overflow = "auto"; };
    }, [showModal]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reviews?apartmentId=${apartmentId}`, {
                headers: { 'Cache-Control': 'max-age=300' },
            });

            if (!res.ok) throw new Error('Failed to fetch reviews');

            const data = await res.json();
            const mapped = data.reviews.map(r => ({
                id: r.id,
                name: r.user_name || "Anonymous",
                rating: r.rating,
                comment: r.comment,
            }));
            setReviews(mapped);
        } catch (err) {
            console.error(err);
            setToast({ message: "Failed to load reviews.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        if (!comment || rating === 0) {
            setToast({ message: "Please provide a comment and rating.", type: "warning" });
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ apartment_id: apartmentId, rating, comment }),
            });
            const data = await res.json();
            if (res.ok) {
                await fetchReviews();
                resetForm();
                setShowModal(false);
                setToast({ message: "Review submitted successfully!", type: "success" });
            } else {
                setToast({ message: data.error || "Failed to submit review.", type: "error" });
            }
        } catch (err) {
            console.error(err);
            setToast({ message: "Something went wrong.", type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="w-full px-4 py-16 bg-black">
            <div className="max-w-7xl mx-auto">
                {/* Header with gradient underline */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        What Guests Are Saying
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full mx-auto"></div>
                </div>

                {/* Reviews Grid */}
                <div className="max-h-[450px] overflow-y-auto mb-10 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 p-4">
                        {loading ? (
                            Array(4).fill(null).map((_, i) => <ReviewSkeleton key={i} />)
                        ) : reviews.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-400 text-lg">No reviews yet. Be the first to share your experience!</p>
                            </div>
                        ) : (
                            reviews.map(review => (
                                <div
                                    key={review.id}
                                    className="group bg-black border border-white/20 rounded-2xl p-6 transition-all duration-300 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 hover:-translate-y-1"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            {review.name.charAt(0).toUpperCase() || "?"}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-white text-lg max-w-[170px] truncate">
                                                {review.name}
                                            </h4>
                                            <div className="flex gap-1 mt-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <FontAwesomeIcon
                                                        key={i}
                                                        icon={i < review.rating ? solidStar : regularStar}
                                                        className={`text-sm transition-all duration-200 ${i < review.rating ? 'text-teal-400' : 'text-white/20'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <ReviewText text={review.comment} />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Write Review Button */}
                <div className="text-center">
                    <button
                        onClick={() => setShowModal(true)}
                        className="group relative px-8 py-3 font-semibold text-white rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <span>Write a Review</span>
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-5 animate-fadeIn">
                    <div className="bg-black border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative transform transition-all">
                        <button
                            onClick={() => { resetForm(); setShowModal(false); }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition text-2xl"
                        >
                            ✕
                        </button>

                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-white mb-2">Share Your Experience</h3>
                            <p className="text-gray-400 text-sm">Your feedback helps other travelers</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Comment Textarea */}
                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-2">
                                    Your Review
                                </label>
                                <textarea
                                    placeholder="What did you love about your stay? Any suggestions?"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full h-32 p-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                                    required
                                />
                            </div>

                            {/* Rating Stars */}
                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-2">
                                    Your Rating
                                </label>
                                <div className="flex gap-2">
                                    {[...Array(5)].map((_, i) => {
                                        const ratingValue = i + 1;
                                        return (
                                            <label key={ratingValue} className="cursor-pointer transition-transform hover:scale-110">
                                                <input
                                                    type="radio"
                                                    name="rating"
                                                    value={ratingValue}
                                                    onClick={() => setRating(ratingValue)}
                                                    className="hidden"
                                                />
                                                <FontAwesomeIcon
                                                    icon={ratingValue <= (hover || rating) ? solidStar : regularStar}
                                                    onMouseEnter={() => setHover(ratingValue)}
                                                    onMouseLeave={() => setHover(0)}
                                                    className={`text-3xl transition-all duration-200 ${ratingValue <= (hover || rating)
                                                        ? 'text-teal-400 drop-shadow-glow'
                                                        : 'text-white/20'
                                                        }`}
                                                />
                                            </label>
                                        )
                                    })}
                                </div>
                                <p className="text-gray-500 text-xs mt-2">
                                    {rating === 0 ? 'Click to rate' : `You rated ${rating} star${rating > 1 ? 's' : ''}`}
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-3 font-semibold rounded-xl transition-all duration-200 shadow-md ${submitting
                                    ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                                    : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                                    }`}
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </span>
                                ) : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.message && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ message: "", type: "" })}
                />
            )}

            {/* Custom Scrollbar Styles */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(20, 184, 166, 0.5);
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(20, 184, 166, 0.8);
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-in;
                }
                
                .drop-shadow-glow {
                    filter: drop-shadow(0 0 4px rgba(20, 184, 166, 0.5));
                }
            `}</style>
        </section>
    )
}

export default ReviewSection;