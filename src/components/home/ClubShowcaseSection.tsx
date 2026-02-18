import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

// Assets
import lesAmisImg from '@/assets/les-amis-hero-new.webp';
import gentlemenImg from '@/assets/gentlemen-hero-new.webp';
import slowDatingImg from '@/assets/slow-dating-new.jpg';
import foundersImg from '@/assets/founders-hero-new.jpg';
import womenSocietyImg from '@/assets/women-society-hero.jpg';

const clubs = [
    {
        id: 'founders',
        title: 'Founders Circle',
        description: 'Where visionaries shape the future.',
        image: foundersImg,
        link: '/founders-circle',
        color: 'from-emerald-900/40',
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
        id: 'les-amis',
        title: 'Les Amis',
        description: 'A global community for cultural exchange.',
        image: lesAmisImg,
        link: '/circles/les-amis',
        color: 'from-amber-900/40',
        className: 'md:col-span-1 md:row-span-1'
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
    }
];

export const ClubShowcaseSection = () => {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section className="w-full bg-[#051008] py-24 md:py-32 overflow-hidden" id="collections">
            <div ref={ref} className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>

                {/* Section Header */}
                <div className="container max-w-[1400px] mb-16 flex flex-col items-center text-center px-6">
                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-normal text-white italic">
                        Curated Collections
                        <span className="block h-px w-24 bg-[#d4af37]/50 mx-auto mt-6" />
                    </h2>
                    <p className="mt-8 text-white/60 max-w-lg text-lg leading-relaxed font-light">
                        Discover sub-societies tailored to your interests.
                    </p>
                </div>

                {/* Bento Grid Container */}
                <div className="container max-w-[1400px] px-6">
                    <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 no-scrollbar scroll-touch md:grid md:grid-cols-3 md:auto-rows-[400px]">
                        {clubs.map((club, index) => (
                            <Link
                                key={club.id}
                                to={club.link}
                                className={`group relative rounded-none overflow-hidden cursor-pointer min-w-[280px] h-[400px] snap-center shrink-0 md:min-w-0 md:shrink md:snap-align-none border border-white/10 hover:border-[#d4af37]/50 transition-colors duration-500 ${club.className}`}
                            >
                                {/* Background Image */}
                                <img
                                    src={club.image}
                                    alt={club.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-60 group-hover:opacity-40"
                                />

                                {/* Overlays */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                                {/* Content */}
                                <div className="absolute inset-0 p-8 flex flex-col justify-end">

                                    {/* Number */}
                                    <div className="absolute top-8 left-8 text-[#d4af37] font-display text-xl font-bold">
                                        0{index + 1}
                                    </div>

                                    {/* Arrow */}
                                    <div className="absolute top-8 right-8 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                                        <ArrowUpRight className="w-6 h-6 text-[#d4af37]" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-display text-3xl text-white italic mb-2 group-hover:text-[#d4af37] transition-colors duration-300">
                                        {club.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-white/70 text-sm leading-relaxed max-w-[90%] transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        {club.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};
