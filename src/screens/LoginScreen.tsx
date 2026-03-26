import { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, ShieldCheck, Sparkles, Zap, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginScreenProps {
  onLogin: () => void;
  onOpenSettings: (view?: 'main' | 'version' | 'help' | 'terms' | 'privacy') => void;
  onClose?: () => void;
  key?: string | number;
}

export function LoginScreen({ onLogin, onOpenSettings, onClose }: LoginScreenProps) {
  const { login, signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('请填写邮箱和密码');
      return;
    }
    if (password.length < 6) {
      setError('密码至少需要 6 个字符');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isSignup) {
        await signup(email, password, displayName || undefined);
      } else {
        await login(email, password);
      }
      onLogin();
    } catch (err: any) {
      setError(err.message || '操作失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-[100] flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      {/* Top Buttons */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        {onClose && (
          <button 
            onClick={onClose}
            className="p-3 bg-surface-container-low rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6 text-center relative z-10 py-12 overflow-y-auto max-h-full no-scrollbar"
      >
        {/* Logo Section */}
        <div className="space-y-4">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-primary/30"
          >
            <span className="text-on-primary font-headline font-black text-3xl italic">F</span>
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-black tracking-tight text-on-surface">Focus</h1>
            <p className="text-on-surface-variant font-medium text-sm">开启你的深度专注之旅</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm font-medium"
          >
            {error}
          </motion.div>
        )}

        {/* Email/Password Form */}
        <div className="space-y-3 text-left">
          {isSignup && (
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block px-1">昵称</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="你的昵称"
                className="w-full px-4 py-3.5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
          )}
          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block px-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3.5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block px-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3.5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Action Section */}
        <div className="space-y-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-on-primary rounded-2xl font-headline font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>{isSignup ? '注册账号' : '邮箱登录'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
            }}
            className="w-full py-3 text-on-surface-variant font-bold text-sm hover:text-primary transition-colors"
          >
            {isSignup ? '已有账号？立即登录' : '没有账号？立即注册'}
          </button>

          <div className="flex items-center gap-4 py-1">
            <div className="h-[1px] flex-1 bg-outline-variant/20" />
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">其他方式</span>
            <div className="h-[1px] flex-1 bg-outline-variant/20" />
          </div>

          <div className="flex justify-center gap-4">
            <button
              disabled
              className="flex items-center gap-2 px-5 py-2.5 bg-[#07C160]/10 text-[#07C160] rounded-xl font-bold text-xs opacity-50 cursor-not-allowed"
            >
              <MessageCircle className="w-4 h-4" />
              <span>微信 (即将推出)</span>
            </button>
            <button
              disabled
              className="flex items-center gap-2 px-5 py-2.5 bg-[#12B7F5]/10 text-[#12B7F5] rounded-xl font-bold text-xs opacity-50 cursor-not-allowed"
            >
              <div className="w-4 h-4 flex items-center justify-center font-black text-[8px] bg-[#12B7F5] text-white rounded-full">Q</div>
              <span>QQ (即将推出)</span>
            </button>
          </div>

          <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold flex items-center justify-center gap-1">
            <span>登录即代表同意</span>
            <button onClick={() => onOpenSettings('terms')} className="text-primary hover:underline">用户协议</button>
            <span>与</span>
            <button onClick={() => onOpenSettings('privacy')} className="hover:underline text-primary">隐私政策</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
