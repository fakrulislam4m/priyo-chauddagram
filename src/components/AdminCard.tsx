import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Settings, ArrowRight, Lock } from 'lucide-react';

interface AdminCardProps {
  onOpenAdmin: () => void;
  onUnauthorizedClick: () => void;
}

export const AdminCard: React.FC<AdminCardProps> = ({ onOpenAdmin, onUnauthorizedClick }) => {
  const { user, isAdmin, adminName } = useAuth();
  const { lang, t } = useLanguage();

  const handleClick = () => {
    if (isAdmin) {
      onOpenAdmin();
    } else {
      onUnauthorizedClick();
    }
  };

  return (
    <div className="mx-3 mb-3">
      <div 
        onClick={handleClick}
        className={`w-full p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
          isAdmin 
            ? 'bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-teal-500/10 border-orange-300 hover:border-orange-500' 
            : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isAdmin ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'
          }`}>
            {isAdmin ? <ShieldCheck size={20} /> : <Lock size={18} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900">
                {t('adminManagement')}
              </h3>
              {isAdmin ? (
                <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-semibold">
                  {adminName || 'Admin'}
                </span>
              ) : (
                <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                  {lang === 'bn' ? 'সংরক্ষিত' : 'Restricted'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isAdmin 
                ? (lang === 'bn' ? 'তথ্য আপডেট, ইউনিয়ন সম্পাদনা ও বিজ্ঞাপন নিয়ন্ত্রণ করুন' : 'Manage profile, notices, unions and campaigns')
                : (lang === 'bn' ? 'শুধুমাত্র অনুমোদিত এডমিন ইউজারদের জন্য নির্ধারিত' : 'Authorized administration access only')}
            </p>
          </div>
        </div>

        <div className={`p-1.5 rounded-full ${isAdmin ? 'text-orange-600 bg-orange-50' : 'text-slate-400'}`}>
          <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
};
