import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MemberAvatars } from './MemberAvatars';
import { AdaptiveVideo } from '@/components/ui/adaptive-video';

const videos = [
  '/videos/hero-1.mp4',
  '/videos/hero-2.mp4',
  '/videos/hero-3.mp4',
  '/videos/hero-4.mp4',
];

// Default avatars as fallback
const defaultAvatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
];

export const Hero = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [memberCount, setMemberCount] = useState(928);
  const [avatarUrls, setAvatarUrls] = useState<string[]>(defaultAvatars);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const handleVideoEnd = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
      setIsTransitioning(false);
    }, 300);
  };

  // Fetch meetup stats from database
  useEffect(() => {
    const fetchMeetupStats = async () => {
      try {
        const { data, error } = await supabase
          .from('meetup_stats')
          .select('member_count, avatar_urls')
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching meetup stats:', error);
          return;
        }

        if (data) {
          if (data.member_count) {
            setMemberCount(data.member_count);
          }
          if (data.avatar_urls && data.avatar_urls.length > 0) {
            // Filter to only use member photos, not event photos
            const memberPhotos = data.avatar_urls.filter(
              (url: string) => url.includes('/photos/member/') && !url.includes('/photos/event/')
            );
            
            // Remove duplicates
            const uniquePhotos = [...new Set(memberPhotos)];
            
            // Shuffle the array randomly
            const shuffledPhotos = uniquePhotos.sort(() => Math.random() - 0.5);
            
            // Only use filtered photos if we have enough, otherwise keep defaults
            if (shuffledPhotos.length >= 3) {
              setAvatarUrls(shuffledPhotos);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching meetup stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchMeetupStats();
  }, []);

  return (
    <section className="relative w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 bg-black">
        <div
          key={currentVideoIndex}
          className={`h-full w-full transition-opacity duration-300 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <AdaptiveVideo
            sources={[{ src: videos[currentVideoIndex], type: 'video/mp4' }]}
            poster="/images/hero-poster.webp"
            onVideoEnd={handleVideoEnd}
            preloadStrategy={currentVideoIndex === 0 ? 'auto' : 'metadata'}
            showPosterOnSlowConnection={true}
            className="h-full w-full"
          />
        </div>
        {/* Black Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
      </div>

      {/* Content */}
      <div
        className="relative flex min-h-[calc(100vh-81px)] w-full flex-col items-center justify-center px-6 py-20 text-center md:px-10"
        role="img"
        aria-label="An elegant evening social gathering with people mingling in a softly lit, luxurious room."
      >
        <div className="mx-auto flex max-w-[900px] flex-col items-center gap-8 animate-fade-in">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-lg">
            A Private Social Club for <span className="text-gradient">Authentic Connections</span>
          </h1>
          <p className="max-w-2xl text-lg font-normal leading-relaxed text-white/90 md:text-xl drop-shadow-md">
            Weekly curated events. Vetted members. Genuine friendships and meaningful business connections.
          </p>
          
          {/* Member Avatars */}
          <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <MemberAvatars
              avatarUrls={avatarUrls}
              memberCount={memberCount}
              isLoading={isLoadingStats}
            />
          </div>

          <Button size="lg" asChild className="animate-fade-in mt-2" style={{ animationDelay: '0.3s' }}>
            <Link to="/membership">Request an Invitation</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
