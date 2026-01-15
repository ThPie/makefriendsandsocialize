import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, TrendingUp, Calendar, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MeetupStats {
  member_count: number;
  rating: number | null;
  avatar_urls: string[] | null;
  joined_this_week: number | null;
}

export const SocialProofBanner = () => {
  const [displayCount, setDisplayCount] = useState(0);
  const [failedAvatars, setFailedAvatars] = useState<Set<number>>(new Set());

  // Fetch meetup stats
  const { data: stats, isError: statsError } = useQuery({
    queryKey: ['meetup-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meetup_stats')
        .select('member_count, rating, avatar_urls, joined_this_week')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.error('[SocialProofBanner] Stats query error:', error);
        throw error;
      }
      return data as MeetupStats;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  const joinedThisWeek = stats?.joined_this_week || 0;

  // Fetch upcoming events count
  const { data: eventsCount, isError: eventsError } = useQuery({
    queryKey: ['upcoming-events-count'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('date', today)
        .neq('status', 'cancelled');
      
      if (error) {
        console.error('[SocialProofBanner] Events count error:', error);
        throw error;
      }
      return count || 0;
    },
    retry: 2,
  });

  // Animated counter effect
  useEffect(() => {
    const targetCount = stats?.member_count || 1200;
    const duration = 2000;
    const steps = 60;
    const increment = targetCount / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setDisplayCount(targetCount);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [stats?.member_count]);

  // Handle avatar load errors
  const handleAvatarError = (index: number) => {
    setFailedAvatars(prev => new Set(prev).add(index));
  };

  // Log errors for debugging
  if (statsError) {
    console.error('[SocialProofBanner] Failed to load stats');
  }
  if (eventsError) {
    console.error('[SocialProofBanner] Failed to load events count');
  }

  const proofItems = [
    {
      icon: Users,
      value: displayCount.toLocaleString() + '+',
      label: 'Active Members',
      color: 'text-primary',
    },
    {
      icon: TrendingUp,
      value: `${joinedThisWeek}`,
      label: 'Joined This Week',
      color: 'text-emerald-500',
    },
    {
      icon: Calendar,
      value: eventsCount?.toString() || '8',
      label: 'Upcoming Events',
      color: 'text-amber-500',
    },
    {
      icon: Star,
      value: stats?.rating?.toFixed(1) || '4.9',
      label: 'Member Rating',
      color: 'text-yellow-500',
    },
  ];

  // Filter out avatars that failed to load
  const validAvatars = (stats?.avatar_urls || []).filter((_, index) => !failedAvatars.has(index));

  return (
    <div className="w-full bg-card/50 backdrop-blur-sm border-y border-border py-6 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <AnimatePresence>
            {proofItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="flex flex-col items-center text-center gap-2"
              >
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <span className="text-2xl md:text-3xl font-bold text-foreground font-display">
                  {item.value}
                </span>
                <span className="text-xs md:text-sm text-muted-foreground">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Recent Members Strip - Show if we have valid avatars */}
        {validAvatars.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-center gap-3"
          >
            <div className="flex -space-x-3">
              {stats?.avatar_urls?.slice(0, 5).map((url, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-full border-2 border-background overflow-hidden bg-muted ${failedAvatars.has(index) ? 'hidden' : ''}`}
                >
                  <img
                    src={url}
                    alt="Member avatar"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={() => handleAvatarError(index)}
                  />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-background bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                +{Math.max(0, (stats?.member_count || 0) - 5)}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{joinedThisWeek} people</span> joined this week
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
