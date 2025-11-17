-- Fix recursive policy and add public admin role visibility
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Recreate admin read policy using has_role to avoid recursion
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Ensure users can view their own roles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Users can view their own roles'
  ) THEN
    CREATE POLICY "Users can view their own roles"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Allow anyone to see which users are admins (for support chat), without exposing non-admin roles
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Anyone can view admin roles'
  ) THEN
    DROP POLICY "Anyone can view admin roles" ON public.user_roles;
  END IF;
END $$;

CREATE POLICY "Anyone can view admin roles"
ON public.user_roles
FOR SELECT
TO public
USING (role = 'admin');

-- Create site_settings table for editable footer/contact info
CREATE TABLE IF NOT EXISTS public.site_settings (
  id text PRIMARY KEY DEFAULT 'default',
  contact_email text,
  website_url text,
  location text,
  footer_text text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_settings' AND policyname = 'Public can read site settings'
  ) THEN
    DROP POLICY "Public can read site settings" ON public.site_settings;
  END IF;
END $$;

CREATE POLICY "Public can read site settings"
ON public.site_settings
FOR SELECT
TO public
USING (true);

-- Only admins can insert/update
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_settings' AND policyname = 'Admins can insert site settings'
  ) THEN
    DROP POLICY "Admins can insert site settings" ON public.site_settings;
  END IF;
END $$;

CREATE POLICY "Admins can insert site settings"
ON public.site_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_settings' AND policyname = 'Admins can update site settings'
  ) THEN
    DROP POLICY "Admins can update site settings" ON public.site_settings;
  END IF;
END $$;

CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_site_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

-- Seed default settings row if empty
INSERT INTO public.site_settings (id, contact_email, website_url, location, footer_text)
SELECT 'default', 'info@labankhisa.co.ke', 'https://5str-docs.its-mycardio.co.ke', 'Nairobi, Kenya', 'Fast & Secure Academic Certificate & Document Replacement Services'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings WHERE id = 'default');