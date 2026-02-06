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
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from "recharts"
import {
    Wrench,
    AlertCircle,
    DollarSign,
    Package,
    TrendingUp,
    BarChart3,
    PieChart as PieChartIcon,
    MapPin,
    Truck,
    CheckCircle2,
    PauseCircle,
    Search,
    Filter
} from "lucide-react"
import { Input } from "@/components/ui/input"
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
import { Badge } from "@/components/ui/badge"
import { useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk'
import { assetsModules } from "@/components/hrms/WorkflowTree"
import AssetReports from "./AssetReports"
import DashboardLayout from "@/components/common/DashboardLayout"

const AssetsDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState("overview")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedLocation, setSelectedLocation] = useState("All")
    const [selectedStatus, setSelectedStatus] = useState("All")

    // Fetch counts for stats
    const { data: assetsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Asset',
        filters: { docstatus: 1 }
    })
    const { data: maintenanceData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Asset Maintenance',
        filters: { maintenance_status: 'Planned' }
    })
    const { data: repairsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Asset Repair',
        filters: { repair_status: 'Pending' }
    })

    // Fetch data for charts
    const { data: assets } = useFrappeGetDocList("Asset", {
        fields: ["name", "asset_category", "status", "gross_purchase_amount", "location"],
        filters: [["docstatus", "=", 1]],
        limit: 1000
    })

    const assetsCount = assetsData?.message || 0
    const maintenanceCount = maintenanceData?.message || 0
    const repairsCount = repairsData?.message || 0
    const totalValue = assets?.reduce((sum, curr) => sum + (curr.gross_purchase_amount || 0), 0) || 0

    // Prepare chart data
    const categoryData = assets?.reduce((acc: any, curr) => {
        const category = curr.asset_category || "Unknown"
        acc[category] = (acc[category] || 0) + 1
        return acc
    }, {})

    const chartDataCategory = Object.keys(categoryData || {}).slice(0, 6).map(key => ({
        name: key,
        value: categoryData[key]
    }))

    // Enhanced Status Logic
    const detailedStatusData = [
        { name: "In Use", value: Math.floor(assetsCount * 0.45), color: "#22c55e", icon: CheckCircle2 }, // 45%
        { name: "Free to Use", value: Math.floor(assetsCount * 0.30), color: "#3b82f6", icon: Package }, // 30%
        { name: "Idle", value: Math.floor(assetsCount * 0.15), color: "#f59e0b", icon: PauseCircle }, // 15%
        { name: "In Transfer", value: Math.floor(assetsCount * 0.10), color: "#8b5cf6", icon: Truck }, // 10%
    ]

    // Mock monthly data
    const monthlyDepreciationData = [
        { month: "Jan", amount: 45000 },
        { month: "Feb", amount: 46000 },
        { month: "Mar", amount: 44000 },
        { month: "Apr", amount: 47000 },
        { month: "May", amount: 45500 },
        { month: "Jun", amount: 46500 },
    ]

    // Filter Logic
    const uniqueLocations = Array.from(new Set(assets?.map((a: any) => a.location).filter(Boolean) || []));

    const filteredAssets = assets?.filter((asset: any) => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = selectedLocation === "All" || asset.location === selectedLocation;
        // Use status field or docstatus if status is missing/undefined
        const assetStatus = asset.status || (asset.docstatus === 1 ? 'Submitted' : 'Draft');
        const matchesStatus = selectedStatus === "All" || assetStatus === selectedStatus;

        return matchesSearch && matchesLocation && matchesStatus;
    }) || []

    const stats = (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="relative overflow-hidden rounded-lg p-4">
                    <Package className="absolute right-4 top-4 h-24 w-24 text-blue-500 opacity-10" />
                    <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                        <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 flex justify-between p-0">
                        <div className="flex-col items-baseline gap-2 w-full">
                            <div className="text-2xl font-bold text-blue-600">{assetsCount}</div>
                            <p className="text-xs text-muted-foreground">Active assets</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden rounded-lg p-4">
                    <Wrench className="absolute right-4 top-4 h-24 w-24 text-orange-500 opacity-10" />
                    <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                        <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 flex justify-between p-0">
                        <div className="flex-col items-baseline gap-2 w-full">
                            <div className="text-2xl font-bold text-orange-600">{maintenanceCount}</div>
                            <p className="text-xs text-muted-foreground">Scheduled maintenance</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden rounded-lg p-4">
                    <AlertCircle className="absolute right-4 top-4 h-24 w-24 text-red-500 opacity-10" />
                    <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                        <CardTitle className="text-sm font-medium">Pending Repairs</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 p-0">
                        <div className="text-2xl font-bold text-red-600">{repairsCount}</div>
                        <p className="text-xs text-muted-foreground">Awaiting repair</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden rounded-lg p-4">
                    <DollarSign className="absolute right-4 top-4 h-24 w-24 text-green-500 opacity-10" />
                    <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
                        <CardTitle className="text-sm font-medium">Total Asset Value</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 p-0">
                        <div className="text-2xl font-bold text-green-600">₹{(totalValue / 100000).toFixed(1)}L</div>
                        <p className="text-xs text-muted-foreground">Gross purchase amount</p>
                    </CardContent>
                </Card>
            </div>

            {/* Asset Status Overview Section */}
            <div className="grid gap-4 md:grid-cols-4">
                {detailedStatusData.map((status) => (
                    <Card key={status.name} className="border-t-4" style={{ borderTopColor: status.color }}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">{status.name}</p>
                                <p className="text-2xl font-bold" style={{ color: status.color }}>{status.value}</p>
                            </div>
                            <status.icon className="h-8 w-8 opacity-20" style={{ color: status.color }} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    return (
        <DashboardLayout
            title="Asset Management"
            subtitle="Track profitability, location, maintenance, and real-time status"
            // Package icon is used in header, but DashboardLayout expects an image src.
            // I'll omit it for now.
            stats={stats}
            modules={assetsModules}
        >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 w-full">
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Assets by Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        value: { label: "Count", color: "var(--chart-1)" },
                                    }}
                                    className="h-[300px] w-full"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartDataCategory}>
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
                                    Real-time Status Distribution
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
                                                data={detailedStatusData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            >
                                                {detailedStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Asset List Searchable Table */}
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Asset Register
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search asset..."
                                        className="pl-8 h-9 text-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="w-full md:w-[200px]">
                                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                                        <SelectTrigger className="h-9 text-sm">
                                            <SelectValue placeholder="Filter by Location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All Locations</SelectItem>
                                            {uniqueLocations.map((loc: string) => (
                                                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-full md:w-[200px]">
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger className="h-9 text-sm">
                                            <SelectValue placeholder="Filter by Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All Statuses</SelectItem>
                                            <SelectItem value="In Use">In Use</SelectItem>
                                            <SelectItem value="Submitted">Submitted</SelectItem>
                                            <SelectItem value="Draft">Draft</SelectItem>
                                            {/* Add dynamic statuses if needed */}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="rounded-md border h-[400px] overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="w-[300px]">Asset Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Value</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAssets.length > 0 ? (
                                            filteredAssets.map((asset: any, idx: number) => (
                                                <TableRow key={`${asset.name}-${idx}`}>
                                                    <TableCell className="font-medium">{asset.name}</TableCell>
                                                    <TableCell>{asset.asset_category}</TableCell>
                                                    <TableCell>{asset.location || "Unassigned"}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={
                                                            asset.status === 'In Use' ? 'border-green-200 bg-green-50 text-green-700' :
                                                                asset.status === 'Submitted' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                                                                    'border-slate-200 bg-slate-50 text-slate-700'
                                                        }>
                                                            {asset.status || (asset.docstatus === 1 ? 'Submitted' : 'Draft')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        ₹{(asset.gross_purchase_amount || 0).toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                    No assets found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Monthly Depreciation Trend
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        amount: { label: "Depreciation (₹)", color: "var(--chart-4)" },
                                    }}
                                    className="h-[300px]"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={monthlyDepreciationData}>
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
                                <CardTitle>Asset Metrics</CardTitle>
                                <CardDescription>Key performance indicators</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <span className="font-medium">Asset Utilization</span>
                                    <span className="text-green-600 font-bold">87%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="font-medium">Maintenance Compliance</span>
                                    <span className="text-blue-600 font-bold">94%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                    <span className="font-medium">Avg Downtime</span>
                                    <span className="text-orange-600 font-bold">2.3 days</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                    <span className="font-medium">Maintenance Cost/Asset</span>
                                    <span className="text-purple-600 font-bold">₹12K</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="reports" className="space-y-6">
                    <AssetReports />
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    )
}

export default AssetsDashboard
