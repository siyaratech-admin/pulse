import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import {
  useFrappeGetCall,
  useFrappeGetDocList,
  useFrappePostCall,
  useFrappeEventListener,
} from "frappe-react-sdk"
import type { NotificationLog, NotificationResponse, NotificationType } from "@/types/notification"
import { useNotificationSound } from "./useNotificationSound"

interface UseNotificationsOptions {
  limit?: number
  typeFilter?: NotificationType | "all"
  readFilter?: "all" | "read" | "unread"
  enableSound?: boolean
  start?: number
  usePagination?: boolean // If true, uses DocList for filtering; if false, uses the old API
}

/**
 * Custom hook for managing notifications
 * Fetches notifications, handles real-time updates, and provides mark as read functionality
 * Now supports filtering, pagination, and sound notifications
 */
export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    limit = 20,
    typeFilter = "all",
    readFilter = "all",
    enableSound = false,
    start = 0,
    usePagination = false,
  } = options

  console.log("📋 [useNotifications] Hook initialized with options:", {
    limit,
    typeFilter,
    readFilter,
    enableSound,
    start,
    usePagination,
  })

  const [localNotifications, setLocalNotifications] = useState<NotificationLog[]>([])
  const [userInfo, setUserInfo] = useState<Record<string, any>>({})

  // Sound notification hook
  const { playNotificationSound, isMuted } = useNotificationSound()

  console.log("📋 [useNotifications] Sound hook state:", { isMuted })

  // Use refs to avoid stale closure issues in event listener
  const enableSoundRef = useRef(enableSound)
  const isMutedRef = useRef(isMuted)
  const playNotificationSoundRef = useRef(playNotificationSound)

  // Keep refs in sync with current values
  useEffect(() => {
    enableSoundRef.current = enableSound
    isMutedRef.current = isMuted
    playNotificationSoundRef.current = playNotificationSound
    console.log("📋 [useNotifications] Updated refs:", {
      enableSound: enableSoundRef.current,
      isMuted: isMutedRef.current
    })
  }, [enableSound, isMuted, playNotificationSound])

  // Build filters for DocList API
  const filters = useMemo(() => {
    const baseFilters: any[] = []

    if (typeFilter && typeFilter !== "all") {
      baseFilters.push(["type", "=", typeFilter])
    }

    if (readFilter === "read") {
      baseFilters.push(["read", "=", 1])
    } else if (readFilter === "unread") {
      baseFilters.push(["read", "=", 0])
    }

    return baseFilters
  }, [typeFilter, readFilter])

  // Use DocList API when pagination or filtering is needed
  const {
    data: docListData,
    error: docListError,
    isLoading: docListLoading,
    mutate: docListMutate,
  } = useFrappeGetDocList<NotificationLog>(
    "Notification Log",
    {
      fields: ["*"],
      filters: filters,
      limit: limit,
      orderBy: {
        field: "modified",
        order: "desc",
      },
      start: start,
    },
    usePagination ? undefined : null // Only enable when usePagination is true
  )

  // Use original API for simple cases (dropdown)
  const {
    data: simpleData,
    error: simpleError,
    isLoading: simpleLoading,
    mutate: simpleMutate,
  } = useFrappeGetCall<NotificationResponse>(
    "frappe.desk.doctype.notification_log.notification_log.get_notification_logs",
    {
      limit: limit,
    },
    usePagination ? null : undefined, // Only enable when NOT using pagination
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  // Mark single notification as read
  const { call: markAsReadCall } = useFrappePostCall(
    "frappe.desk.doctype.notification_log.notification_log.mark_as_read"
  )

  // Mark all notifications as read
  const { call: markAllAsReadCall } = useFrappePostCall(
    "frappe.desk.doctype.notification_log.notification_log.mark_all_as_read"
  )

  // Update local state when data changes
  useEffect(() => {
    if (usePagination && docListData) {
      setLocalNotifications(docListData || [])
    } else if (!usePagination && simpleData?.message) {
      setLocalNotifications(simpleData.message.notification_logs || [])
      setUserInfo(simpleData.message.user_info || {})
    }
  }, [usePagination, docListData, simpleData])

  // Listen for real-time notification events
  useFrappeEventListener("notification", () => {
    console.log("🔔 [useNotifications] Real-time notification event received!")
    console.log("  - enableSound (from ref):", enableSoundRef.current)
    console.log("  - isMuted (from ref):", isMutedRef.current)
    console.log("  - usePagination:", usePagination)

    // Play sound if enabled and not muted (using refs to avoid stale closure)
    if (enableSoundRef.current && !isMutedRef.current) {
      console.log("  - ✅ Conditions met, calling playNotificationSound()")
      playNotificationSoundRef.current()
    } else {
      console.log("  - ❌ Skipping sound:", {
        enableSound: enableSoundRef.current,
        isMuted: isMutedRef.current
      })
    }

    // Refresh notifications when new notification arrives
    if (usePagination) {
      console.log("  - Refreshing notifications (pagination mode)")
      docListMutate()
    } else {
      console.log("  - Refreshing notifications (simple mode)")
      simpleMutate()
    }
  })

  // Listen for indicator hide event (when notifications are marked as seen)
  useFrappeEventListener("indicator_hide", () => {
    if (usePagination) {
      docListMutate()
    } else {
      simpleMutate()
    }
  })

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return localNotifications.filter((n) => n.read === 0).length
  }, [localNotifications])

  // Calculate if there are more notifications to load
  const hasMore = useMemo(() => {
    if (!usePagination) return false
    return (docListData?.length || 0) >= limit
  }, [usePagination, docListData, limit])

  // Mark notification as read
  const markAsRead = useCallback(
    async (docname: string) => {
      try {
        await markAsReadCall({ docname })

        // Optimistically update local state
        setLocalNotifications((prev) => prev.map((n) => (n.name === docname ? { ...n, read: 1 as const } : n)))

        // Refresh from server
        if (usePagination) {
          docListMutate()
        } else {
          simpleMutate()
        }
      } catch (error) {
        console.error("Failed to mark notification as read:", error)
      }
    },
    [markAsReadCall, usePagination, docListMutate, simpleMutate]
  )

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllAsReadCall({})

      // Optimistically update local state
      setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: 1 as const })))

      // Refresh from server
      if (usePagination) {
        docListMutate()
      } else {
        simpleMutate()
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }, [markAllAsReadCall, usePagination, docListMutate, simpleMutate])

  // Refresh notifications manually
  const refresh = useCallback(() => {
    if (usePagination) {
      docListMutate()
    } else {
      simpleMutate()
    }
  }, [usePagination, docListMutate, simpleMutate])

  // Use appropriate loading and error states
  const isLoading = usePagination ? docListLoading : simpleLoading
  const error = usePagination ? docListError : simpleError

  return {
    notifications: localNotifications,
    userInfo,
    unreadCount,
    isLoading,
    error,
    hasMore,
    markAsRead,
    markAllAsRead,
    refresh,
  }
}
