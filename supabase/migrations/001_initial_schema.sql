-- =======================================================================
-- ShoonaConnect - Supabase Initial Database Schema & RLS Policies
-- Migration: 001_initial_schema.sql
-- =======================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked directly to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username VARCHAR(50) UNIQUE,
  display_name TEXT NOT NULL DEFAULT 'Soulmate',
  nickname TEXT DEFAULT '',
  gender TEXT,
  gender_custom TEXT,
  pet_name_for_partner TEXT,
  pet_name_for_self TEXT,
  occupation TEXT,
  occupation_type TEXT DEFAULT 'profession',
  photo_url TEXT,
  couple_id UUID,
  pair_code TEXT,
  bio TEXT,
  status TEXT,
  love_language TEXT,
  birthday TEXT,
  pronouns TEXT,
  city TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  is_online BOOLEAN DEFAULT false,
  last_dissolution_notice JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. COUPLES TABLE
CREATE TABLE IF NOT EXISTS public.couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pair_code VARCHAR(16) UNIQUE NOT NULL,
  user_ids UUID[] NOT NULL DEFAULT '{}',
  user_names JSONB DEFAULT '{}'::jsonb,
  user_photos JSONB DEFAULT '{}'::jsonb,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'dissolved')),
  pending_join_request JSONB,
  anniversary_date TEXT,
  anniversary_time TEXT,
  dating_start_date TEXT,
  dating_start_time TEXT,
  birthdays JSONB DEFAULT '{}'::jsonb,
  partner1_birthday TEXT,
  partner2_birthday TEXT,
  couple_name TEXT,
  relationship_status TEXT DEFAULT 'dating',
  relationship_story TEXT,
  favorite_song TEXT,
  theme TEXT DEFAULT 'rose',
  wallpaper TEXT,
  pin_lock TEXT,
  custom_symbol_p1 TEXT DEFAULT '❤️',
  custom_symbol_p2 TEXT DEFAULT '💖',
  dissolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  dissolved_by_name TEXT,
  dissolution_reason TEXT,
  dissolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Foreign key for profile couple_id
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS fk_profiles_couple,
  ADD CONSTRAINT fk_profiles_couple FOREIGN KEY (couple_id) REFERENCES public.couples(id) ON DELETE SET NULL;

-- 3. HELPER FUNCTION: Check if user belongs to couple
CREATE OR REPLACE FUNCTION public.is_couple_member(check_couple_id UUID, check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT CASE
    WHEN check_couple_id IS NULL THEN TRUE
    WHEN check_user_id IS NULL THEN TRUE
    ELSE EXISTS (
      SELECT 1 FROM public.couples
      WHERE id = check_couple_id
        AND (
          check_user_id = ANY(user_ids)
          OR creator_id = check_user_id
          OR partner_id = check_user_id
          OR pending_join_request->>'requesterId' = check_user_id::text
        )
    ) OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = check_user_id AND couple_id = check_couple_id
    )
  END;
$$;

-- 4. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_photo TEXT,
  text TEXT DEFAULT '',
  type TEXT DEFAULT 'text',
  media_url TEXT,
  media_type TEXT,
  file_details JSONB,
  audio_details JSONB,
  reply_to JSONB,
  reactions JSONB DEFAULT '{}'::jsonb,
  is_edited BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  read_by TEXT[] DEFAULT '{}',
  love_note JSONB,
  date_invite JSONB,
  game_challenge JSONB,
  poll JSONB,
  question_data JSONB,
  countdown JSONB,
  shared_list JSONB,
  shared_note JSONB,
  location JSONB,
  reminder JSONB,
  scheduled_for TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_couple_created ON public.messages(couple_id, created_at DESC);

-- 5. MEMORIES TABLE
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  date TEXT NOT NULL,
  location TEXT DEFAULT '',
  media_urls TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  mood TEXT DEFAULT 'blessed',
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  capsule_unlock_date TEXT,
  is_capsule BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_memories_couple_date ON public.memories(couple_id, date DESC);

-- 6. IMPORTANT DATES TABLE
CREATE TABLE IF NOT EXISTS public.important_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'anniversary',
  is_recurring BOOLEAN DEFAULT true,
  reminder_days INT DEFAULT 0,
  icon TEXT DEFAULT 'Heart',
  gift_ideas TEXT DEFAULT '',
  celebration_notes TEXT DEFAULT '',
  photos TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_important_dates_couple ON public.important_dates(couple_id, date ASC);

