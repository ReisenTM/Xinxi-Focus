import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { achievementsApi, Achievement } from '../lib/api';

interface AchievementsScreenProps {
  onBack: () => void;
  key?: string | number;
}

export function AchievementsScreen({ onBack }: AchievementsScreenProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const data = await achievementsApi.list();
      setAchievements(data.achievements);
      setUnlockedCount(data.unlockedCount);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error('Failed to load achievements:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
        <h1 className="font-headline text-xl font-bold">成就勋章</h1>
      </header>

      <main className="p-6 space-y-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline font-bold text-on-surface">勋章进度</h2>
                <span className="text-primary font-bold text-lg">{unlockedCount} / {totalCount}</span>
              </div>
              <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all" 
                  style={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`p-5 rounded-3xl border flex flex-col items-center text-center gap-3 transition-all ${
                    achievement.unlocked 
                      ? 'bg-surface-container-lowest border-primary/20 shadow-sm' 
                      : 'bg-surface-container-low border-transparent opacity-60'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    achievement.unlocked ? 'bg-primary/10 text-primary' : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: achievement.unlocked ? '"FILL" 1' : '' }}>
                      {achievement.icon}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-headline font-bold text-sm">{achievement.title}</h3>
                    <p className="text-[10px] text-on-surface-variant leading-tight">{achievement.description}</p>
                  </div>
                  {!achievement.unlocked && achievement.progress !== undefined && (
                    <div className="w-full mt-2 space-y-1">
                      <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-on-surface-variant">
                        <span>进度</span>
                        <span>{achievement.progress}/{achievement.total}</span>
                      </div>
                      <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary/40 rounded-full" 
                          style={{ width: `${(achievement.progress / (achievement.total || 1)) * 100}%` }} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </motion.div>
  );
}
