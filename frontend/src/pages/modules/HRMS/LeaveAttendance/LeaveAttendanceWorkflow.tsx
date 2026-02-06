import React from 'react';
import { WorkflowCard, type WorkflowStep } from "@/components/hrms/WorkflowCard";
import { Calendar, Clock, CheckSquare } from 'lucide-react';
import { useFrappeGetCall } from 'frappe-react-sdk';

const LeaveAttendanceWorkflow = () => {
    // Fetch counts
    const { data: leaveAllocationsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Leave Allocation',
    });

    const { data: leaveApplicationsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Leave Application',
    });

    const { data: attendanceData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Attendance',
    });

    const leaveAllocationsCount = leaveAllocationsData?.message || 0;
    const leaveApplicationsCount = leaveApplicationsData?.message || 0;
    const attendanceCount = attendanceData?.message || 0;

    const steps: WorkflowStep[] = [
        {
            step: 1,
            title: "Allocate Leaves",
            description: "Set up annual leave allocation for employees",
            doctype: "Leave Allocation",
            action: "/hrms/leaves/leave-allocation",
            completed: leaveAllocationsCount > 0,
            count: leaveAllocationsCount,
        },
        {
            step: 2,
            title: "Apply for Leave",
            description: "Submit leave applications",
            doctype: "Leave Application",
            action: "/hrms/leave-applications/new",
            dependency: "Leave Allocation",
            completed: leaveApplicationsCount > 0,
            count: leaveApplicationsCount,
        },
        {
            step: 3,
            title: "Track Attendance",
            description: "Record daily attendance",
            doctype: "Attendance",
            action: "/hrms/attendance",
            completed: attendanceCount > 0,
            count: attendanceCount,
        },
    ];

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Leave & Attendance Workflow</h1>
                <p className="text-muted-foreground">
                    Manage employee leaves and track attendance
                </p>
            </div>

            <WorkflowCard
                title="Leave & Attendance"
                description="Complete leave and attendance management"
                icon={Calendar}
                color="bg-purple-100 text-purple-700"
                steps={steps}
                link="/hrms/attendance"
            />

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        <h3 className="font-medium">Leave Allocations</h3>
                    </div>
                    <p className="text-2xl font-bold">{leaveAllocationsCount}</p>
                </div>

                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium">Leave Applications</h3>
                    </div>
                    <p className="text-2xl font-bold">{leaveApplicationsCount}</p>
                </div>

                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckSquare className="h-5 w-5 text-green-600" />
                        <h3 className="font-medium">Attendance Records</h3>
                    </div>
                    <p className="text-2xl font-bold">{attendanceCount}</p>
                </div>
            </div>
        </div>
    );
};

export default LeaveAttendanceWorkflow;
