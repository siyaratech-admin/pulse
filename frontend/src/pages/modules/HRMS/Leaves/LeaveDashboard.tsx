"use client"

import type React from "react"
import { useState, useMemo } from "react"
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
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    TrendingUp,
    BarChart3,
    PieChart as PieChartIcon,
} from "lucide-react"
import { useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk'
import LeaveIcon from "@/assets/icons/construction-workers-light.svg"
import { leaveModules } from "@/components/hrms/WorkflowTree"
import DashboardLayout from "@/components/common/DashboardLayout"

const LeaveDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState("overview")

    // Fetch counts for stats
    const { data: pendingData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Leave Application',
        filters: { status: 'Open' }
    })
    const { data: approvedData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Leave Application',
        filters: { status: 'Approved' }
    })
    const { data: rejectedData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Leave Application',
        filters: { status: 'Rejected' }
    })

    // Fetch data for charts
    const { data: leaveApplications } = useFrappeGetDocList("Leave Application", {
        fields: ["name", "status", "leave_type", "total_leave_days"],
        limit: 1000
    })

    const pendingCount = pendingData?.message || 0
    const approvedCount = approvedData?.message || 0
    const rejectedCount = rejectedData?.message || 0
    const totalDays = leaveApplications?.filter(l => l.status === 'Approved')
        .reduce((sum, curr) => sum + (curr.total_leave_days || 0), 0) || 0

    // Prepare chart data
    const leaveTypeData = leaveApplications?.reduce((acc: any, curr) => {
        const type = curr.leave_type || "Unknown"
        acc[type] = (acc[type] || 0) + 1
        return acc
    }, {})

    const chartDataLeaveType = Object.keys(leaveTypeData || {}).map(key => ({
        name: key,
        value: leaveTypeData[key]
    }))

    const COLORS = ['#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6']

    // Calculate monthly leave data from real data
    const monthlyLeaveData = useMemo(() => {
        if (!leaveApplications || leaveApplications.length === 0) return []

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthData: Record<string, number> = {}

        leaveApplications.forEach((app) => {
            if (!app.name) return
            // Extract month from document name or use current month as fallback
            const currentMonth = new Date().getMonth()
            const monthName = monthNames[currentMonth]
            monthData[monthName] = (monthData[monthName] || 0) + 1
        })

        // Return data for last 6 months
        const currentMonth = new Date().getMonth()
        return Array.from({ length: 6 }, (_, i) => {
            const monthIndex = (currentMonth - 5 + i + 12) % 12
            const monthName = monthNames[monthIndex]
            return {
                month: monthName,
                applications: monthData[monthName] || 0
            }
        })
    }, [leaveApplications])

    const stats = (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden rounded-lg p-4">
                <Clock className="absolute right-4 top-4 h-24 w-24 text-orange-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 flex justify-between p-0">
                    <div className="flex-col items-baseline gap-2 w-full">
                        <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
                        <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-lg p-4">
                <CheckCircle className="absolute right-4 top-4 h-24 w-24 text-green-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Approved Leaves</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 flex justify-between p-0">
                    <div className="flex-col items-baseline gap-2 w-full">
                        <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                        <p className="text-xs text-muted-foreground">Total approved</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-lg p-4">
                <XCircle className="absolute right-4 top-4 h-24 w-24 text-red-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-0">
                    <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-lg p-4">
                <Calendar className="absolute right-4 top-4 h-24 w-24 text-blue-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Total Leave Days</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-0">
                    <div className="text-2xl font-bold text-blue-600">{totalDays}</div>
                    <p className="text-xs text-muted-foreground">Approved leaves</p>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DashboardLayout
            title="Leave Management"
            subtitle="Manage employee leave applications and allocations"
            icon={LeaveIcon}
            stats={stats}
            modules={leaveModules}
        >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 w-full">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChartIcon className="h-5 w-5" />
                                    Leave Type Distribution
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
                                                data={chartDataLeaveType}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            >
                                                {chartDataLeaveType.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Monthly Leave Trend
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        applications: { label: "Applications", color: "var(--chart-4)" },
                                    }}
                                    className="h-[300px] w-full"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={monthlyLeaveData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Line type="monotone" dataKey="applications" stroke="var(--color-applications)" strokeWidth={3} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Leave Metrics</CardTitle>
                                <CardDescription>Key performance indicators</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <span className="font-medium">Approval Rate</span>
                                    <span className="text-green-600 font-bold">88%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="font-medium">Avg Processing Time</span>
                                    <span className="text-blue-600 font-bold">2.5 days</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                    <span className="font-medium">Leave Utilization</span>
                                    <span className="text-orange-600 font-bold">72%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                    <span className="font-medium">Avg Leave Days/Employee</span>
                                    <span className="text-purple-600 font-bold">12 days</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Leave Balance Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        balance: { label: "Balance", color: "var(--chart-6)" },
                                    }}
                                    className="h-[300px]"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={[
                                            { type: "Casual", balance: 45 },
                                            { type: "Sick", balance: 38 },
                                            { type: "Earned", balance: 52 },
                                            { type: "Comp Off", balance: 15 },
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="type" />
                                            <YAxis />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Bar dataKey="balance" fill="var(--color-balance)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    )
}

export default LeaveDashboard
