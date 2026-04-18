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
                className="text-teal-400 w-5 h-5"
            />
        );
    };

    return (
        <div className="space-y-8">
            {/* FEATURES & AMENITIES */}
            <div className="bg-black rounded-2xl border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="border-b border-white/10 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-teal-400 rounded-full" />
                        <h2 className="text-xl font-semibold text-white">
                            Features & Amenities
                        </h2>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {displayFeatures.map((feature, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-teal-400/30 transition-all duration-200"
                            >
                                <span className="text-teal-400">
                                    {renderIcon(feature.icon)}
                                </span>
                                <span className="text-sm text-gray-300">
                                    {feature.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* WHAT'S INCLUDED */}
            <div className="bg-black rounded-2xl border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="border-b border-white/10 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-teal-400 rounded-full" />
                        <h2 className="text-xl font-semibold text-white">
                            What's Included
                        </h2>
                    </div>
                </div>

                {/* Included Items Grid */}
                <div className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {displayWhatsInclude.map((item, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center text-center p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-teal-400/30 transition-all duration-200"
                            >
                                <span className="text-teal-400 mb-2">
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
        </div>
    );
}

export default FeaturesSection;