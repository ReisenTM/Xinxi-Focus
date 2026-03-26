import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Bell, Moon, Info, LogOut, User, Globe, HelpCircle, Mail, MessageCircle, Cloud, Crown } from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  isLoggedIn: boolean;
  initialView?: SettingsView;
  key?: string | number;
}

type SettingsView = 'main' | 'version' | 'help' | 'terms' | 'privacy';

export function SettingsScreen({ onBack, isDarkMode, onToggleDarkMode, onLogout, isLoggedIn, initialView = 'main' }: SettingsScreenProps) {
  const [currentView, setCurrentView] = useState<SettingsView>(initialView);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [iCloudSyncEnabled, setICloudSyncEnabled] = useState(false);

  const settingsGroups = [
    {
      title: '账户设置',
      items: [
        { 
          icon: Bell, 
          label: '通知提醒', 
          toggle: true, 
          active: notificationsEnabled,
          onAction: () => setNotificationsEnabled(!notificationsEnabled)
        },
        { icon: Globe, label: '语言', value: '简体中文' },
      ]
    },
    {
      title: '偏好设置',
      items: [
        { 
          icon: Moon, 
          label: '深色模式', 
          toggle: true, 
          active: isDarkMode,
          onAction: onToggleDarkMode
        },
      ]
    },
    {
      title: '关于',
      items: [
        { 
          icon: Info, 
          label: '版本信息', 
          value: 'v1.2.4',
          onAction: () => setCurrentView('version')
        },
        { 
          icon: HelpCircle, 
          label: '帮助与反馈', 
          arrow: true,
          onAction: () => setCurrentView('help')
        },
      ]
    }
  ];

  const renderMainView = () => (
    <motion.div
      key="main"
      initial={{ opacity: 0, x: 0 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <header className="flex items-center px-6 h-16 border-b border-outline-variant/10">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-surface-container-high rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-on-surface" />
        </button>
        <h1 className="ml-4 font-headline font-bold text-xl text-on-surface">设置</h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-12">
        {settingsGroups.map((group, gIdx) => (
          <div key={gIdx} className="mt-8">
            <h2 className="px-6 font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
              {group.title}
            </h2>
            <div className="bg-surface-container-lowest border-y border-outline-variant/10">
              {group.items.map((item, iIdx) => (
                <button
                  key={iIdx}
                  onClick={item.onAction}
                  disabled={item.disabled}
                  className={`w-full flex items-center justify-between px-6 py-4 transition-colors ${
                    iIdx !== group.items.length - 1 ? 'border-b border-outline-variant/5' : ''
                  } ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-container-low'}`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className={`w-5 h-5 ${item.disabled ? 'text-on-surface-variant/40' : 'text-on-surface-variant'}`} />
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${item.disabled ? 'text-on-surface/40' : 'text-on-surface'}`}>{item.label}</span>
                      {item.badge && (
                        <div className="flex items-center gap-1 bg-primary/10 text-primary text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                          <Crown className="w-2.5 h-2.5" />
                          {item.badge}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.value && (
                      <span className="text-on-surface-variant text-sm">{item.value}</span>
                    )}
                    {item.toggle !== undefined && (
                      <div className={`w-10 h-6 rounded-full p-1 transition-colors ${item.active ? 'bg-primary' : 'bg-surface-container-highest'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${item.active ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    )}
                    {(item.arrow || (item.value && item.onAction)) && (
                      <ChevronLeft className="w-4 h-4 text-on-surface-variant/40 rotate-180" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}



        <div className="mt-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">
            <button onClick={() => setCurrentView('terms')} className="hover:text-primary transition-colors">用户协议</button>
            <span className="w-1 h-1 bg-on-surface-variant/20 rounded-full" />
            <button onClick={() => setCurrentView('privacy')} className="hover:text-primary transition-colors">隐私政策</button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderSubView = (title: string, content: React.ReactNode) => (
    <motion.div
      key={title}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full bg-background"
    >
      <header className="flex items-center px-6 h-16 border-b border-outline-variant/10">
        <button 
          onClick={() => setCurrentView('main')}
          className="p-2 -ml-2 hover:bg-surface-container-high rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-on-surface" />
        </button>
        <h1 className="ml-4 font-headline font-bold text-xl text-on-surface">{title}</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        {content}
      </div>
    </motion.div>
  );

  const versionContent = (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="w-24 h-24 bg-primary rounded-[2.5rem] flex items-center justify-center shadow-lg shadow-primary/20">
        <span className="text-on-primary font-headline font-black text-4xl italic">F</span>
      </div>
      <div className="text-center">
        <h3 className="font-headline font-bold text-2xl">Focus</h3>
        <p className="text-on-surface-variant">Version 1.2.4 (Build 20260325)</p>
      </div>
      <div className="w-full bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 space-y-4">
        <div>
          <h4 className="font-bold text-sm mb-1">更新日志</h4>
          <ul className="text-sm text-on-surface-variant space-y-2 list-disc list-inside">
            <li>新增深色模式支持</li>
            <li>优化设置界面交互</li>
            <li>修复了若干已知问题</li>
            <li>提升了应用稳定性</li>
          </ul>
        </div>
      </div>
      <p className="text-xs text-on-surface-variant/60">© 2026 Focus Team. All rights reserved.</p>
    </div>
  );

  const helpContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={() => window.location.href = 'mailto:s3068272040@gmail.com?subject=心隙专注 - 用户反馈'}
          className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 hover:bg-surface-container-low transition-colors text-left"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-bold">邮件反馈</h4>
            <p className="text-xs text-on-surface-variant">s3068272040@gmail.com</p>
          </div>
        </button>
      </div>
    </div>
  );

  const termsContent = (
    <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-on-surface-variant">
      <h3 className="text-on-surface font-bold">1. 服务条款</h3>
      <p>欢迎使用 Focus。通过访问或使用我们的服务，您同意受这些条款的约束。</p>
      <h3 className="text-on-surface font-bold">2. 用户账户</h3>
      <p>您负责维护您的账户和密码的机密性。您同意对在您的账户下发生的所有活动承担责任。</p>
      <h3 className="text-on-surface font-bold">3. 订阅与付费</h3>
      <p>Focus Pro 提供额外的功能。订阅费用将通过您的应用商店账户收取。</p>
      <h3 className="text-on-surface font-bold">4. 免责声明</h3>
      <p>服务按“原样”提供。我们不保证服务不会中断或没有错误。</p>
    </div>
  );

  const privacyContent = (
    <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-on-surface-variant">
      <h3 className="text-on-surface font-bold">1. 数据收集</h3>
      <p>我们收集您在使用 Focus 时提供的信息，例如您的专注时长、任务分类等，以提供更好的服务体验。</p>
      <h3 className="text-on-surface font-bold">2. 数据使用</h3>
      <p>您的数据仅用于提升应用功能和提供个性化统计。我们不会将您的个人数据出售给第三方。</p>
      <h3 className="text-on-surface font-bold">3. 数据安全</h3>
      <p>我们采取合理的安全措施保护您的信息免受未经授权的访问或泄露。</p>
      <h3 className="text-on-surface font-bold">4. iCloud 同步</h3>
      <p>如果您开启 iCloud 同步，您的数据将存储在您的个人 iCloud 空间中，我们无法访问这些数据。</p>
    </div>
  );

  return (
    <motion.main
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 bg-background z-[110] flex flex-col"
    >
      <AnimatePresence mode="wait">
        {currentView === 'main' && renderMainView()}
        {currentView === 'version' && renderSubView('版本信息', versionContent)}
        {currentView === 'help' && renderSubView('帮助与反馈', helpContent)}
        {currentView === 'terms' && renderSubView('用户协议', termsContent)}
        {currentView === 'privacy' && renderSubView('隐私政策', privacyContent)}
      </AnimatePresence>
    </motion.main>
  );
}
