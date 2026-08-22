import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../../services/projectService';
import {
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit3,
  User,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Flame,
} from 'lucide-react';

export const KanbanBoard = ({ projectId, tasks = [], members = [] }) => {
  const queryClient = useQueryClient();

  // Task Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assigneeId: '',
    priority: 'medium',
    status: 'TODO',
    deadline: '',
  });

  const [actionError, setActionError] = useState('');

  // Create Task Mutation
  const createMutation = useMutation({
    mutationFn: (data) => projectService.createTask(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectActivities', projectId] });
      closeModal();
    },
    onError: (err) => {
      setActionError(err.message || 'Failed to create task');
    },
  });

  // Update Task Mutation
  const updateMutation = useMutation({
    mutationFn: ({ taskId, data }) => projectService.updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectActivities', projectId] });
      closeModal();
    },
    onError: (err) => {
      setActionError(err.message || 'Failed to update task');
    },
  });

  // Status Shift Mutation
  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }) => projectService.updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectActivities', projectId] });
    },
  });

  // Delete Task Mutation
  const deleteMutation = useMutation({
    mutationFn: (taskId) => projectService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectActivities', projectId] });
    },
  });

  const openCreateModal = (defaultStatus = 'TODO') => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      assigneeId: '',
      priority: 'medium',
      status: defaultStatus,
      deadline: '',
    });
    setActionError('');
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      assigneeId: task.assignee?._id || task.assignee || '',
      priority: task.priority || 'medium',
      status: task.status || 'TODO',
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 10) : '',
    });
    setActionError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setActionError('');
    if (editingTask) {
      updateMutation.mutate({ taskId: editingTask._id, data: taskForm });
    } else {
      createMutation.mutate(taskForm);
    }
  };

  const columns = [
    { id: 'TODO', title: 'TODO', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { id: 'IN_PROGRESS', title: 'IN PROGRESS', badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
    { id: 'DONE', title: 'DONE', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  ];

  const priorityStyles = {
    low: 'bg-slate-800 text-slate-400 border-slate-700',
    medium: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Board Top Action */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Kanban Task Board ({tasks.length} total)
        </h2>
        <button
          onClick={() => openCreateModal('TODO')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* 3 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              className="glass-panel p-4 rounded-3xl border border-slate-800 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white tracking-wider">
                    {col.title}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${col.badgeColor}`}>
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => openCreateModal(col.id)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title={`Add ${col.title} Task`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colTasks.length === 0 ? (
                  <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-800/60 rounded-2xl text-slate-500 text-xs">
                    No tasks in {col.title}
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task._id}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-all space-y-3 group shadow-md"
                    >
                      {/* Priority and Actions */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                            priorityStyles[task.priority] || priorityStyles.medium
                          }`}
                        >
                          {task.priority === 'urgent' && <Flame className="w-2.5 h-2.5" />}
                          <span>{task.priority}</span>
                        </span>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(task)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Edit Task"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this task?')) {
                                deleteMutation.mutate(task._id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 leading-snug">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Assignee & Deadline */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-200">
                            {task.assignee ? (
                              task.assignee.name.charAt(0).toUpperCase()
                            ) : (
                              <User className="w-3 h-3 text-slate-500" />
                            )}
                          </div>
                          <span className="truncate max-w-[90px]">
                            {task.assignee?.name?.split(' ')[0] || 'Unassigned'}
                          </span>
                        </div>

                        {task.deadline && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(task.deadline).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>

                      {/* Shift Status Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
                        {col.id === 'TODO' && (
                          <button
                            onClick={() =>
                              statusMutation.mutate({ taskId: task._id, status: 'IN_PROGRESS' })
                            }
                            className="w-full py-1 rounded-lg bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white text-[10px] font-medium flex items-center justify-center gap-1 transition-colors"
                          >
                            <span>Start Progress</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {col.id === 'IN_PROGRESS' && (
                          <div className="grid grid-cols-2 gap-1.5 w-full">
                            <button
                              onClick={() =>
                                statusMutation.mutate({ taskId: task._id, status: 'TODO' })
                              }
                              className="py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors"
                            >
                              <ArrowLeft className="w-3 h-3" />
                              <span>To Todo</span>
                            </button>
                            <button
                              onClick={() =>
                                statusMutation.mutate({ taskId: task._id, status: 'DONE' })
                              }
                              className="py-1 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white text-[10px] font-medium flex items-center justify-center gap-1 transition-colors"
                            >
                              <span>Done</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {col.id === 'DONE' && (
                          <button
                            onClick={() =>
                              statusMutation.mutate({ taskId: task._id, status: 'IN_PROGRESS' })
                            }
                            className="w-full py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>Reopen Task</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Creation & Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Task Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Implement WebSocket Handshake"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Task details, acceptance criteria, or branch name..."
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Assignee</label>
                  <select
                    value={taskForm.assigneeId}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, assigneeId: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.user?._id || m.user} value={m.user?._id || m.user}>
                        {m.user?.name || 'Member'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Status</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Deadline</label>
                  <input
                    type="date"
                    value={taskForm.deadline}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>{editingTask ? 'Save Changes' : 'Create Task'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
