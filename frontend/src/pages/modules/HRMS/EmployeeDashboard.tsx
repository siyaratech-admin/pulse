"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Calendar,
    Clock,
    CreditCard,
    FileText,
    LogOut,
    User,
    Briefcase,
    ChevronRight,
    MapPin,
    Activity,
    DollarSign,
    Loader2
} from "lucide-react"
import DashboardLayout from "@/components/common/DashboardLayout"
import { hrmsModules } from "@/components/hrms/WorkflowTree"
import { useFrappeGetCall, useFrappeAuth } from "frappe-react-sdk"

const EmployeeDashboard = () => {
    const navigate = useNavigate()
    const { currentUser } = useFrappeAuth()

    // Fetch dashboard data (mocking the API call structure from reference)
    const { data, isLoading, error } = useFrappeGetCall<any>(
        "kb_task.api.employee_leaderboard.get_employee_dashboard_data",
        { user_id: currentUser },
        `dashboard-data-${currentUser}`
    );

    const stats = data?.message?.stats || {};

    // Fallback/Mock stats if API fails or returns empty
    const displayStats = {
        total_points: stats.total_points || 0,
        rank: stats.rank || '-',
        pending_claims: '--',
        leave_balance: '--'
    }

    const quickLinks = [
        { title: "Mark Attendance", icon: Clock, href: "/hrms/attendance/mark", color: "text-secondary bg-secondary/10" },
        { title: "Apply Leave", icon: Calendar, href: "/hrms/leave-applications/new", color: "text-primary bg-primary/10" },
        { title: "Claim Expense", icon: DollarSign, href: "/hrms/expense-claims/new", color: "text-purple-600 bg-purple-50" },
        { title: "My Salary", icon: FileText, href: "/hrms/salary-slips/my-salary", color: "text-orange-600 bg-orange-50" },
    ]

    return (
        <DashboardLayout
            title="Employee Dashboard"
            subtitle={`Welcome back, ${currentUser || 'Employee'}`}
            hideSidebar={false}
            modules={hrmsModules}
        >
            <div className="space-y-6 max-w-6xl mx-auto pb-20 md:pb-0">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-t-4 border-t-secondary shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Energy Points</p>
                                <p className="text-2xl font-bold text-gray-900">{displayStats.total_points}</p>
                            </div>
                            <div className="p-3 bg-secondary/10 rounded-full">
                                <Activity className="w-6 h-6 text-secondary" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Rank</p>
                                <p className="text-2xl font-bold text-gray-900">#{displayStats.rank}</p>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Activity className="w-6 h-6 text-primary" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-t-4 border-t-purple-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Pending Claims</p>
                                <p className="text-2xl font-bold text-gray-900">{displayStats.pending_claims}</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-full">
                                <DollarSign className="w-6 h-6 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-t-4 border-t-orange-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Leave Balance</p>
                                <p className="text-2xl font-bold text-gray-900">{displayStats.leave_balance}</p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-full">
                                <Calendar className="w-6 h-6 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                        <Card>
                            <CardContent className="p-0 divide-y">
                                {/* Mock Data - Replace with real API call */}
                                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                                    No recent activity
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                        <Card>
                            <CardContent className="p-4 space-y-3">
                                {quickLinks.map((link, index) => (
                                    <button
                                        key={index}
                                        className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-colors text-left flex items-center ${link.color} hover:opacity-90`}
                                        onClick={() => navigate(link.href)}
                                    >
                                        <link.icon className="w-4 h-4 mr-3" />
                                        {link.title}
                                    </button>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default EmployeeDashboard
