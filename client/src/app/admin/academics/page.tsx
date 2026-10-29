'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Search, Plus, BookOpen, Layers, GraduationCap, Check, AlertTriangle, X,
  Eye, Edit3, Power, Users, Filter, CheckCircle2, ShieldAlert, Lock, Info, Building2, ChevronDown, Sparkles,
  Target, Trophy
} from 'lucide-react';
import { ProgrammeGeneratorWizard } from '@/components/admin/ProgrammeGeneratorWizard';
import { COMappingVisualizer } from '@/components/admin/COMappingVisualizer';
import { ProgrammeComparisonTool } from '@/components/admin/ProgrammeComparisonTool';

interface Programme {
  id: string;
  institution_id: string;
  department_id: string;
  name: string;
  programme_name?: string;
  code: string;
  programme_code?: string;
  degree_type: string;
  duration_years: number;
  total_semesters: number;
  regulation_name?: string;
  description?: string;
  is_active: boolean;
  institution_name?: string;
  department_name?: string;
  enrolled_students_count: number;
  created_at: string;
}

interface ProgrammeTemplate {
  template_id: string;
  programme_name: string;
  programme_code: string;
  alternative_codes: string[];
  degree_type: string;
  duration_years: number;
  total_semesters: number;
  related_department_keywords: string[];
  description?: string;
}

interface Institution {
  id: string;
  name: string;
  code: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  institution_id: string;
}

interface EnrolledStudent {
  id: string;
  student_id_number: string;
  full_name: string;
  email: string;
}

// 12 Standard Degree Type Options
const DEGREE_TYPE_OPTIONS = [
  'Bachelor of Engineering',
  'Bachelor of Technology',
  'Master of Engineering',
  'Master of Technology',
  'Bachelor of Science',
  'Master of Science',
  'Bachelor of Computer Applications',
  'Master of Computer Applications',
  'Bachelor of Business Administration',
  'Master of Business Administration',
  'Diploma',
  'Other / Custom',
];

// Default Mappings for Duration and Semesters
const DEGREE_CONFIG_MAP: Record<string, { duration: number; semesters: number }> = {
  'Bachelor of Engineering': { duration: 4, semesters: 8 },
  'Bachelor of Technology': { duration: 4, semesters: 8 },
  'Master of Engineering': { duration: 2, semesters: 4 },
  'Master of Technology': { duration: 2, semesters: 4 },
  'Bachelor of Science': { duration: 3, semesters: 6 },
  'Master of Science': { duration: 2, semesters: 4 },
  'Bachelor of Computer Applications': { duration: 3, semesters: 6 },
  'Master of Computer Applications': { duration: 2, semesters: 4 },
  'Bachelor of Business Administration': { duration: 3, semesters: 6 },
  'Master of Business Administration': { duration: 2, semesters: 4 },
  'Diploma': { duration: 3, semesters: 6 },
};

// Regulation Options
const REGULATION_OPTIONS = [
  'Regulation 2021',
  'Regulation 2022',
  'Regulation 2023',
  'Regulation 2024',
  'Regulation 2025',
  'Regulation 2026',
  'Other / Custom',
];

