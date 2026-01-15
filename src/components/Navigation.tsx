import React from 'react';
import { motion } from 'framer-motion';
import { Home, BarChart3, Plus } from 'lucide-react';

interface NavigationProps {
  activeTab: 'dashboard' | 'analytics';
  onTabChange: (tab: 'dashboard' | 'analytics') => void;
  onAddClick: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, onAddClick }) => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="fixed bottom-0 left-0 right-0 z-40 bottom-nav p-4"
    >
      <div className="glass-card flex items-center justify-around py-3 px-4 max-w-md mx-auto">
        {/* Dashboard Tab */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => onTabChange('dashboard')}
          className={`nav-item relative ${
            activeTab === 'dashboard'
              ? 'text-white'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          {activeTab === 'dashboard' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 gradient-purple rounded-xl"
              initial={false}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Home className="w-5 h-5 relative z-10" strokeWidth={2} />
          <span className="nav-item-label relative z-10">Home</span>
        </motion.button>

        {/* Add Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onAddClick}
          className="add-button gradient-purple"
        >
          <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
        </motion.button>

        {/* Analytics Tab */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => onTabChange('analytics')}
          className={`nav-item relative ${
            activeTab === 'analytics'
              ? 'text-white'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          {activeTab === 'analytics' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 gradient-purple rounded-xl"
              initial={false}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <BarChart3 className="w-5 h-5 relative z-10" strokeWidth={2} />
          <span className="nav-item-label relative z-10">Stats</span>
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navigation;
