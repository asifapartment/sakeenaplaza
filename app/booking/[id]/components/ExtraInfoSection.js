'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';

function ExtraInfoSection({ whyBookWithUs = [], policy = {} }) {
    const defaultWhyBookWithUs = [
        { icon: "faHeadset", text: "24/7 Customer Support" },
        { icon: "faTag", text: "Best Price Guarantee" },
        { icon: "faShieldHalved", text: "Verified Property" }
    ];

    const defaultPolicy = {
        text: "Free cancellation up to 48 hours before check-in.",
        link: "/cancellation-policy"
    };

    const displayWhyBookWithUs =
        Array.isArray(whyBookWithUs) && whyBookWithUs.length > 0
            ? whyBookWithUs
            : defaultWhyBookWithUs;

    const displayPolicy =
        policy && typeof policy === "object" && Object.keys(policy).length > 0
            ? policy
            : defaultPolicy;

    const renderIcon = (iconName) => {
        const icon =
            typeof iconName === "string" && solidIcons[iconName]
                ? solidIcons[iconName]
                : solidIcons.faCheckCircle;

        return (
            <FontAwesomeIcon
                icon={icon}
                className="text-teal-400 text-sm mt-0.5"
            />
        );
    };

    return (
        <div className="space-y-6">
            {/* WHY BOOK WITH US */}
            <div
                className="
                    relative overflow-hidden rounded-2xl p-6
                    bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800
                    border border-white/10
                    shadow-xl shadow-black/40
                "
            >
                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

                {/* Header */}
                <div className="relative flex items-center gap-3 mb-4">
                    <div className="h-9 w-1 rounded-full bg-gradient-to-b from-teal-400 to-emerald-500" />
                    <h3 className="text-lg font-semibold text-white tracking-wide">
                        Why Book With Us?
                    </h3>
                </div>

                {/* List */}
                <ul className="relative space-y-3">
                    {displayWhyBookWithUs.map((reason, index) => (
                        <li
                            key={index}
                            className="
                                flex items-start gap-3
                                rounded-xl px-4 py-3
                                bg-neutral-800/40
                                border border-white/5
                                hover:bg-neutral-800/60
                                hover:border-white/10
                                transition-all duration-200
                            "
                        >
                            {renderIcon(reason?.icon)}
                            <span className="text-sm text-gray-300 leading-relaxed">
                                {reason?.text || "Benefit available"}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* CANCELLATION POLICY */}
            <div
                className="
                    relative overflow-hidden rounded-2xl p-6
                    bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800
                    border border-white/10
                    shadow-xl shadow-black/40
                "
            >
                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-teal-500/5 pointer-events-none" />

                {/* Header */}
                <div className="relative flex items-center gap-3 mb-3">
                    <div className="h-9 w-1 rounded-full bg-gradient-to-b from-indigo-400 to-purple-500" />
                    <h3 className="text-lg font-semibold text-white tracking-wide">
                        Cancellation Policy
                    </h3>
                </div>

                <p className="relative text-sm text-gray-300 leading-relaxed">
                    {displayPolicy?.cancellation ||
                        displayPolicy?.text ||
                        "Policy details not available."}
                </p>

                {displayPolicy?.link && (
                    <a
                        href={displayPolicy.link}
                        className="
                            inline-flex items-center gap-1 mt-3
                            text-sm text-teal-400
                            hover:text-teal-300
                            hover:underline
                        "
                    >
                        Read more
                        <FontAwesomeIcon icon={solidIcons.faArrowRight} />
                    </a>
                )}
            </div>
        </div>
    );
}

export default ExtraInfoSection;
