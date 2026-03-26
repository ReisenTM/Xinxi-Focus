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

export const authApi = {
  sendCode: (email: string) =>
    request<{ message: string; expiresIn: number }>('/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  signup: (email: string, password: string, verificationCode: string, displayName?: string) =>
    request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, verificationCode, displayName }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request<{ message: string }>('/auth/logout', { method: 'POST' }),

  getMe: () =>
    request<UserProfile>('/auth/me'),
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
  };
}

export interface CreateSessionResponse {
  session: FocusSession;
  pointsEarned: number;
}

export const sessionsApi = {
  list: (params?: { limit?: number; offset?: number; type?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    if (params?.type) searchParams.set('type', params.type);
    const query = searchParams.toString();
    return request<SessionsResponse>(`/sessions${query ? `?${query}` : ''}`);
  },

  create: (duration: number, type: string) =>
    request<CreateSessionResponse>('/sessions', {
      method: 'POST',
      body: JSON.stringify({ duration, type }),
    }),
};

// ===== Profile API =====

export const profileApi = {
  get: () =>
    request<UserProfile>('/profile'),

  update: (data: { displayName?: string; avatarUrl?: string }) =>
    request<UserProfile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
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
  list: () =>
    request<AchievementsResponse>('/achievements'),
};
