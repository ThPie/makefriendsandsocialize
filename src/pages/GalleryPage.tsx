import { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lightbox } from '@/components/ui/lightbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { optimizeGoogleImageUrl } from '@/lib/image-utils';

interface EventPhoto {
  id: string;
  image_url: string;
  title: string | null;
  category: string | null;
}

const PHOTOS_PER_PAGE = 16;

const GalleryPage = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['gallery-photos-infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from('event_photos')
        .select('id, image_url, title, category')
        .order('display_order', { ascending: true })
        .range(pageParam, pageParam + PHOTOS_PER_PAGE - 1);

      if (error) throw error;
      return data as EventPhoto[];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PHOTOS_PER_PAGE) return undefined;
      return allPages.flat().length;
    },
    initialPageParam: 0,
  });

  const photos = data?.pages.flat() || [];

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
    <div className="flex-1 w-full bg-background min-h-screen">
      {/* Minimal header */}
      <div className="content-container pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="section-header">
          <span className="eyebrow block mb-3 text-[hsl(var(--accent-gold))]">Gallery</span>
          <h1 className="font-display text-3xl md:text-[44px] text-foreground leading-[1.1]">
            Our <span className="italic text-[hsl(var(--accent-gold))]">Moments</span>
          </h1>
        </div>
      </div>

      {/* Masonry grid */}
      <div className="px-1 md:px-2">
        {isLoading ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                className={`mb-4 w-full rounded-2xl ${i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]'
                  }`}
              />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="font-display text-2xl mb-2">No photos yet</p>
            <p className="text-sm">Check back after our next event.</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => openLightbox(index)}
                className="mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-2xl border border-transparent hover:border-[hsl(var(--accent-gold))] transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-[hsl(var(--accent-gold))]/10"
              >
                <img
                  src={photo.image_url.startsWith('http') ? optimizeGoogleImageUrl(photo.image_url, { width: 600, quality: 80 }) : photo.image_url}
                  alt={photo.title || 'Event photo'}
                  loading={index < 4 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full h-auto object-cover block transition-transform duration-200 hover:scale-[1.02]"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Load more sentinel */}
      <div ref={loadMoreRef} className="h-10 mt-8 mb-12 w-full flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="flex items-center gap-3 text-muted-foreground px-6 py-2">
            <Loader2 className="w-4 h-4 animate-spin text-[hsl(var(--accent-gold))]" />
            <span className="text-xs uppercase tracking-widest">Loading</span>
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
    </div>
  );
};

export default GalleryPage;
