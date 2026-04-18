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
                bg-black rounded-2xl border border-white/10 overflow-hidden
                ${className}
            `}
        >
            {/* Header */}
            <div className="border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-teal-400 rounded-full" />
                    <h2 className="text-xl font-semibold text-white">
                        {title}
                    </h2>
                </div>
            </div>

            {/* Rules List */}
            <div className="p-6">
                <ul className="space-y-3">
                    {displayRules.map((rule, index) => {
                        const iconName =
                            typeof rule === "string" ? "faCheck" : rule.icon || "faCheck";
                        const icon = solidIcons[iconName];

                        return (
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
                                <span className="mt-0.5 flex-shrink-0">
                                    {icon ? (
                                        <FontAwesomeIcon
                                            icon={icon}
                                            className={`${iconColor} w-4 h-4`}
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
        </div>
    );
}

export default HouseRulesSection;