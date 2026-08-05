'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Combobox } from '@/components/ui/combobox';

interface SelectOption {
  id: string;
  name: string;
  code?: string;
}

const FALLBACK_INSTITUTIONS: SelectOption[] = [
  { id: 'AIT', name: 'Apex Institute of Technology', code: 'AIT' },
  { id: 'IITM', name: 'Indian Institute of Technology Madras', code: 'IITM' },
  { id: 'IITB', name: 'Indian Institute of Technology Bombay', code: 'IITB' },
  { id: 'IITD', name: 'Indian Institute of Technology Delhi', code: 'IITD' },
  { id: 'IITKGP', name: 'Indian Institute of Technology Kharagpur', code: 'IITKGP' },
  { id: 'IITK', name: 'Indian Institute of Technology Kanpur', code: 'IITK' },
  { id: 'IITR', name: 'Indian Institute of Technology Roorkee', code: 'IITR' },
  { id: 'IITG', name: 'Indian Institute of Technology Guwahati', code: 'IITG' },
  { id: 'IITH', name: 'Indian Institute of Technology Hyderabad', code: 'IITH' },
  { id: 'IISC', name: 'Indian Institute of Science Bangalore', code: 'IISC' },
  { id: 'NITT', name: 'National Institute of Technology Tiruchirappalli', code: 'NITT' },
  { id: 'NITK', name: 'National Institute of Technology Surathkal', code: 'NITK' },
  { id: 'NITW', name: 'National Institute of Technology Warangal', code: 'NITW' },
  { id: 'NITC', name: 'National Institute of Technology Calicut', code: 'NITC' },
  { id: 'NITR', name: 'National Institute of Technology Rourkela', code: 'NITR' },
  { id: 'AU', name: 'Anna University Chennai', code: 'AU' },
  { id: 'BITS', name: 'BITS Pilani', code: 'BITS' },
  { id: 'VIT', name: 'Vellore Institute of Technology', code: 'VIT' },
  { id: 'SRM', name: 'SRM Institute of Science and Technology', code: 'SRM' },
  { id: 'PSGTECH', name: 'PSG College of Technology Coimbatore', code: 'PSGTECH' },
  { id: 'AMRITA', name: 'Amrita Vishwa Vidyapeetham', code: 'AMRITA' },
  { id: 'SSN', name: 'SSN College of Engineering', code: 'SSN' },
  { id: 'RVCE', name: 'RV College of Engineering Bangalore', code: 'RVCE' },
  { id: 'PESU', name: 'PES University Bangalore', code: 'PESU' },
  { id: 'BMSCE', name: 'BMS College of Engineering', code: 'BMSCE' },
  { id: 'MSRIT', name: 'MSRIT Ramaiah Institute of Technology', code: 'MSRIT' },
  { id: 'MIT-M', name: 'Manipal Institute of Technology', code: 'MIT-M' },
  { id: 'TIET', name: 'Thapar Institute of Engineering & Technology', code: 'TIET' },
  { id: 'CIT', name: 'Coimbatore Institute of Technology', code: 'CIT' },
  { id: 'TCE', name: 'Thiagarajar College of Engineering Madurai', code: 'TCE' },
  { id: 'KCT', name: 'Kumaraguru College of Technology', code: 'KCT' },
  { id: 'SKCET', name: 'Sri Krishna College of Engineering and Technology', code: 'SKCET' },
  { id: 'REC', name: 'Rajalakshmi Engineering College', code: 'REC' },
  { id: 'KEC', name: 'Kongu Engineering College', code: 'KEC' },
  { id: 'VELTECH', name: 'Veltech Rangarajan Dr. Sagunthala R&D Institute', code: 'VELTECH' },
  { id: 'SASTRA', name: 'SASTRA Deemed University', code: 'SASTRA' },
  { id: 'KIIT', name: 'Kalinga Institute of Industrial Technology', code: 'KIIT' },
  { id: 'SOA', name: "Siksha 'O' Anusandhan", code: 'SOA' },
  { id: 'DTU', name: 'Delhi Technological University', code: 'DTU' },
  { id: 'NSUT', name: 'Netaji Subhas University of Technology', code: 'NSUT' },
  { id: 'IIITH', name: 'International Institute of Information Technology Hyderabad', code: 'IIITH' },
  { id: 'IIITB', name: 'International Institute of Information Technology Bangalore', code: 'IIITB' },
  { id: 'VJTI', name: 'Veermata Jijabai Technological Institute Mumbai', code: 'VJTI' },
  { id: 'COEP', name: 'College of Engineering Pune', code: 'COEP' },
  { id: 'JU', name: 'Jadavpur University Kolkata', code: 'JU' },
  { id: 'IIEST', name: 'Indian Institute of Engineering Science and Technology Shibpur', code: 'IIEST' },
  { id: 'MIT-US', name: 'Massachusetts Institute of Technology', code: 'MIT-US' },
  { id: 'STANFORD', name: 'Stanford University', code: 'STANFORD' },
  { id: 'UCB', name: 'University of California Berkeley', code: 'UCB' },
  { id: 'CMU', name: 'Carnegie Mellon University', code: 'CMU' },
  { id: 'OXFORD', name: 'University of Oxford', code: 'OXFORD' },
  { id: 'CAMBRIDGE', name: 'University of Cambridge', code: 'CAMBRIDGE' },
  { id: 'NUS', name: 'National University of Singapore', code: 'NUS' },
  { id: 'NTU', name: 'Nanyang Technological University', code: 'NTU' },
];

