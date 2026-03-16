import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EventCardSkeleton } from '@/components/ui/page-skeleton';
import { GroupDinnerInvitation } from '@/components/portal/GroupDinnerInvitation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Calendar, MapPin, Clock, Crown, Users, ArrowRight, AlertCircle, ImageIcon, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { parseLocalDate } from '@/lib/date-utils';
import { EventAttendeePreview } from '@/components/portal/EventAttendeePreview';
import { EventPhotoGallery } from '@/components/portal/EventPhotoGallery';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  description: string | null;
  image_url: string | null;
  tier: 'patron' | 'fellow' | 'founder';
  capacity: number | null;
  venue_name: string | null;
  city: string | null;
  country: string | null;
  status: string;
  rsvp_count: number | null;
}

interface RSVPData {
  event_id: string;
  status: string;
}

interface WaitlistData {
  event_id: string;
  position: number;
  status: string;
}

import { EventCard } from '@/components/portal/EventCard';
import { PastEventCard } from '@/components/portal/PastEventCard';
import { EventUpgradeModal } from '@/components/portal/EventUpgradeModal';

export default function PortalEvents() {
  const { user, membership } = useAuth();
  const queryClient = useQueryClient();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [activeTab, setActiveTab] = useState('upcoming');
  const [upcomingPage, setUpcomingPage] = useState(0);
  const [pastPage, setPastPage] = useState(0);
  const EVENTS_PER_PAGE = 6;

  // Fetch upcoming events with pagination
  const { data: upcomingEventsData, isLoading: eventsLoading, hasNextPage: upcomingHasMore, fetchNextPage: fetchUpcomingNext, isFetchingNextPage: upcomingFetching } = useInfiniteQuery<{ events: Event[]; hasMore: boolean }>({
    queryKey: ['portal-events-upcoming'],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const page = pageParam as number;

      const { data, error, count } = await supabase
        .from('events')
        .select('*', { count: 'exact' })
        .in('status', ['upcoming', 'published'])
        .gte('date', today)
        .order('date', { ascending: true })
        .range(page * EVENTS_PER_PAGE, (page + 1) * EVENTS_PER_PAGE - 1);

      if (error) {
        console.warn('Events fetch error:', error.message);
        return { events: [], hasMore: false };
      }
      return { 
        events: data as Event[],
        hasMore: (count || 0) > (page + 1) * EVENTS_PER_PAGE
      };
    },
    getNextPageParam: (lastPage, pages) => lastPage.hasMore ? pages.length : undefined,
    retry: 1,
  });

  // Fetch past events with pagination
  const { data: pastEventsData = { pages: [] }, isLoading: pastEventsLoading, hasNextPage: pastHasMore, fetchNextPage: fetchPastNext, isFetchingNextPage: pastFetching } = useInfiniteQuery({
    queryKey: ['portal-events-past'],
    queryFn: async ({ pageParam = 0 }) => {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const { data, error, count } = await supabase
        .from('events')
        .select('*', { count: 'exact' })
        .or(`status.eq.past,date.lt.${today}`)
        .order('date', { ascending: false })
        .range(pageParam * EVENTS_PER_PAGE, (pageParam + 1) * EVENTS_PER_PAGE - 1);

      if (error) {
        console.warn('Past events fetch error:', error.message);
        return { events: [], hasMore: false };
      }
      return {
        events: data as Event[],
        hasMore: (count || 0) > (pageParam + 1) * EVENTS_PER_PAGE
      };
    },
    getNextPageParam: (lastPage, pages) => lastPage.hasMore ? pages.length : undefined,
    retry: 1,
  });
  
  const pastEvents = pastEventsData.pages.flatMap(p => p.events);

  const allUpcomingEvents = upcomingEvents.pages?.flatMap(p => p.events) || [];
  const events = activeTab === 'upcoming' ? allUpcomingEvents : pastEvents;

  // Fetch RSVP counts for events using server-side aggregation
  const { data: rsvpCounts = {} } = useQuery({
    queryKey: ['event-rsvp-counts', events.map(e => e.id)],
    queryFn: async () => {
      if (events.length === 0) return {};

      const eventIds = events.map(e => e.id);
      const { data, error } = await supabase.rpc('get_event_rsvp_counts', {
        event_ids: eventIds,
      });

      if (error) {
        console.warn('RSVP counts fetch error:', error.message);
        return {};
      }

      // Convert array response to object for easier lookup
      const counts: Record<string, number> = {};
      for (const row of data || []) {
        counts[row.event_id] = row.rsvp_count;
      }
      return counts;
    },
    enabled: events.length > 0,
  });

  // Fetch user's RSVPs
  const { data: userRSVPs = [] } = useQuery({
    queryKey: ['user-rsvps', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('event_id, status')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as RSVPData[];
    },
    enabled: !!user,
  });

  // Fetch user's waitlist entries
  const { data: userWaitlist = [] } = useQuery({
    queryKey: ['user-waitlist', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('event_waitlist')
        .select('event_id, position, status')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as WaitlistData[];
    },
    enabled: !!user,
  });

  // Fetch waitlist counts using server-side aggregation
  const { data: waitlistCounts = {} } = useQuery({
    queryKey: ['waitlist-counts', events.map(e => e.id)],
    queryFn: async () => {
      if (events.length === 0) return {};

      const eventIds = events.map(e => e.id);
      const { data, error } = await supabase.rpc('get_event_waitlist_counts', {
        event_ids: eventIds,
      });

      if (error) {
        console.warn('Waitlist counts fetch error:', error.message);
        return {};
      }

      // Convert array response to object for easier lookup
      const counts: Record<string, number> = {};
      for (const row of data || []) {
        counts[row.event_id] = row.waitlist_count;
      }
      return counts;
    },
    enabled: events.length > 0,
  });

  // RSVP mutation with optimistic updates
  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, action }: { eventId: string; action: 'rsvp' | 'cancel' }) => {
      if (action === 'rsvp') {
        const { error } = await supabase
          .from('event_rsvps')
          .insert({ event_id: eventId, user_id: user!.id, status: 'confirmed' });

        if (error) {
          // Check for custom Postgres exception from enforce_event_capacity() trigger
          if (error.code === 'P0001') {
            throw new Error(error.message || 'This event is now full.');
          }
          throw error;
        }

        await supabase.functions.invoke('send-rsvp-notification', {
          body: { eventId, userId: user!.id, action: 'rsvp' },
        });
      } else {
        const { error } = await supabase
          .from('event_rsvps')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user!.id);

        if (error) throw error;

        // Note: Waitlist promotion and notifications are now handled automatically 
        // by database triggers on the server-side.
      }
    },
    onMutate: async ({ eventId, action }) => {
      await queryClient.cancelQueries({ queryKey: ['user-rsvps'] });
      await queryClient.cancelQueries({ queryKey: ['event-rsvp-counts'] });
      const previousRsvps = queryClient.getQueryData(['user-rsvps']);
      const previousCounts = queryClient.getQueryData(['event-rsvp-counts']);
      if (action === 'rsvp') {
        queryClient.setQueryData(['user-rsvps'], (old: any) => [...old, { event_id: eventId, status: 'confirmed' }]);
        queryClient.setQueryData(['event-rsvp-counts'], (old: any) => ({ ...old, [eventId]: (old[eventId] || 0) + 1 }));
      } else {
        queryClient.setQueryData(['user-rsvps'], (old: any) => old.filter((r: any) => r.event_id !== eventId));
        queryClient.setQueryData(['event-rsvp-counts'], (old: any) => ({ ...old, [eventId]: Math.max(0, (old[eventId] || 0) - 1) }));
      }
      return { previousRsvps, previousCounts };
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['user-rsvps'] });
      queryClient.invalidateQueries({ queryKey: ['event-rsvp-counts'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist-counts'] });
      queryClient.invalidateQueries({ queryKey: ['user-waitlist'] });
      toast.success(action === 'rsvp' ? 'RSVP confirmed! We\'ll see you there.' : 'RSVP cancelled');
    },
    onError: (error: any, _, context: any) => {
      if (context?.previousRsvps) queryClient.setQueryData(['user-rsvps'], context.previousRsvps);
      if (context?.previousCounts) queryClient.setQueryData(['event-rsvp-counts'], context.previousCounts);
      toast.error(error.message || 'Failed to update RSVP');
    },
  });

  // Waitlist mutation
  const waitlistMutation = useMutation({
    mutationFn: async ({ eventId, action }: { eventId: string; action: 'join' | 'leave' }) => {
      if (action === 'join') {
        const { data: positionData } = await supabase.rpc('get_next_waitlist_position', {
          p_event_id: eventId,
        });

        const { error } = await supabase
          .from('event_waitlist')
          .insert({
            event_id: eventId,
            user_id: user!.id,
            position: positionData || 1,
            status: 'waiting',
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('event_waitlist')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user!.id);
        if (error) throw error;
      }
    },
    onMutate: async ({ eventId, action }) => {
      await queryClient.cancelQueries({ queryKey: ['user-waitlist'] });
      await queryClient.cancelQueries({ queryKey: ['waitlist-counts'] });
      const previousWaitlist = queryClient.getQueryData(['user-waitlist']);
      const previousCounts = queryClient.getQueryData(['waitlist-counts']);
      if (action === 'join') {
        queryClient.setQueryData(['user-waitlist'], (old: any) => [...old, { event_id: eventId, position: (old?.length || 0) + 1, status: 'waiting' }]);
        queryClient.setQueryData(['waitlist-counts'], (old: any) => ({ ...old, [eventId]: (old[eventId] || 0) + 1 }));
      } else {
        queryClient.setQueryData(['user-waitlist'], (old: any) => old.filter((w: any) => w.event_id !== eventId));
        queryClient.setQueryData(['waitlist-counts'], (old: any) => ({ ...old, [eventId]: Math.max(0, (old[eventId] || 0) - 1) }));
      }
      return { previousWaitlist, previousCounts };
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['user-waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist-counts'] });
      toast.success(action === 'join' ? 'You\'ve been added to the waitlist!' : 'Removed from waitlist');
    },
    onError: (error: any, _, context: any) => {
      if (context?.previousWaitlist) queryClient.setQueryData(['user-waitlist'], context.previousWaitlist);
      if (context?.previousCounts) queryClient.setQueryData(['waitlist-counts'], context.previousCounts);
      toast.error(error.message || 'Failed to update waitlist');
    },
  });

  const canAccessEvent = (eventTier: 'patron' | 'fellow' | 'founder') => {
    const tierOrder = { patron: 0, fellow: 1, founder: 2 };
    const userTier = membership?.tier || 'patron';
    return tierOrder[userTier] >= tierOrder[eventTier];
  };

  const isEventFull = (event: Event) => {
    if (!event.capacity) return false;
    // Prefer rsvp_count from event object (server-side synced)
    const confirmedCount = event.rsvp_count ?? rsvpCounts[event.id] ?? 0;
    return confirmedCount >= event.capacity;
  };

  const isUserRSVPd = (eventId: string) => {
    return userRSVPs.some(r => r.event_id === eventId && r.status === 'confirmed');
  };

  const getUserWaitlistEntry = (eventId: string) => {
    return userWaitlist.find(w => w.event_id === eventId);
  };

  const handleRSVP = (event: Event) => {
    if (!canAccessEvent(event.tier)) {
      setSelectedEvent(event);
      setShowUpgradeModal(true);
      return;
    }

    if (isUserRSVPd(event.id)) {
      rsvpMutation.mutate({ eventId: event.id, action: 'cancel' });
    } else if (isEventFull(event)) {
      waitlistMutation.mutate({ eventId: event.id, action: 'join' });
    } else {
      rsvpMutation.mutate({ eventId: event.id, action: 'rsvp' });
    }
  };

  const handleLeaveWaitlist = (eventId: string) => {
    waitlistMutation.mutate({ eventId, action: 'leave' });
  };

  const handleClaimSpot = (eventId: string) => {
    handleLeaveWaitlist(eventId);
    rsvpMutation.mutate({ eventId, action: 'rsvp' });
  };

  if (eventsLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div>
          <Skeleton className="h-10 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl text-foreground">
          Exclusive Events
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Curated gatherings for distinguished members
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({allUpcomingEvents.length})</TabsTrigger>
          <TabsTrigger value="past">
            <ImageIcon className="h-4 w-4 mr-1" />
            Past Events ({pastEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {eventsLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <Card className="p-12 text-center border-border bg-card">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="font-display text-xl mb-2 text-foreground">No Upcoming Events</h3>
              <p className="text-muted-foreground mb-4">
                Check back soon for exciting gatherings! Browse our past events below for a taste of what's to come.
              </p>
              <Button variant="outline" onClick={() => setActiveTab('past')}>
                <ImageIcon className="h-4 w-4 mr-2" />
                View Past Events
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {allUpcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    canAccess={canAccessEvent(event.tier)}
                    isRSVPd={isUserRSVPd(event.id)}
                    isFull={isEventFull(event)}
                    attending={rsvpCounts[event.id] || 0}
                    waitlistCount={waitlistCounts[event.id] || 0}
                    waitlistEntry={getUserWaitlistEntry(event.id)}
                    isRSVPPending={rsvpMutation.isPending}
                    isWaitlistPending={waitlistMutation.isPending}
                    onRSVP={handleRSVP}
                    onLeaveWaitlist={handleLeaveWaitlist}
                    onClaimSpot={handleClaimSpot}
                  />
                ))}
              </div>
              {upcomingHasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => fetchUpcomingNext()}
                    disabled={upcomingFetching}
                  >
                    {upcomingFetching ? 'Loading...' : 'Load More Events'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastEventsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : pastEvents.length === 0 ? (
            <Card className="p-12 text-center border-border bg-card">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-display text-xl mb-2">No Past Events Yet</h3>
              <p className="text-muted-foreground">Event memories will appear here after they happen!</p>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastEvents.map((event) => (
                  <PastEventCard key={event.id} event={event} />
                ))}
              </div>
              {pastHasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => fetchPastNext()}
                    disabled={pastFetching}
                  >
                    {pastFetching ? 'Loading...' : 'Load More Past Events'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <EventUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        eventTitle={selectedEvent?.title}
        eventTier={selectedEvent?.tier}
      />
    </div>
  );
}
