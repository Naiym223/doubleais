# Double AI - Advanced Chat Application

A modern, feature-rich AI chat application that leverages OpenAI's GPT models with Supabase for database storage.

## Features

- 🧠 Advanced AI conversations using OpenAI's models
- 💾 Persistent chat history with Supabase database
- 👤 User authentication and account management
- 🔒 Email verification system
- 🛡️ Admin dashboard for user management
- 🎨 Modern, responsive UI with dark mode
- ⚙️ Customizable AI settings (temperature, system prompt)
- 📱 Mobile-friendly design

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Bun](https://bun.sh/) (recommended) or npm
- [Supabase Account](https://supabase.com/)
- [OpenAI API Key](https://platform.openai.com/)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd futuristic-ai-chat
   bun install
   ```

### Supabase Setup (Critical)

The application requires a properly configured Supabase database to work correctly. If you see database validation errors when running the app, follow these steps:

1. **Create a Supabase Project**:
   - Go to [Supabase Dashboard](https://app.supabase.com/)
   - Create a new project
   - Note down your project URL and anon key

2. **Update Environment Variables**:
   - Create a `.env.local` file in the project root
   - Add the following variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     OPENAI_API_KEY=your_openai_api_key
     ```

3. **Run the Database Schema Setup**:
   - Navigate to your Supabase project's SQL Editor
   - Create a new query
   - Copy the contents of the `schema.sql` file in this project
   - Execute the SQL query to create all required tables and policies

4. **Enable Email Authentication**:
   - In your Supabase dashboard, go to Authentication > Providers
   - Enable Email provider
   - Configure email templates if needed

### Running the Application

Development mode:
```bash
bun run dev
```

Build for production:
```bash
bun run build
bun run start
```

## Database Schema

The application uses the following tables in Supabase:

- **users**: User accounts and profile information
- **chat_sessions**: Individual chat conversations
- **messages**: All messages within chat sessions
- **user_settings**: User-specific settings
- **global_settings**: Application-wide settings

See the `schema.sql` file for the complete database schema details.

## Demo Users

The application includes demo users for testing:

- **Admin User**:
  - Email: admin@example.com
  - Password: admin

- **Regular User**:
  - Email: user@example.com
  - Password: user

## Troubleshooting

### Database Connection Issues

If you see errors like "Error adding message: {}" or empty error objects, it typically means:

1. The database tables have not been created
2. Row Level Security (RLS) policies are preventing access
3. The Supabase connection credentials are incorrect

**Solution**: Follow the Supabase Setup instructions above and ensure you've run the `schema.sql` file in your Supabase SQL Editor.

### Authentication Problems

If users cannot log in or register:

1. Check that the Supabase Email provider is enabled
2. Verify the users table exists and has the correct structure

## License

MIT
