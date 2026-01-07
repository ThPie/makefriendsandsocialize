-- Add rsvp_count column to track attendees synced from Meetup
ALTER TABLE events ADD COLUMN IF NOT EXISTS rsvp_count integer DEFAULT 0;
COMMENT ON COLUMN events.rsvp_count IS 'Number of RSVPs/attendees synced from Meetup';