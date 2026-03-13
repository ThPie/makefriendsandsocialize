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
 * Aggregates member/attendee counts across all platforms (Meetup, Eventbrite, Luma).
 * Queries run in parallel for maximum speed.
 */
export const useSiteStats = () => {
  return useQuery({
    queryKey: ['site-stats'],
    queryFn: async (): Promise<SiteStats> => {
      // Run all independent queries in parallel — was sequential (3 round trips → 1)
      const [eventsCountRes, meetupStatsRes] = await Promise.all([
        supabase.rpc('get_upcoming_events_count'),
        supabase
          .from('meetup_stats')
          .select('member_count, rating, avatar_urls, joined_this_week, eventbrite_follower_count, luma_follower_count')
          .order('last_updated', { ascending: false })
          .limit(1)
          .single(),
      ]);

      if (eventsCountRes.error) {
        console.error('[useSiteStats] Events count error:', eventsCountRes.error);
      }
      if (meetupStatsRes.error && meetupStatsRes.error.code !== 'PGRST116') {
        console.error('[useSiteStats] Meetup stats error:', meetupStatsRes.error);
      }

      const meetupStats = meetupStatsRes.data;

      // Use Meetup member count as base; fall back to DB count if unavailable
      let memberCount = (meetupStats as any)?.member_count || 0;
      if (!memberCount) {
        const { data: profileCount } = await supabase.rpc('get_active_member_count');
        memberCount = profileCount || 0;
      }

      // Add platform follower counts (Eventbrite + Luma followers)
      const eventbriteFollowers = (meetupStats as any)?.eventbrite_follower_count || 0;
      const lumaFollowers = (meetupStats as any)?.luma_follower_count || 0;
      const totalCommunitySize = memberCount + eventbriteFollowers + lumaFollowers;

      return {
        memberCount: totalCommunitySize,
        upcomingEventsCount: eventsCountRes.data || 0,
        rating: meetupStats?.rating || null,
        joinedThisWeek: meetupStats?.joined_this_week || 0,
        avatarUrls: meetupStats?.avatar_urls || [],
      };
    },
    // Cache for 15 minutes — this data changes slowly
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
    retry: 1,
  });
};
