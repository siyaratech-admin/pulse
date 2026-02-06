import React from "react"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface ProjectSelectorProps {
  selectedProject?: string
  onProjectChange: (projectName: string) => void
  className?: string
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  selectedProject,
  onProjectChange,
  className,
}) => {
  const { data: projects, isLoading, error } = useFrappeGetDocList("Project", {
    fields: ["name", "project_name"],
    filters: [["status", "=", "Open"]],
    orderBy: { field: "modified", order: "desc" },
    limit: 100,
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading projects...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load projects. Please refresh the page.</AlertDescription>
      </Alert>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <Alert>
        <AlertDescription>No active projects found.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={className}>
      <Select value={selectedProject} onValueChange={onProjectChange}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Select a project..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">ALL Projects</SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.name} value={project.name}>
              {project.project_name || project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default ProjectSelector
