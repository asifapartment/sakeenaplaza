'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';

function HouseRulesSection({
    rules = [],
    title = "House Rules",
    iconColor = "text-teal-400",
    className = ""
}) {
    const defaultRules = [
        { text: "Check-in: After 2:00 PM", icon: "faClock" },
        { text: "Check-out: Before 11:00 AM", icon: "faClock" },
        { text: "No smoking inside the apartment", icon: "faSmoking" },
        { text: "No pets allowed", icon: "faPaw" },
        { text: "No parties or events", icon: "faMusic" }
    ];

    const displayRules = rules.length > 0 ? rules : defaultRules;

    return (
        <div
            className={`
                relative overflow-hidden rounded-2xl p-6
                bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800
                border border-white/10
                shadow-xl shadow-black/40
                ${className}
            `}
        >
            {/* Decorative gradient glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center gap-3 mb-5">
                <div className="h-9 w-1 rounded-full bg-gradient-to-b from-teal-400 to-emerald-500" />
                <h2 className="text-xl font-semibold tracking-wide text-white">
                    {title}
                </h2>
            </div>

            {/* Rules */}
            <ul className="relative space-y-4">
                {displayRules.map((rule, index) => {
                    const iconName =
                        typeof rule === "string" ? "faCheck" : rule.icon || "faCheck";
                    const icon = solidIcons[iconName];

                    return (
                        <li
                            key={index}
                            className="
                                flex items-start gap-3
                                rounded-xl px-4 py-3
                                bg-neutral-800/40
                                border border-white/5
                                hover:border-white/10
                                hover:bg-neutral-800/60
                                transition-all duration-200
                            "
                        >
                            <span className="mt-0.5 flex-shrink-0">
                                {icon ? (
                                    <FontAwesomeIcon
                                        icon={icon}
                                        className={`${iconColor} text-sm`}
                                    />
                                ) : (
                                    <span className={`${iconColor}`}>•</span>
                                )}
                            </span>

                            <span className="text-sm text-gray-300 leading-relaxed">
                                {typeof rule === "string" ? rule : rule.text || ""}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default HouseRulesSection;
