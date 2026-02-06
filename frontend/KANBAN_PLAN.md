# Kanban Board Implementation Plan

## Overview

Create a reusable, metadata-driven Kanban board component that works with any Frappe DocType. Initially integrated into TaskManager as a new view for Task management.

**Approach:** "Simpler" MVP implementation
- Columns derived from DocType metadata (not Kanban Board DocType)
- Drag-and-drop updates status field only (no visual order persistence)
- Fixed card fields (not customizable in MVP)
- Reusable for any DocType

---

## Core Architecture

### Component Hierarchy

```
TaskManager.tsx (Parent)
└── KanbanView.tsx (Main Container)
    ├── KanbanColumn.tsx (Droppable Area)
    │   └── KanbanCard.tsx (Draggable Item)
    ├── EditTaskModal.tsx (Reused - existing)
    └── QuickAddModal.tsx (Reused - modified)
```

### Data Flow

```
1. Parent → KanbanView
   - Props: doctype, columnField, filters

2. KanbanView fetches:
   - DocType metadata → parse column options
   - Task documents → group by status

3. User drags card:
   - Optimistic UI update (instant feedback)
   - API call to update status
   - On error: revert + show toast
```

---

## Phase 1: Dependencies & Setup

### 1.1 Install Required Packages

```bash
cd pulse/frontend
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Why @dnd-kit?**
- Modern, lightweight, accessibility-first
- Built for React 18+
- Excellent TypeScript support
- Touch-friendly (mobile support)
- Active maintenance

### 1.2 Create Component Directory Structure

```
pulse/frontend/src/pages/modules/TaskManager/components/kanban/
├── KanbanView.tsx       # Main container component
├── KanbanColumn.tsx     # Column component with droppable area
└── KanbanCard.tsx       # Draggable task card component
```

---

## Phase 2: Component Implementation

### 2.1 KanbanView.tsx (Main Container)

**Purpose:** Container that orchestrates the entire board

**Props:**
```typescript
interface KanbanViewProps {
  doctype: string          // e.g., "Task"
  columnField: string      // e.g., "status"
  filters: FrappeFilter[]  // e.g., [["project", "=", "VTP"]]
}
```

**State:**
```typescript
const [columnOrder, setColumnOrder] = useState<string[]>([])  // ["Open", "Working", ...]
const [columns, setColumns] = useState<Map<string, TaskNode[]>>(new Map())
const [isLoading, setIsLoading] = useState(true)
```

**Key Hooks:**

1. **Fetch DocType Metadata** (for columns)
```typescript
const { data: docTypeMeta } = useFrappeGetDoc("DocType", props.doctype)

useEffect(() => {
  if (docTypeMeta) {
    const statusField = docTypeMeta.fields.find(f => f.fieldname === props.columnField)
    if (statusField && statusField.options) {
      const cols = statusField.options.split('\n').filter(Boolean)
      setColumnOrder(cols)
    }
  }
}, [docTypeMeta])
```

2. **Fetch Tasks**
```typescript
const { data: tasks, isLoading, mutate } = useFrappeGetDocList("Task", {
  fields: ["name", "subject", "status", "priority", "_assign", "exp_end_date", "progress", "project"],
  filters: props.filters,
  limit: 500,
  orderBy: { field: "modified", order: "desc" }
})
```

3. **Process Tasks into Columns**
```typescript
const processedColumns = useMemo(() => {
  const map = new Map<string, TaskNode[]>()

  // Initialize empty arrays for each column
  columnOrder.forEach(col => map.set(col, []))

  // Group tasks by status
  tasks?.forEach(task => {
    const column = task[props.columnField] || "Open"
    if (map.has(column)) {
      map.get(column)!.push(task)
    }
  })

  return map
}, [tasks, columnOrder])
```

4. **Drag-and-Drop Handler**
```typescript
const { updateDoc } = useFrappeUpdateDoc()

