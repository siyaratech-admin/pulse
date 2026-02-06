import React from 'react';
import { useFrappeGetCall, useFrappeAuth, useFrappeGetDocList } from 'frappe-react-sdk';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2 } from 'lucide-react';

const ExpenseClaimList = () => {
    const navigate = useNavigate();
    const { currentUser } = useFrappeAuth();

    // Fetch current employee
    // Fetch current employee
    const { data: employeeList } = useFrappeGetDocList('Employee', {
        filters: [['user_id', '=', currentUser || ""]],
        fields: ['name']
    });
    const employeeData = employeeList?.[0];

    // Fetch expense claims
    const { data: claims, isLoading, error } = useFrappeGetDocList('Expense Claim', {
        filters: [['employee', '=', employeeData?.name]],
        fields: ['name', 'posting_date', 'unique_claimed_amount', 'total_claimed_amount', 'status', 'approval_status'],
        orderBy: { field: 'posting_date', order: 'desc' }
    }, employeeData?.name ? undefined : null);

    const summary = null; // Summary API removed as it was likely custom and causing errors

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-500';
            case 'Rejected': return 'bg-red-500';
            case 'Draft': return 'bg-gray-500';
            default: return 'bg-yellow-500';
        }
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="text-red-500 p-10">Error loading claims: {error.message}</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Expense Claims</h1>
                <Link to="/hrms/expense-claims/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Claim
                    </Button>
                </Link>
            </div>

            {/* Summary section removed as API is unavailable */}

            <Card>
                <CardHeader>
                    <CardTitle>My Claims</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Posting Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Approval Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {claims?.map((claim: any) => (
                                <TableRow
                                    key={claim.name}
                                    onClick={() => navigate(`/hrms/expense-claims/${claim.name}`)}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                >
                                    <TableCell>{claim.posting_date}</TableCell>
                                    <TableCell className="font-medium">{claim.total_claimed_amount}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(claim.status)}>
                                            {claim.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {claim.approval_status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!claims || claims.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                        No expense claims found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default ExpenseClaimList;
