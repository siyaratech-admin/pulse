"use client"
import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
  Legend
} from "recharts"
import {
  Briefcase, FileText, TrendingUp, BarChart3, PieChart as PieChartIcon,
  Activity, Users, UserPlus, Calendar, Clock, CheckCircle, XCircle,
  AlertCircle, MessageSquare, ClipboardCheck, UserCheck, Award,
  Target, Zap, TrendingDown, Plus, ChevronRight, LayoutGrid, Grid3x3,
  CalendarDays
} from "lucide-react"
import { useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk'
import { format } from "date-fns"
import { hrmsModules } from "@/components/hrms/WorkflowTree"
import DashboardLayout from "@/components/common/DashboardLayout"
import HRMSCircularView from "@/components/hrms/HRMSCircularView"
import { useNavigate } from "react-router-dom"

const HRMSDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")

  // ============ FETCH BASIC STATS ============
  const { data: employeesData } = useFrappeGetCall('frappe.client.get_count', {
    doctype: 'Employee',
    filters: { status: 'Active' }
  })

  const { data: jobOpeningsData } = useFrappeGetCall('frappe.client.get_count', {
    doctype: 'Job Opening',
    filters: { status: 'Open' }
  })

  const { data: leaveApplicationsData } = useFrappeGetCall('frappe.client.get_count', {
    doctype: 'Leave Application',
    filters: { status: 'Open' }
  })

  const { data: attendanceData } = useFrappeGetCall('frappe.client.get_count', {
    doctype: 'Attendance',
    filters: {
      attendance_date: new Date().toISOString().split('T')[0],
      status: ['in', ['Present', 'Work From Home']]
    }
  })

  // ============ FETCH HR LIFECYCLE DATA ============
  const { data: jobApplicantsData } = useFrappeGetCall('frappe.client.get_count', {
    doctype: 'Job Applicant',
    filters: { status: ['in', ['Open', 'Replied', 'Hold']] }
  })

  const { data: interviewsData } = useFrappeGetCall('frappe.client.get_count', {
    doctype: 'Interview',
    filters: { status: ['in', ['Pending', 'Under Review']] }
  })

  const { data: jobOffersData } = useFrappeGetCall('frappe.client.get_count', {
    doctype: 'Job Offer',
    filters: { status: ['in', ['Awaiting Response', 'Pending']] }
  })

  const { data: appraisalsData } = useFrappeGetCall('frappe.client.get_count', {
    doctype: 'Appraisal',
    filters: { status: ['in', ['Draft', 'Pending']] }
  })

  const { data: trainingEventsData } = useFrappeGetCall('frappe.client.get_count', {
    doctype: 'Training Event',
    filters: { status: ['in', ['Scheduled', 'In Progress']] }
  })

  // ============ FETCH DETAILED DATA FOR CHARTS ============
  const { data: employees } = useFrappeGetDocList("Employee", {
    fields: ["department", "gender", "date_of_joining", "employment_type"],
    filters: [["status", "=", "Active"]],
    limit: 1000
  })

  const { data: jobApplicants } = useFrappeGetDocList("Job Applicant", {
    fields: ["status", "job_title", "applicant_name"],
    limit: 1000
  })

  const { data: leaveApplications } = useFrappeGetDocList("Leave Application", {
    fields: ["leave_type", "status"],
    filters: [["docstatus", "=", 1]],
    limit: 1000
  })

  // ============ FETCH RECENT ACTIVITIES ============
  const { data: recentJobOffers } = useFrappeGetDocList("Job Offer", {
    fields: ["name", "applicant_name", "designation", "status", "modified", "offer_date"],
    filters: [["status", "in", ["Awaiting Response", "Pending", "Accepted"]]],
    limit: 10,
    orderBy: { field: "modified", order: "desc" }
  })

  const { data: recentInterviews } = useFrappeGetDocList("Interview", {
    fields: ["name", "job_applicant", "interview_round", "status", "scheduled_on", "designation"],
    filters: [["status", "in", ["Pending", "Under Review", "Cleared"]]],
    limit: 10,
    orderBy: { field: "scheduled_on", order: "desc" }
  })

  const { data: recentLeaves } = useFrappeGetDocList("Leave Application", {
    fields: ["name", "employee_name", "leave_type", "status", "from_date", "to_date", "total_leave_days"],
    filters: [["status", "in", ["Open", "Approved"]]],
    limit: 10,
    orderBy: { field: "modified", order: "desc" }
  })

  const { data: recentAppraisals } = useFrappeGetDocList("Appraisal", {
    fields: ["name", "employee_name", "status", "start_date", "end_date"],
    filters: [["status", "in", ["Draft", "Pending", "Completed"]]],
    limit: 8,
    orderBy: { field: "modified", order: "desc" }
  })

  const { data: recentTrainings } = useFrappeGetDocList("Training Event", {
    fields: ["name", "event_name", "status", "start_time", "end_time", "location"],
    filters: [["status", "in", ["Scheduled", "In Progress", "Completed"]]],
    limit: 8,
    orderBy: { field: "start_time", order: "desc" }
  })

  const { data: recentEmployees } = useFrappeGetDocList("Employee", {
    fields: ["name", "employee_name", "department", "designation", "date_of_joining"],
    filters: [["status", "=", "Active"]],
    limit: 8,
    orderBy: { field: "creation", order: "desc" }
  })

  // ============ CONVERT DATA TO COUNTS ============
  const employeesCount = employeesData?.message || 0
  const jobOpeningsCount = jobOpeningsData?.message || 0
  const leaveApplicationsCount = leaveApplicationsData?.message || 0
  const attendanceCount = attendanceData?.message || 0
  const jobApplicantsCount = jobApplicantsData?.message || 0
  const interviewsCount = interviewsData?.message || 0
  const jobOffersCount = jobOffersData?.message || 0
  const appraisalsCount = appraisalsData?.message || 0
  const trainingEventsCount = trainingEventsData?.message || 0

  // ============ PREPARE CHART DATA ============

  // Department Distribution
  const deptData = employees?.reduce((acc: any, curr) => {
    const dept = curr.department || "Unassigned"
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {})

  const chartDataDept = Object.keys(deptData || {}).map(key => ({
    name: key,
    value: deptData[key]
  })).sort((a, b) => b.value - a.value).slice(0, 8)

  // Gender Distribution
  const genderData = employees?.reduce((acc: any, curr) => {
    const gender = curr.gender || "Not Specified"
    acc[gender] = (acc[gender] || 0) + 1
    return acc
  }, {})

  const chartDataGender = Object.keys(genderData || {}).map(key => ({
    name: key,
    value: genderData[key]
  }))

  // Employment Type Distribution
  const employmentTypeData = employees?.reduce((acc: any, curr) => {
    const type = curr.employment_type || "Not Specified"
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  const chartDataEmploymentType = Object.keys(employmentTypeData || {}).map(key => ({
    name: key,
    value: employmentTypeData[key]
  }))

  // Recruitment Pipeline Data
  const recruitmentPipelineData = jobApplicants?.reduce((acc: any, curr) => {
    const status = curr.status || "Unknown"
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const chartDataRecruitment = Object.keys(recruitmentPipelineData || {}).map(key => ({
    name: key,
    value: recruitmentPipelineData[key]
  }))

  // Leave Type Distribution
  const leaveTypeData = leaveApplications?.reduce((acc: any, curr) => {
    const type = curr.leave_type || "Unknown"
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  const chartDataLeaveType = Object.keys(leaveTypeData || {}).map(key => ({
    name: key,
    value: leaveTypeData[key]
  })).sort((a, b) => b.value - a.value).slice(0, 6)

  const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#ea580c', '#c2410c', '#9a3412']

  // Monthly Hiring Trend (Mock data - replace with actual data from backend)
  const monthlyHiringData = [
    { month: "Jan", hires: 5, interviews: 12, offers: 7 },
    { month: "Feb", hires: 8, interviews: 15, offers: 10 },
    { month: "Mar", hires: 6, interviews: 18, offers: 8 },
    { month: "Apr", hires: 10, interviews: 22, offers: 12 },
    { month: "May", hires: 7, interviews: 16, offers: 9 },
    { month: "Jun", hires: 9, interviews: 20, offers: 11 },
  ]

  // Attendance Trend (Mock data)
  const attendanceTrendData = [
    { month: "Jan", present: 92, absent: 5, leave: 3 },
    { month: "Feb", present: 94, absent: 4, leave: 2 },
    { month: "Mar", present: 91, absent: 6, leave: 3 },
    { month: "Apr", present: 95, absent: 3, leave: 2 },
    { month: "May", present: 93, absent: 5, leave: 2 },
    { month: "Jun", present: 96, absent: 2, leave: 2 },
  ]

  // Quick action buttons
  const quickActions = [
    {
      label: "New Employee",
      icon: Plus,
      action: () => navigate("/hrms/employee/new"),
      variant: "default" as const,
      className: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-200",
    },
    {
      label: "Job Opening",
      icon: Briefcase,
      action: () => navigate("/hrms/recruitment/job-openings"),
      variant: "outline" as const,
      className: "border-orange-200 text-orange-600 hover:bg-orange-50",
    },
    {
      label: "Leave Request",
      icon: Calendar,
      action: () => navigate("/hrms/leave-applications"),
      variant: "outline" as const,
      className: "border-orange-200 text-orange-600 hover:bg-orange-50",
      badge: leaveApplicationsCount,
    },
  ]

  // ============ STATS CARDS ============
  const stats = (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Employees Card */}
      <Card className="border-2 border-orange-400 shadow-lg rounded-2xl bg-white overflow-hidden group hover:shadow-xl transition-all duration-300">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-t-2xl"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Total Employees</CardTitle>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
            <Users className="h-5 w-5 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">
            {employeesCount}
          </div>
          <p className="text-xs text-gray-600 mt-1 font-medium">Active workforce</p>
        </CardContent>
      </Card>

      {/* Open Positions Card */}
      <Card className="border-2 border-amber-400 shadow-lg rounded-2xl bg-white overflow-hidden group hover:shadow-xl transition-all duration-300">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-t-2xl"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Open Positions</CardTitle>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100">
            <Briefcase className="h-5 w-5 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-amber-600">
            {jobOpeningsCount}
          </div>
          <p className="text-xs text-gray-600 mt-1 font-medium">Hiring now</p>
        </CardContent>
      </Card>

      {/* Pending Leaves Card */}
      <Card className="border-2 border-orange-400 shadow-lg rounded-2xl bg-white overflow-hidden group hover:shadow-xl transition-all duration-300">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-t-2xl"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Pending Leaves</CardTitle>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">
            {leaveApplicationsCount}
          </div>
          <p className="text-xs text-gray-600 mt-1 font-medium">Awaiting approval</p>
        </CardContent>
      </Card>

      {/* Present Today Card */}
      <Card className="border-2 border-amber-400 shadow-lg rounded-2xl bg-white overflow-hidden group hover:shadow-xl transition-all duration-300">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-t-2xl"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Present Today</CardTitle>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
            <UserCheck className="h-5 w-5 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-amber-600">
            {attendanceCount}
          </div>
          <p className="text-xs text-gray-600 mt-1 font-medium">
            {employeesCount > 0 ? `${((attendanceCount / employeesCount) * 100).toFixed(1)}% attendance` : 'No data'}
          </p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <DashboardLayout
      title="HR Management System"
      subtitle="Complete HR lifecycle management and workforce analytics"
      icon={
        <img
          src="/LabourManagement/total_workers-removebg-preview.png"
          alt="HRMS Icon"
          className="h-full w-40 p-2 object-contain"
        />
      }
      stats={stats}
    >
      <div className="space-y-6">
        {/* Enhanced Action Bar */}
        <Card className="border-2 border-orange-400 shadow-lg rounded-2xl bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-t-2xl"></div>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    onClick={action.action}
                    variant={action.variant}
                    size="lg"
                    className={`relative group flex-1 sm:flex-none ${action.className || ""}`}
                  >
                    <action.icon className="h-5 w-5 mr-2" />
                    <span className="hidden sm:inline">{action.label}</span>
                    <span className="sm:hidden">{action.label.split(" ")[0]}</span>
                    {action.badge !== undefined && action.badge > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-white/20 rounded-full">
                        {action.badge}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Today's Summary */}
            <div className="mt-6 pt-6 border-t border-orange-100">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                    <CalendarDays className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Today's Overview</p>
                    <p className="text-xs text-gray-600">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-orange-600">{employeesCount}</p>
                    <p className="text-xs text-gray-600">Employees</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-amber-600">{attendanceCount}</p>
                    <p className="text-xs text-gray-600">Present</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-orange-600">{leaveApplicationsCount}</p>
                    <p className="text-xs text-gray-600">Leaves</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-orange-50 rounded-xl border-2 border-orange-200">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-lg rounded-lg py-2 sm:py-3 font-semibold transition-all text-xs sm:text-sm text-gray-600"
            >
              <LayoutGrid className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-lg rounded-lg py-2 sm:py-3 font-semibold transition-all text-xs sm:text-sm text-gray-600"
            >
              <BarChart3 className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Charts</span>
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-lg rounded-lg py-2 sm:py-3 font-semibold transition-all text-xs sm:text-sm text-gray-600"
            >
              <Activity className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Activities</span>
              <span className="sm:hidden">Recent</span>
            </TabsTrigger>
            <TabsTrigger
              value="modules"
              className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-lg rounded-lg py-2 sm:py-3 font-semibold transition-all text-xs sm:text-sm text-gray-600"
            >
              <Grid3x3 className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Modules</span>
              <span className="sm:hidden">Menu</span>
            </TabsTrigger>
          </TabsList>

          {/* ============ OVERVIEW TAB ============ */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* HR Lifecycle Pipeline Stats */}
            <Card className="border-2 border-orange-400 shadow-lg rounded-2xl bg-white overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-t-2xl"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                    <Target className="h-5 w-5 text-orange-600" />
                  </div>
                  HR Lifecycle Pipeline
                </CardTitle>
                <CardDescription>Track candidates through the complete hiring journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                  <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-lg shadow-sm border-2 border-orange-200 hover:shadow-md transition-shadow">
                    <Briefcase className="h-6 sm:h-8 w-6 sm:w-8 text-orange-600 mb-2" />
                    <div className="text-xl sm:text-2xl font-bold text-orange-600">{jobOpeningsCount}</div>
                    <p className="text-xs text-center text-gray-600 mt-1">Job Openings</p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-lg shadow-sm border-2 border-amber-200 hover:shadow-md transition-shadow">
                    <Users className="h-6 sm:h-8 w-6 sm:w-8 text-amber-600 mb-2" />
                    <div className="text-xl sm:text-2xl font-bold text-amber-600">{jobApplicantsCount}</div>
                    <p className="text-xs text-center text-gray-600 mt-1">Active Applicants</p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-lg shadow-sm border-2 border-orange-200 hover:shadow-md transition-shadow">
                    <MessageSquare className="h-6 sm:h-8 w-6 sm:w-8 text-orange-600 mb-2" />
                    <div className="text-xl sm:text-2xl font-bold text-orange-600">{interviewsCount}</div>
                    <p className="text-xs text-center text-gray-600 mt-1">Scheduled Interviews</p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-lg shadow-sm border-2 border-amber-200 hover:shadow-md transition-shadow">
                    <FileText className="h-6 sm:h-8 w-6 sm:w-8 text-amber-600 mb-2" />
                    <div className="text-xl sm:text-2xl font-bold text-amber-600">{jobOffersCount}</div>
                    <p className="text-xs text-center text-gray-600 mt-1">Pending Offers</p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-lg shadow-sm border-2 border-orange-200 hover:shadow-md transition-shadow col-span-2 sm:col-span-3 md:col-span-1">
                    <CheckCircle className="h-6 sm:h-8 w-6 sm:w-8 text-orange-600 mb-2" />
                    <div className="text-xl sm:text-2xl font-bold text-orange-600">{employeesCount}</div>
                    <p className="text-xs text-center text-gray-600 mt-1">Active Employees</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional HR Metrics */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-2 border-amber-400 shadow-lg rounded-2xl bg-white hover:shadow-xl transition-shadow overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-t-2xl"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Performance Reviews</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border border-amber-100">
                    <Award className="h-4 w-4 text-amber-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{appraisalsCount}</div>
                  <p className="text-xs text-gray-600 mt-1">Pending appraisals</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-400 shadow-lg rounded-2xl bg-white hover:shadow-xl transition-shadow overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-t-2xl"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Training Events</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                    <ClipboardCheck className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{trainingEventsCount}</div>
                  <p className="text-xs text-gray-600 mt-1">Scheduled & ongoing</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-400 shadow-lg rounded-2xl bg-white hover:shadow-xl transition-shadow overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-t-2xl"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Leave Balance</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                    <Calendar className="h-4 w-4 text-amber-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{leaveApplicationsCount}</div>
                  <p className="text-xs text-gray-600 mt-1">Requests to review</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-400 shadow-lg rounded-2xl bg-white hover:shadow-xl transition-shadow overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-t-2xl"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Attendance Rate</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                    <Zap className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {employeesCount > 0 ? `${((attendanceCount / employeesCount) * 100).toFixed(1)}%` : '0%'}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Today's attendance</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {/* Department Distribution */}
              <Card className="border-2 border-orange-400 shadow-lg rounded-2xl bg-white hover:shadow-xl transition-shadow overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-t-2xl"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                      <BarChart3 className="h-5 w-5 text-orange-600" />
                    </div>
                    Employees by Department
                  </CardTitle>
                  <CardDescription>Workforce distribution across departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Employees",
                        color: "hsl(24.6 95% 53.1%)",
                      },
                    }}
                    className="h-[280px] sm:h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartDataDept}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Recruitment Pipeline */}
              <Card className="border-2 border-amber-400 shadow-lg rounded-2xl bg-white hover:shadow-xl transition-shadow overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-t-2xl"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                      <PieChartIcon className="h-5 w-5 text-amber-600" />
                    </div>
                    Recruitment Pipeline Status
                  </CardTitle>
                  <CardDescription>Distribution of applicants by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Count",
                        color: "hsl(24.6 95% 53.1%)",
                      },
                    }}
                    className="h-[280px] sm:h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartDataRecruitment}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={window.innerWidth < 640 ? 70 : 80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartDataRecruitment.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Employment Type Distribution */}
              <Card className="border-2 border-orange-400 shadow-lg rounded-2xl bg-white hover:shadow-xl transition-shadow overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-t-2xl"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                      <PieChartIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    Employment Type Distribution
                  </CardTitle>
                  <CardDescription>Full-time, part-time, contract breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Count",
                        color: "hsl(24.6 95% 53.1%)",
                      },
                    }}
                    className="h-[280px] sm:h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartDataEmploymentType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={window.innerWidth < 640 ? 70 : 80}
                          fill="#82ca9d"
                          dataKey="value"
                        >
                          {chartDataEmploymentType.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Leave Type Distribution */}
              <Card className="border-2 border-amber-400 shadow-lg rounded-2xl bg-white hover:shadow-xl transition-shadow overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-t-2xl"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                      <BarChart3 className="h-5 w-5 text-amber-600" />
                    </div>
                    Leave Type Distribution
                  </CardTitle>
                  <CardDescription>Most common leave types requested</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Leave Requests",
                        color: "hsl(24.6 95% 53.1%)",
                      },
                    }}
                    className="h-[280px] sm:h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartDataLeaveType} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={100}
                          tick={{ fontSize: 11 }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="#f97316" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ============ ANALYTICS TAB ============ */}
          <TabsContent value="analytics" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
              {/* Monthly Hiring Trend */}
              <Card className="border-2 border-orange-400 shadow-lg rounded-2xl bg-white hover:shadow-xl transition-shadow overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-t-2xl"></div>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                    </div>
                    <span className="truncate">Monthly Hiring Trend</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Recruitment activity over the past 6 months</CardDescription>
                </CardHeader>
                <CardContent className="p-2 sm:p-4 lg:p-6">
                  <ChartContainer
                    config={{
                      hires: {
                        label: "New Hires",
                        color: "hsl(24.6 95% 53.1%)",
                      },
                      interviews: {
                        label: "Interviews",
                        color: "hsl(45 93% 47%)",
                      },
                      offers: {
                        label: "Offers",
                        color: "hsl(32.1 94.6% 43.7%)",
                      },
                    }}
                    className="h-[220px] sm:h-[280px] lg:h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyHiringData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                          interval={window.innerWidth < 640 ? 1 : 0}
                        />
                        <YAxis tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend
                          wrapperStyle={{ fontSize: window.innerWidth < 640 ? '10px' : '12px' }}
                          iconSize={window.innerWidth < 640 ? 8 : 14}
                        />
                        <Line
                          type="monotone"
                          dataKey="hires"
                          stroke="#f97316"
                          strokeWidth={window.innerWidth < 640 ? 1.5 : 2}
                          dot={{ r: window.innerWidth < 640 ? 3 : 4 }}
                          name="New Hires"
                        />
                        <Line
                          type="monotone"
                          dataKey="interviews"
                          stroke="#fbbf24"
                          strokeWidth={window.innerWidth < 640 ? 1.5 : 2}
                          dot={{ r: window.innerWidth < 640 ? 3 : 4 }}
                          name="Interviews"
                        />
                        <Line
                          type="monotone"
                          dataKey="offers"
                          stroke="#fb923c"
                          strokeWidth={window.innerWidth < 640 ? 1.5 : 2}
                          dot={{ r: window.innerWidth < 640 ? 3 : 4 }}
                          name="Offers"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Attendance Trend */}
              <Card className="border-2 border-amber-400 shadow-lg rounded-2xl bg-white hover:shadow-xl transition-shadow overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-t-2xl"></div>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                      <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                    </div>
                    <span className="truncate">Attendance Trend</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Monthly attendance patterns</CardDescription>
                </CardHeader>
                <CardContent className="p-2 sm:p-4 lg:p-6">
                  <ChartContainer
                    config={{
                      present: {
                        label: "Present",
                        color: "hsl(24.6 95% 53.1%)",
                      },
                      absent: {
                        label: "Absent",
                        color: "hsl(0 84.2% 60.2%)",
                      },
                      leave: {
                        label: "On Leave",
                        color: "hsl(45 93% 47%)",
                      },
                    }}
                    className="h-[220px] sm:h-[280px] lg:h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendanceTrendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                          interval={window.innerWidth < 640 ? 1 : 0}
                        />
                        <YAxis tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend
                          wrapperStyle={{ fontSize: window.innerWidth < 640 ? '10px' : '12px' }}
                          iconSize={window.innerWidth < 640 ? 8 : 14}
                        />
                        <Bar dataKey="present" stackId="a" fill="#f97316" name="Present" />
                        <Bar dataKey="absent" stackId="a" fill="#ef4444" name="Absent" />
                        <Bar dataKey="leave" stackId="a" fill="#fbbf24" name="On Leave" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Gender Distribution */}
              <Card className="border-2 border-orange-400 shadow-lg rounded-2xl bg-white hover:shadow-xl transition-shadow overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-t-2xl"></div>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                      <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                    </div>
                    <span className="truncate">Gender Distribution</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Workforce diversity overview</CardDescription>
                </CardHeader>
                <CardContent className="p-2 sm:p-4 lg:p-6">
                  <ChartContainer
                    config={{
                      value: {
                        label: "Count",
                        color: "hsl(24.6 95% 53.1%)",
                      },
                    }}
                    className="h-[220px] sm:h-[280px] lg:h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartDataGender}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            window.innerWidth < 640
                              ? `${((percent || 0) * 100).toFixed(0)}%`
                              : `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                          }
                          outerRadius={window.innerWidth < 400 ? 50 : window.innerWidth < 640 ? 60 : window.innerWidth < 1024 ? 70 : 90}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartDataGender.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        {window.innerWidth < 640 && (
                          <Legend
                            wrapperStyle={{ fontSize: '10px' }}
                            iconSize={8}
                          />
                        )}
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* HR Metrics Summary */}
              <Card className="border-2 border-amber-400 shadow-lg rounded-2xl bg-white hover:shadow-xl transition-shadow overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-t-2xl"></div>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-sm sm:text-base lg:text-lg">Key HR Metrics</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Performance indicators at a glance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6">
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg border-2 border-orange-200 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
                      <span className="font-medium text-xs sm:text-sm lg:text-base truncate">Employee Retention</span>
                    </div>
                    <span className="text-orange-600 font-bold text-base sm:text-lg lg:text-xl ml-2 flex-shrink-0">94%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg border-2 border-amber-200 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 flex-shrink-0" />
                      <span className="font-medium text-xs sm:text-sm lg:text-base truncate">Attendance Rate</span>
                    </div>
                    <span className="text-amber-600 font-bold text-base sm:text-lg lg:text-xl ml-2 flex-shrink-0">96%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg border-2 border-orange-200 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
                      <span className="font-medium text-xs sm:text-sm lg:text-base truncate">Avg Time to Hire</span>
                    </div>
                    <span className="text-orange-600 font-bold text-base sm:text-lg lg:text-xl ml-2 flex-shrink-0">18d</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg border-2 border-amber-200 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                      <Award className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 flex-shrink-0" />
                      <span className="font-medium text-xs sm:text-sm lg:text-base truncate">Training Complete</span>
                    </div>
                    <span className="text-amber-600 font-bold text-base sm:text-lg lg:text-xl ml-2 flex-shrink-0">89%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg border-2 border-orange-200 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
                      <span className="font-medium text-xs sm:text-sm lg:text-base truncate">Satisfaction</span>
                    </div>
                    <span className="text-orange-600 font-bold text-base sm:text-lg lg:text-xl ml-2 flex-shrink-0">4.2/5</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ============ ACTIVITIES TAB ============ */}
          <TabsContent value="activities" className="space-y-6 mt-6">
            {/* Recruitment Activities */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {/* Pending Job Offers */}
              <Card className="border-2 border-orange-400 shadow-lg rounded-2xl bg-white hover:shadow-xl transition-shadow overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-t-2xl"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    Pending Job Offers
                  </CardTitle>
                  <CardDescription>Offers awaiting candidate response</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {recentJobOffers && recentJobOffers.length > 0 ? (
                      recentJobOffers.map((offer) => (
                        <div
                          key={offer.name}
                          className="flex items-start justify-between p-3 sm:p-4 bg-white border border-gray-100 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all cursor-pointer"
                          onClick={() => navigate(`/app/job-offer/${offer.name}`)}
                        >
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100 flex-shrink-0">
                              <CheckCircle className="h-4 w-4 text-orange-600" />
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate text-gray-900">{offer.applicant_name}</p>
                              <p className="text-sm text-gray-600 truncate">{offer.designation}</p>
                              <p className="text-xs text-gray-500">
                                Offered: {new Date(offer.offer_date || offer.modified).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <span className={`text-xs px-2 sm:px-3 py-1 rounded-full font-medium border ${offer.status === 'Accepted' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              offer.status === 'Awaiting Response' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-orange-50 text-orange-700 border-orange-200'
                              }`}>
                              {offer.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-600">
                        <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl inline-block mb-3 border border-orange-100">
                          <FileText className="h-12 w-12 text-orange-300" />
                        </div>
                        <p className="text-sm">No pending job offers</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Interviews */}
              <Card className="border-2 border-amber-400 shadow-lg rounded-2xl bg-white hover:shadow-xl transition-shadow overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-t-2xl"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                      <Calendar className="h-5 w-5 text-amber-600" />
                    </div>
                    Upcoming Interviews
                  </CardTitle>
                  <CardDescription>Scheduled interviews to conduct</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {recentInterviews && recentInterviews.length > 0 ? (
                      recentInterviews.map((interview) => (
                        <div
                          key={interview.name}
                          className="flex items-start justify-between p-3 sm:p-4 bg-white border border-gray-100 rounded-xl hover:bg-amber-50 hover:border-amber-200 transition-all cursor-pointer"
                          onClick={() => navigate(`/app/interview/${interview.name}`)}
                        >
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100 flex-shrink-0">
                              <MessageSquare className="h-4 w-4 text-amber-600" />
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate text-gray-900">{interview.job_applicant}</p>
                              <p className="text-sm text-gray-600 truncate">{interview.designation || interview.interview_round}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(interview.scheduled_on).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <span className={`text-xs px-2 sm:px-3 py-1 rounded-full font-medium border ${interview.status === 'Cleared' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              interview.status === 'Under Review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-orange-50 text-orange-700 border-orange-200'
                              }`}>
                              {interview.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-600">
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl inline-block mb-3 border border-amber-100">
                          <Calendar className="h-12 w-12 text-amber-300" />
                        </div>
                        <p className="text-sm">No upcoming interviews</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Leave Management & Performance Activities */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {/* Leave Requests Pending Approval */}
              <Card className="border-2 border-orange-400 shadow-lg rounded-2xl bg-white hover:shadow-xl transition-shadow overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-t-2xl"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    Leave Requests
                  </CardTitle>
                  <CardDescription>Pending approval and recently approved</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {recentLeaves && recentLeaves.length > 0 ? (
                      recentLeaves.map((leave) => (
                        <div
                          key={leave.name}
                          className="flex items-start justify-between p-3 sm:p-4 bg-white border border-gray-100 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all cursor-pointer"
                          onClick={() => navigate(`/app/leave-application/${leave.name}`)}
                        >
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100 flex-shrink-0">
                              <AlertCircle className={`h-4 w-4 ${leave.status === 'Open' ? 'text-orange-600' : 'text-amber-600'}`} />
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate text-gray-900">{leave.employee_name}</p>
                              <p className="text-sm text-gray-600 truncate">{leave.leave_type}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(leave.from_date).toLocaleDateString()} - {new Date(leave.to_date).toLocaleDateString()}
                              </p>
                              <p className="text-xs font-medium text-gray-700">
                                {leave.total_leave_days} day{leave.total_leave_days > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <span className={`text-xs px-2 sm:px-3 py-1 rounded-full font-medium border ${leave.status === 'Approved' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                              {leave.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-600">
                        <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl inline-block mb-3 border border-orange-100">
                          <Clock className="h-12 w-12 text-orange-300" />
                        </div>
                        <p className="text-sm">No leave requests</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Appraisals */}
              <Card className="border-2 border-amber-400 shadow-lg rounded-2xl bg-white hover:shadow-xl transition-shadow overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-t-2xl"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                      <Award className="h-5 w-5 text-amber-600" />
                    </div>
                    Performance Appraisals
                  </CardTitle>
                  <CardDescription>Reviews and evaluations in progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {recentAppraisals && recentAppraisals.length > 0 ? (
                      recentAppraisals.map((appraisal) => (
                        <div
                          key={appraisal.name}
                          className="flex items-start justify-between p-3 sm:p-4 bg-white border border-gray-100 rounded-xl hover:bg-amber-50 hover:border-amber-200 transition-all cursor-pointer"
                          onClick={() => navigate(`/app/appraisal/${appraisal.name}`)}
                        >
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100 flex-shrink-0">
                              <Award className="h-4 w-4 text-amber-600" />
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate text-gray-900">{appraisal.employee_name}</p>
                              <p className="text-xs text-gray-500">
                                Period: {new Date(appraisal.start_date).toLocaleDateString()} - {new Date(appraisal.end_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <span className={`text-xs px-2 sm:px-3 py-1 rounded-full font-medium border ${appraisal.status === 'Completed' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              appraisal.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-orange-50 text-orange-700 border-orange-200'
                              }`}>
                              {appraisal.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-600">
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl inline-block mb-3 border border-amber-100">
                          <Award className="h-12 w-12 text-amber-300" />
                        </div>
                        <p className="text-sm">No appraisals in progress</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Training & Development Activities */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {/* Training Events */}
              <Card className="border-2 border-orange-400 shadow-lg rounded-2xl bg-white hover:shadow-xl transition-shadow overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-t-2xl"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                      <ClipboardCheck className="h-5 w-5 text-orange-600" />
                    </div>
                    Training Events
                  </CardTitle>
                  <CardDescription>Scheduled learning and development sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {recentTrainings && recentTrainings.length > 0 ? (
                      recentTrainings.map((training) => (
                        <div
                          key={training.name}
                          className="flex items-start justify-between p-3 sm:p-4 bg-white border border-gray-100 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all cursor-pointer"
                          onClick={() => navigate(`/app/training-event/${training.name}`)}
                        >
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100 flex-shrink-0">
                              <ClipboardCheck className="h-4 w-4 text-orange-600" />
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate text-gray-900">{training.event_name}</p>
                              <p className="text-xs text-gray-600 truncate">{training.location || 'Location TBD'}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(training.start_time).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <span className={`text-xs px-2 sm:px-3 py-1 rounded-full font-medium border ${training.status === 'Completed' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              training.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-orange-50 text-orange-700 border-orange-200'
                              }`}>
                              {training.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-600">
                        <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl inline-block mb-3 border border-orange-100">
                          <ClipboardCheck className="h-12 w-12 text-orange-300" />
                        </div>
                        <p className="text-sm">No training events scheduled</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Employee Onboarding */}
              <Card className="border-2 border-amber-400 shadow-lg rounded-2xl bg-white hover:shadow-xl transition-shadow overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-t-2xl"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                      <UserPlus className="h-5 w-5 text-amber-600" />
                    </div>
                    Recent Employees
                  </CardTitle>
                  <CardDescription>Newly joined team members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {recentEmployees && recentEmployees.length > 0 ? (
                      recentEmployees.map((employee) => (
                        <div
                          key={employee.name}
                          className="flex items-start justify-between p-3 sm:p-4 bg-white border border-gray-100 rounded-xl hover:bg-amber-50 hover:border-amber-200 transition-all cursor-pointer"
                          onClick={() => navigate(`/app/employee/${employee.name}`)}
                        >
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100 flex-shrink-0">
                              <UserPlus className="h-4 w-4 text-amber-600" />
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate text-gray-900">{employee.employee_name}</p>
                              <p className="text-sm text-gray-600 truncate">{employee.designation}</p>
                              <p className="text-xs text-gray-500 truncate">{employee.department}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="text-xs text-gray-500 mb-1">
                              {new Date(employee.date_of_joining).toLocaleDateString()}
                            </p>
                            <span className="text-xs px-2 sm:px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full font-medium inline-block">
                              Active
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-600">
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl inline-block mb-3 border border-amber-100">
                          <UserPlus className="h-12 w-12 text-amber-300" />
                        </div>
                        <p className="text-sm">No recent hires</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overall HR Activity Summary */}
            <Card className="border-2 border-orange-400 shadow-lg rounded-2xl bg-white overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-t-2xl"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                    <Activity className="h-5 w-5 text-orange-600" />
                  </div>
                  HR Activity Summary
                </CardTitle>
                <CardDescription>Quick overview of current HR operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                  <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm border-2 border-orange-200 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100 flex-shrink-0">
                      <Briefcase className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600">Recruitment</p>
                      <p className="text-xl sm:text-2xl font-bold text-orange-600">{jobApplicantsCount + interviewsCount + jobOffersCount}</p>
                      <p className="text-xs text-gray-500 truncate">Active candidates</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm border-2 border-amber-200 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 flex-shrink-0">
                      <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600">Leaves</p>
                      <p className="text-xl sm:text-2xl font-bold text-amber-600">{leaveApplicationsCount}</p>
                      <p className="text-xs text-gray-500 truncate">To review</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm border-2 border-orange-200 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100 flex-shrink-0">
                      <Award className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600">Development</p>
                      <p className="text-xl sm:text-2xl font-bold text-orange-600">{appraisalsCount + trainingEventsCount}</p>
                      <p className="text-xs text-gray-500 truncate">In progress</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ MODULES TAB ============ */}
          <TabsContent value="modules" className="space-y-6 mt-6">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0">
                <HRMSCircularView modules={hrmsModules} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fff7ed;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #f97316, #fb923c);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #ea580c, #f97316);
        }
      `}</style>
    </DashboardLayout>
  )
}

export default HRMSDashboard