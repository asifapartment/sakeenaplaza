import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faIdCard,
    faCreditCard,
    faUser,
    faEnvelope,
    faBuilding,
    faRupeeSign,
    faInfoCircle,
    faMoneyCheck,
    faCalendarAlt,
    faTimes,
    faCheckCircle,
    faClock,
    faExclamationCircle,
    faBan,
    faArrowLeft,
    faCopy
} from '@fortawesome/free-solid-svg-icons';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const getStatusConfig = (status) => {
    const statusMap = {
        'success': { icon: faCheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20' },
        'pending': { icon: faClock, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' },
        'failed': { icon: faExclamationCircle, color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' },
        'refunded': { icon: faBan, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' }
    };
    return statusMap[status?.toLowerCase()] || statusMap.pending;
};

const PaymentDetailsModal = ({ payment, onClose }) => {
    if (!payment) return null;

    const statusConfig = getStatusConfig(payment.status);

    const copyToClipboard = (text) => {
        navigator.clipboard?.writeText(text);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all animate-slideUp">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-neutral-700/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-500/10 p-2 rounded-lg">
                            <FontAwesomeIcon icon={faCreditCard} className="text-indigo-400 text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-neutral-100">Payment Details</h2>
                            <p className="text-xs text-neutral-400 mt-0.5">Transaction information</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/50 w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Status Badge */}
                    <div className={`flex items-center justify-between p-4 rounded-xl border ${statusConfig.borderColor} ${statusConfig.bgColor}`}>
                        <span className="text-sm font-medium text-neutral-300">Payment Status</span>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bgColor}`}>
                            <FontAwesomeIcon icon={statusConfig.icon} className={statusConfig.color} />
                            <span className={`text-sm font-semibold capitalize ${statusConfig.color}`}>
                                {payment.status}
                            </span>
                        </div>
                    </div>

                    {/* Payment Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <DetailCard
                            icon={faIdCard}
                            label="Payment ID"
                            value={`#${payment.id}`}
                            color="blue"
                            onCopy={() => copyToClipboard(payment.id)}
                        />
                        <DetailCard
                            icon={faCreditCard}
                            label="Razorpay ID"
                            value={payment.razorpay_payment_id || 'N/A'}
                            color="purple"
                            onCopy={payment.razorpay_payment_id ? () => copyToClipboard(payment.razorpay_payment_id) : null}
                        />
                    </div>

                    {/* User Information */}
                    <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
                        <h3 className="text-sm font-semibold text-neutral-200 mb-3 flex items-center gap-2">
                            <FontAwesomeIcon icon={faUser} className="text-neutral-400 text-xs" />
                            User Information
                        </h3>
                        <div className="space-y-3">
                            <DetailItem icon={faUser} label="Name" value={payment.user_name} />
                            <DetailItem icon={faEnvelope} label="Email" value={payment.user_email} />
                            <DetailItem icon={faBuilding} label="Apartment" value={payment.apartment_title} />
                        </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
                        <h3 className="text-sm font-semibold text-neutral-200 mb-3 flex items-center gap-2">
                            <FontAwesomeIcon icon={faMoneyCheck} className="text-neutral-400 text-xs" />
                            Transaction Details
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-neutral-400 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faRupeeSign} className="text-xs" />
                                    Amount
                                </span>
                                <span className="text-lg font-semibold text-neutral-100">
                                    {formatCurrency(payment.amount)}
                                </span>
                            </div>
                            <DetailItem icon={faMoneyCheck} label="Method" value={payment.method || 'N/A'} capitalize />
                            <DetailItem icon={faCalendarAlt} label="Paid At" value={new Date(payment.paid_at).toLocaleString()} />
                        </div>
                    </div>

                    {/* Refund Information (if any) */}
                    {(payment.refund_id || payment.refund_time) && (
                        <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                            <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                                <FontAwesomeIcon icon={faBan} className="text-xs" />
                                Refund Information
                            </h3>
                            <div className="space-y-3">
                                {payment.refund_id && (
                                    <DetailItem icon={faIdCard} label="Refund ID" value={payment.refund_id} />
                                )}
                                {payment.refund_time && (
                                    <DetailItem icon={faCalendarAlt} label="Refund Time" value={new Date(payment.refund_time).toLocaleString()} />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center p-6 border-t border-neutral-700/50 bg-neutral-800/30 rounded-b-2xl">
                    <button
                        className="text-neutral-400 hover:text-neutral-200 text-sm flex items-center gap-2 transition-colors duration-200"
                        onClick={onClose}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                        Back to Payments
                    </button>
                    <button
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center gap-2"
                        onClick={onClose}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ icon, label, value, capitalize = false }) => (
    <div className="flex items-start justify-between group">
        <span className="text-neutral-400 flex items-center gap-2 text-sm">
            <FontAwesomeIcon icon={icon} className="text-xs text-neutral-500" />
            {label}
        </span>
        <span className={`text-neutral-200 text-sm font-medium text-right ${capitalize ? 'capitalize' : ''}`}>
            {value}
        </span>
    </div>
);

const DetailCard = ({ icon, label, value, color = 'blue', onCopy }) => {
    const colorClasses = {
        blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
        purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
        green: 'from-green-500/10 to-green-500/5 border-green-500/20',
        orange: 'from-orange-500/10 to-orange-500/5 border-orange-500/20'
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} p-3 rounded-xl border relative group`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs text-neutral-400 mb-1">{label}</p>
                    <p className="text-sm font-medium text-neutral-200 break-all">{value}</p>
                </div>
                <div className="bg-neutral-700/30 p-2 rounded-lg">
                    <FontAwesomeIcon icon={icon} className={`text-${color}-400 text-sm`} />
                </div>
            </div>
            {onCopy && value !== 'N/A' && (
                <button
                    onClick={() => onCopy()}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-neutral-400 hover:text-neutral-200"
                    title="Copy to clipboard"
                >
                    <FontAwesomeIcon icon={faCopy} className="text-xs" />
                </button>
            )}
        </div>
    );
};

// Add these styles to your global CSS or component
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
  
  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(75, 85, 99, 0.1);
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(107, 114, 128, 0.5);
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(107, 114, 128, 0.7);
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default PaymentDetailsModal;