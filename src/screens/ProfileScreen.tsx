import { motion } from 'motion/react';
import { Crown, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileScreenProps {
  onLogout: () => void;
  onOpenSubscription: () => void;
  key?: string | number;
}

export function ProfileScreen({ onLogout, onOpenSubscription }: ProfileScreenProps) {
  const { user } = useAuth();

  const displayName = user?.displayName || '用户';
  const email = user?.email || '';
  const focusPoints = user?.focusPoints || 0;
  const streakDays = user?.streakDays || 0;
  const createdAt = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();
  const avatarUrl = user?.avatarUrl || '';

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="pt-24 px-6 max-w-2xl mx-auto space-y-12 pb-32"
    >
      {/* Profile Summary Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-xl overflow-hidden shadow-sm bg-primary/10 flex items-center justify-center">
              {avatarUrl ? (
                <img
                  className="w-full h-full object-cover"
                  alt="Profile photo"
                  src={avatarUrl}
                />
              ) : (
                <span className="font-headline font-black text-4xl text-primary">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary rounded-full p-1.5 shadow-md">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                verified
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
              {displayName}
            </h2>
            <p className="text-on-surface-variant text-sm font-medium">
              {createdAt}年加入心隙专注
            </p>
          </div>
        </div>

        {/* Subscription Entry Point */}
        <motion.button
          onClick={onOpenSubscription}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full relative overflow-hidden p-6 rounded-[2rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
            <Crown className="w-16 h-16 text-primary rotate-12" />
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Crown className="w-6 h-6 text-on-primary" />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-bold text-on-surface">Focus Pro 会员</h3>
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </motion.div>
              </div>
              <p className="text-xs text-on-surface-variant font-medium">解锁所有高级功能与专属拼图</p>
            </div>
            <div className="bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
              立即开启
            </div>
          </div>
        </motion.button>

        {/* Points Bento Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <p className="text-xs font-headline font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-2">
              专注积分
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-headline font-extrabold text-primary">{focusPoints.toLocaleString()}</span>
              <span
                className="material-symbols-outlined text-primary text-sm"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                bolt
              </span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <p className="text-xs font-headline font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-2">
              当前连续天数
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-headline font-extrabold text-on-surface">{streakDays}</span>
              <span className="text-on-surface-variant text-sm font-medium">天</span>
            </div>
          </div>
        </div>
      </section>

      {/* Settings Section */}
      <section className="space-y-10">
        {/* Dangerous Area / Logout */}
        <div className="pt-4 pb-12">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-error/20 text-error font-headline font-bold hover:bg-error/5 transition-colors duration-400"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>退出</span>
          </button>
        </div>
      </section>
    </motion.main>
  );
}
