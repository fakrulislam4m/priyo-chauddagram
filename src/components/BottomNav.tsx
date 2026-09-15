import React from 'react';
import { Home, LayoutGrid, MessageSquare, Droplet, User } from 'lucide-react';
import { useSafeAreaInsets } from '../hooks/useSafeAreaInsets';

export type TabKey = 'home' | 'services' | 'chat' | 'blood' | 'profile';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  unreadChatCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ 
  activeTab, 
  onTabChange,
  unreadChatCount = 0 
}) => {
  const insets = useSafeAreaInsets();

  // If virtual keyboard is open (e.g. typing in chat or input), hide bottom navigation so it doesn't overlap
  if (insets.isKeyboardOpen) {
    return null;
  }

  const NAV_ITEMS = [
    { key: 'home' as TabKey, label: 'হোম', icon: Home },
    { key: 'services' as TabKey, label: 'সেবা', icon: LayoutGrid },
    { key: 'chat' as TabKey, label: 'লাইভ চ্যাট', icon: MessageSquare, badge: unreadChatCount > 0 },
    { key: 'blood' as TabKey, label: 'রক্ত', icon: Droplet, isBlood: true },
    { key: 'profile' as TabKey, label: 'প্রোফাইল', icon: User }
  ];

  // Dynamic bottom padding: calculated dynamically from insets.bottom and env(safe-area-inset-bottom)
  const bottomPaddingPx = Math.max(8, insets.bottom);

  return (
    <nav 
      aria-label="Bottom Navigation" 
      style={{
        paddingBottom: `${bottomPaddingPx}px`,
        paddingTop: '6px'
      }}
      className="sticky bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 transition-all"
    >
      <div className="flex items-center justify-around max-w-md mx-auto w-full">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 min-w-0 py-1 px-1 flex flex-col items-center justify-center relative transition-all active:scale-95 group focus:outline-none ${
                isActive ? 'text-[#087F68]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon 
                  size={21} 
                  className={`transition-transform duration-150 shrink-0 ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  } ${
                    item.isBlood && isActive 
                      ? 'text-[#C73E4D] fill-[#C73E4D]' 
                      : item.isBlood 
                      ? 'text-[#C73E4D]' 
                      : isActive 
                      ? 'text-[#087F68]' 
                      : 'text-slate-500'
                  }`} 
                />

                {item.badge && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                )}
              </div>

              {/* Explicit whitespace-nowrap, anti-overflow, clear Bengali typography */}
              <span className={`text-[11px] tracking-tight mt-1 whitespace-nowrap leading-none transition-colors ${
                isActive 
                  ? item.isBlood 
                    ? 'font-bold text-[#C73E4D]' 
                    : 'font-bold text-[#087F68]' 
                  : 'font-medium text-slate-500'
              }`}>
                {item.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <span className={`w-1.5 h-1 rounded-full mt-1 ${
                  item.isBlood ? 'bg-[#C73E4D]' : 'bg-[#087F68]'
                }`}></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
