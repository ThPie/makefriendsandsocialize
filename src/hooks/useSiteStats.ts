import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SiteStats {
  memberCount: number;
  upcomingEventsCount: number;
  rating: number | null;
  joinedThisWeek: number;
  avatarUrls: string[];
}

/**
 * Single source of truth for site-wide statistics.
 * Uses database functions to get accurate counts from actual data.
 */
export const useSiteStats = () => {
  return useQuery({
    queryKey: ['site-stats'],
    queryFn: async (): Promise<SiteStats> => {
      // Get active member count from profiles table
      const { data: memberCountData, error: memberError } = await supabase
        .rpc('get_active_member_count');
      
      if (memberError) {
        console.error('[useSiteStats] Member count error:', memberError);
      }

      // Get upcoming events count using database function
      const { data: eventsCountData, error: eventsError } = await supabase
        .rpc('get_upcoming_events_count');
      
      if (eventsError) {
        console.error('[useSiteStats] Events count error:', eventsError);
      }

      // Get additional stats from meetup_stats for avatars and rating
      const { data: meetupStats, error: meetupError } = await supabase
        .from('meetup_stats')
        .select('rating, avatar_urls, joined_this_week')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();
      
      if (meetupError && meetupError.code !== 'PGRST116') {
        console.error('[useSiteStats] Meetup stats error:', meetupError);
      }

      return {
        memberCount: memberCountData || 0,
        upcomingEventsCount: eventsCountData || 0,
        rating: meetupStats?.rating || null,
        joinedThisWeek: meetupStats?.joined_this_week || 0,
        avatarUrls: meetupStats?.avatar_urls || [],
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
