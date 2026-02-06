import React from 'react';
import { useFrappeGetCall, useFrappeAuth, useFrappeGetDocList } from 'frappe-react-sdk';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2 } from 'lucide-react';

const EmployeeAdvanceList = () => {
    const { currentUser } = useFrappeAuth();

    // Fetch current employee
    const { data: employeeList, isLoading: employeeLoading } = useFrappeGetDocList('Employee', {
        filters: [['user_id', '=', currentUser || ""]],
        fields: ['name', 'employee_name', 'department', 'designation']
    });

    const employeeData = employeeList?.[0];

    // Fetch advances
    const { data: advances, isLoading: advancesLoading, error } = useFrappeGetDocList('Employee Advance', {
        filters: [['employee', '=', employeeData?.name]],
        fields: ['name', 'purpose', 'advance_amount', 'paid_amount', 'status', 'posting_date', 'currency'],
        orderBy: { field: 'posting_date', order: 'desc' }
    }, employeeData?.name ? undefined : null);

    const isLoading = employeeLoading || advancesLoading;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-green-500';
            case 'Unpaid': return 'bg-red-500';
            case 'Draft': return 'bg-gray-500';
            case 'Claimed': return 'bg-blue-500';
            case 'Returned': return 'bg-purple-500';
            default: return 'bg-yellow-500';
        }
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="text-red-500 p-10">Error loading advances: {error.message}</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Employee Advances</h1>
                <Link to="/hrms/advances/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Advance
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>My Advances</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Purpose</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Balance</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {advances?.map((adv: any) => (
                                <TableRow key={adv.name}>
                                    <TableCell className="font-medium">{adv.purpose}</TableCell>
                                    <TableCell>{adv.currency} {adv.paid_amount}</TableCell>
                                    <TableCell>{adv.currency} {adv.advance_amount}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(adv.status)}>
                                            {adv.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{adv.posting_date}</TableCell>
                                </TableRow>
                            ))}
                            {(!advances || advances.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        No employee advances found.
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

export default EmployeeAdvanceList;
