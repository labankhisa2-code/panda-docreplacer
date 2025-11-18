-- Create page_views table for real-time analytics
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on page_views
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert page views
CREATE POLICY "Anyone can insert page views"
ON public.page_views
FOR INSERT
TO public
WITH CHECK (true);

-- Admins can view all page views
CREATE POLICY "Admins can view all page views"
ON public.page_views
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add document_url column to applications table
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS document_url TEXT;

-- Create unread_messages view for notifications
CREATE OR REPLACE VIEW public.unread_messages_count AS
SELECT 
  receiver_id,
  COUNT(*) as unread_count
FROM public.messages
WHERE is_read = false
GROUP BY receiver_id;