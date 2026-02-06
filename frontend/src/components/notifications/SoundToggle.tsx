import React from "react"
import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useNotificationSound } from "@/hooks/useNotificationSound"

interface SoundToggleProps {
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

/**
 * Sound toggle button component
 * Allows users to mute/unmute notification sounds
 * Persists preference to localStorage
 */
export const SoundToggle: React.FC<SoundToggleProps> = ({
  variant = "outline",
  size = "sm",
  className,
}) => {
  const { isMuted, toggleMute } = useNotificationSound()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={variant} size={size} onClick={toggleMute} className={className}>
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-gray-600" />
            ) : (
              <Volume2 className="h-4 w-4 text-gray-600" />
            )}
            {size !== "icon" && (
              <span className="ml-2 hidden sm:inline">
                {isMuted ? "Sound Off" : "Sound On"}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isMuted ? "Enable notification sounds" : "Disable notification sounds"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
