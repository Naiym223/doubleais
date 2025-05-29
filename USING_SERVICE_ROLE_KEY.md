# Using Service Role Key with Supabase

If you're experiencing permission issues with your Supabase database, you might need to use the Service Role key instead of the Anon key for certain operations, especially for admin functionalities.

## What's the difference?

- **Anon Key**: Has limited permissions based on Row Level Security (RLS) policies. This is the key that should be used for client-side code accessible to users.
- **Service Role Key**: Has admin privileges and can bypass RLS policies. This should be used carefully and typically only in server-side contexts.

## When to use Service Role Key

You might need to use the Service Role key if:

1. You're getting permission errors even after setting up proper RLS policies
2. You need to perform admin operations that require bypassing RLS
3. You see messages like "Permission denied" in your error logs

## How to update your code to use Service Role Key

1. Go to your Supabase project settings to find your Service Role key
2. Open `src/lib/supabase.ts` in your project
3. Replace the `supabaseAnonKey` with your Service Role key:

```typescript
// WARNING: Only use service role key in secure server environments,
// NEVER expose this key in client-side code
const supabaseServiceRoleKey = 'your-service-role-key';

// Create the Supabase client with service role key
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  // other options...
});
```

## Security Warning ⚠️

**IMPORTANT**: The Service Role key has admin privileges and can bypass RLS policies. This means it can:

- Read/write any data in your database
- Ignore all access control restrictions
- Access sensitive user information

Because of this, you should:

1. NEVER include the Service Role key in client-side code
2. Only use Service Role key in secure server environments
3. Consider implementing a serverless function or API endpoint that uses the Service Role key, instead of including it directly in your frontend code

## Better Architecture (Recommended)

Instead of exposing the Service Role key in your frontend, a better approach is:

1. Create API routes/serverless functions that run with Service Role key
2. Keep the Service Role key in environment variables on your server
3. Call these API routes from your frontend when you need admin operations

## Temporary Testing Solution

For temporary testing, you can use the Service Role key locally, but remember to:

1. Never commit the key to source control
2. Never deploy the code with the Service Role key to production
3. Replace it with the Anon key before sharing your code or deploying

When you're ready for production, implement a proper server-side solution for admin operations.
