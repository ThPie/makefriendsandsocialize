import { Hero } from '@/components/home/Hero';
import { EventSection } from '@/components/home/EventSection';
import { EthosSection } from '@/components/home/EthosSection';
import { MembershipSection } from '@/components/home/MembershipSection';

const HomePage = () => {
  return (
    <main className="flex flex-col gap-12 md:gap-20">
      <Hero />
      <EventSection />
      <EthosSection />
      <MembershipSection />
    </main>
  );
};

export default HomePage;
