import { runNoticeSync } from './noticeSync.ts';

let schedulerInterval: NodeJS.Timeout | null = null;

export function startNoticeSyncScheduler(intervalMinutes = 60) {
  if (schedulerInterval) return;
  console.log(`[Scheduler] Starting government notice background sync every ${intervalMinutes} minutes.`);

  // Initial sync check after 30 seconds
  setTimeout(async () => {
    try {
      console.log('[Scheduler] Running scheduled notice sync check...');
      await runNoticeSync('background_scheduled_job');
    } catch (e: any) {
      console.error('[Scheduler] Initial sync failed:', e.message);
    }
  }, 30000);

  schedulerInterval = setInterval(async () => {
    try {
      console.log('[Scheduler] Triggering periodic notice sync...');
      await runNoticeSync('background_scheduled_job');
    } catch (e: any) {
      console.error('[Scheduler] Scheduled sync error:', e.message);
    }
  }, intervalMinutes * 60 * 1000);
}

export function stopNoticeSyncScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}