-- 7. LOVE LETTERS TABLE
CREATE TABLE IF NOT EXISTS public.love_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  theme TEXT DEFAULT 'parchment',
  font_style TEXT DEFAULT 'font-romantic',
  open_at TEXT,
  wax_seal TEXT DEFAULT 'heart',
  sound_effect TEXT DEFAULT 'chime',
  protection_type TEXT DEFAULT 'none',
  secret_password TEXT,
  secret_question TEXT,
  secret_answer TEXT,
  is_draft BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_love_letters_couple ON public.love_letters(couple_id, created_at DESC);

-- 8. SHARED NOTES TABLE
CREATE TABLE IF NOT EXISTS public.shared_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  items JSONB DEFAULT '[]'::jsonb,
  category TEXT DEFAULT 'general',
  color TEXT DEFAULT 'rose',
  is_pinned BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by_name TEXT,
  updated_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  updated_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shared_notes_couple ON public.shared_notes(couple_id, updated_at DESC);

-- 9. BUCKET LIST TABLE
CREATE TABLE IF NOT EXISTS public.bucket_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'travel',
  target_date TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TEXT,
  completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  photo_url TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bucket_list_couple ON public.bucket_list(couple_id, created_at DESC);

-- 10. DAILY ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.daily_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  category TEXT,
  custom_author_id TEXT,
  custom_author_name TEXT,
  changed_by TEXT,
  changed_at TIMESTAMPTZ,
  is_starred BOOLEAN DEFAULT false,
  answers JSONB DEFAULT '{}'::jsonb,
  is_revealed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (couple_id, date)
);
CREATE INDEX IF NOT EXISTS idx_daily_answers_couple_date ON public.daily_answers(couple_id, date);

-- 11. MOODS TABLE
CREATE TABLE IF NOT EXISTS public.moods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  mood TEXT NOT NULL,
  emoji TEXT NOT NULL,
  label TEXT,
  note TEXT DEFAULT '',
  date TEXT NOT NULL,
  feeling_tags TEXT[] DEFAULT '{}',
  reactions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_moods_couple_date ON public.moods(couple_id, date DESC);

-- 12. TICTACTOE GAMES TABLE
CREATE TABLE IF NOT EXISTS public.tictactoe_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  player_x JSONB NOT NULL,
  player_o JSONB NOT NULL,
  board JSONB NOT NULL,
  current_turn TEXT NOT NULL DEFAULT 'X',
  current_turn_player_id TEXT,
  winner TEXT,
  winner_symbol TEXT,
  winner_name TEXT,
  winning_cells INT[],
  status TEXT NOT NULL DEFAULT 'in_progress',
  move_count INT DEFAULT 0,
  rematch_requested_by TEXT[] DEFAULT '{}',
  challenge_status TEXT DEFAULT 'accepted',
  challenged_by TEXT,
  reactions JSONB DEFAULT '{}'::jsonb,
  last_reaction JSONB,
  custom_symbols JSONB,
  timer_duration_seconds INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tictactoe_couple ON public.tictactoe_games(couple_id, updated_at DESC);

-- 13. CHESS GAMES TABLE
CREATE TABLE IF NOT EXISTS public.chess_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  white_player_id TEXT NOT NULL,
  black_player_id TEXT NOT NULL,
  white_player_name TEXT NOT NULL,
  black_player_name TEXT NOT NULL,
  white_player_photo TEXT,
  black_player_photo TEXT,
  fen TEXT NOT NULL,
  pgn TEXT DEFAULT '',
  current_turn TEXT NOT NULL DEFAULT 'w',
  status TEXT NOT NULL DEFAULT 'waiting',
  result TEXT DEFAULT '*',
  winner_id TEXT,
  winner_name TEXT,
  win_reason TEXT,
  time_control JSONB DEFAULT '{}'::jsonb,
  white_time_remaining INT DEFAULT 600000,
  black_time_remaining INT DEFAULT 600000,
  last_move_timestamp BIGINT,
  is_casual BOOLEAN DEFAULT false,
  is_rated BOOLEAN DEFAULT false,
  is_ai_game BOOLEAN DEFAULT false,
  ai_difficulty TEXT,
  ai_personality TEXT,
  move_count INT DEFAULT 0,
  moves JSONB DEFAULT '[]'::jsonb,
  draw_offer_from TEXT,
  rematch_requested_by JSONB DEFAULT '[]'::jsonb,
  last_reaction JSONB,
  saved_to_memories BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chess_games_couple ON public.chess_games(couple_id, updated_at DESC);

