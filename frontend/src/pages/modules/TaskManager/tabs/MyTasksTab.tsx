import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { User, Filter, CalendarIcon, CheckCircle, Calendar } from "lucide-react"
import { format } from "date-fns"
import { DynamicTable } from "@/components/custom_components/dynamic-table"

interface MyTasksTabProps {
  currentDate: string
  filterProject: string
  filterDate: Date | undefined
  filterStatus: string
  filterPriority: string
  projects: Array<{ name: string; project_name?: string }> | undefined
  isLoadingTasks: boolean
  todayDateGroup: any
  myTasks: any[]
  customBadgeVariants: any
  onFilterProjectChange: (value: string) => void
  onFilterDateChange: (date: Date | undefined) => void
  onFilterStatusChange: (value: string) => void
  onFilterPriorityChange: (value: string) => void
  onClearFilters: () => void
}

export const MyTasksTab: React.FC<MyTasksTabProps> = ({
  currentDate,
  filterProject,
  filterDate,
  filterStatus,
  filterPriority,
  projects,
  isLoadingTasks,
  todayDateGroup,
  myTasks,
  customBadgeVariants,
  onFilterProjectChange,
  onFilterDateChange,
  onFilterStatusChange,
  onFilterPriorityChange,
  onClearFilters,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
          <p className="text-sm text-muted-foreground">
            Your assigned tasks for today ({currentDate})
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Project Filter */}
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={filterProject} onValueChange={onFilterProjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.name} value={project.name}>
                      {project.project_name || project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterDate ? format(filterDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={filterDate}
                    onSelect={onFilterDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={onFilterStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Working">Working</SelectItem>
                  <SelectItem value="Pending Review">Pending Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={filterPriority} onValueChange={onFilterPriorityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Today's Assignments</span>
            {myTasks.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                {myTasks.length} task{myTasks.length !== 1 ? "s" : ""}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Tasks assigned to you under Daily Site Work for {currentDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTasks ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="text-muted-foreground text-sm font-medium">Loading your tasks...</div>
            </div>
          ) : !todayDateGroup ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Task Group for Today</h3>
              <p className="text-sm text-muted-foreground">
                No tasks have been assigned for {currentDate} yet.
              </p>
            </div>
          ) : myTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
              <p className="text-sm text-muted-foreground">
                You have no tasks assigned for today.
              </p>
            </div>
          ) : (
            <DynamicTable
              data={myTasks}
              excludeFields={["name", "lft", "rgt", "parent_task", "is_group"]}
              caption="Your tasks for today"
              isLoading={false}
              showActions={false}
              showSelection={false}
              badgeVariants={customBadgeVariants}
              customRenderers={{
                _assign: (value) => {
                  if (!value) return "-"
                  try {
                    const assignees = JSON.parse(value)
                    return assignees.length > 0 ? assignees.join(", ") : "-"
                  } catch {
                    return value
                  }
                },
                progress: (value) => (
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-10 text-right">{value || 0}%</span>
                  </div>
                ),
                exp_end_date: (value) => {
                  if (!value) return "-"
                  return format(new Date(value), "MMM dd, yyyy")
                },
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
