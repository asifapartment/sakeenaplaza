export default function NotificationFilters({ filters, setFilters }) {
    const update = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const resetFilters = () => {
        setFilters({
            booking_id: "",
            user_id: "",
            type: "",
            unread: false,
            start_date: "",
            end_date: "",
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-neutral-900 p-4 rounded-xl shadow border border-neutral-700">

            <input
                type="number"
                placeholder="Booking ID"
                className="px-2 py-1 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-300"
                value={filters.booking_id}
                onChange={(e) => update("booking_id", e.target.value)}
            />

            <input
                type="number"
                placeholder="User ID"
                className="px-2 py-1 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-300"
                value={filters.user_id}
                onChange={(e) => update("user_id", e.target.value)}
            />

            <select
                className="px-2 py-1 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-300"
                value={filters.type}
                onChange={(e) => update("type", e.target.value)}
            >
                <option value="">All Types</option>
                <option value="booking">Booking</option>
                <option value="payment">Payment</option>
                <option value="feedback">Feedback</option>
                <option value="message">Message</option>
                <option value="review">Review</option>
            </select>

            <label className="flex items-center gap-2 text-white pt-2">
                <input
                    type="checkbox"
                    checked={filters.unread}
                    onChange={(e) => update("unread", e.target.checked)}
                    className="w-4 h-4 bg-neutral-900 border-neutral-700 rounded"
                />
                Unread Only
            </label>

            <input
                type="date"
                className="px-2 py-1 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-300"
                value={filters.start_date}
                onChange={(e) => update("start_date", e.target.value)}
            />

            <input
                type="date"
                className="px-2 py-1 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-300"
                value={filters.end_date}
                onChange={(e) => update("end_date", e.target.value)}
            />

            <button
                onClick={resetFilters}
                className="px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700 text-white"
            >
                Reset Filters
            </button>

        </div>
    );
}