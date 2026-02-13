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
        color: 'from-amber-900/40',
        className: 'md:col-span-2 md:row-span-2'
    },
    {
        id: 'gentlemen',
        title: 'The Gentlemen',
        description: 'The premier brotherhood for ambitious men.',
        image: gentlemenImg,
        link: '/circles/the-gentlemen',
        color: 'from-slate-900/40',
        className: 'md:col-span-1 md:row-span-2'
    },
    {
        id: 'women-society',
        title: 'The Women Society',
        description: 'Empowering women to lead and inspire.',
        image: womenSocietyImg,
        link: '/circles',
        color: 'from-rose-900/40',
        className: 'md:col-span-1 md:row-span-1'
    },
    {
        id: 'slow-dating',
        title: 'Slow Dating',
        description: 'Curated matches based on deep compatibility.',
        image: slowDatingImg,
        link: '/slow-dating',
        color: 'from-red-900/40',
        className: 'md:col-span-1 md:row-span-1'
    },
    {
        id: 'founders',
        title: 'Founders Circle',
        description: 'Where visionaries shape the future.',
        image: foundersImg,
        link: '/founders-circle',
        color: 'from-emerald-900/40',
        className: 'md:col-span-1 md:row-span-1'
    }
];

export const ClubShowcaseSection = () => {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section className="w-full bg-background py-24 md:py-32 overflow-hidden">
            <div ref={ref} className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>

                {/* Section Header */}
                <div className="container max-w-[1400px] mb-12 flex flex-col items-center text-center px-6">
                    <div className="inline-flex items-center gap-2 border border-primary/30 rounded-full px-4 py-1.5 backdrop-blur-sm mb-6">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-xs font-medium text-primary tracking-wider uppercase">Our Societies</span>
                    </div>
                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[0.9] mb-6">
                        Curated <span className="text-muted-foreground font-serif italic">Collections</span>
                    </h2>
                    <p className="text-muted-foreground max-w-lg text-lg leading-relaxed">
                        Discover the exclusive circles that define our community. Each one a unique world of connection.
                    </p>
                </div>

                {/* Bento Grid Container */}
                <div className="container max-w-[1400px] px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                        {clubs.map((club, index) => (
                            <Link
                                key={club.id}
                                to={club.link}
                                className={`group relative rounded-[2rem] overflow-hidden cursor-pointer ${club.className}`}
                            >
                                {/* Background Image */}
                                <img
                                    src={club.image}
                                    alt={club.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />

                                {/* Overlays */}
                                <div className={`absolute inset-0 bg-gradient-to-t ${club.color} via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80`} />
                                <div className="absolute inset-0 bg-black/20 transition-colors duration-500 group-hover:bg-black/10" />

                                {/* Content */}
                                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                    {/* Top Area */}
                                    <div className="flex justify-between items-start">
                                        <span className="inline-flex items-center justify-center px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium text-white/90 uppercase tracking-wider border border-white/10">
                                            {club.title}
                                        </span>
                                        <div className="bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                            <ArrowUpRight className="w-5 h-5 text-white" />
                                        </div>
                                    </div>

                                    {/* Bottom Area */}
                                    <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                                        <p className="text-white text-lg md:text-2xl font-display leading-tight max-w-[90%]">
                                            {club.description}
                                        </p>
                                        <div className="mt-4 flex items-center gap-2 text-white/70 text-sm font-medium opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75">
                                            <span>Explore</span>
                                            <ArrowUpRight className="w-4 h-4" />
                                        </div>
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
