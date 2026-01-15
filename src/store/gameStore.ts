// 🎮 HABITFLOW GAMIFICATION SYSTEM
// XP, Levels, Achievements, Combos, Streak Shields

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'completions' | 'streak' | 'habits' | 'combo' | 'special';
  unlockedAt?: string;
  xpReward: number;
}

export interface GameState {
  xp: number;
  achievements: Achievement[];
  currentCombo: number;
  maxCombo: number;
  lastCompletionDate: string | null;
  streakShields: number;
  soundEnabled: boolean;
}

// XP required for each level (exponential growth)
export const getXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

export const getLevelFromXP = (xp: number): number => {
  let level = 1;
  let totalXP = 0;
  while (totalXP + getXPForLevel(level) <= xp) {
    totalXP += getXPForLevel(level);
    level++;
  }
  return level;
};

export const getXPProgress = (xp: number): { current: number; required: number; percentage: number } => {
  const level = getLevelFromXP(xp);
  let xpForPreviousLevels = 0;
  for (let i = 1; i < level; i++) {
    xpForPreviousLevels += getXPForLevel(i);
  }
  const currentLevelXP = xp - xpForPreviousLevels;
  const requiredXP = getXPForLevel(level);
  return {
    current: currentLevelXP,
    required: requiredXP,
    percentage: Math.round((currentLevelXP / requiredXP) * 100)
  };
};

// Level titles
export const getLevelTitle = (level: number): string => {
  const titles = [
    'Beginner',      // 1-4
    'Apprentice',    // 5-9
    'Dedicated',     // 10-14
    'Committed',     // 15-19
    'Disciplined',   // 20-24
    'Master',        // 25-29
    'Grandmaster',   // 30-34
    'Legend',        // 35-39
    'Mythic',        // 40-44
    'Transcendent'   // 45+
  ];
  return titles[Math.min(Math.floor((level - 1) / 5), titles.length - 1)];
};

