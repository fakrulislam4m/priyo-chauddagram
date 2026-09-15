import React, { useState, useEffect } from 'react';
import type { 
  UpazilaProfile, 
  UnionItem, 
  GovernmentNotice, 
  SponsoredCampaign, 
  AdminUser, 
  SyncRun, 
  AuditLog,
  BloodDonor,
  EmergencyContact,
  ServiceCardItem,
  LiveChatSettings,
  OfficeOfficerItem
} from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  updateUpazilaProfile, 
  saveUnion, 
  deleteUnion, 
  updateNoticeStatus, 
  saveManualNotice,
  deleteGovernmentNotice,
  toggleNoticeEmergency,
  saveSponsoredCampaign,
  deleteCampaign,
  triggerLiveNoticeSync,
  subscribeAllDonorsAdmin,
  adminApproveDonor,
  adminRejectDonor,
  updateDonorDetails,
  deleteBloodDonor,
  subscribeEmergencyContacts,
  saveEmergencyContact,
  deleteEmergencyContact,
  subscribeServiceCards,
  saveServiceCard,
  deleteServiceCard,
  getDefaultServiceCards,
  subscribeChatSettings,
  saveChatSettings,
  getDefaultChatSettings,
  subscribeOfficeDirectory,
  saveOfficeOfficer,
  deleteOfficeOfficer,
  getDefaultOfficeOfficers
} from '../services/dataService';
import { 
  ArrowLeft, 
  Building2, 
  Layers, 
  FileText, 
  RefreshCw, 
  Sparkles, 
  Users, 
  History, 
  Save, 
  Plus, 
  Check, 
  X, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  ShieldAlert,
  AlertCircle,
  Eye,
  Edit,
  Clock,
  CheckCircle2,
  DollarSign,
  Droplet,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Send,
  Mail,
  UserCheck
} from 'lucide-react';

interface AdminDashboardProps {
  profile: UpazilaProfile | null;
  unions: UnionItem[];
  notices: GovernmentNotice[];
  campaigns: SponsoredCampaign[];
  syncRuns: SyncRun[];
  adminUsers: AdminUser[];
  auditLogs: AuditLog[];
  onClose: () => void;
}

