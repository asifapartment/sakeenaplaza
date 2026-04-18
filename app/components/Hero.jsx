'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faBuilding,
    faMapMarkerAlt,
    faArrowRight,
    faStar,
    faWifi,
    faParking,
    faSnowflake,
    faConciergeBell,
    faBed,
    faUsers,
    faCheckCircle
} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'

export default function Hero() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setIsVisible(true)
    }, [])

    return (
        <section className="relative w-full bg-black min-h-screen flex items-center overflow-hidden max-lg:mt-6">
            {/* Background */}
            <div className="absolute inset-0">
                {/* Grid Pattern */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255, 255, 255, 0.09) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.09) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px',
                        zIndex: 10,
                    }}
                ></div>

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-black/90"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>

                {/* Teal Glow */}
                <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-400/5 rounded-full blur-3xl"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* LEFT COLUMN - Text Content */}
                    <div className="space-y-6">
                        {/* Badge */}
                        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-2">
                                <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 text-teal-400" />
                                <span className="text-teal-400 text-sm font-medium">Premium Living</span>
                            </div>
                        </div>

                        {/* Title */}
                        <div className={`transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.1]">
                                SAKEENA
                                <span className="text-teal-400"> PLAZA</span>
                            </h1>
                        </div>

                        {/* Location */}
                        <div className={`flex items-center gap-2 text-gray-300 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 h-5 text-teal-400" />
                            <span className="text-lg">Honnavar, Karnataka</span>
                        </div>

                        {/* Description */}
                        <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <p className="text-gray-400 text-base leading-relaxed max-w-lg">
                                4 premium apartments in the heart of Honnavar. Just minutes away from the beautiful coastal beaches. Experience luxury and comfort at its finest.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className={`flex gap-8 pt-4 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <div>
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faBuilding} className="w-5 h-5 text-teal-400" />
                                    <span className="text-3xl font-bold text-white">4</span>
                                </div>
                                <div className="text-gray-500 text-sm mt-1">Luxury Units</div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faStar} className="w-5 h-5 text-yellow-500" />
                                    <span className="text-3xl font-bold text-white">4.8</span>
                                </div>
                                <div className="text-gray-500 text-sm mt-1">Guest Rating</div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-teal-400" />
                                    <span className="text-3xl font-bold text-white">2-6</span>
                                </div>
                                <div className="text-gray-500 text-sm mt-1">Guests Capacity</div>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className={`flex flex-col sm:flex-row gap-4 pt-4 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <a
                                href='/apartments'
                                className="group inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300"
                            >
                                <span>View Apartments</span>
                                <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                            <a
                                href='#amenities'
                                className="group inline-flex items-center justify-center gap-2 border border-white/20 hover:border-teal-400 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300"
                            >
                                <span>Explore Amenities</span>
                            </a>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Features Grid */}
                    <div className={`transition-all duration-700 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                            <h3 className="text-white text-xl font-bold mb-6 flex items-center gap-2">
                                <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-teal-400" />
                                Premium Amenities
                            </h3>
                            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
                                {/* Feature 1 */}
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
                                    <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                                        <FontAwesomeIcon icon={faWifi} className="w-5 h-5 text-teal-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-white text-sm font-semibold">Free WiFi</h4>
                                        <p className="text-gray-400 text-xs">High-speed internet</p>
                                    </div>
                                </div>

                                {/* Feature 2 */}
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
                                    <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                                        <FontAwesomeIcon icon={faParking} className="w-5 h-5 text-teal-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-white text-sm font-semibold">Free Parking</h4>
                                        <p className="text-gray-400 text-xs">Secure parking</p>
                                    </div>
                                </div>

                                {/* Feature 3 */}
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
                                    <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                                        <FontAwesomeIcon icon={faSnowflake} className="w-5 h-5 text-teal-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-white text-sm font-semibold">Air Conditioning</h4>
                                        <p className="text-gray-400 text-xs">Fully AC</p>
                                    </div>
                                </div>

                                {/* Feature 4 */}
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
                                    <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                                        <FontAwesomeIcon icon={faConciergeBell} className="w-5 h-5 text-teal-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-white text-sm font-semibold">24/7 Support</h4>
                                        <p className="text-gray-400 text-xs">Premium service</p>
                                    </div>
                                </div>

                                {/* Feature 5 */}
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
                                    <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                                        <FontAwesomeIcon icon={faBed} className="w-5 h-5 text-teal-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-white text-sm font-semibold">Luxury Beds</h4>
                                        <p className="text-gray-400 text-xs">Premium comfort</p>
                                    </div>
                                </div>

                                {/* Feature 6 */}
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
                                    <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                                        <FontAwesomeIcon icon={faStar} className="w-5 h-5 text-teal-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-white text-sm font-semibold">5-Star Service</h4>
                                        <p className="text-gray-400 text-xs">Exceptional care</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

           
        </section>
    )
}