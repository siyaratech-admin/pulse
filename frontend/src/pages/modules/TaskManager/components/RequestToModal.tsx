import React, { useState, useEffect } from "react"
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
import { useFrappePostCall } from "frappe-react-sdk"
import { Loader2, UserPlus, Plus, Trash2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RequestToModalProps {
    isOpen: boolean
    onClose: () => void
    taskName: string
    taskSubject: string
    isOwner: boolean
    currentDistribution?: any[]
    onSuccess: () => void
}

interface DistributionRow {
    user: string
    role: string
    weightage_: number
    points: number
}

const RequestToModal: React.FC<RequestToModalProps> = ({
    isOpen,
    onClose,
    taskName,
    taskSubject,
    isOwner,
    currentDistribution = [],
    onSuccess,
}) => {
    const [selectedUser, setSelectedUser] = useState("")
    const [distribution, setDistribution] = useState<DistributionRow[]>([])

    const { call: createRequest, loading, error, reset } = useFrappePostCall<{ message: string }>(
        "kb_task.custom_scripts.request_to.create_request_to"
    )

    // Initialize distribution from props when modal opens
    useEffect(() => {
        if (isOpen && isOwner) {
            if (currentDistribution && currentDistribution.length > 0) {
                setDistribution(currentDistribution.map(row => ({
                    user: row.user,
                    role: row.role,
                    weightage_: row.weightage_ || 0,
                    points: row.points || 0
                })))
            } else {
                setDistribution([])
            }
        }
    }, [isOpen, isOwner, currentDistribution])

    const handleAddRow = () => {
        setDistribution([...distribution, { user: "", role: "", weightage_: 0, points: 0 }])
    }

    const handleRemoveRow = (index: number) => {
        const newDist = [...distribution]
        newDist.splice(index, 1)
        setDistribution(newDist)
    }

    const handleRowChange = (index: number, field: keyof DistributionRow, value: any) => {
        const newDist = [...distribution]
        newDist[index] = { ...newDist[index], [field]: value }
        setDistribution(newDist)
    }

    const calculateTotalWeightage = () => {
        return distribution.reduce((sum, row) => sum + (parseFloat(row.weightage_ as any) || 0), 0)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedUser) {
            toast.error("Please select a user to request")
            return
        }

        // Validate distribution if owner
        if (isOwner) {
            if (distribution.length === 0) {
                toast.error("Please add at least one user to the points distribution")
                return
            }

            const totalWeightage = calculateTotalWeightage()
            if (Math.abs(totalWeightage - 100) > 0.01) {
                toast.error(`Total weightage must be 100%. Current: ${totalWeightage}%`)
                return
            }

            // Check for empty users in distribution
            if (distribution.some(row => !row.user)) {
                toast.error("All distribution rows must have a user selected")
                return
            }
        }

        try {
            await createRequest({
                task: taskName,
                to_user: selectedUser,
                proposed_distribution: isOwner ? JSON.stringify(distribution) : null,
            })

            toast.success("Request sent successfully")
            handleClose()
            onSuccess()
        } catch (err: any) {
            console.error("Failed to create request:", err)
            toast.error(err?.message || "Failed to create request")
        }
    }

    const handleClose = () => {
        if (!loading) {
            setSelectedUser("")
            setDistribution([])
            reset()
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Request To
                    </DialogTitle>
                    <DialogDescription>
                        Request <strong>{selectedUser || "a user"}</strong> to accept task "{taskSubject}".
                        {isOwner && " You can also propose a new points distribution."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* User Selection */}
                    <LinkField
                        field={{
                            fieldname: "to_user",
                            label: "Request To",
                            fieldtype: "Link",
                            options: "User",
                            reqd: 1,
                            description: "Select the user who you want to request",
                        }}
                        value={selectedUser}
                        onChange={setSelectedUser}
                        disabled={loading}
                        showLabel={true}
                    />

                    {/* Points Distribution (Owner Only) */}
                    {isOwner && (
                        <div className="space-y-3 border rounded-md p-4 bg-slate-50">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold text-slate-900">Proposed Points Distribution</Label>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddRow} disabled={loading}>
                                    <Plus className="h-3 w-3 mr-1" /> Add Row
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {distribution.length === 0 ? (
                                    <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded bg-white">
                                        No distribution rows added.
                                    </div>
                                ) : (
                                    distribution.map((row, index) => (
                                        <div key={index} className="grid grid-cols-[1fr_1fr_80px_32px] gap-2 items-end">
                                            <LinkField
                                                field={{
                                                    fieldname: `user_${index}`,
                                                    label: index === 0 ? "User" : "",
                                                    fieldtype: "Link",
                                                    options: "User",
                                                    placeholder: "Select User"
                                                }}
                                                value={row.user}
                                                onChange={(val) => handleRowChange(index, "user", val)}
                                                disabled={loading}
                                            />
                                            <LinkField
                                                field={{
                                                    fieldname: `role_${index}`,
                                                    label: index === 0 ? "Role" : "",
                                                    fieldtype: "Link",
                                                    options: "Role",
                                                    placeholder: "Select Role"
                                                }}
                                                value={row.role}
                                                onChange={(val) => handleRowChange(index, "role", val)}
                                                disabled={loading}
                                            />
                                            <div>
                                                {index === 0 && <Label className="text-xs mb-1.5 block">Weight %</Label>}
                                                <Input
                                                    type="number"
                                                    value={row.weightage_}
                                                    onChange={(e) => handleRowChange(index, "weightage_", parseFloat(e.target.value))}
                                                    disabled={loading}
                                                    className="h-9"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleRemoveRow(index)}
                                                disabled={loading}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Total Weightage Indicator */}
                            {distribution.length > 0 && (
                                <div className="flex justify-end items-center gap-2 pt-2 border-t">
                                    <span className="text-sm font-medium">Total:</span>
                                    <span className={`text-sm font-bold ${Math.abs(calculateTotalWeightage() - 100) < 0.01 ? "text-green-600" : "text-red-600"}`}>
                                        {calculateTotalWeightage()}%
                                    </span>
                                </div>
                            )}

                            <p className="text-[11px] text-muted-foreground">
                                Note: Total weightage must equal exactly 100%.
                            </p>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {error?.message || "Failed to create request. Please try again."}
                            </AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!selectedUser || loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Sending..." : "Send Request"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default RequestToModal
