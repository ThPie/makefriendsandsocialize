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
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Split photos into columns for masonry
  const columns = [0, 1, 2, 3].map((col) =>
    galleryPhotos.filter((_, i) => i % 4 === col)
  );
  const mobileColumns = [0, 1].map((col) =>
    galleryPhotos.filter((_, i) => i % 2 === col)
  );

  return (
    <section
      ref={ref}
      className={`py-20 md:py-32 bg-background transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="mb-12">
          <span className="section-label mb-3 block">Moments from the Circle</span>
          <h2 className="font-display text-4xl md:text-5xl font-normal text-foreground">
            A Glimpse <span className="italic text-[hsl(var(--gold))]">Inside</span>
          </h2>
        </div>
      </div>

      {/* Full-bleed masonry wall */}
      <div className="px-1">
        {/* Desktop: 4 columns */}
        <div className="hidden md:grid grid-cols-4 gap-1">
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-1">
              {col.map((photo) => {
                const globalIndex = galleryPhotos.findIndex(p => p.id === photo.id);
                return (
                  <div
                    key={photo.id}
                    onClick={() => openLightbox(globalIndex)}
                    className="relative overflow-hidden cursor-pointer group"
                  >
                    <LazyImage
                      src={optimizeGoogleImageUrl(photo.image_url, { width: 400, quality: 80 })}
                      alt={photo.title || 'Event photo'}
                      className="w-full h-auto object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-end p-4 opacity-0 group-hover:opacity-100">
                      <p className="font-display italic text-white text-lg">{photo.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Mobile: 2 columns */}
        <div className="md:hidden grid grid-cols-2 gap-1">
          {mobileColumns.map((col, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-1">
              {col.map((photo) => {
                const globalIndex = galleryPhotos.findIndex(p => p.id === photo.id);
                return (
                  <div
                    key={photo.id}
                    onClick={() => openLightbox(globalIndex)}
                    className="relative overflow-hidden cursor-pointer group"
                  >
                    <LazyImage
                      src={optimizeGoogleImageUrl(photo.image_url, { width: 300, quality: 75 })}
                      alt={photo.title || 'Event photo'}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-center mt-10">
        <TransitionLink
          to="/gallery"
          className="text-sm font-medium text-[hsl(var(--gold))] hover:text-[hsl(var(--gold-light))] transition-colors duration-200"
        >
          Access Member Gallery →
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
