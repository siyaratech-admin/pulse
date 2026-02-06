import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, X, FileText, Folder, AlertCircle } from "lucide-react"
import type { TemplateTaskNode } from "./TemplateTreeNode"
import { format } from "date-fns"

interface SelectedTasksPanelProps {
  selectedTasks: Map<string, TemplateTaskNode>
  selectedProject: string
  selectedDate: Date
  selectedUser: string
  isAssigning: boolean
  onRemoveTask: (taskName: string) => void
  onAssignTasks: () => void
}

const SelectedTasksPanel: React.FC<SelectedTasksPanelProps> = ({
  selectedTasks,
  selectedProject,
  selectedDate,
  selectedUser,
  isAssigning,
  onRemoveTask,
  onAssignTasks,
}) => {
  // Group tasks by their parent responsibility
  const groupedTasks = useMemo(() => {
    const groups = new Map<string, TemplateTaskNode[]>()

    selectedTasks.forEach((task) => {
      // Use parent_subject (e.g., "Electrical") instead of parent_task (task ID)
      const responsibility = task.parent_subject || "General"
      if (!groups.has(responsibility)) {
        groups.set(responsibility, [])
      }
      groups.get(responsibility)!.push(task)
    })

    return groups
  }, [selectedTasks])

  // Get responsibility names (now just returns the key since it's already the subject)
  const getResponsibilityName = (responsibility: string | null): string => {
    return responsibility || "General"
  }

  const canAssign = selectedTasks.size > 0 && selectedProject && selectedDate && selectedUser && !isAssigning

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Review & Submit</span>
          {selectedTasks.size > 0 && (
            <Badge variant="default" className="ml-2">
              {selectedTasks.size} tasks
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Preview Section */}
        {selectedTasks.size > 0 && selectedProject && selectedDate && (
          <div className="px-6 py-4 bg-muted/50 border-b">
            <h4 className="text-sm font-medium mb-2">Assignment Preview</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-start gap-2">
                <Folder className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span className="break-all">
                  <span className="font-medium">{selectedProject}</span> → Daily Site Work →{" "}
                  <span className="font-medium">{format(selectedDate, "yyyy-MM-dd")}</span>
                </span>
              </div>
              {Array.from(groupedTasks.keys()).map((responsibility) => (
                <div key={responsibility} className="flex items-start gap-2 pl-5">
                  <Folder className="h-3 w-3 mt-0.5 flex-shrink-0 text-amber-500" />
                  <span>
                    <span className="font-medium">{getResponsibilityName(responsibility)}</span> (
                    {groupedTasks.get(responsibility)!.length} tasks)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Tasks List */}
        <ScrollArea className="flex-1">
          {selectedTasks.size === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-sm font-semibold mb-2">No Tasks Selected</h3>
              <p className="text-xs text-muted-foreground">
                Select tasks from the template library on the left to get started.
              </p>
            </div>
          ) : (
            <div className="px-6 py-4 space-y-4">
              {Array.from(groupedTasks.entries()).map(([responsibility, tasks]) => (
                <div key={responsibility} className="space-y-2">
                  {/* Responsibility Header */}
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-amber-500" />
                    <h4 className="text-sm font-semibold">{getResponsibilityName(responsibility)}</h4>
                    <Badge variant="outline" className="text-xs">
                      {tasks.length}
                    </Badge>
                  </div>

                  {/* Tasks under this responsibility */}
                  <div className="space-y-1 ml-6">
                    {tasks.map((task) => (
                      <div
                        key={task.name}
                        className="flex items-center gap-2 p-2 rounded-md bg-background border hover:border-primary/50 transition-colors group"
                      >
                        <FileText className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.subject}</p>
                          {task.priority && (
                            <p className="text-xs text-muted-foreground">
                              Priority: {task.priority}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => onRemoveTask(task.name)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-2" />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Assignment Button */}
        <div className="border-t px-6 py-4 bg-background">
          {!canAssign && selectedTasks.size > 0 && (
            <div className="flex items-start gap-2 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                {!selectedProject && "Select a project. "}
                {!selectedDate && "Select a date. "}
                {!selectedUser && "Select a user to assign. "}
              </p>
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={onAssignTasks}
            disabled={!canAssign}
          >
            {isAssigning ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Assigning Tasks...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Assign {selectedTasks.size} Task{selectedTasks.size !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default SelectedTasksPanel
