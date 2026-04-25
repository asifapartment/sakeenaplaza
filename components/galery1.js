'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import NextImage from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronLeft,
    faChevronRight,
    faTimes,
    faExpand,
    faPlay,
    faPause,
    faImage,
    faTh
} from '@fortawesome/free-solid-svg-icons';

/**
 * Image cache manager
 */
class ImageCache {
    constructor() {
        this.cache = new Map();
        this.promises = new Map();
    }

    preload(url) {
        // Return cached promise if already loading
        if (this.promises.has(url)) {
            return this.promises.get(url);
        }

        // Return cached image if available
        if (this.cache.has(url)) {
            return Promise.resolve(this.cache.get(url));
        }

        // Preload the image
        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.cache.set(url, img);
                this.promises.delete(url);
                resolve(img);
            };
            img.onerror = () => {
                this.promises.delete(url);
                reject(new Error(`Failed to load image: ${url}`));
            };
            img.src = url;
        });

        this.promises.set(url, promise);
        return promise;
    }

    get(url) {
        return this.cache.get(url) || null;
    }

    clear() {
        this.cache.clear();
        this.promises.clear();
    }
}

// Create singleton instance
const imageCache = new ImageCache();

/**
 * Preload adjacent images for smoother navigation
 */
const preloadAdjacentImages = (images, currentIndex, range = 2) => {
    const start = Math.max(0, currentIndex - range);
    const end = Math.min(images.length - 1, currentIndex + range);

    for (let i = start; i <= end; i++) {
        if (i !== currentIndex && images[i]?.image_url) {
            imageCache.preload(images[i].image_url).catch(() => {
                // Silent fail for preloading
            });
        }
    }
};

const GallerySection = ({ images = [], initialIndex = 0, groupSize = 4 }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [groupStart, setGroupStart] = useState(Math.floor(initialIndex / groupSize) * groupSize);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [autoPlay, setAutoPlay] = useState(false);
    const [mainImageLoaded, setMainImageLoaded] = useState(false);
    const [showThumbnails, setShowThumbnails] = useState(true);
    const [preloadedImages, setPreloadedImages] = useState(new Set());

    const autoPlayRef = useRef(null);
    const fullscreenRef = useRef(null);
    const lastAutoPlayTimeRef = useRef(Date.now());

    // Preload images on mount and when images change
    useEffect(() => {
        if (images.length > 0) {
            // Preload first few images
            images.slice(0, 5).forEach(img => {
                if (img?.image_url) {
                    imageCache.preload(img.image_url).catch(() => { });
                }
            });
        }
    }, [images]);

    // Preload adjacent images when current index changes
    useEffect(() => {
        if (images.length > 0) {
            preloadAdjacentImages(images, currentIndex, 2);
        }
    }, [currentIndex, images]);

    const goToNext = useCallback(() => {
        setMainImageLoaded(false);
        setCurrentIndex((prev) => (prev + 1) % images.length);
        lastAutoPlayTimeRef.current = Date.now();
    }, [images.length]);

    const goToPrevious = useCallback(() => {
        setMainImageLoaded(false);
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        lastAutoPlayTimeRef.current = Date.now();
    }, [images.length]);

    // Fixed auto-play effect - Reset timer on manual navigation
    useEffect(() => {
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
            autoPlayRef.current = null;
        }

        if (!images.length || !autoPlay) return;

        // Calculate remaining time based on last manual interaction
        const startAutoPlay = () => {
            autoPlayRef.current = setInterval(() => {
                setCurrentIndex((prev) => {
                    const next = (prev + 1) % images.length;
                    return next;
                });
                setMainImageLoaded(false);
            }, 4000);
        };

        startAutoPlay();

        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
                autoPlayRef.current = null;
            }
        };
    }, [images.length, autoPlay]);

    // Reset auto-play timer when manually navigating
    useEffect(() => {
        if (autoPlay && autoPlayRef.current) {
            // Reset the interval
            clearInterval(autoPlayRef.current);
            autoPlayRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % images.length);
                setMainImageLoaded(false);
            }, 4000);
        }
    }, [currentIndex, autoPlay]);

    // Update thumbnail group on index change
    useEffect(() => {
        if (!isFullscreen) {
            setGroupStart(Math.floor(currentIndex / groupSize) * groupSize);
        }
    }, [currentIndex, isFullscreen, groupSize]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isFullscreen) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    goToPrevious();
                }
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    goToNext();
                }
                if (e.key === 'Escape') closeFullscreen();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen, goToPrevious, goToNext]);

    const handleThumbnailClick = (index) => {
        if (index === currentIndex) return;
        setMainImageLoaded(false);
        setCurrentIndex(index);
    };

    const openFullscreen = () => {
        setIsFullscreen(true);
        document.body.style.overflow = 'hidden';
        if (autoPlay) setAutoPlay(false);
    };

    const closeFullscreen = () => {
        setIsFullscreen(false);
        document.body.style.overflow = '';
    };

    const toggleAutoPlay = () => {
        setAutoPlay(prev => !prev);
    };

    const toggleThumbnails = () => setShowThumbnails((p) => !p);

    if (!images || images.length === 0) {
        return (
            <div className="text-center py-16 bg-black rounded-2xl border border-white/10">
                <FontAwesomeIcon icon={faImage} className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">No images available for this property</p>
            </div>
        );
    }

    const currentThumbnails = images.slice(groupStart, groupStart + groupSize);
    const currentImage = images[currentIndex];
    const canShowPreviousGroup = groupStart > 0;
    const canShowNextGroup = groupStart + groupSize < images.length;

    // Check if image is cached
    const isImageCached = (url) => imageCache.get(url) !== null;

    return (
        <>
            <div className="w-full">
                {/* Main Image Container */}
                <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 group">
                    {/* Main Image */}
                    <div className="relative aspect-[16/9] lg:aspect-[16/10]">
                        <div className={`absolute inset-0 transition-opacity duration-300 ${mainImageLoaded ? 'opacity-100' : 'opacity-0'}`}>
                            <NextImage
                                src={currentImage.image_url}
                                alt={currentImage.image_name || `Apartment image ${currentIndex + 1}`}
                                fill
                                className="object-cover cursor-zoom-in"
                                priority={currentIndex === 0} // This already sets loading="eager"
                                onLoad={() => setMainImageLoaded(true)}
                                quality={85}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                            // Remove the loading prop entirely
                            />
                        </div>
                        {!mainImageLoaded && (
                            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Arrows */}
                        <button
                            onClick={goToPrevious}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 backdrop-blur-sm"
                            aria-label="Previous image"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 backdrop-blur-sm"
                            aria-label="Next image"
                        >
                            <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
                        </button>

                        {/* Top Controls */}
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button
                                onClick={toggleAutoPlay}
                                className="bg-black/60 hover:bg-black/80 text-white p-2 w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                                aria-label={autoPlay ? 'Pause slideshow' : 'Play slideshow'}
                            >
                                <FontAwesomeIcon icon={autoPlay ? faPause : faPlay} className="w-4 h-4" />
                            </button>
                            <button
                                onClick={toggleThumbnails}
                                className="bg-black/60 hover:bg-black/80 text-white p-2 w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm lg:hidden"
                                aria-label="Toggle thumbnails"
                            >
                                <FontAwesomeIcon icon={faTh} className="w-4 h-4" />
                            </button>
                            <button
                                onClick={openFullscreen}
                                className="bg-black/60 hover:bg-black/80 text-white p-2 w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                                aria-label="View fullscreen"
                            >
                                <FontAwesomeIcon icon={faExpand} className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                            {currentIndex + 1} / {images.length}
                        </div>

                        {/* Auto-play Indicator with progress bar */}
                        {autoPlay && (
                            <div className="absolute bottom-4 right-4 bg-teal-500 text-black px-3 py-1.5 rounded-full text-xs font-semibold animate-pulse">
                                Auto-playing
                            </div>
                        )}
                    </div>
                </div>

                {/* Thumbnails Section */}
                {showThumbnails && (
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <FontAwesomeIcon icon={faImage} className="w-4 h-4 text-teal-400" />
                                <span>All Photos ({images.length})</span>
                            </h3>
                            {currentThumbnails.length < images.length && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setGroupStart(Math.max(0, groupStart - groupSize))}
                                        disabled={!canShowPreviousGroup}
                                        className={`p-2 rounded-lg transition-all duration-200 ${canShowPreviousGroup
                                            ? 'bg-white/10 hover:bg-white/20 text-white'
                                            : 'bg-white/5 text-gray-600 cursor-not-allowed'
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setGroupStart(groupStart + groupSize)}
                                        disabled={!canShowNextGroup}
                                        className={`p-2 rounded-lg transition-all duration-200 ${canShowNextGroup
                                            ? 'bg-white/10 hover:bg-white/20 text-white'
                                            : 'bg-white/5 text-gray-600 cursor-not-allowed'
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {currentThumbnails.map((img, idx) => {
                                const actualIndex = groupStart + idx;
                                const isActive = actualIndex === currentIndex;
                                const isPreloaded = isImageCached(img.image_url);

                                return (
                                    <button
                                        key={`${img.id || img.image_url}-${idx}`}
                                        onClick={() => handleThumbnailClick(actualIndex)}
                                        className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 group ${isActive
                                            ? 'ring-2 ring-teal-400 shadow-lg shadow-teal-400/20'
                                            : 'hover:ring-1 hover:ring-teal-400/50'
                                            }`}
                                    >
                                        <div className="relative aspect-[4/3]">
                                            <NextImage
                                                src={img.image_url}
                                                alt={img.image_name || `Thumbnail ${actualIndex + 1}`}
                                                fill
                                                className={`object-cover transition-transform duration-300 ${!isActive && 'group-hover:scale-110'}`}
                                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                                quality={60}
                                            // Remove the loading prop
                                            />
                                            {!isActive && (
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                                            )}
                                            {isActive && (
                                                <div className="absolute inset-0 bg-teal-400/20" />
                                            )}
                                            {isPreloaded && (
                                                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-teal-400 rounded-full" />
                                            )}
                                        </div>
                                        {isActive && (
                                            <div className="absolute top-2 right-2 w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Fullscreen Modal with cached images */}
            {isFullscreen && (
                <div
                    ref={fullscreenRef}
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
                    onClick={closeFullscreen}
                >
                    <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={closeFullscreen}
                            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all duration-200 z-10"
                            aria-label="Close fullscreen"
                        >
                            <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                        </button>

                        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium z-10">
                            {currentIndex + 1} / {images.length}
                        </div>

                        <div className="relative w-full h-full flex items-center justify-center p-8">
                            <NextImage
                                src={currentImage.image_url}
                                alt={currentImage.image_name || `Apartment image ${currentIndex + 1}`}
                                fill
                                className="object-contain"
                                priority
                                quality={95}
                                sizes="100vw"
                            />
                        </div>

                        <button
                            onClick={goToPrevious}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all duration-200 hover:scale-110"
                            aria-label="Previous image"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} className="w-6 h-6" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all duration-200 hover:scale-110"
                            aria-label="Next image"
                        >
                            <FontAwesomeIcon icon={faChevronRight} className="w-6 h-6" />
                        </button>

                        <div className="absolute bottom-4 left-0 right-0 overflow-x-auto pb-4">
                            <div className="flex gap-2 justify-center px-4">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleThumbnailClick(idx)}
                                        className={`relative w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 flex-shrink-0 ${idx === currentIndex
                                            ? 'ring-2 ring-teal-400 scale-105'
                                            : 'opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <NextImage
                                            src={img.image_url}
                                            alt={`Thumbnail ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="80px"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GallerySection;