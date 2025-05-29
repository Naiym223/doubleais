# Fixing Missing Tables in Supabase

These instructions will help you fix the database error you're seeing about missing tables.

## Error Details

The error indicates that the following tables are missing in your Supabase database:
- `user_settings`
- `global_settings`

## Quick Fix Instructions

### Option 1: Fix Only Missing Tables (Recommended)

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to the SQL Editor (left sidebar)
4. Create a new query
5. Copy and paste the content from `fix_missing_tables.sql` in this project
6. Run the SQL query
7. Refresh your application

This simple SQL script will create just the missing tables with the necessary policies.

### Option 2: Complete Database Setup

If you want to set up the entire database schema from scratch (useful if you're starting a new project), follow these steps:

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to the SQL Editor (left sidebar)
4. Create a new query
5. Run the SQL scripts in this order:
   - Run `schema_part1_users.sql` first
   - Run `schema_part2_chat_sessions.sql` next
   - Run `schema_part3_messages.sql` next
   - Run `schema_part4_settings.sql` last

## Troubleshooting

### Error: "permission denied to set parameter"

If you encounter this error when running the full schema.sql file:
```
ERROR: 42501: permission denied to set parameter "app.jwt_secret"
```

This happens because the `ALTER DATABASE` command requires elevated privileges that aren't available in the standard Supabase SQL Editor. Use the split SQL files provided instead.

### Error: "relation already exists"

If you see errors about relations already existing, that means you're trying to create tables that already exist. This is not a problem - the `IF NOT EXISTS` clause prevents the script from failing.

## After Running the SQL

After successfully running the SQL script(s):

1. Refresh your application
2. The error banner should disappear
3. You should now be able to save messages to the database

If you still encounter issues, check the browser console for more detailed error messages.
