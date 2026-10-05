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

  // History-aware navigation helper
  const navigateTo = (screen: 'home' | 'category' | 'admin' | 'chat' | 'blood', categoryKey: string | null = null) => {
    try {
      window.history.pushState({ type: 'screen', screen, category: categoryKey }, '');
    } catch (e) {}
    setSelectedCategory(categoryKey);
    setActiveScreen(screen);
  };

  const openAppModal = (modal: typeof activeModal, extraState?: () => void) => {
    try {
      window.history.pushState({ type: 'modal', modal }, '');
    } catch (e) {}
    extraState?.();
    setActiveModal(modal);
  };

  const navigateBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      if (activeModal !== 'none') {
        setActiveModal('none');
        setSelectedUnion(null);
        setSelectedNotice(null);
        setSelectedCampaign(null);
      } else if (profileModalOpen) {
        setProfileModalOpen(false);
      } else if (installModalOpen) {
        setInstallModalOpen(false);
      } else if (activeScreen !== 'home') {
        setActiveScreen('home');
        setSelectedCategory(null);
      }
    }
  };

  // Global back handler accessible to window.onpopstate and Android native bridge
  useEffect(() => {
    const handleAppBack = (): boolean => {
      // 1. If any detail modal is open, close it
      if (activeModal !== 'none') {
        setActiveModal('none');
        setSelectedUnion(null);
        setSelectedNotice(null);
        setSelectedCampaign(null);
        return true;
      }
      if (profileModalOpen) {
        setProfileModalOpen(false);
        return true;
      }
      if (installModalOpen) {
        setInstallModalOpen(false);
        return true;
      }
      // 2. If inside a subscreen, cleanly go back to home screen
      if (activeScreen !== 'home') {
        setActiveScreen('home');
        setSelectedCategory(null);
        return true;
      }
      // 3. User is already on clean root home screen
      return false;
    };

    (window as any).__handleAppBack = handleAppBack;

    const onPopState = () => {
      handleAppBack();
    };

    window.addEventListener('popstate', onPopState);
    return () => {
      delete (window as any).__handleAppBack;
      window.removeEventListener('popstate', onPopState);
    };
  }, [activeModal, profileModalOpen, installModalOpen, activeScreen]);

  // Handle Quick Actions and Popular Services selection
  const handleSelectService = (key: string) => {
    switch (key) {
      case 'blood':
      case 'blood_donors':
        setPreselectedBloodGroup(undefined);
        navigateTo('blood');
        break;
      case 'chat':
        navigateTo('chat');
        break;
      case 'notices':
        navigateTo('category', 'notices');
        break;
      case 'complaint':
      case 'complaints':
        navigateTo('category', 'complaints');
        break;
      case 'ambulance':
      case 'healthcare':
        navigateTo('category', 'health');
        break;
      case 'certificate':
      case 'citizen_services':
        navigateTo('category', 'services');
        break;
      case 'agriculture':
        navigateTo('category', 'agriculture');
        break;
      case 'education':
        navigateTo('category', 'education');
        break;
      case 'land_services':
        navigateTo('category', 'land');
        break;
      case 'office_directory':
      case 'social_welfare':
      case 'map':
      case 'tourism':
      case 'local_business':
      default:
        navigateTo('category', key);
        break;
    }
  };

  // Handle bottom navigation changes
  const handleTabChange = (tab: TabKey) => {
    switch (tab) {
      case 'home':
        navigateTo('home');
        break;
      case 'services':
        navigateTo('category', 'services');
        break;
      case 'chat':
        navigateTo('chat');
        break;
      case 'blood':
        setPreselectedBloodGroup(undefined);
        navigateTo('blood');
        break;
      case 'profile':
        try { window.history.pushState({ type: 'profile_modal' }, ''); } catch (e) {}
        setProfileModalOpen(true);
        break;
    }
  };

  // Handle open admin
  const handleOpenAdmin = () => {
    if (isAdmin) {
      navigateTo('admin');
    } else {
      openAppModal('access_denied');
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
          onBack={navigateBack} 
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
        <LiveChatScreen onBack={navigateBack} />
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
              onClick={navigateBack}
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
          onClose={navigateBack}
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
          onBack={navigateBack}
          onSelectUnion={(u) => openAppModal('union', () => setSelectedUnion(u))}
          onSelectNotice={(n) => openAppModal('notice', () => setSelectedNotice(n))}
          onSelectCampaign={(c) => openAppModal('campaign', () => setSelectedCampaign(c))}
          onOpenSponsorGuidelines={() => openAppModal('sponsor_info')}
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
          onClose={navigateBack}
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
        onOpenProfile={() => {
          try { window.history.pushState({ type: 'profile_modal' }, ''); } catch (e) {}
          setProfileModalOpen(true);
        }}
        onOpenChat={() => navigateTo('chat')}
        onOpenInstallModal={() => {
          try { window.history.pushState({ type: 'install_modal' }, ''); } catch (e) {}
          setInstallModalOpen(true);
        }}
        onOpenNotifications={() => {
          if (notices.length > 0) {
            openAppModal('notice', () => setSelectedNotice(notices[0]));
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
          onSelectCampaign={(c) => openAppModal('campaign', () => setSelectedCampaign(c))}
          onOpenSponsorInfo={() => openAppModal('sponsor_info')}
        />

        {/* 4. জরুরি ঘোষণা: Emergency notice banner if priority notices exist */}
        <EmergencyNoticeBanner
          notices={notices}
          onSelectNotice={(n) => openAppModal('notice', () => setSelectedNotice(n))}
        />

        {/* 5. Live Chat Highlight: "কোনো সাহায্য দরকার?", "উপজেলার সেবা সম্পর্কে জানতে কথা বলুন" */}
        <LiveChatHighlight
          onOpenChat={() => navigateTo('chat')}
          onOpenFAQ={() => navigateTo('chat')}
        />

        {/* 6. দ্রুত সেবা: 5 Quick Action Chips */}
        <QuickServicesStrip
          onSelectService={handleSelectService}
        />

        {/* 7. Blood Donor Highlight: "জরুরি রক্ত দরকার?", blood group chips, search & register */}
        <BloodDonorHighlight
          onOpenBloodScreen={(grp) => {
            setPreselectedBloodGroup(grp);
            navigateTo('blood');
          }}
        />

        {/* 8. Popular Services Grid: 12 cards in 2-column clean layout */}
        <PopularServicesGrid
          onSelectService={handleSelectService}
        />

        {/* 9. সর্বশেষ নোটিশ: 3 recent notices with category badges and view all */}
        <LatestNoticesSection
          notices={notices}
          onSelectNotice={(n) => openAppModal('notice', () => setSelectedNotice(n))}
          onViewAllNotices={() => handleSelectService('notices')}
        />

        {/* 10. জরুরি যোগাযোগ: ৯৯৯, থানা, স্বাস্থ্য কমপ্লেক্স, ফায়ার সার্ভিস, অ্যাম্বুলেন্স, প্রশাসন */}
        <EmergencyContactsSection />

        {/* Admin Card (Visible for authorized administrators) */}
        {isAdmin && (
          <div className="mx-3.5 mb-3">
            <AdminCard
              onOpenAdmin={handleOpenAdmin}
              onUnauthorizedClick={() => openAppModal('access_denied')}
            />
          </div>
        )}

        {/* Civic disclaimer and Developer Footer */}
        <AboutDeveloperSection
          lastUpdated={profile?.updated_at}
          onOpenAccountDeletion={() => openAppModal('account_delete')}
          onOpenInstallModal={() => {
            try { window.history.pushState({ type: 'install_modal' }, ''); } catch (e) {}
            setInstallModalOpen(true);
          }}
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
        onClose={navigateBack}
      />

      {/* User Account / Profile Sheet */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={navigateBack}
        onOpenAdmin={handleOpenAdmin}
        onRequestDeleteAccount={() => { setProfileModalOpen(false); openAppModal('account_delete'); }}
      />

      {/* Detail Dialogs */}
      <DetailModals
        activeModal={activeModal}
        selectedUnion={selectedUnion}
        selectedNotice={selectedNotice}
        selectedCampaign={selectedCampaign}
        profile={profile}
        onClose={navigateBack}
        onConfirmDeleteAccount={handleConfirmAccountDeletion}
      />
    </AndroidFrame>
  );
}

export default App;
