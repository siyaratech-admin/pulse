import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFrappePostCall } from "frappe-react-sdk"
import { CheckCircle, XCircle, Info, AlertCircle, UserPlus, Clock } from "lucide-react"
import { toast } from "sonner"

interface RequestToStatusSectionProps {
    task: {
        name: string
        custom_request_from_?: string
        custom_request_to?: string
        custom__request_status?: string
    }
    currentUser?: string | null
    onStatusUpdate: () => void
}

const RequestToStatusSection: React.FC<RequestToStatusSectionProps> = ({ task, currentUser, onStatusUpdate }) => {
    const { call: updateStatus, loading } = useFrappePostCall(
        "kb_task.custom_scripts.request_to.update_request_status"
    )

    const handleAccept = async () => {
        try {
            await updateStatus({
                task: task.name,
                status: "Accepted",
            })
            toast.success("Request accepted successfully!")
            onStatusUpdate()
        } catch (err: any) {
            console.error("Failed to update request status:", err)
            toast.error(err?.message || "Failed to accept request")
        }
    }

    const handleDecline = async () => {
        try {
            await updateStatus({
                task: task.name,
                status: "Declined",
            })
            toast.success("Request declined")
            onStatusUpdate()
        } catch (err: any) {
            console.error("Failed to update request status:", err)
            toast.error(err?.message || "Failed to decline request")
        }
    }

    const isRecipient = currentUser && task.custom_request_to === currentUser
    const isPending = !task.custom__request_status

    // Case 1: Request is pending and current user is NOT the recipient (e.g. Owner/Requester)
    if (isPending && !isRecipient) {
        return (
            <Alert className="mb-6 border-indigo-200 bg-indigo-50">
                <Clock className="h-4 w-4 text-indigo-600" />
                <AlertDescription>
                    <div className="flex items-center gap-2 text-indigo-800">
                        <span className="font-medium">Request Pending:</span>
                        <span>Waiting for <strong>{task.custom_request_to}</strong> to accept the request.</span>
                    </div>
                </AlertDescription>
            </Alert>
        )
    }

    // Case 2: Request is already decided (Accepted/Declined)
    if (task.custom__request_status) {
        return (
            <Alert className="mb-6 border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                    <div className="flex flex-wrap items-center gap-2 text-blue-800">
                        <span className="text-sm font-medium">Request Status:</span>
                        <Badge
                            variant={task.custom__request_status === "Accepted" ? "default" : "destructive"}
                            className={
                                task.custom__request_status === "Accepted"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : ""
                            }
                        >
                            {task.custom__request_status}
                        </Badge>
                        <span className="text-sm ml-1">
                            {task.custom_request_from_ && (
                                <>from <span className="font-semibold">{task.custom_request_from_}</span></>
                            )}
                            {task.custom_request_from_ && task.custom_request_to && " "}
                            {task.custom_request_to && (
                                <>to <span className="font-semibold">{task.custom_request_to}</span></>
                            )}
                        </span>
                    </div>
                </AlertDescription>
            </Alert>
        )
    }

    // Case 3: Request is pending and current user IS the recipient
    return (
        <Card className="mb-6 border-indigo-300 bg-indigo-50 shadow-md">
            <CardHeader className="pb-3">
                <CardTitle className="text-indigo-900 flex items-center gap-2 text-lg">
                    <UserPlus className="h-5 w-5" />
                    Task Assignment Request
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <p className="text-sm text-indigo-900">
                        You have been requested to join this task
                        {task.custom_request_from_ && (
                            <>
                                {" "}
                                by <span className="font-semibold">{task.custom_request_from_}</span>
                            </>
                        )}
                        .
                    </p>
                    <p className="text-sm text-indigo-800">
                        Please review the task details and decide whether to accept or decline this request.
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
                        Accept Request
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
                        Decline Request
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default RequestToStatusSection
