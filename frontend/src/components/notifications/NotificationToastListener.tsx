import React, { useEffect } from "react"
import { useFrappeEventListener } from "frappe-react-sdk"
import { toast } from "sonner"
import { Bell } from "lucide-react"

export const NotificationToastListener: React.FC = () => {
    useFrappeEventListener("notification", (event: any) => {
        // Event payload usually contains the notification details
        // Adjust these fields based on the actual event payload from Frappe
        const title = event?.title || "New Notification"
        const message = event?.message || "You have a new notification"

        // Use sonner to show the toast
        toast(title, {
            description: message,
            icon: <Bell className="h-4 w-4 text-blue-500" />,
            duration: 5000,
            action: {
                label: "View",
                onClick: () => {
                    // Navigate to notifications page or specific document
                    window.location.href = "/notifications"
                }
            }
        })
    })

    return null // This component doesn't render anything visible
}