-- 14. CHESS CHALLENGES TABLE
CREATE TABLE IF NOT EXISTS public.chess_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  challenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenger_name TEXT NOT NULL,
  challenger_photo TEXT,
  challenged_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  time_control JSONB DEFAULT '{}'::jsonb,
  preferred_color TEXT DEFAULT 'random',
  is_casual BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  game_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. SHARED ALBUMS TABLE
CREATE TABLE IF NOT EXISTS public.shared_albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cover_photo_url TEXT,
  photo_count INT DEFAULT 0,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 16. SHARED ALBUM PHOTOS TABLE
CREATE TABLE IF NOT EXISTS public.shared_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID REFERENCES public.shared_albums(id) ON DELETE CASCADE,
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  added_by TEXT,
  added_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 17. TYPING INDICATORS TABLE
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id TEXT PRIMARY KEY, -- coupleId_userId
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 18. CALLS TABLE
CREATE TABLE IF NOT EXISTS public.calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  caller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  caller_name TEXT NOT NULL,
  caller_photo TEXT,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_name TEXT NOT NULL,
  call_type TEXT DEFAULT 'audio',
  status TEXT DEFAULT 'ringing',
  duration_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- 19. VAULT ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.vault_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'secret',
  content TEXT DEFAULT '',
  media_urls TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 20. CUSTOM QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.custom_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  category TEXT DEFAULT 'custom',
  category_label TEXT DEFAULT 'Custom Couple Prompt',
  vibe_emoji TEXT DEFAULT '✨',
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT DEFAULT 'Partner',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 21. USER PRESENCE TABLE
CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 22. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'general',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_tab TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, created_at DESC);

-- =======================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =======================================================================

-- Enable RLS on ALL tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.important_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.love_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bucket_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tictactoe_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chess_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chess_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated, anon
  USING (true); -- Users can view partner profile and search by username/pair code

DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated, anon
  WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated, anon
  USING (auth.uid() = id OR auth.uid() IS NULL OR public.is_couple_member(couple_id, auth.uid()))
  WITH CHECK (auth.uid() = id OR auth.uid() IS NULL OR public.is_couple_member(couple_id, auth.uid()));

DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- COUPLES POLICIES
DROP POLICY IF EXISTS "couples_select" ON public.couples;
CREATE POLICY "couples_select" ON public.couples
  FOR SELECT TO authenticated, anon
  USING (
    creator_id = auth.uid()
    OR partner_id = auth.uid()
    OR auth.uid() = ANY(user_ids)
    OR status = 'pending'
    OR (pending_join_request->>'requesterId' = auth.uid()::text)
    OR auth.uid() IS NULL
  );

DROP POLICY IF EXISTS "couples_insert" ON public.couples;
CREATE POLICY "couples_insert" ON public.couples
  FOR INSERT TO authenticated, anon
  WITH CHECK (
    creator_id = auth.uid()
    OR auth.uid() = ANY(user_ids)
    OR auth.uid() IS NULL
  );

DROP POLICY IF EXISTS "couples_update" ON public.couples;
CREATE POLICY "couples_update" ON public.couples
  FOR UPDATE TO authenticated, anon
  USING (
    creator_id = auth.uid()
    OR partner_id = auth.uid()
    OR auth.uid() = ANY(user_ids)
    OR status = 'pending'
    OR (pending_join_request->>'requesterId' = auth.uid()::text)
    OR auth.uid() IS NULL
  )
  WITH CHECK (
    creator_id = auth.uid()
    OR partner_id = auth.uid()
    OR auth.uid() = ANY(user_ids)
    OR status = 'pending'
    OR (pending_join_request->>'requesterId' = auth.uid()::text)
    OR auth.uid() IS NULL
  );

DROP POLICY IF EXISTS "couples_delete" ON public.couples;
CREATE POLICY "couples_delete" ON public.couples
  FOR DELETE TO authenticated, anon
  USING (
    creator_id = auth.uid()
    OR partner_id = auth.uid()
    OR auth.uid() = ANY(user_ids)
    OR auth.uid() IS NULL
  );

-- Messages
DROP POLICY IF EXISTS "messages_all" ON public.messages;
CREATE POLICY "messages_all" ON public.messages
  FOR ALL TO authenticated, anon
  USING (public.is_couple_member(couple_id, auth.uid()))
  WITH CHECK (public.is_couple_member(couple_id, auth.uid()));

