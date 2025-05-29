-- Part 1: Users Table and Policies

-- Users Table - Note: The users table may already be created by Supabase Auth
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  verification_token TEXT,
  verification_token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for verification token
CREATE OR REPLACE FUNCTION generate_verification_token()
RETURNS TRIGGER AS $$
DECLARE
  verification_code TEXT;
  expiry TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate a 6-digit code
  verification_code := floor(random() * 900000 + 100000)::TEXT;

  -- Set expiry to 24 hours from now
  expiry := NOW() + INTERVAL '24 hours';

  -- Set the values on the NEW record
  NEW.verification_token := verification_code;
  NEW.verification_token_expires_at := expiry;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for verification token
CREATE TRIGGER add_verification_token
BEFORE INSERT ON public.users
FOR EACH ROW
WHEN (NEW.email_verified = false)
EXECUTE FUNCTION generate_verification_token();
