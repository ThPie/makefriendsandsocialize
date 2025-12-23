import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useConnectionQuality } from '@/hooks/useConnectionQuality';

type VideoQuality = 'low' | 'high';

interface QualitySource {
  quality: VideoQuality;
  src: string;
  type?: string;
}

interface VideoSource {
  src: string;
  type?: string;
}

interface AdaptiveVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  /** Simple sources array (backward compatible) */
  sources?: VideoSource[];
  /** Quality-aware sources for adaptive streaming */
  qualitySources?: QualitySource[];
  poster?: string;
  className?: string;
  onVideoEnd?: () => void;
  preloadStrategy?: 'auto' | 'metadata' | 'none';
  showPosterOnSlowConnection?: boolean;
  /** Force a specific quality level */
  forceQuality?: VideoQuality;
}

/**
 * Select the best video source based on connection quality
 */
const selectSourceByQuality = (
  qualitySources: QualitySource[],
  connectionQuality: 'high' | 'low' | 'offline',
  forceQuality?: VideoQuality
): VideoSource | null => {
  if (qualitySources.length === 0) return null;

  const targetQuality = forceQuality || (connectionQuality === 'high' ? 'high' : 'low');
  
  // Try to find source matching target quality
  const matchingSource = qualitySources.find(s => s.quality === targetQuality);
  if (matchingSource) {
    return { src: matchingSource.src, type: matchingSource.type };
  }
  
  // Fallback to any available source (prefer low quality as safe fallback)
  const lowQualitySource = qualitySources.find(s => s.quality === 'low');
  return lowQualitySource 
    ? { src: lowQualitySource.src, type: lowQualitySource.type }
    : { src: qualitySources[0].src, type: qualitySources[0].type };
};

/**
 * AdaptiveVideo component with connection-aware loading and quality selection.
 * 
 * Features:
 * - Detects slow connections and adjusts video quality
 * - Shows poster on very slow/offline connections
 * - Supports multiple quality levels (720p/1080p)
 * - Seamless fallback behavior
 */
export const AdaptiveVideo = ({
  sources,
  qualitySources,
  poster,
  className,
  onVideoEnd,
  preloadStrategy = 'auto',
  showPosterOnSlowConnection = true,
  forceQuality,
  autoPlay = true,
  muted = true,
  playsInline = true,
  ...props
}: AdaptiveVideoProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const connectionQuality = useConnectionQuality();

  // Select video source based on quality
  const activeSource = useMemo(() => {
    if (qualitySources && qualitySources.length > 0) {
      return selectSourceByQuality(qualitySources, connectionQuality, forceQuality);
    }
    // Fallback to simple sources (backward compatible)
    return sources && sources.length > 0 ? sources[0] : null;
  }, [qualitySources, sources, connectionQuality, forceQuality]);

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

  // Reset loaded state when source changes
  useEffect(() => {
    setIsLoaded(false);
  }, [activeSource?.src]);

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

  if (!activeSource) {
    return poster ? (
      <div className={cn('relative w-full h-full', className)}>
        <img src={poster} alt="" className="w-full h-full object-cover" />
      </div>
    ) : null;
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
          key={activeSource.src} // Force re-render when source changes
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
          <source src={activeSource.src} type={activeSource.type || 'video/mp4'} />
        </video>
      )}
    </div>
  );
};
