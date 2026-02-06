import React, { useState, useMemo, useEffect } from "react"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { useFrappeGetDocList, useFrappeDeleteDoc } from "frappe-react-sdk"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Loader2, RefreshCw, ChevronLeft, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ProjectSelector from "./components/ProjectSelector"
import TaskTreeNode from "./components/TaskTreeNode"
import TaskCreationOptionsModal from "./components/TaskCreationOptionsModal"

export interface TaskNode {
  name: string
  subject: string
  description?: string
  parent_task: string | null
  is_group: 0 | 1
  status: string
  progress: number
  exp_start_date: string | null
  exp_end_date: string | null
  _assign: string
  priority?: string
  completed_by?: string
  completed_on?: string
  template_task?: string
  project?: string
  children: TaskNode[]
}

interface ProjectNode {
  name: string
  project_name: string
  isProjectNode: true
  children: TaskNode[]
}

interface Task {
  name: string
  subject: string
  description?: string
  parent_task: string | null
  is_group: 0 | 1
  status: string
  progress: number
  exp_start_date: string | null
  exp_end_date: string | null
  _assign: string
  priority?: string
  completed_by?: string
  completed_on?: string
  template_task?: string
  project: string
  project_title?: string // Fetched via project.project_name
}

interface ProjectNode {
  name: string // This is the ID (project)
  project_name: string // This used to be ID, now let's keep it as ID or Title? Let's use it as ID for compatibility or update usage.
  project_title: string // Human readable name
  isProjectNode: true
  children: TaskNode[]
}

const buildTaskTree = (tasks: Task[]): TaskNode[] => {
  if (!tasks || tasks.length === 0) return []

  const map = new Map<string, TaskNode>()
  const roots: TaskNode[] = []

  // First pass: populate map with all tasks
  tasks.forEach((task) => {
    map.set(task.name, {
      ...task,
      children: [],
    })
  })

  // Second pass: link children to parents
  tasks.forEach((task) => {
    const node = map.get(task.name)!

    if (task.parent_task) {
      const parent = map.get(task.parent_task)
      if (parent) {
        parent.children.push(node)
      } else {
        // Orphan task (parent not in current project)
        roots.push(node)
      }
    } else {
      // Root task
      roots.push(node)
    }
  })

  return roots
}

const buildProjectTree = (tasks: Task[]): ProjectNode[] => {
  if (!tasks || tasks.length === 0) return []

  // Group tasks by project (including tasks without project)
  const projectMap = new Map<string, { tasks: Task[], title: string }>()

  tasks.forEach((task) => {
    const projectId = task.project && task.project.trim() !== "" ? task.project : "[No Project]"
    // Use fetched project name or fallback to ID
    // Note: The field fetching might return it as "project_name" or "project.project_name" depending on driver.
    // We'll access it safely.
    const projectTitle = (task as any)["project.project_name"] || (task as any).project_name || projectId

    if (!projectMap.has(projectId)) {
      projectMap.set(projectId, { tasks: [], title: projectTitle })
    }
    projectMap.get(projectId)!.tasks.push(task)
  })

  // Build project nodes with task trees
  const projectNodes: ProjectNode[] = []

  projectMap.forEach((data, projectId) => {
    const taskTree = buildTaskTree(data.tasks)
    projectNodes.push({
      name: projectId, // ID
      project_name: projectId, // ID (keeping for potential compat)
      project_title: data.title, // Name
      isProjectNode: true,
      children: taskTree,
    })
  })

  // Sort projects by title
  projectNodes.sort((a, b) => {
    const nameA = a.project_title || ""
    const nameB = b.project_title || ""

    // Put [No Project] at the end
    if (a.name === "[No Project]") return 1
    if (b.name === "[No Project]") return -1

    return nameA.localeCompare(nameB)
  })

  return projectNodes
}

