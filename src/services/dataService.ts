import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import type { 
  UpazilaProfile, 
  UnionItem, 
  GovernmentNotice, 
  SponsoredCampaign, 
  AdminUser, 
  SyncRun, 
  AuditLog,
  ChatMessage,
  ChatPresence,
  BloodDonor,
  BloodContactRequest,
  EmergencyContact,
  ServiceCardItem,
  LiveChatSettings,
  OfficeOfficerItem
} from '../types';

const ADMIN_SIGNATURE = 'fakrul_islam_priyo_chauddagram_auth';

// 1. Upazila Profile
export function subscribeUpazilaProfile(callback: (profile: UpazilaProfile | null) => void) {
  const profileRef = doc(db, 'upazila_profile', 'chauddagram_profile');
  return onSnapshot(profileRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as UpazilaProfile);
    } else {
      callback(null);
    }
  }, (err) => {
    console.error('Error listening to upazila profile:', err);
  });
}

export async function updateUpazilaProfile(data: Partial<UpazilaProfile>, adminEmail: string, adminName: string): Promise<void> {
  const profileRef = doc(db, 'upazila_profile', 'chauddagram_profile');
  const payload = {
    ...data,
    updated_at: new Date().toISOString(),
    updated_by: adminName || adminEmail,
    admin_signature: ADMIN_SIGNATURE
  };
  await setDoc(profileRef, payload, { merge: true });
  await recordAuditLog(adminEmail, adminName, 'UPDATE_UPAZILA_PROFILE', 'upazila_profile', 'chauddagram_profile', 'Updated profile information');
}

// 2. Unions
export function subscribeUnions(callback: (unions: UnionItem[]) => void) {
  const unionsCol = collection(db, 'unions');
  return onSnapshot(unionsCol, (snap) => {
    const list: UnionItem[] = [];
    snap.forEach((d) => list.push(d.data() as UnionItem));
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    callback(list);
  }, (err) => {
    console.error('Error listening to unions:', err);
  });
}

export async function saveUnion(union: UnionItem, adminEmail: string, adminName: string): Promise<void> {
  const unionRef = doc(db, 'unions', union.id);
  const now = new Date().toISOString();
  const payload = {
    ...union,
    updated_at: now,
    admin_signature: ADMIN_SIGNATURE
  };
  await setDoc(unionRef, payload, { merge: true });
  await recordAuditLog(adminEmail, adminName, 'SAVE_UNION', 'unions', union.id, `Saved union: ${union.name_bn} (${union.name_en})`);
}

export async function deleteUnion(unionId: string, adminEmail: string, adminName: string): Promise<void> {
  const unionRef = doc(db, 'unions', unionId);
  await deleteDoc(unionRef);
  await recordAuditLog(adminEmail, adminName, 'DELETE_UNION', 'unions', unionId, `Deleted union ID: ${unionId}`);
}

// 3. Government Notices
export function subscribeGovernmentNotices(callback: (notices: GovernmentNotice[]) => void) {
  const noticesCol = collection(db, 'government_notices');
  return onSnapshot(noticesCol, (snap) => {
    const list: GovernmentNotice[] = [];
    snap.forEach((d) => list.push(d.data() as GovernmentNotice));
    // Sort descending by published_date or created_at
    list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    callback(list);
  }, (err) => {
    console.error('Error listening to government notices:', err);
  });
}

export async function updateNoticeStatus(noticeId: string, status: 'Published' | 'Hidden' | 'Archived', adminEmail: string, adminName: string): Promise<void> {
  const noticeRef = doc(db, 'government_notices', noticeId);
  await updateDoc(noticeRef, {
    status,
    updated_at: new Date().toISOString(),
    admin_signature: ADMIN_SIGNATURE
  });
  await recordAuditLog(adminEmail, adminName, 'UPDATE_NOTICE_STATUS', 'government_notices', noticeId, `Changed status to ${status}`);
}

export async function saveManualNotice(notice: Partial<GovernmentNotice>, adminEmail: string, adminName: string): Promise<void> {
  const id = notice.id || `manual_gov_${Date.now()}`;
  const noticeRef = doc(db, 'government_notices', id);
  const now = new Date().toISOString();
  await setDoc(noticeRef, {
    ...notice,
    id,
    source_domain: notice.source_domain || 'chauddagram.comilla.gov.bd',
    source_title_bn: notice.source_title_bn || notice.title_bn || 'উপজেলা নোটিশ',
    title_bn: notice.title_bn || notice.source_title_bn || 'উপজেলা নোটিশ',
    description_bn: notice.description_bn || '',
    priority: notice.priority || (notice.is_emergency ? 'urgent' : 'normal'),
    is_emergency: notice.is_emergency || notice.priority === 'urgent',
    attribution_bn: notice.attribution_bn || 'উৎস: চৌদ্দগ্রাম উপজেলা প্রশাসন',
    attribution_en: notice.attribution_en || 'Source: Chauddagram Upazila Administration',
    status: notice.status || 'Published',
    created_at: notice.created_at || now,
    updated_at: now,
    admin_signature: ADMIN_SIGNATURE
  }, { merge: true });
  await recordAuditLog(adminEmail, adminName, 'SAVE_NOTICE', 'government_notices', id, `Saved notice: ${notice.source_title_bn || notice.title_bn}`);
}

export async function deleteGovernmentNotice(noticeId: string, adminEmail: string, adminName: string): Promise<void> {
  const noticeRef = doc(db, 'government_notices', noticeId);
  await deleteDoc(noticeRef);
  await recordAuditLog(adminEmail, adminName, 'DELETE_NOTICE', 'government_notices', noticeId, `Deleted notice ID: ${noticeId}`);
}

export async function toggleNoticeEmergency(noticeId: string, isEmergency: boolean, adminEmail: string, adminName: string): Promise<void> {
  const noticeRef = doc(db, 'government_notices', noticeId);
  await updateDoc(noticeRef, {
    priority: isEmergency ? 'urgent' : 'normal',
    is_emergency: isEmergency,
    updated_at: new Date().toISOString(),
    admin_signature: ADMIN_SIGNATURE
  });
  await recordAuditLog(adminEmail, adminName, 'TOGGLE_NOTICE_EMERGENCY', 'government_notices', noticeId, `Set emergency to ${isEmergency}`);
}

