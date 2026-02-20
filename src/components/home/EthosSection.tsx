import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Lock, Gem, Users, MessageSquare } from 'lucide-react';

const ethosItems = [
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'Discretion is our currency. Your data is sovereign.',
  },
  {
    icon: Gem,
    title: 'Curated Events',
    description: 'Access to exclusive gatherings worldwide.',
  },
  {
    icon: Users,
    title: 'Trusted Community',
    description: 'A vetted network of like-minded individuals.',
  },
  {
    icon: MessageSquare,
    title: 'True Discourse',
    description: 'Meaningful conversations with peers.',
  },
];

export const EthosSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="w-full px-6 py-12 bg-gradient-to-b from-transparent to-[#0a0f0a]" id="ethos">
      <div ref={ref} className="mx-auto max-w-7xl">

        {/* Section Header */}
        <div className={`flex items-center justify-between mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="text-2xl text-white font-medium italic font-display">Our Ethos</h3>
          <div className="h-[1px] flex-1 bg-white/10 ml-4" />
        </div>

        {/* 2 cols on mobile, 4 cols on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {ethosItems.map((item, index) => (
            <div
              key={index}
              className={`group premium-card hover-luxury p-5 md:p-8 flex flex-col items-center text-center gap-3 transition-all duration-500 delay-[${index * 100}ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
              <div className="p-3 md:p-4 rounded-full bg-[#1a5b2a]/20 text-[#d4af37]">
                <item.icon className="w-6 h-6 md:w-7 md:h-7" />
              </div>

              <h4 className="text-white text-lg md:text-2xl font-medium leading-tight font-display">{item.title}</h4>
              <p className="text-white/50 text-xs md:text-sm font-sans leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
