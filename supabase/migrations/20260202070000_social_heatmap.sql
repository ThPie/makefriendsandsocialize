-- Add zone information to event_checkins for the Social Heatmap feature
ALTER TABLE event_checkins ADD COLUMN IF NOT EXISTS zone TEXT;

-- Create an index to speed up heatmap queries
CREATE INDEX IF NOT EXISTS idx_event_checkins_zone ON event_checkins(event_id, zone);
