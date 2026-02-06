import React from 'react';
import { WorkflowCard, type WorkflowStep } from "@/components/hrms/WorkflowCard";
import { Wallet, Receipt, CheckCircle } from 'lucide-react';
import { useFrappeGetCall } from 'frappe-react-sdk';

const ExpenseWorkflow = () => {
    // Fetch counts
    const { data: advancesData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Employee Advance',
    });

    const { data: expenseClaimsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Expense Claim',
    });

    const advancesCount = advancesData?.message || 0;
    const expenseClaimsCount = expenseClaimsData?.message || 0;

    const steps: WorkflowStep[] = [
        {
            step: 1,
            title: "Request Advance",
            description: "Request advance payment for expenses",
            doctype: "Employee Advance",
            action: "/hrms/employee-advances/new",
            completed: advancesCount > 0,
            count: advancesCount,
        },
        {
            step: 2,
            title: "Submit Expense Claim",
            description: "Submit expenses with receipts",
            doctype: "Expense Claim",
            action: "/hrms/expense-claims/new",
            completed: expenseClaimsCount > 0,
            count: expenseClaimsCount,
        },
        {
            step: 3,
            title: "Approval Process",
            description: "Get expenses approved by manager",
            doctype: "Expense Claim",
            action: "/hrms/expense-claims",
            dependency: "Expense Claim",
            completed: false,
        },
        {
            step: 4,
            title: "Reimbursement",
            description: "Receive reimbursement payment",
            doctype: "Expense Claim",
            action: "/hrms/expense-claims",
            dependency: "Expense Claim",
            completed: false,
        },
    ];

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Expense Management Workflow</h1>
                <p className="text-muted-foreground">
                    Manage employee advances and expense reimbursements
                </p>
            </div>

            <WorkflowCard
                title="Expense Management"
                description="Complete expense and advance workflow"
                icon={Wallet}
                color="bg-pink-100 text-pink-700"
                steps={steps}
                link="/hrms/expenses"
            />

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet className="h-5 w-5 text-pink-600" />
                        <h3 className="font-medium">Advances</h3>
                    </div>
                    <p className="text-2xl font-bold">{advancesCount}</p>
                </div>

                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Receipt className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium">Expense Claims</h3>
                    </div>
                    <p className="text-2xl font-bold">{expenseClaimsCount}</p>
                </div>

                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h3 className="font-medium">Pending Approval</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Check status</p>
                </div>
            </div>
        </div>
    );
};

export default ExpenseWorkflow;
