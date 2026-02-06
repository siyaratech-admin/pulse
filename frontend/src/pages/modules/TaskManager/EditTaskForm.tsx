"use client"

import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useSearchParams, useParams } from "react-router-dom"
import { useFrappeGetDoc, useFrappeGetDocList, useFrappeUpdateDoc, useFrappeAuth } from "frappe-react-sdk"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  CheckCircle,
  ArrowLeft,
  UserPlus,
  X,
  Info,
  Save,
  Users,
  ListTodo,
  UserX,
  ChevronDown,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import { DataField, IntField } from "@/components/form/fields/BasicFields"
import { SelectField, LinkField } from "@/components/form/fields/SelectionFields"
import { DateField } from "@/components/form/fields/DateTimeFields"
import { CheckField } from "@/components/form/fields/CheckField"
import { TextEditorField } from "@/components/form/fields/TextFields"
import { toast } from "sonner"
import TaskComments from "./components/TaskComments"
import { EnergyPointsSection } from "./components/EnergyPointsSection"
import { AcceptanceCriteriaSection } from "./components/AcceptanceCriteriaSection"
import HandoverModal from "./components/HandoverModal"
import HandoverStatusSection from "./components/HandoverStatusSection"
import RequestToModal from "./components/RequestToModal"
import RequestToStatusSection from "./components/RequestToStatusSection"
import TaskBreadcrumb from "./components/TaskBreadcrumb"
import TaskResourcesSection from "./components/TaskResourcesSection"
import { AttachmentPanel } from "@/components/form/sidebar/AttachmentPanel"
import { TagsPanel } from "@/components/form/sidebar/TagsPanel"
import { SharedPanel } from "@/components/form/sidebar/SharedPanel"
import { ValidationMessage } from "@/components/ui/form/ValidationMessage"
import { validateWeightage, hasDuplicateUsers } from "@/utils/energyPointsCalculator"
import { useTaskPermissions } from "@/hooks/useTaskPermissions"
import { useFrappePostCall } from "frappe-react-sdk"

interface Assignment {
  name: string
  owner: string
}

interface ValidationErrors {
  [key: string]: string
}

// Configuration for hidden fields per resource type
const HIDDEN_FIELDS_CONFIG = {
  concrete: ['rate', 'amount'],
  machinery: ['planned_rate_per_hr', 'planned_cost', 'actual_rate_per_hr', 'actual_cost'],
  material: ['planned_rate', 'planned_amount', 'actual_rate', 'actual_amount'],
  labour: [] // No fields hidden for labour
}

