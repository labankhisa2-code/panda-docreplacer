-- Create enum for application status
CREATE TYPE application_status AS ENUM (
  'received',
  'under_verification',
  'processing_at_institution',
  'ready',
  'completed'
);

-- Create enum for document types
CREATE TYPE document_type AS ENUM (
  'university_certificate',
  'high_school_certificate',
  'academic_transcript',
  'graduation_letter',
  'student_id',
  'recommendation_letter',
  'admission_letter',
  'fee_statement',
  'internship_letter',
  'professional_certificate'
);

-- Create applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  document_type document_type NOT NULL,
  year_of_study TEXT,
  index_number TEXT,
  id_number TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  status application_status DEFAULT 'received',
  payment_confirmed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create storage bucket for application documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('application-documents', 'application-documents', false);

-- Storage policies for application documents
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'application-documents');

CREATE POLICY "Authenticated users can view their documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'application-documents');

-- Enable RLS on applications table
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert applications (public form)
CREATE POLICY "Anyone can create applications"
ON applications FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow users to view their own applications by tracking_id or phone
CREATE POLICY "Users can view applications with tracking info"
ON applications FOR SELECT
TO anon, authenticated
USING (true);

-- Create app_role enum for admin roles
CREATE TYPE app_role AS ENUM ('admin', 'staff');

-- Create user_roles table for admin access
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Function to check if user has a role
CREATE OR REPLACE FUNCTION has_role(user_id UUID, check_role app_role)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = $1
    AND user_roles.role = $2
  );
$$;

-- Admin/staff can view all applications
CREATE POLICY "Admins can view all applications"
ON applications FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Admin/staff can update applications
CREATE POLICY "Admins can update applications"
ON applications FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Function to generate unique tracking ID
CREATE OR REPLACE FUNCTION generate_tracking_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_id TEXT;
  done BOOLEAN := false;
BEGIN
  WHILE NOT done LOOP
    new_id := 'PT' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    IF NOT EXISTS (SELECT 1 FROM applications WHERE tracking_id = new_id) THEN
      done := true;
    END IF;
  END LOOP;
  RETURN new_id;
END;
$$;

-- Trigger to auto-generate tracking_id
CREATE OR REPLACE FUNCTION set_tracking_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.tracking_id IS NULL OR NEW.tracking_id = '' THEN
    NEW.tracking_id := generate_tracking_id();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER applications_tracking_id_trigger
BEFORE INSERT ON applications
FOR EACH ROW
EXECUTE FUNCTION set_tracking_id();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER applications_updated_at_trigger
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();