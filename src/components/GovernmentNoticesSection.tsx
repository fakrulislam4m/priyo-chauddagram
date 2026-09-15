import React, { useState } from 'react';
import type { GovernmentNotice } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { triggerLiveNoticeSync } from '../services/dataService';
import { 
  FileText, 
  Calendar, 
  ExternalLink, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Building,
  ChevronRight
} from 'lucide-react';

interface GovernmentNoticesSectionProps {
  notices: GovernmentNotice[];
  onSelectNotice: (notice: GovernmentNotice) => void;
  onViewAllNotices: () => void;
}

export const GovernmentNoticesSection: React.FC<GovernmentNoticesSectionProps> = ({ 
  notices, 
  onSelectNotice,
  onViewAllNotices 
}) => {
  const { lang, t } = useLanguage();
  const { isAdmin, user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Filter only Published notices for public section
  const publishedNotices = notices.filter(n => n.status === 'Published');
  const previewNotices = publishedNotices.slice(0, 4);

  const handleSyncNow = async () => {
    if (!isAdmin) return;
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const email = user?.email || 'Admin';
      const res = await triggerLiveNoticeSync(email);
      setSyncFeedback(res.message || 'সিঙ্ক সম্পন্ন হয়েছে');
    } catch (e: any) {
      setSyncFeedback(e.message || 'সিঙ্ক ব্যর্থ হয়েছে');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  return (
    <section aria-label="Government Notices" className="mx-3 mb-5">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1 mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-teal-600"></div>
          <h2 className="text-xs font-bold text-slate-800">
            {t('catNotices')}
          </h2>
          <span className="text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded font-semibold border border-teal-200">
            {publishedNotices.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Admin-only "এখনই Sync করুন / Sync Now" button */}
          {isAdmin && (
            <button
              onClick={handleSyncNow}
              disabled={syncing}
              className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-[10px] font-bold transition active:scale-95 disabled:opacity-50"
              title="সরকারি ওয়েবসাইট থেকে সরাসরি নতুন নোটিশ আনুন"
            >
              <RefreshCw size={11} className={syncing ? 'animate-spin text-orange-600' : ''} />
              <span>{syncing ? t('syncing') : t('syncNow')}</span>
            </button>
          )}

          <button
            onClick={onViewAllNotices}
            className="text-[11px] font-semibold text-teal-800 hover:text-teal-900 transition flex items-center gap-0.5"
          >
            <span>{lang === 'bn' ? 'সকল নোটিশ' : 'View All'}</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Sync Status Banner for Admin */}
      {syncFeedback && (
        <div className="mb-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center gap-1.5">
          <CheckCircle2 size={13} className="shrink-0 text-emerald-600" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Notices List */}
      <div className="space-y-2">
        {previewNotices.length > 0 ? (
          previewNotices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => onSelectNotice(notice)}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-500 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {/* Title */}
                  <h3 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-teal-800 transition-colors">
                    {notice.source_title_bn}
                  </h3>

                  {/* Date & Attribution */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1 font-medium bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      <Calendar size={11} className="text-slate-400" />
                      {notice.published_date || 'সাম্প্রতিক'}
                    </span>

                    <span className="text-[10px] text-slate-400">
                      {notice.attribution_bn || 'উৎস: চৌদ্দগ্রাম উপজেলা সরকারি ওয়েবসাইট'}
                    </span>
                  </div>
                </div>

                {/* PDF badge or Action icon */}
                {notice.original_file_urls && notice.original_file_urls.length > 0 ? (
                  <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg shrink-0 group-hover:bg-rose-100 transition" title="পিডিএফ ফাইল রয়েছে">
                    <Download size={14} />
                  </span>
                ) : (
                  <span className="p-1.5 bg-slate-100 text-slate-400 rounded-lg shrink-0 group-hover:text-teal-700 group-hover:bg-teal-50 transition">
                    <ChevronRight size={14} />
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-5 bg-white border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-500">
            <p>{lang === 'bn' ? 'কোনো সরকারি নোটিশ পাওয়া যায়নি।' : 'No government notices available at the moment.'}</p>
          </div>
        )}
      </div>

      {/* Attribution Footer */}
      <div className="mt-2 px-1 flex items-center justify-between text-[10px] text-slate-400">
        <span>{t('sourceAttribution')}</span>
        <a
          href="https://chauddagram.comilla.gov.bd/pages/notices"
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-700 hover:underline flex items-center gap-0.5 font-medium"
        >
          <span>portal link</span>
          <ExternalLink size={10} />
        </a>
      </div>
    </section>
  );
};
