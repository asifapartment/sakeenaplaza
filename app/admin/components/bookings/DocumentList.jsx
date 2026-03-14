import React from "react";

export default function DocumentList({
    isOpen,
    onClose,
    userDocuments,
    selectedBooking,
    selectedDocumentId,
    handleDocumentSelect,
    getDocumentDisplayInfo,
    getThumbnailUrl,
    getDocumentTypeLabel
}) {

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

            {/* Modal */}
            <div className="bg-neutral-900 w-[700px] max-h-[80vh] rounded-xl p-6 overflow-y-auto border border-neutral-700">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">
                        Select Document
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* Document list */}
                <div className="space-y-3">
                    {userDocuments.map((doc) => {

                        const { idNumber, bookingContext, isTempDocument } =
                            getDocumentDisplayInfo(doc);

                        const thumbnailUrl = getThumbnailUrl(doc.document_data);

                        const isLinkedToBooking =
                            selectedBooking &&
                            doc.booking_id &&
                            Number(doc.booking_id) === Number(selectedBooking);

                        return (
                            <div
                                key={doc.id}
                                onClick={() => {
                                    handleDocumentSelect(doc);
                                }}
                                className={`flex items-center p-4 rounded-lg border transition-all cursor-pointer hover:bg-neutral-800/50 ${isLinkedToBooking
                                        ? "border-green-500 bg-green-500/10"
                                        : selectedDocumentId === doc.id
                                            ? "border-blue-500 bg-blue-500/10"
                                            : isTempDocument
                                                ? "border-purple-500/30 bg-purple-500/5"
                                                : "border-neutral-700"
                                    }`}
                            >
                                {/* Thumbnail */}
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
                                    {thumbnailUrl ? (
                                        <img
                                            src={thumbnailUrl}
                                            alt="document"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs">
                                            No Preview
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="ml-4 flex-1">
                                    <h4 className="text-md font-medium text-neutral-200 flex items-center gap-2">
                                        {getDocumentTypeLabel(doc.document_type)}

                                        {isLinkedToBooking && (
                                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                                Linked to this booking
                                            </span>
                                        )}

                                        {isTempDocument && (
                                            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                                                New Booking
                                            </span>
                                        )}
                                    </h4>

                                    {idNumber && (
                                        <p className="text-sm text-neutral-400">
                                            ID: {idNumber}
                                        </p>
                                    )}

                                    {bookingContext && (
                                        <p className="text-xs text-neutral-500">
                                            {bookingContext}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}