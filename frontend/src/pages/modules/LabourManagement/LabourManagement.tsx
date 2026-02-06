"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Clock,
  Users,
  UserPlus,
  TrendingUp,
  ClipboardList,
  Plus,
  LayoutGrid,
  BarChart3,
  ChevronRight,
  Briefcase,
  CheckCircle,
  Activity,
  FileText,
  UserCheck,
  Settings,
  ArrowUpRight,
} from "lucide-react"
import { useFrappeGetDocList } from 'frappe-react-sdk'
import DashboardLayout from "@/components/common/DashboardLayout"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useNavigate } from "react-router-dom"
import { format, startOfMonth, subMonths, eachMonthOfInterval } from "date-fns"
import ConstructionWorkersLight from "@/assets/icons/construction-workers-light.svg"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Labour Management module structure
const labourManagementModulesStructure = [
  {
    id: 'attendance-time',
    label: 'Attendance & Time',
    // route: '/labour-management/attendance',
    icon: Clock,
    color: 'bg-blue-600 hover:bg-blue-700',
    gradient: 'from-blue-500 to-blue-600',
    borderColor: 'border-t-blue-500',
    children: [
      {
        id: 'daily-labour-summary',
        label: 'Daily Labour Summary',
        route: '/labour-management/daily-labour-summary',
        icon: ClipboardList,
        doctype: 'Daily Labour Summary'
      },
      {
        id: 'daily-labour-usage',
        label: 'Daily Labour Usage',
        route: '/labour-management/daily-labour-usage',
        icon: Clock,
        doctype: 'Daily Labour Usage'
      }
    ]
  },
  {
    id: 'worker-management',
    label: 'Worker Management',
    // route: '/labour-management/worker-management',
    icon: Users,
    color: 'bg-green-600 hover:bg-green-700',
    gradient: 'from-green-500 to-green-600',
    borderColor: 'border-t-green-500',
    children: [
      {
        id: 'labour-onboarding',
        label: 'Labour Onboarding',
        route: '/labour-management/labour-onboarding',
        icon: UserPlus,
        doctype: 'Labour Onboarding'
      },
      {
        id: 'sub-contractor',
        label: 'Sub Contractor',
        route: '/labour-management/sub-contractor',
        icon: Briefcase,
        doctype: 'Sub Contractor'
      },
      {
        id: 'sub-contractor-labour-rates',
        label: 'Sub Contractor Labour Rates',
        route: '/subcontractor/sub-contractor-labour-rates',
        icon: FileText,
        doctype: 'Sub Contractor Labour Rates'
      },
      {
        id: 'sub-contractor-workhead',
        label: 'Sub Contractor Workhead',
        route: '/labour-management/sub-contractor-workhead',
        icon: FileText,
        doctype: 'Sub Contractor Workhead'
      },
      {
        id: 'labour-attendance',
        label: 'Labour Attendance',
        route: '/labour-management/labour-attendance',
        icon: CheckCircle,
        doctype: 'Labour Attendance'
      }
    ]
  },
  {
    id: 'master-data',
    label: 'Master Data',
    // route: '/labour-management/master-data',
    icon: Settings,
    color: 'bg-purple-600 hover:bg-purple-700',
    gradient: 'from-purple-500 to-purple-600',
    borderColor: 'border-t-purple-500',
    children: [
      {
        id: 'kb-labour-type',
        label: 'KB Labour Type',
        route: '/labour-management/kb-labour-type',
        icon: Settings,
        doctype: 'KB Labour Type'
      },
      {
        id: 'kb-nature-of-work',
        label: 'KB Nature of Work',
        route: '/labour-management/kb-nature-of-work',
        icon: Settings,
        doctype: 'KB Nature of Work'
      },
      {
        id: 'workhead-template',
        label: 'Workhead Template',
        route: '/labour-management/workhead-template',
        icon: Settings,
        doctype: 'Workhead Template'
      }
    ]
  }
];

