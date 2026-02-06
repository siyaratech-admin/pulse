import React from 'react';
import { useFrappeGetCall, useFrappeAuth, useFrappeGetDocList } from 'frappe-react-sdk';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from 'lucide-react';

const ShiftAssignmentList = () => {
    const { currentUser } = useFrappeAuth();

    // Fetch current employee
    const { data: employeeList, isLoading: employeeLoading } = useFrappeGetDocList('Employee', {
        filters: [['user_id', '=', currentUser || ""]],
        fields: ['name']
    });
    const employeeData = employeeList?.[0];

    // Fetch shifts
    const { data: shifts, isLoading: shiftsLoading, error } = useFrappeGetDocList('Shift Assignment', {
        filters: [['employee', '=', employeeData?.name], ['docstatus', '=', 1], ['status', '=', 'Active']],
        fields: ['name', 'shift_type', 'start_date', 'end_date'],
        orderBy: { field: 'start_date', order: 'desc' }
    }, employeeData?.name ? undefined : null);

    const isLoading = employeeLoading || shiftsLoading;

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="text-red-500 p-10">Error loading shifts: {error.message}</div>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">My Shifts</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Upcoming & Active Shifts</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Shift Type</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Timing</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shifts?.map((shift: any) => (
                                <TableRow key={shift.name}>
                                    <TableCell className="font-medium">{shift.shift_type}</TableCell>
                                    <TableCell>{shift.start_date}</TableCell>
                                    <TableCell>{shift.end_date || 'Ongoing'}</TableCell>
                                    <TableCell>
                                        -
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!shifts || shifts.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                        No shift assignments found.
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

export default ShiftAssignmentList;
