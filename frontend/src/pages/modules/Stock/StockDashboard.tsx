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
} from "recharts"
import {
    TrendingUp,
    BarChart3,
    PieChart as PieChartIcon,
    Search,
    Package,
    AlertTriangle,
    TrendingDown,
    Warehouse as WarehouseIcon,
    FileText,
    Plus,
    ChevronRight,
    ShoppingCart,
    ClipboardList,
    PackageCheck,
    BoxesIcon,
    ArrowUpRight,
    Settings,
    ArrowDown,
    Receipt,
    Briefcase,
    Layers,
    CheckSquare,
    Activity,
    Filter,
    Download,
    Calendar,
    Clock,
    BarChart2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk'
import DashboardLayout from "@/components/common/DashboardLayout"
import { useNavigate } from "react-router-dom"
import { format, subMonths, eachMonthOfInterval } from "date-fns"

// Stock module structure
const stockModulesStructure = [
    {
        id: 'stock-transactions',
        label: 'Stock Transactions',
        // route: '/stock',
        icon: Package,
        color: 'bg-slate-600 hover:bg-slate-700',
        gradient: 'from-slate-500 to-slate-600',
        borderColor: 'border-t-slate-500',
        children: [
            { id: 'material-request', label: 'Material Request', route: '/stock/material-request', icon: FileText, doctype: 'Material Request' },
            { id: 'stock-entry', label: 'Stock Entry', route: '/stock/stock-entry', icon: ArrowDown, doctype: 'Stock Entry' },
            { id: 'purchase-receipt', label: 'Purchase Receipt', route: '/stock/purchase-receipt', icon: Receipt, doctype: 'Purchase Receipt' },
            { id: 'delivery-note', label: 'Delivery Note', route: '/stock/delivery-note', icon: FileText, doctype: 'Delivery Note' }
        ]
    },
    {
        id: 'stock-master',
        label: 'Stock Masters',
        // route: '/stock/masters',
        icon: Settings,
        color: 'bg-gray-600 hover:bg-gray-700',
        gradient: 'from-gray-500 to-gray-600',
        borderColor: 'border-t-gray-500',
        children: [
            { id: 'item', label: 'Item', route: '/stock/item', icon: Package, doctype: 'Item' },
            { id: 'warehouse', label: 'Warehouse', route: '/stock/warehouse', icon: Briefcase, doctype: 'Warehouse' },
            { id: 'item-group', label: 'Item Group', route: '/stock/item-group', icon: Layers, doctype: 'Item Group' },
            { id: 'stock-reconciliation', label: 'Stock Reconciliation', route: '/stock/stock-reconciliation', icon: CheckSquare, doctype: 'Stock Reconciliation' },
            { id: 'dmrc-report', label: 'DMRC Report', route: '/stock/dmrc-report', icon: FileText, doctype: 'DMRC Report' },
            { id: 'print-heading', label: 'Print Heading', route: '/stock/print-heading', icon: Settings, doctype: 'Print Heading' }
        ]
    }
];

// Stock Reports Configuration
const stockReports = [
    {
        id: 'stock-summary',
        name: 'Stock Summary',
        description: 'Overview of stock quantity and value by item',
        icon: BarChart2,
        reportName: 'Stock Balance',
        color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
        iconColor: 'text-blue-600',
    },
    {
        id: 'stock-ledger',
        name: 'Stock Ledger',
        description: 'Detailed stock movement transactions',
        icon: FileText,
        reportName: 'Stock Ledger',
        color: 'bg-green-50 hover:bg-green-100 border-green-200',
        iconColor: 'text-green-600',
    },
    {
        id: 'stock-balance',
        name: 'Stock Balance',
        description: 'Current stock balance by item and warehouse',
        icon: Package,
        reportName: 'Stock Balance',
        color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
        iconColor: 'text-purple-600',
    },
    {
        id: 'stock-ageing',
        name: 'Stock Ageing',
        description: 'Age-wise analysis of inventory',
        icon: Clock,
        reportName: 'Stock Ageing',
        color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
        iconColor: 'text-orange-600',
    },
    {
        id: 'stock-projected-qty',
        name: 'Stock Projected Quantity',
        description: 'Projected stock levels including pending orders',
        icon: TrendingUp,
        reportName: 'Stock Projected Qty',
        color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
        iconColor: 'text-indigo-600',
    },
    {
        id: 'item-wise-price',
        name: 'Item-wise Price List Rate',
        description: 'Price list rates for all items',
        icon: Receipt,
        reportName: 'Item-wise Price List Rate',
        color: 'bg-pink-50 hover:bg-pink-100 border-pink-200',
        iconColor: 'text-pink-600',
    },
    {
        id: 'warehouse-wise-stock',
        name: 'Warehouse-wise Stock Balance',
        description: 'Stock balance grouped by warehouse',
        icon: WarehouseIcon,
        reportName: 'Warehouse wise Stock Balance',
        color: 'bg-teal-50 hover:bg-teal-100 border-teal-200',
        iconColor: 'text-teal-600',
    },
    {
        id: 'stock-analytics',
        name: 'Stock Analytics',
        description: 'Advanced stock analysis and insights',
        icon: BarChart3,
        reportName: 'Stock Analytics',
        color: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200',
        iconColor: 'text-cyan-600',
    },
];

const StockDashboard: React.FC = () => {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("overview")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedWarehouse, setSelectedWarehouse] = useState("All")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [reportSearchTerm, setReportSearchTerm] = useState("")

    // Fetch counts for stats
    const { data: itemsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Item',
        filters: { disabled: 0 }
    })

    const { data: lowStockData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Bin'
    })

    const { data: materialRequestsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Material Request',
        filters: { status: 'Pending' }
    })

    const { data: warehouseCount } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Warehouse',
        filters: { disabled: 0 }
    })

    // Fetch data for charts and tables
    const { data: items } = useFrappeGetDocList("Item", {
        fields: ["name", "item_group", "disabled", "item_name", "stock_uom", "valuation_rate"],
        filters: [["disabled", "=", 0]],
        limit: 1000
    })

    const { data: stockLevels } = useFrappeGetDocList("Bin", {
        fields: ["item_code", "warehouse", "actual_qty", "projected_qty", "reserved_qty", "ordered_qty", "modified", "valuation_rate"],
        filters: [["actual_qty", ">", 0]],
        limit: 1000,
        orderBy: { field: "actual_qty", order: "desc" }
    })

    const { data: recentMaterialRequests } = useFrappeGetDocList("Material Request", {
        fields: ["name", "transaction_date", "status", "material_request_type"],
        limit: 10,
        orderBy: { field: "creation", order: "desc" }
    })

    const { data: stockEntries } = useFrappeGetDocList("Stock Entry", {
        fields: ["name", "stock_entry_type", "posting_date", "total_amount", "modified"],
        limit: 1000
    })

    const itemsCount = itemsData?.message || 0
    const lowStockCount = Math.floor((lowStockData?.message || 0) * 0.15) // Mock: 15% low stock
    const materialRequestsCount = materialRequestsData?.message || 0
    const warehousesCount = warehouseCount?.message || 0
    const stockValue = 2450000 // Mock value - can be calculated from valuation

    // Calculate additional metrics
    const { categoryDistribution, topMovingItems, warehouseUtilization } = useMemo(() => {
        if (!items || !stockLevels) {
            return { categoryDistribution: [], topMovingItems: [], warehouseUtilization: [] }
        }

        // Category distribution from real data
        const categoryCount = items.reduce((acc: any, curr) => {
            const group = curr.item_group || "Unknown"
            acc[group] = (acc[group] || 0) + 1
            return acc
        }, {})

        const categoryDistribution = Object.keys(categoryCount).slice(0, 8).map(key => ({
            name: key,
            value: categoryCount[key]
        }))

        // Top moving items (by quantity)
        const topMovingItems = stockLevels.slice(0, 10).map((item: any) => ({
            item_code: item.item_code,
            warehouse: item.warehouse,
            actual_qty: item.actual_qty,
            reserved_qty: item.reserved_qty || 0
        }))

        // Warehouse utilization from real data
        const warehouseStats = stockLevels.reduce((acc: any, curr: any) => {
            if (!acc[curr.warehouse]) {
                acc[curr.warehouse] = { total: 0, reserved: 0 }
            }
            acc[curr.warehouse].total += curr.actual_qty
            acc[curr.warehouse].reserved += curr.reserved_qty || 0
            return acc
        }, {})

        const warehouseUtilization = Object.keys(warehouseStats).slice(0, 6).map(wh => ({
            name: wh,
            total: warehouseStats[wh].total,
            reserved: warehouseStats[wh].reserved,
            available: warehouseStats[wh].total - warehouseStats[wh].reserved
        }))

        return { categoryDistribution, topMovingItems, warehouseUtilization }
    }, [items, stockLevels])

    const COLORS = ['#64748b', '#475569', '#334155', '#1e293b', '#0f172a', '#94a3b8', '#cbd5e1', '#e2e8f0']

    // Get unique warehouses and categories for filters
    const uniqueWarehouses = Array.from(new Set(stockLevels?.map((i: any) => i.warehouse) || []))
    const uniqueCategories = Array.from(new Set(items?.map((i: any) => i.item_group) || []))

    // Enhanced stock items table data with item details merged
    const stockItemsTableData = useMemo(() => {
        if (!stockLevels || !items) return []

        return stockLevels.map((stock: any) => {
            const itemDetails = items.find((item: any) => item.name === stock.item_code)
            return {
                item_code: stock.item_code,
                item_name: itemDetails?.item_name || stock.item_code,
                warehouse: stock.warehouse,
                category: itemDetails?.item_group || 'N/A',
                actual_qty: stock.actual_qty,
                reserved_qty: stock.reserved_qty || 0,
                projected_qty: stock.projected_qty || 0,
                ordered_qty: stock.ordered_qty || 0,
                available_qty: stock.actual_qty - (stock.reserved_qty || 0),
                stock_uom: itemDetails?.stock_uom || 'Nos',
                valuation_rate: stock.valuation_rate || itemDetails?.valuation_rate || 0,
                stock_value: (stock.actual_qty || 0) * (stock.valuation_rate || itemDetails?.valuation_rate || 0),
                modified: stock.modified
            }
        })
    }, [stockLevels, items])

    // Filter stock items
    const filteredStockItems = stockItemsTableData.filter((item: any) => {
        const matchesSearch = item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.warehouse.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesWarehouse = selectedWarehouse === "All" || item.warehouse === selectedWarehouse
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
        return matchesSearch && matchesWarehouse && matchesCategory
    })

    // Filter reports
    const filteredReports = stockReports.filter(report =>
        report.name.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(reportSearchTerm.toLowerCase())
    )

    // Get stock status badge
    const getStockStatusBadge = (availableQty: number, actualQty: number) => {
        const stockLevel = (availableQty / actualQty) * 100
        if (stockLevel >= 70) {
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Stock</Badge>
        } else if (stockLevel >= 30) {
            return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Low Stock</Badge>
        } else {
            return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Critical</Badge>
        }
    }

    // Get recent stock entries
    const recentStockEntries = useMemo(() => {
        if (!stockEntries) return []
        return [...stockEntries]
            .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
            .slice(0, 5)
    }, [stockEntries])

    // Quick action buttons
    const quickActions = [
        {
            label: "Material Request",
            icon: ClipboardList,
            action: () => navigate("/stock/material-request/new"),
            variant: "default" as const,
            className: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30",
        },
        {
            label: "Stock Entry",
            icon: PackageCheck,
            action: () => navigate("/stock/stock-entry"),
            variant: "outline" as const,
        },
        {
            label: "Purchase Receipt",
            icon: ShoppingCart,
            action: () => navigate("/stock/purchase-receipt"),
            variant: "outline" as const,
        },
    ]

    const stats = (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Items Card */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-blue-500">
                <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-blue-600/5 group-hover:scale-110 transition-transform duration-500" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">Total Items</CardTitle>
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/40">
                        <Package className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{itemsCount}</div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Active inventory items</p>
                </CardContent>
            </Card>

            {/* Low Stock Card */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-orange-500">
                <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-gradient-to-br from-orange-500/10 to-orange-600/5 group-hover:scale-110 transition-transform duration-500" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">Low Stock Alert</CardTitle>
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/40">
                        <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">{lowStockCount}</div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Below reorder level</p>
                </CardContent>
            </Card>

            {/* Pending Requests Card */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-green-500">
                <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-gradient-to-br from-green-500/10 to-green-600/5 group-hover:scale-110 transition-transform duration-500" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">Pending Requests</CardTitle>
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-md shadow-green-500/40">
                        <FileText className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">{materialRequestsCount}</div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Material requests</p>
                </CardContent>
            </Card>

            {/* Stock Value Card */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-purple-500">
                <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/10 to-purple-600/5 group-hover:scale-110 transition-transform duration-500" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">Stock Value</CardTitle>
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-md shadow-purple-500/40">
                        <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">₹{(stockValue / 100000).toFixed(1)}L</div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Total inventory value</p>
                </CardContent>
            </Card>
        </div>
    )

    return (
        <DashboardLayout
            title="Stock Management"
            subtitle="Track inventory, manage stock levels and warehouses"
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
                                        <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Stock Overview Summary */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">Stock Overview</p>
                                        <p className="text-xs text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">{warehousesCount}</p>
                                        <p className="text-xs text-muted-foreground">Warehouses</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">{stockLevels?.length || 0}</p>
                                        <p className="text-xs text-muted-foreground">Active Stock</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-purple-600">{itemsCount}</p>
                                        <p className="text-xs text-muted-foreground">Items</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Module Navigation Cards */}
                <div className="grid gap-6 md:grid-cols-2">
                    {stockModulesStructure.map((module) => (
                        <Card
                            key={module.id}
                            className={`relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-t-4 ${module.borderColor} cursor-pointer`}
                            onClick={() => navigate(module.route)}
                        >
                            <div className={`absolute right-0 top-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-gradient-to-br ${module.gradient} opacity-10 group-hover:scale-110 transition-transform duration-500`} />
                            <CardHeader className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${module.gradient} shadow-lg`}>
                                        <module.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                </div>
                                <CardTitle className="text-lg font-bold">{module.label}</CardTitle>
                                <CardDescription className="text-xs">{module.children.length} sub-modules available</CardDescription>
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
                    <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-gray-100 rounded-xl">
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
                        <TabsTrigger
                            value="recent"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-3 font-semibold transition-all"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Recent Activity
                        </TabsTrigger>
                        <TabsTrigger
                            value="reports"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-3 font-semibold transition-all"
                        >
                            <BarChart2 className="h-4 w-4 mr-2" />
                            Reports
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 mt-6">
                        <div className="grid gap-6 grid-cols-1">
                            {/* Charts Row */}
                            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                                {/* Warehouse Utilization Chart */}
                                <Card className="w-full">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                            <BarChart3 className="h-5 w-5 text-blue-600" />
                                            Warehouse Utilization
                                        </CardTitle>
                                        <CardDescription>Stock levels across warehouses</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {warehouseUtilization.length > 0 ? (
                                            <ChartContainer
                                                config={{
                                                    available: { label: "Available", color: "#22c55e" },
                                                    reserved: { label: "Reserved", color: "#f59e0b" },
                                                }}
                                                className="h-[280px] sm:h-[300px] w-full"
                                            >
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={warehouseUtilization}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                        <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                                                        <YAxis fontSize={11} tickLine={false} axisLine={false} />
                                                        <ChartTooltip content={<ChartTooltipContent />} />
                                                        <Bar dataKey="available" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                                                        <Bar dataKey="reserved" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </ChartContainer>
                                        ) : (
                                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">No warehouse data available</div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Category Distribution Pie Chart */}
                                <Card className="w-full">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                            <PieChartIcon className="h-5 w-5 text-purple-600" />
                                            Item Category Distribution
                                        </CardTitle>
                                        <CardDescription>Breakdown by item group</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {categoryDistribution.length > 0 ? (
                                            <ChartContainer
                                                config={{ value: { label: "Items", color: "var(--chart-1)" } }}
                                                className="h-[280px] sm:h-[300px] w-full"
                                            >
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={categoryDistribution}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                            outerRadius={window.innerWidth < 640 ? 80 : 100}
                                                            dataKey="value"
                                                        >
                                                            {categoryDistribution.map((_, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <ChartTooltip content={<ChartTooltipContent />} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </ChartContainer>
                                        ) : (
                                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">No category data available</div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Stock Items Registry Table */}
                            <Card className="w-full">
                                <CardHeader>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                                <Package className="h-5 w-5 text-blue-600" />
                                                Stock Items Registry
                                            </CardTitle>
                                            <CardDescription>
                                                Complete list of stock items and their current levels
                                                <span className="ml-2 font-semibold text-blue-600">{filteredStockItems.length} items</span>
                                            </CardDescription>
                                        </div>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Download className="h-4 w-4" />
                                            Export
                                        </Button>
                                    </div>

                                    {/* Filters */}
                                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search by item name, code, or location..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                            <SelectTrigger className="w-full sm:w-[200px]">
                                                <SelectValue placeholder="All Categories" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All">All Categories</SelectItem>
                                                {uniqueCategories.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                                            <SelectTrigger className="w-full sm:w-[200px]">
                                                <SelectValue placeholder="All Warehouses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All">All Warehouses</SelectItem>
                                                {uniqueWarehouses.map((wh) => (
                                                    <SelectItem key={wh} value={wh}>{wh}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg border overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-gray-50">
                                                        <TableHead className="font-semibold">Item Code</TableHead>
                                                        <TableHead className="font-semibold">Item Name</TableHead>
                                                        <TableHead className="font-semibold">Category</TableHead>
                                                        <TableHead className="font-semibold">Warehouse</TableHead>
                                                        <TableHead className="font-semibold text-right">Actual Qty</TableHead>
                                                        <TableHead className="font-semibold text-right">Reserved</TableHead>
                                                        <TableHead className="font-semibold text-right">Available</TableHead>
                                                        <TableHead className="font-semibold text-right">Value</TableHead>
                                                        <TableHead className="font-semibold">Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredStockItems.length > 0 ? (
                                                        filteredStockItems.map((item: any, idx: number) => (
                                                            <TableRow
                                                                key={`${item.item_code}-${item.warehouse}-${idx}`}
                                                                className="hover:bg-gray-50 cursor-pointer"
                                                                onClick={() => navigate(`/stock/item/${item.item_code}`)}
                                                            >
                                                                <TableCell className="font-medium text-blue-600">{item.item_code}</TableCell>
                                                                <TableCell className="max-w-[200px] truncate">{item.item_name}</TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline" className="text-xs">{item.category}</Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <WarehouseIcon className="h-3.5 w-3.5 text-gray-500" />
                                                                        <span className="text-sm">{item.warehouse}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right font-semibold">{item.actual_qty.toFixed(2)} {item.stock_uom}</TableCell>
                                                                <TableCell className="text-right text-orange-600">{item.reserved_qty.toFixed(2)}</TableCell>
                                                                <TableCell className="text-right text-green-600 font-semibold">{item.available_qty.toFixed(2)}</TableCell>
                                                                <TableCell className="text-right font-semibold">₹{item.stock_value.toLocaleString('en-IN')}</TableCell>
                                                                <TableCell>{getStockStatusBadge(item.available_qty, item.actual_qty)}</TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                                                No stock items found
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                    {filteredStockItems.length > 0 && (
                                        <div className="mt-4 text-sm text-muted-foreground">
                                            Showing {filteredStockItems.length} of {stockItemsTableData.length} items
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6 mt-6">
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Stock Performance</CardTitle>
                                    <CardDescription>Key inventory metrics</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span className="font-medium">Total Stock Items</span>
                                        <span className="text-green-600 font-bold">{stockLevels?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                        <span className="font-medium">Active Warehouses</span>
                                        <span className="text-blue-600 font-bold">{warehousesCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                        <span className="font-medium">Total Items</span>
                                        <span className="text-purple-600 font-bold">{itemsCount}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Request Status</CardTitle>
                                    <CardDescription>Material request overview</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                        <span className="font-medium">Pending Requests</span>
                                        <span className="text-orange-600 font-bold">{materialRequestsCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                        <span className="font-medium">Low Stock Items</span>
                                        <span className="text-red-600 font-bold">{lowStockCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                                        <span className="font-medium">Stock Value</span>
                                        <span className="text-teal-600 font-bold">₹{(stockValue / 100000).toFixed(1)}L</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="recent" className="space-y-6 mt-6">
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                            {/* Recent Material Requests */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        Recent Material Requests
                                    </CardTitle>
                                    <CardDescription>Latest material requests</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentMaterialRequests && recentMaterialRequests.length > 0 ? (
                                            recentMaterialRequests.map((mr) => (
                                                <div
                                                    key={mr.name}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                                >
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-800">{mr.name}</p>
                                                        <p className="text-xs text-gray-600">{mr.material_request_type || 'N/A'}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {mr.transaction_date ? format(new Date(mr.transaction_date), "MMM dd, yyyy") : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 text-center py-4">No recent requests</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Stock Entries */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PackageCheck className="h-5 w-5 text-green-600" />
                                        Recent Stock Entries
                                    </CardTitle>
                                    <CardDescription>Latest stock transactions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentStockEntries && recentStockEntries.length > 0 ? (
                                            recentStockEntries.map((entry) => (
                                                <div
                                                    key={entry.name}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                                    onClick={() => navigate(`/app/stock-entry/${entry.name}`)}
                                                >
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-800">{entry.name}</p>
                                                        <p className="text-xs text-gray-600">{entry.stock_entry_type || 'N/A'}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {entry.posting_date ? format(new Date(entry.posting_date), "MMM dd, yyyy") : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 text-center py-4">No recent entries</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                            <BarChart2 className="h-5 w-5 text-blue-600" />
                                            Stock Reports
                                        </CardTitle>
                                        <CardDescription>
                                            Access comprehensive stock and inventory reports
                                        </CardDescription>
                                    </div>
                                </div>

                                {/* Search Filter */}
                                <div className="mt-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search reports..."
                                            value={reportSearchTerm}
                                            onChange={(e) => setReportSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredReports.map((report) => (
                                        <Card
                                            key={report.id}
                                            className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${report.color}`}
                                            onClick={() => navigate(`/stock/reports/${encodeURIComponent(report.reportName)}`)}
                                        >
                                            <CardContent className="p-6">
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-3 rounded-lg bg-white ${report.iconColor}`}>
                                                        <report.icon className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 mb-1">{report.name}</h3>
                                                        <p className="text-xs text-gray-600">{report.description}</p>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {filteredReports.length === 0 && (
                                    <div className="text-center py-12">
                                        <BarChart2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 font-medium">No reports found</p>
                                        <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}

export default StockDashboard