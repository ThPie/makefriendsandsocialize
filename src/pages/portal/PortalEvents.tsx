import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar, MapPin, Clock, Crown, Users, ArrowRight, Clock3, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parseLocalDate } from '@/lib/date-utils';

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

export default function PortalEvents() {
  const { user, membership } = useAuth();
  const queryClient = useQueryClient();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Fetch upcoming events
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['portal-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data as Event[];
    },
  });

  // Fetch RSVP counts for events
  const { data: rsvpCounts = {} } = useQuery({
    queryKey: ['event-rsvp-counts', events.map(e => e.id)],
    queryFn: async () => {
      if (events.length === 0) return {};
      
      const counts: Record<string, number> = {};
      for (const event of events) {
        const { count, error } = await supabase
          .from('event_rsvps')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('status', 'confirmed');
        
        if (!error) {
          counts[event.id] = count || 0;
        }
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

  // Fetch waitlist counts
  const { data: waitlistCounts = {} } = useQuery({
    queryKey: ['waitlist-counts', events.map(e => e.id)],
    queryFn: async () => {
      if (events.length === 0) return {};
      
      const counts: Record<string, number> = {};
      for (const event of events) {
        const { count, error } = await supabase
          .from('event_waitlist')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('status', 'waiting');
        
        if (!error) {
          counts[event.id] = count || 0;
        }
      }
      return counts;
    },
    enabled: events.length > 0,
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, action }: { eventId: string; action: 'rsvp' | 'cancel' }) => {
      if (action === 'rsvp') {
        const { error } = await supabase
          .from('event_rsvps')
          .insert({ event_id: eventId, user_id: user!.id, status: 'confirmed' });
        if (error) throw error;
        
        // Increment rsvp_count
        await supabase.rpc('increment_rsvp_count', { event_id: eventId });
        
        // Call notification edge function
        await supabase.functions.invoke('send-rsvp-notification', {
          body: { eventId, userId: user!.id, action: 'rsvp' },
        });
      } else {
        // First delete the RSVP - this will trigger promote_from_waitlist
        const { error } = await supabase
          .from('event_rsvps')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user!.id);
        if (error) throw error;
        
        // Decrement rsvp_count
        await supabase.rpc('decrement_rsvp_count', { event_id: eventId });
        
        // Check if someone was promoted from waitlist and send them an email
        // Wait a moment for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Find recently notified waitlist entry for this event
        const { data: notifiedEntry } = await supabase
          .from('event_waitlist')
          .select('user_id, id')
          .eq('event_id', eventId)
          .eq('status', 'notified')
          .order('notified_at', { ascending: false })
          .limit(1)
          .single();
        
        if (notifiedEntry) {
          // Send waitlist promotion email
          await supabase.functions.invoke('send-waitlist-notification', {
            body: { 
              userId: notifiedEntry.user_id, 
              eventId, 
              waitlistId: notifiedEntry.id 
            },
          });
        }
      }
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['user-rsvps'] });
      queryClient.invalidateQueries({ queryKey: ['event-rsvp-counts'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist-counts'] });
      queryClient.invalidateQueries({ queryKey: ['user-waitlist'] });
      toast.success(action === 'rsvp' ? 'RSVP confirmed! We\'ll see you there.' : 'RSVP cancelled');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update RSVP');
    },
  });

  // Waitlist mutation
  const waitlistMutation = useMutation({
    mutationFn: async ({ eventId, action }: { eventId: string; action: 'join' | 'leave' }) => {
      if (action === 'join') {
        // Get next position
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
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['user-waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist-counts'] });
      toast.success(action === 'join' ? 'You\'ve been added to the waitlist!' : 'Removed from waitlist');
    },
    onError: (error: any) => {
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
    return (rsvpCounts[event.id] || 0) >= event.capacity;
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
      // Join waitlist
      waitlistMutation.mutate({ eventId: event.id, action: 'join' });
    } else {
      rsvpMutation.mutate({ eventId: event.id, action: 'rsvp' });
    }
  };

  const handleLeaveWaitlist = (eventId: string) => {
    waitlistMutation.mutate({ eventId, action: 'leave' });
  };

  const getTierBadge = (tier: 'patron' | 'fellow' | 'founder') => {
    const colors = {
      patron: 'bg-muted text-muted-foreground',
      fellow: 'bg-accent/10 text-accent-foreground',
      founder: 'bg-primary/10 text-primary',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${colors[tier]}`}>
        {tier === 'founder' && <Crown className="h-3 w-3" />}
        {tier.charAt(0).toUpperCase() + tier.slice(1)} & Above
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return parseLocalDate(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  if (eventsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
          Upcoming Events
        </h1>
        <p className="text-muted-foreground">
          Exclusive gatherings for members of Make Friends and Socialize
        </p>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-display text-xl mb-2">No Upcoming Events</h3>
          <p className="text-muted-foreground">Check back soon for new events!</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => {
            const canAccess = canAccessEvent(event.tier);
            const isRSVPd = isUserRSVPd(event.id);
            const isFull = isEventFull(event);
            const waitlistEntry = getUserWaitlistEntry(event.id);
            const attending = rsvpCounts[event.id] || 0;
            const waitlistCount = waitlistCounts[event.id] || 0;

            return (
              <Card key={event.id} className="overflow-hidden group">
                {/* Image */}
                <div className="aspect-[16/9] relative overflow-hidden">
                  <img
                    src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                    alt={event.title}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      !canAccess ? 'opacity-50' : ''
                    }`}
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {getTierBadge(event.tier)}
                    {isFull && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Sold Out
                      </Badge>
                    )}
                  </div>
                  {!canAccess && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                      <Crown className="h-12 w-12 text-primary" />
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <h3 className="font-display text-xl text-foreground mb-3">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    {event.time && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {event.venue_name || event.location}
                        {event.city && `, ${event.city}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {(() => {
                        const spotsLeft = event.capacity ? event.capacity - attending : null;
                        if (isFull) {
                          return (
                            <span className="text-destructive font-medium">
                              Sold Out
                              {waitlistCount > 0 && (
                                <span className="text-amber-600 ml-2">
                                  ({waitlistCount} on waitlist)
                                </span>
                              )}
                            </span>
                          );
                        }
                        if (spotsLeft !== null && spotsLeft <= 5) {
                          return (
                            <span className="text-amber-500 font-medium">
                              {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left!
                              {waitlistCount > 0 && (
                                <span className="text-muted-foreground ml-2">
                                  ({waitlistCount} on waitlist)
                                </span>
                              )}
                            </span>
                          );
                        }
                        return (
                          <span>
                            {attending} / {event.capacity || '∞'} attending
                            {waitlistCount > 0 && (
                              <span className="text-amber-600 ml-2">
                                ({waitlistCount} on waitlist)
                              </span>
                            )}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  {/* Waitlist status */}
                  {waitlistEntry && (
                    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-600">
                        <Clock3 className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {waitlistEntry.status === 'notified' 
                            ? 'A spot opened up! Claim it now.'
                            : `#${waitlistEntry.position} on waitlist`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {waitlistEntry ? (
                    <div className="flex gap-2">
                      {waitlistEntry.status === 'notified' ? (
                        <Button
                          className="flex-1"
                          onClick={() => {
                            handleLeaveWaitlist(event.id);
                            rsvpMutation.mutate({ eventId: event.id, action: 'rsvp' });
                          }}
                          disabled={rsvpMutation.isPending}
                        >
                          Claim Your Spot
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleLeaveWaitlist(event.id)}
                          disabled={waitlistMutation.isPending}
                        >
                          Leave Waitlist
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      variant={isRSVPd ? 'outline' : canAccess ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => handleRSVP(event)}
                      disabled={rsvpMutation.isPending || waitlistMutation.isPending}
                    >
                      {!canAccess ? (
                        <>
                          <Crown className="h-4 w-4 mr-2" />
                          Upgrade to RSVP
                        </>
                      ) : isRSVPd ? (
                        'Cancel RSVP'
                      ) : isFull ? (
                        <>
                          <Clock3 className="h-4 w-4 mr-2" />
                          Join Waitlist
                        </>
                      ) : (
                        'RSVP Now'
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Upgrade Required</DialogTitle>
            <DialogDescription>
              {selectedEvent && (
                <>
                  <strong>{selectedEvent.title}</strong> is exclusive to{' '}
                  {selectedEvent.tier.charAt(0).toUpperCase() + selectedEvent.tier.slice(1)} members and above.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              Upgrade your membership to unlock access to exclusive events, 
              curated introductions, and more.
            </p>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
                Maybe Later
              </Button>
              <Button asChild>
                <Link to="/membership" onClick={() => setShowUpgradeModal(false)}>
                  View Membership Options
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
