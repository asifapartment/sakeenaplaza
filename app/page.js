// app/page.js

import Hero from './components/Hero'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Footer from './components/Footer'
import Header from '@/components/Header'
import FeaturedApartments from './components/FeaturedApartments'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Header/>
      <FeaturedApartments />
      <Features />
      {/* <div className='w-full h-0.5 bg-teal-600/30 relative'>
        <div className='absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2'>
          <div
            className="bg-teal-400/80"
            style={{
              width: '100px',
              height: '30px',
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
            }}
          ></div>
        </div>
      </div> */}
      <HowItWorks />
      <Footer />
    </main>
  )
}
