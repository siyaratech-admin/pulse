import React, { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationDropdown } from "./NotificationDropdown"
import { useNotifications } from "@/hooks/useNotifications"
import { cn } from "@/lib/utils"

interface NotificationBellProps {
  className?: string
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications({
    limit: 20,
    enableSound: true,
  })

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "relative h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-gray-100",
            className
          )}
        >
          <Bell className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />

          {/* 🔵 Soft blue notification dot */}
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 ring-2 ring-white" />

          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        sideOffset={8}
        className="max-w-[calc(100vw-2rem)] p-0"
      >
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          isLoading={isLoading}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClose={handleClose}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
