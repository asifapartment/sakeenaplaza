import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import ReviewSection from "@/components/Review";
import Footer from "@/app/components/Footer";
import Head from "next/head";

// ⚡ Dynamic imports with proper fallbacks
const GallerySection = dynamic(() => import("@/components/galery1"), {
  loading: () => (
    <div className="h-[300px] w-full bg-white/5 animate-pulse rounded-lg" />
  ),
});

const HeaderSection = dynamic(() => import("./components/HeaderSection"), {
  loading: () => (
    <div className="h-[200px] w-full bg-white/5 animate-pulse rounded-lg" />
  ),
});

const FeaturesSection = dynamic(() => import("./components/FeaturesSection"), {
  loading: () => (
    <div className="h-[200px] w-full bg-white/5 animate-pulse rounded-lg" />
  ),
});

const HouseRulesSection = dynamic(() => import("./components/HouseRulesSection"), {
  loading: () => (
    <div className="h-[150px] w-full bg-white/5 animate-pulse rounded-lg" />
  ),
});

const ExtraInfoSection = dynamic(() => import("./components/ExtraInfoSection"), {
  loading: () => (
    <div className="h-[150px] w-full bg-white/5 animate-pulse rounded-lg" />
  ),
});

const BookingForm = dynamic(() => import("./components/BookingForm"), {
  loading: () => (
    <div className="h-[500px] w-full bg-white/5 animate-pulse rounded-lg" />
  ),
});

async function getApartmentDetails(id) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/apartment/${id}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching apartment:", error);
    return null;
  }
}

export default async function BookingPage({ params }) {
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId)) return notFound();

  const [apartment] = await Promise.all([
    getApartmentDetails(numericId),
  ]);

  if (!apartment || !apartment.id) return notFound();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const disabledRanges = [{ from: new Date("1970-01-01"), to: today }];

  const DAILY_RATE = apartment?.price;
  const cleaningFee = 500;

  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        {apartment?.gallery?.[0] && (
          <link rel="preload" as="image" href={apartment.gallery[0]} />
        )}
      </Head>

      <Header authButtons={true} />

      <main className="w-full">
        {/* Hero Section - Full Width */}
        <HeaderSection plan={apartment} />

        {/* Gallery Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Gallery
              </h2>
              <div className="w-20 h-1 bg-teal-400 rounded-full"></div>
            </div>
            <GallerySection images={apartment.gallery} />
          </div>
        </section>

        {/* Main Content - SINGLE BookingForm instance that repositions */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto">
            {/* Desktop Layout with absolute positioning */}
            <div className="relative">
              {/* This is the ONE AND ONLY BookingForm */}
              {/* On desktop: positioned absolutely on the right */}
              {/* On mobile: normal block flow */}
              <div className="lg:absolute lg:right-0 lg:top-0 lg:w-[380px] xl:w-[400px]">
                <div id="booking-form" className="lg:sticky lg:top-24">
                  <BookingForm
                    apartmentId={id}
                    disabledRanges={disabledRanges}
                    dailyRate={DAILY_RATE}
                    cleaningFee={cleaningFee}
                  />
                </div>
              </div>

              {/* Content - on desktop, add right padding to avoid overlap with form */}
              <div className="space-y-10 lg:pr-[420px] xl:pr-[440px]">
                <FeaturesSection apartment={apartment} />
                <HouseRulesSection rules={apartment.houseRules} />
                <ExtraInfoSection
                  whyBookWithUs={apartment?.whyBookWithUs}
                  policy={apartment?.policy}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-black">
          <div className="max-w-7xl mx-auto">
            <ReviewSection id={apartment.id} />
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}