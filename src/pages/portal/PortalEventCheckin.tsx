import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Calendar, MapPin, Loader2, ArrowRight, PartyPopper } from 'lucide-react';
import { useConfetti } from '@/hooks/useConfetti';
import { parseLocalDate } from '@/lib/date-utils';

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
        .select('id, checked_in_at')
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

  // Handle already checked in
  useEffect(() => {
    if (existingCheckin) {
      setCheckedIn(true);
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
              <Link to={`/auth?redirect=${encodeURIComponent(window.location.pathname)}`}>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
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
              <Link to="/portal/events">
                View All Events
              </Link>
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
              <Link to="/portal/events">
                Back to Events
              </Link>
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

          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-foreground mb-3">{event.title}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {parseLocalDate(event.date).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                  {event.time && ` at ${event.time}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{event.venue_name || event.location}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link to="/portal">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/portal/events">
                View All Events
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}