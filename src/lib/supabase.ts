import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase project dashboard
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbHabit {
  id: string;
  user_id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  frequency: string;
  target_days: number[];
  completed_dates: string[];
  streak: number;
  best_streak: number;
  created_at: string;
  updated_at: string;
}

export interface DbGameState {
  id: string;
  user_id: string;
  xp: number;
  unlocked_achievements: string[];
  current_combo: number;
  max_combo: number;
  last_completion_date: string | null;
  streak_shields: number;
  sound_enabled: boolean;
  updated_at: string;
}

// Convert database habit to app habit format
export function dbHabitToHabit(dbHabit: DbHabit) {
  return {
    id: dbHabit.id,
    name: dbHabit.name,
    description: dbHabit.description,
    icon: dbHabit.icon,
    color: dbHabit.color as 'purple' | 'pink' | 'blue' | 'green' | 'orange' | 'teal',
    frequency: dbHabit.frequency as 'daily' | 'weekly' | 'custom',
    targetDays: dbHabit.target_days,
    completedDates: dbHabit.completed_dates,
    streak: dbHabit.streak,
    bestStreak: dbHabit.best_streak,
    createdAt: dbHabit.created_at,
  };
}

// Convert app habit to database format
export function habitToDbHabit(habit: any, userId: string): Partial<DbHabit> {
  return {
    id: habit.id,
    user_id: userId,
    name: habit.name,
    description: habit.description,
    icon: habit.icon,
    color: habit.color,
    frequency: habit.frequency,
    target_days: habit.targetDays,
    completed_dates: habit.completedDates,
    streak: habit.streak,
    best_streak: habit.bestStreak,
    created_at: habit.createdAt,
    updated_at: new Date().toISOString(),
  };
}
