import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useConnectionQuality } from '@/hooks/useConnectionQuality';

interface VideoSource {
  src: string;
  type?: string;
}

interface AdaptiveVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  sources: VideoSource[];
  poster?: string;
  className?: string;
  onVideoEnd?: () => void;
  preloadStrategy?: 'auto' | 'metadata' | 'none';
  showPosterOnSlowConnection?: boolean;
}

/**
 * AdaptiveVideo component with connection-aware loading.
 * Detects slow connections and adjusts video loading behavior accordingly.
 */
export const AdaptiveVideo = ({
  sources,
  poster,
  className,
  onVideoEnd,
  preloadStrategy = 'auto',
  showPosterOnSlowConnection = true,
  autoPlay = true,
  muted = true,
  playsInline = true,
  ...props
}: AdaptiveVideoProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const connectionQuality = useConnectionQuality();

  // Determine preload strategy based on connection quality
  const effectivePreload = connectionQuality === 'low' 
    ? 'metadata' 
    : connectionQuality === 'offline' 
      ? 'none' 
      : preloadStrategy;

  // On very slow connections, show poster only
  useEffect(() => {
    if (showPosterOnSlowConnection && connectionQuality === 'low' && poster) {
      setShowVideo(false);
    } else if (connectionQuality === 'high') {
      setShowVideo(true);
    }
  }, [connectionQuality, showPosterOnSlowConnection, poster]);

  const handleCanPlay = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleEnded = useCallback(() => {
    onVideoEnd?.();
  }, [onVideoEnd]);

  // Play video when it becomes visible
  useEffect(() => {
    if (videoRef.current && showVideo && autoPlay) {
      videoRef.current.play().catch(() => {
        // Autoplay was prevented, user interaction needed
      });
    }
  }, [showVideo, autoPlay]);

  // If offline or very slow connection with poster available, show poster only
  if ((connectionQuality === 'offline' || (connectionQuality === 'low' && showPosterOnSlowConnection)) && poster) {
    return (
      <div className={cn('relative w-full h-full', className)}>
        <img
          src={poster}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        {connectionQuality === 'offline' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-white text-sm">You're offline</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* Loading placeholder */}
      {!isLoaded && poster && (
        <img
          src={poster}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
      )}
      
      {showVideo && (
        <video
          ref={videoRef}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          autoPlay={autoPlay}
          muted={muted}
          playsInline={playsInline}
          preload={effectivePreload}
          poster={poster}
          onCanPlay={handleCanPlay}
          onEnded={handleEnded}
          {...props}
        >
          {sources.map((source, index) => (
            <source key={index} src={source.src} type={source.type || 'video/mp4'} />
          ))}
        </video>
      )}
    </div>
  );
};
