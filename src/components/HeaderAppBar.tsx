import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AppLogo } from './AppLogo';
import { Globe, Settings, User as UserIcon, LogOut, ShieldAlert, MessageSquare, Bell, Smartphone } from 'lucide-react';

interface HeaderAppBarProps {
  onOpenAdmin: () => void;
  onOpenProfile: () => void;
  onOpenChat?: () => void;
  onOpenNotifications?: () => void;
  onOpenInstallModal?: () => void;
  unreadNoticeCount?: number;
}

export const HeaderAppBar: React.FC<HeaderAppBarProps> = ({ 
  onOpenAdmin, 
  onOpenProfile, 
  onOpenChat,
  onOpenNotifications,
  onOpenInstallModal,
  unreadNoticeCount = 3
}) => {
  const { user, isAdmin, setAuthView, logout } = useAuth();
  const { lang, toggleLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between shadow-xs">
      {/* Brand & Logo (NO "কুমিল্লা" beside app name in main header as instructed) */}
      <div className="flex items-center gap-2">
        <AppLogo size="sm" />
        <div className="flex flex-col">
          <span className="text-base sm:text-lg font-extrabold text-[#17332D] tracking-tight leading-none font-['Hind_Siliguri',sans-serif]">
            {t('appName')}
          </span>
          <span className="text-[9.5px] font-bold text-[#087F68] uppercase tracking-wider leading-none mt-0.5">
            {lang === 'bn' ? 'আমাদের উপজেলা, আমাদের গর্ব' : 'Our Upazila, Our Pride'}
          </span>
        </div>
      </div>

      {/* Right Controls: Notifications, Language Switcher, Admin Gear (if admin), Profile/Auth */}
      <div className="flex items-center gap-1.5">
        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95 relative"
          title="নোটিফিকেশন ও ঘোষণা"
        >
          <Bell size={16} />
          {unreadNoticeCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C73E4D] text-white rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-white">
              {unreadNoticeCount}
            </span>
          )}
        </button>

        {/* Mobile Trial & App Install Button */}
        {onOpenInstallModal && (
          <button
            onClick={onOpenInstallModal}
            className="p-1.5 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 transition active:scale-95 relative"
            title="মোবাইলে অ্যাপ ট্রায়াল বা ইনস্টল করুন"
          >
            <Smartphone size={16} />
          </button>
        )}

        {/* Language Switcher */}
        <button
          onClick={toggleLang}
          className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-teal-900 rounded-full text-xs font-semibold transition active:scale-95"
          title="ভাষা পরিবর্তন করুন / Switch Language"
        >
          <Globe size={13} className="text-[#087F68]" />
          <span className="text-[10px] font-bold">{lang === 'bn' ? 'EN' : 'বাং'}</span>
        </button>

        {/* Visible Admin Management Icon for authorized admins */}
        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className="p-1.5 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-full transition active:scale-95 relative"
            title={t('adminManagement')}
          >
            <Settings size={16} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
          </button>
        )}

        {/* User Account / Profile / Login */}
        {user ? (
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1 p-1 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-full text-xs font-semibold text-teal-900 transition"
            title={user.displayName || user.email || 'Profile'}
          >
            <div className="w-6 h-6 rounded-full bg-[#087F68] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
              {(user.displayName || user.email || 'U')[0].toUpperCase()}
            </div>
          </button>
        ) : (
          <button
            onClick={() => setAuthView('chooser')}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#087F68] hover:bg-[#075E54] text-white rounded-full text-[11px] font-bold shadow-2xs transition active:scale-95"
          >
            <UserIcon size={12} />
            <span>লগইন</span>
          </button>
        )}
      </div>
    </header>
  );
};

