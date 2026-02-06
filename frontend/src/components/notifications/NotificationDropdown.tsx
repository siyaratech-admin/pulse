import React from "react"
import { Link } from "react-router-dom"
import { CheckCheck, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { NotificationItem } from "./NotificationItem"
import { TestSoundButton } from "./TestSoundButton"
import type { NotificationLog } from "@/types/notification"

interface NotificationDropdownProps {
  notifications: NotificationLog[]
  unreadCount: number
  isLoading: boolean
  onMarkAsRead: (docname: string) => void
  onMarkAllAsRead: () => void
  onClose: () => void
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}) => {
  return (
    <div className="w-[420px] max-w-[calc(100vw-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-base text-gray-900">Notifications</h3>
        <div className="flex items-center gap-2">
          {/* Test Sound Button */}
          <TestSoundButton />

          {/* Mark All as Read */}
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={onMarkAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <BellOff className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="font-medium text-gray-900 mb-1">No notifications</h4>
          <p className="text-sm text-gray-500 text-center">
            You're all caught up! Check back later for new updates.
          </p>
        </div>
      ) : (
        <>
          {/* Notification list */}
          <ScrollArea className="h-[480px]">
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.name}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onClose={onClose}
                />
              ))}
            </div>
          </ScrollArea>

          {/* Footer */}
          <Separator />
          <div className="p-3 bg-gray-50">
            <Link to="/notifications" onClick={onClose}>
              <Button variant="ghost" className="w-full text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                View all notifications
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
