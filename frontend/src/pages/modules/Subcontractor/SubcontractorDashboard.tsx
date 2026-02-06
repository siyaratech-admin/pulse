"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
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
} from "recharts"
import {
    AlertTriangle,
    TrendingUp,
    BarChart3,
    Briefcase,
    ClipboardCheck,
    Plus,
    LayoutGrid,
    Clock,
    ChevronRight,
    HardHat,
    Settings,
    Layers,
    DollarSign,
    FileText,
    Users,
    CheckCircle,
    XCircle,
    Activity,
    ArrowUpRight,
} from "lucide-react"
import { useFrappeGetDocList } from "frappe-react-sdk"
import DashboardLayout from "@/components/common/DashboardLayout"
import ConstructionWorkersLight from "@/assets/icons/construction-workers-light.svg"
import { subcontractorModules } from "@/components/hrms/WorkflowTree"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"

// Subcontractor module structure with updated colors
const subcontractorModulesStructure = [
    {
        id: 'subcontractor-management',
        label: 'Subcontractors',
        route: '/subcontractor/dashboard',
        icon: Briefcase,
        color: 'bg-blue-600 hover:bg-blue-700',
        gradient: 'from-blue-500 to-blue-600',
        borderColor: 'border-t-blue-500',
        children: [
            {
                id: 'sub-contractor',
                label: 'Sub Contractor',
                route: '/labour-management/sub-contractor',
                icon: Briefcase,
                doctype: 'Sub Contractor'
            },
            {
                id: 'sub-contractor-labour-rates',
                label: 'Labour Rates',
                route: '/subcontractor/sub-contractor-labour-rates',
                icon: TrendingUp,
                doctype: 'Sub Contractor Labour Rates'
            },
            {
                id: 'sub-contractor-workhead',
                label: 'Workhead',
                route: '/subcontractor/sub-contractor-workhead',
                icon: HardHat,
                doctype: 'Sub Contractor Workhead'
            },
            {
                id: 'subcontractor-work-order',
                label: 'Work Order',
                route: '/subcontractor/subcontractor-work-order',
                icon: ClipboardCheck,
                doctype: 'Subcontractor Work Order'
            },
            {
                id: 'work-order-type',
                label: 'Work Order Type',
                route: '/subcontractor/work-order-type',
                icon: Settings,
                doctype: 'Work Order Type'
            },
            {
                id: 'subwork',
                label: 'Sub Work',
                route: '/subcontractor/subwork',
                icon: Layers,
                doctype: 'Sub Work'
            }
        ]
    }
];

