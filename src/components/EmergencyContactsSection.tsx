import React, { useState, useEffect } from 'react';
import type { EmergencyContact } from '../types';
import { subscribeEmergencyContacts, getEmergencyContacts } from '../services/dataService';
import { 
  PhoneCall, 
  Phone, 
  ShieldCheck, 
  Stethoscope, 
  Flame, 
  Truck, 
  Building2, 
  MessageSquare, 
  MapPin, 
  X, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const EmergencyContactsSection: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => getEmergencyContacts());
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);

  useEffect(() => {
    const unsub = subscribeEmergencyContacts((list) => {
      if (list && list.length > 0) {
        setContacts(list);
      }
    });
    return () => unsub();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'PhoneCall': return <PhoneCall size={18} className="text-red-600" />;
      case 'ShieldCheck': return <ShieldCheck size={18} className="text-blue-600" />;
      case 'Stethoscope': return <Stethoscope size={18} className="text-emerald-600" />;
      case 'Flame': return <Flame size={18} className="text-amber-600" />;
      case 'Truck': return <Truck size={18} className="text-rose-600" />;
      case 'Building2': return <Building2 size={18} className="text-teal-700" />;
      default: return <Phone size={18} className="text-slate-600" />;
    }
  };

  return (
    <div className="mx-3.5 mt-4 mb-5">
      <div className="flex items-center justify-between px-1 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#D64545]"></span>
          <h2 className="text-xs font-bold text-[#17332D]">জরুরি যোগাযোগ ডিরেক্টরি</h2>
        </div>
        <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full">
          ২৪/৭ সার্বক্ষণিক হটলাইন
        </span>
      </div>

      {/* Grid of Emergency Contacts */}
      <div className="grid grid-cols-2 gap-2">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => setSelectedContact(contact)}
            className="p-3 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-[#C73E4D] transition-all cursor-pointer active:scale-[0.98] group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-1 mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                {getIcon(contact.icon)}
              </div>
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${contact.badge_color || 'bg-red-500 text-white'}`}>
                {contact.badge}
              </span>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#17332D] leading-snug group-hover:text-[#C73E4D] transition-colors">
                {contact.name_bn}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5 font-bold">
                {contact.phone}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Bottom Sheet / Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                  {getIcon(selectedContact.icon)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#17332D]">
                    {selectedContact.name_bn}
                  </h3>
                  <p className="text-[11px] text-slate-500">{selectedContact.service_type}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedContact(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium">প্রধান ফোন:</span>
                <span className="font-bold font-mono text-slate-900">{selectedContact.phone}</span>
              </div>

              {selectedContact.secondary_phone && (
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 font-medium">বিকল্প ফোন:</span>
                  <span className="font-bold font-mono text-slate-900">{selectedContact.secondary_phone}</span>
                </div>
              )}

              <div className="flex items-start gap-1.5 p-2 bg-slate-50 rounded-xl">
                <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-600">{selectedContact.address_bn}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <a
                href={`tel:${selectedContact.phone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                <Phone size={14} />
                <span>কল করুন</span>
              </a>

              {selectedContact.secondary_phone ? (
                <a
                  href={`tel:${selectedContact.secondary_phone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  <Phone size={14} />
                  <span>বিকল্প কল</span>
                </a>
              ) : selectedContact.map_url ? (
                <a
                  href={selectedContact.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  <ExternalLink size={14} />
                  <span>ম্যাপ দেখুন</span>
                </a>
              ) : (
                <button
                  onClick={() => setSelectedContact(null)}
                  className="py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
                >
                  বন্ধ করুন
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
