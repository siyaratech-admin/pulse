import React from "react"
import { BellOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { NotificationItem } from "./NotificationItem"
import type { NotificationLog } from "@/types/notification"

interface NotificationListProps {
  notifications: NotificationLog[]
  isLoading: boolean
  hasMore?: boolean
  emptyMessage?: string
  onMarkAsRead: (docname: string) => void
  onLoadMore?: () => void
}

/**
 * Notification list component with pagination support
 * Shows list of notifications with loading states and empty state
 */
export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isLoading,
  hasMore = false,
  emptyMessage = "No notifications to display",
  onMarkAsRead,
  onLoadMore,
}) => {
  // Loading state - show skeletons
  if (isLoading && notifications.length === 0) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-start gap-3 p-4 border-b border-gray-100">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (!isLoading && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <BellOff className="h-8 w-8 text-gray-400" />
        </div>
        <h4 className="font-medium text-gray-900 mb-1">No notifications</h4>
        <p className="text-sm text-gray-500 text-center max-w-xs">{emptyMessage}</p>
      </div>
    )
  }

  // Notification list
  return (
    <div className="space-y-0">
      {/* Notifications */}
      <div className="divide-y divide-gray-100">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.name}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onClose={() => {}}
          />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center p-4 border-t border-gray-100">
          <Button variant="outline" onClick={onLoadMore} disabled={isLoading} className="w-full max-w-xs">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}

      {/* Loading indicator for pagination */}
      {isLoading && notifications.length > 0 && (
        <div className="flex justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  )
}
