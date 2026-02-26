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
    <div className="flex-1 w-full flex flex-col items-center bg-background min-h-screen">
      <div className="w-full max-w-[1400px] px-6 md:px-12 py-16 md:py-24">

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">

          {/* COLUMN 1 */}
          <div className="flex flex-col gap-6 md:gap-8">
            {/* Header / Eyebrow & Filters Block */}
            <div className="flex items-start gap-4 mb-4 md:mb-12">
              <div className="w-px h-16 bg-[hsl(var(--accent-gold))] mt-2 opacity-60"></div>
              <div className="flex flex-col">
                <h2 className="font-display text-2xl tracking-widest text-[#8a9992] uppercase mb-6 opacity-80 leading-tight">
                  02 <br /> GALLERY
                </h2>

                {/* Vertical Filters */}
                <div className="flex flex-wrap md:flex-col gap-3 md:gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-left text-sm md:text-base transition-all duration-300 w-fit ${activeCategory === cat
                          ? 'text-[hsl(var(--accent-gold))] font-medium translate-x-2'
                          : 'text-muted-foreground hover:text-foreground hover:translate-x-1'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Col 1 Photos */}
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className={`rounded-2xl w-full bg-white/5 ${i % 2 === 0 ? 'aspect-[2/3]' : 'aspect-[4/5]'}`} />
              ))
            ) : (
              photos.filter((_, i) => i % 3 === 0).map((photo, index) => {
                const originalIndex = photos.findIndex(p => p.id === photo.id);
                return (
                  <motion.div
                    key={photo.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => openLightbox(originalIndex)}
                    className={`group relative overflow-hidden rounded-2xl cursor-pointer ${index % 2 === 0 ? 'aspect-[2/3]' : 'aspect-[4/5]'}`}
                  >
                    <LazyImage
                      src={optimizeGoogleImageUrl(photo.image_url, { width: 800, quality: 85 })}
                      alt={photo.title || 'Event photo'}
                      priority={index < 1}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-6 right-6 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 flex flex-col items-end text-right">
                      <p className="text-foreground text-lg md:text-xl font-bold leading-tight font-display drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{photo.title || 'Untitled'}</p>
                    </div>
                    {/* Always visible minimal badge */}
                    <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 text-white/90 text-[10px] md:text-xs uppercase tracking-widest px-3 py-1.5 rounded transition-opacity duration-300 group-hover:opacity-0">
                      {photo.category || 'Event'}
                    </div>
                  </motion.div>
                );
              })
            )}

            {/* Bottom Call to Action under Col 1 */}
            <div className="mt-8 mb-4 flex flex-col items-start gap-4 max-w-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[hsl(var(--accent-gold))] font-bold text-lg leading-tight">Explore more?</span>
                <span className="text-foreground text-xl md:text-2xl font-display leading-tight">Join us at our next exclusive event!</span>
              </div>
              <Button onClick={() => window.open('/calendar', '_self')} variant="outline" className="mt-2 border-[hsl(var(--accent-gold))]/30 text-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/10 hover:text-[hsl(var(--accent-gold))] transition-all rounded-none px-6 tracking-widest text-xs uppercase h-10">
                View Calendar
              </Button>
            </div>
          </div>

          {/* COLUMN 2 */}
          <div className="flex flex-col gap-6 md:gap-8">
            {/* Main Header Text */}
            <div className="flex flex-col gap-6 pt-12 md:pt-0 mb-4 md:mb-12">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] tracking-tight drop-shadow-sm">
                Curated moments of <br />
                <span className="text-[hsl(var(--accent-gold))] font-medium">unforgettable connection</span>
              </h1>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-[360px]">
                We are a community of passionate individuals and expert hosts.
                <br /><br />
                Behind every event is hundreds of hours of preparation, world-class venues, and a dedication to absolute perfection. Step into our world and see for yourself!
              </p>
              {!isLoading && (
                <div className="h-px w-24 bg-border mt-4 opacity-50"></div>
              )}
            </div>

            {/* Col 2 Photos */}
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="rounded-2xl w-full bg-white/5 aspect-square" />
              ))
            ) : (
              photos.filter((_, i) => i % 3 === 1).map((photo, index) => {
                const originalIndex = photos.findIndex(p => p.id === photo.id);
                return (
                  <motion.div
                    key={photo.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => openLightbox(originalIndex)}
                    className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-square"
                  >
                    <LazyImage
                      src={optimizeGoogleImageUrl(photo.image_url, { width: 800, quality: 85 })}
                      alt={photo.title || 'Event photo'}
                      priority={index < 1}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-6 right-6 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 flex flex-col items-end text-right">
                      <p className="text-foreground text-lg md:text-xl font-bold leading-tight font-display drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{photo.title || 'Untitled'}</p>
                    </div>
                    {/* Always visible minimal badge */}
                    <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 text-white/90 text-[10px] md:text-xs uppercase tracking-widest px-3 py-1.5 rounded transition-opacity duration-300 group-hover:opacity-0">
                      {photo.category || 'Event'}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* COLUMN 3 */}
          <div className="flex flex-col gap-6 md:gap-8 md:pt-[280px] lg:pt-[340px]">
            {/* Col 3 Photos */}
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className={`rounded-2xl w-full bg-white/5 ${i % 2 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`} />
              ))
            ) : (
              photos.filter((_, i) => i % 3 === 2).map((photo, index) => {
                const originalIndex = photos.findIndex(p => p.id === photo.id);
                return (
                  <motion.div
                    key={photo.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => openLightbox(originalIndex)}
                    className={`group relative overflow-hidden rounded-2xl cursor-pointer ${index % 2 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}
                  >
                    <LazyImage
                      src={optimizeGoogleImageUrl(photo.image_url, { width: 800, quality: 85 })}
                      alt={photo.title || 'Event photo'}
                      priority={index < 1}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-6 right-6 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 flex flex-col items-end text-right">
                      <p className="text-foreground text-lg md:text-xl font-bold leading-tight font-display drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{photo.title || 'Untitled'}</p>
                    </div>
                    {/* Always visible minimal badge */}
                    <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 text-white/90 text-[10px] md:text-xs uppercase tracking-widest px-3 py-1.5 rounded transition-opacity duration-300 group-hover:opacity-0">
                      {photo.category || 'Event'}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Load more sentinel */}
        <div ref={loadMoreRef} className="h-10 mt-12 w-full flex items-center justify-center">
          {isFetchingNextPage && (
            <div className="flex items-center gap-3 text-muted-foreground glass px-6 py-2 rounded-full border border-border">
              <Loader2 className="w-4 h-4 animate-spin text-[hsl(var(--accent-gold))]" />
              <span className="text-xs uppercase tracking-widest">Loading moments</span>
            </div>
          )}
          {!hasNextPage && photos.length > 0 && (
            <div className="flex items-center gap-3 text-muted-foreground glass px-6 py-2 rounded-full border border-border opacity-60">
              <span className="text-xs uppercase tracking-widest">End of gallery</span>
            </div>
          )}
        </div>

        {photos.length === 0 && !isLoading && (
          <div className="text-center py-24 text-muted-foreground w-full col-span-1 md:col-span-3">
            <p className="font-display text-2xl mb-2">No photos found</p>
            <p className="text-sm">Check back later or try another category.</p>
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
