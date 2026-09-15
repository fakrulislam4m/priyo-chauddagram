import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { AndroidFrame } from './components/AndroidFrame';
import { AuthScreen } from './components/AuthScreen';
import { HeaderAppBar } from './components/HeaderAppBar';
import { WelcomeSection } from './components/WelcomeSection';
import { SponsoredCarousel } from './components/SponsoredCarousel';
import { EmergencyNoticeBanner } from './components/EmergencyNoticeBanner';
import { LiveChatHighlight } from './components/LiveChatHighlight';
import { QuickServicesStrip } from './components/QuickServicesStrip';
import { BloodDonorHighlight } from './components/BloodDonorHighlight';
import { PopularServicesGrid } from './components/PopularServicesGrid';
import { LatestNoticesSection } from './components/LatestNoticesSection';
import { EmergencyContactsSection } from './components/EmergencyContactsSection';
import { BottomNav, TabKey } from './components/BottomNav';
import { BloodDonorScreen } from './components/BloodDonorScreen';
import { AdminCard } from './components/AdminCard';
import { AboutDeveloperSection } from './components/AboutDeveloperSection';
import { AdminDashboard } from './components/AdminDashboard';
import { CategoryView } from './components/CategoryView';
import { DetailModals } from './components/DetailModals';
import { UserProfileModal } from './components/UserProfileModal';
import { LiveChatScreen } from './components/LiveChatScreen';
import { InstallModal } from './components/InstallModal';
import { ShieldAlert } from 'lucide-react';

import { 
  subscribeUpazilaProfile, 
  subscribeUnions, 
  subscribeGovernmentNotices, 
  subscribeSponsoredCampaigns,
  subscribeSyncRuns,
  subscribeAdminUsers,
  subscribeAuditLogs
} from './services/dataService';

import type { 
  UpazilaProfile, 
  UnionItem, 
  GovernmentNotice, 
  SponsoredCampaign, 
  SyncRun, 
  AdminUser, 
  AuditLog,
  BloodGroup
} from './types';

