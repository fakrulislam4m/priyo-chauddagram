import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import { subscribeActivePresence } from '../services/dataService';

interface LiveChatHighlightProps {
  onOpenChat: () => void;
  onOpenFAQ?: () => void;
}

export const LiveChatHighlight: React.FC<LiveChatHighlightProps> = ({ 
  onOpenChat,
  onOpenFAQ
}) => {
  const [activeCount, setActiveCount] = useState<number>(6);

  useEffect(() => {
    const unsub = subscribeActivePresence((count) => {
      setActiveCount(count);
    });
    return () => unsub();
  }, []);

  return (
    <div className="mx-3.5 mt-3.5 p-4 bg-gradient-to-r from-[#075E54] to-[#087F68] rounded-3xl text-white shadow-md relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
              <MessageSquare size={20} className="fill-white/80" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5 font-['Hind_Siliguri',sans-serif]">
                কোনো সাহায্য দরকার?
              </h2>
              <p className="text-[11px] text-emerald-100/90 leading-tight mt-0.5">
                উপজেলার সেবা সম্পর্কে জানতে আমাদের সঙ্গে কথা বলুন।
              </p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-400/30 text-[9.5px] font-bold text-emerald-200 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>এখন অনলাইনে</span>
          </div>
        </div>

        {/* Live Active Citizens Badge */}
        <div className="mt-3 flex items-center gap-1.5 text-[10.5px] text-emerald-100/80 bg-white/10 px-2.5 py-1 rounded-xl w-fit">
          <Users size={12} className="text-emerald-300" />
          <span>বর্তমানে <b>{activeCount} জন</b> নাগরিক ও কর্মকর্তা চ্যাটে সক্রিয়</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-3.5 flex items-center gap-2">
          <button
            onClick={onOpenChat}
            className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white text-[#075E54] rounded-xl text-xs font-extrabold shadow-sm active:scale-95 transition-all hover:bg-emerald-50"
          >
            <span>চ্যাট শুরু করুন</span>
            <ArrowRight size={14} />
          </button>

          <button
            onClick={onOpenChat}
            className="flex items-center justify-center gap-1 px-3 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs font-bold active:scale-95 transition-all"
          >
            <HelpCircle size={14} />
            <span>সাধারণ প্রশ্ন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
