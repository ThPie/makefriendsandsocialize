import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Lightbox } from '@/components/ui/lightbox';
import { Button } from '@/components/ui/button';
import { optimizeGoogleImageUrl } from '@/lib/image-utils';
import { LazyImage } from '@/components/ui/lazy-image';

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
      className={`py-20 md:py-32 bg-background transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
    >
      <div className="container mx-auto px-4">
        {/* Header - Centered Moments */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Moments
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl font-light tracking-wide italic">
            A glimpse into the life of the club.
          </p>
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
              className="flex-shrink-0 group relative overflow-hidden rounded-lg cursor-pointer w-[280px] md:w-[320px] aspect-[3/4] shadow-md hover:shadow-xl transition-all duration-300"
            >
              <LazyImage
                src={optimizeGoogleImageUrl(photo.image_url, { width: 400, quality: 80 })}
                alt={photo.title || 'Event photo'}
                className="w-full h-full object-cover grayscale transition-all duration-700 ease-out group-hover:grayscale-0 group-hover:scale-110"
              />
              {/* Optional Overlay on hover */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>

        {/* Hover hint */}
        <p className="text-center text-muted-foreground text-sm mt-6 mb-8 md:mb-12">
          Hover to scroll • Click to enlarge
        </p>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button
            asChild
            variant="outline"
            className="rounded-full px-8 py-6 text-base tracking-widest uppercase border-foreground/20 hover:bg-foreground hover:text-background transition-all duration-300"
          >
            <Link to="/gallery">
              Access Member Gallery
            </Link>
          </Button>
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
