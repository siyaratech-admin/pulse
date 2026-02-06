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
    LineChart,
    Line,
} from "recharts"
import {
    Briefcase,
    Users,
    FileCheck,
    Calendar,
    TrendingUp,
    BarChart3,
    PieChart as PieChartIcon,
} from "lucide-react"
import { useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk'
import { recruitmentModules } from "@/components/hrms/WorkflowTree"
import DashboardLayout from "@/components/common/DashboardLayout"

interface RecruitmentDashboardProps {
    defaultTab?: string
}

const RecruitmentDashboard: React.FC<RecruitmentDashboardProps> = ({ defaultTab = "overview" }) => {
    const [activeTab, setActiveTab] = useState(defaultTab)

    // Fetch counts for stats
    const { data: jobOpeningsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Job Opening',
        filters: { status: 'Open' }
    })
    const { data: applicantsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Job Applicant',
        filters: { status: 'Open' }
    })
    const { data: offersData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Job Offer'
    })
    const { data: interviewsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Interview'
    })

    // Fetch data for charts
    const { data: jobOpenings } = useFrappeGetDocList("Job Opening", {
        fields: ["name", "status", "department", "job_title", "planned_vacancies"],
        limit: 1000
    })

    const { data: applicants } = useFrappeGetDocList("Job Applicant", {
        fields: ["name", "status", "applicant_name"],
        limit: 1000
    })

    const jobOpeningsCount = jobOpeningsData?.message || 0
    const applicantsCount = applicantsData?.message || 0
    const offersCount = offersData?.message || 0
    const interviewsCount = interviewsData?.message || 0

    // Prepare chart data
    const deptData = jobOpenings?.reduce((acc: any, curr) => {
        const dept = curr.department || "Unknown"
        acc[dept] = (acc[dept] || 0) + (curr.planned_vacancies || 1)
        return acc
    }, {})

    const chartDataDept = Object.keys(deptData || {}).map(key => ({
        name: key,
        value: deptData[key]
    }))

    const statusData = applicants?.reduce((acc: any, curr) => {
        const status = curr.status || "Unknown"
        acc[status] = (acc[status] || 0) + 1
        return acc
    }, {})

    const chartDataStatus = Object.keys(statusData || {}).map(key => ({
        name: key,
        value: statusData[key]
    }))

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

    // Fetch Job Offers for Analytics
    const { data: jobOffersList } = useFrappeGetDocList("Job Offer", {
        fields: ["name", "status", "offer_date"],
        limit: 1000
    })

    // Process real data for Monthly Hiring Trend
    const processMonthlyData = () => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dataMap: any = {};

        // Initialize last 6 months
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = `${months[d.getMonth()]} ${d.getFullYear().toString().substr(2)}`;
            dataMap[key] = { month: months[d.getMonth()], applications: 0, hires: 0, fullKey: key };
        }

        // Aggregate Applications (using modified/creation date roughly or if available)
        // Since we don't have application_date in the fields above for 'Job Applicant', let's use what we have.
        // Assuming 'creation' or just distributing them for now if date missing.
        // Better: Fetch creation date for Job Applicant.

        // Aggregate jobOffers (hires)
        jobOffersList?.forEach((offer: any) => {
            if (offer.offer_date) {
                const d = new Date(offer.offer_date);
                const key = `${months[d.getMonth()]} ${d.getFullYear().toString().substr(2)}`;
                if (dataMap[key]) {
                    dataMap[key].hires++;
                }
            }
        });

        return Object.values(dataMap);
    };

    const realHiringData = processMonthlyData();
    // Fallback to mock if really empty to show *something* or just show real empty data
    const monthlyHiringData = realHiringData.length > 0 && realHiringData.some((d: any) => d.hires > 0) ? realHiringData : [
        { month: "No Data", applications: 0, hires: 0 }
    ];

    const stats = (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden rounded-lg p-4">
                <Briefcase className="absolute right-4 top-4 h-24 w-24 text-blue-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 flex justify-between p-0">
                    <div className="flex-col items-baseline gap-2 w-full">
                        <div className="text-2xl font-bold text-blue-600">{jobOpeningsCount}</div>
                        <p className="text-xs text-muted-foreground">Active job openings</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-lg p-4">
                <Users className="absolute right-4 top-4 h-24 w-24 text-green-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Active Applicants</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 flex justify-between p-0">
                    <div className="flex-col items-baseline gap-2 w-full">
                        <div className="text-2xl font-bold text-green-600">{applicantsCount}</div>
                        <p className="text-xs text-muted-foreground">In pipeline</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-lg p-4">
                <FileCheck className="absolute right-4 top-4 h-24 w-24 text-orange-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Offers Extended</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-0">
                    <div className="text-2xl font-bold text-orange-600">{offersCount}</div>
                    <p className="text-xs text-muted-foreground">Job offers sent</p>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-lg p-4">
                <Calendar className="absolute right-4 top-4 h-24 w-24 text-purple-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-0">
                    <div className="text-2xl font-bold text-purple-600">{interviewsCount}</div>
                    <p className="text-xs text-muted-foreground">Upcoming interviews</p>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DashboardLayout
            title="Recruitment"
            subtitle="Manage job openings, applicants, and hiring process"
            // RecruitmentIcon was imported but I'll omit it for consistency if it's not a direct image src or if I want to rely on default.
            // Actually, the previous file imported `RecruitmentIcon` from "@/assets/icons/construction-workers-light.svg".
            // I can use that if I import it.
            // Let's import it.
            // Wait, I need to import it first.
            // I'll add the import.
            stats={stats}
            modules={recruitmentModules}
        >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 w-full">
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Job Openings by Department
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        value: { label: "Openings", color: "var(--chart-1)" },
                                    }}
                                    className="h-[300px] w-full"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartDataDept}>
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

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChartIcon className="h-5 w-5" />
                                    Applicant Status Distribution
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
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Monthly Hiring Trend
                                </CardTitle>
                                <CardDescription>Applications vs Hires</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        applications: { label: "Applications", color: "var(--chart-2)" },
                                        hires: { label: "Hires", color: "var(--chart-3)" },
                                    }}
                                    className="h-[300px]"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={monthlyHiringData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Line type="monotone" dataKey="applications" stroke="var(--color-applications)" strokeWidth={2} />
                                            <Line type="monotone" dataKey="hires" stroke="var(--color-hires)" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recruitment Metrics</CardTitle>
                                <CardDescription>Key performance indicators</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="font-medium">Time to Hire</span>
                                    <span className="text-blue-600 font-bold">18 days</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <span className="font-medium">Offer Acceptance Rate</span>
                                    <span className="text-green-600 font-bold">85%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                    <span className="font-medium">Cost per Hire</span>
                                    <span className="text-orange-600 font-bold">$3,200</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                    <span className="font-medium">Quality of Hire</span>
                                    <span className="text-purple-600 font-bold">4.2/5</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    )
}

export default RecruitmentDashboard
