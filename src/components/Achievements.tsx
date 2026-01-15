import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, Check, Shield } from 'lucide-react';
import { useGame } from '../context/GameContext';

const Achievements: React.FC = () => {
  const { getUnlockedAchievements, getLockedAchievements, gameState } = useGame();
  
  const unlocked = getUnlockedAchievements();
  const locked = getLockedAchievements();

  return (
    <div>
      {/* Stats Summary */}
      <div className="achievements-stats">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card achievement-stat"
        >
          <div className="achievement-stat-value">{unlocked.length}</div>
          <div className="achievement-stat-label">Unlocked</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card achievement-stat"
        >
          <div className="achievement-stat-value">{locked.length}</div>
          <div className="achievement-stat-label">Locked</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card achievement-stat"
        >
          <div className="achievement-stat-value">{gameState.maxCombo}x</div>
          <div className="achievement-stat-label">Best Combo</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card achievement-stat"
        >
          <div className="achievement-stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Shield className="w-5 h-5 text-blue-400" />
            {gameState.streakShields}
          </div>
          <div className="achievement-stat-label">Streak Shields</div>
        </motion.div>
      </div>

      {/* Unlocked Achievements */}
      {unlocked.length > 0 && (
        <div className="achievements-section">
          <h3 className="achievements-section-title">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Unlocked ({unlocked.length})
          </h3>
          <div className="achievements-list">
            {unlocked.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card achievement-card"
              >
                <div className="achievement-icon unlocked">
                  {achievement.icon}
                </div>
                <div className="achievement-info">
                  <div className="achievement-name">{achievement.name}</div>
                  <p className="achievement-desc">{achievement.description}</p>
                  <div className="achievement-xp">+{achievement.xpReward} XP</div>
                </div>
                <Check className="w-5 h-5 text-green-400" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {locked.length > 0 && (
        <div className="achievements-section">
          <h3 className="achievements-section-title" style={{ opacity: 0.6 }}>
            <Lock className="w-5 h-5" />
            Locked ({locked.length})
          </h3>
          <div className="achievements-list">
            {locked.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className="glass-card achievement-card locked"
              >
                <div className="achievement-icon locked">
                  {achievement.icon}
                </div>
                <div className="achievement-info">
                  <div className="achievement-name">{achievement.name}</div>
                  <p className="achievement-desc">{achievement.description}</p>
                  <div className="achievement-xp" style={{ color: 'var(--text-muted)' }}>+{achievement.xpReward} XP</div>
                </div>
                <Lock className="w-4 h-4 text-white/30" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;
