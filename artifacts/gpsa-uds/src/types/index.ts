// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole =
  | "super_admin"   // Executives — full access
  | "treasurer"     // Dues & payment management
  | "academic"      // Academic resources & opportunities
  | "welfare"       // Welfare requests
  | "events"        // Events management
  | "opportunities" // Internships, jobs, scholarships
  | "ediboard"      // Newsletter / editorial board
  | "student";      // Regular member — read-only dashboard

export type MembershipStatus =
  | "pending"    // Awaiting payment verification
  | "active"     // Dues paid and current
  | "expired"    // Previous period paid, current unpaid
  | "suspended"; // Manually suspended by admin

export type MembershipTier =
  | "100_level"
  | "200_level"
  | "300_level"
  | "400_level"
  | "500_level"
  | "alumnus";

export type PaymentStatus =
  | "pending"
  | "success"
  | "failed"
  | "abandoned";

export type PaymentProvider = "paystack";

export type MobileMoneyNetwork =
  | "mtn"
  | "vodafone"
  | "airteltigo";

export type EventType =
  | "general"
  | "academic"
  | "social"
  | "welfare"
  | "executive";

export type EventStatus =
  | "draft"
  | "published"
  | "cancelled"
  | "completed";

export type NewsStatus =
  | "draft"
  | "published"
  | "archived";

export type OpportunityType =
  | "internship"
  | "scholarship"
  | "job"
  | "conference"
  | "workshop"
  | "other";

export type OpportunityStatus =
  | "draft"
  | "published"
  | "closed"
  | "archived";

export type WelfareRequestStatus =
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "disbursed";

export type WelfareRequestType =
  | "financial"
  | "medical"
  | "bereavement"
  | "emergency"
  | "other";

export type ResourceType =
  | "past_question"
  | "lecture_note"
  | "textbook"
  | "research_paper"
  | "other";

export type NotificationType =
  | "membership"
  | "payment"
  | "event"
  | "news"
  | "opportunity"
  | "welfare"
  | "system";

// ─────────────────────────────────────────────────────────────────────────────
// Core entities
// ─────────────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;                        // UUID — matches auth.users.id
  email: string;
  full_name: string;
  student_id: string | null;         // UDS student index number
  phone: string | null;
  level: MembershipTier | null;
  role: UserRole;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  status: MembershipStatus;
  tier: MembershipTier;
  academic_year: string;             // e.g. "2024/2025"
  start_date: string | null;
  end_date: string | null;
  payment_id: string | null;
  verified_by: string | null;        // Profile.id of treasurer/admin
  verified_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations
  profile?: Profile;
  payment?: Payment;
}

export interface Payment {
  id: string;
  user_id: string;
  reference: string;                 // Paystack transaction reference
  amount: number;                    // In pesewas (smallest GHS unit)
  currency: "GHS";
  status: PaymentStatus;
  provider: PaymentProvider;
  network: MobileMoneyNetwork | null;
  mobile_number: string | null;
  metadata: Record<string, unknown> | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations
  profile?: Profile;
}

// ─────────────────────────────────────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────────────────────────────────────

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: EventType;
  status: EventStatus;
  cover_image_url: string | null;
  location: string | null;
  is_virtual: boolean;
  virtual_link: string | null;
  starts_at: string;
  ends_at: string | null;
  capacity: number | null;
  registration_required: boolean;
  registration_deadline: string | null;
  created_by: string;               // Profile.id
  published_at: string | null;
  created_at: string;
  updated_at: string;

  // Joined
  author?: Profile;
  registrations?: EventRegistration[];
  _count?: { registrations: number };
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registered_at: string;

  // Joined
  profile?: Profile;
  event?: Event;
}

// ─────────────────────────────────────────────────────────────────────────────
// News / Editorial Board
// ─────────────────────────────────────────────────────────────────────────────

export interface News {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;                   // Rich text / HTML
  cover_image_url: string | null;
  status: NewsStatus;
  is_featured: boolean;
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;

  // Joined
  author?: Profile;
  tags?: NewsTag[];
}

export interface NewsTag {
  id: string;
  news_id: string;
  tag: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Opportunities (internships, scholarships, jobs)
// ─────────────────────────────────────────────────────────────────────────────

export interface Opportunity {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: OpportunityType;
  status: OpportunityStatus;
  organisation: string;
  location: string | null;
  is_remote: boolean;
  application_url: string | null;
  deadline: string | null;
  cover_image_url: string | null;
  eligibility: string | null;
  benefits: string | null;
  posted_by: string;                 // Profile.id
  published_at: string | null;
  created_at: string;
  updated_at: string;

