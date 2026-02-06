import React from "react"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useTaskHierarchy } from "@/hooks/useTaskHierarchy"
import type { TaskHierarchyItem } from "@/hooks/useTaskHierarchy"
import { Loader2, FolderOpen } from "lucide-react"

interface TaskBreadcrumbProps {
  task: any
}

/**
 * TaskBreadcrumb Component
 *
 * Displays the complete task hierarchy as a breadcrumb navigation:
 * Project > Grandparent Task > Parent Task > Current Task
 *
 * Features:
 * - Automatically fetches parent task chain
 * - Clickable breadcrumb items for navigation
 * - Loading skeleton during fetch
 * - Truncates long task names
 * - Shows project at the start
 */
const TaskBreadcrumb: React.FC<TaskBreadcrumbProps> = ({ task }) => {
  const { hierarchy, isLoading, error } = useTaskHierarchy(task)

  // Handle navigation for breadcrumb items - uses full page reload
  const handleNavigate = (item: TaskHierarchyItem) => {
    if (item.isCurrent) {
      // Current task - no navigation
      return
    }

    if (item.isProject) {
      // Navigate to task tree for this project
      window.location.href = `/task-manager/tree?project=${item.name}`
    } else {
      // Navigate to parent task edit page with full page reload
      const currentUrl = window.location.pathname + window.location.search
      const returnUrl = encodeURIComponent(currentUrl)
      window.location.href = `/task-manager/edit/${item.name}?returnUrl=${returnUrl}`
    }
  }

  // Truncate long names for display
  const truncateName = (name: string, maxLength: number = 40): string => {
    if (name.length <= maxLength) return name
    return name.substring(0, maxLength - 3) + "..."
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Loading hierarchy...</span>
      </div>
    )
  }

  // Error state - show minimal breadcrumb
  if (error || !hierarchy || hierarchy.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-sm">
              {task?.subject || "Task"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {hierarchy.map((item, index) => {
          const isLast = index === hierarchy.length - 1

          return (
            <React.Fragment key={item.name}>
              <BreadcrumbItem>
                {isLast ? (
                  // Current task - not clickable
                  <BreadcrumbPage
                    className="text-sm font-medium text-foreground"
                    title={item.subject}
                  >
                    {truncateName(item.subject, 50)}
                  </BreadcrumbPage>
                ) : (
                  // Clickable breadcrumb link
                  <BreadcrumbLink
                    onClick={() => handleNavigate(item)}
                    className="text-sm cursor-pointer flex items-center gap-1.5"
                    title={item.subject}
                  >
                    {/* Icon for project */}
                    {item.isProject && (
                      <FolderOpen className="h-3.5 w-3.5 text-blue-500" />
                    )}
                    {truncateName(item.subject, 40)}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {/* Separator - only between items, not after last */}
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default TaskBreadcrumb
