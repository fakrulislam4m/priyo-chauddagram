import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { X, User as UserIcon, ShieldCheck, LogOut, Trash2, Settings, Mail, Phone } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
  onRequestDeleteAccount: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmin,
  onRequestDeleteAccount
}) => {
  const { user, isAdmin, adminRole, adminName, logout } = useAuth();
  const { lang, t } = useLanguage();

  if (!isOpen) return null;

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X size={18} />
        </button>

        <div className="text-center pb-4 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-teal-800 text-white flex items-center justify-center text-xl font-bold mx-auto shadow-sm">
            {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-2.5">
            {user?.displayName || (lang === 'bn' ? 'সম্মানিত নাগরিক' : 'Citizen')}
          </h3>
          <p className="text-xs text-slate-500 font-mono">
            {user?.email || user?.phoneNumber || 'চৌদ্দগ্রাম ব্যবহারকারী'}
          </p>
          <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800">
            {isAdmin ? `Admin: ${adminRole || 'Primary Admin'}` : (lang === 'bn' ? 'সাধারণ ব্যবহারকারী' : 'Citizen')}
          </div>
        </div>

        <div className="py-3 space-y-2 text-xs">
          {isAdmin && (
            <button
              onClick={() => { onClose(); onOpenAdmin(); }}
              className="w-full p-2.5 bg-orange-50 hover:bg-orange-100 text-orange-900 rounded-xl font-bold flex items-center gap-2 transition"
            >
              <Settings size={16} className="text-orange-600" />
              <span>{t('adminManagement')}</span>
            </button>
          )}

          <button
            onClick={onRequestDeleteAccount}
            className="w-full p-2.5 hover:bg-rose-50 text-rose-700 rounded-xl font-semibold flex items-center gap-2 transition text-left"
          >
            <Trash2 size={16} className="text-rose-600" />
            <span>{t('accountDeletion')}</span>
          </button>
        </div>

        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <LogOut size={14} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
