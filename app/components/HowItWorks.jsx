'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faSearch,
    faCalendarAlt,
    faCreditCard,
    faHouse,
    faEnvelope,
    faStar
} from '@fortawesome/free-solid-svg-icons'

const steps = [
    {
        icon: faSearch,
        title: 'Search & Explore',
        description: 'Find the perfect apartment that matches your preferences and budget.',
        gradient: 'from-teal-500 to-emerald-500'
    },
    {
        icon: faCalendarAlt,
        title: 'Book Instantly',
        description: 'Select your dates and book your stay with our secure payment system.',
        gradient: 'from-blue-500 to-indigo-500'
    },
    {
        icon: faCreditCard,
        title: 'Secure Payment',
        description: 'Your payment is protected until you check into your apartment.',
        gradient: 'from-purple-500 to-pink-500'
    },
    {
        icon: faHouse,
        title: 'Enjoy Your Stay',
        description: 'Check in seamlessly and enjoy your premium apartment experience.',
        gradient: 'from-orange-500 to-red-500'
    },
    {
        icon: faEnvelope,
        title: 'Receive Confirmation',
        description: 'Get instant confirmation and booking details via email.',
        gradient: 'from-cyan-500 to-blue-500'
    },
    {
        icon: faStar,
        title: 'Leave a Review',
        description: 'Share your experience and help other travelers find great stays.',
        gradient: 'from-yellow-500 to-amber-500'
    }
]

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-20 px-5 bg-black">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
                        How It <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Works</span>
                    </h2>
                    <p className="max-w-xl mx-auto text-gray-400">
                        Book your perfect stay in just a few simple steps
                    </p>
                </div>

                {/* Steps Grid - 3 cards per row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="group relative rounded-2xl p-6 border border-white/10 bg-black backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-white/20 hover:shadow-xl hover:shadow-white/10"
                        >
                            {/* Step Number Badge */}
                            <div className="absolute top-4 right-4">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-gray-500 group-hover:bg-teal-400/20 group-hover:text-teal-400 transition-all duration-300">
                                    {String(index + 1).padStart(2, '0')}
                                </div>
                            </div>

                            {/* Icon with Gradient Background */}
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <FontAwesomeIcon icon={step.icon} className="h-6 w-6 text-white" />
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-teal-400 transition-colors duration-300">
                                {step.title}
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                {step.description}
                            </p>

                            {/* Progress Line */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute -right-2 top-1/2 transform -translate-y-1/2 z-10">
                                    <div className="w-4 h-4">
                                        <svg viewBox="0 0 24 24" fill="none" className="text-gray-700 group-hover:text-teal-400/30 transition-colors duration-300">
                                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}