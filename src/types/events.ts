/**
 * Shared event type definitions.
 * Used by EventsPage, AdminEvents, PortalEvents, etc.
 */

export interface Event {
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

export interface EventRSVP {
    id: string;
    event_id: string;
    user_id: string;
    status: 'confirmed' | 'cancelled' | 'waitlisted';
    created_at: string;
}

export type EventStatus = 'upcoming' | 'ongoing' | 'past' | 'cancelled';
export type MembershipTier = 'patron' | 'fellow' | 'founder';
