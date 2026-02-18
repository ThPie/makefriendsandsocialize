import { Link } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// Assets
import lesAmisImg from '@/assets/les-amis-hero-new.webp';
import gentlemenImg from '@/assets/gentlemen-hero-new.webp';
import womenSocietyImg from '@/assets/women-society-hero.jpg';
import foundersImg from '@/assets/founders-hero-new.jpg';
import slowDatingImg from '@/assets/slow-dating-new.jpg';

const clubs = [
    {
        id: 'founders',
        category: 'Exclusive',
        title: 'Founders Circle',
        description: 'Where visionaries shape the future.',
        image: foundersImg,
        link: '/founders-circle',
    },
    {
        id: 'gentlemen',
        category: 'Society',
        title: 'The Gentlemen',
        description: 'A circle for the modern man of substance and style.',
        image: gentlemenImg,
        link: '/circles/the-gentlemen',
    },
    {
        id: 'les-amis',
        category: 'Social',
        title: 'Les Amis',
        description: 'Casual gatherings for close friends and allies.',
        image: lesAmisImg,
        link: '/circles/les-amis',
    },
    {
        id: 'women-society',
        category: 'Society',
        title: 'The Ladies Society',
        description: 'Empowering connections for visionary women.',
        image: womenSocietyImg,
        link: '/circles',
    },
    {
        id: 'slow-dating',
        category: 'Dating',
        title: 'Slow Dating',
        description: 'Curated matches based on deep compatibility.',
        image: slowDatingImg,
        link: '/slow-dating',
    }
];

export const ClubShowcaseSection = () => {
    const { ref, isVisible } = useScrollAnimation();

    const scrollLeft = () => {
        document.getElementById('collections-scroll')?.scrollBy({ left: -300, behavior: 'smooth' });
    };

    const scrollRight = () => {
        document.getElementById('collections-scroll')?.scrollBy({ left: 300, behavior: 'smooth' });
    };

    return (
        <section className="w-full overflow-hidden pb-12" id="collections">
            <div ref={ref} className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>

                {/* Section Header */}
                <div className="px-6 mb-6 flex items-center justify-between max-w-4xl mx-auto">
                    <h3 className="text-2xl text-white font-medium italic font-display">Curated Collections</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={scrollLeft}
                            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={scrollRight}
                            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Horizontal Scroll Container */}
                <div
                    id="collections-scroll"
                    className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory px-6 max-w-4xl mx-auto"
                >
                    {clubs.map((club) => (
                        <Link
                            key={club.id}
                            to={club.link}
                            className="snap-start min-w-[280px] h-[360px] relative rounded-lg overflow-hidden group cursor-pointer border border-white/5 shrink-0"
                        >
                            {/* Background Image */}
                            <img
                                src={club.image}
                                alt={club.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 p-6 w-full">
                                <p className="text-[#d4af37] text-xs tracking-widest uppercase font-bold mb-2 font-sans">
                                    {club.category}
                                </p>
                                <h4 className="text-2xl text-white font-medium italic mb-2 font-display">
                                    {club.title}
                                </h4>
                                <p className="text-white/70 text-sm font-sans line-clamp-2">
                                    {club.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

            </div>
        </section>
    );
};
