import { Link, useNavigate } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Assets
import gentlemenImg from '@/assets/gentlemen-circle-stock.webp';
import womenSocietyImg from '@/assets/women-society-hero.webp';
import foundersImg from '@/assets/founders-hero-new.webp';
import slowDatingImg from '@/assets/slow-dating-new.webp';
import lesAmisImg from '@/assets/les-amis-circle-stock.webp';
import exchangeImg from '@/assets/exchange-circle-stock.webp';
import couplesCircleImg from '@/assets/couples-circle-stock.webp';

// Active & Outdoor uses golf-themed imagery
import activeOutdoorImg from '@/assets/active-outdoor-hero-new.webp';

const clubs = [
  {
    id: 'founders',
    category: 'Exclusive',
    title: 'Founders Circle',
    description: 'Where visionaries shape the future. Join an elite collective of entrepreneurs, founders, and industry disruptors redefining what it means to build something meaningful. Strategic connections, exclusive insights, and expert-led masterclasses.',
    image: foundersImg,
    link: '/founders-circle'
  },
  {
    id: 'gentlemen',
    category: 'Society',
    title: 'The Gentlemen',
    description: 'A circle for the modern man of substance and style. Experience exclusive tastings, tailored networking events, and conversations that matter with like-minded individuals.',
    image: gentlemenImg,
    link: '/circles/the-gentlemen'
  },
  {
    id: 'les-amis',
    category: 'Social',
    title: 'Les Amis',
    description: 'A circle for French speakers in Utah. Since there aren\'t many of us here, we created this space to gather, share our culture, and build lasting friendships through thoughtfully designed Francophone events.',
    image: lesAmisImg,
    link: '/circles/les-amis'
  },
  {
    id: 'women-society',
    category: 'Society',
    title: 'The Ladies Society',
    description: 'Empowering connections for visionary women. A sanctuary for female leaders and creatives to collaborate, inspire, and elevate each other through bespoke experiences.',
    image: womenSocietyImg,
    link: '/circles/the-ladies-society'
  },
  {
    id: 'couples-circle',
    category: 'Couples',
    title: "Couple's Circle",
    description: 'A private sanctuary for couples to connect, share experiences, and build lasting friendships together through intimate dinner parties and exclusive retreats.',
    image: couplesCircleImg,
    link: '/circles/couples-circle'
  },
  {
    id: 'active-outdoor',
    category: 'Lifestyle',
    title: 'Active & Outdoor',
    description: 'For members who view movement and vitality as essential pillars of a life well-lived. Golf pairings, cycling tours, wellness retreats, and more.',
    image: activeOutdoorImg,
    link: '/circles/active-outdoor'
  },
  {
    id: 'the-exchange',
    category: 'Learning',
    title: 'The Exchange',
    description: 'Learn, teach, and share knowledge across every field — from technology and business to cooking classes and bike repair workshops.',
    image: exchangeImg,
    link: '/circles/the-exchange'
  },
];

const datingClub = {
  id: 'slow-dating',
  category: 'Dating',
  title: 'Slow Dating',
  description: 'Handpicked matches based on deep compatibility. Move beyond the swipe and engage in meaningful, expertly facilitated social environments designed to foster genuine romantic partnerships.',
  image: slowDatingImg,
};

