import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LinkField } from "@/components/form/fields/SelectionFields"
import { DateField } from "@/components/form/fields/DateTimeFields"
import { useFrappePostCall } from "frappe-react-sdk"
import { Loader2, UserX } from "lucide-react"
import { toast } from "sonner"

interface HandoverModalProps {
  isOpen: boolean
  onClose: () => void
  taskName: string
  taskSubject: string
  onSuccess: () => void
}

const HandoverModal: React.FC<HandoverModalProps> = ({
  isOpen,
  onClose,
  taskName,
  taskSubject,
  onSuccess,
}) => {
  const [selectedUser, setSelectedUser] = useState("")
  const [exp_start_date, setExpStartDate] = useState("")
  const [exp_end_date, setExpEndDate] = useState("")

  const { call: createHandover, loading, error, reset } = useFrappePostCall<{ message: string }>(
    "kb_task.custom_scripts.handover.create_handover_task"
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUser) {
      toast.error("Please select a user to handover the task to")
      return
    }

    try {
      const result = await createHandover({
        task: taskName,
        to_user: selectedUser,
        exp_start_date: exp_start_date || null,
        exp_end_date: exp_end_date || null,
      })

      // Extract the new task name from result
      const newTaskName = result?.message || result

      toast.success(`Handover task created successfully: ${newTaskName}`)

      // Reset form
      setSelectedUser("")
      setExpStartDate("")
      setExpEndDate("")
      reset()

      onSuccess()
    } catch (err: any) {
      console.error("Failed to create handover task:", err)
      toast.error(err?.message || "Failed to create handover task")
    }
  }

  const handleClose = () => {
    if (!loading) {
      setSelectedUser("")
      setExpStartDate("")
      setExpEndDate("")
      reset()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Handover Task
          </DialogTitle>
          <DialogDescription>
            Select a user to handover "{taskSubject}" to. A new handover task will be created and assigned to the selected user.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Selection */}
          <LinkField
            field={{
              fieldname: "to_user",
              label: "Handover To",
              fieldtype: "Link",
              options: "User",
              reqd: 1,
              description: "Select the user who will receive this task",
            }}
            value={selectedUser}
            onChange={setSelectedUser}
            disabled={loading}
            showLabel={true}
          />

          {/* Optional Date Fields */}
          <div className="grid grid-cols-2 gap-4">
            <DateField
              field={{
                fieldname: "exp_start_date",
                label: "Expected Start (Optional)",
                fieldtype: "Date",
                description: "New expected start date for handover task",
              }}
              value={exp_start_date}
              onChange={setExpStartDate}
              disabled={loading}
            />

            <DateField
              field={{
                fieldname: "exp_end_date",
                label: "Expected End (Optional)",
                fieldtype: "Date",
                description: "New expected end date for handover task",
              }}
              value={exp_end_date}
              onChange={setExpEndDate}
              disabled={loading}
            />
          </div>

          {/* Date Range Preview */}
          {exp_start_date && exp_end_date && (
            <Alert>
              <AlertDescription className="text-xs">
                Duration:{" "}
                {Math.ceil(
                  (new Date(exp_end_date).getTime() - new Date(exp_start_date).getTime()) /
                  (1000 * 60 * 60 * 24),
                )}{" "}
                days
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error?.message || "Failed to create handover task. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedUser || loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Creating..." : "Create Handover Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default HandoverModal
