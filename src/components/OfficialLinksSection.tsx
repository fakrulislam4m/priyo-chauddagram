import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ExternalLink, Globe, Shield, FileCheck, Award, CreditCard, Landmark } from 'lucide-react';

interface OfficialLinksSectionProps {
  onViewAllLinks?: () => void;
}

export const OfficialLinksSection: React.FC<OfficialLinksSectionProps> = ({ onViewAllLinks }) => {
  const { lang, t } = useLanguage();

  const officialLinks = [
    {
      id: 'chauddagram-portal',
      titleBn: 'চৌদ্দগ্রাম উপজেলা সরকারি পোর্টাল',
      titleEn: 'Chauddagram Upazila Official Portal',
      url: 'https://chauddagram.comilla.gov.bd',
      domain: 'chauddagram.comilla.gov.bd',
      icon: Landmark,
      color: 'text-teal-700 bg-teal-50'
    },
    {
      id: 'comilla-district',
      titleBn: 'কুমিল্লা জেলা প্রশাসন পোর্টাল',
      titleEn: 'Cumilla District Administration',
      url: 'https://comilla.gov.bd',
      domain: 'comilla.gov.bd',
      icon: Globe,
      color: 'text-emerald-700 bg-emerald-50'
    },
    {
      id: 'national-portal',
      titleBn: 'বাংলাদেশ জাতীয় তথ্য বাতায়ন',
      titleEn: 'Bangladesh National Web Portal',
      url: 'https://bangladesh.gov.bd',
      domain: 'bangladesh.gov.bd',
      icon: Shield,
      color: 'text-indigo-700 bg-indigo-50'
    },
    {
      id: 'birth-death',
      titleBn: 'জন্ম ও মৃত্যু নিবন্ধন সেবা (BDRIS)',
      titleEn: 'Birth & Death Registration (BDRIS)',
      url: 'https://bdris.gov.bd',
      domain: 'bdris.gov.bd',
      icon: Award,
      color: 'text-rose-700 bg-rose-50'
    },
    {
      id: 'land-services',
      titleBn: 'ভূমি সেবা ও ই-নামজারি পোর্টাল',
      titleEn: 'Land Services & E-Mutation Portal',
      url: 'https://land.gov.bd',
      domain: 'land.gov.bd',
      icon: FileCheck,
      color: 'text-amber-700 bg-amber-50'
    },
    {
      id: 'nid-services',
      titleBn: 'জাতীয় পরিচয়পত্র সেবা (NID Wing)',
      titleEn: 'National ID Wing (Election Commission)',
      url: 'https://services.nidw.gov.bd',
      domain: 'services.nidw.gov.bd',
      icon: CreditCard,
      color: 'text-sky-700 bg-sky-50'
    }
  ];

  return (
    <section aria-label="Official Government Links" className="mx-3 mb-5">
      <div className="flex items-center justify-between px-1 mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
          <h2 className="text-xs font-bold text-slate-800">
            {t('catLinks')}
          </h2>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">
          {lang === 'bn' ? 'সরাসরি সরকারি লিংক' : 'Direct Gov Portals'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {officialLinks.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-2xs hover:border-indigo-400 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  <Icon size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-800 transition line-clamp-1">
                    {lang === 'bn' ? item.titleBn : item.titleEn}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.domain}
                  </span>
                </div>
              </div>
              <ExternalLink size={13} className="text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2" />
            </a>
          );
        })}
      </div>
    </section>
  );
};
