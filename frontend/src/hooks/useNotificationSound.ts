import { useState, useCallback, useEffect } from "react"
import useSound from "use-sound"
// Import audio file from assets folder - Vite will bundle this
import notificationSoundFile from "@/assets/audio/new-notification-022-370046.mp3";

/**
 * Custom hook for managing notification sound using use-sound package
 * Plays audio notification when new notifications arrive
 * Supports mute/unmute with localStorage persistence
 */
export function useNotificationSound() {
  // Get initial mute state from localStorage
  const [isMuted, setIsMuted] = useState(() => {
    const stored = localStorage.getItem("notifications-muted")
    console.log("🔊 [NotificationSound] Initial mute state from localStorage:", stored, "→ isMuted:", stored === "true")
    return stored === "true"
  })

  // Use the use-sound hook to load and play audio
  // This automatically handles preloading, browser compatibility, and cleanup
  const [play] = useSound(notificationSoundFile, {
    volume: 0.6, // Set comfortable volume (0.0 to 1.0)
    soundEnabled: !isMuted, // Respect mute setting
  })

  // Log when hook initializes
  useEffect(() => {
    console.log("🔊 [NotificationSound] Hook initialized with:")
    console.log("  - isMuted:", isMuted)
    console.log("  - soundEnabled:", !isMuted)
    console.log("  - Audio file path:", notificationSoundFile)
  }, [])

  /**
   * Play notification sound
   * Respects mute setting via soundEnabled option
   */
  const playNotificationSound = useCallback(() => {
    console.log("🔊 [NotificationSound] playNotificationSound called")
    console.log("  - isMuted:", isMuted)

    if (!isMuted) {
      console.log("  - Sound is NOT muted, attempting to play...")
      try {
        play()
        console.log("  - ✅ play() function executed successfully")
      } catch (error) {
        console.error("  - ❌ Error calling play():", error)
        // Autoplay was prevented - this is expected on some browsers
        // User will need to interact with the page first
      }
    } else {
      console.log("  - ⏸️ Sound is MUTED, not playing")
    }
  }, [isMuted, play])

  /**
   * Toggle mute state and persist to localStorage
   */
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newValue = !prev
      console.log("🔊 [NotificationSound] Toggle mute:", prev, "→", newValue)
      localStorage.setItem("notifications-muted", String(newValue))
      return newValue
    })
  }, [])

  /**
   * Set mute state explicitly
   */
  const setMute = useCallback((muted: boolean) => {
    setIsMuted(muted)
    localStorage.setItem("notifications-muted", String(muted))
  }, [])

  return {
    playNotificationSound,
    isMuted,
    toggleMute,
    setMute,
  }
}
