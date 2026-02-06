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
    FileText,
    DollarSign,
    Gift,
    CheckCircle,
    BarChart3,
    PieChart as PieChartIcon,
} from "lucide-react"
import { useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk'
import { taxBenefitsModules } from "@/components/hrms/WorkflowTree"
import DashboardLayout from "@/components/common/DashboardLayout"

const TaxBenefitsDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState("overview")

    // Fetch counts for stats
    const { data: declarationsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Employee Tax Exemption Declaration',
        filters: { docstatus: 0 }
    })
    const { data: proofsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Employee Tax Exemption Proof Submission',
        filters: { docstatus: 1 }
    })
    const { data: benefitApplicationsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Employee Benefit Application',
        filters: { docstatus: 1 }
    })
    const { data: benefitClaimsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Employee Benefit Claim',
        filters: { docstatus: 0 }
    })

    // Fetch data for charts
    const { data: declarations } = useFrappeGetDocList("Employee Tax Exemption Declaration", {
        fields: ["name", "docstatus", "employee_name"],
        limit: 1000
    })

    const { data: benefitApplications } = useFrappeGetDocList("Employee Benefit Application", {
        fields: ["name", "docstatus", "employee_name"],
        limit: 1000
    })

    const declarationsCount = declarationsData?.message || 0
    const proofsCount = proofsData?.message || 0
    const benefitApplicationsCount = benefitApplicationsData?.message || 0
    const benefitClaimsCount = benefitClaimsData?.message || 0

    // Prepare chart data
    const declarationStatusData = declarations?.reduce((acc: any, curr) => {
        const status = curr.docstatus === 0 ? "Draft" : curr.docstatus === 1 ? "Submitted" : "Cancelled"
        acc[status] = (acc[status] || 0) + 1
        return acc
    }, {})

    const chartDataDeclarationStatus = Object.keys(declarationStatusData || {}).map(key => ({
        name: key,
        value: declarationStatusData[key]
    }))

    const benefitStatusData = benefitApplications?.reduce((acc: any, curr) => {
        const status = curr.docstatus === 0 ? "Draft" : curr.docstatus === 1 ? "Submitted" : "Cancelled"
        acc[status] = (acc[status] || 0) + 1
        return acc
    }, {})

    const chartDataBenefitStatus = Object.keys(benefitStatusData || {}).map(key => ({
        name: key,
        value: benefitStatusData[key]
    }))

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

    const stats = (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden rounded-lg p-4">
                <FileText className="absolute right-4 top-4 h-24 w-24 text-blue-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Draft Declarations</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 flex justify-between p-0">
                    <div className="flex-col items-baseline gap-2 w-full">
                        <div className="text-2xl font-bold text-blue-600">{declarationsCount}</div>
                        <p className="text-xs text-muted-foreground">Pending submission</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-lg p-4">
                <CheckCircle className="absolute right-4 top-4 h-24 w-24 text-green-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Submitted Proofs</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 flex justify-between p-0">
                    <div className="flex-col items-baseline gap-2 w-full">
                        <div className="text-2xl font-bold text-green-600">{proofsCount}</div>
                        <p className="text-xs text-muted-foreground">Verified proofs</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-lg p-4">
                <Gift className="absolute right-4 top-4 h-24 w-24 text-purple-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Benefit Applications</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-0">
                    <div className="text-2xl font-bold text-purple-600">{benefitApplicationsCount}</div>
                    <p className="text-xs text-muted-foreground">Active applications</p>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-lg p-4">
                <DollarSign className="absolute right-4 top-4 h-24 w-24 text-orange-500 opacity-10" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                    <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-0">
                    <div className="text-2xl font-bold text-orange-600">{benefitClaimsCount}</div>
                    <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DashboardLayout
            title="Tax & Benefits"
            subtitle="Manage employee tax exemptions and benefits"
            // FileText icon is used in header, but DashboardLayout expects an image src.
            // I'll omit it for now.
            stats={stats}
            modules={taxBenefitsModules}
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
                                    Tax Declaration Status
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
                                                data={chartDataDeclarationStatus}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            >
                                                {chartDataDeclarationStatus.map((_, index) => (
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
                                    Benefit Application Status
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
                                        <BarChart data={chartDataBenefitStatus}>
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
                                <CardTitle>Tax Metrics</CardTitle>
                                <CardDescription>Tax exemption statistics</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <span className="font-medium">Declaration Rate</span>
                                    <span className="text-green-600 font-bold">92%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="font-medium">Proof Submission Rate</span>
                                    <span className="text-blue-600 font-bold">85%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                    <span className="font-medium">Avg Tax Savings</span>
                                    <span className="text-purple-600 font-bold">₹45K/year</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                    <span className="font-medium">Compliance Rate</span>
                                    <span className="text-orange-600 font-bold">98%</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Benefit Metrics</CardTitle>
                                <CardDescription>Employee benefits overview</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <span className="font-medium">Active Benefits</span>
                                    <span className="text-green-600 font-bold">{benefitApplicationsCount}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="font-medium">Utilization Rate</span>
                                    <span className="text-blue-600 font-bold">76%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                    <span className="font-medium">Avg Benefit Value</span>
                                    <span className="text-purple-600 font-bold">₹12K/month</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                    <span className="font-medium">Claim Approval Rate</span>
                                    <span className="text-orange-600 font-bold">94%</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    )
}

export default TaxBenefitsDashboard
