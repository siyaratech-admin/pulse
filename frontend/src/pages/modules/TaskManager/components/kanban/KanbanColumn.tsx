import React from "react"
import { useDroppable } from "@dnd-kit/core"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { KanbanCard } from "./KanbanCard"
import type { TaskNode } from "../../TaskTree"

interface KanbanColumnProps {
  id: string // Column ID (same as status value)
  title: string // Column display name
  tasks: TaskNode[] // Tasks in this column
  onAddTask: () => void // Callback for "+ Add Task"
  onTaskClick: (task: TaskNode) => void // Callback for clicking a task card
}

// Helper function to get column color based on status
const getColumnColor = (title: string): string => {
  const colorMap: Record<string, string> = {
    Open: "bg-slate-50",
    Working: "bg-blue-50",
    "Pending Review": "bg-yellow-50",
    Completed: "bg-green-50",
    Overdue: "bg-red-50",
    Cancelled: "bg-gray-50",
    Template: "bg-purple-50",
  }
  return colorMap[title] || "bg-gray-50"
}

// Helper function to get badge variant
const getBadgeVariant = (title: string): "default" | "secondary" | "destructive" | "outline" => {
  const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    Open: "secondary",
    Working: "default",
    "Pending Review": "outline",
    Completed: "outline",
    Overdue: "destructive",
    Cancelled: "outline",
    Template: "outline",
  }
  return variantMap[title] || "secondary"
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, tasks, onAddTask, onTaskClick }) => {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="flex flex-col flex-shrink-0 w-80">
      {/* Column Header */}
      <div className={cn("flex items-center justify-between p-3 rounded-xl", getColumnColor(title))}>
        <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
        <Badge variant={getBadgeVariant(title)} className="font-mono text-xs">
          {tasks.length}
        </Badge>
      </div>

      {/* Add Task Button - Only for 'Open' column */}
      {title === "Open" && (
        <div className="p-2 bg-white">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddTask}
            className="w-full justify-start text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      )}

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-[500px] max-h-[calc(100vh-300px)] p-2 bg-white rounded-xl overflow-y-auto transition-colors",
          isOver && "bg-blue-50 ring-2 ring-blue-400 ring-inset"
        )}
      >
        {tasks.length === 0 ? (
          // Ghost Card with dashed border
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group">
            <div className="text-center">
              <Plus className="h-5 w-5 mx-auto mb-2 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <p className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                Drag a task here
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <KanbanCard key={task.name} task={task} onClick={() => onTaskClick(task)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}