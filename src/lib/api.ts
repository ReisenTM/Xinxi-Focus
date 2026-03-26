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
  displayName: '专注者',
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
    const savedSessions = localStorage.getItem('focus_offline_sessions');
    const sessions: FocusSession[] = savedSessions ? JSON.parse(savedSessions) : [];
    
    // 1. 连续专注天数 (静心者 - streak_5)
    // 获取所有唯一日期并排序
    const dates = Array.from(new Set(sessions.map(s => s.fullDate.split('T')[0]))).sort();
    let maxStreak = 0;
    let currentStreak = 0;
    if (dates.length > 0) {
      currentStreak = 1;
      maxStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const d1 = new Date(dates[i-1]);
        const d2 = new Date(dates[i]);
        const diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
        maxStreak = Math.max(maxStreak, currentStreak);
      }
    }

    // 2. 单次最长时长 (专注大师 - focus_60min)
    const longestSession = sessions.length > 0 ? Math.max(...sessions.map(s => s.duration)) : 0;
    const focus60Progress = longestSession >= 3600 ? 1 : 0;

    // 3. 夜猫子 (night_owl)
    const hasNightFocus = sessions.some(s => {
      const hour = new Date(s.completedAt).getHours();
      return hour >= 0 && hour < 5;
    });

    const achievements: Achievement[] = [
      { 
        id: 'streak_5', 
        title: '静心者', 
        description: '连续专注 5 天', 
        icon: 'emoji_events', 
        total: 5, 
        progress: Math.min(maxStreak, 5), 
        unlocked: maxStreak >= 5, 
        unlockedAt: null 
      },
      { 
        id: 'focus_60min', 
        title: '专注大师', 
        description: '单次专注 60 分钟', 
        icon: 'workspace_premium', 
        total: 1, 
        progress: focus60Progress, 
        unlocked: focus60Progress >= 1, 
        unlockedAt: focus60Progress >= 1 ? new Date().toISOString() : null 
      },
      { 
        id: 'night_owl', 
        title: '夜猫子', 
        description: '在午夜后专注', 
        icon: 'nightlight', 
        total: 1, 
        progress: hasNightFocus ? 1 : 0, 
        unlocked: hasNightFocus, 
        unlockedAt: hasNightFocus ? new Date().toISOString() : null 
      },
    ];

    return {
      achievements,
      totalCount: achievements.length,
      unlockedCount: achievements.filter(a => a.unlocked).length
    };
  },
};
