import React from 'react';
import { WorkflowCard, type WorkflowStep } from "@/components/hrms/WorkflowCard";
import { Banknote, FileSpreadsheet, CreditCard } from 'lucide-react';
import { useFrappeGetCall } from 'frappe-react-sdk';

const PayrollWorkflow = () => {
    // Fetch counts
    const { data: salaryStructuresData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Salary Structure',
    });

    const { data: salarySlipsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Salary Slip',
    });

    const salaryStructuresCount = salaryStructuresData?.message || 0;
    const salarySlipsCount = salarySlipsData?.message || 0;

    const steps: WorkflowStep[] = [
        {
            step: 1,
            title: "Create Salary Structure",
            description: "Define salary components and structure",
            doctype: "Salary Structure",
            action: "/hrms/payroll/salary-structures",
            completed: salaryStructuresCount > 0,
            count: salaryStructuresCount,
        },
        {
            step: 2,
            title: "Assign to Employees",
            description: "Assign salary structure to employees",
            doctype: "Salary Structure Assignment",
            action: "/hrms/payroll/salary-structure-assignments",
            dependency: "Salary Structure",
            completed: false,
        },
        {
            step: 3,
            title: "Generate Salary Slips",
            description: "Create monthly salary slips",
            doctype: "Salary Slip",
            action: "/hrms/payroll/salary-slips",
            dependency: "Salary Structure Assignment",
            completed: salarySlipsCount > 0,
            count: salarySlipsCount,
        },
        {
            step: 4,
            title: "Process Payment",
            description: "Submit and process payroll",
            doctype: "Payroll Entry",
            action: "/hrms/payroll/payroll-entries",
            dependency: "Salary Slip",
            completed: false,
        },
    ];

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Payroll Workflow</h1>
                <p className="text-muted-foreground">
                    Process monthly payroll from structure setup to payment
                </p>
            </div>

            <WorkflowCard
                title="Payroll Processing"
                description="Complete payroll cycle management"
                icon={Banknote}
                color="bg-orange-100 text-orange-700"
                steps={steps}
                link="/hrms/payroll"
            />

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <FileSpreadsheet className="h-5 w-5 text-orange-600" />
                        <h3 className="font-medium">Salary Structures</h3>
                    </div>
                    <p className="text-2xl font-bold">{salaryStructuresCount}</p>
                </div>

                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-5 w-5 text-green-600" />
                        <h3 className="font-medium">Salary Slips</h3>
                    </div>
                    <p className="text-2xl font-bold">{salarySlipsCount}</p>
                </div>

                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Banknote className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium">This Month</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Pending Processing</p>
                </div>
            </div>
        </div>
    );
};

export default PayrollWorkflow;