const EditTaskForm: React.FC = () => {
  const navigate = useNavigate()
  const { taskName } = useParams<{ taskName: string }>()
  const [searchParams] = useSearchParams()

  // Get return URL
  const returnUrlParam = searchParams.get("returnUrl")
  const returnUrl = returnUrlParam ? decodeURIComponent(returnUrlParam) : "/task-manager"

  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    status: "Open",
    is_group: 0 as 0 | 1,
    progress: 0,
    exp_start_date: "",
    exp_end_date: "",
    custom_actual_start_date: "",
    custom_actual_end_date: "",
    custom_baseline_start_date_: "",
    custom_baseline_end_date: "",
    completed_by: "",
    completed_on: "",
    priority: "Medium",
    custom_points: 0,
    custom_final_points: 0,
    custom_points_distribution: [] as Array<any>,
    type: "",
    custom_labour_details: [] as Array<any>,
    custom_machinery_details: [] as Array<any>,
    custom_material_details: [] as Array<any>,
    custom_concrete_details: [] as Array<any>,
    custom_acceptance_criteria: [] as Array<any>,
  })

  const [showSuccess, setShowSuccess] = useState(false)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [newAssignee, setNewAssignee] = useState("")
  const [assignmentLoading, setAssignmentLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [requiredFieldsCount, setRequiredFieldsCount] = useState(0)
  const [showHandoverModal, setShowHandoverModal] = useState(false)
  const [showRequestToModal, setShowRequestToModal] = useState(false)
  const [isAssignee, setIsAssignee] = useState(false)
  const [scheduleSections, setScheduleSections] = useState({
    baseline: false,
    expected: true,
    actual: false
  })

  // Refs for scrolling to fields
  const subjectRef = useRef<HTMLDivElement>(null)
  const startDateRef = useRef<HTMLDivElement>(null)
  const endDateRef = useRef<HTMLDivElement>(null)
  const energyPointsRef = useRef<HTMLDivElement>(null)

  // Get current user for permission checks
  const { currentUser } = useFrappeAuth()

  // Fetch task data
  const {
    data: task,
    isLoading: isLoadingTask,
    error: taskError,
    mutate: mutateTask
  } = useFrappeGetDoc("Task", taskName || "", {
    fields: [
      "name", "subject", "description", "status", "is_group", "progress",
      "exp_start_date", "exp_end_date", "custom_actual_start_date", "custom_actual_end_date",
      "custom_baseline_start_date_", "custom_baseline_end_date",
      "completed_by", "completed_on", "priority", "parent_task", "project",
      "custom_points", "custom_final_points", "custom_points_distribution",
      "custom_acceptance_criteria", "owner", "custom_handover_to", "custom_handover_from",
      "custom_handover_status", "custom_reference_task", "custom_request_to",
      "custom_request_from_", "custom__request_status", "custom_proposed_points_distribution",
      "type", "custom_labour_details", "custom_machinery_details",
      "custom_material_details", "custom_concrete_details"
    ],
  })

  // Fetch Parent Task for Validation
  const { data: parentTask } = useFrappeGetDoc("Task", task?.parent_task || "", {
    fields: [
      "exp_start_date",
      "exp_end_date",
      "custom_labour_details",
      "custom_machinery_details",
      "custom_material_details",
      "custom_concrete_details"
    ],
  })

  // Fetch child tasks for validation
  const { data: childTasks, isLoading: childrenLoading } = useFrappeGetDocList("Task", {
    fields: ["name"],
    filters: taskName ? [["parent_task", "=", taskName]] : [],
    limit: 1,
  })
  const hasChildren = (childTasks?.length || 0) > 0

  // Check if current user is task owner
  const isOwner = task?.owner === currentUser

  // Check if current task is a handover task assigned to current user
  const isHandoverRecipient = task?.custom_handover_to === currentUser

  // Check if current user is the requested user
  const isRequestRecipient = task?.custom_request_to === currentUser && !task?.custom__request_status

  // Calculate field permissions based on user role
  const permissions = useTaskPermissions(task, currentUser || null, isAssignee)

  // Fetch assignments from ToDo doctype
  const { data: todoAssignments, mutate: mutateAssignments } = useFrappeGetDocList("ToDo", {
    fields: ["allocated_to", "name"],
    filters: taskName
      ? [
        ["reference_type", "=", "Task"],
        ["reference_name", "=", taskName],
        ["status", "not in", ["Cancelled", "Closed"]],
      ]
      : [],
  })

  // Update hook
  const { updateDoc, loading, error, reset } = useFrappeUpdateDoc()

  // API Hooks for Assignments
  const { call: addAssignment, loading: addAssignmentLoading } = useFrappePostCall('frappe.desk.form.assign_to.add')
  const { call: removeAssignment, loading: removeAssignmentLoading } = useFrappePostCall('frappe.desk.form.assign_to.remove')

  // Update required fields count
  useEffect(() => {
    const count = Object.keys(validationErrors).length
    setRequiredFieldsCount(count)
  }, [validationErrors])

  // Helper function to clean error messages (remove HTML tags and entities)
  const cleanErrorMessage = (message: string): string => {
    return message
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'") // Replace &#39; with '
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
  }

  // Helper function to parse and display server errors
  const displayServerError = (err: any) => {
    let errorMessage = "Failed to update task"

    try {
      if (err?.exception) {
        errorMessage = cleanErrorMessage(err.exception)
      } else if (err?.message) {
        errorMessage = cleanErrorMessage(err.message)
      } else if (err?._server_messages) {
        try {
          const messages = JSON.parse(err._server_messages)
          if (Array.isArray(messages) && messages.length > 0) {
            const parsed = JSON.parse(messages[0])
            errorMessage = cleanErrorMessage(parsed.message || errorMessage)
          }
        } catch (parseError) {
          console.error("Failed parsing server messages:", parseError)
        }
      } else if (err?.exc_type) {
        const excMessage = err.exc || errorMessage
        errorMessage = cleanErrorMessage(excMessage)
      } else if (typeof err === 'string') {
        errorMessage = cleanErrorMessage(err)
      } else if (err?.httpStatus && err?.httpStatusText) {
        errorMessage = `${err.httpStatus} ${err.httpStatusText}`
      }
    } catch (parseError) {
      console.error("Failed processing response:", parseError)
      errorMessage = "An unexpected issue occurred while updating the task"
    }

    toast.error(errorMessage, {
      duration: 5000,
      position: "bottom-right",
    })

    console.error("Task update issue:", err)
  }

  // Scroll to first error field
  const scrollToFirstError = (errors: ValidationErrors) => {
    const errorFields = Object.keys(errors)
    if (errorFields.length === 0) return

    const firstError = errorFields[0]
    let targetRef: React.RefObject<HTMLDivElement> | null = null

    switch (firstError) {
      case "subject":
        targetRef = subjectRef
        break
      case "exp_start_date":
        targetRef = startDateRef
        // Expand expected schedule section
        setScheduleSections(prev => ({ ...prev, expected: true }))
        break
      case "exp_end_date":
      case "duration":
        targetRef = endDateRef
        // Expand expected schedule section
        setScheduleSections(prev => ({ ...prev, expected: true }))
        break
      case "weightage":
      case "duplicate_users":
        targetRef = energyPointsRef
        break
    }

    if (targetRef?.current) {
      targetRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
      setTimeout(() => {
        const input = targetRef.current?.querySelector("input, select, textarea")
        if (input instanceof HTMLElement) {
          input.focus()
        }
      }, 500)
    }
  }

  // Validate form and return errors
  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {}

    if (!formData.subject.trim()) {
      errors.subject = "Subject is required"
    }

    if (formData.status !== "Template" && formData.type !== "BaselineTask") {
      if (!formData.exp_start_date) {
        errors.exp_start_date = "Expected Start Date is required"
      }
      if (!formData.exp_end_date) {
        errors.exp_end_date = "Expected End Date is required"
      }

      if (formData.exp_start_date && formData.exp_end_date) {
        const startDate = new Date(formData.exp_start_date)
        const endDate = new Date(formData.exp_end_date)
        const durationInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

        if (durationInDays < 0) {
          errors.duration = "End date must be after start date"
        }
      }
    }

    if (formData.status === "Completed" && formData.custom_points_distribution?.length) {
      const weightageCheck = validateWeightage(formData.custom_points_distribution)
      if (!weightageCheck.valid) {
        errors.weightage = weightageCheck.message || "Invalid weightage distribution"
      }

      const duplicateCheck = hasDuplicateUsers(formData.custom_points_distribution)
      if (duplicateCheck.hasDuplicate) {
        errors.duplicate_users = "Cannot have duplicate users in points distribution"
      }
    }

    return errors
  }

  // Add assignment
  const handleAddAssignment = async () => {
    if (!taskName || !newAssignee) return

    setAssignmentLoading(true)
    try {
      await addAssignment({
        doctype: "Task",
        name: taskName,
        assign_to: [newAssignee],
        description: `Assigned to ${formData.subject}`,
      })
      setNewAssignee("")
      // Refresh task and assignment data
      mutateTask()
      mutateAssignments()
      toast.success(`Assigned to ${newAssignee}`)
    } catch (err: any) {
      console.error("Failed to add assignment:", err)
      displayServerError(err)
    } finally {
      setAssignmentLoading(false)
    }
  }

  // Remove assignment
  const handleRemoveAssignment = async (assignTo: string) => {
    if (!taskName) return

    setAssignmentLoading(true)
    try {
      await removeAssignment({
        doctype: "Task",
        name: taskName,
        assign_to: assignTo,
      })
      // Refresh task and assignment data
      mutateTask()
      mutateAssignments()
      toast.success(`Removed ${assignTo}`)
    } catch (err: any) {
      console.error("Failed to remove assignment:", err)
      displayServerError(err)
    } finally {
      setAssignmentLoading(false)
    }
  }

  // Initialize form when task loads
  useEffect(() => {
    if (task) {
      setFormData({
        subject: task.subject || "",
        description: task.description || "",
        status: task.status || "Open",
        is_group: task.is_group || 0,
        progress: task.progress || 0,
        exp_start_date: task.exp_start_date || "",
        exp_end_date: task.exp_end_date || "",
        custom_actual_start_date: task.custom_actual_start_date || "",
        custom_actual_end_date: task.custom_actual_end_date || "",
        custom_baseline_start_date_: task.custom_baseline_start_date_ || "",
        custom_baseline_end_date: task.custom_baseline_end_date || "",
        completed_by: task.completed_by || "",
        completed_on: task.completed_on || "",
        priority: task.priority || "Medium",
        custom_points: task.custom_points || 0,
        custom_final_points: task.custom_final_points || 0,
        custom_points_distribution: task.custom_points_distribution || [],
        custom_acceptance_criteria: task.custom_acceptance_criteria || [],
        type: task.type || "",
        custom_labour_details: task.custom_labour_details || [],
        custom_machinery_details: task.custom_machinery_details || [],
        custom_material_details: task.custom_material_details || [],
        custom_concrete_details: task.custom_concrete_details || [],
      })
      setShowSuccess(false)
      setNewAssignee("")
      setValidationErrors({})
      reset()
    }
  }, [task, reset, currentUser])

  // Update assignments when ToDo data changes
  useEffect(() => {
    if (todoAssignments) {
      const assignedUsers = todoAssignments.map((todo) => ({
        name: todo.name,
        owner: todo.allocated_to,
      }))
      setAssignments(assignedUsers)
    }
  }, [todoAssignments])

  // Check if current user is an assignee (has active ToDo)
  useEffect(() => {
    if (!currentUser || !task) {
      setIsAssignee(false)
      return
    }
    if (task.owner === currentUser) {
      setIsAssignee(false)
      return
    }
    const isUserAssigned = todoAssignments?.some((todo) => todo.allocated_to === currentUser) || false
    setIsAssignee(isUserAssigned)
  }, [currentUser, task, todoAssignments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskName) return

    // Validate form
    const errors = validateForm()
    setValidationErrors(errors)

    if (Object.keys(errors).length > 0) {
      scrollToFirstError(errors)

      const firstErrorMessage = Object.values(errors)[0]
      toast.error(firstErrorMessage, {
        position: "bottom-right",
      })
      return
    }

    try {
      await updateDoc("Task", taskName, formData)
      setShowSuccess(true)
      toast.success("Task updated successfully!")
      setTimeout(() => {
        navigate(returnUrl, { state: { refresh: true } })
      }, 1500)
    } catch (err: any) {
      displayServerError(err)
      reset()
    }
  }

  const getDateValidationError = (dateType: 'start' | 'end') => {
    if (!parentTask) return null
    const parentStart = parentTask.exp_start_date
    const parentEnd = parentTask.exp_end_date
    const childStart = formData.exp_start_date
    const childEnd = formData.exp_end_date

    if (dateType === 'start' && childStart && parentStart && new Date(childStart) < new Date(parentStart)) {
      return `Start date cannot be earlier than Parent Start Date (${parentStart})`
    }
    if (dateType === 'end' && childEnd && parentEnd && new Date(childEnd) > new Date(parentEnd)) {
      return `End date cannot be later than Parent End Date (${parentEnd})`
    }
    return null
  }

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear validation error for this field when user makes changes
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    // Also clear duration error if either date changes
    if ((field === "exp_start_date" || field === "exp_end_date") && validationErrors.duration) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.duration
        return newErrors
      })
    }
  }

  const handleBack = () => {
    navigate(returnUrl)
  }

  const getStatusClasses = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "open":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "working":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "template":
        return "bg-violet-100 text-violet-800 border-violet-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  }

  // Loading state
  if (isLoadingTask) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading task details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (taskError || !task) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <Alert variant="destructive" className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Failed to load task "{taskName}". It may not exist or you may not have permission.
              </AlertDescription>
            </Alert>
            <Button onClick={handleBack} className="w-full">
              Return to List
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 h-16">
            <div className="flex items-center gap-3 overflow-hidden">
              <Button variant="ghost" size="icon" onClick={handleBack} type="button" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex flex-col min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-semibold leading-none tracking-tight truncate max-w-[150px] sm:max-w-md" title={formData.subject}>
                    {formData.subject || "Edit Task"}
                  </h1>
                  <Badge variant="outline" className={`shrink-0 ${getStatusClasses(formData.status)} border-0 text-[10px] px-1.5 py-0`}>
                    {formData.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">{task?.project || taskName}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-2">
                {(isOwner || isAssignee) && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 text-xs bg-black text-white hover:bg-gray-800 hover:text-white border-black"
                    onClick={() => setShowRequestToModal(true)}
                    disabled={loading}
                  >
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    {task?.custom_request_to ? "Update Request" : "Request To"}
                  </Button>
                )}
                {isOwner && !task?.custom_handover_to && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => setShowHandoverModal(true)}
                    disabled={loading}
                  >
                    <UserX className="mr-1.5 h-3.5 w-3.5" />
                    Handover
                  </Button>
                )}
              </div>
              {/* Mobile Actions Dropdown */}
              <div className="md:hidden">
                {(isOwner || isAssignee) && (
                  <Button variant="ghost" size="icon" onClick={() => setShowRequestToModal(true)} type="button">
                    <UserPlus className="h-5 w-5" />
                  </Button>
                )}
              </div>
              <Button variant="outline" onClick={handleBack} disabled={loading} type="button" className="hidden sm:flex h-9">
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.subject.trim()} size="sm" className="h-9 px-4">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 sm:mr-2" />}
                <span className="hidden sm:inline">{loading ? "Saving..." : "Save"}</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Breadcrumb Navigation */}
        {task && (
          <div className="border-b bg-gray-50/50 px-6 py-3">
            <TaskBreadcrumb key={task.name} task={task} />
          </div>
        )}

        <div className="container mx-auto max-w-[1600px] p-6">
          {showSuccess ? (
            <Card className="max-w-md mx-auto mt-12">
              <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="rounded-full bg-green-100 p-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-green-900">Task Updated!</h3>
                  <p className="text-sm text-muted-foreground">Redirecting you back...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_20%] gap-6">
              {/* LEFT COLUMN - Main Content */}
              <div className="space-y-6 min-w-0">
                {/* Required Fields Alert */}
                {requiredFieldsCount > 0 && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 font-medium">
                      {requiredFieldsCount} Required Field{requiredFieldsCount > 1 ? 's' : ''} Missing
                      <p className="text-sm font-normal mt-1">
                        Please fill in all required fields marked with red borders below.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Handover Status Alert */}
                {isHandoverRecipient && (
                  <HandoverStatusSection
                    task={task}
                    onStatusUpdate={() => {
                      mutateTask()
                    }}
                  />
                )}

                {/* Request To Status Alert */}
                {(isRequestRecipient || task?.custom_request_to) && (
                  <RequestToStatusSection
                    task={task}
                    currentUser={currentUser}
                    onStatusUpdate={() => {
                      mutateTask()
                    }}
                  />
                )}

                {/* Assignee Limited Access Banner */}
                {isAssignee && task?.owner !== currentUser && (
                  <Alert className="mb-4 border-yellow-300 bg-yellow-50">
                    <Info className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <strong>Limited Access:</strong> You can only edit Status and check/uncheck your assigned checklist items.
                    </AlertDescription>
                  </Alert>
                )}

                {/* SECTION: BASIC INFO */}
                <section className="border rounded-lg p-5 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b pb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Basic Info</h3>
                    <div
                      role="status"
                      aria-label={`Task status: ${formData.status}`}
                      className={`flex items-center gap-2 px-3 py-1 rounded-md border font-semibold ${getStatusClasses(formData.status)}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full ${formData.status === "Completed"
                          ? "bg-green-600"
                          : formData.status === "Overdue"
                            ? "bg-red-600"
                            : formData.status === "Working"
                              ? "bg-blue-600"
                              : formData.status === "Pending Review"
                                ? "bg-yellow-600"
                                : "bg-slate-600"
                          }`}
                      />
                      <span className="truncate max-w-[10rem]">{formData.status}</span>
                    </div>
                  </div>
                  <div className="space-y-5">
                    {/* Subject */}
                    <div className="space-y-2 relative" ref={subjectRef}>
                      {validationErrors.subject && (
                        <div className="absolute -top-2 right-0 z-10 animate-in zoom-in-95 fade-in duration-300">
                          <div className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                            <AlertCircle className="h-3 w-3" />
                            Required
                          </div>
                        </div>
                      )}
                      <div className={validationErrors.subject ? "border-2 border-red-500 rounded-lg p-2" : ""}>
                        <DataField
                          field={{
                            fieldname: "subject",
                            label: "Task Name",
                            fieldtype: "Data",
                            reqd: 1
                          }}
                          value={formData.subject}
                          onChange={(value) => handleFieldChange("subject", value)}
                          disabled={!permissions.canEditSubject || loading}
                        />
                      </div>
                      {validationErrors.subject && (
                        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{validationErrors.subject}</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <SelectField
                        field={{
                          fieldname: "type",
                          label: "Task Type",
                          fieldtype: "Select",
                          options: ["", "BaselineTask", "OperationalTask", "AdHoc"],
                        }}
                        value={formData.type}
                        onChange={(value) => handleFieldChange("type", value)}
                        disabled={loading || formData.type === "BaselineTask"}
                      />

                      <SelectField
                        field={{
                          fieldname: "status",
                          label: "Status",
                          fieldtype: "Select",
                          reqd: 1,
                          options: ["Open", "Working", "Pending Review", "Overdue", "Completed", "Cancelled", "Template", "On Hold"],
                        }}
                        value={formData.status}
                        onChange={(value) => handleFieldChange("status", value)}
                        disabled={!permissions.canEditStatus || loading}
                      />

                      <SelectField
                        field={{
                          fieldname: "priority",
                          label: "Priority",
                          fieldtype: "Select",
                          options: ["Low", "Medium", "High", "Urgent"],
                        }}
                        value={formData.priority}
                        onChange={(value) => handleFieldChange("priority", value)}
                        disabled={!permissions.canEditPriority || loading}
                      />

                      {/* Progress */}
                      <div>
                        <IntField
                          field={{
                            fieldname: "progress",
                            label: "Progress (%)",
                            fieldtype: "Int"
                          }}
                          value={formData.progress}
                          onChange={(value) => handleFieldChange("progress", value)}
                          disabled={loading || formData.is_group === 1}
                        />
                        {formData.progress > 0 && (
                          <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                            <div
                              className={`h-full transition-all ${formData.progress === 100
                                ? "bg-green-500"
                                : formData.progress >= 50
                                  ? "bg-blue-500"
                                  : "bg-yellow-500"
                                }`}
                              style={{ width: `${Math.min(100, Math.max(0, formData.progress))}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Group Checkbox */}
                    <div>
                      <CheckField
                        field={{
                          fieldname: "is_group",
                          label: "Is Group Task?",
                          fieldtype: "Check"
                        }}
                        value={formData.is_group}
                        onChange={(value) => handleFieldChange("is_group", value)}
                        disabled={loading || childrenLoading || hasChildren}
                      />
                      {hasChildren && <p className="text-[10px] text-red-500 mt-1 ml-6">Has child tasks (cannot uncheck)</p>}
                    </div>

                    {/* Completed Fields */}
                    {formData.status === "Completed" && (
                      <div className="p-4 bg-gray-50 rounded border grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in zoom-in-95">
                        <LinkField
                          field={{
                            fieldname: "completed_by",
                            label: "Completed By",
                            fieldtype: "Link",
                            options: "User"
                          }}
                          value={formData.completed_by}
                          onChange={(value) => handleFieldChange("completed_by", value)}
                          disabled={loading}
                        />
                        <DateField
                          field={{
                            fieldname: "completed_on",
                            label: "Completed On",
                            fieldtype: "Date"
                          }}
                          value={formData.completed_on}
                          onChange={(value) => handleFieldChange("completed_on", value)}
                          disabled={loading}
                        />
                      </div>
                    )}

                    {/* Description */}
                    <div className="pt-2">
                      <TextEditorField
                        field={{
                          fieldname: "description",
                          label: "Description",
                          fieldtype: "TextEditor"
                        }}
                        value={formData.description}
                        onChange={(value) => handleFieldChange("description", value)}
                        disabled={!permissions.canEditDescription || loading}
                      />
                    </div>
                  </div>
                </section>

                {/* SECTION: RESOURCES */}
                <section className="border rounded-lg p-5 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b pb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Resources</h3>
                  </div>
                  <TaskResourcesSection
                    formData={formData}
                    onChange={(field, value) => handleFieldChange(field, value)}
                    isReadOnly={!permissions.canEditResources || loading}
                    arePlannedResourcesReadOnly={formData.type === "Baseline Task"}
                    hiddenFieldsConfig={HIDDEN_FIELDS_CONFIG}
                    parentResources={parentTask}
                  />
                </section>

                {/* SECTION: ACCEPTANCE CRITERIA */}
                <section className="border rounded-lg p-5 bg-white shadow-sm">
                  <AcceptanceCriteriaSection
                    items={formData.custom_acceptance_criteria}
                    onChange={(items) => handleFieldChange("custom_acceptance_criteria", items)}
                    disabled={!permissions.canEditDescription || loading}
                  />
                </section>

                {/* SECTION: ENERGY POINTS */}
                <section className="border rounded-lg p-5 bg-white shadow-sm" ref={energyPointsRef}>
                  <div className="flex items-center justify-between mb-4 border-b pb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Energy Points</h3>
                  </div>
                  {(validationErrors.weightage || validationErrors.duplicate_users) && (
                    <Alert className="mb-4 bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {validationErrors.weightage || validationErrors.duplicate_users}
                      </AlertDescription>
                    </Alert>
                  )}
                  <EnergyPointsSection
                    formData={formData}
                    onFieldChange={handleFieldChange}
                    disabled={!permissions.canEditPoints || loading}
                  />
                </section>

                {/* SECTION: COMMENTS */}
                <section className="border rounded-lg p-5 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b pb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
                  </div>
                  <TaskComments taskName={taskName || ""} />
                </section>
              </div>

              {/* RIGHT COLUMN - Sidebar */}
              <div className="space-y-6 min-w-0">
                {/* SECTION: ASSIGN TO */}
                <section className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Assign To
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {/* Add Input */}
                    <div className="flex flex-col gap-2">
                      <LinkField
                        field={{
                          fieldname: "assign_to",
                          label: "",
                          fieldtype: "Link",
                          options: "User"
                        }}
                        value={newAssignee}
                        onChange={setNewAssignee}
                        disabled={loading || assignmentLoading}
                      />
                      <Button
                        type="button"
                        className="w-full"
                        variant="outline"
                        size="sm"
                        onClick={handleAddAssignment}
                        disabled={!newAssignee || loading || assignmentLoading}
                      >
                        {assignmentLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-2" />
                        ) : (
                          <UserPlus className="h-3 w-3 mr-2" />
                        )}
                        Add Member
                      </Button>
                    </div>

                    {/* List */}
                    <div className="space-y-2 mt-2">
                      {assignments.map((assignment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded bg-gray-50 hover:bg-white transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-6 w-6 min-w-[1.5rem] rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold border border-blue-200">
                              {assignment.owner.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-xs font-medium text-gray-900 truncate">{assignment.owner}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleRemoveAssignment(assignment.owner)}
                            disabled={loading || assignmentLoading}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {assignments.length === 0 && (
                        <div className="text-center py-4 text-xs text-gray-400 border border-dashed rounded">
                          No Assignments
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* SECTION: SCHEDULE */}
                <section className="border rounded-lg p-5 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b pb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
                  </div>
                  <div className="space-y-4">
                    {/* Baseline Dates */}
                    <div className="border rounded-md overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setScheduleSections(prev => ({ ...prev, baseline: !prev.baseline }))}
                        className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                          Baseline Schedule
                          {scheduleSections.baseline ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </span>
                      </button>
                      {scheduleSections.baseline && (
                        <div className="p-4 bg-white border-t space-y-4 animate-in slide-in-from-top-2 duration-200">
                          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Baseline Start</span>
                            <div className="text-sm font-medium text-slate-700 font-mono">
                              {formData.custom_baseline_start_date_ || (
                                <span className="text-slate-400 italic text-xs">Not set</span>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-[120px_1fr] items-center gap-4 border-t border-slate-100 pt-4">
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Baseline End</span>
                            <div className="text-sm font-medium text-slate-700 font-mono">
                              {formData.custom_baseline_end_date || (
                                <span className="text-slate-400 italic text-xs">Not set</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expected Dates */}
                    <div className="border rounded-md overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setScheduleSections(prev => ({ ...prev, expected: !prev.expected }))}
                        className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                          Expected Schedule
                          {scheduleSections.expected ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </span>
                      </button>
                      {scheduleSections.expected && (
                        <div className="p-4 bg-white border-t space-y-4 animate-in slide-in-from-top-2 duration-200">
                          {/* Start Date */}
                          <div className="space-y-2 relative" ref={startDateRef}>
                            {validationErrors.exp_start_date && (
                              <div className="absolute -top-2 right-0 z-10 animate-in zoom-in-95 fade-in duration-300">
                                <div className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                  <AlertCircle className="h-3 w-3" />
                                  Required
                                </div>
                              </div>
                            )}
                            <div className={validationErrors.exp_start_date ? "border-2 border-red-500 rounded-lg p-2" : ""}>
                              <DateField
                                field={{
                                  fieldname: "exp_start_date",
                                  label: "Expected Start",
                                  fieldtype: "Date",
                                  reqd: formData.status !== "Template" ? 1 : 0
                                }}
                                value={formData.exp_start_date}
                                onChange={(value) => handleFieldChange("exp_start_date", value)}
                                disabled={loading || !permissions.canEditDates || formData.type === "BaselineTask"}
                              />
                            </div>
                            {validationErrors.exp_start_date && (
                              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{validationErrors.exp_start_date}</span>
                              </div>
                            )}
                            {getDateValidationError('start') && (
                              <div className="flex items-start gap-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{getDateValidationError('start')}</span>
                              </div>
                            )}
                          </div>

                          {/* End Date */}
                          <div className="space-y-2 relative" ref={endDateRef}>
                            {(validationErrors.exp_end_date || validationErrors.duration) && (
                              <div className="absolute -top-2 right-0 z-10 animate-in zoom-in-95 fade-in duration-300">
                                <div className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                  <AlertCircle className="h-3 w-3" />
                                  Required
                                </div>
                              </div>
                            )}
                            <div className={(validationErrors.exp_end_date || validationErrors.duration) ? "border-2 border-red-500 rounded-lg p-2" : ""}>
                              <DateField
                                field={{
                                  fieldname: "exp_end_date",
                                  label: "Expected End",
                                  fieldtype: "Date",
                                  reqd: formData.status !== "Template" ? 1 : 0
                                }}
                                value={formData.exp_end_date}
                                onChange={(value) => handleFieldChange("exp_end_date", value)}
                                disabled={loading || !permissions.canEditDates || formData.type === "BaselineTask"}
                              />
                            </div>
                            {validationErrors.exp_end_date && (
                              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{validationErrors.exp_end_date}</span>
                              </div>
                            )}
                            {validationErrors.duration && (
                              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{validationErrors.duration}</span>
                              </div>
                            )}
                            {getDateValidationError('end') && (
                              <div className="flex items-start gap-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{getDateValidationError('end')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actual Dates */}
                    < div className="border rounded-md overflow-hidden" >
                      <button
                        type="button"
                        onClick={() => setScheduleSections(prev => ({ ...prev, actual: !prev.actual }))}
                        className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                          Actual Schedule
                          {scheduleSections.actual ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </span>
                      </button>
                      {
                        scheduleSections.actual && (
                          <div className="p-4 bg-white border-t space-y-4 animate-in slide-in-from-top-2 duration-200">
                            <DateField
                              field={{
                                fieldname: "custom_actual_start_date",
                                label: "Actual Start",
                                fieldtype: "Date"
                              }}
                              value={formData.custom_actual_start_date}
                              onChange={(value) => handleFieldChange("custom_actual_start_date", value)}
                              disabled={loading || !permissions.canEditDates}
                            />
                            <DateField
                              field={{
                                fieldname: "custom_actual_end_date",
                                label: "Actual End",
                                fieldtype: "Date"
                              }}
                              value={formData.custom_actual_end_date}
                              onChange={(value) => handleFieldChange("custom_actual_end_date", value)}
                              disabled={loading || !permissions.canEditDates}
                            />
                          </div>
                        )
                      }
                    </div >
                  </div >
                  {
                    formData.exp_start_date && formData.exp_end_date && !validationErrors.duration && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded px-3 w-fit">
                        <Info className="h-4 w-4" />
                        <span>
                          Duration:{' '}
                          {Math.ceil(
                            (new Date(formData.exp_end_date).getTime() - new Date(formData.exp_start_date).getTime()) /
                            (1000 * 60 * 60 * 24)
                          )}
                          {' '}days
                        </span>
                      </div>
                    )
                  }
                </section >

                {/* SECTION: ATTACHMENTS */}
                < section className="border rounded-lg p-4 bg-white shadow-sm" >
                  <AttachmentPanel doctype="Task" docname={taskName || ""} />
                </section >

                {/* SECTION: TAGS */}
                < section className="border rounded-lg p-4 bg-white shadow-sm" >
                  <TagsPanel doctype="Task" docname={taskName || ""} />
                </section >

                {/* SECTION: SHARED WITH */}
                < section className="border rounded-lg p-4 bg-white shadow-sm" >
                  <SharedPanel doctype="Task" docname={taskName || ""} />
                </section >
              </div >
            </div >
          )}
        </div >

        {/* Handover Modal */}
        < HandoverModal
          isOpen={showHandoverModal}
          onClose={() => setShowHandoverModal(false)}
          taskName={taskName || ""}
          taskSubject={formData.subject}
          onSuccess={() => {
            setShowHandoverModal(false)
            mutateTask()
          }}
        />

        {/* Request To Modal */}
        <RequestToModal
          isOpen={showRequestToModal}
          onClose={() => setShowRequestToModal(false)}
          taskName={taskName || ""}
          taskSubject={formData.subject}
          isOwner={isOwner}
          currentDistribution={formData.custom_points_distribution}
          onSuccess={() => {
            setShowRequestToModal(false)
            mutateTask()
          }}
        />
      </form >
    </div >
  )
}

export default EditTaskForm