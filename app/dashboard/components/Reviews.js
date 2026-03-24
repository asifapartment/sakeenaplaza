"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStar,
    faPenToSquare,
    faTrash,
    faSearch,
    faFilter,
    faSort,
    faXmark,
    faCalendarAlt,
    faMessage,
    faUser,
    faQuoteRight,
    faChartLine
} from "@fortawesome/free-solid-svg-icons";

export default function UserReviews() {
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingReview, setEditingReview] = useState(null);
    const [isHovered, setIsHovered] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Filter and search states
    const [searchTerm, setSearchTerm] = useState("");
    const [ratingFilter, setRatingFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    // Fetch user's own reviews
    useEffect(() => {
        const fetchUserReviews = async () => {
            try {
                const res = await fetch("/api/reviews", {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                if (data.reviews) {
                    setReviews(data.reviews);
                    setFilteredReviews(data.reviews);
                }
            } catch (err) {
                console.error("Fetch user reviews error:", err);
            }
            setLoading(false);
        };
        fetchUserReviews();
    }, []);

    // Apply filters and search
    useEffect(() => {
        let results = [...reviews];

        if (searchTerm) {
            results = results.filter(review =>
                review.apartment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.comment.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (ratingFilter !== "all") {
            results = results.filter(review => review.rating === parseInt(ratingFilter));
        }

        results.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.created_at) - new Date(a.created_at);
                case "oldest":
                    return new Date(a.created_at) - new Date(b.created_at);
                case "highest":
                    return b.rating - a.rating;
                case "lowest":
                    return a.rating - b.rating;
                default:
                    return 0;
            }
        });

        setFilteredReviews(results);
    }, [reviews, searchTerm, ratingFilter, sortBy]);

    // Update Review
    const handleUpdate = async () => {
        if (!editingReview) return;
        console.log("Updating review:", editingReview.id);
        try {
            const res = await fetch(`/api/reviews/${editingReview.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rating: editingReview.rating,
                    comment: editingReview.comment
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setReviews((prev) =>
                    prev.map((r) =>
                        r.id === editingReview.id ? { ...r, ...editingReview } : r
                    )
                );
                setEditingReview(null);
            } else {
                alert(data.error || "Failed to update review");
            }
        } catch (err) {
            console.error("Update review error:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            const res = await fetch(`/api/reviews/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (res.ok) {
                setReviews((prev) => prev.filter((r) => r.id !== id));
            } else {
                alert(data.error || "Failed to delete review");
            }
        } catch (err) {
            console.error("Delete review error:", err);
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
        setRatingFilter("all");
        setSortBy("newest");
    };

    const getRatingLabel = (rating) => {
        if (rating >= 4.5) return "Exceptional";
        if (rating >= 4) return "Excellent";
        if (rating >= 3) return "Good";
        if (rating >= 2) return "Fair";
        return "Poor";
    };

    const getRatingColor = (rating) => {
        if (rating >= 4.5) return "bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-300";
        if (rating >= 4) return "bg-gradient-to-r from-teal-500/20 to-teal-600/20 border-teal-500/30 text-teal-300";
        if (rating >= 3) return "bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-300";
        return "bg-gradient-to-r from-rose-500/20 to-rose-600/20 border-rose-500/30 text-rose-300";
    };

    const getRatingGradient = (rating) => {
        if (rating >= 4.5) return "from-emerald-500 via-emerald-400 to-emerald-300";
        if (rating >= 4) return "from-teal-500 via-teal-400 to-teal-300";
        if (rating >= 3) return "from-blue-500 via-blue-400 to-blue-300";
        return "from-rose-500 via-rose-400 to-rose-300";
    };

    // Replace the current loading return with this skeleton loader:

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-900 to-black p-4 sm:p-6 space-y-6">
                {/* Header Skeleton */}
                <div className="bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700/30 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-3">
                            <div className="h-8 w-48 bg-neutral-700/50 rounded-lg animate-pulse"></div>
                            <div className="h-4 w-64 bg-neutral-700/40 rounded animate-pulse"></div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right space-y-2">
                                <div className="h-7 w-16 bg-neutral-700/50 rounded animate-pulse"></div>
                                <div className="h-3 w-20 bg-neutral-700/40 rounded animate-pulse"></div>
                            </div>
                            <div className="h-10 w-px bg-neutral-700/50"></div>
                            <div className="text-right space-y-2">
                                <div className="h-7 w-16 bg-teal-500/20 rounded animate-pulse"></div>
                                <div className="h-3 w-20 bg-neutral-700/40 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar Skeleton - Replace with this */}
                    <div className="mt-6 grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <div className="h-4 w-4 bg-neutral-700/40 rounded animate-pulse"></div>
                                    </div>
                                    <div className="h-4 w-6 bg-neutral-700/40 rounded animate-pulse"></div>
                                </div>
                                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-neutral-700/40 to-neutral-700/30 rounded-full animate-pulse"
                                        style={{ width: `${i * 15}%` }} // Fixed percentages based on index
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Search and Filter Bar Skeleton */}
                <div className="bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700/30 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Input Skeleton */}
                        <div className="flex-1 relative">
                            <div className="h-12 bg-neutral-800/40 border border-neutral-700/30 rounded-xl animate-pulse"></div>
                        </div>

                        {/* Filter Buttons Skeleton */}
                        <div className="flex gap-3">
                            <div className="h-12 w-32 bg-gradient-to-r from-neutral-700/40 to-neutral-800/40 border border-neutral-700/30 rounded-xl animate-pulse"></div>
                            <div className="h-12 w-32 bg-gradient-to-r from-neutral-700/40 to-neutral-800/40 border border-neutral-700/30 rounded-xl animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Reviews Grid Skeleton */}
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="group relative overflow-hidden bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700/30 rounded-2xl p-5 backdrop-blur-sm animate-pulse">
                            {/* Header Skeleton */}
                            <div className="relative flex items-start justify-between mb-6 pb-4 border-b border-neutral-700/30">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 bg-neutral-700/40 rounded-lg"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-32 bg-neutral-700/40 rounded"></div>
                                            <div className="h-3 w-24 bg-neutral-700/30 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-8 w-16 bg-neutral-700/40 rounded-full"></div>
                            </div>

                            {/* Stars Display Skeleton */}
                            <div className="mb-5 p-4 bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 rounded-xl border border-neutral-700/20">
                                <div className="flex items-center justify-center gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <div key={star} className="w-5 h-5 bg-neutral-700/40 rounded-full"></div>
                                    ))}
                                </div>
                                <div className="h-4 w-48 bg-neutral-700/30 rounded mx-auto"></div>
                            </div>

                            {/* Details Grid Skeleton */}
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 p-3 rounded-xl border border-neutral-700/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 bg-neutral-700/30 rounded-lg">
                                            <div className="w-3 h-3 bg-neutral-700/40 rounded"></div>
                                        </div>
                                        <div className="h-3 w-16 bg-neutral-700/30 rounded"></div>
                                    </div>
                                    <div className="h-4 w-24 bg-neutral-700/40 rounded"></div>
                                </div>
                                <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 p-3 rounded-xl border border-neutral-700/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 bg-neutral-700/30 rounded-lg">
                                            <div className="w-3 h-3 bg-neutral-700/40 rounded"></div>
                                        </div>
                                        <div className="h-3 w-16 bg-neutral-700/30 rounded"></div>
                                    </div>
                                    <div className="h-4 w-24 bg-neutral-700/40 rounded"></div>
                                </div>
                            </div>

                            {/* Comment Preview Skeleton */}
                            <div className="mb-5 p-4 bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 rounded-xl border border-neutral-700/20 space-y-2">
                                <div className="h-3 w-full bg-neutral-700/30 rounded"></div>
                                <div className="h-3 w-4/5 bg-neutral-700/30 rounded"></div>
                                <div className="h-3 w-3/4 bg-neutral-700/30 rounded"></div>
                            </div>

                            {/* Action Buttons Skeleton */}
                            <div className="flex gap-2">
                                <div className="flex-1 h-10 bg-neutral-700/40 rounded-xl"></div>
                                <div className="w-20 h-10 bg-neutral-700/40 rounded-xl"></div>
                            </div>

                            {/* Bottom line skeleton */}
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-neutral-700/20 via-neutral-700/40 to-neutral-700/20"></div>
                        </div>
                    ))}
                </div>

                {/* Floating shimmer overlay */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-800/10 to-transparent animate-shimmer"></div>
                </div>
            </div>
        );
    }

    if (!reviews.length) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-900 to-black flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="relative mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-teal-500/10 to-teal-600/10 rounded-full flex items-center justify-center mx-auto">
                            <FontAwesomeIcon icon={faQuoteRight} className="text-teal-400/40 text-4xl" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <FontAwesomeIcon icon={faStar} className="text-teal-400 text-3xl" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-100 mb-2">No Reviews Yet</h3>
                    <p className="text-neutral-400 mb-6">Share your experiences and help others make better decisions.</p>
                    <button className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-teal-500/20">
                        Write Your First Review
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-900 to-black p-4 sm:p-6 space-y-6">
            {/* Header with Stats */}
            <div className="bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700/30 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-100 to-teal-100 bg-clip-text text-transparent">
                            My Reviews
                        </h1>
                        <p className="text-neutral-400 mt-2">Manage and edit your published reviews</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-2xl font-bold text-neutral-100">{filteredReviews.length}</div>
                            <div className="text-neutral-400 text-sm">Total Reviews</div>
                        </div>
                        <div className="h-10 w-px bg-neutral-700/50"></div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-teal-400">
                                {reviews.length > 0
                                    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                                    : "0.0"
                                }
                            </div>
                            <div className="text-neutral-400 text-sm">Avg Rating</div>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="mt-6 grid grid-cols-5 gap-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                        const count = reviews.filter(r => r.rating === rating).length;
                        const percentage = (count / reviews.length) * 100;
                        return (
                            <div key={rating} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <span className="text-neutral-300 font-medium">{rating}</span>
                                        <FontAwesomeIcon icon={faStar} className="text-teal-400 text-xs" />
                                    </div>
                                    <span className="text-neutral-400 text-sm">{count}</span>
                                </div>
                                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${getRatingColor(rating).split(' ')[0]}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700/30 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            <FontAwesomeIcon icon={faSearch} className="text-teal-400/60 text-sm" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search reviews by apartment or comment..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-neutral-800/40 border border-neutral-700/30 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent text-sm transition-all duration-300"
                        />
                    </div>

                    {/* Filter Toggle for Mobile */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden px-4 py-3 bg-gradient-to-r from-neutral-700/60 to-neutral-800/60 hover:from-neutral-600/60 hover:to-neutral-700/60 border border-neutral-700/30 text-neutral-200 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faFilter} className="text-teal-400/70 text-xs" />
                        Filters
                        {(searchTerm || ratingFilter !== "all") && (
                            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                        )}
                    </button>

                    {/* Filters */}
                    <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row gap-3 lg:items-center`}>
                        {/* Rating Filter */}
                        <div className="relative">
                            <FontAwesomeIcon icon={faStar} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-400/60 text-xs" />
                            <select
                                value={ratingFilter}
                                onChange={(e) => setRatingFilter(e.target.value)}
                                className="pl-10 pr-4 py-3 bg-gradient-to-r from-neutral-700/60 to-neutral-800/60 border border-neutral-700/30 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent text-sm appearance-none cursor-pointer"
                            >
                                <option value="all">All Ratings</option>
                                <option value="5">★★★★★</option>
                                <option value="4">★★★★☆</option>
                                <option value="3">★★★☆☆</option>
                                <option value="2">★★☆☆☆</option>
                                <option value="1">★☆☆☆☆</option>
                            </select>
                        </div>

                        {/* Sort By */}
                        <div className="relative">
                            <FontAwesomeIcon icon={faSort} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-400/60 text-xs" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="pl-10 pr-4 py-3 bg-gradient-to-r from-neutral-700/60 to-neutral-800/60 border border-neutral-700/30 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent text-sm appearance-none cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="highest">Highest Rated</option>
                                <option value="lowest">Lowest Rated</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {(searchTerm || ratingFilter !== "all") && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-3 bg-gradient-to-r from-rose-500/20 to-rose-600/20 hover:from-rose-500/30 hover:to-rose-600/30 border border-rose-500/30 text-rose-300 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-xs" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* No Results */}
            {filteredReviews.length === 0 && reviews.length > 0 && (
                <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FontAwesomeIcon icon={faSearch} className="text-teal-400/40 text-3xl" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-100 mb-2">No matching reviews</h3>
                    <p className="text-neutral-400 mb-6">Try adjusting your search criteria</p>
                    <button
                        onClick={clearFilters}
                        className="px-6 py-3 bg-gradient-to-r from-neutral-700/60 to-neutral-800/60 hover:from-neutral-600/60 hover:to-neutral-700/60 border border-neutral-700/30 text-neutral-200 rounded-xl text-sm font-medium transition-all duration-300"
                    >
                        Clear All Filters
                    </button>
                </div>
            )}

            {/* Reviews Grid */}
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {filteredReviews.map((review) => (
                    <div
                        key={review.id}
                        className="group relative overflow-hidden bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700/30 rounded-2xl p-5 hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 backdrop-blur-sm"
                        onMouseEnter={() => setIsHovered(review.id)}
                        onMouseLeave={() => setIsHovered(null)}
                    >
                        {/* Animated background gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isHovered === review.id ? 'opacity-100' : ''}`}></div>

                        {/* Header with Apartment Info */}
                        <div className="relative flex items-start justify-between mb-6 pb-4 border-b border-neutral-700/30">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="relative">
                                        <div className="w-8 h-8 bg-gradient-to-br from-teal-500/20 to-teal-600/20 rounded-lg flex items-center justify-center">
                                            <FontAwesomeIcon icon={faUser} className="text-teal-400 text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-neutral-100 group-hover:text-teal-100 transition-colors truncate">
                                            {review.apartment_name}
                                        </h3>
                                        <p className="text-neutral-400 text-xs mt-0.5">
                                            Reviewed by You
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Rating Badge */}
                            <div className="relative">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getRatingColor(review.rating)} backdrop-blur-sm`}>
                                    <FontAwesomeIcon icon={faStar} className="text-xs" />
                                    {review.rating}.0
                                </span>
                            </div>
                        </div>

                        {/* Stars Display */}
                        <div className="mb-5 p-4 bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 rounded-xl border border-neutral-700/20">
                            <div className="flex items-center justify-center gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <FontAwesomeIcon
                                        key={i}
                                        icon={faStar}
                                        className={`text-xl ${i < review.rating
                                            ? `text-gradient-to-r ${getRatingGradient(review.rating)} bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(0,255,255,0.2)]`
                                            : "text-neutral-600"
                                            }`}
                                    />
                                ))}
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-neutral-300">
                                    <span className="font-semibold text-neutral-100">{getRatingLabel(review.rating)}</span>
                                    <span className="mx-2">•</span>
                                    {review.rating} out of 5 stars
                                </p>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-5">
                            {/* Review Date */}
                            <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 p-3 rounded-xl border border-neutral-700/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 bg-teal-500/10 rounded-lg">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="text-teal-400 text-xs" />
                                    </div>
                                    <span className="text-neutral-400 text-xs font-medium">Reviewed on</span>
                                </div>
                                <p className="text-sm font-semibold text-neutral-100">
                                    {new Date(review.created_at).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric"
                                    })}
                                </p>
                            </div>

                            {/* Review Length */}
                            <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 p-3 rounded-xl border border-neutral-700/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 bg-teal-500/10 rounded-lg">
                                        <FontAwesomeIcon icon={faChartLine} className="text-teal-400 text-xs" />
                                    </div>
                                    <span className="text-neutral-400 text-xs font-medium">Length</span>
                                </div>
                                <p className="text-sm font-semibold text-neutral-100">
                                    {review.comment.length > 150 ? 'Detailed' : review.comment.length > 50 ? 'Moderate' : 'Brief'}
                                </p>
                            </div>
                        </div>

                        {/* Comment Preview */}
                        <div className="mb-5 p-4 bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 rounded-xl border border-neutral-700/20">
                            <div className="flex items-start gap-2 mb-2">
                                <FontAwesomeIcon icon={faQuoteRight} className="text-teal-400/30 text-sm mt-1" />
                                <p className="text-sm text-neutral-300 line-clamp-3 flex-1">
                                    "{review.comment}"
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="relative flex gap-2">
                            <button
                                onClick={() => setEditingReview(review)}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-neutral-700/60 to-neutral-800/60 hover:from-neutral-600/60 hover:to-neutral-700/60 text-neutral-200 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-neutral-600/30 hover:border-teal-500/30 hover:text-teal-100 group/btn"
                            >
                                <FontAwesomeIcon icon={faPenToSquare} className="group-hover/btn:scale-110 transition-transform" />
                                Edit
                            </button>

                            <button
                                onClick={() => handleDelete(review.id)}
                                className="px-4 py-2.5 bg-gradient-to-r from-rose-500/20 to-rose-600/20 hover:from-rose-500/30 hover:to-rose-600/30 text-rose-300 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-rose-500/30 hover:border-rose-400/50 group/btn"
                            >
                                <FontAwesomeIcon icon={faTrash} className="group-hover/btn:rotate-12 transition-transform" />
                                Delete
                            </button>
                        </div>

                        {/* Hover effect line */}
                        <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500/0 via-teal-500 to-teal-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ${isHovered === review.id ? 'scale-x-100' : ''}`}></div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {editingReview && (
                <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="
                        w-full max-w-2xl 
                        bg-gradient-to-br from-neutral-900 to-neutral-950
                        border border-neutral-800
                        rounded-2xl 
                        shadow-[0_0_60px_rgba(0,255,255,0.15)]
                        p-6
                        animate-in fade-in duration-300
                    ">
                        {/* Title with Gradient */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-300 to-teal-500 bg-clip-text text-transparent">
                                Edit Your Review
                            </h2>
                            <div className="h-[3px] w-24 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full mx-auto mt-4"></div>
                        </div>

                        {/* Apartment Card */}
                        <div className="mb-8 p-5 bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700/30 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-teal-500/20 to-teal-600/20 rounded-xl flex items-center justify-center">
                                    <FontAwesomeIcon icon={faStar} className="text-teal-400 text-xl" />
                                </div>
                                <div>
                                    <p className="text-neutral-400 text-sm font-medium mb-1">Apartment</p>
                                    <p className="text-white text-xl font-bold">{editingReview.apartment_name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Rating Section */}
                        <div className="mb-8">
                            <p className="text-neutral-400 text-sm font-medium mb-4 text-center">Rate your experience</p>
                            <div className="flex justify-center gap-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setEditingReview({ ...editingReview, rating: star })}
                                        className="relative group"
                                    >
                                        <div className={`
                                            w-14 h-14 rounded-2xl flex items-center justify-center
                                            transition-all duration-300
                                            ${star <= editingReview.rating
                                                ? `bg-gradient-to-br ${getRatingGradient(editingReview.rating)} shadow-lg shadow-teal-500/30`
                                                : "bg-neutral-800 border border-neutral-700"
                                            }
                                        `}>
                                            <FontAwesomeIcon
                                                icon={faStar}
                                                className={`
                                                    text-2xl transition-transform duration-200
                                                    ${star <= editingReview.rating
                                                        ? "text-white scale-110"
                                                        : "text-neutral-600 group-hover:text-teal-300 group-hover:scale-110"
                                                    }
                                                `}
                                            />
                                        </div>
                                        <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-neutral-400">
                                            {star}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Review Textarea */}
                        <div className="mb-8">
                            <label className="block text-neutral-400 text-sm font-medium mb-3">
                                Your Detailed Review
                            </label>
                            <div className="relative">
                                <textarea
                                    value={editingReview.comment}
                                    onChange={(e) =>
                                        setEditingReview({ ...editingReview, comment: e.target.value })
                                    }
                                    className="
                                        w-full h-48
                                        bg-neutral-900/50
                                        border border-neutral-700
                                        text-white
                                        rounded-xl
                                        p-4
                                        resize-none
                                        outline-none
                                        focus:ring-2 focus:ring-teal-500/50
                                        focus:border-transparent
                                        transition-all duration-300
                                        placeholder-neutral-600
                                    "
                                    placeholder="Share your detailed experience with this apartment..."
                                />
                                <div className="absolute bottom-4 right-4 text-xs text-neutral-500">
                                    {editingReview.comment.length}/1000
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setEditingReview(null)}
                                className="
                                    flex-1
                                    px-6 py-4
                                    rounded-xl
                                    bg-gradient-to-r from-neutral-800 to-neutral-900
                                    border border-neutral-700
                                    text-neutral-300
                                    hover:text-white
                                    hover:border-neutral-600
                                    transition-all duration-300
                                    font-medium
                                    group
                                "
                            >
                                <span className="group-hover:scale-105 transition-transform block">Cancel</span>
                            </button>

                            <button
                                onClick={handleUpdate}
                                className="
                                    flex-1
                                    px-6 py-4
                                    rounded-xl
                                    bg-gradient-to-r from-teal-600 to-teal-500
                                    hover:from-teal-500 hover:to-teal-400
                                    text-white
                                    font-bold
                                    shadow-lg
                                    shadow-teal-500/30
                                    hover:shadow-teal-500/50
                                    transition-all duration-300
                                    group
                                "
                            >
                                <span className="group-hover:scale-105 transition-transform block">Update Review</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}