-- Memories
DROP POLICY IF EXISTS "memories_all" ON public.memories;
CREATE POLICY "memories_all" ON public.memories
  FOR ALL TO authenticated, anon
  USING (public.is_couple_member(couple_id, auth.uid()))
  WITH CHECK (public.is_couple_member(couple_id, auth.uid()));

-- Important Dates
DROP POLICY IF EXISTS "important_dates_all" ON public.important_dates;
CREATE POLICY "important_dates_all" ON public.important_dates
  FOR ALL TO authenticated, anon
  USING (public.is_couple_member(couple_id, auth.uid()))
  WITH CHECK (public.is_couple_member(couple_id, auth.uid()));

-- Love Letters
DROP POLICY IF EXISTS "love_letters_all" ON public.love_letters;
CREATE POLICY "love_letters_all" ON public.love_letters
  FOR ALL TO authenticated, anon
  USING (public.is_couple_member(couple_id, auth.uid()))
  WITH CHECK (public.is_couple_member(couple_id, auth.uid()));

-- Shared Notes
DROP POLICY IF EXISTS "shared_notes_all" ON public.shared_notes;
CREATE POLICY "shared_notes_all" ON public.shared_notes
  FOR ALL TO authenticated, anon
  USING (public.is_couple_member(couple_id, auth.uid()))
  WITH CHECK (public.is_couple_member(couple_id, auth.uid()));

-- Bucket List
DROP POLICY IF EXISTS "bucket_list_all" ON public.bucket_list;
CREATE POLICY "bucket_list_all" ON public.bucket_list
  FOR ALL TO authenticated, anon
  USING (public.is_couple_member(couple_id, auth.uid()))
  WITH CHECK (public.is_couple_member(couple_id, auth.uid()));

-- Daily Answers
DROP POLICY IF EXISTS "daily_answers_all" ON public.daily_answers;
CREATE POLICY "daily_answers_all" ON public.daily_answers
  FOR ALL TO authenticated, anon
  USING (public.is_couple_member(couple_id, auth.uid()))
  WITH CHECK (public.is_couple_member(couple_id, auth.uid()));

-- Moods
DROP POLICY IF EXISTS "moods_all" ON public.moods;
CREATE POLICY "moods_all" ON public.moods
  FOR ALL TO authenticated, anon
  USING (public.is_couple_member(couple_id, auth.uid()))
  WITH CHECK (public.is_couple_member(couple_id, auth.uid()));

-- TicTacToe Games
DROP POLICY IF EXISTS "tictactoe_all" ON public.tictactoe_games;
CREATE POLICY "tictactoe_all" ON public.tictactoe_games
  FOR ALL TO authenticated, anon
  USING (public.is_couple_member(couple_id, auth.uid()))
  WITH CHECK (public.is_couple_member(couple_id, auth.uid()));

-- Chess Games
DROP POLICY IF EXISTS "chess_games_all" ON public.chess_games;
CREATE POLICY "chess_games_all" ON public.chess_games
  FOR ALL TO authenticated, anon
  USING (public.is_couple_member(couple_id, auth.uid()))
  WITH CHECK (public.is_couple_member(couple_id, auth.uid()));

-- Chess Challenges
DROP POLICY IF EXISTS "chess_challenges_all" ON public.chess_challenges;
CREATE POLICY "chess_challenges_all" ON public.chess_challenges
  FOR ALL TO authenticated, anon
  USING (public.is_couple_member(couple_id, auth.uid()))
  WITH CHECK (public.is_couple_member(couple_id, auth.uid()));

-- Shared Albums & Photos
DROP POLICY IF EXISTS "shared_albums_all" ON public.shared_albums;
CREATE POLICY "shared_albums_all" ON public.shared_albums
  FOR ALL TO authenticated, anon
  USING (public.is_couple_member(couple_id, auth.uid()))
  WITH CHECK (public.is_couple_member(couple_id, auth.uid()));

DROP POLICY IF EXISTS "shared_photos_all" ON public.shared_photos;
CREATE POLICY "shared_photos_all" ON public.shared_photos
  FOR ALL TO authenticated, anon
  USING (public.is_couple_member(couple_id, auth.uid()))
  WITH CHECK (public.is_couple_member(couple_id, auth.uid()));

