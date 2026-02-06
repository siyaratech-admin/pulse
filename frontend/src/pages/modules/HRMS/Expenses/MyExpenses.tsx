"use client"

import React from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    CreditCard,
    Plus,
    Clock,
    CheckCircle,
    XCircle,
    DollarSign,
    Receipt,
    FileText
} from "lucide-react"
import DashboardLayout from "@/components/common/DashboardLayout"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { format } from "date-fns"

const MyExpenses = () => {
    const navigate = useNavigate()

    // Fetch Expense Claims
    const { data: claims } = useFrappeGetDocList("Expense Claim", {
        fields: ["name", "posting_date", "total_claimed_amount", "approval_status", "total_sanctioned_amount"],
        orderBy: { field: "posting_date", order: "desc" },
        limit: 20
    })

    // Calculate Stats
    const stats = React.useMemo(() => {
        if (!claims) return { totalClaimed: 0, pending: 0, approved: 0 }
        return claims.reduce((acc: any, curr: any) => {
            acc.totalClaimed += curr.total_claimed_amount || 0
            if (curr.approval_status === "Draft" || curr.approval_status === "Submitted") acc.pending++
            if (curr.approval_status === "Approved") acc.approved++
            return acc
        }, { totalClaimed: 0, pending: 0, approved: 0 })
    }, [claims])

    return (
        <DashboardLayout
            title="My Expenses"
            subtitle="Manage your expense claims and reimbursements"
            hideSidebar={false}
        >
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Actions */}
                <div className="flex justify-end">
                    <Button onClick={() => navigate("/hrms/expense-claims/new")}>
                        <Plus className="mr-2 h-4 w-4" /> Claim Expense
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold text-blue-600">
                                ${stats.totalClaimed.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">Total Claimed</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                            <div className="text-xs text-muted-foreground">Pending Approval</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                            <div className="text-xs text-muted-foreground">Approved Claims</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Claims List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Claims</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 divide-y">
                        {claims?.map((claim: any) => (
                            <div key={claim.name} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/hrms/expense-claims/${claim.name}`)}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${claim.approval_status === 'Approved' ? 'bg-green-100 text-green-600' :
                                            claim.approval_status === 'Rejected' ? 'bg-red-100 text-red-600' :
                                                'bg-orange-100 text-orange-600'
                                        }`}>
                                        <Receipt className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-medium">{claim.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {format(new Date(claim.posting_date), "MMM d, yyyy")}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="font-bold text-sm">
                                        ${claim.total_claimed_amount?.toLocaleString()}
                                    </div>
                                    <Badge variant="outline" className={`
                                        ${claim.approval_status === 'Approved' ? 'text-green-600 border-green-200 bg-green-50' :
                                            claim.approval_status === 'Rejected' ? 'text-red-600 border-red-200 bg-red-50' :
                                                'text-orange-600 border-orange-200 bg-orange-50'}
                                    `}>
                                        {claim.approval_status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                        {(!claims || claims.length === 0) && (
                            <div className="p-8 text-center text-muted-foreground">
                                No expense claims found.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

export default MyExpenses
