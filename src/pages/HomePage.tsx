import { Hero } from '@/components/home/Hero';
import { WhyChooseSection } from '@/components/home/WhyChooseSection';
import { EventSection } from '@/components/home/EventSection';
import { SlowDatingSection } from '@/components/home/SlowDatingSection';
import { EthosSection } from '@/components/home/EthosSection';
import { FAQSection } from '@/components/home/FAQSection';
import { PricingSection } from '@/components/home/PricingSection';
import { MembershipSection } from '@/components/home/MembershipSection';
import { EventChatbot } from '@/components/EventChatbot';

const HomePage = () => {
  return (
    <main className="flex flex-col">
      <Hero />
      <WhyChooseSection />
      <EventSection />
      <SlowDatingSection />
      <EthosSection />
      <FAQSection />
      <PricingSection />
      <MembershipSection />
      <EventChatbot />
    </main>
  );
};

export default HomePage;
