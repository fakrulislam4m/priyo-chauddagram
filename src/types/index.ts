export type Language = 'bn' | 'en';

export type PaymentStatus = 'Unpaid' | 'Submitted' | 'Verified' | 'Rejected' | 'Refunded';
export type ApprovalStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Changes Requested';
export type PublicationStatus = 'Draft' | 'Published' | 'Paused' | 'Expired' | 'Archived';
export type NoticeStatus = 'Published' | 'Hidden' | 'Archived';
export type AdvertiserType = 'Doctor' | 'Hospital' | 'Clinic' | 'Diagnostic' | 'Pharmacy' | 'Shop' | 'Business';

export interface UpazilaProfile {
  id: string;
  name_bn: string;
  name_en: string;
  district_bn: string;
  district_en: string;
  division_bn: string;
  division_en: string;
  tagline_bn: string;
  tagline_en: string;
  description_bn: string;
  description_en: string;
  overview_bn?: string;
  area_sq_km?: string;
  population?: string;
  history_bn: string;
  history_en: string;
  geography_bn: string;
  geography_en: string;
  administration_bn: string;
  administration_en: string;
  municipality_count: number;
  union_count: number;
  population_information?: string;
  important_places_bn: string;
  important_places_en: string;
  map_url: string;
  official_website_url: string;
  image_url: string;
  updated_at: string;
  updated_by: string;
  publication_status: 'Published' | 'Draft' | 'Archived';
}

export interface UnionItem {
  id: string;
  name_bn: string;
  name_en: string;
  order: number;
  status: 'Published' | 'Draft' | 'Archived';
  created_at: string;
  updated_at: string;
}

export interface GovernmentNotice {
  id: string;
  source_domain: string;
  source_title_bn: string;
  source_title_en: string;
  published_date: string;
  original_notice_url: string;
  original_file_urls: string[];
  source_hash: string;
  status: NoticeStatus;
  imported_from: string;
  fetched_at: string;
  first_seen_at: string;
  last_seen_at: string;
  attribution_bn: string;
  attribution_en: string;
  created_at: string;
  updated_at: string;
  // Optional convenience fields for display & priority
  title_bn?: string;
  title_en?: string;
  description_bn?: string;
  description_en?: string;
  date?: string;
  priority?: 'urgent' | 'high' | 'normal';
  is_emergency?: boolean;
  category?: string;
  issuing_department?: string;
}

export interface SponsoredCampaign {
  id: string;
  advertiser_type: AdvertiserType;
  advertiser_name: string;
  title_bn: string;
  title_en: string;
  tagline_bn?: string;
  tagline_en?: string;
  banner_color_theme?: string;
  doctor_name_bn?: string;
  doctor_name_en?: string;
  hospital_or_clinic_name_bn?: string;
  hospital_or_clinic_name_en?: string;
  specialty_bn?: string;
  specialty_en?: string;
  chamber_days?: string;
  chamber_start_time?: string;
  chamber_end_time?: string;
  services_bn?: string;
  services_en?: string;
  description_bn?: string;
  description_en?: string;
  poster_image_url?: string;
  banner_image_url?: string;
  phone: string;
  address_bn: string;
  address_en: string;
  map_url?: string;
  website_url?: string;
  payment_reference?: string;
  payment_receipt_url?: string;
  payment_status: PaymentStatus;
  approval_status: ApprovalStatus;
  publication_status: PublicationStatus;
  campaign_start_date: string;
  campaign_end_date: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

export interface AdminUser {
  id?: string;
  email: string;
  name: string;
  role: 'primary_admin' | 'admin' | 'moderator';
  status?: string;
  phone?: string;
  designation?: string;
  organization?: string;
  location?: string;
  created_at: string;
  created_by: string;
}

export interface SyncRun {
  id: string;
  status: 'Running' | 'Success' | 'Partial Failure' | 'Failed';
  started_at: string;
  completed_at: string | null;
  notices_fetched: number;
  notices_added: number;
  notices_updated: number;
  errors: string[];
  triggered_by: string;
}

export interface AuditLog {
  id: string;
  admin_email: string;
  admin_name: string;
  action: string;
  target_collection: string;
  target_id: string;
  details: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender_name: string;
  sender_id?: string;
  sender_email?: string;
  sender_union?: string;
  sender_avatar?: string;
  is_admin?: boolean;
  role?: 'primary_admin' | 'admin' | 'moderator' | 'resident';
  created_at: string;
  pinned?: boolean;
  likes_count?: number;
  reactions?: Record<string, number>;
  urgent?: boolean;
  complaint_no?: string;
  department?: string;
  attachment_url?: string;
  attachment_name?: string;
  status?: 'open' | 'closed' | 'replied';
  reply_to?: string;
  reported?: boolean;
}

export interface ChatPresence {
  user_id: string;
  name: string;
  union?: string;
  last_active: string;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';

export type DonorStatus = 'pending_review' | 'verified' | 'rejected' | 'temporarily_unavailable' | 'hidden';

export interface BloodDonor {
  id: string;
  name: string;
  blood_group: BloodGroup;
  phone: string; // Stored securely, never exposed public without approved contact request
  emergency_phone?: string;
  upazila: string;
  union: string;
  village?: string;
  area_address: string;
  last_donation_date?: string;
  available_now: boolean;
  photo_url?: string;
  status: DonorStatus;
  rejection_reason?: string;
  otp_verified: boolean;
  consent_agreed: boolean;
  registered_by: 'self' | 'friend';
  friend_name?: string;
  friend_phone?: string;
  created_at: string;
  updated_at: string;
  verified_at?: string;
  verified_by?: string;
}

export interface BloodContactRequest {
  id: string;
  donor_id: string;
  donor_name: string;
  donor_blood_group: BloodGroup;
  requester_name: string;
  requester_phone: string;
  patient_name: string;
  hospital_name: string;
  units_needed: number;
  urgency: 'critical' | 'urgent' | 'regular';
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  resolved_at?: string;
}

export interface EmergencyContact {
  id: string;
  name_bn: string;
  name_en: string;
  service_type: string;
  phone: string;
  secondary_phone?: string;
  address_bn: string;
  badge: string;
  badge_color: string;
  icon: string;
  map_url?: string;
}

export interface ServiceCardItem {
  id: string;
  name_bn: string;
  desc_bn: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  badge: string;
  badgeColor: string;
  order: number;
  active: boolean;
}

export interface LiveChatSettings {
  enabled: boolean;
  office_hours: string;
  welcome_message_bn: string;
  support_phone: string;
  auto_reply_bn: string;
  suggested_questions: string[];
}

export interface OfficeOfficerItem {
  id: string;
  office_name_bn: string;
  officer_name_bn: string;
  designation_bn: string;
  department_bn: string;
  phone: string;
  email?: string;
  room_no?: string;
  address_bn?: string;
  order: number;
  active: boolean;
}

