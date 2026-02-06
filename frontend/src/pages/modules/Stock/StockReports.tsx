"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, BarChart3, FileText, PieChart, TrendingUp } from "lucide-react"

const StockReports: React.FC = () => {
    const navigate = useNavigate()

    const reports = [
        {
            name: "Stock Ledger",
            icon: FileText,
            description: "View stock transactions and balance history",
            color: "text-blue-500",
            bg: "bg-blue-50",
        },
        {
            name: "Stock Balance",
            icon: BarChart3,
            description: "Current stock balance across warehouses",
            color: "text-green-500",
            bg: "bg-green-50",
        },
        {
            name: "Stock Projected Qty",
            icon: TrendingUp,
            description: "Projected quantity based on orders",
            color: "text-purple-500",
            bg: "bg-purple-50",
        },
        {
            name: "Total Stock Summary",
            icon: PieChart,
            description: "Summary of stock value and quantity",
            color: "text-orange-500",
            bg: "bg-orange-50",
        },
        {
            name: "Stock Ageing",
            icon: FileText,
            description: "Ageing analysis of stock items",
            color: "text-red-500",
            bg: "bg-red-50",
        },
        {
            name: "Item Price Stock",
            icon: FileText,
            description: "Stock valuation based on item prices",
            color: "text-indigo-500",
            bg: "bg-indigo-50",
        },
        {
            name: "Warehouse Wise Stock Balance",
            icon: BarChart3,
            description: "Stock balance grouped by warehouse",
            color: "text-teal-500",
            bg: "bg-teal-50",
        },
    ]

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Stock Reports</h1>
                <p className="text-muted-foreground">Analyze your inventory with detailed reports</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {reports.map((report) => (
                    <Card
                        key={report.name}
                        className="group relative cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                        onClick={() => navigate(`/stock/reports/${report.name}`)}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-medium">
                                {report.name}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${report.bg}`}>
                                <report.icon className={`h-5 w-5 ${report.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mt-2">
                                {report.description}
                            </p>
                            <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default StockReports
