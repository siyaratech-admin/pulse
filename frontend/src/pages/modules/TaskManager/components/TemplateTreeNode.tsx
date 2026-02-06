import React, { useState } from "react"
import { ChevronDown, ChevronRight, FolderOpen, FileText, CheckSquare, Square } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import TemplateActionButtons from "./TemplateActionButtons"


export interface TemplateTaskNode {
  name: string
  subject: string
  description?: string
  parent_task: string | null
  parent_subject?: string | null
  is_group: 0 | 1
  status: string
  priority?: string
  project?: string
  children: TemplateTaskNode[]
}

interface TemplateTreeNodeProps {
  task: TemplateTaskNode
  level: number
  selectedTasks: Set<string>
  onToggleSelection: (taskName: string, task: TemplateTaskNode) => void
  showActions?: boolean
  onAddChild?: (parentTask: string, project: string) => void  // <-- ADD
  onEditTemplate?: (taskName: string) => void  // <-- ADD
  onDelete?: (taskName: string) => void // <-- ADD
}

const TemplateTreeNode: React.FC<TemplateTreeNodeProps> = ({
  task,
  level,
  selectedTasks,
  onToggleSelection,
  showActions = false,  // <-- ADD
  onAddChild,  // <-- ADD
  onEditTemplate,  // <-- ADD
  onDelete, // <-- ADD
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = task.children && task.children.length > 0
  const isSelected = selectedTasks.has(task.name)
  const indentClass = `pl-${level * 6}`

  // Count selected children recursively
  const countSelectedChildren = (node: TemplateTaskNode): number => {
    let count = selectedTasks.has(node.name) ? 1 : 0
    if (node.children) {
      node.children.forEach((child) => {
        count += countSelectedChildren(child)
      })
    }
    return count
  }

  const selectedCount = countSelectedChildren(task)
  const isIndeterminate = selectedCount > 0 && !isSelected

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
  }

  const handleCheckboxChange = () => {
    onToggleSelection(task.name, task)
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "destructive"
      case "high":
        return "orange"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <div className="select-none">
      {/* Task Row */}
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent transition-colors cursor-pointer group",
          isSelected && "bg-accent/50",
          indentClass
        )}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        {/* Expand/Collapse Chevron */}
        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
          {hasChildren ? (
            <button onClick={handleToggle} className="hover:bg-accent/50 rounded p-0.5">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4" />
          )}
        </div>

        {/* Checkbox */}
        <div className="flex-shrink-0">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            className={cn(isIndeterminate && "data-[state=checked]:bg-primary/50")}
          />
        </div>

        {/* Icon */}
        <div className="flex-shrink-0">
          {task.is_group ? (
            <FolderOpen className="h-4 w-4 text-amber-500" />
          ) : (
            <FileText className="h-4 w-4 text-blue-500" />
          )}
        </div>

        {/* Task Subject */}
        <div className="flex-1 min-w-0">
          <span
            className={cn(
              "text-sm font-medium truncate block",
              onEditTemplate && "cursor-pointer hover:underline hover:text-primary transition-colors"
            )}
            onClick={(e) => {
              if (onEditTemplate) {
                e.stopPropagation()
                onEditTemplate(task.name)
              }
            }}
          >
            {task.subject}
          </span>
          {task.description && (
            <span className="text-xs text-muted-foreground truncate block mt-0.5">
              {task.description.replace(/<[^>]*>/g, "").substring(0, 60)}
              {task.description.length > 60 && "..."}
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Task ID Badge */}
          <Badge variant="outline" className="text-xs font-mono">
            {task.subject}
          </Badge>

          {/* Priority Badge */}
          {task.priority && (
            <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
              {task.priority}
            </Badge>
          )}

          {/* Template Badge */}
          <Badge variant="secondary" className="text-xs">
            Template
          </Badge>

          {/* Selected Children Count */}
          {isIndeterminate && (
            <Badge variant="default" className="text-xs">
              {selectedCount} selected
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <TemplateActionButtons
            taskName={task.name}
            taskSubject={task.subject}
            isGroup={task.is_group === 1}
            project={task.project || ""}
            onAddChild={onAddChild}
            onEdit={onEditTemplate}
            onDelete={onDelete}
            showAddChild={true}
            showEdit={true}
          />
        )}

      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {task.children.map((childTask) => (
            <TemplateTreeNode
              key={childTask.name}
              task={childTask}
              level={level + 1}
              selectedTasks={selectedTasks}
              onToggleSelection={onToggleSelection}
              showActions={showActions}  // <-- ADD
              onAddChild={onAddChild}  // <-- ADD
              onEditTemplate={onEditTemplate}  // <-- ADD
              onDelete={onDelete} // <-- ADD
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TemplateTreeNode
