"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from "recharts"
import {
    CheckCircle,
    XCircle,
    Clock,
    Calendar,
    TrendingUp,
    BarChart3,
    PieChart as PieChartIcon,
    Settings,
    UserCheck,
    Map,
} from "lucide-react"
import { useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk'
import AttendanceIcon from "@/assets/icons/construction-workers-light.svg"
import { HRMSModulesOverview, attendanceModules } from "@/components/hrms/WorkflowTree"
import ShiftLocationMap from "@/components/hrms/ShiftLocationMap"

const AttendanceDashboard: React.FC = () => {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("overview")
    const today = new Date().toISOString().split('T')[0]

    // Fetch counts for stats
    const { data: presentData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Attendance',
        filters: {
            attendance_date: today,
            status: ['in', ['Present', 'Work From Home']]
        }
    })
    const { data: absentData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Attendance',
        filters: {
            attendance_date: today,
            status: 'Absent'
        }
    })
    const { data: onLeaveData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Attendance',
        filters: {
            attendance_date: today,
            status: 'On Leave'
        }
    })
    const { data: pendingRequestsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Attendance Request',
        filters: { status: 'Open' }
    })

    // Fetch data for charts
    const { data: attendance } = useFrappeGetDocList("Attendance", {
        fields: ["status", "attendance_date", "employee_name"],
        limit: 1000
    })

    const presentCount = presentData?.message || 0
    const absentCount = absentData?.message || 0
    const onLeaveCount = onLeaveData?.message || 0
    const pendingRequestsCount = pendingRequestsData?.message || 0

    // Prepare chart data
    const statusData = attendance?.reduce((acc: any, curr) => {
        const status = curr.status || "Unknown"
        acc[status] = (acc[status] || 0) + 1
        return acc
    }, {})

    const chartDataStatus = Object.keys(statusData || {}).map(key => ({
        name: key,
        value: statusData[key]
    }))

    const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6']

    // Calculate weekly attendance data from real data
    const weeklyAttendanceData = useMemo(() => {
        if (!attendance || attendance.length === 0) return []

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const weekData: Record<string, { present: number; absent: number }> = {}

        attendance.forEach((record) => {
            if (!record.attendance_date) return
            const date = new Date(record.attendance_date)
            const dayName = dayNames[date.getDay()]

            if (!weekData[dayName]) {
                weekData[dayName] = { present: 0, absent: 0 }
            }

            if (record.status === 'Present' || record.status === 'Work From Home') {
                weekData[dayName].present++
            } else if (record.status === 'Absent') {
                weekData[dayName].absent++
            }
        })

        // Return data for Mon-Fri only
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => ({
            day,
            present: weekData[day]?.present || 0,
            absent: weekData[day]?.absent || 0
        }))
    }, [attendance])

    return (
        <>
            {/* Header */}
            <div className="relative flex items-center justify-between bg-gradient-to-r from-green-700 to-emerald-500 text-white">
                <div className="p-6">
                    <h1 className="text-3xl font-bold">Attendance</h1>
                    <p className="text-white/80">Track and manage employee attendance</p>
                </div>
                <img src={AttendanceIcon} alt="Attendance Icon" className="h-full w-40 p-2" />
            </div>

            <div className="space-y-6 p-6 bg-background">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="relative overflow-hidden rounded-lg p-4">
                        <CheckCircle className="absolute right-4 top-4 h-24 w-24 text-green-500 opacity-10" />
                        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 flex justify-between p-0">
                            <div className="flex-col items-baseline gap-2 w-full">
                                <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                                <p className="text-xs text-muted-foreground">Employees checked in</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden rounded-lg p-4">
                        <XCircle className="absolute right-4 top-4 h-24 w-24 text-red-500 opacity-10" />
                        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 flex justify-between p-0">
                            <div className="flex-col items-baseline gap-2 w-full">
                                <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                                <p className="text-xs text-muted-foreground">Not marked present</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden rounded-lg p-4">
                        <Calendar className="absolute right-4 top-4 h-24 w-24 text-orange-500 opacity-10" />
                        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 p-0">
                            <div className="text-2xl font-bold text-orange-600">{onLeaveCount}</div>
                            <p className="text-xs text-muted-foreground">Approved leaves today</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden rounded-lg p-4">
                        <Clock className="absolute right-4 top-4 h-24 w-24 text-blue-500 opacity-10" />
                        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 p-0">
                            <div className="text-2xl font-bold text-blue-600">{pendingRequestsCount}</div>
                            <p className="text-xs text-muted-foreground">Awaiting approval</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="modules">Modules</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 w-full">
                            <Card className="w-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Weekly Attendance Trend
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={{
                                            present: { label: "Present", color: "var(--chart-2)" },
                                            absent: { label: "Absent", color: "var(--chart-5)" },
                                        }}
                                        className="h-[300px] w-full"
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={weeklyAttendanceData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="day" />
                                                <YAxis />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Bar dataKey="present" fill="var(--color-present)" />
                                                <Bar dataKey="absent" fill="var(--color-absent)" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PieChartIcon className="h-5 w-5" />
                                        Attendance Status Distribution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={{
                                            value: { label: "Count", color: "var(--chart-1)" },
                                        }}
                                        className="h-[300px]"
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={chartDataStatus}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                                >
                                                    {chartDataStatus.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            <Card className="col-span-1 md:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Map className="h-5 w-5" />
                                        Shift Locations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ShiftLocationMap />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Attendance Metrics</CardTitle>
                                    <CardDescription>Key performance indicators</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span className="font-medium">Attendance Rate</span>
                                        <span className="text-green-600 font-bold">96%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                        <span className="font-medium">On-Time Arrival</span>
                                        <span className="text-blue-600 font-bold">92%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                        <span className="font-medium">Average Hours/Day</span>
                                        <span className="text-orange-600 font-bold">8.2 hrs</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                        <span className="font-medium">WFH Employees</span>
                                        <span className="text-purple-600 font-bold">15%</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Monthly Attendance Trend
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={{
                                            rate: { label: "Attendance %", color: "var(--chart-3)" },
                                        }}
                                        className="h-[300px]"
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={[
                                                { month: "Jan", rate: 94 },
                                                { month: "Feb", rate: 95 },
                                                { month: "Mar", rate: 93 },
                                                { month: "Apr", rate: 96 },
                                                { month: "May", rate: 97 },
                                                { month: "Jun", rate: 96 },
                                            ]}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis domain={[90, 100]} />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Line type="monotone" dataKey="rate" stroke="var(--color-rate)" strokeWidth={3} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="modules" className="space-y-6">
                        <HRMSModulesOverview modules={attendanceModules} title="Attendance Modules" />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}

export default AttendanceDashboard
