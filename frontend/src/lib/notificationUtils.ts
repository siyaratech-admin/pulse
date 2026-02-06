import { formatDistanceToNow } from "date-fns"
import type { NotificationLog, NotificationType } from "@/types/notification"

/**
 * Strip HTML tags from notification subject
 */
export function stripHtml(html: string): string {
  const tmp = document.createElement("DIV")
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ""
}

/**
 * Get the route/link for a notification
 */
export function getNotificationLink(notification: NotificationLog): string {
  // Use custom link if provided
  if (notification.link) {
    return notification.link
  }

  // Construct link from document_type and document_name
  if (notification.document_type && notification.document_name) {
    const doctype = notification.document_type
    const docname = notification.document_name

    // Map known doctypes to routes
    const routeMap: Record<string, string> = {
      Task: `/task-manager/edit/${docname}`,
      Project: `/projects/${docname}`,
      "ToDo": `/todo/${docname}`,
    }

    if (routeMap[doctype]) {
      return routeMap[doctype]
    }

    // Default form route for unknown doctypes
    return `/app/${doctype}/${docname}`
  }

  // Fallback to notification log itself
  return `/app/notification-log/${notification.name}`
}

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: string): string {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  } catch (error) {
    return timestamp
  }
}

/**
 * Get user initials from email or name
 */
export function getUserInitials(identifier: string): string {
  if (!identifier) return "?"

  // If it's an email, extract name part
  if (identifier.includes("@")) {
    const namePart = identifier.split("@")[0]
    const parts = namePart.split(".")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return namePart.substring(0, 2).toUpperCase()
  }

  // If it's a full name
  const parts = identifier.split(" ")
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  return identifier.substring(0, 2).toUpperCase()
}

/**
 * Get badge color for notification type
 */
export function getNotificationTypeBadge(type: NotificationType): {
  variant: "default" | "secondary" | "destructive" | "outline"
  className: string
} {
  const badgeMap: Record<
    NotificationType,
    { variant: "default" | "secondary" | "destructive" | "outline"; className: string }
  > = {
    Mention: { variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200" },
    Assignment: { variant: "default", className: "bg-purple-100 text-purple-800 border-purple-300" },
    Share: { variant: "outline", className: "bg-green-50 text-green-700 border-green-200" },
    "Energy Point": { variant: "default", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
    Alert: { variant: "destructive", className: "bg-red-100 text-red-800 border-red-300" },
    "": { variant: "outline", className: "bg-gray-50 text-gray-700 border-gray-200" },
  }

  return badgeMap[type] || badgeMap[""]
}

/**
 * Extract title from notification subject with <b class="subject-title"> tag
 */
export function extractNotificationTitle(subject: string): string {
  const titleMatch = subject.match(/<b class="subject-title">(.*?)<\/b>/)
  if (titleMatch && titleMatch[1]) {
    return stripHtml(titleMatch[1])
  }
  return stripHtml(subject)
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}