const SubcontractorDashboard: React.FC = () => {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("overview")

    // Fetch Subcontractors
    const { data: subcontractors, isLoading: loadingSubcontractors, error: errorSubcontractors } = useFrappeGetDocList("Sub Contractor", {
        fields: ["name", "sub_contractor_name", "status", "contact", "modified"],
        limit: 1000,
        orderBy: { field: "modified", order: "desc" }
    })

    // Fetch Work Orders
    const { data: workOrders, isLoading: loadingWorkOrders } = useFrappeGetDocList("Subcontractor Work Order", {
        fields: ["name", "subcontractor", "status", "total_amount", "work_order_date", "modified", "project"],
        limit: 1000,
        orderBy: { field: "modified", order: "desc" }
    })

    // Fetch Labour Rates
    const { data: labourRates } = useFrappeGetDocList("Sub Contractor Labour Rates", {
        fields: ["name", "sub_contractor", "rate", "modified"],
        limit: 100,
        orderBy: { field: "modified", order: "desc" }
    })

    // Fetch Workheads
    const { data: workheads } = useFrappeGetDocList("Sub Contractor Workhead", {
        fields: ["name", "workhead_name", "status", "modified"],
        limit: 100,
        orderBy: { field: "modified", order: "desc" }
    })

    // Fetch Sub Work
    const { data: subWorks } = useFrappeGetDocList("Sub Work", {
        fields: ["name", "project", "rcc_type", "net_rate", "modified"],
        limit: 100,
        orderBy: { field: "modified", order: "desc" }
    })

    // Debug logs
    console.log("Subcontractors data:", subcontractors)
    console.log("Work Orders data:", workOrders)
    console.log("Error in subcontractors:", errorSubcontractors)

    // Calculate statistics directly from fetched data
    const stats = useMemo(() => {
        const activeContractors = subcontractors?.filter(s => s.status === 'Active').length || 0
        const openOrders = workOrders?.filter(wo => wo.status === 'Open' || wo.status === 'In Progress').length || 0
        const pendingApprovals = workOrders?.filter(wo => wo.status === 'Pending' || wo.status === 'Draft').length || 0
        const totalBilled = workOrders?.reduce((sum, order) => {
            return sum + (order.total_amount || 0)
        }, 0) || 0
        const completedOrders = workOrders?.filter(order => order.status === 'Completed').length || 0
        const inProgressOrders = workOrders?.filter(order => order.status === 'In Progress' || order.status === 'Open').length || 0

        return {
            activeContractors,
            openOrders,
            pendingApprovals,
            totalBilled,
            completedOrders,
            inProgressOrders,
            totalSubcontractors: subcontractors?.length || 0,
            totalWorkOrders: workOrders?.length || 0
        }
    }, [subcontractors, workOrders])

    // Process monthly billing data from work orders
    const monthlyBillData = useMemo(() => {
        if (!workOrders || workOrders.length === 0) {
            return [
                { month: "Jan", amount: 0, orders: 0 },
                { month: "Feb", amount: 0, orders: 0 },
                { month: "Mar", amount: 0, orders: 0 },
                { month: "Apr", amount: 0, orders: 0 },
                { month: "May", amount: 0, orders: 0 },
                { month: "Jun", amount: 0, orders: 0 },
            ]
        }

        const monthlyData: { [key: string]: { amount: number; orders: number } } = {}
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        workOrders.forEach(order => {
            if (order.work_order_date) {
                const date = new Date(order.work_order_date)
                const monthKey = months[date.getMonth()]

                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = { amount: 0, orders: 0 }
                }

                monthlyData[monthKey].amount += order.total_amount || 0
                monthlyData[monthKey].orders += 1
            }
        })

        return months.map(month => ({
            month,
            amount: monthlyData[month]?.amount || 0,
            orders: monthlyData[month]?.orders || 0
        })).slice(0, 6)
    }, [workOrders])

    // Mock performance data (can be replaced with actual calculation)
    const performanceData = [
        { month: "Jan", score: 88 },
        { month: "Feb", score: 90 },
        { month: "Mar", score: 89 },
        { month: "Apr", score: 92 },
        { month: "May", score: 91 },
        { month: "Jun", score: 94 },
    ]

    // Quick action buttons
    const quickActions = [
        {
            label: "New Work Order",
            icon: Plus,
            action: () => navigate("/subcontractor/subcontractor-work-order/new"),
            variant: "default" as const,
            className: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30",
        },
        {
            label: "Add Subcontractor",
            icon: Users,
            action: () => navigate("/labour-management/sub-contractor"),
            variant: "outline" as const,
            badge: stats.activeContractors,
        },
        {
            label: "View Work Orders",
            icon: ClipboardCheck,
            action: () => navigate("/subcontractor/subcontractor-work-order"),
            variant: "outline" as const,
            badge: stats.openOrders,
        },
    ]

    const statsCards = (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Active Subcontractors Card */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-blue-500">
                <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-blue-600/5 group-hover:scale-110 transition-transform duration-500" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">
                        Active Subcontractors
                    </CardTitle>
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/40">
                        <Briefcase className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                        {stats.activeContractors}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Active contracts</p>
                </CardContent>
            </Card>

            {/* Open Work Orders Card */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-indigo-500">
                <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 group-hover:scale-110 transition-transform duration-500" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">
                        Open Work Orders
                    </CardTitle>
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/40">
                        <ClipboardCheck className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
                        {stats.openOrders}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">In progress</p>
                </CardContent>
            </Card>

            {/* Total Billed Card */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-green-500">
                <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-gradient-to-br from-green-500/10 to-green-600/5 group-hover:scale-110 transition-transform duration-500" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">
                        Total Billed (YTD)
                    </CardTitle>
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-md shadow-green-500/40">
                        <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                        ₹{(stats.totalBilled / 100000).toFixed(2)}L
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                        {stats.totalWorkOrders > 0 ? `${stats.totalWorkOrders} orders` : 'No orders yet'}
                    </p>
                </CardContent>
            </Card>

            {/* Pending Approvals Card */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-orange-500">
                <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-gradient-to-br from-orange-500/10 to-orange-600/5 group-hover:scale-110 transition-transform duration-500" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">
                        Pending Approvals
                    </CardTitle>
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/40">
                        <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                        {stats.pendingApprovals}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Work Orders/Bills</p>
                </CardContent>
            </Card>
        </div>
    )

    return (
        <DashboardLayout
            title="Subcontractor Management"
            subtitle="Manage subcontractors, work orders, and billing"
            icon={ConstructionWorkersLight}
            stats={statsCards}
        // modules={subcontractorModules}
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
                        </div>

                        {/* Summary Section */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">Subcontractor Overview</p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(), "EEEE, MMMM d, yyyy")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {stats.totalSubcontractors}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Total Contractors</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-indigo-600">{stats.openOrders}</p>
                                        <p className="text-xs text-muted-foreground">Active Orders</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
                                        <p className="text-xs text-muted-foreground">Completed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Module Navigation Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {subcontractorModulesStructure[0].children.map((module) => (
                        <Card
                            key={module.id}
                            className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-t-4 border-t-blue-500 cursor-pointer"
                            onClick={() => navigate(module.route)}
                        >
                            <div className="absolute right-0 top-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 opacity-10 group-hover:scale-110 transition-transform duration-500" />

                            <CardHeader className="relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                                        <module.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                </div>
                                <CardTitle className="text-lg font-bold">{module.label}</CardTitle>
                                <CardDescription className="text-xs">
                                    Manage {module.label.toLowerCase()}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="relative z-10">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-between hover:bg-blue-50"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        navigate(`${module.route}/new`)
                                    }}
                                >
                                    <span className="text-sm">Create New</span>
                                    <Plus className="h-4 w-4" />
                                </Button>
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
                        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 w-full">
                            <Card className="w-full min-w-0">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Monthly Billing & Orders
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={{
                                            amount: {
                                                label: "Billed Amount",
                                                color: "hsl(var(--chart-1))",
                                            },
                                            orders: {
                                                label: "Work Orders",
                                                color: "hsl(var(--chart-2))",
                                            },
                                        }}
                                        className="h-[300px] w-full"
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={monthlyBillData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis yAxisId="left" orientation="left" stroke="var(--chart-1)" />
                                                <YAxis yAxisId="right" orientation="right" stroke="var(--chart-2)" />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Bar
                                                    yAxisId="left"
                                                    dataKey="amount"
                                                    fill="var(--color-amount)"
                                                    name="Billed Amount"
                                                />
                                                <Bar
                                                    yAxisId="right"
                                                    dataKey="orders"
                                                    fill="var(--color-orders)"
                                                    name="Work Orders"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            <Card className="min-w-0">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Performance Score Trend
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={{
                                            score: {
                                                label: "Avg Performance",
                                                color: "hsl(var(--chart-3))",
                                            },
                                        }}
                                        className="h-[300px] w-full"
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={performanceData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis domain={[80, 100]} />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="score"
                                                    stroke="var(--color-score)"
                                                    strokeWidth={3}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6 mt-6">
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Work Order Status</CardTitle>
                                    <CardDescription>Current work order distribution</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                                        <span className="font-medium">In Progress</span>
                                        <span className="text-indigo-600 font-bold">{stats.inProgressOrders}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span className="font-medium">Completed</span>
                                        <span className="text-green-600 font-bold">{stats.completedOrders}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                        <span className="font-medium">Pending Approval</span>
                                        <span className="text-orange-600 font-bold">{stats.pendingApprovals}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Contractor Performance</CardTitle>
                                    <CardDescription>Overall contractor metrics</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span className="font-medium">Active Contractors</span>
                                        <span className="text-green-600 font-bold">{stats.activeContractors}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                        <span className="font-medium">Total Contractors</span>
                                        <span className="text-blue-600 font-bold">{stats.totalSubcontractors}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                        <span className="font-medium">Avg Performance</span>
                                        <span className="text-purple-600 font-bold">
                                            {stats.totalSubcontractors > 0 ? '91%' : 'N/A'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Financial Overview</CardTitle>
                                    <CardDescription>Billing and payment metrics</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span className="font-medium">Total Billed</span>
                                        <span className="text-green-600 font-bold">
                                            ₹{(stats.totalBilled / 100000).toFixed(2)}L
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                        <span className="font-medium">Average Order Value</span>
                                        <span className="text-blue-600 font-bold">
                                            ₹{stats.totalWorkOrders > 0
                                                ? ((stats.totalBilled / stats.totalWorkOrders) / 100000).toFixed(2)
                                                : 0}L
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                                        <span className="font-medium">Total Orders</span>
                                        <span className="text-indigo-600 font-bold">{stats.totalWorkOrders}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Work Distribution</CardTitle>
                                    <CardDescription>Work types and allocation</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                                        <span className="font-medium">Total Work Orders</span>
                                        <span className="text-indigo-600 font-bold">{stats.totalWorkOrders}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
                                        <span className="font-medium">Work Heads</span>
                                        <span className="text-cyan-600 font-bold">{workheads?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                                        <span className="font-medium">Sub Works</span>
                                        <span className="text-teal-600 font-bold">{subWorks?.length || 0}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="recent" className="space-y-6 mt-6">
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                            {/* Recent Subcontractors */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Briefcase className="h-5 w-5 text-blue-600" />
                                        Recent Subcontractors
                                    </CardTitle>
                                    <CardDescription>Latest contractor additions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {loadingSubcontractors ? (
                                            <p className="text-sm text-gray-500 text-center py-4">Loading...</p>
                                        ) : subcontractors && subcontractors.length > 0 ? (
                                            subcontractors.slice(0, 5).map((contractor) => (
                                                <div
                                                    key={contractor.name}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                                    onClick={() => navigate(`/app/sub-contractor/${contractor.name}`)}
                                                >
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            {contractor.sub_contractor_name || contractor.name}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            {contractor.contact || 'No contact'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {format(new Date(contractor.modified), "MMM dd, yyyy")}
                                                        </p>
                                                    </div>
                                                    <div
                                                        className={`px-2 py-1 rounded text-xs font-semibold ${contractor.status === 'Active'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                            }`}
                                                    >
                                                        {contractor.status || 'Unknown'}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-sm text-gray-500 font-medium">
                                                    No subcontractors found
                                                </p>
                                                {/* <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-3"
                                                    onClick={() => navigate("/app/sub-contractor/new")}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add First Subcontractor
                                                </Button> */}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Work Orders */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ClipboardCheck className="h-5 w-5 text-indigo-600" />
                                        Recent Work Orders
                                    </CardTitle>
                                    <CardDescription>Latest work order updates</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {loadingWorkOrders ? (
                                            <p className="text-sm text-gray-500 text-center py-4">Loading...</p>
                                        ) : workOrders && workOrders.length > 0 ? (
                                            workOrders.slice(0, 5).map((order) => (
                                                <div
                                                    key={order.name}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                                    onClick={() =>
                                                        navigate(`/subcontractor/subcontractor-work-order/${order.name}`)
                                                    }
                                                >
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            {order.name}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            {order.subcontractor || 'No contractor assigned'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {order.total_amount
                                                                ? `₹${(order.total_amount / 1000).toFixed(0)}K`
                                                                : '₹0'}{' '}
                                                            •{' '}
                                                            {format(new Date(order.modified), "MMM dd")}
                                                        </p>
                                                    </div>
                                                    <div
                                                        className={`px-2 py-1 rounded text-xs font-semibold ${order.status === 'Completed'
                                                            ? 'bg-green-100 text-green-700'
                                                            : order.status === 'Open' || order.status === 'In Progress'
                                                                ? 'bg-indigo-100 text-indigo-700'
                                                                : 'bg-orange-100 text-orange-700'
                                                            }`}
                                                    >
                                                        {order.status || 'Unknown'}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-sm text-gray-500 font-medium">
                                                    No work orders found
                                                </p>
                                                {/* <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-3"
                                                    onClick={() => navigate("/app/subcontractor-work-order/new")}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Create First Work Order
                                                </Button> */}
                                            </div>
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

export default SubcontractorDashboard