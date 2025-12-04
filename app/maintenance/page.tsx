"use client";

import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMaintenance, TaskStatus, TaskCategory } from '@/contexts/MaintenanceContext';
import { useGraveyard } from '@/contexts/GraveyardContext';
import { Plus, Search, Filter, Edit, Trash2, CheckCircle, Lock, Calendar, User, AlertTriangle, Clock, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MaintenanceTaskForm from '@/components/MaintenanceTaskForm';
import EditMaintenanceTaskForm from '@/components/EditMaintenanceTaskForm';
import MaintenanceAlerts from '@/components/MaintenanceAlerts';

export default function MaintenancePage() {
  const { isAuthenticated, user } = useAuth();
  const {
    tasks,
    deleteTask,
    getTaskById,
    markTaskComplete,
    updateTaskStatus,
    getScheduledTasks,
    getCompletedTasks,
    getOverdueTasks,
    getInProgressTasks,
  } = useMaintenance();
  const { plots, graves } = useGraveyard();

  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | TaskStatus>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | TaskCategory>('all');
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">
          <div className="rounded-full bg-red-100 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">You need to be logged in.</p>
        </div>
      </div>
    );
  }

  const canModify = ['admin'].includes(user?.role || '');
  const canComplete = ['admin', 'staff'].includes(user?.role || '');

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (user?.role === 'visitor') {
      result = result.filter((t) => t.isPublic);
    }

    if (user?.role === 'staff' && !canModify) {
      result = result.filter((t) => t.assignedTo === user.id || t.isPublic);
    }

    if (searchQuery) {
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter((t) => t.status === filterStatus);
    }

    if (filterCategory !== 'all') {
      result = result.filter((t) => t.category === filterCategory);
    }

    return result;
  }, [tasks, searchQuery, filterStatus, filterCategory, user]);

  const stats = useMemo(() => {
    const scheduled = getScheduledTasks().length;
    const inProgress = getInProgressTasks().length;
    const completed = getCompletedTasks().length;
    const overdue = getOverdueTasks().length;

    return { scheduled, inProgress, completed, overdue };
  }, [tasks]);

  const getPlotName = (plotId: string) => {
    const plot = plots.find((p) => p.id === plotId);
    return plot ? `Plot ${plot.plotNumber}` : 'N/A';
  };

  const getGraveName = (graveId: string) => {
    const grave = graves.find((g) => g.id === graveId);
    return grave ? `Grave ${grave.graveNumber}` : 'N/A';
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'scheduled':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getCategoryName = (category: TaskCategory) => {
    const names: Record<TaskCategory, string> = {
      cleaning: 'Cleaning',
      landscaping: 'Landscaping',
      repair: 'Repair',
      inspection: 'Inspection',
      other: 'Other',
    };
    return names[category];
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this maintenance task?')) {
      deleteTask(id);
    }
  };

  const handleEdit = (id: string) => {
    setSelectedTaskId(id);
    setShowEditForm(true);
  };

  const handleCompleteTask = (id: string) => {
    setSelectedTaskId(id);
    setCompletionNotes('');
    setShowCompleteDialog(true);
  };

  const submitComplete = () => {
    if (selectedTaskId && user) {
      markTaskComplete(selectedTaskId, user.id, completionNotes);
      setShowCompleteDialog(false);
      setSelectedTaskId(null);
      setCompletionNotes('');
    }
  };

  const handleStatusChange = (id: string, status: TaskStatus) => {
    updateTaskStatus(id, status);
  };

  const selectedTask = selectedTaskId ? getTaskById(selectedTaskId) : null;

  const statCards = [
    {
      title: 'Scheduled',
      value: stats.scheduled,
      icon: Calendar,
      gradient: 'from-amber-500 to-amber-600',
      bgGradient: 'from-amber-50 to-amber-100',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCheck,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Maintenance Schedule</h1>
            <p className="text-slate-600">Manage grave cleaning, landscaping, and repair tasks</p>
          </div>
          {canModify && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              New Task
            </Button>
          )}
        </div>

        <MaintenanceAlerts />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-3 shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-slate-600 mb-1">{stat.title}</h3>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white shadow-sm"
            />
          </div>

          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
            <SelectTrigger className="bg-white shadow-sm">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as any)}>
            <SelectTrigger className="bg-white shadow-sm">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
              <SelectItem value="landscaping">Landscaping</SelectItem>
              <SelectItem value="repair">Repair</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
            <div>
              <p className="text-sm text-slate-600">Total Tasks</p>
              <p className="text-2xl font-bold text-slate-900">{filteredTasks.length}</p>
            </div>
            <Filter className="h-5 w-5 text-slate-400" />
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Task</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Assigned To</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Scheduled</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Deadline</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{task.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        <div className="bg-slate-100 rounded px-2 py-1 inline-block">
                          {getPlotName(task.plotId)} / {getGraveName(task.graveId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {getCategoryName(task.category)}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {task.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Staff Member</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {new Date(task.scheduledDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {new Date(task.deadline).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                          {task.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {canComplete && task.status !== 'completed' && (
                            <>
                              {task.status === 'scheduled' && (
                                <button
                                  onClick={() => handleStatusChange(task.id, 'in_progress')}
                                  className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 hover:text-blue-700"
                                  title="Start task"
                                >
                                  <Clock className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleCompleteTask(task.id)}
                                className="p-2 rounded-lg hover:bg-green-100 text-green-600 hover:text-green-700"
                                title="Mark as complete"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          {canModify && (
                            <>
                              <button
                                onClick={() => handleEdit(task.id)}
                                className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 hover:text-blue-700"
                                title="Edit task"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(task.id)}
                                className="p-2 rounded-lg hover:bg-red-100 text-red-600 hover:text-red-700"
                                title="Delete task"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <p className="text-slate-600">No maintenance tasks found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && <MaintenanceTaskForm onClose={() => setShowForm(false)} />}

      {showEditForm && selectedTask && (
        <EditMaintenanceTaskForm
          task={selectedTask}
          onClose={() => {
            setShowEditForm(false);
            setSelectedTaskId(null);
          }}
        />
      )}

      {showCompleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900">Complete Task</h2>
              <button
                onClick={() => setShowCompleteDialog(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Completion Notes (Optional)
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Add any notes about the completed task..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setShowCompleteDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={submitComplete}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                >
                  Complete Task
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
