-- Add source column to track where events came from
ALTER TABLE events ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';

-- Update existing events to have 'manual' source
UPDATE events SET source = 'manual' WHERE source IS NULL;