import React, { useState, useMemo, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useFrappeGetDocList, useFrappeDeleteDoc } from "frappe-react-sdk"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, ListTree, Filter, Plus } from "lucide-react"
import { DynamicTable } from "@/components/custom_components/dynamic-table"
import { usePagination } from "@/hooks/usePagination"
import { useFilters } from "@/hooks/useFilters"
import { useDataFetch } from "@/hooks/useDataFetch"
import ProjectSelector from "./components/ProjectSelector"
import TaskCreationOptionsModal from "./components/TaskCreationOptionsModal"
import { useToast } from "@/hooks/use-toast"
import { StandardHeader } from "@/components/common/StandardHeader"
import type { TaskNode } from "./TaskTree"

const TaskList: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const { deleteDoc, loading: isDeleting } = useFrappeDeleteDoc()
  const { toast } = useToast()

  // Stable empty objects to prevent infinite re-renders
  const validationRules = useMemo(() => ({}), [])
  const errors = useMemo(() => [], [])

  // Filters hook
  const { frappeFilters, setFilter } = useFilters()

  // Build combined filters
  const combinedFilters = selectedProject
    ? [...frappeFilters, ["project", "=", selectedProject]]
    : frappeFilters

  // Pagination hook
  const {
    currentPage,
    pageSize,
    setPageSize,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage,
    limitStart,
    totalPages,
    totalItems,
    isLoading: paginationLoading,
  } = usePagination({
    doctype: "Task",
    filters: combinedFilters,
  })

  // Data fetching hook
  const {
    data: taskData = [],
    isLoading: dataLoading,
    refetch,
  } = useDataFetch({
    doctype: "Task",
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
      "priority",
      "completed_by",
      "completed_on",
    ],
    limitStart,
    limit: pageSize,
    orderBy: {
      field: "modified",
      order: "desc",
    },
    filters: combinedFilters,
  })

  // Get list of projects for quick access
  const { data: projects = [] } = useFrappeGetDocList("Project", {
    fields: ["name", "project_name"],
    filters: [["status", "=", "Open"]],
    limit: 10,
  })

  const isLoading = dataLoading || paginationLoading

  const handleStatusFilter = (value: string) => {
    if (value === "all") {
      setFilter("status", "")
    } else {
      setFilter("status", value)
    }
  }

  const handleView = (task: any) => {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    navigate(`/task-manager/edit/${task.name}?returnUrl=${returnUrl}`)
  }

  const handleEdit = (task: any) => {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    navigate(`/task-manager/edit/${task.name}?returnUrl=${returnUrl}`)
  }

  const handleDelete = async (task: any) => {
    if (!confirm(`Are you sure you want to delete "${task.subject}"?`)) return

    try {
      await deleteDoc('Task', task.name)
      if (refetch) refetch()
      toast({
        title: "Success",
        description: `Task ${task.subject} deleted successfully`,
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
        alert(`Cannot delete task "${task.subject}":\n\n${detailedError.replace(/<[^>]*>/g, '') || errorMessage}`)
      }
    }
  }

  const handleCreateNew = () => {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    navigate(`/task-manager/new?project=${selectedProject}&returnUrl=${returnUrl}`)
  }

  const handleCreateFromLibrary = () => {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    navigate(`/task-manager/library-selection?project=${selectedProject}&returnUrl=${returnUrl}`)
  }

  const handleBulkCreate = () => {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    navigate(`/task-manager/bulk-create?project=${selectedProject}&returnUrl=${returnUrl}`)
  }

  // Refresh data when returning from edit page
  useEffect(() => {
    if (location.state?.refresh) {
      if (refetch) refetch()
      // Clear the state to prevent refresh on subsequent renders
      window.history.replaceState({}, document.title)
    }
  }, [location.state, refetch])

  const customBadgeVariants = {
    status: {
      Open: "secondary",
      Working: "default",
      "Pending Review": "warning",
      Overdue: "destructive",
      Completed: "success",
      Cancelled: "outline",
      Template: "outline",
    },
    priority: {
      Low: "secondary",
      Medium: "default",
      High: "warning",
      Urgent: "destructive",
    },
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <StandardHeader
        title="Task List"
        subtitle="View and manage all tasks in table format"
        showBack={true}
        onBack={() => navigate("/task-manager")}
        actions={
          selectedProject && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  console.log("Navigating to tree view for project:", selectedProject)
                  navigate(`/task-manager/tree?project=${selectedProject}`)
                }}
                className="flex items-center gap-2"
              >
                <ListTree className="h-4 w-4" />
                Tree View
              </Button>
              <Button onClick={() => setShowOptionsModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Task
              </Button>
            </div>
          )
        }
      />

      <div className="flex-1 p-6 space-y-6">

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Project Filter */}
              <div className="space-y-2">
                <Label>Project</Label>
                <ProjectSelector
                  selectedProject={selectedProject}
                  onProjectChange={(project) => {
                    setSelectedProject(project)
                  }}
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select onValueChange={handleStatusFilter} defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Working">Working</SelectItem>
                    <SelectItem value="Pending Review">Pending Review</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Items per page */}
              <div className="space-y-2">
                <Label>Items per page</Label>
                <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks {totalItems > 0 && `(${totalItems})`}</CardTitle>
            <CardDescription>
              {selectedProject
                ? `Showing tasks for project: ${selectedProject}`
                : "Select a project to view tasks"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="text-muted-foreground text-sm font-medium">Loading tasks...</div>
              </div>
            ) : taskData.length === 0 && !selectedProject ? (
              <div className="flex flex-col items-center justify-center py-12 gap-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Select a Project to Get Started</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose a project from the dropdown above to view its tasks
                  </p>
                </div>
                {projects && projects.length > 0 && (
                  <div className="w-full max-w-md">
                    <h4 className="text-sm font-medium mb-3 text-center">Quick Access:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {projects.slice(0, 5).map((project: any) => (
                        <div key={project.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <span className="font-medium">{project.project_name || project.name}</span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedProject(project.name)}
                            >
                              View List
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => navigate(`/task-manager/tree?project=${project.name}`)}
                            >
                              <ListTree className="h-4 w-4 mr-1" />
                              Tree View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : taskData.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No tasks found for this project.</div>
              </div>
            ) : (
              <DynamicTable
                data={taskData}
                stickyFields={["name"]}
                caption="A list of all tasks with their status and details."
                isLoading={false}
                showActions={true}
                showSelection={false}
                showBulkActions={false}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                badgeVariants={customBadgeVariants}
                showPagination={false}
                validationRules={validationRules}
                errors={errors}
              />
            )}

            {/* Custom Pagination Display */}
            {totalItems > 0 && (
              <div className="border-t pt-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    Show page: <span className="font-medium text-foreground">{currentPage}</span> of{" "}
                    <span className="font-medium text-foreground">{totalPages}</span>
                    <span className="ml-2">({totalItems} total items)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goToPreviousPage} disabled={!hasPreviousPage || isLoading}>
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button variant="outline" size="sm" onClick={goToNextPage} disabled={!hasNextPage || isLoading}>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Creation Options Modal */}
        <TaskCreationOptionsModal
          open={showOptionsModal}
          onClose={() => setShowOptionsModal(false)}
          onCreateNew={handleCreateNew}
          onCreateFromLibrary={handleCreateFromLibrary}
          onBulkCreate={handleBulkCreate}
        />
      </div>
    </div>
  )
}

export default TaskList
