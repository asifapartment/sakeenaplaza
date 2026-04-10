'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faBuilding,
    faMapMarkerAlt,
    faArrowRight,
    faStar,
    faWifi,
    faParking,
    faSnowflake
} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'

export default function Hero() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setIsVisible(true)
    }, [])

    return (
        <section className="relative w-full bg-black min-h-screen flex items-center overflow-hidden">

            {/* BOLD VISIBLE GRID BACKGROUND */}
            <div className="absolute inset-0">
                {/* Main Bold Grid - You WILL see this */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(20, 184, 166, 0.25) 2px, transparent 2px),
                            linear-gradient(90deg, rgba(20, 184, 166, 0.25) 2px, transparent 2px)
                        `,
                        backgroundSize: '80px 80px',
                        backgroundPosition: 'center center'
                    }}
                ></div>

                {/* Secondary Grid - Thinner lines for depth */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(20, 184, 166, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(20, 184, 166, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px',
                        backgroundPosition: 'center center'
                    }}
                ></div>

                {/* Dark Gradient Overlay on edges only - not covering the grid */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50"></div>

                {/* Subtle Teal Glow behind content */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-3xl"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">

                {/* 2 Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* LEFT COLUMN - Text Content */}
                    <div className="space-y-8">

                        {/* Building Name - Fluid scaling from 2rem to 6rem */}
                        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                            <h1 className="text-[clamp(2rem,8vw,6rem)] font-black text-white leading-[1.1] tracking-tighter">
                                SAKEENA 
                                <span className="text-teal-400"> PLAZA</span>
                            </h1>
                        </div>

                        {/* Location - Fluid scaling */}
                        <div className={`flex items-center gap-3 text-teal-400 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="w-[clamp(1.25rem,5vw,1.75rem)] h-[clamp(1.25rem,5vw,1.75rem)]" />
                            <span className="text-[clamp(1.125rem,4vw,2rem)] font-light tracking-wide">
                                Honnavar, Karnataka
                            </span>
                        </div>

                        {/* Short Description - Fluid scaling */}
                        <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                            <p className="text-gray-400 text-[clamp(0.875rem,3vw,1.125rem)] max-w-lg leading-relaxed">
                                4 premium apartments in the heart of Honnavar.
                                Just minutes away from the beautiful coastal beaches.
                            </p>
                        </div>

                        {/* Quick Stats - Fluid numbers */}
                        <div className={`flex gap-10 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                            <div>
                                <div className="text-teal-400 text-[clamp(2rem,8vw,3.5rem)] font-black">4</div>
                                <div className="text-gray-500 text-[clamp(0.625rem,2vw,0.875rem)] uppercase tracking-wide mt-1">Luxury Units</div>
                            </div>
                            <div>
                                <div className="text-teal-400 text-[clamp(2rem,8vw,3.5rem)] font-black">⭐ 4.8</div>
                                <div className="text-gray-500 text-[clamp(0.625rem,2vw,0.875rem)] uppercase tracking-wide mt-1">Guest Rating</div>
                            </div>
                            <div>
                                <div className="text-teal-400 text-[clamp(2rem,8vw,3.5rem)] font-black">2-6</div>
                                <div className="text-gray-500 text-[clamp(0.625rem,2vw,0.875rem)] uppercase tracking-wide mt-1">Guests</div>
                            </div>
                        </div>

                        {/* CTA Button - Fluid sizing */}
                        <div className={`transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                            <a
                                href='/apartments'
                                className="group inline-flex items-center gap-3 bg-teal-500 hover:bg-teal-600 text-white font-bold text-[clamp(0.875rem,3vw,1.125rem)] px-[clamp(1.5rem,5vw,2.5rem)] py-[clamp(0.875rem,3vw,1.25rem)] rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-teal-500/30"
                            >
                                <span>VIEW APARTMENTS</span>
                                <FontAwesomeIcon icon={faArrowRight} className="w-[clamp(0.875rem,3vw,1.25rem)] h-[clamp(0.875rem,3vw,1.25rem)] group-hover:translate-x-2 transition-transform" />
                            </a>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - 4 Valuable Features Grid */}
                    <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                        <div className="grid grid-cols-2 gap-4 sm:gap-6">

                            {/* Feature 1: Free WiFi */}
                            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center border border-white/10 hover:border-teal-400/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                                <div className="w-[clamp(3rem,10vw,4rem)] h-[clamp(3rem,10vw,4rem)] bg-teal-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-500/20 transition-all duration-300">
                                    <FontAwesomeIcon
                                        icon={faWifi}
                                        className="text-teal-400 text-[clamp(1.25rem,5vw,1.875rem)] group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <h3 className="text-white text-[clamp(0.875rem,4vw,1.125rem)] font-bold mb-2">Free WiFi</h3>
                                <p className="text-gray-400 text-[clamp(0.625rem,2.5vw,0.875rem)]">High-speed internet throughout</p>
                            </div>

                            {/* Feature 2: Free Parking */}
                            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center border border-white/10 hover:border-teal-400/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                                <div className="w-[clamp(3rem,10vw,4rem)] h-[clamp(3rem,10vw,4rem)] bg-teal-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-500/20 transition-all duration-300">
                                    <FontAwesomeIcon
                                        icon={faParking}
                                        className="text-teal-400 text-[clamp(1.25rem,5vw,1.875rem)] group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <h3 className="text-white text-[clamp(0.875rem,4vw,1.125rem)] font-bold mb-2">Free Parking</h3>
                                <p className="text-gray-400 text-[clamp(0.625rem,2.5vw,0.875rem)]">Secure parking space available</p>
                            </div>

                            {/* Feature 3: Air Conditioning */}
                            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center border border-white/10 hover:border-teal-400/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                                <div className="w-[clamp(3rem,10vw,4rem)] h-[clamp(3rem,10vw,4rem)] bg-teal-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-500/20 transition-all duration-300">
                                    <FontAwesomeIcon
                                        icon={faSnowflake}
                                        className="text-teal-400 text-[clamp(1.25rem,5vw,1.875rem)] group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <h3 className="text-white text-[clamp(0.875rem,4vw,1.125rem)] font-bold mb-2">Air Conditioning</h3>
                                <p className="text-gray-400 text-[clamp(0.625rem,2.5vw,0.875rem)]">Fully AC apartments</p>
                            </div>

                            {/* Feature 4: Premium Service */}
                            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center border border-white/10 hover:border-teal-400/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                                <div className="w-[clamp(3rem,10vw,4rem)] h-[clamp(3rem,10vw,4rem)] bg-teal-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-500/20 transition-all duration-300">
                                    <FontAwesomeIcon
                                        icon={faStar}
                                        className="text-teal-400 text-[clamp(1.25rem,5vw,1.875rem)] group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <h3 className="text-white text-[clamp(0.875rem,4vw,1.125rem)] font-bold mb-2">Premium Service</h3>
                                <p className="text-gray-400 text-[clamp(0.625rem,2.5vw,0.875rem)]">24/7 customer support</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator - Mobile Only */}
            <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-1000 lg:hidden ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-6 h-10 border-2 border-teal-400/30 rounded-full flex justify-center">
                    <div className="w-1.5 h-2.5 bg-teal-400 rounded-full mt-2 animate-bounce"></div>
                </div>
            </div>
        </section>
    )
}