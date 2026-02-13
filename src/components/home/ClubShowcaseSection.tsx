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
        <section className="w-full bg-background py-24 md:py-32 overflow-hidden">
            <div ref={ref} className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>

                {/* Section Header */}
                <div className="container max-w-[1400px] mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 px-6">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 border border-primary/30 rounded-full px-4 py-1.5 backdrop-blur-sm">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                            <span className="text-xs font-medium text-primary tracking-wider uppercase">Our Societies</span>
                        </div>
                        <h2 className="font-display text-4xl md:text-5xl lg:text-7xl font-bold text-foreground leading-[0.9]">
                            Curated <span className="text-muted-foreground font-serif italic">Collections</span>
                        </h2>
                    </div>
                    <p className="text-muted-foreground max-w-sm text-lg leading-relaxed md:pb-2">
                        Discover the exclusive circles that define our community. Each one a unique world of connection.
                    </p>
                </div>

                {/* Horizontal Scroll Container */}
                <div className="relative w-full overflow-x-auto pb-12 px-6 scrollbar-hide">
                    <div className="flex gap-6 w-max">
                        {clubs.map((club, index) => (
                            <Link
                                key={club.id}
                                to={club.link}
                                className="group relative flex-none w-[85vw] md:w-[450px] aspect-[3/4] rounded-[2rem] overflow-hidden cursor-pointer"
                            >
                                {/* Background Image */}
                                <img
                                    src={club.image}
                                    alt={club.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />

                                {/* Overlays */}
                                <div className={`absolute inset-0 bg-gradient-to-t ${club.color} via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80`} />
                                <div className="absolute inset-0 bg-black/20 transition-colors duration-500 group-hover:bg-black/10" />

                                {/* Content */}
                                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                    {/* Top Area */}
                                    <div className="flex justify-between items-start">
                                        <span className="text-white/80 font-mono text-sm tracking-widest">
                                            0{index + 1}
                                        </span>
                                        <div className="bg-white/10 backdrop-blur-md p-3 rounded-full opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                            <ArrowUpRight className="w-6 h-6 text-white" />
                                        </div>
                                    </div>

                                    {/* Bottom Area */}
                                    <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                                        <h3 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
                                            {club.title}
                                        </h3>
                                        <p className="text-white/90 text-lg leading-relaxed max-w-[90%] opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                            {club.description}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};
