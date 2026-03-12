/**
 * Events service — centralized Supabase queries for events.
 * Replaces direct `.from('events')` calls scattered across 12+ files.
 */
import { supabase } from '@/integrations/supabase/client';
import type { Event, EventRSVP } from '@/types/events';

// ── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetch upcoming events, optionally filtered by tier.
 */
export async function getUpcomingEvents(options?: {
    tier?: string;
    limit?: number;
    featured?: boolean;
}) {
    let query = supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .order('date', { ascending: true });

    if (options?.tier) {
        query = query.eq('tier', options.tier);
    }
    if (options?.featured) {
        query = query.eq('is_featured', true);
    }
    if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Event[];
}

/**
 * Get a single event by ID.
 */
export async function getEventById(eventId: string) {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

    if (error) throw error;
    return data as Event;
}

/**
 * Get RSVP count for an event.
 */
export async function getEventRsvpCount(eventId: string): Promise<number> {
    const { count, error } = await supabase
        .from('event_rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

    if (error) throw error;
    return count ?? 0;
}

/**
 * Check if a user has RSVPd to an event.
 */
export async function getUserRsvp(eventId: string, userId: string) {
    const { data, error } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

    if (error) throw error;
    return data as EventRSVP | null;
}

/**
 * RSVP to an event.
 */
export async function rsvpToEvent(eventId: string, userId: string) {
    const { data, error } = await supabase
        .from('event_rsvps')
        .insert({ event_id: eventId, user_id: userId, status: 'confirmed' })
        .select()
        .single();

    if (error) throw error;
    return data as EventRSVP;
}

/**
 * Cancel an RSVP.
 */
export async function cancelRsvp(eventId: string, userId: string) {
    const { error } = await supabase
        .from('event_rsvps')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

    if (error) throw error;
}

// ── Admin Queries ────────────────────────────────────────────────────────────

/**
 * Fetch all events for admin view (with RSVP counts).
 */
export async function getAdminEvents(limit = 200) {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false })
        .limit(limit);

    if (error) throw error;

    // Fetch RSVP counts in parallel
    const eventsWithRsvps = await Promise.all(
        (data ?? []).map(async (event) => ({
            ...event,
            rsvp_count: await getEventRsvpCount(event.id),
        })),
    );

    return eventsWithRsvps as Event[];
}

/**
 * Create a new event.
 */
export async function createEvent(eventData: Omit<Event, 'id' | 'created_at' | 'rsvp_count'>) {
    const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();

    if (error) throw error;
    return data as Event;
}

/**
 * Update an existing event.
 */
export async function updateEvent(eventId: string, updates: Partial<Omit<Event, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

    if (error) throw error;
    return data as Event;
}

/**
 * Delete an event.
 */
export async function deleteEvent(eventId: string) {
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

    if (error) throw error;
}
