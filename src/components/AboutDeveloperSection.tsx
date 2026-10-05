import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { AppLogo } from './AppLogo';
import { ShieldCheck, MapPin, Heart, AlertCircle, Trash2 } from 'lucide-react';

interface AboutDeveloperSectionProps {
  lastUpdated?: string;
  onOpenAccountDeletion?: () => void;
  onOpenInstallModal?: () => void;
}

export const AboutDeveloperSection: React.FC<AboutDeveloperSectionProps> = ({ 
  lastUpdated, 
  onOpenAccountDeletion,
  onOpenInstallModal
}) => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  return (
    <footer aria-label="About and Developer Info" className="mx-3 mb-6 p-5 bg-white border border-slate-200 rounded-3xl shadow-xs text-center">
      <div className="flex justify-center mb-3">
        <AppLogo size="md" />
      </div>

      <h2 className="text-sm font-bold text-slate-900 tracking-tight font-['Hind_Siliguri',sans-serif]">
        {t('appName')} ({t('appNameEn')})
      </h2>
      <p className="text-xs font-semibold text-teal-800 mt-0.5">
        {t('appTagline')}
      </p>

      {/* Location (Full location only in About/Upazila Info as instructed) */}
      <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium my-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/60">
        <MapPin size={12} className="text-teal-700" />
        <span>{t('location')}</span>
      </div>

      {/* Developer & Studio Attribution */}
      <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
        <p className="font-bold text-slate-900 flex items-center justify-center">
          <span>{t('developerLabel')}</span>
        </p>
        <p className="text-[11px] text-teal-800 font-semibold">
          {lang === 'bn' ? 'স্টুডিও / প্রকাশনা: ' : 'Studio & Initiative: '} {t('studio')}
        </p>
      </div>

      {/* Crucial Civic Disclaimer: NOT an official government app */}
      <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/70 rounded-2xl text-[10px] text-amber-950 leading-relaxed text-left flex items-start gap-2">
        <AlertCircle size={14} className="text-amber-700 shrink-0 mt-0.5" />
        <span>{t('disclaimer')}</span>
      </div>

      {/* Last Updated & Version */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
        <span>{t('lastUpdated')}: {lastUpdated ? new Date(lastUpdated).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US') : '১২ সেপ্টেম্বর ২০২৬'}</span>
        <span>Version 1.0.0 (Native)</span>
      </div>

      {/* Account Deletion Request option for logged in users */}
      {user && onOpenAccountDeletion && (
        <div className="mt-4 pt-2 border-t border-slate-100">
          <button
            onClick={onOpenAccountDeletion}
            className="text-[10px] text-rose-600 hover:text-rose-800 underline font-medium inline-flex items-center gap-1"
          >
            <Trash2 size={10} />
            <span>{t('accountDeletion')}</span>
          </button>
        </div>
      )}
    </footer>
  );
};
