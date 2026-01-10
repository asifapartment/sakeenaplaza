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
      <HowItWorks />
      <Footer />
    </main>
  )
}
