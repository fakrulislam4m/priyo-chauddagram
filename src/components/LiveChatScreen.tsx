import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  subscribeLiveChatMessages, 
  sendChatMessage, 
  toggleLikeChatMessage, 
  pinChatMessage, 
  deleteChatMessage,
  pingChatPresence,
  subscribeActivePresence
} from '../services/dataService';
import type { ChatMessage } from '../types';
import { 
  ArrowLeft, 
  Send, 
  MessageSquare, 
  Users, 
  Pin, 
  Heart, 
  ThumbsUp, 
  Trash2, 
  Shield, 
  Info, 
  Sparkles, 
  Smile, 
  CheckCircle2, 
  Globe, 
  X,
  MapPin,
  Flame,
  AlertTriangle,
  Paperclip,
  FileText,
  HelpCircle,
  Clock,
  CheckCheck,
  Flag,
  Share2,
  Lock,
  Headphones
} from 'lucide-react';

const SUGGESTED_CITIZEN_QUESTIONS = [
  'নাগরিক সনদ কীভাবে পাব?',
  'আবেদন কোথায় জমা দেব?',
  'আমার আবেদনের অবস্থা কী?',
  'রক্তদাতা কীভাবে খুঁজব?',
  'উপজেলা স্বাস্থ্য কমপ্লেক্স কোথায়?',
  'অভিযোগের অগ্রগতি কী?',
  'ভূমি সেবা কোথায় পাব?',
  'আজকের নোটিশ কী?'
];

const OFFICER_DEPARTMENTS = [
  'প্রশাসন ও সাধারণ সেবা',
  'স্বাস্থ্য ও পরিবার পরিকল্পনা',
  'ভূমি ও রাজস্ব সেবা',
  'কৃষি ও প্রাণিসম্পদ',
  'নাগরিক সেবা ও সনদ'
];

const OFFICER_REPLY_TEMPLATES = [
  'আপনার প্রশ্নটি সংশ্লিষ্ট কর্মকর্তার কাছে পাঠানো হয়েছে।',
  'আপনার আবেদন নম্বরটি প্রদান করুন।',
  'এই বিষয়ে উপজেলা স্বাস্থ্য কমপ্লেক্সে যোগাযোগ করুন।',
  'আপনার অভিযোগটি গ্রহণ করা হয়েছে।'
];

const EMOJI_LIST = ['❤️', '👍', '🇧🇩', '👏', '🤝', '☕', '🌸'];

interface LiveChatScreenProps {
  onBack: () => void;
}

