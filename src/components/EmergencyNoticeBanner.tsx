import React from 'react';
import type { GovernmentNotice } from '../types';
import { AlertCircle, ChevronRight, BellRing, Sparkles } from 'lucide-react';

interface EmergencyNoticeBannerProps {
  notices: GovernmentNotice[];
  onSelectNotice?: (notice: GovernmentNotice) => void;
  onViewAllNotices?: () => void;
}

export const EmergencyNoticeBanner: React.FC<EmergencyNoticeBannerProps> = ({ 
  notices, 
  onSelectNotice,
  onViewAllNotices
}) => {
  // Find high priority emergency notice or take the latest
  const emergencyNotice = notices.find(n => n.priority === 'high') || notices[0];

  if (!emergencyNotice) {
    return (
      <div className="mx-3.5 mt-3 p-3 bg-amber-50/90 border border-amber-200/90 rounded-2xl shadow-2xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <BellRing size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded">
                জরুরি ঘোষণা
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 mt-0.5">
              উপজেলা প্রশাসন: হাম-রুবেলা টিকাদান ক্যাম্পেইন চলমান
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-3.5 mt-3 p-3 bg-gradient-to-r from-amber-50 via-rose-50/40 to-amber-50 border border-amber-200 rounded-2xl shadow-2xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle size={17} className="text-amber-700" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9.5px] font-extrabold uppercase tracking-wide bg-amber-600 text-white px-2 py-0.5 rounded-full">
                জরুরি ঘোষণা
              </span>
              <span className="text-[10px] text-slate-500">
                {emergencyNotice.issuing_department || 'উপজেলা প্রশাসন'}
              </span>
            </div>

            <h3 
              onClick={() => onSelectNotice?.(emergencyNotice)}
              className="text-xs font-bold text-[#17332D] mt-1 leading-snug hover:text-[#087F68] cursor-pointer transition-colors line-clamp-1"
            >
              {emergencyNotice.title_bn || emergencyNotice.source_title_bn}
            </h3>

            <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
              {emergencyNotice.description_bn || emergencyNotice.attribution_bn || 'উপজেলা প্রশাসনের সরকারি নির্দেশনা ও ঘোষণা'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onSelectNotice ? onSelectNotice(emergencyNotice) : onViewAllNotices?.()}
          className="p-1.5 rounded-xl hover:bg-amber-100/80 text-amber-900 shrink-0 self-center transition-colors"
          title="বিস্তারিত পড়ুন"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
