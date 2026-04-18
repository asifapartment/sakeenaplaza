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

function getLockedDates(bookings) {
  const locked = [];
  if (!bookings || !Array.isArray(bookings)) return locked;

  bookings.forEach((b) => {
    const start = new Date(b.start_date);
    const end = new Date(b.end_date);
    let current = new Date(start);

    while (current <= end) {
      const year = current.getUTCFullYear();
      const month = current.getUTCMonth();
      const day = current.getUTCDate();
      locked.push(new Date(Date.UTC(year, month, day)));
      current.setUTCDate(current.getUTCDate() + 1);
    }
  });
  return locked;
}

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

        {/* Main Content - Features + Booking Form */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto">
            {/* Mobile: Booking Form first, Desktop: Side by side */}
            <div className="block lg:hidden mb-8">
              <div className="sticky top-4 z-20">
                <BookingForm
                  apartmentId={id}
                  disabledRanges={disabledRanges}
                  dailyRate={DAILY_RATE}
                  cleaningFee={cleaningFee}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Left Column - Features and Details */}
              <div className="lg:col-span-2 space-y-10">
                {/* Features Section */}
                <div>

                  <FeaturesSection apartment={apartment} />
                </div>

                {/* House Rules Section */}
                <div>

                  <HouseRulesSection rules={apartment.houseRules} />
                </div>

                {/* Extra Info Section */}
                <div>
                  <ExtraInfoSection
                    whyBookWithUs={apartment?.whyBookWithUs}
                    policy={apartment?.policy}
                  />
                </div>
              </div>

              {/* Right Column - Booking Form (Desktop only) */}
              <div className="hidden lg:block">
                <div className="sticky top-24">
                  <BookingForm
                    apartmentId={id}
                    disabledRanges={disabledRanges}
                    dailyRate={DAILY_RATE}
                    cleaningFee={cleaningFee}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Guest Reviews
              </h2>
              <div className="w-20 h-1 bg-teal-400 rounded-full"></div>
            </div>
            <ReviewSection id={apartment.id} />
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}