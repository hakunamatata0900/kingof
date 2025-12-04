# Maintenance Scheduling Module

## Overview
A comprehensive maintenance scheduling system for managing grave cleaning, landscaping, repairs, and inspections. All data is persisted on the frontend using localStorage.

## Features Implemented

### 1. MaintenanceContext (`contexts/MaintenanceContext.tsx`)
- State management for all maintenance tasks
- localStorage persistence under key `graveyard_maintenance`
- Automatic overdue task detection (runs every 60 seconds)
- Helper functions for task filtering and management
- Sample data included with 4 different task types

### 2. Task Management
**Task Categories:**
- Cleaning
- Landscaping
- Repair
- Inspection
- Other

**Task Statuses:**
- Scheduled: Task is planned for future
- In Progress: Task has been started
- Completed: Task is finished
- Overdue: Task deadline has passed

### 3. Role-Based Access Control

**Admin:**
- Create new maintenance tasks
- Edit all tasks
- Delete tasks
- Assign tasks to staff members
- View all tasks (public and private)

**Staff:**
- View assigned tasks
- Mark tasks as in progress
- Complete assigned tasks with completion notes
- View public tasks
- Cannot create, edit, or delete tasks

**Visitor:**
- View only public maintenance tasks
- Can see scheduled cleaning dates
- Cannot modify any tasks

### 4. Task Form (`components/MaintenanceTaskForm.tsx`)
- Create new maintenance tasks
- Fields: Title, description, category, assigned staff, plot/grave location, scheduled date, deadline
- Public visibility toggle
- Validation for required fields and date logic
- Integration with plots and graves data

### 5. Edit Task Form (`components/EditMaintenanceTaskForm.tsx`)
- Update existing task details
- Pre-filled with current task data
- Location (plot/grave) cannot be changed after creation
- Full editing capability for other fields

### 6. Maintenance Alerts (`components/MaintenanceAlerts.tsx`)
- Real-time alerts for overdue tasks
- Upcoming task notifications (next 3 days)
- Staff-specific alerts for assigned tasks
- Color-coded alert levels (red for overdue, amber for upcoming, blue for assigned)

### 7. Maintenance Dashboard (`app/maintenance/page.tsx`)
- Overview statistics:
  - Scheduled tasks count
  - In progress tasks count
  - Completed tasks count
  - Overdue tasks count
- Task filtering:
  - Search by title or description
  - Filter by status (scheduled/in progress/completed/overdue)
  - Filter by category (cleaning/landscaping/repair/inspection/other)
- Task table with:
  - Full task details
  - Location information
  - Assignment details
  - Action buttons based on role
- Complete task dialog with notes

### 8. Dashboard Integration (`app/page.tsx`)
- Added Active Maintenance card showing scheduled tasks
- Added Overdue Tasks card with alert styling
- Total Maintenance Tasks in Quick Stats

### 9. Navigation Updates
- Added Maintenance link to sidebar with Wrench icon
- Accessible to all authenticated users

## Task Lifecycle

1. **Creation**: Admin creates task with details and assigns to staff
2. **Notification**: Staff sees task in their assigned tasks alerts
3. **Start**: Staff marks task as "In Progress"
4. **Complete**: Staff completes task with optional notes
5. **History**: Completed tasks remain in system for reporting

## Automated Features

### Overdue Detection
- Runs automatically every 60 seconds
- Compares task deadlines with current date
- Auto-updates status from 'scheduled' or 'in_progress' to 'overdue'
- No manual intervention required

### Alerts & Reminders
- Visual alerts on dashboard for:
  - Overdue tasks (red alert)
  - Upcoming tasks within 3 days (amber alert)
  - Staff-specific assigned tasks (blue alert)
- Shows up to 3 tasks per alert with overflow indicator

## Data Structure

### MaintenanceTask Interface
```typescript
{
  id: string;
  graveId: string;
  plotId: string;
  title: string;
  description: string;
  category: 'cleaning' | 'landscaping' | 'repair' | 'inspection' | 'other';
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  assignedTo?: string;          // Staff user ID
  assignedBy?: string;          // Admin user ID
  scheduledDate: string;        // ISO date string
  deadline: string;             // ISO date string
  completedDate?: string;       // ISO date string
  completedBy?: string;         // Staff user ID
  notes?: string;               // Completion notes
  isPublic: boolean;            // Visible to visitors
  createdAt: Date;
  updatedAt: Date;
}
```

## Data Persistence
All maintenance tasks are stored in localStorage under the key `graveyard_maintenance`. Data persists across browser sessions and automatically syncs with context state.

## Sample Data
The system includes 4 sample tasks demonstrating:
1. Scheduled cleaning task (upcoming)
2. Landscaping task in progress
3. Completed repair task with notes
4. Overdue inspection task

## Usage Examples

### Creating a Task (Admin)
1. Navigate to Maintenance page
2. Click "New Task" button
3. Fill in task details
4. Assign to staff member
5. Set dates and visibility
6. Submit to create

### Completing a Task (Staff)
1. View assigned tasks in alerts or table
2. Click "Start task" icon to mark in progress
3. Click "Complete" icon when finished
4. Add completion notes
5. Submit to mark as completed

### Viewing Public Tasks (Visitor)
1. Navigate to Maintenance page
2. View only tasks marked as public
3. See scheduled cleaning dates
4. Cannot modify any tasks

## Technical Details
- Built with React Context API for state management
- localStorage for client-side persistence
- Responsive design for all screen sizes
- Type-safe with TypeScript
- Automatic overdue detection with setInterval
- Real-time alert system
- Integrated with existing graveyard management features

## Integration Points
- Uses existing plot and grave data from GraveyardContext
- Uses authentication and roles from AuthContext
- Follows same design patterns as Finance and Burial Records modules
- Seamlessly integrated into existing sidebar navigation
- Dashboard statistics include maintenance metrics
