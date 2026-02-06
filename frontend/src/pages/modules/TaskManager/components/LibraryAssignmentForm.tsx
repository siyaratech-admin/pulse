import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, CheckCircle2, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface LibraryAssignmentFormProps {
  selectedDate: Date | null
  onDateChange: (date: Date | null) => void
  selectedCount: number
}

const LibraryAssignmentForm: React.FC<LibraryAssignmentFormProps> = ({
  selectedDate,
  onDateChange,
  selectedCount,
}) => {
  const isFormComplete = selectedCount > 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Task Details
        </CardTitle>
        <CardDescription>Review selection and optional start date</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Date Picker */}
        <div className="space-y-2">
          <Label htmlFor="date-picker">Expected Start Date (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date-picker"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate || undefined}
                onSelect={(date) => onDateChange(date || null)}
                required={false}
                initialFocus
              />
              {selectedDate && (
                <div className="p-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => onDateChange(null)}
                  >
                    Clear Date
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            If specified, this will be set as the expected start date for all created tasks
          </p>
        </div>

        {/* Form Status Indicator */}
        <div className="pt-4 border-t">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {selectedCount > 0 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">
                    {selectedCount} {selectedCount === 1 ? "template" : "templates"} selected
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-muted-foreground">No templates selected</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              {selectedDate ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-600 font-medium">
                    Date: {format(selectedDate, "MMM dd, yyyy")}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground text-xs">No date selected (optional)</span>
              )}
            </div>
          </div>

          {!isFormComplete && (
            <Alert className="mt-4">
              <AlertDescription className="text-xs">
                Complete the required fields to create tasks
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default LibraryAssignmentForm
