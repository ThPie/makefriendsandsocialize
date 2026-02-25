import { useState } from 'react';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Lightbox } from '@/components/ui/lightbox';
import { optimizeGoogleImageUrl } from '@/lib/image-utils';
import { LazyImage } from '@/components/ui/lazy-image';

const galleryPhotos = [
  { id: '1', image_url: '/images/gallery/event-1.jpg', title: 'Cheers at the Lounge', category: 'Social' },
  { id: '2', image_url: '/images/gallery/event-2.jpg', title: 'Elegant Attire', category: 'Members' },
  { id: '3', image_url: '/images/gallery/event-3.jpg', title: 'Great Conversations', category: 'Social' },
  { id: '4', image_url: '/images/gallery/event-4.jpg', title: 'Black Tie Evening', category: 'Events' },
  { id: '5', image_url: '/images/gallery/event-5.jpg', title: 'Fireside Chat', category: 'Social' },
  { id: '6', image_url: '/images/gallery/event-6.jpg', title: 'Networking Night', category: 'Events' },
];

export const PhotoGallerySection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const lightboxImages = galleryPhotos.map((p) => ({
    url: p.image_url,
    title: p.title,
    category: p.category,
  }));

  const openLightbox = (index: number) => {
    // Keep index within bounds since we duplicate photos in the marquee
    setLightboxIndex(index % galleryPhotos.length);
    setLightboxOpen(true);
  };

  // Use only the first 3 photos for the static grid
  const displayPhotos = galleryPhotos.slice(0, 3);

  return (
    <section
      ref={ref}
      className={`py-24 md:py-32 bg-card relative overflow-hidden transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="content-container">
        {/* Eyebrow + heading */}
        <span className="eyebrow block mb-3 text-[hsl(var(--accent-gold))]">Moments from the Circle</span>
        <h2 className="font-display text-4xl md:text-5xl text-white leading-tight mb-16">
          A Glimpse <span className="italic text-[hsl(var(--accent-gold))]">Inside</span>
        </h2>

        {/* 3-Photo Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Top/Large Photo (spans full width on mobile, 1 col on desktop if we wanted, but let's make it span full width row for bento effect) */}
          <div className="md:col-span-2 relative aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-2xl group cursor-pointer" onClick={() => openLightbox(0)}>
            <img
              src={displayPhotos[0].image_url}
              alt={displayPhotos[0].title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
              <span className="text-white text-xs uppercase tracking-widest mb-2">{displayPhotos[0].category}</span>
              <span className="text-white font-display text-3xl">{displayPhotos[0].title}</span>
            </div>
          </div>

          {/* Bottom Left Photo */}
          <div className="relative aspect-square md:aspect-[4/3] overflow-hidden rounded-2xl group cursor-pointer" onClick={() => openLightbox(1)}>
            <img
              src={displayPhotos[1].image_url}
              alt={displayPhotos[1].title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
              <span className="text-white text-xs uppercase tracking-widest mb-2">{displayPhotos[1].category}</span>
              <span className="text-white font-display text-2xl">{displayPhotos[1].title}</span>
            </div>
          </div>

          {/* Bottom Right Photo */}
          <div className="relative aspect-square md:aspect-[4/3] overflow-hidden rounded-2xl group cursor-pointer" onClick={() => openLightbox(2)}>
            <img
              src={displayPhotos[2].image_url}
              alt={displayPhotos[2].title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
              <span className="text-white text-xs uppercase tracking-widest mb-2">{displayPhotos[2].category}</span>
              <span className="text-white font-display text-2xl">{displayPhotos[2].title}</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <TransitionLink
            to="/gallery"
            className="inline-flex items-center justify-center rounded-full px-8 py-4 text-sm tracking-[0.15em] uppercase font-medium border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors duration-200"
          >
            See More
          </TransitionLink>
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </section>
  );
};
