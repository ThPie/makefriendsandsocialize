import { useState, useEffect } from 'react';
import { ADMIN_BASE } from '@/lib/route-paths';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { AnimatedCard, AnimatedCardContent } from '@/components/ui/animated-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { LocationCombobox } from '@/components/ui/location-combobox';
import { EventImageUpload } from '@/components/admin/EventImageUpload';
import { EventQRCodeDialog } from '@/components/admin/EventQRCodeDialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { parseLocalDate } from '@/lib/date-utils';
import { 
  Calendar, MapPin, Users, Plus, Edit, Trash2, Loader2, 
  Copy, Star, DollarSign, Clock, Tag, BarChart3, RefreshCw, QrCode, Send, Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PlatformSyncStatus } from '@/components/admin/PlatformSyncStatus';
import { PublishEverywherePanel } from '@/components/admin/PublishEverywherePanel';

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  location: string | null;
  image_url: string | null;
  tier: 'patron' | 'fellow' | 'founder';
  capacity: number | null;
  status: string;
  created_at: string;
  rsvp_count?: number;
  venue_name?: string | null;
  venue_address?: string | null;
  city?: string | null;
  country?: string | null;
  ticket_price?: number | null;
  currency?: string | null;
  registration_deadline?: string | null;
  is_featured?: boolean | null;
  tags?: string[] | null;
}

interface EventForm {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
  tier: 'patron' | 'fellow' | 'founder';
  capacity: string;
  status: string;
  venue_name: string;
  venue_address: string;
  city: string;
  country: string;
  ticket_price: string;
  currency: string;
  registration_deadline: string;
  is_featured: boolean;
  tags: string;
}

const initialForm: EventForm = {
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  image_url: '',
  tier: 'patron',
  capacity: '',
  status: 'upcoming',
  venue_name: '',
  venue_address: '',
  city: '',
  country: '',
  ticket_price: '0',
  currency: 'USD',
  registration_deadline: '',
  is_featured: false,
  tags: '',
};

const popularCities = [
  'New York, USA',
  'Los Angeles, USA',
  'London, UK',
  'Paris, France',
  'Tokyo, Japan',
  'Sydney, Australia',
  'Dubai, UAE',
  'Singapore',
  'Hong Kong',
  'Miami, USA',
  'San Francisco, USA',
  'Chicago, USA',
  'Toronto, Canada',
  'Berlin, Germany',
  'Amsterdam, Netherlands',
];

