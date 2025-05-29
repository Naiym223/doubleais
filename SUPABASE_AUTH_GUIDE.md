# Double AI Chat - Supabase Authentication Guide

This guide explains how the authentication system works in this application, now that we've fixed the database issues.

## Overview

The app now has:

1. **Database Integration** - Using Supabase with service role key for full access
2. **Authentication System** - With login, registration, and JWT-based sessions
3. **Persistent Chat History** - Chats are saved to the database and persist across sessions

## How to Use the Application

### Login Options

1. **Demo Users**:
   - **Admin**: admin@example.com / admin
   - **Regular User**: user@example.com / user

2. **Create a New Account**:
   - Click "Sign up" and register with your email and password
   - Your account will be created in the Supabase database

### Database Configuration

The application now uses the service role key for Supabase which:
- Bypasses Row Level Security (RLS) policies
- Allows full access to all tables regardless of authentication
- This works for development but would need to be adjusted for production

### Chat Persistence

With the database fixes, your chats should now be properly saved:
1. Login with your account
2. Create new chat sessions and send messages
3. Refresh the page - your chats should remain

## Troubleshooting

If you encounter issues:

1. **Database Errors**: Run the `fix-constraints.sql` file in the Supabase SQL Editor
2. **Authentication Errors**: Check the browser console for detailed error messages
3. **Development Server**: Restart with `bun run dev` if you see any strange behavior

## Technical Details

### Files Added/Modified

1. **Authentication Utilities**:
   - `src/lib/auth/auth-utils.ts` - JWT token generation and cookie management

2. **Database Repository**:
   - `src/lib/db/repository.ts` - User data access and management

3. **API Routes**:
   - `src/app/api/auth/login/route.ts` - User login endpoint
   - `src/app/api/auth/register/route.ts` - User registration endpoint

4. **Supabase Config**:
   - Updated `src/lib/supabase.ts` to use the service role key

## Security Note

The current setup uses the service role key which has full admin access to your database. For a production environment, you would want to implement:

1. Proper Row Level Security (RLS) policies
2. Use the anon key for client-side operations
3. Have server-side API routes handle admin operations with the service role key

## Next Steps

Now that the database and authentication are working, you can:

1. Test the chat functionality thoroughly
2. Create new users through the registration form
3. Build additional features like chat sharing and exports
4. Implement proper user account management
