import React, { useState, useEffect } from "react"
import { useFrappeUpdateDoc, useFrappeGetDocList } from "frappe-react-sdk"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, Info, UserPlus, X } from "lucide-react"
import type { TaskNode } from "../TaskTree"
import { DataField, IntField } from "@/components/form/fields/BasicFields"
import { SelectField, LinkField } from "@/components/form/fields/SelectionFields"
import { DateField } from "@/components/form/fields/DateTimeFields"
import { CheckField } from "@/components/form/fields/CheckField"
import { TextEditorField } from "@/components/form/fields/TextFields"

interface EditTaskModalProps {
  isOpen: boolean
  onClose: () => void
  task: TaskNode | null
  onSuccess: () => void
}

interface Assignment {
  name: string
  owner: string
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task, onSuccess }) => {
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    status: "Open",
    is_group: 0 as 0 | 1,
    progress: 0,
    exp_start_date: "",
    exp_end_date: "",
    completed_by: "",
    completed_on: "",
    priority: "Medium",
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [newAssignee, setNewAssignee] = useState("")
  const [assignmentLoading, setAssignmentLoading] = useState(false)
  const [validationError, setValidationError] = useState<string>("")

  const { updateDoc, loading, error, reset } = useFrappeUpdateDoc()

  // Fetch actual child count from API for accurate validation
  const { data: childTasks, isLoading: childrenLoading } = useFrappeGetDocList("Task", {
    fields: ["name"],
    filters: task?.name ? [["parent_task", "=", task.name]] : [],
    limit: 1,
  })

  const hasChildren = (childTasks?.length || 0) > 0

  // Get CSRF token
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
  }

  // Parse assignments from _assign field
  const parseAssignments = (assignString: string): Assignment[] => {
    if (!assignString) return []

    try {
      const assignees = JSON.parse(assignString)
      if (Array.isArray(assignees)) {
        return assignees.map((email, index) => ({
          name: `assignment_${index}`,
          owner: email,
        }))
      }
    } catch (err) {
      console.error("Failed to parse assignments:", err)
    }

    return []
  }

  // Add assignment
  const handleAddAssignment = async () => {
    if (!task?.name || !newAssignee) return

    setAssignmentLoading(true)
    try {
      const response = await fetch('/api/method/frappe.desk.form.assign_to.add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': 'application/json',
          'X-Frappe-CSRF-Token': getCsrfToken(),
        },
        credentials: 'include',
        body: new URLSearchParams({
          assign_to: JSON.stringify([newAssignee]),
          doctype: 'Task',
          name: task.name,
          description: `Assignment for Task ${task.name}`,
        }).toString(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Update local state immediately for instant UI feedback
      setAssignments(prev => [
        ...prev,
        {
          name: `assignment_${prev.length}`,
          owner: newAssignee,
        }
      ])
      setNewAssignee("")

      // Refresh the task data in parent to keep data in sync
      onSuccess()
    } catch (err) {
      console.error("Failed to add assignment:", err)
    } finally {
      setAssignmentLoading(false)
    }
  }

  // Remove assignment
  const handleRemoveAssignment = async (assignTo: string) => {
    if (!task?.name) return

    setAssignmentLoading(true)
    try {
      const response = await fetch('/api/method/frappe.desk.form.assign_to.remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': 'application/json',
          'X-Frappe-CSRF-Token': getCsrfToken(),
        },
        credentials: 'include',
        body: new URLSearchParams({
          doctype: 'Task',
          name: task.name,
          assign_to: assignTo,
        }).toString(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Update local state immediately for instant UI feedback
      setAssignments(prev => prev.filter(assignment => assignment.owner !== assignTo))

      // Refresh the task data in parent to keep data in sync
      onSuccess()
    } catch (err) {
      console.error("Failed to remove assignment:", err)
    } finally {
      setAssignmentLoading(false)
    }
  }

  // Initialize form when task changes
  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        subject: task.subject || "",
        description: (task as any).description || "",
        status: task.status || "Open",
        is_group: task.is_group || 0,
        progress: task.progress || 0,
        exp_start_date: task.exp_start_date || "",
        exp_end_date: task.exp_end_date || "",
        completed_by: (task as any).completed_by || "",
        completed_on: (task as any).completed_on || "",
        priority: (task as any).priority || "Medium",
      })
      setShowSuccess(false)
      setNewAssignee("")
      setValidationError("")
      reset()

      // Parse assignments from _assign field
      const assignedUsers = parseAssignments(task._assign || "")
      setAssignments(assignedUsers)
    }
  }, [task, isOpen, reset])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!task) return

    // Clear any previous validation errors
    setValidationError("")

    try {
      await updateDoc("Task", task.name, formData)
      setShowSuccess(true)

      // Close modal and refresh after a brief success message
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1000)
    } catch (err: any) {
      console.error("Failed to update task:", err)

      // Parse and display validation errors
      if (err?._server_messages) {
        try {
          const serverMessages = JSON.parse(err._server_messages)
          if (Array.isArray(serverMessages) && serverMessages.length > 0) {
            const firstMessage = JSON.parse(serverMessages[0])
            setValidationError(firstMessage.message || "Validation failed")
          }
        } catch (parseErr) {
          // If parsing fails, try to get message from exception
          if (err?.exception) {
            const match = err.exception.match(/frappe\.exceptions\.\w+:\s*(.+)/)
            if (match) {
              setValidationError(match[1])
            }
          }
        }
      } else if (err?.exception) {
        const match = err.exception.match(/frappe\.exceptions\.\w+:\s*(.+)/)
        if (match) {
          setValidationError(match[1])
        }
      } else if (err?.message) {
        setValidationError(err.message)
      }
    }
  }

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear validation error when user makes changes
    if (validationError) {
      setValidationError("")
    }
  }

  if (!task) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Update task details and settings</DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-600">Task updated successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="assign">Assign To</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                {/* Task ID (Read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="taskId">Task ID</Label>
                  <Input id="taskId" value={task.name} disabled className="bg-gray-50 font-mono text-sm" />
                </div>

                {/* Subject - Using DataField */}
                <DataField
                  field={{
                    fieldname: "subject",
                    label: "Subject",
                    fieldtype: "Data",
                    reqd: 1,
                    length: 140,
                  }}
                  value={formData.subject}
                  onChange={(value) => handleFieldChange("subject", value)}
                  disabled={loading}
                  showLabel={true}
                />

                {/* Description - Using TextEditorField */}
                <TextEditorField
                  field={{
                    fieldname: "description",
                    label: "Description",
                    fieldtype: "Text Editor",
                    description: "Add detailed information about this task",
                  }}
                  value={formData.description}
                  onChange={(value) => handleFieldChange("description", value)}
                  disabled={loading}
                  showLabel={true}
                />

                {/* Status - Using SelectField */}
                <SelectField
                  field={{
                    fieldname: "status",
                    label: "Status",
                    fieldtype: "Select",
                    options: ["Open", "Working", "Pending Review", "Overdue", "Completed", "Cancelled", "Template"],
                  }}
                  value={formData.status}
                  onChange={(value) => handleFieldChange("status", value)}
                  disabled={loading}
                  showLabel={true}
                />

                {/* Conditional fields for Completed status */}
                {formData.status === "Completed" && (
                  <>
                    <LinkField
                      field={{
                        fieldname: "completed_by",
                        label: "Completed By",
                        fieldtype: "Link",
                        options: "User",
                        description: "Select the user who completed this task",
                      }}
                      value={formData.completed_by}
                      onChange={(value) => handleFieldChange("completed_by", value)}
                      disabled={loading}
                      showLabel={true}
                    />
                    <DateField
                      field={{
                        fieldname: "completed_on",
                        label: "Completed On",
                        fieldtype: "Date",
                      }}
                      value={formData.completed_on}
                      onChange={(value) => handleFieldChange("completed_on", value)}
                      disabled={loading}
                    />
                  </>
                )}

                {/* Priority - Using SelectField */}
                <SelectField
                  field={{
                    fieldname: "priority",
                    label: "Priority",
                    fieldtype: "Select",
                    options: ["Low", "Medium", "High", "Urgent"],
                  }}
                  value={formData.priority}
                  onChange={(value) => handleFieldChange("priority", value)}
                  disabled={loading}
                  showLabel={true}
                />

                {/* Is Group - Using CheckField with validation alerts */}
                <div className="space-y-2">
                  <CheckField
                    field={{
                      fieldname: "is_group",
                      label: "Is this a Group Task?",
                      fieldtype: "Check",
                      description: "Group tasks can contain sub-tasks and don't track progress directly.",
                    }}
                    value={formData.is_group}
                    onChange={(value) => handleFieldChange("is_group", value)}
                    disabled={loading || hasChildren || childrenLoading}
                  />
                  {childrenLoading && (
                    <Alert>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <AlertDescription className="text-xs">
                        Checking for child tasks...
                      </AlertDescription>
                    </Alert>
                  )}
                  {hasChildren && !childrenLoading && formData.is_group === 1 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        This task has child tasks. You cannot change it to a non-group task. Please remove or reassign all child tasks first.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Progress (disabled for groups) - Using IntField with progress bar */}
                <div className="space-y-2">
                  <Label htmlFor="progress">Progress (%)</Label>
                  <div className="flex items-center gap-4">
                    <IntField
                      field={{
                        fieldname: "progress",
                        label: "",
                        fieldtype: "Int",
                      }}
                      value={formData.progress}
                      onChange={(value) => handleFieldChange("progress", value)}
                      disabled={loading || formData.is_group === 1}
                      className="w-24"
                      showLabel={false}
                    />
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, formData.progress))}%` }}
                      />
                    </div>
                  </div>
                  {formData.is_group === 1 && (
                    <p className="text-xs text-muted-foreground">Progress tracking is disabled for group tasks</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                {/* Start Date - Using DateField */}
                <DateField
                  field={{
                    fieldname: "exp_start_date",
                    label: "Expected Start Date",
                    fieldtype: "Date",
                  }}
                  value={formData.exp_start_date}
                  onChange={(value) => handleFieldChange("exp_start_date", value)}
                  disabled={loading}
                />

                {/* End Date - Using DateField */}
                <DateField
                  field={{
                    fieldname: "exp_end_date",
                    label: "Expected End Date",
                    fieldtype: "Date",
                  }}
                  value={formData.exp_end_date}
                  onChange={(value) => handleFieldChange("exp_end_date", value)}
                  disabled={loading}
                />

                {/* Date Range Preview */}
                {formData.exp_start_date && formData.exp_end_date && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Duration:{" "}
                      {Math.ceil(
                        (new Date(formData.exp_end_date).getTime() - new Date(formData.exp_start_date).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )}{" "}
                      days
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="assign" className="space-y-4">
                {/* Add new assignee */}
                <div className="space-y-2">
                  <Label>Add Assignee</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <LinkField
                        field={{
                          fieldname: "assign_to",
                          label: "",
                          fieldtype: "Link",
                          options: "User",
                          description: "Select a user to assign this task",
                        }}
                        value={newAssignee}
                        onChange={setNewAssignee}
                        disabled={assignmentLoading}
                        showLabel={false}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddAssignment}
                      disabled={!newAssignee || assignmentLoading}
                      size="default"
                    >
                      {assignmentLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Assign
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Current assignments */}
                <div className="space-y-2">
                  <Label>Assigned Users</Label>
                  {assignments.length === 0 ? (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        No users assigned to this task yet.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-2">
                      {assignments.map((assignment) => (
                        <div
                          key={assignment.name}
                          className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{assignment.owner}</Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAssignment(assignment.owner)}
                            disabled={assignmentLoading}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Validation Error Message */}
            {validationError && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>
                  <div dangerouslySetInnerHTML={{ __html: validationError }} />
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {error && !validationError && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error?.message || "Failed to update task. Please try again."}</AlertDescription>
              </Alert>
            )}

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default EditTaskModal
