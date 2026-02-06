// src/lib/frappePushNotification.ts
import { initializeApp } from "firebase/app"
import {
  getMessaging,
  getToken,
  isSupported,
  deleteToken,
  onMessage as onFCMMessage,
} from "firebase/messaging"

type WebConfig = {
  projectId: string
  appId: string
  apiKey: string
  authDomain?: string
  messagingSenderId?: string
  [k: string]: any
}

class FrappePushNotification {
  public static get relayServerBaseURL(): string {
    return (window as any).frappe?.boot?.push_relay_server_url
  }

  projectName: string
  webConfig: WebConfig | null
  vapidPublicKey: string
  token: string | null

  initialized: boolean
  messaging: any | null
  serviceWorkerRegistration: ServiceWorkerRegistration | null
  onMessageHandler: ((payload: any) => void) | null

  constructor(projectName: string) {
    this.projectName = projectName
    this.webConfig = null
    this.vapidPublicKey = ""
    this.token = null

    this.initialized = false
    this.messaging = null
    this.serviceWorkerRegistration = null

    this.onMessageHandler = null
  }

  async initialize(serviceWorkerRegistration: ServiceWorkerRegistration) {
    if (this.initialized) return
    this.serviceWorkerRegistration = serviceWorkerRegistration
    const config = await this.fetchWebConfig()
    // initialize firebase app and messaging
    try {
      // initializeApp may throw if called multiple times - apps can be guarded if needed
      this.messaging = getMessaging(initializeApp(config))
      // register onMessage if handler already set
      if (this.onMessageHandler) {
        onFCMMessage(this.messaging, this.onMessageHandler)
      }
      this.initialized = true
    } catch (e) {
      console.error("Failed to initialize FrappePushNotification:", e)
      throw e
    }
  }

  async appendConfigToServiceWorkerURL(url: string, parameter_name = "config"): Promise<string> {
    const config = await this.fetchWebConfig()
    const encode_config = encodeURIComponent(JSON.stringify(config))
    return `${url}?${parameter_name}=${encode_config}`
  }

  async fetchWebConfig(): Promise<WebConfig> {
    if (this.webConfig) return this.webConfig
    try {
      const url = `${FrappePushNotification.relayServerBaseURL}/api/method/notification_relay.api.get_config?project_name=${this.projectName}`
      const response = await fetch(url)
      const response_json = await response.json()
      this.webConfig = response_json.config
      return this.webConfig
    } catch (e) {
      throw new Error("Push Notification Relay is not configured properly on your site.")
    }
  }

  async fetchVapidPublicKey(): Promise<string> {
    if (this.vapidPublicKey) return this.vapidPublicKey
    try {
      const url = `${FrappePushNotification.relayServerBaseURL}/api/method/notification_relay.api.get_config?project_name=${this.projectName}`
      const response = await fetch(url)
      const response_json = await response.json()
      this.vapidPublicKey = response_json.vapid_public_key
      return this.vapidPublicKey
    } catch (e) {
      throw new Error("Push Notification Relay is not configured properly on your site.")
    }
  }

  onMessage(callback: (payload: any) => void) {
    if (!callback) return
    this.onMessageHandler = callback
    if (this.messaging) {
      onFCMMessage(this.messaging, this.onMessageHandler)
    }
  }

  isNotificationEnabled(): boolean {
    return localStorage.getItem(`firebase_token_${this.projectName}`) !== null
  }

  async enableNotification(): Promise<{ permission_granted: boolean; token: string }> {
    if (!(await isSupported())) {
      throw new Error("Push notifications are not supported on your device")
    }
    if (this.token) {
      return { permission_granted: true, token: this.token }
    }

    const permission = await Notification.requestPermission()
    if (permission !== "granted") {
      return { permission_granted: false, token: "" }
    }

    const oldToken = localStorage.getItem(`firebase_token_${this.projectName}`)
    const vapidKey = await this.fetchVapidPublicKey()
    const newToken = await getToken(this.messaging, {
      vapidKey,
      serviceWorkerRegistration: this.serviceWorkerRegistration!,
    })

    if (oldToken !== newToken) {
      if (oldToken) {
        await this.unregisterTokenHandler(oldToken)
      }
      const success = await this.registerTokenHandler(newToken)
      if (!success) throw new Error("Failed to subscribe to push notification")
      localStorage.setItem(`firebase_token_${this.projectName}`, newToken)
    }

    this.token = newToken
    return { permission_granted: true, token: newToken }
  }

  async disableNotification(): Promise<void> {
    if (!this.token) {
      this.token = localStorage.getItem(`firebase_token_${this.projectName}`)
      if (!this.token) return
    }

    try {
      await deleteToken(this.messaging)
    } catch (e) {
      console.error("Failed to delete token from firebase", e)
    }

    try {
      await this.unregisterTokenHandler(this.token)
    } catch (e) {
      console.error("Failed to unsubscribe from push notification", e)
    }

    localStorage.removeItem(`firebase_token_${this.projectName}`)
    this.token = null
  }

  async registerTokenHandler(token: string): Promise<boolean> {
    try {
      const response = await fetch(
        `/api/method/frappe.push_notification.subscribe?fcm_token=${encodeURIComponent(token)}&project_name=${encodeURIComponent(this.projectName)}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      )
      return response.status === 200
    } catch (e) {
      console.error(e)
      return false
    }
  }

  async unregisterTokenHandler(token: string): Promise<boolean> {
    try {
      const response = await fetch(
        `/api/method/frappe.push_notification.unsubscribe?fcm_token=${encodeURIComponent(token)}&project_name=${encodeURIComponent(this.projectName)}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      )
      return response.status === 200
    } catch (e) {
      console.error(e)
      return false
    }
  }
}

export default FrappePushNotification
