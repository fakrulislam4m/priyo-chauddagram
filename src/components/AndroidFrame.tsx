import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, BatteryMedium, Signal } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'full'>('mobile');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-200/80 flex flex-col items-center justify-start py-0 md:py-6 px-0 sm:px-4">
      {/* Top Device View Switcher Banner */}
      <aside aria-label="Device Preview Bar" className="hidden sm:flex items-center justify-between w-full max-w-[430px] md:max-w-4xl px-4 py-2 mb-3 bg-white/95 backdrop-blur rounded-2xl shadow-xs border border-slate-200 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-teal-900">প্রিয় চৌদ্দগ্রাম (Priyo Chauddagram)</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500">Android Native Shell</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
              deviceMode === 'mobile'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="মোবাইল পোর্ট্রেট ভিউ (390px)"
          >
            <Smartphone size={14} />
            <span>মোবাইল ভিউ</span>
          </button>
          <button
            onClick={() => setDeviceMode('full')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
              deviceMode === 'full'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="রেসপনসিভ ওয়াইড ভিউ"
          >
            <Monitor size={14} />
            <span>ফুল স্ক্রিন</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div 
        className={`w-full transition-all duration-300 flex flex-col ${
          deviceMode === 'mobile' 
            ? 'max-w-[412px] bg-white shadow-2xl rounded-none md:rounded-[36px] border-0 md:border-[10px] md:border-slate-850 overflow-hidden relative' 
            : 'max-w-2xl bg-white shadow-lg rounded-none md:rounded-2xl border border-slate-200 overflow-hidden'
        }`}
      >
        {/* Android Status Bar */}
        <header aria-label="System Status Bar" className="w-full bg-teal-900 text-teal-100 px-5 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-medium tracking-wide select-none z-30 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white">{currentTime || '১০:৪৫'}</span>
            <span className="text-[9px] bg-teal-800 text-teal-200 px-1 py-0.2 rounded font-sans">4G</span>
          </div>

          {/* Simulated Camera Punch Hole on mobile frame */}
          {deviceMode === 'mobile' && (
            <div className="w-3.5 h-3.5 bg-slate-900 rounded-full border border-slate-700"></div>
          )}

          <div className="flex items-center gap-2 text-white">
            <Signal size={12} className="stroke-[2.5]" />
            <Wifi size={12} className="stroke-[2.5]" />
            <BatteryMedium size={14} className="stroke-[2]" />
          </div>
        </header>

        {/* Inner Content Area */}
        <main className="w-full bg-slate-50 relative flex flex-col flex-1 min-h-0">
          {children}
        </main>

        {/* Android Bottom Navigation Pill */}
        {deviceMode === 'mobile' && (
          <footer aria-label="System Navigation Bar" className="w-full bg-white py-2 flex items-center justify-center border-t border-slate-100 shrink-0">
            <div className="w-32 h-1 bg-slate-300 rounded-full"></div>
          </footer>
        )}
      </div>
    </div>
  );
};
