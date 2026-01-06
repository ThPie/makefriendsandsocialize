import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbox } from '@/components/ui/lightbox';
import { ArrowRight } from 'lucide-react';

interface EventPhoto {
  id: string;
  image_url: string;
  title: string | null;
  category: string | null;
}

export const PhotoGallerySection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { data: photos, isLoading } = useQuery({
    queryKey: ['featured-event-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_photos')
        .select('id, image_url, title, category')
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .limit(8);

      if (error) throw error;
      return data as EventPhoto[];
    },
  });

  const lightboxImages = photos?.map((p) => ({
    url: p.image_url,
    title: p.title,
    category: p.category,
  })) || [];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <section
      ref={ref}
      className={`py-16 md:py-24 bg-background transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Moments from Our Gatherings
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the warmth and elegance of our exclusive events through these captured moments.
          </p>
        </div>

        {/* Photo Grid - Masonry Style */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className={`rounded-xl ${i % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'}`}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {photos?.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => openLightbox(index)}
                className={`group relative overflow-hidden rounded-xl cursor-pointer ${
                  index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'
                } ${index === 0 || index === 3 ? 'md:row-span-2 md:aspect-[3/4]' : ''}`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <img
                  src={photo.image_url}
                  alt={photo.title || 'Event photo'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white font-display font-semibold text-sm md:text-base drop-shadow-lg">
                    {photo.title}
                  </p>
                  {photo.category && (
                    <span className="text-white/70 text-xs">{photo.category}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors group"
          >
            View Full Gallery
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
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
