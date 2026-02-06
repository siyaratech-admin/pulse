import React, { useState } from 'react';
import { useFrappeGetCall, useFrappeAuth, useFrappeGetDocList } from 'frappe-react-sdk';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2 } from 'lucide-react';

const AttendanceRequestList = () => {
    const { currentUser } = useFrappeAuth();
    const [page, setPage] = useState(1);

    // Fetch current employee
    // Fetch current employee
    const { data: employeeList } = useFrappeGetDocList('Employee', {
        filters: [['user_id', '=', currentUser || ""]],
        fields: ['name']
    });
    const employeeData = employeeList?.[0];

    // Fetch attendance requests
    const { data: requests, isLoading, error } = useFrappeGetDocList('Attendance Request', {
        filters: [['employee', '=', employeeData?.name]],
        fields: ['name', 'reason', 'from_date', 'to_date', 'docstatus', 'creation'],
        orderBy: { field: 'creation', order: 'desc' }
    }, employeeData?.name ? undefined : null);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-500';
            case 'Rejected': return 'bg-red-500';
            case 'Cancelled': return 'bg-gray-500';
            default: return 'bg-yellow-500';
        }
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="text-red-500 p-10">Error loading requests: {error.message}</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Attendance Requests</h1>
                <Link to="/hrms/attendance-requests/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Request
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>My Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reason</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created On</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests?.map((req: any) => (
                                <TableRow key={req.name}>
                                    <TableCell className="font-medium">{req.reason}</TableCell>
                                    <TableCell>
                                        {req.from_date === req.to_date
                                            ? req.from_date
                                            : `${req.from_date} to ${req.to_date}`}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(req.docstatus === 1 ? 'Approved' : req.docstatus === 2 ? 'Cancelled' : 'Open')}>
                                            {req.docstatus === 1 ? 'Approved' : req.docstatus === 2 ? 'Cancelled' : 'Open'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{req.creation.split(' ')[0]}</TableCell>
                                </TableRow>
                            ))}
                            {(!requests || requests.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                        No attendance requests found.
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

export default AttendanceRequestList;
