'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faShieldAlt,
    faStar,
    faBolt,
    faHeadset,
    faClock,
    faKey,
    faCheckCircle
} from '@fortawesome/free-solid-svg-icons'

const features = [
    {
        icon: faShieldAlt,
        title: 'Verified Hosts',
        description: 'All hosts are thoroughly verified to ensure your safety and security.'
    },
    {
        icon: faStar,
        title: 'Premium Quality',
        description: 'Every apartment meets our high standards for quality and comfort.'
    },
    {
        icon: faBolt,
        title: 'Instant Booking',
        description: 'Book your stay instantly with our seamless booking process.'
    },
    {
        icon: faHeadset,
        title: '24/7 Support',
        description: 'Our support team is available around the clock to help you.'
    },
    {
        icon: faClock,
        title: 'Flexible Check-in',
        description: 'Easy check-in and check-out times to suit your travel schedule.'
    },
    {
        icon: faKey,
        title: 'Secure Payments',
        description: 'Your transactions are protected with industry-standard encryption.'
    }
]

export default function Features() {
    return (
        <section className="py-20 px-5 bg-black">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-2 mb-4">
                        <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-teal-400" />
                        <span className="text-teal-400 text-sm font-medium">Why Choose Us</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
                        Why Choose <span className="text-teal-400">Sakeena Plaza</span>?
                    </h2>
                    <p className="max-w-xl mx-auto text-gray-400">
                        We provide the best apartment booking experience with premium features for both guests and hosts.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="group rounded-2xl p-6 border border-white/10 bg-black transition-all duration-300 hover:border-teal-400/30"
                        >
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-teal-500/20">
                                <FontAwesomeIcon
                                    icon={feature.icon}
                                    className="h-5 w-5 text-teal-400 transition-transform duration-300 group-hover:scale-110"
                                />
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-semibold mb-2 text-white transition-colors duration-300 group-hover:text-teal-400">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}