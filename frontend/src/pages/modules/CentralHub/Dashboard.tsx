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
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from "recharts"
import {
    Package,
    Warehouse,
    Wrench,
    TrendingUp,
    BarChart3,
    PieChart as PieChartIcon,
    Search,
    Plus,
    ChevronRight,
    ClipboardList,
    AlertCircle,
    Activity,
    Calendar,
    ArrowUpRight,
    Settings,
    Truck,
    CheckCircle2,
    FileText,
    ArrowDown,
    Users,
    Receipt,
    CheckSquare,
    Briefcase,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk'
import DashboardLayout from "@/components/common/DashboardLayout"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"

// Central Hub modules structure matching WorkflowTree
const centralHubModulesStructure = [
    {
        id: 'asset-management',
        label: 'Asset Management',
        // route: '/assets',
        icon: Briefcase,
        color: 'bg-amber-600 hover:bg-amber-700',
        gradient: '',
        borderColor: 'border-t-amber-500',
        iconBg: 'bg-amber-600',
        children: [
            {
                id: 'asset',
                label: 'Asset',
                route: '/assets/asset',
                icon: Package,
                doctype: 'Asset'
            },
            {
                id: 'asset-movement',
                label: 'Asset Movement',
                route: '/assets/asset-movement',
                icon: ArrowDown,
                doctype: 'Asset Movement'
            }
        ]
    },
    {
        id: 'asset-maintenance',
        label: 'Maintenance',
        // route: '/assets/maintenance',
        icon: Wrench,
        color: 'bg-yellow-600 hover:bg-yellow-700',
        gradient: '',
        borderColor: 'border-t-yellow-500',
        iconBg: 'bg-yellow-600',
        children: [
            {
                id: 'asset-maintenance',
                label: 'Asset Maintenance',
                route: '/assets/asset-maintenance',
                icon: Wrench,
                doctype: 'Asset Maintenance'
            },
            {
                id: 'asset-repair',
                label: 'Asset Repair',
                route: '/assets/asset-repair',
                icon: Wrench,
                doctype: 'Asset Repair'
            },
            {
                id: 'maintenance-team',
                label: 'Maintenance Team',
                route: '/assets/maintenance-team',
                icon: Users,
                doctype: 'Asset Maintenance Team'
            },
            {
                id: 'maintenance-log',
                label: 'Maintenance Log',
                route: '/assets/maintenance-log',
                icon: FileText,
                doctype: 'Asset Maintenance Log'
            }
        ]
    },
    {
        id: 'operations-compliance',
        label: 'Operations & Compliance',
        // route: '/assets/operations',
        icon: ClipboardList,
        color: 'bg-green-600 hover:bg-green-700',
        gradient: '',
        borderColor: 'border-t-green-500',
        iconBg: 'bg-green-600',
        children: [
            {
                id: 'asset-rent',
                label: 'KB Asset Rent',
                route: '/assets/asset-rent',
                icon: Receipt,
                doctype: 'Asset Rent'
            },
            {
                id: 'machinery-log',
                label: 'Machinery Resource',
                route: '/assets/machinery-resource-items',
                icon: ClipboardList,
                doctype: 'Machinery Resources'
            },
            {
                id: 'monthly-checklist',
                label: 'Monthly Checklist',
                route: '/assets/monthly-checklist',
                icon: CheckSquare,
                doctype: 'Monthly Checklist'
            },
            {
                id: 'weekly-checklist',
                label: 'Weekly Checklist',
                route: '/assets/weekly-checklist',
                icon: CheckSquare,
                doctype: 'Weekly Checklist'
            }
        ]
    }
];

const CentralHubDashboard: React.FC = () => {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("overview")
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [categoryFilter, setCategoryFilter] = useState("All")

    // Fetch counts for stats
    const { data: itemsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Item',
        filters: { disabled: 0 }
    })

    const { data: warehousesData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Warehouse',
        filters: { disabled: 0 }
    })

    const { data: assetsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Asset',
        filters: { docstatus: 1 }
    })

    const { data: pendingMaintenanceData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Asset Maintenance',
        filters: { maintenance_status: 'Planned' }
    })

    // Fetch data for charts and tables
    const { data: items } = useFrappeGetDocList("Item", {
        fields: ["name", "item_group", "disabled", "item_name"],
        filters: [["disabled", "=", 0]],
        limit: 1000
    })

    const { data: assets } = useFrappeGetDocList("Asset", {
        fields: [
            "name",
            "asset_name",
            "item_name",
            "asset_category",
            "location",
            "status",
            "purchase_date",
            "gross_purchase_amount",
            "custodian"
        ],
        filters: [["docstatus", "=", 1]],
        limit: 1000,
        orderBy: {
            field: "creation",
            order: "desc"
        }
    })

    const { data: assetMaintenance } = useFrappeGetDocList("Asset Maintenance", {
        fields: ["name", "asset_name", "maintenance_status", "next_due_date"],
        limit: 100,
        orderBy: {
            field: "next_due_date",
            order: "asc"
        }
    })

    const { data: assetMovements } = useFrappeGetDocList("Asset Movement", {
        fields: ["name", "asset", "transaction_date", "purpose"],
        limit: 50,
        orderBy: {
            field: "transaction_date",
            order: "desc"
        }
    })

    const itemsCount = itemsData?.message || 0
    const warehousesCount = warehousesData?.message || 0
    const assetsCount = assetsData?.message || 0
    const pendingMaintenanceCount = pendingMaintenanceData?.message || 0

    // Calculate asset metrics
    const assetMetrics = useMemo(() => {
        if (!assets) {
            return {
                totalValue: 0,
                activeAssets: 0,
                maintenanceRequired: 0,
                utilizationRate: 0
            }
        }

        const totalValue = assets.reduce((sum: number, asset: any) => {
            return sum + (parseFloat(asset.gross_purchase_amount) || 0)
        }, 0)

        const activeAssets = assets.filter((a: any) =>
            a.status === 'In Use' || a.status === 'Submitted'
        ).length

        const maintenanceRequired = assetMaintenance?.filter((m: any) =>
            m.maintenance_status === 'Planned' || m.maintenance_status === 'Overdue'
        ).length || 0

        const utilizationRate = assetsCount > 0 ? (activeAssets / assetsCount) * 100 : 0

        return {
            totalValue,
            activeAssets,
            maintenanceRequired,
            utilizationRate: Math.round(utilizationRate)
        }
    }, [assets, assetMaintenance, assetsCount])

    // Prepare chart data
    const { itemGroupData, assetCategoryData, assetStatusData, maintenanceTrendData } = useMemo(() => {
        const itemGroupCounts = items?.reduce((acc: any, curr) => {
            const group = curr.item_group || "Unknown"
            acc[group] = (acc[group] || 0) + 1
            return acc
        }, {}) || {}

        const itemGroupData = Object.keys(itemGroupCounts)
            .slice(0, 6)
            .map(key => ({
                name: key,
                value: itemGroupCounts[key]
            }))

        const assetCategoryCounts = assets?.reduce((acc: any, curr) => {
            const category = curr.asset_category || "Unknown"
            acc[category] = (acc[category] || 0) + 1
            return acc
        }, {}) || {}

        const assetCategoryData = Object.keys(assetCategoryCounts)
            .slice(0, 6)
            .map(key => ({
                name: key,
                value: assetCategoryCounts[key]
            }))

        const assetStatusCounts = assets?.reduce((acc: any, curr) => {
            const status = curr.status || "Unknown"
            acc[status] = (acc[status] || 0) + 1
            return acc
        }, {}) || {}

        const assetStatusData = Object.keys(assetStatusCounts).map(key => ({
            name: key,
            value: assetStatusCounts[key],
            color:
                key === 'In Use' ? '#22c55e' :
                    key === 'Available' ? '#9333ea' : // purple-600
                        key === 'Under Maintenance' ? '#f59e0b' :
                            key === 'Disposed' ? '#ef4444' : '#64748b'
        }))

        // Mock maintenance trend data
        const maintenanceTrendData = [
            { month: "Jan", planned: 12, completed: 10, overdue: 2 },
            { month: "Feb", planned: 15, completed: 13, overdue: 1 },
            { month: "Mar", planned: 10, completed: 9, overdue: 3 },
            { month: "Apr", planned: 18, completed: 15, overdue: 2 },
            { month: "May", planned: 14, completed: 12, overdue: 1 },
            { month: "Jun", planned: 16, completed: 14, overdue: 2 },
        ]

        return { itemGroupData, assetCategoryData, assetStatusData, maintenanceTrendData }
    }, [items, assets])

    const COLORS = ['#9333ea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b']

    // Get unique categories and statuses for filters
    const uniqueCategories = Array.from(new Set(assets?.map((a: any) => a.asset_category) || []))
    const uniqueStatuses = Array.from(new Set(assets?.map((a: any) => a.status) || []))

    // Filter assets based on search and filters
    const filteredAssets = assets?.filter((asset: any) => {
        const matchesSearch =
            (asset.asset_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (asset.item_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (asset.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (asset.location?.toLowerCase() || "").includes(searchTerm.toLowerCase())

        const matchesCategory = categoryFilter === "All" || asset.asset_category === categoryFilter
        const matchesStatus = statusFilter === "All" || asset.status === statusFilter

        return matchesSearch && matchesCategory && matchesStatus
    }) || []

    // Quick action buttons
    const quickActions = [
        {
            label: "New Asset",
            icon: Plus,
            action: () => navigate("/assets/asset/new"),
            variant: "default" as const,
            className: "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200",
        },
        {
            label: "Asset Movement",
            icon: Truck,
            action: () => navigate("/assets/asset-movement"),
            variant: "outline" as const,
        },
        {
            label: "Maintenance",
            icon: Wrench,
            action: () => navigate("/assets/asset-maintenance"),
            variant: "outline" as const,
            badge: pendingMaintenanceCount,
        },
        {
            label: "Asset Repair",
            icon: Settings,
            action: () => navigate("/assets/asset-repair"),
            variant: "outline" as const,
        },
    ]

    const stats = (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Assets Card */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-purple-500">
                <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-purple-50/50 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">Total Assets</CardTitle>
                    <div className="p-2.5 rounded-xl bg-purple-600 shadow-md shadow-purple-200">
                        <Package className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-purple-700">
                        {assetsCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Company assets</p>
                </CardContent>
            </Card>

            {/* Active Assets Card */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-green-500">
                <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-green-50/50 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">Active Assets</CardTitle>
                    <div className="p-2.5 rounded-xl bg-green-600 shadow-md shadow-green-200">
                        <Activity className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-green-700">
                        {assetMetrics.activeAssets}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Currently in use</p>
                </CardContent>
            </Card>

            {/* Maintenance Required Card */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-orange-500">
                <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-orange-50/50 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">Maintenance Due</CardTitle>
                    <div className="p-2.5 rounded-xl bg-orange-600 shadow-md shadow-orange-200">
                        <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-orange-700">
                        {pendingMaintenanceCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Pending maintenance</p>
                </CardContent>
            </Card>

            {/* Asset Value Card */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-cyan-500">
                <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-cyan-50/50 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">Total Value</CardTitle>
                    <div className="p-2.5 rounded-xl bg-cyan-600 shadow-md shadow-cyan-200">
                        <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-cyan-700">
                        ₹{(assetMetrics.totalValue / 100000).toFixed(1)}L
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Asset portfolio value</p>
                </CardContent>
            </Card>
        </div>
    )

    return (
        <DashboardLayout
            title="Central Hub"
            subtitle="Manage assets, maintenance, and operations for construction equipment"
            stats={stats}
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

                        {/* Today's Summary */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">Central Hub Overview</p>
                                        <p className="text-xs text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-purple-600">{assetsCount}</p>
                                        <p className="text-xs text-muted-foreground">Total Assets</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            {assetMetrics.activeAssets}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Active</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-orange-600">
                                            {pendingMaintenanceCount}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Pending</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Module Navigation Cards - Matching Planning Dashboard Style */}
                <div className="grid gap-6 md:grid-cols-3">
                    {centralHubModulesStructure.map((module) => (
                        <Card
                            key={module.id}
                            className={`relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-t-4 ${module.borderColor} cursor-pointer`}
                            onClick={() => navigate(module.route)}
                        >
                            <div className={`absolute right-0 top-0 -mr-12 -mt-12 h-40 w-40 rounded-full ${module.color.replace('hover:', '')} opacity-5 group-hover:scale-110 transition-transform duration-500`} />
                            <CardHeader className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${module.iconBg} shadow-lg`}>
                                        <module.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                </div>
                                <CardTitle className="text-lg font-bold">{module.label}</CardTitle>
                                <CardDescription className="text-xs">
                                    {module.children.length} sub-modules available
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="space-y-2">
                                    {module.children.map((child) => (
                                        <button
                                            key={child.id}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(child.route)
                                            }}
                                            className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group/item"
                                        >
                                            <div className="flex items-center gap-2">
                                                <child.icon className="h-4 w-4 text-gray-600" />
                                                <span className="text-sm font-medium text-gray-700">{child.label}</span>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover/item:translate-x-1 transition-transform" />
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Enhanced Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-gray-100 rounded-xl">
                        <TabsTrigger
                            value="overview"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-3 font-semibold transition-all"
                        >
                            <Package className="h-4 w-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="analytics"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-3 font-semibold transition-all"
                        >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 mt-6">
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 w-full">
                            {/* Asset Category Distribution */}
                            <Card className="w-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                                        <PieChartIcon className="h-5 w-5" />
                                        Asset Category Distribution
                                    </CardTitle>
                                    <CardDescription className="text-xs">Breakdown by asset type</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={{
                                            value: {
                                                label: "Count",
                                                color: "var(--chart-1)"
                                            }
                                        }}
                                        className="aspect-square md:aspect-auto h-[250px] md:h-[300px] w-full"
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={assetCategoryData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius="80%"
                                                    dataKey="value"
                                                    nameKey="name"
                                                    strokeWidth={5}
                                                >
                                                    {assetCategoryData.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <ChartTooltip
                                                    cursor={false}
                                                    content={<ChartTooltipContent hideLabel={false} />}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            {/* Asset Status Distribution */}
                            <Card className="w-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                                        <BarChart3 className="h-5 w-5" />
                                        Asset Status Overview
                                    </CardTitle>
                                    <CardDescription className="text-xs">Current status of all assets</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={{
                                            value: {
                                                label: "Count",
                                                color: "var(--chart-2)"
                                            }
                                        }}
                                        className="aspect-square md:aspect-auto h-[250px] md:h-[300px] w-full"
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={assetStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                                                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Bar dataKey="value" fill="currentColor" className="fill-purple-600" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Enhanced Asset Registry Table */}
                        <Card className="w-full shadow-md border-2">
                            <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Wrench className="h-6 w-6 text-purple-600" />
                                            Asset Registry
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Complete list of company assets and equipment
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary" className="text-sm px-3 py-1">
                                        {filteredAssets.length} assets
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row gap-4 mb-6">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by asset name, item, or location..."
                                            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors h-10"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full md:w-[200px]">
                                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                            <SelectTrigger className="h-10 bg-gray-50 border-gray-200">
                                                <SelectValue placeholder="Filter by Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All">All Categories</SelectItem>
                                                {uniqueCategories.map((cat: string) => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-full md:w-[200px]">
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="h-10 bg-gray-50 border-gray-200">
                                                <SelectValue placeholder="Filter by Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All">All Statuses</SelectItem>
                                                {uniqueStatuses.map((status: string) => (
                                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="h-[450px] overflow-auto">
                                        <Table>
                                            <TableHeader className="sticky top-0 z-10">
                                                <TableRow className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-100">
                                                    <TableHead className="font-bold text-slate-700 dark:text-slate-200">Asset ID</TableHead>
                                                    <TableHead className="font-bold text-slate-700 dark:text-slate-200">Asset Name</TableHead>
                                                    <TableHead className="font-bold text-slate-700 dark:text-slate-200">Item</TableHead>
                                                    <TableHead className="font-bold text-slate-700 dark:text-slate-200">Category</TableHead>
                                                    <TableHead className="font-bold text-slate-700 dark:text-slate-200">Location</TableHead>
                                                    <TableHead className="font-bold text-slate-700 dark:text-slate-200">Custodian</TableHead>
                                                    <TableHead className="text-right font-bold text-slate-700 dark:text-slate-200">Value</TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700 dark:text-slate-200">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredAssets.length > 0 ? (
                                                    filteredAssets.map((asset: any) => {
                                                        const statusConfig = {
                                                            'In Use': { variant: 'default', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: CheckCircle2 },
                                                            'Available': { variant: 'secondary', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300', icon: Package },
                                                            'Under Maintenance': { variant: 'secondary', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', icon: Wrench },
                                                            'Disposed': { variant: 'destructive', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', icon: AlertCircle },
                                                        }
                                                        const status = statusConfig[asset.status as keyof typeof statusConfig] || statusConfig['Available']
                                                        const StatusIcon = status.icon

                                                        return (
                                                            <TableRow
                                                                key={asset.name}
                                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                                                onClick={() => navigate(`/assets/asset/${asset.name}`)}
                                                            >
                                                                <TableCell className="font-semibold text-purple-600 dark:text-purple-400">
                                                                    {asset.name}
                                                                </TableCell>
                                                                <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                                                                    {asset.asset_name}
                                                                </TableCell>
                                                                <TableCell className="text-slate-600 dark:text-slate-300">
                                                                    {asset.item_name}
                                                                </TableCell>
                                                                <TableCell className="text-slate-600 dark:text-slate-300">
                                                                    <Badge variant="outline" className="font-normal">
                                                                        {asset.asset_category}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-slate-600 dark:text-slate-300">
                                                                    <div className="flex items-center gap-2">
                                                                        <Warehouse className="h-4 w-4 text-slate-400" />
                                                                        {asset.location || 'N/A'}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-slate-600 dark:text-slate-300">
                                                                    {asset.custodian || '-'}
                                                                </TableCell>
                                                                <TableCell className="text-right font-bold text-slate-900 dark:text-slate-100">
                                                                    ₹{parseFloat(asset.gross_purchase_amount || 0).toLocaleString('en-IN')}
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <Badge className={`gap-1 ${status.color}`}>
                                                                        <StatusIcon className="h-3 w-3" />
                                                                        {asset.status}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    })
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={8} className="h-32 text-center">
                                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                                <Package className="h-12 w-12 opacity-20" />
                                                                <p className="font-medium">No assets found</p>
                                                                <p className="text-sm">Try adjusting your search or filters</p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6 mt-6">
                        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 w-full">
                            {/* Maintenance Trend Chart */}
                            <Card className="w-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                        Maintenance Trends
                                    </CardTitle>
                                    <CardDescription className="text-xs">Monthly maintenance activities</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={{
                                            planned: { label: "Planned", color: "#3b82f6" },
                                            completed: { label: "Completed", color: "#22c55e" },
                                            overdue: { label: "Overdue", color: "#ef4444" },
                                        }}
                                        className="aspect-square md:aspect-auto h-[250px] md:h-[300px] w-full"
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={maintenanceTrendData}
                                                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                                                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="planned"
                                                    stroke="#3b82f6"
                                                    strokeWidth={2}
                                                    dot={{ r: 3 }}
                                                    activeDot={{ r: 5 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="completed"
                                                    stroke="#22c55e"
                                                    strokeWidth={2}
                                                    dot={{ r: 3 }}
                                                    activeDot={{ r: 5 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="overdue"
                                                    stroke="#ef4444"
                                                    strokeWidth={2}
                                                    dot={{ r: 3 }}
                                                    activeDot={{ r: 5 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            {/* Asset & Stock Metrics */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-sm md:text-base">Performance Metrics</CardTitle>
                                    <CardDescription className="text-xs">Key performance indicators</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                                    <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-900">
                                        <div>
                                            <span className="text-sm font-semibold text-green-900 dark:text-green-100">Asset Utilization</span>
                                            <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">Active usage rate</p>
                                        </div>
                                        <span className="text-2xl text-green-600 dark:text-green-400 font-bold">{assetMetrics.utilizationRate}%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-900">
                                        <div>
                                            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Maint. Compliance</span>
                                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">On-time rate</p>
                                        </div>
                                        <span className="text-2xl text-blue-600 dark:text-blue-400 font-bold">94%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border-2 border-orange-200 dark:border-orange-900">
                                        <div>
                                            <span className="text-sm font-semibold text-orange-900 dark:text-orange-100">Avg Downtime</span>
                                            <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">Per asset/month</p>
                                        </div>
                                        <span className="text-2xl text-orange-600 dark:text-orange-400 font-bold">2.3d</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border-2 border-purple-200 dark:border-purple-900">
                                        <div>
                                            <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">Asset ROI</span>
                                            <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">Return rate</p>
                                        </div>
                                        <span className="text-2xl text-purple-600 dark:text-purple-400 font-bold">18%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-950/20 rounded-lg border-2 border-slate-200 dark:border-slate-900">
                                        <div>
                                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Stock Accuracy</span>
                                            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">Inventory precision</p>
                                        </div>
                                        <span className="text-2xl text-slate-600 dark:text-slate-400 font-bold">97%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border-2 border-indigo-200 dark:border-indigo-900">
                                        <div>
                                            <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Movement Rate</span>
                                            <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">Asset transfers</p>
                                        </div>
                                        <span className="text-2xl text-indigo-600 dark:text-indigo-400 font-bold">4.2/mo</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Item Group Distribution */}
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Item Distribution by Group
                                </CardTitle>
                                <CardDescription>Inventory items categorized by group</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {itemGroupData.map((group) => (
                                        <div key={group.name} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                                    {group.name}
                                                </span>
                                                <span className="font-bold text-slate-900 dark:text-slate-100">
                                                    {group.value} items
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500 bg-blue-500"
                                                    style={{
                                                        width: `${(group.value / itemsCount) * 100}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}

export default CentralHubDashboard