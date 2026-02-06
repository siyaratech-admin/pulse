import React, { useState, useEffect, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { DndContext, DragOverlay } from "@dnd-kit/core"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import { useFrappeGetDoc, useFrappeGetDocList, useFrappeUpdateDoc } from "frappe-react-sdk"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { KanbanColumn } from "./KanbanColumn"
import { KanbanCard } from "./KanbanCard"
import type { TaskNode } from "../../TaskTree"
import { useMeta } from "@/hooks/useMeta"

// Type for Frappe filters
type FrappeFilter = [string, string, any] | [string, string, string, any]

interface KanbanViewProps {
  doctype: string // e.g., "Task"
  columnField: string // e.g., "status"
  filters: FrappeFilter[] // e.g., [["project", "=", "VTP"]]
  projectName?: string // Optional: for quick add modal
}

export const KanbanView: React.FC<KanbanViewProps> = ({ doctype, columnField, filters, projectName }) => {
  const navigate = useNavigate()
  const location = useLocation()

  // State
  const [columnOrder, setColumnOrder] = useState<string[]>([])
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  // Hooks
  const { updateDoc } = useFrappeUpdateDoc()

  // Fetch DocType metadata to get column options
  const { data: docTypeMeta, isLoading: isLoadingMeta, error: metaError } = useMeta(doctype)

  // Fetch all tasks based on filters
  const {
    data: tasks,
    isLoading: isLoadingTasks,
    error: tasksError,
    mutate,
  } = useFrappeGetDocList<TaskNode>(doctype, {
    fields: [
      "name",
      "subject",
      "status",
      "priority",
      "_assign",
      "exp_end_date",
      "exp_start_date",
      "progress",
      "project",
      "description",
      "parent_task",
      "is_group",
    ],
    filters: filters,
    limit: 500,
    orderBy: { field: "modified", order: "desc" },
  })

  // Parse DocType metadata to get column options
  useEffect(() => {
    console.log("KanbanView Effect Running. Doctype:", doctype)
    console.log("docTypeMeta: 👍👍👍", docTypeMeta)

    if (docTypeMeta && docTypeMeta.fields) {
      const statusField = docTypeMeta.fields.find((f: any) => f.fieldname === columnField)
      console.log("statusField: 👍👍👍", statusField)
      if (statusField && statusField.options) {
        const cols = statusField.options
          .split("\n")
          .map((opt: string) => opt.trim())
          .filter((opt: string) => opt.length > 0)

        // Manual override: Ensure "On Hold" is present
        if (!cols.includes("On Hold")) {
          cols.push("On Hold")
        }

        setColumnOrder(cols)
      }
    }
  }, [docTypeMeta, columnField])

  // Process tasks into columns
  const columns = useMemo(() => {
    const map = new Map<string, TaskNode[]>()

    // Initialize empty arrays for each column
    columnOrder.forEach((col) => map.set(col, []))

    // Group tasks by status (or specified columnField)
    tasks?.forEach((task) => {
      const column = task[columnField as keyof TaskNode] as string
      if (column && map.has(column)) {
        map.get(column)!.push(task)
      } else {
        // If task has no status or invalid status, put in first column
        if (columnOrder.length > 0) {
          const firstCol = columnOrder[0]
          map.get(firstCol)!.push(task)
        }
      }
    })

    return map
  }, [tasks, columnOrder, columnField])

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string)
  }

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTaskId(null)

    if (!over || active.id === over.id || !tasks) return

    const taskName = active.id as string
    const newStatus = over.id as string

    // Find the task
    const task = tasks?.find((t) => t.name === taskName)
    if (!task) return

    const oldStatus = task[columnField as keyof TaskNode] as string

    // Don't do anything if status hasn't changed
    if (oldStatus === newStatus) return

    // Optimistic update
    const optimisticTasks = tasks.map((t) => (t.name === taskName ? { ...t, [columnField]: newStatus } : t))

    // Temporarily update the UI
    mutate(optimisticTasks as any, false)

    // API call to update backend
    try {
      await updateDoc(doctype, taskName, { [columnField]: newStatus })
      toast.success(`Task moved to ${newStatus}`)
      mutate() // Refresh data from server
    } catch (error: any) {
      toast.error(`Failed to update task: ${error.message || "Unknown error"}`)
      mutate() // Revert to actual server state
    }
  }

  // Handle quick add - redirect to new task form
  const handleQuickAdd = (status: string) => {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    const params = new URLSearchParams({
      status: status,
      returnUrl: returnUrl,
    })

    if (projectName) {
      params.append("project", projectName)
    }

    navigate(`/task-manager/new?${params.toString()}`)
  }

  // Handle task click - redirect to edit page
  const handleTaskClick = (task: TaskNode) => {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    navigate(`/task-manager/edit/${task.name}?returnUrl=${returnUrl}`)
  }

  // Refresh data when returning from task creation
  useEffect(() => {
    if (location.state?.refresh) {
      mutate()
      // Clear the state to prevent refresh on subsequent renders
      window.history.replaceState({}, document.title)
    }
  }, [location.state, mutate])

  // Find active task for drag overlay
  const activeTask = useMemo(() => {
    if (!activeTaskId) return null
    return tasks?.find((t) => t.name === activeTaskId) || null
  }, [activeTaskId, tasks])

  // Loading state
  if (isLoadingMeta || isLoadingTasks) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (metaError || tasksError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {metaError ? `Failed to load ${doctype} metadata` : `Failed to load tasks`}
        </AlertDescription>
      </Alert>
    )
  }

  // No columns state
  if (columnOrder.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No columns found for field "{columnField}" in {doctype}. Please check the DocType configuration.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columnOrder.map((columnName) => (
            <KanbanColumn
              key={columnName}
              id={columnName}
              title={columnName}
              tasks={columns.get(columnName) || []}
              onAddTask={() => handleQuickAdd(columnName)}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-3 opacity-80">
              <KanbanCard task={activeTask} isDragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </>
  )
}
