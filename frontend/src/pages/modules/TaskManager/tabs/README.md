# Task Manager Tabs

This directory contains the individual tab components for the Task Manager dashboard. Each tab is a separate, self-contained component that handles its own UI and logic.

## Components

### OverviewTab
- **File**: [OverviewTab.tsx](OverviewTab.tsx)
- **Purpose**: Displays monthly task statistics and quick action buttons
- **Props**: `monthlyTasksData`, `completionRateData`
- **Features**:
  - Bar chart for monthly task status
  - Line chart for completion rate
  - Quick action buttons for common tasks

### AnalyticsTab
- **File**: [AnalyticsTab.tsx](AnalyticsTab.tsx)
- **Purpose**: Shows task analytics and performance metrics
- **Props**: `priorityDistribution`
- **Features**:
  - Pie chart for task priority distribution
  - Performance metrics cards

### MyTasksTab
- **File**: [MyTasksTab.tsx](MyTasksTab.tsx)
- **Purpose**: Displays user's assigned tasks with filtering options
- **Props**: Multiple props for filters, data, and callbacks
- **Features**:
  - Filter by project, date, status, priority
  - Dynamic table with custom renderers
  - Loading and empty states

### KanbanTab
- **File**: [KanbanTab.tsx](KanbanTab.tsx)
- **Purpose**: Drag-and-drop kanban board for task management
- **Props**: `filterProject`
- **Features**:
  - Drag-and-drop task cards
  - Status column management
  - Quick add task functionality

### ShortcutsTab
- **File**: [ShortcutsTab.tsx](ShortcutsTab.tsx)
- **Purpose**: Quick access links to common task management actions
- **Props**: `taskCategories`
- **Features**:
  - Categorized shortcut cards
  - Navigation to different sections

### ActivitiesTab
- **File**: [ActivitiesTab.tsx](ActivitiesTab.tsx)
- **Purpose**: Shows recent task activities and updates
- **Props**: None
- **Features**:
  - Activity feed with timestamps
  - Icon-based activity types

## Architecture

Each tab component:
- Is a separate React functional component
- Uses TypeScript for type safety
- Follows consistent naming conventions
- Imports its own dependencies
- Receives data and callbacks via props from the parent TaskManager component

## Usage

Import tabs from the index file:

```typescript
import { OverviewTab, AnalyticsTab, MyTasksTab, KanbanTab, ShortcutsTab, ActivitiesTab } from "./tabs"
```

Use in TabsContent:

```tsx
<TabsContent value="overview">
  <OverviewTab monthlyTasksData={data} completionRateData={rates} />
</TabsContent>
```

## Benefits

- **Maintainability**: Each tab is isolated and easier to update
- **Reusability**: Tabs can be reused in other parts of the application
- **Testability**: Individual tabs can be tested independently
- **Code Organization**: Cleaner, more organized codebase
- **Performance**: Potential for code-splitting and lazy loading
