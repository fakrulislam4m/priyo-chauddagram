import https from 'https';
import crypto from 'crypto';
import * as cheerio from 'cheerio';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  serverTimestamp, 
  writeBatch 
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export interface ScrapedNotice {
  serial: string;
  title: string;
  publishedDate: string;
  files: string[];
  noticeUrl: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  noticesFetched: number;
  noticesAdded: number;
  noticesUpdated: number;
  errors: string[];
  runId: string;
}

// Load Firebase configuration
function getDb() {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('firebase-applet-config.json not found');
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const appName = 'notice-sync-app';
  const existingApp = getApps().find(a => a.name === appName);
  const app = existingApp || initializeApp({
    apiKey: config.apiKey,
    projectId: config.projectId,
    appId: config.appId,
    authDomain: config.authDomain
  }, appName);
  return getFirestore(app, config.firestoreDatabaseId);
}

export async function fetchGovernmentNoticesFromPortal(): Promise<ScrapedNotice[]> {
  const url = 'https://chauddagram.comilla.gov.bd/pages/notices';
  const agent = new https.Agent({ rejectUnauthorized: false });

  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      agent,
      headers: {
        'User-Agent': 'PriyoChauddagram-NoticeSync/1.0 (+https://chauddagram.comilla.gov.bd; info@priyodigitallab.com)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'bn-BD,bn;q=0.9,en;q=0.8'
      },
      timeout: 15000
    }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Government portal returned HTTP status ${res.statusCode}`));
      }

      let rawData = '';
      res.on('data', (chunk) => {
        // Enforce 10MB limit
        if (rawData.length + chunk.length > 10 * 1024 * 1024) {
          req.destroy();
          return reject(new Error('Response size limit exceeded (max 10MB)'));
        }
        rawData += chunk;
      });

      res.on('end', () => {
        try {
          const $ = cheerio.load(rawData);
          const notices: ScrapedNotice[] = [];

          $('table tr').each((idx, tr) => {
            const cells = $(tr).find('td');
            if (cells.length >= 3) {
              const serial = $(cells[0]).text().trim();
              const titleEl = $(cells[1]);
              const title = titleEl.text().trim();
              
              // Extract attachment links
              const files: string[] = [];
              $(tr).find('a').each((_, a) => {
                const href = $(a).attr('href');
                if (href) {
                  const fullHref = href.startsWith('http') 
                    ? href 
                    : `https://chauddagram.comilla.gov.bd${href}`;
                  if (fullHref.match(/\.(pdf|jpe?g|png|docx?)/i) || fullHref.includes('/files/')) {
                    if (!files.includes(fullHref)) {
                      files.push(fullHref);
                    }
                  }
                }
              });

              // Notice view page link
              let noticeUrl = '';
              $(tr).find('a').each((_, a) => {
                const href = $(a).attr('href');
                if (href && (href.includes('/pages/notices/') || href.includes('/notice/'))) {
                  noticeUrl = href.startsWith('http') 
                    ? href 
                    : `https://chauddagram.comilla.gov.bd${href}`;
                }
              });

              // Published date
              let publishedDate = '';
              for (let c = 2; c < cells.length; c++) {
                const text = $(cells[c]).text().trim();
                if (/\d{1,2}[-/.]\d{1,2}[-/.]\d{4}/.test(text) || text.includes('২০২') || text.includes('202')) {
                  publishedDate = text;
                  break;
                }
              }

              if (title && title !== 'শিরোনাম') {
                notices.push({
                  serial,
                  title,
                  publishedDate: publishedDate || 'সাম্প্রতিক',
                  files,
                  noticeUrl: noticeUrl || `https://chauddagram.comilla.gov.bd/pages/notices`
                });
              }
            }
          });

          resolve(notices);
        } catch (parseErr: any) {
          reject(new Error(`HTML Parsing error: ${parseErr.message}`));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Connection timed out to chauddagram.comilla.gov.bd'));
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

export async function runNoticeSync(triggeredBy = 'scheduled_job'): Promise<SyncResult> {
  const runId = `sync_${Date.now()}`;
  const now = new Date().toISOString();
  const errors: string[] = [];
  let fetchedCount = 0;
  let addedCount = 0;
  let updatedCount = 0;
  let runRef: any = null;

  try {
    const db = getDb();
    runRef = doc(db, 'sync_runs', runId);

    try {
      await setDoc(runRef, {
        id: runId,
        status: 'Running',
        started_at: now,
        completed_at: null,
        notices_fetched: 0,
        notices_added: 0,
        notices_updated: 0,
        errors: [],
        triggered_by: triggeredBy,
        server_sync_verified: true
      });
    } catch (setErr: any) {
      console.warn('[Sync] Could not write initial sync run doc:', setErr.message);
    }
    const rawNotices = await fetchGovernmentNoticesFromPortal();
    fetchedCount = rawNotices.length;

    for (const item of rawNotices) {
      try {
        // Stable deterministic hash for deduplication
        const hashInput = `${item.title.trim()}_${item.publishedDate.trim()}_${item.noticeUrl}`;
        const sourceHash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 16);
        const noticeId = `gov_${sourceHash}`;

        const noticeDocRef = doc(db, 'government_notices', noticeId);
        const existingSnap = await getDoc(noticeDocRef);

        if (!existingSnap.exists()) {
          // New notice
          await setDoc(noticeDocRef, {
            id: noticeId,
            source_domain: 'chauddagram.comilla.gov.bd',
            source_title_bn: item.title,
            source_title_en: item.title, // Can be refined by admin
            published_date: item.publishedDate,
            original_notice_url: item.noticeUrl,
            original_file_urls: item.files,
            source_hash: sourceHash,
            status: 'Published',
            imported_from: 'https://chauddagram.comilla.gov.bd/pages/notices',
            fetched_at: now,
            first_seen_at: now,
            last_seen_at: now,
            attribution_bn: 'উৎস: চৌদ্দগ্রাম উপজেলা সরকারি ওয়েবসাইট',
            attribution_en: 'Source: Chauddagram Upazila Government Website',
            created_at: now,
            updated_at: now,
            server_sync_verified: true
          });
          addedCount++;
        } else {
          // Update last_seen_at
          await setDoc(noticeDocRef, {
            last_seen_at: now,
            updated_at: now,
            original_file_urls: item.files.length > 0 ? item.files : (existingSnap.data().original_file_urls || []),
            server_sync_verified: true
          }, { merge: true });
          updatedCount++;
        }
      } catch (itemErr: any) {
        errors.push(`Notice "${item.title.substring(0, 30)}": ${itemErr.message}`);
      }
    }

    const finishTime = new Date().toISOString();
    await setDoc(runRef, {
      status: errors.length > 0 && addedCount === 0 ? 'Partial Failure' : 'Success',
      completed_at: finishTime,
      notices_fetched: fetchedCount,
      notices_added: addedCount,
      notices_updated: updatedCount,
      errors,
      server_sync_verified: true
    }, { merge: true });

    return {
      success: true,
      message: `Sync finished: ${fetchedCount} fetched, ${addedCount} added, ${updatedCount} updated.`,
      noticesFetched: fetchedCount,
      noticesAdded: addedCount,
      noticesUpdated: updatedCount,
      errors,
      runId
    };
  } catch (err: any) {
    const finishTime = new Date().toISOString();
    const errMsg = err.message || 'Unknown sync error';
    errors.push(errMsg);

    if (runRef) {
      try {
        await setDoc(runRef, {
          status: 'Failed',
          completed_at: finishTime,
          notices_fetched: fetchedCount,
          notices_added: addedCount,
          notices_updated: updatedCount,
          errors,
          server_sync_verified: true
        }, { merge: true });
      } catch (logErr) {
        console.warn('[Sync] Failed to write error status to runRef:', logErr);
      }
    }

    return {
      success: false,
      message: `Sync failed: ${errMsg}`,
      noticesFetched: fetchedCount,
      noticesAdded: addedCount,
      noticesUpdated: updatedCount,
      errors,
      runId
    };
  }
}
