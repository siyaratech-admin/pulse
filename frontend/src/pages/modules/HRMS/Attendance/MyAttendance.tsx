"use client"

import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
    Clock,
    Calendar as CalendarIcon,
    User,
    ChevronLeft,
    ChevronRight,
    MapPin,
    AlertCircle
} from "lucide-react"
import DashboardLayout from "@/components/common/DashboardLayout"
import { attendanceModules } from "@/components/hrms/WorkflowTree"
import { useFrappeGetCall, useFrappeGetDocList } from "frappe-react-sdk"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns"

const MyAttendance = () => {
    const navigate = useNavigate()
    const [currentDate, setCurrentDate] = useState(new Date())

    // Fetch attendance for the current month
    const start = format(startOfMonth(currentDate), "yyyy-MM-dd")
    const end = format(endOfMonth(currentDate), "yyyy-MM-dd")

    const { data: attendanceList } = useFrappeGetDocList("Attendance", {
        fields: ["attendance_date", "status", "in_time", "out_time"],
        filters: [
            ["attendance_date", ">=", start],
            ["attendance_date", "<=", end],
            // ["employee", "=", "Current Employee ID"] // In real app, filter by logged in employee
        ],
        limit: 100
    })

    // Calculate stats
    const stats = useMemo(() => {
        if (!attendanceList) return { present: 0, absent: 0, leave: 0, late: 0 }
        return attendanceList.reduce((acc: any, curr: any) => {
            if (curr.status === "Present" || curr.status === "Work From Home") acc.present++
            else if (curr.status === "Absent") acc.absent++
            else if (curr.status === "On Leave") acc.leave++
            // Late logic would go here if data available
            return acc
        }, { present: 0, absent: 0, leave: 0, late: 0 })
    }, [attendanceList])

    // Custom Calendar Render
    const renderCalendar = () => {
        const days = eachDayOfInterval({
            start: startOfMonth(currentDate),
            end: endOfMonth(currentDate)
        })

        return (
            <div className="grid grid-cols-7 gap-2 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-xs font-medium text-gray-500 py-2">{day}</div>
                ))}
                {days.map((day, idx) => {
                    // Find attendance for this day
                    const record = attendanceList?.find((a: any) => isSameDay(new Date(a.attendance_date), day))
                    let statusColor = "bg-gray-50"
                    let statusText = ""

                    if (record) {
                        if (record.status === "Present") {
                            statusColor = "bg-green-100 text-green-700 border-green-200"
                            statusText = "P"
                        } else if (record.status === "Absent") {
                            statusColor = "bg-red-100 text-red-700 border-red-200"
                            statusText = "A"
                        } else if (record.status === "On Leave") {
                            statusColor = "bg-orange-100 text-orange-700 border-orange-200"
                            statusText = "L"
                        } else if (record.status === "Half Day") {
                            statusColor = "bg-yellow-100 text-yellow-700 border-yellow-200"
                            statusText = "HD"
                        }
                    }

                    return (
                        <div
                            key={idx}
                            className={`
                                aspect-square flex flex-col items-center justify-center rounded-lg border text-sm relative
                                ${statusColor}
                                ${isToday(day) ? "ring-2 ring-primary ring-offset-2" : ""}
                            `}
                        >
                            <span className="font-medium">{format(day, "d")}</span>
                            {statusText && <span className="text-[10px] font-bold mt-1">{statusText}</span>}
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <DashboardLayout
            title="My Attendance"
            subtitle="View your attendance history and stats"
            hideSidebar={false}
            modules={attendanceModules}
        >
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                            <div className="text-xs text-muted-foreground">Present</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                            <div className="text-xs text-muted-foreground">Absent</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold text-orange-600">{stats.leave}</div>
                            <div className="text-xs text-muted-foreground">On Leave</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                            <div className="text-xs text-muted-foreground">Late Entry</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Calendar Navigation */}
                <div className="flex items-center justify-between">
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-lg font-semibold">
                        {format(currentDate, "MMMM yyyy")}
                    </h2>
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Calendar Grid */}
                <Card>
                    <CardContent className="p-4">
                        {renderCalendar()}
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="w-full" onClick={() => navigate("/hrms/attendance-requests/new")}>
                        <Clock className="mr-2 h-4 w-4" /> Request Attendance Regularization
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => navigate("/hrms/attendance/shift-requests/new")}>
                        <CalendarIcon className="mr-2 h-4 w-4" /> Request Shift Change
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default MyAttendance
