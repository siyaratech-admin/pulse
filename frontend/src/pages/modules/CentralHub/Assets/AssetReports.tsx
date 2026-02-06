"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, BarChart3, FileText, PieChart, TrendingUp, Wrench, Activity } from "lucide-react"

const AssetReports: React.FC = () => {
    const navigate = useNavigate()

    const reports = [
        {
            name: "Asset Depreciation Ledger",
            icon: FileText,
            description: "View asset depreciation history and schedule",
            color: "text-blue-500",
            bg: "bg-blue-50",
        },
        {
            name: "Asset Depreciations and Balances",
            icon: BarChart3,
            description: "Current asset values and accumulated depreciation",
            color: "text-green-500",
            bg: "bg-green-50",
        },
        {
            name: "Asset Maintenance",
            icon: Wrench,
            description: "Track asset maintenance schedules and status",
            color: "text-orange-500",
            bg: "bg-orange-50",
        },
        {
            name: "Asset Activity",
            icon: Activity,
            description: "Log of all asset-related activities and movements",
            color: "text-purple-500",
            bg: "bg-purple-50",
        },
        {
            name: "Fixed Asset Register",
            icon: FileText,
            description: "Comprehensive register of all fixed assets",
            color: "text-indigo-500",
            bg: "bg-indigo-50",
        },
    ]

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Asset Reports</h1>
                <p className="text-muted-foreground">Analyze your assets with detailed reports</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {reports.map((report) => (
                    <Card
                        key={report.name}
                        className="group relative cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                        onClick={() => navigate(`/central-hub/assets/reports/${report.name}`)}
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

export default AssetReports
