import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentService } from '../services/assignmentService';
import { courseService } from '../services/courseService';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Paperclip,
} from 'lucide-react';

export const AssignmentEditorPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    totalPoints: 100,
    allowLate: true,
    attachments: [],
    status: 'published',
  });

  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch faculty courses
  const { data: coursesData } = useQuery({
    queryKey: ['courses', 'teachingOnly'],
    queryFn: () => courseService.getCourses({ facultyOnly: 'true' }),
  });

  const courses = coursesData?.data?.courses || [];

  // Fetch assignment if editing
  const { data: existingAssignmentData, isLoading: isFetching } = useQuery({
    queryKey: ['assignment', id],
    queryFn: () => assignmentService.getAssignmentById(id),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingAssignmentData?.data?.assignment) {
      const a = existingAssignmentData.data.assignment;
      const formattedDate = a.dueDate ? new Date(a.dueDate).toISOString().slice(0, 16) : '';
      setFormData({
        title: a.title || '',
        description: a.description || '',
        courseId: a.course?._id || a.course || '',
        dueDate: formattedDate,
        totalPoints: a.totalPoints || 100,
        allowLate: a.allowLate !== undefined ? a.allowLate : true,
        attachments: a.attachments || [],
        status: a.status || 'published',
      });
    } else if (courses.length > 0 && !formData.courseId) {
      setFormData((prev) => ({ ...prev, courseId: courses[0]._id }));
    }
  }, [existingAssignmentData, courses]);

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data) => assignmentService.createAssignment(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      setSuccessMessage('Assignment created successfully!');
      setTimeout(() => {
        navigate(`/assignments/${res.data.assignment._id}`);
      }, 1000);
    },
    onError: (err) => {
      setErrorMessage(err.message || 'Failed to create assignment');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data) => assignmentService.updateAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment', id] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      setSuccessMessage('Assignment updated successfully!');
      setTimeout(() => {
        navigate(`/assignments/${id}`);
      }, 1000);
    },
    onError: (err) => {
      setErrorMessage(err.message || 'Failed to update assignment');
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleAddAttachment = (e) => {
    e.preventDefault();
    if (attachmentName.trim() && attachmentUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        attachments: [
          ...prev.attachments,
          { name: attachmentName.trim(), url: attachmentUrl.trim(), size: 0 },
        ],
      }));
      setAttachmentName('');
      setAttachmentUrl('');
    }
  };

  const handleRemoveAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.dueDate) {
      setErrorMessage('Please specify a due date and deadline.');
      return;
    }

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
        <p className="text-slate-400 text-xs">Loading assignment...</p>
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
              to="/assignments"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isEditing ? 'Edit Assignment' : 'Create Course Assignment'}
              </h1>
              <p className="text-slate-400 text-xs">
                Set instructions, define point scale, and configure submission deadlines
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Assignment Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Lab 1: User-Space Thread Scheduler"
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Associated Course <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, courseId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Due Date & Deadline <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Total Points / Max Marks
                </label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={formData.totalPoints}
                  onChange={(e) => setFormData((prev) => ({ ...prev, totalPoints: parseInt(e.target.value, 10) }))}
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
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={formData.allowLate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, allowLate: e.target.checked }))}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-800 focus:ring-indigo-500"
                  />
                  <span>Allow Late Submissions (Late submissions will be accepted but flagged as late)</span>
                </label>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Detailed Instructions & Deliverables <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={6}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Outline the assignment objectives, requirements, submission format, and grading rubric..."
                  className="w-full p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Reference Resource Attachments */}
          <div className="space-y-4 pt-6 border-t border-slate-800/80">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-sky-400" />
              <span>Reference Files & Starter Resources</span>
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Resource title (e.g. starter_code.zip)"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                className="w-1/3 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="url"
                placeholder="Resource URL (e.g. https://...)"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddAttachment}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Resource</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs"
                >
                  <span className="text-indigo-300 font-medium">{att.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(idx)}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-end gap-3">
            <Link
              to="/assignments"
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
                  <span>Saving Assignment...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Update Assignment' : 'Create Assignment'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentEditorPage;
