import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { InlineFeedback } from '@/components/ui/inline-feedback';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { AddToCalendarButton } from '@/components/events/AddToCalendarButton';
import { parseLocalDate } from '@/lib/date-utils';
import {
  ArrowLeft, Clock, MapPin, Users, DollarSign, Tag,
  Calendar, ExternalLink, CheckCircle2, Loader2
} from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { generateEventSchema, generateBreadcrumbSchema } from '@/lib/seo-schema';
import { isTierAtLeast } from '@/lib/tier-utils';
import { EventUpgradeModal } from '@/components/portal/EventUpgradeModal';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  location: string | null;
  image_url: string | null;
  tier: string;
  capacity: number | null;
  status: string;
  venue_name: string | null;
  venue_address: string | null;
  city: string | null;
  country: string | null;
  ticket_price: number | null;
  currency: string | null;
  registration_deadline: string | null;
  is_featured: boolean | null;
  tags: string[] | null;
  source: string | null;
}

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, membership } = useAuth();
  const queryClient = useQueryClient();
  const [isRsvping, setIsRsvping] = useState(false);
  const [rsvpFeedback, setRsvpFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Event;
    },
    enabled: !!id,
  });

  // Fetch RSVP count
  const { data: rsvpCount = 0 } = useQuery({
    queryKey: ['event-rsvp-count', id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('event_rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id)
        .eq('status', 'confirmed');

      if (error) throw error;
      return count || 0;
    },
    enabled: !!id,
  });

  // Check user's RSVP status
  const { data: userRsvp } = useQuery({
    queryKey: ['user-rsvp', id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const handleRSVP = async () => {
    if (!user) {
      navigate('/auth', { state: { returnTo: `/events/${id}` } });
      return;
    }

    if (event && !isTierAtLeast(membership?.tier, event.tier as any)) {
      setShowUpgradeModal(true);
      return;
    }

    if (event?.ticket_price && event.ticket_price > 0 && !userRsvp) {
      toast.info('Online payment coming soon. Please pay at the venue.');
      // For now, allow RSVP but warn about payment? Or block?
      // Blocking is safer for "paid" events.
      // return; 
      // Actually, let's allow it but show a message, or else they can't attend at all.
      // Ideally we'd have a 'payment_status' on RSVP.
    }

    setIsRsvping(true);
    try {
      if (userRsvp) {
        // Cancel RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .delete()
          .eq('id', userRsvp.id);

        if (error) throw error;

        // Decrement rsvp_count
        await supabase.rpc('decrement_rsvp_count', { event_id: id });

        setRsvpFeedback({
          type: 'success',
          message: `You've cancelled your RSVP for ${event?.title}`,
        });
        setTimeout(() => setRsvpFeedback(null), 5000);
      } else {
        // Create RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .insert({
            event_id: id,
            user_id: user.id,
            status: 'confirmed',
          });

        if (error) throw error;

        // Increment rsvp_count
        await supabase.rpc('increment_rsvp_count', { event_id: id });

        setRsvpFeedback({
          type: 'success',
          message: `You're going to ${event?.title}!`,
        });
        setTimeout(() => setRsvpFeedback(null), 5000);
      }

      queryClient.invalidateQueries({ queryKey: ['user-rsvp', id] });
      queryClient.invalidateQueries({ queryKey: ['event-rsvp-count', id] });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
    } catch (error) {
      console.error('RSVP error:', error);
      setRsvpFeedback({
        type: 'error',
        message: "Failed to update RSVP. Please try again.",
      });
    } finally {
      setIsRsvping(false);
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return 'TBD';
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      return format(date, 'h:mm a');
    } catch {
      return time;
    }
  };

  const formatPrice = (price: number | null, currency: string | null) => {
    if (!price || price === 0) return 'Free';
    const curr = currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
    }).format(price);
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'founder': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'fellow': return 'bg-primary/10 text-primary border-primary/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
      case 'upcoming':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Upcoming</Badge>;
      case 'past':
        return <Badge variant="secondary">Past Event</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return null;
    }
  };

  if (eventLoading) {
    return (
      <div className="flex-1 w-full flex flex-col">
        <div className="relative w-full h-[50vh] md:h-[60vh]">
          <Skeleton className="absolute inset-0" />
        </div>
        <div className="w-full max-w-4xl mx-auto px-6 -mt-20 relative z-10 pb-20">
          <div className="bg-white/[0.04] rounded-2xl border border-white/[0.08] p-8 md:p-12 space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center py-20">
        <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Event Not Found</h1>
        <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/events">Browse All Events</Link>
        </Button>
      </div>
    );
  }

  const isPastEvent = parseLocalDate(event.date) < new Date();
  const spotsLeft = event.capacity ? event.capacity - rsvpCount : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  const breadcrumbSchema = event ? generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Events', item: '/events' },
    { name: event.title, item: `/events/${event.id}` }
  ]) : null;

  const eventSchema = event ? generateEventSchema(event) : null;
  const combinedSchema = [breadcrumbSchema, eventSchema].filter(Boolean) as object[];

  return (
    <div className="flex-1 w-full flex flex-col">
      <SEO
        title={event.title}
        description={event.description?.slice(0, 160)}
        keywords={event.tags?.join(', ')}
        schema={combinedSchema}
      />

      <EventUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        eventTitle={event.title}
        eventTier={event.tier}
      />

      {/* Hero Image */}
      <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: event.image_url
              ? `url("${event.image_url}")`
              : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.5) 100%)'
          }}
        />
        <div className="absolute inset-0 bg-black/50" />

        {/* Back Button */}
        <div className="absolute top-6 left-6 z-10">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="bg-background/80 backdrop-blur-sm border-border hover:bg-background"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Status & Featured Badges */}
        <div className="absolute top-6 right-6 z-10 flex gap-2">
          {event.is_featured && (
            <Badge className="bg-amber-500/90 text-white">⭐ Featured</Badge>
          )}
          {getStatusBadge(event.status)}
        </div>
      </section>

      {/* Content */}
      <section className="w-full max-w-4xl mx-auto px-6 -mt-20 relative z-10 pb-20">
        <div className="bg-white/[0.04] rounded-2xl border border-white/[0.08] shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <p className="text-primary text-sm font-bold uppercase tracking-wide">
                {format(parseLocalDate(event.date), 'EEEE, MMMM d, yyyy')}
              </p>
              <Badge className={getTierBadgeColor(event.tier)}>
                {event.tier.charAt(0).toUpperCase() + event.tier.slice(1)} Tier
              </Badge>
              {event.source === 'meetup' && (
                <Badge variant="outline" className="text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Meetup
                </Badge>
              )}
            </div>

            <h1 className="text-foreground text-3xl md:text-4xl font-bold font-display leading-tight mb-4">
              {event.title}
            </h1>

            {userRsvp && (
              <span className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-bold bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="h-4 w-4" />
                You're Going
              </span>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="text-foreground font-medium">{formatTime(event.time)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Venue</p>
                <p className="text-foreground font-medium">{event.venue_name || event.location || 'TBD'}</p>
                {event.venue_address && (
                  <p className="text-sm text-muted-foreground">{event.venue_address}</p>
                )}
                {(event.city || event.country) && (
                  <p className="text-sm text-muted-foreground">
                    {[event.city, event.country].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="text-foreground font-medium">
                  {rsvpCount} {rsvpCount === 1 ? 'person' : 'people'} going
                </p>
                {event.capacity && (
                  <p className="text-sm text-muted-foreground">
                    {spotsLeft !== null && spotsLeft > 0
                      ? `${spotsLeft} spots left`
                      : isFull
                        ? 'Event is full'
                        : `${event.capacity} capacity`
                    }
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-foreground font-medium">
                  {formatPrice(event.ticket_price, event.currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {event.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="mb-10">
            <h2 className="text-foreground text-xl font-bold font-display mb-4">About This Event</h2>
            <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {event.description || 'No description available.'}
            </div>
          </div>

          {/* Registration Deadline */}
          {event.registration_deadline && (
            <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <p className="text-amber-400 text-sm font-medium">
                <Calendar className="h-4 w-4 inline mr-2" />
                Registration deadline: {format(parseLocalDate(event.registration_deadline), 'MMMM d, yyyy')}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {!isPastEvent && event.status !== 'cancelled' && (
              <Button
                size="lg"
                onClick={handleRSVP}
                variant={userRsvp ? "outline" : "default"}
                className={`flex-1 ${userRsvp ? 'border-destructive/50 text-destructive hover:bg-destructive/10' : ''}`}
                disabled={isRsvping || (isFull && !userRsvp)}
              >
                {isRsvping ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : userRsvp ? (
                  'Cancel RSVP'
                ) : isFull ? (
                  'Event Full'
                ) : (
                  'RSVP Now'
                )}
              </Button>
            )}

            <AddToCalendarButton
              event={event}
              size="lg"
              className="flex-1 sm:flex-none"
            />

            <Button variant="outline" size="lg" asChild>
              <Link to="/contact">Have Questions?</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDetailPage;
