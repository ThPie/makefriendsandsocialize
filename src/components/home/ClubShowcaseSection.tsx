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
        link: '/founders-circle',
    },
    {
        id: 'gentlemen',
        category: 'Society',
        title: 'The Gentlemen',
        description: 'A circle for the modern man of substance and style. Experience curated tastings, tailored networking events, and camaraderie steeped in heritage and modern refinement.',
        image: gentlemenImg,
        link: '/circles/the-gentlemen',
    },
    {
        id: 'les-amis',
        category: 'Social',
        title: 'Les Amis',
        description: 'Casual gatherings for close friends and allies. Enjoy relaxed dining, cultural outings, and vibrant conversations in a warm, welcoming, and inclusive atmosphere.',
        image: lesAmisImg,
        link: '/circles/les-amis',
    },
    {
        id: 'women-society',
        category: 'Society',
        title: 'The Ladies Society',
        description: 'Empowering connections for visionary women. A sanctuary for female leaders and creatives to collaborate, inspire, and elevate one another through exclusive wellness.',
        image: womenSocietyImg,
        link: '/circles',
    },
    {
        id: 'business-circle',
        category: 'Business',
        title: 'Business Circle',
        description: 'Strategic connections for entrepreneurs and executives. Unlock exclusive industry insights and transformative professional development opportunities.',
        image: businessImg,
        link: '/circles',
    },
    {
        id: 'slow-dating',
        category: 'Dating',
        title: 'Intentional Connections',
        description: 'Curated matches based on deep compatibility. Move beyond the swipe and engage in meaningful, expertly facilitated social environments designed to foster genuine romantic partnerships.',
        image: slowDatingImg,
        link: '/slow-dating',
    },
];

export const ClubShowcaseSection = () => {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section className="section-spacing bg-background overflow-hidden" id="collections">
            <div className="content-container mb-12">
                {/* Section header */}
                <div className="max-w-2xl">
                    <span className="eyebrow block mb-3">Curated Collections</span>
                    <h2 className="font-display text-3xl md:text-[44px] text-foreground leading-[1.1] mb-6">
                        Our <span className="italic text-[hsl(var(--accent-gold))]">Circles</span>
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Find your people. Our curated circles bring together exceptional individuals around shared passions, industries, and stages of life, fostering deep connections that go beyond the surface.
                    </p>
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div
                ref={ref}
                className={`content-container grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6 xl:gap-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
                {clubs.map((club, i) => {
                    const Icon = getIconForCategory(club.category);

                    // Determine grid positioning based on index
                    let colSpanClass = "md:col-span-6"; // Default/Mobile fallback
                    let imageAspectClass = "aspect-[4/3]";

                    if (i === 0 || i === 1) {
                        // Top two are large 50/50
                        colSpanClass = "md:col-span-3";
                        imageAspectClass = "h-[320px] md:h-[460px]";
                    } else if (i >= 2 && i <= 4) {
                        // Middle three are smaller 33/33/33
                        colSpanClass = "md:col-span-2";
                        imageAspectClass = "h-[240px] md:h-[320px]";
                    } else if (i === 5) {
                        // Last one is full width landscape
                        colSpanClass = "md:col-span-6";
                        imageAspectClass = "h-[320px] md:h-[500px]";
                    }

                    // Determine if this is the full-width item (index 5)
                    const isFullWidth = i === 5;

                    return (
                        <Link
                            key={club.id}
                            to={club.link}
                            className={`flex ${isFullWidth ? 'flex-col md:flex-row-reverse' : 'flex-col'} rounded-2xl overflow-hidden group border border-border bg-card transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-[hsl(var(--accent-gold))] hover:shadow-[hsl(var(--accent-gold))]/20 ${colSpanClass}`}
                            style={{ transitionDelay: `${i * 100}ms` }}
                        >
                            {/* Image Portion */}
                            <div className={`relative overflow-hidden ${isFullWidth ? 'w-full md:w-1/2 h-[320px] md:h-auto' : `w-full ${imageAspectClass}`}`}>
                                <img
                                    src={club.image}
                                    alt={club.title}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {/* Category badge — top left */}
                                <div className="absolute top-4 left-4 z-10">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] font-medium rounded-full border border-[hsl(var(--accent-gold))]/30 text-[hsl(var(--accent-gold))] shadow-sm bg-black/60 backdrop-blur-md">
                                        {club.category}
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80 mix-blend-multiply" />
                            </div>

                            {/* Content Portion */}
                            <div className={`flex flex-col flex-grow relative overflow-hidden ${isFullWidth ? 'w-full md:w-1/2 p-8 md:p-16 flex justify-center bg-[#101e17] text-white' : 'p-6 md:p-8'}`}>
                                {/* Subtle gold top border effect on hover (only for vertical cards) */}
                                {!isFullWidth && (
                                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--accent-gold))]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                )}

                                <div className="flex items-center gap-3 mb-4">
                                    {!isFullWidth && <Icon className="w-5 h-5 text-[hsl(var(--accent-gold))]" strokeWidth={1.5} />}
                                    <h3 className={`font-display ${isFullWidth ? 'text-4xl md:text-5xl lg:text-6xl text-white' : 'text-2xl md:text-3xl text-foreground'}`}>
                                        {club.title}
                                    </h3>
                                </div>
                                <p className={`text-sm md:text-base font-light leading-relaxed ${isFullWidth ? 'text-white/90 max-w-[500px] mb-8' : 'text-muted-foreground'}`}>
                                    {club.description}
                                </p>

                                {/* "Read more" pill button matching the screenshot specifically for the full width card */}
                                {isFullWidth && (
                                    <div className="mt-auto md:mt-0">
                                        <span className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium border border-[hsl(var(--accent-gold))]/60 text-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))] hover:text-black transition-colors duration-200">
                                            Read more
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* See All Button */}
            <div className={`content-container mt-16 flex justify-center transition-all duration-700 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                <Link
                    to="/circles"
                    className="inline-flex items-center justify-center rounded-full px-8 py-4 text-sm tracking-[0.15em] uppercase font-medium border border-border bg-transparent text-foreground hover:bg-muted transition-colors duration-200"
                >
                    See all circles
                </Link>
            </div>
        </section>
    );
};
