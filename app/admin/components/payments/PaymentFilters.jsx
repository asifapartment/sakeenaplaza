import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSync, faFileExport, faFilter, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const PaymentFilters = ({ filters, setFilters, loading, exportLoading, onRefresh, onExport }) => {
    return (
        <div className="bg-black border border-neutral-800 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left side: Search and filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            <FontAwesomeIcon icon={faSearch} className="text-neutral-400 w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by user, apartment, or payment ID..."
                            className="w-full bg-black border-2 border-neutral-700 hover:border-neutral-600 focus:border-amber-500 rounded-xl pl-12 pr-4 py-3 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all duration-200"
                            value={filters.search}
                            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                        />
                        {filters.search && (
                            <button
                                onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                                aria-label="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <FontAwesomeIcon icon={faFilter} className="text-neutral-400 w-3.5 h-3.5" />
                        </div>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                            className="bg-black border-2 border-neutral-700 hover:border-neutral-600 focus:border-amber-500 rounded-xl pl-10 pr-8 py-3 text-neutral-100 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all duration-200 cursor-pointer"
                        >
                            <option value="all" className="bg-black">All Status</option>
                            <option value="paid" className="bg-black">Paid</option>
                            <option value="pending" className="bg-black">Pending</option>
                            <option value="failed" className="bg-black">Failed</option>
                            <option value="refunded" className="bg-black">Refunded</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Right side: Date filters and action buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Date Range */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-neutral-400 w-4 h-4" />
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <div className="relative">
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                                    className="bg-black border-2 border-neutral-700 hover:border-neutral-600 focus:border-amber-500 rounded-xl px-4 py-2.5 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all duration-200 min-w-[140px]"
                                    max={filters.endDate || ''}
                                />
                                <label className="absolute -top-2 left-2 px-1 text-xs text-neutral-400 bg-neutral-900">
                                    From
                                </label>
                            </div>
                            <span className="text-neutral-500 hidden sm:block">→</span>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                                    className="bg-black border-2 border-neutral-700 hover:border-neutral-600 focus:border-amber-500 rounded-xl px-4 py-2.5 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all duration-200 min-w-[140px]"
                                    min={filters.startDate || ''}
                                />
                                <label className="absolute -top-2 left-2 px-1 text-xs text-neutral-400 bg-neutral-900">
                                    To
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onRefresh}
                            disabled={loading}
                            className="group relative bg-black hover:bg-neutral-700 text-neutral-100 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-neutral-700 hover:border-neutral-600"
                        >
                            <div className="relative">
                                <FontAwesomeIcon
                                    icon={faSync}
                                    className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}
                                />
                            </div>
                            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                            {!loading && (
                                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-neutral-600 transition-all duration-200"></div>
                            )}
                        </button>

                        <button
                            onClick={onExport}
                            disabled={exportLoading || loading}
                            className="group relative bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-amber-500/30"
                        >
                            <FontAwesomeIcon
                                icon={faFileExport}
                                className={`w-4 h-4 ${exportLoading ? 'animate-spin' : ''}`}
                            />
                            <span>{exportLoading ? 'Exporting...' : 'Export CSV'}</span>
                            <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-amber-500/50 transition-all duration-200"></div>
                        </button>

                        {/* Reset Filters Button (optional) */}
                        {(filters.search || filters.status !== 'all' || filters.startDate || filters.endDate) && (
                            <button
                                onClick={() => setFilters({
                                    search: '',
                                    status: 'all',
                                    startDate: '',
                                    endDate: ''
                                })}
                                className="text-sm text-neutral-400 hover:text-neutral-200 px-3 py-2 hover:bg-black/50 rounded-lg transition-colors"
                                title="Clear all filters"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Active Filters Indicator */}
            {(filters.search || filters.status !== 'all' || filters.startDate || filters.endDate) && (
                <div className="mt-4 pt-4 border-t border-neutral-800">
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <span>Active filters:</span>
                        <div className="flex flex-wrap gap-2">
                            {filters.search && (
                                <span className="inline-flex items-center gap-1 bg-black px-3 py-1 rounded-lg">
                                    <span className="text-amber-400">Search:</span> "{filters.search}"
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                                        className="text-neutral-500 hover:text-neutral-300 ml-1"
                                        aria-label="Remove search filter"
                                    >
                                        ✕
                                    </button>
                                </span>
                            )}
                            {filters.status !== 'all' && (
                                <span className="inline-flex items-center gap-1 bg-black px-3 py-1 rounded-lg">
                                    <span className="text-amber-400">Status:</span> {filters.status}
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                                        className="text-neutral-500 hover:text-neutral-300 ml-1"
                                        aria-label="Remove status filter"
                                    >
                                        ✕
                                    </button>
                                </span>
                            )}
                            {filters.startDate && (
                                <span className="inline-flex items-center gap-1 bg-black px-3 py-1 rounded-lg">
                                    <span className="text-amber-400">From:</span> {filters.startDate}
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, startDate: '' }))}
                                        className="text-neutral-500 hover:text-neutral-300 ml-1"
                                        aria-label="Remove start date filter"
                                    >
                                        ✕
                                    </button>
                                </span>
                            )}
                            {filters.endDate && (
                                <span className="inline-flex items-center gap-1 bg-black px-3 py-1 rounded-lg">
                                    <span className="text-amber-400">To:</span> {filters.endDate}
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, endDate: '' }))}
                                        className="text-neutral-500 hover:text-neutral-300 ml-1"
                                        aria-label="Remove end date filter"
                                    >
                                        ✕
                                    </button>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentFilters;