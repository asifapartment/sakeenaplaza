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
                className="text-teal-400 w-4 h-4 mt-0.5"
            />
        );
    };

    return (
        <div className="space-y-6">
            {/* WHY BOOK WITH US */}
            <div className="bg-black rounded-2xl border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="border-b border-white/10 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-teal-400 rounded-full" />
                        <h3 className="text-lg font-semibold text-white">
                            Why Book With Us?
                        </h3>
                    </div>
                </div>

                {/* List */}
                <div className="p-6">
                    <ul className="space-y-3">
                        {displayWhyBookWithUs.map((reason, index) => (
                            <li
                                key={index}
                                className="
                                    flex items-start gap-3
                                    px-4 py-3 rounded-lg
                                    bg-white/5
                                    border border-white/10
                                    hover:bg-white/10
                                    hover:border-teal-400/30
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
            </div>

            {/* CANCELLATION POLICY */}
            <div className="bg-black rounded-2xl border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="border-b border-white/10 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-teal-400 rounded-full" />
                        <h3 className="text-lg font-semibold text-white">
                            Cancellation Policy
                        </h3>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-sm text-gray-300 leading-relaxed mb-4">
                        {displayPolicy?.cancellation ||
                            displayPolicy?.text ||
                            "Policy details not available."}
                    </p>

                    {displayPolicy?.link && (
                        <a
                            href={displayPolicy.link}
                            className="
                                inline-flex items-center gap-2
                                text-sm text-teal-400
                                hover:text-teal-300
                                transition-colors duration-200
                                group
                            "
                        >
                            <span>Read more</span>
                            <FontAwesomeIcon
                                icon={solidIcons.faArrowRight}
                                className="w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-200"
                            />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ExtraInfoSection;