import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Lightbox } from '@/components/ui/lightbox';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Static gallery photos from real events - showing only 5 for cleaner look
const galleryPhotos = [
  { id: '1', image_url: '/images/gallery/event-1.jpg', title: 'Cheers at the Lounge', category: 'Social' },
  { id: '2', image_url: '/images/gallery/event-2.jpg', title: 'Elegant Attire', category: 'Members' },
  { id: '3', image_url: '/images/gallery/event-3.jpg', title: 'Great Conversations', category: 'Social' },
  { id: '4', image_url: '/images/gallery/event-4.jpg', title: 'Black Tie Evening', category: 'Events' },
  { id: '5', image_url: '/images/gallery/event-5.jpg', title: 'Fireside Chat', category: 'Social' },
];

export const PhotoGallerySection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(2); // Center image

  const lightboxImages = galleryPhotos.map((p) => ({
    url: p.image_url,
    title: p.title,
    category: p.category,
  }));

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryPhotos.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
  };

  // Calculate positions for fan-out carousel
  const getSlideStyle = (index: number) => {
    const diff = index - currentIndex;
    const normalizedDiff = ((diff + galleryPhotos.length) % galleryPhotos.length);
    const adjustedDiff = normalizedDiff > galleryPhotos.length / 2 ? normalizedDiff - galleryPhotos.length : normalizedDiff;

    const isCenter = adjustedDiff === 0;
    const absDistance = Math.abs(adjustedDiff);

    // Hide images too far from center
    if (absDistance > 2) {
      return { opacity: 0, transform: 'scale(0.5)', zIndex: 0 };
    }

    const translateX = adjustedDiff * 180;
    const scale = isCenter ? 1.15 : 1 - absDistance * 0.1;
    const zIndex = 10 - absDistance;
    const rotate = adjustedDiff * 3;

    return {
      transform: `translateX(${translateX}px) scale(${scale}) rotate(${rotate}deg)`,
      zIndex,
      opacity: 1 - absDistance * 0.2,
    };
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

        {/* Fan-out Carousel */}
        <div className="relative h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
          <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
            {galleryPhotos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => openLightbox(index)}
                className="absolute cursor-pointer transition-all duration-500 ease-out"
                style={getSlideStyle(index)}
              >
                <div className="w-[220px] md:w-[280px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={photo.image_url}
                    alt={photo.title || 'Event photo'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={prevSlide}
            className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={nextSlide}
            className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
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
