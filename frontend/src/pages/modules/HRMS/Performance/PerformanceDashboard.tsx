"use client"

import type React from "react"
import { useState } from "react"
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
    PieChart,
    Pie,
    Cell,
} from "recharts"
import {
    Award,
    Target,
    TrendingUp,
    FileCheck,
    BarChart3,
    PieChart as PieChartIcon,
} from "lucide-react"
import { useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk'
import { performanceModules } from "@/components/hrms/WorkflowTree"
import DashboardLayout from "@/components/common/DashboardLayout"

const PerformanceDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState("overview")

    // Fetch counts for stats
    const { data: appraisalsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Appraisal',
        filters: { docstatus: ['<', 2] }
    })
    const { data: goalsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Goal',
        filters: { status: 'Open' }
    })
    const { data: feedbackData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Employee Performance Feedback',
        filters: { docstatus: 0 }
    })
    const { data: promotionsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Employee Promotion',
        filters: { docstatus: 1 }
    })

    // Fetch data for charts
    const { data: appraisals } = useFrappeGetDocList("Appraisal", {
        fields: ["name", "status", "total_score"],
        limit: 1000
    })

    const { data: goals } = useFrappeGetDocList("Goal", {
        fields: ["name", "status", "goal_name"],
        limit: 1000
    })

    const appraisalsCount = appraisalsData?.message || 0
    const goalsCount = goalsData?.message || 0
    const feedbackCount = feedbackData?.message || 0
    const promotionsCount = promotionsData?.message || 0

    // Prepare chart data
    const appraisalStatusData = appraisals?.reduce((acc: any, curr) => {
        const status = curr.status || "Unknown"
        acc[status] = (acc[status] || 0) + 1
        return acc
    }, {})

    const chartDataAppraisalStatus = Object.keys(appraisalStatusData || {}).map(key => ({
        name: key,
        value: appraisalStatusData[key]
    }))

    const goalStatusData = goals?.reduce((acc: any, curr) => {
        const status = curr.status || "Unknown"
        acc[status] = (acc[status] || 0) + 1
        return acc
    }, {})

    const chartDataGoalStatus = Object.keys(goalStatusData || {}).map(key => ({
        name: key,
        value: goalStatusData[key]
    }))

    const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6']

    const stats = (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden rounded-lg p-4">
                <FileCheck className="absolute right-4 top-4 h-24 w-24 text-blue-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Active Appraisals</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 flex justify-between p-0">
                    <div className="flex-col items-baseline gap-2 w-full">
                        <div className="text-2xl font-bold text-blue-600">{appraisalsCount}</div>
                        <p className="text-xs text-muted-foreground">In progress</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-lg p-4">
                <Target className="absolute right-4 top-4 h-24 w-24 text-green-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Open Goals</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 flex justify-between p-0">
                    <div className="flex-col items-baseline gap-2 w-full">
                        <div className="text-2xl font-bold text-green-600">{goalsCount}</div>
                        <p className="text-xs text-muted-foreground">Active goals</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-lg p-4">
                <TrendingUp className="absolute right-4 top-4 h-24 w-24 text-orange-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Pending Feedback</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-0">
                    <div className="text-2xl font-bold text-orange-600">{feedbackCount}</div>
                    <p className="text-xs text-muted-foreground">Awaiting submission</p>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-lg p-4">
                <Award className="absolute right-4 top-4 h-24 w-24 text-purple-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Promotions</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-0">
                    <div className="text-2xl font-bold text-purple-600">{promotionsCount}</div>
                    <p className="text-xs text-muted-foreground">This year</p>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DashboardLayout
            title="Performance"
            subtitle="Track employee performance, goals, and appraisals"
            // Award icon is used in header, but DashboardLayout expects an image src.
            // I'll omit it for now.
            stats={stats}
            modules={performanceModules}
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
                                    Appraisal Status Distribution
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
                                                data={chartDataAppraisalStatus}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            >
                                                {chartDataAppraisalStatus.map((_, index) => (
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
                                    <BarChart3 className="h-5 w-5" />
                                    Goal Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        value: { label: "Count", color: "var(--chart-2)" },
                                    }}
                                    className="h-[300px] w-full"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartDataGoalStatus}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Bar dataKey="value" fill="var(--color-value)" />
                                        </BarChart>
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
                                <CardTitle>Performance Metrics</CardTitle>
                                <CardDescription>Key performance indicators</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <span className="font-medium">Avg Appraisal Score</span>
                                    <span className="text-green-600 font-bold">4.2/5</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="font-medium">Goal Completion Rate</span>
                                    <span className="text-blue-600 font-bold">78%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                    <span className="font-medium">Feedback Response Rate</span>
                                    <span className="text-purple-600 font-bold">85%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                    <span className="font-medium">Promotion Rate</span>
                                    <span className="text-orange-600 font-bold">12%</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Development Metrics</CardTitle>
                                <CardDescription>Growth and development</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <span className="font-medium">Skills Improved</span>
                                    <span className="text-green-600 font-bold">156</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="font-medium">Avg Goals per Employee</span>
                                    <span className="text-blue-600 font-bold">3.5</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                    <span className="font-medium">High Performers</span>
                                    <span className="text-purple-600 font-bold">24%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                    <span className="font-medium">Improvement Plans</span>
                                    <span className="text-orange-600 font-bold">8</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    )
}

export default PerformanceDashboard
