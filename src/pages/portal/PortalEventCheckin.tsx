import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Calendar, MapPin, Loader2, ArrowRight, PartyPopper, Users } from 'lucide-react';
import { useConfetti } from '@/hooks/useConfetti';
import { parseLocalDate } from '@/lib/date-utils';
import { EventQuestList } from '@/components/events/EventQuestList';
import { EventHeatmap } from '@/components/events/EventHeatmap';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string | null;
  venue_name: string | null;
  location: string | null;
  check_in_code: string | null;
}

export default function PortalEventCheckin() {
  const { eventId, code } = useParams<{ eventId: string; code: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const { fireConfetti } = useConfetti();
  const [checkedIn, setCheckedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const zones = ['Bar Area', 'Networking Lounge', 'Main Stage', 'Terrace', 'VIP Section'];

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event-checkin', eventId],
    queryFn: async () => {
      // Fetch event with check_in_code using type assertion
      const { data, error } = await (supabase as any)
        .from('events')
        .select('id, title, date, time, venue_name, location, check_in_code')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data as Event;
    },
    enabled: !!eventId,
  });

  // Check if already checked in
  const { data: existingCheckin } = useQuery({
    queryKey: ['existing-checkin', eventId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await (supabase as any)
        .from('event_checkins')
        .select('id, checked_in_at, zone')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!eventId && !!user,
  });

  // Check-in mutation
  const checkinMutation = useMutation({
    mutationFn: async () => {
      if (!user || !event) throw new Error('Not authenticated');

      // Verify code
      if (event.check_in_code !== code) {
        throw new Error('Invalid check-in code');
      }

      const { error } = await (supabase as any).from('event_checkins').insert({
        event_id: event.id,
        user_id: user.id,
        check_in_method: 'qr',
      });

      if (error) {
        if (error.code === '23505') {
          throw new Error('You are already checked in');
        }
        throw error;
      }
    },
    onSuccess: () => {
      setCheckedIn(true);
      fireConfetti();
      // Generate AI Quests on check-in
      supabase.functions.invoke('generate-event-quests', {
        body: { eventId, userId: user?.id },
      }).catch(err => console.error('Quest generation failed:', err));
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Auto check-in when ready
  useEffect(() => {
    if (user && event && code && !existingCheckin && !checkedIn && !error) {
      checkinMutation.mutate();
    }
  }, [user, event, code, existingCheckin, checkedIn, error]);

  // Update zone mutation
  const updateZoneMutation = useMutation({
    mutationFn: async (zone: string) => {
      if (!user || !eventId) return;
      const { error } = await (supabase as any)
        .from('event_checkins')
        .update({ zone })
        .eq('event_id', eventId)
        .eq('user_id', user.id);
      if (error) throw error;
      setSelectedZone(zone);
    },
    onSuccess: () => {
      toast.success('Zone updated! 📍');
    }
  });

  // Handle already checked in
  useEffect(() => {
    if (existingCheckin) {
      setCheckedIn(true);
      if (existingCheckin.zone) {
        setSelectedZone(existingCheckin.zone);
      }
    }
  }, [existingCheckin]);

  if (authLoading || eventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h1 className="font-display text-2xl mb-2">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to check in to this event
            </p>
            <Button asChild className="w-full">
              <TransitionLink to={`/auth?redirect=${encodeURIComponent(window.location.pathname)}`}>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </TransitionLink>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h1 className="font-display text-2xl mb-2">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This event doesn't exist or the check-in link is invalid
            </p>
            <Button asChild variant="outline" className="w-full">
              <TransitionLink to="/portal/events">
                View All Events
              </TransitionLink>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h1 className="font-display text-2xl mb-2">Check-in Failed</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button asChild variant="outline" className="w-full">
              <TransitionLink to="/portal/events">
                Back to Events
              </TransitionLink>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (checkinMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
            <h1 className="font-display text-2xl mb-2">Checking You In...</h1>
            <p className="text-muted-foreground">Just a moment</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-primary/20">
        <CardContent className="p-8 text-center">
          <div className="relative mb-6">
            <div className="h-20 w-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <PartyPopper className="absolute -top-2 -right-2 h-8 w-8 text-primary animate-bounce" />
          </div>

          <h1 className="font-display text-2xl mb-2">You're Checked In!</h1>
          <p className="text-muted-foreground mb-6">
            {existingCheckin
              ? 'You already checked in earlier. Enjoy the event!'
              : 'Welcome! Enjoy the event and connect with fellow members.'}
          </p>

          <div className="mb-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Where are you currently?
            </h3>
            <div className="flex flex-wrap gap-2">
              {zones.map((zone) => (
                <Button
                  key={zone}
                  variant={selectedZone === zone ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full text-[11px] h-8"
                  onClick={() => updateZoneMutation.mutate(zone)}
                  disabled={updateZoneMutation.isPending}
                >
                  {zone}
                </Button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 italic">
              Updating your zone helps the "Social Heatmap" guide members to synergy hotspots! 🔥
            </p>
          </div>

          <EventHeatmap eventId={eventId!} />

          <div className="mt-8">
            <EventQuestList eventId={eventId!} userId={user.id} />
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <Button asChild className="w-full">
              <TransitionLink to="/portal">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </TransitionLink>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <TransitionLink to="/portal/events">
                View All Events
              </TransitionLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}