export default function AdminAcademicsPage() {
  const queryClient = useQueryClient();

  const [academicSection, setAcademicSection] = useState<'catalog' | 'co-mapping' | 'comparison'>('catalog');

  // Directory Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstFilter, setSelectedInstFilter] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  // Modal & Step States
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('custom');

  // Combobox dropdown states
  const [isProgNameOpen, setIsProgNameOpen] = useState(false);
  const [progNameSearch, setProgNameSearch] = useState('');
  const [isProgCodeOpen, setIsProgCodeOpen] = useState(false);
  const [progCodeSearch, setProgCodeSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Manual code switch confirmation modal state
  const [showCodeConfirmDialog, setShowCodeConfirmDialog] = useState<{
    newTemplateId: string;
    newCode: string;
  } | null>(null);

  // Refs for closing dropdowns on click outside
  const progNameRef = React.useRef<HTMLDivElement>(null);
  const progCodeRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (progNameRef.current && !progNameRef.current.contains(event.target as Node)) {
        setIsProgNameOpen(false);
      }
      if (progCodeRef.current && !progCodeRef.current.contains(event.target as Node)) {
        setIsProgCodeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    institution_id: '',
    department_id: '',
    name: '',
    code: '',
    degree_type: 'Bachelor of Technology',
    custom_degree_type: '',
    duration_years: 4,
    total_semesters: 8,
    regulation_name: 'Regulation 2026',
    custom_regulation: '',
    description: '',
    is_active: true,
    auto_create_semesters: true,
    confirm_unusual_name: false,
  });

  const [editProgrammeId, setEditProgrammeId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewProgramme, setViewProgramme] = useState<Programme | null>(null);
  const [deactivateProg, setDeactivateProg] = useState<Programme | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Queries
  const { data: programmes = [], isLoading: loadingProg } = useQuery<Programme[]>({
    queryKey: ['admin-programmes', selectedInstFilter, selectedDeptFilter, selectedStatusFilter],
    queryFn: async () => {
      let url = '/api/v1/admin/programmes?';
      if (selectedInstFilter) url += `institution_id=${selectedInstFilter}&`;
      if (selectedDeptFilter) url += `department_id=${selectedDeptFilter}&`;
      if (selectedStatusFilter !== '') url += `is_active=${selectedStatusFilter}&`;
      const res = await fetch(url);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: templates = [] } = useQuery<ProgrammeTemplate[]>({
    queryKey: ['admin-programme-templates'],
    queryFn: async () => {
      const res = await fetch('/api/v1/admin/programmes/templates');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: institutions = [] } = useQuery<Institution[]>({
    queryKey: ['public-institutions'],
    queryFn: async () => {
      const res = await fetch('/api/v1/public/institutions');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['public-departments', formData.institution_id],
    enabled: !!formData.institution_id,
    queryFn: async () => {
      const res = await fetch(`/api/v1/public/institutions/${formData.institution_id}/departments`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: studentsList = [], isLoading: loadingStudents } = useQuery<EnrolledStudent[]>({
    queryKey: ['programme-students', viewProgramme?.id],
    enabled: !!viewProgramme,
    queryFn: async () => {
      const res = await fetch(`/api/v1/admin/programmes/${viewProgramme?.id}/students`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Auto-select Institution if only 1 exists
  useEffect(() => {
    if (institutions.length === 1 && !formData.institution_id) {
      setFormData((prev) => ({ ...prev, institution_id: institutions[0].id }));
    }
  }, [institutions, formData.institution_id]);

  // Selected Department Object
  const selectedDeptObj = departments.find((d) => d.id === formData.department_id);

  // Search matching filter
  const matchesSearch = (t: ProgrammeTemplate, search: string) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      t.programme_name.toLowerCase().includes(term) ||
      t.programme_code.toLowerCase().includes(term) ||
      t.alternative_codes.some(c => c.toLowerCase().includes(term)) ||
      t.related_department_keywords.some(k => k.toLowerCase().includes(term))
    );
  };

  // Template Search Filter
  const filteredTemplates = templates.filter((t) => matchesSearch(t, templateSearch));

  const isTemplateRelatedToDept = (template: ProgrammeTemplate, deptCode: string, deptName: string) => {
    const code = deptCode.toUpperCase();
    const name = deptName.toUpperCase();
    
    // Explicit lists
    if (code === 'CSE' || name.includes('COMPUTER SCIENCE') || name.includes('COMPUTING')) {
      const cseRelated = [
        'B.E. Computer Science and Engineering',
        'B.Tech. Computer Science and Engineering',
        'B.Tech. Artificial Intelligence and Data Science',
        'B.Tech. Artificial Intelligence and Machine Learning',
        'B.Tech. Computer Science and Business Systems',
        'B.Tech. Information Technology',
        'M.E. Computer Science and Engineering',
        'M.Tech. Computer Science and Engineering',
        'Master of Computer Applications'
      ];
      if (cseRelated.includes(template.programme_name)) return true;
    }
    
    if (code === 'ECE' || name.includes('ELECTRONICS') || name.includes('COMMUNICATION')) {
      const eceRelated = [
        'B.E. Electronics and Communication Engineering',
        'B.E. Biomedical Engineering',
        'M.E. Communication Systems',
        'M.Tech. Embedded Systems',
        'B.E. Electrical and Electronics Engineering'
      ];
      if (eceRelated.includes(template.programme_name)) return true;
    }
    
    // Fallback: check related_department_keywords
    return template.related_department_keywords.some(kw => {
      const kwUpper = kw.toUpperCase();
      return code.includes(kwUpper) || name.includes(kwUpper) || kwUpper.includes(code);
    });
  };

  const getFilteredAndOrderedTemplates = () => {
    const term = progNameSearch.toLowerCase().trim();
    const allFiltered = templates.filter(t => matchesSearch(t, term));
    
    if (!selectedDeptObj) {
      return { related: [], unrelated: allFiltered };
    }
    const deptCode = selectedDeptObj.code || '';
    const deptName = selectedDeptObj.name || '';
    
    const related: ProgrammeTemplate[] = [];
    const unrelated: ProgrammeTemplate[] = [];
    
    allFiltered.forEach(t => {
      if (isTemplateRelatedToDept(t, deptCode, deptName)) {
        related.push(t);
      } else {
        unrelated.push(t);
      }
    });
    
    return { related, unrelated };
  };

  // Helper to sync Degree Type & Duration/Semesters
  const applyDegreeTypeMapping = (degType: string) => {
    if (DEGREE_CONFIG_MAP[degType]) {
      const cfg = DEGREE_CONFIG_MAP[degType];
      return {
        duration_years: cfg.duration,
        total_semesters: cfg.semesters,
      };
    }
    return null;
  };

  // Step 1 Select Template Handler
  const handleSelectTemplateInStep1 = (template: ProgrammeTemplate | null) => {
    if (template) {
      setSelectedTemplateId(template.template_id);
      const mappedConfig = applyDegreeTypeMapping(template.degree_type);
      setFormData((prev) => ({
        ...prev,
        name: template.programme_name,
        code: template.programme_code.toUpperCase(),
        degree_type: template.degree_type,
        duration_years: mappedConfig ? mappedConfig.duration_years : template.duration_years,
        total_semesters: mappedConfig ? mappedConfig.total_semesters : template.total_semesters,
        description: template.description || '',
        confirm_unusual_name: false,
      }));
    } else {
      setSelectedTemplateId('custom');
      setFormData((prev) => ({
        ...prev,
        name: '',
        code: '',
        degree_type: 'Other / Custom',
        custom_degree_type: '',
        duration_years: 4,
        total_semesters: 8,
        description: '',
        confirm_unusual_name: false,
      }));
    }
    setModalStep(2);
  };

  // Step 2 Programme Name Dropdown Change Handler
  const handleStep2ProgrammeNameSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (templateId === 'custom') {
      setFormData((prev) => ({
        ...prev,
        name: '',
        code: '',
        degree_type: 'Other / Custom',
        custom_degree_type: '',
        confirm_unusual_name: false,
      }));
      return;
    }

    const t = templates.find((item) => item.template_id === templateId);
    if (t) {
      const mappedConfig = applyDegreeTypeMapping(t.degree_type);
      setFormData((prev) => ({
        ...prev,
        name: t.programme_name,
        code: t.programme_code.toUpperCase(),
        degree_type: t.degree_type,
        duration_years: mappedConfig ? mappedConfig.duration_years : t.duration_years,
        total_semesters: mappedConfig ? mappedConfig.total_semesters : t.total_semesters,
        description: t.description || '',
        confirm_unusual_name: false,
      }));
    }
  };

  // Manual Code Change Handler to avoid silent mismatch
  const handleManualCodeChange = (newCodeRaw: string) => {
    const cleanedCode = newCodeRaw.toUpperCase().trim().replace(/[^A-Z0-9\-]/g, '');
    
    // Check if the cleanedCode matches another standard template's default code or one of its alternative_codes
    const matchingTemplate = templates.find(t => 
      t.programme_code.toUpperCase() === cleanedCode || 
      t.alternative_codes.some(ac => ac.toUpperCase() === cleanedCode)
    );
    
    if (matchingTemplate && matchingTemplate.template_id !== selectedTemplateId) {
      setShowCodeConfirmDialog({
        newTemplateId: matchingTemplate.template_id,
        newCode: cleanedCode,
      });
    } else {
      setFormData(prev => ({
        ...prev,
        code: cleanedCode
      }));
    }
  };

  const handleConfirmCodeSwitch = () => {
    if (showCodeConfirmDialog) {
      handleStep2ProgrammeNameSelect(showCodeConfirmDialog.newTemplateId);
      setFormData(prev => ({
        ...prev,
        code: showCodeConfirmDialog.newCode
      }));
      setShowCodeConfirmDialog(null);
    }
  };

  // Get suggested codes for the selected template
  const getCodeSuggestions = () => {
    const currentTemplate = templates.find(t => t.template_id === selectedTemplateId);
    if (!currentTemplate) return [];
    const suggestions = [
      currentTemplate.programme_code,
      ...currentTemplate.alternative_codes.filter(ac => ac !== currentTemplate.programme_code)
    ];
    return suggestions.map(s => s.toUpperCase());
  };

  // Step 2 Degree Type Select Handler
  const handleDegreeTypeChange = (newDegreeType: string) => {
    const mapped = applyDegreeTypeMapping(newDegreeType);
    if (mapped) {
      setFormData((prev) => ({
        ...prev,
        degree_type: newDegreeType,
        duration_years: mapped.duration_years,
        total_semesters: mapped.total_semesters,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        degree_type: newDegreeType,
      }));
    }
  };

  // Is Current Form Standard Degree Type (Read-Only Duration & Semesters)
  const isStandardDegree = formData.degree_type !== 'Other / Custom' && DEGREE_CONFIG_MAP[formData.degree_type] !== undefined;

  // Interdisciplinary Warning
  const getInterdisciplinaryWarning = () => {
    if (!selectedDeptObj || !formData.code) return null;
    const deptCode = selectedDeptObj.code.toUpperCase();
    const progCode = formData.code.toUpperCase();

    const isNonMatching =
      (progCode.includes('CSE') && !['CSE', 'AIDS', 'AIML', 'CSBS', 'IT'].includes(deptCode)) ||
      (progCode.includes('ECE') && !['ECE', 'EEE', 'EI', 'ROBOTICS'].includes(deptCode)) ||
      (progCode.includes('MECH') && !['MECH', 'AUTO', 'AERO', 'ROBOTICS'].includes(deptCode)) ||
      (progCode.includes('CIVIL') && deptCode !== 'CIVIL');

    if (isNonMatching) {
      return `Notice: Programme '${formData.code}' may be interdisciplinary relative to department '${selectedDeptObj.name}' (${deptCode}). You may confirm this assignment.`;
    }
    return null;
  };

  // Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.institution_id) {
      setFormError('Please select an Institution.');
      return;
    }
    if (!formData.department_id) {
      setFormError('Please select a Department.');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('Programme Name is required.');
      return;
    }
    if (!formData.code.trim()) {
      setFormError('Programme Code is required.');
      return;
    }

    const finalDegreeType =
      formData.degree_type === 'Other / Custom'
        ? formData.custom_degree_type.trim() || 'Custom Degree'
        : formData.degree_type;

    const finalRegulation =
      formData.regulation_name === 'Other / Custom'
        ? formData.custom_regulation.trim()
        : formData.regulation_name;

    try {
      const res = await fetch('/api/v1/admin/programmes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institution_id: formData.institution_id,
          department_id: formData.department_id,
          name: formData.name.trim(),
          programme_name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          programme_code: formData.code.trim().toUpperCase(),
          degree_type: finalDegreeType,
          duration_years: formData.duration_years,
          total_semesters: formData.total_semesters,
          regulation_name: finalRegulation || undefined,
          regulation: finalRegulation || undefined,
          description: formData.description || undefined,
          is_active: formData.is_active,
          auto_create_semesters: formData.auto_create_semesters,
          confirm_unusual_name: formData.confirm_unusual_name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errObj = new Error(data.message || data.detail || 'Failed to create programme') as any;
        errObj.code = data.code;
        throw errObj;
      }

      setSuccessMessage(`Programme '${data.code}' created successfully with ${data.total_semesters} semesters!`);
      setIsCreateModalOpen(false);
      setModalStep(1);
      queryClient.invalidateQueries({ queryKey: ['admin-programmes'] });
      queryClient.invalidateQueries({ queryKey: ['public-programmes'] });

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      if (err.code === 'SUBJECT_LIKE_NAME') {
        setFormError('SUBJECT_LIKE_NAME_WARNING');
      } else {
        setFormError(err.message || 'An error occurred while creating programme.');
      }
    }
  };

  // Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProgrammeId) return;
    setFormError(null);

    const finalDegreeType =
      formData.degree_type === 'Other / Custom'
        ? formData.custom_degree_type.trim() || 'Custom Degree'
        : formData.degree_type;

    const finalRegulation =
      formData.regulation_name === 'Other / Custom'
        ? formData.custom_regulation.trim()
        : formData.regulation_name;

    try {
      const res = await fetch(`/api/v1/admin/programmes/${editProgrammeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institution_id: formData.institution_id,
          department_id: formData.department_id,
          name: formData.name.trim(),
          programme_name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          programme_code: formData.code.trim().toUpperCase(),
          degree_type: finalDegreeType,
          duration_years: formData.duration_years,
          total_semesters: formData.total_semesters,
          regulation_name: finalRegulation || undefined,
          regulation: finalRegulation || undefined,
          description: formData.description,
          is_active: formData.is_active,
          confirm_unusual_name: formData.confirm_unusual_name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errObj = new Error(data.message || data.detail || 'Failed to update programme') as any;
        errObj.code = data.code;
        throw errObj;
      }

      setSuccessMessage(`Programme '${data.code}' updated successfully!`);
      setIsEditModalOpen(false);
      setEditProgrammeId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-programmes'] });
      queryClient.invalidateQueries({ queryKey: ['public-programmes'] });

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      if (err.code === 'SUBJECT_LIKE_NAME') {
        setFormError('SUBJECT_LIKE_NAME_WARNING');
      } else {
        setFormError(err.message || 'An error occurred while updating programme.');
      }
    }
  };

  // Toggle Activation
  const handleToggleActivation = async (prog: Programme) => {
    const endpoint = prog.is_active
      ? `/api/v1/admin/programmes/${prog.id}/deactivate`
      : `/api/v1/admin/programmes/${prog.id}/activate`;

    try {
      const res = await fetch(endpoint, { method: 'POST' });
      if (!res.ok) throw new Error('Status update failed');

      setSuccessMessage(
        `Programme '${prog.code}' ${prog.is_active ? 'deactivated' : 'activated'} successfully!`
      );
      setDeactivateProg(null);
      queryClient.invalidateQueries({ queryKey: ['admin-programmes'] });
      queryClient.invalidateQueries({ queryKey: ['public-programmes'] });

      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  // Open Edit Modal
  const openEditModal = (prog: Programme) => {
    setEditProgrammeId(prog.id);
    const isKnownDeg = DEGREE_TYPE_OPTIONS.includes(prog.degree_type);
    setFormData({
      institution_id: prog.institution_id,
      department_id: prog.department_id,
      name: prog.name,
      code: prog.code,
      degree_type: isKnownDeg ? prog.degree_type : 'Other / Custom',
      custom_degree_type: isKnownDeg ? '' : prog.degree_type,
      duration_years: prog.duration_years,
      total_semesters: prog.total_semesters,
      regulation_name: prog.regulation_name || 'Regulation 2026',
      custom_regulation: '',
      description: prog.description || '',
      is_active: prog.is_active,
      auto_create_semesters: false,
      confirm_unusual_name: false,
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  // Directory Filtered Records
  const filteredProgrammes = programmes.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term);
  });

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              Programme Management Console
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Configure degree programmes, manage academic curricula, auto-generate semester structures, and control student registration availability.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAIGenerator(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-lg shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              AI Programme Generator 3.0
            </Button>
            <Button
              id="btn-new-programme"
              onClick={() => {
                setModalStep(1);
                setSelectedTemplateId('custom');
                setFormError(null);
                setIsCreateModalOpen(true);
              }}
              disabled={institutions.length === 0}
              variant="outline"
              className="font-bold px-4 py-2.5 rounded-lg shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              + Manual Programme
            </Button>
          </div>
        </div>

        {/* Module Sub-division Tab Selector */}
        <div className="flex items-center gap-2 border-b pb-3">
          <button
            onClick={() => setAcademicSection('catalog')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              academicSection === 'catalog'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Degree Programmes & Catalog
          </button>
          <button
            onClick={() => setAcademicSection('co-mapping')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              academicSection === 'co-mapping'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Target className="w-4 h-4" />
            CO-PO Attainment Matrix
          </button>
          <button
            onClick={() => setAcademicSection('comparison')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              academicSection === 'comparison'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Institutional Comparison Tool
          </button>
        </div>

        {academicSection === 'catalog' && (
          <>
            {/* Global Notifications */}
        {successMessage && (
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Warning Banners for missing Institution */}
        {institutions.length === 0 && (
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>Create an institution before adding a programme.</span>
            </div>
            <a
              href="/admin/institutions"
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded"
            >
              + Create Institution →
            </a>
          </div>
        )}

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Configured Programmes
              </CardTitle>
              <BookOpen className="w-4 h-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {programmes.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Total degree curricula configured</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active in Student Form
              </CardTitle>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {programmes.filter((p) => p.is_active).length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Available for new student registration</p>
            </CardContent>
          </Card>

          <Card className="border-amber-100 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-slate-900 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Deactivated Programmes
              </CardTitle>
              <ShieldAlert className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {programmes.filter((p) => !p.is_active).length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Hidden from new registration</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter & Search Bar */}
        <Card className="p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or code (e.g. BE-ECE)..."
                className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <select
                value={selectedInstFilter}
                onChange={(e) => setSelectedInstFilter(e.target.value)}
                className="w-full py-2 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="">All Institutions</option>
                {institutions.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full py-2 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="">All Statuses</option>
                <option value="true">Active Only</option>
                <option value="false">Deactivated Only</option>
              </select>
            </div>

            <div className="flex justify-end items-center">
              <span className="text-xs font-semibold text-slate-500">
                Showing {filteredProgrammes.length} programmes
              </span>
            </div>
          </div>
        </Card>

        {/* Directory Data Table */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              Degree Programmes Directory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingProg ? (
              <div className="py-12 text-center text-slate-500 text-sm">Loading programmes directory...</div>
            ) : filteredProgrammes.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <p className="text-slate-500 text-sm">No degree programmes found matching criteria.</p>
                {institutions.length > 0 && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setModalStep(1);
                      setIsCreateModalOpen(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                  >
                    + Create First Programme
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300">
                  <thead className="text-[11px] uppercase bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">Code</th>
                      <th className="px-4 py-3.5">Programme Name</th>
                      <th className="px-4 py-3.5">Institution</th>
                      <th className="px-4 py-3.5">Department</th>
                      <th className="px-4 py-3.5">Degree Type</th>
                      <th className="px-4 py-3.5">Structure</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Enrolled</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredProgrammes.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                          {p.code}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                          {p.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {p.institution_name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {p.department_name || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {p.degree_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {p.duration_years} Years ({p.total_semesters} Semesters)
                        </td>
                        <td className="px-4 py-3">
                          {p.is_active ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 flex items-center gap-1 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              Deactivated
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-indigo-600 dark:text-indigo-400">
                          {p.enrolled_students_count} Students
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewProgramme(p)}
                              title="View Details"
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(p)}
                              title="Edit Programme"
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeactivateProg(p)}
                              title={p.is_active ? 'Deactivate Programme' : 'Activate Programme'}
                              className={`p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 ${
                                p.is_active ? 'text-amber-600' : 'text-emerald-600'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CREATE PROGRAMME MODAL */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-600" />
                    {modalStep === 1 ? 'Step 1: Select Programme Template' : 'Step 2: Programme Configuration'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {modalStep === 1
                      ? 'Choose from 15 pre-configured academic templates or enter a custom programme.'
                      : 'Verify institution, department, degree type, and semester generation rules.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {formError && (
                  <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {modalStep === 1 ? (
                  <div className="space-y-4">
                    {/* Search box */}
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                        placeholder="Search 15 programme templates by name or code..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 shadow-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                      {filteredTemplates.map((t) => (
                        <button
                          key={t.template_id}
                          type="button"
                          onClick={() => handleSelectTemplateInStep1(t)}
                          className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-left hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-sm transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                              {t.programme_code}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                              {t.degree_type}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                            {t.programme_name}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                            {t.description}
                          </p>
                        </button>
                      ))}

                      {/* Custom Option */}
                      <button
                        type="button"
                        onClick={() => handleSelectTemplateInStep1(null)}
                        className="p-3.5 rounded-lg border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 text-left hover:border-indigo-600 transition-all flex flex-col justify-center items-center text-center sm:col-span-2"
                      >
                        <Plus className="w-6 h-6 text-indigo-600 mb-1" />
                        <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                          Other / Custom Programme
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Enter custom programme name, code, degree type, and duration manually.
                        </p>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCreateSubmit} className="space-y-4">
                    {/* Interdisciplinary Warning */}
                    {getInterdisciplinaryWarning() && (
                      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 text-amber-900 dark:text-amber-300 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>{getInterdisciplinaryWarning()}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Institution */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Institution *
                        </label>
                        <select
                          required
                          value={formData.institution_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              institution_id: e.target.value,
                              department_id: '',
                            })
                          }
                          className="w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                        >
                          <option value="">Select Institution...</option>
                          {institutions.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.name} ({i.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Department */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Department *
                        </label>
                        <select
                          required
                          disabled={!formData.institution_id}
                          value={formData.department_id}
                          onChange={(e) =>
                            setFormData({ ...formData, department_id: e.target.value })
                          }
                          className="w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 disabled:opacity-50"
                        >
                          <option value="">
                            {!formData.institution_id
                              ? 'Select Institution First'
                              : departments.length === 0
                              ? 'No departments available'
                              : 'Select Department...'}
                          </option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Warning if institution has no departments */}
                      {formData.institution_id && departments.length === 0 && (
                        <div className="sm:col-span-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 text-amber-900 dark:text-amber-300 text-xs font-medium flex items-center justify-between">
                          <span>No departments are configured for this institution. Create a department before adding a programme.</span>
                          <a href="/admin/institutions" className="text-[11px] bg-amber-600 text-white font-bold px-2.5 py-1 rounded">
                            + Add Dept →
                          </a>
                        </div>
                      )}

                      {/* Programme Name (Searchable Combobox) */}
                      <div className="sm:col-span-2 relative" ref={progNameRef}>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Programme Name *
                        </label>
                        {selectedTemplateId !== 'custom' ? (
                          <div className="relative">
                            <button
                              id="select-programme-template-step2"
                              type="button"
                              onClick={() => {
                                setIsProgNameOpen(!isProgNameOpen);
                                setFocusedIndex(-1);
                              }}
                              className="w-full flex items-center justify-between p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs text-left shadow-sm hover:border-slate-400 dark:hover:border-slate-600 focus:outline-none"
                            >
                              <span className="truncate">
                                {(() => {
                                  const t = templates.find(item => item.template_id === selectedTemplateId);
                                  return t ? `${t.programme_name} — ${t.programme_code}` : 'Select Programme...';
                                })()}
                              </span>
                              <div className="flex items-center gap-1">
                                {selectedTemplateId && (
                                  <X
                                    className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStep2ProgrammeNameSelect('custom');
                                    }}
                                  />
                                )}
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              </div>
                            </button>
                            
                            {isProgNameOpen && (
                              <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl max-h-64 flex flex-col overflow-hidden">
                                <div className="p-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 sticky top-0 bg-white dark:bg-slate-800">
                                  <Search className="w-3.5 h-3.5 text-slate-400 ml-1 flex-shrink-0" />
                                  <input
                                    type="text"
                                    value={progNameSearch}
                                    onChange={(e) => {
                                      setProgNameSearch(e.target.value);
                                      setFocusedIndex(-1);
                                    }}
                                    placeholder="Search by name, abbreviation, code..."
                                    className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                                    autoFocus
                                  />
                                </div>
                                <div className="overflow-y-auto flex-1 divide-y divide-slate-50 dark:divide-slate-700/50">
                                  {(() => {
                                    const { related, unrelated } = getFilteredAndOrderedTemplates();
                                    const allOptions = [
                                      ...related.map(t => ({ type: 'related', t })),
                                      ...(related.length > 0 && unrelated.length > 0 ? [{ type: 'separator' }] : []),
                                      ...unrelated.map(t => ({ type: 'unrelated', t })),
                                      { type: 'custom' }
                                    ];
                                    
                                    if (allOptions.length === 1 && allOptions[0].type === 'custom' && progNameSearch) {
                                      return (
                                        <div className="p-3 text-xs text-slate-400 text-center">
                                          No matching programmes found
                                        </div>
                                      );
                                    }
                                    
                                    return allOptions.map((opt, idx) => {
                                      if (opt.type === 'separator') {
                                        return (
                                          <div key="separator" className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Other available programmes
                                          </div>
                                        );
                                      }
                                      if (opt.type === 'custom') {
                                        return (
                                          <button
                                            key="custom-opt"
                                            type="button"
                                            onClick={() => {
                                              handleStep2ProgrammeNameSelect('custom');
                                              setIsProgNameOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700/80 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-700"
                                          >
                                            <Plus className="w-3.5 h-3.5" />
                                            Other / Custom Programme
                                          </button>
                                        );
                                      }
                                      
                                      const t = (opt as any).t;
                                      const isSelected = selectedTemplateId === t.template_id;
                                      return (
                                        <button
                                          key={t.template_id}
                                          type="button"
                                          onClick={() => {
                                            handleStep2ProgrammeNameSelect(t.template_id);
                                            setIsProgNameOpen(false);
                                            setProgNameSearch('');
                                          }}
                                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-slate-700/60 transition-colors ${
                                            isSelected
                                              ? 'bg-indigo-50/80 dark:bg-slate-700 font-semibold text-indigo-700 dark:text-indigo-400'
                                              : 'text-slate-700 dark:text-slate-200'
                                          }`}
                                        >
                                          <span>
                                            {t.programme_name} <span className="text-slate-400 font-normal">({t.programme_code})</span>
                                          </span>
                                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ml-2 flex-shrink-0" />}
                                        </button>
                                      );
                                    });
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <div className="w-full relative">
                              <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. B.Tech. Robotics and Automation"
                                className="w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                              />
                              <p className="text-[10px] text-slate-400 mt-1">
                                Enter the complete degree programme name, not an individual subject name.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleStep2ProgrammeNameSelect(templates[0]?.template_id || 'custom')}
                              className="px-3 py-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 h-fit"
                            >
                              Templates
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Programme Code (Editable Searchable Combobox) */}
                      <div className="relative" ref={progCodeRef}>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Programme Code * (Uppercase, Unique in Institution)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={formData.code}
                            onChange={(e) => handleManualCodeChange(e.target.value)}
                            onFocus={() => {
                              if (selectedTemplateId !== 'custom') {
                                setIsProgCodeOpen(true);
                              }
                            }}
                            placeholder="e.g. BE-ECE"
                            className="w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100"
                          />
                          {isProgCodeOpen && selectedTemplateId !== 'custom' && (
                            <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/50">
                              {getCodeSuggestions().map((codeOption) => {
                                const isSelected = formData.code === codeOption;
                                return (
                                  <button
                                    key={codeOption}
                                    type="button"
                                    onClick={() => {
                                      handleManualCodeChange(codeOption);
                                      setIsProgCodeOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-slate-700/60 transition-colors ${
                                      isSelected
                                        ? 'bg-indigo-50/80 dark:bg-slate-700 font-semibold text-indigo-700 dark:text-indigo-400'
                                        : 'text-slate-700 dark:text-slate-200'
                                    }`}
                                  >
                                    <span className="font-mono">{codeOption}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ml-2 flex-shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Degree Type Dropdown */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Degree Type *
                        </label>
                        <select
                          disabled={selectedTemplateId !== 'custom'}
                          value={formData.degree_type}
                          onChange={(e) => handleDegreeTypeChange(e.target.value)}
                          className="w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 disabled:opacity-50"
                        >
                          {DEGREE_TYPE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>

                        {formData.degree_type === 'Other / Custom' && (
                          <input
                            type="text"
                            required
                            value={formData.custom_degree_type}
                            onChange={(e) =>
                              setFormData({ ...formData, custom_degree_type: e.target.value })
                            }
                            placeholder="Enter custom degree (e.g. Bachelor of Architecture)..."
                            className="mt-2 w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          />
                        )}
                      </div>

                      {/* Duration in Years */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                          <span>Duration (Years) *</span>
                          {isStandardDegree && (
                            <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-400" /> Read-only
                            </span>
                          )}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={8}
                          required
                          readOnly={isStandardDegree}
                          value={formData.duration_years}
                          onChange={(e) => {
                            if (!isStandardDegree) {
                              const yrs = parseInt(e.target.value) || 4;
                              setFormData({
                                ...formData,
                                duration_years: yrs,
                                total_semesters: yrs * 2,
                              });
                            }
                          }}
                          className={`w-full p-2.5 rounded-md border text-xs text-slate-900 dark:text-slate-100 ${
                            isStandardDegree
                              ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed'
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                          }`}
                        />
                        {isStandardDegree && (
                          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <Info className="w-3 h-3 text-indigo-500" /> Automatically configured ({formData.duration_years} years)
                          </p>
                        )}
                      </div>

                      {/* Total Semesters */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                          <span>Total Semesters *</span>
                          {isStandardDegree && (
                            <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-400" /> Read-only
                            </span>
                          )}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={16}
                          required
                          readOnly={isStandardDegree}
                          value={formData.total_semesters}
                          onChange={(e) => {
                            if (!isStandardDegree) {
                              setFormData({
                                ...formData,
                                total_semesters: parseInt(e.target.value) || 8,
                              });
                            }
                          }}
                          className={`w-full p-2.5 rounded-md border text-xs text-slate-900 dark:text-slate-100 ${
                            isStandardDegree
                              ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed'
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                          }`}
                        />
                        {isStandardDegree && (
                          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <Info className="w-3 h-3 text-indigo-500" /> Automatically configured ({formData.total_semesters} semesters)
                          </p>
                        )}
                      </div>

                      {/* Regulation Dropdown */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Academic Regulation (Optional)
                        </label>
                        <select
                          value={formData.regulation_name}
                          onChange={(e) =>
                            setFormData({ ...formData, regulation_name: e.target.value })
                          }
                          className="w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                        >
                          {REGULATION_OPTIONS.map((reg) => (
                            <option key={reg} value={reg}>
                              {reg}
                            </option>
                          ))}
                        </select>

                        {formData.regulation_name === 'Other / Custom' && (
                          <input
                            type="text"
                            value={formData.custom_regulation}
                            onChange={(e) =>
                              setFormData({ ...formData, custom_regulation: e.target.value })
                            }
                            placeholder="Enter regulation scheme (e.g. CBCS Regulation 2027)..."
                            className="mt-2 w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          />
                        )}
                      </div>
                    </div>

                    {/* Auto Semester Generation Checkbox & Preview */}
                    <div className="p-3.5 rounded-lg bg-indigo-50/60 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="auto_semesters"
                          checked={formData.auto_create_semesters}
                          onChange={(e) =>
                            setFormData({ ...formData, auto_create_semesters: e.target.checked })
                          }
                          className="rounded text-indigo-600"
                        />
                        <label
                          htmlFor="auto_semesters"
                          className="text-xs font-bold text-indigo-900 dark:text-indigo-300"
                        >
                          Automatically create semester records (Semester 1 through Semester {formData.total_semesters})
                        </label>
                      </div>

                      {formData.auto_create_semesters && (
                        <div className="pl-6 pt-1">
                          <p className="text-[11px] font-semibold text-slate-500 mb-1">
                            Generated Semesters Preview:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {Array.from({ length: formData.total_semesters }, (_, i) => i + 1).map((sNum) => (
                              <span
                                key={sNum}
                                className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 text-[10px] font-mono text-indigo-700 dark:text-indigo-300 font-bold"
                              >
                                Semester {sNum} ({sNum % 2 === 1 ? 'ODD' : 'EVEN'})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="button"
                        onClick={() => setModalStep(1)}
                        className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:underline"
                      >
                        ← Back to Templates
                      </button>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateModalOpen(false)}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          id="btn-save-programme"
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 shadow-sm"
                        >
                          Save Programme →
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* EDIT PROGRAMME MODAL */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  Edit Programme: {formData.code}
                </h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && formError !== 'SUBJECT_LIKE_NAME_WARNING' && (
                <div className="p-3 rounded bg-rose-50 text-rose-800 text-xs font-semibold">
                  ⚠️ {formError}
                </div>
              )}

              {formError === 'SUBJECT_LIKE_NAME_WARNING' && (
                <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 text-amber-900 dark:text-amber-300 text-xs font-semibold space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-600 flex-shrink-0" />
                    <span>Warning: '{formData.name}' looks like a subject name (not a degree programme).</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-6">
                    Enter the complete degree programme name, not an individual subject name.
                  </p>
                  <div className="flex items-center gap-2 pl-6 pt-1">
                    <input
                      type="checkbox"
                      id="confirm_unusual_edit"
                      checked={formData.confirm_unusual_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirm_unusual_name: e.target.checked }))}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="confirm_unusual_edit" className="cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                      I confirm this is indeed a valid degree programme name.
                    </label>
                  </div>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Programme Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Programme Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="mt-1 w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300">Duration (Years)</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={formData.duration_years}
                      onChange={(e) => setFormData({ ...formData, duration_years: parseInt(e.target.value) || 4 })}
                      className="mt-1 w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300">Total Semesters</label>
                    <input
                      type="number"
                      min={1}
                      max={16}
                      value={formData.total_semesters}
                      onChange={(e) => setFormData({ ...formData, total_semesters: parseInt(e.target.value) || 8 })}
                      className="mt-1 w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="edit_is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <label htmlFor="edit_is_active" className="font-bold text-slate-700 dark:text-slate-300">
                    Active Status (Visible in Student Form)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 text-white font-bold">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DEACTIVATION CONFIRMATION DIALOG */}
        {deactivateProg && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {deactivateProg.is_active ? 'Deactivate Programme?' : 'Reactivate Programme?'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {deactivateProg.name} ({deactivateProg.code})
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                {deactivateProg.is_active
                  ? 'Deactivating this programme will hide it from new student registration forms. Existing enrolled student records will remain completely intact.'
                  : 'Reactivating this programme will make it immediately selectable in Student Registration forms.'}
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setDeactivateProg(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleToggleActivation(deactivateProg)}
                  className={deactivateProg.is_active ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'}
                >
                  Confirm {deactivateProg.is_active ? 'Deactivation' : 'Activation'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW PROGRAMME DETAILS & STUDENTS MODAL */}
        {viewProgramme && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {viewProgramme.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {viewProgramme.name}
                  </h3>
                </div>
                <button onClick={() => setViewProgramme(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block">Institution:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{viewProgramme.institution_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Department:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{viewProgramme.department_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Degree Type:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{viewProgramme.degree_type}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Duration:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{viewProgramme.duration_years} Years ({viewProgramme.total_semesters} Semesters)</span>
                </div>
              </div>

              <div className="border-t pt-3 border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Enrolled Students ({studentsList.length})
                </h4>

                {loadingStudents ? (
                  <div className="py-4 text-center text-slate-400 text-xs">Loading students list...</div>
                ) : studentsList.length === 0 ? (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded text-center text-xs text-slate-500">
                    No students enrolled under this programme yet.
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto">
                    {studentsList.map((st) => (
                      <li key={st.id} className="py-2 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">{st.full_name}</span>
                          <span className="text-[10px] text-slate-500">{st.email}</span>
                        </div>
                        <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold text-slate-700 dark:text-slate-300">
                          {st.student_id_number}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button size="sm" variant="outline" onClick={() => setViewProgramme(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* MANUAL CODE SWITCH CONFIRMATION DIALOG */}
        {showCodeConfirmDialog && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Switch Programme Name?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Code matches another standard template.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                The code you entered matches another standard programme. Do you want to switch the selected Programme Name to match this code?
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => {
                  // Keep code but do not switch name
                  setShowCodeConfirmDialog(null);
                }}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmCodeSwitch}
                  className="bg-indigo-600 text-white font-bold text-xs"
                >
                  Confirm Switch
                </Button>
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {academicSection === 'co-mapping' && <COMappingVisualizer />}

        {academicSection === 'comparison' && <ProgrammeComparisonTool />}

        <ProgrammeGeneratorWizard
          isOpen={showAIGenerator}
          onClose={() => setShowAIGenerator(false)}
          onSaveSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-programmes'] })}
        />
      </div>
    </DashboardLayout>
  );
}
