import React, { useState, useEffect } from "react"
import { useFrappeCreateDoc } from "frappe-react-sdk"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle } from "lucide-react"
import { DataField } from "@/components/form/fields/BasicFields"
import { CheckField } from "@/components/form/fields/CheckField"
import { TextEditorField } from "@/components/form/fields/TextFields"

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  projectName?: string
  parentTask?: string
  onSuccess: () => void
  initialStatus?: string // Optional: pre-populate status field (for Kanban)
}

const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  projectName,
  parentTask,
  onSuccess,
  initialStatus,
}) => {
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [isGroup, setIsGroup] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [status, setStatus] = useState(initialStatus || "Open")

  const { createDoc, loading, error, reset } = useFrappeCreateDoc()

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSubject("")
      setDescription("")
      setIsGroup(false)
      setShowSuccess(false)
      setStatus(initialStatus || "Open")
      reset()
    }
  }, [isOpen, initialStatus, reset])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim()) {
      return
    }

    const taskData: Record<string, any> = {
      subject: subject.trim(),
      description: description.trim(),
      project: projectName,
      is_group: isGroup ? 1 : 0,
      status: status, // Use the status state (can be pre-populated from Kanban)
    }

    // Add parent_task if this is a child task
    if (parentTask) {
      taskData.parent_task = parentTask
    }

    try {
      await createDoc("Task", taskData)
      setShowSuccess(true)

      // Close modal and refresh after a brief success message
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1000)
    } catch (err) {
      console.error("Failed to create task:", err)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>{parentTask ? "Add Child Task" : "Add Main Task to Project"}</DialogTitle>
          <DialogDescription>
            {parentTask
              ? "Create a new sub-task under the selected parent task."
              : "Create a new root-level task for this project."}
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-600">Task created successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Project (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Input id="project" value={projectName} disabled className="bg-gray-50" />
              </div>

              {/* Parent Task (Read-only, conditional) */}
              {parentTask && (
                <div className="space-y-2">
                  <Label htmlFor="parentTask">Parent Task</Label>
                  <Input id="parentTask" value={parentTask} disabled className="bg-gray-50" />
                </div>
              )}

              {/* Subject (Required, Auto-focus) - Using DataField */}
              <DataField
                field={{
                  fieldname: "subject",
                  label: "Subject",
                  fieldtype: "Data",
                  reqd: 1,
                  description: "A clear, descriptive name for the task",
                  length: 140,
                }}
                value={subject}
                onChange={setSubject}
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
                value={description}
                onChange={setDescription}
                disabled={loading}
                showLabel={true}
              />

              {/* Is Group Checkbox - Using CheckField */}
              <CheckField
                field={{
                  fieldname: "is_group",
                  label: "Is this a Group Task?",
                  fieldtype: "Check",
                  description: "Group tasks act as containers and can have sub-tasks. Regular tasks are actionable items.",
                }}
                value={isGroup ? 1 : 0}
                onChange={(value) => setIsGroup(value === 1)}
                disabled={loading}
              />

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error?.message || "Failed to create task. Please try again."}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !subject.trim()}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Creating..." : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default QuickAddModal
