import { useState, useEffect, useRef } from 'react';
import { LazyImage } from '@/components/ui/lazy-image';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lightbox } from '@/components/ui/lightbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { optimizeGoogleImageUrl } from '@/lib/image-utils';
import { MobilePageHeader } from '@/components/ui/MobilePageHeader';

interface EventPhoto {
  id: string;
  image_url: string;
  title: string | null;
  category: string | null;
}

const PHOTOS_PER_PAGE = 20;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
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
    <div className="flex-1 w-full flex flex-col bg-background">
      <MobilePageHeader title="Gallery" showBack />

      {/* Desktop header */}
      <div className="hidden md:block pt-8 pb-4 px-2 md:px-4">
        <h1 className="font-display text-3xl text-foreground">
          Our <span className="italic text-[hsl(var(--accent-gold))]">Moments</span>
        </h1>
      </div>

      {/* Masonry grid */}
      <div className="px-1 md:px-2">
        {isLoading ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                className={`mb-1 rounded-sm ${i % 3 === 0 ? 'h-64' : i % 3 === 1 ? 'h-48' : 'h-56'}`}
              />
            ))}
          </div>
        ) : photos.length > 0 ? (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="columns-2 md:columns-3 lg:columns-4 gap-1"
            >
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  variants={itemVariants}
                  onClick={() => openLightbox(index)}
                  className="mb-1 cursor-pointer overflow-hidden rounded-sm"
                >
                  <LazyImage
                    src={optimizeGoogleImageUrl(photo.image_url, { width: 600, quality: 85 })}
                    alt={photo.title || 'Event photo'}
                    priority={index < 4}
                    className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                  />
                </motion.div>
              ))}
            </motion.div>

            <div ref={loadMoreRef} className="h-1" />

            {isFetchingNextPage && (
              <div className="flex items-center justify-center p-8 gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading more…</span>
              </div>
            )}

            {!hasNextPage && photos.length > PHOTOS_PER_PAGE && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                You've seen all {photos.length} photos
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No photos yet</p>
          </div>
        )}
      </div>

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
