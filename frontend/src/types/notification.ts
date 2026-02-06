// Notification types for Frappe Notification Log DocType

export type NotificationType = "Mention" | "Energy Point" | "Assignment" | "Share" | "Alert" | ""

export interface NotificationLog {
  name: string
  subject: string
  for_user: string
  from_user: string
  type: NotificationType
  email_content: string | null
  document_type: string | null
  document_name: string | null
  read: 0 | 1
  link: string | null
  attached_file: string | null
  creation: string
  modified: string
}

export interface NotificationResponse {
  notification_logs: NotificationLog[]
  user_info: Record<string, any>
}

export interface UserInfo {
  fullname: string
  image: string | null
  name: string
}
