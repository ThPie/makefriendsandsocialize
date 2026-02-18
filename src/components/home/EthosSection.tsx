import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Lock, Gem, Globe, Wine } from 'lucide-react';

const ethosItems = [
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'Your data is yours alone. Encrypted sanctuary.',
  },
  {
    icon: Gem,
    title: 'Curated Events',
    description: 'Exclusive gatherings for the chosen few.',
  },
  {
    icon: Globe,
    title: 'Global Access',
    description: 'Worldwide reciprocity at partner houses.',
  },
  {
    icon: Wine,
    title: 'Fine Dining',
    description: 'Culinary excellence in every encounter.',
  },
];

export const EthosSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="w-full px-6 py-16 md:px-10 md:py-24 bg-[#051008]" id="ethos">
      <div ref={ref} className="mx-auto max-w-7xl">

        {/* Section Header */}
        <div className={`mb-16 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-normal text-white italic">
            Our Ethos
            <span className="block h-px w-24 bg-[#d4af37]/50 mx-auto mt-6" />
          </h2>
        </div>

        {/* 4-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ethosItems.map((item, index) => (
            <div
              key={index}
              className={`group relative p-8 rounded-2xl bg-[#0a1f0f] border border-[#d4af37]/10 hover:border-[#d4af37]/30 transition-all duration-700 delay-[${index * 100}ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
              <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#d4af37]/10 text-[#d4af37] group-hover:scale-110 transition-transform duration-500">
                <item.icon className="w-6 h-6" />
              </div>

              <h3 className="font-display text-2xl text-white mb-3 group-hover:text-[#d4af37] transition-colors">{item.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed font-light">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
