# Fixing the Password Column Issue

This guide provides step-by-step instructions to fix the "Could not find the 'password' column" error in Supabase.

## The Problem

The error occurs because:

1. The `users` table in your Supabase database doesn't have a `password` column
2. The authentication code is trying to store passwords in this column
3. When Supabase Auth creates users, it doesn't automatically create a password column in our custom users table

## Solution 1: Run the SQL Script

The easiest way to fix this is by running the SQL script in your Supabase SQL Editor:

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to the SQL Editor (left sidebar)
4. Create a new query
5. Copy and paste the contents of the `fix_users_table.sql` file
6. Run the SQL

This will:
- Add the password column if it doesn't exist
- Create a test user with known credentials
- Fix any existing users by giving them a default password

## Solution 2: Create the RPC Function

If you prefer a more permanent solution that allows your app to fix the issue when it occurs:

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to the SQL Editor
4. Create a new query
5. Copy and paste the contents of the `create_rpc_function.sql` file
6. Run the SQL

This creates two functions:
- `add_password_column()` - A safe function that just adds the password column
- `execute_sql(sql)` - A more powerful function for any SQL (use with caution)

## Testing the Fix

After applying either solution:

1. Try registering a new user through the app
2. Try logging in with the test user created by the script:
   - Email: testuser@example.com
   - Password: password123
3. Or use the demo credentials:
   - Admin: admin@example.com / admin
   - User: user@example.com / user

## Debugging Tips

If you're still having issues:

1. Check Console Logs: Look for detailed error messages in your browser's console
2. Test API Directly: Use tools like Postman to test the API endpoints:
   - POST /api/auth/register
   - POST /api/auth/login
3. Verify Table Structure: Run this SQL to check the users table structure:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'users';
   ```
4. Disable RLS Temporarily: You can temporarily disable RLS for testing:
   ```sql
   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
   ```
   (Remember to enable it back for production)

## Long-term Solution

For a production application, consider:

1. Using Supabase Auth's built-in features for user management
2. Or creating a more robust user authentication system
3. Implementing proper password hashing using bcrypt or Argon2

Remember that storing passwords directly in your database (even hashed) requires careful security considerations. The current solution using SHA-256 is adequate for development but should be enhanced for production.
