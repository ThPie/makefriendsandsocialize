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

      // Get stats from meetup_stats - primary source for avatars and base member count
      const { data: meetupStats, error: meetupError } = await supabase
        .from('meetup_stats')
        .select('member_count, rating, avatar_urls, joined_this_week')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();
      
      if (meetupError && meetupError.code !== 'PGRST116') {
        console.error('[useSiteStats] Meetup stats error:', meetupError);
      }

      // Aggregate total RSVP/attendee counts across all platform-specific fields
      const { data: platformTotals, error: platformError } = await supabase
        .from('events')
        .select('meetup_rsvp_count, eventbrite_rsvp_count, luma_rsvp_count');

      if (platformError) {
        console.error('[useSiteStats] Platform totals error:', platformError);
      }

      let totalEventbriteAttendees = 0;
      let totalLumaAttendees = 0;
      if (platformTotals) {
        for (const e of platformTotals) {
          totalEventbriteAttendees += e.eventbrite_rsvp_count || 0;
          totalLumaAttendees += e.luma_rsvp_count || 0;
        }
      }

      // Use Meetup member count as base, add unique attendees from other platforms
      let memberCount = meetupStats?.member_count || 0;
      
      if (!memberCount) {
        const { data: profileCount } = await supabase
          .rpc('get_active_member_count');
        memberCount = profileCount || 0;
      }

      // Add cross-platform attendees to total community size
      const totalCommunitySize = memberCount + totalEventbriteAttendees + totalLumaAttendees;

      return {
        memberCount: totalCommunitySize,
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
