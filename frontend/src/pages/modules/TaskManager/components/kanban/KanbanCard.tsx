import React, { useMemo } from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { format } from "date-fns"
import { Calendar, User, GripVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { TaskNode } from "../../TaskTree"

interface KanbanCardProps {
  task: TaskNode
  onClick?: () => void
  isDragging?: boolean
}

// Helper function to get priority badge variant
const getPriorityVariant = (priority?: string): "default" | "secondary" | "destructive" | "warning" => {
  const variantMap: Record<string, "default" | "secondary" | "destructive" | "warning"> = {
    Low: "secondary",
    Medium: "default",
    High: "warning",
    Urgent: "destructive",
  }
  return (variantMap[priority || "Medium"] as any) || "default"
}

// Helper function to get status badge variant and color
const getStatusBadgeStyle = (
  status?: string
): { variant: "default" | "secondary" | "destructive" | "outline"; className: string } => {
  const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    "Open": { variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200" },
    "Working": { variant: "default", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
    "Pending Review": { variant: "outline", className: "bg-purple-50 text-purple-700 border-purple-200" },
    "Overdue": { variant: "destructive", className: "bg-red-100 text-red-800 border-red-300" },
    "Template": { variant: "secondary", className: "bg-gray-100 text-gray-700 border-gray-300" },
    "Completed": { variant: "secondary", className: "bg-green-100 text-green-800 border-green-300" },
    "Cancelled": { variant: "secondary", className: "bg-gray-100 text-gray-600 border-gray-300" },
  }
  return statusMap[status || "Open"] || { variant: "outline", className: "bg-gray-50 text-gray-700 border-gray-200" }
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, onClick, isDragging = false }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging: isDraggingState } = useDraggable({
    id: task.name,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  // Parse assignees from JSON string
  const assignees = useMemo(() => {
    try {
      return task._assign ? JSON.parse(task._assign) : []
    } catch {
      return []
    }
  }, [task._assign])

  // Extract user initials from email
  const getUserInitials = (email: string): string => {
    if (!email) return "?"
    const parts = email.split("@")[0].split(".")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={onClick}
      className={cn(
        // Base styles with stronger shadow and subtle border
        "bg-white rounded-xl",
        // Stronger layered shadow for better separation
        "shadow-[0_2px_8px_0_rgba(0,0,0,0.08),0_1px_3px_0_rgba(0,0,0,0.06)]",
        // Very subtle border for extra definition (hardly visible but helps)
        "ring-1 ring-gray-100/50",
        
        // Hover effect - lift the card significantly higher
        "hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.12),0_4px_8px_-2px_rgba(0,0,0,0.08)]",
        "hover:-translate-y-1",
        "hover:ring-gray-200/60",
        
        // Smooth transitions
        "transition-all duration-200 ease-out",
        
        // Other states
        "cursor-pointer select-none",
        (isDraggingState || isDragging) && "opacity-50 shadow-2xl scale-105 ring-blue-200",
        "relative flex gap-2"
      )}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        className={cn(
          "flex items-start justify-center pt-3 pl-2 cursor-grab active:cursor-grabbing",
          "hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent rounded-l-xl transition-all",
          (isDraggingState || isDragging) && "cursor-grabbing bg-gray-50"
        )}
      >
        <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
      </div>

      {/* Card Content */}
      <div className="flex-1 p-3 pl-0 pb-10 relative">
        {/* Task Subject */}
        <h4 className="font-semibold text-sm mb-2 line-clamp-2 text-gray-900 leading-snug">
          {task.subject}
        </h4>

        {/* Badges Row */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {/* Status Badge */}
          {task.status && (
            <Badge
              variant={getStatusBadgeStyle(task.status).variant}
              className={cn(
                "text-xs rounded-lg px-2 py-0.5 font-medium shadow-sm",
                getStatusBadgeStyle(task.status).className
              )}
            >
              {task.status}
            </Badge>
          )}

          {/* Priority Badge */}
          {task.priority && (
            <Badge 
              variant={getPriorityVariant(task.priority)} 
              className="text-xs rounded-lg px-2 py-0.5 font-medium shadow-sm"
            >
              {task.priority}
            </Badge>
          )}

          {/* Task ID Badge */}
          <Badge 
            variant="outline" 
            className="text-xs font-mono rounded-lg px-2 py-0.5 bg-gray-50 border-gray-200 shadow-sm"
          >
            {task.name}
          </Badge>
        </div>

        {/* Description Preview */}
        {task.description && (
          <p className="text-xs text-gray-600 mb-2.5 line-clamp-2 leading-relaxed">
            {task.description.replace(/<[^>]*>/g, "")}
          </p>
        )}

        {/* Due Date */}
        {task.exp_end_date && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2 bg-gray-50/50 rounded-lg px-2 py-1 w-fit">
            <Calendar className="h-3.5 w-3.5 text-gray-500" />
            <span className="font-medium">{format(new Date(task.exp_end_date), "MMM dd, yyyy")}</span>
          </div>
        )}

        {/* Progress Bar */}
        {task.progress !== undefined && task.progress > 0 && (
          <div className="mt-3 bg-gray-50/80 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-600">Progress</span>
              <span className="text-xs font-bold text-gray-800">{task.progress}%</span>
            </div>
            <div className="w-full h-2 bg-white rounded-full overflow-hidden shadow-inner">
              <div
                className={cn(
                  "h-full transition-all duration-300 rounded-full shadow-sm",
                  task.progress === 100
                    ? "bg-gradient-to-r from-green-500 to-emerald-600"
                    : task.progress >= 50
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                    : "bg-gradient-to-r from-amber-400 to-orange-500"
                )}
                style={{ width: `${Math.min(100, Math.max(0, task.progress))}%` }}
              />
            </div>
          </div>
        )}

        {/* Avatar(s) in Bottom Right Corner */}
        <div className="absolute bottom-2 right-2">
          {assignees.length > 0 ? (
            <div className="flex items-center -space-x-2">
              {assignees.slice(0, 3).map((email: string, index: number) => (
                <Avatar
                  key={index}
                  className="h-8 w-8 border-[3px] border-white shadow-md ring-1 ring-gray-200/80 hover:scale-110 transition-transform"
                >
                  <AvatarFallback className="text-[10px] bg-gradient-to-br from-blue-500 via-blue-600 to-blue-600 text-white font-bold">
                    {getUserInitials(email)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {assignees.length > 3 && (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-[3px] border-white shadow-md flex items-center justify-center text-[10px] text-gray-700 font-bold ring-1 ring-gray-200/80 hover:scale-110 transition-transform">
                  +{assignees.length - 3}
                </div>
              )}
            </div>
          ) : (
            <Avatar className="h-8 w-8 border-[3px] border-white shadow-md ring-1 ring-gray-200/80 hover:scale-110 transition-transform">
              <AvatarFallback className="text-[10px] bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500">
                <User className="h-3.5 w-3.5" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  )
}