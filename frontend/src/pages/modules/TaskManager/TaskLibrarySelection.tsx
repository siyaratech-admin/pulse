import React, { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useFrappePostCall, useFrappeDeleteDoc } from "frappe-react-sdk"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ChevronLeft, CheckCircle, Info, Plus, Table } from "lucide-react"
import { format } from "date-fns"
import TaskLibraryTree from "./components/TaskLibraryTree"
import LibraryAssignmentForm from "./components/LibraryAssignmentForm"
import type { TemplateTaskNode } from "./components/TemplateTreeNode"
import { useToast } from "@/hooks/use-toast"
import { LinkField } from "@/components/form/fields/SelectionFields"

const TaskLibrarySelection: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()

  // Get URL parameters
  const parentTask = searchParams.get("parentTask")
  const project = searchParams.get("project")
  const returnUrl = searchParams.get("returnUrl") || "/task-manager/tree"

  // State for manual selection (when URL params not provided)
  const [manualParentTask, setManualParentTask] = useState<string>("")
  const [manualProject, setManualProject] = useState<string>("")

  // State
  const [selectedTemplates, setSelectedTemplates] = useState<Map<string, TemplateTaskNode>>(new Map())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Use URL params if available, otherwise use manual selection
  const effectiveParentTask = parentTask || manualParentTask
  const effectiveProject = project || manualProject

  // API call
  const { call: createFromLibrary, loading: isCreating } = useFrappePostCall(
    "kb_task.api.task_assignment.create_tasks_from_library",
  )

  // Delete hook
  const { deleteDoc } = useFrappeDeleteDoc()

  const handleDeleteTemplate = async (taskName: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      await deleteDoc('Task', taskName)
      // We need to refresh the list in TaskLibraryTree. 
      // Since that component fetches its own data, we might need a way to trigger its refetch.
      // For now, we can force a re-render by toggling a key, or rely on SWR if setup.
      // TaskLibraryTree uses useFrappeGetDocList which utilizes SWR, so mutate from there would be ideal.
      // However, we don't have access to mutate here easily without lifting state up.
      // For simplicity in this context, we can force a reload or just let the user know.
      // Actually, TaskLibraryTree fetches data. Let's pass a refresh signal or key.
      setRefreshKey(prev => prev + 1)
    } catch (err: any) {
      console.error("Failed to delete template", err)

      // Try to parse server messages for detailed error
      let errorMessage = "An error occurred while deleting the template."
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

      toast({
        title: "Failed to delete template",
        description: errorMessage,
        variant: "destructive"
      })

      // Show Popup/Alert for LinkExistsError or if we have details
      if (err.exc_type === "LinkExistsError" || detailedError) {
        alert(`Cannot delete template:\n\n${detailedError.replace(/<[^>]*>/g, '') || errorMessage}`)
      }
    }
  }

  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreateTasks = async () => {
    // Validate all required fields
    if (selectedTemplates.size === 0 || !effectiveParentTask || !effectiveProject) {
      toast({
        title: "Validation Error",
        description: "Please select at least one template",
        variant: "destructive",
      })
      return
    }

    try {
      const templateIds = Array.from(selectedTemplates.keys())
      const payload = {
        parent_task: effectiveParentTask,
        project: effectiveProject,
        template_tasks: JSON.stringify(templateIds),
        assigned_to: null,
        exp_start_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
      }

      const result = await createFromLibrary(payload)

      if (result?.message?.success) {
        toast({
          title: "Tasks Created Successfully",
          description: `Created ${result.message.created_tasks?.length || 0} tasks from templates`,
        })

        // Navigate back to task tree
        navigate(decodeURIComponent(returnUrl))
      } else {
        const errorMsg = result?.message?.errors?.[0]?.error || "Unknown error occurred"
        toast({
          title: "Failed to Create Tasks",
          description: errorMsg,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create tasks",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate(decodeURIComponent(returnUrl))}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Task Tree
          </Button>
        </div>
      </div>

      {/* Page Title */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Create Tasks from Library</h1>
        <p className="text-white/80">Select template tasks to add to the project</p>
      </div>

      {/* Create Template Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() =>
            navigate(
              `/task-manager/bulk-template-create?project=${effectiveProject}&returnUrl=${encodeURIComponent(
                window.location.pathname + window.location.search
              )}`
            )
          }
          className="border-cyan-300 text-blue-700 hover:bg-blue-50"
        >
          <Table className="h-4 w-4 mr-2" />
          Bulk Create Templates
        </Button>
        <Button
          variant="default"
          onClick={() =>
            navigate(
              `/task-manager/template/new?project=${effectiveProject}&returnUrl=${encodeURIComponent(
                window.location.pathname + window.location.search
              )}`
            )
          }
          className="bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-700 hover:to-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Template Task
        </Button>
      </div>

      {/* Project and Parent Task Selection - Only shown if not in URL params */}
      {(!parentTask || !project) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Select Project and Parent Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertDescription>
                Please select a project and parent task to continue. These tasks will be created as children of the selected parent task.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <LinkField
                  field={{
                    fieldname: "project",
                    label: "Project",
                    fieldtype: "Link",
                    options: "Project",
                    reqd: 1,
                  }}
                  value={manualProject}
                  onChange={setManualProject}
                  showLabel={true}
                />
              </div>

              <div className="space-y-2">
                <LinkField
                  field={{
                    fieldname: "parent_task",
                    label: "Parent Task",
                    fieldtype: "Link",
                    options: "Task",
                    reqd: 1,
                  }}
                  value={manualParentTask}
                  onChange={setManualParentTask}
                  showLabel={true}
                />
              </div>
            </div>

            {manualProject && manualParentTask && (
              <Alert className="mt-4 bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  ✓ Ready to select templates! Scroll down to choose tasks from the library.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content - 2 Column Layout */}
      {effectiveParentTask && effectiveProject ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Task Library Tree (2/3 width) */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Task Library</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskLibraryTree
                  key={refreshKey}
                  selectedTasks={selectedTemplates}
                  onSelectionChange={setSelectedTemplates}
                  showActions={true}
                  onDeleteTemplate={handleDeleteTemplate}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Assignment Form (1/3 width) */}
          <div className="space-y-4">
            <LibraryAssignmentForm
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              selectedCount={selectedTemplates.size}
            />

            {/* Create Tasks Button */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCreateTasks}
                  disabled={isCreating || selectedTemplates.size === 0}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Tasks...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Create {selectedTemplates.size} {selectedTemplates.size === 1 ? "Task" : "Tasks"}
                    </>
                  )}
                </Button>

                {selectedTemplates.size > 0 && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Tasks will be created as children of the selected parent task
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Selected Templates Preview */}
            {selectedTemplates.size > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Selected Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {Array.from(selectedTemplates.values()).map((template) => (
                      <div
                        key={template.name}
                        className="flex items-center gap-2 p-2 bg-muted rounded text-sm"
                      >
                        <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                        <span className="truncate">{template.subject}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* Show message when project/parent task not yet selected */
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Select Project and Parent Task Above</p>
              <p className="text-sm mt-2">
                Once you've selected both, the task library will appear here for you to choose templates.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TaskLibrarySelection
