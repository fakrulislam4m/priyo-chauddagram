import React from 'react';
import type { GovernmentNotice } from '../types';
import { Bell, Calendar, ChevronRight, ArrowRight } from 'lucide-react';

interface LatestNoticesSectionProps {
  notices: GovernmentNotice[];
  onSelectNotice: (notice: GovernmentNotice) => void;
  onViewAllNotices: () => void;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  জরুরি: { bg: 'bg-rose-100', text: 'text-rose-800', label: 'জরুরি' },
  স্বাস্থ্য: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'স্বাস্থ্য' },
  শিক্ষা: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'শিক্ষা' },
  প্রশাসন: { bg: 'bg-teal-100', text: 'text-teal-800', label: 'প্রশাসন' },
  নিয়োগ: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'নিয়োগ' },
  টেন্ডার: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'টেন্ডার' },
  'সামাজিক নিরাপত্তা': { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'সামাজিক নিরাপত্তা' },
};

export const LatestNoticesSection: React.FC<LatestNoticesSectionProps> = ({
  notices,
  onSelectNotice,
  onViewAllNotices
}) => {
  const latestThree = notices.slice(0, 3);

  return (
    <div className="mx-3.5 mt-4">
      <div className="flex items-center justify-between px-1 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#087F68]"></span>
          <h2 className="text-xs font-bold text-[#17332D]">সর্বশেষ নোটিশ</h2>
        </div>
        <button
          onClick={onViewAllNotices}
          className="text-xs font-bold text-[#087F68] hover:underline flex items-center gap-0.5"
        >
          <span>সব নোটিশ দেখুন</span>
          <ChevronRight size={13} />
        </button>
      </div>

      <div className="space-y-2.5">
        {latestThree.map((notice) => {
          const cat = notice.category || 'প্রশাসন';
          const style = CATEGORY_STYLES[cat] || { bg: 'bg-slate-100', text: 'text-slate-800', label: cat };

          return (
            <div
              key={notice.id}
              onClick={() => onSelectNotice(notice)}
              className="p-3 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-[#087F68] transition-all cursor-pointer group flex items-start justify-between gap-2"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                    {style.label}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                    <Calendar size={10} />
                    {notice.published_date || notice.date || 'আজ'}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-[#17332D] group-hover:text-[#087F68] transition-colors leading-snug line-clamp-1">
                  {notice.title_bn || notice.source_title_bn}
                </h3>

                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {notice.description_bn || notice.attribution_bn || 'উপজেলা প্রশাসনের নোটিশ ও বিজ্ঞপ্তি'}
                </p>
              </div>

              <div className="p-1 rounded-xl group-hover:bg-slate-100 text-slate-400 group-hover:text-[#087F68] self-center shrink-0">
                <ChevronRight size={16} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