const TaskTree: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const projectName = searchParams.get("project") || undefined
  const navigate = useNavigate()
  const location = useLocation()
  const [showOptionsModal, setShowOptionsModal] = useState(false)

  // Determine if we're in "ALL" mode or single project mode
  const isAllMode = !projectName || projectName === "ALL"

  const { deleteDoc, loading: isDeleting } = useFrappeDeleteDoc()
  const { toast } = useToast()

  const handleDeleteTask = async (taskName: string) => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) return

    try {
      await deleteDoc('Task', taskName)
      mutate() // Refresh the list
      toast({
        title: "Success",
        description: `Task ${taskName} deleted successfully`,
      })
    } catch (err: any) {
      console.error('Failed to delete task', err)

      // Try to parse server messages for detailed error
      let errorMessage = "An error occurred while deleting the task."
      let detailedError = ""

      if (err._server_messages) {
        try {
          const messages = JSON.parse(err._server_messages)
          if (Array.isArray(messages) && messages.length > 0) {
            const msgObj = JSON.parse(messages[0])
            if (msgObj.message) {
              // Remove HTML tags for cleaner toast message, but keep for alert
              detailedError = msgObj.message
              errorMessage = msgObj.message.replace(/<[^>]*>/g, '')
            }
          }
        } catch (e) {
          console.error("Failed to parse server messages", e)
        }
      } else if (err.exception) {
        errorMessage = err.exception
      }

      // Show Toast (concise)
      toast({
        title: "Failed to delete task",
        description: errorMessage,
        variant: "destructive",
      })

      // Show Popup/Alert for LinkExistsError or if we have details
      if (err.exc_type === "LinkExistsError" || detailedError) {
        // We can use a simple alert for now as requested "popup"
        // Strip HTML for alert readability if needed, or just show it.
        // Using confirm/alert is the simplest "popup" without adding new UI state/components
        alert(`Cannot delete task:\n\n${detailedError.replace(/<[^>]*>/g, '') || errorMessage}`)
      }
    }
  }

  // Fetch tasks
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
      "progress",
      "exp_start_date",
      "exp_end_date",
      "_assign",
      "priority",
      "completed_by",
      "completed_on",
      "template_task",
      "project",
      "project.project_name" as any // Fetch project name
    ],
    filters: isAllMode ? [["status", "!=", "Cancelled"], ["is_template", "!=", 1]] : [["project", "=", projectName], ["status", "!=", "Cancelled"], ["is_template", "!=", 1]],
    limit: isAllMode ? 5000 : 1000, // Increased limits to show all tasks
    orderBy: { field: "tabTask.creation", order: "asc" },
  })

  // Build tree structure based on mode
  const treeData = useMemo(() => {
    if (!tasks) return []

    console.log("TaskTree: Building tree", {
      isAllMode,
      totalTasks: tasks.length,
      tasksWithProject: tasks.filter(t => t.project).length,
      tasksWithoutProject: tasks.filter(t => !t.project).length,
    })

    if (isAllMode) {
      const result = buildProjectTree(tasks)
      console.log("TaskTree: Project tree built", {
        projectCount: result.length,
        projects: result.map(p => ({ name: p.project_title, taskCount: p.children.length }))
      })
      return result
    }

    const result = buildTaskTree(tasks)
    console.log("TaskTree: Task tree built", { rootTaskCount: result.length })
    return result
  }, [tasks, isAllMode])

  const projectTreeData = isAllMode ? (treeData as ProjectNode[]) : null
  const taskTreeData = !isAllMode ? (treeData as TaskNode[]) : null

  // Force refetch when projectName changes
  useEffect(() => {
    if (projectName) {
      console.log("Project changed to:", projectName)
      mutate()
    }
  }, [projectName, mutate])

  const handleProjectChange = (newProject: string) => {
    if (newProject === "ALL") {
      navigate("/task-manager/tree")
    } else {
      navigate(`/task-manager/tree?project=${newProject}`)
    }
  }

  const handleAddMainTask = () => {
    setShowOptionsModal(true)
  }

  const handleCreateNew = () => {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    if (isAllMode) {
      navigate(`/task-manager/new?returnUrl=${returnUrl}`)
    } else {
      navigate(`/task-manager/new?project=${projectName}&returnUrl=${returnUrl}`)
    }
  }

  const handleCreateFromLibrary = () => {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    if (isAllMode) {
      navigate(`/task-manager/library-selection?returnUrl=${returnUrl}`)
    } else {
      navigate(`/task-manager/library-selection?project=${projectName}&returnUrl=${returnUrl}`)
    }
  }

  const handleBulkCreate = () => {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    if (isAllMode) {
      navigate(`/task-manager/bulk-create?returnUrl=${returnUrl}`)
    } else {
      navigate(`/task-manager/bulk-create?project=${projectName}&returnUrl=${returnUrl}`)
    }
  }

  const handleAddChildTask = (parentTaskName: string, taskProject?: string) => {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    const targetProject = taskProject || projectName
    navigate(`/task-manager/new?project=${targetProject}&parentTask=${parentTaskName}&returnUrl=${returnUrl}`)
  }

  const handleEditTask = (task: TaskNode) => {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    navigate(`/task-manager/edit/${task.name}?returnUrl=${returnUrl}`)
  }

  const handleRefresh = () => {
    mutate()
  }

  const handleSuccess = () => {
    mutate()
  }

  // Refresh data when returning from task creation
  useEffect(() => {
    if (location.state?.refresh) {
      mutate()
      // Clear the state to prevent refresh on subsequent renders
      window.history.replaceState({}, document.title)
    }
  }, [location.state, mutate])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/task-manager")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
          <div className="border-l h-6" />
          <ProjectSelector selectedProject={isAllMode ? "ALL" : projectName} onProjectChange={handleProjectChange} />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleAddMainTask}>
            <Plus className="h-4 w-4 mr-2" />
            Add Main Task
          </Button>
        </div>
      </div>

      {/* Project Info */}
      {isAllMode ? (
        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">Task Tree: All Projects</h1>
          <p className="text-white/80">
            {tasks?.length || 0} total tasks | {projectTreeData?.length || 0} projects
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">Task Tree: {projectName}</h1>
          <p className="text-white/80">
            {tasks?.length || 0} tasks | {taskTreeData?.length || 0} root tasks
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading task tree...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load tasks. Please try refreshing the page or contact support if the problem persists.
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !error && tasks && tasks.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No Tasks Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isAllMode
                  ? "No tasks found across all projects. Create a task to get started."
                  : "This project doesn't have any tasks yet. Create your first task to get started."}
              </p>
              <Button onClick={handleAddMainTask}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Task
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Tree - All Projects Mode */}
      {!isLoading && !error && isAllMode && projectTreeData && projectTreeData.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Task Hierarchy - All Projects</CardTitle>
            <Button onClick={handleAddMainTask} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] px-6 py-4">
              <div className="space-y-6 min-w-max">
                {projectTreeData.map((projectNode) => (
                  <div key={projectNode.name} className="space-y-2">
                    {/* Project Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-4 shadow-md">
                      <h3 className="text-lg font-semibold">{projectNode.project_title}</h3>
                      {projectNode.project_name !== "[No Project]" && (
                        <p className="text-xs text-white/60 font-mono mt-0.5 mb-1">{projectNode.project_name}</p>
                      )}
                      <p className="text-sm text-white/80">{projectNode.children.length} root tasks</p>
                    </div>
                    {/* Project Tasks */}
                    {projectNode.children.length > 0 ? (
                      <div className="pl-4 space-y-1">
                        {projectNode.children.map((rootTask) => (
                          <TaskTreeNode
                            key={rootTask.name}
                            task={rootTask}
                            level={0}
                            onAddChild={(parentTaskName) => handleAddChildTask(parentTaskName, rootTask.project)}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="pl-4 text-sm text-muted-foreground py-2">No tasks in this project</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Tree - Single Project Mode */}
      {!isLoading && !error && !isAllMode && taskTreeData && taskTreeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Task Hierarchy</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] px-6 py-4">
              <div className="space-y-1 min-w-max">
                {taskTreeData.map((rootTask) => (
                  <TaskTreeNode
                    key={rootTask.name}
                    task={rootTask}
                    level={0}
                    onAddChild={(parentTaskName) => handleAddChildTask(parentTaskName, projectName)}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Creation Options Modal */}
      <TaskCreationOptionsModal
        open={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        onCreateNew={handleCreateNew}
        onCreateFromLibrary={handleCreateFromLibrary}
        onBulkCreate={handleBulkCreate}
      />
    </div>
  )
}

export default TaskTree
