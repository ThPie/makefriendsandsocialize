import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { InlineFeedback } from '@/components/ui/inline-feedback';
import { format, differenceInDays } from 'date-fns';
import { Calendar, MapPin, Users, Clock, Star, Image, CalendarPlus, Grid, List, Search, ArrowUpDown, CheckCircle2, ExternalLink } from 'lucide-react';
import { AddToCalendarButton } from '@/components/events/AddToCalendarButton';
import { parseLocalDate } from '@/lib/date-utils';
import { categorizeEvent } from '@/lib/event-categorization';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SEO } from '@/components/common/SEO';
import { generateEventSchema, generateBreadcrumbSchema } from '@/lib/seo-schema';

type SortOption = 'date-asc' | 'date-desc' | 'title-asc' | 'title-desc';
type EventTab = 'upcoming' | 'past';

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
  status: string;
  venue_name?: string | null;
  city?: string | null;
  is_featured?: boolean | null;
  tags?: string[] | null;
  rsvp_count?: number | null;
  source?: string | null;
  external_url?: string | null;
  eventbrite_id?: string | null;
}

const EventSkeleton = () => (
  <motion.div
    className="flex flex-col gap-4 rounded-2xl bg-card overflow-hidden border border-border"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="w-full aspect-[4/3] bg-muted animate-pulse" />
    <div className="flex flex-col gap-3 p-6">
      <div className="flex justify-between items-center">
        <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-6 w-3/4 bg-muted rounded mt-1 animate-pulse" />
      <div className="h-16 w-full bg-muted rounded mt-2 animate-pulse" />
      <div className="flex gap-2 mt-auto pt-4">
        <div className="h-10 w-full bg-muted rounded-xl animate-pulse" />
      </div>
    </div>
  </motion.div>
);

const EventsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(() => {
    const categoryParam = searchParams.get('category');
    return categoryParam || "All";
  });
  const [sortOrder, setSortOrder] = useState<SortOption>('date-desc');
  const [activeTab, setActiveTab] = useState<EventTab>('upcoming');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [rsvpFeedback, setRsvpFeedback] = useState<{ type: 'success' | 'info'; message: string } | null>(null);
  const [ebWidgetLoaded, setEbWidgetLoaded] = useState(false);
  const categories = ["All", "Networking", "Social", "Dining", "Art & Culture", "Sports", "Music", "Dating"];

  // Load Eventbrite embedded checkout widget script
  useEffect(() => {
    if (document.querySelector('script[src*="eb_widgets.js"]')) {
      setEbWidgetLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://www.eventbrite.com/static/widgets/eb_widgets.js';
    script.async = true;
    script.onload = () => setEbWidgetLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Fetch events from database
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', activeTab],
    queryFn: async () => {
      // Use local date to avoid timezone issues (UTC can show wrong day)
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      let query = supabase
        .from('events')
        .select('*')
        .order('date', { ascending: activeTab === 'upcoming' ? true : false });

      if (activeTab === 'upcoming') {
        query = query.gte('date', today).neq('status', 'past').neq('status', 'cancelled');
      } else {
        query = query.or(`date.lt.${today},status.eq.past`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }

      return data as Event[];
    },
  });

  // Subscribe to real-time updates on events table
  useEffect(() => {
    const channel = supabase
      .channel('events-page-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['events'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Check if event is external (Meetup, Eventbrite, Luma)
  const isExternalEvent = (event: Event) => {
    return event.source === 'meetup' || event.source === 'eventbrite' || event.source === 'luma' || event.external_url;
  };

  // Check if event has Eventbrite embedded checkout available
  const isEventbriteEvent = (event: Event) => {
    return event.source === 'eventbrite' && event.eventbrite_id;
  };

  // Get the external URL for an event
  const getExternalUrl = (event: Event) => {
    if (event.external_url) return event.external_url;
    if (event.source === 'meetup') return 'https://www.meetup.com/makefriendsandsocialize/events/';
    return null;
  };

  // Open Eventbrite embedded checkout modal
  const openEventbriteCheckout = useCallback((event: Event) => {
    if (!event.eventbrite_id || !(window as any).EBWidgets) {
      // Fallback: open Eventbrite page
      const url = event.external_url || `https://www.eventbrite.com/e/${event.eventbrite_id}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    (window as any).EBWidgets.createWidget({
      widgetType: 'checkout',
      eventId: event.eventbrite_id,
      modal: true,
      modalTriggerElementId: `eb-trigger-${event.id}`,
      onOrderComplete: () => {
        setRsvpFeedback({
          type: 'success',
          message: 'You\'re registered! Check your email for confirmation.',
        });
        setTimeout(() => setRsvpFeedback(null), 5000);
      },
    });
  }, []);

  const handleRSVP = (event: Event) => {
    // For Eventbrite events, use embedded checkout
    if (isEventbriteEvent(event)) {
      openEventbriteCheckout(event);
      return;
    }

    // For other external events, redirect to external platform
    if (isExternalEvent(event)) {
      const url = getExternalUrl(event);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
      setRsvpFeedback({
        type: 'info',
        message: 'Opening event page to complete your RSVP.',
      });
      setTimeout(() => setRsvpFeedback(null), 4000);
      return;
    }

    // For internal events, require authentication
    if (!user) {
      setRsvpFeedback({
        type: 'info',
        message: "Please sign in to RSVP for this event.",
      });
      setTimeout(() => {
        navigate('/auth?returnTo=/portal/events');
      }, 1500);
      return;
    }

    // Redirect to event detail page for proper RSVP handling (which includes auth/tier checks)
    navigate(`/events/${event.id}`);
  };

  const filteredAndSortedEvents = useMemo(() => {
    let result = events.filter(event => {
      // Get auto-categorized category based on title/description
      const autoCategory = categorizeEvent(event.title, event.description);

      // Check if event matches selected category
      const matchesCategory = activeCategory === "All" ||
        autoCategory === activeCategory ||
        (event.tags && event.tags.some(tag =>
          tag.toLowerCase().includes(activeCategory.toLowerCase())
        ));

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        event.title.toLowerCase().includes(query) ||
        (event.description?.toLowerCase().includes(query)) ||
        (event.location?.toLowerCase().includes(query)) ||
        (event.city?.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });

    result.sort((a, b) => {
      switch (sortOrder) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  }, [events, activeCategory, searchQuery, sortOrder]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const }
    },
  };

  const upcomingEventsSchema = useMemo(() => {
    return filteredAndSortedEvents
      .slice(0, 3)
      .map(event => generateEventSchema(event));
  }, [filteredAndSortedEvents]);


  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Events', item: '/events' }
  ]);

  return (
    <div className="flex-1 w-full flex flex-col items-center bg-background">
      <SEO
        title="Curated Social & Networking Events in NYC"
        description="Discover exclusive gatherings for professionals. From intimate networking dinners to lively social mixers. Curated guest lists. Authentic connections."
        keywords="NYC networking events, social mixers NYC, professional events, curated parties, business networking"
        schema={[...upcomingEventsSchema, breadcrumbSchema]}
      />
      {/* Header */}
      <div className="w-full content-container py-12 flex flex-col gap-8">
        <motion.div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-foreground text-4xl md:text-5xl font-light leading-tight tracking-tight font-display">
              Events <span className="text-[hsl(var(--accent-gold))] italic">Calendar</span>
            </h1>
            <p className="text-muted-foreground text-lg font-normal mt-3">
              Curated gatherings for the discerning few.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-border self-start md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Grid View"
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="List View"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {/* Tabs for Upcoming / Past */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EventTab)} className="w-full">
            <TabsList className="bg-card border border-border w-full md:w-auto">
              <TabsTrigger value="upcoming" className="flex-1 md:flex-none gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming Events
              </TabsTrigger>
              <TabsTrigger value="past" className="flex-1 md:flex-none gap-2">
                <Clock className="h-4 w-4" />
                Past Events
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-card p-5 rounded-2xl border border-border"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {/* Search */}
          <div className="w-full lg:w-96 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="min-w-[160px]">
              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOption)}>
                <SelectTrigger className="w-full rounded-xl bg-background border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  <SelectItem value="date-asc">Date: Soonest</SelectItem>
                  <SelectItem value="date-desc">Date: Latest</SelectItem>
                  <SelectItem value="title-asc">Title: A-Z</SelectItem>
                  <SelectItem value="title-desc">Title: Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Events Grid */}
      <div className="w-full content-container pb-20">
        {isLoading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[1, 2, 3, 4, 5, 6].map(i => <EventSkeleton key={i} />)}
          </div>
        ) : filteredAndSortedEvents.length > 0 ? (
          <motion.div
            className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {filteredAndSortedEvents.map((event) => (
                <motion.div
                  key={event.id}
                  variants={itemVariants}
                  layout
                  className={`group flex flex-col bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-200 ${viewMode === 'list' ? 'md:flex-row' : ''}`}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden bg-muted ${viewMode === 'list' ? 'w-full md:w-1/3 aspect-video md:aspect-auto' : 'aspect-[4/3] w-full'}`}>
                    {event.image_url ? (
                      <div
                        className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url("${event.image_url}")` }}
                        role="img"
                        aria-label={event.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Image className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                      {event.is_featured && (
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Featured
                        </span>
                      )}
                      {event.tags && event.tags[0] && (
                        <span className="bg-card/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
                          {event.tags[0]}
                        </span>
                      )}
                    </div>
                    {activeTab === 'past' && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <Badge variant="secondary" className="text-sm px-4 py-1">
                          Event Ended
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-4 md:p-6">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <p className="text-primary text-sm font-bold uppercase tracking-wide">
                          {format(parseLocalDate(event.date), 'MMMM d, yyyy')}
                        </p>
                        {activeTab === 'upcoming' && (() => {
                          const daysUntil = differenceInDays(parseLocalDate(event.date), new Date());
                          if (daysUntil <= 3 && daysUntil >= 0) {
                            return (
                              <Badge variant="destructive" className="text-xs">
                                {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow!' : `${daysUntil} days left`}
                              </Badge>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    <h3 className="text-foreground text-xl font-semibold font-display leading-tight mb-3 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>

                    <div className="flex flex-col gap-2 text-muted-foreground text-sm mb-4">
                      {event.time && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {event.time}
                        </div>
                      )}
                      {(event.venue_name || event.location) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.venue_name || event.location}
                          {event.city && <span className="text-muted-foreground/60">• {event.city}</span>}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {(() => {
                          const attending = event.rsvp_count || 0;
                          const cap = event.capacity;
                          const spotsLeft = cap ? cap - attending : null;
                          const isFull = cap !== null && attending >= cap;

                          if (isFull) {
                            return (
                              <span className="text-destructive font-medium">
                                Sold Out • Waitlist Available
                              </span>
                            );
                          }
                          if (spotsLeft !== null && spotsLeft <= 5) {
                            return (
                              <span className="text-amber-500 font-medium">
                                Only {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left!
                              </span>
                            );
                          }
                          if (cap) {
                            return <span>{attending} / {cap} attending</span>;
                          }
                          return <span>Open event</span>;
                        })()}
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 md:gap-3 mt-auto border-t border-border pt-4">
                      {activeTab === 'upcoming' ? (
                        <>
                          <AnimatedButton
                            onClick={() => handleRSVP(event)}
                            variant={isExternalEvent(event) ? "outline" : "default"}
                            className={`flex-1 min-w-[100px] ${isExternalEvent(event) ? 'border-primary/50 text-primary hover:bg-primary/10' : ''}`}
                            aria-label={isExternalEvent(event) ? `RSVP for ${event.title}` : `RSVP for ${event.title}`}
                          >
                            {isExternalEvent(event) ? (
                              <>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                RSVP
                              </>
                            ) : (
                              'RSVP Now'
                            )}
                          </AnimatedButton>
                          <AddToCalendarButton event={event} />
                          <Button variant="outline" asChild className="rounded-xl">
                            <Link to={`/events/${event.id}`} aria-label={`View details for ${event.title}`}>Details</Link>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" asChild className="flex-1 rounded-xl">
                            <Link to={`/gallery?event=${event.id}`} aria-label={`View gallery for ${event.title}`}>
                              <Image className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">View </span>Gallery
                            </Link>
                          </Button>
                          <Button variant="outline" asChild className="rounded-xl">
                            <Link to={`/events/${event.id}`} aria-label={`View recap for ${event.title}`}>Recap</Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No {activeTab} events found
            </h3>
            <p className="text-muted-foreground">
              {activeTab === 'upcoming'
                ? 'Check back soon for new events'
                : 'No past events to show'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
