import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Language } from '../types';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  bn: {
    // App header & branding
    appName: 'প্রিয় চৌদ্দগ্রাম',
    appNameEn: 'Priyo Chauddagram',
    appTagline: 'আমাদের উপজেলা, আমাদের গর্ব',
    appTaglineEn: 'Our Upazila, Our Pride',
    location: 'চৌদ্দগ্রাম উপজেলা, কুমিল্লা, বাংলাদেশ',
    developer: 'ফখরুল ইসলাম',
    developerLabel: 'উদ্যোক্তা ও পরিচালক: ফখরুল ইসলাম',
    studio: 'Priyo Digital Lab',
    disclaimer: 'এই অ্যাপটি কোনো সরকারি প্রাতিষ্ঠানিক অ্যাপ নয়। এটি চৌদ্দগ্রাম উপজেলার নাগরিকদের তথ্যসেবা ও সমৃদ্ধির লক্ষ্যে একটি স্বতন্ত্র নাগরিক উদ্যোগ।',

    // Navigation & Actions
    home: 'হোম',
    adminManagement: 'এডমিন ম্যানেজমেন্ট',
    login: 'লগইন',
    logout: 'লগআউট',
    profile: 'প্রোফাইল',
    back: 'ফিরে যান',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    delete: 'মুছে ফেলুন',
    edit: 'সম্পাদনা',
    preview: 'প্রিভিউ',
    publish: 'প্রকাশ করুন',
    pause: 'স্থগিত করুন',
    archive: 'আর্কাইভ করুন',
    restore: 'পুনরুদ্ধার',
    loading: 'লোড হচ্ছে...',
    sponsoredBadge: 'বিজ্ঞাপন / Sponsored',
    viewOriginalNotice: 'মূল নোটিশ দেখুন',
    downloadPdf: 'পিডিএফ ডাউনলোড',
    sourceAttribution: 'উৎস: চৌদ্দগ্রাম উপজেলা সরকারি ওয়েবসাইট',
    lastUpdated: 'সর্বশেষ আপডেট',

    // Categories
    catProfile: 'উপজেলা পরিচিতি',
    catProfileSub: 'Upazila Profile',
    catUnions: 'ইউনিয়নসমূহ',
    catUnionsSub: 'Unions',
    catNotices: 'সরকারি নোটিশ',
    catNoticesSub: 'Government Notices',
    catLinks: 'গুরুত্বপূর্ণ সরকারি লিংক',
    catLinksSub: 'Official Links',
    catDoctors: 'ডাক্তার ও হাসপাতাল',
    catDoctorsSub: 'Doctors & Hospitals',
    catShops: 'দোকান ও স্থানীয় ব্যবসা',
    catShopsSub: 'Shops & Local Businesses',

    // Authentication
    authTitle: 'প্রিয় চৌদ্দগ্রামে স্বাগতম',
    userLogin: 'ইউজার লগইন',
    userLoginSub: 'নাগরিক ও সাধারণ ব্যবহারকারী',
    adminLogin: 'এডমিন লগইন',
    adminLoginSub: 'অনুমোদিত ব্যবস্থাপনা কর্তৃপক্ষ',
    googleSignIn: 'গুগল (Gmail) দিয়ে সাইন-ইন',
    phoneSignIn: 'মোবাইল নম্বর ও ওটিপি (SMS OTP)',
    phonePlaceholder: '০১৭১২XXXXXX',
    sendOtp: 'ওটিপি কোড পাঠান',
    enterOtp: '৬ ডিজিটের ওটিপি লিখুন',
    verifyOtp: 'যাচাই ও প্রবেশ',
    resendOtp: 'পুনরায় কোড পাঠান',
    wrongOtp: 'ভুল ওটিপি কোড! অনুগ্রহ করে পুনরায় যাচাই করুন।',
    expiredOtp: 'ওটিপি কোডের মেয়াদ শেষ হয়েছে। পুনরায় কোড চেয়ে অনুরোধ করুন।',
    resendCooldown: 'পুনরায় কোড পাঠাতে অপেক্ষা করুন',
    accessDenied: 'প্রবেশাধিকার সংরক্ষিত / Access Denied',
    accessDeniedDesc: 'এই একাউন্টে এডমিন অধিকার নেই। কেবল অনুমোদিত এডমিন ইউজারই এডমিন প্যানেলে প্রবেশ করতে পারেন।',
    guestContinue: 'সরাসরি তথ্য দেখুন (লগইন ছাড়া)',
    accountDeletion: 'একাউন্ট মুছে ফেলার অনুরোধ',

    // Notice Sync
    syncNow: 'এখনই Sync করুন',
    syncing: 'সরকারি ওয়েবসাইট থেকে নোটিশ আনা হচ্ছে...',
    syncSuccess: 'সফলভাবে নোটিশ আপডেট করা হয়েছে',
    syncFailed: 'নোটিশ আনতে সমস্যা হয়েছে',
    lastSyncStatus: 'সর্বশেষ সিঙ্ক অবস্থা',

    // Admin Panels
    panelUpazila: 'উপজেলা তথ্য',
    panelUnions: 'ইউনিয়নের নাম',
    panelNotices: 'সরকারি নোটিশ',
    panelSync: 'সরকারি নোটিশ Sync',
    panelSponsored: 'Sponsored Slides',
    panelUsers: 'Users and Roles',
    panelAudit: 'Audit Log'
  },
  en: {
    // App header & branding
    appName: 'Priyo Chauddagram',
    appNameEn: 'Priyo Chauddagram',
    appTagline: 'Our Upazila, Our Pride',
    appTaglineEn: 'Our Upazila, Our Pride',
    location: 'Chauddagram Upazila, Cumilla, Bangladesh',
    developer: 'Fakrul Islam',
    developerLabel: 'Developer & Founder: Fakrul Islam',
    studio: 'Priyo Digital Lab',
    disclaimer: 'This application is an independent community initiative by Priyo Digital Lab and not an official government app.',

    // Navigation & Actions
    home: 'Home',
    adminManagement: 'Admin Management',
    login: 'Login',
    logout: 'Logout',
    profile: 'Profile',
    back: 'Back',
    save: 'Save Changes',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    preview: 'Preview',
    publish: 'Publish',
    pause: 'Pause',
    archive: 'Archive',
    restore: 'Restore',
    loading: 'Loading...',
    sponsoredBadge: 'বিজ্ঞাপন / Sponsored',
    viewOriginalNotice: 'View Original Notice',
    downloadPdf: 'Download PDF',
    sourceAttribution: 'Source: Chauddagram Upazila Government Website',
    lastUpdated: 'Last Updated',

    // Categories
    catProfile: 'Upazila Profile',
    catProfileSub: 'উপজেলা পরিচিতি',
    catUnions: 'Unions',
    catUnionsSub: 'ইউনিয়নসমূহ',
    catNotices: 'Government Notices',
    catNoticesSub: 'সরকারি নোটিশ',
    catLinks: 'Official Links',
    catLinksSub: 'গুরুত্বপূর্ণ সরকারি লিংক',
    catDoctors: 'Doctors & Hospitals',
    catDoctorsSub: 'ডাক্তার ও হাসপাতাল',
    catShops: 'Shops & Local Businesses',
    catShopsSub: 'দোকান ও স্থানীয় ব্যবসা',

    // Authentication
    authTitle: 'Welcome to Priyo Chauddagram',
    userLogin: 'User Login',
    userLoginSub: 'Citizens and General Users',
    adminLogin: 'Admin Login',
    adminLoginSub: 'Authorized Administrative Staff',
    googleSignIn: 'Sign in with Google (Gmail)',
    phoneSignIn: 'Mobile Phone & SMS OTP',
    phonePlaceholder: '01712XXXXXX',
    sendOtp: 'Send OTP Code',
    enterOtp: 'Enter 6-digit OTP',
    verifyOtp: 'Verify & Enter',
    resendOtp: 'Resend Code',
    wrongOtp: 'Invalid OTP code! Please check and retry.',
    expiredOtp: 'OTP expired. Please request a new code.',
    resendCooldown: 'Wait before resending code',
    accessDenied: 'Access Denied / প্রবেশাধিকার সংরক্ষিত',
    accessDeniedDesc: 'This account does not have administrative privileges. Only authorized administrators can access Admin Management.',
    guestContinue: 'Explore Public Information (Guest)',
    accountDeletion: 'Request Account Deletion',

    // Notice Sync
    syncNow: 'Sync Now',
    syncing: 'Fetching latest notices from official portal...',
    syncSuccess: 'Notices synchronized successfully',
    syncFailed: 'Notice synchronization encountered an issue',
    lastSyncStatus: 'Latest Sync Status',

    // Admin Panels
    panelUpazila: 'Upazila Information',
    panelUnions: 'Union Names',
    panelNotices: 'Government Notices',
    panelSync: 'Government Notice Sync',
    panelSponsored: 'Sponsored Slides',
    panelUsers: 'Users and Roles',
    panelAudit: 'Audit Log'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'bn',
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => key
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('priyo_lang') as Language) || 'bn';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('priyo_lang', newLang);
  };

  const toggleLang = () => {
    setLang(lang === 'bn' ? 'en' : 'bn');
  };

  const t = (key: string, defaultText?: string): string => {
    return translations[lang]?.[key] || defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
