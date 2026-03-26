import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../supabase';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/signup — 注册
router.post('/signup', async (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: '请提供邮箱和密码' });
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for dev
      user_metadata: { display_name: displayName || email.split('@')[0] },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Sign in immediately after signup
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return res.status(400).json({ error: signInError.message });
    }

    return res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        displayName: data.user.user_metadata?.display_name || '',
      },
      session: {
        accessToken: signInData.session?.access_token,
        refreshToken: signInData.session?.refresh_token,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

// POST /api/auth/login — 登录
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: '请提供邮箱和密码' });
  }

  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // Fetch profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        displayName: profile?.display_name || data.user.user_metadata?.display_name || '',
        avatarUrl: profile?.avatar_url || '',
        focusPoints: profile?.focus_points || 0,
        streakDays: profile?.streak_days || 0,
        isPro: profile?.is_pro || false,
      },
      session: {
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

// POST /api/auth/logout — 登出
router.post('/logout', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  // Supabase stateless JWT — just acknowledge
  return res.json({ message: '已退出登录' });
});

// GET /api/auth/me — 获取当前用户信息
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({ error: '用户资料未找到' });
    }

    return res.json({
      id: profile.id,
      email: req.userEmail,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      focusPoints: profile.focus_points,
      streakDays: profile.streak_days,
      isPro: profile.is_pro,
      createdAt: profile.created_at,
    });
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({ error: '获取用户信息失败' });
  }
});

export default router;
