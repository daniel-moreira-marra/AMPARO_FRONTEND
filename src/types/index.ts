export type UserRole = 'ELDER' | 'CAREGIVER' | 'GUARDIAN' | 'PROFESSIONAL' | 'INSTITUTION';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  avatar?: string;
  is_verified: boolean;
  onboarding_completed: boolean;
  role: UserRole;
  show_email?: boolean;
  show_phone?: boolean;
  show_links?: boolean;
  address_line?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

// ─── Role-specific profiles ──────────────────────────────────────────────────

export interface ElderProfile {
  preferred_name?: string;
  birth_date?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'NOT_INFORMED';
  mobility_level?: 'INDEPENDENT' | 'NEEDS_ASSISTANCE' | 'WHEELCHAIR' | 'BEDRIDDEN';
  cognitive_status?: 'LUCID' | 'MILD_IMPAIRMENT' | 'DEMENTIA' | 'NOT_INFORMED';
  has_fall_risk?: boolean;
  needs_medication_support?: boolean;
  requires_24h_care?: boolean;
  medical_conditions?: string;
  allergies?: string;
  medications?: string;
  medical_notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  share_medical_info?: boolean;
  is_active?: boolean;
}

export interface CaregiverProfile {
  bio?: string;
  experience_years?: number;
  is_available?: boolean;
  city?: string;
  state?: string;
  care_types?: string[];
}

export interface GuardianProfile {
  relationship?: 'CHILD' | 'SPOUSE' | 'SIBLING' | 'RELATIVE' | 'LEGAL_GUARDIAN' | 'OTHER';
  is_legal_guardian?: boolean;
  preferred_contact?: string;
}

export interface ProfessionalProfile {
  profession?: 'PHYSIOTHERAPIST' | 'SPEECH_THERAPIST' | 'OCCUPATIONAL_THERAPIST' | 'PSYCHOLOGIST' | 'NUTRITIONIST' | 'OTHER';
  profession_other?: string;
  council?: string;
  license_number?: string;
  bio?: string;
  service_mode?: 'HOME' | 'CLINIC' | 'ONLINE' | 'OTHER';
  hourly_rate?: string;
  is_available?: boolean;
  registration_verified?: boolean;
  city?: string;
  state?: string;
}

export interface InstitutionProfile {
  legal_name?: string;
  trade_name?: string;
  cnpj?: string;
  institution_type?: 'ILPI' | 'SHELTER' | 'CLINIC' | 'HOSPITAL' | 'OTHER';
  capacity?: number;
  website?: string;
  license_number?: string;
  is_verified?: boolean;
}

export type RoleProfile = ElderProfile | CaregiverProfile | GuardianProfile | ProfessionalProfile | InstitutionProfile;

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchUser {
  id: number;
  user_id: number;
  role: UserRole;
  full_name: string;
  // ELDER
  preferred_name?: string;
  gender?: string;
  mobility_level?: string;
  // CAREGIVER
  bio?: string;
  experience_years?: number;
  is_available?: boolean;
  city?: string;
  state?: string;
  care_types?: string[];
  // GUARDIAN
  relationship?: string;
  is_legal_guardian?: boolean;
  // PROFESSIONAL
  profession?: string;
  profession_display?: string;
  service_mode?: string;
  hourly_rate?: string;
  registration_verified?: boolean;
  // INSTITUTION
  legal_name?: string;
  trade_name?: string;
  institution_type?: string;
  is_verified?: boolean;
}

export interface SearchFilters {
  q?: string;
  role?: UserRole;
  city?: string;
  state?: string;
  is_available?: boolean;
  experience_years?: number;
  profession?: string;
  service_mode?: string;
  min_price?: string;
  max_price?: string;
}

export interface SharedPost {
  id: number;
  author_id?: number;
  author_name: string;
  author_role?: string;
  text: string;
  image?: string;
  image_alt_text?: string;
  images?: string[];
  created_at: string;
}

export interface Post {
  id: number;
  content: string;
  image?: string;
  image_alt_text?: string;
  images?: string[];
  tags?: string[];
  author: {
    id: number;
    full_name: string;
    avatar?: string;
    role?: string;
  };
  created_at: string;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
  shared_post?: SharedPost;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface Notification {
  id: number;
  type: "LINK_REQUEST" | "LINK_ACCEPTED";
  message: string;
  is_read: boolean;
  created_at: string;
  actor_name: string;
  link_type: string;
  link_id: number | null;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}
