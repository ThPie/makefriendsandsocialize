import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Lightbox } from '@/components/ui/lightbox';
import { Button } from '@/components/ui/button';

// Static gallery photos from real events
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);

  const lightboxImages = galleryPhotos.map((p) => ({
    url: p.image_url,
    title: p.title,
    category: p.category,
  }));

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Start auto-scroll on hover
  const handleMouseEnter = () => {
    if (!scrollRef.current) return;

    scrollIntervalRef.current = window.setInterval(() => {
      if (scrollRef.current) {
        const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
        const currentScroll = scrollRef.current.scrollLeft;

        // If we've reached the end, scroll back to start
        if (currentScroll >= maxScroll - 10) {
          scrollRef.current.scrollLeft = 0;
        } else {
          scrollRef.current.scrollLeft += 2;
        }
      }
    }, 20);
  };

  // Stop auto-scroll when not hovering
  const handleMouseLeave = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  return (
    <section
      ref={ref}
      className={`py-16 md:py-24 bg-secondary/5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
    >
      <div className="container mx-auto px-4">
        {/* Header - Left aligned like reference */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 md:mb-16">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
              <span className="w-6 h-px bg-muted-foreground" />
              <span>Our Gallery</span>
              <span className="w-6 h-px bg-muted-foreground" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Captured moments from<br />
              <span className="text-muted-foreground italic">events, smiles,</span> and <span className="text-primary">connections.</span>
            </h2>
          </div>
          <Button asChild className="rounded-full mt-6 md:mt-0">
            <Link to="/gallery">View Gallery</Link>
          </Button>
        </div>

        {/* Horizontal Scrolling Gallery - Scrolls on Hover */}
        <div
          ref={scrollRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {galleryPhotos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => openLightbox(index)}
              className="flex-shrink-0 group relative overflow-hidden rounded-2xl cursor-pointer w-[280px] md:w-[320px] aspect-[3/4] shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={photo.image_url}
                alt={photo.title || 'Event photo'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                decoding="async"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Title on hover */}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white font-display font-semibold text-base drop-shadow-lg">
                  {photo.title}
                </p>
                {photo.category && (
                  <span className="text-white/70 text-sm">{photo.category}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Hover hint */}
        <p className="text-center text-muted-foreground text-sm mt-6">
          Hover to scroll • Click to enlarge
        </p>
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
