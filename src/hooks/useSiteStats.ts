import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SiteStats {
  memberCount: number;
  upcomingEventsCount: number;
  rating: number | null;
  joinedThisWeek: number;
  avatarUrls: string[];
  reviewCount: number;
}

/**
 * Single source of truth for site-wide statistics.
 * Prioritizes Meetup stats for member count and avatars.
 */
export const useSiteStats = () => {
  return useQuery({
    queryKey: ['site-stats'],
    queryFn: async (): Promise<SiteStats> => {
      // Get upcoming events count using database function
      const { data: eventsCountData, error: eventsError } = await supabase
        .rpc('get_upcoming_events_count');
      
      if (eventsError) {
        console.error('[useSiteStats] Events count error:', eventsError);
      }

      // Get stats from meetup_stats - this is the primary source for member count and avatars
      const { data: meetupStats, error: meetupError } = await supabase
        .from('meetup_stats')
        .select('member_count, rating, avatar_urls, joined_this_week, review_count')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();
      
      if (meetupError && meetupError.code !== 'PGRST116') {
        console.error('[useSiteStats] Meetup stats error:', meetupError);
      }

      // Use Meetup member count as primary source (real community size)
      // Fall back to profiles count only if Meetup data is unavailable
      let memberCount = meetupStats?.member_count || 0;
      
      if (!memberCount) {
        const { data: profileCount } = await supabase
          .rpc('get_active_member_count');
        memberCount = profileCount || 0;
      }

      return {
        memberCount,
        upcomingEventsCount: eventsCountData || 0,
        rating: meetupStats?.rating || null,
        joinedThisWeek: meetupStats?.joined_this_week || 0,
        avatarUrls: meetupStats?.avatar_urls || [],
        reviewCount: (meetupStats as any)?.review_count || 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