const popularCountries = [
  'United States',
  'United Kingdom',
  'France',
  'Germany',
  'Japan',
  'Australia',
  'Canada',
  'Singapore',
  'United Arab Emirates',
  'Netherlands',
];

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<EventForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isSyncingMeetup, setIsSyncingMeetup] = useState(false);
  const [qrDialogEvent, setQrDialogEvent] = useState<Event | null>(null);
  const [publishEvent, setPublishEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data: eventsData, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const eventsWithRsvps = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { count } = await supabase
            .from('event_rsvps')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);
          return { ...event, rsvp_count: count || 0 };
        })
      );

      setEvents(eventsWithRsvps);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const eventData = {
        title: form.title,
        description: form.description || null,
        date: form.date,
        time: form.time || null,
        location: form.location || null,
        image_url: form.image_url || null,
        tier: form.tier,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        status: form.status,
        venue_name: form.venue_name || null,
        venue_address: form.venue_address || null,
        city: form.city || null,
        country: form.country || null,
        ticket_price: form.ticket_price ? parseFloat(form.ticket_price) : 0,
        currency: form.currency || 'USD',
        registration_deadline: form.registration_deadline || null,
        is_featured: form.is_featured,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);
        if (error) throw error;
        toast.success('Event updated successfully');
      } else {
        const { error } = await supabase
          .from('events')
          .insert(eventData);
        if (error) throw error;
        toast.success('Event created successfully');
      }

      setIsDialogOpen(false);
      setEditingEvent(null);
      setForm(initialForm);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time || '',
      location: event.location || '',
      image_url: event.image_url || '',
      tier: event.tier,
      capacity: event.capacity?.toString() || '',
      status: event.status,
      venue_name: event.venue_name || '',
      venue_address: event.venue_address || '',
      city: event.city || '',
      country: event.country || '',
      ticket_price: event.ticket_price?.toString() || '0',
      currency: event.currency || 'USD',
      registration_deadline: event.registration_deadline || '',
      is_featured: event.is_featured || false,
      tags: event.tags?.join(', ') || '',
    });
    setIsDialogOpen(true);
  };

  const handleDuplicate = (event: Event) => {
    setEditingEvent(null);
    setForm({
      title: `${event.title} (Copy)`,
      description: event.description || '',
      date: '',
      time: event.time || '',
      location: event.location || '',
      image_url: event.image_url || '',
      tier: event.tier,
      capacity: event.capacity?.toString() || '',
      status: 'upcoming',
      venue_name: event.venue_name || '',
      venue_address: event.venue_address || '',
      city: event.city || '',
      country: event.country || '',
      ticket_price: event.ticket_price?.toString() || '0',
      currency: event.currency || 'USD',
      registration_deadline: '',
      is_featured: false,
      tags: event.tags?.join(', ') || '',
    });
    setIsDialogOpen(true);
    toast.info('Duplicating event - update the date and save');
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      if (error) throw error;
      toast.success('Event deleted');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleToggleFeatured = async (event: Event) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_featured: !event.is_featured })
        .eq('id', event.id);
      if (error) throw error;
      toast.success(event.is_featured ? 'Removed from featured' : 'Added to featured');
      fetchEvents();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Failed to update event');
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingEvent(null);
    setForm(initialForm);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'ongoing': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'past': return 'bg-muted text-muted-foreground border-border';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'draft': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
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
    if (activeTab === 'drafts') return event.status === 'draft';
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
            <Link to={`${ADMIN_BASE}/event-analytics`}>
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Link>
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => open ? setIsDialogOpen(true) : handleDialogClose()}>
            <DialogTrigger asChild>
              <AnimatedButton>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </AnimatedButton>
            </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Wine Tasting Evening"
                    required
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="Describe the event experience..."
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <div className="flex gap-2">
                    <Tag className="h-4 w-4 mt-3 text-muted-foreground" />
                    <Input
                      id="tags"
                      value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      placeholder="dining, wine, networking"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Circle Tags</Label>
                  <p className="text-xs text-muted-foreground">Select circles this event belongs to</p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'the-gentlemen', label: 'The Gentlemen' },
                      { value: 'the-ladies-society', label: 'The Ladies Society' },
                      { value: 'les-amis', label: 'Les Amis' },
                      { value: 'couples-circle', label: "Couple's Circle" },
                      { value: 'active-outdoor', label: 'Active & Outdoor' },
                    ].map((circle) => {
                      const currentTags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
                      const isSelected = currentTags.includes(circle.value);
                      return (
                        <label key={circle.value} className="flex items-center gap-1.5 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              let tags = currentTags.filter(t => t !== circle.value);
                              if (e.target.checked) tags.push(circle.value);
                              setForm({ ...form, tags: tags.join(', ') });
                            }}
                            className="rounded border-border"
                          />
                          {circle.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Image Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Event Image</h3>
                
                <EventImageUpload
                  value={form.image_url}
                  onChange={(url) => setForm({ ...form, image_url: url })}
                  disabled={isSubmitting}
                />
              </div>

              {/* Date & Time Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Date & Time</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration_deadline">Registration Deadline</Label>
                  <div className="flex gap-2">
                    <Clock className="h-4 w-4 mt-3 text-muted-foreground" />
                    <Input
                      id="registration_deadline"
                      type="datetime-local"
                      value={form.registration_deadline}
                      onChange={(e) => setForm({ ...form, registration_deadline: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Location</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="venue_name">Venue Name</Label>
                    <Input
                      id="venue_name"
                      value={form.venue_name}
                      onChange={(e) => setForm({ ...form, venue_name: e.target.value })}
                      placeholder="The Grand Ballroom"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venue_address">Venue Address</Label>
                    <Input
                      id="venue_address"
                      value={form.venue_address}
                      onChange={(e) => setForm({ ...form, venue_address: e.target.value })}
                      placeholder="123 Main Street"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <LocationCombobox
                      value={form.city}
                      onValueChange={(value) => setForm({ ...form, city: value })}
                      options={popularCities}
                      placeholder="Select city..."
                      searchPlaceholder="Search cities..."
                      allowCustom={true}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <LocationCombobox
                      value={form.country}
                      onValueChange={(value) => setForm({ ...form, country: value })}
                      options={popularCountries}
                      placeholder="Select country..."
                      searchPlaceholder="Search countries..."
                      allowCustom={true}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Display Location (shown to users)</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g., The Community House, London"
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Capacity & Pricing Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Capacity & Pricing</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <div className="flex gap-2">
                      <Users className="h-4 w-4 mt-3 text-muted-foreground" />
                      <Input
                        id="capacity"
                        type="number"
                        value={form.capacity}
                        onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                        placeholder="50"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ticket_price">Ticket Price</Label>
                    <div className="flex gap-2">
                      <DollarSign className="h-4 w-4 mt-3 text-muted-foreground" />
                      <Input
                        id="ticket_price"
                        type="number"
                        step="0.01"
                        value={form.ticket_price}
                        onChange={(e) => setForm({ ...form, ticket_price: e.target.value })}
                        placeholder="0.00"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={form.currency} onValueChange={(value) => setForm({ ...form, currency: value })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Settings Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Settings</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tier">Membership Tier *</Label>
                    <Select value={form.tier} onValueChange={(value: 'patron' | 'fellow' | 'founder') => setForm({ ...form, tier: value })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patron">Socialite</SelectItem>
                        <SelectItem value="fellow">Insider</SelectItem>
                        <SelectItem value="founder">Patron</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="past">Past</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Featured</Label>
                    <div className="flex items-center gap-2 h-10">
                      <input
                        type="checkbox"
                        id="is_featured"
                        checked={form.is_featured}
                        onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                        className="h-4 w-4 rounded border-border"
                      />
                      <Label htmlFor="is_featured" className="text-sm font-normal cursor-pointer">
                        Show as featured
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={handleDialogClose} className="rounded-xl">
                  Cancel
                </Button>
                <AnimatedButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingEvent ? 'Update Event' : 'Create Event'
                  )}
                </AnimatedButton>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="all">All ({events.length})</TabsTrigger>
          <TabsTrigger value="drafts">
            Drafts ({events.filter(e => e.status === 'draft').length})
          </TabsTrigger>
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
                            <span>{format(parseLocalDate(event.date), 'PPP')}</span>
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

                        {/* Platform sync status icons */}
                        <div className="mt-3">
                          <PlatformSyncStatus eventId={event.id} />
                        </div>
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
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)}>
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
