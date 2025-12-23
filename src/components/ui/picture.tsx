import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveSource {
  srcSet: string;
  media?: string;  // e.g., "(max-width: 640px)"
  type?: string;   // e.g., "image/webp"
}

interface PictureProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  webpSrc?: string;
  srcSet?: string;           // Simple srcset like "image-400.jpg 400w, image-800.jpg 800w"
  webpSrcSet?: string;       // WebP version of srcset
  sizes?: string;            // Size hints for browser e.g., "(max-width: 640px) 100vw, 50vw"
  responsiveSources?: ResponsiveSource[];  // For art direction with media queries
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  placeholderClassName?: string;
}

/**
 * Picture component with WebP format support and lazy loading.
 * Automatically serves WebP to modern browsers with fallback to original format.
 */
export const Picture = ({
  src,
  alt,
  webpSrc,
  srcSet,
  webpSrcSet,
  sizes,
  responsiveSources,
  className,
  imgClassName,
  priority = false,
  placeholderClassName,
  ...props
}: PictureProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const pictureRef = useRef<HTMLPictureElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    if (pictureRef.current) {
      observer.observe(pictureRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Derive WebP source if not explicitly provided
  const derivedWebpSrc = webpSrc || (src ? src.replace(/\.(jpe?g|png)$/i, '.webp') : undefined);

  return (
    <picture
      ref={pictureRef}
      className={cn('relative block overflow-hidden', className)}
    >
      {/* Placeholder skeleton */}
      {!isLoaded && (
        <div
          className={cn(
            'absolute inset-0 bg-muted animate-pulse',
            placeholderClassName
          )}
        />
      )}
      
      {isInView && (
        <>
          {/* Art direction sources with media queries */}
          {responsiveSources?.map((source, index) => (
            <source
              key={index}
              srcSet={source.srcSet}
              media={source.media}
              type={source.type}
            />
          ))}
          
          {/* WebP srcset source */}
          {webpSrcSet && (
            <source srcSet={webpSrcSet} sizes={sizes} type="image/webp" />
          )}
          
          {/* WebP fallback source (single image) */}
          {!webpSrcSet && derivedWebpSrc && (
            <source srcSet={derivedWebpSrc} type="image/webp" />
          )}
          
          {/* Original format srcset source */}
          {srcSet && !webpSrcSet && (
            <source srcSet={srcSet} sizes={sizes} />
          )}
          
          <img
            src={src}
            alt={alt}
            srcSet={srcSet}
            sizes={sizes}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            fetchPriority={priority ? 'high' : 'auto'}
            onLoad={() => setIsLoaded(true)}
            className={cn(
              'transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              imgClassName
            )}
            {...props}
          />
        </>
      )}
    </picture>
  );
};
