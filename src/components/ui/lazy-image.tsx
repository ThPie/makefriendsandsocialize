import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getLqipUrl } from '@/lib/image-utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  aspectRatio?: string;
  placeholderClassName?: string;
}

export const LazyImage = ({
  src,
  alt,
  className,
  priority = false,
  aspectRatio,
  placeholderClassName,
  ...props
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

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
        rootMargin: '100px', // Increased rootMargin for smoother loading
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        aspectRatio && `aspect-[${aspectRatio}]`,
        className
      )}
    >
      {/* Placeholder skeleton or LQIP */}
      {!isLoaded && (
        <div
          className={cn(
            'absolute inset-0 bg-muted transition-opacity duration-500',
            isLoaded ? 'opacity-0' : 'opacity-100',
            placeholderClassName
          )}
        >
          {src && isInView && (
            <img
              src={getLqipUrl(src)}
              alt=""
              className="w-full h-full object-cover blur-2xl scale-110"
              aria-hidden="true"
            />
          )}
          <div className="absolute inset-0 bg-muted/20 animate-pulse" />
        </div>
      )}

      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          'transition-all duration-700 ease-out',
          isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-lg',
          'w-full h-full object-cover'
        )}
        {...props}
      />
    </div>
  );
};