export function App() {
  const { authView, setAuthView, isAdmin, user, requestAccountDeletion } = useAuth();
  const { lang, t } = useLanguage();

  // Firestore Data State
  const [profile, setProfile] = useState<UpazilaProfile | null>(null);
  const [unions, setUnions] = useState<UnionItem[]>([]);
  const [notices, setNotices] = useState<GovernmentNotice[]>([]);
  const [campaigns, setCampaigns] = useState<SponsoredCampaign[]>([]);
  const [syncRuns, setSyncRuns] = useState<SyncRun[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Navigation & Modal State
  const [activeScreen, setActiveScreen] = useState<'home' | 'category' | 'admin' | 'chat' | 'blood'>('home');
  const [preselectedBloodGroup, setPreselectedBloodGroup] = useState<BloodGroup | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [activeModal, setActiveModal] = useState<
    'none' | 'profile' | 'union' | 'notice' | 'campaign' | 'sponsor_info' | 'access_denied' | 'account_delete'
  >('none');
  const [selectedUnion, setSelectedUnion] = useState<UnionItem | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<GovernmentNotice | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<SponsoredCampaign | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);

  // Subscribe to real-time Firestore collections
  useEffect(() => {
    const unsubProfile = subscribeUpazilaProfile((p) => setProfile(p));
    const unsubUnions = subscribeUnions((u) => setUnions(u));
    const unsubNotices = subscribeGovernmentNotices((n) => setNotices(n));
    const unsubCampaigns = subscribeSponsoredCampaigns((c) => setCampaigns(c));
    const unsubSync = subscribeSyncRuns((r) => setSyncRuns(r));
    const unsubAdmins = subscribeAdminUsers((a) => setAdminUsers(a));
    const unsubLogs = subscribeAuditLogs((l) => setAuditLogs(l));

    return () => {
      unsubProfile();
      unsubUnions();
      unsubNotices();
      unsubCampaigns();
      unsubSync();
      unsubAdmins();
      unsubLogs();
    };
  }, []);

  // Handle Quick Actions and Popular Services selection
  const handleSelectService = (key: string) => {
    switch (key) {
      case 'blood':
      case 'blood_donors':
        setPreselectedBloodGroup(undefined);
        setActiveScreen('blood');
        break;
      case 'chat':
        setActiveScreen('chat');
        break;
      case 'notices':
        setSelectedCategory('notices');
        setActiveScreen('category');
        break;
      case 'complaint':
      case 'complaints':
        // Complaints category
        setSelectedCategory('complaints');
        setActiveScreen('category');
        break;
      case 'ambulance':
      case 'healthcare':
        setSelectedCategory('health');
        setActiveScreen('category');
        break;
      case 'certificate':
      case 'citizen_services':
        setSelectedCategory('services');
        setActiveScreen('category');
        break;
      case 'agriculture':
        setSelectedCategory('agriculture');
        setActiveScreen('category');
        break;
      case 'education':
        setSelectedCategory('education');
        setActiveScreen('category');
        break;
      case 'land_services':
        setSelectedCategory('land');
        setActiveScreen('category');
        break;
      case 'office_directory':
      case 'social_welfare':
      case 'map':
      case 'tourism':
      case 'local_business':
      default:
        setSelectedCategory(key);
        setActiveScreen('category');
        break;
    }
  };

  // Handle bottom navigation changes
  const handleTabChange = (tab: TabKey) => {
    switch (tab) {
      case 'home':
        setActiveScreen('home');
        break;
      case 'services':
        setSelectedCategory('services');
        setActiveScreen('category');
        break;
      case 'chat':
        setActiveScreen('chat');
        break;
      case 'blood':
        setPreselectedBloodGroup(undefined);
        setActiveScreen('blood');
        break;
      case 'profile':
        setProfileModalOpen(true);
        break;
    }
  };

  // Handle open admin
  const handleOpenAdmin = () => {
    if (isAdmin) {
      setActiveScreen('admin');
    } else {
      setActiveModal('access_denied');
    }
  };

  const handleConfirmAccountDeletion = async () => {
    const res = await requestAccountDeletion();
    alert(res.message);
  };

  // If user is currently in Auth Screen
  if (authView === 'chooser' || authView === 'user_login' || authView === 'admin_login') {
    return (
      <AndroidFrame>
        <AuthScreen />
      </AndroidFrame>
    );
  }

  // Active Screen: Blood Donor Module (যাচাইকৃত ব্লাড ডোনার ডিরেক্টরি)
  if (activeScreen === 'blood') {
    return (
      <AndroidFrame>
        <BloodDonorScreen 
          onBack={() => setActiveScreen('home')} 
          initialGroup={preselectedBloodGroup}
        />
        <BottomNav 
          activeTab="blood" 
          onTabChange={handleTabChange} 
        />
      </AndroidFrame>
    );
  }

  // Active Screen: Live Community Chat (উপজেলা লাইভ চ্যাট ও কর্মকর্তা সহায়তা)
  if (activeScreen === 'chat') {
    return (
      <AndroidFrame>
        <LiveChatScreen onBack={() => setActiveScreen('home')} />
        <BottomNav 
          activeTab="chat" 
          onTabChange={handleTabChange} 
        />
      </AndroidFrame>
    );
  }

  // Active Screen: Admin Management Dashboard (Strictly guarded by isAdmin verification)
  if (activeScreen === 'admin') {
    if (!isAdmin) {
      return (
        <AndroidFrame>
          <div className="w-full min-h-[500px] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <ShieldAlert size={36} />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-1">প্রবেশাধিকার সংরক্ষিত (403 Forbidden)</h2>
            <p className="text-xs text-slate-600 max-w-sm mb-4">
              আপনার অ্যাকাউন্টে এডমিন প্যানেল ব্যবহারের প্রশাসনিক অনুমতি নেই।
            </p>
            <button
              onClick={() => setActiveScreen('home')}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              হোম স্ক্রিনে ফিরে যান
            </button>
          </div>
        </AndroidFrame>
      );
    }
    return (
      <AndroidFrame>
        <AdminDashboard
          profile={profile}
          unions={unions}
          notices={notices}
          campaigns={campaigns}
          syncRuns={syncRuns}
          adminUsers={adminUsers}
          auditLogs={auditLogs}
          onClose={() => setActiveScreen('home')}
        />
      </AndroidFrame>
    );
  }

  // Active Screen: Category Listing View
  if (activeScreen === 'category' && selectedCategory) {
    return (
      <AndroidFrame>
        <CategoryView
          categoryId={selectedCategory}
          profile={profile}
          unions={unions}
          notices={notices}
          campaigns={campaigns}
          onBack={() => setActiveScreen('home')}
          onSelectUnion={(u) => { setSelectedUnion(u); setActiveModal('union'); }}
          onSelectNotice={(n) => { setSelectedNotice(n); setActiveModal('notice'); }}
          onSelectCampaign={(c) => { setSelectedCampaign(c); setActiveModal('campaign'); }}
          onOpenSponsorGuidelines={() => setActiveModal('sponsor_info')}
        />

        <BottomNav 
          activeTab="services" 
          onTabChange={handleTabChange} 
        />

        <DetailModals
          activeModal={activeModal}
          selectedUnion={selectedUnion}
          selectedNotice={selectedNotice}
          selectedCampaign={selectedCampaign}
          profile={profile}
          onClose={() => setActiveModal('none')}
          onConfirmDeleteAccount={handleConfirmAccountDeletion}
        />
      </AndroidFrame>
    );
  }

  // Active Screen: Default Main Home Screen (Strict 11-Part Sequence)
  return (
    <AndroidFrame>
      {/* 1. Top Header: Upazila logo, Upazila name, Notification icon, Profile/Menu, Language Switcher */}
      <HeaderAppBar
        onOpenAdmin={handleOpenAdmin}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenChat={() => setActiveScreen('chat')}
        onOpenInstallModal={() => setInstallModalOpen(true)}
        onOpenNotifications={() => {
          if (notices.length > 0) {
            setSelectedNotice(notices[0]);
            setActiveModal('notice');
          } else {
            handleSelectService('notices');
          }
        }}
        unreadNoticeCount={notices.length}
      />

      <div className="w-full flex-1 flex flex-col pb-3 overflow-y-auto">
        {/* 2. Welcome Section: Greeting, date in Bengali, weather in Chauddagram */}
        <WelcomeSection />

        {/* 3. Sponsor Banner Carousel: Navy Blue #254E70, Orange accent, Verified badge */}
        <SponsoredCarousel
          campaigns={campaigns}
          onSelectCampaign={(c) => { setSelectedCampaign(c); setActiveModal('campaign'); }}
          onOpenSponsorInfo={() => setActiveModal('sponsor_info')}
        />

        {/* 4. জরুরি ঘোষণা: Emergency notice banner if priority notices exist */}
        <EmergencyNoticeBanner
          notices={notices}
          onSelectNotice={(n) => { setSelectedNotice(n); setActiveModal('notice'); }}
        />

        {/* 5. Live Chat Highlight: "কোনো সাহায্য দরকার?", "উপজেলার সেবা সম্পর্কে জানতে কথা বলুন" */}
        <LiveChatHighlight
          onOpenChat={() => setActiveScreen('chat')}
          onOpenFAQ={() => setActiveScreen('chat')}
        />

        {/* 6. দ্রুত সেবা: 5 Quick Action Chips */}
        <QuickServicesStrip
          onSelectService={handleSelectService}
        />

        {/* 7. Blood Donor Highlight: "জরুরি রক্ত দরকার?", blood group chips, search & register */}
        <BloodDonorHighlight
          onOpenBloodScreen={(grp) => {
            setPreselectedBloodGroup(grp);
            setActiveScreen('blood');
          }}
        />

        {/* 8. Popular Services Grid: 12 cards in 2-column clean layout */}
        <PopularServicesGrid
          onSelectService={handleSelectService}
        />

        {/* 9. সর্বশেষ নোটিশ: 3 recent notices with category badges and view all */}
        <LatestNoticesSection
          notices={notices}
          onSelectNotice={(n) => { setSelectedNotice(n); setActiveModal('notice'); }}
          onViewAllNotices={() => handleSelectService('notices')}
        />

        {/* 10. জরুরি যোগাযোগ: ৯৯৯, থানা, স্বাস্থ্য কমপ্লেক্স, ফায়ার সার্ভিস, অ্যাম্বুলেন্স, প্রশাসন */}
        <EmergencyContactsSection />

        {/* Admin Card (Visible for authorized administrators) */}
        {isAdmin && (
          <div className="mx-3.5 mb-3">
            <AdminCard
              onOpenAdmin={handleOpenAdmin}
              onUnauthorizedClick={() => setActiveModal('access_denied')}
            />
          </div>
        )}

        {/* Civic disclaimer and Developer Footer */}
        <AboutDeveloperSection
          lastUpdated={profile?.updated_at}
          onOpenAccountDeletion={() => setActiveModal('account_delete')}
          onOpenInstallModal={() => setInstallModalOpen(true)}
        />
      </div>

      {/* 11. Bottom Navigation: হোম, সেবা, লাইভ চ্যাট, রক্ত, প্রোফাইল */}
      <BottomNav
        activeTab="home"
        onTabChange={handleTabChange}
      />

      {/* Mobile Trial & APK Install Modal */}
      <InstallModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />

      {/* User Account / Profile Sheet */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onOpenAdmin={handleOpenAdmin}
        onRequestDeleteAccount={() => { setProfileModalOpen(false); setActiveModal('account_delete'); }}
      />

      {/* Detail Dialogs */}
      <DetailModals
        activeModal={activeModal}
        selectedUnion={selectedUnion}
        selectedNotice={selectedNotice}
        selectedCampaign={selectedCampaign}
        profile={profile}
        onClose={() => setActiveModal('none')}
        onConfirmDeleteAccount={handleConfirmAccountDeletion}
      />
    </AndroidFrame>
  );
}

export default App;
