import React, { useState, useEffect } from 'react';
import { Smartphone, Download, CheckCircle, ExternalLink, X, HelpCircle, Share2, Sparkles } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('আপনার মোবাইল ব্রাউজারের মেনু (⋮) থেকে "Install app" অথবা "Add to Home screen" নির্বাচন করুন।');
    }
  };

  const copyAppUrl = () => {
    const url = 'https://ais-pre-ogrrff3tms2pxykenoy4tm-792759327395.asia-southeast1.run.app';
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 to-teal-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AppLogo size="sm" />
            <div>
              <h3 className="font-bold text-base leading-tight">মোবাইলে ট্রায়াল ও ব্যবহার</h3>
              <p className="text-[11px] text-teal-200">প্রিয় চৌদ্দগ্রাম স্মার্টফোন নির্দেশিকা</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto text-sm text-slate-700">
          {/* Method 1: Instant PWA Mobile App */}
          <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200">
            <div className="flex items-center gap-2 text-teal-900 font-bold mb-2">
              <span className="w-5 h-5 rounded-full bg-teal-800 text-white text-xs flex items-center justify-center">১</span>
              <span>মোবাইলে সরাসরি ইনস্টল (তাত্ক্ষণিক ট্রায়াল)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              কোনো ফাইল ডাউনলোড ছাড়াই আপনার অ্যান্ড্রয়েড বা আইফোনে এটি রিয়েল অ্যাপ হিসেবে ইনস্টল করুন:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle size={14} className="text-teal-700 mt-0.5 shrink-0" />
                <span>মোবাইলের ক্রোম (Chrome) বা সাফারিতে অ্যাপ লিঙ্কটি ওপেন করুন।</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={14} className="text-teal-700 mt-0.5 shrink-0" />
                <span>ব্রাউজারের উপরের ডানদিকের মেনু <strong>(⋮)</strong> থেকে <strong>"Install app"</strong> বা <strong>"Add to Home screen"</strong> চাপুন।</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={14} className="text-teal-700 mt-0.5 shrink-0" />
                <span>ফোনের স্ক্রিনে "প্রিয় চৌদ্দগ্রাম" আইকন তৈরি হবে এবং এটি কোনো ব্রাউজার বার ছাড়া ফুল স্ক্রিন চলবে।</span>
              </div>
            </div>

            <div className="mt-3.5 flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 py-2.5 px-3 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-95"
              >
                <Smartphone size={15} />
                <span>{isInstalled ? 'অলরেডি ইনস্টল করা আছে' : 'অ্যাপ ইনস্টল করুন'}</span>
              </button>
              <button
                onClick={copyAppUrl}
                className="py-2.5 px-3 bg-white border border-teal-300 hover:bg-teal-50 text-teal-900 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95"
                title="মোবাইল লিঙ্ক কপি করুন"
              >
                <Share2 size={14} />
                <span>{copied ? 'কপি হয়েছে!' : 'লিঙ্ক কপি'}</span>
              </button>
            </div>
          </div>

          {/* Method 2: Native Android APK */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold mb-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center">২</span>
              <span>নেটিভ অ্যান্ড্রয়েড এপিকে (APK) তৈরি করুন</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              এই অ্যাপটির সম্পূর্ণ অ্যান্ড্রয়েড কোডবেস (Kotlin + Jetpack Compose) অলরেডি প্রোজেক্টের <code>/android</code> ফোল্ডারে প্রস্তুত আছে।
            </p>

            <ol className="space-y-2 text-xs list-decimal list-inside text-slate-700">
              <li>AI Studio-র উপরের ডানদিকের <strong>Settings মেনু</strong> থেকে <strong>GitHub Sync</strong> অথবা <strong>Download ZIP</strong> করুন।</li>
              <li><strong>কম্পিউটারে ক্লোন করে বিল্ড করতে চাইলে:</strong> আপনার কম্পিউটারের টার্মিনালে নিচের কমান্ডটি রান করুন:<br />
                <code className="block mt-1 p-1.5 bg-slate-200/80 rounded text-[11px] font-mono select-all">git clone https://github.com/fakrulislam4m/priyo-chauddagram.git</code>
              </li>
              <li>এরপর <strong>Android Studio</strong> দিয়ে <code>android</code> ফোল্ডারটি ওপেন করে <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> চাপলে কয়েক সেকেন্ডে <code>app-debug.apk</code> তৈরি হয়ে যাবে।</li>
            </ol>
          </div>

          {/* Upazila Details */}
          <div className="text-[11px] text-center text-slate-500 pt-1">
            <span>উন্নয়নে: ফখরুল ইসলাম • প্রিয় ডিজিটাল ল্যাব • চৌদ্দগ্রাম, কুমিল্লা</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 transition"
          >
            বুঝেছি
          </button>
        </div>
      </div>
    </div>
  );
};
