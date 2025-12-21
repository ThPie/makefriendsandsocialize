import { Hero } from '@/components/home/Hero';
import { EventSection } from '@/components/home/EventSection';
import { EthosSection } from '@/components/home/EthosSection';
import { MembershipSection } from '@/components/home/MembershipSection';
import { EventChatbot } from '@/components/EventChatbot';

const HomePage = () => {
  return (
    <main className="flex flex-col gap-12 md:gap-20">
      <Hero />
      <EventSection />
      <EthosSection />
      <MembershipSection />
      <EventChatbot />
    </main>
  );
};

export default HomePage;
