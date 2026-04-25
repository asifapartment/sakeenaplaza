"useclient";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

// Add this component to your ApartmentForm
export const DateBlocker = ({ apartmentId, onDatesBlocked }) => {
    const [blockedDates, setBlockedDates] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (apartmentId) {
            fetchBlockedDates();
        }
    }, [apartmentId]);

    const fetchBlockedDates = async () => {
        try {
            const res = await fetch(`/api/admin/blocked-dates?apartment_id=${apartmentId}`);
            const data = await res.json();
            if (data.blocked_dates) {
                setBlockedDates(data.blocked_dates);
            }
        } catch (err) {
            console.error('Error fetching blocked dates:', err);
        }
    };

    const addBlockedDates = async () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/admin/blocked-dates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apartment_id: apartmentId,
                    start_date: startDate,
                    end_date: endDate,
                    reason: reason || 'Maintenance'
                })
            });

            if (res.ok) {
                await fetchBlockedDates();
                setStartDate('');
                setEndDate('');
                setReason('');
                if (onDatesBlocked) onDatesBlocked();
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to block dates');
            }
        } catch (err) {
            console.error('Error blocking dates:', err);
            alert('Failed to block dates');
        } finally {
            setLoading(false);
        }
    };

    const removeBlockedDate = async (bookingId) => {
        if (!confirm('Remove this blocked date range?')) return;

        try {
            const res = await fetch(`/api/admin/blocked-dates?booking_id=${bookingId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                await fetchBlockedDates();
                if (onDatesBlocked) onDatesBlocked();
                alert('Blocked dates removed successfully');
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to remove blocked dates');
            }
        } catch (err) {
            console.error('Error removing blocked dates:', err);
            alert('Failed to remove blocked dates');
        }
    };

    return (
        <div className="space-y-4">
            {/* Add new block */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-red-400 mb-3">Block Dates (Make Apartment Unavailable)</h4>
                <p className="text-xs text-neutral-400 mb-4">
                    Set date ranges when this apartment should be unavailable
                    (maintenance, renovation, personal use, etc.)
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="flex-1 p-2 rounded border border-neutral-700 bg-black text-neutral-50"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="flex-1 p-2 rounded border border-neutral-700 bg-black text-neutral-50"
                    />
                    <input
                        type="text"
                        placeholder="Reason (e.g., Maintenance)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="flex-1 p-2 rounded border border-neutral-700 bg-black text-neutral-50 text-sm"
                    />
                    <button
                        type="button"
                        onClick={addBlockedDates}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-neutral-50 disabled:opacity-50"
                    >
                        {loading ? 'Blocking...' : 'Block Dates'}
                    </button>
                </div>
            </div>

            {/* List existing blocks */}
            {blockedDates.length > 0 && (
                <div className="space-y-2">
                    <h5 className="text-sm font-medium text-neutral-300">Currently Blocked Periods:</h5>
                    {blockedDates.map((block) => (
                        <div key={block.id} className="flex items-center justify-between p-3 bg-black rounded-lg border border-red-500/20">
                            <div className="flex-1">
                                <div className="text-sm text-neutral-200">
                                    {new Date(block.start_date).toLocaleDateString()} → {new Date(block.end_date).toLocaleDateString()}
                                </div>
                                {block.block_reason && (
                                    <div className="text-xs text-neutral-400 mt-1">
                                        Reason: {block.block_reason}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => removeBlockedDate(block.id)}
                                className="text-red-400 hover:text-red-300 p-2"
                            >
                                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};