import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, setAccessToken, getAccessToken, UserProfile } from '../lib/api';

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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      authApi.getMe()
        .then(profile => {
          setUser(profile);
        })
        .catch(() => {
          setAccessToken(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    setAccessToken(result.session.accessToken);
    setUser({
      id: result.user.id,
      email: result.user.email,
      displayName: result.user.displayName,
      avatarUrl: result.user.avatarUrl || '',
      focusPoints: result.user.focusPoints || 0,
      streakDays: result.user.streakDays || 0,
      isPro: result.user.isPro || false,
    });
  };

  const signup = async (email: string, password: string, verificationCode: string, displayName?: string) => {
    const result = await authApi.signup(email, password, verificationCode, displayName);
    setAccessToken(result.session.accessToken);
    setUser({
      id: result.user.id,
      email: result.user.email,
      displayName: result.user.displayName,
      avatarUrl: result.user.avatarUrl || '',
      focusPoints: result.user.focusPoints || 0,
      streakDays: result.user.streakDays || 0,
      isPro: result.user.isPro || false,
    });
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    setAccessToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const profile = await authApi.getMe();
      setUser(profile);
    } catch {
      // Ignore errors
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
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
