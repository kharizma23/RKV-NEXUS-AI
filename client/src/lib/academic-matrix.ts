/**
 * 2026 Academic Anchor Matrix Specification
 * Single source of truth for Engineering Cohort Targeting across RKV Nexus AI platform.
 * 
 * Matrix:
 * - 1st Year Students  -> Batch: "2026-2030" -> Semesters: [1, 2]
 * - 2nd Year Students  -> Batch: "2025-2029" -> Semesters: [3, 4]
 * - 3rd Year Students  -> Batch: "2024-2028" -> Semesters: [5, 6]
 * - 4th/Final Students -> Batch: "2023-2027" -> Semesters: [7, 8]
 */

export interface SemesterOption {
  number: number;
  label: string;
}

export interface CohortOption {
  yearLabel: string;
  batch: string;
  batchLabel: string;
  semesters: SemesterOption[];
}

export const TARGET_COHORTS: readonly CohortOption[] = [
  {
    yearLabel: '1st Year',
    batch: '2026-2030',
    batchLabel: '1st Year ("2026-2030" — Freshmen)',
    semesters: [
      { number: 1, label: 'Semester 1 (1st Year - Odd)' },
      { number: 2, label: 'Semester 2 (1st Year - Even)' },
    ],
  },
  {
    yearLabel: '2nd Year',
    batch: '2025-2029',
    batchLabel: '2nd Year ("2025-2029" — Sophomores)',
    semesters: [
      { number: 3, label: 'Semester 3 (2nd Year - Odd)' },
      { number: 4, label: 'Semester 4 (2nd Year - Even)' },
    ],
  },
  {
    yearLabel: '3rd Year',
    batch: '2024-2028',
    batchLabel: '3rd Year ("2024-2028" — Pre-Final)',
    semesters: [
      { number: 5, label: 'Semester 5 (3rd Year - Odd)' },
      { number: 6, label: 'Semester 6 (3rd Year - Even)' },
    ],
  },
  {
    yearLabel: '4th/Final Year',
    batch: '2023-2027',
    batchLabel: 'Final Year ("2023-2027" — Graduating)',
    semesters: [
      { number: 7, label: 'Semester 7 (4th Year - Odd)' },
      { number: 8, label: 'Semester 8 (4th Year - Even)' },
    ],
  },
] as const;

export function getSemestersForBatch(batch: string): SemesterOption[] {
  const found = TARGET_COHORTS.find((c) => c.batch === batch);
  return found ? found.semesters : [];
}

export function isValidCohort(batch: string, semester: number): boolean {
  const allowed = getSemestersForBatch(batch);
  return allowed.some((s) => s.number === semester);
}
