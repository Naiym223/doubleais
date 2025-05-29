# Testing Authentication and Database Functionality

This guide provides step-by-step instructions for testing the authentication system and database functionality.

## 1. Database Connection Test

First, let's check if your database is properly configured:

1. Open a browser and go to: http://localhost:3000/api/test

   This will return a JSON response showing whether your database connection is working and if the required tables exist. You should see a response like:

   ```json
   {
     "status": "success",
     "message": "Database connection test successful",
     "tables": {
       "chat_sessions": {
         "exists": true,
         "count": 0,
         "error": null
       },
       "users": {
         "exists": true,
         "count": 0,
         "error": null
       },
       "messages": {
         "exists": true,
         "count": 0,
         "error": null
       }
     }
   }
   ```

   If any tables are missing or there are errors, you'll need to run the SQL scripts in the Supabase SQL Editor first.

## 2. Testing Authentication

### A. Login with Demo Users

1. Open your application: http://localhost:3000
2. Click "Sign In" if you're not already on the login page
3. Use one of the demo credentials:
   - Admin: admin@example.com / admin
   - User: user@example.com / user

You should be successfully logged in and redirected to the chat interface.

### B. Register a New User

1. Open your application: http://localhost:3000
2. Click "Sign Up" or "Register"
3. Enter a valid email and password
4. Click "Register" or "Sign Up"

You should be successfully registered and either logged in automatically or redirected to the login page.

### C. Test API Routes Directly

You can also test the API routes directly using tools like cURL, Postman, or browser DevTools:

**Registration:**
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}
```

**Login:**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Logout:**
```
POST http://localhost:3000/api/auth/logout
```

## 3. Testing Chat Functionality

After logging in:

1. Create a new chat session by clicking the "+" button or "New Chat"
2. Type a message and send it
3. You should receive a response from the AI
4. Refresh the page - your chat history should persist
5. Log out and log back in - your chats should still be there

## Troubleshooting

### Database Issues

If you see errors related to missing tables:

1. Go to your Supabase dashboard: https://app.supabase.com/
2. Open your project
3. Go to the SQL Editor
4. Run the `fix-constraints.sql` script from this project

### Authentication Issues

If registration fails:

1. Check the browser console for error messages
2. Make sure your database tables are created correctly
3. Try using the demo users (admin@example.com/admin) to verify login works

### Chat Persistence Issues

If chats aren't persisting:

1. Make sure you've applied the database fixes
2. Try using the demo users first to ensure authentication is working
3. Check the browser console for any error messages during send/receive
