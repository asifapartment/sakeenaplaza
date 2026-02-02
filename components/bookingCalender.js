'use client';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useEffect, useMemo } from 'react';
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
    useEffect(() => {
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
                    const formattedDates = data.data.blockedDates?.map(dateStr => {
                        const [y, m, d] = dateStr.split('-').map(Number);
                        const dt = new Date(y, m - 1, d);
                        dt.setHours(0, 0, 0, 0);
                        return dt;
                    }) || [];

                    setBookedDates(formattedDates);
                }
            } catch (err) {
                console.error("Calendar fetch error:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchBookedDates();
    }, [apartmentId]);

    useEffect(() => {
        const updateMonths = () => {
            setMonthsToShow(window.innerWidth < 768 ? 1 : 2);
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
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        return bookedDates.some(bookedDate => {
            const t = bookedDate.getTime();
            return t >= start.getTime() && t < end.getTime();
        });
    };

    // ----------------------------------------
    // 📌 Handle range selection
    // ----------------------------------------
    const handleSelect = (range) => {
        setTempSelection(null);

        // cleared
        if (!range) {
            setFormData(prev => ({
                ...prev,
                checkin: '',
                checkout: ''
            }));
            return;
        }

        // first click only (check-in)
        if (range.from && !range.to) {
            setTempSelection(range);
            return;
        }

        if (!range.from || !range.to) return;

        const start = new Date(range.from);
        const end = new Date(range.to);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        // Minimum 1 night
        const nights = Math.round((end - start) / (1000 * 60 * 60 * 24));
        if (nights < 1) {
            setTempSelection({ from: range.from, to: undefined });
            return;
        }

        // Conflict detection
        if (hasDateConflict(range)) {
            setShowConflictModal(true);
            setFormData(prev => ({
                ...prev,
                checkin: '',
                checkout: ''
            }));
            return;
        }

        // Normalize for DB (YYYY-MM-DD)
        const normalize = (date) => {
            const d = new Date(date);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            return d.toISOString().split("T")[0];
        };

        setFormData(prev => ({
            ...prev,
            checkin: normalize(start),
            checkout: normalize(end)
        }));
    };

    // ----------------------------------------
    // 🚫 Disabled dates (past + booked)
    // ----------------------------------------
    const disabledDates = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return (date) => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);

            // Disable past dates
            if (d < today) return true;

            // Disable booked dates
            return bookedDates.some(b => b.getTime() === d.getTime());
        };
    }, [bookedDates]);

    // Modifiers for styling
    const modifiers = useMemo(() => ({
        booked: bookedDates
    }), [bookedDates]);

    // Combine form data selection with temporary selection for display
    const displayedSelection = useMemo(() => {
        if (formData.checkin && formData.checkout) {
            return {
                from: new Date(formData.checkin),
                to: new Date(formData.checkout)
            };
        }
        return tempSelection;
    }, [formData.checkin, formData.checkout, tempSelection]);

    // ----------------------------------------
    // ✨ Enhanced Legend Component
    // ----------------------------------------
    const CalendarLegend = () => (
        <div className='w-full flex justify-center'>
            <div className="flex flex-wrap gap-4 justify-center items-center mb-4 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 max-w-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow"></div>
                    <span className="text-xs font-medium text-neutral-200">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-500 to-rose-600"></div>
                    <span className="text-xs font-medium text-neutral-200">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
                    <span className="text-xs font-medium text-neutral-200">Today</span>
                </div>
            </div>
        </div>
    );

    // ----------------------------------------
    // 🔄 Loading Skeleton
    // ----------------------------------------
    const LoadingSkeleton = () => (
        <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-8 w-24 bg-white/10 rounded-lg"></div>
                <div className="flex gap-2">
                    <div className="h-8 w-8 bg-white/10 rounded-full"></div>
                    <div className="h-8 w-8 bg-white/10 rounded-full"></div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-6 bg-white/10 rounded-full" />
                ))}
            </div>

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
                month: 'short',
                day: 'numeric'
            });
        };

        const getNights = () => {
            const start = new Date(formData.checkin);
            const end = new Date(formData.checkout);
            return Math.round((end - start) / (1000 * 60 * 60 * 24));
        };

        const nights = getNights();

        return (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm font-medium text-neutral-300 mb-2">Selected Dates</p>
                <div className="flex items-center justify-between">
                    <div className="text-center">
                        <p className="text-xs text-neutral-400">Check-in</p>
                        <p className="text-lg font-semibold text-white">{formatDate(formData.checkin)}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="text-neutral-400 mb-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </div>
                        <div className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                            {nights} {nights === 1 ? 'night' : 'nights'}
                        </div>
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
        <div className="space-y-4">
            {/* Header */}
            <div className="text-center mb-2">
                <h3 className="text-lg font-semibold text-white mb-1">Select Dates</h3>
                <p className="text-sm text-neutral-400">Choose your check-in and check-out dates</p>
            </div>

            {/* Legend */}
            {bookedDates.length > 0 && <CalendarLegend />}

            {/* Selected dates */}
            {formData.checkin && formData.checkout && <SelectedDatesDisplay />}

            {/* Calendar Container */}
            <div
                className={`relative ${background} backdrop-blur-sm rounded-2xl p-4 w-full max-w-md mx-auto 
      shadow-2xl border border-white/10 overflow-hidden`}
            >
                {loading ? (
                    <LoadingSkeleton />
                ) : (
                        <DayPicker
                            mode="range"
                            numberOfMonths={1}
                            selected={displayedSelection}
                            onSelect={handleSelect}
                            disabled={disabledDates}
                            modifiers={modifiers}
                            className="bg-transparent text-white w-full"
                            modifiersClassNames={{
                                booked: "!bg-red-600/90 !text-white !cursor-not-allowed",
                                disabled: "text-neutral-500 cursor-not-allowed opacity-50",
                                selected: '!bg-blue-500 !text-white',
                                today: "!bg-emerald-500/70 !text-white border border-emerald-400/50 font-semibold",
                            }}
                            classNames={{
                                // Caption (month + nav)
                                caption: 'relative flex justify-center items-center py-2 mb-2',
                                caption_label: 'text-lg font-semibold text-white',

                                // Navigation buttons
                                nav_button: 'absolute top-1/2 transform -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 transition',
                                nav_button_previous: 'left-2',
                                nav_button_next: 'right-2',

                                // Table layout
                                table: 'w-full table-fixed border-collapse', // table-fixed preserves 7-column grid
                                head_row: '', // leave default
                                head_cell: 'text-neutral-400 font-medium text-sm text-center', // center weekdays

                                row: 'table-row', // enforce proper row behavior
                                day: 'table-cell w-10 h-10 flex items-center justify-center hover:bg-white/10 transition-all duration-200 text-center',
                                day_today: 'font-bold',
                                day_outside: 'text-neutral-500 opacity-50',
                                day_disabled: 'text-neutral-500 cursor-not-allowed opacity-50',
                                day_range_middle: 'bg-blue-500/20',
                                day_range_start: '!rounded-l-full !bg-blue-500/20',
                                day_range_end: '!rounded-r-full !bg-blue-500/20',
                                day_hidden: 'invisible',
                            }}
                              
                              
                              
                        />

                )}
            </div>

            <BookingConflictModal
                open={showConflictModal}
                onClose={() => setShowConflictModal(false)}
            />
        </div>

    );
}