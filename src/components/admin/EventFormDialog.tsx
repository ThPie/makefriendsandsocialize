/**
 * EventFormDialog — extracted from AdminEvents.tsx
 * Self-contained event creation/editing dialog with all form fields.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedButton } from '@/components/ui/animated-button';
import { LocationCombobox } from '@/components/ui/location-combobox';
import { EventImageUpload } from '@/components/admin/EventImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Users, DollarSign, Clock, Tag, Loader2 } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

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
    'New York, USA', 'Los Angeles, USA', 'London, UK', 'Paris, France',
    'Tokyo, Japan', 'Sydney, Australia', 'Dubai, UAE', 'Singapore',
    'Hong Kong', 'Miami, USA', 'San Francisco, USA', 'Chicago, USA',
    'Toronto, Canada', 'Berlin, Germany', 'Amsterdam, Netherlands',
];

const popularCountries = [
    'United States', 'United Kingdom', 'France', 'Germany', 'Japan',
    'Australia', 'Canada', 'Singapore', 'United Arab Emirates', 'Netherlands',
];

// ── Props ────────────────────────────────────────────────────────────────────

interface EventFormDialogProps {
    editingEvent: Event | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSaved: () => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export function EventFormDialog({
    editingEvent,
    isOpen,
    onOpenChange,
    onSaved,
}: EventFormDialogProps) {
    const [form, setForm] = useState<EventForm>(
        editingEvent ? eventToForm(editingEvent) : initialForm,
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when editingEvent changes
    const resetForm = () => {
        setForm(editingEvent ? eventToForm(editingEvent) : initialForm);
    };

    const handleClose = () => {
        onOpenChange(false);
        resetForm();
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

            handleClose();
            onSaved();
        } catch (error) {
            console.error('Error saving event:', error);
            toast.error('Failed to save event');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => open ? onOpenChange(true) : handleClose()}>
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
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</h3>
                        <div className="space-y-2">
                            <Label htmlFor="title">Event Title *</Label>
                            <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Wine Tasting Evening" required className="rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe the event experience..." className="rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (comma separated)</Label>
                            <div className="flex gap-2">
                                <Tag className="h-4 w-4 mt-3 text-muted-foreground" />
                                <Input id="tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="dining, wine, networking" className="rounded-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Event Image</h3>
                        <EventImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} disabled={isSubmitting} />
                    </div>

                    {/* Date & Time */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Date & Time</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date *</Label>
                                <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time">Time</Label>
                                <Input id="time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="rounded-xl" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="registration_deadline">Registration Deadline</Label>
                            <div className="flex gap-2">
                                <Clock className="h-4 w-4 mt-3 text-muted-foreground" />
                                <Input id="registration_deadline" type="datetime-local" value={form.registration_deadline} onChange={(e) => setForm({ ...form, registration_deadline: e.target.value })} className="rounded-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Location</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="venue_name">Venue Name</Label>
                                <Input id="venue_name" value={form.venue_name} onChange={(e) => setForm({ ...form, venue_name: e.target.value })} placeholder="The Grand Ballroom" className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="venue_address">Venue Address</Label>
                                <Input id="venue_address" value={form.venue_address} onChange={(e) => setForm({ ...form, venue_address: e.target.value })} placeholder="123 Main Street" className="rounded-xl" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>City</Label>
                                <LocationCombobox value={form.city} onValueChange={(value) => setForm({ ...form, city: value })} options={popularCities} placeholder="Select city..." searchPlaceholder="Search cities..." allowCustom={true} />
                            </div>
                            <div className="space-y-2">
                                <Label>Country</Label>
                                <LocationCombobox value={form.country} onValueChange={(value) => setForm({ ...form, country: value })} options={popularCountries} placeholder="Select country..." searchPlaceholder="Search countries..." allowCustom={true} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Display Location (shown to users)</Label>
                            <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g., The Community House, London" className="rounded-xl" />
                        </div>
                    </div>

                    {/* Capacity & Pricing */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Capacity & Pricing</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="capacity">Capacity</Label>
                                <div className="flex gap-2">
                                    <Users className="h-4 w-4 mt-3 text-muted-foreground" />
                                    <Input id="capacity" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="50" className="rounded-xl" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ticket_price">Ticket Price</Label>
                                <div className="flex gap-2">
                                    <DollarSign className="h-4 w-4 mt-3 text-muted-foreground" />
                                    <Input id="ticket_price" type="number" step="0.01" value={form.ticket_price} onChange={(e) => setForm({ ...form, ticket_price: e.target.value })} placeholder="0.00" className="rounded-xl" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Select value={form.currency} onValueChange={(value) => setForm({ ...form, currency: value })}>
                                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
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

                    {/* Settings */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Settings</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tier">Membership Tier *</Label>
                                <Select value={form.tier} onValueChange={(value: 'patron' | 'fellow' | 'founder') => setForm({ ...form, tier: value })}>
                                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="patron">Patron</SelectItem>
                                        <SelectItem value="fellow">Fellow</SelectItem>
                                        <SelectItem value="founder">Founder</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                    <SelectContent>
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
                                        aria-label="Show as featured"
                                    />
                                    <Label htmlFor="is_featured" className="text-sm font-normal cursor-pointer">
                                        Show as featured
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button type="button" variant="outline" onClick={handleClose} className="rounded-xl">Cancel</Button>
                        <AnimatedButton type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                            ) : (
                                editingEvent ? 'Update Event' : 'Create Event'
                            )}
                        </AnimatedButton>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function eventToForm(event: Event): EventForm {
    return {
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
    };
}

/**
 * Creates a duplicate form from an existing event (with cleared date/deadline).
 */
export function duplicateEventToForm(event: Event): EventForm {
    return {
        ...eventToForm(event),
        title: `${event.title} (Copy)`,
        date: '',
        status: 'upcoming',
        registration_deadline: '',
        is_featured: false,
    };
}
