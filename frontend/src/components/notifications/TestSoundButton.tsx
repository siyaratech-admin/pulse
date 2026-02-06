import React from "react"
import { Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotificationSound } from "@/hooks/useNotificationSound"

/**
 * Test button to manually trigger notification sound
 * Useful for debugging audio playback without waiting for real notifications
 */
export const TestSoundButton: React.FC = () => {
  const { playNotificationSound, isMuted } = useNotificationSound()

  const handleTestSound = () => {
    console.log("🧪 [TestSoundButton] Test button clicked!")
    playNotificationSound()
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleTestSound}
      className="gap-2"
    >
      <Volume2 className="h-4 w-4" />
      Test Sound
      {isMuted && <span className="text-xs text-muted-foreground">(Currently Muted)</span>}
    </Button>
  )
}
