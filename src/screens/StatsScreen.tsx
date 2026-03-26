import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface StatsScreenProps {
  sessions?: {
    id: string;
    duration: number;
    date: string;
    fullDate?: string;
    time: string;
    type: string;
  }[];
  stats?: {
    todayTotalSeconds: number;
    todayCount: number;
    weeklyData: Record<string, number>;
  };
  onViewAllAchievements?: () => void;
  onViewAllHistory?: () => void;
  key?: string | number;
}

const TYPE_CONFIG: Record<string, { label: string, icon: string }> = {
  general: { label: '专注', icon: 'center_focus_strong' },
  work: { label: '工作', icon: 'work' },
  study: { label: '学习', icon: 'menu_book' },
  reading: { label: '阅读', icon: 'auto_stories' },
  meditation: { label: '冥想', icon: 'self_improvement' },
  exercise: { label: '运动', icon: 'fitness_center' },
};

export function StatsScreen({ 
  sessions = [], 
  stats,
  onViewAllAchievements, 
  onViewAllHistory 
}: StatsScreenProps) {
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i);

  const sessionDates = new Set(
    sessions
      .filter(s => s.fullDate)
      .map(s => new Date(s.fullDate!).toDateString())
  );

  const nextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const prevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const todayHours = stats ? (stats.todayTotalSeconds / 3600).toFixed(1) : '0';
  const todayCount = stats?.todayCount || 0;

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const maxWeekly = Math.max(1, ...dayNames.map(d => stats?.weeklyData[d] || 0));
  const todayDayIndex = new Date().getDay() - 1 < 0 ? 6 : new Date().getDay() - 1;

  const chartData = dayNames.map((d, i) => ({
    day: dayLabels[i],
    height: `${Math.max(5, ((stats?.weeklyData[d] || 0) / maxWeekly) * 100)}%`,
    isToday: i === todayDayIndex,
  }));


  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="pt-24 pb-32 px-6 max-w-md mx-auto space-y-12"
    >
      {/* Hero Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest p-6 rounded-xl flex flex-col justify-between h-40">
          <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">
            今日专注时长
          </span>
          <div>
            <span className="font-headline text-3xl font-bold tracking-tight text-primary">
              {todayHours}
            </span>
            <span className="text-on-surface-variant font-label text-xs block">小时</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl flex flex-col justify-between h-40">
          <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">
            今日专注次数
          </span>
          <div>
            <span className="font-headline text-3xl font-bold tracking-tight text-primary">
              {todayCount}
            </span>
            <span className="text-on-surface-variant font-label text-xs block">次</span>
          </div>
        </div>
      </section>

      {/* Weekly Focus Chart Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="font-headline text-xl font-bold tracking-tight">本周专注趋势</h2>
          <span className="text-primary font-label text-xs font-medium">
            +12% 较上周
          </span>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_4px_48px_0_rgba(44,52,51,0.04)] border border-outline-variant/5">
          {/* Bars */}
          <div className="flex items-end justify-between h-32 gap-3 px-2 mb-6">
            {chartData.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center h-full">
                <div className="w-full relative flex flex-col justify-end h-full">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: item.height }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`w-full rounded-t-lg ${
                      item.isToday ? 'bg-primary' : 'bg-primary/10'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Calendar Toggle Row */}
          <div className="px-2 py-4 border-t border-outline-variant/10">
            <button 
              onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
              className="w-full flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>
                  calendar_month
                </span>
                <span className="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors">查看专注日历</span>
              </div>
              <motion.span 
                animate={{ rotate: isCalendarExpanded ? 180 : 0 }}
                className="material-symbols-outlined text-on-surface-variant text-lg"
              >
                expand_more
              </motion.span>
            </button>

            <AnimatePresence>
              {isCalendarExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 pb-2">
                    <div className="flex justify-between items-center mb-6">
                      <button onClick={prevMonth} className="p-1 hover:bg-surface-container-highest rounded-full transition-colors">
                        <span className="material-symbols-outlined text-lg">chevron_left</span>
                      </button>
                      <span className="text-on-surface font-bold text-sm uppercase tracking-widest">
                        {viewDate.toLocaleString('default', { month: 'long' })} {currentYear}
                      </span>
                      <button onClick={nextMonth} className="p-1 hover:bg-surface-container-highest rounded-full transition-colors">
                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {['一', '二', '三', '四', '五', '六', '日'].map(d => (
                        <span key={d} className="text-[10px] font-bold text-on-surface-variant/40 py-2">
                          {d}
                        </span>
                      ))}
                      
                      {blanks.map(b => <div key={`blank-${b}`} />)}
                      
                      {days.map(day => {
                        const date = new Date(currentYear, currentMonth, day);
                        const hasSession = sessionDates.has(date.toDateString());
                        const isToday = date.toDateString() === new Date().toDateString();
                        
                        return (
                          <div 
                            key={day} 
                            className="aspect-square flex items-center justify-center relative"
                          >
                            {isToday && (
                              <div className="absolute inset-1 border border-primary/20 rounded-lg" />
                            )}
                            <div className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-medium transition-all duration-300 ${
                              hasSession 
                                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                                : 'text-on-surface-variant/60'
                            }`}>
                              {day}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Day Labels */}
          <div className="flex justify-between px-2 mt-2">
            {chartData.map((item) => (
              <span key={item.day} className={`flex-1 text-center font-label text-[10px] ${
                item.isToday ? 'text-primary font-bold' : 'text-on-surface-variant/40'
              }`}>
                {item.day}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="font-headline text-xl font-bold tracking-tight">成就勋章</h2>
          <span className="text-on-surface-variant font-label text-xs">
            已解锁 3 / 12
          </span>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Active Milestone */}
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 relative overflow-hidden">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                  emoji_events
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-headline font-bold text-on-surface">静心者</h3>
                <p className="text-on-surface-variant text-xs">连续专注 5 天</p>
              </div>
              <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                进行中
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                <span>进度</span>
                <span>80%</span>
              </div>
              <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '80%' }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Other Achievements Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant text-xl">
                  nightlight
                </span>
              </div>
              <h4 className="text-xs font-bold">夜猫子</h4>
              <p className="text-[10px] text-on-surface-variant">在午夜后专注</p>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                  workspace_premium
                </span>
              </div>
              <h4 className="text-xs font-bold">专注大师</h4>
              <p className="text-[10px] text-on-surface-variant">单次专注 60 分钟</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onViewAllAchievements}
          className="w-full py-4 rounded-2xl border border-outline-variant/20 text-on-surface-variant font-headline font-bold text-sm hover:bg-surface-container-low transition-colors"
        >
          查看所有成就
        </button>
      </section>

      {/* Session History Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="font-headline text-xl font-bold tracking-tight">专注历史</h2>
          <button 
            onClick={onViewAllHistory}
            className="text-primary font-label text-xs font-bold hover:opacity-80 transition-opacity"
          >
            全部记录
          </button>
        </div>

        <div className="space-y-3">
          {sessions.map((session) => {
            const config = TYPE_CONFIG[session.type] || TYPE_CONFIG.general;
            const mins = Math.floor(session.duration / 60);
            const secs = session.duration % 60;
            const durationStr = `${mins}:${secs.toString().padStart(2, '0')}`;

            return (
              <div 
                key={session.id}
                className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/5 flex items-center justify-between group hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">
                      {config.icon}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-sm text-on-surface">
                      {config.label}
                    </h4>
                    <p className="text-[10px] text-on-surface-variant font-medium">
                      {session.date} · {session.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-headline font-bold text-sm text-primary">
                    {durationStr}
                  </span>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                    时长
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </motion.main>
  );
}
