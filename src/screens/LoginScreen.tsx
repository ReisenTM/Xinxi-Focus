import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, MessageCircle, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../lib/api';

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

  // 验证码相关
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(60);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    if (!email) {
      setError('请填写邮箱');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    if (!password || password.length < 6) {
      setError('请填写密码（至少 6 位）');
      return;
    }

    setIsSendingCode(true);
    setError('');

    try {
      await authApi.sendCode(email);
      setCodeSent(true);
      startCountdown();
    } catch (err: any) {
      setError(err.message || '验证码发送失败');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async () => {
    if (isSignup) {
      if (!verificationCode) {
        setError('请输入验证码');
        return;
      }
      if (verificationCode.length !== 6) {
        setError('验证码为 6 位数字');
        return;
      }
    } else {
      if (!email || !password) {
        setError('请填写邮箱和密码');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      if (isSignup) {
        await signup(email, password, verificationCode, displayName || undefined);
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

  const resetSignupState = () => {
    setCodeSent(false);
    setVerificationCode('');
    setCountdown(0);
    if (countdownRef.current) clearInterval(countdownRef.current);
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
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm font-medium"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <div className="space-y-3 text-left">
          {/* 注册模式: 昵称 */}
          {isSignup && !codeSent && (
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

          {/* 邮箱 (注册验证码已发送后只读) */}
          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block px-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              readOnly={isSignup && codeSent}
              className={`w-full px-4 py-3.5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all ${isSignup && codeSent ? 'opacity-60' : ''}`}
            />
          </div>

          {/* 密码 (注册验证码已发送后隐藏) */}
          {!(isSignup && codeSent) && (
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block px-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (isSignup) handleSendCode();
                    else handleSubmit();
                  }
                }}
                className="w-full px-4 py-3.5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
          )}

          {/* 验证码输入 (注册第二步) */}
          <AnimatePresence>
            {isSignup && codeSent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 px-1 py-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="text-xs text-primary font-bold">验证码已发送至 {email}</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block px-1">验证码</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="请输入 6 位验证码"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    autoFocus
                    className="w-full px-4 py-3.5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-center text-xl tracking-[0.5em] font-mono font-bold"
                  />
                </div>
                <button
                  onClick={handleSendCode}
                  disabled={countdown > 0 || isSendingCode}
                  className="w-full py-2.5 text-sm font-bold text-primary hover:text-primary/80 disabled:text-on-surface-variant/40 transition-colors"
                >
                  {isSendingCode ? '发送中...' : countdown > 0 ? `重新发送 (${countdown}s)` : '重新发送验证码'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Section */}
        <div className="space-y-4">
          {/* 主按钮 */}
          {isSignup && !codeSent ? (
            /* 注册第一步: 发送验证码 */
            <button
              onClick={handleSendCode}
              disabled={isSendingCode}
              className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-on-primary rounded-2xl font-headline font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSendingCode ? (
                <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  <span>发送验证码</span>
                </>
              )}
            </button>
          ) : (
            /* 登录 / 注册第二步: 提交 */
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
          )}

          {/* 返回上一步 (注册第二步时显示) */}
          {isSignup && codeSent && (
            <button
              onClick={resetSignupState}
              className="w-full py-2 text-on-surface-variant font-bold text-xs hover:text-on-surface transition-colors"
            >
              ← 返回修改信息
            </button>
          )}

          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
              resetSignupState();
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
