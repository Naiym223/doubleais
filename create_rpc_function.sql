-- Create an RPC function for executing SQL
-- This allows us to run SQL directly from the client with the service role key

-- First, make sure we have permission to create functions
-- This needs to be run in the Supabase SQL Editor

-- Create a function that can execute any SQL (WARNING: This is powerful, only for dev environments)
CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER -- This means it runs with the permissions of the creator (superuser)
AS $$
BEGIN
  EXECUTE sql;
  RETURN 'SQL executed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error executing SQL: ' || SQLERRM;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO anon;
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO authenticated;

-- Create a more specific function for just adding the password column
CREATE OR REPLACE FUNCTION public.add_password_column()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the column already exists
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
    AND column_name = 'password'
  ) THEN
    RETURN 'Password column already exists';
  END IF;

  -- Add the column
  ALTER TABLE public.users ADD COLUMN password TEXT;
  RETURN 'Password column added successfully';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error adding password column: ' || SQLERRM;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.add_password_column() TO service_role;
GRANT EXECUTE ON FUNCTION public.add_password_column() TO anon;
GRANT EXECUTE ON FUNCTION public.add_password_column() TO authenticated;
