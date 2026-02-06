import React from "react"
import { useNavigate } from "react-router-dom"
import { Check } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { NotificationLog } from "@/types/notification"
import { getNotificationLink, formatRelativeTime, getUserInitials } from "@/lib/notificationUtils"

interface NotificationItemProps {
  notification: NotificationLog
  onMarkAsRead: (docname: string) => void
  onClose: () => void
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onClose,
}) => {
  const navigate = useNavigate()
  const isUnread = notification.read === 0

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking the mark as read button
    if ((e.target as HTMLElement).closest(".mark-as-read-btn")) {
      return
    }

    // Mark as read if unread
    if (isUnread) {
      onMarkAsRead(notification.name)
    }

    // Navigate to the notification's reference document
    const link = getNotificationLink(notification)
    if (link.startsWith("/")) {
      navigate(link)
    } else {
      window.location.href = link
    }

    // Close the dropdown
    onClose()
  }

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMarkAsRead(notification.name)
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0",
        isUnread && "bg-blue-50/30"
      )}
    >
      {/* Unread indicator dot */}
      {isUnread && (
        <div className="mt-2 flex-shrink-0">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        </div>
      )}

      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {getUserInitials(notification.from_user)}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Subject */}
        <div
          className={cn("text-sm leading-5 mb-1", isUnread ? "font-medium text-gray-900" : "text-gray-700")}
          dangerouslySetInnerHTML={{ __html: notification.subject }}
        />

        {/* Timestamp */}
        <div className="text-xs text-gray-500">{formatRelativeTime(notification.creation)}</div>
      </div>

      {/* Mark as read button */}
      {isUnread && (
        <Button
          variant="ghost"
          size="sm"
          className="mark-as-read-btn h-7 w-7 p-0 flex-shrink-0 hover:bg-blue-100"
          onClick={handleMarkAsRead}
          title="Mark as read"
        >
          <Check className="h-4 w-4 text-blue-600" />
        </Button>
      )}
    </div>
  )
}