  // Joined
  author?: Profile;
}

// ─────────────────────────────────────────────────────────────────────────────
// Welfare
// ─────────────────────────────────────────────────────────────────────────────

export interface WelfareRequest {
  id: string;
  user_id: string;
  type: WelfareRequestType;
  status: WelfareRequestStatus;
  title: string;
  description: string;
  amount_requested: number | null;   // GHS
  amount_approved: number | null;    // GHS
  supporting_documents: string[];    // Array of Supabase Storage URLs
  reviewed_by: string | null;        // Profile.id
  reviewed_at: string | null;
  review_notes: string | null;
  disbursed_at: string | null;
  created_at: string;
  updated_at: string;

  // Joined
  profile?: Profile;
  reviewer?: Profile;
}

// ─────────────────────────────────────────────────────────────────────────────
// Academic Resources
// ─────────────────────────────────────────────────────────────────────────────

export interface AcademicResource {
  id: string;
  title: string;
  description: string | null;
  type: ResourceType;
  course_code: string | null;
  course_name: string | null;
  level: MembershipTier | null;      // Which year group this is for
  academic_year: string | null;
  file_url: string;                  // Supabase Storage URL
  file_name: string;
  file_size: number;                 // Bytes
  file_type: string;                 // MIME type
  download_count: number;
  is_approved: boolean;
  uploaded_by: string;              // Profile.id
  approved_by: string | null;       // Profile.id
  approved_at: string | null;
  created_at: string;
  updated_at: string;

  // Joined
  uploader?: Profile;
}

// ─────────────────────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  action_url: string | null;        // Deep link inside the app
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Site Settings (key-value store for CMS config)
// ─────────────────────────────────────────────────────────────────────────────

export interface SiteSetting {
  id: string;
  key: string;                       // e.g. "membership_fee_100", "site_tagline"
  value: string;
  label: string;                     // Human-readable label
  description: string | null;
  category: string;                  // e.g. "membership", "branding", "contact"
  updated_by: string | null;         // Profile.id
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Supabase Database type (used to type the Supabase client)
// ─────────────────────────────────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      memberships: {
        Row: Membership;
        Insert: Omit<Membership, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Membership, "id" | "user_id" | "created_at">>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Payment, "id" | "user_id" | "created_at">>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Event, "id" | "created_at">>;
      };
      event_registrations: {
        Row: EventRegistration;
        Insert: Omit<EventRegistration, "id" | "registered_at">;
        Update: never;
      };
      news: {
        Row: News;
        Insert: Omit<News, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<News, "id" | "created_at">>;
      };
      news_tags: {
        Row: NewsTag;
        Insert: Omit<NewsTag, "id">;
        Update: never;
      };
      opportunities: {
        Row: Opportunity;
        Insert: Omit<Opportunity, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Opportunity, "id" | "created_at">>;
      };
      welfare_requests: {
        Row: WelfareRequest;
        Insert: Omit<WelfareRequest, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<WelfareRequest, "id" | "user_id" | "created_at">>;
      };
      academic_resources: {
        Row: AcademicResource;
        Insert: Omit<AcademicResource, "id" | "download_count" | "created_at" | "updated_at">;
        Update: Partial<Omit<AcademicResource, "id" | "created_at">>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "is_read" | "created_at">;
        Update: Pick<Notification, "is_read">;
      };
      site_settings: {
        Row: SiteSetting;
        Insert: Omit<SiteSetting, "id" | "updated_at">;
        Update: Partial<Omit<SiteSetting, "id">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      membership_status: MembershipStatus;
      membership_tier: MembershipTier;
      payment_status: PaymentStatus;
      payment_provider: PaymentProvider;
      mobile_money_network: MobileMoneyNetwork;
      event_type: EventType;
      event_status: EventStatus;
      news_status: NewsStatus;
      opportunity_type: OpportunityType;
      opportunity_status: OpportunityStatus;
      welfare_request_status: WelfareRequestStatus;
      welfare_request_type: WelfareRequestType;
      resource_type: ResourceType;
      notification_type: NotificationType;
    };
  };
};
