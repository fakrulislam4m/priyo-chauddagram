import React from 'react';
import { CloudSun, Calendar } from 'lucide-react';

interface WelcomeSectionProps {
  userName?: string;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ userName }) => {
  // Determine Bengali greeting based on time of day
  const hour = new Date().getHours();
  let greeting = 'শুভ সকাল';
  if (hour >= 12 && hour < 16) {
    greeting = 'শুভ দুপুর';
  } else if (hour >= 16 && hour < 19) {
    greeting = 'শুভ বিকেল';
  } else if (hour >= 19 || hour < 5) {
    greeting = 'শুভ সন্ধ্যা';
  }

  // Bengali Date formatting
  const todayBn = new Date().toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="mx-3.5 mt-2.5 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Greeting & subtitle */}
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#17332D]">
              {greeting}, {userName ? userName : 'নাগরিক'}!
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            আপনার এলাকার সব সেবা এক জায়গায়
          </p>
        </div>

        {/* Right: Date & Weather Badge (Compact) */}
        <div className="text-right shrink-0">
          <div className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-800 bg-emerald-50/90 px-2 py-0.5 rounded-lg border border-emerald-100">
            <Calendar size={11} className="text-[#087F68]" />
            <span>{todayBn}</span>
          </div>
          <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500 mt-1">
            <CloudSun size={12} className="text-amber-500" />
            <span>২৯° সে., পরিষ্কার আকাশ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
