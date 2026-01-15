-- =====================================================
-- HABITFLOW DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- HABITS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '💪',
  color TEXT DEFAULT 'purple',
  frequency TEXT DEFAULT 'daily',
  target_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6],
  completed_dates TEXT[] DEFAULT ARRAY[]::TEXT[],
  streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries by user
CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits(user_id);

-- =====================================================
-- GAME STATE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS game_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  xp INTEGER DEFAULT 0,
  unlocked_achievements TEXT[] DEFAULT ARRAY[]::TEXT[],
  current_combo INTEGER DEFAULT 0,
  max_combo INTEGER DEFAULT 0,
  last_completion_date TEXT,
  streak_shields INTEGER DEFAULT 3,
  sound_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries by user
CREATE INDEX IF NOT EXISTS game_state_user_id_idx ON game_state(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on habits table
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own habits
CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own habits
CREATE POLICY "Users can insert own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own habits
CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own habits
CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on game_state table
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own game state
CREATE POLICY "Users can view own game state" ON game_state
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own game state
CREATE POLICY "Users can insert own game state" ON game_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own game state
CREATE POLICY "Users can update own game state" ON game_state
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own game state
CREATE POLICY "Users can delete own game state" ON game_state
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- Enable realtime for both tables
-- =====================================================

-- Enable realtime for habits (go to Supabase Dashboard > Database > Replication)
-- Or run: 
ALTER PUBLICATION supabase_realtime ADD TABLE habits;
ALTER PUBLICATION supabase_realtime ADD TABLE game_state;

-- =====================================================
-- HELPER FUNCTION: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for habits table
DROP TRIGGER IF EXISTS update_habits_updated_at ON habits;
CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for game_state table
DROP TRIGGER IF EXISTS update_game_state_updated_at ON game_state;
CREATE TRIGGER update_game_state_updated_at
  BEFORE UPDATE ON game_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
