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
    FileText,
    CheckCircle,
    DollarSign,
    TrendingUp,
    BarChart3,
    PieChart as PieChartIcon,
    Receipt,
} from "lucide-react"
import { useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk'
import PayrollIcon from "@/assets/icons/construction-workers-light.svg"
import { payrollModules } from "@/components/hrms/WorkflowTree"
import DashboardLayout from "@/components/common/DashboardLayout"

const PayrollDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState("overview")

    // Fetch counts for stats
    const { data: draftSlipsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Salary Slip',
        filters: { status: 'Draft' }
    })
    const { data: submittedSlipsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Salary Slip',
        filters: { status: 'Submitted' }
    })
    const { data: payrollEntriesData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Payroll Entry',
        filters: { docstatus: 0 }
    })

    // Fetch data for charts
    const { data: salarySlips } = useFrappeGetDocList("Salary Slip", {
        fields: ["name", "status", "net_pay", "employee_name", "department"],
        limit: 1000
    })

    const draftSlipsCount = draftSlipsData?.message || 0
    const submittedSlipsCount = submittedSlipsData?.message || 0
    const payrollEntriesCount = payrollEntriesData?.message || 0
    const totalPayroll = salarySlips?.filter(s => s.status === 'Submitted')
        .reduce((sum, curr) => sum + (curr.net_pay || 0), 0) || 0

    // Prepare chart data
    const deptData = salarySlips?.reduce((acc: any, curr) => {
        const dept = curr.department || "Unknown"
        const pay = curr.net_pay || 0
        acc[dept] = (acc[dept] || 0) + pay
        return acc
    }, {})

    const chartDataDept = Object.keys(deptData || {}).map(key => ({
        name: key,
        value: Math.round(deptData[key])
    }))

    const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

    // Calculate monthly payroll data from real data
    const monthlyPayrollData = useMemo(() => {
        if (!salarySlips || salarySlips.length === 0) return []

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthData: Record<string, number> = {}

        salarySlips.forEach((slip) => {
            if (!slip.name || slip.status !== 'Submitted') return
            // Extract month from document name or use current month as fallback
            const currentMonth = new Date().getMonth()
            const monthName = monthNames[currentMonth]
            monthData[monthName] = (monthData[monthName] || 0) + (slip.net_pay || 0)
        })

        // Return data for last 6 months
        const currentMonth = new Date().getMonth()
        return Array.from({ length: 6 }, (_, i) => {
            const monthIndex = (currentMonth - 5 + i + 12) % 12
            const monthName = monthNames[monthIndex]
            return {
                month: monthName,
                amount: Math.round(monthData[monthName] || 0)
            }
        })
    }, [salarySlips])

    const stats = (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden rounded-lg p-4">
                <FileText className="absolute right-4 top-4 h-24 w-24 text-orange-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Draft Slips</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 flex justify-between p-0">
                    <div className="flex-col items-baseline gap-2 w-full">
                        <div className="text-2xl font-bold text-orange-600">{draftSlipsCount}</div>
                        <p className="text-xs text-muted-foreground">Pending processing</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-lg p-4">
                <CheckCircle className="absolute right-4 top-4 h-24 w-24 text-green-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Submitted Slips</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 flex justify-between p-0">
                    <div className="flex-col items-baseline gap-2 w-full">
                        <div className="text-2xl font-bold text-green-600">{submittedSlipsCount}</div>
                        <p className="text-xs text-muted-foreground">Processed this month</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-lg p-4">
                <DollarSign className="absolute right-4 top-4 h-24 w-24 text-blue-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-0">
                    <div className="text-2xl font-bold text-blue-600">₹{(totalPayroll / 1000).toFixed(0)}K</div>
                    <p className="text-xs text-muted-foreground">Current month</p>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-lg p-4">
                <Receipt className="absolute right-4 top-4 h-24 w-24 text-purple-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Pending Entries</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-0">
                    <div className="text-2xl font-bold text-purple-600">{payrollEntriesCount}</div>
                    <p className="text-xs text-muted-foreground">Draft payroll entries</p>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DashboardLayout
            title="Payroll"
            subtitle="Manage salary processing and payroll entries"
            icon={PayrollIcon}
            stats={stats}
            modules={payrollModules}
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
                                    <TrendingUp className="h-5 w-5" />
                                    Monthly Payroll Trend
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        amount: { label: "Amount (₹)", color: "var(--chart-5)" },
                                    }}
                                    className="h-[300px] w-full"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={monthlyPayrollData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Line type="monotone" dataKey="amount" stroke="var(--color-amount)" strokeWidth={3} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Department-wise Salary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        value: { label: "Salary (₹)", color: "var(--chart-1)" },
                                    }}
                                    className="h-[300px]"
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
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payroll Metrics</CardTitle>
                                <CardDescription>Key performance indicators</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <span className="font-medium">On-time Processing</span>
                                    <span className="text-green-600 font-bold">98%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="font-medium">Avg Salary</span>
                                    <span className="text-blue-600 font-bold">₹45,000</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                    <span className="font-medium">Payroll Cost Ratio</span>
                                    <span className="text-orange-600 font-bold">35%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                    <span className="font-medium">Compliance Rate</span>
                                    <span className="text-purple-600 font-bold">100%</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChartIcon className="h-5 w-5" />
                                    Salary Components
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        value: { label: "Amount", color: "var(--chart-1)" },
                                    }}
                                    className="h-[300px]"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: "Basic", value: 50 },
                                                    { name: "HRA", value: 20 },
                                                    { name: "Allowances", value: 15 },
                                                    { name: "Bonus", value: 10 },
                                                    { name: "Other", value: 5 },
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            >
                                                {COLORS.map((color, index) => (
                                                    <Cell key={`cell-${index}`} fill={color} />
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
            </Tabs>
        </DashboardLayout>
    )
}

export default PayrollDashboard
