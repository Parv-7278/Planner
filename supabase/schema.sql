-- ==============================================================================
-- DAYLY PLANNER — SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER PROFILES TABLE (Mirrors and extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  phone TEXT,
  city TEXT DEFAULT 'Delhi NCR',
  budget_tier TEXT DEFAULT 'moderate',
  preferred_categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. SAVED ITINERARIES TABLE (Stores generated & customized day plans)
CREATE TABLE IF NOT EXISTS public.saved_itineraries (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  total_budget NUMERIC DEFAULT 0,
  estimated_cost NUMERIC DEFAULT 0,
  actual_spent NUMERIC DEFAULT 0,
  num_people INTEGER DEFAULT 2,
  items JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. BOOKINGS TABLE (Tickets, table reservations, turnstile QR codes)
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_id TEXT NOT NULL,
  experience_name TEXT NOT NULL,
  slot_time TEXT NOT NULL,
  date TEXT NOT NULL,
  party_size INTEGER DEFAULT 2,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled')),
  qr_code TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. VIRTUAL QUEUES TABLE (Active AI waitlist monitoring & drop-sniping entries)
CREATE TABLE IF NOT EXISTS public.virtual_queues (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_id TEXT NOT NULL,
  experience_name TEXT NOT NULL,
  slot_time TEXT NOT NULL,
  date TEXT NOT NULL,
  party_size INTEGER DEFAULT 2,
  status TEXT DEFAULT 'monitoring' CHECK (status IN ('monitoring', 'slot_available', 'booked', 'expired', 'left')),
  monitoring_status TEXT DEFAULT 'in_queue' CHECK (monitoring_status IN ('idle', 'monitoring_opening', 'in_queue', 'turn_arrived', 'challenge_required', 'booked', 'stopped')),
  current_position INTEGER DEFAULT 1,
  initial_position INTEGER DEFAULT 1,
  estimated_wait_minutes INTEGER DEFAULT 0,
  assistant_enabled BOOLEAN DEFAULT TRUE,
  auto_queue_entry BOOLEAN DEFAULT TRUE,
  requires_manual_verification BOOLEAN DEFAULT FALSE,
  requires_payment_approval BOOLEAN DEFAULT FALSE,
  scheduled_opening_time TIMESTAMPTZ,
  logs JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 6. WISHLIST TABLE (Bookmarked spots & experiences)
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, experience_id)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures users can ONLY view, modify, and delete their own data
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Saved Itineraries Policies
CREATE POLICY "Users can manage their own itineraries"
  ON public.saved_itineraries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Bookings Policies
CREATE POLICY "Users can manage their own bookings"
  ON public.bookings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Virtual Queues Policies
CREATE POLICY "Users can manage their own queues"
  ON public.virtual_queues FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Wishlist Policies
CREATE POLICY "Users can manage their own wishlist"
  ON public.wishlist_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- Automatically creates a public.profiles record when a user signs up via Auth
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
