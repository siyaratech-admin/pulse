import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-gray-300 placeholder:text-muted-foreground focus:border-[rgb(37,99,235)] hover:border-gray-400 aria-invalid:border-red-500 flex field-sizing-content min-h-16 w-full rounded-sm border-2 bg-white px-3 py-2 text-base transition-all duration-200 outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
