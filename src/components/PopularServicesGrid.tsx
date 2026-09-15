import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Droplet, 
  Stethoscope, 
  Sprout, 
  GraduationCap, 
  Landmark, 
  HeartHandshake, 
  Building2, 
  AlertCircle, 
  Map, 
  Compass, 
  Store,
  HelpCircle
} from 'lucide-react';
import { subscribeServiceCards, getDefaultServiceCards } from '../services/dataService';
import type { ServiceCardItem } from '../types';

interface PopularServicesGridProps {
  onSelectService: (serviceKey: string) => void;
}

const ICON_MAP: Record<string, any> = {
  FileText,
  Droplet,
  Stethoscope,
  Sprout,
  GraduationCap,
  Landmark,
  HeartHandshake,
  Building2,
  AlertCircle,
  Map,
  Compass,
  Store
};

export const PopularServicesGrid: React.FC<PopularServicesGridProps> = ({ onSelectService }) => {
  const [services, setServices] = useState<ServiceCardItem[]>(() => getDefaultServiceCards());

  useEffect(() => {
    const unsub = subscribeServiceCards((cards) => {
      if (cards && cards.length > 0) {
        setServices(cards.filter(c => c.active !== false));
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="mx-3.5 mt-4">
      <div className="flex items-center justify-between px-1 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#087F68]"></span>
          <h2 className="text-xs font-bold text-[#17332D]">জনপ্রিয় সেবাসমূহ</h2>
        </div>
        <span className="text-[10px] text-slate-400 font-semibold">{services.length}টি নাগরিক সেবা</span>
      </div>

      {/* 2-Column Responsive Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {services.map((srv) => {
          const IconComponent = ICON_MAP[srv.icon] || FileText;
          return (
            <button
              key={srv.id}
              onClick={() => onSelectService(srv.id)}
              className="p-3 bg-white border border-slate-200/90 hover:border-[#087F68] rounded-2xl shadow-2xs hover:shadow-xs text-left transition-all active:scale-[0.98] group relative flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-1 mb-2">
                <div className={`w-9 h-9 rounded-xl ${srv.bgColor || 'bg-emerald-50/80'} border ${srv.borderColor || 'border-emerald-200/90'} flex items-center justify-center shrink-0`}>
                  <IconComponent size={18} className={srv.iconColor || 'text-emerald-700'} />
                </div>

                {srv.badge && (
                  <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-full ${srv.badgeColor || 'bg-[#087F68] text-white'}`}>
                    {srv.badge}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#17332D] group-hover:text-[#087F68] transition-colors leading-snug">
                  {srv.name_bn}
                </h3>
                <p className="text-[10.5px] text-slate-500 line-clamp-1 mt-0.5 leading-tight">
                  {srv.desc_bn}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
