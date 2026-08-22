import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import {
  Save,
  ArrowLeft,
  Plus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const ProjectEditorPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: ['React', 'Node.js', 'MongoDB'],
    repositoryUrl: '',
    liveUrl: '',
    status: 'active',
    deadline: '',
  });

  const [techInput, setTechInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch project if editing
  const { data: existingProjectData, isLoading: isFetching } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProjectById(id),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingProjectData?.data?.project) {
      const p = existingProjectData.data.project;
      setFormData({
        title: p.title || '',
        description: p.description || '',
        technologies: p.technologies || [],
        repositoryUrl: p.repositoryUrl || '',
        liveUrl: p.liveUrl || '',
        status: p.status || 'active',
        deadline: p.deadline ? new Date(p.deadline).toISOString().slice(0, 10) : '',
      });
    }
  }, [existingProjectData]);

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data) => projectService.createProject(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setSuccessMessage('Project created successfully!');
      setTimeout(() => {
        navigate(`/projects/${res.data.project._id}`);
      }, 1000);
    },
    onError: (err) => {
      setErrorMessage(err.message || 'Failed to create project');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data) => projectService.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setSuccessMessage('Project updated successfully!');
      setTimeout(() => {
        navigate(`/projects/${id}`);
      }, 1000);
    },
    onError: (err) => {
      setErrorMessage(err.message || 'Failed to update project');
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleAddTech = (e) => {
    e.preventDefault();
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()],
      }));
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isFetching) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-xs">Loading project details...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800/80 mb-8">
          <div className="flex items-center gap-3">
            <Link
              to="/projects"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isEditing ? 'Edit Collaborative Project' : 'Create New Project'}
              </h1>
              <p className="text-slate-400 text-xs">
                Configure your repository workspace, tech stack, and collaborate with peers
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Project Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. CampusFlow Realtime Collab Engine"
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Project Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your software system, target architecture, team roadmap, and goals..."
                  className="w-full p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  GitHub / Git Repository URL
                </label>
                <input
                  type="url"
                  value={formData.repositoryUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, repositoryUrl: e.target.value }))}
                  placeholder="https://github.com/username/project"
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Live Demo / Deployment URL
                </label>
                <input
                  type="url"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, liveUrl: e.target.value }))}
                  placeholder="https://myproject.dev"
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Active Development</option>
                  <option value="planning">Planning & Architecture</option>
                  <option value="completed">Completed / Shipped</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Technologies Tag Manager */}
          <div className="space-y-4 pt-6 border-t border-slate-800/80">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Technology Stack Tags</span>
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type tech stack (e.g. TailwindCSS, Redis, PyTorch)..."
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTech(e);
                  }
                }}
                className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tag</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium"
                >
                  <span>{tech}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(tech)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-end gap-3">
            <Link
              to="/projects"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Project...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Update Project' : 'Create Project'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectEditorPage;
