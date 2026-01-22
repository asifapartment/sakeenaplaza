'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';

function FeaturesSection({ apartment }) {
    const defaultFeatures = [
        { icon: "faSnowflake", text: "Air Conditioning" },
        { icon: "faFire", text: "Heating" },
        { icon: "faUtensils", text: "Kitchen" },
        { icon: "faTv", text: "TV" },
        { icon: "faSoap", text: "Washing Machine" },
        { icon: "faCar", text: "Free Parking" }
    ];

    const defaultWhatsInclude = [
        { icon: "faWifi", text: "Free WiFi" },
        { icon: "faCar", text: "Parking" },
        { icon: "faUtensils", text: "Kitchen" },
        { icon: "faUsers", text: "Max 4 Guests" }
    ];

    const displayFeatures =
        Array.isArray(apartment?.features) && apartment.features.length > 0
            ? apartment.features
            : defaultFeatures;

    const displayWhatsInclude =
        Array.isArray(apartment?.whatsInclude) && apartment.whatsInclude.length > 0
            ? apartment.whatsInclude
            : defaultWhatsInclude;

    const renderIcon = (iconName) => {
        const icon =
            typeof iconName === "string" && solidIcons[iconName]
                ? solidIcons[iconName]
                : solidIcons.faCheckCircle;

        return (
            <FontAwesomeIcon
                icon={icon}
                className="text-teal-400"
            />
        );
    };

    return (
        <div className="space-y-8">
            {/* FEATURES & AMENITIES */}
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
                <div className="relative flex items-center gap-3 mb-5">
                    <div className="h-9 w-1 rounded-full bg-gradient-to-b from-teal-400 to-emerald-500" />
                    <h2 className="text-xl font-semibold text-white tracking-wide">
                        Features & Amenities
                    </h2>
                </div>

                <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayFeatures.map((feature, i) => (
                        <div
                            key={i}
                            className="
                                flex items-center gap-4
                                rounded-xl px-4 py-3
                                bg-neutral-800/40
                                border border-white/5
                                hover:bg-neutral-800/60
                                hover:border-white/10
                                transition-all duration-200
                            "
                        >
                            <span className="text-lg">
                                {renderIcon(feature.icon)}
                            </span>
                            <span className="text-sm text-gray-300">
                                {feature.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* WHAT'S INCLUDED */}
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
                <div className="relative flex items-center gap-3 mb-5">
                    <div className="h-9 w-1 rounded-full bg-gradient-to-b from-indigo-400 to-purple-500" />
                    <h2 className="text-xl font-semibold text-white tracking-wide">
                        What&apos;s Included
                    </h2>
                </div>

                <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {displayWhatsInclude.map((item, index) => (
                        <div
                            key={index}
                            className="
                                flex flex-col items-center text-center
                                rounded-xl px-3 py-4
                                bg-neutral-800/40
                                border border-white/5
                                hover:bg-neutral-800/60
                                hover:border-white/10
                                transition-all duration-200
                            "
                        >
                            <span className="text-2xl mb-2">
                                {renderIcon(item.icon)}
                            </span>
                            <span className="text-sm text-gray-300">
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default FeaturesSection;
