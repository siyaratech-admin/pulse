"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Calendar,
    Plus,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronRight,
    Briefcase
} from "lucide-react"
import { StandardHeader } from "@/components/common/StandardHeader"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { format } from "date-fns"

const MyLeaves = () => {
    const navigate = useNavigate()

    // Fetch Leave Allocations (Balances)
    const { data: allocations } = useFrappeGetDocList("Leave Allocation", {
        fields: ["leave_type", "total_leaves_allocated", "new_leaves_allocated", "unused_leaves"],
        filters: [
            // ["employee", "=", "Current Employee ID"] // In real app
        ]
    })

    // Fetch Recent Leave Applications
    const { data: applications } = useFrappeGetDocList("Leave Application", {
        fields: ["name", "leave_type", "status", "from_date", "to_date", "total_leave_days"],
        orderBy: { field: "creation", order: "desc" },
        limit: 5
    })

    // Fetch Upcoming Holidays
    const { data: holidays } = useFrappeGetDocList("Holiday", {
        fields: ["holiday_date", "description"],
        filters: [
            ["holiday_date", ">=", format(new Date(), "yyyy-MM-dd")]
        ],
        orderBy: { field: "holiday_date", order: "asc" },
        limit: 3
    })

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <StandardHeader
                title="My Leaves"
                subtitle="Manage your leaves and view balances"
                showBack={true}
            />

            <div className="p-4 space-y-6 max-w-4xl mx-auto">
                {/* Actions */}
                <div className="flex justify-end">
                    <Button onClick={() => navigate("/employee/form/Leave Application/new")} className="shadow-sm">
                        <Plus className="mr-2 h-4 w-4" /> Request Leave
                    </Button>
                </div>

                {/* Leave Balances */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Leave Balances</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allocations?.map((allocation: any) => {
                            // Mock calculation for used leaves as API might not return it directly in all versions
                            const total = allocation.total_leaves_allocated || 0
                            const unused = allocation.unused_leaves || 0 // Assuming this field exists or needs calculation
                            const used = total - unused
                            const percentage = total > 0 ? (unused / total) * 100 : 0

                            return (
                                <Card key={allocation.name} className="border-none shadow-sm">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-slate-700">{allocation.leave_type}</span>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-primary">{unused}</span>
                                                <span className="text-xs text-muted-foreground"> / {total}</span>
                                            </div>
                                        </div>
                                        <Progress value={percentage} className="h-2" />
                                        <div className="text-xs text-muted-foreground text-right">
                                            {used} used
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                        {(!allocations || allocations.length === 0) && (
                            <div className="col-span-2 text-center py-8 text-muted-foreground bg-white rounded-lg border border-dashed text-sm">
                                No leave allocations found.
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Recent Applications */}
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recent Applications</h3>
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardContent className="p-0 divide-y">
                                {applications?.map((app: any) => (
                                    <div key={app.name} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer active:bg-slate-100" onClick={() => navigate(`/employee/form/Leave Application/${app.name}`)}>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full shrink-0 ${app.status === 'Approved' ? 'bg-green-100 text-green-600' :
                                                app.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                                                    'bg-orange-100 text-orange-600'
                                                }`}>
                                                {app.status === 'Approved' ? <CheckCircle className="h-4 w-4" /> :
                                                    app.status === 'Rejected' ? <XCircle className="h-4 w-4" /> :
                                                        <Clock className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm text-slate-800">{app.leave_type}</div>
                                                <div className="text-xs text-slate-500">
                                                    {format(new Date(app.from_date), "MMM d")} - {format(new Date(app.to_date), "MMM d")} · {app.total_leave_days} days
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={`
                                            ${app.status === 'Approved' ? 'text-green-600 border-green-200 bg-green-50' :
                                                app.status === 'Rejected' ? 'text-red-600 border-red-200 bg-red-50' :
                                                    'text-orange-600 border-orange-200 bg-orange-50'}
                                        `}>
                                            {app.status}
                                        </Badge>
                                    </div>
                                ))}
                                {(!applications || applications.length === 0) && (
                                    <div className="p-8 text-center text-muted-foreground text-sm">
                                        No recent leave applications.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Upcoming Holidays */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Upcoming Holidays</h3>
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardContent className="p-0 divide-y">
                                {holidays?.map((holiday: any, idx: number) => (
                                    <div key={idx} className="p-4 flex items-start gap-3">
                                        <div className="flex flex-col items-center justify-center bg-blue-50 text-blue-700 rounded-lg p-2 min-w-[3rem]">
                                            <span className="text-xs font-bold uppercase">{format(new Date(holiday.holiday_date), "MMM")}</span>
                                            <span className="text-lg font-bold">{format(new Date(holiday.holiday_date), "d")}</span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-slate-800">{holiday.description}</div>
                                            <div className="text-xs text-slate-500">{format(new Date(holiday.holiday_date), "EEEE")}</div>
                                        </div>
                                    </div>
                                ))}
                                {(!holidays || holidays.length === 0) && (
                                    <div className="p-8 text-center text-muted-foreground text-sm">
                                        No upcoming holidays.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MyLeaves
