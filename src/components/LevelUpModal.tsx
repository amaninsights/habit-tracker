import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap } from 'lucide-react';
import { useGame } from '../context/GameContext';

const LevelUpModal: React.FC = () => {
  const { levelUpAnimation, clearLevelUp, getLevel, getLevelTitle } = useGame();

  useEffect(() => {
    if (levelUpAnimation) {
      const timer = setTimeout(clearLevelUp, 4000);
      return () => clearTimeout(timer);
    }
  }, [levelUpAnimation, clearLevelUp]);

  return (
    <AnimatePresence>
      {levelUpAnimation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9997] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={clearLevelUp}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Glow rings */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ 
                boxShadow: [
                  '0 0 60px 20px rgba(102, 126, 234, 0.3)',
                  '0 0 100px 40px rgba(240, 147, 251, 0.4)',
                  '0 0 60px 20px rgba(102, 126, 234, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            <div className="glass-card p-8 text-center relative overflow-hidden">
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              />
              
              {/* Stars */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${10 + Math.random() * 80}%`
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 180],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.2,
                    repeat: Infinity
                  }}
                >
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </motion.div>
              ))}
              
              <div className="relative z-10">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center"
                  style={{ boxShadow: '0 0 50px rgba(251, 191, 36, 0.6)' }}
                >
                  <Zap className="w-12 h-12 text-white" strokeWidth={2.5} />
                </motion.div>
                
                <motion.h2
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-3xl font-black mb-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent"
                >
                  LEVEL UP!
                </motion.h2>
                
                <div className="text-6xl font-black text-white mb-2">
                  {getLevel()}
                </div>
                
                <div className="text-lg font-bold text-purple-400 uppercase tracking-wider">
                  {getLevelTitle()}
                </div>
                
                <p className="mt-4 text-white/60 text-sm">
                  Keep going! You're doing amazing! 🚀
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpModal;
