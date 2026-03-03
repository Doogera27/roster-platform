// ============================================================
// Core domain types for the Roster platform
// Matches the data model from Technical Spec Section 3
// ============================================================

// --- Enums ---

export enum UserRole {
  CLIENT = 'CLIENT',
  CREATIVE = 'CREATIVE',
  PM = 'PM',
}

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum CreativeTier {
  MEMBER = 'MEMBER',
  PRO = 'PRO',
  ELITE = 'ELITE',
}

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  LIMITED = 'LIMITED',
  UNAVAILABLE = 'UNAVAILABLE',
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PhaseStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETE = 'COMPLETE',
  BLOCKED = 'BLOCKED',
}

export enum DeliverableStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REVISION_REQUESTED = 'REVISION_REQUESTED',
}

export enum ProjectHealth {
  GREEN = 'GREEN',
  AMBER = 'AMBER',
  RED = 'RED',
}

export enum ProjectType {
  BRAND_IDENTITY = 'BRAND_IDENTITY',
  CAMPAIGN_CONCEPT = 'CAMPAIGN_CONCEPT',
  WEBSITE_REDESIGN = 'WEBSITE_REDESIGN',
  SOCIAL_CONTENT = 'SOCIAL_CONTENT',
  VIDEO_MOTION = 'VIDEO_MOTION',
  EMAIL_CAMPAIGN = 'EMAIL_CAMPAIGN',
  PRINT_OOH = 'PRINT_OOH',
  BRAND_PHOTOGRAPHY = 'BRAND_PHOTOGRAPHY',
}

// --- AI PM Insight enums ---

export enum InsightType {
  HEALTH_CHECK = 'HEALTH_CHECK',
  RISK_DETECTION = 'RISK_DETECTION',
  BUDGET_ANALYSIS = 'BUDGET_ANALYSIS',
  TIMELINE_ALERT = 'TIMELINE_ALERT',
  PHASE_RECOMMENDATION = 'PHASE_RECOMMENDATION',
  WORKLOAD_ALERT = 'WORKLOAD_ALERT',
  STATUS_REPORT = 'STATUS_REPORT',
  MILESTONE_ALERT = 'MILESTONE_ALERT',
}

export enum InsightSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export enum InsightStatus {
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

// --- Database row types ---

export interface User {
  id: string;
  auth0_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  avatar_url: string | null;
  organization_id: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Organization {
  id: string;
  name: string;
  domain: string | null;
  logo_url: string | null;
  subscription_tier: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreativeProfile {
  id: string;
  user_id: string;
  bio: string;
  disciplines: string[];
  portfolio_urls: string[];
  experience_level: 'JUNIOR' | 'MID' | 'SENIOR' | 'EXPERT';
  day_rate_cents: number;
  rush_multiplier: number;
  revision_policy: string;
  cancellation_terms: string;
  licensing_tiers: Record<string, unknown>;
  availability_status: AvailabilityStatus;
  max_concurrent_projects: number;
  tier: CreativeTier;
  application_status: ApplicationStatus;
  application_notes: string | null;
  is_charter_member: boolean;
  projects_completed: number;
  average_rating: number;
  re_engagement_rate: number;
  created_at: Date;
  updated_at: Date;
}

export interface BrandVault {
  id: string;
  organization_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface BrandVaultAsset {
  id: string;
  vault_id: string;
  filename: string;
  file_type: string;
  s3_key: string;
  file_size_bytes: number;
  version: number;
  extracted_brand_data: Record<string, unknown> | null;
  uploaded_by_user_id: string;
  created_at: Date;
}

export interface Roster {
  id: string;
  name: string;
  organization_id: string;
  created_by_user_id: string;
  notes: string | null;
  is_saved: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RosterMember {
  id: string;
  roster_id: string;
  creative_profile_id: string;
  role_label: string;
  annotation: string | null;
  is_backup: boolean;
  added_at: Date;
}

export interface Project {
  id: string;
  organization_id: string;
  roster_id: string;
  pm_user_id: string | null;
  project_type: ProjectType;
  name: string;
  brief: string;
  status: ProjectStatus;
  health: ProjectHealth;
  budget_cents: number;
  spent_cents: number;
  due_date: Date | null;
  started_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectPhase {
  id: string;
  project_id: string;
  name: string;
  description: string;
  depends_on: string[];
  status: PhaseStatus;
  assigned_creative_id: string | null;
  typical_duration_days: number;
  brief_delivered_at: Date | null;
  activated_at: Date | null;
  completed_at: Date | null;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  phase_id: string;
  assigned_creative_id: string | null;
  title: string;
  description: string;
  is_complete: boolean;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Deliverable {
  id: string;
  phase_id: string;
  task_id: string | null;
  submitted_by_user_id: string;
  title: string;
  file_s3_key: string | null;
  file_type: string | null;
  status: DeliverableStatus;
  revision_number: number;
  feedback: string | null;
  reviewed_by_user_id: string | null;
  reviewed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Invoice {
  id: string;
  project_id: string;
  organization_id: string;
  stripe_invoice_id: string | null;
  amount_cents: number;
  platform_fee_cents: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  pdf_s3_key: string | null;
  due_date: Date;
  paid_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Rating {
  id: string;
  project_id: string;
  reviewer_user_id: string;
  reviewed_user_id: string;
  score: number; // 1-5
  comment: string | null;
  created_at: Date;
}

// --- API response envelope (Spec Section 8.2) ---

export interface ApiResponse<T = unknown> {
  data: T;
  meta?: {
    cursor?: string;
    has_more?: boolean;
    total?: number;
  };
  errors?: ApiError[];
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

// --- Auth context ---

export interface AuthContext {
  sub: string;        // Auth0 user ID
  userId: string;     // Roster user ID
  role: UserRole;
  organizationId: string | null;
}
