import React from 'react';
import { useFrappeGetCall, useFrappeGetDocList, useFrappeAuth } from 'frappe-react-sdk';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Eye } from 'lucide-react';

const SalarySlipList = () => {
    const navigate = useNavigate();
    const { currentUser } = useFrappeAuth();

    // Fetch current employee
    // Fetch current employee
    const { data: employeeList } = useFrappeGetDocList('Employee', {
        filters: [['user_id', '=', currentUser || ""]],
        fields: ['name']
    });
    const employeeData = employeeList?.[0];

    // Fetch salary slips
    const { data: salarySlips, isLoading, error } = useFrappeGetDocList('Salary Slip', {
        fields: ['name', 'month', 'year', 'net_pay', 'status', 'posting_date'],
        filters: [['employee', '=', employeeData?.name]],
        orderBy: { field: 'posting_date', order: 'desc' },
        limit: 20
    }, employeeData?.name ? undefined : null);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Submitted': return 'bg-green-500';
            case 'Draft': return 'bg-gray-500';
            case 'Cancelled': return 'bg-red-500';
            default: return 'bg-yellow-500';
        }
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="text-red-500 p-10">Error loading salary slips: {error.message}</div>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Salary Slips</h1>

            <Card>
                <CardHeader>
                    <CardTitle>My Salary Slips</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Month</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>Net Pay</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {salarySlips?.map((slip: any) => (
                                <TableRow
                                    key={slip.name}
                                    onClick={() => navigate(`/hrms/salary-slips/${slip.name}`)}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                >
                                    <TableCell className="font-medium">{slip.month}</TableCell>
                                    <TableCell>{slip.year}</TableCell>
                                    <TableCell>{slip.net_pay}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(slip.status)}>
                                            {slip.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Link to={`/hrms/salary-slips/${slip.name}`}>
                                            <Button variant="ghost" size="icon" title="View">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!salarySlips || salarySlips.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        No salary slips found.
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

export default SalarySlipList;
