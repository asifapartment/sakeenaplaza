'use client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

export default function FilterPills({ filters, activeFilter, onFilterChange }) {
    const getFilterColor = (filterId) => {
        if (filterId === activeFilter) {
            return "bg-gradient-to-r from-teal-600 to-teal-500 text-white border-teal-500/50 shadow-lg shadow-teal-500/20";
        }
        return "bg-neutral-800/60 text-neutral-300 border-neutral-700/50 hover:bg-neutral-700/60 hover:border-teal-500/30";
    };

    return (
        <div className="flex flex-wrap gap-2 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/60 border border-neutral-700/50 rounded-xl text-neutral-400 text-sm">
                <FontAwesomeIcon icon={faFilter} className="text-xs" />
                <span className="font-medium">Filter:</span>
            </div>
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => onFilterChange(filter.id)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-300 flex items-center gap-2 ${getFilterColor(filter.id)}`}
                >
                    {filter.label}
                    {activeFilter === filter.id && (
                        <span className="ml-1 w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    )}
                </button>
            ))}
        </div>
    );
}