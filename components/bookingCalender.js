'use client';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useEffect, useMemo, useRef } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const BookingConflictModal = ({ open, onClose }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleIn">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
                        <FontAwesomeIcon icon={faTriangleExclamation} className="text-lg" />
                    </div>

                    <h2 className="text-lg font-semibold text-white">
                        Booking Conflict
                    </h2>
                </div>

                <p className="text-sm text-gray-300 mb-6">
                    The selected date range contains already booked dates.
                    Please choose a different check-in and check-out range.
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 transition"
                    >
                        OK, got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function BookingCalendar({
    apartmentId,
    formData,
    setFormData,
    size = "medium",
    background = "bg-gradient-to-br from-neutral-900/95 to-neutral-800/95"
}) {
    const [monthsToShow, setMonthsToShow] = useState(1);
    const [bookedDates, setBookedDates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [tempSelection, setTempSelection] = useState(null);

    // ----------------------------------------
    // 🔥 Fetch booked dates
    // ----------------------------------------
    async function fetchBookedDates() {
        if (!apartmentId) return;
        setLoading(true);

        try {
            const res = await fetch("/api/check-availability", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apartment_id: apartmentId })
            });

            const data = await res.json();

            if (data.success) {
                // Convert string dates to Date objects and normalize time
                const formattedDates = data.data.bookedDates?.map(dateStr => {
                    const date = new Date(dateStr);
                    date.setHours(0, 0, 0, 0);
                    return date;
                }) || [];
                setBookedDates(formattedDates);
            }
        } catch (err) {
            console.error("Calendar fetch error:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchBookedDates();
    }, [apartmentId]);

    useEffect(() => {
        const updateMonths = () => {
            setMonthsToShow(window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 1 : 1);
        };
        updateMonths();
        window.addEventListener('resize', updateMonths);
        return () => window.removeEventListener('resize', updateMonths);
    }, []);

    const sizeMap = useMemo(() => ({
        extraSmall: {
            scale: 0.85,
            font: 'text-xs',
            width: 'max-w-[280px]',
            padding: 'p-3'
        },
        small: {
            scale: 0.95,
            font: 'text-sm',
            width: 'max-w-[320px]',
            padding: 'p-4'
        },
        medium: {
            scale: 1,
            font: 'text-sm',
            width: 'max-w-[340px]',
            padding: ''
        },
        large: {
            scale: 1.1,
            font: 'text-lg',
            width: 'max-w-[380px]',
            padding: 'p-6'
        },
        extraLarge: {
            scale: 1.2,
            font: 'text-xl',
            width: 'max-w-[420px]',
            padding: 'p-7'
        },
    }), []);

    const { scale, font, width, padding } = sizeMap[size] || sizeMap.medium;

    // ----------------------------------------
    // 📌 Function to check if range has conflicts
    // ----------------------------------------
    const hasDateConflict = (range) => {
        if (!range?.from || !range?.to) return false;

        const start = new Date(range.from);
        const end = new Date(range.to);

        // Check if any date in the range is booked
        const isRangeBooked = bookedDates.some(bookedDate => {
            const bookedTime = bookedDate.getTime();
            return bookedTime >= start.getTime() && bookedTime <= end.getTime();
        });

        return isRangeBooked;
    };

    // ----------------------------------------
    // 📌 Handle range selection
    // ----------------------------------------
    const handleSelect = (range) => {
        // Clear any temporary selection
        setTempSelection(null);

        // If user cleared the selection (clicked outside or clicked selected range)
        if (!range) {
            setFormData(prev => ({
                ...prev,
                checkin: '',
                checkout: ''
            }));
            return;
        }

        // If only from date is selected (user hasn't completed the range yet)
        if (range.from && !range.to) {
            setTempSelection(range);
            return;
        }

        // If we have a complete range
        if (range.from && range.to) {
            // Check for conflicts
            const hasConflict = hasDateConflict(range);

            if (hasConflict) {
                // Show conflict modal
                setShowConflictModal(true);
                // Clear the current form data
                setFormData(prev => ({
                    ...prev,
                    checkin: '',
                    checkout: ''
                }));
                // Clear temporary selection
                setTempSelection(null);
            } else {
                // No conflict, set the form data
                const normalize = (date) => {
                    const d = new Date(date);
                    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                    return d.toISOString().split("T")[0];
                };

                setFormData(prev => ({
                    ...prev,
                    checkin: normalize(range.from),
                    checkout: normalize(range.to)
                }));
                // Clear temporary selection
                setTempSelection(null);
            }
        }
    };

    // ----------------------------------------
    // 🚫 Disabled = past + booked dates
    // ----------------------------------------
    const disabledDates = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Function to check if a date is booked
        const isBooked = (date) => {
            return bookedDates.some(bookedDate => {
                return bookedDate.getTime() === date.getTime();
            });
        };

        // Return a function that checks both conditions
        return (date) => {
            const dateCopy = new Date(date);
            dateCopy.setHours(0, 0, 0, 0);
            return dateCopy < today || isBooked(dateCopy);
        };
    }, [bookedDates]);

    // ----------------------------------------
    // 🔥 Date modifiers for highlighting
    // ----------------------------------------
    const modifiers = useMemo(() => ({
        booked: bookedDates,
        today: new Date(),
        weekend: { dayOfWeek: [0, 6] }
    }), [bookedDates]);

    // ----------------------------------------
    // 🎨 Enhanced colors & styling
    // ----------------------------------------
    const modifiersClassNames = {
        disabled: "bg-white/10 text-neutral-500 cursor-not-allowed",
        selected: "bg-blue-600 text-white font-semibold shadow-lg",
        booked: "!bg-red-400/30 !text-white !cursor-not-allowed",
        today: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border border-emerald-400/50 font-semibold",
        weekend: "text-neutral-300",
        range_start: "bg-blue-600 text-white rounded-l-full shadow-lg",
        range_end: "bg-blue-600 text-white rounded-r-full shadow-lg",
        range_middle: "bg-blue-600 text-blue-100",
    };

    // Combine form data selection with temporary selection for display
    const displayedSelection = useMemo(() => {
        // If we have form data, use that
        if (formData.checkin && formData.checkout) {
            return {
                from: new Date(formData.checkin),
                to: new Date(formData.checkout)
            };
        }

        // Otherwise use temporary selection
        return tempSelection;
    }, [formData.checkin, formData.checkout, tempSelection]);

    // ----------------------------------------
    // ✨ Enhanced Legend Component
    // ----------------------------------------
    const CalendarLegend = () => (
        <div className='w-full flex justify-center'>
            <div className="flex gap-4 justify-center items-center mb-2 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 w-[300px]">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow"></div>
                    <span className="text-sm font-medium text-neutral-200">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-rose-500 to-rose-600"></div>
                    <span className="text-sm font-medium text-neutral-200">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
                    <span className="text-sm font-medium text-neutral-200">Today</span>
                </div>
            </div>
        </div>

    );

    // ----------------------------------------
    // 🔄 Loading Skeleton
    // ----------------------------------------
    const LoadingSkeleton = () => (
        <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex justify-between items-center">
                <div className="h-8 w-24 bg-white/10 rounded-lg"></div>
                <div className="flex gap-2">
                    <div className="h-8 w-8 bg-white/10 rounded-full"></div>
                    <div className="h-8 w-8 bg-white/10 rounded-full"></div>
                </div>
            </div>

            {/* Weekdays skeleton */}
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-6 bg-white/10 rounded-full" />
                ))}
            </div>

            {/* Dates skeleton */}
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 42 }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-10 rounded-lg bg-white/10 border border-white/5 
                            ${i % 7 === 0 || i % 7 === 6 ? 'opacity-70' : ''}`}
                    />
                ))}
            </div>
        </div>
    );

    // ----------------------------------------
    // ✨ Selected Dates Display
    // ----------------------------------------
    const SelectedDatesDisplay = () => {
        if (!formData.checkin || !formData.checkout) return null;

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        };

        return (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm font-medium text-neutral-300 mb-1">Selected Dates</p>
                <div className="flex items-center justify-between">
                    <div className="text-center">
                        <p className="text-xs text-neutral-400">Check-in</p>
                        <p className="text-lg font-semibold text-white">{formatDate(formData.checkin)}</p>
                    </div>
                    <div className="text-neutral-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-neutral-400">Check-out</p>
                        <p className="text-lg font-semibold text-white">{formatDate(formData.checkout)}</p>
                    </div>
                </div>
            </div>
        );
    };

    // ----------------------------------------
    // Render
    // ----------------------------------------
    return (
        <div className="space-y-6 justify-center items-center">
            {bookedDates.length > 0 && <CalendarLegend />}

            {formData.checkin && formData.checkout && <SelectedDatesDisplay />}

            <div
                className={`relative ${background} backdrop-blur-sm rounded-2xl ${padding} ${width} mx-auto 
                    shadow-2xl border border-white/10 overflow-hidden`}
                style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
            >
                {loading ? (
                    <LoadingSkeleton />
                ) : (
                    <DayPicker
                        mode="range"
                        numberOfMonths={monthsToShow}
                        selected={displayedSelection}
                        onSelect={handleSelect}
                        disabled={disabledDates}
                        modifiers={modifiers}
                        className={`${font} bg-transparent text-white`}
                        modifiersClassNames={modifiersClassNames}
                        classNames={{
                            caption: 'flex justify-center items-center py-2',
                            caption_label: 'mt-2 ml-3 text-lg font-semibold text-white',
                            day_selected: '!bg-gradient-to-r !from-blue-500 !to-blue-600 !text-white',
                            day_today: 'font-bold',
                            day_outside: 'text-neutral-500',
                            day_disabled: 'text-neutral-500 cursor-not-allowed',
                            day_range_middle: 'bg-blue-500/20',
                            day_range_start: 'rounded-l-full',
                            day_range_end: 'rounded-r-full',
                            day_hidden: 'invisible',
                            day_booked: '!bg-red-600/90 !text-white !border !border-rose-400/50 !cursor-not-allowed',
                        }}
                        components={{
                            IconLeft: ({ ...props }) => (
                                <svg {...props} className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            ),
                            IconRight: ({ ...props }) => (
                                <svg {...props} className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            ),
                        }}
                    />
                )}
            </div>

            {/* Instructions */}
            <div className="text-center text-sm text-neutral-400 mt-4">
                <p>Select your check-in and check-out dates</p>
                <p className="text-xs mt-1">Click and drag to select a date range</p>
            </div>
            <BookingConflictModal
                open={showConflictModal}
                onClose={() => setShowConflictModal(false)}
            />
        </div>
    );
}