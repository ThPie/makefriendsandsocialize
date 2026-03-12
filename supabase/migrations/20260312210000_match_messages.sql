-- Create match_messages table for real-time chat between mutual matches
CREATE TABLE public.match_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id uuid REFERENCES public.dating_matches(id) ON DELETE CASCADE NOT NULL,
    sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL CHECK (
        char_length(content) > 0
        AND char_length(content) <= 2000
    ),
    created_at timestamptz DEFAULT now()
);
-- Enable RLS
ALTER TABLE public.match_messages ENABLE ROW LEVEL SECURITY;
-- Users can only read messages for matches they're part of
CREATE POLICY "Users can read their match messages" ON public.match_messages FOR
SELECT USING (
        match_id IN (
            SELECT dm.id
            FROM public.dating_matches dm
            WHERE dm.status = 'mutual_yes'
                AND (
                    dm.user_a_id IN (
                        SELECT dp.id
                        FROM public.dating_profiles dp
                        WHERE dp.user_id = auth.uid()
                    )
                    OR dm.user_b_id IN (
                        SELECT dp.id
                        FROM public.dating_profiles dp
                        WHERE dp.user_id = auth.uid()
                    )
                )
        )
    );
-- Users can only insert messages for mutual_yes matches they're part of
CREATE POLICY "Users can send messages to mutual matches" ON public.match_messages FOR
INSERT WITH CHECK (
        sender_id = auth.uid()
        AND match_id IN (
            SELECT dm.id
            FROM public.dating_matches dm
            WHERE dm.status = 'mutual_yes'
                AND (
                    dm.user_a_id IN (
                        SELECT dp.id
                        FROM public.dating_profiles dp
                        WHERE dp.user_id = auth.uid()
                    )
                    OR dm.user_b_id IN (
                        SELECT dp.id
                        FROM public.dating_profiles dp
                        WHERE dp.user_id = auth.uid()
                    )
                )
        )
    );
-- No updates or deletes — messages are permanent
-- (no UPDATE or DELETE policies created)
-- Admins can manage all messages
CREATE POLICY "Admins can manage all match messages" ON public.match_messages FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
-- Indexes for performance
CREATE INDEX idx_match_messages_match_id ON public.match_messages(match_id);
CREATE INDEX idx_match_messages_created_at ON public.match_messages(match_id, created_at);
CREATE INDEX idx_match_messages_sender ON public.match_messages(sender_id);
-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime
ADD TABLE public.match_messages;