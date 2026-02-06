import React, { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useFrappePostCall } from "frappe-react-sdk"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import ProjectSelector from "./components/ProjectSelector"
import { LinkField } from "@/components/form/fields/SelectionFields"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Download,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  X,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface TemplateTaskRow {
  subject: string
  description?: string
  priority?: string
  progress?: number
  custom_points?: number
  is_group?: number
  validation_errors: string[]
  is_valid: boolean
}

interface BulkCreateResult {
  success: boolean
  created_count: number
  failed_count: number
  created_tasks: Array<{ name: string; subject: string }>
  failed_tasks: Array<{ subject: string; error: string }>
  message: string
  parent_converted: boolean
}

const BulkTemplateTaskCreate: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectFromUrl = searchParams.get("project")
  const parentTaskFromUrl = searchParams.get("parentTask")
  const returnUrl = searchParams.get("returnUrl")

  const [selectedProject, setSelectedProject] = useState<string>(projectFromUrl || "")
  const [selectedParentTask, setSelectedParentTask] = useState<string>(parentTaskFromUrl || "")
  const [file, setFile] = useState<File | null>(null)
  const [tasks, setTasks] = useState<TemplateTaskRow[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [createResult, setCreateResult] = useState<BulkCreateResult | null>(null)

  // Use URL params or selected values
  const project = projectFromUrl || selectedProject
  const parentTask = parentTaskFromUrl || selectedParentTask

  const { call: bulkCreateTemplates, loading: isCreating } = useFrappePostCall<BulkCreateResult>(
    "kb_task.api.bulk_template_management.bulk_create_template_tasks"
  )

  // Validation constants
  const validPriorities = ["Low", "Medium", "High", "Urgent"]

  const downloadTemplate = () => {
    const templateData = [
      {
        "Subject*": "Example Template Task 1",
        Description: "This is an example template description",
        Priority: "Medium",
        Progress: 0,
        "Base Points": 5,
        "Is Group": 0,
      },
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Template Tasks")

    // Set column widths
    ws["!cols"] = [
      { wch: 30 }, // Subject
      { wch: 40 }, // Description
      { wch: 12 }, // Priority
      { wch: 10 }, // Progress
      { wch: 12 }, // Points
      { wch: 10 }, // Is Group
    ]

    XLSX.writeFile(wb, `bulk_template_tasks_template_${Date.now()}.xlsx`)
  }

  const validateTask = (task: any, index: number): TemplateTaskRow => {
    const errors: string[] = []

    // Required field validation
    if (!task["Subject*"] || task["Subject*"].toString().trim() === "") {
      errors.push("Subject is required")
    } else if (task["Subject*"].toString().length > 140) {
      errors.push("Subject must be 140 characters or less")
    }

    // Priority validation
    if (task.Priority && !validPriorities.includes(task.Priority)) {
      errors.push(`Invalid priority. Must be one of: ${validPriorities.join(", ")}`)
    }

    // Progress validation
    if (task.Progress !== undefined && task.Progress !== null && task.Progress !== "") {
      const progress = Number(task.Progress)
      if (isNaN(progress) || progress < 0 || progress > 100) {
        errors.push("Progress must be between 0 and 100")
      }
    }

    // Base Points validation
    if (task["Base Points"] !== undefined && task["Base Points"] !== null && task["Base Points"] !== "") {
      const points = Number(task["Base Points"])
      if (isNaN(points) || points < 0) {
        errors.push("Base Points must be a non-negative number")
      }
    }

    // Is Group validation
    if (task["Is Group"] !== undefined && task["Is Group"] !== null && task["Is Group"] !== "") {
      const isGroup = Number(task["Is Group"])
      if (![0, 1].includes(isGroup)) {
        errors.push("Is Group must be 0 or 1")
      }
    }

    return {
      subject: task["Subject*"]?.toString() || "",
      description: task.Description?.toString() || "",
      priority: task.Priority || "Medium",
      progress: task.Progress !== undefined ? Number(task.Progress) : 0,
      custom_points: task["Base Points"] !== undefined ? Number(task["Base Points"]) : 0,
      is_group: task["Is Group"] !== undefined ? Number(task["Is Group"]) : 0,
      validation_errors: errors,
      is_valid: errors.length === 0,
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ]
    if (!validTypes.includes(uploadedFile.type)) {
      setUploadError("Invalid file type. Please upload an Excel file (.xlsx or .xls)")
      return
    }

    setFile(uploadedFile)
    setUploadError(null)
    setCreateResult(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = event.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)

        if (jsonData.length === 0) {
          setUploadError("Excel file is empty")
          return
        }

        const validatedTasks = jsonData.map((task, index) => validateTask(task, index))
        setTasks(validatedTasks)
        setShowPreview(true)
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Failed to parse Excel file")
        console.error("Excel parse error:", error)
      }
    }
    reader.onerror = () => {
      setUploadError("Failed to read file")
    }
    reader.readAsBinaryString(uploadedFile)
  }

  const removeTask = (index: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCreateTasks = async () => {
    if (!project) return

    const validTasks = tasks.filter((task) => task.is_valid)
    if (validTasks.length === 0) {
      setUploadError("No valid template tasks to create")
      return
    }

    try {
      const result = await bulkCreateTemplates({
        tasks_json: JSON.stringify(validTasks),
        project: project,
        parent_task: parentTask || undefined,
      })

      console.log("Bulk template create result:", result)

      // Frappe wraps the response in a 'message' field
      const responseData = result?.message || result

      // Ensure result has expected structure
      const normalizedResult = {
        success: responseData?.success ?? false,
        created_count: responseData?.created_count ?? 0,
        failed_count: responseData?.failed_count ?? 0,
        created_tasks: responseData?.created_tasks ?? [],
        failed_tasks: responseData?.failed_tasks ?? [],
        message: responseData?.message ?? "",
        parent_converted: responseData?.parent_converted ?? false,
      }

      setCreateResult(normalizedResult)

      // If all tasks succeeded, redirect after a short delay
      if (normalizedResult.success && normalizedResult.failed_count === 0) {
        setTimeout(() => {
          if (returnUrl) {
            navigate(decodeURIComponent(returnUrl))
          } else {
            navigate(`/task-manager/library-selection?project=${project}`)
          }
        }, 1500)
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Failed to create template tasks")
      console.error("Bulk template create error:", error)
    }
  }

  const handleBack = () => {
    if (returnUrl) {
      navigate(decodeURIComponent(returnUrl))
    } else if (project) {
      navigate(`/task-manager/library-selection?project=${project}`)
    } else {
      navigate(`/task-manager/library-selection`)
    }
  }

  const handleProjectChange = (newProject: string) => {
    setSelectedProject(newProject)
    // Clear any previous results when changing project
    setCreateResult(null)
    setUploadError(null)
  }

  const handleParentTaskChange = (newParentTask: string) => {
    setSelectedParentTask(newParentTask)
    // Clear any previous results when changing parent task
    setCreateResult(null)
    setUploadError(null)
  }

  const validTaskCount = tasks.filter((t) => t.is_valid).length
  const invalidTaskCount = tasks.filter((t) => !t.is_valid).length

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Bulk Template Task Creation</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Upload an Excel file to create multiple template tasks
                {parentTask ? (
                  <span className="font-medium"> under parent template {parentTask}</span>
                ) : !parentTaskFromUrl ? (
                  <span> (select parent template below or leave empty for root-level templates)</span>
                ) : (
                  <span> as root-level templates</span>
                )}
              </p>
            </div>
          </div>
          {!projectFromUrl && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Project:</span>
              <ProjectSelector
                selectedProject={selectedProject}
                onProjectChange={handleProjectChange}
              />
            </div>
          )}
        </div>

        {/* Parent Template Selector - Only show if not in URL and project is selected */}
        {!parentTaskFromUrl && project && (
          <div className="border-t pt-4">
            <LinkField
              field={{
                fieldname: "parent_task",
                label: "Parent Template Task (Optional)",
                fieldtype: "Link",
                options: "Task",
                description: "Select a parent template to create child templates, or leave empty for root-level templates",
                filters: JSON.stringify([
                  ["project", "=", project],
                  ["is_template", "=", 1],
                  ["is_group", "=", 1]
                ]),
              }}
              value={selectedParentTask}
              onChange={handleParentTaskChange}
              disabled={isCreating}
              showLabel={true}
            />
          </div>
        )}
      </div>

      {/* Success/Error Alert */}
      {createResult && (
        <Alert variant={createResult.success ? "default" : "destructive"} className="mb-6">
          {createResult.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{createResult.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>
            {createResult.message}
            {createResult.parent_converted && (
              <p className="mt-1 text-sm">Parent template has been converted to a group template.</p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Error */}
      {uploadError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* Project Selection Required */}
      {!project && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Project Selection Required</AlertTitle>
          <AlertDescription>
            Please select a project from the dropdown above to begin bulk template task creation.
          </AlertDescription>
        </Alert>
      )}

      {/* Step 1: Download Template & Upload */}
      {!showPreview && project && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Download Template Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Step 1: Download Template
              </CardTitle>
              <CardDescription>Download the Excel template with predefined columns</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadTemplate} className="w-full" variant="outline">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download Excel Template
              </Button>
              <div className="mt-4 text-sm text-muted-foreground space-y-2">
                <p className="font-medium">Template includes:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Subject* (required, max 140 chars)</li>
                  <li>Description</li>
                  <li>Priority (Low/Medium/High/Urgent)</li>
                  <li>Progress (0-100)</li>
                  <li>Base Points</li>
                  <li>Is Group (0 or 1)</li>
                </ul>
                <p className="text-xs italic mt-3">
                  Note: Template tasks don't have status, dates, or assignees. These will be set when templates are instantiated.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upload File Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Step 2: Upload File
              </CardTitle>
              <CardDescription>Upload the filled Excel file with template task data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    "hover:border-primary hover:bg-primary/5 cursor-pointer"
                  )}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Excel files (.xlsx, .xls)</p>
                </div>

                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {file && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span className="text-sm font-medium">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFile(null)
                        setShowPreview(false)
                        setTasks([])
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Preview and Create */}
      {showPreview && tasks.length > 0 && project && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Template Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasks.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Valid Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{validTaskCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Invalid Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{invalidTaskCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Preview Template Tasks</CardTitle>
                  <CardDescription>Review and verify template tasks before creation</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowPreview(false)
                    setFile(null)
                    setTasks([])
                  }}
                >
                  Upload Different File
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-[40px]">#</TableHead>
                        <TableHead className="min-w-[200px]">Subject</TableHead>
                        <TableHead className="min-w-[150px]">Description</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Group</TableHead>
                        <TableHead className="min-w-[250px]">Validation</TableHead>
                        <TableHead className="w-[60px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task, index) => (
                        <TableRow key={index} className={!task.is_valid ? "bg-red-50" : ""}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">{task.subject}</TableCell>
                          <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {task.description || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{task.priority}</Badge>
                          </TableCell>
                          <TableCell>{task.progress}%</TableCell>
                          <TableCell>{task.custom_points || 0}</TableCell>
                          <TableCell>{task.is_group ? "Yes" : "No"}</TableCell>
                          <TableCell>
                            {task.is_valid ? (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Valid
                              </Badge>
                            ) : (
                              <div className="space-y-1">
                                <Badge variant="destructive" className="mb-1">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Invalid
                                </Badge>
                                <ul className="text-xs text-red-600 space-y-0.5">
                                  {task.validation_errors.map((error, i) => (
                                    <li key={i}>• {error}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTask(index)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleBack}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTasks}
              disabled={validTaskCount === 0 || isCreating}
              className="min-w-[150px]"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create {validTaskCount} Template{validTaskCount !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>

          {/* Results Summary (after creation attempt) */}
          {createResult && ((createResult.created_tasks?.length ?? 0) > 0 || (createResult.failed_tasks?.length ?? 0) > 0) && (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Successfully Created */}
              {(createResult.created_tasks?.length ?? 0) > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Successfully Created ({createResult.created_count})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {createResult.created_tasks?.map((task, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm font-medium">{task.subject}</span>
                          <Badge variant="outline" className="font-mono text-xs">
                            {task.name}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Failed Tasks */}
              {(createResult.failed_tasks?.length ?? 0) > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Failed ({createResult.failed_count})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {createResult.failed_tasks?.map((task, index) => (
                        <div key={index} className="p-2 bg-red-50 rounded space-y-1">
                          <span className="text-sm font-medium">{task.subject}</span>
                          <p className="text-xs text-red-600">{task.error}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BulkTemplateTaskCreate
