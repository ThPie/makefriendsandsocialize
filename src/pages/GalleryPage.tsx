import { useState, useEffect, useRef } from 'react';
import { LazyImage } from '@/components/ui/lazy-image';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lightbox } from '@/components/ui/lightbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, LayoutGrid, Columns, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { optimizeGoogleImageUrl } from '@/lib/image-utils';

interface EventPhoto {
  id: string;
  image_url: string;
  title: string | null;
  category: string | null;
}

const categories = ['All Events', 'Galas', 'Seasonal Soirées', 'Cocktail Hours', 'Art & Wine', 'Networking', 'Workshops'];
const PHOTOS_PER_PAGE = 12;

type LayoutMode = 'grid' | 'masonry';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const GalleryPage = () => {
  const [activeCategory, setActiveCategory] = useState('All Events');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('gallery-layout') as LayoutMode) || 'grid';
    }
    return 'grid';
  });
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const heroAnimation = useScrollAnimation();
  const galleryAnimation = useScrollAnimation();

  // Persist layout preference
  useEffect(() => {
    localStorage.setItem('gallery-layout', layoutMode);
  }, [layoutMode]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['gallery-photos-infinite', activeCategory],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('event_photos')
        .select('id, image_url, title, category')
        .order('display_order', { ascending: true })
        .range(pageParam, pageParam + PHOTOS_PER_PAGE - 1);

      if (activeCategory !== 'All Events') {
        query = query.eq('category', activeCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EventPhoto[];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PHOTOS_PER_PAGE) return undefined;
      return allPages.flat().length;
    },
    initialPageParam: 0,
  });

  // Flatten all pages into a single array
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
    <div className="flex-1 w-full flex flex-col items-center bg-background">
      {/* Hero Section */}
      <section className="relative w-full min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCvlDLnFAUBGIy5PJIrjxlFuYUiP-OgNIMHpQhXa40KTcIpzW72E3Zz1tM0FPuand9c5SsbE2sbV7A5ySDr87EXiASgXVbyqZ8ShWcyOjYV3jEH-IgtJ-S31IgOgCuqlihSprqSvQ22QtCMlkcfa8f1CGSU6DE-RYrQxg--WqM1w3z_JJRk9uf9aNNLnOR7xo9z1IOj8QgULeAvRvKv6VfUYiYpsqYVcvw2QDVIOB5q3zfAmA7xoEwZqOayWGo6PBlKRji2oquzDY9h")'
          }}
        />
        <div className="absolute inset-0 bg-black/50" />

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div
          ref={heroAnimation.ref}
          className={`relative z-10 container max-w-4xl text-center py-16 scroll-animate ${heroAnimation.isVisible ? 'visible' : ''}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass border border-primary/20 rounded-full px-5 py-2.5 mb-6"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Photo Gallery</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl text-foreground mb-4 leading-[1.1]"
          >
            Our Celebrated <span className="text-gradient">Moments</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto"
          >
            Explore the memories from our exclusive events and gatherings.
          </motion.p>
        </div>
      </section>

      <div className="w-full max-w-7xl px-4">
        {/* Filters and Layout Toggle */}
        <div
          ref={galleryAnimation.ref}
          className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 py-6 scroll-animate ${galleryAnimation.isVisible ? 'visible' : ''}`}
        >
          <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1 pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 cursor-pointer transition-all duration-300 ${activeCategory === cat
                  ? 'bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20'
                  : 'bg-white/[0.04] border border-white/[0.08] text-muted-foreground hover:bg-secondary hover:border-primary/30'
                  }`}
              >
                <span className="text-sm font-medium leading-normal whitespace-nowrap">{cat}</span>
              </button>
            ))}
          </div>

          {/* Layout Toggle */}
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-full p-1 shrink-0">
            <Button
              variant={layoutMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setLayoutMode('grid')}
              title="Grid layout"
              aria-label="Switch to grid layout"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={layoutMode === 'masonry' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setLayoutMode('masonry')}
              title="Masonry layout"
              aria-label="Switch to masonry layout"
            >
              <Columns className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Grid / Masonry */}
        {isLoading ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={layoutMode === 'masonry'
              ? "columns-2 sm:columns-3 md:columns-4 gap-4 py-4"
              : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4"
            }
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Skeleton
                  className={layoutMode === 'masonry'
                    ? `rounded-2xl mb-4 break-inside-avoid ${i % 3 === 0 ? 'h-64' : i % 3 === 1 ? 'h-48' : 'h-56'}`
                    : "aspect-[3/4] rounded-2xl"
                  }
                />
              </motion.div>
            ))}
          </motion.div>
        ) : photos.length > 0 ? (
          <>
            {layoutMode === 'masonry' ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="columns-2 sm:columns-3 md:columns-4 gap-4 py-4"
              >
                {photos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    variants={itemVariants}
                    onClick={() => openLightbox(index)}
                    className="break-inside-avoid mb-4 group relative overflow-hidden rounded-2xl cursor-pointer"
                  >
                    <LazyImage
                      src={optimizeGoogleImageUrl(photo.image_url, { width: 500, quality: 85 })}
                      alt={photo.title || 'Event photo'}
                      priority={index < 4}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-foreground text-base font-bold leading-tight font-display drop-shadow-sm">
                        {photo.title || 'Untitled'}
                      </p>
                      {photo.category && (
                        <span className="text-muted-foreground text-xs">{photo.category}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4"
              >
                {photos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    variants={itemVariants}
                    onClick={() => openLightbox(index)}
                    className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-[3/4]"
                  >
                    <LazyImage
                      src={optimizeGoogleImageUrl(photo.image_url, { width: 500, quality: 85 })}
                      alt={photo.title || 'Event photo'}
                      priority={index < 4}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-foreground text-base font-bold leading-tight font-display drop-shadow-sm group-hover:-translate-y-1 transition-transform duration-300">
                        {photo.title || 'Untitled'}
                      </p>
                      {photo.category && (
                        <span className="text-muted-foreground text-xs">{photo.category}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Load more sentinel */}
            <div ref={loadMoreRef} className="h-1" />

            {/* Loading more indicator */}
            {isFetchingNextPage && (
              <div className="flex items-center justify-center p-8 gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading more photos...</span>
              </div>
            )}

            {/* End of list */}
            {!hasNextPage && photos.length > PHOTOS_PER_PAGE && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">You've seen all {photos.length} photos</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No photos found in this category</p>
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
