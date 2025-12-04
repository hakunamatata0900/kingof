"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type TaskStatus = 'scheduled' | 'in_progress' | 'completed' | 'overdue';
export type TaskCategory = 'cleaning' | 'landscaping' | 'repair' | 'inspection' | 'other';

export interface MaintenanceTask {
  id: string;
  graveId: string;
  plotId: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  assignedTo?: string;
  assignedBy?: string;
  scheduledDate: string;
  deadline: string;
  completedDate?: string;
  completedBy?: string;
  notes?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MaintenanceContextType {
  tasks: MaintenanceTask[];
  addTask: (task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<MaintenanceTask>) => void;
  deleteTask: (id: string) => void;
  getTaskById: (id: string) => MaintenanceTask | undefined;
  getTasksByGrave: (graveId: string) => MaintenanceTask[];
  getTasksByUser: (userId: string) => MaintenanceTask[];
  getScheduledTasks: () => MaintenanceTask[];
  getCompletedTasks: () => MaintenanceTask[];
  getOverdueTasks: () => MaintenanceTask[];
  getInProgressTasks: () => MaintenanceTask[];
  markTaskComplete: (id: string, userId: string, notes?: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  getUpcomingTasks: (days: number) => MaintenanceTask[];
  checkOverdueTasks: () => void;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

const STORAGE_KEY = 'graveyard_maintenance';

export const MaintenanceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const tasksWithDates = parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        }));
        setTasks(tasksWithDates);
      } catch (error) {
        console.error('Failed to parse stored maintenance tasks');
      }
    } else {
      const sampleTasks: MaintenanceTask[] = [
        {
          id: '1',
          graveId: '1',
          plotId: '1',
          title: 'Quarterly Grave Cleaning',
          description: 'Deep cleaning of headstone and surrounding area',
          category: 'cleaning',
          status: 'scheduled',
          assignedTo: '2',
          assignedBy: '1',
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          isPublic: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          graveId: '2',
          plotId: '1',
          title: 'Landscaping Maintenance',
          description: 'Trim grass and remove weeds around grave site',
          category: 'landscaping',
          status: 'in_progress',
          assignedTo: '2',
          assignedBy: '1',
          scheduledDate: new Date().toISOString().split('T')[0],
          deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          isPublic: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
        {
          id: '3',
          graveId: '3',
          plotId: '1',
          title: 'Headstone Repair',
          description: 'Fix crack in headstone base',
          category: 'repair',
          status: 'completed',
          assignedTo: '2',
          assignedBy: '1',
          scheduledDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completedBy: '2',
          notes: 'Repair completed successfully. Used epoxy resin.',
          isPublic: false,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        },
        {
          id: '4',
          graveId: '4',
          plotId: '2',
          title: 'Winter Weather Inspection',
          description: 'Check for weather damage and debris',
          category: 'inspection',
          status: 'overdue',
          assignedTo: '2',
          assignedBy: '1',
          scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          isPublic: false,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];
      setTasks(sampleTasks);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleTasks));
    }
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks]);

  useEffect(() => {
    // Run check on mount and every minute. checkOverdueTasks uses a functional updater
    // so it does not need `tasks` in the dependency array and will avoid causing
    // re-renders when nothing actually changed.
    const interval = setInterval(() => {
      checkOverdueTasks();
    }, 60000);

    checkOverdueTasks();

    return () => clearInterval(interval);
  }, []);

  const checkOverdueTasks = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Use functional updater and only update state if at least one task changes.
    setTasks((prev) => {
      let changed = false;
      const updated = prev.map((task) => {
        if (
          (task.status === 'scheduled' || task.status === 'in_progress') &&
          task.deadline < today
        ) {
          changed = true;
          return { ...task, status: 'overdue', updatedAt: new Date() };
        }
        return task;
      });
      return changed ? updated : prev;
    });
  };

  const addTask = (task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: MaintenanceTask = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<MaintenanceTask>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const getTaskById = (id: string) => {
    return tasks.find((t) => t.id === id);
  };

  const getTasksByGrave = (graveId: string) => {
    return tasks.filter((t) => t.graveId === graveId);
  };

  const getTasksByUser = (userId: string) => {
    return tasks.filter((t) => t.assignedTo === userId);
  };

  const getScheduledTasks = () => {
    return tasks.filter((t) => t.status === 'scheduled');
  };

  const getCompletedTasks = () => {
    return tasks.filter((t) => t.status === 'completed');
  };

  const getOverdueTasks = () => {
    return tasks.filter((t) => t.status === 'overdue');
  };

  const getInProgressTasks = () => {
    return tasks.filter((t) => t.status === 'in_progress');
  };

  const markTaskComplete = (id: string, userId: string, notes?: string) => {
    updateTask(id, {
      status: 'completed',
      completedDate: new Date().toISOString().split('T')[0],
      completedBy: userId,
      notes: notes || undefined,
    });
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    updateTask(id, { status });
  };

  const getUpcomingTasks = (days: number) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    return tasks.filter(
      (t) =>
        (t.status === 'scheduled' || t.status === 'in_progress') &&
        t.scheduledDate <= futureDateStr
    );
  };

  const value: MaintenanceContextType = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    getTaskById,
    getTasksByGrave,
    getTasksByUser,
    getScheduledTasks,
    getCompletedTasks,
    getOverdueTasks,
    getInProgressTasks,
    markTaskComplete,
    updateTaskStatus,
    getUpcomingTasks,
    checkOverdueTasks,
  };

  return (
    <MaintenanceContext.Provider value={value}>
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenance must be used within MaintenanceProvider');
  }
  return context;
};
