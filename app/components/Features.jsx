'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faShieldAlt,
    faStar,
    faBolt,
    faHeadset,
    faClock,
    faKey
} from '@fortawesome/free-solid-svg-icons'

const features = [
    {
        icon: <FontAwesomeIcon icon={faShieldAlt} className="h-5 w-5 text-teal-400" />,
        title: 'Verified Hosts',
        description: 'All hosts are thoroughly verified to ensure your safety and security.'
    },
    {
        icon: <FontAwesomeIcon icon={faStar} className="h-5 w-5 text-teal-400" />,
        title: 'Premium Quality',
        description: 'Every apartment meets our high standards for quality and comfort.'
    },
    {
        icon: <FontAwesomeIcon icon={faBolt} className="h-5 w-5 text-teal-400" />,
        title: 'Instant Booking',
        description: 'Book your stay instantly with our seamless booking process.'
    },
    {
        icon: <FontAwesomeIcon icon={faHeadset} className="h-5 w-5 text-teal-400" />,
        title: '24/7 Support',
        description: 'Our support team is available around the clock to help you.'
    },
    {
        icon: <FontAwesomeIcon icon={faClock} className="h-5 w-5 text-teal-400" />,
        title: 'Flexible Check-in',
        description: 'Easy check-in and check-out times to suit your travel schedule.'
    },
    {
        icon: <FontAwesomeIcon icon={faKey} className="h-5 w-5 text-teal-400" />,
        title: 'Secure Payments',
        description: 'Your transactions are protected with industry-standard encryption.'
    }
]

export default function Features() {
    return (
        <section className="py-16 px-5 bg-black">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
                        Why Choose <span className="text-teal-400">Sakeena Plaza</span>?
                    </h2>
                    <p className="max-w-xl mx-auto text-gray-400">
                        We provide the best apartment booking experience with premium features for both guests and hosts.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="rounded-2xl p-5 border border-white/10 bg-black transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-white/20 hover:shadow-lg hover:shadow-white/10"
                        >
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm mb-3 bg-white/10">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-semibold mb-1 text-gray-200">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}