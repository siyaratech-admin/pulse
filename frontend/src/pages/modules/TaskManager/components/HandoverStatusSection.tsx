import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFrappePostCall } from "frappe-react-sdk"
import { CheckCircle, XCircle, Info, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface HandoverStatusSectionProps {
  task: {
    name: string
    custom_handover_from?: string
    custom_handover_to?: string
    custom_handover_status?: string
  }
  onStatusUpdate: () => void
}

const HandoverStatusSection: React.FC<HandoverStatusSectionProps> = ({ task, onStatusUpdate }) => {
  const { call: updateStatus, loading } = useFrappePostCall(
    "kb_task.custom_scripts.handover.update_handover_status"
  )

  const handleAccept = async () => {
    try {
      await updateStatus({
        task: task.name,
        status: "Accepted",
      })
      toast.success("Handover accepted successfully!")
      onStatusUpdate()
    } catch (err: any) {
      console.error("Failed to update handover status:", err)
      toast.error(err?.message || "Failed to accept handover")
    }
  }

  const handleDecline = async () => {
    try {
      await updateStatus({
        task: task.name,
        status: "Declined",
      })
      toast.success("Handover declined")
      onStatusUpdate()
    } catch (err: any) {
      console.error("Failed to update handover status:", err)
      toast.error(err?.message || "Failed to decline handover")
    }
  }

  // If handover status is already set (Accepted or Declined)
  if (task.custom_handover_status) {
    return (
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <div className="flex items-center gap-2 text-blue-800">
            <span className="text-sm">Handover Status:</span>
            <Badge
              variant={task.custom_handover_status === "Accepted" ? "default" : "destructive"}
              className={
                task.custom_handover_status === "Accepted"
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
            >
              {task.custom_handover_status}
            </Badge>
            {task.custom_handover_from && (
              <span className="text-sm ml-2">
                from <span className="font-semibold">{task.custom_handover_from}</span>
              </span>
            )}
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  // If handover status is not set yet - show action buttons
  return (
    <Card className="mb-6 border-yellow-300 bg-yellow-50 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-yellow-900 flex items-center gap-2 text-lg">
          <AlertCircle className="h-5 w-5" />
          Task Handover Request
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-yellow-900">
            This task has been handed over to you
            {task.custom_handover_from && (
              <>
                {" "}
                by <span className="font-semibold">{task.custom_handover_from}</span>
              </>
            )}
            .
          </p>
          <p className="text-sm text-yellow-800">
            Please review the task details and decide whether to accept or decline this handover.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleAccept}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? (
              <CheckCircle className="mr-2 h-4 w-4 animate-pulse" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Accept Handover
          </Button>
          <Button
            onClick={handleDecline}
            disabled={loading}
            variant="destructive"
            className="flex-1 text-white"
          >
            {loading ? (
              <XCircle className="mr-2 h-4 w-4 animate-pulse" />
            ) : (
              <XCircle className="mr-2 h-4 w-4" />
            )}
            Decline Handover
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default HandoverStatusSection
