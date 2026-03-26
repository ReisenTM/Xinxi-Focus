import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { TopNav, BottomNav } from './components/Navigation';
import { FocusScreen } from './screens/FocusScreen';
import { StatsScreen } from './screens/StatsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SubscriptionScreen } from './screens/SubscriptionScreen';
import { AchievementsScreen } from './screens/AchievementsScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { LoginScreen } from './screens/LoginScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { sessionsApi, FocusSession } from './lib/api';

function AppContent() {
  const { isLoggedIn, isLoading, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState('focus');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsInitialView, setSettingsInitialView] = useState<'main' | 'version' | 'help' | 'terms' | 'privacy'>('main');
  const [showSubscription, setShowSubscription] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [stats, setStats] = useState({
    todayTotalSeconds: 0,
    todayCount: 0,
    weeklyData: {} as Record<string, number>,
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load sessions when logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadSessions();
    } else {
      setSessions([]);
      setStats({ todayTotalSeconds: 0, todayCount: 0, weeklyData: {} });
    }
  }, [isLoggedIn]);

  const loadSessions = async () => {
    try {
      const data = await sessionsApi.list({ limit: 50 });
      setSessions(data.sessions);
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  const handleFocusComplete = async (duration: number, type: string) => {
    if (isLoggedIn) {
      try {
        const result = await sessionsApi.create(duration, type);
        setSessions(prev => [result.session, ...prev]);
        // Refresh stats
        loadSessions();
      } catch (err) {
        console.error('Failed to save session:', err);
      }
    }
  };

  const handleLogout = () => {
    logout();
    setShowAchievements(false);
    setShowHistory(false);
    setActiveTab('focus');
  };

  const handleTabChange = (tab: string) => {
    if (!isLoggedIn && (tab === 'stats' || tab === 'profile')) {
      setShowLogin(true);
      return;
    }
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-fixed-dim">
      <div className="flex flex-col h-screen">
        <TopNav onOpenSettings={() => setShowSettings(true)} />
        
        <main className="flex-1 relative overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'focus' && (
              <FocusScreen 
                key="focus" 
                onComplete={handleFocusComplete}
                isLoggedIn={isLoggedIn}
                todayTotalSeconds={stats.todayTotalSeconds}
                todayCount={stats.todayCount}
              />
            )}
            {activeTab === 'stats' && isLoggedIn && (
              <StatsScreen 
                key="stats" 
                sessions={sessions}
                stats={stats}
                onViewAllAchievements={() => setShowAchievements(true)}
                onViewAllHistory={() => setShowHistory(true)}
              />
            )}
            {activeTab === 'profile' && isLoggedIn && (
              <ProfileScreen 
                key="profile" 
                onLogout={handleLogout}
                onOpenSubscription={() => setShowSubscription(true)}
              />
            )}
          </AnimatePresence>
        </main>

        <BottomNav activeTab={activeTab} onChangeTab={handleTabChange} />
      </div>

      <AnimatePresence>
        {showLogin && (
          <LoginScreen 
            key="login"
            onLogin={() => {
              setShowLogin(false);
            }} 
            onOpenSettings={(view) => {
              setSettingsInitialView(view || 'main');
              setShowSettings(true);
            }}
            onClose={() => setShowLogin(false)}
          />
        )}

        {showSettings && (
          <SettingsScreen 
            key="settings" 
            onBack={() => {
              setShowSettings(false);
              setSettingsInitialView('main');
            }} 
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onLogout={handleLogout}
            isLoggedIn={isLoggedIn}
            initialView={settingsInitialView}
          />
        )}

        {showSubscription && (
          <SubscriptionScreen 
            key="subscription" 
            onBack={() => setShowSubscription(false)} 
          />
        )}
        
        {showAchievements && (
          <AchievementsScreen 
            key="achievements" 
            onBack={() => setShowAchievements(false)} 
          />
        )}
        {showHistory && (
          <HistoryScreen 
            key="history" 
            sessions={sessions}
            onBack={() => setShowHistory(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