type AdminTabKey = 
  | 'notices'
  | 'sponsored'
  | 'services'
  | 'contacts'
  | 'chat'
  | 'donors'
  | 'officers'
  | 'profile'
  | 'users'
  | 'audit';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  profile,
  unions,
  notices,
  campaigns,
  syncRuns,
  adminUsers,
  auditLogs,
  onClose
}) => {
  const { lang, t } = useLanguage();
  const { user, isAdmin, adminName, adminRole } = useAuth();
  const adminEmail = user?.email || 'matelecom.cb71@gmail.com';
  const adminDisplayName = adminName || 'Fakrul Islam';

  // 1. STRICT SECURITY GATE: BLOCK NON-ADMINS IMMEDIATELY (403 FORBIDDEN)
  if (!isAdmin) {
    return (
      <div className="w-full min-h-[550px] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mb-4 shadow-xs">
          <ShieldAlert size={36} />
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-1">প্রবেশাধিকার সংরক্ষিত (403 Forbidden)</h2>
        <p className="text-xs text-slate-600 max-w-sm mb-4 leading-relaxed">
          এই এডমিন প্যানেল শুধুমাত্র অনুমোদিত কর্মকর্তাদের জন্য সংরক্ষিত। আপনার অ্যাকাউন্টে প্রয়োজনীয় প্রশাসনিক অনুমতি (Admin / Super Admin role) নেই।
        </p>
        <button 
          onClick={onClose} 
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition shadow-xs"
        >
          হোম পেজে ফিরে যান
        </button>
      </div>
    );
  }

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTabKey>('notices');

  // Success / Error Feedback Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // -------------------------------------------------------------
  // 1. NOTICES & EMERGENCY ANNOUNCEMENT STATE
  // -------------------------------------------------------------
  const [editingNotice, setEditingNotice] = useState<Partial<GovernmentNotice> | null>(null);
  const [savingNotice, setSavingNotice] = useState(false);
  const [syncingNotices, setSyncingNotices] = useState(false);

  const handleSaveNotice = async () => {
    if (!editingNotice || !editingNotice.title_bn?.trim()) {
      showToast('অনুগ্রহ করে নোটিশের শিরোনাম প্রদান করুন', 'error');
      return;
    }
    setSavingNotice(true);
    try {
      await saveManualNotice(editingNotice, adminEmail, adminDisplayName);
      showToast('নোটিশ সফলভাবে সংরক্ষিত হয়েছে এবং আপডেট সম্পন্ন হয়েছে।');
      setEditingNotice(null);
    } catch (e: any) {
      showToast(`সংরক্ষণ ব্যর্থ হয়েছে: ${e.message}`, 'error');
    } finally {
      setSavingNotice(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই নোটিশটি মুছে ফেলতে চান?')) return;
    try {
      await deleteGovernmentNotice(id, adminEmail, adminDisplayName);
      showToast('নোটিশ সফলভাবে মুছে ফেলা হয়েছে।');
    } catch (e: any) {
      showToast(`মুছে ফেলা ব্যর্থ হয়েছে: ${e.message}`, 'error');
    }
  };

  const handleToggleEmergency = async (id: string, current: boolean) => {
    try {
      await toggleNoticeEmergency(id, !current, adminEmail, adminDisplayName);
      showToast(!current ? 'নোটিশটি জরুরি ঘোষণা হিসেবে হোম পেজের শীর্ষে সেট করা হয়েছে।' : 'জরুরি ঘোষণা স্ট্যাটাস সরানো হয়েছে।');
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    }
  };

  const handleTriggerSync = async () => {
    setSyncingNotices(true);
    try {
      const res = await triggerLiveNoticeSync(adminEmail);
      showToast(res.message || 'সরকারি ওয়েবসাইট থেকে নোটিশ সিঙ্ক সম্পন্ন হয়েছে।');
    } catch (e: any) {
      showToast(`সিঙ্ক ব্যর্থ: ${e.message}`, 'error');
    } finally {
      setSyncingNotices(false);
    }
  };

  // -------------------------------------------------------------
  // 2. SPONSOR BANNER & CAMPAIGNS STATE
  // -------------------------------------------------------------
  const [editingCampaign, setEditingCampaign] = useState<Partial<SponsoredCampaign> | null>(null);
  const [savingCampaign, setSavingCampaign] = useState(false);

  const handleSaveCampaign = async () => {
    if (!editingCampaign || !editingCampaign.title_bn?.trim()) {
      showToast('বিজ্ঞাপন বা স্পন্সরের শিরোনাম প্রদান করুন', 'error');
      return;
    }
    setSavingCampaign(true);
    try {
      await saveSponsoredCampaign(editingCampaign as SponsoredCampaign, adminEmail, adminDisplayName);
      showToast('স্পন্সর ব্যানার সফলভাবে সংরক্ষিত হয়েছে।');
      setEditingCampaign(null);
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    } finally {
      setSavingCampaign(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm('আপনি কি এই স্পন্সর প্রচারণাটি মুছে ফেলতে চান?')) return;
    try {
      await deleteCampaign(id, adminEmail, adminDisplayName);
      showToast('স্পন্সর প্রচারণা মুছে ফেলা হয়েছে।');
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    }
  };

  // -------------------------------------------------------------
  // 3. POPULAR SERVICE CARDS STATE
  // -------------------------------------------------------------
  const [serviceCards, setServiceCards] = useState<ServiceCardItem[]>(() => getDefaultServiceCards());
  const [editingCard, setEditingCard] = useState<Partial<ServiceCardItem> | null>(null);
  const [savingCard, setSavingCard] = useState(false);

  useEffect(() => {
    const unsub = subscribeServiceCards((cards) => setServiceCards(cards));
    return () => unsub();
  }, []);

  const handleSaveCard = async () => {
    if (!editingCard || !editingCard.name_bn?.trim() || !editingCard.id?.trim()) {
      showToast('সেবার নাম ও আইডি আবশ্যক', 'error');
      return;
    }
    setSavingCard(true);
    try {
      await saveServiceCard(editingCard as ServiceCardItem, adminEmail, adminDisplayName);
      showToast('সেবা কার্ড সফলভাবে সংরক্ষিত হয়েছে এবং হোম পেজে আপডেট হয়েছে।');
      setEditingCard(null);
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    } finally {
      setSavingCard(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!window.confirm('আপনি কি এই সেবা কার্ডটি মুছে ফেলতে চান?')) return;
    try {
      await deleteServiceCard(id, adminEmail, adminDisplayName);
      showToast('সেবা কার্ড মুছে ফেলা হয়েছে।');
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    }
  };

  // -------------------------------------------------------------
  // 4. EMERGENCY CONTACTS STATE
  // -------------------------------------------------------------
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [editingContact, setEditingContact] = useState<Partial<EmergencyContact> | null>(null);
  const [savingContact, setSavingContact] = useState(false);

  useEffect(() => {
    const unsub = subscribeEmergencyContacts((list) => setContacts(list));
    return () => unsub();
  }, []);

  const handleSaveContact = async () => {
    if (!editingContact || !editingContact.name_bn?.trim() || !editingContact.phone?.trim()) {
      showToast('যোগাযোগের নাম ও ফোন নম্বর প্রদান করুন', 'error');
      return;
    }
    setSavingContact(true);
    try {
      await saveEmergencyContact(editingContact as EmergencyContact, adminEmail, adminDisplayName);
      showToast('জরুরি যোগাযোগ তথ্য সফলভাবে সংরক্ষিত হয়েছে।');
      setEditingContact(null);
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    } finally {
      setSavingContact(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('আপনি কি এই জরুরি নম্বরটি মুছে ফেলতে চান?')) return;
    try {
      await deleteEmergencyContact(id, adminEmail, adminDisplayName);
      showToast('জরুরি যোগাযোগ নম্বর মুছে ফেলা হয়েছে।');
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    }
  };

  // -------------------------------------------------------------
  // 5. LIVE CHAT SETTINGS STATE
  // -------------------------------------------------------------
  const [chatSettings, setChatSettings] = useState<LiveChatSettings>(() => getDefaultChatSettings());
  const [savingChat, setSavingChat] = useState(false);

  useEffect(() => {
    const unsub = subscribeChatSettings((settings) => setChatSettings(settings));
    return () => unsub();
  }, []);

  const handleSaveChatSettings = async () => {
    setSavingChat(true);
    try {
      await saveChatSettings(chatSettings, adminEmail, adminDisplayName);
      showToast('লাইভ চ্যাট সেটিংস সফলভাবে সংরক্ষিত হয়েছে।');
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    } finally {
      setSavingChat(false);
    }
  };

  // -------------------------------------------------------------
  // 6. BLOOD DONORS APPROVAL & STATUS STATE
  // -------------------------------------------------------------
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [donorFilter, setDonorFilter] = useState<'all' | 'pending_review' | 'verified' | 'rejected'>('all');
  const [editingDonor, setEditingDonor] = useState<BloodDonor | null>(null);
  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');

  useEffect(() => {
    const unsub = subscribeAllDonorsAdmin((list) => setDonors(list));
    return () => unsub();
  }, []);

  const handleApproveDonor = async (donorId: string) => {
    try {
      await adminApproveDonor(donorId, adminEmail, adminDisplayName);
      showToast('রক্তদাতা সফলভাবে অনুমোদিত এবং যাচাইকৃত (Verified) হয়েছে।');
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    }
  };

  const handleRejectDonor = async () => {
    if (!rejectionModalId) return;
    try {
      await adminRejectDonor(rejectionModalId, rejectionReasonInput || 'অসম্পূর্ণ বা অসত্য তথ্য', adminEmail, adminDisplayName);
      showToast('রক্তদাতার আবেদন বাতিল ও কারণ সংরক্ষণ করা হয়েছে।');
      setRejectionModalId(null);
      setRejectionReasonInput('');
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    }
  };

  const handleSaveDonorDetails = async () => {
    if (!editingDonor) return;
    try {
      await updateDonorDetails(editingDonor, adminEmail, adminDisplayName);
      showToast('রক্তদাতার তথ্য সফলভাবে আপডেট করা হয়েছে।');
      setEditingDonor(null);
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    }
  };

  const handleDeleteDonor = async (id: string) => {
    if (!window.confirm('আপনি কি এই রক্তদাতার প্রোফাইলটি মুছে ফেলতে চান?')) return;
    try {
      await deleteBloodDonor(id, adminEmail, adminDisplayName);
      showToast('রক্তদাতার প্রোফাইল মুছে ফেলা হয়েছে।');
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    }
  };

  // -------------------------------------------------------------
  // 7. OFFICE & OFFICER DIRECTORY STATE
  // -------------------------------------------------------------
  const [officers, setOfficers] = useState<OfficeOfficerItem[]>(() => getDefaultOfficeOfficers());
  const [editingOfficer, setEditingOfficer] = useState<Partial<OfficeOfficerItem> | null>(null);
  const [savingOfficer, setSavingOfficer] = useState(false);

  useEffect(() => {
    const unsub = subscribeOfficeDirectory((list) => setOfficers(list));
    return () => unsub();
  }, []);

  const handleSaveOfficer = async () => {
    if (!editingOfficer || !editingOfficer.office_name_bn?.trim() || !editingOfficer.officer_name_bn?.trim()) {
      showToast('দপ্তর ও কর্মকর্তার নাম আবশ্যক', 'error');
      return;
    }
    setSavingOfficer(true);
    try {
      await saveOfficeOfficer(editingOfficer as OfficeOfficerItem, adminEmail, adminDisplayName);
      showToast('দপ্তর ও কর্মকর্তা তথ্য সফলভাবে সংরক্ষিত হয়েছে।');
      setEditingOfficer(null);
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    } finally {
      setSavingOfficer(false);
    }
  };

  const handleDeleteOfficer = async (id: string) => {
    if (!window.confirm('আপনি কি এই কর্মকর্তার তথ্য মুছে ফেলতে চান?')) return;
    try {
      await deleteOfficeOfficer(id, adminEmail, adminDisplayName);
      showToast('কর্মকর্তার তথ্য মুছে ফেলা হয়েছে।');
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    }
  };

  // -------------------------------------------------------------
  // 8. PROFILE & UNIONS STATE
  // -------------------------------------------------------------
  const [profileForm, setProfileForm] = useState<Partial<UpazilaProfile>>(() => profile || {});
  const [savingProfile, setSavingProfile] = useState(false);
  const [editingUnion, setEditingUnion] = useState<UnionItem | null>(null);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateUpazilaProfile(profileForm, adminEmail, adminDisplayName);
      showToast('উপজেলা পরিচিতি ও পরিসংখ্যান সফলভাবে সংরক্ষিত হয়েছে।');
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveUnion = async (item: UnionItem) => {
    try {
      await saveUnion(item, adminEmail, adminDisplayName);
      showToast('ইউনিয়ন তথ্য সংরক্ষিত হয়েছে।');
      setEditingUnion(null);
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    }
  };

  const handleDeleteUnion = async (id: string) => {
    if (!window.confirm('আপনি কি এই ইউনিয়নটি মুছে ফেলতে চান?')) return;
    try {
      await deleteUnion(id, adminEmail, adminDisplayName);
      showToast('ইউনিয়ন মুছে ফেলা হয়েছে।');
    } catch (e: any) {
      showToast(`ত্রুটি: ${e.message}`, 'error');
    }
  };

  // Filtered Donors list
  const filteredDonors = donors.filter(d => {
    if (donorFilter === 'all') return true;
    return d.status === donorFilter;
  });

  return (
    <div className="w-full min-h-[750px] bg-slate-100 flex flex-col pb-24">
      {/* Admin Top Navigation Bar */}
      <div className="bg-slate-900 text-white px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95"
            title="ফিরে যান"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <h1 className="text-xs font-bold tracking-tight">চৌদ্দগ্রাম এডমিন কন্ট্রোল সেন্টার</h1>
            </div>
            <p className="text-[10px] text-slate-400">
              {adminDisplayName} • {adminRole === 'primary_admin' ? 'প্রধান প্রশাসক (Super Admin)' : 'প্রশাসনিক কর্মকর্তা (Admin)'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition"
        >
          বন্ধ করুন
        </button>
      </div>

      {/* Dynamic Feedback Toast Message */}
      {toastMessage && (
        <div className={`mx-3.5 mt-3 p-3 rounded-xl text-xs font-bold flex items-center justify-between shadow-md animate-fadeIn ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-700 text-white' 
            : 'bg-rose-700 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-0.5 hover:opacity-80">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Horizontal Scrolling Admin Tab Bar */}
      <div className="bg-white border-b border-slate-200 px-2 py-2 sticky top-[49px] z-20 overflow-x-auto no-scrollbar shadow-xs">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { key: 'notices', label: 'জরুরি ঘোষণা ও নোটিশ', icon: AlertCircle },
            { key: 'sponsored', label: 'স্পন্সর ব্যানার', icon: Sparkles },
            { key: 'services', label: 'সেবা কার্ড (১২টি)', icon: Layers },
            { key: 'contacts', label: 'জরুরি যোগাযোগ', icon: Phone },
            { key: 'chat', label: 'লাইভ চ্যাট', icon: MessageSquare },
            { key: 'donors', label: 'রক্তদাতা অনুমোদন', icon: Droplet },
            { key: 'officers', label: 'অফিস ও কর্মকর্তা', icon: Building2 },
            { key: 'profile', label: 'উপজেলা ও ইউনিয়ন', icon: MapPin },
            { key: 'users', label: 'এডমিন ইউজার', icon: Users },
            { key: 'audit', label: 'অডিট লগ', icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as AdminTabKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#087F68] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN TAB CONTENT CONTAINER */}
      <div className="p-3.5 space-y-4 max-w-4xl mx-auto w-full">

        {/* ========================================================= */}
        {/* 1. NOTICES & EMERGENCY ANNOUNCEMENTS                      */}
        {/* ========================================================= */}
        {activeTab === 'notices' && (
          <div className="space-y-3.5">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900">জরুরি ঘোষণা ও সরকারি নোটিশ ব্যবস্থাপনা</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  হোম স্ক্রিনের লাল জরুরি ঘোষণা ব্যানার ও নোটিশ সরাসরি সম্পাদনা করুন
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerSync}
                  disabled={syncingNotices}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                  title="সরকারি ওয়েবসাইট থেকে নোটিশ সিঙ্ক"
                >
                  <RefreshCw size={12} className={syncingNotices ? 'animate-spin' : ''} />
                  <span>সিঙ্ক</span>
                </button>
                <button
                  onClick={() => setEditingNotice({
                    priority: 'urgent',
                    is_emergency: true,
                    status: 'Published',
                    source_domain: 'chauddagram.comilla.gov.bd'
                  })}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#C73E4D] hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <Plus size={14} />
                  <span>+ জরুরি ঘোষণা দিন</span>
                </button>
              </div>
            </div>

            {/* Notice Editor Modal / Form */}
            {editingNotice && (
              <div className="bg-white p-4 rounded-2xl border-2 border-[#087F68] shadow-md space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Edit size={14} className="text-[#087F68]" />
                    <span>{editingNotice.id ? 'নোটিশ বা ঘোষণা সম্পাদনা' : 'নতুন জরুরি ঘোষণা বা নোটিশ তৈরি'}</span>
                  </h3>
                  <button onClick={() => setEditingNotice(null)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Emergency Announcement Toggle */}
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-rose-900 block">জরুরি ঘোষণা (Emergency Announcement)</span>
                      <span className="text-[10px] text-rose-700">চিহ্নিত করলে হোম পেজের শীর্ষে লাল সতর্কবার্তা ব্যানারে দেখাবে</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!editingNotice.is_emergency || editingNotice.priority === 'urgent'}
                        onChange={(e) => setEditingNotice({ 
                          ...editingNotice, 
                          is_emergency: e.target.checked,
                          priority: e.target.checked ? 'urgent' : 'normal'
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">নোটিশ / ঘোষণার শিরোনাম (বাংলা) *</label>
                    <input
                      type="text"
                      value={editingNotice.title_bn || editingNotice.source_title_bn || ''}
                      onChange={(e) => setEditingNotice({ ...editingNotice, title_bn: e.target.value, source_title_bn: e.target.value })}
                      placeholder="যেমন: ঘূর্ণিঝড় সতর্কবার্তা / ভোটার তালিকা হালনাগাদ নোটিশ"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#087F68] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">বিস্তারিত বিবরণ বা নির্দেশিকা</label>
                    <textarea
                      rows={3}
                      value={editingNotice.description_bn || ''}
                      onChange={(e) => setEditingNotice({ ...editingNotice, description_bn: e.target.value })}
                      placeholder="নোটিশের বিস্তারিত বার্তা নাগরিকের সুবিধার জন্য এখানে লিখুন..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#087F68] focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">জারি করা দপ্তর / কর্তৃপক্ষ</label>
                      <input
                        type="text"
                        value={editingNotice.attribution_bn || 'উপজেলা প্রশাসন, চৌদ্দগ্রাম'}
                        onChange={(e) => setEditingNotice({ ...editingNotice, attribution_bn: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">প্রকাশের স্ট্যাটাস</label>
                      <select
                        value={editingNotice.status || 'Published'}
                        onChange={(e) => setEditingNotice({ ...editingNotice, status: e.target.value as any })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                      >
                        <option value="Published">প্রকাশিত (Published)</option>
                        <option value="Hidden">লুকানো (Hidden)</option>
                        <option value="Archived">আর্কাইভ (Archived)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setEditingNotice(null)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={handleSaveNotice}
                    disabled={savingNotice}
                    className="flex items-center gap-1 px-4 py-1.5 bg-[#087F68] hover:bg-[#066553] text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
                  >
                    <Save size={13} />
                    <span>{savingNotice ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* List of Notices */}
            <div className="space-y-2">
              {notices.map((n) => {
                const isEmergency = n.priority === 'urgent' || n.is_emergency;
                return (
                  <div 
                    key={n.id} 
                    className={`p-3.5 bg-white rounded-2xl border transition shadow-2xs space-y-2 ${
                      isEmergency ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          {isEmergency && (
                            <span className="text-[9px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                              <AlertCircle size={10} />
                              জরুরি ঘোষণা
                            </span>
                          )}
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            n.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {n.status === 'Published' ? 'প্রকাশিত' : 'লুকানো'}
                          </span>
                        </div>

                        <h3 className="text-xs font-bold text-slate-900 mt-1.5">{n.source_title_bn || n.title_bn}</h3>
                        {n.description_bn && (
                          <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{n.description_bn}</p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">{n.attribution_bn} • {n.published_date || 'চলতি'}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleToggleEmergency(n.id, !!isEmergency)}
                          className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                            isEmergency ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="জরুরি টগল"
                        >
                          <AlertCircle size={14} />
                        </button>
                        <button
                          onClick={() => setEditingNotice(n)}
                          className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg transition"
                          title="সম্পাদনা"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteNotice(n.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. SPONSOR BANNER & CAMPAIGNS                             */}
        {/* ========================================================= */}
        {activeTab === 'sponsored' && (
          <div className="space-y-3.5">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900">স্পন্সর ব্যানার ও স্থানীয় বিজ্ঞাপন</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  হোম স্ক্রিনের স্পন্সর ব্যানার, স্থানীয় চেম্বার ও ক্লিনিক প্রচারণা
                </p>
              </div>

              <button
                onClick={() => setEditingCampaign({
                  advertiser_type: 'Doctor',
                  publication_status: 'Published',
                  payment_status: 'Verified',
                  approval_status: 'Approved',
                  banner_color_theme: 'emerald'
                })}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#087F68] hover:bg-[#066553] text-white rounded-xl text-xs font-bold shadow-xs"
              >
                <Plus size={14} />
                <span>+ নতুন বিজ্ঞাপন</span>
              </button>
            </div>

            {/* Campaign Editor Form */}
            {editingCampaign && (
              <div className="bg-white p-4 rounded-2xl border-2 border-emerald-600 shadow-md space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-emerald-600" />
                    <span>{editingCampaign.id ? 'বিজ্ঞাপন ব্যানার সম্পাদনা' : 'নতুন স্পন্সর ব্যানার যোগ'}</span>
                  </h3>
                  <button onClick={() => setEditingCampaign(null)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">বিজ্ঞাপনের শিরোনাম (বাংলা) *</label>
                    <input
                      type="text"
                      value={editingCampaign.title_bn || ''}
                      onChange={(e) => setEditingCampaign({ ...editingCampaign, title_bn: e.target.value })}
                      placeholder="যেমন: চৌদ্দগ্রাম ডেন্টাল কেয়ার / সেন্ট্রাল ডায়াগনস্টিক"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">ট্যাগলাইন বা অফার বর্ণনা</label>
                    <input
                      type="text"
                      value={editingCampaign.tagline_bn || ''}
                      onChange={(e) => setEditingCampaign({ ...editingCampaign, tagline_bn: e.target.value })}
                      placeholder="যেমন: বিশেষজ্ঞ ডাক্তার দ্বারা সার্বক্ষণিক সেবা"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">যোগাযোগ ফোন</label>
                      <input
                        type="text"
                        value={editingCampaign.phone || ''}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, phone: e.target.value })}
                        placeholder="01819-000000"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">বিজ্ঞাপনদাতার ধরণ</label>
                      <select
                        value={editingCampaign.advertiser_type || 'Doctor'}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, advertiser_type: e.target.value as any })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                      >
                        <option value="Doctor">ডাক্তার / চেম্বার (Doctor)</option>
                        <option value="Hospital">হাসপাতাল (Hospital)</option>
                        <option value="Clinic">ক্লিনিক / ডায়াগনস্টিক (Clinic)</option>
                        <option value="Pharmacy">ফার্মেসি (Pharmacy)</option>
                        <option value="Shop">দোকান / শপ (Shop)</option>
                        <option value="Business">ব্যবসা প্রতিষ্ঠান (Business)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">ঠিকানা (বাংলা)</label>
                    <input
                      type="text"
                      value={editingCampaign.address_bn || ''}
                      onChange={(e) => setEditingCampaign({ ...editingCampaign, address_bn: e.target.value })}
                      placeholder="মিয়াবাজার মোড়, চৌদ্দগ্রাম"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">প্রকাশের স্ট্যাটাস</label>
                      <select
                        value={editingCampaign.publication_status || 'Published'}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, publication_status: e.target.value as any })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                      >
                        <option value="Published">প্রকাশিত (Published)</option>
                        <option value="Paused">স্থগিত (Paused)</option>
                        <option value="Draft">খসড়া (Draft)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">পেমেন্ট যাচাই</label>
                      <select
                        value={editingCampaign.payment_status || 'Verified'}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, payment_status: e.target.value as any })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                      >
                        <option value="Verified">যাচাইকৃত (Verified)</option>
                        <option value="Pending">অপেক্ষমান (Pending)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setEditingCampaign(null)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={handleSaveCampaign}
                    disabled={savingCampaign}
                    className="flex items-center gap-1 px-4 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    <Save size={13} />
                    <span>{savingCampaign ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Campaigns List */}
            <div className="space-y-2">
              {campaigns.map((camp) => (
                <div key={camp.id} className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold bg-orange-600 text-white px-1.5 py-0.2 rounded uppercase">
                          স্পন্সর
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          {camp.advertiser_type}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          camp.publication_status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {camp.publication_status}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 mt-1">{camp.title_bn}</h3>
                      <p className="text-[11px] text-slate-500">{camp.tagline_bn}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{camp.phone} • {camp.address_bn}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditingCampaign(camp)}
                        className="p-1.5 bg-teal-50 text-teal-800 rounded-lg hover:bg-teal-100 transition"
                        title="সম্পাদনা"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteCampaign(camp.id)}
                        className="p-1.5 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. SERVICE CARDS (12 CITIZEN SERVICES)                     */}
        {/* ========================================================= */}
        {activeTab === 'services' && (
          <div className="space-y-3.5">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900">নাগরিক সেবা কার্ড কাস্টমাইজেশন</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  হোম স্ক্রিনের ১২টি প্রধান নাগরিক সেবা কার্ড সম্পাদনা ও নতুন সেবা যুক্ত করুন
                </p>
              </div>

              <button
                onClick={() => setEditingCard({
                  id: `srv_${Date.now()}`,
                  name_bn: '',
                  desc_bn: '',
                  icon: 'FileText',
                  badge: '',
                  order: serviceCards.length + 1,
                  active: true
                })}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#087F68] hover:bg-[#066553] text-white rounded-xl text-xs font-bold shadow-xs"
              >
                <Plus size={14} />
                <span>+ নতুন সেবা কার্ড</span>
              </button>
            </div>

            {/* Service Card Editor */}
            {editingCard && (
              <div className="bg-white p-4 rounded-2xl border-2 border-teal-600 shadow-md space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers size={14} className="text-teal-700" />
                    <span>সেবা কার্ড সম্পাদনা</span>
                  </h3>
                  <button onClick={() => setEditingCard(null)} className="p-1 text-slate-400">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">কার্ড আইডি (ইউনিক) *</label>
                      <input
                        type="text"
                        value={editingCard.id || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, id: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">সেবার নাম (বাংলা) *</label>
                      <input
                        type="text"
                        value={editingCard.name_bn || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, name_bn: e.target.value })}
                        placeholder="যেমন: নাগরিক সেবা"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">সংক্ষিপ্ত বিবরণ</label>
                    <input
                      type="text"
                      value={editingCard.desc_bn || ''}
                      onChange={(e) => setEditingCard({ ...editingCard, desc_bn: e.target.value })}
                      placeholder="যেমন: সনদ, প্রত্যয়ন ও নাগরিক আবেদন"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">আইকন নাম</label>
                      <select
                        value={editingCard.icon || 'FileText'}
                        onChange={(e) => setEditingCard({ ...editingCard, icon: e.target.value })}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-xl bg-white text-xs"
                      >
                        <option value="FileText">FileText (নাগরিক সেবা)</option>
                        <option value="Droplet">Droplet (ব্লাড ডোনার)</option>
                        <option value="Stethoscope">Stethoscope (স্বাস্থ্যসেবা)</option>
                        <option value="Sprout">Sprout (কৃষি)</option>
                        <option value="GraduationCap">GraduationCap (শিক্ষা)</option>
                        <option value="Landmark">Landmark (ভূমি)</option>
                        <option value="HeartHandshake">HeartHandshake (সমাজসেবা)</option>
                        <option value="Building2">Building2 (অফিস)</option>
                        <option value="AlertCircle">AlertCircle (অভিযোগ)</option>
                        <option value="Map">Map (মানচিত্র)</option>
                        <option value="Compass">Compass (দর্শনীয়)</option>
                        <option value="Store">Store (বাজার)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">ব্যাজ লেখা</label>
                      <input
                        type="text"
                        value={editingCard.badge || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, badge: e.target.value })}
                        placeholder="যেমন: জনপ্রিয় / জরুরি"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">ক্রম নম্বর (Order)</label>
                      <input
                        type="number"
                        value={editingCard.order || 1}
                        onChange={(e) => setEditingCard({ ...editingCard, order: parseInt(e.target.value) || 1 })}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button onClick={() => setEditingCard(null)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs">
                    বাতিল
                  </button>
                  <button
                    onClick={handleSaveCard}
                    disabled={savingCard}
                    className="flex items-center gap-1 px-4 py-1.5 bg-teal-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    <Save size={13} />
                    <span>{savingCard ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* List of Service Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              {serviceCards.map((card) => (
                <div key={card.id} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-800 text-[11px] font-bold flex items-center justify-center">
                        {card.order}
                      </span>
                      {card.badge && (
                        <span className="text-[8px] font-bold bg-[#087F68] text-white px-1.5 py-0.5 rounded-full">
                          {card.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">{card.name_bn}</h3>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{card.desc_bn}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[9px] text-slate-400 font-mono">{card.icon}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingCard(card)}
                        className="p-1 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100"
                        title="সম্পাদনা"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-1 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. EMERGENCY CONTACTS (হটলাইন ডিরেক্টরি)                    */}
        {/* ========================================================= */}
        {activeTab === 'contacts' && (
          <div className="space-y-3.5">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900">জরুরি যোগাযোগ ও হটলাইন ডিরেক্টরি</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  থানা, ফায়ার সার্ভিস, অ্যাম্বুলেন্স, হাসপাতাল ও হটলাইন নম্বর পরিবর্তন করুন
                </p>
              </div>

              <button
                onClick={() => setEditingContact({
                  id: `emg_${Date.now()}`,
                  name_bn: '',
                  phone: '',
                  service_type: 'জরুরি সেবা',
                  address_bn: 'চৌদ্দগ্রাম',
                  badge: '২৪ ঘণ্টা',
                  badge_color: 'bg-red-500 text-white',
                  icon: 'PhoneCall'
                })}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#C73E4D] hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                <Plus size={14} />
                <span>+ নতুন যোগাযোগ নম্বর</span>
              </button>
            </div>

            {/* Contact Editor Form */}
            {editingContact && (
              <div className="bg-white p-4 rounded-2xl border-2 border-rose-600 shadow-md space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Phone size={14} className="text-rose-600" />
                    <span>জরুরি যোগাযোগ তথ্য সম্পাদনা</span>
                  </h3>
                  <button onClick={() => setEditingContact(null)} className="p-1 text-slate-400">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">সেবার নাম (বাংলা) *</label>
                      <input
                        type="text"
                        value={editingContact.name_bn || ''}
                        onChange={(e) => setEditingContact({ ...editingContact, name_bn: e.target.value })}
                        placeholder="যেমন: চৌদ্দগ্রাম থানা"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">প্রধান ফোন নম্বর *</label>
                      <input
                        type="text"
                        value={editingContact.phone || ''}
                        onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                        placeholder="01320-114840"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">বিকল্প ফোন নম্বর (যদি থাকে)</label>
                      <input
                        type="text"
                        value={editingContact.secondary_phone || ''}
                        onChange={(e) => setEditingContact({ ...editingContact, secondary_phone: e.target.value })}
                        placeholder="01713-373752"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">সেবার ধরণ</label>
                      <input
                        type="text"
                        value={editingContact.service_type || ''}
                        onChange={(e) => setEditingContact({ ...editingContact, service_type: e.target.value })}
                        placeholder="আইনশৃঙ্খলা ও নিরাপত্তা"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">ঠিকানা বা অবস্থান</label>
                    <input
                      type="text"
                      value={editingContact.address_bn || ''}
                      onChange={(e) => setEditingContact({ ...editingContact, address_bn: e.target.value })}
                      placeholder="ঢাকা-চট্টগ্রাম মহাসড়ক রোড, চৌদ্দগ্রাম"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">ব্যাজ ট্যাগ</label>
                      <input
                        type="text"
                        value={editingContact.badge || ''}
                        onChange={(e) => setEditingContact({ ...editingContact, badge: e.target.value })}
                        placeholder="জরুরি / থানা পুলিশ"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">আইকন</label>
                      <select
                        value={editingContact.icon || 'PhoneCall'}
                        onChange={(e) => setEditingContact({ ...editingContact, icon: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                      >
                        <option value="PhoneCall">PhoneCall (জরুরি কল)</option>
                        <option value="ShieldCheck">ShieldCheck (পুলিশ/নিরাপত্তা)</option>
                        <option value="Stethoscope">Stethoscope (হাসপাতাল/ডাক্তার)</option>
                        <option value="Flame">Flame (ফায়ার সার্ভিস)</option>
                        <option value="Truck">Truck (অ্যাম্বুলেন্স)</option>
                        <option value="Building2">Building2 (উপজেলা প্রশাসন)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button onClick={() => setEditingContact(null)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs">
                    বাতিল
                  </button>
                  <button
                    onClick={handleSaveContact}
                    disabled={savingContact}
                    className="flex items-center gap-1 px-4 py-1.5 bg-rose-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    <Save size={13} />
                    <span>{savingContact ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Contacts List */}
            <div className="grid grid-cols-2 gap-2.5">
              {contacts.map((contact) => (
                <div key={contact.id} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[8px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full">
                      {contact.badge}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">{contact.name_bn}</h3>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{contact.service_type}</p>
                    <p className="text-xs font-mono font-bold text-slate-800 mt-1">{contact.phone}</p>
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setEditingContact(contact)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                      title="সম্পাদনা"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. LIVE CHAT SETTINGS (চ্যাট কনফিগারেশন)                  */}
        {/* ========================================================= */}
        {activeTab === 'chat' && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-xs font-bold text-slate-900">নাগরিক লাইভ চ্যাট কনফিগারেশন</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                লাইভ চ্যাট সক্রিয়/নিষ্ক্রিয়, অফিস সময়সূচী এবং স্বয়ংক্রিয় বার্তা নিয়ন্ত্রণ
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {/* Toggle Chat Status */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">নাগরিক লাইভ চ্যাট সক্রিয় রাখুন</span>
                  <span className="text-[10px] text-slate-500">চ্যাট বন্ধ থাকলে নাগরিকরা কেবল নোটিশ ও হেল্পলাইন দেখতে পাবেন</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chatSettings.enabled}
                    onChange={(e) => setChatSettings({ ...chatSettings, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#087F68]"></div>
                </label>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">অফিস সময়সূচী বিবরণ</label>
                <input
                  type="text"
                  value={chatSettings.office_hours || ''}
                  onChange={(e) => setChatSettings({ ...chatSettings, office_hours: e.target.value })}
                  placeholder="সকাল ৯:০০ টা - বিকাল ৫:০০ টা (সরকারি কার্যদিবস)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">চ্যাটে স্বাগত বার্তা (Welcome Message)</label>
                <textarea
                  rows={2}
                  value={chatSettings.welcome_message_bn || ''}
                  onChange={(e) => setChatSettings({ ...chatSettings, welcome_message_bn: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">জরুরি সহায়তা ফোন নম্বর</label>
                <input
                  type="text"
                  value={chatSettings.support_phone || ''}
                  onChange={(e) => setChatSettings({ ...chatSettings, support_phone: e.target.value })}
                  placeholder="01715-182390"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                onClick={handleSaveChatSettings}
                disabled={savingChat}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#087F68] hover:bg-[#066553] text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 transition"
              >
                <Save size={14} />
                <span>{savingChat ? 'সংরক্ষণ হচ্ছে...' : 'চ্যাট সেটিংস সংরক্ষণ করুন'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. BLOOD DONORS APPROVAL & STATUS                         */}
        {/* ========================================================= */}
        {activeTab === 'donors' && (
          <div className="space-y-3.5">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900">ব্লাড ডোনার অনুমোদন ও যাচাইকরণ</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  নিবন্ধিত রক্তদাতাদের সত্যতা যাচাই, অনুমোদন বা কারণসহ বাতিল করুন
                </p>
              </div>

              <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200">
                মোট রক্তদাতা: {donors.length} জন
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { key: 'all', label: 'সকল রক্তদাতা' },
                { key: 'pending_review', label: 'অনুমোদন বাকি (Pending)' },
                { key: 'verified', label: 'যাচাইকৃত (Verified)' },
                { key: 'rejected', label: 'বাতিলকৃত (Rejected)' }
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setDonorFilter(f.key as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    donorFilter === f.key
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Donor Edit Details Modal */}
            {editingDonor && (
              <div className="bg-white p-4 rounded-2xl border-2 border-rose-500 shadow-md space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900">রক্তদাতার তথ্য সম্পাদনা</h3>
                  <button onClick={() => setEditingDonor(null)} className="p-1 text-slate-400">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">রক্তদাতার নাম</label>
                      <input
                        type="text"
                        value={editingDonor.name}
                        onChange={(e) => setEditingDonor({ ...editingDonor, name: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">ফোন নম্বর</label>
                      <input
                        type="text"
                        value={editingDonor.phone}
                        onChange={(e) => setEditingDonor({ ...editingDonor, phone: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">রক্তের গ্রুপ</label>
                      <select
                        value={editingDonor.blood_group}
                        onChange={(e) => setEditingDonor({ ...editingDonor, blood_group: e.target.value as any })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-bold"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">ইউনিয়ন</label>
                      <input
                        type="text"
                        value={editingDonor.union}
                        onChange={(e) => setEditingDonor({ ...editingDonor, union: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">স্ট্যাটাস</label>
                      <select
                        value={editingDonor.status}
                        onChange={(e) => setEditingDonor({ ...editingDonor, status: e.target.value as any })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                      >
                        <option value="verified">যাচাইকৃত (Verified)</option>
                        <option value="pending_review">অপেক্ষমান (Pending Review)</option>
                        <option value="rejected">বাতিল (Rejected)</option>
                        <option value="hidden">লুকানো (Hidden)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">এখন রক্তদানে প্রস্তুত</label>
                      <select
                        value={editingDonor.available_now ? 'yes' : 'no'}
                        onChange={(e) => setEditingDonor({ ...editingDonor, available_now: e.target.value === 'yes' })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                      >
                        <option value="yes">হ্যাঁ (প্রস্তুত)</option>
                        <option value="no">না (বিশ্রামে আছেন)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button onClick={() => setEditingDonor(null)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs">
                    বাতিল
                  </button>
                  <button
                    onClick={handleSaveDonorDetails}
                    className="flex items-center gap-1 px-4 py-1.5 bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    <Save size={13} />
                    <span>সংরক্ষণ করুন</span>
                  </button>
                </div>
              </div>
            )}

            {/* Rejection Reason Modal */}
            {rejectionModalId && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-4 max-w-sm w-full space-y-3 shadow-2xl">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle size={16} className="text-rose-600" />
                    <span>রক্তদাতার আবেদন বাতিলের কারণ লিখুন</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    আবেদন বাতিলের কারণটি ডাটাবেজে সংরক্ষিত হবে এবং সংশ্লিষ্ট ডোনারকে প্রদর্শিত হবে।
                  </p>
                  <textarea
                    rows={2}
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    placeholder="যেমন: মোবাইল নম্বরটি সক্রিয় পাওয়া যায়নি অথবা বয়স ১৮ এর নিচে।"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none"
                  />
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setRejectionModalId(null)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold"
                    >
                      বাতিল
                    </button>
                    <button
                      onClick={handleRejectDonor}
                      className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs"
                    >
                      নিশ্চিত বাতিল করুন
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Donors List */}
            <div className="space-y-2">
              {filteredDonors.map((donor) => (
                <div key={donor.id} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <span className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-extrabold flex items-center justify-center text-sm shrink-0">
                        {donor.blood_group}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-bold text-slate-900">{donor.name}</h3>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            donor.status === 'verified' 
                              ? 'bg-emerald-100 text-emerald-800'
                              : donor.status === 'pending_review'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {donor.status === 'verified' ? 'যাচাইকৃত' : donor.status === 'pending_review' ? 'অপেক্ষমান' : 'বাতিল'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono font-bold mt-0.5">{donor.phone}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{donor.union}, {donor.village || 'চৌদ্দগ্রাম'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {donor.status !== 'verified' && (
                        <button
                          onClick={() => handleApproveDonor(donor.id)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition"
                          title="অনুমোদন করুন"
                        >
                          অনুমোদন
                        </button>
                      )}
                      {donor.status !== 'rejected' && (
                        <button
                          onClick={() => { setRejectionModalId(donor.id); setRejectionReasonInput(''); }}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded-lg transition"
                          title="বাতিল করুন"
                        >
                          বাতিল
                        </button>
                      )}
                      <button
                        onClick={() => setEditingDonor(donor)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                        title="সম্পাদনা"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteDonor(donor.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 7. OFFICE & OFFICER INFORMATION                           */}
        {/* ========================================================= */}
        {activeTab === 'officers' && (
          <div className="space-y-3.5">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900">উপজেলা দপ্তর ও কর্মকর্তা তালিকা</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ইউএনও, এসিল্যান্ড, ওসি, স্বাস্থ্য, কৃষি ও শিক্ষা কর্মকর্তা তথ্য হালনাগাদ করুন
                </p>
              </div>

              <button
                onClick={() => setEditingOfficer({
                  id: `off_${Date.now()}`,
                  office_name_bn: '',
                  officer_name_bn: '',
                  designation_bn: '',
                  department_bn: '',
                  phone: '',
                  email: '',
                  order: officers.length + 1,
                  active: true
                })}
                className="flex items-center gap-1 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                <Plus size={14} />
                <span>+ নতুন কর্মকর্তা যোগ</span>
              </button>
            </div>

            {/* Officer Editor Form */}
            {editingOfficer && (
              <div className="bg-white p-4 rounded-2xl border-2 border-teal-600 shadow-md space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 size={14} className="text-teal-700" />
                    <span>কর্মকর্তার তথ্য সম্পাদনা</span>
                  </h3>
                  <button onClick={() => setEditingOfficer(null)} className="p-1 text-slate-400">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">দপ্তরের নাম (বাংলা) *</label>
                      <input
                        type="text"
                        value={editingOfficer.office_name_bn || ''}
                        onChange={(e) => setEditingOfficer({ ...editingOfficer, office_name_bn: e.target.value })}
                        placeholder="যেমন: উপজেলা নির্বাহী কর্মকর্তার কার্যালয়"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">কর্মকর্তার নাম (বাংলা) *</label>
                      <input
                        type="text"
                        value={editingOfficer.officer_name_bn || ''}
                        onChange={(e) => setEditingOfficer({ ...editingOfficer, officer_name_bn: e.target.value })}
                        placeholder="যেমন: মুহাম্মদ তানভীর হোসেন"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">পদবি (বাংলা)</label>
                      <input
                        type="text"
                        value={editingOfficer.designation_bn || ''}
                        onChange={(e) => setEditingOfficer({ ...editingOfficer, designation_bn: e.target.value })}
                        placeholder="উপজেলা নির্বাহী অফিসার (ইউএনও)"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">বিভাগ / অধিদপ্তর</label>
                      <input
                        type="text"
                        value={editingOfficer.department_bn || ''}
                        onChange={(e) => setEditingOfficer({ ...editingOfficer, department_bn: e.target.value })}
                        placeholder="উপজেলা প্রশাসন"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">অফিসিয়াল ফোন *</label>
                      <input
                        type="text"
                        value={editingOfficer.phone || ''}
                        onChange={(e) => setEditingOfficer({ ...editingOfficer, phone: e.target.value })}
                        placeholder="01715-182390"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">ইমেইল</label>
                      <input
                        type="email"
                        value={editingOfficer.email || ''}
                        onChange={(e) => setEditingOfficer({ ...editingOfficer, email: e.target.value })}
                        placeholder="unochauddagram@mopa.gov.bd"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">কক্ষ নম্বর ও ভবন</label>
                      <input
                        type="text"
                        value={editingOfficer.room_no || ''}
                        onChange={(e) => setEditingOfficer({ ...editingOfficer, room_no: e.target.value })}
                        placeholder="২০১, উপজেলা পরিষদ চত্বর"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">ক্রম নম্বর (Order)</label>
                      <input
                        type="number"
                        value={editingOfficer.order || 1}
                        onChange={(e) => setEditingOfficer({ ...editingOfficer, order: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button onClick={() => setEditingOfficer(null)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs">
                    বাতিল
                  </button>
                  <button
                    onClick={handleSaveOfficer}
                    disabled={savingOfficer}
                    className="flex items-center gap-1 px-4 py-1.5 bg-teal-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    <Save size={13} />
                    <span>{savingOfficer ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* List of Officers */}
            <div className="space-y-2">
              {officers.map((officer) => (
                <div key={officer.id} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                      {officer.order}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{officer.office_name_bn}</h3>
                      <p className="text-xs font-semibold text-teal-800 mt-0.5">{officer.officer_name_bn} ({officer.designation_bn})</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{officer.phone} {officer.email ? `• ${officer.email}` : ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingOfficer(officer)}
                      className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition"
                      title="সম্পাদনা"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteOfficer(officer.id)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 8. PROFILE & UNIONS                                       */}
        {/* ========================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h2 className="text-xs font-bold text-slate-900">উপজেলা সাধারণ পরিচিতি</h2>
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">উপজেলার নাম (বাংলা)</label>
                  <input
                    type="text"
                    value={profileForm.name_bn || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, name_bn: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">সংক্ষিপ্ত পরিচিতি</label>
                  <textarea
                    rows={2}
                    value={profileForm.overview_bn || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, overview_bn: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">আয়তন (বর্গ কিমি)</label>
                    <input
                      type="text"
                      value={profileForm.area_sq_km || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, area_sq_km: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">জনসংখ্যা</label>
                    <input
                      type="text"
                      value={profileForm.population || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, population: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#087F68] hover:bg-[#066553] text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  <Save size={13} />
                  <span>{savingProfile ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
                </button>
              </div>
            </div>

            {/* Unions List */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-900">১৩টি ইউনিয়ন তালিকা</h2>
                <button
                  onClick={() => setEditingUnion({
                    id: `union_${Date.now()}`,
                    name_bn: '',
                    name_en: '',
                    order: unions.length + 1,
                    status: 'Published',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  })}
                  className="px-2.5 py-1 bg-slate-800 text-white rounded-lg text-xs font-bold"
                >
                  + ইউনিয়ন যোগ
                </button>
              </div>

              {editingUnion && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editingUnion.name_bn}
                      onChange={(e) => setEditingUnion({ ...editingUnion, name_bn: e.target.value })}
                      placeholder="ইউনিয়ন নাম (বাংলা)"
                      className="px-2 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      value={editingUnion.name_en}
                      onChange={(e) => setEditingUnion({ ...editingUnion, name_en: e.target.value })}
                      placeholder="Union Name (English)"
                      className="px-2 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => setEditingUnion(null)} className="px-2.5 py-1 bg-slate-200 rounded-lg text-xs">বাতিল</button>
                    <button onClick={() => handleSaveUnion(editingUnion)} className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold">সংরক্ষণ</button>
                  </div>
                </div>
              )}

              <div className="divide-y divide-slate-100">
                {unions.map((u) => (
                  <div key={u.id} className="py-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{u.order}. {u.name_bn}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditingUnion(u)} className="p-1 text-teal-700 hover:bg-teal-50 rounded">
                        <Edit size={13} />
                      </button>
                      <button onClick={() => handleDeleteUnion(u.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 9. ADMIN USERS                                            */}
        {/* ========================================================= */}
        {activeTab === 'users' && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900">অনুমোদিত এডমিন তালিকা</h2>
            <div className="space-y-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">matelecom.cb71@gmail.com</span>
                  <span className="text-[10px] text-emerald-700">ফখরুল ইসলাম • প্রধান প্রশাসক (Primary Super Admin)</span>
                </div>
                <span className="text-[9px] font-extrabold bg-emerald-700 text-white px-2 py-0.5 rounded-full">
                  Primary
                </span>
              </div>

              {adminUsers.map((u) => (
                <div key={u.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{u.email}</span>
                    <span className="text-[10px] text-slate-500">{u.name} • {u.role}</span>
                  </div>
                  <span className="text-[9px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                    {u.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 10. SYSTEM AUDIT LOGS                                     */}
        {/* ========================================================= */}
        {activeTab === 'audit' && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900">সিস্টেম অডিট ও কার্যক্রম লগ</h2>
            <p className="text-[11px] text-slate-500">এডমিনদের প্রতিটি তথ্য পরিবর্তন ও কার্যক্রমের স্বচ্ছ ইতিহাস</p>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{log.details}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">দ্বারা: {log.admin_name} ({log.admin_email})</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
