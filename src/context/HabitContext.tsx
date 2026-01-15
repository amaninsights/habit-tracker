import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase, dbHabitToHabit, habitToDbHabit } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Habit } from '../store/habitStore';

interface HabitContextType {
  habits: Habit[];
  loading: boolean;
  addHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'createdAt' | 'streak' | 'bestStreak'>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (id: string, date: string) => Promise<void>;
  getHabitCompletionRate: (id: string, days: number) => number;
  getTotalCompletionsToday: () => number;
  getWeeklyData: () => { day: string; completed: number; total: number }[];
  getMonthlyData: () => { week: string; completed: number; total: number }[];
  refreshHabits: () => Promise<void>;
  wasCompletedToday: (habitId: string) => boolean;
  markAsRewarded: (habitId: string, xpAmount: number, achievements?: string[]) => void;
  unmarkAsRewarded: (habitId: string) => void;
  getRewardedXP: (habitId: string) => number;
  getRewardedAchievements: (habitId: string) => string[];
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

// Track which habits have been rewarded today, XP given, and achievements unlocked
const REWARDED_STORAGE_KEY = 'habitflow-rewarded';

interface HabitReward {
  xp: number;
  achievements: string[]; // achievement IDs unlocked by this completion
}

interface RewardedData {
  date: string;
  rewards: { [habitId: string]: HabitReward };
}

const getRewardedToday = (): RewardedData => {
  try {
    const data = localStorage.getItem(REWARDED_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      const today = new Date().toISOString().split('T')[0];
      if (parsed.date === today) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return { date: new Date().toISOString().split('T')[0], rewards: {} };
};

const saveRewardedToday = (rewards: { [habitId: string]: HabitReward }) => {
  const data: RewardedData = {
    date: new Date().toISOString().split('T')[0],
    rewards
  };
  localStorage.setItem(REWARDED_STORAGE_KEY, JSON.stringify(data));
};

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [rewardedHabits, setRewardedHabits] = useState<{ [habitId: string]: HabitReward }>(() => getRewardedToday().rewards);

  // Fetch habits from Supabase
  const fetchHabits = useCallback(async () => {
    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setHabits(data ? data.map(dbHabitToHabit) : []);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch and realtime subscription
  useEffect(() => {
    fetchHabits();

    if (!user) return;

    // Subscribe to realtime changes
    const channel = supabase
      .channel('habits-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'habits', filter: `user_id=eq.${user.id}` },
        () => {
          fetchHabits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchHabits]);

  // Fallback UUID generator for browsers that don't support crypto.randomUUID
  const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const addHabit = useCallback(async (habitData: Omit<Habit, 'id' | 'completedDates' | 'createdAt' | 'streak' | 'bestStreak'>) => {
    if (!user) return;

    const newHabit: Habit = {
      ...habitData,
      id: generateUUID(),
      completedDates: [],
      streak: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setHabits(prev => [newHabit, ...prev]);

    try {
      const { error } = await supabase
        .from('habits')
        .insert(habitToDbHabit(newHabit, user.id));

      if (error) throw error;
    } catch (error) {
      console.error('Error adding habit:', error);
      // Revert optimistic update
      fetchHabits();
    }
  }, [user, fetchHabits]);

  const deleteHabit = useCallback(async (id: string) => {
    if (!user) return;

    // Optimistic update
    setHabits(prev => prev.filter(h => h.id !== id));

    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting habit:', error);
      fetchHabits();
    }
  }, [user, fetchHabits]);

  const toggleHabitCompletion = useCallback(async (id: string, date: string) => {
    if (!user) return;

    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const isCompleted = habit.completedDates.includes(date);
    let newCompletedDates: string[];
    let newStreak: number;
    let newBestStreak: number;

    if (isCompleted) {
      newCompletedDates = habit.completedDates.filter(d => d !== date);
      newStreak = Math.max(0, habit.streak - 1);
      newBestStreak = habit.bestStreak;
    } else {
      newCompletedDates = [...habit.completedDates, date];
      newStreak = habit.streak + 1;
      newBestStreak = Math.max(habit.bestStreak, newStreak);
    }

    // Optimistic update
    setHabits(prev => prev.map(h => 
      h.id === id 
        ? { ...h, completedDates: newCompletedDates, streak: newStreak, bestStreak: newBestStreak }
        : h
    ));

    try {
      const { error } = await supabase
        .from('habits')
        .update({
          completed_dates: newCompletedDates,
          streak: newStreak,
          best_streak: newBestStreak,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling habit:', error);
      fetchHabits();
    }
  }, [user, habits, fetchHabits]);

  const getHabitCompletionRate = useCallback((id: string, days: number): number => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return 0;

    const today = new Date();
    let completed = 0;

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (habit.completedDates.includes(dateStr)) {
        completed++;
      }
    }

    return Math.round((completed / days) * 100);
  }, [habits]);

  const getTotalCompletionsToday = useCallback((): number => {
    const today = new Date().toISOString().split('T')[0];
    return habits.filter(h => h.completedDates.includes(today)).length;
  }, [habits]);

  const getWeeklyData = useCallback(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const completed = habits.filter(h => h.completedDates.includes(dateStr)).length;

      data.push({
        day: days[date.getDay()],
        completed,
        total: habits.length,
      });
    }

    return data;
  }, [habits]);

  const getMonthlyData = useCallback(() => {
    const data = [];
    const today = new Date();

    for (let week = 3; week >= 0; week--) {
      let weekCompleted = 0;
      let weekTotal = 0;

      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (week * 7 + day));
        const dateStr = date.toISOString().split('T')[0];
        weekCompleted += habits.filter(h => h.completedDates.includes(dateStr)).length;
        weekTotal += habits.length;
      }

      data.push({
        week: `Week ${4 - week}`,
        completed: weekCompleted,
        total: weekTotal,
      });
    }

    return data;
  }, [habits]);

  // Check if a habit was already rewarded today (to prevent gaming)
  const wasCompletedToday = useCallback((habitId: string): boolean => {
    return habitId in rewardedHabits;
  }, [rewardedHabits]);

  // Mark a habit as rewarded for today with XP amount and achievements
  const markAsRewarded = useCallback((habitId: string, xpAmount: number, achievements: string[] = []) => {
    setRewardedHabits(prev => {
      if (habitId in prev) return prev;
      const newRewards = { ...prev, [habitId]: { xp: xpAmount, achievements } };
      saveRewardedToday(newRewards);
      return newRewards;
    });
  }, []);

  // Unmark a habit as rewarded (when uncompleting)
  const unmarkAsRewarded = useCallback((habitId: string) => {
    setRewardedHabits(prev => {
      const newRewards = { ...prev };
      delete newRewards[habitId];
      saveRewardedToday(newRewards);
      return newRewards;
    });
  }, []);

  // Get the XP amount that was rewarded for a habit
  const getRewardedXP = useCallback((habitId: string): number => {
    return rewardedHabits[habitId]?.xp || 0;
  }, [rewardedHabits]);

  // Get the achievements that were unlocked by completing a habit
  const getRewardedAchievements = useCallback((habitId: string): string[] => {
    return rewardedHabits[habitId]?.achievements || [];
  }, [rewardedHabits]);

  return (
    <HabitContext.Provider
      value={{
        habits,
        loading,
        addHabit,
        deleteHabit,
        toggleHabitCompletion,
        getHabitCompletionRate,
        getTotalCompletionsToday,
        getWeeklyData,
        getMonthlyData,
        refreshHabits: fetchHabits,
        wasCompletedToday,
        markAsRewarded,
        unmarkAsRewarded,
        getRewardedXP,
        getRewardedAchievements,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};
