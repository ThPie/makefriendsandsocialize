import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

// Assets
import lesAmisImg from '@/assets/les-amis-hero-new.webp';
import gentlemenImg from '@/assets/gentlemen-hero-new.webp';
import slowDatingImg from '@/assets/slow-dating-new.jpg';
import foundersImg from '@/assets/contact-hero.jpg';

// Placeholder for Women Society until asset is provided
const womenSocietyImg = "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2938&auto=format&fit=crop";

const clubs = [
    {
        id: 'les-amis',
        title: 'Les Amis',
        description: 'A global community for cultural exchange and authentic connection.',
        image: lesAmisImg,
        link: '/circles/les-amis',
        color: 'from-amber-900/40' // Warm tone
    },
    {
        id: 'gentlemen',
        title: 'The Gentlemen',
        description: 'The premier brotherhood for ambitious men refining their legacy.',
        image: gentlemenImg,
        link: '/circles/the-gentlemen',
        color: 'from-slate-900/40' // Cool/Dark tone
    },
    {
        id: 'women-society',
        title: 'The Women Society',
        description: 'Empowering women to lead, inspire, and elevate one another.',
        image: womenSocietyImg,
        link: '/circles', // Using generic circles link as specific route wasn't found
        color: 'from-rose-900/40' // Soft/Elegant tone
    },
    {
        id: 'slow-dating',
        title: 'Slow Dating',
        description: 'Curated matches based on deep compatibility, not algorithms.',
        image: slowDatingImg,
        link: '/slow-dating',
        color: 'from-red-900/40' // Romantic tone
    },
    {
        id: 'founders',
        title: 'Founders Circle',
        description: 'Where visionaries and entrepreneurs shape the future together.',
        image: foundersImg,
        link: '/founders-circle',
        color: 'from-emerald-900/40' // Wealth/Growth tone
    }
];

export const ClubShowcaseSection = () => {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section className="w-full bg-background py-20 md:py-32 px-4 md:px-8 overflow-hidden">
            <div ref={ref} className={`max-w-[1400px] mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>

                {/* Section Header */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 border border-primary/30 rounded-full px-4 py-1.5 mb-2">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-primary"></span>
                        <span className="text-xs font-medium text-primary tracking-wider uppercase">Our Societies</span>
                    </div>
                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                        Curated <span className="text-muted-foreground font-serif italic">Collections</span>
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto text-lg pt-2">
                        Discover the exclusive circles that define our community.
                    </p>
                </div>

                {/* Scrollable Container for Mobile / Grid for Desktop */}
                <div className="flex overflow-x-auto pb-8 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-4 snap-x snap-mandatory scrollbar-none">
                    {clubs.map((club) => (
                        <Link
                            key={club.id}
                            to={club.link}
                            className="group relative flex-none w-[85vw] md:w-full snap-center aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
                        >
                            {/* Background Image */}
                            <img
                                src={club.image}
                                alt={club.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Overlay Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-t ${club.color} via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-90`} />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />

                            {/* Content */}
                            <div className="absolute inset-0 p-6 flex flex-col justify-end translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                {/* Top Right Arrow */}
                                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                    <ArrowUpRight className="w-5 h-5 text-white" />
                                </div>

                                <h3 className="font-display text-2xl font-bold text-white mb-2 transform transition-transform duration-500 group-hover:-translate-y-1">
                                    {club.title}
                                </h3>

                                <p className="text-white/80 text-sm leading-relaxed opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 transition-all duration-500 delay-75 overflow-hidden">
                                    {club.description}
                                </p>

                                {/* "Explore" Label - Visible by default, hidden on hover to make room for description? 
                    Actually, let's keep it consistent. The request said "modern, minimal".
                    Let's just show the description sliding up.
                */}
                                <div className="h-1 w-12 bg-white/50 rounded-full mt-4 group-hover:w-full group-hover:bg-primary transition-all duration-700" />
                            </div>
                        </Link>
                    ))}
                </div>

            </div>
        </section>
    );
};
