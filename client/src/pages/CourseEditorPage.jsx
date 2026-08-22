import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../services/courseService';
import {
  BookOpen,
  Calendar,
  Clock,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export const CourseEditorPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    department: 'Computer Science',
    semester: 1,
    credits: 3,
    capacity: 60,
    status: 'draft',
    syllabus: [
      { week: 1, title: 'Course Orientation & Fundamentals', description: 'Overview of core topics and objectives.' },
    ],
    schedule: {
      days: ['Mon', 'Wed'],
      time: '10:00 AM - 11:30 AM',
      room: 'Lecture Hall 101',
    },
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch course if editing
  const { data: existingCourseData, isLoading: isFetching } = useQuery({
    queryKey: ['course', id],
    queryFn: () => courseService.getCourseById(id),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingCourseData?.data?.course) {
      const c = existingCourseData.data.course;
      setFormData({
        title: c.title || '',
        code: c.code || '',
        description: c.description || '',
        department: c.department || 'Computer Science',
        semester: c.semester || 1,
        credits: c.credits || 3,
        capacity: c.capacity || 60,
        status: c.status || 'draft',
        syllabus: c.syllabus && c.syllabus.length > 0 ? c.syllabus : [
          { week: 1, title: 'Course Overview', description: '' },
        ],
        schedule: c.schedule || { days: [], time: '', room: '' },
      });
    }
  }, [existingCourseData]);

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data) => courseService.createCourse(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setSuccessMessage('Course created successfully!');
      setTimeout(() => {
        navigate(`/courses/${res.data.course._id}`);
      }, 1000);
    },
    onError: (err) => {
      setErrorMessage(err.message || 'Failed to create course');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data) => courseService.updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setSuccessMessage('Course updated successfully!');
      setTimeout(() => {
        navigate(`/courses/${id}`);
      }, 1000);
    },
    onError: (err) => {
      setErrorMessage(err.message || 'Failed to update course');
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Syllabus Topic Handlers
  const addSyllabusTopic = () => {
    setFormData((prev) => ({
      ...prev,
      syllabus: [
        ...prev.syllabus,
        {
          week: prev.syllabus.length + 1,
          title: '',
          description: '',
        },
      ],
    }));
  };

  const updateSyllabusTopic = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.syllabus];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, syllabus: updated };
    });
  };

  const removeSyllabusTopic = (index) => {
    setFormData((prev) => ({
      ...prev,
      syllabus: prev.syllabus.filter((_, i) => i !== index),
    }));
  };

  // Schedule Days toggle
  const toggleDay = (day) => {
    setFormData((prev) => {
      const currentDays = prev.schedule.days || [];
      const newDays = currentDays.includes(day)
        ? currentDays.filter((d) => d !== day)
        : [...currentDays, day];
      return {
        ...prev,
        schedule: { ...prev.schedule, days: newDays },
      };
    });
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

  const departments = [
    'Computer Science',
    'Software Engineering',
    'Information Technology',
    'Data Science',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isFetching) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-xs">Loading course details...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800/80 mb-8">
          <div className="flex items-center gap-3">
            <Link
              to="/courses"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isEditing ? 'Edit Course & Syllabus' : 'Create New Course'}
              </h1>
              <p className="text-slate-400 text-xs">
                Author course syllabus, set enrollment limits, and schedule class hours
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
          {/* Section 1: General Course Information */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>General Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Course Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Distributed Systems & Cloud Architecture"
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Course Code <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. CS401"
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData((prev) => ({ ...prev, semester: parseInt(e.target.value, 10) }))}
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      Semester {num}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Academic Credits</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.credits}
                  onChange={(e) => setFormData((prev) => ({ ...prev, credits: parseInt(e.target.value, 10) }))}
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Capacity (Max Students)</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={formData.capacity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, capacity: parseInt(e.target.value, 10) }))}
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Course Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="draft">Draft (Faculty Only)</option>
                  <option value="published">Published (Open to Students)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Course Description & Objectives <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide an overview of course themes, prerequisites, learning outcomes, and evaluation criteria..."
                  className="w-full p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Class Schedule & Venue */}
          <div className="space-y-4 pt-6 border-t border-slate-800/80">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Class Schedule & Venue</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Lecture Days</label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => {
                    const isSelected = formData.schedule.days?.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Lecture Time</label>
                <input
                  type="text"
                  value={formData.schedule.time}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      schedule: { ...prev.schedule, time: e.target.value },
                    }))
                  }
                  placeholder="10:00 AM - 11:30 AM"
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Classroom / Lecture Hall</label>
                <input
                  type="text"
                  value={formData.schedule.room}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      schedule: { ...prev.schedule, room: e.target.value },
                    }))
                  }
                  placeholder="Block B, Room 302"
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Syllabus Builder */}
          <div className="space-y-4 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Syllabus Modules ({formData.syllabus.length} Weeks)</span>
              </h2>

              <button
                type="button"
                onClick={addSyllabusTopic}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Week</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.syllabus.map((topic, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-mono text-xs font-bold px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        W{topic.week}
                      </span>
                      <input
                        type="text"
                        value={topic.title}
                        onChange={(e) => updateSyllabusTopic(idx, 'title', e.target.value)}
                        placeholder={`Topic title for Week ${topic.week}...`}
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {formData.syllabus.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSyllabusTopic(idx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                        title="Remove Topic"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={2}
                    value={topic.description}
                    onChange={(e) => updateSyllabusTopic(idx, 'description', e.target.value)}
                    placeholder="Weekly subtopics, readings, and assignment references..."
                    className="w-full p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-end gap-3">
            <Link
              to="/courses"
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
                  <span>Saving Course...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Update Course' : 'Create Course'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseEditorPage;
