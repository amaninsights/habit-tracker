import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { ACHIEVEMENTS, type GameState, type Achievement, getLevelFromXP, getXPProgress, getLevelTitle, DAILY_QUOTES } from '../store/gameStore';

interface GameContextType {
  gameState: GameState;
  loading: boolean;
  addXP: (amount: number) => Promise<{ leveledUp: boolean; newLevel: number }>;
  removeXP: (amount: number) => Promise<void>;
  revokeAchievements: (achievementIds: string[]) => Promise<void>;
  recordCompletion: (habitCount: number, totalHabits: number, maxStreak: number) => Promise<{ xpGained: number; achievements: Achievement[] }>;
  revertCompletion: (xpToRemove: number, achievementIds: string[]) => Promise<void>;
  useStreakShield: () => Promise<boolean>;
  toggleSound: () => Promise<void>;
  getDailyQuote: () => { text: string; author: string };
  getLevel: () => number;
  getLevelTitle: () => string;
  getXPProgress: () => { current: number; required: number; percentage: number };
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  playSound: (type: 'complete' | 'levelup' | 'achievement' | 'combo') => void;
  triggerConfetti: () => void;
  confettiActive: boolean;
  newAchievement: Achievement | null;
  clearNewAchievement: () => void;
  levelUpAnimation: boolean;
  clearLevelUp: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const defaultGameState: GameState = {
  xp: 0,
  achievements: ACHIEVEMENTS.map(a => ({ ...a })),
  currentCombo: 0,
  maxCombo: 0,
  lastCompletionDate: null,
  streakShields: 3,
  soundEnabled: true,
};

// Sound effects using Web Audio API
const createSound = (type: 'complete' | 'levelup' | 'achievement' | 'combo') => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  switch (type) {
    case 'complete':
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      break;
    case 'levelup':
      oscillator.frequency.setValueAtTime(261.63, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(329.63, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(392, audioContext.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      break;
    case 'achievement':
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.35, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.6);
      break;
    case 'combo':
      oscillator.frequency.setValueAtTime(392, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.05);
      gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
      break;
  }
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>(defaultGameState);
  const [loading, setLoading] = useState(true);
  const [confettiActive, setConfettiActive] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);

  // Fetch game state from Supabase
  const fetchGameState = useCallback(async () => {
    if (!user) {
      setGameState(defaultGameState);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('game_state')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        // Merge stored achievements with current achievement definitions
        const achievements = ACHIEVEMENTS.map(a => {
          const stored = data.unlocked_achievements?.includes(a.id);
          return { ...a, unlockedAt: stored ? new Date().toISOString() : undefined };
        });

        setGameState({
          xp: data.xp || 0,
          achievements,
          currentCombo: data.current_combo || 0,
          maxCombo: data.max_combo || 0,
          lastCompletionDate: data.last_completion_date,
          streakShields: data.streak_shields ?? 3,
          soundEnabled: data.sound_enabled ?? true,
        });
      } else {
        // Create initial game state for new user
        await supabase.from('game_state').insert({
          user_id: user.id,
          xp: 0,
          unlocked_achievements: [],
          current_combo: 0,
          max_combo: 0,
          streak_shields: 3,
          sound_enabled: true,
        });
      }
    } catch (error) {
      console.error('Error fetching game state:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch and realtime subscription
  useEffect(() => {
    fetchGameState();

    if (!user) return;

    const channel = supabase
      .channel('game-state-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'game_state', filter: `user_id=eq.${user.id}` },
        () => {
          fetchGameState();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchGameState]);

  const saveGameState = useCallback(async (updates: Partial<{
    xp: number;
    unlocked_achievements: string[];
    current_combo: number;
    max_combo: number;
    last_completion_date: string | null;
    streak_shields: number;
    sound_enabled: boolean;
  }>) => {
    if (!user) return;

    try {
      await supabase
        .from('game_state')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  }, [user]);

  const playSound = useCallback((type: 'complete' | 'levelup' | 'achievement' | 'combo') => {
    if (gameState.soundEnabled) {
      try {
        createSound(type);
      } catch (e) {
        // Audio not supported
      }
    }
  }, [gameState.soundEnabled]);

  const triggerConfetti = useCallback(() => {
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 3000);
  }, []);

  const addXP = useCallback(async (amount: number) => {
    const oldLevel = getLevelFromXP(gameState.xp);
    const newXP = gameState.xp + amount;
    const newLevel = getLevelFromXP(newXP);
    const leveledUp = newLevel > oldLevel;

    setGameState(prev => ({ ...prev, xp: newXP }));

    if (leveledUp) {
      playSound('levelup');
      setLevelUpAnimation(true);
      triggerConfetti();
    }

    await saveGameState({ xp: newXP });

    return { leveledUp, newLevel };
  }, [gameState.xp, playSound, triggerConfetti, saveGameState]);

  const removeXP = useCallback(async (amount: number) => {
    const newXP = Math.max(0, gameState.xp - amount);
    setGameState(prev => ({ ...prev, xp: newXP }));
    await saveGameState({ xp: newXP });
  }, [gameState.xp, saveGameState]);

  const revokeAchievements = useCallback(async (achievementIds: string[]) => {
    if (achievementIds.length === 0) return;

    // Remove unlocked status from specified achievements
    const updatedAchievements = gameState.achievements.map(achievement => {
      if (achievementIds.includes(achievement.id) && achievement.unlockedAt) {
        return { ...achievement, unlockedAt: undefined };
      }
      return achievement;
    });

    setGameState(prev => ({
      ...prev,
      achievements: updatedAchievements,
    }));

    // Save to Supabase
    await saveGameState({
      unlocked_achievements: updatedAchievements.filter(a => a.unlockedAt).map(a => a.id),
    });
  }, [gameState.achievements, saveGameState]);

  const recordCompletion = useCallback(async (habitCount: number, totalHabits: number, maxStreak: number) => {
    playSound('complete');

    const today = new Date().toISOString().split('T')[0];
    const isNewDay = gameState.lastCompletionDate !== today;
    
    let newCombo = isNewDay ? 1 : gameState.currentCombo + 1;
    const newMaxCombo = Math.max(gameState.maxCombo, newCombo);

    if (newCombo > 0 && newCombo % 3 === 0) {
      playSound('combo');
    }

    // Check for new achievements
    const newAchievements: Achievement[] = [];
    const updatedAchievements = gameState.achievements.map(achievement => {
      if (achievement.unlockedAt) return achievement;

      let unlocked = false;
      switch (achievement.id) {
        case 'first_habit': unlocked = true; break;
        case 'streak_3': unlocked = maxStreak >= 3; break;
        case 'streak_7': unlocked = maxStreak >= 7; break;
        case 'streak_30': unlocked = maxStreak >= 30; break;
        case 'streak_100': unlocked = maxStreak >= 100; break;
        case 'perfect_day': unlocked = habitCount >= totalHabits && totalHabits > 0; break;
        case 'perfect_week': unlocked = habitCount >= totalHabits * 7; break;
        case 'early_bird': unlocked = new Date().getHours() < 8; break;
        case 'night_owl': unlocked = new Date().getHours() >= 22; break;
        case 'combo_5': unlocked = newCombo >= 5; break;
        case 'combo_10': unlocked = newCombo >= 10; break;
        case 'combo_25': unlocked = newCombo >= 25; break;
        case 'level_5': unlocked = getLevelFromXP(gameState.xp) >= 5; break;
        case 'level_10': unlocked = getLevelFromXP(gameState.xp) >= 10; break;
        case 'level_25': unlocked = getLevelFromXP(gameState.xp) >= 25; break;
        case 'weekend_warrior': unlocked = [0, 6].includes(new Date().getDay()) && habitCount > 0; break;
      }

      if (unlocked) {
        const unlockedAchievement = { ...achievement, unlockedAt: new Date().toISOString() };
        newAchievements.push(unlockedAchievement);
        return unlockedAchievement;
      }
      return achievement;
    });

    // Calculate XP gain
    let xpGain = 25;
    const comboBonus = Math.min(newCombo * 0.1, 1);
    xpGain += Math.floor(25 * comboBonus);

    // Add achievement XP
    const achievementXP = newAchievements.reduce((sum, a) => sum + a.xpReward, 0);
    const totalXPGain = xpGain + achievementXP;

    const newXP = gameState.xp + totalXPGain;

    // Update state
    setGameState(prev => ({
      ...prev,
      xp: newXP,
      achievements: updatedAchievements,
      currentCombo: newCombo,
      maxCombo: newMaxCombo,
      lastCompletionDate: today,
    }));

    if (newAchievements.length > 0) {
      playSound('achievement');
      setNewAchievement(newAchievements[0]);
      triggerConfetti();
    }

    // Save to Supabase
    await saveGameState({
      xp: newXP,
      unlocked_achievements: updatedAchievements.filter(a => a.unlockedAt).map(a => a.id),
      current_combo: newCombo,
      max_combo: newMaxCombo,
      last_completion_date: today,
    });

    return { xpGained: totalXPGain, achievements: newAchievements };
  }, [gameState, playSound, triggerConfetti, saveGameState]);

  // Revert a completion - undo XP, combo, and achievements
  const revertCompletion = useCallback(async (xpToRemove: number, achievementIds: string[]) => {
    // Remove XP
    const newXP = Math.max(0, gameState.xp - xpToRemove);
    
    // Decrement combo (minimum 0)
    const newCombo = Math.max(0, gameState.currentCombo - 1);
    
    // Revoke achievements
    const updatedAchievements = gameState.achievements.map(achievement => {
      if (achievementIds.includes(achievement.id) && achievement.unlockedAt) {
        return { ...achievement, unlockedAt: undefined };
      }
      return achievement;
    });

    // Update state
    setGameState(prev => ({
      ...prev,
      xp: newXP,
      currentCombo: newCombo,
      achievements: updatedAchievements,
    }));

    // Save to Supabase
    await saveGameState({
      xp: newXP,
      current_combo: newCombo,
      unlocked_achievements: updatedAchievements.filter(a => a.unlockedAt).map(a => a.id),
    });
  }, [gameState.xp, gameState.currentCombo, gameState.achievements, saveGameState]);

  const useStreakShield = useCallback(async () => {
    if (gameState.streakShields <= 0) return false;

    const newShields = gameState.streakShields - 1;
    setGameState(prev => ({ ...prev, streakShields: newShields }));
    await saveGameState({ streak_shields: newShields });

    return true;
  }, [gameState.streakShields, saveGameState]);

  const toggleSound = useCallback(async () => {
    const newValue = !gameState.soundEnabled;
    setGameState(prev => ({ ...prev, soundEnabled: newValue }));
    await saveGameState({ sound_enabled: newValue });
  }, [gameState.soundEnabled, saveGameState]);

  const getDailyQuote = useCallback(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
  }, []);

  const getLevel = useCallback(() => getLevelFromXP(gameState.xp), [gameState.xp]);
  const getLevelTitleFn = useCallback(() => getLevelTitle(getLevelFromXP(gameState.xp)), [gameState.xp]);
  const getXPProgressFn = useCallback(() => getXPProgress(gameState.xp), [gameState.xp]);
  const getUnlockedAchievements = useCallback(() => gameState.achievements.filter(a => a.unlockedAt), [gameState.achievements]);
  const getLockedAchievements = useCallback(() => gameState.achievements.filter(a => !a.unlockedAt), [gameState.achievements]);

  const clearNewAchievement = useCallback(() => setNewAchievement(null), []);
  const clearLevelUp = useCallback(() => setLevelUpAnimation(false), []);

  return (
    <GameContext.Provider
      value={{
        gameState,
        loading,
        addXP,
        removeXP,
        revokeAchievements,
        recordCompletion,
        revertCompletion,
        useStreakShield,
        toggleSound,
        getDailyQuote,
        getLevel,
        getLevelTitle: getLevelTitleFn,
        getXPProgress: getXPProgressFn,
        getUnlockedAchievements,
        getLockedAchievements,
        playSound,
        triggerConfetti,
        confettiActive,
        newAchievement,
        clearNewAchievement,
        levelUpAnimation,
        clearLevelUp
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
