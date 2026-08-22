import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentService } from '../services/assignmentService';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Calendar,
  Award,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Paperclip,
  Send,
} from 'lucide-react';

export const AssignmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isStudent = user?.role === 'student';
  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';

  // Submission Form State (for student)
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionAttachments, setSubmissionAttachments] = useState([]);
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [actionMessage, setActionMessage] = useState(null);

  // Grading Modal State (for faculty)
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');

  // Fetch Assignment Details
  const {
    data: assignmentData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['assignment', id],
    queryFn: () => assignmentService.getAssignmentById(id),
  });

  const assignment = assignmentData?.data?.assignment;
  const mySubmission = assignmentData?.data?.mySubmission;
  const isOwner = assignment?.faculty?._id === user?._id || user?.role === 'admin';

  // Fetch Submissions List (if faculty)
  const { data: submissionsData } = useQuery({
    queryKey: ['assignmentSubmissions', id],
    queryFn: () => assignmentService.getSubmissionsForAssignment(id),
    enabled: isFaculty && isOwner,
  });

  const submissionsList = submissionsData?.data?.submissions || [];

  // Submit Mutation
  const submitMutation = useMutation({
    mutationFn: (data) => assignmentService.submitAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment', id] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      setActionMessage({ type: 'success', text: 'Assignment submitted successfully!' });
      setTimeout(() => setActionMessage(null), 4000);
    },
    onError: (err) => {
      setActionMessage({ type: 'error', text: err.message || 'Failed to submit assignment.' });
      setTimeout(() => setActionMessage(null), 4000);
    },
  });

  // Grade Mutation
  const gradeMutation = useMutation({
    mutationFn: ({ submissionId, gradeData }) =>
      assignmentService.gradeSubmission(submissionId, gradeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignmentSubmissions', id] });
      setGradingSubmission(null);
      setGradeScore('');
      setGradeFeedback('');
      setActionMessage({ type: 'success', text: 'Grade and feedback recorded successfully!' });
      setTimeout(() => setActionMessage(null), 4000);
    },
    onError: (err) => {
      setActionMessage({ type: 'error', text: err.message || 'Failed to evaluate submission.' });
    },
  });

  // Delete Assignment Mutation
  const deleteMutation = useMutation({
    mutationFn: () => assignmentService.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      navigate('/assignments');
    },
  });

  // Attachment handler for student
  const handleAddAttachment = (e) => {
    e.preventDefault();
    if (newAttachmentName.trim() && newAttachmentUrl.trim()) {
      setSubmissionAttachments((prev) => [
        ...prev,
        { name: newAttachmentName.trim(), url: newAttachmentUrl.trim(), size: 0 },
      ]);
      setNewAttachmentName('');
      setNewAttachmentUrl('');
    }
  };

  const handleRemoveAttachment = (index) => {
    setSubmissionAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (!submissionContent.trim()) {
      setActionMessage({ type: 'error', text: 'Please provide submission notes or a repository link.' });
      return;
    }
    submitMutation.mutate({
      content: submissionContent,
      attachments: submissionAttachments,
    });
  };

  const handleGradeSubmit = (e) => {
    e.preventDefault();
    if (!gradingSubmission) return;
    gradeMutation.mutate({
      submissionId: gradingSubmission._id,
      gradeData: {
        score: Number(gradeScore),
        feedback: gradeFeedback,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-xs font-medium">Loading assignment details...</p>
      </div>
    );
  }

  if (isError || !assignment) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-red-500/30">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Assignment Not Found</h2>
          <p className="text-slate-400 text-xs mb-6">
            {error?.message || 'The requested assignment does not exist.'}
          </p>
          <Link
            to="/assignments"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Assignments</span>
          </Link>
        </div>
      </div>
    );
  }

  const dueDate = new Date(assignment.dueDate);
  const isPastDue = Date.now() > dueDate.getTime();

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/assignments"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assignments</span>
        </Link>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Link
              to={`/assignments/${assignment._id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Edit Assignment</span>
            </Link>

            <button
              onClick={() => {
                if (window.confirm('Delete this assignment and all submissions?')) {
                  deleteMutation.mutate();
                }
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/10 border border-slate-800 text-slate-400 hover:text-red-400 text-xs transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Action Toast Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-3 animate-fadeIn ${
            actionMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300">
                {assignment.course?.code || 'COURSE'}
              </span>
              <span className="text-xs font-bold text-slate-200 px-3 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                {assignment.totalPoints} Maximum Points
              </span>
              {assignment.allowLate ? (
                <span className="text-[11px] font-medium text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Late Submissions Allowed
                </span>
              ) : (
                <span className="text-[11px] font-medium text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  Strict Deadline
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {assignment.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-sky-400" />
                {assignment.course?.title}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Due: {dueDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Description & Reference Files */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instructions Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Assignment Instructions & Deliverables</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {assignment.description}
            </p>
          </div>

          {/* Reference Attachments */}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-sky-400" />
                <span>Reference Files & Starter Resources</span>
              </h2>
              <div className="space-y-2">
                {assignment.attachments.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 text-xs text-slate-200 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span className="font-medium">{file.name}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Student Graded Feedback Banner (If Graded) */}
          {isStudent && mySubmission?.status === 'graded' && (
            <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-emerald-950/10 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Evaluation & Feedback
                  </h2>
                </div>
                <span className="text-base font-extrabold text-emerald-400 px-3.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  {mySubmission.grade?.score} / {assignment.totalPoints}
                </span>
              </div>

              {mySubmission.grade?.feedback ? (
                <p className="text-slate-300 text-xs leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                  {mySubmission.grade.feedback}
                </p>
              ) : (
                <p className="text-slate-500 text-xs">No written remarks attached.</p>
              )}
            </div>
          )}

          {/* Faculty: Submissions Table */}
          {isFaculty && isOwner && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Student Submissions ({submissionsList.length})
                </h2>
              </div>

              {submissionsList.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-xs">
                  No students have submitted deliverables for this assignment yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                        <th className="py-3 px-3">Student</th>
                        <th className="py-3 px-3">Submitted On</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Score</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {submissionsList.map((sub) => (
                        <tr key={sub._id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3.5 px-3">
                            <span className="font-semibold text-slate-200 block">
                              {sub.student?.name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {sub.student?.profile?.collegeId || sub.student?.email}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-slate-400">
                            {new Date(sub.submittedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                                sub.status === 'graded'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : sub.status === 'late'
                                  ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                  : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-slate-200">
                            {sub.grade?.score !== undefined
                              ? `${sub.grade.score} / ${assignment.totalPoints}`
                              : '—'}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              onClick={() => {
                                setGradingSubmission(sub);
                                setGradeScore(sub.grade?.score?.toString() || '');
                                setGradeFeedback(sub.grade?.feedback || '');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-sm"
                            >
                              {sub.status === 'graded' ? 'Edit Grade' : 'Grade'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Student Submission Form / Deadline Status */}
        <div className="space-y-6">
          {isStudent && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
                <Send className="w-4 h-4 text-indigo-400" />
                <span>{mySubmission ? 'Update Your Submission' : 'Submit Deliverable'}</span>
              </h2>

              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Notes / GitHub Link / Solution URL <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    placeholder="https://github.com/username/project or your solution notes..."
                    className="w-full p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Attachments Section */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-300">
                    Attached Deliverables
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="File title"
                      value={newAttachmentName}
                      onChange={(e) => setNewAttachmentName(e.target.value)}
                      className="w-1/3 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100"
                    />
                    <input
                      type="url"
                      placeholder="URL (Google Drive / GitHub / PDF)"
                      value={newAttachmentUrl}
                      onChange={(e) => setNewAttachmentUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={handleAddAttachment}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {submissionAttachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                    >
                      <span className="text-indigo-300 truncate">{att.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(idx)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={submitMutation.isPending || (isPastDue && !assignment.allowLate)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{mySubmission ? 'Update Submission' : 'Submit Assignment'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Faculty Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-lg w-full glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Evaluate Submission</h3>
                <p className="text-slate-400 text-xs">
                  Grading deliverable for {gradingSubmission.student?.name}
                </p>
              </div>
              <button
                onClick={() => setGradingSubmission(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {/* Submission Content Review */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
              <span className="text-slate-400 block font-medium">Submitted Deliverable:</span>
              <p className="text-slate-200 whitespace-pre-line font-mono">
                {gradingSubmission.content}
              </p>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Awarded Score (Max: {assignment.totalPoints}) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={assignment.totalPoints}
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  placeholder={`0 - ${assignment.totalPoints}`}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Instructor Feedback & Remarks
                </label>
                <textarea
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="Provide constructive feedback, suggestions, and corrections..."
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={gradeMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
                >
                  {gradeMutation.isPending ? 'Saving...' : 'Save Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentDetailsPage;
