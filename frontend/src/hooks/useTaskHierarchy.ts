import { useState, useEffect } from "react"

export interface TaskHierarchyItem {
  name: string
  subject: string
  parent_task: string | null
  project?: string
  isProject?: boolean
  isCurrent?: boolean
}

interface UseTaskHierarchyResult {
  hierarchy: TaskHierarchyItem[]
  isLoading: boolean
  error: Error | null
}

/**
 * Custom hook to fetch and build the complete task hierarchy chain
 * from root parent to current task, including the project.
 *
 * @param task - Current task object with parent_task and project fields
 * @returns Object containing hierarchy array, loading state, and error
 */
export const useTaskHierarchy = (task: any): UseTaskHierarchyResult => {
  const [hierarchy, setHierarchy] = useState<TaskHierarchyItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Build the parent chain by recursively fetching parent tasks
  useEffect(() => {
    // Reset state when task changes
    setHierarchy([])
    setIsLoading(true)
    setError(null)

    if (!task || !task.name) {
      setIsLoading(false)
      return
    }

    const buildParentChain = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const chain: TaskHierarchyItem[] = []

        // Add project as first item if exists
        if (task.project) {
          chain.push({
            name: task.project,
            subject: task.project,
            parent_task: null,
            project: task.project,
            isProject: true,
          })
        }

        // Recursively fetch parent tasks
        let currentParentName = task.parent_task
        const fetchedTasks: TaskHierarchyItem[] = []

        while (currentParentName) {
          try {
            // Fetch parent task
            const response = await fetch(
              `/api/resource/Task/${currentParentName}?fields=["name","subject","parent_task","project"]`,
              {
                method: "GET",
                credentials: "include",
              }
            )

            if (!response.ok) {
              console.warn(`Failed to fetch parent task: ${currentParentName}`)
              break
            }

            const parentTask = await response.json()

            if (parentTask?.data) {
              fetchedTasks.unshift({
                name: parentTask.data.name,
                subject: parentTask.data.subject,
                parent_task: parentTask.data.parent_task,
                project: parentTask.data.project,
              })

              currentParentName = parentTask.data.parent_task
            } else {
              break
            }
          } catch (err) {
            console.warn(`Error fetching parent task ${currentParentName}:`, err)
            break
          }
        }

        // Add all fetched parent tasks to chain
        chain.push(...fetchedTasks)

        // Add current task at the end
        chain.push({
          name: task.name,
          subject: task.subject,
          parent_task: task.parent_task,
          project: task.project,
          isCurrent: true,
        })

        setHierarchy(chain)
        setIsLoading(false)
      } catch (err) {
        console.error("Error building task hierarchy:", err)
        setError(err as Error)
        setIsLoading(false)

        // Fallback: show at least current task
        const fallbackChain: TaskHierarchyItem[] = []
        if (task.project) {
          fallbackChain.push({
            name: task.project,
            subject: task.project,
            parent_task: null,
            project: task.project,
            isProject: true,
          })
        }
        fallbackChain.push({
          name: task.name,
          subject: task.subject,
          parent_task: task.parent_task,
          project: task.project,
          isCurrent: true,
        })
        setHierarchy(fallbackChain)
      }
    }

    buildParentChain()
  }, [task?.name]) // Only depend on task name to trigger re-fetch when navigating to different task

  return { hierarchy, isLoading, error }
}
