import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import havnLogo from '@/assets/havn-logo.png';

interface Partner {
  name: string;
  logo: string;
  descriptor: string;
}

const partners: Partner[] = [
  {
    name: 'HAVN',
    logo: havnLogo,
    descriptor: 'A design-forward coworking space for founders, creatives, and builders.',
  },
];

export const VenuePartnersSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div
          ref={ref}
          className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
            Our Venue & Space Partners
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We collaborate with exceptional spaces that share our commitment to design, 
            hospitality, and community. Members enjoy exclusive access and privileges 
            at each of our partner venues.
          </p>
        </div>

        <div
          className={`flex justify-center transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-4xl">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="group flex flex-col items-center text-center"
              >
                <div className="h-20 flex items-center justify-center mb-4 transition-opacity duration-300 group-hover:opacity-80">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-h-full max-w-[180px] object-contain filter brightness-0 invert opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                  {partner.descriptor}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
