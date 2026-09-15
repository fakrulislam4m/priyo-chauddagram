import React from 'react';
import type { UpazilaProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Building2, Layers, CheckCircle2, ArrowUpRight } from 'lucide-react';

interface HeroSectionProps {
  profile: UpazilaProfile | null;
  onExploreProfile: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ profile, onExploreProfile }) => {
  const { lang, t } = useLanguage();

  const tagline = lang === 'bn' 
    ? (profile?.tagline_bn || 'আমাদের উপজেলা, আমাদের গর্ব') 
    : (profile?.tagline_en || 'Our Upazila, Our Pride');

  const shortDesc = lang === 'bn'
    ? (profile?.description_bn || 'চৌদ্দগ্রাম বাংলাদেশের কুমিল্লা জেলার দক্ষিণ-পূর্বাংশে অবস্থিত একটি ঐতিহাসিক ও সমৃদ্ধ উপজেলা।')
    : (profile?.description_en || 'Chauddagram is a historic and vibrant upazila in Cumilla district, Bangladesh.');

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-800 text-white p-5 m-3 rounded-3xl shadow-sm border border-teal-600/30">
      {/* Decorative background curves */}
      <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
      <div className="absolute -left-8 -top-8 w-28 h-28 bg-orange-500/10 rounded-full blur-lg pointer-events-none"></div>

      {/* Verified Civic Badge */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-medium text-teal-100 border border-white/10">
          <CheckCircle2 size={12} className="text-emerald-300" />
          <span>{lang === 'bn' ? 'যাচাইকৃত উপজেলা পোর্টাল' : 'Verified Upazila Portal'}</span>
        </div>

        <span className="text-[10px] text-teal-200/90 font-mono">
          {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US') : ''}
        </span>
      </div>

      {/* Main Tagline & Name */}
      <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-['Hind_Siliguri',sans-serif] leading-tight text-white mb-1.5">
        {tagline}
      </h1>

      <p className="text-xs text-teal-50/90 line-clamp-2 leading-relaxed mb-4 font-normal">
        {shortDesc}
      </p>

      {/* Administrative Badges (1 Municipality, 13 Unions) */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/15">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs p-2 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-300 flex items-center justify-center shrink-0">
            <Building2 size={16} />
          </div>
          <div>
            <div className="text-[10px] text-teal-200 leading-none">
              {lang === 'bn' ? 'পৌরসভা' : 'Municipality'}
            </div>
            <div className="text-xs font-bold text-white mt-0.5">
              {lang === 'bn' ? '১টি পৌরসভা' : '1 Municipality'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs p-2 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
            <Layers size={16} />
          </div>
          <div>
            <div className="text-[10px] text-teal-200 leading-none">
              {lang === 'bn' ? 'ইউনিয়ন সংখ্যা' : 'Total Unions'}
            </div>
            <div className="text-xs font-bold text-white mt-0.5">
              {lang === 'bn' ? '১৩টি ইউনিয়ন' : '13 Unions'}
            </div>
          </div>
        </div>
      </div>

      {/* Clickable explore prompt */}
      <button
        onClick={onExploreProfile}
        className="w-full mt-3 py-1.5 px-3 bg-white/15 hover:bg-white/20 active:scale-[0.99] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-white/10"
      >
        <span>{lang === 'bn' ? 'সম্পূর্ণ উপজেলা পরিচিতি পড়ুন' : 'Read Full Upazila Profile'}</span>
        <ArrowUpRight size={14} />
      </button>
    </div>
  );
};
