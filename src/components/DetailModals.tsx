import React, { useState } from 'react';
import type { UpazilaProfile, UnionItem, GovernmentNotice, SponsoredCampaign } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  MapPin, 
  Phone, 
  Clock, 
  ExternalLink, 
  Download, 
  Building2, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  Share2,
  Trash2
} from 'lucide-react';

interface DetailModalsProps {
  // Active modal type
  activeModal: 'none' | 'profile' | 'union' | 'notice' | 'campaign' | 'sponsor_info' | 'access_denied' | 'account_delete';
  selectedUnion: UnionItem | null;
  selectedNotice: GovernmentNotice | null;
  selectedCampaign: SponsoredCampaign | null;
  profile: UpazilaProfile | null;
  onClose: () => void;
  onConfirmDeleteAccount?: () => void;
}

export const DetailModals: React.FC<DetailModalsProps> = ({
  activeModal,
  selectedUnion,
  selectedNotice,
  selectedCampaign,
  profile,
  onClose,
  onConfirmDeleteAccount
}) => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  if (activeModal === 'none') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Close Button */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            <span className="text-xs font-bold text-slate-800">
              {activeModal === 'profile' && (lang === 'bn' ? 'উপজেলা পরিচিতি' : 'Upazila Profile')}
              {activeModal === 'union' && (lang === 'bn' ? 'ইউনিয়ন তথ্য' : 'Union Information')}
              {activeModal === 'notice' && (lang === 'bn' ? 'সরকারি নোটিশ বিস্তারিত' : 'Government Notice')}
              {activeModal === 'campaign' && (lang === 'bn' ? 'স্পন্সরড বিস্তারিত' : 'Sponsored Details')}
              {activeModal === 'sponsor_info' && (lang === 'bn' ? 'বিজ্ঞাপন প্রচার নিয়মাবলী' : 'Advertising Guidelines')}
              {activeModal === 'access_denied' && (lang === 'bn' ? 'প্রবেশাধিকার সংরক্ষিত' : 'Access Denied')}
              {activeModal === 'account_delete' && (lang === 'bn' ? 'একাউন্ট মুছে ফেলা' : 'Delete Account')}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-700 text-xs leading-relaxed">
          
          {/* 1. UPAZILA PROFILE MODAL */}
          {activeModal === 'profile' && profile && (
            <div className="space-y-4">
              <div className="bg-teal-900 text-white p-4 rounded-2xl">
                <h3 className="text-lg font-bold font-['Hind_Siliguri',sans-serif]">
                  {lang === 'bn' ? profile.name_bn : profile.name_en} উপজেলা
                </h3>
                <p className="text-xs text-teal-200 mt-0.5">
                  {lang === 'bn' ? profile.district_bn : profile.district_en}, {lang === 'bn' ? profile.division_bn : profile.division_en}
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-semibold">
                    {profile.municipality_count} {lang === 'bn' ? 'টি পৌরসভা' : 'Municipality'}
                  </span>
                  <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-semibold">
                    {profile.union_count} {lang === 'bn' ? 'টি ইউনিয়ন' : 'Unions'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">{lang === 'bn' ? 'সংক্ষিপ্ত বিবরণ' : 'Description'}</h4>
                <p className="text-slate-600">{lang === 'bn' ? profile.description_bn : profile.description_en}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">{lang === 'bn' ? 'ইতিহাস ও ঐতিহ্য' : 'History'}</h4>
                <p className="text-slate-600">{lang === 'bn' ? profile.history_bn : profile.history_en}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">{lang === 'bn' ? 'ভৌগোলিক অবস্থান' : 'Geography'}</h4>
                <p className="text-slate-600">{lang === 'bn' ? profile.geography_bn : profile.geography_en}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">{lang === 'bn' ? 'প্রশাসনিক কাঠামো' : 'Administration'}</h4>
                <p className="text-slate-600">{lang === 'bn' ? profile.administration_bn : profile.administration_en}</p>
              </div>

              {profile.important_places_bn && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{lang === 'bn' ? 'দর্শনীয় স্থানসমূহ' : 'Places of Interest'}</h4>
                  <p className="text-slate-600">{lang === 'bn' ? profile.important_places_bn : profile.important_places_en}</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={profile.official_website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-teal-700 font-semibold hover:underline"
                >
                  <span>{lang === 'bn' ? 'উপজেলা সরকারি ওয়েবসাইট দেখুন' : 'Visit Official Portal'}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}

          {/* 2. UNION DETAIL MODAL */}
          {activeModal === 'union' && selectedUnion && (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                  {lang === 'bn' ? 'চৌদ্দগ্রামের ইউনিয়ন' : 'Union of Chauddagram'}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {lang === 'bn' ? selectedUnion.name_bn : selectedUnion.name_en}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'bn' ? selectedUnion.name_en : selectedUnion.name_bn}
                </p>
              </div>

              <p className="text-slate-600">
                {lang === 'bn'
                  ? `${selectedUnion.name_bn} চৌদ্দগ্রাম উপজেলার ১৩টি ঐতিহ্যবাহী ইউনিয়নের অন্যতম। এখানে ইউনিয়ন ডিজিটাল সেন্টার, স্বাস্থ্য ও পরিবার কল্যাণ কেন্দ্র এবং স্থানীয় গ্রামীণ অবকাঠামো সক্রিয় রয়েছে।`
                  : `${selectedUnion.name_en} is one of the 13 administrative unions of Chauddagram Upazila with active Union Digital Center and health sub-centers.`}
              </p>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">{lang === 'bn' ? 'উপজেলা:' : 'Upazila:'}</span>
                  <span className="font-semibold text-slate-800">চৌদ্দগ্রাম (Chauddagram)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{lang === 'bn' ? 'জেলা:' : 'District:'}</span>
                  <span className="font-semibold text-slate-800">কুমিল্লা (Cumilla)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{lang === 'bn' ? 'স্ট্যাটাস:' : 'Status:'}</span>
                  <span className="font-semibold text-emerald-700">{selectedUnion.status}</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. GOVERNMENT NOTICE MODAL */}
          {activeModal === 'notice' && selectedNotice && (
            <div className="space-y-3.5">
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl">
                <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wide">
                  {selectedNotice.attribution_bn || 'উৎস: চৌদ্দগ্রাম উপজেলা সরকারি ওয়েবসাইট'}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                  {selectedNotice.source_title_bn}
                </h3>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <Calendar size={13} className="text-sky-700" />
                  <span>{lang === 'bn' ? 'প্রকাশের তারিখ:' : 'Published Date:'} {selectedNotice.published_date || 'সাম্প্রতিক'}</span>
                </div>
              </div>

              {selectedNotice.original_file_urls && selectedNotice.original_file_urls.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 text-[11px] block">
                    {lang === 'bn' ? 'সংযুক্ত নথিপত্র / পিডিএফ:' : 'Attached Documents / PDF:'}
                  </span>
                  {selectedNotice.original_file_urls.map((fileUrl, idx) => (
                    <a
                      key={idx}
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-teal-800 font-semibold hover:bg-teal-50 transition text-[11px]"
                    >
                      <span className="line-clamp-1">{lang === 'bn' ? `ডকুমেন্ট ${idx + 1} ডাউনলোড করুন` : `Download Attachment ${idx + 1}`}</span>
                      <Download size={13} className="text-teal-700" />
                    </a>
                  ))}
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={selectedNotice.original_notice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                >
                  <span>{t('viewOriginalNotice')}</span>
                  <ExternalLink size={13} />
                </a>

                <p className="text-[10px] text-slate-400 text-center">
                  চৌদ্দগ্রাম উপজেলা সরকারি পোর্টাল (chauddagram.comilla.gov.bd) থেকে স্বয়ংক্রিয়ভাবে সংগৃহীত
                </p>
              </div>
            </div>
          )}

          {/* 4. SPONSORED CAMPAIGN MODAL */}
          {activeModal === 'campaign' && selectedCampaign && (
            <div className="space-y-3.5">
              <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-2xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold bg-orange-600 text-white px-2 py-0.5 rounded uppercase">
                    {t('sponsoredBadge')}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {selectedCampaign.advertiser_type}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {lang === 'bn' ? selectedCampaign.title_bn : selectedCampaign.title_en}
                </h3>
                {selectedCampaign.specialty_bn && (
                  <p className="text-xs font-semibold text-teal-700 mt-1">
                    {lang === 'bn' ? selectedCampaign.specialty_bn : selectedCampaign.specialty_en}
                  </p>
                )}
              </div>

              {/* Chamber & Timing */}
              {(selectedCampaign.chamber_days || selectedCampaign.chamber_start_time) && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Clock size={13} className="text-slate-500" />
                    <span>{lang === 'bn' ? 'সাক্ষাৎ / রোগী দেখার সময়:' : 'Consultation Hours:'}</span>
                  </div>
                  <p className="text-slate-600 pl-4">
                    {selectedCampaign.chamber_days} {selectedCampaign.chamber_start_time ? `(${selectedCampaign.chamber_start_time} - ${selectedCampaign.chamber_end_time || ''})` : ''}
                  </p>
                </div>
              )}

              {/* Services */}
              {selectedCampaign.services_bn && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{lang === 'bn' ? 'সেবাসমূহ:' : 'Services:'}</h4>
                  <p className="text-slate-600">{lang === 'bn' ? selectedCampaign.services_bn : selectedCampaign.services_en}</p>
                </div>
              )}

              {/* Address */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <MapPin size={13} className="text-slate-500" />
                  <span>{lang === 'bn' ? 'ঠিকানা ও অবস্থান:' : 'Address:'}</span>
                </div>
                <p className="text-slate-600 pl-4">{lang === 'bn' ? selectedCampaign.address_bn : selectedCampaign.address_en}</p>
              </div>

              {/* Phone call button */}
              {selectedCampaign.phone && (
                <a
                  href={`tel:${selectedCampaign.phone}`}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                >
                  <Phone size={14} />
                  <span>{lang === 'bn' ? `কল করুন: ${selectedCampaign.phone}` : `Call: ${selectedCampaign.phone}`}</span>
                </a>
              )}
            </div>
          )}

          {/* 5. SPONSOR INFORMATION & GUIDELINES MODAL */}
          {activeModal === 'sponsor_info' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
                <h3 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-orange-600" />
                  <span>{lang === 'bn' ? 'বিজ্ঞাপন ও বাণিজ্যিক প্রচারণা নির্দেশিকা' : 'Commercial Advertising Policy'}</span>
                </h3>
                <p className="text-[11px] text-amber-900 mt-1 leading-relaxed">
                  {lang === 'bn'
                    ? 'চৌদ্দগ্রাম উপজেলার ডাক্তার, হাসপাতাল, ক্লিনিক, ডায়াগনস্টিক, ফার্মেসি, শপ এবং স্থানীয় ব্যবসার তথ্য শুধুমাত্র যাচাইকৃত পেইড ক্যাম্পেইন হিসেবে প্রকাশিত হয়।'
                    : 'Listings for doctors, clinics, diagnostics, pharmacies, and shops are commercial sponsored campaigns verified by Priyo Digital Lab.'}
                </p>
              </div>

              <div className="space-y-2 text-[11px] text-slate-600">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">১</span>
                  <span><strong>ক্যাম্পেইন সাবমিশন:</strong> প্রতিষ্ঠান বা ডাক্তারের নাম, চেম্বার শিডিউল, ফোন ও ঠিকানা প্রদান করুন।</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">২</span>
                  <span><strong>পেমেন্ট ভেরিফিকেশন:</strong> নির্দিষ্ট ফি প্রদান করে ট্রানজেকশন রেফারেন্স এডমিনের নিকট জমা দিন।</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">৩</span>
                  <span><strong>এডমিন অনুমোদন ও পাবলিকেশন:</strong> তথ্য যাচাই শেষে এডমিন প্যানেল থেকে লাইভ স্লাইডারে প্রচার শুরু হবে।</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-900 block mb-1">যোগাযোগ ও উদ্যোক্তা:</span>
                <p className="text-slate-700">ফখরুল ইসলাম (Fakrul Islam)</p>
                <p className="text-slate-500 text-[11px]">Priyo Digital Lab, চৌদ্দগ্রাম, কুমিল্লা</p>
                <p className="text-teal-800 font-mono text-[11px] font-bold mt-1">ইমেইল: matelecom.cb71@gmail.com</p>
              </div>
            </div>
          )}

          {/* 6. ACCESS DENIED MODAL */}
          {activeModal === 'access_denied' && (
            <div className="space-y-3 text-center p-2">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={28} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {t('accessDenied')}
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                {t('accessDeniedDesc')}
              </p>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold"
                >
                  {lang === 'bn' ? 'বুঝেছি / বন্ধ করুন' : 'Understood / Close'}
                </button>
              </div>
            </div>
          )}

          {/* 7. ACCOUNT DELETION CONFIRMATION */}
          {activeModal === 'account_delete' && (
            <div className="space-y-3 p-2">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 text-center">
                {lang === 'bn' ? 'একাউন্ট মুছে ফেলার অনুরোধ' : 'Request Account Deletion'}
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed text-center">
                {lang === 'bn'
                  ? `আপনি কি নিশ্চিত যে আপনার একাউন্ট (${user?.email || user?.phoneNumber || ''}) এবং সংশ্লিষ্ট সকল ডেটা স্থায়ীভাবে মুছে ফেলতে চান?`
                  : `Are you sure you want to permanently delete your account and associated session data?`}
              </p>

              <div className="pt-3 flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={() => {
                    if (onConfirmDeleteAccount) onConfirmDeleteAccount();
                    onClose();
                  }}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
