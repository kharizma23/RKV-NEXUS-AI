export interface Student360Profile {
  student_id: string;
  full_name: string;
  student_name?: string;
  roll_number: string;
  institution: string;
  department: string;
  programme: string;
  semester: number;
  academic_score: number;
  attendance_rate: number;
  wellness_index: number;
  wellness_score?: number;
  skill_score: number;
  placement_readiness: number;
  composite_score: number;
  ai_composite_index?: number;
  ai_summary: string;
  last_evaluated: string;
  evaluated_by: string;
  updated_at?: string;
  radar_dimensions?: Array<{ dimension: string; value: number; fullMark: number }>;
}

export interface StudentSearchResult {
  id: string;
  student_id: string;
  full_name: string;
  roll_number: string;
  email: string;
  label: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
