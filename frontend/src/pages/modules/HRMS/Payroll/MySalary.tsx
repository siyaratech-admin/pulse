"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Download,
    FileText,
    DollarSign,
    Calendar,
    Eye
} from "lucide-react"
import DashboardLayout from "@/components/common/DashboardLayout"
import { useFrappeGetDocList, useFrappeGetCall } from "frappe-react-sdk"
import { format } from "date-fns"

const MySalary = () => {
    const navigate = useNavigate()

    // Fetch Salary Slips
    const { data: salarySlips } = useFrappeGetDocList("Salary Slip", {
        fields: ["name", "start_date", "end_date", "net_pay", "status", "month", "year"],
        orderBy: { field: "start_date", order: "desc" },
        limit: 12
    })

    const handleDownload = (name: string) => {
        // In a real app, this would trigger a PDF download
        // For now, we can just navigate to the detail view or show a toast
        window.open(`${import.meta.env.VITE_FRAPPE_URL}/api/method/frappe.utils.print_format.download_pdf?doctype=Salary%20Slip&name=${name}&format=Standard`, '_blank')
    }

    return (
        <DashboardLayout
            title="My Salary"
            subtitle="View and download your salary slips"
            hideSidebar={false}
        >
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Summary Card */}
                <Card className="bg-primary text-primary-foreground">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                        <div className="text-sm opacity-90">Last Month's Pay</div>
                        <div className="text-4xl font-bold">
                            ${salarySlips?.[0]?.net_pay?.toLocaleString() || "0"}
                        </div>
                        <div className="text-sm opacity-90">
                            {salarySlips?.[0] ? format(new Date(salarySlips[0].end_date), "MMMM yyyy") : "-"}
                        </div>
                    </CardContent>
                </Card>

                {/* Salary Slips List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Salary History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 divide-y">
                        {salarySlips?.map((slip: any) => (
                            <div key={slip.name} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4" onClick={() => navigate(`/hrms/salary-slips/${slip.name}`)}>
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="cursor-pointer">
                                        <div className="font-medium">
                                            {format(new Date(slip.start_date), "MMMM yyyy")}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {slip.name}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <div className="font-bold text-sm">
                                            ${slip.net_pay?.toLocaleString()}
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {slip.status}
                                        </Badge>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => navigate(`/hrms/salary-slips/${slip.name}`)}>
                                            <Eye className="h-4 w-4 text-gray-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDownload(slip.name)}>
                                            <Download className="h-4 w-4 text-gray-500" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!salarySlips || salarySlips.length === 0) && (
                            <div className="p-8 text-center text-muted-foreground">
                                No salary slips found.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

export default MySalary