// All possible achievements - exported for use in GameContext
// Designed for 50+ years of use! 🚀
export const ACHIEVEMENTS: Achievement[] = [
  // ═══════════════════════════════════════════════════════════════
  // 🎯 COMPLETION ACHIEVEMENTS (Total habits completed)
  // ═══════════════════════════════════════════════════════════════
  { id: 'first_habit', name: 'First Step', description: 'Complete your first habit', icon: '🌟', requirement: 1, type: 'completions', xpReward: 50 },
  { id: 'getting_started', name: 'Getting Started', description: 'Complete 10 habits', icon: '🚀', requirement: 10, type: 'completions', xpReward: 100 },
  { id: 'building_momentum', name: 'Building Momentum', description: 'Complete 25 habits', icon: '📈', requirement: 25, type: 'completions', xpReward: 150 },
  { id: 'on_fire', name: 'On Fire', description: 'Complete 50 habits', icon: '🔥', requirement: 50, type: 'completions', xpReward: 250 },
  { id: 'centurion', name: 'Centurion', description: 'Complete 100 habits', icon: '💯', requirement: 100, type: 'completions', xpReward: 500 },
  { id: 'dedicated', name: 'Dedicated', description: 'Complete 250 habits', icon: '🎖️', requirement: 250, type: 'completions', xpReward: 750 },
  { id: 'habit_machine', name: 'Habit Machine', description: 'Complete 500 habits', icon: '🤖', requirement: 500, type: 'completions', xpReward: 1000 },
  { id: 'thousand_club', name: 'Thousand Club', description: 'Complete 1,000 habits', icon: '👑', requirement: 1000, type: 'completions', xpReward: 2500 },
  { id: 'habit_veteran', name: 'Habit Veteran', description: 'Complete 2,500 habits', icon: '🎗️', requirement: 2500, type: 'completions', xpReward: 5000 },
  { id: 'five_thousand', name: 'High Five Thousand', description: 'Complete 5,000 habits', icon: '🖐️', requirement: 5000, type: 'completions', xpReward: 10000 },
  { id: 'ten_thousand', name: 'Ten Thousand Hours', description: 'Complete 10,000 habits', icon: '⏰', requirement: 10000, type: 'completions', xpReward: 25000 },
  { id: 'habit_master', name: 'Habit Master', description: 'Complete 25,000 habits', icon: '🧙', requirement: 25000, type: 'completions', xpReward: 50000 },
  { id: 'fifty_thousand', name: 'Golden Milestone', description: 'Complete 50,000 habits', icon: '🏅', requirement: 50000, type: 'completions', xpReward: 100000 },
  { id: 'hundred_thousand', name: 'Platinum Achievement', description: 'Complete 100,000 habits', icon: '💎', requirement: 100000, type: 'completions', xpReward: 250000 },
  { id: 'quarter_million', name: 'Diamond Legacy', description: 'Complete 250,000 habits', icon: '💠', requirement: 250000, type: 'completions', xpReward: 500000 },
  { id: 'half_million', name: 'Legendary Status', description: 'Complete 500,000 habits', icon: '🌠', requirement: 500000, type: 'completions', xpReward: 1000000 },
  { id: 'million', name: 'The Millionaire', description: 'Complete 1,000,000 habits', icon: '👸', requirement: 1000000, type: 'completions', xpReward: 2500000 },
  
  // ═══════════════════════════════════════════════════════════════
  // 🔥 STREAK ACHIEVEMENTS (Consecutive days)
  // ═══════════════════════════════════════════════════════════════
  { id: 'streak_3', name: 'Hat Trick', description: 'Reach a 3-day streak', icon: '🎩', requirement: 3, type: 'streak', xpReward: 75 },
  { id: 'streak_7', name: 'Week Warrior', description: 'Reach a 7-day streak', icon: '⚔️', requirement: 7, type: 'streak', xpReward: 150 },
  { id: 'streak_14', name: 'Fortnight Fighter', description: 'Reach a 14-day streak', icon: '🛡️', requirement: 14, type: 'streak', xpReward: 300 },
  { id: 'streak_21', name: 'Habit Formed', description: 'Reach a 21-day streak (habits form!)', icon: '🧠', requirement: 21, type: 'streak', xpReward: 500 },
  { id: 'streak_30', name: 'Monthly Master', description: 'Reach a 30-day streak', icon: '🏆', requirement: 30, type: 'streak', xpReward: 750 },
  { id: 'streak_45', name: 'Forty-Five Days', description: 'Reach a 45-day streak', icon: '🌙', requirement: 45, type: 'streak', xpReward: 1000 },
  { id: 'streak_60', name: 'Habit Hero', description: 'Reach a 60-day streak', icon: '🦸', requirement: 60, type: 'streak', xpReward: 1500 },
  { id: 'streak_90', name: 'Quarter Year', description: 'Reach a 90-day streak', icon: '📅', requirement: 90, type: 'streak', xpReward: 2000 },
  { id: 'streak_100', name: 'Century Club', description: 'Reach a 100-day streak', icon: '💎', requirement: 100, type: 'streak', xpReward: 3000 },
  { id: 'streak_150', name: 'Unstoppable Force', description: 'Reach a 150-day streak', icon: '🌊', requirement: 150, type: 'streak', xpReward: 4500 },
  { id: 'streak_180', name: 'Half Year Hero', description: 'Reach a 180-day streak', icon: '☀️', requirement: 180, type: 'streak', xpReward: 6000 },
  { id: 'streak_250', name: 'Persistence Pro', description: 'Reach a 250-day streak', icon: '🎯', requirement: 250, type: 'streak', xpReward: 8000 },
  { id: 'streak_365', name: 'Year of Excellence', description: 'Reach a 365-day streak', icon: '🌈', requirement: 365, type: 'streak', xpReward: 15000 },
  { id: 'streak_500', name: 'Beyond Limits', description: 'Reach a 500-day streak', icon: '🚀', requirement: 500, type: 'streak', xpReward: 25000 },
  { id: 'streak_730', name: 'Two Year Titan', description: 'Reach a 730-day streak (2 years!)', icon: '🏛️', requirement: 730, type: 'streak', xpReward: 50000 },
  { id: 'streak_1000', name: 'Thousand Days', description: 'Reach a 1,000-day streak', icon: '👑', requirement: 1000, type: 'streak', xpReward: 75000 },
  { id: 'streak_1095', name: 'Three Year Legend', description: 'Reach a 1,095-day streak (3 years!)', icon: '🌟', requirement: 1095, type: 'streak', xpReward: 100000 },
  { id: 'streak_1825', name: 'Five Year Phenomenon', description: 'Reach a 1,825-day streak (5 years!)', icon: '🔮', requirement: 1825, type: 'streak', xpReward: 200000 },
  { id: 'streak_2555', name: 'Seven Year Sage', description: 'Reach a 2,555-day streak (7 years!)', icon: '🧙‍♂️', requirement: 2555, type: 'streak', xpReward: 350000 },
  { id: 'streak_3650', name: 'Decade of Dedication', description: 'Reach a 3,650-day streak (10 years!)', icon: '🏆', requirement: 3650, type: 'streak', xpReward: 500000 },
  { id: 'streak_5475', name: 'Fifteen Year Phoenix', description: 'Reach a 5,475-day streak (15 years!)', icon: '🦅', requirement: 5475, type: 'streak', xpReward: 750000 },
  { id: 'streak_7300', name: 'Twenty Year Immortal', description: 'Reach a 7,300-day streak (20 years!)', icon: '⚡', requirement: 7300, type: 'streak', xpReward: 1000000 },
  { id: 'streak_9125', name: 'Quarter Century God', description: 'Reach a 9,125-day streak (25 years!)', icon: '🌌', requirement: 9125, type: 'streak', xpReward: 2000000 },
  { id: 'streak_10950', name: 'Thirty Year Transcendent', description: 'Reach a 10,950-day streak (30 years!)', icon: '🌀', requirement: 10950, type: 'streak', xpReward: 3000000 },
  { id: 'streak_12775', name: 'Thirty-Five Year Eternal', description: 'Reach a 12,775-day streak (35 years!)', icon: '💫', requirement: 12775, type: 'streak', xpReward: 4000000 },
  { id: 'streak_14600', name: 'Forty Year Oracle', description: 'Reach a 14,600-day streak (40 years!)', icon: '🔱', requirement: 14600, type: 'streak', xpReward: 5000000 },
  { id: 'streak_16425', name: 'Forty-Five Year Ancient', description: 'Reach a 16,425-day streak (45 years!)', icon: '📜', requirement: 16425, type: 'streak', xpReward: 7500000 },
  { id: 'streak_18250', name: 'Fifty Year Cosmic Being', description: 'Reach a 18,250-day streak (50 years!)', icon: '🌟', requirement: 18250, type: 'streak', xpReward: 10000000 },
  
  // ═══════════════════════════════════════════════════════════════
  // ⚡ COMBO ACHIEVEMENTS (Habits completed in a row)
  // ═══════════════════════════════════════════════════════════════
  { id: 'combo_3', name: 'Triple Threat', description: 'Complete 3 habits in a row', icon: '3️⃣', requirement: 3, type: 'combo', xpReward: 50 },
  { id: 'combo_5', name: 'Combo King', description: 'Complete 5 habits in a row', icon: '👊', requirement: 5, type: 'combo', xpReward: 100 },
  { id: 'combo_10', name: 'Unstoppable', description: 'Complete 10 habits in a row', icon: '💪', requirement: 10, type: 'combo', xpReward: 250 },
  { id: 'combo_15', name: 'Momentum Master', description: 'Complete 15 habits in a row', icon: '🌀', requirement: 15, type: 'combo', xpReward: 400 },
  { id: 'combo_20', name: 'Twenty Streak', description: 'Complete 20 habits in a row', icon: '🎯', requirement: 20, type: 'combo', xpReward: 600 },
  { id: 'combo_25', name: 'On a Roll', description: 'Complete 25 habits in a row', icon: '🎳', requirement: 25, type: 'combo', xpReward: 800 },
  { id: 'combo_30', name: 'Combo God', description: 'Complete 30 habits in a row', icon: '⚡', requirement: 30, type: 'combo', xpReward: 1000 },
  { id: 'combo_50', name: 'Half Century Combo', description: 'Complete 50 habits in a row', icon: '🔥', requirement: 50, type: 'combo', xpReward: 2000 },
  { id: 'combo_75', name: 'Combo Legend', description: 'Complete 75 habits in a row', icon: '🌟', requirement: 75, type: 'combo', xpReward: 3500 },
  { id: 'combo_100', name: 'Century Combo', description: 'Complete 100 habits in a row', icon: '💯', requirement: 100, type: 'combo', xpReward: 5000 },
  
  // ═══════════════════════════════════════════════════════════════
  // 📊 LEVEL ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════════
  { id: 'level_5', name: 'Level 5', description: 'Reach level 5', icon: '⭐', requirement: 5, type: 'special', xpReward: 100 },
  { id: 'level_10', name: 'Level 10', description: 'Reach level 10', icon: '🌟', requirement: 10, type: 'special', xpReward: 250 },
  { id: 'level_15', name: 'Level 15', description: 'Reach level 15', icon: '✨', requirement: 15, type: 'special', xpReward: 400 },
  { id: 'level_20', name: 'Level 20', description: 'Reach level 20', icon: '🌠', requirement: 20, type: 'special', xpReward: 600 },
  { id: 'level_25', name: 'Level 25', description: 'Reach level 25', icon: '💫', requirement: 25, type: 'special', xpReward: 1000 },
  { id: 'level_30', name: 'Level 30', description: 'Reach level 30', icon: '🔮', requirement: 30, type: 'special', xpReward: 1500 },
  { id: 'level_40', name: 'Level 40', description: 'Reach level 40', icon: '🏅', requirement: 40, type: 'special', xpReward: 2500 },
  { id: 'level_50', name: 'Level 50', description: 'Reach level 50', icon: '🥇', requirement: 50, type: 'special', xpReward: 5000 },
  { id: 'level_60', name: 'Level 60', description: 'Reach level 60', icon: '🎖️', requirement: 60, type: 'special', xpReward: 7500 },
  { id: 'level_75', name: 'Level 75', description: 'Reach level 75', icon: '🏆', requirement: 75, type: 'special', xpReward: 12500 },
  { id: 'level_100', name: 'Level 100', description: 'Reach level 100', icon: '👑', requirement: 100, type: 'special', xpReward: 25000 },
  { id: 'level_150', name: 'Level 150', description: 'Reach level 150', icon: '💎', requirement: 150, type: 'special', xpReward: 50000 },
  { id: 'level_200', name: 'Level 200', description: 'Reach level 200', icon: '🌈', requirement: 200, type: 'special', xpReward: 100000 },
  { id: 'level_300', name: 'Level 300', description: 'Reach level 300', icon: '🔱', requirement: 300, type: 'special', xpReward: 200000 },
  { id: 'level_500', name: 'Level 500', description: 'Reach level 500', icon: '⚜️', requirement: 500, type: 'special', xpReward: 500000 },
  { id: 'level_1000', name: 'Level 1000', description: 'Reach level 1000', icon: '🌌', requirement: 1000, type: 'special', xpReward: 1000000 },
  
  // ═══════════════════════════════════════════════════════════════
  // 🎪 SPECIAL ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════════
  { id: 'night_owl', name: 'Night Owl', description: 'Complete a habit after 10 PM', icon: '🦉', requirement: 1, type: 'special', xpReward: 100 },
  { id: 'early_bird', name: 'Early Bird', description: 'Complete a habit before 6 AM', icon: '🐦', requirement: 1, type: 'special', xpReward: 100 },
  { id: 'perfect_day', name: 'Perfect Day', description: 'Complete all habits in one day', icon: '✨', requirement: 1, type: 'special', xpReward: 200 },
  { id: 'perfect_week', name: 'Perfect Week', description: 'Complete all habits for 7 days straight', icon: '🌟', requirement: 7, type: 'special', xpReward: 1000 },
  { id: 'weekend_warrior', name: 'Weekend Warrior', description: 'Complete habits on a weekend', icon: '🎉', requirement: 1, type: 'special', xpReward: 50 },
  
  // ═══════════════════════════════════════════════════════════════
  // 📅 HABIT COUNT ACHIEVEMENTS (Number of habits tracked)
  // ═══════════════════════════════════════════════════════════════
  { id: 'habits_3', name: 'Triple Tracker', description: 'Track 3 different habits', icon: '3️⃣', requirement: 3, type: 'habits', xpReward: 50 },
  { id: 'habits_5', name: 'High Five', description: 'Track 5 different habits', icon: '🖐️', requirement: 5, type: 'habits', xpReward: 100 },
  { id: 'habits_7', name: 'Lucky Seven', description: 'Track 7 different habits', icon: '🍀', requirement: 7, type: 'habits', xpReward: 150 },
  { id: 'habits_10', name: 'Perfect Ten', description: 'Track 10 different habits', icon: '🔟', requirement: 10, type: 'habits', xpReward: 250 },
  { id: 'habits_15', name: 'Habit Collector', description: 'Track 15 different habits', icon: '📚', requirement: 15, type: 'habits', xpReward: 400 },
  { id: 'habits_20', name: 'Habit Hoarder', description: 'Track 20 different habits', icon: '🗃️', requirement: 20, type: 'habits', xpReward: 600 },
  { id: 'habits_25', name: 'Life Optimizer', description: 'Track 25 different habits', icon: '🎯', requirement: 25, type: 'habits', xpReward: 1000 },
  
  // ═══════════════════════════════════════════════════════════════
  // 🎂 ANNIVERSARY ACHIEVEMENTS (Account age milestones)
  // ═══════════════════════════════════════════════════════════════
  { id: 'anniversary_1month', name: 'One Month In', description: 'Use HabitFlow for 1 month', icon: '📆', requirement: 30, type: 'special', xpReward: 500 },
  { id: 'anniversary_3month', name: 'Quarter Journey', description: 'Use HabitFlow for 3 months', icon: '🗓️', requirement: 90, type: 'special', xpReward: 1500 },
  { id: 'anniversary_6month', name: 'Half Year Mark', description: 'Use HabitFlow for 6 months', icon: '📅', requirement: 180, type: 'special', xpReward: 3000 },
  { id: 'anniversary_1year', name: 'One Year Anniversary', description: 'Use HabitFlow for 1 year', icon: '🎂', requirement: 365, type: 'special', xpReward: 10000 },
  { id: 'anniversary_2year', name: 'Two Year Veteran', description: 'Use HabitFlow for 2 years', icon: '🎊', requirement: 730, type: 'special', xpReward: 25000 },
  { id: 'anniversary_3year', name: 'Three Year Champion', description: 'Use HabitFlow for 3 years', icon: '🏅', requirement: 1095, type: 'special', xpReward: 50000 },
  { id: 'anniversary_5year', name: 'Five Year Legend', description: 'Use HabitFlow for 5 years', icon: '🌟', requirement: 1825, type: 'special', xpReward: 100000 },
  { id: 'anniversary_7year', name: 'Seven Year Sage', description: 'Use HabitFlow for 7 years', icon: '🔮', requirement: 2555, type: 'special', xpReward: 175000 },
  { id: 'anniversary_10year', name: 'Decade of Growth', description: 'Use HabitFlow for 10 years', icon: '💎', requirement: 3650, type: 'special', xpReward: 500000 },
  { id: 'anniversary_15year', name: 'Fifteen Year Faithful', description: 'Use HabitFlow for 15 years', icon: '👑', requirement: 5475, type: 'special', xpReward: 1000000 },
  { id: 'anniversary_20year', name: 'Twenty Year Titan', description: 'Use HabitFlow for 20 years', icon: '🏛️', requirement: 7300, type: 'special', xpReward: 2000000 },
  { id: 'anniversary_25year', name: 'Quarter Century Master', description: 'Use HabitFlow for 25 years', icon: '⚡', requirement: 9125, type: 'special', xpReward: 3500000 },
  { id: 'anniversary_30year', name: 'Thirty Year Oracle', description: 'Use HabitFlow for 30 years', icon: '🌌', requirement: 10950, type: 'special', xpReward: 5000000 },
  { id: 'anniversary_40year', name: 'Forty Year Immortal', description: 'Use HabitFlow for 40 years', icon: '🔱', requirement: 14600, type: 'special', xpReward: 7500000 },
  { id: 'anniversary_50year', name: 'Fifty Year Eternal', description: 'Use HabitFlow for 50 years', icon: '✨', requirement: 18250, type: 'special', xpReward: 10000000 },
  
  // ═══════════════════════════════════════════════════════════════
  // 🎯 XP MILESTONES
  // ═══════════════════════════════════════════════════════════════
  { id: 'xp_1000', name: 'First Thousand', description: 'Earn 1,000 XP', icon: '💰', requirement: 1000, type: 'special', xpReward: 100 },
  { id: 'xp_5000', name: 'Five K Club', description: 'Earn 5,000 XP', icon: '💵', requirement: 5000, type: 'special', xpReward: 500 },
  { id: 'xp_10000', name: 'Ten Thousand', description: 'Earn 10,000 XP', icon: '💴', requirement: 10000, type: 'special', xpReward: 1000 },
  { id: 'xp_25000', name: 'XP Enthusiast', description: 'Earn 25,000 XP', icon: '💶', requirement: 25000, type: 'special', xpReward: 2500 },
  { id: 'xp_50000', name: 'XP Addict', description: 'Earn 50,000 XP', icon: '💷', requirement: 50000, type: 'special', xpReward: 5000 },
  { id: 'xp_100000', name: 'XP Millionaire', description: 'Earn 100,000 XP', icon: '💎', requirement: 100000, type: 'special', xpReward: 10000 },
  { id: 'xp_250000', name: 'XP Mogul', description: 'Earn 250,000 XP', icon: '🏦', requirement: 250000, type: 'special', xpReward: 25000 },
  { id: 'xp_500000', name: 'XP Tycoon', description: 'Earn 500,000 XP', icon: '🏰', requirement: 500000, type: 'special', xpReward: 50000 },
  { id: 'xp_1000000', name: 'XP Billionaire', description: 'Earn 1,000,000 XP', icon: '👸', requirement: 1000000, type: 'special', xpReward: 100000 },
  { id: 'xp_5000000', name: 'XP Emperor', description: 'Earn 5,000,000 XP', icon: '👑', requirement: 5000000, type: 'special', xpReward: 500000 },
  { id: 'xp_10000000', name: 'XP God', description: 'Earn 10,000,000 XP', icon: '🌟', requirement: 10000000, type: 'special', xpReward: 1000000 },
];

// Daily quotes - exported for use in GameContext
export const DAILY_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Your habits will determine your future.", author: "Jack Canfield" },
  { text: "Champions keep playing until they get it right.", author: "Billie Jean King" },
  { text: "The harder you work, the luckier you get.", author: "Gary Player" },
  { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
  { text: "Be stronger than your strongest excuse.", author: "Unknown" },
  { text: "Every expert was once a beginner.", author: "Helen Hayes" },
  { text: "Progress, not perfection.", author: "Unknown" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Your only limit is you.", author: "Unknown" },
  { text: "Dream big. Start small. Act now.", author: "Robin Sharma" },
  { text: "One day or day one. You decide.", author: "Unknown" },
  { text: "Make each day your masterpiece.", author: "John Wooden" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "The pain of discipline is nothing like the pain of disappointment.", author: "Justin Langer" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Today's actions are tomorrow's results.", author: "Unknown" },
  { text: "Consistency is key. Keep showing up.", author: "Unknown" },
  { text: "Little by little, a little becomes a lot.", author: "Tanzanian Proverb" },
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
];

// Note: createGameStore is deprecated - GameContext now handles all game logic with Supabase
