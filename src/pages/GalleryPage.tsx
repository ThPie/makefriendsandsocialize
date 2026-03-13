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
          <div className="text-center py-24 text-muted-foreground flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="font-display text-2xl text-foreground">No Photos Yet</p>
            <p className="text-sm max-w-xs leading-relaxed">Photos from our exclusive gatherings will appear here. Join us at our next event to be part of the story.</p>
            <a href="/events" className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              View Upcoming Events →
            </a>
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