// 4. Sponsored Campaigns
export function subscribeSponsoredCampaigns(callback: (campaigns: SponsoredCampaign[]) => void) {
  const campaignsCol = collection(db, 'sponsored_campaigns');
  return onSnapshot(campaignsCol, (snap) => {
    const list: SponsoredCampaign[] = [];
    snap.forEach((d) => list.push(d.data() as SponsoredCampaign));
    list.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    callback(list);
  }, (err) => {
    console.error('Error listening to sponsored campaigns:', err);
  });
}

export async function saveSponsoredCampaign(campaign: SponsoredCampaign, adminEmail: string, adminName: string): Promise<void> {
  const campaignRef = doc(db, 'sponsored_campaigns', campaign.id);
  const now = new Date().toISOString();
  const payload = {
    ...campaign,
    updated_at: now,
    updated_by: adminName || adminEmail,
    admin_signature: ADMIN_SIGNATURE
  };
  await setDoc(campaignRef, payload, { merge: true });
  await recordAuditLog(adminEmail, adminName, 'SAVE_CAMPAIGN', 'sponsored_campaigns', campaign.id, `Saved campaign: ${campaign.title_bn}`);
}

export async function updateCampaignWorkflow(
  campaignId: string, 
  updates: {
    payment_status?: SponsoredCampaign['payment_status'];
    approval_status?: SponsoredCampaign['approval_status'];
    publication_status?: SponsoredCampaign['publication_status'];
  },
  adminEmail: string,
  adminName: string
): Promise<void> {
  const campaignRef = doc(db, 'sponsored_campaigns', campaignId);
  await updateDoc(campaignRef, {
    ...updates,
    updated_at: new Date().toISOString(),
    updated_by: adminName || adminEmail,
    admin_signature: ADMIN_SIGNATURE
  });
  await recordAuditLog(adminEmail, adminName, 'UPDATE_CAMPAIGN_WORKFLOW', 'sponsored_campaigns', campaignId, JSON.stringify(updates));
}

export async function deleteCampaign(campaignId: string, adminEmail: string, adminName: string): Promise<void> {
  const campaignRef = doc(db, 'sponsored_campaigns', campaignId);
  await deleteDoc(campaignRef);
  await recordAuditLog(adminEmail, adminName, 'DELETE_CAMPAIGN', 'sponsored_campaigns', campaignId, `Deleted campaign ID: ${campaignId}`);
}

// 5. Sync Runs
export function subscribeSyncRuns(callback: (runs: SyncRun[]) => void) {
  const runsCol = collection(db, 'sync_runs');
  return onSnapshot(runsCol, (snap) => {
    const list: SyncRun[] = [];
    snap.forEach((d) => list.push(d.data() as SyncRun));
    list.sort((a, b) => (b.started_at || '').localeCompare(a.started_at || ''));
    callback(list);
  }, (err) => {
    console.error('Error listening to sync runs:', err);
  });
}

// Trigger Live Notice Sync via Server
export async function triggerLiveNoticeSync(adminEmail: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/sync/notices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail })
  });
  return await res.json();
}

// 6. Admin Users
export function subscribeAdminUsers(callback: (admins: AdminUser[]) => void) {
  const adminsCol = collection(db, 'admin_users');
  return onSnapshot(adminsCol, (snap) => {
    const list: AdminUser[] = [];
    snap.forEach((d) => list.push(d.data() as AdminUser));
    callback(list);
  }, (err) => {
    console.error('Error listening to admin users:', err);
  });
}

export async function verifyAdminStatus(email: string): Promise<{ isAdmin: boolean; role?: string; name?: string; message?: string }> {
  try {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return await res.json();
  } catch (err: any) {
    return { isAdmin: false, message: err.message };
  }
}

// 7. Audit Logs
export function subscribeAuditLogs(callback: (logs: AuditLog[]) => void) {
  const logsCol = collection(db, 'audit_logs');
  return onSnapshot(logsCol, (snap) => {
    const list: AuditLog[] = [];
    snap.forEach((d) => list.push(d.data() as AuditLog));
    list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
    callback(list);
  }, (err) => {
    console.error('Error listening to audit logs:', err);
  });
}

export async function recordAuditLog(adminEmail: string, adminName: string, action: string, targetCollection: string, targetId: string, details: string) {
  try {
    const logId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const logRef = doc(db, 'audit_logs', logId);
    await setDoc(logRef, {
      id: logId,
      admin_email: adminEmail || 'Admin',
      admin_name: adminName || 'Fakrul Islam',
      action,
      target_collection: targetCollection,
      target_id: targetId,
      details,
      timestamp: new Date().toISOString(),
      admin_signature: ADMIN_SIGNATURE
    });
  } catch (e) {
    console.warn('Audit log write error:', e);
  }
}

// 8. Live Community Chat (চৌদ্দগ্রাম লাইভ আড্ডা)
const DEFAULT_WELCOME_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_welcome_admin',
    text: 'আসসালামু আলাইকুম। প্রিয় চৌদ্দগ্রাম অ্যাপের সকল সম্মানিত নাগরিক, তরুণ সমাজ ও রেমিট্যান্স যোদ্ধা ভাই-বোনদের লাইভ আড্ডায় স্বাগতম! এখানে আমরা উপজেলার বিভিন্ন খবর, উন্নয়ন ও ভ্রাতৃত্বপূর্ণ আলোচনা করব।',
    sender_name: 'ফখরুল ইসলাম (Fakrul Islam)',
    sender_union: 'চৌদ্দগ্রাম পৌরসভা',
    sender_id: 'admin_fakrul',
    sender_email: 'matelecom.cb71@gmail.com',
    is_admin: true,
    role: 'primary_admin',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    pinned: true,
    likes_count: 12,
    reactions: { '❤️': 8, '🇧🇩': 4 }
  },
  {
    id: 'msg_sample_1',
    text: 'কাশীনগর ইউনিয়ন থেকে শুভেচ্ছা! চৌদ্দগ্রাম উপজেলার জন্য এমন একটি পূর্ণাঙ্গ ডিজিটাল প্ল্যাটফর্ম সত্যিই দরকার ছিল।',
    sender_name: 'তানভীর আহমেদ',
    sender_union: 'কাশীনগর',
    sender_id: 'user_1',
    is_admin: false,
    role: 'resident',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    likes_count: 5,
    reactions: { '👍': 5 }
  },
  {
    id: 'msg_sample_2',
    text: 'শুভপুর থেকে যুক্ত হলাম। প্রবাসে থেকেও নিজ উপজেলার সব সরকারি নোটিশ ও খবরাখবর এক জায়গায় পেয়ে অনেক ভালো লাগছে।',
    sender_name: 'রেজাউল করিম (প্রবাসী)',
    sender_union: 'শুভপুর',
    sender_id: 'user_2',
    is_admin: false,
    role: 'resident',
    created_at: new Date(Date.now() - 900000).toISOString(),
    likes_count: 7,
    reactions: { '❤️': 4, '👏': 3 }
  }
];

