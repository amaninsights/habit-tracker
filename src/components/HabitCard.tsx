import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame, Trash2, MoreVertical, TrendingUp, Zap } from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import { useGame } from '../context/GameContext';
import type { Habit } from '../store/habitStore';

interface HabitCardProps {
  habit: Habit;
}

const colorClasses = {
  purple: { bg: 'gradient-purple', glow: 'glow-purple', light: 'bg-purple-500/20' },
  pink: { bg: 'gradient-pink', glow: 'glow-pink', light: 'bg-pink-500/20' },
  blue: { bg: 'gradient-blue', glow: 'glow-blue', light: 'bg-blue-500/20' },
  green: { bg: 'gradient-green', glow: 'glow-green', light: 'bg-green-500/20' },
  orange: { bg: 'gradient-orange', glow: 'glow-orange', light: 'bg-orange-500/20' },
  teal: { bg: 'gradient-teal', glow: 'glow-teal', light: 'bg-teal-500/20' },
};

const HabitCard: React.FC<HabitCardProps> = ({ habit }) => {
  const { habits, toggleHabitCompletion, deleteHabit, getHabitCompletionRate, getTotalCompletionsToday, wasCompletedToday, markAsRewarded, unmarkAsRewarded, getRewardedXP, getRewardedAchievements } = useHabits();
  const { recordCompletion, revertCompletion, triggerConfetti } = useGame();
  const [showMenu, setShowMenu] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [xpPopup, setXpPopup] = useState<number | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.completedDates.includes(today);
  const completionRate = getHabitCompletionRate(habit.id, 7);
  const colors = colorClasses[habit.color];

  const handleToggle = async () => {
    if (!isCompletedToday) {
      // Completing the habit
      setIsAnimating(true);
      
      // Only give XP/achievements if this habit wasn't already rewarded today
      const alreadyRewarded = wasCompletedToday(habit.id);
      
      if (!alreadyRewarded) {
        // Record in game system - this handles XP calculation and combo increment
        const completedAfter = getTotalCompletionsToday() + 1;
        const maxStreak = Math.max(...habits.map(h => h.streak), habit.streak + 1);
        const { xpGained, achievements } = await recordCompletion(completedAfter, habits.length, maxStreak);
        
        // Mark as rewarded with the ACTUAL XP gained (returned from recordCompletion)
        markAsRewarded(habit.id, xpGained, achievements.map(a => a.id));
        
        // Show XP popup
        setXpPopup(xpGained);
        setTimeout(() => setXpPopup(null), 1500);
        
        // Confetti on perfect day
        if (completedAfter >= habits.length) {
          triggerConfetti();
        }
      }
      
      // Toggle the completion state
      await toggleHabitCompletion(habit.id, today);
      setTimeout(() => setIsAnimating(false), 600);
    } else {
      // Uncompleting the habit - revert everything (XP, combo, achievements)
      const xpToRemove = getRewardedXP(habit.id);
      const achievementsToRevoke = getRewardedAchievements(habit.id);
      
      if (xpToRemove > 0 || achievementsToRevoke.length > 0) {
        await revertCompletion(xpToRemove, achievementsToRevoke);
      }
      unmarkAsRewarded(habit.id);
      await toggleHabitCompletion(habit.id, today);
    }
  };

  const handleDelete = () => {
    deleteHabit(habit.id);
    setShowMenu(false);
  };

  // Get last 7 days for mini calendar
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, x: -50 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`glass-card habit-card relative overflow-hidden ${isAnimating ? 'celebrate' : ''}`}
    >
      {/* XP Popup */}
      <AnimatePresence>
        {xpPopup && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -30, scale: 1 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute top-2 right-2 z-50 flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold shadow-lg"
            style={{ boxShadow: '0 0 20px rgba(251, 191, 36, 0.6)' }}
          >
            <Zap className="w-4 h-4" />
            +{xpPopup} XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion glow effect */}
      <AnimatePresence>
        {isCompletedToday && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`absolute inset-0 ${colors.bg} opacity-[0.08]`}
          />
        )}
      </AnimatePresence>

      <div className="relative flex items-start gap-4">
        {/* Check Button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleToggle}
          onTouchEnd={e => { e.preventDefault(); handleToggle(); }}
          className={`habit-icon-btn relative transition-all duration-300 ${
            isCompletedToday
              ? `${colors.bg} ${colors.glow}`
              : 'bg-white/[0.06] border-2 border-white/15 hover:border-white/30 hover:bg-white/[0.08]'
          }`}
          style={{ touchAction: 'manipulation', pointerEvents: 'auto', userSelect: 'none', zIndex: 100 }}
        >
          <AnimatePresence mode="wait">
            {isCompletedToday ? (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Check className="w-7 h-7 text-white" strokeWidth={3} />
              </motion.div>
            ) : (
              <motion.span
                key="icon"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-2xl"
              >
                {habit.icon}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Content */}
        <div className="habit-content">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="habit-title truncate">{habit.name}</h3>
              {habit.description && (
                <p className="habit-description truncate mt-0.5">{habit.description}</p>
              )}
            </div>

            {/* Menu Button */}
            <div className="relative flex-shrink-0">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-white/40" />
              </motion.button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 glass-card p-2 z-50 min-w-[160px]"
                  >
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all text-base font-semibold border border-red-500/30"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete Habit
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {/* Streak */}
            {habit.streak > 0 && (
              <div className="streak-badge">
                <Flame className="w-3 h-3" />
                <span>{habit.streak} day{habit.streak > 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Completion Rate */}
            <div className="flex items-center gap-1.5 text-xs text-white/45 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{completionRate}% this week</span>
            </div>
          </div>

          {/* Mini Calendar */}
          <div className="mini-calendar mt-4">
            {last7Days.map((date, i) => {
              const isCompleted = habit.completedDates.includes(date);
              const isToday = date === today;
              return (
                <motion.div
                  key={date}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  className={`mini-calendar-day ${
                    isCompleted
                      ? `${colors.bg} text-white shadow-sm`
                      : isToday
                      ? 'bg-white/15 text-white ring-2 ring-white/25'
                      : 'bg-white/[0.04] text-white/30'
                  }`}
                >
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(date).getDay()]}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </motion.div>
  );
};

export default HabitCard;
