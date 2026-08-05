'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Combobox } from '@/components/ui/combobox';
import { AlertCircle, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { TARGET_COHORTS, getSemestersForBatch, isValidCohort } from '@/lib/academic-matrix';

interface SelectOption {
  id: string;
  name: string;
  code?: string;
  year_label?: string;
  semester_number?: number;
}

interface ProgrammeOption {
  id: string;
  name: string;
  programme_name?: string;
  code: string;
  programme_code?: string;
  degree_type?: string;
}

const FALLBACK_INSTITUTIONS: SelectOption[] = [
  { id: 'AIT', name: 'Apex Institute of Technology', code: 'AIT' },
  { id: 'DIT', name: 'Demo Institute of Technology', code: 'DIT' },
  { id: 'IITM', name: 'Indian Institute of Technology Madras', code: 'IITM' },
  { id: 'IITB', name: 'Indian Institute of Technology Bombay', code: 'IITB' },
  { id: 'IITD', name: 'Indian Institute of Technology Delhi', code: 'IITD' },
  { id: 'IITKGP', name: 'Indian Institute of Technology Kharagpur', code: 'IITKGP' },
  { id: 'IITK', name: 'Indian Institute of Technology Kanpur', code: 'IITK' },
  { id: 'NITT', name: 'National Institute of Technology Tiruchirappalli', code: 'NITT' },
  { id: 'AU', name: 'Anna University Chennai', code: 'AU' },
  { id: 'BITS', name: 'BITS Pilani', code: 'BITS' },
  { id: 'VIT', name: 'Vellore Institute of Technology', code: 'VIT' },
  { id: 'SRM', name: 'SRM Institute of Science and Technology', code: 'SRM' },
];

const STANDARD_DEPARTMENTS: SelectOption[] = [
  { id: 'CSE', name: 'Computer Science & Engineering', code: 'CSE' },
  { id: 'AIDS', name: 'Artificial Intelligence & Data Science', code: 'AIDS' },
  { id: 'AIML', name: 'Artificial Intelligence & Machine Learning', code: 'AIML' },
  { id: 'ECE', name: 'Electronics & Communication Engineering', code: 'ECE' },
  { id: 'EEE', name: 'Electrical & Electronics Engineering', code: 'EEE' },
  { id: 'MECH', name: 'Mechanical Engineering', code: 'MECH' },
  { id: 'CIVIL', name: 'Civil Engineering', code: 'CIVIL' },
  { id: 'IT', name: 'Information Technology', code: 'IT' },
  { id: 'BT', name: 'Biotechnology', code: 'BT' },
  { id: 'BM', name: 'Biomedical Engineering', code: 'BM' },
  { id: 'EI', name: 'Electronics & Instrumentation Engineering', code: 'EI' },
  { id: 'AGRI', name: 'Agricultural Engineering', code: 'AGRI' },
  { id: 'FT', name: 'Food Technology', code: 'FT' },
  { id: 'CSBS', name: 'Computer Science & Business Systems', code: 'CSBS' },
  { id: 'CHEMICAL', name: 'Chemical Engineering', code: 'CHEMICAL' },
  { id: 'AERO', name: 'Aeronautical Engineering', code: 'AERO' },
  { id: 'AUTO', name: 'Automobile Engineering', code: 'AUTO' },
  { id: 'ROBOTICS', name: 'Robotics & Automation Engineering', code: 'ROBOTICS' },
  { id: 'OTHER', name: 'Other Department', code: 'OTHER' },
];

export default function StudentRegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    preferred_language: 'en',
    institution_id: '',
    custom_institution: '',
    department_id: '',
    custom_department: '',
    programme_id: '',
    academic_year_id: '',
    semester_id: '',
    target_batch: '',
    target_semester: '' as number | '',
    student_id_number: '',
    password: '',
    confirm_password: '',
    accept_terms: false,
  });

  const [institutions, setInstitutions] = useState<SelectOption[]>(FALLBACK_INSTITUTIONS);
  const [departments, setDepartments] = useState<SelectOption[]>(STANDARD_DEPARTMENTS);
  const [programmes, setProgrammes] = useState<ProgrammeOption[]>([]);
  const [academicYears, setAcademicYears] = useState<SelectOption[]>([]);
  const [semesters, setSemesters] = useState<SelectOption[]>([]);

  const [loadingProgs, setLoadingProgs] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isEmailUserEdited, setIsEmailUserEdited] = useState(false);

  const handleAutoGenerateEmail = (nameOverride?: string) => {
    const targetName = nameOverride !== undefined ? nameOverride : formData.full_name;
    if (!targetName.trim()) return;

    const cleanName = targetName
      .trim()
      .toLowerCase()
      .replace(/^(dr|prof|mr|mrs|ms|er)\.?\s+/i, '')
      .replace(/[^a-z0-9]/g, '.')
      .replace(/\.+/g, '.')
      .replace(/^\.|\.$/g, '');

    if (!cleanName) return;

    setFormData((prev) => ({
      ...prev,
      email: `${cleanName}@gmail.com`,
    }));
  };

  // Fetch Institutions on mount
  useEffect(() => {
    fetch('/api/v1/public/institutions')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((i: any) => ({
            id: i.id,
            name: i.name,
            code: i.code,
          }));
          setInstitutions(formatted);
        }
      })
      .catch(() => setInstitutions(FALLBACK_INSTITUTIONS));
  }, []);

  // Fetch Departments when Institution changes & Reset Child selections
  useEffect(() => {
    if (!formData.institution_id) {
      setDepartments(STANDARD_DEPARTMENTS);
      setProgrammes([]);
      setAcademicYears([]);
      setSemesters([]);
      return;
    }
    fetch(`/api/v1/public/institutions/${formData.institution_id}/departments`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            code: d.code,
          }));
          setDepartments(formatted);
        } else {
          setDepartments(STANDARD_DEPARTMENTS);
        }
      })
      .catch(() => setDepartments(STANDARD_DEPARTMENTS));
  }, [formData.institution_id]);

  // Fetch Active Programmes when Department changes & Reset Child selections
  useEffect(() => {
    if (!formData.department_id) {
      setProgrammes([]);
      setAcademicYears([]);
      setSemesters([]);
      return;
    }

    const isDeptUuid = formData.department_id.length > 20;
    const isInstUuid = Boolean(formData.institution_id && formData.institution_id.length > 20);

    if (!isDeptUuid) {
      setProgrammes([]);
      return;
    }

    setLoadingProgs(true);
    let fetchUrl = `/api/v1/public/departments/${formData.department_id}/programmes`;
    if (isInstUuid && isDeptUuid) {
      fetchUrl = `/api/v1/public/institutions/${formData.institution_id}/departments/${formData.department_id}/programmes`;
    }

    fetch(fetchUrl)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProgrammes(data);
        } else {
          setProgrammes([]);
        }
      })
      .catch(() => setProgrammes([]))
      .finally(() => setLoadingProgs(false));
  }, [formData.institution_id, formData.department_id]);

  // Fetch Academic Years & Semesters when Programme changes
  useEffect(() => {
    if (!formData.programme_id || formData.programme_id.length < 20) {
      setAcademicYears([]);
      setSemesters([]);
      return;
    }

    fetch(`/api/v1/public/programmes/${formData.programme_id}/academic-years`)
      .then((res) => res.json())
      .then((data) => setAcademicYears(Array.isArray(data) ? data : []))
      .catch(() => setAcademicYears([]));

    fetch(`/api/v1/public/programmes/${formData.programme_id}/semesters`)
      .then((res) => res.json())
      .then((data) => setSemesters(Array.isArray(data) ? data : []))
      .catch(() => setSemesters([]));
  }, [formData.programme_id]);

  // Calculate Password Strength
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 10) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) score += 25;
    return score;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.accept_terms) {
      setErrorMsg('You must accept the terms and privacy policy.');
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setErrorMsg('Password and Confirm Password do not match.');
      return;
    }
    if (!formData.target_batch) {
      setErrorMsg('Please select your 4-Year Enrollment Batch Framework (Cohort).');
      return;
    }
    if (!formData.target_semester) {
      setErrorMsg('Please select your Current Semester Assignment.');
      return;
    }
    if (!isValidCohort(formData.target_batch, Number(formData.target_semester))) {
      setErrorMsg(`Invalid cohort alignment: Batch "${formData.target_batch}" cannot be paired with Semester ${formData.target_semester} under the 2026 Academic Anchor Matrix.`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/auth/register/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirm_password,
          full_name: formData.full_name,
          student_id_number: formData.student_id_number,
          institution_id: formData.institution_id.length > 20 ? formData.institution_id : undefined,
          department_id: formData.department_id.length > 20 ? formData.department_id : undefined,
          programme_id: formData.programme_id.length > 20 ? formData.programme_id : undefined,
          academic_year_id: formData.academic_year_id.length > 20 ? formData.academic_year_id : undefined,
          semester_id: formData.semester_id.length > 20 ? formData.semester_id : undefined,
          target_batch: formData.target_batch,
          target_semester: Number(formData.target_semester),
          preferred_language: formData.preferred_language,
          phone_number: formData.phone_number || undefined,
          accept_terms: formData.accept_terms,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.message || 'Registration failed');
      }

      router.push(`/register/success?role=STUDENT&email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during registration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Student Registration
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Fill out your personal, academic, and security details to create your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Personal Details */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-xs">
                1. Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({ ...prev, full_name: val }));
                      if (!isEmailUserEdited) {
                        handleAutoGenerateEmail(val);
                      }
                    }}
                    className="mt-1 w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                    placeholder="Alice Smith"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val.trim()) {
                        setIsEmailUserEdited(false);
                      } else {
                        setIsEmailUserEdited(true);
                      }
                      setFormData((prev) => ({ ...prev, email: val }));
                    }}
                    className="mt-1 w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                    placeholder="madhumitha@gmail.com"
                  />
                  {!isEmailUserEdited && formData.email && (
                    <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 mt-1 block">
                      ✨ Auto-generated from name
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Academic Details */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                2. Academic Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Registration / Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.student_id_number}
                    onChange={(e) => setFormData({ ...formData, student_id_number: e.target.value })}
                    className="mt-1 w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100"
                    placeholder="STU-2024-001"
                  />
                </div>

                {/* Institution Combobox Search */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institution (Search 50+ Colleges or Custom)
                  </label>
                  <Combobox
                    options={institutions}
                    value={formData.institution_id || formData.custom_institution}
                    onChange={(val, isCustom) => {
                      if (isCustom) {
                        setFormData({
                          ...formData,
                          institution_id: '',
                          custom_institution: val,
                          department_id: '',
                          programme_id: '',
                          academic_year_id: '',
                          semester_id: '',
                        });
                      } else {
                        setFormData({
                          ...formData,
                          institution_id: val,
                          custom_institution: '',
                          department_id: '',
                          programme_id: '',
                          academic_year_id: '',
                          semester_id: '',
                        });
                      }
                    }}
                    placeholder="Search 50+ Institutions..."
                    searchPlaceholder="Filter by name or code (e.g., IIT, NIT, Anna)..."
                    customPlaceholder="Enter your institution name..."
                  />
                </div>

                {/* Department Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Department</label>
                  <select
                    value={formData.department_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        department_id: e.target.value,
                        programme_id: '',
                        academic_year_id: '',
                        semester_id: '',
                      })
                    }
                    className="mt-1 w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Select Department (ECE, EEE, CSE, AIDS, etc.)...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.code ? `(${d.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Programme Dropdown (Strictly Active Programmes from Admin) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Degree Programme *
                  </label>
                  <select
                    id="select-student-programme"
                    disabled={!formData.department_id || loadingProgs}
                    value={formData.programme_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        programme_id: e.target.value,
                        academic_year_id: '',
                        semester_id: '',
                      })
                    }
                    className="mt-1 w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 disabled:opacity-50 font-medium"
                  >
                    <option value="">
                      {loadingProgs
                        ? 'Loading active programmes...'
                        : programmes.length === 0
                          ? 'No active programmes'
                          : 'Select Active Programme...'}
                    </option>
                    {programmes.map((p) => {
                      const pName = p.name || p.programme_name;
                      const pCode = p.code || p.programme_code;
                      return (
                        <option key={p.id} value={p.id}>
                          {pName} — {pCode}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Notice when no active programmes exist for selected department */}
              {formData.department_id && !loadingProgs && programmes.length === 0 && (
                <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Your programme is not currently available. Please contact the platform administrator.</span>
                </div>
              )}

              {/* 2026 Academic Anchor Matrix: Cascading Batch & Semester Targeting */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    2026 Academic Anchor Matrix • Cohort Assignment
                  </span>
                  {TARGET_COHORTS.find((c) => c.batch === formData.target_batch) && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {TARGET_COHORTS.find((c) => c.batch === formData.target_batch)?.yearLabel}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 4-Year Enrollment Batch Framework */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Enrollment Batch Framework (Target Batch) *
                    </label>
                    <select
                      id="select-student-batch"
                      required
                      value={formData.target_batch}
                      onChange={(e) => {
                        const newBatch = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          target_batch: newBatch,
                          target_semester: '', // Reset semester to enforce alignment
                        }));
                      }}
                      className="mt-1 w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Select 4-Year Batch Framework...</option>
                      {TARGET_COHORTS.map((cohort) => (
                        <option key={cohort.batch} value={cohort.batch}>
                          {cohort.batchLabel}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Defines your 4-year engineering cohort graduation track.
                    </p>
                  </div>

                  {/* Dependent Target Semester */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Current Semester Assignment *
                    </label>
                    <select
                      id="select-student-semester"
                      required
                      disabled={!formData.target_batch}
                      value={formData.target_semester}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          target_semester: e.target.value ? Number(e.target.value) : '',
                        }));
                      }}
                      className="mt-1 w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {!formData.target_batch ? (
                        <option value="">Select Batch First to Unlock Semesters</option>
                      ) : (
                        <>
                          <option value="">Select Current Semester...</option>
                          {getSemestersForBatch(formData.target_batch).map((s) => (
                            <option key={s.number} value={s.number}>
                              {s.label}
                            </option>
                          ))}
                        </>
                      )}
                    </select>

                    {!formData.target_batch ? (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                        ⚠️ Please choose an Enrollment Batch first to reveal matching semesters.
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                        ✓ Strictly displaying matching Odd/Even semesters for {formData.target_batch}.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Account Security */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-xs">
                3. Account Security
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                  />
                  {formData.password && (
                    <div className="mt-1">
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${passwordStrength <= 25 ? 'bg-rose-500' : passwordStrength <= 75 ? 'bg-amber-500' : 'bg-indigo-500'
                            }`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Strength: {passwordStrength <= 25 ? 'Weak' : passwordStrength <= 75 ? 'Medium' : 'Strong'}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Confirm Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    className="mt-1 w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="showPassword" className="text-xs text-slate-600 dark:text-slate-400">Show Password</label>
              </div>
            </div>

            {/* Consent */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="accept_terms"
                  required
                  checked={formData.accept_terms}
                  onChange={(e) => setFormData({ ...formData, accept_terms: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-600"
                />
                <label htmlFor="accept_terms" className="text-xs text-slate-600 dark:text-slate-400">
                  I accept the platform <Link href="/privacy" className="text-indigo-600 underline">Privacy Policy</Link> and Terms of Service.
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-lg transition-colors"
              >
                {submitting ? 'Creating Account...' : 'Complete Student Registration →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
