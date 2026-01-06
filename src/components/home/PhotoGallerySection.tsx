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

  const { data: galleryData, isLoading } = useQuery({
    queryKey: ['homepage-gallery-photos'],
    queryFn: async () => {
      // First, get the most recent event that has photos
      const { data: recentEventWithPhotos } = await supabase
        .from('event_photos')
        .select('event_id')
        .not('event_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentEventWithPhotos && recentEventWithPhotos.length > 0) {
        const eventId = recentEventWithPhotos[0].event_id;
        
        // Get event details
        const { data: eventDetails } = await supabase
          .from('events')
          .select('title')
          .eq('id', eventId)
          .single();

        // Fetch photos from that event (max 6)
        const { data: eventPhotos, error } = await supabase
          .from('event_photos')
          .select('id, image_url, title, category')
          .eq('event_id', eventId)
          .order('display_order', { ascending: true })
          .limit(6);

        if (!error && eventPhotos && eventPhotos.length > 0) {
          return {
            photos: eventPhotos as EventPhoto[],
            eventName: eventDetails?.title || null,
          };
        }
      }

      // Fallback: get featured photos if no recent event photos
      const { data: featuredPhotos, error } = await supabase
        .from('event_photos')
        .select('id, image_url, title, category')
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .limit(6);

      if (error) throw error;
      return {
        photos: (featuredPhotos || []) as EventPhoto[],
        eventName: null,
      };
    },
  });

  const photos = galleryData?.photos || [];
  const eventName = galleryData?.eventName;

  const lightboxImages = photos.map((p) => ({
    url: p.image_url,
    title: p.title,
    category: p.category,
  }));

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
            {eventName 
              ? `From our latest gathering: ${eventName}`
              : 'Experience the warmth and elegance of our exclusive events through these captured moments.'
            }
          </p>
        </div>

        {/* Photo Grid - 6 photos, 3 columns */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className={`rounded-xl ${i < 2 ? 'aspect-[4/5]' : 'aspect-square'}`}
              />
            ))}
          </div>
        ) : photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => openLightbox(index)}
                className={`group relative overflow-hidden rounded-xl cursor-pointer ${
                  index < 2 ? 'aspect-[4/5]' : 'aspect-square'
                }`}
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
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No photos available yet.
          </div>
        )}

        {/* View All Link */}
        {photos.length > 0 && (
          <div className="text-center mt-10">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors group"
            >
              View Full Gallery
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
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
