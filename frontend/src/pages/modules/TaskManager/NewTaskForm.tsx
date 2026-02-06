"use client"

import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useFrappeCreateDoc, useFrappeGetDoc } from "frappe-react-sdk"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, ArrowLeft, Plus, X, UserPlus, ArrowRight, AlertCircle } from "lucide-react"
import { DataField, IntField } from "@/components/form/fields/BasicFields"
import { SelectField, LinkField } from "@/components/form/fields/SelectionFields"
import { DateField } from "@/components/form/fields/DateTimeFields"
import { CheckField } from "@/components/form/fields/CheckField"
import { TextEditorField } from "@/components/form/fields/TextFields"
import { toast } from "sonner"
import { EnergyPointsSection } from "./components/EnergyPointsSection"
import { ChecklistItemsSection } from "./components/ChecklistItemsSection"
import { ValidationMessage } from "@/components/ui/form/ValidationMessage"
import { validateWeightage, hasDuplicateUsers } from "@/utils/energyPointsCalculator"

interface Assignment {
  email: string
}

interface ValidationErrors {
  [key: string]: string
}

const NewTaskForm: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const projectFromUrl = searchParams.get("project") || ""
  const parentTaskFromUrl = searchParams.get("parentTask") || ""
  const statusFromUrl = searchParams.get("status") || "Open"
  const returnUrlParam = searchParams.get("returnUrl")
  const returnUrl = returnUrlParam ? decodeURIComponent(returnUrlParam) : "/task-manager"

  const [manualProject, setManualProject] = useState<string>("")
  const [manualParentTask, setManualParentTask] = useState<string>("")

  const effectiveProject = projectFromUrl || manualProject
  const effectiveParentTask = parentTaskFromUrl || manualParentTask

  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    status: statusFromUrl,
    is_group: 0 as 0 | 1,
    progress: 0,
    exp_start_date: "",
    exp_end_date: "",
    priority: "Medium",
    project: "",
    parent_task: "",
    custom_points: 0,
    custom_final_points: 0,
    custom_points_distribution: [] as Array<any>,
  })

  const [showSuccess, setShowSuccess] = useState(false)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [newAssignee, setNewAssignee] = useState("")
  const [assignmentLoading, setAssignmentLoading] = useState(false)
  const [createdTaskName, setCreatedTaskName] = useState<string>("")
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [requiredFieldsCount, setRequiredFieldsCount] = useState(0)

  // Refs for scrolling to fields
  const projectRef = useRef<HTMLDivElement>(null)
  const subjectRef = useRef<HTMLDivElement>(null)
  const startDateRef = useRef<HTMLDivElement>(null)
  const endDateRef = useRef<HTMLDivElement>(null)

  const { createDoc, loading, error, reset } = useFrappeCreateDoc()

  // Fetch Parent Task for Validation
  const { data: parentTask } = useFrappeGetDoc("Task", effectiveParentTask || "", {
    fields: ["exp_start_date", "exp_end_date"],
  })

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

  useEffect(() => {
    if (effectiveProject && effectiveProject !== formData.project) {
      setFormData((prev) => ({ ...prev, project: effectiveProject }))
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.project
        return newErrors
      })
    }
    if (effectiveParentTask !== formData.parent_task) {
      setFormData((prev) => ({ ...prev, parent_task: effectiveParentTask }))
    }
  }, [effectiveProject, effectiveParentTask])

  // Validate duration and clear errors when dates are valid
  useEffect(() => {
    if (formData.exp_start_date && formData.exp_end_date) {
      const startDate = new Date(formData.exp_start_date)
      const endDate = new Date(formData.exp_end_date)
      const durationInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

      if (durationInDays < 0) {
        setValidationErrors((prev) => ({
          ...prev,
          duration: "End date must be after start date",
        }))
      } else {
        setValidationErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.duration
          return newErrors
        })
      }
    } else {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.duration
        return newErrors
      })
    }
  }, [formData.exp_start_date, formData.exp_end_date])

  // Update required fields count
  useEffect(() => {
    const count = Object.keys(validationErrors).length
    setRequiredFieldsCount(count)
  }, [validationErrors])

  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
  }

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

  // Helper function to parse and display server errors without "Error" word
  const displayServerError = (err: any) => {
    let errorMessage = "Failed to create task"

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
      errorMessage = "An unexpected issue occurred while creating the task"
    }

    toast.error(errorMessage, {
      duration: 5000,
      position: "bottom-right",
    })

    console.error("Task creation issue:", err)
  }

  const handleAddAssignment = () => {
    if (!newAssignee || assignments.some((a) => a.email === newAssignee)) {
      return
    }
    setAssignments((prev) => [...prev, { email: newAssignee }])
    setNewAssignee("")
  }

  const handleRemoveAssignment = (email: string) => {
    setAssignments((prev) => prev.filter((a) => a.email !== email))
  }

  const assignUsersToTask = async (taskName: string) => {
    if (assignments.length === 0) return

    setAssignmentLoading(true)
    let failedAssignments = 0

    for (const assignment of assignments) {
      try {
        const response = await fetch("/api/method/frappe.desk.form.assign_to.add", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Frappe-CSRF-Token": getCsrfToken(),
          },
          credentials: "include",
          body: new URLSearchParams({
            doctype: "Task",
            name: taskName,
            assign_to: JSON.stringify([assignment.email]),
            description: `Assigned to ${formData.subject}`,
          }).toString(),
        })

        if (!response.ok) {
          console.error(`Failed to assign ${assignment.email}`)
          failedAssignments++
        }
      } catch (err) {
        console.error(`Issue assigning ${assignment.email}:`, err)
        failedAssignments++
      }
    }

    setAssignmentLoading(false)

    if (failedAssignments > 0) {
      toast.warning(
        `Task created but ${failedAssignments} assignment(s) failed. You can assign users manually.`,
        {
          duration: 6000,
          position: "bottom-right",
        }
      )
    }
  }

  // Scroll to first error field
  const scrollToFirstError = (errors: ValidationErrors) => {
    const errorFields = Object.keys(errors)
    if (errorFields.length === 0) return

    const firstError = errorFields[0]
    let targetRef: React.RefObject<HTMLDivElement> | null = null

    switch (firstError) {
      case "project":
        targetRef = projectRef
        break
      case "subject":
        targetRef = subjectRef
        break
      case "exp_start_date":
        targetRef = startDateRef
        break
      case "exp_end_date":
      case "duration":
        targetRef = endDateRef
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

    if (!effectiveProject) {
      errors.project = "Project is required"
    }

    if (formData.status !== "Template") {
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
        errors.weightage = weightageCheck.message
      }

      const duplicateCheck = hasDuplicateUsers(formData.custom_points_distribution)
      if (duplicateCheck.hasDuplicate) {
        errors.duplicate_users = "Cannot have duplicate users in points distribution"
      }
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
      const result = await createDoc("Task", formData)
      if (result && result.name) {
        setCreatedTaskName(result.name)
        setShowSuccess(true)

        await assignUsersToTask(result.name)

        toast.success("Task created successfully!", {
          duration: 2000,
          position: "bottom-right",
        })

        setTimeout(() => {
          navigate(returnUrl, { state: { refresh: true } })
        }, 1500)
      }
    } catch (err: any) {
      displayServerError(err)
      reset()
    }
  }

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleBack = () => {
    navigate(returnUrl)
  }

  const handleNavigateToParentTask = () => {
    if (effectiveParentTask) {
      const currentReturnUrl = encodeURIComponent(window.location.pathname + window.location.search)
      navigate(`/task-manager/edit/${effectiveParentTask}?returnUrl=${currentReturnUrl}`)
    }
  }

  return (
    <>
      <div className="relative flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-400 text-white">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" onClick={handleBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Create New Task</h1>
          <p className="text-white/80">Add a new task with details, schedule, and assignments</p>
        </div>
        <div className="p-6">
          <Plus className="h-24 w-24 text-white/20" />
        </div>
      </div>

      <div className="p-6 bg-background">
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
            <CardDescription>
              {parentTaskFromUrl
                ? `Creating a child task under ${parentTaskFromUrl}`
                : projectFromUrl
                  ? `Creating a task for project ${projectFromUrl}`
                  : "Fill in the information below to create a new task"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {showSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-600">Task created successfully!</p>
                {createdTaskName && (
                  <p className="text-xs text-muted-foreground font-mono">Task ID: {createdTaskName}</p>
                )}
                <p className="text-xs text-muted-foreground">Redirecting...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Required Fields Alert */}
                {requiredFieldsCount > 0 && (
                  <Alert className="mb-6 bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 font-medium">
                      {requiredFieldsCount} Required Field{requiredFieldsCount > 1 ? 's' : ''} Missing
                      <p className="text-sm font-normal mt-1">
                        Please fill in all required fields marked with red borders below.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {!projectFromUrl && !validationErrors.project && (
                  <Alert className={`mb-6 ${effectiveProject ? "bg-green-50 border-green-200" : ""}`}>
                    <AlertDescription className={effectiveProject ? "text-green-800" : ""}>
                      {effectiveProject ? (
                        <>✓ Project selected. You can now fill in the task details below.</>
                      ) : (
                        <>Please select a project first to continue creating your task.</>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-[1.5fr,1fr] gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Basic Info Section */}
                    <section className="border rounded-lg p-5 bg-white shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Basic Info</h3>
                      <div className="space-y-4">
                        {/* Project */}
                        <div className="space-y-2 relative" ref={projectRef}>
                          {projectFromUrl ? (
                            <>
                              <Label htmlFor="project">Project</Label>
                              <Input id="project" value={formData.project} disabled className="bg-gray-50" />
                            </>
                          ) : (
                            <>
                              {validationErrors.project && (
                                <div className="absolute -top-2 right-0 z-10 animate-in zoom-in-95 fade-in duration-300">
                                  <div className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                    <AlertCircle className="h-3 w-3" />
                                    Required
                                  </div>
                                </div>
                              )}
                              <div className={validationErrors.project ? "border-2 border-red-500 rounded-lg p-2" : ""}>
                                <LinkField
                                  field={{
                                    fieldname: "project",
                                    label: "Project",
                                    fieldtype: "Link",
                                    options: "Project",
                                    reqd: 1,
                                    description: "Select the project this task belongs to",
                                  }}
                                  value={manualProject}
                                  onChange={setManualProject}
                                  disabled={loading}
                                  showLabel={true}
                                />
                              </div>
                              {validationErrors.project && (
                                <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <span>{validationErrors.project}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Parent Task */}
                        <div className="space-y-2">
                          <Label>Parent Task (Optional)</Label>
                          <div className="flex gap-2 items-start">
                            <div className="flex-1">
                              {parentTaskFromUrl ? (
                                <Input
                                  id="parentTask"
                                  value={formData.parent_task}
                                  disabled
                                  className="bg-gray-50 font-mono text-sm"
                                />
                              ) : (
                                <LinkField
                                  field={{
                                    fieldname: "parent_task",
                                    label: "",
                                    fieldtype: "Link",
                                    options: "Task",
                                    description: "Select a parent task if this is a sub-task",
                                  }}
                                  value={manualParentTask}
                                  onChange={setManualParentTask}
                                  disabled={loading}
                                  showLabel={false}
                                />
                              )}
                            </div>

                            {effectiveParentTask && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleNavigateToParentTask}
                                disabled={loading}
                                className="flex-shrink-0 h-10 w-10 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                title="Open parent task"
                              >
                                <ArrowRight className="h-4 w-4 text-blue-600" />
                              </Button>
                            )}
                          </div>
                          {effectiveParentTask && (
                            <p className="text-xs text-muted-foreground">
                              Click the arrow to view the parent task
                            </p>
                          )}
                        </div>

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
                                label: "Subject",
                                fieldtype: "Data",
                                reqd: 1,
                                description: "A clear, descriptive name for the task",
                                length: 140,
                              }}
                              value={formData.subject}
                              onChange={(value) => handleFieldChange("subject", value)}
                              disabled={loading}
                              showLabel={true}
                            />
                          </div>
                          {validationErrors.subject && (
                            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>{validationErrors.subject}</span>
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        <TextEditorField
                          field={{
                            fieldname: "description",
                            label: "Description",
                            fieldtype: "TextEditor",
                            description: "Detailed information about this task",
                          }}
                          value={formData.description}
                          onChange={(value) => handleFieldChange("description", value)}
                          disabled={loading}
                          showLabel={true}
                        />

                        {/* Status */}
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
                          disabled={loading}
                          showLabel={true}
                        />

                        {/* Priority */}
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

                        {/* Is Group */}
                        <CheckField
                          field={{
                            fieldname: "is_group",
                            label: "Is this a Group Task?",
                            fieldtype: "Check",
                            description: "Group tasks act as containers and can have sub-tasks. Regular tasks are actionable items.",
                          }}
                          value={formData.is_group}
                          onChange={(value) => handleFieldChange("is_group", value)}
                          disabled={loading}
                        />

                        {/* Progress */}
                        <IntField
                          field={{
                            fieldname: "progress",
                            label: "Progress (%)",
                            fieldtype: "Int",
                            description: "Task completion percentage (0-100)",
                          }}
                          value={formData.progress}
                          onChange={(value) => handleFieldChange("progress", value)}
                          disabled={loading}
                          showLabel={true}
                        />

                        {/* Progress Bar */}
                        {formData.progress > 0 && (
                          <div className="space-y-2">
                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 transition-all rounded-full"
                                style={{ width: `${Math.min(100, Math.max(0, formData.progress))}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Schedule Section */}
                    <section className="border rounded-lg p-5 bg-white shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Schedule</h3>
                      <div className="space-y-4">
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
                                label: "Expected Start Date",
                                fieldtype: "Date",
                                reqd: formData.status !== "Template" ? 1 : 0,
                              }}
                              value={formData.exp_start_date}
                              onChange={(value) => handleFieldChange("exp_start_date", value)}
                              disabled={loading}
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
                                label: "Expected End Date",
                                fieldtype: "Date",
                                reqd: formData.status !== "Template" ? 1 : 0,
                              }}
                              value={formData.exp_end_date}
                              onChange={(value) => handleFieldChange("exp_end_date", value)}
                              disabled={loading}
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

                        {/* Duration Display */}
                        {
                          formData.exp_start_date && formData.exp_end_date && !validationErrors.duration && (
                            <Alert>
                              <AlertDescription>
                                <strong>Duration:</strong>{" "}
                                {Math.ceil(
                                  (new Date(formData.exp_end_date).getTime() -
                                    new Date(formData.exp_start_date).getTime()) /
                                  (1000 * 60 * 60 * 24)
                                )}{" "}
                                days
                              </AlertDescription>
                            </Alert>
                          )
                        }
                      </div >
                    </section >

                    {/* Energy Points Section */}
                    < section className="border rounded-lg p-5 bg-white shadow-sm" >
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Energy Points</h3>
                      {
                        (validationErrors.weightage || validationErrors.duplicate_users) && (
                          <Alert className="mb-4 bg-red-50 border-red-200">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                              {validationErrors.weightage || validationErrors.duplicate_users}
                            </AlertDescription>
                          </Alert>
                        )
                      }
                      <EnergyPointsSection
                        formData={formData}
                        onFieldChange={handleFieldChange}
                        disabled={loading}
                      />
                    </section >
                  </div >

                  {/* Right Column */}
                  < div className="space-y-6" >
                    {/* Assign To Section */}
                    < section className="border rounded-lg p-5 bg-white shadow-sm" >
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Assign To</Label>
                          <p className="text-sm text-muted-foreground">Add team members to this task</p>
                        </div>

                        <div className="flex gap-2">
                          <LinkField
                            field={{
                              fieldname: "assign_to",
                              label: "",
                              fieldtype: "Link",
                              options: "User",
                            }}
                            value={newAssignee}
                            onChange={setNewAssignee}
                            disabled={loading || assignmentLoading}
                            showLabel={false}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddAssignment}
                            disabled={!newAssignee || loading || assignmentLoading}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </div>

                        {assignments.length > 0 && (
                          <div className="space-y-2">
                            <Label>Assigned To ({assignments.length})</Label>
                            <div className="border rounded-lg divide-y bg-gray-50">
                              {assignments.map((assignment, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 hover:bg-white transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                      <span className="text-xs font-medium text-indigo-600">
                                        {assignment.email.substring(0, 2).toUpperCase()}
                                      </span>
                                    </div>
                                    <span className="text-sm font-medium">{assignment.email}</span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveAssignment(assignment.email)}
                                    disabled={loading || assignmentLoading}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {assignments.length === 0 && (
                          <Alert>
                            <AlertDescription>
                              No users assigned yet. Add users above to assign them to this task.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </section >
                  </div >
                </div >

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-700 hover:to-blue-600"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Creating..." : "Create Task"}
                  </Button>
                </div>
              </form >
            )}
          </CardContent >
        </Card >
      </div >
    </>
  )
}

export default NewTaskForm