import React, { useState, useEffect } from 'react';
import { Droplet, Search, UserPlus, ShieldCheck, ChevronRight } from 'lucide-react';
import type { BloodGroup, BloodDonor } from '../types';
import { subscribePublicDonors } from '../services/dataService';

interface BloodDonorHighlightProps {
  onOpenBloodScreen: (preselectedGroup?: BloodGroup) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const BloodDonorHighlight: React.FC<BloodDonorHighlightProps> = ({ onOpenBloodScreen }) => {
  const [donorCount, setDonorCount] = useState<number>(5);

  useEffect(() => {
    const unsub = subscribePublicDonors((list) => {
      setDonorCount(list.length);
    });
    return () => unsub();
  }, []);

  return (
    <div className="mx-3.5 mt-3.5 p-3.5 bg-gradient-to-br from-rose-50/70 via-white to-rose-50/30 border border-rose-200/90 rounded-3xl shadow-2xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#C73E4D] text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Droplet size={20} className="fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold text-[#17332D]">
                জরুরি রক্ত দরকার?
              </h2>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-emerald-100 text-[#087F68] rounded-full text-[9px] font-bold">
                <ShieldCheck size={9} />
                যাচাইকৃত
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              চৌদ্দগ্রামের রক্তের গ্রুপভিত্তিক যাচাইকৃত রক্তদাতাদের তালিকা।
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenBloodScreen()}
          className="text-xs font-bold text-[#C73E4D] flex items-center gap-0.5 hover:underline shrink-0"
        >
          <span>সব দেখুন</span>
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Quick Blood Group Chips */}
      <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {BLOOD_GROUPS.map((grp) => (
          <button
            key={grp}
            onClick={() => onOpenBloodScreen(grp)}
            className="px-2.5 py-1 rounded-xl bg-white border border-rose-200 hover:border-rose-400 hover:bg-rose-50 text-rose-800 text-[11px] font-bold shadow-2xs active:scale-95 transition-all shrink-0 flex items-center gap-1"
          >
            <Droplet size={10} className="fill-rose-500 text-rose-500" />
            <span>{grp}</span>
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-3 pt-2.5 border-t border-rose-100 flex items-center gap-2">
        <button
          onClick={() => onOpenBloodScreen()}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#C73E4D] hover:bg-[#b03442] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
        >
          <Search size={13} />
          <span>রক্তদাতা খুঁজুন</span>
        </button>

        <button
          onClick={() => onOpenBloodScreen()}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white hover:bg-rose-50 text-[#C73E4D] border border-[#C73E4D]/40 rounded-xl text-xs font-bold active:scale-95 transition-all"
        >
          <UserPlus size={13} />
          <span>রক্তদাতা নিবন্ধন</span>
        </button>
      </div>
    </div>
  );
};
