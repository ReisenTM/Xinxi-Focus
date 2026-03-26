import { Router, Response } from 'express';
import { supabaseAdmin } from '../supabase';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/sessions — 获取专注会话列表 + 统计
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit = '50', offset = '0', type } = req.query;

    let query = supabaseAdmin
      .from('focus_sessions')
      .select('*')
      .eq('user_id', req.userId!)
      .order('completed_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    const { data: sessions, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // 获取今日统计
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todaySessions } = await supabaseAdmin
      .from('focus_sessions')
      .select('duration')
      .eq('user_id', req.userId!)
      .gte('completed_at', today.toISOString());

    const todayTotalSeconds = (todaySessions || []).reduce((sum, s) => sum + s.duration, 0);
    const todayCount = (todaySessions || []).length;

    // 获取本周统计
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    const { data: weekSessions } = await supabaseAdmin
      .from('focus_sessions')
      .select('duration, completed_at')
      .eq('user_id', req.userId!)
      .gte('completed_at', weekStart.toISOString());

    // 获取上周统计
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const { data: lastWeekSessions } = await supabaseAdmin
      .from('focus_sessions')
      .select('duration')
      .eq('user_id', req.userId!)
      .gte('completed_at', lastWeekStart.toISOString())
      .lt('completed_at', weekStart.toISOString());

    const lastWeekTotalSeconds = (lastWeekSessions || []).reduce((sum, s) => sum + s.duration, 0);
    const thisWeekTotalSeconds = (weekSessions || []).reduce((sum, s) => sum + s.duration, 0);

    // 计算趋势百分比 (trendPercentage)
    let trendPercentage = 0;
    if (lastWeekTotalSeconds === 0) {
      trendPercentage = thisWeekTotalSeconds > 0 ? 100 : 0;
    } else {
      trendPercentage = Math.round(((thisWeekTotalSeconds - lastWeekTotalSeconds) / lastWeekTotalSeconds) * 100);
    }

    // 按天分组本周数据
    const weeklyData: Record<string, number> = {};
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    dayNames.forEach(d => { weeklyData[d] = 0; });

    (weekSessions || []).forEach(s => {
      const date = new Date(s.completed_at);
      let dayIndex = date.getDay() - 1;
      if (dayIndex < 0) dayIndex = 6; // Sunday
      weeklyData[dayNames[dayIndex]] += s.duration;
    });

    // Format sessions for frontend
    const formattedSessions = (sessions || []).map(s => ({
      id: s.id,
      duration: s.duration,
      type: s.type,
      completedAt: s.completed_at,
      date: formatRelativeDate(new Date(s.completed_at)),
      time: new Date(s.completed_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      fullDate: s.completed_at,
    }));

    return res.json({
      sessions: formattedSessions,
      stats: {
        todayTotalSeconds,
        todayCount,
        weeklyData,
        trendPercentage,
      },
    });
  } catch (err) {
    console.error('Get sessions error:', err);
    return res.status(500).json({ error: '获取会话记录失败' });
  }
});

// POST /api/sessions — 创建专注会话
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const { duration, type = 'general' } = req.body;

  if (!duration || duration <= 0) {
    return res.status(400).json({ error: '请提供有效的专注时长' });
  }

  const validTypes = ['general', 'work', 'study', 'reading', 'meditation', 'exercise'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: '无效的专注类型' });
  }

  try {
    const { data: session, error } = await supabaseAdmin
      .from('focus_sessions')
      .insert({
        user_id: req.userId,
        duration,
        type,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // 更新用户积分 (每分钟 10 积分)
    const pointsEarned = Math.floor(duration / 60) * 10;
    
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('focus_points')
      .eq('id', req.userId!)
      .single();

    if (profile) {
      await supabaseAdmin
        .from('profiles')
        .update({ 
          focus_points: (profile.focus_points || 0) + pointsEarned,
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.userId!);
    }

    return res.status(201).json({
      session: {
        id: session.id,
        duration: session.duration,
        type: session.type,
        completedAt: session.completed_at,
        date: formatRelativeDate(new Date(session.completed_at)),
        time: new Date(session.completed_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
        fullDate: session.completed_at,
      },
      pointsEarned,
    });
  } catch (err) {
    console.error('Create session error:', err);
    return res.status(500).json({ error: '创建会话失败' });
  }
});

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays === 2) return '前天';
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export default router;
