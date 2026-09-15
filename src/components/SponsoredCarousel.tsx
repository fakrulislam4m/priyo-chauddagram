import React, { useState } from 'react';
import type { SponsoredCampaign } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Stethoscope, 
  Store, 
  ChevronRight, 
  ChevronLeft, 
  ExternalLink 
} from 'lucide-react';

interface SponsoredCarouselProps {
  campaigns: SponsoredCampaign[];
  onSelectCampaign: (campaign: SponsoredCampaign) => void;
  onOpenSponsorInfo: () => void;
}

export const SponsoredCarousel: React.FC<SponsoredCarouselProps> = ({ 
  campaigns, 
  onSelectCampaign,
  onOpenSponsorInfo
}) => {
  const { lang, t } = useLanguage();
  const [scrollIdx, setScrollIdx] = useState(0);

  // Filter: ONLY campaigns with Verified payment, Approved status, Published status, and active dates!
  const todayStr = new Date().toISOString().split('T')[0];
  const activeCampaigns = campaigns.filter(c => {
    return (
      c.publication_status === 'Published' &&
      c.payment_status === 'Verified' &&
      c.approval_status === 'Approved' &&
      (!c.campaign_end_date || c.campaign_end_date >= todayStr)
    );
  });

  return (
    <section aria-label="Sponsored Carousel" className="mx-3 mb-4">
      {/* Bounded Header */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          <h2 className="text-xs font-bold text-slate-800 tracking-tight">
            {lang === 'bn' ? 'স্পন্সরড সেবা ও প্রচারণা' : 'Sponsored Services & Listings'}
          </h2>
          <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
            {t('sponsoredBadge')}
          </span>
        </div>

        <button 
          onClick={onOpenSponsorInfo}
          className="text-[11px] font-semibold text-teal-800 hover:text-teal-900 transition"
        >
          {lang === 'bn' ? 'বিজ্ঞাপন দিন' : 'Advertise Here'}
        </button>
      </div>

      {/* Bounded Horizontal Swipe Area - ONLY this element scrolls horizontally! */}
      <div className="w-full overflow-x-auto no-scrollbar scroll-smooth flex gap-3 pb-1 snap-x snap-mandatory">
        {activeCampaigns.length > 0 ? (
          activeCampaigns.map((item) => {
            const title = lang === 'bn' ? (item.title_bn || item.title_en) : (item.title_en || item.title_bn);
            const address = lang === 'bn' ? (item.address_bn || item.address_en) : (item.address_en || item.address_bn);
            const specialty = lang === 'bn' ? item.specialty_bn : item.specialty_en;

            return (
              <div
                key={item.id}
                onClick={() => onSelectCampaign(item)}
                className="w-[280px] shrink-0 snap-start bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs hover:border-teal-500 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Badge & Type */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {t('sponsoredBadge')}
                    </span>
                    <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full">
                      {item.advertiser_type}
                    </span>
                  </div>

                  {/* Title & Organization */}
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1 leading-snug">
                    {title}
                  </h3>
                  
                  {specialty && (
                    <p className="text-[11px] text-teal-700 font-medium line-clamp-1 mt-0.5">
                      {specialty}
                    </p>
                  )}

                  {/* Chamber / Hours */}
                  {item.chamber_days && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1.5">
                      <Clock size={11} className="shrink-0 text-slate-400" />
                      <span className="line-clamp-1">{item.chamber_days} ({item.chamber_start_time || ''})</span>
                    </div>
                  )}

                  {/* Address */}
                  {address && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                      <MapPin size={11} className="shrink-0 text-slate-400" />
                      <span className="line-clamp-1">{address}</span>
                    </div>
                  )}
                </div>

                {/* Phone action */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {item.phone}
                  </span>
                  <span className="text-[10px] font-bold text-teal-800 flex items-center gap-0.5">
                    {lang === 'bn' ? 'বিস্তারিত' : 'Details'}
                    <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          /* Default Community Sponsored Banner Invitation (No fake data!) */
          <div 
            onClick={onOpenSponsorInfo}
            className="w-full bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-teal-500/10 border border-orange-200/80 rounded-2xl p-4 cursor-pointer hover:border-orange-400 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-bold bg-orange-600 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                  {t('sponsoredBadge')}
                </span>
                <h3 className="text-xs font-bold text-slate-900 mt-1.5">
                  {lang === 'bn' ? 'চৌদ্দগ্রামের ডাক্তার, ক্লিনিক ও ব্যবসা প্রতিষ্ঠানের প্রচারণা' : 'Advertise Your Practice or Local Business Here'}
                </h3>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  {lang === 'bn'
                    ? 'আপনার চেম্বার, হাসপাতাল, ফার্মেসি বা দোকানের তথ্য উপজেলাবাসীর কাছে পৌঁছে দিতে প্রিয় চৌদ্দগ্রামে স্পন্সরড প্রচার করুন।'
                    : 'Reach citizens of Chauddagram Upazila. Verified commercial listing with Priyo Digital Lab.'}
                </p>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-orange-200/60 flex items-center justify-between text-[11px] font-semibold text-orange-800">
              <span>{lang === 'bn' ? 'যোগাযোগ: Priyo Digital Lab (ফখরুল ইসলাম)' : 'Contact: Priyo Digital Lab (Fakrul Islam)'}</span>
              <span className="flex items-center gap-1 underline underline-offset-2">
                {lang === 'bn' ? 'নিয়মাবলী দেখুন' : 'View Guidelines'}
                <ExternalLink size={12} />
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
