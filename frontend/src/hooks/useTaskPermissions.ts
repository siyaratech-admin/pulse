import { useMemo } from "react"

export interface FieldPermissions {
  canEditSubject: boolean
  canEditDescription: boolean
  canEditStatus: boolean
  canEditPriority: boolean
  canEditDates: boolean
  canEditProject: boolean
  canEditPoints: boolean
  canEditPointsDistribution: boolean
  canAddChecklistRows: boolean
  canDeleteChecklistRows: boolean
  canEditResources: boolean
  isReadOnly: boolean // All fields read-only
}

interface Task {
  owner?: string
  [key: string]: any
}

/**
 * Hook to calculate field-level permissions for task editing
 *
 * @param task - The task document
 * @param currentUser - The currently logged-in user
 * @param isAssignee - Whether the current user is an assignee (has active ToDo)
 * @returns FieldPermissions object with granular edit permissions
 */
export function useTaskPermissions(
  task: Task | null,
  currentUser: string | null,
  isAssignee: boolean
): FieldPermissions {
  return useMemo(() => {
    // Default: Read-only
    if (!task || !currentUser) {
      return {
        canEditSubject: false,
        canEditDescription: false,
        canEditStatus: false,
        canEditPriority: false,
        canEditDates: false,
        canEditProject: false,
        canEditPoints: false,
        canEditPointsDistribution: false,
        canAddChecklistRows: false,
        canDeleteChecklistRows: false,
        canEditResources: false,
        isReadOnly: true,
      }
    }

    const isOwner = task.owner === currentUser

    // Case 1: Owner - Can edit everything
    if (isOwner) {
      return {
        canEditSubject: true,
        canEditDescription: true,
        canEditStatus: true,
        canEditPriority: true,
        canEditDates: true,
        canEditProject: true,
        canEditPoints: true,
        canEditPointsDistribution: true,
        canAddChecklistRows: true,
        canDeleteChecklistRows: true,
        canEditResources: true,
        isReadOnly: false,
      }
    }

    // Case 2: Assignee (non-owner) - Can only edit status
    if (isAssignee) {
      return {
        canEditSubject: false,
        canEditDescription: false,
        canEditStatus: true, // Only status editable
        canEditPriority: false,
        canEditDates: false,
        canEditProject: false,
        canEditPoints: false,
        canEditPointsDistribution: false,
        canAddChecklistRows: false, // Cannot add rows
        canDeleteChecklistRows: false, // Cannot delete rows
        canEditResources: false,
        isReadOnly: false, // Not completely read-only (can edit status + checklist items)
      }
    }

    // Case 3: Others - Read-only
    return {
      canEditSubject: false,
      canEditDescription: false,
      canEditStatus: false,
      canEditPriority: false,
      canEditDates: false,
      canEditProject: false,
      canEditPoints: false,
      canEditPointsDistribution: false,
      canAddChecklistRows: false,
      canDeleteChecklistRows: false,
      canEditResources: false,
      isReadOnly: true,
    }
  }, [task, currentUser, isAssignee])
}
