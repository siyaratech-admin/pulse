export const showNotification = (payload: any): void => {
  const registration: any = (window as any)?.frappePushNotification
    ?.serviceWorkerRegistration

  // Notify the UI (MainLayout) about new notification
  try {
    window.dispatchEvent(new CustomEvent("frappe-push", { detail: payload }))
  } catch (e) {
    console.warn("Failed to dispatch frappe-push event", e)
  }

  if (!registration) return

  if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
    return
  }

  const data = payload?.data || payload || {}

  const notificationTitle = data?.title || "Notification"
  const notificationOptions: any = {
    body: data?.body || "",
    icon: data?.notification_icon || undefined,
    data: {
      url: data?.click_action || null, // URL used by service worker on click
    },
  }

  try {
    registration.showNotification(notificationTitle, notificationOptions)
  } catch (err) {
    console.error("showNotification failed:", err)
  }
}
