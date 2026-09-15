import React, { useState, useEffect } from 'react';
import type { 
  UpazilaProfile, 
  UnionItem, 
  GovernmentNotice, 
  SponsoredCampaign,
  OfficeOfficerItem
} from '../types';
import { useLanguage } from '../context/LanguageContext';
import { subscribeOfficeDirectory, getDefaultOfficeOfficers } from '../services/dataService';
import { 
  ArrowLeft, 
  Calendar, 
  ExternalLink, 
  Download, 
  Phone, 
  Mail,
  MapPin, 
  Clock, 
  Building2, 
  Layers, 
  Sparkles, 
  Globe, 
  Landmark, 
  Award, 
  FileCheck, 
  CreditCard,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface CategoryViewProps {
  categoryId: string;
  profile: UpazilaProfile | null;
  unions: UnionItem[];
  notices: GovernmentNotice[];
  campaigns: SponsoredCampaign[];
  onBack: () => void;
  onSelectUnion: (union: UnionItem) => void;
  onSelectNotice: (notice: GovernmentNotice) => void;
  onSelectCampaign: (campaign: SponsoredCampaign) => void;
  onOpenSponsorGuidelines: () => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  categoryId,
  profile,
  unions,
  notices,
  campaigns,
  onBack,
  onSelectUnion,
  onSelectNotice,
  onSelectCampaign,
  onOpenSponsorGuidelines
}) => {
  const { lang, t } = useLanguage();

  const [officers, setOfficers] = useState<OfficeOfficerItem[]>(() => getDefaultOfficeOfficers());

  useEffect(() => {
    const unsub = subscribeOfficeDirectory((list) => {
      if (list && list.length > 0) {
        setOfficers(list.filter(o => o.active !== false));
      }
    });
    return () => unsub();
  }, []);

  const publishedUnions = unions.filter(u => u.status === 'Published');
  const publishedNotices = notices.filter(n => n.status === 'Published');
  
  // Filter active, verified, approved, published commercial campaigns
  const todayStr = new Date().toISOString().split('T')[0];
  const activeCampaigns = campaigns.filter(c => {
    return (
      c.publication_status === 'Published' &&
      c.payment_status === 'Verified' &&
      c.approval_status === 'Approved' &&
      (!c.campaign_end_date || c.campaign_end_date >= todayStr)
    );
  });

  const doctorsAndHospitals = activeCampaigns.filter(c => 
    ['Doctor', 'Hospital', 'Clinic', 'Diagnostic', 'Pharmacy'].includes(c.advertiser_type)
  );

  const shopsAndBusinesses = activeCampaigns.filter(c => 
    ['Shop', 'Business'].includes(c.advertiser_type)
  );

  return (
    <div className="w-full min-h-[750px] bg-slate-50 flex flex-col">
      {/* Top App Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition active:scale-95"
            title={t('back')}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              {categoryId === 'profile' && t('catProfile')}
              {categoryId === 'unions' && t('catUnions')}
              {categoryId === 'notices' && t('catNotices')}
              {categoryId === 'links' && t('catLinks')}
              {categoryId === 'doctors' && t('catDoctors')}
              {categoryId === 'shops' && t('catShops')}
              {categoryId === 'office_directory' && (lang === 'bn' ? 'অফিস ও কর্মকর্তা ডিরেক্টরি' : 'Office & Officers Directory')}
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">
              {categoryId === 'profile' && t('catProfileSub')}
              {categoryId === 'unions' && t('catUnionsSub')}
              {categoryId === 'notices' && t('catNoticesSub')}
              {categoryId === 'links' && t('catLinksSub')}
              {categoryId === 'doctors' && t('catDoctorsSub')}
              {categoryId === 'shops' && t('catShopsSub')}
              {categoryId === 'office_directory' && (lang === 'bn' ? 'উপজেলা প্রশাসন, বিভিন্ন দপ্তর ও দায়িত্বপ্রাপ্ত কর্মকর্তাবৃন্দ' : 'Upazila Administration & Departmental Officers')}
            </p>
          </div>
        </div>

        {(categoryId === 'doctors' || categoryId === 'shops') && (
          <button
            onClick={onOpenSponsorGuidelines}
            className="text-[10px] font-bold text-orange-700 bg-orange-100 hover:bg-orange-200 px-2 py-1 rounded-lg transition"
          >
            {lang === 'bn' ? 'বিজ্ঞাপন দিন' : 'Advertise'}
          </button>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 space-y-4 flex-1">
        
        {/* 1. UPAZILA PROFILE VIEW */}
        {categoryId === 'profile' && profile && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-teal-800 to-emerald-900 text-white p-5 rounded-3xl shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                {profile.division_bn} বিভাগ • {profile.district_bn} জেলা
              </span>
              <h2 className="text-xl font-bold mt-2 font-['Hind_Siliguri',sans-serif]">
                {lang === 'bn' ? profile.name_bn : profile.name_en} উপজেলা
              </h2>
              <p className="text-xs text-teal-100 mt-1">
                {lang === 'bn' ? profile.tagline_bn : profile.tagline_en}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 text-xs leading-relaxed">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{lang === 'bn' ? 'সংক্ষিপ্ত বিবরণ' : 'Description'}</h3>
                <p className="text-slate-600">{lang === 'bn' ? profile.description_bn : profile.description_en}</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm mb-1">{lang === 'bn' ? 'ইতিহাস ও মুক্তিযুদ্ধ' : 'History & Heritage'}</h3>
                <p className="text-slate-600">{lang === 'bn' ? profile.history_bn : profile.history_en}</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm mb-1">{lang === 'bn' ? 'ভৌগোলিক অবস্থান ও সীমানা' : 'Geography'}</h3>
                <p className="text-slate-600">{lang === 'bn' ? profile.geography_bn : profile.geography_en}</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm mb-1">{lang === 'bn' ? 'প্রশাসনিক কাঠামো' : 'Administration'}</h3>
                <p className="text-slate-600">{lang === 'bn' ? profile.administration_bn : profile.administration_en}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-sm font-bold text-teal-800 block">{profile.municipality_count}</span>
                    <span className="text-[10px] text-slate-500">{lang === 'bn' ? 'পৌরসভা' : 'Municipality'}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-sm font-bold text-teal-800 block">{profile.union_count}</span>
                    <span className="text-[10px] text-slate-500">{lang === 'bn' ? 'ইউনিয়ন' : 'Unions'}</span>
                  </div>
                </div>
              </div>

              {profile.important_places_bn && (
                <div className="pt-2 border-t border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{lang === 'bn' ? 'দর্শনীয় স্থানসমূহ' : 'Places of Interest'}</h3>
                  <p className="text-slate-600">{lang === 'bn' ? profile.important_places_bn : profile.important_places_en}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. UNIONS LIST VIEW */}
        {categoryId === 'unions' && (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center justify-between">
              <span>{lang === 'bn' ? 'চৌদ্দগ্রাম উপজেলার সকল ১৩টি ইউনিয়ন' : 'All 13 Unions of Chauddagram Upazila'}</span>
              <span className="font-bold bg-emerald-200 px-2 py-0.5 rounded-full text-[11px]">{publishedUnions.length} টি</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {publishedUnions.map((u) => (
                <div
                  key={u.id}
                  onClick={() => onSelectUnion(u)}
                  className="p-3.5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 shadow-2xs transition flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {u.order}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition">
                        {lang === 'bn' ? u.name_bn : u.name_en}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {lang === 'bn' ? u.name_en : u.name_bn}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-600 transition" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. GOVERNMENT NOTICES VIEW */}
        {categoryId === 'notices' && (
          <div className="space-y-3">
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-900 flex items-center justify-between">
              <div>
                <p className="font-bold">{lang === 'bn' ? 'সরকারি ওয়েবসাইট থেকে লাইভ সংগৃহীত নোটিশ' : 'Live Synced Government Notices'}</p>
                <p className="text-[10px] text-sky-700">উৎস: chauddagram.comilla.gov.bd/pages/notices</p>
              </div>
              <span className="font-bold bg-sky-200 px-2 py-0.5 rounded-full text-[11px]">{publishedNotices.length}</span>
            </div>

            <div className="space-y-2">
              {publishedNotices.map((n) => (
                <div
                  key={n.id}
                  onClick={() => onSelectNotice(n)}
                  className="p-3.5 bg-white border border-slate-200 rounded-2xl hover:border-teal-500 shadow-2xs transition cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-teal-800 transition">
                        {n.source_title_bn}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          <Calendar size={11} />
                          {n.published_date}
                        </span>
                        <span>{n.attribution_bn}</span>
                      </div>
                    </div>

                    {n.original_file_urls && n.original_file_urls.length > 0 && (
                      <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg shrink-0">
                        <Download size={14} />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. OFFICIAL LINKS VIEW */}
        {categoryId === 'links' && (
          <div className="space-y-3">
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900">
              <p className="font-bold">{lang === 'bn' ? 'যাচাইকৃত গুরুত্বপূর্ণ সরকারি ওয়েবসাইট লিংক' : 'Verified Official Government Portals'}</p>
              <p className="text-[10px] text-indigo-700 mt-0.5">নাগরিক সেবাসমূহ সরাসরি সরকারি পোর্টালে পেতে নিচের লিংকে প্রবেশ করুন।</p>
            </div>

            <div className="space-y-2">
              {[
                { title: 'চৌদ্দগ্রাম উপজেলা সরকারি পোর্টাল', url: 'https://chauddagram.comilla.gov.bd', desc: 'উপজেলা প্রশাসন ও নাগরিক সেবাসমূহ' },
                { title: 'কুমিল্লা জেলা প্রশাসন পোর্টাল', url: 'https://comilla.gov.bd', desc: 'জেলা প্রশাসন ও সার্কিট হাউস তথ্য' },
                { title: 'বাংলাদেশ জাতীয় তথ্য বাতায়ন', url: 'https://bangladesh.gov.bd', desc: 'এক ঠিকানায় সকল সরকারি সেবা' },
                { title: 'জন্ম ও মৃত্যু নিবন্ধন (BDRIS)', url: 'https://bdris.gov.bd', desc: 'অনলাইন জন্ম ও মৃত্যু সনদ আবেদন ও যাচাই' },
                { title: 'ভূমি সেবা ও ই-নামজারি পোর্টাল', url: 'https://land.gov.bd', desc: 'খতিয়ান, পরচা ও ই-নামজারি সেবা' },
                { title: 'জাতীয় পরিচয়পত্র সেবা (NID Wing)', url: 'https://services.nidw.gov.bd', desc: 'ভোটার নিবন্ধন ও আইডি কার্ড সংশোধন' }
              ].map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-400 shadow-2xs transition flex items-center justify-between group"
                >
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-800 transition">{link.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{link.desc}</p>
                    <span className="text-[10px] text-teal-700 font-mono mt-1 block">{link.url}</span>
                  </div>
                  <ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 5. DOCTORS & HOSPITALS (COMMERCIAL SPONSORED LISTINGS ONLY) */}
        {categoryId === 'doctors' && (
          <div className="space-y-3">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold bg-orange-600 text-white px-1.5 py-0.2 rounded uppercase">
                    বিজ্ঞাপন / Sponsored
                  </span>
                  <h2 className="text-xs font-bold text-rose-950">{t('catDoctors')}</h2>
                </div>
                <p className="text-[11px] text-rose-800 mt-1">
                  {lang === 'bn' ? 'যাচাইকৃত ডাক্তার, হাসপাতাল ও ডায়াগনস্টিক চেম্বার' : 'Verified Doctor & Medical Practice Listings'}
                </p>
              </div>

              <button
                onClick={onOpenSponsorGuidelines}
                className="text-[11px] font-bold text-rose-800 underline shrink-0"
              >
                {lang === 'bn' ? 'বিজ্ঞাপন দিন' : 'Advertise'}
              </button>
            </div>

            {doctorsAndHospitals.length > 0 ? (
              doctorsAndHospitals.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectCampaign(item)}
                  className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-rose-400 shadow-2xs transition cursor-pointer space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[8px] font-bold bg-orange-600 text-white px-1.5 py-0.2 rounded uppercase">
                        {t('sponsoredBadge')}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 mt-1">{item.title_bn}</h3>
                      <p className="text-[11px] text-teal-700 font-semibold">{item.specialty_bn}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {item.advertiser_type}
                    </span>
                  </div>

                  {item.chamber_days && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock size={12} className="text-slate-400" />
                      <span>{item.chamber_days} ({item.chamber_start_time || ''})</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="font-mono text-slate-600 font-bold">{item.phone}</span>
                    <span className="text-rose-700 font-bold flex items-center gap-0.5">
                      {lang === 'bn' ? 'বিস্তারিত' : 'Details'}
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div 
                onClick={onOpenSponsorGuidelines}
                className="p-6 bg-white border-2 border-dashed border-rose-200 rounded-2xl text-center cursor-pointer hover:border-rose-400 transition"
              >
                <Sparkles size={24} className="text-rose-500 mx-auto mb-2" />
                <h3 className="text-xs font-bold text-slate-900">
                  {lang === 'bn' ? 'আপনার চেম্বার বা হাসপাতালের বিজ্ঞাপন দিন' : 'Advertise Your Clinic or Practice'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  {lang === 'bn' 
                    ? 'কোনো ফেক বা অনুমাননির্ভর ডাক্তার তথ্য প্রদান করা হয় না। শুধুমাত্র অনুমোদিত ও যাচাইকৃত বাণিজ্যিক প্রচারণা এখানে প্রকাশিত হয়।' 
                    : 'No fake data. Verified commercial sponsored listings only.'}
                </p>
                <span className="inline-block mt-3 px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-xs">
                  {lang === 'bn' ? 'বিজ্ঞাপন নির্দেশিকা দেখুন' : 'View Guidelines'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 6. SHOPS & BUSINESSES (COMMERCIAL SPONSORED LISTINGS ONLY) */}
        {categoryId === 'shops' && (
          <div className="space-y-3">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold bg-orange-600 text-white px-1.5 py-0.2 rounded uppercase">
                    বিজ্ঞাপন / Sponsored
                  </span>
                  <h2 className="text-xs font-bold text-amber-950">{t('catShops')}</h2>
                </div>
                <p className="text-[11px] text-amber-800 mt-1">
                  {lang === 'bn' ? 'চৌদ্দগ্রামের স্থানীয় দোকান, মার্কেট ও ব্যবসা প্রতিষ্ঠান' : 'Local Business & Merchant Directory'}
                </p>
              </div>

              <button
                onClick={onOpenSponsorGuidelines}
                className="text-[11px] font-bold text-amber-800 underline shrink-0"
              >
                {lang === 'bn' ? 'বিজ্ঞাপন দিন' : 'Advertise'}
              </button>
            </div>

            {shopsAndBusinesses.length > 0 ? (
              shopsAndBusinesses.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectCampaign(item)}
                  className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-amber-400 shadow-2xs transition cursor-pointer space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[8px] font-bold bg-orange-600 text-white px-1.5 py-0.2 rounded uppercase">
                        {t('sponsoredBadge')}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 mt-1">{item.title_bn}</h3>
                      <p className="text-[11px] text-slate-500">{item.address_bn}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {item.advertiser_type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="font-mono text-slate-600 font-bold">{item.phone}</span>
                    <span className="text-amber-700 font-bold flex items-center gap-0.5">
                      {lang === 'bn' ? 'বিস্তারিত' : 'Details'}
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div 
                onClick={onOpenSponsorGuidelines}
                className="p-6 bg-white border-2 border-dashed border-amber-200 rounded-2xl text-center cursor-pointer hover:border-amber-400 transition"
              >
                <Sparkles size={24} className="text-amber-500 mx-auto mb-2" />
                <h3 className="text-xs font-bold text-slate-900">
                  {lang === 'bn' ? 'আপনার ব্যবসা বা দোকানের তথ্য প্রচার করুন' : 'Advertise Your Local Business'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  {lang === 'bn'
                    ? 'চৌদ্দগ্রামের গ্রাহকদের কাছে আপনার পণ্যের তথ্য পৌঁছে দিন।'
                    : 'Reach citizens across 13 unions of Chauddagram with verified commercial listing.'}
                </p>
                <span className="inline-block mt-3 px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs">
                  {lang === 'bn' ? 'বিজ্ঞাপন নির্দেশিকা দেখুন' : 'View Guidelines'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 7. OFFICE & OFFICER DIRECTORY */}
        {categoryId === 'office_directory' && (
          <div className="space-y-3">
            <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Building2 size={16} className="text-teal-700" />
                  <h2 className="text-xs font-bold text-teal-950">উপজেলা দপ্তর ও কর্মকর্তা তালিকা</h2>
                </div>
                <p className="text-[11px] text-teal-800 mt-0.5">
                  চৌদ্দগ্রাম উপজেলা প্রশাসন ও সরকারি বিভাগসমূহের সরাসরি যোগাযোগ নম্বর
                </p>
              </div>
              <span className="text-[10px] font-bold bg-teal-700 text-white px-2 py-0.5 rounded-full shrink-0">
                {officers.length}টি দপ্তর
              </span>
            </div>

            <div className="space-y-2.5">
              {officers.map((officer) => (
                <div
                  key={officer.id}
                  className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-teal-400 transition space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                        <Building2 size={20} className="text-teal-700" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 leading-snug">{officer.office_name_bn}</h3>
                        <p className="text-xs font-semibold text-teal-800 mt-0.5">{officer.officer_name_bn}</p>
                        <p className="text-[11px] text-slate-500">{officer.designation_bn} • {officer.department_bn}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-1 gap-1.5 text-[11px] text-slate-600">
                    {officer.room_no && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <span className="font-semibold text-slate-700">কক্ষ / ঠিকানা:</span>
                        <span>{officer.room_no}</span>
                      </div>
                    )}
                    {officer.email && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <Mail size={12} className="text-slate-400 shrink-0" />
                        <span className="font-mono">{officer.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">{officer.phone}</span>
                    <a
                      href={`tel:${officer.phone.replace(/[^0-9+]/g, '')}`}
                      className="flex items-center gap-1 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
                    >
                      <Phone size={13} />
                      <span>কল করুন</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
