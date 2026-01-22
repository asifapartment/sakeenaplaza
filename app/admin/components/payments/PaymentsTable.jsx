import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faCheckCircle, faCreditCard, faEye, faIndianRupeeSign, faPercent, faReceipt, faTimes, faUndo } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

export default function PaymentsTable({ payments, loading, filters, onViewDetails, onRefund }) {
    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [refundType, setRefundType] = useState('percentage');
    const [refundValue, setRefundValue] = useState('');
    const [refundLoading, setRefundLoading] = useState(false);
    const [refundError, setRefundError] = useState('');

    const openRefundModal = (payment) => {
        setSelectedPayment(payment);
        setRefundValue('');
        setRefundType('percentage');
        setRefundError('');
        setRefundModalOpen(true);
    };

    const closeRefundModal = () => {
        setRefundModalOpen(false);
        setSelectedPayment(null);
        setRefundValue('');
        setRefundError('');
    };

    const calculateRefundAmount = () => {
        if (!selectedPayment || !refundValue) return 0;

        const originalAmount = parseFloat(selectedPayment.amount);
        let refundAmount = 0;

        if (refundType === 'percentage') {
            const percentage = parseFloat(refundValue);
            if (percentage > 100) return originalAmount;
            refundAmount = (originalAmount * percentage) / 100;
        } else {
            const customAmount = parseFloat(refundValue);
            refundAmount = Math.min(customAmount, originalAmount);
        }

        return Math.round(refundAmount * 100) / 100; // Round to 2 decimal places
    };

    const calculatePlatformFee = (refundAmount) => {
        // Platform fee: 10% of refund amount (you can adjust this)
        return Math.round(refundAmount * 0.1 * 100) / 100;
    };

    const calculateTotalBalance = () => {
        if (!selectedPayment) return 0;

        const originalAmount = parseFloat(selectedPayment.amount);
        const refundAmount = calculateRefundAmount();
        const platformFee = calculatePlatformFee(refundAmount);

        // Original amount minus refund amount plus platform fee (you keep the fee)
        return Math.round((originalAmount - refundAmount + platformFee) * 100) / 100;
    };

    const handleRefundSubmit = async () => {
        if (!refundValue || parseFloat(refundValue) <= 0) {
            setRefundError('Please enter a valid refund amount');
            return;
        }

        if (refundType === 'percentage' && parseFloat(refundValue) > 100) {
            setRefundError('Percentage cannot exceed 100%');
            return;
        }

        const refundAmount = calculateRefundAmount();
        if (refundAmount <= 0) {
            setRefundError('Refund amount must be greater than 0');
            return;
        }

        setRefundLoading(true);
        setRefundError('');

        try {
            const refundData = {
                paymentId: selectedPayment.id,
                bookingId: selectedPayment.booking_id,
                refundAmount,
            };

            await onRefund(refundData);
            closeRefundModal();
        } catch (error) {
            setRefundError(error.message || 'Failed to process refund');
        } finally {
            setRefundLoading(false);
        }
    };

    return (
        <>
            <div className="bg-neutral-900 rounded-xl shadow-lg border border-neutral-800 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                    <table className="min-w-[768px] w-full text-left border-separate border-spacing-0 text-neutral-100">
                        <thead className="bg-neutral-800/95 backdrop-blur-sm sticky top-0 z-20">
                            <tr>
                                <th className="p-4 font-semibold text-neutral-300 text-sm uppercase tracking-wider border-b border-neutral-700 first:rounded-tl-xl">ID</th>
                                <th className="p-4 font-semibold text-neutral-300 text-sm uppercase tracking-wider border-b border-neutral-700">User</th>
                                <th className="p-4 font-semibold text-neutral-300 text-sm uppercase tracking-wider border-b border-neutral-700">Apartment</th>
                                <th className="p-4 font-semibold text-neutral-300 text-sm uppercase tracking-wider border-b border-neutral-700">Amount</th>
                                <th className="p-4 font-semibold text-neutral-300 text-sm uppercase tracking-wider border-b border-neutral-700">Refunded Amount</th>
                                <th className="p-4 font-semibold text-neutral-300 text-sm uppercase tracking-wider border-b border-neutral-700">Total</th>
                                <th className="p-4 font-semibold text-neutral-300 text-sm uppercase tracking-wider border-b border-neutral-700">Status</th>
                                <th className="p-4 font-semibold text-neutral-300 text-sm uppercase tracking-wider border-b border-neutral-700">Date</th>
                                <th className="p-4 font-semibold text-neutral-300 text-sm uppercase tracking-wider border-b border-neutral-700 last:rounded-tr-xl">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center p-8">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="w-10 h-10 border-3 border-neutral-700 border-t-amber-500 rounded-full animate-spin"></div>
                                            <div className="text-neutral-400 text-sm">Loading payments...</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : payments.length ? (
                                payments.map((payment, index) => (
                                    <tr
                                        key={payment.id}
                                        className="group hover:bg-neutral-800/50 transition-all duration-200"
                                    >
                                        <td className={`p-4 font-medium border-b border-neutral-800 group-last:border-b-0 ${index === 0 ? 'pt-5' : ''}`}>
                                            <span className="font-mono text-neutral-400">#{payment.id}</span>
                                        </td>
                                        <td className="p-4 border-b border-neutral-800 group-last:border-b-0">
                                            <div className="flex flex-col">
                                                <div className="font-medium text-neutral-100">{payment.user_name}</div>
                                                {payment.user_email && (
                                                    <div className="text-xs text-neutral-400 mt-0.5">{payment.user_email}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 border-b border-neutral-800 group-last:border-b-0">
                                            <div className="text-neutral-100 max-w-[200px] truncate" title={payment.apartment_title}>
                                                {payment.apartment_title}
                                            </div>
                                        </td>
                                        <td className="p-4 border-b border-neutral-800 group-last:border-b-0">
                                            <div className="font-semibold flex justify-center items-center">
                                                {formatCurrency(payment.total_amount)}
                                            </div>
                                        </td>
                                        <td className="p-4 border-b border-neutral-800 group-last:border-b-0">
                                            <div className="font-semibold text-red-400 flex justify-center items-center">
                                                {formatCurrency(payment.refunded ?? 0)}
                                                {payment.refunded > 0 && (
                                                    <FontAwesomeIcon className="ml-4" icon={faArrowDown} />
                                                )}
                                            </div>

                                        </td>
                                        <td className="p-4 border-b border-neutral-800 group-last:border-b-0">
                                            <div className="font-semibold text-green-400">
                                                {formatCurrency(payment.amount)}
                                                {/* <FontAwesomeIcon className='ml-10' icon={faArrowUp} /> */}
                                            </div>
                                        </td>
                                        <td className="p-4 border-b border-neutral-800 group-last:border-b-0">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${payment.status === 'paid'
                                                    ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                                                    : payment.status === 'pending'
                                                        ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                                                            : 'bg-red-500/15 text-red-400 border border-red-500/30'
                                                    }`}
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full mr-2 bg-current opacity-80"></span>
                                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-neutral-300 border-b border-neutral-800 group-last:border-b-0">
                                            <div className="text-sm">{formatDate(payment.paid_at)}</div>
                                        </td>
                                        <td className="p-4 border-b border-neutral-800 group-last:border-b-0">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => onViewDetails({ open: true, payment })}
                                                    className="bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg text-sm flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-all duration-200 group/btn border border-neutral-700 hover:border-neutral-600"
                                                >
                                                    <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                                                    <span>View</span>
                                                </button>

                                                {payment.status === 'paid' && (
                                                    <button
                                                        onClick={() => openRefundModal(payment)}
                                                        className="bg-amber-600/10 hover:bg-amber-600/20 px-3 py-1.5 rounded-lg text-sm flex items-center space-x-2 text-amber-400 hover:text-amber-300 transition-all duration-200 group/btn border border-amber-600/30 hover:border-amber-500/50"
                                                    >
                                                        <FontAwesomeIcon icon={faUndo} className="w-4 h-4" />
                                                        <span>Refund</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center p-8">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                                                <FontAwesomeIcon icon={faReceipt} className="w-5 h-5 text-neutral-400" />
                                            </div>
                                            <div className="text-neutral-400">
                                                {filters.search ? 'No payments match your search.' : 'No payments found.'}
                                            </div>
                                            {filters.search && (
                                                <button
                                                    onClick={() => filters.setSearch('')}
                                                    className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                                                >
                                                    Clear search
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Refund Modal */}
            {refundModalOpen && selectedPayment && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-neutral-900 rounded-2xl border border-neutral-800 w-full max-w-md shadow-2xl animate-slideUp">
                        <div className="p-6">

                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Process Refund</h3>
                                    <p className="text-sm text-neutral-400 mt-1">
                                        Issue refund for payment #{selectedPayment.id}
                                    </p>
                                </div>
                                <button
                                    onClick={closeRefundModal}
                                    className="text-neutral-400 hover:text-white p-2 hover:bg-neutral-800 rounded-lg transition"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>

                            <div className="space-y-6">

                                {/* Payment Info */}
                                <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700">
                                    <h4 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center">
                                        <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                                        Payment Details
                                    </h4>

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <span className="text-neutral-400">Payment ID:</span>
                                        <span className="text-white font-mono">#{selectedPayment.id}</span>

                                        <span className="text-neutral-400">User:</span>
                                        <span className="text-white">{selectedPayment.user_name}</span>

                                        <span className="text-neutral-400">Original Amount:</span>
                                        <span className="text-green-400 font-semibold">
                                            {formatCurrency(selectedPayment.amount)}
                                        </span>
                                    </div>
                                </div>

                                {/* Refund Type */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-neutral-300">
                                        Refund Type
                                    </label>

                                    <div className="grid grid-cols-2 gap-3">
                                        <label
                                            className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition
                  ${refundType === 'percentage'
                                                    ? 'border-amber-500 bg-amber-500/10'
                                                    : 'border-neutral-700 hover:border-neutral-600'}`}
                                        >
                                            <input
                                                type="radio"
                                                checked={refundType === 'percentage'}
                                                onChange={() => setRefundType('percentage')}
                                                className="sr-only"
                                            />
                                            <FontAwesomeIcon icon={faPercent} className="mr-3 text-amber-400" />
                                            <span className="text-neutral-300">Percentage</span>
                                        </label>

                                        <label
                                            className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition
                  ${refundType === 'custom'
                                                    ? 'border-amber-500 bg-amber-500/10'
                                                    : 'border-neutral-700 hover:border-neutral-600'}`}
                                        >
                                            <input
                                                type="radio"
                                                checked={refundType === 'custom'}
                                                onChange={() => setRefundType('custom')}
                                                className="sr-only"
                                            />
                                            <FontAwesomeIcon icon={faIndianRupeeSign} className="mr-3 text-amber-400" />
                                            <span className="text-neutral-300">Custom Amount</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Refund Input */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-neutral-300">
                                        {refundType === 'percentage' ? 'Refund Percentage' : 'Refund Amount'}
                                    </label>

                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={refundValue}
                                            onChange={(e) => setRefundValue(e.target.value)}
                                            min="0"
                                            max={refundType === 'percentage' ? 100 : selectedPayment.amount}
                                            step={refundType === 'percentage' ? 1 : '0.01'}
                                            className="w-full bg-neutral-800 border-2 border-neutral-700 rounded-xl px-4 py-3 pl-12 text-white focus:border-amber-500"
                                        />
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                                            <FontAwesomeIcon icon={refundType === 'percentage' ? faPercent : faIndianRupeeSign} />
                                        </span>
                                    </div>
                                </div>

                                {/* Refund Summary */}
                                {refundValue > 0 && (
                                    <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700 space-y-3">
                                        <h4 className="text-sm font-semibold text-neutral-300 flex items-center">
                                            <FontAwesomeIcon icon={faReceipt} className="mr-2" />
                                            Refund Summary
                                        </h4>

                                        <div className="flex justify-between">
                                            <span className="text-neutral-400">Refund Amount</span>
                                            <span className="text-white font-semibold">
                                                {formatCurrency(calculateRefundAmount())}
                                            </span>
                                        </div>

                                        <div className="flex justify-between pt-3 border-t border-neutral-700">
                                            <span className="text-neutral-300 font-medium">User Receives</span>
                                            <span className="text-green-400 font-bold">
                                                {formatCurrency(calculateRefundAmount())}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Error */}
                                {refundError && (
                                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-start space-x-3 text-sm">
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="mt-0.5" />
                                        <span>{refundError}</span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex justify-end space-x-3 pt-2">
                                    <button
                                        onClick={closeRefundModal}
                                        disabled={refundLoading}
                                        className="flex items-center px-4 py-2 text-neutral-300 hover:text-white"
                                    >
                                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleRefundSubmit}
                                        disabled={refundLoading || !refundValue}
                                        className="flex items-center bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-5 py-2 rounded-xl font-semibold shadow-lg"
                                    >
                                        {refundLoading ? (
                                            <>
                                                <span className="animate-spin mr-2">⏳</span>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                                                Confirm Refund
                                            </>
                                        )}
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}


        </>
    );
}