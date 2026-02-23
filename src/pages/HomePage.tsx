import { Suspense, lazy, memo } from 'react';
import { Hero } from '@/components/home/Hero';
import { EthosSection } from '@/components/home/EthosSection';

const ClubShowcaseSection = lazy(() => import('@/components/home/ClubShowcaseSection').then(m => ({ default: m.ClubShowcaseSection })));
const EventSection = lazy(() => import('@/components/home/EventSection').then(m => ({ default: m.EventSection })));
const SlowDatingSection = lazy(() => import('@/components/home/SlowDatingSection').then(m => ({ default: m.SlowDatingSection })));
const PhotoGallerySection = lazy(() => import('@/components/home/PhotoGallerySection').then(m => ({ default: m.PhotoGallerySection })));
const PricingSection = lazy(() => import('@/components/home/PricingSection').then(m => ({ default: m.PricingSection })));
const TestimonialsSection = lazy(() => import('@/components/home/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })));
const FAQSection = lazy(() => import('@/components/home/FAQSection').then(m => ({ default: m.FAQSection })));
const ContactFormSection = lazy(() => import('@/components/home/ContactFormSection').then(m => ({ default: m.ContactFormSection })));

const SectionSkeleton = memo(() => (
  <div className="w-full py-16 md:py-24 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[hsl(var(--gold))] border-t-transparent rounded-full animate-spin" />
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
        description="Join an exclusive community of professionals in NYC. Weekly curated events, authentic networking, and slow dating for high-achievers."
        keywords="NYC social club, professional networking NYC, private members club, professional community events"
        schema={generateOrganizationSchema()}
      />
      <Hero />
      <EthosSection />

      <Suspense fallback={<SectionSkeleton />}>
        <ClubShowcaseSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <EventSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <SlowDatingSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <PhotoGallerySection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <PricingSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <TestimonialsSection />
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
