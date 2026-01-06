import { Hero } from '@/components/home/Hero';
import { WhyChooseSection } from '@/components/home/WhyChooseSection';
import { EventSection } from '@/components/home/EventSection';
import { BusinessEventsSection } from '@/components/home/BusinessEventsSection';
import { SlowDatingSection } from '@/components/home/SlowDatingSection';
import { EthosSection } from '@/components/home/EthosSection';
import { FAQSection } from '@/components/home/FAQSection';
import { ContactFormSection } from '@/components/home/ContactFormSection';
import { PricingSection } from '@/components/home/PricingSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { SocialProofBanner } from '@/components/home/SocialProofBanner';
import { MemberBadgesShowcase } from '@/components/home/MemberBadgesShowcase';
import { PhotoGallerySection } from '@/components/home/PhotoGallerySection';

const HomePage = () => {
  return (
    <main className="flex flex-col">
      <Hero />
      <SocialProofBanner />
      <WhyChooseSection />
      <EventSection />
      <BusinessEventsSection />
      <TestimonialsSection />
      <PhotoGallerySection />
      <MemberBadgesShowcase />
      <EthosSection />
      <SlowDatingSection />
      <PricingSection />
      <FAQSection />
      <ContactFormSection />
    </main>
  );
};

export default HomePage;
