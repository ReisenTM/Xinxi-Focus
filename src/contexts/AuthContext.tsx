import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, profileApi, UserProfile } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, verificationCode: string, displayName?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>({
    id: 'local-user',
    email: 'local@focus.app',
    displayName: '专注于者',
    avatarUrl: localStorage.getItem('focus_local_avatar') || '',
    focusPoints: 0,
    streakDays: 0,
    isPro: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const saved = localStorage.getItem('focus_local_profile');
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const result = await authApi.login(email, password);
    setUser(result.user);
    setIsLoading(false);
  };

  const signup = async (email: string, password: string, verificationCode: string, displayName?: string) => {
    setIsLoading(true);
    const result = await authApi.signup(email, password, verificationCode, displayName);
    setUser(result.user);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  const refreshUser = async () => {
    const updated = await profileApi.get();
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: true, // Always true in this branch
      isLoading,
      login,
      signup,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
