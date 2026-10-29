export type UserRole = 'STUDENT' | 'FACULTY' | 'EXAMINER' | 'DEPARTMENT_HEAD' | 'ADMIN';

export interface StudentProfile {
  id: string;
  student_id_number: string;
  department_id?: string;
}

export interface FacultyProfile {
  id: string;
  employee_id: string;
  designation?: string;
  department_id?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  is_approved: boolean;
  roles: UserRole[];
  student_profile?: StudentProfile;
  faculty_profile?: FacultyProfile;
  created_at: string;
}
