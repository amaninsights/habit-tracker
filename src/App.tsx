import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HabitProvider } from './context/HabitContext';
import { GameProvider, useGame } from './context/GameContext';
import { 
  Header, HabitList, AddHabitModal, Analytics, 
  Confetti, AchievementToast, LevelUpModal, XPBar, Achievements, HeatMap, AuthScreen 
} from './components';
import { Home, BarChart3, Plus, Menu, X, Sparkles, Trophy, LogOut, Loader2, Users, ChevronLeft } from 'lucide-react';

function UserMenu() {
  const { user, signOut, savedAccounts, removeSavedAccount } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showSwitchAccount, setShowSwitchAccount] = useState(false);

  if (!user) return null;

  const initial = user.email?.charAt(0).toUpperCase() || 'U';
  const otherAccounts = savedAccounts.filter(a => a.email !== user.email);

  const handleSwitchAccount = () => {
    setShowSwitchAccount(true);
  };

  return (
    <div className="user-menu">
      <button onClick={() => setShowMenu(!showMenu)} className="user-avatar">
        {initial}
      </button>
      
      <AnimatePresence>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => { setShowMenu(false); setShowSwitchAccount(false); }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              className="glass-card user-dropdown"
            >
              {!showSwitchAccount ? (
                <>
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-avatar">{initial}</div>
                    <span className="truncate text-sm text-white/80" style={{ maxWidth: 150 }}>{user.email}</span>
                  </div>
                  <div className="user-dropdown-divider" />
                  {otherAccounts.length > 0 && (
                    <button onClick={handleSwitchAccount} className="user-dropdown-item">
                      <Users className="w-4 h-4" />
                      Switch Account ({otherAccounts.length})
                    </button>
                  )}
                  <button onClick={() => { signOut(); setShowMenu(false); }} className="user-dropdown-item danger">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div className="user-dropdown-header-small">
                    <button onClick={() => setShowSwitchAccount(false)} className="back-btn">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium text-white/90">Switch Account</span>
                  </div>
                  <div className="user-dropdown-divider" />
                  {otherAccounts.map(account => (
                    <div key={account.email} className="saved-account-row">
                      <button 
                        onClick={async () => { 
                          await signOut(); 
                          setShowMenu(false); 
                          setShowSwitchAccount(false);
                        }} 
                        className="saved-account-btn"
                      >
                        <div className="saved-account-avatar">
                          {account.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate text-sm" style={{ maxWidth: 120 }}>{account.email}</span>
                      </button>
                      <button 
                        onClick={() => removeSavedAccount(account.email)} 
                        className="remove-account-btn"
                        title="Remove account"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={async () => { 
                      await signOut(); 
                      setShowMenu(false); 
                      setShowSwitchAccount(false);
                    }} 
                    className="user-dropdown-item add-account"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Account
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'achievements'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { confettiActive, newAchievement, clearNewAchievement } = useGame();

  return (
    <div className="app-wrapper">
      {/* Background Effects */}
      <div className="aurora-bg" aria-hidden="true" />
      <div className="grid-overlay" aria-hidden="true" />

      {/* Confetti & Toasts */}
      <Confetti active={confettiActive} />
      <AchievementToast achievement={newAchievement} onClose={clearNewAchievement} />
      <LevelUpModal />

      {/* Navigation Bar */}
      <header className="navbar">
        <div className="navbar-content">
          {/* Logo */}
          <div className="logo">
            <div className="logo-icon">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="logo-text">HabitFlow</span>
          </div>

          {/* Desktop Nav */}
          <nav className="desktop-nav">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`nav-btn ${activeTab === 'achievements' ? 'active' : ''}`}
            >
              <Trophy className="w-4 h-4" />
              <span>Achievements</span>
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <UserMenu />
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-menu-btn"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mobile-nav"
            >
              <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                className={`mobile-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}>
                <Home className="w-5 h-5" /> Dashboard
              </button>
              <button onClick={() => { setActiveTab('analytics'); setIsMobileMenuOpen(false); }}
                className={`mobile-nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}>
                <BarChart3 className="w-5 h-5" /> Analytics
              </button>
              <button onClick={() => { setActiveTab('achievements'); setIsMobileMenuOpen(false); }}
                className={`mobile-nav-btn ${activeTab === 'achievements' ? 'active' : ''}`}>
                <Trophy className="w-5 h-5" /> Achievements
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="page"
            >
              {/* XP Bar */}
              <XPBar />
              
              {/* Stats Row - Mobile */}
              <div className="mobile-stats">
                <Header />
              </div>

              {/* Two Column Layout for Desktop */}
              <div className="dashboard-layout">
                {/* Sidebar - Desktop */}
                <aside className="sidebar">
                  <Header />
                  <div className="sidebar-heatmap">
                    <HeatMap />
                  </div>
                </aside>

                {/* Main Area */}
                <div className="habits-area">
                  <div className="page-title">
                    <h1>My Habits</h1>
                    <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <HabitList onAddClick={() => setIsModalOpen(true)} />
                  
                  {/* Heatmap for mobile/tablet */}
                  <div className="mobile-heatmap">
                    <HeatMap />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="page"
            >
              <div className="page-title">
                <h1>📊 Analytics</h1>
                <p>Track your progress</p>
              </div>
              <Analytics />
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="page"
            >
              <div className="page-title">
                <h1>🏆 Achievements</h1>
                <p>Your rewards</p>
              </div>
              <Achievements />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FAB - Bottom Right */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        className="fab-button"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Modal */}
      <AddHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="app-wrapper">
      <div className="aurora-bg" />
      <div className="grid-overlay" />
      <div className="auth-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="auth-logo">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-white/60">Loading...</p>
        </motion.div>
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <HabitProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </HabitProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
