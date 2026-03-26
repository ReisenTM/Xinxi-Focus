-- ============================================
-- 心隙专注 (Xinxi Focus) - Supabase Database Schema
-- ============================================

-- 1. profiles 表: 用户资料（扩展 auth.users）
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  focus_points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  is_pro BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. focus_sessions 表: 专注会话记录
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL,  -- 时长（秒）
  type TEXT NOT NULL DEFAULT 'general',  -- general/work/study/reading/meditation/exercise
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON public.focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_completed_at ON public.focus_sessions(completed_at);

-- 3. achievements 表: 成就定义（种子数据）
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  total INTEGER NOT NULL DEFAULT 1
);

-- 4. user_achievements 表: 用户成就进度
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- profiles: 用户只能读写自己的资料
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- focus_sessions: 用户只能读写自己的会话
CREATE POLICY "Users can view own sessions" ON public.focus_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.focus_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON public.focus_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- achievements: 所有人可读
CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

-- user_achievements: 用户只能读写自己的成就
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON public.user_achievements
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 触发器: 新用户注册时自动创建 profile
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );

  -- 为新用户初始化所有成就进度
  INSERT INTO public.user_achievements (user_id, achievement_id, progress, unlocked)
  SELECT NEW.id, a.id, 0, FALSE
  FROM public.achievements a;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 种子数据: 成就定义
-- ============================================

INSERT INTO public.achievements (id, title, description, icon, total) VALUES
  ('streak_5', '静心者', '连续专注 5 天', 'emoji_events', 5),
  ('focus_60min', '专注大师', '单次专注 60 分钟', 'workspace_premium', 1),
  ('night_owl', '夜猫子', '在午夜后专注', 'nightlight', 1),
  ('early_bird', '早起鸟', '在早上 6 点前专注 3 次', 'wb_sunny', 3),
  ('marathon', '马拉松', '累计专注时长达到 100 小时', 'timer', 100),
  ('social', '社交达人', '分享你的专注成果', 'share', 1),
  ('deep_think', '深度思考', '完成 10 次深度专注', 'psychology', 10),
  ('workaholic', '工作狂', '单日专注时长超过 8 小时', 'trending_up', 1)
ON CONFLICT (id) DO NOTHING;
