import express, { Request, Response, NextFunction } from 'express';
import { runNoticeSync } from './noticeSync.ts';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export const apiRouter = express.Router();
apiRouter.use(express.json());

function getDb() {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const appName = 'priyo-server-api-app';
  const existingApp = getApps().find(a => a.name === appName);
  const app = existingApp || initializeApp(config, appName);
  return getFirestore(app, config.firestoreDatabaseId);
}

const PRIMARY_ADMIN_EMAILS = [
  'matelecom.cb71@gmail.com',
  'fakrul@priyodigitallab.com'
];

export async function verifyIsAdmin(email: string | undefined | null): Promise<{ isAdmin: boolean; role: string; name: string }> {
  if (!email || typeof email !== 'string') {
    return { isAdmin: false, role: 'user', name: '' };
  }

  const cleanEmail = email.toLowerCase().trim();
  if (PRIMARY_ADMIN_EMAILS.includes(cleanEmail)) {
    return { isAdmin: true, role: 'primary_admin', name: 'Fakrul Islam' };
  }

  try {
    const db = getDb();
    const adminDoc = await getDoc(doc(db, 'admin_users', cleanEmail));
    if (adminDoc.exists()) {
      const data = adminDoc.data();
      const role = data.role || 'admin';
      if (['admin', 'super_admin', 'primary_admin'].includes(role)) {
        return {
          isAdmin: true,
          role,
          name: data.name || 'Admin'
        };
      }
    }
  } catch (err) {
    console.error('Error verifying admin in Firestore:', err);
  }

  return { isAdmin: false, role: 'user', name: '' };
}

// Server-side Admin Auth Middleware
async function requireAdminMiddleware(req: Request, res: Response, next: NextFunction) {
  const emailHeader = (req.headers['x-admin-email'] as string) || 
                      req.body?.adminEmail || 
                      req.body?.email || 
                      (req.query?.adminEmail as string);

  const verification = await verifyIsAdmin(emailHeader);
  if (!verification.isAdmin) {
    return res.status(403).json({
      error: 'Access denied: Admin privileges required (403 Forbidden)',
      message: 'আপনার এই প্রশাসনিক অপারেশন সম্পন্ন করার অনুমতি নেই।',
      status: 403
    });
  }

  (req as any).adminUser = verification;
  next();
}

// Health / Status
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Priyo Chauddagram',
    version: '1.0.0',
    location: 'Chauddagram, Cumilla, Bangladesh',
    developer: 'Fakrul Islam',
    studio: 'Priyo Digital Lab',
    timestamp: new Date().toISOString()
  });
});

