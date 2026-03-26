import { motion } from 'motion/react';

interface TopNavProps {
  title?: string;
  onOpenSettings?: () => void;
}

export function TopNav({ title = '心隙专注', onOpenSettings }: TopNavProps) {
  return (
    <header 
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
      className="fixed top-0 w-full flex justify-between items-center px-6 h-[calc(4rem+env(safe-area-inset-top))] glass-nav z-50 border-b border-outline-variant/5"
    >
      <div className="flex items-center gap-4 mt-2">
        <button 
          onClick={onOpenSettings}
          className="material-symbols-outlined text-primary hover:opacity-80 transition-opacity duration-400 active:scale-95 p-2 -ml-2 rounded-full"
        >
          settings
        </button>
        <h1 className="font-headline font-bold text-primary tracking-wider">
          {title}
        </h1>
      </div>
    </header>
  );
}

interface BottomNavProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
}

export function BottomNav({ activeTab, onChangeTab }: BottomNavProps) {
  const tabs = [
    { id: 'focus', icon: 'timer' },
    { id: 'stats', icon: 'bar_chart' },
    { id: 'profile', icon: 'person' },
  ];

  return (
    <nav 
      style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-8 pt-4 glass-nav rounded-t-[3rem] shadow-[0_-4px_48px_0_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_48px_0_rgba(0,0,0,0.4)] border-t border-outline-variant/10"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-all duration-400 ease-out ${
              isActive
                ? 'bg-primary text-white rounded-full active:scale-90 shadow-lg'
                : 'text-on-surface/40 hover:text-primary'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}
            >
              {tab.icon}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