const CircleCard = ({ club }: { club: typeof clubs[0] }) => (
  <Link
    to={club.link}
    className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[hsl(var(--accent-gold))]/40 min-w-[78vw] w-[78vw] md:min-w-0 md:w-[calc((100%-60px)/3.5)] shrink-0 snap-center"
  >
    <div className="relative aspect-[4/4] overflow-hidden">
      <img src={club.image} alt={club.title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
    </div>
    <div className="p-5 flex flex-col gap-2 flex-1">
      <h3 className="font-display text-xl md:text-2xl text-foreground leading-tight">{club.title}</h3>
      <p className="text-sm font-light leading-relaxed text-muted-foreground line-clamp-3">{club.description}</p>
      <span className="mt-auto pt-3 text-xs uppercase tracking-[0.15em] text-[hsl(var(--accent-gold))] font-medium">Explore →</span>
    </div>
  </Link>
);

export const ClubShowcaseSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const animationRef = useRef<number | null>(null);
  const scrollSpeedRef = useRef(0);

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

  // Auto-scroll animation — only runs while mouse is over the strip
  const startScrollLoop = useCallback(() => {
    if (animationRef.current) return;
    const tick = () => {
      const el = scrollRef.current;
      if (el && scrollSpeedRef.current !== 0) {
        el.scrollLeft += scrollSpeedRef.current;
      }
      animationRef.current = requestAnimationFrame(tick);
    };
    animationRef.current = requestAnimationFrame(tick);
  }, []);

  const stopScrollLoop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    scrollSpeedRef.current = 0;
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width; // 0 = left edge, 1 = right edge
    const deadZone = 0.15; // 15% dead zone in center each side
    if (pct < 0.5 - deadZone) {
      // Left side — scroll left, speed increases toward edge
      const intensity = 1 - pct / (0.5 - deadZone);
      scrollSpeedRef.current = -intensity * 6;
    } else if (pct > 0.5 + deadZone) {
      // Right side — scroll right
      const intensity = (pct - (0.5 + deadZone)) / (0.5 - deadZone);
      scrollSpeedRef.current = intensity * 6;
    } else {
      scrollSpeedRef.current = 0;
    }
  };

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  const handleMatchmakingClick = () => {
    if (user) {
      navigate('/dating/apply');
    } else {
      navigate('/auth?redirect=/dating/apply');
    }
  };

  return (
    <section className="section-spacing bg-background overflow-hidden" id="collections">
      <div className="content-container mb-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="eyebrow block mb-3 text-[hsl(var(--accent-gold))]">Exclusive Collections</span>
          <h2 className="font-display text-3xl md:text-[44px] text-foreground leading-[1.1]">
            Our <span className="italic text-[hsl(var(--accent-gold))]">Circles</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base font-light mt-4">
            Discover our handpicked communities, each designed for a unique way to connect, grow, and belong.
          </p>
        </div>
      </div>

      <div ref={ref} className={`transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="content-container">
          <div ref={scrollRef} onMouseEnter={startScrollLoop} onMouseMove={handleMouseMove} onMouseLeave={stopScrollLoop} className="flex gap-5 overflow-x-auto snap-x snap-mandatory md:snap-none scrollbar-hide pb-4">
            {clubs.map((club) => (
              <CircleCard key={club.id} club={club} />
            ))}
          </div>

          <div className="hidden md:flex items-center justify-center gap-2 mt-6">
            <button onClick={() => scroll('left')} disabled={!canScrollLeft} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-foreground/30 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Scroll left">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll('right')} disabled={!canScrollRight} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-foreground/30 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Scroll right">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dating card */}
        <div className="content-container mt-6 md:mt-8">
          <div
            onClick={handleMatchmakingClick}
            className="flex flex-col md:flex-row-reverse rounded-2xl overflow-hidden group border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-[hsl(var(--accent-gold))]/40 cursor-pointer"
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
                <h3 className="font-display text-2xl md:text-3xl text-foreground dark:text-white">{datingClub.title}</h3>
              </div>
              <p className="text-sm md:text-base font-light leading-relaxed text-foreground/80 dark:text-white/90 max-w-[500px] mb-8">{datingClub.description}</p>
              <div>
                <span className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium border border-[hsl(var(--accent-gold))]/60 text-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))] hover:text-black transition-colors duration-200">
                  Apply MatchMaking
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`content-container mt-16 flex justify-center transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <Link to="/circles" className="text-sm text-[hsl(var(--accent-gold))] hover:text-[hsl(var(--accent-gold-light))] transition-colors duration-150 tracking-[0.15em] uppercase">
          See All Circles →
        </Link>
      </div>
    </section>
  );
};
