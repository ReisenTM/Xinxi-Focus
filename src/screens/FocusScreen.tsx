import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FocusScreenProps {
  onComplete: (duration: number, type: string) => void;
  isLoggedIn?: boolean;
  todayTotalSeconds?: number;
  todayCount?: number;
  key?: string | number;
}


const FOCUS_TYPES = [
  { id: 'general', label: '专注', icon: 'center_focus_strong' },
  { id: 'work', label: '工作', icon: 'work' },
  { id: 'study', label: '学习', icon: 'menu_book' },
  { id: 'reading', label: '阅读', icon: 'auto_stories' },
  { id: 'meditation', label: '冥想', icon: 'self_improvement' },
  { id: 'exercise', label: '运动', icon: 'fitness_center' },
];

const DURATION_OPTIONS = [
  { label: '5m', value: 5 * 60 },
  { label: '15m', value: 15 * 60 },
  { label: '25m', value: 25 * 60 },
  { label: '35m', value: 35 * 60 },
  { label: '45m', value: 45 * 60 },
  { label: '60m', value: 60 * 60 },
];

export function FocusScreen({ onComplete, isLoggedIn, todayTotalSeconds = 0, todayCount = 0 }: FocusScreenProps) {
  const [totalTime, setTotalTime] = useState(25 * 60); // Default 25 minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [selectedType, setSelectedType] = useState(FOCUS_TYPES[0]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const triggerHaptic = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      setShowSuccess(true);
      triggerHaptic([100, 50, 100]); // Success haptic
      onComplete(totalTime, selectedType.id);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    triggerHaptic(15); // Short click haptic
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(totalTime);
    setShowSuccess(false);
    triggerHaptic([10, 50, 10]); // Double tap haptic
  };

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  
  // Calculate progress for the SVG circle (816 is the circumference)
  const progress = ((totalTime - timeLeft) / totalTime) * 816;

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="pt-24 pb-32 px-6 max-w-md mx-auto min-h-screen flex flex-col items-center relative"
    >
      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-surface/80 backdrop-blur-xl px-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-surface-container-lowest p-10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-outline-variant/10 text-center space-y-8 max-w-xs w-full"
            >
              <div className="relative w-24 h-24 mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="absolute inset-0 bg-primary/10 rounded-full"
                />
                <motion.div
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-primary text-5xl font-bold">
                    check_circle
                  </span>
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <h2 className="font-headline text-2xl font-bold text-on-surface">专注完成！</h2>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  你已经成功完成了一次深度专注。休息一下，准备迎接下一个挑战。
                </p>
              </div>

              <button
                onClick={resetTimer}
                className="w-full bg-primary text-on-primary py-4 rounded-full font-headline font-bold text-sm tracking-wide shadow-lg active:scale-95 transition-all"
              >
                太棒了
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Timer Section */}
      <section className="w-full flex flex-col items-center mb-12 pt-0 -mt-[15px]">
        <div className="relative flex items-center justify-center w-72 h-72">
          {/* Breathing Guide Ring */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [0.8, 1.15, 0.8],
                  opacity: [0.15, 0.4, 0.15]
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 8, // Very slow, deep breath cycle
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -inset-12 rounded-full border-[1.5px] border-primary/40 blur-[2px] pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Focus Ring */}
          <svg className="absolute w-full h-full -rotate-90">
            <circle
              className="text-primary-fixed-dim"
              cx="144"
              cy="144"
              fill="transparent"
              r="130"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle
              className="text-primary transition-all duration-1000 ease-linear"
              cx="144"
              cy="144"
              fill="transparent"
              r="130"
              stroke="currentColor"
              strokeDasharray="816"
              strokeDashoffset={progress}
              strokeLinecap="round"
              strokeWidth="8"
            />
          </svg>

          {/* Inner Glow */}
          <motion.div 
            animate={isActive ? {
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            } : {
              scale: 1,
              opacity: 0.5,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/10 to-primary-container/30 blur-2xl pointer-events-none" 
          />
          {/* Digits */}
          <div className="z-10 text-center">
            <div className="font-headline text-7xl font-extrabold tracking-tight text-on-surface">
              {minutes}:{seconds}
            </div>
            <div className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant mt-2">
              {selectedType.label}专注
            </div>
          </div>
        </div>

        {/* Configuration Toggle & Panel */}
        <AnimatePresence>
          {!isActive && timeLeft === totalTime && (
            <div className="w-full mt-8 flex flex-col items-center">
              <button
                onClick={() => {
                  setIsConfigOpen(!isConfigOpen);
                  triggerHaptic(10);
                }}
                className="flex items-center gap-2 px-6 py-2 bg-surface-container-low rounded-full border border-outline-variant/10 hover:bg-surface-container-high transition-all active:scale-95 mb-4"
              >
                <span className="material-symbols-outlined text-primary text-lg">tune</span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  {isConfigOpen ? '收起设置' : '调整时长与类型'}
                </span>
                <motion.span 
                  animate={{ rotate: isConfigOpen ? 180 : 0 }}
                  className="material-symbols-outlined text-on-surface-variant text-sm"
                >
                  expand_more
                </motion.span>
              </button>

              {isConfigOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="w-full overflow-hidden"
                >
                  <div className="bg-surface-container-lowest/50 backdrop-blur-sm rounded-3xl p-6 border border-outline-variant/10 space-y-8">
                    {/* Duration Segmented Control */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">专注时长</span>
                        <span className="text-xs font-bold text-primary">{Math.floor(totalTime / 60)} 分钟</span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {DURATION_OPTIONS.map((option) => (
                          <button
                            key={option.label}
                            onClick={() => {
                              setTotalTime(option.value);
                              setTimeLeft(option.value);
                              triggerHaptic(10);
                            }}
                            className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                              totalTime === option.value
                                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Type Segmented Control */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">专注类型</span>
                        <span className="text-xs font-bold text-primary">{selectedType.label}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {FOCUS_TYPES.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => {
                              setSelectedType(type);
                              triggerHaptic(10);
                            }}
                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                              selectedType.id === type.id
                                ? 'bg-primary/10 border-2 border-primary text-primary'
                                : 'bg-surface-container-high border-2 border-transparent text-on-surface-variant hover:bg-surface-container-highest'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xl">{type.icon}</span>
                            <span className="text-[10px] font-bold">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="mt-8 flex flex-col items-center gap-10 w-full">
          {/* Main Action Button */}
          <div className="w-full flex flex-col items-center gap-6">
            <button 
              onClick={toggleTimer}
              className={`w-full max-w-[280px] py-5 rounded-[2rem] font-headline font-bold text-base tracking-widest shadow-2xl transition-all duration-500 active:scale-95 ${
                isActive 
                  ? 'bg-surface-container-highest text-on-surface border border-outline-variant/20 shadow-none' 
                  : 'bg-primary text-on-primary shadow-primary/30 hover:shadow-primary/40'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="material-symbols-outlined">
                  {isActive ? 'pause' : timeLeft < totalTime ? 'play_arrow' : 'bolt'}
                </span>
                {isActive ? '暂停专注' : timeLeft < totalTime ? '继续专注' : '开启深度专注'}
              </div>
            </button>
            
            {!isActive && timeLeft < totalTime && (
              <button 
                onClick={resetTimer}
                className="text-on-surface-variant hover:text-on-surface font-label text-[10px] uppercase tracking-[0.2em] font-bold transition-colors py-2"
              >
                放弃本次专注并重置
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Bento Grid Progress */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {/* 今日专注时长 Widget */}
        <div className="bg-surface-container-lowest p-5 rounded-xl flex flex-col justify-between shadow-[0_4px_48px_0_rgba(44,52,51,0.04)] min-h-[140px]">
          <div className="flex items-start justify-between">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>
              schedule
            </span>
            <span className="font-headline font-bold text-xl">{Math.floor(todayTotalSeconds / 60)}m</span>
          </div>
          <div>
            <div className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant mb-2">
              今日专注时长
            </div>
            <div className="w-full bg-surface-container-low h-1 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${Math.min((todayTotalSeconds / (8 * 3600)) * 100, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* 今日专注次数 Widget */}
        <div className="bg-surface-container-lowest p-5 rounded-xl flex flex-col justify-between shadow-[0_4px_48px_0_rgba(44,52,51,0.04)] min-h-[140px]">
          <div className="flex items-start justify-between">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>
              timer
            </span>
            <span className="font-headline font-bold text-xl">{todayCount}</span>
          </div>
          <div>
            <div className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant mb-2">
              今日专注次数
            </div>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(todayCount, 8) }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
              ))}
              {Array.from({ length: Math.max(0, 8 - todayCount) }).map((_, i) => (
                <div key={`e-${i}`} className="w-1.5 h-1.5 rounded-full bg-surface-container-low" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
