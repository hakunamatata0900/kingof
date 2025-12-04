"use client";

import { useMemo } from 'react';
import { useMaintenance } from '@/contexts/MaintenanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, Clock, Calendar, Bell } from 'lucide-react';

export default function MaintenanceAlerts() {
  const { tasks, getUpcomingTasks, getOverdueTasks } = useMaintenance();
  const { user } = useAuth();

  const alerts = useMemo(() => {
    const overdueTasks = getOverdueTasks();
    const upcomingTasks = getUpcomingTasks(3);
    const userTasks = user ? tasks.filter((t) => t.assignedTo === user.id && t.status !== 'completed') : [];

    return {
      overdue: overdueTasks,
      upcoming: upcomingTasks.filter((t) => t.status !== 'overdue'),
      myTasks: userTasks,
    };
  }, [tasks, user, getUpcomingTasks, getOverdueTasks]);

  if (alerts.overdue.length === 0 && alerts.upcoming.length === 0 && alerts.myTasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {alerts.overdue.length > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Overdue Tasks</h3>
              <p className="text-sm text-red-700 mb-2">
                {alerts.overdue.length} task{alerts.overdue.length !== 1 ? 's are' : ' is'} overdue and require immediate attention.
              </p>
              <div className="space-y-1">
                {alerts.overdue.slice(0, 3).map((task) => (
                  <div key={task.id} className="text-xs text-red-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="font-medium">{task.title}</span>
                    <span className="text-red-500">- Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                ))}
                {alerts.overdue.length > 3 && (
                  <p className="text-xs text-red-600 italic">
                    and {alerts.overdue.length - 3} more...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {alerts.upcoming.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">Upcoming Tasks</h3>
              <p className="text-sm text-amber-700 mb-2">
                {alerts.upcoming.length} task{alerts.upcoming.length !== 1 ? 's are' : ' is'} scheduled in the next 3 days.
              </p>
              <div className="space-y-1">
                {alerts.upcoming.slice(0, 3).map((task) => (
                  <div key={task.id} className="text-xs text-amber-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="font-medium">{task.title}</span>
                    <span className="text-amber-500">- {new Date(task.scheduledDate).toLocaleDateString()}</span>
                  </div>
                ))}
                {alerts.upcoming.length > 3 && (
                  <p className="text-xs text-amber-600 italic">
                    and {alerts.upcoming.length - 3} more...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {user?.role === 'staff' && alerts.myTasks.length > 0 && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Your Assigned Tasks</h3>
              <p className="text-sm text-blue-700 mb-2">
                You have {alerts.myTasks.length} active task{alerts.myTasks.length !== 1 ? 's' : ''} assigned to you.
              </p>
              <div className="space-y-1">
                {alerts.myTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="text-xs text-blue-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="font-medium">{task.title}</span>
                    <span className={`${task.status === 'overdue' ? 'text-red-600 font-semibold' : 'text-blue-500'}`}>
                      - {task.status === 'overdue' ? 'OVERDUE' : new Date(task.deadline).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {alerts.myTasks.length > 3 && (
                  <p className="text-xs text-blue-600 italic">
                    and {alerts.myTasks.length - 3} more...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
