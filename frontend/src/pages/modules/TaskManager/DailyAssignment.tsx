import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useFrappePostCall } from "frappe-react-sdk"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import TaskLibraryTree from "./components/TaskLibraryTree"
import AssignmentForm from "./components/AssignmentForm"
import SelectedTasksPanel from "./components/SelectedTasksPanel"
import type { TemplateTaskNode } from "./components/TemplateTreeNode"

const DailyAssignment: React.FC = () => {
  const navigate = useNavigate()
  const { toast } = useToast()

  // Form state
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [selectedTasks, setSelectedTasks] = useState<Map<string, TemplateTaskNode>>(new Map())
  const [isAssigning, setIsAssigning] = useState(false)

  // API call hook
  const { call: batchAssignTasks } = useFrappePostCall("kb_task.api.task_assignment.batch_assign_tasks")

  // Helper function to find parent responsibility group name
  const getParentResponsibility = (task: TemplateTaskNode): string => {
    // Use the parent's subject (e.g., "Electrical", "Plumbing")
    // This is populated by TaskLibraryTree when building the tree
    return task.parent_subject || "General"
  }

  // Handle task selection changes from TaskLibraryTree
  const handleSelectionChange = (newSelectedTasks: Map<string, TemplateTaskNode>) => {
    setSelectedTasks(newSelectedTasks)
  }

  // Handle removing a single task from selection
  const handleRemoveTask = (taskName: string) => {
    const newSelectedTasks = new Map(selectedTasks)
    newSelectedTasks.delete(taskName)
    setSelectedTasks(newSelectedTasks)
  }

  // Clear form
  const handleClearForm = () => {
    setSelectedProject("")
    setSelectedDate(new Date())
    setSelectedUser("")
  }

  // Handle batch assignment
  const handleAssignTasks = async () => {
    if (selectedTasks.size === 0) {
      toast({
        title: "No tasks selected",
        description: "Please select at least one task to assign.",
        variant: "destructive",
      })
      return
    }

    if (!selectedProject || !selectedDate || !selectedUser) {
      toast({
        title: "Incomplete form",
        description: "Please fill in all required fields (Project, Date, User).",
        variant: "destructive",
      })
      return
    }

    setIsAssigning(true)

    try {
      // Build the assignments payload
      const tasks = Array.from(selectedTasks.values()).map((task) => ({
        template_task: task.name,
        responsibility: getParentResponsibility(task),
      }))

      // Get Daily Site Work task ID from environment variable
      const dailyWorkRootId = import.meta.env.VITE_DAILY_TASK_WORKS_ID

      const assignments = {
        project: selectedProject,
        date: format(selectedDate, "yyyy-MM-dd"),
        assigned_to: selectedUser,
        tasks: tasks,
        daily_work_root: dailyWorkRootId, // Pass pre-existing task ID
      }

      console.log("Assigning tasks:", assignments)

      // Call the batch assignment API
      const result = await batchAssignTasks({
        assignments: JSON.stringify(assignments),
      })

      console.log("=== API Response Debug ===")
      console.log("Full result object:", result)
      console.log("result.message:", result?.message)

      // Frappe wraps the response in a 'message' property
      const data = result?.message || result
      console.log("Extracted data (from result.message):", data)
      console.log("data.success:", data?.success)
      console.log("data.created_tasks:", data?.created_tasks)

      // Check if assignment was successful
      if (data && data.success) {
        const createdCount = data.created_tasks?.length || 0
        const errorCount = data.errors?.length || 0

        toast({
          title: "Tasks assigned successfully!",
          description: `Created ${createdCount} task${createdCount !== 1 ? "s" : ""}${errorCount > 0 ? ` with ${errorCount} error${errorCount !== 1 ? "s" : ""}` : ""
            }.`,
        })

        // Show errors if any
        if (errorCount > 0 && data.errors) {
          data.errors.forEach((error: any) => {
            console.error("Task assignment error:", error)
          })
          toast({
            title: `${errorCount} task${errorCount !== 1 ? "s" : ""} failed`,
            description: "Check console for details.",
            variant: "destructive",
          })
        }

        // Clear selections
        setSelectedTasks(new Map())

        // Navigate to TaskTree to view the created tasks
        navigate(`/task-manager/tree?project=${encodeURIComponent(selectedProject)}`)
      } else {
        // Handle failure
        const errorMsg = data?.errors?.[0]?.error || "Unknown error occurred"
        toast({
          title: "Failed to assign tasks",
          description: errorMsg,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Assignment error:", error)
      toast({
        title: "Error assigning tasks",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  // Handle task click (navigate to edit)
  const handleTaskClick = (taskName: string) => {
    navigate(`/task-manager/edit/${taskName}`)
  }

  return (
    <div className="p-6 space-y-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/task-manager")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
          <div className="border-l h-6" />
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">Daily Work Assignment</h1>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-4 flex-shrink-0">
        <p className="text-sm">
          Select tasks from your template library, specify assignment details, and batch-assign them
          to workers for a specific date.
        </p>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
        {/* Column 1: Task Library */}
        <div className="h-full overflow-hidden">
          <TaskLibraryTree
            selectedTasks={selectedTasks}
            onSelectionChange={handleSelectionChange}
            onEditTemplate={handleTaskClick}
          />
        </div>

        {/* Column 2: Assignment Form */}
        <div className="h-full overflow-hidden">
          <AssignmentForm
            selectedProject={selectedProject}
            selectedDate={selectedDate}
            selectedUser={selectedUser}
            onProjectChange={setSelectedProject}
            onDateChange={setSelectedDate}
            onUserChange={setSelectedUser}
            onClear={handleClearForm}
          />
        </div>

        {/* Column 3: Review & Submit */}
        <div className="h-full overflow-hidden">
          <SelectedTasksPanel
            selectedTasks={selectedTasks}
            selectedProject={selectedProject}
            selectedDate={selectedDate}
            selectedUser={selectedUser}
            isAssigning={isAssigning}
            onRemoveTask={handleRemoveTask}
            onAssignTasks={handleAssignTasks}
          />
        </div>
      </div>
    </div>
  )
}

export default DailyAssignment
