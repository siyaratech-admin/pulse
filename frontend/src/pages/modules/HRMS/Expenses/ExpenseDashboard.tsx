"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from "recharts"
import {
    Receipt,
    DollarSign,
    Truck,
    Clock,
    PieChart as PieChartIcon,
} from "lucide-react"
import { useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk'
import { expenseModules } from "@/components/hrms/WorkflowTree"
import DashboardLayout from "@/components/common/DashboardLayout"

const ExpenseDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState("overview")

    // Fetch counts for stats
    const { data: expenseClaimsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Expense Claim',
        filters: { approval_status: 'Draft' }
    })
    const { data: advancesData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Employee Advance',
        filters: { status: 'Unpaid' }
    })
    const { data: vehiclesData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Vehicle'
    })
    const { data: travelRequestsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Travel Request',
        filters: { docstatus: 0 }
    })

    // Fetch data for charts
    const { data: expenseClaims } = useFrappeGetDocList("Expense Claim", {
        fields: ["name", "approval_status", "total_claimed_amount", "expense_approver"],
        limit: 1000
    })

    const { data: vehicles } = useFrappeGetDocList("Vehicle", {
        fields: ["name", "vehicle_value", "location"],
        limit: 1000
    })

    const expenseClaimsCount = expenseClaimsData?.message || 0
    const advancesCount = advancesData?.message || 0
    const vehiclesCount = vehiclesData?.message || 0
    const travelRequestsCount = travelRequestsData?.message || 0

    // Prepare chart data
    const statusData = expenseClaims?.reduce((acc: any, curr) => {
        const status = curr.approval_status || "Unknown"
        acc[status] = (acc[status] || 0) + 1
        return acc
    }, {})

    const chartDataStatus = Object.keys(statusData || {}).map(key => ({
        name: key,
        value: statusData[key]
    }))

    const totalExpenses = expenseClaims?.reduce((sum, curr) => sum + (curr.total_claimed_amount || 0), 0) || 0

    const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6']

    const stats = (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden rounded-lg p-4">
                <Receipt className="absolute right-4 top-4 h-24 w-24 text-orange-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 flex justify-between p-0">
                    <div className="flex-col items-baseline gap-2 w-full">
                        <div className="text-2xl font-bold text-orange-600">{expenseClaimsCount}</div>
                        <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-lg p-4">
                <DollarSign className="absolute right-4 top-4 h-24 w-24 text-green-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Unpaid Advances</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 flex justify-between p-0">
                    <div className="flex-col items-baseline gap-2 w-full">
                        <div className="text-2xl font-bold text-green-600">{advancesCount}</div>
                        <p className="text-xs text-muted-foreground">Outstanding</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-lg p-4">
                <Truck className="absolute right-4 top-4 h-24 w-24 text-blue-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Fleet Vehicles</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-0">
                    <div className="text-2xl font-bold text-blue-600">{vehiclesCount}</div>
                    <p className="text-xs text-muted-foreground">Active vehicles</p>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-lg p-4">
                <Clock className="absolute right-4 top-4 h-24 w-24 text-purple-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Travel Requests</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-0">
                    <div className="text-2xl font-bold text-purple-600">{travelRequestsCount}</div>
                    <p className="text-xs text-muted-foreground">Pending approval</p>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DashboardLayout
            title="Expense & Fleet Management"
            subtitle="Manage employee expenses, advances, and fleet"
            // We don't have a direct icon import for Receipt as an image, using undefined or we can import one if available.
            // The original code used Receipt from lucide-react as a component in the header, not an image src.
            // DashboardLayout expects an image src for `icon`. I'll omit it for now or use a placeholder if needed.
            // Actually, I can check if there is an icon available.
            // The previous dashboards used imported SVGs.
            // Let's see if I can use one of the existing SVGs or just omit it.
            // I'll omit it for now to be safe, or use a generic one.
            stats={stats}
            modules={expenseModules}
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
                                    Expense Claim Status
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

                        <Card>
                            <CardHeader>
                                <CardTitle>Expense Summary</CardTitle>
                                <CardDescription>Total expenses overview</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                    <span className="font-medium">Total Claims</span>
                                    <span className="text-orange-600 font-bold">₹{(totalExpenses / 100000).toFixed(1)}L</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <span className="font-medium">Approved Claims</span>
                                    <span className="text-green-600 font-bold">{expenseClaims?.filter(e => e.approval_status === 'Approved').length || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="font-medium">Fleet Value</span>
                                    <span className="text-blue-600 font-bold">₹{((vehicles?.reduce((sum, v) => sum + (v.vehicle_value || 0), 0) || 0) / 100000).toFixed(1)}L</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                    <span className="font-medium">Active Vehicles</span>
                                    <span className="text-purple-600 font-bold">{vehiclesCount}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Expense Metrics</CardTitle>
                                <CardDescription>Key performance indicators</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <span className="font-medium">Avg Claim Amount</span>
                                    <span className="text-green-600 font-bold">₹{expenseClaims && expenseClaims.length > 0 ? (totalExpenses / expenseClaims.length).toFixed(0) : 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="font-medium">Approval Rate</span>
                                    <span className="text-blue-600 font-bold">87%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                    <span className="font-medium">Avg Processing Time</span>
                                    <span className="text-orange-600 font-bold">3.2 days</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                    <span className="font-medium">Rejection Rate</span>
                                    <span className="text-purple-600 font-bold">5%</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Fleet Metrics</CardTitle>
                                <CardDescription>Vehicle management</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <span className="font-medium">Vehicles in Use</span>
                                    <span className="text-green-600 font-bold">{vehiclesCount}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="font-medium">Avg Fuel Cost</span>
                                    <span className="text-blue-600 font-bold">₹8.5K/month</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                    <span className="font-medium">Maintenance Due</span>
                                    <span className="text-orange-600 font-bold">3</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                    <span className="font-medium">Avg Mileage</span>
                                    <span className="text-purple-600 font-bold">1,200 km/mo</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    )
}

export default ExpenseDashboard
