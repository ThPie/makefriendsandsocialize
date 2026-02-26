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

const CircleCard = ({ club, className = '' }: { club: typeof clubs[0]; className?: string }) => {
  const Icon = getIconForCategory(club.category);
  return (
    <Link
      to={club.link}
      className={`relative rounded-[2rem] overflow-hidden group border-none bg-black transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[hsl(var(--accent-gold))]/20 ${className}`}
      style={{ aspectRatio: '3/4' }}
    >
      <img src={club.image} alt={club.title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

      <div className="absolute top-4 right-4 z-20">
        <div className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center border border-white/20 transition-colors group-hover:bg-white/20">
          <Icon className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10" />

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 z-20 flex flex-col justify-end">
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} className="w-4 h-4 text-[hsl(var(--accent-gold))] fill-current shadow-sm" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-white text-sm font-medium ml-1">5.0</span>
        </div>

        <h3 className="font-display text-2xl md:text-3xl text-white mb-2 leading-tight drop-shadow-md">{club.title}</h3>
        <p className="text-sm font-light leading-snug text-white/80 line-clamp-2 transition-colors">{club.description}</p>
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
            {clubs.map((club) => (
              <CircleCard key={club.id} club={club} className="w-[75vw] min-w-[280px] snap-center shrink-0" />
            ))}
          </div>
        </div>

        {/* Desktop: Bento grid for circle cards */}
        <div className="hidden md:grid content-container grid-cols-6 gap-6 xl:gap-8">
          {clubs.map((club, i) => {
            const colSpanClass = i < 2 ? 'md:col-span-3' : 'md:col-span-2';
            return <CircleCard key={club.id} club={club} className={colSpanClass} />;
          })}
        </div>

        {/* Dating card — standalone, full width */}
        <div className="content-container mt-6 md:mt-8">
          <Link
            to={datingClub.link}
            className="flex flex-col md:flex-row-reverse rounded-2xl overflow-hidden group border border-border bg-card transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-[hsl(var(--accent-gold))] hover:shadow-[hsl(var(--accent-gold))]/20"
          >
            <div className="relative overflow-hidden w-full md:w-1/2 h-[320px] md:h-auto">
              <img src={datingClub.image} alt={datingClub.title} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute top-4 left-4 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] font-medium rounded-full border border-[hsl(var(--accent-gold))]/30 text-[hsl(var(--accent-gold))] shadow-sm bg-black/60 backdrop-blur-md">
                  {datingClub.category}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80 mix-blend-multiply" />
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-card text-foreground">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground dark:text-white">{datingClub.title}</h3>
              </div>
              <p className="text-sm md:text-base font-light leading-relaxed text-foreground/80 dark:text-white/90 max-w-[500px] mb-8">{datingClub.description}</p>
              <div>
                <span className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium border border-[hsl(var(--accent-gold))]/60 text-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))] hover:text-black transition-colors duration-200">
                  Read more
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* See All — gold text arrow */}
      <div className={`content-container mt-16 flex justify-center transition-all duration-700 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <Link
          to="/circles"
          className="text-sm text-[hsl(var(--accent-gold))] hover:text-[hsl(var(--accent-gold-light))] transition-colors duration-150 tracking-[0.15em] uppercase"
        >
          See All Circles →
        </Link>
      </div>
    </section>
  );
};
