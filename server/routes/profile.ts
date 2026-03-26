import { Router, Response } from 'express';
import { supabaseAdmin } from '../supabase';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// GET /api/profile — 获取用户资料
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.userId!)
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
    console.error('Get profile error:', err);
    return res.status(500).json({ error: '获取资料失败' });
  }
});

// PUT /api/profile — 更新用户资料
router.put('/', async (req: AuthenticatedRequest, res: Response) => {
  const { displayName, avatarUrl } = req.body;

  try {
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (displayName !== undefined) updates.display_name = displayName;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.userId!)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({
      id: profile.id,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      focusPoints: profile.focus_points,
      streakDays: profile.streak_days,
      isPro: profile.is_pro,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: '更新资料失败' });
  }
});

export default router;
