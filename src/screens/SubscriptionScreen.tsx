import { motion } from 'motion/react';
import { ChevronLeft, Crown, Check, Zap, Sparkles, ShieldCheck } from 'lucide-react';

interface SubscriptionScreenProps {
  onBack: () => void;
  key?: string | number;
}

const PLANS = [
  {
    id: 'monthly',
    name: '月度会员',
    price: '¥18',
    period: '/月',
    description: '适合短期专注体验',
    features: ['解锁所有拼图', '无限制专注历史', '专属会员标识'],
    popular: false,
  },
  {
    id: 'quarterly',
    name: '季度会员',
    price: '¥45',
    period: '/季',
    description: '建立持久专注习惯',
    features: ['解锁所有拼图', '无限制专注历史', '专属会员标识', '多端数据同步'],
    popular: true,
  },
  {
    id: 'lifetime',
    name: '永久会员',
    price: '¥128',
    period: '',
    description: '终身享受极致专注',
    features: ['解锁所有拼图', '无限制专注历史', '专属会员标识', '多端数据同步', '未来所有新功能'],
    popular: false,
  },
];

export function SubscriptionScreen({ onBack }: SubscriptionScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed inset-0 z-[70] bg-background flex flex-col"
    >
      <header className="flex items-center px-6 h-16 border-b border-outline-variant/10 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-surface-container-high rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-on-surface" />
        </button>
        <h1 className="ml-4 font-headline font-bold text-xl text-on-surface">会员中心</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-4">
          <div className="inline-flex p-3 bg-primary/10 rounded-3xl mb-2">
            <Crown className="w-8 h-8 text-primary fill-primary/20" />
          </div>
          <h2 className="text-3xl font-headline font-black tracking-tight">解锁 Focus Pro</h2>
          <p className="text-on-surface-variant text-sm max-w-[240px] mx-auto">
            加入会员，开启更深度的专注体验，享受所有高级功能。
          </p>
        </div>

        {/* Plans Grid */}
        <div className="space-y-4">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-6 rounded-[2.5rem] border-2 transition-all ${
                plan.popular 
                  ? 'bg-primary/5 border-primary shadow-xl shadow-primary/10' 
                  : 'bg-surface-container-lowest border-outline-variant/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-8 bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  最受欢迎
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-headline font-bold text-lg">{plan.name}</h3>
                  <p className="text-xs text-on-surface-variant">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end">
                    <span className="text-2xl font-headline font-black text-primary">{plan.price}</span>
                    <span className="text-xs text-on-surface-variant font-bold">{plan.period}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-xs text-on-surface-variant">{feature}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-4 rounded-2xl font-headline font-bold text-sm transition-all active:scale-[0.98] ${
                plan.popular 
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                  : 'bg-surface-container-high text-on-surface'
              }`}>
                立即订阅
              </button>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-3 gap-4 py-4">
          {[
            { icon: Zap, label: '极速同步' },
            { icon: Sparkles, label: '专属拼图' },
            { icon: ShieldCheck, label: '隐私保护' },
          ].map((benefit, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-surface-container-low rounded-2xl flex items-center justify-center">
                <benefit.icon className="w-5 h-5 text-on-surface-variant" />
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{benefit.label}</span>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-center text-on-surface-variant/60 leading-relaxed px-4">
          订阅将通过您的应用商店账户扣费。您可以随时在设置中取消订阅。
        </p>
      </div>
    </motion.div>
  );
}