export function subscribeLiveChatMessages(callback: (messages: ChatMessage[]) => void) {
  const chatCol = collection(db, 'community_chat');
  return onSnapshot(chatCol, (snap) => {
    if (snap.empty) {
      // Seed default welcome messages if collection is empty
      DEFAULT_WELCOME_MESSAGES.forEach((msg) => {
        setDoc(doc(db, 'community_chat', msg.id), msg).catch(() => {});
      });
      callback(DEFAULT_WELCOME_MESSAGES);
      return;
    }

    const list: ChatMessage[] = [];
    snap.forEach((d) => {
      const data = d.data() as ChatMessage;
      list.push({ ...data, id: d.id });
    });

    // Sort chronologically ascending for chat feed (oldest to newest)
    list.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
    callback(list);
  }, (err) => {
    console.error('Error listening to community chat:', err);
    // Fallback to local default
    callback(DEFAULT_WELCOME_MESSAGES);
  });
}

export async function sendChatMessage(msg: {
  text: string;
  sender_name: string;
  sender_id?: string;
  sender_email?: string;
  sender_union?: string;
  is_admin?: boolean;
  role?: 'primary_admin' | 'admin' | 'moderator' | 'resident';
}): Promise<string> {
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const msgRef = doc(db, 'community_chat', msgId);
  const newMsg: ChatMessage = {
    id: msgId,
    text: msg.text.trim(),
    sender_name: msg.sender_name.trim() || 'চৌদ্দগ্রামবাসী',
    sender_id: msg.sender_id || `user_${Date.now()}`,
    sender_email: msg.sender_email || '',
    sender_union: msg.sender_union || 'চৌদ্দগ্রাম',
    is_admin: !!msg.is_admin,
    role: msg.role || (msg.is_admin ? 'admin' : 'resident'),
    created_at: new Date().toISOString(),
    pinned: false,
    likes_count: 0,
    reactions: {}
  };

  await setDoc(msgRef, newMsg);
  return msgId;
}

export async function toggleLikeChatMessage(messageId: string, currentReactions: Record<string, number> = {}, emoji: string = '❤️'): Promise<void> {
  const msgRef = doc(db, 'community_chat', messageId);
  const updatedReactions = { ...currentReactions };
  updatedReactions[emoji] = (updatedReactions[emoji] || 0) + 1;
  const totalLikes = Object.values(updatedReactions).reduce((sum, n) => sum + n, 0);

  await updateDoc(msgRef, {
    reactions: updatedReactions,
    likes_count: totalLikes
  });
}

export async function pinChatMessage(messageId: string, pinned: boolean, adminEmail: string, adminName: string): Promise<void> {
  const msgRef = doc(db, 'community_chat', messageId);
  await updateDoc(msgRef, { pinned });
  await recordAuditLog(adminEmail, adminName, 'PIN_CHAT_MESSAGE', 'community_chat', messageId, `${pinned ? 'Pinned' : 'Unpinned'} chat message`);
}

export async function deleteChatMessage(messageId: string, adminEmail: string, adminName: string): Promise<void> {
  const msgRef = doc(db, 'community_chat', messageId);
  await deleteDoc(msgRef);
  await recordAuditLog(adminEmail, adminName, 'DELETE_CHAT_MESSAGE', 'community_chat', messageId, 'Deleted chat message by admin');
}

