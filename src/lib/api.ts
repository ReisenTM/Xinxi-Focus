// 心隙专注 API 服务层
const API_BASE = '/api';

// Token management
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    localStorage.setItem('focus_access_token', token);
  } else {
    localStorage.removeItem('focus_access_token');
  }
}

export function getAccessToken(): string | null {
  if (!accessToken) {
    accessToken = localStorage.getItem('focus_access_token');
  }
  return accessToken;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: '请求失败' }));
    throw new Error(errorData.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ===== Auth API =====

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    focusPoints?: number;
    streakDays?: number;
    isPro?: boolean;
  };
  session: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  focusPoints: number;
  streakDays: number;
  isPro: boolean;
  createdAt?: string;
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'local-user',
  email: 'local@focus.app',
  displayName: '专注于者',
  avatarUrl: '',
  focusPoints: 0,
  streakDays: 0,
  isPro: true,
  createdAt: new Date().toISOString(),
};

export const authApi = {
  sendCode: async (email: string) => ({ message: '验证码已发送', expiresIn: 300 }),
  signup: async (email: string, pass: string, code: string, displayName?: string) => {
    const user = { ...DEFAULT_PROFILE, email, displayName: displayName || email.split('@')[0] };
    localStorage.setItem('focus_local_profile', JSON.stringify(user));
    return { user, session: { accessToken: 'mock', refreshToken: 'mock' } };
  },
  login: async (email: string, pass: string) => {
    const saved = localStorage.getItem('focus_local_profile');
    const user = saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    return { user, session: { accessToken: 'mock', refreshToken: 'mock' } };
  },
  logout: async () => ({ message: '已登出' }),
  getMe: async () => {
    const saved = localStorage.getItem('focus_local_profile');
    const avatar = localStorage.getItem('focus_local_avatar');
    const user = saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    if (avatar) user.avatarUrl = avatar;
    return user;
  },
};

// ===== Sessions API =====

export interface FocusSession {
  id: string;
  duration: number;
  type: string;
  completedAt: string;
  date: string;
  time: string;
  fullDate: string;
}

export interface SessionsResponse {
  sessions: FocusSession[];
  stats: {
    todayTotalSeconds: number;
    todayCount: number;
    weeklyData: Record<string, number>;
    trendPercentage: number;
  };
}

export interface CreateSessionResponse {
  session: FocusSession;
  pointsEarned: number;
}

export const sessionsApi = {
  list: async (params?: { limit?: number; offset?: number; type?: string }) => {
    const savedSessions = localStorage.getItem('focus_offline_sessions');
    const sessions: FocusSession[] = savedSessions ? JSON.parse(savedSessions) : [];
    const savedStats = localStorage.getItem('focus_offline_stats');
    const stats = savedStats ? JSON.parse(savedStats) : {
      todayTotalSeconds: 0,
      todayCount: 0,
      weeklyData: {},
      trendPercentage: 0
    };
    
    let filtered = sessions;
    if (params?.type && params.type !== 'all') {
      filtered = sessions.filter(s => s.type === params.type);
    }
    
    return {
      sessions: filtered.slice(params?.offset || 0, (params?.offset || 0) + (params?.limit || 50)),
      stats
    };
  },

  create: async (duration: number, type: string) => {
    const now = new Date();
    const session: FocusSession = {
      id: Math.random().toString(36).substr(2, 9),
      duration,
      type,
      completedAt: now.toISOString(),
      date: '今天',
      time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      fullDate: now.toISOString(),
    };

    const saved = localStorage.getItem('focus_offline_sessions');
    const sessions = saved ? JSON.parse(saved) : [];
    const newSessions = [session, ...sessions];
    localStorage.setItem('focus_offline_sessions', JSON.stringify(newSessions));

    // Update stats
    const savedStats = localStorage.getItem('focus_offline_stats');
    const stats = savedStats ? JSON.parse(savedStats) : { todayTotalSeconds: 0, todayCount: 0, weeklyData: {}, trendPercentage: 0 };
    
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let dayIndex = now.getDay() - 1;
    if (dayIndex < 0) dayIndex = 6;
    const dayKey = dayNames[dayIndex];

    const newStats = {
      ...stats,
      todayTotalSeconds: stats.todayTotalSeconds + duration,
      todayCount: stats.todayCount + 1,
      weeklyData: {
        ...stats.weeklyData,
        [dayKey]: (stats.weeklyData[dayKey] || 0) + duration,
      }
    };
    localStorage.setItem('focus_offline_stats', JSON.stringify(newStats));

    return { session, pointsEarned: Math.floor(duration / 60) };
  },
};

// ===== Profile API =====

export const profileApi = {
  get: () => authApi.getMe(),

  update: async (data: { displayName?: string; avatarUrl?: string }) => {
    const user = await authApi.getMe();
    const updated = { ...user, ...data };
    localStorage.setItem('focus_local_profile', JSON.stringify(updated));
    if (data.avatarUrl) {
      localStorage.setItem('focus_local_avatar', data.avatarUrl);
    }
    return updated;
  },
};

// ===== Achievements API =====

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  total: number;
  progress: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface AchievementsResponse {
  achievements: Achievement[];
  totalCount: number;
  unlockedCount: number;
}

export const achievementsApi = {
  list: async () => {
    // Return all achievements as unlocked or with progress for testing in free version
    return {
      achievements: [
        { id: 'streak_5', title: '静心者', description: '连续专注 5 天', icon: 'emoji_events', total: 5, progress: 2, unlocked: false, unlockedAt: null },
        { id: 'focus_60min', title: '专注大师', description: '单次专注 60 分钟', icon: 'workspace_premium', total: 1, progress: 1, unlocked: true, unlockedAt: new Date().toISOString() },
        { id: 'night_owl', title: '夜猫子', description: '在午夜后专注', icon: 'nightlight', total: 1, progress: 0, unlocked: false, unlockedAt: null },
      ],
      totalCount: 12,
      unlockedCount: 1
    };
  },
};
