import { useState } from 'react';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Lightbox } from '@/components/ui/lightbox';

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
    setLightboxIndex(index % galleryPhotos.length);
    setLightboxOpen(true);
  };

  // Split into two columns for masonry staggered effect
  const leftColumn = galleryPhotos.filter((_, i) => i % 2 === 0);
  const rightColumn = galleryPhotos.filter((_, i) => i % 2 === 1);

  const getOriginalIndex = (photo: typeof galleryPhotos[0]) =>
    galleryPhotos.findIndex((p) => p.id === photo.id);

  const PhotoCard = ({ photo, tall = false }: { photo: typeof galleryPhotos[0]; tall?: boolean }) => (
    <div
      className={`relative overflow-hidden rounded-2xl group cursor-pointer ${tall ? 'aspect-[3/4]' : 'aspect-square'}`}
      onClick={() => openLightbox(getOriginalIndex(photo))}
    >
      <img
        src={photo.image_url}
        alt={photo.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-6">
        <span className="text-white/70 text-xs uppercase tracking-widest mb-1">{photo.category}</span>
        <span className="text-white font-display text-xl">{photo.title}</span>
      </div>
    </div>
  );

  return (
    <section
      ref={ref}
      className={`py-24 md:py-32 bg-card relative overflow-hidden transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="content-container">
        {/* Eyebrow + heading */}
        <div className="section-header">
          <span className="eyebrow block mb-3 text-[hsl(var(--accent-gold))]">Moments from the Circle</span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
            A Glimpse <span className="italic text-[hsl(var(--accent-gold))]">Inside</span>
          </h2>
        </div>

        {/* Masonry 2-column staggered grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {/* Left column */}
          <div className="flex flex-col gap-3 md:gap-4">
            {leftColumn.map((photo, i) => (
              <PhotoCard key={photo.id} photo={photo} tall={i === 0} />
            ))}
          </div>
          {/* Right column — offset for stagger */}
          <div className="flex flex-col gap-3 md:gap-4 mt-8 md:mt-12">
            {rightColumn.map((photo, i) => (
              <PhotoCard key={photo.id} photo={photo} tall={i === 1} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <TransitionLink
            to="/gallery"
            className="inline-flex items-center justify-center rounded-full px-8 py-4 text-sm tracking-[0.15em] uppercase font-medium border border-border bg-transparent text-foreground hover:bg-muted transition-colors duration-200"
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
