"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrash,
    faCheckCircle,
    faInbox,
    faBell,
    faMoneyBill,
    faMessage,
    faStar,
    faInfoCircle,
    faCommentDots,
    faClock,
    faChevronRight,
    faEllipsisVertical,
    faXmark
} from "@fortawesome/free-solid-svg-icons";
import TimeAgo from "react-timeago";
import { serverToClientTime } from "@/lib/TimeCoverter";

export default function NotificationItem({ item, refresh }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showActions, setShowActions] = useState(false);

    const iconMap = {
        booking: faBell,
        payment: faMoneyBill,
        feedback: faCommentDots,
        review: faStar,
        message: faMessage,
        system: faInfoCircle,
        default: faInbox,
    };

    const markAsRead = async () => {
        await fetch(`/api/admin/notifications/read?id=${item.id}`, {
            method: "PUT",
        });
        refresh();
    };

    const handleDelete = async () => {
        await fetch(`/api/admin/notifications/delete?id=${item.id}`, {
            method: "DELETE",
        });
        setShowDeleteModal(false);
        refresh();
    };

    const formatTime = (date) => {
        const now = new Date();
        const diffMs = now - new Date(date);
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays === 1) {
            return "Yesterday";
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        }
        return new Date(date).toLocaleDateString();
    };

    const getTypeStyle = () => {
        const base = "px-2.5 py-1 rounded-md text-xs font-medium border ";
        if (item.is_read) {
            return base + "bg-neutral-800 text-neutral-300 border-neutral-700";
        }
        return base + "bg-neutral-900 text-neutral-100 border-neutral-600";
    };

    return (
        <>
            <DeleteModal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
            />

            <div
                className={`group relative flex items-start justify-between p-5 rounded-xl
                    border transition-all duration-200
                    ${item.is_read
                        ? "border-neutral-800 bg-neutral-900/50"
                        : "border-neutral-700 bg-neutral-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                    }
                    hover:bg-neutral-900 hover:border-neutral-600
                `}
            >
                {/* Unread indicator */}
                {!item.is_read && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-neutral-100" />
                )}

                <div className="flex gap-4 items-start w-full pl-2">
                    {/* Icon */}
                    <div className={`
                        w-10 h-10 flex items-center justify-center rounded-lg
                        ${item.is_read
                            ? "bg-neutral-800 border-neutral-700"
                            : "bg-neutral-900 border-neutral-600"
                        }
                        border
                    `}>
                        <FontAwesomeIcon
                            icon={iconMap[item.type] || iconMap.default}
                            className={`text-lg ${item.is_read ? "text-neutral-400" : "text-neutral-200"}`}
                        />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3 className="font-medium text-neutral-100 text-base flex items-center gap-2 mb-1">
                                    {item.title}
                                    {!item.is_read && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">
                                            NEW
                                        </span>
                                    )}
                                </h3>
                                <p className="text-neutral-400 text-sm">
                                    {item.content}
                                </p>
                            </div>

                            {/* Actions dropdown trigger */}
                            <button
                                onClick={() => setShowActions(!showActions)}
                                className="p-1.5 rounded hover:bg-neutral-800 transition"
                            >
                                <FontAwesomeIcon
                                    icon={faEllipsisVertical}
                                    className="text-neutral-400 text-sm"
                                />
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-800">
                            <div className="flex items-center gap-3">
                                <span className={getTypeStyle()}>
                                    {item.type.toUpperCase()}
                                </span>

                                <div className="flex items-center gap-1 text-xs text-neutral-500">
                                    <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                                    <span><TimeAgo date={serverToClientTime(item.created_at)}/></span>
                                </div>
                            </div>

                            {/* Desktop action buttons */}
                            <div className={`flex items-center gap-2 ${showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                {!item.is_read && (
                                    <button
                                        onClick={markAsRead}
                                        className="
                                            flex items-center gap-2 px-3 py-1.5 rounded text-xs
                                            bg-neutral-800 text-neutral-200 border border-neutral-700
                                            hover:bg-neutral-700 hover:border-neutral-600
                                            transition-colors
                                        "
                                    >
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                        Mark Read
                                    </button>
                                )}

                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="
                                        flex items-center gap-2 px-3 py-1.5 rounded text-xs
                                        bg-neutral-800 text-neutral-200 border border-neutral-700
                                        hover:bg-neutral-700 hover:border-neutral-600
                                        transition-colors
                                    "
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile dropdown actions */}
                {showActions && (
                    <div className="absolute right-3 top-12 mt-1 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-10">
                        <div className="p-1.5">
                            {!item.is_read && (
                                <button
                                    onClick={() => {
                                        markAsRead();
                                        setShowActions(false);
                                    }}
                                    className="w-full text-left px-3 py-2.5 rounded hover:bg-neutral-800 text-sm text-neutral-200 flex items-center gap-3"
                                >
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-neutral-300" />
                                    Mark as Read
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setShowDeleteModal(true);
                                    setShowActions(false);
                                }}
                                className="w-full text-left px-3 py-2.5 rounded hover:bg-neutral-800 text-sm text-neutral-200 flex items-center gap-3"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

/* Minimal Dark Modal Component */
function DeleteModal({ open, onClose, onConfirm }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-neutral-950/90"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-md shadow-2xl">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                    <h2 className="font-medium text-neutral-100">
                        Delete notification
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded hover:bg-neutral-800 transition"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-neutral-400" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-4 border-b border-neutral-800">
                    <p className="text-neutral-400 text-sm">
                        Are you sure you want to delete this notification? This action cannot be undone.
                    </p>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-2 p-4">
                    <button
                        onClick={onClose}
                        className="
                            px-4 py-2 rounded text-sm
                            bg-neutral-800 text-neutral-200 border border-neutral-700
                            hover:bg-neutral-700 hover:border-neutral-600
                            transition-colors
                        "
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="
                            px-4 py-2 rounded text-sm
                            bg-neutral-900 text-neutral-100 border border-neutral-800
                            hover:bg-neutral-800 hover:border-neutral-700
                            transition-colors
                        "
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}