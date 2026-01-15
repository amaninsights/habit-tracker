import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useGame } from '../context/GameContext';

const DailyQuote: React.FC = () => {
  const { getDailyQuote } = useGame();
  const quote = getDailyQuote();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-5 mb-6 relative overflow-hidden"
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-2xl" />
      
      <div className="relative">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Quote className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white/90 font-medium leading-relaxed italic">
              "{quote.text}"
            </p>
            <p className="text-white/50 text-sm mt-2 font-medium">
              — {quote.author}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyQuote;
