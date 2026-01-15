import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import HabitCard from './HabitCard';
import { useHabits } from '../context/HabitContext';

interface HabitListProps {
  onAddClick: () => void;
}

const HabitList: React.FC<HabitListProps> = ({ onAddClick }) => {
  const { habits } = useHabits();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  if (habits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="glass-card empty-state"
      >
        <motion.div
          animate={{ 
            rotate: [0, 8, -8, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="empty-state-icon"
        >
          🌱
        </motion.div>
        <h3>Start Your Journey</h3>
        <p>Create your first habit and begin building a better you!</p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAddClick}
          className="empty-state-btn"
        >
          <Sparkles className="w-5 h-5" />
          Add Your First Habit
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="habit-list"
    >
      <AnimatePresence mode="popLayout">
        {habits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default HabitList;
