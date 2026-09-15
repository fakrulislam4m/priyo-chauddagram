import React from 'react';
import { Droplet, FileCheck, FileText, Truck, Bell, ChevronRight } from 'lucide-react';

interface QuickServicesStripProps {
  onSelectService: (actionKey: string) => void;
}

export const QuickServicesStrip: React.FC<QuickServicesStripProps> = ({ onSelectService }) => {
  const QUICK_ACTIONS = [
    {
      id: 'blood',
      title: 'ব্লাড ডোনার',
      icon: Droplet,
      iconColor: 'text-[#C73E4D]',
      bgColor: 'bg-rose-50 border-rose-200/90',
      badge: 'জরুরি'
    },
    {
      id: 'certificate',
      title: 'নাগরিক সনদ',
      icon: FileCheck,
      iconColor: 'text-[#087F68]',
      bgColor: 'bg-emerald-50 border-emerald-200/90',
      badge: 'অনলাইন'
    },
    {
      id: 'complaint',
      title: 'অভিযোগ দাখিল',
      icon: FileText,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-200/90',
      badge: ''
    },
    {
      id: 'ambulance',
      title: 'অ্যাম্বুলেন্স',
      icon: Truck,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200/90',
      badge: '২৪ ঘণ্টা'
    },
    {
      id: 'notices',
      title: 'নোটিশ বোর্ড',
      icon: Bell,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200/90',
      badge: ''
    }
  ];

  return (
    <div className="mx-3.5 mt-3.5">
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#087F68]"></span>
          <h2 className="text-xs font-bold text-[#17332D]">দ্রুত সেবা</h2>
        </div>
        <span className="text-[10px] text-slate-400 font-semibold">এক ক্লিকে জরুরি সেবা</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {QUICK_ACTIONS.map((act) => {
          const IconComponent = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => onSelectService(act.id)}
              className={`flex-1 min-w-[85px] p-2.5 rounded-2xl border flex flex-col items-center justify-center text-center shadow-2xs active:scale-95 transition-all hover:shadow-xs bg-white ${act.bgColor}`}
            >
              <div className="relative mb-1">
                <IconComponent size={20} className={act.iconColor} />
                {act.badge && (
                  <span className="absolute -top-1.5 -right-3 text-[8px] font-extrabold bg-[#C73E4D] text-white px-1 py-0.2 rounded-full scale-90">
                    {act.badge}
                  </span>
                )}
              </div>
              <span className="text-[10.5px] font-bold text-slate-800 tracking-tight leading-tight whitespace-nowrap">
                {act.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
