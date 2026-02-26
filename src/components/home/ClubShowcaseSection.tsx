import { Link } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Calendar, Users, Crown, Briefcase, Heart } from 'lucide-react';

// Assets
import lesAmisImg from '@/assets/les-amis-hero-new.webp';
import gentlemenImg from '@/assets/gentlemen-hero-new.webp';
import womenSocietyImg from '@/assets/women-society-hero.jpg';
import foundersImg from '@/assets/founders-hero-new.jpg';
import slowDatingImg from '@/assets/slow-dating-new.jpg';
import businessImg from '@/assets/business-hero.jpg';

const getIconForCategory = (category: string) => {
  switch (category) {
    case 'Exclusive': return Crown;
    case 'Society': return Users;
    case 'Social': return Users;
    case 'Dating': return Heart;
    case 'Business': return Briefcase;
    default: return Calendar;
  }
};

const clubs = [
  {
    id: 'founders',
    category: 'Exclusive',
    title: 'Founders Circle',
    description: 'Where visionaries shape the future. Join an elite collective of entrepreneurs, founders, and industry disruptors for high-level masterminds and strategic growth opportunities.',
    image: foundersImg,
    link: '/founders-circle'
  },
  {
    id: 'gentlemen',
    category: 'Society',
    title: 'The Gentlemen',
    description: 'A circle for the modern man of substance and style. Experience curated tastings, tailored networking events, and camaraderie steeped in heritage and modern refinement.',
    image: gentlemenImg,
    link: '/circles/the-gentlemen'
  },
  {
    id: 'les-amis',
    category: 'Social',
    title: 'Les Amis',
    description: 'Casual gatherings for close friends and allies. Enjoy relaxed dining, cultural outings, and vibrant conversations in a warm, welcoming, and inclusive atmosphere.',
    image: lesAmisImg,
    link: '/circles/les-amis'
  },
  {
    id: 'women-society',
    category: 'Society',
    title: 'The Ladies Society',
    description: 'Empowering connections for visionary women. A sanctuary for female leaders and creatives to collaborate, inspire, and elevate one another through exclusive wellness.',
    image: womenSocietyImg,
    link: '/circles'
  },
  {
    id: 'business-circle',
    category: 'Business',
    title: 'Business Circle',
    description: 'Strategic connections for entrepreneurs and executives. Unlock exclusive industry insights and transformative professional development opportunities.',
    image: businessImg,
    link: '/circles'
  },
];

const datingClub = {
  id: 'slow-dating',
  category: 'Dating',
  title: 'Intentional Connections',
  description: 'Curated matches based on deep compatibility. Move beyond the swipe and engage in meaningful, expertly facilitated social environments designed to foster genuine romantic partnerships.',
  image: slowDatingImg,
  link: '/slow-dating'
};

// Mobile-only portrait card
const CircleCardMobile = ({ club }: { club: typeof clubs[0] }) => {
  return (
    <Link
      to={club.link}
      className="relative rounded-2xl overflow-hidden group border border-border bg-black w-[75vw] min-w-[280px] snap-center shrink-0"
      style={{ aspectRatio: '3/4' }}
    >
      <img src={club.image} alt={club.title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10" />
      <div className="absolute inset-x-0 bottom-0 p-6 z-20 flex flex-col justify-end">
        <h3 className="font-display text-2xl text-white mb-2 leading-tight">{club.title}</h3>
        <p className="text-sm font-light leading-snug text-white/80 line-clamp-2">{club.description}</p>
      </div>
    </Link>
  );
};

// Desktop zigzag row card (like the dating card)
const ZigzagCard = ({ club, reverse }: { club: typeof clubs[0]; reverse: boolean }) => {
  return (
    <Link
      to={club.link}
      className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} overflow-hidden group border border-border bg-card transition-all duration-200 hover:border-[hsl(var(--accent-gold))]`}
    >
      <div className="relative overflow-hidden w-full md:w-1/2 h-[320px] md:h-auto md:min-h-[360px]">
        <img src={club.image} alt={club.title} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] font-medium rounded-full border border-[hsl(var(--accent-gold))]/30 text-[hsl(var(--accent-gold))] bg-black/60 backdrop-blur-md">
            {club.category}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80 mix-blend-multiply" />
      </div>
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-card text-foreground">
        <h3 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground dark:text-white mb-4">{club.title}</h3>
        <p className="text-sm md:text-base font-light leading-relaxed text-foreground/80 dark:text-white/90 max-w-[500px] mb-8">{club.description}</p>
        <div>
          <span className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium border border-[hsl(var(--accent-gold))]/60 text-[hsl(var(--accent-gold))] group-hover:bg-[hsl(var(--accent-gold))] group-hover:text-black transition-colors duration-200">
            Explore
          </span>
        </div>
      </div>
    </Link>
  );
};

export const ClubShowcaseSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="section-spacing bg-background overflow-hidden" id="collections">
      <div className="content-container mb-12">
        <div className="section-header">
          <span className="eyebrow block mb-3 text-[hsl(var(--accent-gold))] text-gold">Curated Collections</span>
          <h2 className="font-display text-3xl md:text-[44px] text-foreground leading-[1.1] mb-4">
            Our <span className="italic text-[hsl(var(--accent-gold))]">Circles</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Find your people. Our curated circles bring together exceptional individuals around shared passions, industries, and stages of life.
          </p>
        </div>
      </div>

      <div ref={ref} className={`transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Mobile: Horizontal scroll for circle cards */}
        <div className="md:hidden px-4">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 -mx-4 px-4">
            {[...clubs, { ...datingClub, category: datingClub.category }].map((club) => (
              <CircleCardMobile key={club.id} club={club} />
            ))}
          </div>
        </div>

        {/* Desktop: Zigzag full-width cards */}
        <div className="hidden md:flex flex-col content-container">
          {[...clubs, datingClub].map((club, i) => (
            <ZigzagCard key={club.id} club={club} reverse={i % 2 !== 0} />
          ))}
        </div>
      </div>

      {/* See All — gold text link */}
      <div className={`content-container mt-16 flex justify-center transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <Link
          to="/circles"
          className="text-sm text-[hsl(var(--accent-gold))] hover:text-[hsl(var(--accent-gold-light))] transition-colors duration-150 tracking-[0.08em]"
        >
          See all circles →
        </Link>
      </div>
    </section>
  );
};
