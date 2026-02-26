import { Link } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Assets
import lesAmisImg from '@/assets/les-amis-hero-new.webp';
import gentlemenImg from '@/assets/gentlemen-hero-new.webp';
import womenSocietyImg from '@/assets/women-society-hero.jpg';
import foundersImg from '@/assets/founders-hero-new.jpg';
import slowDatingImg from '@/assets/slow-dating-new.jpg';
import businessImg from '@/assets/business-hero.jpg';

const clubs = [
  {
    id: 'founders',
    category: 'Exclusive',
    title: 'Founders Circle',
    description: 'Where visionaries shape the future. Join an elite collective of entrepreneurs, founders, and industry disruptors redefining what it means to build something meaningful.',
    image: foundersImg,
    link: '/founders-circle'
  },
  {
    id: 'gentlemen',
    category: 'Society',
    title: 'The Gentlemen',
    description: 'A circle for the modern man of substance and style. Experience curated tastings, tailored networking events, and conversations that matter with like-minded individuals.',
    image: gentlemenImg,
    link: '/circles/the-gentlemen'
  },
  {
    id: 'les-amis',
    category: 'Social',
    title: 'Les Amis',
    description: 'Casual gatherings for close friends and allies. Enjoy relaxed dining, cultural outings, and vibrant conversations in an intimate, welcoming atmosphere.',
    image: lesAmisImg,
    link: '/circles/les-amis'
  },
  {
    id: 'women-society',
    category: 'Society',
    title: 'The Ladies Society',
    description: 'Empowering connections for visionary women. A sanctuary for female leaders and creatives to collaborate, inspire, and elevate each other through curated experiences.',
    image: womenSocietyImg,
    link: '/circles'
  },
  {
    id: 'business-circle',
    category: 'Business',
    title: 'Business Circle',
    description: 'Strategic connections for entrepreneurs and executives. Unlock exclusive industry insights, partnership opportunities, and expert-led masterclasses.',
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

const CircleCard = ({ club }: { club: typeof clubs[0] }) => {
  return (
    <Link
      to={club.link}
      className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[hsl(var(--accent-gold))]/40 min-w-[220px] w-[220px] md:min-w-0 md:w-[calc((100%-60px)/3.5)] shrink-0 snap-center"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={club.image}
          alt={club.title}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      {/* Text content below image */}
      <div className="p-5 flex flex-col gap-2 flex-1">
        <h3 className="font-display text-xl md:text-2xl text-foreground leading-tight">{club.title}</h3>
        <p className="text-sm font-light leading-relaxed text-muted-foreground line-clamp-3">{club.description}</p>
        <span className="mt-auto pt-3 text-xs uppercase tracking-[0.15em] text-[hsl(var(--accent-gold))] font-medium">
          Explore →
        </span>
      </div>
    </Link>
  );
};

export const ClubShowcaseSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollState);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 300;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="section-spacing bg-background overflow-hidden" id="collections">
      <div className="content-container mb-8">
        <div className="flex items-end justify-between">
          <div>
            <span className="eyebrow block mb-3 text-[hsl(var(--accent-gold))] text-gold">Curated Collections</span>
            <h2 className="font-display text-3xl md:text-[44px] text-foreground leading-[1.1]">
              Our <span className="italic text-[hsl(var(--accent-gold))]">Circles</span>
            </h2>
          </div>
          {/* Desktop nav arrows */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-foreground/30 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-foreground/30 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div ref={ref} className={`transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Horizontal scroll for all screen sizes */}
        <div className="content-container">
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
          >
            {clubs.map((club) => (
              <CircleCard key={club.id} club={club} />
            ))}
          </div>
        </div>

        {/* Dating card — standalone, full width */}
        <div className="content-container mt-6 md:mt-8">
          <Link
            to={datingClub.link}
            className="flex flex-col md:flex-row-reverse rounded-2xl overflow-hidden group border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-[hsl(var(--accent-gold))]/40"
          >
            <div className="relative overflow-hidden w-full md:w-1/2 h-[320px] md:h-auto">
              <img src={datingClub.image} alt={datingClub.title} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
              <div className="absolute top-4 left-4 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] font-medium rounded-full border border-[hsl(var(--accent-gold))]/30 text-[hsl(var(--accent-gold))] bg-black/60 backdrop-blur-md">
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

      {/* See All */}
      <div className={`content-container mt-16 flex justify-center transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
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