const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event
  if (!over || active.id === over.id) return

  const taskName = active.id as string
  const newStatus = over.id as string

  // Find the task
  const task = tasks?.find(t => t.name === taskName)
  if (!task) return

  const oldStatus = task.status

  // Optimistic update
  setColumns(prevColumns => {
    const newColumns = new Map(prevColumns)

    // Remove from old column
    const oldCol = newColumns.get(oldStatus) || []
    newColumns.set(oldStatus, oldCol.filter(t => t.name !== taskName))

    // Add to new column
    const newCol = newColumns.get(newStatus) || []
    newColumns.set(newStatus, [...newCol, { ...task, status: newStatus }])

    return newColumns
  })

  // API call
  try {
    await updateDoc("Task", taskName, { status: newStatus })
    mutate() // Refresh data
  } catch (error) {
    // Revert on error
    toast.error("Failed to update task status")
    mutate() // Refresh to get correct state
  }
}
```

**Rendering:**
```typescript
return (
  <DndContext onDragEnd={handleDragEnd}>
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columnOrder.map(columnName => (
        <KanbanColumn
          key={columnName}
          title={columnName}
          tasks={columns.get(columnName) || []}
          onAddTask={() => handleQuickAdd(columnName)}
        />
      ))}
    </div>
  </DndContext>
)
```

---

### 2.2 KanbanColumn.tsx (Column Component)

**Purpose:** Represents one status column (droppable area)

**Props:**
```typescript
interface KanbanColumnProps {
  title: string             // "Open", "Working", etc.
  tasks: TaskNode[]         // Tasks in this column
  onAddTask: () => void     // Callback for "+ Add Task"
}
```

**Key Features:**
- Column header with title and count
- "+ Add Task" button
- Droppable area using `useDroppable` from @dnd-kit
- Maps over tasks to render KanbanCard

**Implementation:**
```typescript
const { setNodeRef } = useDroppable({ id: props.title })

return (
  <div className="flex-shrink-0 w-80">
    {/* Header */}
    <div className="flex items-center justify-between p-3 bg-gray-100 rounded-t-lg">
      <h3 className="font-semibold">{props.title}</h3>
      <Badge>{props.tasks.length}</Badge>
    </div>

    {/* Add Button */}
    <Button onClick={props.onAddTask} className="w-full">
      + Add Task
    </Button>

    {/* Droppable Area */}
    <div ref={setNodeRef} className="min-h-[500px] p-2 bg-gray-50 rounded-b-lg">
      {props.tasks.map(task => (
        <KanbanCard key={task.name} task={task} />
      ))}
    </div>
  </div>
)
```

---

### 2.3 KanbanCard.tsx (Card Component)

**Purpose:** Represents one task (draggable item)

**Props:**
```typescript
interface KanbanCardProps {
  task: TaskNode
}
```

**Fixed Display Fields:**
- **Subject** (title)
- **Priority** badge (High, Medium, Low, Urgent)
- **Assignee avatars** (parsed from `_assign` JSON)
- **Due date** (`exp_end_date`)
- **Progress bar** (0-100%)

**Key Features:**
- Draggable using `useDraggable` from @dnd-kit
- Clickable to open EditTaskModal
- Styled card with shadow and hover effects

**Implementation:**
```typescript
const { attributes, listeners, setNodeRef, transform } = useDraggable({
  id: props.task.name
})

const style = transform ? {
  transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
} : undefined

// Parse assignees
const assignees = useMemo(() => {
  try {
    return props.task._assign ? JSON.parse(props.task._assign) : []
  } catch {
    return []
  }
}, [props.task._assign])

