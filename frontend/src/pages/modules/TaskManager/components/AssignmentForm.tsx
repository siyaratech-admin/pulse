import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { format } from "date-fns"
import { CalendarIcon, User, Building2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import ProjectSelector from "./ProjectSelector"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AssignmentFormProps {
  selectedProject: string
  selectedDate: Date
  selectedUser: string
  onProjectChange: (project: string) => void
  onDateChange: (date: Date) => void
  onUserChange: (user: string) => void
  onClear: () => void
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({
  selectedProject,
  selectedDate,
  selectedUser,
  onProjectChange,
  onDateChange,
  onUserChange,
  onClear,
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Fetch users for assignment
  const { data: users, isLoading: isLoadingUsers } = useFrappeGetDocList("User", {
    fields: ["name", "full_name", "email"],
    filters: [
      ["enabled", "=", 1],
      ["name", "!=", "Administrator"],
      ["name", "!=", "Guest"],
    ],
    limit: 100,
    orderBy: { field: "full_name", order: "asc" },
  })

  const isFormComplete = selectedProject && selectedDate && selectedUser

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Assignment Details</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        {/* Project Selector */}
        <div className="space-y-2">
          <Label htmlFor="project" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Project
          </Label>
          <ProjectSelector
            selectedProject={selectedProject}
            onProjectChange={onProjectChange}
            className="w-full"
          />
          {selectedProject && (
            <p className="text-xs text-muted-foreground">
              Tasks will be assigned to: <span className="font-medium">{selectedProject}</span>
            </p>
          )}
        </div>

        {/* Date Picker */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Date
          </Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    onDateChange(date)
                    setCalendarOpen(false)
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {selectedDate && (
            <p className="text-xs text-muted-foreground">
              Expected date: <span className="font-medium">{format(selectedDate, "yyyy-MM-dd")}</span>
            </p>
          )}
        </div>

        {/* User Selector */}
        <div className="space-y-2">
          <Label htmlFor="user" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Assign To
          </Label>
          <Select value={selectedUser} onValueChange={onUserChange} disabled={isLoadingUsers}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select a user"} />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.name} value={user.email || user.name}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{user.full_name || user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email || user.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedUser && (
            <p className="text-xs text-muted-foreground">
              Assignee:{" "}
              <span className="font-medium">
                {users?.find((u) => u.email === selectedUser || u.name === selectedUser)
                  ?.full_name || selectedUser}
              </span>
            </p>
          )}
        </div>

        {/* Form Status */}
        <div className="pt-4 border-t">
          {isFormComplete ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="h-2 w-2 rounded-full bg-green-600" />
              <span>Ready to assign tasks</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
              <span>Complete all fields to continue</span>
            </div>
          )}
        </div>

        {/* Clear Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onClear}
          disabled={!selectedProject && !selectedUser}
        >
          <X className="h-4 w-4 mr-2" />
          Clear Form
        </Button>
      </CardContent>
    </Card>
  )
}

export default AssignmentForm
