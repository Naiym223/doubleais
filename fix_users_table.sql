-- Fix for the users table structure
-- Run this in your Supabase SQL Editor

-- Check the structure of users table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users';

-- Add password column if it doesn't exist
DO $$
BEGIN
    BEGIN
        ALTER TABLE public.users ADD COLUMN password TEXT;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'password column already exists in users table.';
    END;
END $$;

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'password';

-- If you already have users without passwords, you can set a default hash:
-- (Optional step - you can skip this if your users don't exist yet)
UPDATE public.users
SET password = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' -- This is 'password123' hashed with SHA-256
WHERE password IS NULL;

-- Get a count of users with and without passwords
SELECT
    COUNT(*) as total_users,
    SUM(CASE WHEN password IS NULL THEN 1 ELSE 0 END) as users_without_password,
    SUM(CASE WHEN password IS NOT NULL THEN 1 ELSE 0 END) as users_with_password
FROM public.users;

-- For testing authentication: Create a test user with known credentials
INSERT INTO public.users (id, email, name, role, is_active, is_banned, email_verified, password)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'testuser@example.com', 'Test User', 'USER', true, false, true, '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92')
ON CONFLICT (email) DO UPDATE
SET password = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';

-- This will create a user with:
-- Email: testuser@example.com
-- Password: password123