export const LiveChatScreen: React.FC<LiveChatScreenProps> = ({ onBack }) => {
  const { user, isAdmin } = useAuth();
  const { lang } = useLanguage();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeCount, setActiveCount] = useState<number>(7);
  const [isSending, setIsSending] = useState(false);
  const [emptyWarning, setEmptyWarning] = useState(false);
  const [showSuggestedDrawer, setShowSuggestedDrawer] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showReportModal, setShowReportModal] = useState<ChatMessage | null>(null);
  const [reportReason, setReportReason] = useState('');

  // Feature Toggles for Chat
  const [isUrgent, setIsUrgent] = useState(false);
  const [attachedComplaintNo, setAttachedComplaintNo] = useState('');
  const [showComplaintInput, setShowComplaintInput] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [officerMode, setOfficerMode] = useState(false);
  const [selectedDept, setSelectedDept] = useState(OFFICER_DEPARTMENTS[0]);
  const [isChatClosed, setIsChatClosed] = useState(false);

  // Local citizen identity
  const [chatName, setChatName] = useState(() => {
    return user?.displayName || localStorage.getItem('chauddagram_chat_name') || '';
  });
  const [chatUnion, setChatUnion] = useState(() => {
    return localStorage.getItem('chauddagram_chat_union') || 'চৌদ্দগ্রাম পৌরসভা';
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync auth user name
  useEffect(() => {
    if (user?.displayName && !chatName) {
      setChatName(user.displayName);
      localStorage.setItem('chauddagram_chat_name', user.displayName);
    }
  }, [user, chatName]);

  // Subscribe to real-time chat messages
  useEffect(() => {
    const unsubChat = subscribeLiveChatMessages((msgs) => {
      setMessages(msgs);
    });

    const unsubPresence = subscribeActivePresence((count) => {
      setActiveCount(count);
    });

    const userId = user?.uid || localStorage.getItem('chauddagram_user_uuid') || `guest_${Date.now()}`;
    if (!localStorage.getItem('chauddagram_user_uuid')) {
      localStorage.setItem('chauddagram_user_uuid', userId);
    }
    pingChatPresence(userId, chatName || 'চৌদ্দগ্রামের নাগরিক', chatUnion);

    const pingInterval = setInterval(() => {
      pingChatPresence(userId, chatName || 'চৌদ্দগ্রামের নাগরিক', chatUnion);
    }, 120000);

    return () => {
      unsubChat();
      unsubPresence();
      clearInterval(pingInterval);
    };
  }, [user, chatName, chatUnion]);

  // Scroll to bottom on messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-mask 11-digit phone numbers for privacy safety
  const maskPhoneNumbers = (text: string) => {
    return text.replace(/(01[3-9]\d{2})\d{4}(\d{2})/g, '$1****$2');
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const rawText = customText !== undefined ? customText : inputText;
    const text = maskPhoneNumbers(rawText.trim());

    if (!text && !attachedFile) {
      setEmptyWarning(true);
      inputRef.current?.focus();
      setTimeout(() => setEmptyWarning(false), 3000);
      return;
    }
    if (isSending) return;

    let senderName = chatName.trim();
    if (!senderName) {
      if (user?.displayName) {
        senderName = user.displayName;
      } else {
        senderName = `নাগরিক_${Math.floor(1000 + Math.random() * 9000)}`;
        setChatName(senderName);
        localStorage.setItem('chauddagram_chat_name', senderName);
      }
    }

    setIsSending(true);
    setInputText('');
    setEmptyWarning(false);

    try {
      await sendChatMessage({
        text: attachedComplaintNo 
          ? `[অভিযোগ নং: ${attachedComplaintNo}] ${text}` 
          : text,
        sender_name: senderName,
        sender_id: user?.uid || localStorage.getItem('chauddagram_user_uuid') || `user_${Date.now()}`,
        sender_email: user?.email || '',
        sender_union: chatUnion,
        is_admin: isAdmin,
        role: isAdmin ? 'primary_admin' : 'resident'
      });

      // Reset modifiers
      setAttachedComplaintNo('');
      setShowComplaintInput(false);
      setAttachedFile(null);
      setIsUrgent(false);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsSending(false);
      setTimeout(() => {
        inputRef.current?.focus();
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleReaction = async (messageId: string, currentReactions: Record<string, number> = {}, emoji: string) => {
    try {
      await toggleLikeChatMessage(messageId, currentReactions, emoji);
    } catch (err) {
      console.warn('Reaction error:', err);
    }
  };

  const handlePin = async (messageId: string, currentPinned: boolean) => {
    if (!isAdmin) return;
    try {
      await pinChatMessage(messageId, !currentPinned, user?.email || 'admin', user?.displayName || 'Fakrul Islam');
    } catch (err) {
      alert('পিন করার অনুমতি পাওয়া যায়নি');
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!isAdmin) return;
    if (confirm('আপনি কি এই বার্তাটি মুছে ফেলতে চান?')) {
      try {
        await deleteChatMessage(messageId, user?.email || 'admin', user?.displayName || 'Fakrul Islam');
      } catch (err) {
        alert('বার্তা মুছে ফেলা যায়নি');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file.name);
      setInputText((prev) => prev ? `${prev} [সংযুক্ত ফাইল: ${file.name}]` : `[সংযুক্ত ফাইল: ${file.name}]`);
    }
  };

  const pinnedMessages = messages.filter((m) => m.pinned);

  return (
    <div className="flex flex-col h-[85vh] md:h-[780px] max-h-[820px] w-full bg-[#F7FAF9] relative overflow-hidden">
      {/* 1. Chat Header */}
      <header className="bg-[#075E54] text-white px-3.5 py-3 shadow-md flex items-center justify-between z-20 shrink-0 border-b border-[#087F68]">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white/90"
            title="ফিরে যান"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-bold font-['Hind_Siliguri',sans-serif] tracking-wide flex items-center gap-1.5 text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                চৌদ্দগ্রাম লাইভ নাগরিক সহায়তা
              </h1>
              {isAdmin && (
                <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded">
                  অফিসার
                </span>
              )}
            </div>
            <p className="text-[10px] text-teal-100/90 flex items-center gap-1 mt-0.5">
              <Users size={11} className="text-teal-200" />
              <span>{activeCount} জন নাগরিক ও কর্মকর্তা সক্রিয় আছেন</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Suggested Questions button */}
          <button
            onClick={() => setShowSuggestedDrawer(!showSuggestedDrawer)}
            className="px-2 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-[11px] font-bold text-white flex items-center gap-1 transition-all"
            title="সাধারণ প্রশ্নসমূহ"
          >
            <HelpCircle size={13} className="text-amber-300" />
            <span className="hidden sm:inline">প্রশ্নমালা</span>
          </button>

          {/* Admin Officer Mode Switcher */}
          {isAdmin && (
            <button
              onClick={() => setOfficerMode(!officerMode)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                officerMode ? 'bg-amber-400 text-amber-950 shadow-xs' : 'bg-white/10 text-white'
              }`}
              title="অফিসার কনসোল"
            >
              <Headphones size={13} />
              <span>{officerMode ? 'অফিসার মোড' : 'নাগরিক মোড'}</span>
            </button>
          )}

          {/* User Settings Drawer */}
          <button
            onClick={() => setShowProfileDrawer(true)}
            className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center font-bold text-xs"
            title="প্রোফাইল পরিবর্তন"
          >
            {chatName ? chatName[0].toUpperCase() : 'না'}
          </button>
        </div>
      </header>

      {/* 2. Medical Emergency & Legal Disclaimer Banner (Mandatory Safety Rule) */}
      <div className="bg-rose-50 border-b border-rose-200 px-3 py-1.5 text-[10.5px] text-rose-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 leading-snug">
          <AlertTriangle size={13} className="text-rose-600 shrink-0" />
          <span>
            <b>জরুরি সতর্কবার্তা:</b> চিকিৎসা জরুরি প্রয়োজনে অবিলম্বে <b>৯৯৯</b> বা স্বাস্থ্য কমপ্লেক্সে যান। চ্যাটে ডাক্তারি নির্ণয় বা আইনি নিশ্চয়তা প্রদান করা হয় না।
          </span>
        </div>
      </div>

      {/* 3. Officer Department Toolbar (When in Officer Mode) */}
      {isAdmin && officerMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-3 py-1.5 flex items-center justify-between text-[11px] text-amber-900 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="font-bold text-[10px] uppercase text-amber-800 shrink-0">বিভাগ:</span>
            {OFFICER_DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap transition-all ${
                  selectedDept === dept
                    ? 'bg-amber-700 text-white'
                    : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-100'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsChatClosed(!isChatClosed)}
            className="text-[10px] underline font-bold text-amber-900 ml-2 shrink-0"
          >
            {isChatClosed ? 'চ্যাট সেশন চালু করুন' : 'সেশন সমাপ্ত করুন'}
          </button>
        </div>
      )}

      {/* 4. Pinned Announcements (if any) */}
      {pinnedMessages.length > 0 && (
        <div className="bg-emerald-50/90 border-b border-emerald-200 px-3 py-1.5 flex items-center gap-2 shrink-0">
          <Pin size={12} className="text-emerald-700 fill-emerald-600 shrink-0 rotate-45" />
          <div className="flex-1 text-[11px] text-emerald-950 truncate">
            <b>পিনযুক্ত নোটিশ:</b> {pinnedMessages[0].text}
          </div>
        </div>
      )}

      {/* 5. Chat Messages List Container */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0 bg-[#F7FAF9]">
        {messages.length === 0 ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <MessageSquare size={36} className="text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-700">চৌদ্দগ্রাম নাগরিক লাইভ চ্যাটে স্বাগতম!</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
              উপজেলার যে কোনো সেবা, নাগরিক সনদ, রক্ত বা তথ্যের বিষয়ে প্রশ্ন করতে নিচের বক্সে বার্তা লিখুন।
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_name === chatName;
            const timeStr = msg.created_at
              ? new Date(msg.created_at).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
              : '';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group transition-opacity`}
              >
                {/* Sender Identity Header */}
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-500">
                  <span className="font-bold text-slate-700">{msg.sender_name}</span>
                  {msg.is_admin ? (
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-700 text-white font-bold text-[9px] flex items-center gap-0.5">
                      <Shield size={9} />
                      কর্মকর্তা
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal">({msg.sender_union || 'চৌদ্দগ্রাম'})</span>
                  )}
                  <span className="text-[9px] text-slate-400 ml-1">{timeStr}</span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 shadow-2xs relative text-xs leading-relaxed break-words ${
                    isMe
                      ? 'bg-[#087F68] text-white rounded-tr-xs'
                      : msg.is_admin
                      ? 'bg-emerald-50 text-emerald-950 border border-emerald-300 rounded-tl-xs shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                  }`}
                >
                  {/* Urgent / Complaint Badges */}
                  {msg.urgent && (
                    <div className="inline-block px-1.5 py-0.5 bg-rose-500 text-white text-[9px] font-bold rounded mb-1">
                      🚨 জরুরি বিষয়
                    </div>
                  )}

                  <p className="select-text whitespace-pre-wrap">{msg.text}</p>

                  {/* Message Actions / Reactions */}
                  <div className="mt-1.5 pt-1 flex items-center justify-between gap-2 border-t border-black/5 text-[10px]">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleReaction(msg.id, msg.reactions, '❤️')}
                        className="hover:scale-125 transition-transform flex items-center gap-0.5 text-[10px]"
                        title="লাইক"
                      >
                        ❤️ <span>{msg.reactions?.['❤️'] || msg.likes_count || 0}</span>
                      </button>
                      <button
                        onClick={() => handleReaction(msg.id, msg.reactions, '👍')}
                        className="hover:scale-125 transition-transform ml-1"
                        title="সহমত"
                      >
                        👍 <span>{msg.reactions?.['👍'] || 0}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      {/* Report button */}
                      {!isMe && (
                        <button
                          onClick={() => setShowReportModal(msg)}
                          className="hover:text-red-600 p-0.5"
                          title="রিপোর্ট করুন"
                        >
                          <Flag size={10} />
                        </button>
                      )}

                      {/* Admin Actions: Pin & Delete */}
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handlePin(msg.id, !!msg.pinned)}
                            className={`p-0.5 hover:text-emerald-700 ${msg.pinned ? 'text-amber-500' : ''}`}
                            title={msg.pinned ? 'আনপিন করুন' : 'পিন করুন'}
                          >
                            <Pin size={11} />
                          </button>
                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="p-0.5 hover:text-rose-600"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={11} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* 6. Officer Quick Reply Templates (Visible when in Officer Mode) */}
      {isAdmin && officerMode && (
        <div className="bg-amber-50/80 border-t border-amber-200 px-3 py-1.5 shrink-0 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-amber-900 shrink-0">রেডিমেড উত্তর:</span>
          {OFFICER_REPLY_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(undefined, tmpl)}
              className="px-2 py-0.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-[10px] text-amber-950 whitespace-nowrap active:scale-95 shadow-2xs font-medium"
            >
              {tmpl}
            </button>
          ))}
        </div>
      )}

      {/* 7. Suggested Questions Drawer (Collapsible) */}
      {showSuggestedDrawer && (
        <div className="bg-emerald-50/95 border-t border-emerald-200 p-2.5 shrink-0 animate-fadeIn">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#075E54] flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" />
              সরাসরি প্রশ্ন বেছে নিন:
            </span>
            <button
              onClick={() => setShowSuggestedDrawer(false)}
              className="text-[10px] text-slate-500 hover:underline"
            >
              বন্ধ করুন
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
            {SUGGESTED_CITIZEN_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  handleSendMessage(undefined, q);
                  setShowSuggestedDrawer(false);
                }}
                className="text-left p-1.5 bg-white border border-emerald-200 hover:border-[#087F68] rounded-xl text-[10.5px] text-slate-800 hover:bg-emerald-100/60 leading-snug transition-all"
              >
                ● {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 8. Sticky Bottom Action Bar & Message Input */}
      <div className="sticky bottom-0 z-20 w-full bg-white border-t border-slate-200 shadow-xl shrink-0">
        {/* Warning if clicked send while empty */}
        {emptyWarning && (
          <div className="px-3 py-1 bg-amber-500 text-white text-[11px] font-semibold text-center animate-bounce shadow-xs">
            ⚠️ অনুগ্রহ করে নিচের বক্সে আপনার বার্তাটি লিখুন!
          </div>
        )}

        {/* Sender Identity & Modifiers Strip */}
        <div className="flex items-center justify-between px-3 py-1 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="truncate">
              প্রেরক: <b>{chatName || 'অতিথি নাগরিক'}</b> ({chatUnion.replace(' ইউনিয়ন', '')})
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Urgent toggle */}
            <button
              type="button"
              onClick={() => setIsUrgent(!isUrgent)}
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold border transition-all ${
                isUrgent ? 'bg-rose-500 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              🚨 জরুরি
            </button>

            {/* Complaint No attach button */}
            <button
              type="button"
              onClick={() => setShowComplaintInput(!showComplaintInput)}
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold border transition-all ${
                attachedComplaintNo ? 'bg-teal-700 text-white' : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              📄 অভিযোগ নং
            </button>
          </div>
        </div>

        {/* Complaint No Input Box */}
        {showComplaintInput && (
          <div className="px-3 py-1.5 bg-teal-50 border-b border-teal-200 flex items-center gap-2">
            <span className="text-[11px] font-bold text-teal-900 shrink-0">অভিযোগ নম্বর:</span>
            <input
              type="text"
              value={attachedComplaintNo}
              onChange={(e) => setAttachedComplaintNo(e.target.value)}
              placeholder="যেমন: CG-2026-1042"
              className="flex-1 px-2 py-1 text-xs bg-white border border-teal-300 rounded-lg text-teal-950 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowComplaintInput(false)}
              className="text-[10px] text-teal-700 underline font-semibold"
            >
              সম্পন্ন
            </button>
          </div>
        )}

        {/* Message Input & Send Button */}
        <form
          onSubmit={(e) => handleSendMessage(e)}
          className="p-2 sm:p-2.5 flex items-center gap-1.5 sm:gap-2 bg-white"
        >
          {/* Quick Emojis */}
          <div className="flex items-center gap-0.5 shrink-0">
            {EMOJI_LIST.slice(0, 3).map((emo) => (
              <button
                key={emo}
                type="button"
                onClick={() => {
                  setInputText((prev) => prev + emo);
                  inputRef.current?.focus();
                }}
                className="text-sm p-1 rounded hover:bg-slate-100 active:scale-90 transition-transform"
                title={emo}
              >
                {emo}
              </button>
            ))}
          </div>

          {/* File Attachment Hidden Input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-slate-400 hover:text-[#087F68] rounded hover:bg-slate-100"
            title="ছবি বা ডকুমেন্ট সংযুক্ত করুন"
          >
            <Paperclip size={16} />
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (emptyWarning) setEmptyWarning(false);
              }}
              placeholder={
                chatName
                  ? `${chatName}, প্রশ্ন বা বার্তা লিখুন...`
                  : 'চৌদ্দগ্রাম নাগরিক আড্ডায় আপনার বার্তা লিখুন...'
              }
              maxLength={1000}
              className={`w-full px-3 py-2 text-xs bg-slate-100 rounded-xl border transition-all text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white ${
                emptyWarning ? 'border-amber-500 ring-2 ring-amber-200' : 'border-slate-200 focus:border-[#087F68]'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer active:scale-95 ${
              inputText.trim()
                ? 'bg-[#087F68] hover:bg-[#075E54] text-white shadow-emerald-700/20'
                : 'bg-[#087F68] text-white hover:bg-[#075E54]'
            }`}
            title="বার্তা পাঠান"
          >
            <span>{isSending ? 'পাঠাচ্ছে...' : 'পাঠান'}</span>
            <Send size={14} className={isSending ? 'animate-pulse' : ''} />
          </button>
        </form>
      </div>

      {/* 9. Report Message Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 shadow-2xl">
            <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-rose-700">
              <Flag size={14} />
              বার্তা রিপোর্ট বা অভিযোগ
            </h3>
            <p className="text-[11px] text-slate-600 mb-2">
              আপত্তিকর, ভুয়া বা প্রতারণামূলক বার্তা হলে বিবরণ উল্লেখ করুন:
            </p>
            <textarea
              rows={3}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="রিপোর্টের কারণ..."
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 mb-3"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowReportModal(null)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('রিপোর্টটি উপজেলা এডমিনের অডিট লগে জমা দেওয়া হয়েছে। ধন্যবাদ।');
                  setShowReportModal(null);
                  setReportReason('');
                }}
                className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                রিপোর্ট জমা দিন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Profile & Union Drawer */}
      {showProfileDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">নাগরিক পরিচয় ও এলাকা নির্ধারণ</h3>
              <button
                onClick={() => setShowProfileDrawer(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  আপনার নাম (প্রদর্শনযোগ্য):
                </label>
                <input
                  type="text"
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  placeholder="যেমন: ফখরুল ইসলাম"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#087F68]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  আপনার ইউনিয়ন / এলাকা:
                </label>
                <select
                  value={chatUnion}
                  onChange={(e) => setChatUnion(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#087F68]"
                >
                  <option value="চৌদ্দগ্রাম পৌরসভা">চৌদ্দগ্রাম পৌরসভা</option>
                  <option value="কাশীনগর ইউনিয়ন">কাশীনগর ইউনিয়ন</option>
                  <option value="উজিরপুর ইউনিয়ন">উজিরপুর ইউনিয়ন</option>
                  <option value="কালিকাপুর ইউনিয়ন">কালিকাপুর ইউনিয়ন</option>
                  <option value="শ্রীপুর ইউনিয়ন">শ্রীপুর ইউনিয়ন</option>
                  <option value="শুভপুর ইউনিয়ন">শুভপুর ইউনিয়ন</option>
                  <option value="ঘোলপাশা ইউনিয়ন">ঘোলপাশা ইউনিয়ন</option>
                  <option value="চিওড়া ইউনিয়ন">চিওড়া ইউনিয়ন</option>
                  <option value="বাতিসা ইউনিয়ন">বাতিসা ইউনিয়ন</option>
                  <option value="মুন্সীরহাট ইউনিয়ন">মুন্সীরহাট ইউনিয়ন</option>
                  <option value="কনকাপৈত ইউনিয়ন">কনকাপৈত ইউনিয়ন</option>
                  <option value="জগন্নাথদীঘি ইউনিয়ন">জগন্নাথদীঘি ইউনিয়ন</option>
                  <option value="গুণবতী ইউনিয়ন">গুণবতী ইউনিয়ন</option>
                  <option value="প্রবাসী (Expatriate)">প্রবাসী (Expatriate)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('chauddagram_chat_name', chatName);
                  localStorage.setItem('chauddagram_chat_union', chatUnion);
                  setShowProfileDrawer(false);
                }}
                className="w-full py-2.5 bg-[#087F68] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#075E54]"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