-- Typing Indicators
DROP POLICY IF EXISTS "typing_indicators_all" ON public.typing_indicators;
CREATE POLICY "typing_indicators_all" ON public.typing_indicators
  FOR ALL TO authenticated, anon
  USING (public.is_couple_member(couple_id, auth.uid()))
  WITH CHECK (public.is_couple_member(couple_id, auth.uid()));

-- Calls
DROP POLICY IF EXISTS "calls_all" ON public.calls;
CREATE POLICY "calls_all" ON public.calls
  FOR ALL TO authenticated, anon
  USING (public.is_couple_member(couple_id, auth.uid()))
  WITH CHECK (public.is_couple_member(couple_id, auth.uid()));

-- Vault Items
DROP POLICY IF EXISTS "vault_items_all" ON public.vault_items;
CREATE POLICY "vault_items_all" ON public.vault_items
  FOR ALL TO authenticated, anon
  USING (public.is_couple_member(couple_id, auth.uid()))
  WITH CHECK (public.is_couple_member(couple_id, auth.uid()));

-- Custom Questions
DROP POLICY IF EXISTS "custom_questions_all" ON public.custom_questions;
CREATE POLICY "custom_questions_all" ON public.custom_questions
  FOR ALL TO authenticated, anon
  USING (public.is_couple_member(couple_id, auth.uid()))
  WITH CHECK (public.is_couple_member(couple_id, auth.uid()));

-- User Presence
DROP POLICY IF EXISTS "user_presence_select" ON public.user_presence;
CREATE POLICY "user_presence_select" ON public.user_presence
  FOR SELECT TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "user_presence_insert" ON public.user_presence;
CREATE POLICY "user_presence_insert" ON public.user_presence
  FOR INSERT TO authenticated, anon
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "user_presence_update" ON public.user_presence;
CREATE POLICY "user_presence_update" ON public.user_presence
  FOR UPDATE TO authenticated, anon
  USING (auth.uid() = user_id OR auth.uid() IS NULL)
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Notifications
DROP POLICY IF EXISTS "notifications_all" ON public.notifications;
CREATE POLICY "notifications_all" ON public.notifications
  FOR ALL TO authenticated, anon
  USING (recipient_id = auth.uid() OR public.is_couple_member(couple_id, auth.uid()))
  WITH CHECK (recipient_id = auth.uid() OR public.is_couple_member(couple_id, auth.uid()));

-- =======================================================================
-- AUTH TRIGGER: Automatically create profile on new user signup
-- =======================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    username,
    display_name,
    photo_url,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(COALESCE(NEW.email, 'user'), '@', 1) || '_' || substr(NEW.id::text, 1, 4)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'username', split_part(COALESCE(NEW.email, 'Soulmate'), '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', 'https://api.dicebear.com/7.x/notionists/svg?seed=' || NEW.id::text),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(public.profiles.username, EXCLUDED.username),
    display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =======================================================================
-- REALTIME REPLICATION CONFIGURATION
-- =======================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.memories;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.important_dates;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.love_letters;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_notes;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bucket_list;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_answers;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.moods;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tictactoe_games;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chess_games;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chess_challenges;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.couples;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- =======================================================================
-- STORAGE BUCKETS SETUP
-- =======================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('couple-media', 'couple-media', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg', 'video/mp4', 'video/webm']),
  ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: Couple Media
DROP POLICY IF EXISTS "couple_media_select" ON storage.objects;
CREATE POLICY "couple_media_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'couple-media' AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.couples WHERE creator_id = auth.uid() OR partner_id = auth.uid() OR auth.uid() = ANY(user_ids)
  ));

DROP POLICY IF EXISTS "couple_media_insert" ON storage.objects;
CREATE POLICY "couple_media_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'couple-media' AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.couples WHERE creator_id = auth.uid() OR partner_id = auth.uid() OR auth.uid() = ANY(user_ids)
  ));

DROP POLICY IF EXISTS "couple_media_delete" ON storage.objects;
CREATE POLICY "couple_media_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'couple-media' AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.couples WHERE creator_id = auth.uid() OR partner_id = auth.uid() OR auth.uid() = ANY(user_ids)
  ));

-- Storage Policies: Avatars
DROP POLICY IF EXISTS "avatars_select" ON storage.objects;
CREATE POLICY "avatars_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_insert" ON storage.objects;
CREATE POLICY "avatars_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars_update" ON storage.objects;
CREATE POLICY "avatars_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
