export default function LoadingSpinner() {
    return (
        <div className="relative">
            <div className="w-12 h-12 border-4 border-teal-500/20 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-transparent border-t-teal-400 rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
    );
}