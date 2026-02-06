import React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Edit, AlertCircle, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TemplateActionButtonsProps {
  taskName: string
  taskSubject: string
  isGroup: boolean
  project: string
  usageCount?: number
  onAddChild?: (parentTask: string, project: string) => void
  onEdit?: (taskName: string) => void
  onDelete?: (taskName: string) => void
  showAddChild?: boolean
  showEdit?: boolean
}

const TemplateActionButtons: React.FC<TemplateActionButtonsProps> = ({
  taskName,
  taskSubject,
  isGroup,
  project,
  usageCount = 0,
  onAddChild,
  onEdit,
  onDelete,
  showAddChild = true,
  showEdit = true,
}) => {
  const isWidelyUsed = usageCount > 10

  return (
    <div className="flex items-center gap-2">
      {/* Usage Count Badge - Only show if widely used */}
      {isWidelyUsed && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                <AlertCircle className="h-3 w-3 mr-1" />
                {usageCount} uses
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>This template has been used {usageCount} times</p>
              <p className="text-xs text-muted-foreground mt-1">Changes may affect existing workflows</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Add Child Button - Only show for group templates or templates that can become groups */}
      {showAddChild && onAddChild && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddChild(taskName, project)
                }}
                className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Plus className="h-3 w-3 mr-1" />
                <span className="text-xs">Add Child</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isGroup ? (
                <p>Add a child template under "{taskSubject}"</p>
              ) : (
                <div>
                  <p>Add a child template under "{taskSubject}"</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This will convert the parent to a group task
                  </p>
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Edit Button */}
      {showEdit && onEdit && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(taskName)
                }}
                className="h-7 px-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
              >
                <Edit className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit template "{taskSubject}"</p>
              {isWidelyUsed && (
                <p className="text-xs text-amber-600 mt-1">⚠️ Widely used template - edit with caution</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {/* Delete Button */}
      {onDelete && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(taskName)
                }}
                className="h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete template "{taskSubject}"</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

export default TemplateActionButtons
