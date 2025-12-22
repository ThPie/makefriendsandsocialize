import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const partners = [
  { name: 'Forbes', logo: 'F' },
  { name: 'Vogue', logo: 'V' },
  { name: 'GQ', logo: 'GQ' },
  { name: 'Town & Country', logo: 'T&C' },
  { name: 'Robb Report', logo: 'RR' },
  { name: 'Tatler', logo: 'T' },
];

export const PartnersSection = () => {
  useScrollAnimation();

  return (
    <section className="py-20 bg-card/50 border-y border-border/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 scroll-animate">
          <p className="text-muted-foreground text-sm uppercase tracking-[0.2em] mb-4">
            As Featured In
          </p>
          <h2 className="text-2xl md:text-3xl font-display text-foreground">
            Trusted by Discerning Publications
          </h2>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 scroll-animate">
          {partners.map((partner, index) => (
            <div
              key={partner.name}
              className="group flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-lg bg-background/50 border border-border/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="text-2xl md:text-3xl font-display text-muted-foreground group-hover:text-primary transition-colors duration-300">
                {partner.logo}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground text-sm mt-12 scroll-animate">
          Our exclusive events and curated experiences have been recognized by leading lifestyle publications
        </p>
      </div>
    </section>
  );
};
