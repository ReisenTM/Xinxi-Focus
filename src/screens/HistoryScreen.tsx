import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryScreenProps {
  sessions: {
    id: string;
    duration: number;
    date: string;
    fullDate?: string;
    time: string;
    type: string;
  }[];
  onBack: () => void;
  key?: string | number;
}

const TYPE_CONFIG: Record<string, { label: string, icon: string }> = {
  all: { label: '全部', icon: 'list' },
  general: { label: '专注', icon: 'center_focus_strong' },
  work: { label: '工作', icon: 'work' },
  study: { label: '学习', icon: 'menu_book' },
  reading: { label: '阅读', icon: 'auto_stories' },
  meditation: { label: '冥想', icon: 'self_improvement' },
  exercise: { label: '运动', icon: 'fitness_center' },
};

export function HistoryScreen({ sessions, onBack }: HistoryScreenProps) {
  const [filterType, setFilterType] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredSessions = filterType === 'all' 
    ? sessions 
    : sessions.filter(s => s.type === filterType);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-outline-variant/10">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline text-xl font-bold">全部专注记录</h1>
      </header>

      <main className="p-6 space-y-6">
        <div className="flex items-center justify-between mb-4 relative">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-headline font-bold text-primary">{filteredSessions.length}</span>
            <span className="text-on-surface-variant text-xs font-medium">次专注</span>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all text-xs font-bold ${
                isFilterOpen || filterType !== 'all'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-surface-container-low border-outline-variant/10 text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-sm">filter_list</span>
              {filterType === 'all' ? '筛选' : TYPE_CONFIG[filterType].label}
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsFilterOpen(false)}
                    className="fixed inset-0 z-20"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-40 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl shadow-xl z-30 p-2 overflow-hidden"
                  >
                    {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setFilterType(key);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          filterType === key 
                            ? 'bg-primary text-on-primary' 
                            : 'hover:bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">{config.icon}</span>
                        {config.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-4">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => {
              const config = TYPE_CONFIG[session.type] || TYPE_CONFIG.general;
              const mins = Math.floor(session.duration / 60);
              const secs = session.duration % 60;
              const durationStr = `${mins}:${secs.toString().padStart(2, '0')}`;

              return (
                <div 
                  key={session.id}
                  className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/5 flex items-center justify-between group hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-2xl">
                        {config.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-base text-on-surface">
                        {config.label}
                      </h4>
                      <p className="text-xs text-on-surface-variant font-medium">
                        {session.date} · {session.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-headline font-bold text-base text-primary">
                      {durationStr}
                    </span>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                      时长
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-on-surface-variant/40 text-3xl">history</span>
              </div>
              <p className="text-on-surface-variant text-sm">暂无该类型的专注记录</p>
            </div>
          )}
        </div>
      </main>
    </motion.div>
  );
}