const LabourManagement: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedProject, setSelectedProject] = useState<string>("")

  // Fetch Projects
  const { data: projects } = useFrappeGetDocList("Project", {
    fields: ["name", "project_name", "status"],
    filters: [["status", "=", "Open"]],
    limit: 1000
  })

  // Fetch Daily Labour Summaries
  const { data: dailySummaries } = useFrappeGetDocList("Daily Labour Summary", {
    fields: ["name", "date", "total_labour", "creation", "modified"],
    limit: 1000
  })

  // Fetch Daily Labour Usage
  const { data: labourUsage } = useFrappeGetDocList("Daily Labour Usage", {
    fields: ["name", "labour", "attendance_status", "labour_type", "creation"],
    limit: 1000
  })

  // Fetch Labour Onboarding
  const { data: labourOnboarding } = useFrappeGetDocList("Labour Onboarding", {
    fields: ["name", "labour_name", "labour_type", "status", "creation", "modified"],
    limit: 1000
  })

  // Fetch Sub Contractors
  const { data: subContractors } = useFrappeGetDocList("Sub Contractor", {
    fields: ["name", "sub_contractor_name", "creation"],
    limit: 1000
  })

  // Calculate counts
  const summaryCount = dailySummaries?.length || 0
  const usageCount = labourUsage?.length || 0
  const onboardingCount = labourOnboarding?.length || 0
  const contractorCount = subContractors?.length || 0

  // Get recent items
  const recentSummaries = useMemo(() => {
    if (!dailySummaries) return []
    return [...dailySummaries]
      .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
      .slice(0, 5)
  }, [dailySummaries])

  const recentOnboarding = useMemo(() => {
    if (!labourOnboarding) return []
    return [...labourOnboarding]
      .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
      .slice(0, 5)
  }, [labourOnboarding])

  // Calculate stats
  const labourStats = useMemo(() => {
    const totalLabour = labourOnboarding?.length || 0
    const activeLabour = labourOnboarding?.filter(l => l.status === 'Active').length || 0
    const todayPresent = labourUsage?.filter(u => u.attendance_status === 'Present').length || 0
    const todayAbsent = labourUsage?.filter(u => u.attendance_status === 'Absent').length || 0
    const totalAttendance = todayPresent + todayAbsent
    const attendanceRate = totalAttendance > 0 ? ((todayPresent / totalAttendance) * 100).toFixed(0) : 0

    return {
      totalLabour,
      activeLabour,
      todayPresent,
      todayAbsent,
      attendanceRate,
      activeProjects: projects?.length || 0
    }
  }, [labourOnboarding, labourUsage, projects])

  // Calculate monthly attendance data from real labour usage
  const monthlyAttendanceData = useMemo(() => {
    if (!labourUsage || labourUsage.length === 0) return []

    // Get last 6 months
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    })

    return months.map(monthDate => {
      const monthKey = format(monthDate, 'MMM')
      const monthYear = format(monthDate, 'yyyy-MM')

      const monthUsage = labourUsage.filter(usage => {
        const usageMonth = format(new Date(usage.creation), 'yyyy-MM')
        return usageMonth === monthYear
      })

      const present = monthUsage.filter(u => u.attendance_status === 'Present').length
      const absent = monthUsage.filter(u => u.attendance_status === 'Absent').length

      return {
        month: monthKey,
        present,
        absent
      }
    })
  }, [labourUsage])

  // Calculate productivity/attendance rate per month
  const productivityData = useMemo(() => {
    return monthlyAttendanceData.map(data => {
      const total = data.present + data.absent
      const rate = total > 0 ? ((data.present / total) * 100).toFixed(1) : 0
      return {
        month: data.month,
        rate: parseFloat(rate)
      }
    })
  }, [monthlyAttendanceData])

  // Labour type distribution from real onboarding data
  const labourTypeDistribution = useMemo(() => {
    if (!labourOnboarding || labourOnboarding.length === 0) return []

    const typeCounts: { [key: string]: number } = {}

    labourOnboarding.forEach(labour => {
      const type = labour.labour_type || 'Unknown'
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

    return Object.keys(typeCounts).map((type, index) => ({
      name: type,
      value: typeCounts[type],
      color: colors[index % colors.length]
    }))
  }, [labourOnboarding])

  // Quick action buttons
  const quickActions = [
    {
      label: "New Daily Summary",
      icon: Plus,
      action: () => navigate("/labour-management/daily-labour-summary/new"),
      variant: "default" as const,
      className: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30",
    },
    {
      label: "Record Attendance",
      icon: Clock,
      action: () => navigate("/labour-management/labour-attendance"),
      variant: "outline" as const,
      badge: usageCount,
    },
    {
      label: "Onboard Labour",
      icon: UserPlus,
      action: () => navigate("/labour-management/labour-onboarding"),
      variant: "outline" as const,
      badge: onboardingCount,
    },
  ]

  const stats = (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Daily Summaries Card */}
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-blue-500">
        <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-blue-600/5 group-hover:scale-110 transition-transform duration-500" />
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">
            Daily Summaries
          </CardTitle>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/40">
            <ClipboardList className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            {summaryCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Total summaries</p>
        </CardContent>
      </Card>

      {/* Labour Usage Card */}
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-green-500">
        <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-gradient-to-br from-green-500/10 to-green-600/5 group-hover:scale-110 transition-transform duration-500" />
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">
            Labour Records
          </CardTitle>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-md shadow-green-500/40">
            <Clock className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            {usageCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Usage records</p>
        </CardContent>
      </Card>

      {/* Labour Onboarding Card */}
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-purple-500">
        <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/10 to-purple-600/5 group-hover:scale-110 transition-transform duration-500" />
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">
            Total Workers
          </CardTitle>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-md shadow-purple-500/40">
            <Users className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
            {onboardingCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Registered workers</p>
        </CardContent>
      </Card>

      {/* Sub Contractors Card */}
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-orange-500">
        <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-gradient-to-br from-orange-500/10 to-orange-600/5 group-hover:scale-110 transition-transform duration-500" />
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">
            Sub Contractors
          </CardTitle>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/40">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
            {contractorCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Active contractors</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DashboardLayout
      title="Labour Management"
      subtitle="Manage workforce, attendance, and productivity"
      icon={ConstructionWorkersLight}
      stats={stats}
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

              {/* Project Selector */}
              <div className="w-full lg:w-64">
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Select Project" />
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
            </div>

            {/* Labour Overview Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Labour Overview</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(), "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {labourStats.activeProjects}
                    </p>
                    <p className="text-xs text-muted-foreground">Active Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{labourStats.totalLabour}</p>
                    <p className="text-xs text-muted-foreground">Total Workers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{labourStats.attendanceRate}%</p>
                    <p className="text-xs text-muted-foreground">Attendance</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module Navigation Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {labourManagementModulesStructure.map((module) => (
            <Card
              key={module.id}
              className={`relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-t-4 ${module.borderColor} cursor-pointer`}
              onClick={() => navigate(module.route)}
            >
              <div className={`absolute right-0 top-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-gradient-to-br ${module.gradient} opacity-10 group-hover:scale-110 transition-transform duration-500`} />

              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${module.gradient} shadow-lg`}>
                    <module.icon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
                <CardTitle className="text-lg font-bold">{module.label}</CardTitle>
                <CardDescription className="text-xs">
                  {module.children.length} sub-modules available
                </CardDescription>
              </CardHeader>

              <CardContent className="relative z-10">
                <div className="space-y-2">
                  {module.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(child.route)
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group/item"
                    >
                      <div className="flex items-center gap-2">
                        <child.icon className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {child.label}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover/item:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
              value="recent"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-3 font-semibold transition-all"
            >
              <Clock className="h-4 w-4 mr-2" />
              Recent Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {/* Monthly Attendance Trend */}
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Monthly Attendance Trend
                  </CardTitle>
                  <CardDescription>Present vs Absent workers over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {monthlyAttendanceData.length > 0 ? (
                    <ChartContainer
                      config={{
                        present: {
                          label: "Present",
                          color: "hsl(142, 76%, 36%)",
                        },
                        absent: {
                          label: "Absent",
                          color: "hsl(0, 84%, 60%)",
                        },
                      }}
                      className="h-[280px] sm:h-[300px] w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyAttendanceData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} tickMargin={8} />
                          <YAxis tick={{ fontSize: 12 }} tickMargin={8} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Line
                            type="monotone"
                            dataKey="present"
                            stroke="var(--color-present)"
                            strokeWidth={2}
                            name="Present"
                            dot={{ fill: "var(--color-present)", r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="absent"
                            stroke="var(--color-absent)"
                            strokeWidth={2}
                            name="Absent"
                            dot={{ fill: "var(--color-absent)", r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No attendance data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Attendance Rate Trend */}
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Attendance Rate Trend
                  </CardTitle>
                  <CardDescription>Monthly attendance percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  {productivityData.length > 0 ? (
                    <ChartContainer
                      config={{
                        rate: {
                          label: "Attendance %",
                          color: "hsl(217, 91%, 60%)",
                        },
                      }}
                      className="h-[280px] sm:h-[300px] w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productivityData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} tickMargin={8} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickMargin={8} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Bar
                            dataKey="rate"
                            fill="var(--color-rate)"
                            name="Attendance %"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No productivity data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Labour Type Distribution */}
              <Card className="w-full md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                    Labour Type Distribution
                  </CardTitle>
                  <CardDescription>Worker distribution by type</CardDescription>
                </CardHeader>
                <CardContent>
                  {labourTypeDistribution.length > 0 ? (
                    <ChartContainer
                      config={{
                        value: {
                          label: "Workers",
                          color: "hsl(217, 91%, 60%)",
                        },
                      }}
                      className="h-[280px] sm:h-[350px] w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={labourTypeDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={window.innerWidth < 640 ? 80 : 100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {labourTypeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                      No labour type data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Labour Performance</CardTitle>
                  <CardDescription>Workforce efficiency metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Daily Summaries</span>
                    <span className="text-green-600 font-bold">{summaryCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Total Records</span>
                    <span className="text-blue-600 font-bold">{usageCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">Active Projects</span>
                    <span className="text-purple-600 font-bold">{labourStats.activeProjects}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contractor Overview</CardTitle>
                  <CardDescription>Sub-contractor statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium">Sub Contractors</span>
                    <span className="text-orange-600 font-bold">{contractorCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                    <span className="font-medium">Onboarded Workers</span>
                    <span className="text-indigo-600 font-bold">{onboardingCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                    <span className="font-medium">Attendance Rate</span>
                    <span className="text-teal-600 font-bold">{labourStats.attendanceRate}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6 mt-6">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {/* Recent Summaries */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                    Recent Daily Summaries
                  </CardTitle>
                  <CardDescription>Latest labour summaries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentSummaries && recentSummaries.length > 0 ? (
                      recentSummaries.map((summary) => (
                        <div
                          key={summary.name}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => navigate(`/app/daily-labour-summary/${summary.name}`)}
                        >
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">{summary.name}</p>
                            <p className="text-xs text-gray-600">Total: {summary.total_labour || 0}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {summary.date ? format(new Date(summary.date), "MMM dd, yyyy") : 'N/A'}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No recent summaries</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Onboarding */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-green-600" />
                    Recent Onboarding
                  </CardTitle>
                  <CardDescription>Latest worker registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentOnboarding && recentOnboarding.length > 0 ? (
                      recentOnboarding.map((labour) => (
                        <div
                          key={labour.name}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => navigate(`/app/labour-onboarding/${labour.name}`)}
                        >
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">{labour.labour_name || labour.name}</p>
                            <p className="text-xs text-gray-600">{labour.labour_type || 'N/A'}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {labour.creation ? format(new Date(labour.creation), "MMM dd, yyyy") : 'N/A'}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No recent onboarding</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default LabourManagement