export type UserRole = 'citizen' | 'reviewer' | 'officer' | 'admin';

export type ReportStatus =
  | 'submitted'
  | 'verified'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'rejected'
  | 'duplicate';

export type HazardCategory =
  | 'pothole'
  | 'damaged_road'
  | 'broken_streetlight'
  | 'waterlogging'
  | 'open_drain'
  | 'fallen_tree'
  | 'damaged_footpath'
  | 'garbage_overflow'
  | 'other';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type MediaKind = 'evidence' | 'resolution_before' | 'resolution_after';

export type LanguageCode = 'en' | 'hi' | 'te';

export interface PriorityReason {
  factor: string;
  points: number;
  text: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  department_id: string | null;
  ward_id: string | null;
  language: LanguageCode;
  created_at?: string;
  updated_at?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  created_at?: string;
}

export interface Ward {
  id: string;
  name: string;
  code: string;
  created_at?: string;
}

export interface CategoryConfig {
  category: HazardCategory;
  label: string;
  department_id: string | null;
  sla_hours: number;
  base_weight: number;
}

export interface Report {
  id: string;
  ref_code: string;
  reporter_id: string;
  category: HazardCategory;
  title: string;
  description: string | null;
  location: string | null; // e.g. "SRID=4326;POINT(78.4867 17.3850)"
  address: string | null;
  ward_id: string | null;
  status: ReportStatus;
  status_note: string | null;
  severity: SeverityLevel;
  priority_score: number;
  priority_level: SeverityLevel;
  priority_reasons: PriorityReason[] | null;
  priority_override: SeverityLevel | null;
  override_reason: string | null;
  effective_priority: SeverityLevel;
  suggested_department_id: string | null;
  department_id: string | null;
  assigned_to: string | null;
  duplicate_of: string | null;
  upvote_count: number;
  ai_suggestion?: any;
  sla_due_at: string | null;
  escalation_level: number;
  escalated_at: string | null;
  verified_at: string | null;
  assigned_at: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface StaffReport extends Report {
  lat: number | null;
  lng: number | null;
  department_name?: string;
  ward_name?: string;
  reporter_name?: string;
}

export interface PublicReport {
  id: string;
  ref_code: string;
  category: HazardCategory;
  status: ReportStatus;
  effective_priority: SeverityLevel;
  ward_id: string | null;
  upvote_count: number;
  created_at: string;
  resolved_at: string | null;
  sla_due_at: string | null;
  lat: number | null;
  lng: number | null;
}

export interface PublicCategoryStat {
  category: HazardCategory;
  label?: string;
  total_reports: number;
  resolved_reports: number;
  open_reports: number;
  avg_resolution_hours: number | null;
}

export interface PublicWardStat {
  ward_id: string;
  ward_name: string;
  ward_code: string;
  total_reports: number;
  resolved_reports: number;
  overdue_reports: number;
  avg_resolution_hours: number | null;
}

export interface ReportMedia {
  id: string;
  report_id: string;
  storage_path: string;
  kind: MediaKind;
  caption: string | null;
  uploaded_by: string;
  created_at?: string;
  signedUrl?: string;
}

export interface StatusHistory {
  id: string;
  report_id: string;
  event: string;
  from_status: ReportStatus | null;
  to_status: ReportStatus;
  note: string | null;
  changed_by: string | null;
  changer_name?: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  report_id: string | null;
  kind: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface SimilarReportMatch {
  id: string;
  ref_code: string;
  title: string;
  category: HazardCategory;
  status: ReportStatus;
  created_at: string;
  distance_m: number;
  upvote_count: number;
}
