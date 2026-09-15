import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Building, 
  Layers, 
  FileText, 
  Link2, 
  Stethoscope, 
  Store,
  Sparkles,
  MessageSquare,
  Users
} from 'lucide-react';

interface CategoryGridProps {
  onSelectCategory: (catId: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategory }) => {
  const { lang, t } = useLanguage();

  const categories = [
    {
      id: 'chat',
      icon: MessageSquare,
      labelBn: 'লাইভ আড্ডা ও চ্যাট',
      labelEn: 'Live Chat & Adda',
      color: 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:border-emerald-500 ring-1 ring-emerald-400/30',
      iconColor: 'text-emerald-700',
      isLive: true,
      badge: 'লাইভ'
    },
    {
      id: 'profile',
      icon: Building,
      labelBn: 'উপজেলা পরিচিতি',
      labelEn: 'Upazila Profile',
      color: 'bg-teal-50 text-teal-800 border-teal-200 hover:border-teal-400',
      iconColor: 'text-teal-700'
    },
    {
      id: 'unions',
      icon: Layers,
      labelBn: 'ইউনিয়নসমূহ',
      labelEn: 'Unions',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:border-emerald-400',
      iconColor: 'text-emerald-700'
    },
    {
      id: 'notices',
      icon: FileText,
      labelBn: 'সরকারি নোটিশ',
      labelEn: 'Government Notices',
      color: 'bg-sky-50 text-sky-800 border-sky-200 hover:border-sky-400',
      iconColor: 'text-sky-700'
    },
    {
      id: 'links',
      icon: Link2,
      labelBn: 'গুরুত্বপূর্ণ সরকারি লিংক',
      labelEn: 'Official Links',
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:border-indigo-400',
      iconColor: 'text-indigo-700'
    },
    {
      id: 'doctors',
      icon: Stethoscope,
      labelBn: 'ডাক্তার ও হাসপাতাল',
      labelEn: 'Doctors & Hospitals',
      color: 'bg-rose-50 text-rose-800 border-rose-200 hover:border-rose-400',
      iconColor: 'text-rose-700',
      isSponsored: true
    },
    {
      id: 'shops',
      icon: Store,
      labelBn: 'দোকান ও স্থানীয় ব্যবসা',
      labelEn: 'Shops & Local Businesses',
      color: 'bg-amber-50 text-amber-800 border-amber-200 hover:border-amber-400',
      iconColor: 'text-amber-700',
      isSponsored: true
    }
  ];

  return (
    <section aria-label="Main Categories" className="mx-3 mb-5">
      {/* Prominent Live Adda Quick Banner */}
      <div 
        onClick={() => onSelectCategory('chat')}
        className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-800 text-white shadow-md hover:shadow-lg transition-all cursor-pointer relative overflow-hidden border border-emerald-600/50 active:scale-[0.99] group"
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
              <MessageSquare size={20} className="text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-tight text-white">
                  {lang === 'bn' ? 'চৌদ্দগ্রাম লাইভ আড্ডা' : 'Chauddagram Live Adda'}
                </span>
                <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-[9px] font-bold text-emerald-200 border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-emerald-100/90 mt-0.5">
                {lang === 'bn' 
                  ? '১৩টি ইউনিয়ন ও প্রবাসীদের রিয়েল-টাইম আড্ডাখানা • এখনই যুক্ত হোন' 
                  : 'Real-time live chat for all 13 unions & expats'}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <span className="px-2.5 py-1 rounded-xl bg-white text-emerald-900 text-[11px] font-bold shadow-xs group-hover:bg-emerald-50 transition-colors whitespace-nowrap">
              {lang === 'bn' ? 'আড্ডায় যান' : 'Join Chat'} →
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 mb-2.5">
        <h2 className="text-xs font-bold text-slate-800">
          {lang === 'bn' ? 'মূল সেবাসমূহ' : 'Core Categories'}
        </h2>
        <span className="text-[10px] text-slate-400 font-medium">
          {lang === 'bn' ? '৭টি প্রধান বিভাগ' : '7 Main Sections'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`p-3 rounded-2xl border ${cat.color} transition-all duration-200 text-left flex flex-col justify-between shadow-xs hover:shadow-sm active:scale-[0.98] relative overflow-hidden group`}
            >
              {cat.isSponsored && (
                <div className="absolute top-2 right-2">
                  <span className="text-[8px] font-bold bg-orange-500 text-white px-1.5 py-0.2 rounded uppercase">
                    বিজ্ঞাপন
                  </span>
                </div>
              )}

              {cat.isLive && (
                <div className="absolute top-2 right-2">
                  <span className="text-[8px] font-bold bg-emerald-600 text-white px-1.5 py-0.2 rounded flex items-center gap-0.5 shadow-2xs">
                    <span className="w-1 h-1 rounded-full bg-white animate-pulse"></span>
                    {cat.badge}
                  </span>
                </div>
              )}

              <div className="w-9 h-9 rounded-xl bg-white/80 backdrop-blur-xs flex items-center justify-center mb-2.5 shadow-2xs group-hover:scale-105 transition-transform">
                <Icon size={20} className={cat.iconColor} />
              </div>

              <div>
                <span className="block text-xs font-bold text-slate-900 leading-tight">
                  {cat.labelBn}
                </span>
                <span className="block text-[10px] text-slate-500 font-medium tracking-tight mt-0.5">
                  {cat.labelEn}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

