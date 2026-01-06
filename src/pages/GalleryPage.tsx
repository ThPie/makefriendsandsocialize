import { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lightbox } from '@/components/ui/lightbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, LayoutGrid, Columns } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventPhoto {
  id: string;
  image_url: string;
  title: string | null;
  category: string | null;
}

const categories = ['All Events', 'Galas', 'Seasonal Soirées', 'Cocktail Hours', 'Art & Wine', 'Networking', 'Workshops'];
const PHOTOS_PER_PAGE = 12;

type LayoutMode = 'grid' | 'masonry';

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
    <div className="flex-1 w-full flex flex-col items-center">
      <div className="w-full max-w-[1440px]">
        {/* Hero */}
        <div className="px-4 py-3">
          <div 
            className="bg-cover bg-center flex flex-col justify-end overflow-hidden rounded-lg min-h-80" 
            style={{
              backgroundImage: 'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 25%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCvlDLnFAUBGIy5PJIrjxlFuYUiP-OgNIMHpQhXa40KTcIpzW72E3Zz1tM0FPuand9c5SsbE2sbV7A5ySDr87EXiASgXVbyqZ8ShWcyOjYV3jEH-IgtJ-S31IgOgCuqlihSprqSvQ22QtCMlkcfa8f1CGSU6DE-RYrQxg--WqM1w3z_JJRk9uf9aNNLnOR7xo9z1IOj8QgULeAvRvKv6VfUYiYpsqYVcvw2QDVIOB5q3zfAmA7xoEwZqOayWGo6PBlKRji2oquzDY9h")'
            }}
          >
            <div className="flex p-6 md:p-8">
              <h1 className="text-white tracking-tight text-4xl md:text-5xl font-bold font-display leading-tight drop-shadow-md">
                Our Celebrated Moments
              </h1>
            </div>
          </div>
        </div>

        {/* Filters and Layout Toggle */}
        <div className="flex items-center gap-3 p-3">
          <div className="flex gap-3 overflow-x-auto no-scrollbar flex-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 cursor-pointer transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <span className="text-sm font-medium leading-normal whitespace-nowrap">{cat}</span>
              </button>
            ))}
          </div>

          {/* Layout Toggle */}
          <div className="flex items-center gap-1 border border-border rounded-lg p-1 shrink-0">
            <Button
              variant={layoutMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setLayoutMode('grid')}
              title="Grid layout"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={layoutMode === 'masonry' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setLayoutMode('masonry')}
              title="Masonry layout"
            >
              <Columns className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Grid / Masonry */}
        {isLoading ? (
          <div className={layoutMode === 'masonry' 
            ? "columns-2 sm:columns-3 md:columns-4 gap-3 p-4" 
            : "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 p-4"
          }>
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className={layoutMode === 'masonry' 
                  ? `rounded-lg mb-3 break-inside-avoid ${i % 3 === 0 ? 'h-64' : i % 3 === 1 ? 'h-48' : 'h-56'}` 
                  : "aspect-[3/4] rounded-lg"
                } 
              />
            ))}
          </div>
        ) : photos.length > 0 ? (
          <>
            {layoutMode === 'masonry' ? (
              <div className="columns-2 sm:columns-3 md:columns-4 gap-3 p-4">
                {photos.map((photo, index) => (
                  <div 
                    key={photo.id}
                    onClick={() => openLightbox(index)}
                    className="break-inside-avoid mb-3 group relative overflow-hidden rounded-lg cursor-pointer hover:shadow-xl transition-shadow duration-300"
                  >
                    <img
                      src={photo.image_url}
                      alt={photo.title || 'Event photo'}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto object-cover"
                      onLoad={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '1';
                      }}
                      style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-base font-bold leading-tight font-display drop-shadow-sm">
                        {photo.title || 'Untitled'}
                      </p>
                      {photo.category && (
                        <span className="text-white/70 text-xs">{photo.category}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 p-4">
                {photos.map((photo, index) => (
                  <div 
                    key={photo.id}
                    onClick={() => openLightbox(index)}
                    className="bg-cover bg-center flex flex-col gap-3 rounded-lg justify-end p-4 aspect-[3/4] group relative overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
                    style={{ 
                      backgroundImage: `url("${photo.image_url}")`,
                      backgroundSize: 'cover',
                    }}
                  >
                    <img
                      src={photo.image_url}
                      alt={photo.title || 'Event photo'}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-300" />
                    <p className="text-white text-base font-bold leading-tight w-full font-display relative z-10 drop-shadow-sm group-hover:-translate-y-1 transition-transform duration-300">
                      {photo.title || 'Untitled'}
                    </p>
                    {photo.category && (
                      <span className="text-white/70 text-xs relative z-10">{photo.category}</span>
                    )}
                  </div>
                ))}
              </div>
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
