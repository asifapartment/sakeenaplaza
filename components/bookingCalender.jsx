'use client';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useEffect, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const BookingConflictModal = ({ open, onClose }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="bg-black border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-red-500/20 text-red-400">
                        <FontAwesomeIcon icon={faTriangleExclamation} className="text-lg" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">
                        Booking Conflict
                    </h2>
                </div>

                <p className="text-sm text-gray-400 mb-6">
                    The selected date range contains already booked dates.
                    Please choose a different check-in and check-out range.
                </p>

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-black font-semibold transition"
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
    setFormData
}) {
    const [bookedDates, setBookedDates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [tempSelection, setTempSelection] = useState(null);

    // Fetch booked dates
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

    const handleSelect = (range) => {
        setTempSelection(null);

        if (!range) {
            setFormData(prev => ({
                ...prev,
                checkin: '',
                checkout: ''
            }));
            return;
        }

        if (range.from && !range.to) {
            setTempSelection(range);
            return;
        }

        if (!range.from || !range.to) return;

        const start = new Date(range.from);
        const end = new Date(range.to);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const nights = Math.round((end - start) / (1000 * 60 * 60 * 24));
        if (nights < 1) {
            setTempSelection({ from: range.from, to: undefined });
            return;
        }

        if (hasDateConflict(range)) {
            setShowConflictModal(true);
            setFormData(prev => ({
                ...prev,
                checkin: '',
                checkout: ''
            }));
            return;
        }

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

    const disabledDates = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return (date) => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);

            if (d < today) return true;
            return bookedDates.some(b => b.getTime() === d.getTime());
        };
    }, [bookedDates]);

    const modifiers = useMemo(() => ({
        booked: bookedDates
    }), [bookedDates]);

    const displayedSelection = useMemo(() => {
        if (formData.checkin && formData.checkout) {
            return {
                from: new Date(formData.checkin),
                to: new Date(formData.checkout)
            };
        }
        return tempSelection;
    }, [formData.checkin, formData.checkout, tempSelection]);

    // Legend
    const CalendarLegend = () => (
        <div className="flex gap-6 justify-center items-center mb-5">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                <span className="text-xs text-gray-500">Selected</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-500">Booked</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-teal-400"></div>
                <span className="text-xs text-gray-500">Today</span>
            </div>
        </div>
    );

    const LoadingSkeleton = () => (
        <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-white/10 rounded w-40 mx-auto"></div>
            <div className="grid grid-cols-7 gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="h-8 bg-white/10 rounded text-center py-2"></div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="h-10 bg-white/10 rounded"></div>
                ))}
            </div>
        </div>
    );

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
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                        <p className="text-xs text-gray-500">Check-in</p>
                        <p className="text-sm font-semibold text-white">{formatDate(formData.checkin)}</p>
                    </div>
                    <div className="flex flex-col items-center px-3">
                        <div className="text-xs bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded">
                            {nights} {nights === 1 ? 'night' : 'nights'}
                        </div>
                    </div>
                    <div className="text-center flex-1">
                        <p className="text-xs text-gray-500">Check-out</p>
                        <p className="text-sm font-semibold text-white">{formatDate(formData.checkout)}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-3">
            <div className="bg-black rounded-xl border border-white/10 p-5">
                {loading ? (
                    <LoadingSkeleton />
                ) : (
                    <>
                        <CalendarLegend />
                        <DayPicker
                            mode="range"
                            numberOfMonths={1}
                            selected={displayedSelection}
                            onSelect={handleSelect}
                            disabled={disabledDates}
                            modifiers={modifiers}
                            className="rdp-custom"
                            modifiersClassNames={{
                                booked: "rdp-day-booked",
                                selected: "rdp-day-selected",
                                today: "rdp-day-today"
                            }}
                            classNames={{
                                root: "text-white",
                                caption: "flex justify-center items-center relative mb-6",
                                caption_label: "text-base font-semibold text-white",
                                nav: "flex items-center gap-1",
                                nav_button: "w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors text-gray-400",
                                nav_button_previous: "absolute left-0",
                                nav_button_next: "absolute right-0",
                                table: "w-full",
                                head_row: "",
                                head_cell: "text-gray-500 text-sm font-normal pb-3 text-center",
                                tbody: "",
                                row: "",
                                cell: "p-1",
                                day: "w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-all duration-200 mx-auto",
                                day_outside: "text-gray-700",
                                day_disabled: "text-gray-700 cursor-not-allowed",
                                day_range_middle: "bg-teal-500/20 rounded-none",
                                day_range_start: "bg-teal-500 text-black rounded-l-lg",
                                day_range_end: "bg-teal-500 text-black rounded-r-lg",
                                day_today: "bg-teal-400/20 text-teal-400 font-semibold",
                            }}
                        />
                    </>
                )}
            </div>

            <SelectedDatesDisplay />

            <BookingConflictModal
                open={showConflictModal}
                onClose={() => setShowConflictModal(false)}
            />

            <style jsx global>{`
                .rdp-custom {
                    --rdp-cell-size: 42px;
                    --rdp-accent-color: #14b8a6;
                    --rdp-background-color: rgba(20, 184, 166, 0.1);
                }
                
                .rdp-custom table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 4px 2px;
                }
                
                .rdp-custom td {
                    padding: 0;
                }
                
                .rdp-day-booked {
                    background-color: rgba(239, 68, 68, 0.15) !important;
                    color: rgb(248, 113, 113) !important;
                    text-decoration: line-through;
                    cursor: not-allowed;
                }
                
                .rdp-day-selected {
                    background-color: #14b8a6 !important;
                    color: black !important;
                    font-weight: 600 !important;
                }
                
                .rdp-day-today {
                    background-color: rgba(20, 184, 166, 0.15) !important;
                    color: #14b8a6 !important;
                    font-weight: 600 !important;
                    position: relative;
                }
                
                .rdp-day-today::after {
                    content: '';
                    position: absolute;
                    bottom: 4px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 4px;
                    background-color: #14b8a6;
                    border-radius: 50%;
                }
                
                .rdp-button:hover:not([disabled]) {
                    background-color: rgba(255, 255, 255, 0.05) !important;
                }
                
                .rdp-day_disabled {
                    opacity: 0.4;
                }
                
                .rdp-day_outside {
                    opacity: 0.3;
                }
            `}</style>
        </div>
    );
}