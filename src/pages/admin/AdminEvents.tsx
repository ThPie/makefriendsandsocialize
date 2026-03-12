import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { getAdminEvents, deleteEvent, updateEvent } from '@/services/events';
import type { Event } from '@/types/events';
import { AnimatedCard, AnimatedCardContent } from '@/components/ui/animated-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { EventFormDialog, duplicateEventToForm } from '@/components/admin/EventFormDialog';
import { EventQRCodeDialog } from '@/components/admin/EventQRCodeDialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Calendar, MapPin, Users, Plus, Edit, Trash2, Loader2,
  Copy, Star, RefreshCw, QrCode, BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';



export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isSyncingMeetup, setIsSyncingMeetup] = useState(false);
  const [qrDialogEvent, setQrDialogEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminEvents(200);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const handleDuplicate = (event: Event) => {
    // We can use the helper from EventFormDialog if we wanted, 
    // but here we just open the dialog in "edit" mode with a modified object if we prefer.
    // Or we can just set editingEvent to a modified object.
    const dup = {
      ...event,
      id: '', // Crucial to treat as new
      title: `${event.title} (Copy)`,
      date: '',
      status: 'upcoming',
      registration_deadline: '',
      is_featured: false,
      rsvp_count: 0
    } as Event;

    setEditingEvent(dup);
    setIsDialogOpen(true);
    toast.info('Duplicating event - update the date and save');
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await deleteEvent(eventId);
      toast.success('Event deleted');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleToggleFeatured = async (event: Event) => {
    try {
      await updateEvent(event.id, { is_featured: !event.is_featured });
      toast.success(event.is_featured ? 'Removed from featured' : 'Added to featured');
      fetchEvents();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Failed to update event');
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setEditingEvent(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'ongoing': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'past': return 'bg-muted text-muted-foreground border-border';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'founder': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'fellow': return 'bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))] border-[hsl(var(--accent-gold))]/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const filteredEvents = events.filter(event => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return event.status === 'upcoming';
    if (activeTab === 'past') return event.status === 'past';
    if (activeTab === 'featured') return event.is_featured;
    return true;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="font-display text-3xl text-foreground text-center">Events</h1>
          <p className="text-muted-foreground mt-1 text-center">Manage all society events</p>
        </motion.div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={async () => {
              setIsSyncingMeetup(true);
              try {
                const { data, error } = await supabase.functions.invoke('sync-meetup-upcoming-events');
                if (error) throw error;
                if (data?.success) {
                  toast.success(`Synced ${data.data.eventsInserted} new events, updated ${data.data.eventsUpdated}`);
                  fetchEvents();
                } else {
                  throw new Error(data?.error || 'Sync failed');
                }
              } catch (error: any) {
                console.error('Meetup sync error:', error);
                toast.error(error.message || 'Failed to sync from Meetup');
              } finally {
                setIsSyncingMeetup(false);
              }
            }}
            disabled={isSyncingMeetup}
          >
            {isSyncingMeetup ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync from Meetup
          </Button>

          <Button variant="outline" asChild className="rounded-xl">
            <Link to="/admin/event-analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Link>
          </Button>

          <EventFormDialog
            isOpen={isDialogOpen}
            onOpenChange={handleDialogClose}
            editingEvent={editingEvent}
            onSaved={fetchEvents}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="all">All ({events.length})</TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({events.filter(e => e.status === 'upcoming').length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({events.filter(e => e.status === 'past').length})
          </TabsTrigger>
          <TabsTrigger value="featured">
            <Star className="h-3 w-3 mr-1" />
            Featured ({events.filter(e => e.is_featured).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredEvents.length === 0 ? (
        <AnimatedCard>
          <AnimatedCardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No events found</p>
            <p className="text-muted-foreground text-sm">
              {activeTab === 'all' ? 'Create your first event to get started' : `No ${activeTab} events`}
            </p>
          </AnimatedCardContent>
        </AnimatedCard>
      ) : (
        <motion.div
          className="grid gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                variants={itemVariants}
                layout
              >
                <AnimatedCard className="overflow-hidden" hoverScale={1.01} hoverY={-2}>
                  <AnimatedCardContent className="p-0">
                    <div className="flex items-start gap-4 p-6">
                      {/* Event Image */}
                      {event.image_url && (
                        <div className="hidden md:block w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {event.is_featured && (
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          )}
                          <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                          <Badge className={`${getStatusColor(event.status)} border`}>
                            {event.status}
                          </Badge>
                          <Badge className={`${getTierColor(event.tier)} border`}>
                            {event.tier}
                          </Badge>
                          {event.ticket_price && event.ticket_price > 0 && (
                            <Badge variant="outline" className="border-[hsl(var(--accent-gold))]/30 text-primary">
                              {event.currency} {event.ticket_price}
                            </Badge>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                            {event.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(event.date), 'PPP')}</span>
                            {event.time && <span>at {event.time}</span>}
                          </div>
                          {(event.venue_name || event.location) && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{event.venue_name || event.location}</span>
                              {event.city && <span className="text-muted-foreground/60">• {event.city}</span>}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>
                              {event.rsvp_count} RSVPs
                              {event.capacity && ` / ${event.capacity}`}
                            </span>
                          </div>
                        </div>

                        {/* Capacity Progress */}
                        {event.capacity && event.capacity > 0 && (
                          <div className="mt-3">
                            <Progress
                              value={(event.rsvp_count || 0) / event.capacity * 100}
                              className="h-1.5"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {Math.round((event.rsvp_count || 0) / event.capacity * 100)}% capacity filled
                            </p>
                          </div>
                        )}

                        {/* Tags */}
                        {event.tags && event.tags.length > 0 && (
                          <div className="flex gap-1 mt-3 flex-wrap">
                            {event.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setQrDialogEvent(event)}
                          className="text-muted-foreground hover:text-primary"
                          title="Check-in QR"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleFeatured(event)}
                          className="text-muted-foreground hover:text-amber-400"
                        >
                          <Star className={`h-4 w-4 ${event.is_featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDuplicate(event)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* QR Code Dialog */}
      {qrDialogEvent && (
        <EventQRCodeDialog
          open={!!qrDialogEvent}
          onOpenChange={(open) => !open && setQrDialogEvent(null)}
          event={qrDialogEvent}
        />
      )}
    </div>
  );
}
