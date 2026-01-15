import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import type { Habit } from '../store/habitStore';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const icons = ['💪', '📚', '🧘', '💧', '🏃', '🍎', '💤', '✍️', '🎯', '🌱', '🎨', '🎵', '💊', '🚶', '🧠'];

const colors: Array<{ name: Habit['color']; class: string }> = [
  { name: 'purple', class: 'gradient-purple' },
  { name: 'pink', class: 'gradient-pink' },
  { name: 'blue', class: 'gradient-blue' },
  { name: 'green', class: 'gradient-green' },
  { name: 'orange', class: 'gradient-orange' },
  { name: 'teal', class: 'gradient-teal' },
];

const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose }) => {
  const { addHabit } = useHabits();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('💪');
  const [selectedColor, setSelectedColor] = useState<Habit['color']>('purple');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addHabit({
      name: name.trim(),
      description: description.trim(),
      icon: selectedIcon,
      color: selectedColor,
      frequency: 'daily',
      targetDays: [0, 1, 2, 3, 4, 5, 6],
    });

    // Reset form
    setName('');
    setDescription('');
    setSelectedIcon('💪');
    setSelectedColor('purple');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="modal-header">
              <h2>
                <span className="text-xl">✨</span>
                New Habit
              </h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="modal-close"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Scrollable Body */}
            <div className="modal-body">
              <form onSubmit={handleSubmit} id="habit-form">
                {/* Habit Name */}
                <div className="form-group">
                  <label className="form-label">Habit Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Morning Workout"
                    className="form-input"
                    required
                  />
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Description (optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., 30 minutes of exercise"
                    className="form-input"
                  />
                </div>

                {/* Icon Selection */}
                <div className="form-group">
                  <label className="form-label">Choose Icon</label>
                  <div className="icon-grid">
                    {icons.map((icon) => (
                      <motion.button
                        key={icon}
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedIcon(icon)}
                        className={`icon-option ${selectedIcon === icon ? 'selected' : ''}`}
                      >
                        {icon}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="form-group">
                  <label className="form-label">Choose Color</label>
                  <div className="color-grid">
                    {colors.map((color) => (
                      <motion.button
                        key={color.name}
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedColor(color.name)}
                        className={`color-option ${color.class} ${selectedColor === color.name ? 'selected' : ''}`}
                      />
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <motion.button
                type="submit"
                form="habit-form"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="btn-submit"
              >
                Create Habit ✨
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddHabitModal;
