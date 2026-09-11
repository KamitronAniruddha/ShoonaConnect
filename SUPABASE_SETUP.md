# ShoonaConnect - Supabase Setup & Production Deployment Guide

This guide walks you through setting up the Supabase backend for ShoonaConnect and deploying the application to Netlify.

---

## 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and log in or create a free account.
2. In the dashboard, click **"New project"**.
3. Choose an organization, enter a name (e.g., `shoonaconnect-production`), set a strong database password, and choose the closest cloud region to you and your partner.
4. Click **"Create new project"** and wait ~2 minutes for provisioning.

---

## 2. Obtain Supabase URL & Anon Key
1. In your Supabase Project dashboard, navigate to **Project Settings** (gear icon in the bottom left).
2. Click on **API** in the sidebar.
3. Under **Project URL**, copy the `URL` (e.g., `https://abcdefghijklm.supabase.co`). This is your `VITE_SUPABASE_URL`.
4. Under **Project API keys**, copy the `anon` / `public` key. This is your `VITE_SUPABASE_ANON_KEY`.
   > ⚠️ **CRITICAL SECURITY NOTE:** Never put your `service_role` secret key into client-side code or Netlify public environment variables. Only use the `anon` key.

---

## 3. Run the SQL Migration
1. In the Supabase dashboard, click the **SQL Editor** icon in the left navigation.
2. Click **"New query"**.
3. Open the file `supabase/migrations/001_initial_schema.sql` from this repository.
4. Copy its entire content, paste it into the Supabase SQL Editor, and click **Run** (green button).
5. Ensure the query returns success (`Success. No rows returned`).
   This automatically provisions:
   - All relational tables (`profiles`, `couples`, `messages`, `memories`, `important_dates`, `love_letters`, `shared_notes`, `bucket_list`, `daily_answers`, `moods`, `tictactoe_games`, `chess_games`, etc.)
   - High-performance indexes
   - Row-Level Security (RLS) on all tables
   - User creation triggers
   - Storage buckets (`couple-media`, `avatars`) with access policies
   - Realtime publication subscriptions

---

## 4. Configure Authentication
1. In the Supabase dashboard, go to **Authentication** -> **Providers**.
2. **Email Provider**:
   - Ensure **Email** is enabled.
   - For rapid signup without waiting for email confirmations, you can optionally toggle off **"Confirm email"** in **Authentication -> Providers -> Email** (or keep it on if you prefer email verification).
3. **Google OAuth (Optional)**:
   - In **Authentication** -> **Providers** -> **Google**, toggle it **Enabled**.
   - Create OAuth 2.0 Client Credentials in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
   - Set the Authorized Redirect URI in Google Cloud Console to:
     `https://<YOUR-PROJECT-ID>.supabase.co/auth/v1/callback`
   - Paste the Google Client ID and Google Client Secret into Supabase and save.
   - Notice that Email + Password / One-Tap login is also supported directly out of the box!

---

## 5. Configure Storage Buckets
The SQL migration automatically creates these two buckets:
- `couple-media`: Private bucket for couple photos, voice audio recordings, and shared memories.
- `avatars`: Public read bucket for user profile pictures.

To verify:
1. In the Supabase dashboard, go to **Storage** in the left menu.
2. Confirm `couple-media` and `avatars` exist. If not present, click **"New bucket"**, create `couple-media` (leave Public toggle OFF), and create `avatars` (toggle Public ON).

---

## 6. Configure Realtime
1. In the Supabase dashboard, go to **Database** -> **Replication**.
2. Confirm that the `supabase_realtime` publication includes `messages`, `memories`, `important_dates`, `love_letters`, `tictactoe_games`, `chess_games`, `moods`, etc. (The migration file enables this automatically).

---

## 7. Required Environment Variables
Create a `.env` file in the project root or configure these in your hosting environment:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key...
```

---

## 8. Deploy to Netlify
1. Push your repository to GitHub or GitLab.
2. Log in to [Netlify](https://www.netlify.com).
3. Click **"Add new site"** -> **"Import an existing project"**.
4. Select your repository.
5. Netlify will automatically detect the configuration from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click **"Environment variables"** and add:
   - `VITE_SUPABASE_URL`: Your Supabase URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon public key.
7. Click **"Deploy site"**.

---

## 9. Testing Production
1. **Sign Up / Login**: Open the deployed Netlify URL. Test signing up with email and password or Google OAuth.
2. **Profile & Couple Pairing**: Set your partner display name, create a couple code (e.g. 4 digits or custom code), or enter a partner's code to pair.
3. **Chat & Realtime**: Send a message, test audio voice recording, react with emojis, and verify the realtime update in a second tab.
4. **Memories & Capsules**: Upload a photo memory, test a locked Time Capsule, and test the Romantic Story slideshow.
5. **Love Letters**: Compose a wax-sealed love letter with password or trivia protection.
6. **Milestone Countdowns**: Create an anniversary date, verify the live ticking countdown and gift note storer, and test exporting to Google Calendar or `.ics`.
7. **Multiplayer Games**: Test real-time Tic-Tac-Toe and Chess matches.
