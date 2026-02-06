"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useFrappePostCall } from "frappe-react-sdk"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, ArrowLeft, Info, AlertTriangle } from "lucide-react"
import { DataField, IntField } from "@/components/form/fields/BasicFields"
import { SelectField, LinkField } from "@/components/form/fields/SelectionFields"
import { DateField } from "@/components/form/fields/DateTimeFields"
import { CheckField } from "@/components/form/fields/CheckField"
import { TextEditorField } from "@/components/form/fields/TextFields"
import { toast } from "sonner"
import { EnergyPointsSection } from "./components/EnergyPointsSection"
import { ChecklistItemsSection } from "./components/ChecklistItemsSection"
import { validateWeightage, hasDuplicateUsers } from "@/utils/energyPointsCalculator"

const TemplateTaskForm: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Get parameters from URL
  const projectFromUrl = searchParams.get("project") || ""
  const parentTaskFromUrl = searchParams.get("parentTask") || ""
  const returnUrlParam = searchParams.get("returnUrl")
  const returnUrl = returnUrlParam ? decodeURIComponent(returnUrlParam) : "/task-manager/library-selection"

  // State for manual selection (when URL params not provided)
  const [manualProject, setManualProject] = useState<string>("")
  const [manualParentTask, setManualParentTask] = useState<string>("")

  // Use URL params if available, otherwise use manual selection
  const effectiveProject = projectFromUrl || manualProject
  const effectiveParentTask = parentTaskFromUrl || manualParentTask

  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    status: "Open",
    is_group: 0 as 0 | 1,
    priority: "Medium",
    project: "",
    parent_task: "",
    exp_start_date: "",
    exp_end_date: "",
    custom_points: 0,
    custom_final_points: 0,
    custom_points_distribution: [] as Array<any>,
    custom_checklist: [] as Array<any>,
  })

  const [showSuccess, setShowSuccess] = useState(false)
  const [validationError, setValidationError] = useState<string>("")
  const [createdTaskName, setCreatedTaskName] = useState<string>("")
  const [parentValidation, setParentValidation] = useState<any>(null)

  // API calls
  const { call: createTemplate, loading, error, reset } = useFrappePostCall(
    "kb_task.api.template_management.create_template_task"
  )

  const { call: validateParent } = useFrappePostCall(
    "kb_task.api.template_management.validate_template_parent"
  )

  // Sync formData with effective values
  useEffect(() => {
    if (effectiveProject && effectiveProject !== formData.project) {
      setFormData((prev) => ({ ...prev, project: effectiveProject }))
    }
    if (effectiveParentTask !== formData.parent_task) {
      setFormData((prev) => ({ ...prev, parent_task: effectiveParentTask }))
    }
  }, [effectiveProject, effectiveParentTask])

  // Validate parent when selected
  useEffect(() => {
    if (effectiveParentTask) {
      validateParent({ parent_task: effectiveParentTask })
        .then((result) => {
          if (result?.message) {
            setParentValidation(result.message)
          }
        })
        .catch((err) => {
          console.error("Failed to validate parent:", err)
        })
    } else {
      setParentValidation(null)
    }
  }, [effectiveParentTask])

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleBack = () => {
    navigate(returnUrl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear any previous validation errors
    setValidationError("")

    // Validate required fields
    if (!formData.subject.trim()) {
      setValidationError("Subject is required")
      toast.error("Subject is required")
      return
    }

    if (!effectiveProject) {
      setValidationError("Project is required")
      toast.error("Please select a project")
      return
    }

    // Validate energy points if distribution exists
    if (formData.custom_points_distribution?.length) {
      const weightageCheck = validateWeightage(formData.custom_points_distribution)
      if (!weightageCheck.valid) {
        setValidationError(weightageCheck.message || "Invalid weightage distribution")
        toast.error(weightageCheck.message)
        return
      }

      const duplicateCheck = hasDuplicateUsers(formData.custom_points_distribution)
      if (duplicateCheck.hasDuplicate) {
        setValidationError(`Duplicate user: ${duplicateCheck.duplicateUser}`)
        toast.error("Cannot have duplicate users in points distribution")
        return
      }
    }

    try {
      // Prepare payload for template creation
      const payload = {
        subject: formData.subject,
        project: effectiveProject,
        parent_task: effectiveParentTask || null,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        is_group: formData.is_group,
        exp_start_date: formData.exp_start_date || null,
        exp_end_date: formData.exp_end_date || null,
        custom_points: formData.custom_points || 0,
        custom_points_distribution: JSON.stringify(formData.custom_points_distribution),
        custom_checklist: JSON.stringify(formData.custom_checklist),
      }

      const result = await createTemplate(payload)

      if (result?.message?.success) {
        setCreatedTaskName(result.message.task?.name || "")
        setShowSuccess(true)

        // Show success message
        toast.success(result.message.message || "Template task created successfully")

        // Show info if parent was converted to group
        if (result.message.parent_converted) {
          toast.info("Parent task was automatically converted to a group task")
        }

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate(returnUrl)
        }, 2000)
      } else {
        toast.error(result?.message?.message || "Failed to create template task")
        setValidationError(result?.message?.message || "Failed to create template task")
      }
    } catch (error: any) {
      console.error("Failed to create template task:", error)
      toast.error(error?.message || "Failed to create template task")
      setValidationError(error?.message || "An unexpected error occurred")
    }
  }

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Page Title */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">Create Template Task</h1>
          <p className="text-white/80">
            Create a reusable template task that can be cloned for recurring work
          </p>
        </div>


        <Card>
          <CardHeader>
            <CardTitle>Template Task Details</CardTitle>
          </CardHeader>
          <CardContent>
            {showSuccess ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <p className="text-lg font-medium text-green-600">Template task created successfully!</p>
                {createdTaskName && (
                  <p className="text-sm text-muted-foreground font-mono mt-2">Task ID: {createdTaskName}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">Redirecting...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Info Alert */}
                <Alert className="mb-6 bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Template tasks are reusable task definitions. They won't be assigned to anyone until cloned as
                    actual tasks. Use the "Is Group" option to create parent templates that can contain child templates.
                  </AlertDescription>
                </Alert>

                {/* Project selection alert - Only shown when project not from URL */}
                {!projectFromUrl && (
                  <Alert className={`mb-6 ${effectiveProject ? "bg-green-50 border-green-200" : ""}`}>
                    <AlertDescription className={effectiveProject ? "text-green-800" : ""}>
                      {effectiveProject ? (
                        <>✓ Project selected. You can now fill in the template details below.</>
                      ) : (
                        <>Please select a project first to continue creating your template task.</>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Parent validation warning */}
                {parentValidation && parentValidation.can_convert_to_group && (
                  <Alert className="mb-6 bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">{parentValidation.message}</AlertDescription>
                  </Alert>
                )}

                {/* Two-Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-[1.5fr,1fr] gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Basic Info Section */}
                    <section className="border rounded-lg p-5 bg-white shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Basic Info</h3>
                      <div className="space-y-4">
                        {/* Project - Always visible */}
                        <div className="space-y-2">
                          {projectFromUrl ? (
                            <>
                              <Label htmlFor="project">Project</Label>
                              <Input id="project" value={formData.project} disabled className="bg-gray-50" />
                            </>
                          ) : (
                            <LinkField
                              field={{
                                fieldname: "project",
                                label: "Project",
                                fieldtype: "Link",
                                options: "Project",
                                reqd: 1,
                                description: "Select the project this template belongs to",
                              }}
                              value={manualProject}
                              onChange={setManualProject}
                              disabled={loading}
                              showLabel={true}
                            />
                          )}
                        </div>

                        {/* Parent Task - Filter to template + group only */}
                        <div className="space-y-2">
                          {parentTaskFromUrl ? (
                            <>
                              <Label htmlFor="parentTask">Parent Template Task</Label>
                              <Input
                                id="parentTask"
                                value={formData.parent_task}
                                disabled
                                className="bg-gray-50 font-mono text-sm"
                              />
                            </>
                          ) : (
                            <LinkField
                              field={{
                                fieldname: "parent_task",
                                label: "Parent Template Task (Optional)",
                                fieldtype: "Link",
                                options: "Task",
                                description: "Select a parent template if this is a child template",
                                apiConfig: {
                                  params: {
                                    filters: [
                                      ["is_template", "=", 1],
                                      ["is_group", "=", 1],
                                    ]
                                  }
                                }
                              }}
                              value={manualParentTask}
                              onChange={setManualParentTask}
                              disabled={loading}
                              showLabel={true}
                            />
                          )}
                        </div>

                        {/* Subject */}
                        <DataField
                          field={{
                            fieldname: "subject",
                            label: "Subject",
                            fieldtype: "Data",
                            reqd: 1,
                            description: "Brief title for this template task",
                          }}
                          value={formData.subject}
                          onChange={(value) => handleFieldChange("subject", value)}
                          disabled={loading}
                        />

                        {/* Description */}
                        <TextEditorField
                          field={{
                            fieldname: "description",
                            label: "Description",
                            fieldtype: "Text Editor",
                            description: "Detailed description of what this template task involves",
                          }}
                          value={formData.description}
                          onChange={(value) => handleFieldChange("description", value)}
                          disabled={loading}
                        />

                        {/* Is Group Checkbox */}
                        <div className="space-y-2">
                          <CheckField
                            field={{
                              fieldname: "is_group",
                              label: "Is Group",
                              fieldtype: "Check",
                              description:
                                "Check this to create a parent template that can contain child templates",
                            }}
                            value={formData.is_group}
                            onChange={(value) => handleFieldChange("is_group", value ? 1 : 0)}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </section>

                    {/* Schedule Section */}
                    <section className="border rounded-lg p-5 bg-white shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">
                        Default Schedule (Optional)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DateField
                          field={{
                            fieldname: "exp_start_date",
                            label: "Expected Start Date",
                            fieldtype: "Date",
                            description: "Default start date for tasks created from this template",
                          }}
                          value={formData.exp_start_date}
                          onChange={(value) => handleFieldChange("exp_start_date", value)}
                          disabled={loading}
                        />

                        <DateField
                          field={{
                            fieldname: "exp_end_date",
                            label: "Expected End Date",
                            fieldtype: "Date",
                            description: "Default end date for tasks created from this template",
                          }}
                          value={formData.exp_end_date}
                          onChange={(value) => handleFieldChange("exp_end_date", value)}
                          disabled={loading}
                        />
                      </div>
                    </section>

                    {/* Checklist Section */}
                    <section className="border rounded-lg p-5 bg-white shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">
                        Skills Checklist (Optional)
                      </h3>
                      <ChecklistItemsSection
                        items={formData.custom_checklist}
                        onChange={(items) => handleFieldChange("custom_checklist", items)}
                        disabled={loading}
                      />
                    </section>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Settings Section */}
                    <section className="border rounded-lg p-5 bg-white shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Settings</h3>
                      <div className="space-y-4">
                        <SelectField
                          field={{
                            fieldname: "priority",
                            label: "Priority",
                            fieldtype: "Select",
                            options: ["Low", "Medium", "High", "Urgent"],
                            description: "Default priority for tasks created from this template",
                          }}
                          value={formData.priority}
                          onChange={(value) => handleFieldChange("priority", value)}
                          disabled={loading}
                        />

                        <SelectField
                          field={{
                            fieldname: "status",
                            label: "Status",
                            fieldtype: "Select",
                            options: ["Open", "Working", "Pending Review", "Completed", "Cancelled"],
                            description: "Initial status for this template",
                          }}
                          value={formData.status}
                          onChange={(value) => handleFieldChange("status", value)}
                          disabled={loading}
                        />
                      </div>
                    </section>

                    {/* Energy Points Section */}
                    <section className="border rounded-lg p-5 bg-white shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">
                        Energy Points (Optional)
                      </h3>
                      <EnergyPointsSection
                        formData={formData}
                        onFieldChange={handleFieldChange}
                        disabled={loading}
                      />
                    </section>
                  </div>
                </div>

                {/* Validation Errors */}
                {validationError && (
                  <Alert variant="destructive" className="mt-6">
                    <AlertDescription>{validationError}</AlertDescription>
                  </Alert>
                )}

                {/* Form Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !formData.subject.trim() || !effectiveProject}
                    className="bg-gradient-to-r from-blue-600 to-blue-400 text-white flex items-center justify-center hover:from-blue-700 hover:to-blue-600"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Creating Template..." : "Create Template Task"}
                  </Button>

                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default TemplateTaskForm
