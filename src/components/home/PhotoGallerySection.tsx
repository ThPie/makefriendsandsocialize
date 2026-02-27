import { useState, useRef, useCallback, useEffect } from 'react';
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
  const stripRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const scrollSpeed = useRef(0);

  const lightboxImages = galleryPhotos.map((p) => ({
    url: p.image_url,
    title: p.title,
    category: p.category,
  }));

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Auto-scroll on hover (desktop only)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = stripRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    // Dead zone in center 40%
    if (x < 0.3) {
      scrollSpeed.current = -((0.3 - x) / 0.3) * 12; // max -12px/frame
    } else if (x > 0.7) {
      scrollSpeed.current = ((x - 0.7) / 0.3) * 12;
    } else {
      scrollSpeed.current = 0;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    scrollSpeed.current = 0;
  }, []);

  useEffect(() => {
    const tick = () => {
      const el = stripRef.current;
      if (el && scrollSpeed.current !== 0) {
        el.scrollLeft += scrollSpeed.current;
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Masonry columns for mobile
  const leftColumn = galleryPhotos.filter((_, i) => i % 2 === 0);
  const rightColumn = galleryPhotos.filter((_, i) => i % 2 === 1);
  const getOriginalIndex = (photo: typeof galleryPhotos[0]) =>
    galleryPhotos.findIndex((p) => p.id === photo.id);

  const MobileCard = ({ photo, tall = false }: { photo: typeof galleryPhotos[0]; tall?: boolean }) => (
    <div
      className={`relative overflow-hidden rounded-2xl group cursor-pointer ${tall ? 'aspect-[3/4]' : 'aspect-square'}`}
      onClick={() => openLightbox(getOriginalIndex(photo))}
    >
      <img src={photo.image_url} alt={photo.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
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
      {/* Eyebrow + heading */}
      <div className="content-container">
        <div className="section-header">
          <span className="eyebrow block mb-3 text-[hsl(var(--accent-gold))] text-gold">Moments from the Circle</span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
            A Glimpse <span className="italic text-[hsl(var(--accent-gold))]">Inside</span>
          </h2>
        </div>
      </div>

      {/* Desktop: edge-to-edge horizontal strip with auto-scroll */}
      <div
        ref={stripRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="hidden md:flex overflow-x-auto scrollbar-hide cursor-default"
        style={{ scrollBehavior: 'auto' }}
      >
        {galleryPhotos.map((photo, i) => (
          <div
            key={photo.id}
            className="relative shrink-0 aspect-[3/4] h-[520px] group cursor-pointer"
            onClick={() => openLightbox(i)}
          >
            <img
              src={photo.image_url}
              alt={photo.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-8">
              <span className="text-white/70 text-xs uppercase tracking-widest mb-1">{photo.category}</span>
              <span className="text-white font-display text-2xl">{photo.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: 2-column masonry */}
      <div className="md:hidden content-container">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-3">
            {leftColumn.map((photo, i) => (
              <MobileCard key={photo.id} photo={photo} tall={i === 0} />
            ))}
          </div>
          <div className="flex flex-col gap-3 mt-8">
            {rightColumn.map((photo, i) => (
              <MobileCard key={photo.id} photo={photo} tall={i === 1} />
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <TransitionLink
          to="/gallery"
          className="text-sm text-[hsl(var(--accent-gold))] hover:text-[hsl(var(--accent-gold-light))] transition-colors duration-150 tracking-[0.15em] uppercase"
        >
          See More →
        </TransitionLink>
      </div>

      <Lightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </section>
  );
};