const STANDARD_DESIGNATIONS = [
  'Assistant Professor',
  'Assistant Professor (Senior Grade)',
  'Assistant Professor (Selection Grade)',
  'Associate Professor',
  'Professor',
  'Senior Professor',
  'Head of Department (HOD)',
  'Dean / Director',
  'Vice Chancellor / Principal',
  'Adjunct Professor',
  'Visiting Professor',
  'Research Scholar / Fellow',
  'Lecturer / Instructor',
  'Teaching Assistant (TA)',
  'OTHER',
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

export default function FacultyRegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    employee_id: '',
    designation: '',
    custom_designation: '',
    phone_number: '',
    institution_id: '',
    custom_institution: '',
    department_id: '',
    custom_department: '',
    password: '',
    confirm_password: '',
    accept_terms: false,
  });

  const [institutions, setInstitutions] = useState<SelectOption[]>(FALLBACK_INSTITUTIONS);
  const [departments, setDepartments] = useState<SelectOption[]>(STANDARD_DEPARTMENTS);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isEmailUserEdited, setIsEmailUserEdited] = useState(false);

  const handleAutoGenerate = async (nameOverride?: string) => {
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

    const domain = 'gmail.com';
    const generatedEmail = `${cleanName}@${domain}`;

    let nextId = formData.employee_id;
    try {
      const res = await fetch('/api/v1/public/next-emp-id');
      const data = await res.json();
      if (data && data.next_emp_id) {
        nextId = data.next_emp_id;
      }
    } catch (e) {
      if (!nextId) nextId = 'EMP-1001';
    }

    setIsEmailUserEdited(false);
    setFormData((prev) => ({
      ...prev,
      email: generatedEmail,
      employee_id: nextId || 'EMP-1001',
    }));
  };

  // Auto-fetch next sequential Employee ID on page load
  useEffect(() => {
    fetch('/api/v1/public/next-emp-id')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.next_emp_id) {
          setFormData((prev) => ({
            ...prev,
            employee_id: prev.employee_id || data.next_emp_id,
          }));
        }
      })
      .catch(() => {
        setFormData((prev) => ({
          ...prev,
          employee_id: prev.employee_id || 'EMP-1001',
        }));
      });
  }, []);

  // Auto-generate Institutional Email when Full Name or Institution changes
  useEffect(() => {
    if (isEmailUserEdited) return;
    if (!formData.full_name.trim()) return;
    handleAutoGenerate();
  }, [formData.full_name, formData.institution_id, institutions]);


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

  useEffect(() => {
    if (!formData.institution_id) {
      setDepartments(STANDARD_DEPARTMENTS);
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

    const finalDesignation =
      formData.designation === 'OTHER' ? formData.custom_designation : formData.designation;

    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/auth/register/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirm_password,
          full_name: formData.full_name,
          employee_id: formData.employee_id,
          designation: finalDesignation || undefined,
          institution_id: formData.institution_id.length > 20 ? formData.institution_id : undefined,
          department_id: formData.department_id.length > 20 ? formData.department_id : undefined,
          phone_number: formData.phone_number || undefined,
          accept_terms: formData.accept_terms,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.message || 'Faculty registration failed');
      }

      router.push(`/register/success?role=FACULTY&email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during faculty registration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Faculty Registration
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Submit your employment credentials for institutional verification and administrator approval.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
            {/* Section 1: Personal Details */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-xs">
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
                      setFormData({ ...formData, full_name: val });
                      if (!isEmailUserEdited) {
                        handleAutoGenerate(val);
                      }
                    }}
                    onBlur={() => handleAutoGenerate()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAutoGenerate();
                      }
                    }}
                    className="mt-1 w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                    placeholder="e.g. Sudharaajan (Press Enter to generate)"
                  />
                  <button
                    type="button"
                    onClick={() => handleAutoGenerate()}
                    className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline block"
                  >
                    ⚡ Press Enter or Click to Auto-Generate Email & EMP ID
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    name="faculty_institutional_email"
                    autoComplete="off"
                    value={formData.email}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val.trim()) {
                        setIsEmailUserEdited(false);
                      } else {
                        setIsEmailUserEdited(true);
                      }
                      setFormData({ ...formData, email: val });
                    }}
                    className="mt-1 w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                    placeholder="madhumitha@gmail.com"
                  />
                  {!isEmailUserEdited && formData.email && (
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 block">
                      ✨ Auto-generated from name
                    </span>
                  )}
                </div>
              </div>
            </div>


            {/* Section 2: Employment Details */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-xs">
                2. Employment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Faculty / Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="mt-1 w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100"
                    placeholder="EMP-1001"
                  />
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 block">
                    ⚡ Auto-assigned next joining ID
                  </span>
                </div>


                {/* Designation Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Designation *</label>
                  <select
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="mt-1 w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Select Designation...</option>
                    {STANDARD_DESIGNATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d === 'OTHER' ? 'Other (Enter Custom Designation)' : d}
                      </option>
                    ))}
                  </select>
                  {formData.designation === 'OTHER' && (
                    <input
                      type="text"
                      required
                      value={formData.custom_designation}
                      onChange={(e) => setFormData({ ...formData, custom_designation: e.target.value })}
                      placeholder="Type custom designation..."
                      className="mt-2 w-full p-2.5 rounded-md border border-emerald-500 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                    />
                  )}
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
                        });
                      } else {
                        setFormData({
                          ...formData,
                          institution_id: val,
                          custom_institution: '',
                          department_id: '',
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
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="mt-1 w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Select Department (ECE, EEE, CSE, AIDS, etc.)...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.code ? `(${d.code})` : ''}
                      </option>
                    ))}
                  </select>
                  {formData.department_id === 'OTHER' && (
                    <input
                      type="text"
                      required
                      value={formData.custom_department}
                      onChange={(e) => setFormData({ ...formData, custom_department: e.target.value })}
                      placeholder="Type custom department name..."
                      className="mt-2 w-full p-2.5 rounded-md border border-emerald-500 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Account Security */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-xs">
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
                          className={`h-1.5 rounded-full transition-all ${
                            passwordStrength <= 25 ? 'bg-rose-500' : passwordStrength <= 75 ? 'bg-amber-500' : 'bg-emerald-500'
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
                  className="rounded text-emerald-600"
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
                  className="mt-0.5 rounded text-emerald-600"
                />
                <label htmlFor="accept_terms" className="text-xs text-slate-600 dark:text-slate-400">
                  I accept the platform <Link href="/privacy" className="text-emerald-600 underline">Privacy Policy</Link> and Terms of Service.
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-lg transition-colors"
              >
                {submitting ? 'Submitting Application...' : 'Submit Faculty Application →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
