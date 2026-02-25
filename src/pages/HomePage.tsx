import { Suspense, lazy, memo } from 'react';
import { Hero } from '@/components/home/Hero';
import { EthosSection } from '@/components/home/EthosSection';

// Lazy load below-the-fold sections for faster initial load
const ClubShowcaseSection = lazy(() => import('@/components/home/ClubShowcaseSection').then(m => ({ default: m.ClubShowcaseSection })));
const EventSection = lazy(() => import('@/components/home/EventSection').then(m => ({ default: m.EventSection })));
const PhotoGallerySection = lazy(() => import('@/components/home/PhotoGallerySection').then(m => ({ default: m.PhotoGallerySection })));
const WhyChooseSection = lazy(() => import('@/components/home/WhyChooseSection').then(m => ({ default: m.WhyChooseSection })));
const PricingSection = lazy(() => import('@/components/home/PricingSection').then(m => ({ default: m.PricingSection })));
const TestimonialsSection = lazy(() => import('@/components/home/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })));

// Minimal skeleton for lazy loaded sections
const SectionSkeleton = memo(() => (
  <div className="w-full py-12 md:py-24 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[hsl(var(--accent-gold))] border-t-transparent rounded-full animate-spin" />
  </div>
));
SectionSkeleton.displayName = 'SectionSkeleton';

import { SEO } from '@/components/common/SEO';
import { generateOrganizationSchema } from '@/lib/seo-schema';

const HomePage = () => {
  return (
    <main className="flex flex-col min-h-screen bg-background">
      <SEO
        title="Experience Meaningful Connection"
        description="Join an exclusive community of professionals. Weekly curated events, authentic networking, and intentional connections for high-achievers."
        keywords="private social club, professional networking, private members club, professional community events"
        schema={generateOrganizationSchema()}
      />

      {/* Above the fold */}
      <Hero />
      <EthosSection />

      {/* Curated Collections */}
      <Suspense fallback={<SectionSkeleton />}>
        <ClubShowcaseSection />
      </Suspense>

      {/* Upcoming Gatherings */}
      <Suspense fallback={<SectionSkeleton />}>
        <EventSection />
      </Suspense>

      {/* Moments from the Circle */}
      <Suspense fallback={<SectionSkeleton />}>
        <PhotoGallerySection />
      </Suspense>

      {/* How It Works */}
      <Suspense fallback={<SectionSkeleton />}>
        <WhyChooseSection />
      </Suspense>

      {/* Testimonial Spotlight */}
      <Suspense fallback={<SectionSkeleton />}>
        <TestimonialsSection />
      </Suspense>
    </main>
  );
};

export default HomePage;
