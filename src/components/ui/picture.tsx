import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PictureProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  webpSrc?: string;
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
          {derivedWebpSrc && (
            <source srcSet={derivedWebpSrc} type="image/webp" />
          )}
          <img
            src={src}
            alt={alt}
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
