import React, { useMemo } from "react"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import TemplateTreeNode from "./TemplateTreeNode"
import type { TemplateTaskNode } from "./TemplateTreeNode"

interface Task {
  name: string
  subject: string
  description?: string
  parent_task: string | null
  is_group: 0 | 1
  status: string
  priority?: string
  is_template: 0 | 1
  project?: string

}

// Build tree structure for template tasks
const buildTaskTree = (tasks: Task[]): TemplateTaskNode[] => {
  if (!tasks || tasks.length === 0) return []

  const map = new Map<string, TemplateTaskNode>()
  const roots: TemplateTaskNode[] = []

  // First pass: populate map with all tasks
  tasks.forEach((task) => {
    map.set(task.name, {
      ...task,
      children: [],
    })
  })

  // Second pass: link children to parents and populate parent_subject
  tasks.forEach((task) => {
    const node = map.get(task.name)!

    if (task.parent_task) {
      const parent = map.get(task.parent_task)
      if (parent) {
        // Set the parent_subject to the parent's subject name
        node.parent_subject = parent.subject
        parent.children.push(node)
      } else {
        // Orphan task (parent not in template library)
        roots.push(node)
      }
    } else {
      // Root task
      roots.push(node)
    }
  })

  return roots
}

interface TaskLibraryTreeProps {
  selectedTasks: Map<string, TemplateTaskNode>
  onSelectionChange: (selectedTasks: Map<string, TemplateTaskNode>) => void
  showActions?: boolean
  onAddChild?: (parentTask: string, project: string) => void
  onEditTemplate?: (taskName: string) => void
  onDeleteTemplate?: (taskName: string) => void
}

const TaskLibraryTree: React.FC<TaskLibraryTreeProps> = ({
  selectedTasks,
  onSelectionChange,
  showActions = false,
  onAddChild,
  onEditTemplate,
  onDeleteTemplate,
}) => {
  // Fetch template tasks from "TASK TEMPLATE LIBRARY" project
  const {
    data: tasks,
    isLoading,
    error,
    mutate,
  } = useFrappeGetDocList<Task>("Task", {
    fields: [
      "name",
      "subject",
      "description",
      "parent_task",
      "is_group",
      "status",
      "priority",
    ],
    filters: [
      // ["project", "=", "PROJ-0010"],
      ["is_template", "=", 1],
    ],
    limit: 500,
    orderBy: { field: "subject", order: "asc" },
  })

  console.log("Fetched tasks with is_template filter:", tasks)

  // Test fetch without is_template filter for debugging
  // const {
  //   data: allProjectTasks,
  //   isLoading: allTasksLoading,
  //   error: allTasksError,
  // } = useFrappeGetDocList<Task>("Task", {
  //   fields: ["name", "subject", "project", "is_template"],
  //   filters: [["project", "=", "PROJ-0010"]],
  //   limit: 500,
  // })



  // Debug logging
  // console.log("=== TaskLibraryTree Debug ===")
  // console.log("Filters (with is_template):", [
  //   ["project", "=", "TASK TEMPLATE LIBRARY"],
  //   ["is_template", "=", 1],
  // ])
  // console.log("isLoading:", isLoading)
  // console.log("error:", error)
  // console.log("tasks data (with is_template filter):", tasks)
  // console.log("tasks count (with is_template filter):", tasks?.length || 0)
  // console.log("\n--- Without is_template filter ---")
  // console.log("allTasksLoading:", allTasksLoading)
  // console.log("allTasksError:", allTasksError)
  // console.log("allProjectTasks data:", allProjectTasks)
  // console.log("allProjectTasks count:", allProjectTasks?.length || 0)
  // if (allProjectTasks && allProjectTasks.length > 0) {
  //   console.log("Sample task from allProjectTasks:", allProjectTasks[0])
  //   console.log(
  //     "is_template values:",
  //     allProjectTasks.map((t) => ({ name: t.name, is_template: t.is_template }))
  //   )
  // }

  // Build tree structure
  const treeData = useMemo(() => {
    if (!tasks) return []
    return buildTaskTree(tasks)
  }, [tasks])

  // Convert Map to Set for easier checking
  const selectedTaskSet = useMemo(() => {
    return new Set(selectedTasks.keys())
  }, [selectedTasks])

  // Handle selection toggle
  const handleToggleSelection = (taskName: string, task: TemplateTaskNode) => {
    const newSelectedTasks = new Map(selectedTasks)

    if (newSelectedTasks.has(taskName)) {
      // Deselect this task and all its children
      const removeTaskAndChildren = (node: TemplateTaskNode) => {
        newSelectedTasks.delete(node.name)
        node.children.forEach((child) => removeTaskAndChildren(child))
      }
      removeTaskAndChildren(task)
    } else {
      // Select this task and all its children (if it's a group)
      const addTaskAndChildren = (node: TemplateTaskNode) => {
        // Only add non-group tasks to selection
        if (!node.is_group) {
          newSelectedTasks.set(node.name, node)
        }
        // But recurse through group children
        if (node.is_group) {
          node.children.forEach((child) => addTaskAndChildren(child))
        }
      }
      addTaskAndChildren(task)
    }

    onSelectionChange(newSelectedTasks)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Task Template Library</span>
          {tasks && (
            <span className="text-sm font-normal text-muted-foreground">
              {tasks.length} templates
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading templates...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load template library. Make sure "TASK TEMPLATE LIBRARY" project exists.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!tasks || tasks.length === 0) && (
          <div className="flex items-center justify-center py-12 px-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Create template tasks in the "TASK TEMPLATE LIBRARY" project first.
              </p>
              <p className="text-xs text-muted-foreground">
                Mark tasks as templates and organize them by responsibility (e.g., Plumbing, Electrical).
              </p>
            </div>
          </div>
        )}

        {/* Task Tree */}
        {!isLoading && !error && treeData.length > 0 && (
          <div className="overflow-y-auto h-full px-4 py-2">
            <div className="space-y-1">
              {treeData.map((rootTask) => (
                <TemplateTreeNode
                  key={rootTask.name}
                  task={rootTask}
                  level={0}
                  selectedTasks={selectedTaskSet}
                  onToggleSelection={handleToggleSelection}
                  showActions={showActions}
                  onAddChild={onAddChild}
                  onEditTemplate={onEditTemplate}
                  onDelete={onDeleteTemplate}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TaskLibraryTree
