import React, { useState, useEffect } from 'react';
import type { BloodDonor, BloodGroup, BloodContactRequest, UnionItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  subscribePublicDonors, 
  registerBloodDonor, 
  sendBloodContactRequest,
  toggleDonorAvailability,
  toggleDonorHidden
} from '../services/dataService';
import { 
  Droplet, 
  Search, 
  UserPlus, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  PhoneCall, 
  X, 
  Send, 
  HeartHandshake, 
  Filter, 
  Check, 
  Eye, 
  EyeOff, 
  Info,
  ChevronRight,
  Shield,
  Smartphone
} from 'lucide-react';

interface BloodDonorScreenProps {
  unions?: UnionItem[];
  onBack?: () => void;
  initialGroup?: BloodGroup;
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const BloodDonorScreen: React.FC<BloodDonorScreenProps> = ({ unions = [], onBack, initialGroup }) => {
  const { lang, t } = useLanguage();
  const { user, isAdmin } = useAuth();

  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedGroup, setSelectedGroup] = useState<string>(initialGroup || 'all');
  const [selectedUnion, setSelectedUnion] = useState<string>('all');
  const [availableOnly, setAvailableOnly] = useState<boolean>(true);
  const [eligibleOnly, setEligibleOnly] = useState<boolean>(false); // > 90 days since last donation

  // Update selected group if initialGroup prop changes
  useEffect(() => {
    if (initialGroup) {
      setSelectedGroup(initialGroup);
    }
  }, [initialGroup]);

