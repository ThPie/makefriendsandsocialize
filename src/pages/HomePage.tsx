import { Suspense, lazy, memo } from 'react';
import { Hero } from '@/components/home/Hero';
import { WhyChooseSection } from '@/components/home/WhyChooseSection';

// Lazy load below-the-fold sections for faster initial load
const EventSection = lazy(() => import('@/components/home/EventSection').then(m => ({ default: m.EventSection })));
const BusinessEventsSection = lazy(() => import('@/components/home/BusinessEventsSection').then(m => ({ default: m.BusinessEventsSection })));
const TestimonialsSection = lazy(() => import('@/components/home/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })));
const PhotoGallerySection = lazy(() => import('@/components/home/PhotoGallerySection').then(m => ({ default: m.PhotoGallerySection })));
const EthosSection = lazy(() => import('@/components/home/EthosSection').then(m => ({ default: m.EthosSection })));
const SlowDatingSection = lazy(() => import('@/components/home/SlowDatingSection').then(m => ({ default: m.SlowDatingSection })));
const PricingSection = lazy(() => import('@/components/home/PricingSection').then(m => ({ default: m.PricingSection })));
const FAQSection = lazy(() => import('@/components/home/FAQSection').then(m => ({ default: m.FAQSection })));
const ContactFormSection = lazy(() => import('@/components/home/ContactFormSection').then(m => ({ default: m.ContactFormSection })));

// Minimal skeleton for lazy loaded sections
const SectionSkeleton = memo(() => (
  <div className="w-full py-16 md:py-24 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
));
SectionSkeleton.displayName = 'SectionSkeleton';

import { SEO } from '@/components/common/SEO';
import { generateOrganizationSchema } from '@/lib/seo-schema';

const HomePage = () => {
  return (
    <main className="flex flex-col">
      <SEO
        title="Experience Meaningful Connection"
        description="Join an exclusive community of professionals in NYC. Weekly curated events, authentic networking, and slow dating for high-achievers."
        keywords="NYC social club, professional networking NYC, private members club, professional community events"
        schema={generateOrganizationSchema()}
      />
      {/* Above the fold - load immediately */}
      <Hero />
      {/* SocialProofBanner is now integrated into the Hero */}
      <WhyChooseSection />

      {/* Below the fold - lazy loaded */}
      <Suspense fallback={<SectionSkeleton />}>
        <EventSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <BusinessEventsSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <TestimonialsSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <PhotoGallerySection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <EthosSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <SlowDatingSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <PricingSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <FAQSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <ContactFormSection />
      </Suspense>
    </main>
  );
};

export default HomePage;