// Admin Verification Endpoint (Supports both POST & GET)
apiRouter.all('/admin/verify', async (req: Request, res: Response) => {
  try {
    const email = req.body?.email || (req.query?.email as string) || (req.headers['x-admin-email'] as string);
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const verification = await verifyIsAdmin(email);
    return res.json({
      isAdmin: verification.isAdmin,
      role: verification.role,
      name: verification.name,
      email: email.toLowerCase().trim()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Notice Sync: Trigger Sync (Admin only)
apiRouter.post('/sync/notices', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const email = (req as any).adminUser?.email || 'Admin';
    const result = await runNoticeSync(email);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Notice Sync: Get Latest Sync History
apiRouter.get('/sync/history', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const snap = await getDocs(collection(db, 'sync_runs'));
    const runs: any[] = [];
    snap.forEach((d) => runs.push(d.data()));
    runs.sort((a, b) => (b.started_at || '').localeCompare(a.started_at || ''));
    res.json({ runs: runs.slice(0, 15) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Audit Log: Record an Admin Action
apiRouter.post('/audit/log', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const { adminEmail, adminName, action, targetCollection, targetId, details } = req.body;
    const db = getDb();
    const logId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    await setDoc(doc(db, 'audit_logs', logId), {
      id: logId,
      admin_email: adminEmail || 'Admin',
      admin_name: adminName || 'Fakrul Islam',
      action,
      target_collection: targetCollection,
      target_id: targetId,
      details: details || '',
      timestamp: now,
      server_sync_verified: true,
      admin_signature: 'fakrul_islam_priyo_chauddagram_auth'
    });

    res.json({ success: true, logId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Save/Edit Notice (Including Emergency Announcements)
apiRouter.post('/admin/notice', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const notice = req.body.notice;
    if (!notice || !notice.title_bn) {
      return res.status(400).json({ error: 'Notice title_bn is required' });
    }

    const db = getDb();
    const id = notice.id || `gov_notice_${Date.now()}`;
    const now = new Date().toISOString();
    const isEmergency = !!notice.is_emergency || notice.priority === 'urgent';

    const noticeDoc = {
      ...notice,
      id,
      title_bn: notice.title_bn,
      source_title_bn: notice.source_title_bn || notice.title_bn,
      description_bn: notice.description_bn || '',
      priority: isEmergency ? 'urgent' : (notice.priority || 'normal'),
      is_emergency: isEmergency,
      source_domain: notice.source_domain || 'chauddagram.comilla.gov.bd',
      attribution_bn: notice.attribution_bn || 'উৎস: চৌদ্দগ্রাম উপজেলা প্রশাসন',
      status: notice.status || 'Published',
      created_at: notice.created_at || now,
      updated_at: now,
      admin_signature: 'fakrul_islam_priyo_chauddagram_auth'
    };

    await setDoc(doc(db, 'government_notices', id), noticeDoc, { merge: true });
    res.json({ success: true, notice: noticeDoc });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.delete('/admin/notice/:id', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();
    await deleteDoc(doc(db, 'government_notices', id));
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Save/Edit Service Card
apiRouter.post('/admin/service-card', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const card = req.body.card;
    if (!card || !card.id || !card.name_bn) {
      return res.status(400).json({ error: 'Card id and name_bn are required' });
    }

    const db = getDb();
    await setDoc(doc(db, 'service_cards', card.id), {
      ...card,
      admin_signature: 'fakrul_islam_priyo_chauddagram_auth',
      updated_at: new Date().toISOString()
    }, { merge: true });

    res.json({ success: true, card });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.delete('/admin/service-card/:id', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();
    await deleteDoc(doc(db, 'service_cards', id));
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Save/Edit Emergency Contact
apiRouter.post('/admin/emergency-contact', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const contact = req.body.contact;
    if (!contact || !contact.name_bn || !contact.phone) {
      return res.status(400).json({ error: 'Contact name_bn and phone are required' });
    }

    const db = getDb();
    const id = contact.id || `emg_${Date.now()}`;
    const payload = {
      ...contact,
      id,
      admin_signature: 'fakrul_islam_priyo_chauddagram_auth',
      updated_at: new Date().toISOString()
    };

    await setDoc(doc(db, 'emergency_contacts', id), payload, { merge: true });
    res.json({ success: true, contact: payload });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.delete('/admin/emergency-contact/:id', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();
    await deleteDoc(doc(db, 'emergency_contacts', id));
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Live Chat Settings
apiRouter.post('/admin/chat-settings', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const settings = req.body.settings;
    const db = getDb();
    await setDoc(doc(db, 'chat_settings', 'general'), {
      ...settings,
      admin_signature: 'fakrul_islam_priyo_chauddagram_auth',
      updated_at: new Date().toISOString()
    }, { merge: true });

    res.json({ success: true, settings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Blood Donor Status & Details
apiRouter.post('/admin/donor/status', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const { donor_id, status, rejection_reason } = req.body;
    if (!donor_id || !status) {
      return res.status(400).json({ error: 'donor_id and status are required' });
    }

    const db = getDb();
    const donorRef = doc(db, 'blood_donors', donor_id);
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'verified') {
      updateData.verified_at = new Date().toISOString();
      updateData.verified_by = (req as any).adminUser?.name || 'Admin';
      updateData.rejection_reason = '';
    } else if (status === 'rejected') {
      updateData.rejection_reason = rejection_reason || 'তথ্য যাচাইয়ে অসঙ্গতি পাওয়া গেছে';
    }

    await updateDoc(donorRef, updateData);
    res.json({ success: true, donor_id, status, updateData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Office & Officer Directory
apiRouter.post('/admin/officer', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const officer = req.body.officer;
    if (!officer || !officer.officer_name_bn || !officer.office_name_bn) {
      return res.status(400).json({ error: 'Officer and Office name required' });
    }

    const db = getDb();
    const id = officer.id || `off_${Date.now()}`;
    const payload = {
      ...officer,
      id,
      admin_signature: 'fakrul_islam_priyo_chauddagram_auth',
      updated_at: new Date().toISOString()
    };

    await setDoc(doc(db, 'office_directory', id), payload, { merge: true });
    res.json({ success: true, officer: payload });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.delete('/admin/officer/:id', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();
    await deleteDoc(doc(db, 'office_directory', id));
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Community Chat Endpoints (চৌদ্দগ্রাম লাইভ আড্ডা)
apiRouter.get('/chat/messages', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const snap = await getDocs(collection(db, 'community_chat'));
    const messages: any[] = [];
    snap.forEach((d) => messages.push(d.data()));
    messages.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/chat/send', async (req: Request, res: Response) => {
  try {
    const { text, sender_name, sender_union, sender_id, sender_email, is_admin, role } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const db = getDb();
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newMsg = {
      id: msgId,
      text: text.trim().slice(0, 1000),
      sender_name: (sender_name || 'চৌদ্দগ্রামবাসী').trim().slice(0, 100),
      sender_union: sender_union || 'চৌদ্দগ্রাম',
      sender_id: sender_id || `user_${Date.now()}`,
      sender_email: sender_email || '',
      is_admin: !!is_admin,
      role: role || (is_admin ? 'admin' : 'resident'),
      created_at: new Date().toISOString(),
      pinned: false,
      likes_count: 0,
      reactions: {}
    };

    await setDoc(doc(db, 'community_chat', msgId), newMsg);
    res.json({ success: true, message: newMsg });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete message (Admin only!)
apiRouter.delete('/chat/message/:id', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();
    await deleteDoc(doc(db, 'community_chat', id));
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
