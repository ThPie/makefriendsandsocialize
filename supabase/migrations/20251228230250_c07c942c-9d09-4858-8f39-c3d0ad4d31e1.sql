-- Add is_read column to notification_queue
ALTER TABLE public.notification_queue 
ADD COLUMN is_read boolean NOT NULL DEFAULT false;

-- Add RLS policy for users to view their own notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notification_queue 
FOR SELECT 
USING (user_id = auth.uid());

-- Add RLS policy for users to update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" 
ON public.notification_queue 
FOR UPDATE 
USING (user_id = auth.uid());

-- Enable realtime for notification_queue
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_queue;