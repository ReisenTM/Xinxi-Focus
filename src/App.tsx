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
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

function AppContent() {
  const { isLoggedIn, isLoading, logout, refreshUser } = useAuth();
  
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: true });
      StatusBar.setStyle({ style: Style.Default });
    }
  }, []);
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
    trendPercentage: 0,
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load sessions when logged in or from local storage when offline
  useEffect(() => {
    if (isLoggedIn) {
      loadSessions();
    } else {
      // Load offline sessions
      try {
        const savedSessions = localStorage.getItem('focus_offline_sessions');
        const savedStats = localStorage.getItem('focus_offline_stats');
        if (savedSessions) setSessions(JSON.parse(savedSessions));
        else setSessions([]);
        
        if (savedStats) setStats(JSON.parse(savedStats));
        else setStats({ todayTotalSeconds: 0, todayCount: 0, weeklyData: {}, trendPercentage: 0 });
      } catch (e) {
        setSessions([]);
        setStats({ todayTotalSeconds: 0, todayCount: 0, weeklyData: {}, trendPercentage: 0 });
      }
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
        // Refresh stats & profile (for points)
        await Promise.all([loadSessions(), refreshUser()]);
      } catch (err) {
        console.error('Failed to save session:', err);
      }
    } else {
      // Offline mode: generate new session
      const now = new Date();
      const newSession: FocusSession = {
        id: Date.now().toString(),
        duration,
        type,
        completedAt: now.toISOString(),
        date: '今天', // Simplified for immediate UI display
        time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
        fullDate: now.toISOString(),
      };

      setSessions(prev => {
        const newSessions = [newSession, ...prev];
        localStorage.setItem('focus_offline_sessions', JSON.stringify(newSessions));
        return newSessions;
      });

      setStats(prev => {
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        let dayIndex = now.getDay() - 1;
        if (dayIndex < 0) dayIndex = 6;
        const dayKey = dayNames[dayIndex];

        const newStats = {
          todayTotalSeconds: prev.todayTotalSeconds + duration,
          todayCount: prev.todayCount + 1,
          trendPercentage: prev.trendPercentage,
          weeklyData: {
            ...prev.weeklyData,
            [dayKey]: (prev.weeklyData[dayKey] || 0) + duration,
          },
        };
        localStorage.setItem('focus_offline_stats', JSON.stringify(newStats));
        return newStats;
      });
    }
  };

  const handleLogout = () => {
    logout();
    setShowAchievements(false);
    setShowHistory(false);
    setActiveTab('focus');
  };

  const handleTabChange = (tab: string) => {
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
            {activeTab === 'stats' && (
              <StatsScreen 
                key="stats" 
                sessions={sessions}
                stats={stats}
                onViewAllAchievements={() => setShowAchievements(true)}
                onViewAllHistory={() => setShowHistory(true)}
              />
            )}
            {activeTab === 'profile' && (
              <ProfileScreen 
                key="profile" 
                onLogout={handleLogout}
                onOpenSubscription={() => {}} // No-op in free version
              />
            )}
          </AnimatePresence>
        </main>

        <BottomNav activeTab={activeTab} onChangeTab={handleTabChange} />
      </div>

      <AnimatePresence>
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
