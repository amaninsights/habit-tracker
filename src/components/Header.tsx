import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Target, Zap } from 'lucide-react';
import { useHabits } from '../context/HabitContext';

const Header: React.FC = () => {
  const { habits, getTotalCompletionsToday } = useHabits();
  const completedToday = getTotalCompletionsToday();
  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
  const completionRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

  const stats = [
    { icon: Target, label: 'Today', value: `${completedToday}/${habits.length}`, color: 'from-blue-400 to-cyan-400' },
    { icon: Flame, label: 'Streak', value: totalStreak, color: 'from-orange-400 to-red-400' },
    { icon: Zap, label: 'Rate', value: `${completionRate}%`, color: 'from-yellow-400 to-orange-400' },
    { icon: Trophy, label: 'Best', value: Math.max(...habits.map(h => h.bestStreak), 0), color: 'from-purple-400 to-pink-400' },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="glass-card stat-card"
        >
          <div className={`stat-icon bg-gradient-to-br ${stat.color}`}>
            <stat.icon className="text-white" strokeWidth={2} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Header;
