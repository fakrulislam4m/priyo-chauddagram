import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AppLogo } from './AppLogo';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Phone, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Sparkles,
  Lock,
  Globe
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { 
    authView, 
    setAuthView, 
    signInWithGoogle, 
    signInWithPhoneSimulated, 
    signInWithEmail, 
    quickLoginAsPrimaryAdmin, 
    quickLoginAsRegularUser,
    error, 
    accessDenied, 
    loading, 
    clearError 
  } = useAuth();
  
  const { lang, toggleLang, t } = useLanguage();

  // Mode: chooser | user_phone | user_email | admin_form
  const [activeTab, setActiveTab] = useState<'chooser' | 'user' | 'admin'>('chooser');
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  
  // Phone form
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Email form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Admin form
  const [adminEmail, setAdminEmail] = useState('matelecom.cb71@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');

  // Handle resend cooldown countdown
  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = () => {
    clearError();
    if (!phoneNumber || phoneNumber.length < 11) {
      alert(lang === 'bn' ? 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (যেমন: ০১৭XXXXXXXX)' : 'Please enter valid 11-digit mobile number');
      return;
    }
    setOtpSent(true);
    setCooldown(60);
  };

  const handlePhoneLogin = async (isAdminMode = false) => {
    clearError();
    await signInWithPhoneSimulated(phoneNumber, otpCode, isAdminMode);
  };

  const handleEmailLogin = async () => {
    clearError();
    await signInWithEmail(email, password, false);
  };

  const handleAdminLogin = async () => {
    clearError();
    await signInWithEmail(adminEmail, adminPassword, true);
  };

  return (
    <div className="w-full min-h-[750px] bg-gradient-to-b from-teal-50/50 via-white to-slate-50 flex flex-col justify-between p-6">
      {/* Top Bar with Language switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-teal-900 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{lang === 'bn' ? 'নিরাপদ প্রমাণীকরণ' : 'Secure Authentication'}</span>
        </div>
        <button
          onClick={toggleLang}
          className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-teal-800 shadow-xs hover:bg-slate-50 transition"
        >
          <Globe size={13} />
          <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
        </button>
      </div>

      {/* Main Branding Header */}
      <div className="text-center my-4">
        <div className="inline-flex p-3 bg-white rounded-3xl shadow-sm border border-slate-100 mb-3">
          <AppLogo size="lg" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-['Hind_Siliguri',sans-serif]">
          {t('appName')}
        </h1>
        <p className="text-xs text-teal-700 font-medium mt-0.5">
          {t('appTagline')}
        </p>
      </div>

      {/* Error & Access Denied Banner */}
      {accessDenied && (
        <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs animate-shake">
          <AlertCircle size={18} className="shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-bold">{t('accessDenied')}</p>
            <p className="mt-0.5 text-rose-700 leading-relaxed">{t('accessDeniedDesc')}</p>
          </div>
        </div>
      )}

      {error && !accessDenied && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-amber-800 text-xs">
          <AlertCircle size={16} className="shrink-0 text-amber-600" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {/* VIEW 1: CHOOSER (Two primary choices as requested) */}
      {activeTab === 'chooser' && (
        <div className="space-y-4 my-auto">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">
              {lang === 'bn' ? 'প্রবেশের ধরন নির্বাচন করুন' : 'Select Login Type'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'bn' ? 'আপনার প্রয়োজনীয় সেবা পেতে যেকোনো একটি বিকল্প বেছে নিন' : 'Choose an option to continue to your dashboard'}
            </p>
          </div>

          {/* 1. ইউজার লগইন / User Login */}
          <button
            onClick={() => { setActiveTab('user'); clearError(); }}
            className="w-full text-left p-4.5 bg-white hover:bg-teal-50/50 rounded-2xl border-2 border-teal-600/30 hover:border-teal-600 shadow-sm transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-teal-100/80 text-teal-800 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <UserIcon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {t('userLogin')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('userLoginSub')} (Google / SMS OTP)
                </p>
              </div>
            </div>
            <ArrowRight size={20} className="text-teal-700 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 2. এডমিন লগইন / Admin Login */}
          <button
            onClick={() => { setActiveTab('admin'); clearError(); }}
            className="w-full text-left p-4.5 bg-white hover:bg-amber-50/40 rounded-2xl border-2 border-slate-200 hover:border-orange-500 shadow-sm transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                  <span>{t('adminLogin')}</span>
                  <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-semibold">
                    {lang === 'bn' ? 'সংরক্ষিত' : 'Protected'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('adminLoginSub')} (Fakrul Islam)
                </p>
              </div>
            </div>
            <ArrowRight size={20} className="text-orange-600 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Skip Login / Guest Browse */}
          <div className="pt-2 text-center">
            <button
              onClick={() => setAuthView('app')}
              className="text-xs text-slate-500 hover:text-teal-800 font-semibold underline underline-offset-4 transition"
            >
              {t('guestContinue')}
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: REGULAR USER LOGIN */}
      {activeTab === 'user' && (
        <div className="space-y-4 my-auto bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <button
              onClick={() => { setActiveTab('chooser'); clearError(); }}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              <ArrowLeft size={14} />
              <span>{t('back')}</span>
            </button>
            <span className="text-xs font-bold text-teal-800">{t('userLogin')}</span>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={() => signInWithGoogle(false)}
            disabled={loading}
            className="w-full py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{t('googleSignIn')}</span>
          </button>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] text-slate-400 font-medium uppercase">{lang === 'bn' ? 'অথবা' : 'OR'}</span>
          </div>

          {/* Auth Method Switcher (Phone / Email) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => { setAuthMethod('phone'); clearError(); }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                authMethod === 'phone' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
            </button>
            <button
              onClick={() => { setAuthMethod('email'); clearError(); }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                authMethod === 'email' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {lang === 'bn' ? 'ইমেইল ও পাসওয়ার্ড' : 'Email & Password'}
            </button>
          </div>

          {/* Method A: Mobile Phone SMS OTP */}
          {authMethod === 'phone' && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'মোবাইল নম্বর (SMS OTP)' : 'Mobile Phone Number'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-mono">
                    +88
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="01712345678"
                    className="w-full pl-12 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />
                </div>
              </div>

              {!otpSent ? (
                <button
                  onClick={handleSendOtp}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  {t('sendOtp')}
                </button>
              ) : (
                <div className="space-y-2.5 animate-fadeIn">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">{t('enterOtp')}</label>
                      <span className="text-[10px] text-teal-700 font-medium">
                        {lang === 'bn' ? 'পরীক্ষামূলক কোড: 123456' : 'Demo OTP: 123456'}
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="w-full px-3 py-2.5 text-center tracking-widest text-base font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px]">
                      {cooldown > 0 ? `${t('resendCooldown')}: ${cooldown}s` : ''}
                    </span>
                    <button
                      disabled={cooldown > 0}
                      onClick={handleSendOtp}
                      className={`text-[11px] font-semibold underline ${
                        cooldown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-teal-700 hover:text-teal-900'
                      }`}
                    >
                      {t('resendOtp')}
                    </button>
                  </div>

                  <button
                    onClick={() => handlePhoneLogin(false)}
                    disabled={loading || otpCode.length < 6}
                    className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    {loading ? t('loading') : t('verifyOtp')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Method B: Email & Password */}
          {authMethod === 'email' && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@chauddagram.com"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <button
                onClick={handleEmailLogin}
                disabled={loading}
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                {loading ? t('loading') : t('login')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: ADMIN LOGIN */}
      {activeTab === 'admin' && (
        <div className="space-y-4 my-auto bg-white p-5 rounded-2xl border-2 border-orange-200 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-orange-100">
            <button
              onClick={() => { setActiveTab('chooser'); clearError(); }}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              <ArrowLeft size={14} />
              <span>{t('back')}</span>
            </button>
            <div className="flex items-center gap-1 text-xs font-bold text-orange-700">
              <Lock size={13} />
              <span>{t('adminLogin')}</span>
            </div>
          </div>

          <div className="p-3 bg-orange-50/70 border border-orange-200/60 rounded-xl text-xs text-orange-950">
            <p className="font-bold flex items-center gap-1">
              <ShieldCheck size={14} className="text-orange-600" />
              <span>{lang === 'bn' ? 'প্রাইমারি এডমিন যাচাইকরণ' : 'Primary Admin Authorization'}</span>
            </p>
            <p className="mt-1 text-[11px] text-orange-800 leading-relaxed">
              {lang === 'bn' 
                ? 'এডমিন এক্সেস ডাটাবেজ এবং সার্ভার-সাইড ভেরিফিকেশনের মাধ্যমে সুরক্ষিত। প্রাইমারি এডমিন: ফখরুল ইসলাম।'
                : 'Admin access is verified server-side and via Firestore admin_users. Primary Admin: Fakrul Islam.'}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'এডমিন ইমেইল' : 'Admin Email'}
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'এডমিন পাসওয়ার্ড' : 'Admin Password'}
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              onClick={handleAdminLogin}
              disabled={loading}
              className="w-full py-2.5 bg-[#087F68] hover:bg-[#075E54] text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              {loading ? t('loading') : (lang === 'bn' ? 'এডমিন প্যানেলে প্রবেশ করুন' : 'Enter Admin Management')}
            </button>
          </div>
        </div>
      )}

      {/* Footer Details */}
      <div className="text-center pt-4 border-t border-slate-200/60 text-[11px] text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">
          {t('developerLabel')} | {t('studio')}
        </p>
        <p className="text-[10px] text-slate-400">
          {t('location')}
        </p>
      </div>
    </div>
  );
};
