import { Router, Response } from 'express';
import { supabaseAdmin } from '../supabase';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// GET /api/achievements — 获取成就列表及用户进度
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 获取所有成就定义
    const { data: achievements, error: achievementError } = await supabaseAdmin
      .from('achievements')
      .select('*')
      .order('id');

    if (achievementError) {
      return res.status(500).json({ error: achievementError.message });
    }

    // 获取用户成就进度
    const { data: userAchievements, error: userError } = await supabaseAdmin
      .from('user_achievements')
      .select('*')
      .eq('user_id', req.userId!);

    if (userError) {
      return res.status(500).json({ error: userError.message });
    }

    // 合并数据
    const progressMap = new Map(
      (userAchievements || []).map(ua => [ua.achievement_id, ua])
    );

    const result = (achievements || []).map(a => {
      const userProgress = progressMap.get(a.id);
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        icon: a.icon,
        total: a.total,
        progress: userProgress?.progress || 0,
        unlocked: userProgress?.unlocked || false,
        unlockedAt: userProgress?.unlocked_at || null,
      };
    });

    const unlockedCount = result.filter(a => a.unlocked).length;

    return res.json({
      achievements: result,
      totalCount: result.length,
      unlockedCount,
    });
  } catch (err) {
    console.error('Get achievements error:', err);
    return res.status(500).json({ error: '获取成就数据失败' });
  }
});

export default router;