return (
  <div
    ref={setNodeRef}
    style={style}
    {...attributes}
    {...listeners}
    className="bg-white p-3 rounded-lg shadow mb-2 cursor-move hover:shadow-md"
  >
    {/* Subject */}
    <h4 className="font-medium text-sm mb-2">{props.task.subject}</h4>

    {/* Priority Badge */}
    {props.task.priority && (
      <Badge variant={getPriorityVariant(props.task.priority)}>
        {props.task.priority}
      </Badge>
    )}

    {/* Assignees */}
    {assignees.length > 0 && (
      <div className="flex gap-1 mt-2">
        {assignees.map(user => (
          <Avatar key={user} className="h-6 w-6">
            <AvatarFallback>{user[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        ))}
      </div>
    )}

    {/* Due Date */}
    {props.task.exp_end_date && (
      <div className="text-xs text-muted-foreground mt-2">
        Due: {format(new Date(props.task.exp_end_date), "MMM dd")}
      </div>
    )}

    {/* Progress Bar */}
    <div className="mt-2">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600"
          style={{ width: `${props.task.progress || 0}%` }}
        />
      </div>
    </div>
  </div>
)
```

---

## Phase 3: Integration with Existing Components

### 3.1 Modify QuickAddModal.tsx

**Change:** Add optional `initialStatus` prop

```typescript
interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  projectName?: string
  initialStatus?: string  // NEW PROP
}
```

**Usage:** When "+ Add Task" is clicked in "Working" column, pass `initialStatus="Working"`

**Implementation:** Pre-populate the status field when provided
```typescript
useEffect(() => {
  if (props.initialStatus) {
    setValue("status", props.initialStatus)
  }
}, [props.initialStatus])
```

---

### 3.2 Add Kanban Tab to TaskManager.tsx

**Modifications:**

1. **Update imports:**
```typescript
import { KanbanView } from "./components/kanban/KanbanView"
```

2. **Update TabsList:**
```typescript
// Change: grid-cols-5 → grid-cols-6
<TabsList className="grid w-full grid-cols-6">
  <TabsTrigger value="overview">Overview</TabsTrigger>
  <TabsTrigger value="analytics">Analytics</TabsTrigger>
  <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
  <TabsTrigger value="kanban">Kanban Board</TabsTrigger>  {/* NEW */}
  <TabsTrigger value="shortcuts">Quick Access</TabsTrigger>
  <TabsTrigger value="activities">Activities</TabsTrigger>
</TabsList>
```

3. **Add TabsContent:**
```typescript
<TabsContent value="kanban" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Trello className="h-5 w-5" />
        Kanban Board
      </CardTitle>
      <CardDescription>
        Drag and drop tasks to update their status
      </CardDescription>
    </CardHeader>
    <CardContent>
      <KanbanView
        doctype="Task"
        columnField="status"
        filters={[
          ["project", "=", selectedProject],
          // Add more filters as needed
        ]}
      />
    </CardContent>
  </Card>
</TabsContent>
```

---

## Phase 4: Filtering & Hierarchy Support

### 4.1 Filter Examples

**Show all tasks for a project:**
```typescript
<KanbanView
  doctype="Task"
  columnField="status"
  filters={[
    ["project", "=", "VTP"]
  ]}
/>
```

**Show tasks for Daily Site Work on specific date:**
```typescript
const dailyWorkRootId = import.meta.env.VITE_DAILY_TASK_WORKS_ID
const currentDate = format(new Date(), "yyyy-MM-dd")

// Fetch date group
const { data: dateGroups } = useFrappeGetDocList("Task", {
  fields: ["name", "lft", "rgt"],
  filters: [
    ["parent_task", "=", dailyWorkRootId],
    ["subject", "=", currentDate],
    ["is_group", "=", 1],
  ],
  limit: 1,
})

const dateGroup = dateGroups?.[0]

// Show Kanban with hierarchy filter
<KanbanView
  doctype="Task"
  columnField="status"
  filters={
    dateGroup ? [
      ["lft", ">", dateGroup.lft],
      ["rgt", "<", dateGroup.rgt],
      ["is_group", "=", 0],
    ] : []
  }
/>
```

### 4.2 Column Derivation (Automatic)

Columns are **automatically derived** from DocType metadata:

1. Fetch DocType "Task"
2. Find field with `fieldname === "status"`
3. Parse `field.options.split('\n')`
4. Result: `["Open", "Working", "Pending Review", "Completed", "Cancelled", "Template"]`

**No hardcoding required!**

---

## Phase 5: UI/UX Guidelines

### 5.1 Loading States

```typescript
{isLoading && (
  <div className="flex items-center justify-center py-12">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
)}
```

### 5.2 Empty States

**Per Column:**
```typescript
{tasks.length === 0 && (
  <div className="text-center py-8 text-muted-foreground">
    No tasks in this column
  </div>
)}
```

**Entire Board:**
```typescript
{!selectedProject && (
  <Alert>
    <AlertDescription>
      Please select a project to view the Kanban board
    </AlertDescription>
  </Alert>
)}
```

### 5.3 Error Handling

```typescript
try {
  await updateDoc("Task", taskName, { status: newStatus })
  toast.success("Task status updated")
} catch (error) {
  toast.error("Failed to update task status. Please try again.")
  mutate() // Revert to actual state
}
```

### 5.4 Styling Guidelines

**Column Styling:**
- Width: `w-80` (320px fixed)
- Background: `bg-gray-50`
- Border radius: `rounded-lg`
- Min height: `min-h-[500px]`

**Card Styling:**
- Background: `bg-white`
- Padding: `p-3`
- Shadow: `shadow` (hover: `shadow-md`)
- Margin bottom: `mb-2`
- Cursor: `cursor-move`

**Board Container:**
- Flex layout: `flex gap-4`
- Horizontal scroll: `overflow-x-auto`
- Padding bottom: `pb-4` (for scrollbar space)

---

## Phase 6: Testing & Validation

### 6.1 Test Cases

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 1 | View board with no tasks | Show empty state per column |
| 2 | Drag task Open → Working | Task moves, status updates in backend |
| 3 | Drag task and API fails | Task reverts to original column, toast shown |
| 4 | Click card | EditTaskModal opens with task data |
| 5 | Click "+ Add Task" in Working | QuickAddModal opens with status="Working" |
| 6 | Filter by project | Only project tasks show |
| 7 | Filter by Daily Site Work hierarchy | Only nested tasks show |
| 8 | Create new task in column | Task appears in correct column immediately |

### 6.2 Manual Testing Checklist

- [ ] Install dependencies successfully
- [ ] All components compile without errors
- [ ] Board renders with correct columns
- [ ] Tasks display in correct columns
- [ ] Drag-and-drop works smoothly
- [ ] Optimistic updates work
- [ ] Error handling reverts correctly
- [ ] EditTaskModal opens on card click
- [ ] QuickAddModal pre-populates status
- [ ] Filters work correctly
- [ ] Loading states display properly
- [ ] Empty states display properly
- [ ] Mobile responsive (horizontal scroll)

---

## Files to Create/Modify

### ✅ New Files (4)

1. **KANBAN_PLAN.md** (this file)
   - `pulse/frontend/KANBAN_PLAN.md`

2. **KanbanView.tsx**
   - `pulse/frontend/src/pages/modules/TaskManager/components/kanban/KanbanView.tsx`
   - ~250 lines
   - Main container with drag-drop logic

3. **KanbanColumn.tsx**
   - `pulse/frontend/src/pages/modules/TaskManager/components/kanban/KanbanColumn.tsx`
   - ~80 lines
   - Droppable column component

4. **KanbanCard.tsx**
   - `pulse/frontend/src/pages/modules/TaskManager/components/kanban/KanbanCard.tsx`
   - ~100 lines
   - Draggable task card

### 📝 Modified Files (2)

1. **QuickAddModal.tsx**
   - `pulse/frontend/src/pages/modules/TaskManager/components/QuickAddModal.tsx`
   - Add `initialStatus` prop (line ~10)
   - Pre-populate status field (line ~50)

2. **TaskManager.tsx**
   - `pulse/frontend/src/pages/modules/TaskManager/TaskManager.tsx`
   - Add import (line ~15)
   - Update TabsList grid-cols (line ~280)
   - Add Kanban TabsTrigger (line ~285)
   - Add Kanban TabsContent (line ~500)

### 📦 Configuration

1. **package.json**
   - Add @dnd-kit dependencies

---

## Key Technical Decisions

### ✅ What We're Doing (MVP)

- **Metadata-driven columns** - Fetch from DocType status field options
- **Status field only** - Drag updates task.status, no visual order
- **Fixed card fields** - Subject, priority, assignees, date, progress
- **Reusable component** - Works with any DocType via props
- **Optimistic updates** - Instant UI feedback, revert on error
- **Existing modal reuse** - EditTaskModal, QuickAddModal (modified)

### ❌ What We're NOT Doing (Out of Scope)

- **Kanban Board DocType** - Not using Frappe's kanban_board.py APIs
- **Visual order persistence** - Not saving card positions within columns
- **Swimlanes** - No grouping by priority/assignee
- **Custom column management** - Can't add/remove/reorder columns
- **Card field customization** - Can't show/hide fields per user
- **Board configuration persistence** - No saved board views
- **Bulk operations** - Can't drag multiple cards
- **Real-time collaboration** - No WebSocket updates

---

## Future Enhancements (Backlog)

### Phase 2 (Post-MVP)

1. **Swimlanes**
   - Group by: Priority, Assignee, Project
   - Toggle view in settings

2. **Column Customization**
   - Add custom columns (beyond status values)
   - Reorder columns via drag-drop
   - Show/hide columns

3. **Card Field Customization**
   - User picks which fields to display
   - Saved per user in localStorage
   - Similar to Frappe's kanban_settings.js

4. **Advanced Filters**
   - Date range picker
   - Multi-select assignees
   - Custom field filters
   - Save filter presets

### Phase 3 (Advanced)

1. **Board Configuration Persistence**
   - Create custom Kanban Board DocType
   - Save board settings (columns, fields, filters)
   - Multiple boards per project
   - Private vs shared boards

2. **Visual Order Persistence**
   - Save card order within columns
   - Use Frappe's kanban_board.py approach
   - Store order array per column

3. **Bulk Operations**
   - Multi-select cards
   - Bulk status update
   - Bulk assignment

4. **Real-time Collaboration**
   - WebSocket integration
   - Live updates when other users change tasks
   - Show who's viewing/editing

---

## Estimated Implementation Timeline

| Phase | Task | Estimated Time |
|-------|------|----------------|
| 1 | Create documentation + setup | 30 min |
| 2 | Install dependencies | 10 min |
| 3 | Create KanbanView.tsx | 2 hours |
| 4 | Create KanbanColumn.tsx | 45 min |
| 5 | Create KanbanCard.tsx | 1 hour |
| 6 | Modify QuickAddModal.tsx | 30 min |
| 7 | Modify TaskManager.tsx | 30 min |
| 8 | Testing & bug fixes | 1 hour |
| 9 | UI polish & refinements | 45 min |

**Total: ~7-8 hours**

---

## Troubleshooting Guide

### Issue: Columns not showing

**Cause:** DocType metadata not loaded or field options empty

**Fix:**
1. Check if `useFrappeGetDoc("DocType", "Task")` returns data
2. Verify "status" field has options in Task DocType
3. Check console for parsing errors

---

### Issue: Drag-and-drop not working

**Cause:** DndContext not wrapping components correctly

**Fix:**
1. Ensure `<DndContext>` wraps all columns
2. Verify `useDraggable` in KanbanCard
3. Verify `useDroppable` in KanbanColumn
4. Check console for @dnd-kit errors

---

### Issue: Task status not updating in backend

**Cause:** API call failing or wrong field name

**Fix:**
1. Check network tab for API errors
2. Verify `updateDoc("Task", taskName, { status: newStatus })` syntax
3. Check Frappe permissions for Task doctype
4. Verify status value is valid (matches field options)

---

### Issue: Optimistic update stuck after error

**Cause:** Not reverting state on API failure

**Fix:**
1. Ensure `catch` block calls `mutate()` to refresh data
2. Check if error toast is displayed
3. Verify try-catch wraps the `updateDoc` call

---

## References

### Frappe Resources
- [Frappe DocType API](https://frappeframework.com/docs/user/en/api/frappe-model)
- [frappe-react-sdk Hooks](https://github.com/nikkothari22/frappe-react-sdk)

### @dnd-kit Resources
- [Official Documentation](https://docs.dndkit.com/)
- [Sortable Example](https://docs.dndkit.com/presets/sortable)
- [Touch Support](https://docs.dndkit.com/api-documentation/sensors)

### Codebase References
- Task DocType: `frappe/frappe/projects/doctype/task/`
- Frappe Kanban: `frappe/frappe/desk/doctype/kanban_board/`
- TaskManager: `pulse/frontend/src/pages/modules/TaskManager/`

---

## Glossary

- **DocType** - Frappe's term for a database table/model
- **Nested Set Model** - Tree hierarchy using `lft`/`rgt` fields
- **Optimistic Update** - Update UI immediately before API confirms
- **Droppable** - Component that accepts dragged items
- **Draggable** - Component that can be dragged
- **Swimlane** - Horizontal grouping in Kanban board

---

## Contact & Support

For questions or issues:
1. Check this documentation first
2. Review Frappe/React docs
3. Check console for errors
4. Test with minimal filters to isolate issue

---

**Last Updated:** 2025-11-13
**Version:** 1.0.0
**Status:** Ready for Implementation
