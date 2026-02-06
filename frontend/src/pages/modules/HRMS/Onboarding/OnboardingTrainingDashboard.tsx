"use client"

import type React from "react"
import { useState } from "react"
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
    PieChart,
    Pie,
    Cell,
} from "recharts"
import {
    BookOpen,
    Users,
    CheckCircle,
    Clock,
    BarChart3,
    PieChart as PieChartIcon,
} from "lucide-react"
import { useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk'
import { HRMSModulesOverview, onboardingModules } from "@/components/hrms/WorkflowTree"

const OnboardingTrainingDashboard: React.FC = () => {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("overview")

    // Fetch counts for stats
    const { data: onboardingData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Employee Onboarding',
        filters: { docstatus: ['<', 2] }
    })
    const { data: trainingProgramsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Training Program',
        filters: { disabled: 0 }
    })
    const { data: trainingEventsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Training Event',
        filters: { docstatus: 1 }
    })
    const { data: pendingFeedbackData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Training Feedback',
        filters: { docstatus: 0 }
    })

    // Fetch data for charts
    const { data: onboardings } = useFrappeGetDocList("Employee Onboarding", {
        fields: ["name", "boarding_status", "employee_name"],
        limit: 1000
    })

    const { data: trainingEvents } = useFrappeGetDocList("Training Event", {
        fields: ["name", "event_status", "training_program"],
        filters: [["docstatus", "=", 1]],
        limit: 1000
    })

    const onboardingCount = onboardingData?.message || 0
    const trainingProgramsCount = trainingProgramsData?.message || 0
    const trainingEventsCount = trainingEventsData?.message || 0
    const pendingFeedbackCount = pendingFeedbackData?.message || 0

    // Prepare chart data
    const statusData = onboardings?.reduce((acc: any, curr) => {
        const status = curr.boarding_status || "Unknown"
        acc[status] = (acc[status] || 0) + 1
        return acc
    }, {})

    const chartDataStatus = Object.keys(statusData || {}).map(key => ({
        name: key,
        value: statusData[key]
    }))

    const eventStatusData = trainingEvents?.reduce((acc: any, curr) => {
        const status = curr.event_status || "Unknown"
        acc[status] = (acc[status] || 0) + 1
        return acc
    }, {})

    const chartDataEventStatus = Object.keys(eventStatusData || {}).map(key => ({
        name: key,
        value: eventStatusData[key]
    }))

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

    return (
        <>
            {/* Header */}
            <div className="relative flex items-center justify-between bg-gradient-to-r from-indigo-700 to-blue-500 text-white">
                <div className="p-6">
                    <h1 className="text-3xl font-bold">Onboarding & Training</h1>
                    <p className="text-white/80">Manage employee onboarding and training programs</p>
                </div>
                <BookOpen className="h-40 w-40 p-6 opacity-20" />
            </div>

            <div className="space-y-6 p-6 bg-background">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="relative overflow-hidden rounded-lg p-4">
                        <Users className="absolute right-4 top-4 h-24 w-24 text-blue-500 opacity-10" />
                        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                            <CardTitle className="text-sm font-medium">Active Onboardings</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 flex justify-between p-0">
                            <div className="flex-col items-baseline gap-2 w-full">
                                <div className="text-2xl font-bold text-blue-600">{onboardingCount}</div>
                                <p className="text-xs text-muted-foreground">In progress</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden rounded-lg p-4">
                        <BookOpen className="absolute right-4 top-4 h-24 w-24 text-green-500 opacity-10" />
                        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                            <CardTitle className="text-sm font-medium">Training Programs</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 flex justify-between p-0">
                            <div className="flex-col items-baseline gap-2 w-full">
                                <div className="text-2xl font-bold text-green-600">{trainingProgramsCount}</div>
                                <p className="text-xs text-muted-foreground">Active programs</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden rounded-lg p-4">
                        <CheckCircle className="absolute right-4 top-4 h-24 w-24 text-purple-500 opacity-10" />
                        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                            <CardTitle className="text-sm font-medium">Training Events</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 p-0">
                            <div className="text-2xl font-bold text-purple-600">{trainingEventsCount}</div>
                            <p className="text-xs text-muted-foreground">Completed events</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden rounded-lg p-4">
                        <Clock className="absolute right-4 top-4 h-24 w-24 text-orange-500 opacity-10" />
                        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                            <CardTitle className="text-sm font-medium">Pending Feedback</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 p-0">
                            <div className="text-2xl font-bold text-orange-600">{pendingFeedbackCount}</div>
                            <p className="text-xs text-muted-foreground">Awaiting submission</p>
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
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PieChartIcon className="h-5 w-5" />
                                        Onboarding Status Distribution
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

                            <Card className="w-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Training Event Status
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
                                            <BarChart data={chartDataEventStatus}>
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
                                    <CardTitle>Onboarding Metrics</CardTitle>
                                    <CardDescription>Key performance indicators</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span className="font-medium">Completion Rate</span>
                                        <span className="text-green-600 font-bold">85%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                        <span className="font-medium">Avg Onboarding Time</span>
                                        <span className="text-blue-600 font-bold">14 days</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                        <span className="font-medium">Training Attendance</span>
                                        <span className="text-purple-600 font-bold">92%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                        <span className="font-medium">Feedback Score</span>
                                        <span className="text-orange-600 font-bold">4.2/5</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Training Metrics</CardTitle>
                                    <CardDescription>Training effectiveness</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span className="font-medium">Programs Completed</span>
                                        <span className="text-green-600 font-bold">{trainingEventsCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                        <span className="font-medium">Avg Participants</span>
                                        <span className="text-blue-600 font-bold">12</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                        <span className="font-medium">Success Rate</span>
                                        <span className="text-purple-600 font-bold">88%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                        <span className="font-medium">Certification Rate</span>
                                        <span className="text-orange-600 font-bold">76%</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="modules" className="space-y-6">
                        <HRMSModulesOverview modules={onboardingModules} title="Onboarding & Training Modules" />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}

export default OnboardingTrainingDashboard
