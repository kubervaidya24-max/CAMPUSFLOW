import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Sparkles,
  Save,
  Printer,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Layout,
  Briefcase,
  GraduationCap,
  Wrench,
  Link as LinkIcon,
  User,
  FolderGit2,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { ModernTemplate } from '../components/resume/ModernTemplate';
import { DualColumnTemplate } from '../components/resume/DualColumnTemplate';

const initialResumeState = {
  title: 'My Software Engineering Resume',
  template: 'modern',
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    headline: '',
    summary: '',
  },
  education: [],
  skills: [],
  projects: [],
  experience: [],
  certifications: [],
  achievements: [],
  links: {
    github: '',
    linkedin: '',
    portfolio: '',
    leetcode: '',
    other: '',
  },
};

export const ResumeBuilderPage = () => {
  const queryClient = useQueryClient();
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [resumeData, setResumeData] = useState(initialResumeState);
  const [activeSection, setActiveSection] = useState('personal');
  const [statusMessage, setStatusMessage] = useState('');

  // 1. Fetch User Resumes
  const { data: resumesData } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => resumeService.getResumes(),
  });

  const resumes = resumesData?.data?.data?.resumes || resumesData?.data?.resumes || [];

  // Set initial selected resume
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0]._id);
      setResumeData(resumes[0]);
    }
  }, [resumes, selectedResumeId]);

  // 2. Mutations
  const createMutation = useMutation({
    mutationFn: (data) => resumeService.createResume(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['resumes']);
      const newResume = res?.data?.data?.resume || res?.data?.resume;
      if (newResume) {
        setSelectedResumeId(newResume._id);
        setResumeData(newResume);
      }
      setStatusMessage('Resume created successfully!');
      setTimeout(() => setStatusMessage(''), 4000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => resumeService.updateResume(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['resumes']);
      setStatusMessage('Changes saved successfully!');
      setTimeout(() => setStatusMessage(''), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => resumeService.deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['resumes']);
      setSelectedResumeId(null);
      setResumeData(initialResumeState);
      setStatusMessage('Resume deleted.');
      setTimeout(() => setStatusMessage(''), 4000);
    },
  });

  const autoFillMutation = useMutation({
    mutationFn: () => resumeService.getAutoFillDraft(),
    onSuccess: (res) => {
      const draft = res?.data?.data?.draft || res?.data?.draft;
      if (draft) {
        setResumeData((prev) => ({
          ...prev,
          ...draft,
          _id: prev._id,
        }));
        setStatusMessage('Profile & project data imported into editor!');
        setTimeout(() => setStatusMessage(''), 4000);
      }
    },
  });

  // Handlers
  const handleSelectResume = (id) => {
    setSelectedResumeId(id);
    const found = resumes.find((r) => r._id === id);
    if (found) {
      setResumeData(found);
    }
  };

  const handleSave = () => {
    if (selectedResumeId) {
      updateMutation.mutate({ id: selectedResumeId, data: resumeData });
    } else {
      createMutation.mutate(resumeData);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateNew = () => {
    setSelectedResumeId(null);
    setResumeData({
      ...initialResumeState,
      title: `Resume #${resumes.length + 1}`,
    });
  };

  // Section Change Helpers
  const updatePersonalInfo = (field, val) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: val },
    }));
  };

  const updateLinks = (field, val) => {
    setResumeData((prev) => ({
      ...prev,
      links: { ...prev.links, [field]: val },
    }));
  };

  // Skills
  const addSkillCategory = () => {
    setResumeData((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), { category: 'New Category', items: ['Skill 1', 'Skill 2'] }],
    }));
  };

  const removeSkillCategory = (index) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const updateSkillCategoryName = (index, name) => {
    const updated = [...(resumeData.skills || [])];
    updated[index].category = name;
    setResumeData((prev) => ({ ...prev, skills: updated }));
  };

  const updateSkillCategoryItems = (index, itemsString) => {
    const updated = [...(resumeData.skills || [])];
    updated[index].items = itemsString.split(',').map((s) => s.trim()).filter(Boolean);
    setResumeData((prev) => ({ ...prev, skills: updated }));
  };

  // Experience
  const addExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...(prev.experience || []),
        {
          company: 'Company Name',
          role: 'Software Engineer',
          location: 'Remote / City',
          startDate: '2024',
          endDate: 'Present',
          current: true,
          description: '',
          highlights: ['Key impact or achievement.'],
        },
      ],
    }));
  };

  const removeExperience = (index) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const updateExperienceField = (index, field, val) => {
    const updated = [...(resumeData.experience || [])];
    updated[index][field] = val;
    setResumeData((prev) => ({ ...prev, experience: updated }));
  };

  // Projects
  const addProject = () => {
    setResumeData((prev) => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        {
          title: 'Project Name',
          role: 'Full Stack Developer',
          technologies: ['React', 'Node.js'],
          repositoryUrl: '',
          description: 'Project summary description.',
          highlights: ['Built core algorithms and database schema.'],
        },
      ],
    }));
  };

  const removeProject = (index) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const updateProjectField = (index, field, val) => {
    const updated = [...(resumeData.projects || [])];
    if (field === 'technologies') {
      updated[index][field] = val.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (field === 'highlights') {
      updated[index][field] = val.split('\n').map((s) => s.trim()).filter(Boolean);
    } else {
      updated[index][field] = val;
    }
    setResumeData((prev) => ({ ...prev, projects: updated }));
  };

  // Education
  const addEducation = () => {
    setResumeData((prev) => ({
      ...prev,
      education: [
        ...(prev.education || []),
        {
          institution: 'University Name',
          degree: 'Bachelor of Technology',
          fieldOfStudy: 'Computer Science',
          startDate: '2023',
          endDate: '2027',
          grade: 'CGPA: 8.5',
        },
      ],
    }));
  };

  const removeEducation = (index) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const updateEducationField = (index, field, val) => {
    const updated = [...(resumeData.education || [])];
    updated[index][field] = val;
    setResumeData((prev) => ({ ...prev, education: updated }));
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      {/* Print Specific CSS Inject */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .resume-document, .resume-document * {
            visibility: visible;
          }
          .resume-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & Resume Actions */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 shadow-inner">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Dynamic Resume Builder
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  ATS Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate high-impact, ATS-optimized engineering resumes populated directly from your profile & projects.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Resume Selector */}
            {resumes.length > 0 && (
              <select
                value={selectedResumeId || ''}
                onChange={(e) => handleSelectResume(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.title}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleCreateNew}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>

            {/* Auto-Fill Button */}
            <button
              onClick={() => autoFillMutation.mutate()}
              disabled={autoFillMutation.isPending}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all shadow-md shadow-amber-500/10"
              title="Import skills, bio, department, and projects from your profile"
            >
              {autoFillMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Auto-Fill from Profile</span>
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending || createMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
            >
              {updateMutation.isPending || createMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save Resume</span>
            </button>

            {/* Print / PDF Export */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export PDF / Print</span>
            </button>

            {selectedResumeId && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this resume?')) {
                    deleteMutation.mutate(selectedResumeId);
                  }
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/10 border border-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                title="Delete Resume"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Template & Layout Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-indigo-400" />
              <span>Template Layout:</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setResumeData((prev) => ({ ...prev, template: 'modern' }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  resumeData.template === 'modern'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Modern ATS (Single Column)
              </button>
              <button
                onClick={() => setResumeData((prev) => ({ ...prev, template: 'dual-column' }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  resumeData.template === 'dual-column'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Executive Split (Dual Column)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={resumeData.title}
              onChange={(e) => setResumeData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Resume Title..."
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-indigo-500 w-56"
            />
          </div>
        </div>

        {/* Split Screen Workspace: Editor & Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: SECTION EDITORS (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Section Accordions */}

            {/* 1. PERSONAL INFO */}
            <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden">
              <button
                onClick={() => setActiveSection(activeSection === 'personal' ? '' : 'personal')}
                className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-xs text-white hover:bg-slate-850 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Personal Information</span>
                </div>
                {activeSection === 'personal' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {activeSection === 'personal' && (
                <div className="p-5 border-t border-slate-800 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.fullName || ''}
                      onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                      placeholder="e.g. Alice Turing"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Headline / Target Role</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.headline || ''}
                      onChange={(e) => updatePersonalInfo('headline', e.target.value)}
                      placeholder="e.g. Full Stack & Distributed Systems Engineer"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Email</label>
                      <input
                        type="email"
                        value={resumeData.personalInfo?.email || ''}
                        onChange={(e) => updatePersonalInfo('email', e.target.value)}
                        placeholder="email@example.com"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Phone</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo?.phone || ''}
                        onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Location</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.location || ''}
                      onChange={(e) => updatePersonalInfo('location', e.target.value)}
                      placeholder="San Francisco, CA / Campus"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Professional Summary</label>
                    <textarea
                      rows={3}
                      value={resumeData.personalInfo?.summary || ''}
                      onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                      placeholder="2-3 sentence executive summary..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. TECHNICAL SKILLS */}
            <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden">
              <button
                onClick={() => setActiveSection(activeSection === 'skills' ? '' : 'skills')}
                className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-xs text-white hover:bg-slate-850 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-sky-400" />
                  <span>Technical Skills</span>
                </div>
                {activeSection === 'skills' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {activeSection === 'skills' && (
                <div className="p-5 border-t border-slate-800 space-y-4">
                  {resumeData.skills?.map((cat, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={cat.category}
                          onChange={(e) => updateSkillCategoryName(idx, e.target.value)}
                          placeholder="Category (e.g. Languages & Frameworks)"
                          className="font-bold text-xs text-indigo-300 bg-transparent focus:outline-none w-[80%]"
                        />
                        <button
                          onClick={() => removeSkillCategory(idx)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={Array.isArray(cat.items) ? cat.items.join(', ') : cat.items}
                        onChange={(e) => updateSkillCategoryItems(idx, e.target.value)}
                        placeholder="Comma-separated items (e.g. JavaScript, React, Node.js)"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-white focus:outline-none"
                      />
                    </div>
                  ))}

                  <button
                    onClick={addSkillCategory}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-dashed border-slate-700 text-xs font-bold text-indigo-400 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Skill Category</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. KEY PROJECTS */}
            <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden">
              <button
                onClick={() => setActiveSection(activeSection === 'projects' ? '' : 'projects')}
                className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-xs text-white hover:bg-slate-850 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-emerald-400" />
                  <span>Key Projects</span>
                </div>
                {activeSection === 'projects' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {activeSection === 'projects' && (
                <div className="p-5 border-t border-slate-800 space-y-4">
                  {resumeData.projects?.map((proj, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => updateProjectField(idx, 'title', e.target.value)}
                          placeholder="Project Title"
                          className="font-bold text-xs text-white bg-transparent focus:outline-none w-[70%]"
                        />
                        <button
                          onClick={() => removeProject(idx)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={proj.role || ''}
                          onChange={(e) => updateProjectField(idx, 'role', e.target.value)}
                          placeholder="Role (e.g. Lead Author)"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-white focus:outline-none"
                        />
                        <input
                          type="text"
                          value={proj.repositoryUrl || ''}
                          onChange={(e) => updateProjectField(idx, 'repositoryUrl', e.target.value)}
                          placeholder="Repo URL / GitHub link"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <input
                        type="text"
                        value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies || ''}
                        onChange={(e) => updateProjectField(idx, 'technologies', e.target.value)}
                        placeholder="Technologies (comma separated)"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-white focus:outline-none"
                      />

                      <textarea
                        rows={2}
                        value={proj.description || ''}
                        onChange={(e) => updateProjectField(idx, 'description', e.target.value)}
                        placeholder="Project Summary Description..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-white focus:outline-none resize-none"
                      />
                    </div>
                  ))}

                  <button
                    onClick={addProject}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-dashed border-slate-700 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. WORK / EXPERIENCE */}
            <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden">
              <button
                onClick={() => setActiveSection(activeSection === 'experience' ? '' : 'experience')}
                className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-xs text-white hover:bg-slate-850 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  <span>Work & Internships</span>
                </div>
                {activeSection === 'experience' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {activeSection === 'experience' && (
                <div className="p-5 border-t border-slate-800 space-y-4">
                  {resumeData.experience?.map((exp, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperienceField(idx, 'company', e.target.value)}
                          placeholder="Company / Org Name"
                          className="font-bold text-xs text-white bg-transparent focus:outline-none w-[70%]"
                        />
                        <button
                          onClick={() => removeExperience(idx)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => updateExperienceField(idx, 'role', e.target.value)}
                          placeholder="Role / Title"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-white focus:outline-none"
                        />
                        <input
                          type="text"
                          value={exp.location || ''}
                          onChange={(e) => updateExperienceField(idx, 'location', e.target.value)}
                          placeholder="Location / Remote"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={exp.startDate || ''}
                          onChange={(e) => updateExperienceField(idx, 'startDate', e.target.value)}
                          placeholder="Start Date (e.g. Jun 2025)"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-white focus:outline-none"
                        />
                        <input
                          type="text"
                          value={exp.endDate || ''}
                          onChange={(e) => updateExperienceField(idx, 'endDate', e.target.value)}
                          placeholder="End Date (or Present)"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={exp.description || ''}
                        onChange={(e) => updateExperienceField(idx, 'description', e.target.value)}
                        placeholder="Impact summary & accomplishments..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-white focus:outline-none resize-none"
                      />
                    </div>
                  ))}

                  <button
                    onClick={addExperience}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-dashed border-slate-700 text-xs font-bold text-purple-400 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Experience</span>
                  </button>
                </div>
              )}
            </div>

            {/* 5. EDUCATION */}
            <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden">
              <button
                onClick={() => setActiveSection(activeSection === 'education' ? '' : 'education')}
                className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-xs text-white hover:bg-slate-850 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  <span>Education & Academics</span>
                </div>
                {activeSection === 'education' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {activeSection === 'education' && (
                <div className="p-5 border-t border-slate-800 space-y-4">
                  {resumeData.education?.map((edu, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateEducationField(idx, 'institution', e.target.value)}
                          placeholder="Institution / University"
                          className="font-bold text-xs text-white bg-transparent focus:outline-none w-[70%]"
                        />
                        <button
                          onClick={() => removeEducation(idx)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducationField(idx, 'degree', e.target.value)}
                          placeholder="Degree (e.g. B.Tech)"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-white focus:outline-none"
                        />
                        <input
                          type="text"
                          value={edu.fieldOfStudy || ''}
                          onChange={(e) => updateEducationField(idx, 'fieldOfStudy', e.target.value)}
                          placeholder="Field of Study"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={edu.startDate || ''}
                          onChange={(e) => updateEducationField(idx, 'startDate', e.target.value)}
                          placeholder="Start Year (2023)"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-white focus:outline-none"
                        />
                        <input
                          type="text"
                          value={edu.grade || ''}
                          onChange={(e) => updateEducationField(idx, 'grade', e.target.value)}
                          placeholder="GPA / Grade"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-850 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addEducation}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-dashed border-slate-700 text-xs font-bold text-amber-400 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Education</span>
                  </button>
                </div>
              )}
            </div>

            {/* 6. SOCIAL LINKS */}
            <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden">
              <button
                onClick={() => setActiveSection(activeSection === 'links' ? '' : 'links')}
                className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-xs text-white hover:bg-slate-850 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-indigo-400" />
                  <span>Links & Profiles</span>
                </div>
                {activeSection === 'links' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {activeSection === 'links' && (
                <div className="p-5 border-t border-slate-800 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">GitHub Profile</label>
                    <input
                      type="text"
                      value={resumeData.links?.github || ''}
                      onChange={(e) => updateLinks('github', e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">LinkedIn Profile</label>
                    <input
                      type="text"
                      value={resumeData.links?.linkedin || ''}
                      onChange={(e) => updateLinks('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Portfolio Website</label>
                    <input
                      type="text"
                      value={resumeData.links?.portfolio || ''}
                      onChange={(e) => updateLinks('portfolio', e.target.value)}
                      placeholder="https://yourportfolio.dev"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: LIVE PREVIEW (7 Cols) */}
          <div className="lg:col-span-7 sticky top-24">
            <div className="flex items-center justify-between pb-3 px-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Interactive Preview</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Auto-rendering in real-time
              </span>
            </div>

            <div className="bg-slate-900/50 p-4 sm:p-6 rounded-3xl border border-slate-800 max-h-[82vh] overflow-y-auto shadow-inner">
              {resumeData.template === 'dual-column' ? (
                <DualColumnTemplate data={resumeData} />
              ) : (
                <ModernTemplate data={resumeData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderPage;
