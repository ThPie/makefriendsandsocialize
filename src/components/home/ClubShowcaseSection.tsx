import { Link } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

import lesAmisImg from '@/assets/les-amis-hero-new.webp';
import gentlemenImg from '@/assets/gentlemen-hero-new.webp';
import womenSocietyImg from '@/assets/women-society-hero.jpg';
import foundersImg from '@/assets/founders-hero-new.jpg';
import slowDatingImg from '@/assets/slow-dating-new.jpg';
import businessImg from '@/assets/business-hero.jpg';

const clubs = [
  { id: 'founders', category: 'Exclusive', title: 'Founders Circle', description: 'Where visionaries shape the future.', image: foundersImg, link: '/founders-circle' },
  { id: 'gentlemen', category: 'Society', title: 'The Gentlemen', description: 'A circle for the modern man of substance and style.', image: gentlemenImg, link: '/circles/the-gentlemen' },
  { id: 'les-amis', category: 'Social', title: 'Les Amis', description: 'Casual gatherings for close friends and allies.', image: lesAmisImg, link: '/circles/les-amis' },
  { id: 'women-society', category: 'Society', title: 'The Ladies Society', description: 'Empowering connections for visionary women.', image: womenSocietyImg, link: '/circles' },
  { id: 'slow-dating', category: 'Dating', title: 'Intentional Connections', description: 'Curated matches based on deep compatibility.', image: slowDatingImg, link: '/slow-dating' },
  { id: 'business-circle', category: 'Business', title: 'Business Circle', description: 'Strategic connections for entrepreneurs and executives.', image: businessImg, link: '/circles' },
];

export const ClubShowcaseSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-20 md:py-32 bg-background" id="collections">
      <div ref={ref} className={`max-w-[1200px] mx-auto transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        <div className="mb-12">
          <span className="section-label mb-3 block">Collections</span>
          <h2 className="font-display text-4xl md:text-5xl font-normal text-foreground">
            Curated <span className="italic text-[hsl(var(--gold))]">Circles</span>
          </h2>
        </div>

        {/* Asymmetric Bento Grid — Desktop */}
        <div className="hidden lg:grid grid-cols-12 gap-4">
          {/* Row 1: 7 + 5 */}
          <BentoCard club={clubs[0]} className="col-span-7 h-[420px]" />
          <BentoCard club={clubs[1]} className="col-span-5 h-[420px]" />
          {/* Row 2: 5 + 7 */}
          <BentoCard club={clubs[2]} className="col-span-5 h-[420px]" />
          <BentoCard club={clubs[3]} className="col-span-7 h-[420px]" />
          {/* Row 3: 3 equal */}
          <BentoCard club={clubs[4]} className="col-span-4 h-[380px]" />
          <BentoCard club={clubs[5]} className="col-span-4 h-[380px]" />
          <BentoCard club={clubs[0]} className="col-span-4 h-[380px]" />
        </div>

        {/* Mobile: Single column */}
        <div className="lg:hidden flex flex-col gap-4">
          {clubs.map((club) => (
            <BentoCard key={club.id} club={club} className="h-[320px]" />
          ))}
        </div>
      </div>
    </section>
  );
};

function BentoCard({ club, className = '' }: { club: typeof clubs[0]; className?: string }) {
  return (
    <Link
      to={club.link}
      className={`relative rounded-2xl overflow-hidden group cursor-pointer border border-border hover:border-[hsl(var(--gold))]/60 transition-colors duration-200 ${className}`}
    >
      <img
        src={club.image}
        alt={club.title}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Category badge */}
      <div className="absolute top-4 left-4">
        <span className="inline-flex px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-medium border border-[hsl(var(--gold))]/40 text-white/90 bg-black/30 backdrop-blur-sm">
          {club.category}
        </span>
      </div>

      {/* Title + description */}
      <div className="absolute bottom-0 left-0 p-6 w-full">
        <h3 className="font-display text-2xl md:text-[28px] italic text-white mb-1">
          {club.title}
        </h3>
        <p className="text-[13px] font-light text-white/60 line-clamp-2">
          {club.description}
        </p>
      </div>
    </Link>
  );
}
