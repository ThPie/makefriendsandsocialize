import { Hero } from '@/components/home/Hero';
import { WhyChooseSection } from '@/components/home/WhyChooseSection';
import { EventSection } from '@/components/home/EventSection';
import { VenuePartnersSection } from '@/components/home/VenuePartnersSection';
import { SlowDatingSection } from '@/components/home/SlowDatingSection';
import { EthosSection } from '@/components/home/EthosSection';
import { FAQSection } from '@/components/home/FAQSection';
import { PricingSection } from '@/components/home/PricingSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { EventChatbot } from '@/components/EventChatbot';

const HomePage = () => {
  return (
    <main className="flex flex-col">
      <Hero />
      <WhyChooseSection />
      <EventSection />
      <VenuePartnersSection />
      <EthosSection />
      <TestimonialsSection />
      <SlowDatingSection />
      <PricingSection />
      <FAQSection />
      <EventChatbot />
      <EventChatbot />
    </main>
  );
};

export default HomePage;
