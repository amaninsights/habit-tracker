import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Volume2, VolumeX } from 'lucide-react';
import { useGame } from '../context/GameContext';

const XPBar: React.FC = () => {
  const { getLevel, getLevelTitle, getXPProgress, gameState, toggleSound } = useGame();
  const level = getLevel();
  const title = getLevelTitle();
  const progress = getXPProgress();

  return (
    <div className="glass-card xp-bar-container">
      <div className="xp-header">
        <div className="xp-level">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="xp-level-badge"
          >
            {level}
          </motion.div>
          <div className="xp-level-text">
            <strong>{title}</strong>
            <span>{gameState.xp.toLocaleString()} Total XP</span>
          </div>
        </div>
        
        <div className="xp-controls">
          {/* Combo indicator */}
          {gameState.currentCombo > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="combo-badge"
            >
              <Zap className="w-3 h-3" />
              {gameState.currentCombo}x COMBO
            </motion.div>
          )}
          
          {/* Sound toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleSound}
            className="sound-toggle"
          >
            {gameState.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </div>
      
      {/* XP Progress Bar */}
      <div className="xp-progress">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress.percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="xp-progress-bar"
        />
      </div>
      
      <div className="xp-progress-text">
        <span>{progress.current} XP</span>
        <span>{progress.required} XP to Level {level + 1}</span>
      </div>
    </div>
  );
};

export default XPBar;
