import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ChevronRight, ChevronDown, Minus, Plus, FileText, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import TaskCreationOptionsModal from "./TaskCreationOptionsModal"
import type { TaskNode } from "../TaskTree"

interface TaskTreeNodeProps {
  task: TaskNode
  level: number
  onAddChild: (parentTaskName: string) => void
  onEdit: (task: TaskNode) => void
  onDelete: (taskName: string) => void
}



const getStatusVariant = (
  status: string,
): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
  const statusMap: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
    Open: "secondary",
    Working: "default",
    "Pending Review": "warning",
    Overdue: "destructive",
    Completed: "success",
    Cancelled: "outline",
    Template: "outline",
  }
  return statusMap[status] || "default"
}

const getPriorityVariant = (
  priority: string | undefined,
): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
  const priorityMap: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
    Low: "secondary",
    Medium: "default",
    High: "warning",
    Urgent: "destructive",
  }
  return priorityMap[priority || "Medium"] || "default"
}

const TaskTreeNode: React.FC<TaskTreeNodeProps> = ({ task, level, onAddChild, onEdit, onDelete }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showOptionsModal, setShowOptionsModal] = useState(false)

  const hasChildren = task.children.length > 0
  const isGroup = task.is_group === 1
  const indentPx = level * 24

  // Handlers for modal options
  const handleCreateNew = () => {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    navigate(`/task-manager/new?project=${task.project}&parentTask=${task.name}&returnUrl=${returnUrl}`)
  }

  const handleCreateFromLibrary = () => {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    navigate(
      `/task-manager/library-selection?parentTask=${task.name}&project=${task.project}&returnUrl=${returnUrl}`,
    )
  }
  const handleBulkCreate = () => {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    navigate(
      `/task-manager/bulk-create?project=${task.project}&parentTask=${task.name}&returnUrl=${returnUrl}`,
    )
  }

  return (
    <div>
      {/* Current Task Row */}
      <div
        className={cn(
          "flex items-center gap-2 py-2.5 px-3 rounded-md transition-colors",
          "hover:bg-gray-50 border border-transparent hover:border-gray-200",
          "group",
        )}
        style={{ paddingLeft: `${indentPx + 12}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Expander Icon or Placeholder */}
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
          {isGroup && hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hover:bg-gray-200 rounded p-0.5 transition-colors"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              )}
            </button>
          ) : isGroup && !hasChildren ? (
            <Minus className="h-4 w-4 text-gray-400" aria-label="Group with no children" />
          ) : (
            <div className="w-4" aria-hidden="true" />
          )}
        </div>

        {/* Task Subject (clickable) */}
        <button
          onClick={() => onEdit(task)}
          className={cn(
            "flex-1 text-left text-sm font-medium",
            "hover:text-indigo-600 hover:underline transition-colors",
            "truncate",
            isGroup && "font-semibold text-gray-900",
            !isGroup && "text-gray-700",
          )}
          title={task.subject}
        >
          {task.subject}
        </button>

        {/* Task ID Badge (visible on hover, hidden on mobile) */}
        {isHovered && (
          <Badge variant="outline" className="hidden md:inline-flex text-xs font-mono">
            {task.name}
          </Badge>
        )}

        {/* Priority Badge (visible on hover, hidden on mobile) */}
        {isHovered && (task as any).priority && (
          <Badge
            variant={getPriorityVariant((task as any).priority) as "default" | "secondary" | "destructive" | "outline"}
            className="hidden md:inline-flex flex-shrink-0 text-xs"
          >
            {(task as any).priority}
          </Badge>
        )}

        {/* Status Badge (hidden on mobile) */}
        <Badge
          variant={getStatusVariant(task.status) as "default" | "secondary" | "destructive" | "outline"}
          className="hidden md:inline-flex flex-shrink-0"
        >
          {task.status}
        </Badge>

        {/* Template Badge - Shows if task was created from template */}
        {task.template_task && (
          <Badge variant="secondary" className="hidden md:inline-flex flex-shrink-0 text-xs gap-1">
            <FileText className="h-3 w-3" />
            From Template
          </Badge>
        )}

        {/* Progress (only for non-group tasks) */}
        {!isGroup && task.progress !== undefined && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{ width: `${Math.min(100, Math.max(0, task.progress))}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 font-medium w-10 text-right">{task.progress}%</span>
          </div>
        )}

        {/* Dates (visible on hover) */}
        {isHovered && (task.exp_start_date || task.exp_end_date) && (
          <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
            {task.exp_start_date && <span title="Start Date">{new Date(task.exp_start_date).toLocaleDateString()}</span>}
            {task.exp_start_date && task.exp_end_date && <span>→</span>}
            {task.exp_end_date && <span title="End Date">{new Date(task.exp_end_date).toLocaleDateString()}</span>}
          </div>
        )}

        {/* Add Child Button (always visible on mobile, on hover for desktop, only for groups) */}
        {isGroup && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              setShowOptionsModal(true)
            }}
            className={cn(
              "h-7 w-7 p-0 flex-shrink-0",
              "opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity",
            )}
            title="Add child task"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* Delete Button (visible on hover) */}
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(task.name)
          }}
          className={cn(
            "h-7 w-7 p-0 flex-shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50",
            "opacity-0 group-hover:opacity-100 transition-opacity",
          )}
          title="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Children (recursive) */}
      {
        isExpanded && hasChildren && (
          <div className="border-l-2 border-gray-200 ml-3" style={{ marginLeft: `${indentPx + 12}px` }}>
            {task.children.map((child) => (
              <TaskTreeNode key={child.name} task={child} level={level + 1} onAddChild={onAddChild} onEdit={onEdit} />
            ))}
          </div>
        )
      }

      {/* Task Creation Options Modal */}
      <TaskCreationOptionsModal
        open={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        onCreateNew={handleCreateNew}
        onCreateFromLibrary={handleCreateFromLibrary}
        onBulkCreate={handleBulkCreate}  // <-- ADD THIS LINE
        parentTaskSubject={task.subject}
      />
    </div >
  )
}

export default TaskTreeNode
