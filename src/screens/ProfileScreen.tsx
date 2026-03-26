import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Crown, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { profileApi } from '../lib/api';

interface ProfileScreenProps {
  onLogout: () => void;
  onOpenSubscription: () => void;
  key?: string | number;
}

export function ProfileScreen({ onLogout, onOpenSubscription }: ProfileScreenProps) {
  const { user, refreshUser } = useAuth();

  const displayName = user?.displayName || '用户';
  const email = user?.email || '';
  const focusPoints = user?.focusPoints || 0;
  const streakDays = user?.streakDays || 0;
  const createdAt = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();
  const avatarUrl = user?.avatarUrl || '';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    setIsUploading(true);

    try {
      // 1. 读取文件
      const reader = new FileReader();
      const base64Str = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 2. 加载到 Image 对象
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = base64Str;
      });

      // 3. Canvas 裁切压缩 (200x200)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      canvas.width = 200;
      canvas.height = 200;

      const size = Math.min(img.width, img.height);
      const startX = (img.width - size) / 2;
      const startY = (img.height - size) / 2;

      ctx.drawImage(img, startX, startY, size, size, 0, 0, 200, 200);

      const compressedBase64 = canvas.toDataURL('image/webp', 0.8);

      // 4. 调用 API 上传
      await profileApi.update({ avatarUrl: compressedBase64 });
      
      // 5. 刷新全局用户信息
      await refreshUser();
      
    } catch (err) {
      console.error('Avatar upload failed:', err);
      alert('头像上传失败，请稍后重试');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button 
              onClick={() => !isUploading && fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-24 h-24 rounded-xl overflow-hidden shadow-sm bg-primary/10 flex items-center justify-center relative group transition-transform active:scale-95"
            >
              {isUploading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                <span className="text-white text-xs font-bold font-headline">修改头像</span>
              </div>

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
            </button>
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
        <div className="pt-4 pb-12">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-error/20 text-error font-headline font-bold hover:bg-error/5 transition-colors duration-400"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>退出账户</span>
          </button>
        </div>
      </section>
    </motion.main>
  );
}
