"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  Clock,
  AlertCircle,
  ListTodo,
  Plus,
  LayoutGrid,
  BarChart3,
  CalendarDays,
  Filter,
  Download,
  RefreshCw,
  Search,
  FolderKanban,
  User,
  ChevronRight,
} from "lucide-react"
import { useFrappeAuth, useFrappeGetDocList } from "frappe-react-sdk"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { OverviewTab, AnalyticsTab, KanbanTab, GanttChartTab, MyTodoTab } from "./tabs"
import DashboardLayout from "@/components/common/DashboardLayout"
import { taskManagerModules, HRMSModulesOverview } from "@/components/hrms/WorkflowTree"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"

const TaskManager: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialTab = searchParams.get("tab") || "overview"
  const [activeTab, setActiveTab] = useState(initialTab)
  const [searchTerm, setSearchTerm] = useState("")

  // Get current user
  const { currentUser } = useFrappeAuth()

  // Get Daily Site Work root task ID from environment
  const dailyWorkRootId = import.meta.env.VITE_DAILY_TASK_WORKS_ID

  // Get current date in yyyy-MM-dd format
  const currentDate = format(new Date(), "yyyy-MM-dd")

  // Get current month date range
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd")
  const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd")

  // Filter states for My Tasks tab
  const [filterProject, setFilterProject] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<Date | undefined>(new Date())
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")

  const { data: allTasks } = useFrappeGetDocList("Task", {
    fields: ["name", "subject", "status", "priority", "creation", "exp_end_date"],
    limit: 1000,
  })

  const { monthlyTasksData, completionRateData, priorityDistribution, taskStats } = useMemo(() => {
    if (!allTasks) {
      return {
        monthlyTasksData: [],
        completionRateData: [],
        priorityDistribution: [],
        taskStats: {
          total: 0,
          completed: 0,
          inProgress: 0,
          overdue: 0,
        },
      }
    }

    const taskStats = {
      total: allTasks.length,
      completed: allTasks.filter((task) => task.status === "Completed").length,
      inProgress: allTasks.filter((task) => task.status === "Working").length,
      overdue: allTasks.filter((task) => task.status === "Overdue").length,
    }

    const monthlyTasks: { [key: string]: { completed: number; pending: number } } = {}
    allTasks.forEach((task) => {
      const month = format(new Date(task.creation), "MMM")
      if (!monthlyTasks[month]) {
        monthlyTasks[month] = { completed: 0, pending: 0 }
      }
      if (task.status === "Completed") {
        monthlyTasks[month].completed++
      } else {
        monthlyTasks[month].pending++
      }
    })

    const monthlyTasksData = Object.keys(monthlyTasks).map((month) => ({
      month,
      ...monthlyTasks[month],
    }))

    const completionRateData = Object.keys(monthlyTasks).map((month) => {
      const { completed, pending } = monthlyTasks[month]
      const total = completed + pending
      return {
        month,
        rate: total > 0 ? (completed / total) * 100 : 0,
      }
    })

    const priorityCounts: { [key: string]: number } = {}
    allTasks.forEach((task) => {
      const priority = task.priority || "Unknown"
      priorityCounts[priority] = (priorityCounts[priority] || 0) + 1
    })

    const priorityDistribution = Object.keys(priorityCounts).map((priority) => ({
      name: priority,
      value: priorityCounts[priority],
      color: `var(--chart-${Object.keys(priorityCounts).indexOf(priority) + 1})`,
    }))

    return { monthlyTasksData, completionRateData, priorityDistribution, taskStats }
  }, [allTasks])

  // Fetch date group for selected date (under Daily Site Work)
  const { data: dateGroups } = useFrappeGetDocList("Task", {
    fields: ["name", "lft", "rgt"],
    filters: dailyWorkRootId
      ? [
        ["parent_task", "=", dailyWorkRootId],
        ["subject", "=", format(filterDate || new Date(), "yyyy-MM-dd")],
        ["is_group", "=", 1],
      ]
      : [],
    limit: 1,
  })

  const todayDateGroup = dateGroups?.[0]

  // Fetch projects for filter dropdown
  const { data: projects } = useFrappeGetDocList("Project", {
    fields: ["name", "project_name"],
    filters: [["status", "=", "Open"]],
    limit: 100,
    orderBy: {
      field: "project_name",
      order: "asc",
    },
  })

  // Fetch all tasks assigned to current user
  const { data: allUserTasks, isLoading: isLoadingTasks } = useFrappeGetDocList("Task", {
    fields: [
      "name",
      "subject",
      "project",
      "exp_end_date",
      "_assign",
      "progress",
      "status",
      "priority",
      "lft",
      "rgt",
      "parent_task",
    ],
    filters: currentUser
      ? [
        ["_assign", "like", `%${currentUser}%`],
        ["is_template", "!=", 1],
      ]
      : [],
    limit: 500,
    orderBy: {
      field: "exp_end_date",
      order: "asc",
    },
  })

  // Filter tasks to show only those under selected date group with applied filters
  const myTasks = useMemo(() => {
    if (!allUserTasks || !todayDateGroup) return []
    return allUserTasks.filter((task) => {
      // Filter by hierarchy: descendants of today's date group (using nested set model)
      const isUnderDateGroup =
        task.lft > todayDateGroup.lft && task.rgt < todayDateGroup.rgt && task.is_group !== 1
      if (!isUnderDateGroup) return false

      // Filter by project
      if (filterProject && filterProject !== "all" && task.project !== filterProject) return false

      // Filter by status
      if (filterStatus !== "all" && task.status !== filterStatus) return false

      // Filter by priority
      if (filterPriority !== "all" && task.priority !== filterPriority) return false

      return true
    })
  }, [allUserTasks, todayDateGroup, filterProject, filterStatus, filterPriority])

  // Quick action buttons
  const quickActions = [
    {
      label: "Create Task",
      icon: Plus,
      action: () => navigate("/task-manager/new"),
      variant: "default" as const,
      className: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30",
    },
    {
      label: "Task List",
      icon: User,
      action: () => navigate("/task-manager/tasks"),
      variant: "outline" as const,
      badge: myTasks.length,
    },
    {
      label: "View Projects",
      icon: FolderKanban,
      action: () => navigate("/projects"),
      variant: "outline" as const,
    },
  ]

  const stats = (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Tasks Card */}
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-blue-500">
        <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-blue-600/5 group-hover:scale-110 transition-transform duration-500" />
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Total Tasks</CardTitle>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/40">
            <ListTodo className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            {taskStats.total}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">All time tasks</p>
        </CardContent>
      </Card>

      {/* In Progress Card */}
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-orange-500">
        <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-gradient-to-br from-orange-500/10 to-orange-600/5 group-hover:scale-110 transition-transform duration-500" />
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">In Progress</CardTitle>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/40">
            <Clock className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
            {taskStats.inProgress}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Active tasks</p>
        </CardContent>
      </Card>

      {/* Completed Card */}
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-green-500">
        <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-gradient-to-br from-green-500/10 to-green-600/5 group-hover:scale-110 transition-transform duration-500" />
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Completed</CardTitle>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-md shadow-green-500/40">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            {taskStats.completed}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">This month</p>
        </CardContent>
      </Card>

      {/* Overdue Card */}
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-red-500">
        <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-gradient-to-br from-red-500/10 to-red-600/5 group-hover:scale-110 transition-transform duration-500" />
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Overdue</CardTitle>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-md shadow-red-500/40">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
            {taskStats.overdue}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Needs attention</p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <DashboardLayout
      title="Task Manager"
      subtitle="Organize, track, and manage your tasks efficiently"
      stats={stats}
    // modules={taskManagerModules}
    >
      <div className="space-y-6">
        {/* Enhanced Action Bar */}
        <Card className="border-2 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    onClick={action.action}
                    variant={action.variant}
                    size="lg"
                    className={`relative group ${action.className || ""}`}
                  >
                    <action.icon className="h-5 w-5 mr-2" />
                    {action.label}
                    {action.badge !== undefined && action.badge > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-white/20 rounded-full">
                        {action.badge}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                ))}
              </div>

              {/* Search Bar */}
              {/* <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search tasks, projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
              </div> */}
            </div>

            {/* Today's Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Today's Focus</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{myTasks.length}</p>
                    <p className="text-xs text-muted-foreground">Assigned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {myTasks.filter((t) => t.status === "Completed").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Done</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {myTasks.filter((t) => t.status === "Working").length}
                    </p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-gray-100 rounded-xl">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-3 font-semibold transition-all"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-3 font-semibold transition-all"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="kanban"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-3 font-semibold transition-all relative"
            >
              <User className="h-4 w-4 mr-2" />
              My Tasks
              {myTasks.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-blue-500 text-white rounded-full">
                  {myTasks.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <OverviewTab monthlyTasksData={monthlyTasksData} completionRateData={completionRateData} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <AnalyticsTab priorityDistribution={priorityDistribution} taskStats={taskStats} />
          </TabsContent>

          <TabsContent value="kanban" className="space-y-6 mt-6">
            <KanbanTab filterProject={filterProject} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default TaskManager