  // Registration Modal & OTP State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regStep, setRegStep] = useState<'form' | 'otp' | 'success'>('form');
  const [regForm, setRegForm] = useState({
    name: '',
    blood_group: 'A+' as BloodGroup,
    phone: '',
    emergency_phone: '',
    union: unions[0]?.name_bn || 'চৌদ্দগ্রাম পৌরসভা',
    area_address: '',
    last_donation_date: '',
    available_now: true,
    registered_by: 'self' as 'self' | 'friend',
    friend_name: '',
    friend_phone: '',
    consent_agreed: false
  });
  const [regError, setRegError] = useState<string | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpTimer, setOtpTimer] = useState<number>(60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Contact Request Modal State
  const [selectedDonorForContact, setSelectedDonorForContact] = useState<BloodDonor | null>(null);
  const [contactForm, setContactForm] = useState({
    requester_name: '',
    requester_phone: '',
    patient_name: '',
    hospital_name: 'চৌদ্দগ্রাম উপজেলা স্বাস্থ্য কমপ্লেক্স',
    units_needed: 1,
    urgency: 'urgent' as 'critical' | 'urgent' | 'regular',
    message: ''
  });
  const [contactSuccessMsg, setContactSuccessMsg] = useState<string | null>(null);
  const [contactSubmitting, setContactSubmitting] = useState(false);

  // Toast / feedback message
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Subscribe to real-time verified donors
  useEffect(() => {
    const unsub = subscribePublicDonors((list) => {
      setDonors(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // OTP Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (regStep === 'otp' && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [regStep, otpTimer]);

  // Filtered Donors calculation
  const filteredDonors = donors.filter((donor) => {
    if (selectedGroup !== 'all' && donor.blood_group !== selectedGroup) return false;
    if (selectedUnion !== 'all' && !donor.union.includes(selectedUnion) && donor.union !== selectedUnion) return false;
    if (availableOnly && !donor.available_now) return false;
    if (eligibleOnly && donor.last_donation_date) {
      const lastDate = new Date(donor.last_donation_date).getTime();
      const diffDays = (Date.now() - lastDate) / (1000 * 3600 * 24);
      if (diffDays < 90) return false;
    }
    return true;
  });

  // Calculate days since last donation
  const getDonationEligibilityText = (lastDonationDate?: string) => {
    if (!lastDonationDate) return { text: 'নতুন রক্তদাতা (প্রস্তুত)', eligible: true };
    const diffDays = Math.floor((Date.now() - new Date(lastDonationDate).getTime()) / (1000 * 3600 * 24));
    if (diffDays >= 90) {
      return { text: `সর্বশেষ দান: ${diffDays} দিন আগে (উপযুক্ত)`, eligible: true };
    }
    const daysLeft = 90 - diffDays;
    return { text: `সর্বশেষ দান: ${diffDays} দিন আগে (${daysLeft} দিন পর উপযুক্ত)`, eligible: false };
  };

  // Step 1: Submit Form -> Send OTP
  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regForm.name.trim()) {
      setRegError('অনুগ্রহ করে রক্তদাতার নাম লিখুন');
      return;
    }
    if (!regForm.phone.trim() || regForm.phone.replace(/[^0-9]/g, '').length < 11) {
      setRegError('সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন (যেমন: 018XXXXXXXX)');
      return;
    }
    if (!regForm.area_address.trim()) {
      setRegError('এলাকা বা গ্রামের ঠিকানা লিখুন');
      return;
    }
    if (!regForm.consent_agreed) {
      setRegError('জরুরি রক্তদানে তথ্য সংরক্ষণের সম্মতি বক্সে টিক দিন');
      return;
    }
    if (regForm.registered_by === 'friend' && !regForm.friend_name.trim()) {
      setRegError('বন্ধুর নাম ও মোবাইল নম্বর উল্লেখ করুন');
      return;
    }

    // Generate random 6-digit OTP
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    setEnteredOtp('');
    setOtpTimer(60);
    setRegStep('otp');
  };

  // Step 2: Confirm OTP & Save Donor as "Pending Admin Review"
  const handleVerifyOtpAndRegister = async () => {
    if (enteredOtp.trim() !== generatedOtp) {
      setRegError('ওটিপি (OTP) কোড সঠিক নয়। পুনরায় চেষ্টা করুন।');
      return;
    }

    setIsSubmitting(true);
    setRegError(null);
    try {
      await registerBloodDonor({
        name: regForm.name,
        blood_group: regForm.blood_group,
        phone: regForm.phone,
        emergency_phone: regForm.emergency_phone,
        upazila: 'চৌদ্দগ্রাম',
        union: regForm.union,
        area_address: regForm.area_address,
        last_donation_date: regForm.last_donation_date,
        available_now: regForm.available_now,
        registered_by: regForm.registered_by,
        friend_name: regForm.friend_name,
        friend_phone: regForm.friend_phone
      });
      setRegStep('success');
    } catch (err: any) {
      setRegError(err.message || 'নিবন্ধন জমা দিতে ব্যর্থ হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send Contact Request to Donor
  const handleSendContactRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonorForContact) return;

    if (!contactForm.requester_name.trim()) {
      setContactSuccessMsg('অনুগ্রহ করে আপনার নাম লিখুন');
      return;
    }
    if (!contactForm.requester_phone.trim() || contactForm.requester_phone.length < 11) {
      setContactSuccessMsg('১১ ডিজিটের মোবাইল নম্বর দিন');
      return;
    }
    if (!contactForm.patient_name.trim()) {
      setContactSuccessMsg('রোগীর নাম লিখুন');
      return;
    }

    setContactSubmitting(true);
    try {
      await sendBloodContactRequest({
        donor_id: selectedDonorForContact.id,
        donor_name: selectedDonorForContact.name,
        donor_blood_group: selectedDonorForContact.blood_group,
        requester_name: contactForm.requester_name,
        requester_phone: contactForm.requester_phone,
        patient_name: contactForm.patient_name,
        hospital_name: contactForm.hospital_name,
        units_needed: Number(contactForm.units_needed) || 1,
        urgency: contactForm.urgency,
        message: contactForm.message
      });

      setContactSuccessMsg('অনুরোধ সফলভাবে পাঠানো হয়েছে! রক্তদাতা সম্মতি জানালে দ্রুত যোগাযোগ করবেন।');
      setTimeout(() => {
        setSelectedDonorForContact(null);
        setContactSuccessMsg(null);
        setFeedbackToast('যোগাযোগের অনুরোধ পাঠানো সম্পন্ন হয়েছে');
        setTimeout(() => setFeedbackToast(null), 4000);
      }, 2000);
    } catch (err: any) {
      setContactSuccessMsg('অনুরোধ পাঠানো ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[#F7FAF9] pb-8">
      {/* Toast */}
      {feedbackToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#17332D] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg animate-bounce flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Hero / Header Section */}
      <div className="bg-gradient-to-br from-[#075E54] via-[#087F68] to-[#0A6653] text-white px-4 pt-5 pb-6 rounded-b-3xl shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -left-6 -top-6 w-24 h-24 bg-red-500/20 rounded-full blur-lg pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/30 border border-red-300/40 text-[11px] font-bold text-red-100">
              <Droplet size={13} className="text-red-300 fill-red-400 animate-pulse" />
              <span>জরুরি রক্তসেবা হাব</span>
            </div>
            <span className="text-[11px] text-emerald-100 bg-white/10 px-2 py-0.5 rounded-full">
              {donors.length} জন যাচাইকৃত রক্তদাতা
            </span>
          </div>

          <h1 className="text-xl font-extrabold tracking-tight font-['Hind_Siliguri',sans-serif] text-white">
            জরুরি রক্ত দরকার?
          </h1>
          <p className="text-xs text-emerald-50/90 mt-1 leading-relaxed max-w-sm">
            চৌদ্দগ্রামের ১৩টি ইউনিয়ন ও পৌরসভার যাচাইকৃত রক্তদাতাদের তালিকা থেকে নিরাপদ ও সরাসরি যোগাযোগ করুন।
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => {
                setRegStep('form');
                setRegError(null);
                setShowRegisterModal(true);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-[#C73E4D] hover:bg-[#b03442] text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"
            >
              <UserPlus size={15} />
              <span>রক্তদাতা হিসেবে নিবন্ধন করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Safety & Privacy Notice */}
      <div className="mx-3.5 mt-3 p-2.5 bg-white border border-emerald-200/80 rounded-2xl shadow-2xs flex items-start gap-2 text-slate-700">
        <ShieldCheck size={16} className="text-[#087F68] shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <span className="font-bold text-[#17332D]">গোপনীয়তা ও নিরাপত্তা নিশ্চিত:</span> রক্তদাতাদের মোবাইল নম্বর অনুমতি ছাড়া উন্মুক্ত করা হয় না। যোগাযোগের অনুরোধ পাঠালে রক্তদাতা অনুমোদন সাপেক্ষে কথা বলবেন।
        </div>
      </div>

      {/* Filter Section */}
      <div className="mx-3.5 mt-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#17332D] flex items-center gap-1">
            <Filter size={13} className="text-[#087F68]" />
            রক্তের গ্রুপ বাছাই করুন
          </span>
          {selectedGroup !== 'all' && (
            <button
              onClick={() => setSelectedGroup('all')}
              className="text-[10px] text-emerald-700 hover:underline font-semibold"
            >
              রিসেট
            </button>
          )}
        </div>

        {/* Blood Group Chips Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedGroup === 'all'
                ? 'bg-[#087F68] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            সকল গ্রুপ
          </button>
          {BLOOD_GROUPS.map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                selectedGroup === grp
                  ? 'bg-[#C73E4D] text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 border border-rose-100 hover:bg-rose-100'
              }`}
            >
              <Droplet size={11} className={selectedGroup === grp ? 'fill-white' : 'fill-rose-600'} />
              {grp}
            </button>
          ))}
        </div>

        {/* Union Dropdown & Availability Toggle */}
        <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2.5 border-t border-slate-100">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">
              ইউনিয়ন / এলাকা:
            </label>
            <select
              value={selectedUnion}
              onChange={(e) => setSelectedUnion(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-slate-800 focus:outline-none focus:border-[#087F68]"
            >
              <option value="all">সমগ্র চৌদ্দগ্রাম</option>
              {unions.map((u) => (
                <option key={u.id} value={u.name_bn}>
                  {u.name_bn}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-1.5 p-1.5 bg-emerald-50/60 border border-emerald-100 rounded-xl cursor-pointer select-none">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded text-[#087F68] focus:ring-0"
              />
              <span className="text-[10px] font-semibold text-[#075E54]">
                শুধুমাত্র প্রস্তুত রক্তদাতা
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Donors List Header */}
      <div className="px-4 mt-4 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#087F68]"></span>
          <h2 className="text-xs font-bold text-[#17332D]">
            যাচাইকৃত রক্তদাতাদের তালিকা ({filteredDonors.length} জন)
          </h2>
        </div>
        <span className="text-[10px] text-slate-500">এডমিন দ্বারা নিরীক্ষিত</span>
      </div>

      {/* Donors Cards */}
      <div className="mx-3.5 space-y-3">
        {loading ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            রক্তদাতাদের তথ্য লোড হচ্ছে...
          </div>
        ) : filteredDonors.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
            <Droplet size={36} className="text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">নির্বাচিত ফিল্টারে কোনো রক্তদাতা পাওয়া যায়নি</p>
            <p className="text-[11px] text-slate-500 mt-1">
              অন্য রক্তের গ্রুপ বা সমগ্র চৌদ্দগ্রাম নির্বাচন করে দেখুন অথবা নিচে রক্তদাতা হিসেবে যোগ দিন।
            </p>
            <button
              onClick={() => {
                setSelectedGroup('all');
                setSelectedUnion('all');
                setAvailableOnly(false);
              }}
              className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              সব ফিল্টার রিসেট করুন
            </button>
          </div>
        ) : (
          filteredDonors.map((donor) => {
            const eligibility = getDonationEligibilityText(donor.last_donation_date);

            return (
              <div
                key={donor.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs hover:border-[#087F68] transition-all relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    {/* Blood Group Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-[#C73E4D] text-white flex flex-col items-center justify-center font-extrabold shadow-sm shrink-0">
                      <span className="text-sm leading-none">{donor.blood_group}</span>
                      <span className="text-[9px] font-normal uppercase mt-0.5 tracking-wider">রক্ত</span>
                    </div>

                    <div>
                      {/* Name & Verified Badge */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xs font-bold text-[#17332D]">
                          {donor.name}
                        </h3>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-[#087F68] rounded-full text-[9px] font-bold">
                          <ShieldCheck size={10} className="text-emerald-600" />
                          Verified
                        </span>
                      </div>

                      {/* Location / Union */}
                      <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-1">
                        <MapPin size={12} className="text-[#087F68] shrink-0" />
                        <span className="line-clamp-1">{donor.union}, {donor.area_address}</span>
                      </div>

                      {/* Last Donation / Eligibility */}
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                        <Calendar size={11} className="text-slate-400 shrink-0" />
                        <span>{eligibility.text}</span>
                      </div>
                    </div>
                  </div>

                  {/* Availability Pill */}
                  <div className="shrink-0 text-right">
                    {donor.available_now ? (
                      <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-[10px] font-bold">
                        ● রক্তদানে প্রস্তুত
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-medium">
                        সাময়িক বিরতি
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action: Contact Request */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    নম্বর সুরক্ষিত (অনুমোদনের পর দৃশ্যমান)
                  </span>

                  <button
                    onClick={() => {
                      setSelectedDonorForContact(donor);
                      setContactSuccessMsg(null);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#087F68] hover:bg-[#075E54] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
                  >
                    <HeartHandshake size={13} />
                    <span>যোগাযোগের অনুরোধ</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. Contact Request Bottom Sheet / Modal */}
      {/* ========================================================= */}
      {selectedDonorForContact && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                  {selectedDonorForContact.blood_group}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#17332D]">
                    {selectedDonorForContact.name}-এর কাছে রক্তের অনুরোধ
                  </h3>
                  <span className="text-[10px] text-slate-500">{selectedDonorForContact.union}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDonorForContact(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            {contactSuccessMsg ? (
              <div className="py-6 text-center">
                <CheckCircle2 size={40} className="text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">{contactSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSendContactRequest} className="mt-4 space-y-3">
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                  🛡️ <b>ডোনারের নিরাপত্তা নীতি:</b> ডোনার অনুরোধ গ্রহণ করলে সরাসরি কল করার সুযোগ পাবেন। অনুগ্রহ করে সঠিক রোগীর তথ্য ও মোবাইল নম্বর দিন।
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    রোগীর নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.patient_name}
                    onChange={(e) => setContactForm({ ...contactForm, patient_name: e.target.value })}
                    placeholder="যেমন: মো. রহিম উল্লাহ"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#087F68]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      আপনার নাম *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.requester_name}
                      onChange={(e) => setContactForm({ ...contactForm, requester_name: e.target.value })}
                      placeholder="আবেদনকারীর নাম"
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#087F68]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      আপনার মোবাইল নম্বর *
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactForm.requester_phone}
                      onChange={(e) => setContactForm({ ...contactForm, requester_phone: e.target.value })}
                      placeholder="01XXXXXXXXX"
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#087F68]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      হাসপাতালের নাম
                    </label>
                    <input
                      type="text"
                      value={contactForm.hospital_name}
                      onChange={(e) => setContactForm({ ...contactForm, hospital_name: e.target.value })}
                      placeholder="হাসপাতাল / ক্লিনিক"
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#087F68]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      জরুরিতা
                    </label>
                    <select
                      value={contactForm.urgency}
                      onChange={(e: any) => setContactForm({ ...contactForm, urgency: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#087F68]"
                    >
                      <option value="critical">🚨 অতি জরুরি (আজই)</option>
                      <option value="urgent">জরুরি (আগামীকাল)</option>
                      <option value="regular">সাধারণ প্রয়োজনে</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    অতিরিক্ত বার্তা (ঐচ্ছিক)
                  </label>
                  <textarea
                    rows={2}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="রক্তের প্রয়োজনীয় কারণ বা বিস্তারিত..."
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#087F68]"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDonorForContact(null)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={contactSubmitting}
                    className="flex-1 py-2.5 bg-[#087F68] hover:bg-[#075E54] text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    {contactSubmitting ? 'পাঠাচ্ছে...' : 'অনুরোধ পাঠান'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. Donor Registration & OTP Verification Modal */}
      {/* ========================================================= */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Droplet size={18} className="fill-rose-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#17332D]">
                    রক্তদাতা নিবন্ধন ও ভেরিফিকেশন
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    ধাপ {regStep === 'form' ? '১: তথ্য পূরণ' : regStep === 'otp' ? '২: মোবাইল OTP যাচাই' : '৩: সফল'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error Message */}
            {regError && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-1.5">
                <AlertCircle size={14} className="shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {/* STEP 1: Registration Form */}
            {regStep === 'form' && (
              <form onSubmit={handleProceedToOtp} className="mt-3 space-y-3">
                {/* Registration by self vs friend */}
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setRegForm({ ...regForm, registered_by: 'self' })}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                      regForm.registered_by === 'self'
                        ? 'bg-white text-[#087F68] shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    আমি নিজে রক্তদাতা
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegForm({ ...regForm, registered_by: 'friend' })}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                      regForm.registered_by === 'friend'
                        ? 'bg-white text-[#087F68] shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    বন্ধুর পক্ষে যুক্ত করছি
                  </button>
                </div>

                {regForm.registered_by === 'friend' && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                    <p className="text-[10px] text-amber-900 font-semibold">
                      ⚠️ বন্ধুর প্রোফাইল যোগ করার ক্ষেত্রে বন্ধুর সম্মতি এবং তার ফোনে ওটিপি যাচাই নিশ্চিত করতে হবে।
                    </p>
                    <input
                      type="text"
                      placeholder="আপনার নাম (তথ্য প্রদানকারী)"
                      value={regForm.friend_name}
                      onChange={(e) => setRegForm({ ...regForm, friend_name: e.target.value })}
                      className="w-full text-xs p-2 bg-white border border-amber-300 rounded-lg"
                    />
                  </div>
                )}

                {/* Donor Name */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    রক্তদাতার পূর্ণ নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    placeholder="যেমন: তানভীর আহমেদ"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#087F68]"
                  />
                </div>

                {/* Blood Group & Union */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      রক্তের গ্রুপ *
                    </label>
                    <select
                      value={regForm.blood_group}
                      onChange={(e: any) => setRegForm({ ...regForm, blood_group: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#087F68] font-bold text-[#C73E4D]"
                    >
                      {BLOOD_GROUPS.map((grp) => (
                        <option key={grp} value={grp}>
                          {grp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      ইউনিয়ন *
                    </label>
                    <select
                      value={regForm.union}
                      onChange={(e) => setRegForm({ ...regForm, union: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#087F68]"
                    >
                      {unions.map((u) => (
                        <option key={u.id} value={u.name_bn}>
                          {u.name_bn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mobile Phone & Emergency Phone */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      মোবাইল নম্বর (OTP যাবে) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      placeholder="01XXXXXXXXX"
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#087F68]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      বিকল্প নম্বর (ঐচ্ছিক)
                    </label>
                    <input
                      type="tel"
                      value={regForm.emergency_phone}
                      onChange={(e) => setRegForm({ ...regForm, emergency_phone: e.target.value })}
                      placeholder="জরুরি ফোন"
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#087F68]"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    গ্রাম বা বিস্তারিত ঠিকানা *
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.area_address}
                    onChange={(e) => setRegForm({ ...regForm, area_address: e.target.value })}
                    placeholder="যেমন: গুণবতী বাজার, মাস্টার পাড়া"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#087F68]"
                  />
                </div>

                {/* Last Donation Date & Available Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      সর্বশেষ রক্তদানের তারিখ
                    </label>
                    <input
                      type="date"
                      value={regForm.last_donation_date}
                      onChange={(e) => setRegForm({ ...regForm, last_donation_date: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#087F68]"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={regForm.available_now}
                        onChange={(e) => setRegForm({ ...regForm, available_now: e.target.checked })}
                        className="rounded text-[#087F68]"
                      />
                      <span className="text-[11px] font-bold text-[#075E54]">
                        বর্তমানে প্রস্তুত
                      </span>
                    </label>
                  </div>
                </div>

                {/* Consent Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={regForm.consent_agreed}
                      onChange={(e) => setRegForm({ ...regForm, consent_agreed: e.target.checked })}
                      className="rounded text-[#087F68] mt-0.5"
                    />
                    <span className="text-[10px] text-slate-700 leading-relaxed">
                      আমি স্বেচ্ছায় ও সজ্ঞানে রক্তদাতা হিসেবে তালিকাভুক্ত হতে সম্মত আছি। এডমিন দ্বারা আমার তথ্য যাচাই সাপেক্ষে ডিরেক্টরিতে প্রদর্শিত হতে রাজি।
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#087F68] hover:bg-[#075E54] text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  পরবর্তী ধাপ: মোবাইল নম্বর OTP যাচাই
                </button>
              </form>
            )}

            {/* STEP 2: OTP Verification */}
            {regStep === 'otp' && (
              <div className="mt-4 space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                  <Smartphone size={32} className="text-[#087F68] mx-auto mb-1" />
                  <h4 className="text-xs font-bold text-[#17332D]">
                    মোবাইল নম্বর যাচাইকরণ
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    <b>{regForm.phone}</b> নম্বরে একটি ৬-সংখ্যার ওটিপি কোড পাঠানো হয়েছে।
                  </p>

                  {/* Demo Helper Banner showing simulated OTP for instant testing */}
                  <div className="mt-2.5 p-2 bg-white border border-dashed border-emerald-400 rounded-xl text-emerald-900 text-[11px]">
                    <span className="text-slate-500">যাচাইকরণ ওটিপি কোড:</span>{' '}
                    <span className="font-mono font-bold text-sm tracking-widest text-[#087F68]">
                      {generatedOtp}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEnteredOtp(generatedOtp)}
                      className="block mx-auto mt-1 text-[10px] text-emerald-700 underline font-semibold cursor-pointer"
                    >
                      (এক ক্লিকে ওটিপি বসান)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1 text-center">
                    ৬-সংখ্যার কোডটি লিখুন:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="------"
                    className="w-48 mx-auto block text-center tracking-widest text-lg font-mono font-bold p-2.5 bg-slate-50 border-2 border-[#087F68] rounded-xl focus:outline-none"
                  />
                </div>

                <div className="text-center text-[11px] text-slate-500">
                  {otpTimer > 0 ? (
                    <span>পুনরায় কোড পাঠাতে অপেক্ষা করুন: <b>{otpTimer}</b> সেকেন্ড</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                        setGeneratedOtp(newOtp);
                        setOtpTimer(60);
                      }}
                      className="text-[#087F68] font-bold underline"
                    >
                      নতুন কোড পাঠান
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRegStep('form')}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    তথ্য সংশোধন
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting || enteredOtp.length !== 6}
                    onClick={handleVerifyOtpAndRegister}
                    className="flex-1 py-2.5 bg-[#087F68] hover:bg-[#075E54] text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? 'যাচাই হচ্ছে...' : 'যাচাই ও নিবন্ধন জমা দিন'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Success State */}
            {regStep === 'success' && (
              <div className="mt-4 py-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#087F68] flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={36} />
                </div>

                <h4 className="text-sm font-extrabold text-[#17332D]">
                  নিবন্ধন সফলভাবে জমা দেওয়া হয়েছে!
                </h4>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-left text-[11px] text-amber-900 leading-relaxed">
                  <div className="font-bold flex items-center gap-1 text-amber-800 mb-1">
                    <Clock size={13} />
                    বর্তমান অবস্থা: Pending Admin Review
                  </div>
                  আপনার মোবাইল নম্বরটি সফলভাবে ওটিপি দ্বারা যাচাই করা হয়েছে। ভুয়া তথ্য ও প্রতারণা রোধে এডমিন/উপজেলা স্বাস্থ্য ডেস্ক তথ্য যাচাই করার পর আপনার প্রোফাইলটি সাধারণ নাগরিক তালিকায় “Verified” হিসেবে প্রদর্শিত হবে।
                </div>

                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="w-full py-2.5 bg-[#087F68] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#075E54]"
                >
                  ঠিক আছে, বন্ধ করুন
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
