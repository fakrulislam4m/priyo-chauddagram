import React from 'react';
import type { UnionItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Layers, ChevronRight, MapPin } from 'lucide-react';

interface UnionsSectionProps {
  unions: UnionItem[];
  onSelectUnion: (union: UnionItem) => void;
  onViewAllUnions: () => void;
}

export const UnionsSection: React.FC<UnionsSectionProps> = ({ unions, onSelectUnion, onViewAllUnions }) => {
  const { lang, t } = useLanguage();

  // Filter only Published unions
  const publishedUnions = unions.filter(u => u.status === 'Published');

  return (
    <section aria-label="Unions of Chauddagram" className="mx-3 mb-5">
      <div className="flex items-center justify-between px-1 mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
          <h2 className="text-xs font-bold text-slate-800">
            {t('catUnions')}
          </h2>
          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
            {publishedUnions.length} {lang === 'bn' ? 'টি ইউনিয়ন' : 'Unions'}
          </span>
        </div>

        <button
          onClick={onViewAllUnions}
          className="text-[11px] font-semibold text-teal-800 hover:text-teal-900 transition flex items-center gap-0.5"
        >
          <span>{lang === 'bn' ? 'সম্পূর্ণ তালিকা' : 'View List'}</span>
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Clean Grid of 13 Unions - NO serial prefix like '১ নং' as strictly requested! */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {publishedUnions.map((union) => (
          <div
            key={union.id}
            onClick={() => onSelectUnion(union)}
            className="p-2.5 bg-white hover:bg-emerald-50/40 border border-slate-200 rounded-xl shadow-2xs hover:border-emerald-400 transition cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform"></span>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-none">
                  {lang === 'bn' ? union.name_bn : union.name_en}
                </h3>
                <span className="text-[10px] text-slate-400 leading-none mt-1 block">
                  {lang === 'bn' ? union.name_en : union.name_bn}
                </span>
              </div>
            </div>
            <ChevronRight size={12} className="text-slate-300 group-hover:text-emerald-600 transition" />
          </div>
        ))}
      </div>
    </section>
  );
};