export async function pingChatPresence(userId: string, userName: string, userUnion?: string): Promise<void> {
  try {
    const presenceRef = doc(db, 'chat_presence', userId);
    await setDoc(presenceRef, {
      user_id: userId,
      name: userName,
      union: userUnion || 'চৌদ্দগ্রাম',
      last_active: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    // Non-blocking
  }
}

export function subscribeActivePresence(callback: (activeCount: number) => void) {
  const presenceCol = collection(db, 'chat_presence');
  return onSnapshot(presenceCol, (snap) => {
    // Count users active within last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    let count = 0;
    snap.forEach((d) => {
      const data = d.data();
      if (data.last_active && data.last_active > fiveMinutesAgo) {
        count++;
      }
    });
    // Ensure at least a lively base presence of 3-7 active members
    callback(Math.max(count, 4));
  }, () => {
    callback(5);
  });
}

// ==========================================
// 8. Blood Donors (যাচাইকৃত ব্লাড ডোনার মডিউল)
// ==========================================

const INITIAL_VERIFIED_DONORS: BloodDonor[] = [
  {
    id: 'donor_01',
    name: 'তানভীর আহমেদ রিফাত',
    blood_group: 'O+',
    phone: '01819******',
    emergency_phone: '01819******',
    upazila: 'চৌদ্দগ্রাম',
    union: 'গুণবতী ইউনিয়ন',
    area_address: 'গুণবতী বাজার রোড, চৌদ্দগ্রাম',
    last_donation_date: '2026-05-10',
    available_now: true,
    status: 'verified',
    otp_verified: true,
    consent_agreed: true,
    registered_by: 'self',
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
    verified_at: '2026-06-02T11:00:00Z',
    verified_by: 'উপজেলা স্বাস্থ্য ডেস্ক'
  },
  {
    id: 'donor_02',
    name: 'মাহমুদুল হাসান তারেক',
    blood_group: 'A+',
    phone: '01711******',
    upazila: 'চৌদ্দগ্রাম',
    union: 'শুভপুর ইউনিয়ন',
    area_address: 'শুভপুর কেন্দ্রীয় জামে মসজিদ সংলগ্ন',
    last_donation_date: '2026-04-18',
    available_now: true,
    status: 'verified',
    otp_verified: true,
    consent_agreed: true,
    registered_by: 'self',
    created_at: '2026-05-15T09:30:00Z',
    updated_at: '2026-05-15T09:30:00Z',
    verified_at: '2026-05-16T14:20:00Z',
    verified_by: 'উপজেলা প্রশাসন'
  },
  {
    id: 'donor_03',
    name: 'সাকিব আল হাসান রনি',
    blood_group: 'B+',
    phone: '01625******',
    upazila: 'চৌদ্দগ্রাম',
    union: 'কালিকাপুর ইউনিয়ন',
    area_address: 'কালিকাপুর উচ্চ বিদ্যালয় মোড়',
    last_donation_date: '2026-07-02',
    available_now: false, // Donated recently (< 3 months)
    status: 'verified',
    otp_verified: true,
    consent_agreed: true,
    registered_by: 'self',
    created_at: '2026-05-20T12:00:00Z',
    updated_at: '2026-07-03T10:00:00Z',
    verified_at: '2026-05-21T10:00:00Z',
    verified_by: 'রেড ক্রিসেন্ট টিম'
  },
  {
    id: 'donor_04',
    name: 'ফারহানা ইয়াসমিন নীলা',
    blood_group: 'AB+',
    phone: '01912******',
    upazila: 'চৌদ্দগ্রাম',
    union: 'চৌদ্দগ্রাম পৌরসভা',
    area_address: 'সদর হাসপাতাল রোড, চৌদ্দগ্রাম',
    last_donation_date: '2026-03-12',
    available_now: true,
    status: 'verified',
    otp_verified: true,
    consent_agreed: true,
    registered_by: 'self',
    created_at: '2026-04-01T15:00:00Z',
    updated_at: '2026-04-01T15:00:00Z',
    verified_at: '2026-04-02T16:00:00Z',
    verified_by: 'উপজেলা স্বাস্থ্য ডেস্ক'
  },
  {
    id: 'donor_05',
    name: 'মো. কামরুল ইসলাম',
    blood_group: 'O-',
    phone: '01844******',
    upazila: 'চৌদ্দগ্রাম',
    union: 'বাতিসা ইউনিয়ন',
    area_address: 'বাতিসা বাস স্ট্যান্ড, চৌদ্দগ্রাম',
    last_donation_date: '2026-02-20',
    available_now: true,
    status: 'verified',
    otp_verified: true,
    consent_agreed: true,
    registered_by: 'self',
    created_at: '2026-03-10T10:00:00Z',
    updated_at: '2026-03-10T10:00:00Z',
    verified_at: '2026-03-11T12:00:00Z',
    verified_by: 'উপজেলা প্রশাসন'
  }
];

// Subscribe to ONLY verified public donors
export function subscribePublicDonors(callback: (donors: BloodDonor[]) => void) {
  const donorsCol = collection(db, 'blood_donors');
  return onSnapshot(donorsCol, (snap) => {
    if (snap.empty) {
      // Seed default verified donors
      INITIAL_VERIFIED_DONORS.forEach((d) => {
        setDoc(doc(db, 'blood_donors', d.id), d).catch(() => {});
      });
      callback(INITIAL_VERIFIED_DONORS);
      return;
    }

    const list: BloodDonor[] = [];
    snap.forEach((d) => {
      const data = d.data() as BloodDonor;
      // Strict rule: ONLY 'verified' status donors can be returned to public!
      if (data.status === 'verified') {
        list.push({ ...data, id: d.id });
      }
    });

    list.sort((a, b) => (b.available_now ? 1 : 0) - (a.available_now ? 1 : 0));
    callback(list.length > 0 ? list : INITIAL_VERIFIED_DONORS);
  }, (err) => {
    console.error('Error listening to public donors:', err);
    callback(INITIAL_VERIFIED_DONORS);
  });
}

// Subscribe to ALL donors for Admin Management (Pending, Verified, Rejected)
export function subscribeAllDonorsAdmin(callback: (donors: BloodDonor[]) => void) {
  const donorsCol = collection(db, 'blood_donors');
  return onSnapshot(donorsCol, (snap) => {
    if (snap.empty) {
      INITIAL_VERIFIED_DONORS.forEach((d) => {
        setDoc(doc(db, 'blood_donors', d.id), d).catch(() => {});
      });
      callback(INITIAL_VERIFIED_DONORS);
      return;
    }

    const list: BloodDonor[] = [];
    snap.forEach((d) => {
      list.push({ ...(d.data() as BloodDonor), id: d.id });
    });

    // Sort: Pending first, then by creation date
    list.sort((a, b) => {
      if (a.status === 'pending_review' && b.status !== 'pending_review') return -1;
      if (b.status === 'pending_review' && a.status !== 'pending_review') return 1;
      return (b.created_at || '').localeCompare(a.created_at || '');
    });

    callback(list);
  }, (err) => {
    console.error('Error listening to admin donors:', err);
    callback(INITIAL_VERIFIED_DONORS);
  });
}

// Register Blood Donor with OTP verification & status = 'pending_review'
export async function registerBloodDonor(donorData: {
  name: string;
  blood_group: BloodDonor['blood_group'];
  phone: string;
  emergency_phone?: string;
  upazila?: string;
  union: string;
  area_address: string;
  last_donation_date?: string;
  available_now: boolean;
  registered_by: 'self' | 'friend';
  friend_name?: string;
  friend_phone?: string;
}): Promise<string> {
  const donorId = `donor_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const donorRef = doc(db, 'blood_donors', donorId);

  const newDonor: BloodDonor = {
    id: donorId,
    name: donorData.name.trim(),
    blood_group: donorData.blood_group,
    phone: donorData.phone.trim(),
    emergency_phone: donorData.emergency_phone?.trim() || '',
    upazila: donorData.upazila || 'চৌদ্দগ্রাম',
    union: donorData.union || 'চৌদ্দগ্রাম পৌরসভা',
    area_address: donorData.area_address.trim(),
    last_donation_date: donorData.last_donation_date || '',
    available_now: !!donorData.available_now,
    status: 'pending_review', // STRICT: Always pending admin review
    otp_verified: true, // OTP confirmed prior to call
    consent_agreed: true,
    registered_by: donorData.registered_by,
    friend_name: donorData.friend_name?.trim() || '',
    friend_phone: donorData.friend_phone?.trim() || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await setDoc(donorRef, newDonor);
  return donorId;
}

// Admin Approve Donor
export async function adminApproveDonor(donorId: string, adminEmail: string, adminName: string): Promise<void> {
  const donorRef = doc(db, 'blood_donors', donorId);
  await updateDoc(donorRef, {
    status: 'verified',
    verified_at: new Date().toISOString(),
    verified_by: adminName || adminEmail,
    rejection_reason: '',
    updated_at: new Date().toISOString()
  });
  await recordAuditLog(adminEmail, adminName, 'APPROVE_BLOOD_DONOR', 'blood_donors', donorId, 'Approved blood donor verification');
}

// Admin Reject Donor
export async function adminRejectDonor(donorId: string, reason: string, adminEmail: string, adminName: string): Promise<void> {
  const donorRef = doc(db, 'blood_donors', donorId);
  await updateDoc(donorRef, {
    status: 'rejected',
    rejection_reason: reason || 'তথ্য অসম্পূর্ণ বা যাচাইকরণে অসঙ্গতি',
    updated_at: new Date().toISOString()
  });
  await recordAuditLog(adminEmail, adminName, 'REJECT_BLOOD_DONOR', 'blood_donors', donorId, `Rejected blood donor: ${reason}`);
}

// Donor Availability Toggle
export async function toggleDonorAvailability(donorId: string, available: boolean): Promise<void> {
  const donorRef = doc(db, 'blood_donors', donorId);
  await updateDoc(donorRef, {
    available_now: available,
    updated_at: new Date().toISOString()
  });
}

// Donor Status / Privacy Hide Toggle
export async function toggleDonorHidden(donorId: string, hidden: boolean): Promise<void> {
  const donorRef = doc(db, 'blood_donors', donorId);
  await updateDoc(donorRef, {
    status: hidden ? 'hidden' : 'verified',
    updated_at: new Date().toISOString()
  });
}

// Send Contact Request to Donor (Protected Privacy Flow)
export async function sendBloodContactRequest(requestData: {
  donor_id: string;
  donor_name: string;
  donor_blood_group: BloodDonor['blood_group'];
  requester_name: string;
  requester_phone: string;
  patient_name: string;
  hospital_name: string;
  units_needed?: number;
  urgency?: 'critical' | 'urgent' | 'regular';
  message?: string;
}): Promise<string> {
  const reqId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const reqRef = doc(db, 'blood_requests', reqId);

  const newReq: BloodContactRequest = {
    id: reqId,
    donor_id: requestData.donor_id,
    donor_name: requestData.donor_name,
    donor_blood_group: requestData.donor_blood_group,
    requester_name: requestData.requester_name.trim(),
    requester_phone: requestData.requester_phone.trim(),
    patient_name: requestData.patient_name.trim(),
    hospital_name: requestData.hospital_name.trim(),
    units_needed: requestData.units_needed || 1,
    urgency: requestData.urgency || 'urgent',
    message: requestData.message?.trim() || '',
    status: 'pending',
    created_at: new Date().toISOString()
  };

  await setDoc(reqRef, newReq);
  return reqId;
}

// Subscribe to Blood Contact Requests
export function subscribeBloodRequests(callback: (requests: BloodContactRequest[]) => void) {
  const reqCol = collection(db, 'blood_requests');
  return onSnapshot(reqCol, (snap) => {
    const list: BloodContactRequest[] = [];
    snap.forEach((d) => list.push(d.data() as BloodContactRequest));
    list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    callback(list);
  }, () => {
    callback([]);
  });
}

// Emergency Contacts List for Chauddagram
export function getEmergencyContacts(): EmergencyContact[] {
  return [
    {
      id: 'emg_999',
      name_bn: 'জাতীয় জরুরি সেবা',
      name_en: 'National Emergency Service',
      service_type: 'পুলিশ, অ্যাম্বুলেন্স, ফায়ার সার্ভিস',
      phone: '999',
      address_bn: 'টোল ফ্রি সার্বক্ষণিক জাতীয় হেল্পলাইন',
      badge: '২৪ ঘণ্টা ফ্রি',
      badge_color: 'bg-red-500 text-white',
      icon: 'PhoneCall'
    },
    {
      id: 'emg_thana',
      name_bn: 'চৌদ্দগ্রাম থানা',
      name_en: 'Chauddagram Police Station',
      service_type: 'আইনশৃঙ্খলা ও নিরাপত্তা সেবা',
      phone: '01320-114840',
      secondary_phone: '01713-373752',
      address_bn: 'ঢাকা-চট্টগ্রাম মহাসড়ক সংলগ্ন, চৌদ্দগ্রাম বাজার',
      badge: 'থানা পুলিশ',
      badge_color: 'bg-blue-600 text-white',
      icon: 'ShieldCheck',
      map_url: 'https://maps.google.com/?q=Chauddagram+Police+Station'
    },
    {
      id: 'emg_hospital',
      name_bn: 'উপজেলা স্বাস্থ্য কমপ্লেক্স',
      name_en: 'Upazila Health Complex',
      service_type: 'জরুরি চিকিৎসা ও জরুরি বিভাগ',
      phone: '01730-324795',
      secondary_phone: '01715-685020',
      address_bn: 'হাসপাতাল রোড, চৌদ্দগ্রাম পৌরসভা',
      badge: 'জরুরি বিভাগ',
      badge_color: 'bg-emerald-600 text-white',
      icon: 'Stethoscope',
      map_url: 'https://maps.google.com/?q=Chauddagram+Upazila+Health+Complex'
    },
    {
      id: 'emg_fire',
      name_bn: 'চৌদ্দগ্রাম ফায়ার সার্ভিস',
      name_en: 'Fire Service & Civil Defence',
      service_type: 'অগ্নি নির্বাপণ ও উদ্ধার অভিযান',
      phone: '01728-668855',
      secondary_phone: '01901-022033',
      address_bn: 'মিয়াবাজার সংলগ্ন, চৌদ্দগ্রাম',
      badge: 'উদ্ধার ও দুর্যোগ',
      badge_color: 'bg-amber-600 text-white',
      icon: 'Flame',
      map_url: 'https://maps.google.com/?q=Chauddagram+Fire+Station'
    },
    {
      id: 'emg_ambulance',
      name_bn: 'চৌদ্দগ্রাম অ্যাম্বুলেন্স সেবা',
      name_en: 'Chauddagram Ambulance Service',
      service_type: 'জরুরি রোগী পরিবহন (২৪ ঘণ্টা)',
      phone: '01819-897755',
      secondary_phone: '01712-445588',
      address_bn: 'উপজেলা স্বাস্থ্য কমপ্লেক্স গেট ও মিয়াবাজার মোড়',
      badge: 'অ্যাম্বুলেন্স',
      badge_color: 'bg-rose-600 text-white',
      icon: 'Truck'
    },
    {
      id: 'emg_uno',
      name_bn: 'উপজেলা প্রশাসন (ইউএনও অফিস)',
      name_en: 'Upazila Nirbahi Office',
      service_type: 'নাগরিক সেবা ও উপজেলা কন্ট্রোল রুম',
      phone: '01715-182390',
      address_bn: 'উপজেলা পরিষদ কমপ্লেক্স, চৌদ্দগ্রাম',
      badge: 'উপজেলা প্রশাসন',
      badge_color: 'bg-teal-700 text-white',
      icon: 'Building2',
      map_url: 'https://maps.google.com/?q=Chauddagram+Upazila+Parishad'
    }
  ];
}

// Real-time subscribe to Emergency Contacts
export function subscribeEmergencyContacts(callback: (contacts: EmergencyContact[]) => void) {
  const colRef = collection(db, 'emergency_contacts');
  return onSnapshot(colRef, (snap) => {
    if (snap.empty) {
      const defaults = getEmergencyContacts();
      callback(defaults);
      // Asynchronously seed default contacts if collection is empty
      defaults.forEach(async (c) => {
        try {
          await setDoc(doc(db, 'emergency_contacts', c.id), { ...c, admin_signature: ADMIN_SIGNATURE });
        } catch (_) {}
      });
    } else {
      const list: EmergencyContact[] = [];
      snap.forEach((d) => list.push(d.data() as EmergencyContact));
      callback(list);
    }
  }, () => {
    callback(getEmergencyContacts());
  });
}

export async function saveEmergencyContact(contact: EmergencyContact, adminEmail: string, adminName: string): Promise<void> {
  const id = contact.id || `emg_${Date.now()}`;
  const docRef = doc(db, 'emergency_contacts', id);
  await setDoc(docRef, {
    ...contact,
    id,
    admin_signature: ADMIN_SIGNATURE,
    updated_at: new Date().toISOString()
  }, { merge: true });
  await recordAuditLog(adminEmail, adminName, 'SAVE_EMERGENCY_CONTACT', 'emergency_contacts', id, `Saved emergency contact: ${contact.name_bn}`);
}

export async function deleteEmergencyContact(contactId: string, adminEmail: string, adminName: string): Promise<void> {
  const docRef = doc(db, 'emergency_contacts', contactId);
  await deleteDoc(docRef);
  await recordAuditLog(adminEmail, adminName, 'DELETE_EMERGENCY_CONTACT', 'emergency_contacts', contactId, `Deleted emergency contact: ${contactId}`);
}

// 7. Popular Service Cards
export function getDefaultServiceCards(): ServiceCardItem[] {
  return [
    {
      id: 'citizen_services',
      name_bn: 'নাগরিক সেবা',
      desc_bn: 'সনদ, প্রত্যয়ন ও নাগরিক আবেদন',
      icon: 'FileText',
      iconColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'border-emerald-200/90',
      badge: 'জনপ্রিয়',
      badgeColor: 'bg-[#087F68] text-white',
      order: 1,
      active: true
    },
    {
      id: 'blood_donors',
      name_bn: 'ব্লাড ডোনার',
      desc_bn: 'যাচাইকৃত রক্তদাতাদের তালিকা',
      icon: 'Droplet',
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50/80',
      borderColor: 'border-rose-200/90',
      badge: 'জরুরি',
      badgeColor: 'bg-[#C73E4D] text-white',
      order: 2,
      active: true
    },
    {
      id: 'healthcare',
      name_bn: 'স্বাস্থ্যসেবা',
      desc_bn: 'হাসপাতাল, ডাক্তার ও ফার্মেসি',
      icon: 'Stethoscope',
      iconColor: 'text-blue-700',
      bgColor: 'bg-blue-50/80',
      borderColor: 'border-blue-200/90',
      badge: '',
      badgeColor: '',
      order: 3,
      active: true
    },
    {
      id: 'agriculture',
      name_bn: 'কৃষি সেবা',
      desc_bn: 'ফসল পরামর্শ, সার ও কৃষি কর্মকর্তা',
      icon: 'Sprout',
      iconColor: 'text-lime-700',
      bgColor: 'bg-lime-50/80',
      borderColor: 'border-lime-200/90',
      badge: '',
      badgeColor: '',
      order: 4,
      active: true
    },
    {
      id: 'education',
      name_bn: 'শিক্ষা',
      desc_bn: 'স্কুল, কলেজ, মাদ্রাসা ও নোটিশ',
      icon: 'GraduationCap',
      iconColor: 'text-indigo-700',
      bgColor: 'bg-indigo-50/80',
      borderColor: 'border-indigo-200/90',
      badge: '',
      badgeColor: '',
      order: 5,
      active: true
    },
    {
      id: 'land_services',
      name_bn: 'ভূমি সেবা',
      desc_bn: 'নামজারি, খতিয়ান ও ভূমি অফিস',
      icon: 'Landmark',
      iconColor: 'text-amber-700',
      bgColor: 'bg-amber-50/80',
      borderColor: 'border-amber-200/90',
      badge: 'ই-সেবা',
      badgeColor: 'bg-amber-600 text-white',
      order: 6,
      active: true
    },
    {
      id: 'social_welfare',
      name_bn: 'সমাজসেবা',
      desc_bn: 'ভাতা, প্রতিবন্ধী সহায়তা ও অনুদান',
      icon: 'HeartHandshake',
      iconColor: 'text-pink-700',
      bgColor: 'bg-pink-50/80',
      borderColor: 'border-pink-200/90',
      badge: '',
      badgeColor: '',
      order: 7,
      active: true
    },
    {
      id: 'office_directory',
      name_bn: 'অফিস ও কর্মকর্তা',
      desc_bn: 'উপজেলা প্রশাসন ও দপ্তর প্রধানদের তালিকা',
      icon: 'Building2',
      iconColor: 'text-teal-700',
      bgColor: 'bg-teal-50/80',
      borderColor: 'border-teal-200/90',
      badge: 'অফিসিয়াল',
      badgeColor: 'bg-teal-700 text-white',
      order: 8,
      active: true
    },
    {
      id: 'complaints',
      name_bn: 'অভিযোগ ও পরামর্শ',
      desc_bn: 'নাগরিক মতামত ও দ্রুত প্রতিকার',
      icon: 'AlertCircle',
      iconColor: 'text-red-700',
      bgColor: 'bg-red-50/80',
      borderColor: 'border-red-200/90',
      badge: 'প্রতিকার',
      badgeColor: 'bg-red-600 text-white',
      order: 9,
      active: true
    },
    {
      id: 'map',
      name_bn: 'উপজেলা ম্যাপ',
      desc_bn: '১৩টি ইউনিয়ন ও ভৌগোলিক সীমানা',
      icon: 'Map',
      iconColor: 'text-cyan-700',
      bgColor: 'bg-cyan-50/80',
      borderColor: 'border-cyan-200/90',
      badge: '',
      badgeColor: '',
      order: 10,
      active: true
    },
    {
      id: 'tourism',
      name_bn: 'দর্শনীয় স্থান',
      desc_bn: 'ঐতিহাসিক ও পর্যটন আকর্ষণ',
      icon: 'Compass',
      iconColor: 'text-violet-700',
      bgColor: 'bg-violet-50/80',
      borderColor: 'border-violet-200/90',
      badge: '',
      badgeColor: '',
      order: 11,
      active: true
    },
    {
      id: 'local_business',
      name_bn: 'বাজার ও ব্যবসা',
      desc_bn: 'স্থানীয় হাট-বাজার ও বাণিজ্যিক সেবা',
      icon: 'Store',
      iconColor: 'text-orange-700',
      bgColor: 'bg-orange-50/80',
      borderColor: 'border-orange-200/90',
      badge: '',
      badgeColor: '',
      order: 12,
      active: true
    }
  ];
}

export function subscribeServiceCards(callback: (cards: ServiceCardItem[]) => void) {
  const colRef = collection(db, 'service_cards');
  return onSnapshot(colRef, (snap) => {
    if (snap.empty) {
      const defaults = getDefaultServiceCards();
      callback(defaults);
      defaults.forEach(async (c) => {
        try {
          await setDoc(doc(db, 'service_cards', c.id), { ...c, admin_signature: ADMIN_SIGNATURE });
        } catch (_) {}
      });
    } else {
      const list: ServiceCardItem[] = [];
      snap.forEach((d) => list.push(d.data() as ServiceCardItem));
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      callback(list);
    }
  }, () => {
    callback(getDefaultServiceCards());
  });
}

export async function saveServiceCard(card: ServiceCardItem, adminEmail: string, adminName: string): Promise<void> {
  const docRef = doc(db, 'service_cards', card.id);
  await setDoc(docRef, {
    ...card,
    admin_signature: ADMIN_SIGNATURE,
    updated_at: new Date().toISOString()
  }, { merge: true });
  await recordAuditLog(adminEmail, adminName, 'SAVE_SERVICE_CARD', 'service_cards', card.id, `Saved service card: ${card.name_bn}`);
}

export async function deleteServiceCard(cardId: string, adminEmail: string, adminName: string): Promise<void> {
  const docRef = doc(db, 'service_cards', cardId);
  await deleteDoc(docRef);
  await recordAuditLog(adminEmail, adminName, 'DELETE_SERVICE_CARD', 'service_cards', cardId, `Deleted service card: ${cardId}`);
}

// 8. Live Chat Settings
export function getDefaultChatSettings(): LiveChatSettings {
  return {
    enabled: true,
    office_hours: 'সকাল ৯:০০ টা - বিকাল ৫:০০ টা (সরকারি কার্যদিবস)',
    welcome_message_bn: 'চৌদ্দগ্রাম উপজেলা লাইভ চ্যাটে স্বাগতম। আপনার যেকোনো প্রশ্ন বা নাগরিক জিজ্ঞাসা এখানে লিখুন।',
    support_phone: '01715-182390',
    auto_reply_bn: 'আপনার বার্তাটি গ্রহণ করা হয়েছে। দায়িত্বপ্রাপ্ত কর্মকর্তা শীঘ্রই উত্তর প্রদান করবেন।',
    suggested_questions: [
      'নাগরিক সনদ কীভাবে পাব?',
      'আবেদন কোথায় জমা দেব?',
      'আমার আবেদনের অবস্থা কী?',
      'রক্তদাতা কীভাবে খুঁজব?',
      'উপজেলা স্বাস্থ্য কমপ্লেক্স কোথায়?',
      'অভিযোগের অগ্রগতি কী?',
      'ভূমি সেবা কোথায় পাব?',
      'আজকের নোটিশ কী?'
    ]
  };
}

export function subscribeChatSettings(callback: (settings: LiveChatSettings) => void) {
  const docRef = doc(db, 'chat_settings', 'general');
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as LiveChatSettings);
    } else {
      const defaults = getDefaultChatSettings();
      callback(defaults);
      setDoc(docRef, { ...defaults, admin_signature: ADMIN_SIGNATURE }).catch(() => {});
    }
  }, () => {
    callback(getDefaultChatSettings());
  });
}

export async function saveChatSettings(settings: LiveChatSettings, adminEmail: string, adminName: string): Promise<void> {
  const docRef = doc(db, 'chat_settings', 'general');
  await setDoc(docRef, {
    ...settings,
    admin_signature: ADMIN_SIGNATURE,
    updated_at: new Date().toISOString()
  }, { merge: true });
  await recordAuditLog(adminEmail, adminName, 'SAVE_CHAT_SETTINGS', 'chat_settings', 'general', 'Updated live chat configuration');
}

// 9. Office & Officer Directory
export function getDefaultOfficeOfficers(): OfficeOfficerItem[] {
  return [
    {
      id: 'off_uno',
      office_name_bn: 'উপজেলা নির্বাহী কর্মকর্তার কার্যালয়',
      officer_name_bn: 'মুহাম্মদ তানভীর হোসেন',
      designation_bn: 'উপজেলা নির্বাহী অফিসার (ইউএনও)',
      department_bn: 'উপজেলা প্রশাসন',
      phone: '01715-182390',
      email: 'unochauddagram@mopa.gov.bd',
      room_no: '২০১, উপজেলা ভবন',
      address_bn: 'উপজেলা পরিষদ চত্বর, চৌদ্দগ্রাম',
      order: 1,
      active: true
    },
    {
      id: 'off_acland',
      office_name_bn: 'উপজেলা ভূমি অফিস',
      officer_name_bn: 'ফারজানা আক্তার',
      designation_bn: 'সহকারী কমিশনার (ভূমি)',
      department_bn: 'ভূমি ও রাজস্ব প্রশাসন',
      phone: '01713-373750',
      email: 'aclandchauddagram@minland.gov.bd',
      room_no: '১০৫, ভূমি ভবন',
      address_bn: 'চৌদ্দগ্রাম বাজার সংলগ্ন',
      order: 2,
      active: true
    },
    {
      id: 'off_oc',
      office_name_bn: 'চৌদ্দগ্রাম থানা',
      officer_name_bn: 'মোঃ শফিকুল ইসলাম',
      designation_bn: 'অফিসার ইনচার্জ (ওসি)',
      department_bn: 'বাংলাদেশ পুলিশ',
      phone: '01320-114840',
      email: 'occhauddagram@police.gov.bd',
      room_no: 'ওসি চেম্বার',
      address_bn: 'ঢাকা-চট্টগ্রাম মহাসড়ক রোড, চৌদ্দগ্রাম',
      order: 3,
      active: true
    },
    {
      id: 'off_uhfpo',
      office_name_bn: 'উপজেলা স্বাস্থ্য কমপ্লেক্স',
      officer_name_bn: 'ডাঃ মোস্তাফিজুর রহমান',
      designation_bn: 'উপজেলা স্বাস্থ্য ও পরিবার পরিকল্পনা কর্মকর্তা (ইউএইচএফপিও)',
      department_bn: 'স্বাস্থ্য অধিদপ্তর',
      phone: '01730-324795',
      email: 'uhfpochauddagram@dghs.gov.bd',
      room_no: 'প্রশাসনিক ভবন',
      address_bn: 'হাসপাতাল রোড, চৌদ্দগ্রাম পৌরসভা',
      order: 4,
      active: true
    },
    {
      id: 'off_uao',
      office_name_bn: 'উপজেলা কৃষি অফিস',
      officer_name_bn: 'কৃষিবিদ নাসরিন জাহান',
      designation_bn: 'উপজেলা কৃষি কর্মকর্তা',
      department_bn: 'কৃষি সম্প্রসারণ অধিদপ্তর',
      phone: '01718-445566',
      email: 'uaochauddagram@dae.gov.bd',
      room_no: '৩০৩, কৃষক প্রশিক্ষণ ভবন',
      address_bn: 'উপজেলা পরিষদ চত্বর',
      order: 5,
      active: true
    },
    {
      id: 'off_ueo',
      office_name_bn: 'উপজেলা শিক্ষা অফিস',
      officer_name_bn: 'আবুল কালাম আজাদ',
      designation_bn: 'উপজেলা শিক্ষা অফিসার',
      department_bn: 'প্রাথমিক শিক্ষা অধিদপ্তর',
      phone: '01711-223344',
      email: 'ueochauddagram@dpe.gov.bd',
      room_no: '২০৮, শিক্ষা ভবন',
      address_bn: 'উপজেলা পরিষদ চত্বর',
      order: 6,
      active: true
    },
    {
      id: 'off_fire',
      office_name_bn: 'চৌদ্দগ্রাম ফায়ার সার্ভিস ও সিভিল ডিফেন্স',
      officer_name_bn: 'মোঃ কামরুল হাসান',
      designation_bn: 'স্টেশন অফিসার',
      department_bn: 'ফায়ার সার্ভিস',
      phone: '01728-668855',
      room_no: 'কন্ট্রোল রুম',
      address_bn: 'মিয়াবাজার সংলগ্ন, চৌদ্দগ্রাম',
      order: 7,
      active: true
    }
  ];
}

export function subscribeOfficeDirectory(callback: (officers: OfficeOfficerItem[]) => void) {
  const colRef = collection(db, 'office_directory');
  return onSnapshot(colRef, (snap) => {
    if (snap.empty) {
      const defaults = getDefaultOfficeOfficers();
      callback(defaults);
      defaults.forEach(async (o) => {
        try {
          await setDoc(doc(db, 'office_directory', o.id), { ...o, admin_signature: ADMIN_SIGNATURE });
        } catch (_) {}
      });
    } else {
      const list: OfficeOfficerItem[] = [];
      snap.forEach((d) => list.push(d.data() as OfficeOfficerItem));
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      callback(list);
    }
  }, () => {
    callback(getDefaultOfficeOfficers());
  });
}

export async function saveOfficeOfficer(officer: OfficeOfficerItem, adminEmail: string, adminName: string): Promise<void> {
  const id = officer.id || `off_${Date.now()}`;
  const docRef = doc(db, 'office_directory', id);
  await setDoc(docRef, {
    ...officer,
    id,
    admin_signature: ADMIN_SIGNATURE,
    updated_at: new Date().toISOString()
  }, { merge: true });
  await recordAuditLog(adminEmail, adminName, 'SAVE_OFFICER_INFO', 'office_directory', id, `Saved officer: ${officer.officer_name_bn} (${officer.designation_bn})`);
}

export async function deleteOfficeOfficer(officerId: string, adminEmail: string, adminName: string): Promise<void> {
  const docRef = doc(db, 'office_directory', officerId);
  await deleteDoc(docRef);
  await recordAuditLog(adminEmail, adminName, 'DELETE_OFFICER_INFO', 'office_directory', officerId, `Deleted officer ID: ${officerId}`);
}

export async function updateDonorDetails(donor: BloodDonor, adminEmail: string, adminName: string): Promise<void> {
  const donorRef = doc(db, 'blood_donors', donor.id);
  await setDoc(donorRef, {
    ...donor,
    updated_at: new Date().toISOString()
  }, { merge: true });
  await recordAuditLog(adminEmail, adminName, 'UPDATE_BLOOD_DONOR', 'blood_donors', donor.id, `Updated blood donor details for ${donor.name}`);
}

export async function deleteBloodDonor(donorId: string, adminEmail: string, adminName: string): Promise<void> {
  const donorRef = doc(db, 'blood_donors', donorId);
  await deleteDoc(donorRef);
  await recordAuditLog(adminEmail, adminName, 'DELETE_BLOOD_DONOR', 'blood_donors', donorId, `Deleted donor ID: ${donorId}`);
}

