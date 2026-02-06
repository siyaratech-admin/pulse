import React from 'react';
import { WorkflowCard, type WorkflowStep } from "@/components/hrms/WorkflowCard";
import { Users, Briefcase, FileText, UserCheck, UserPlus } from 'lucide-react';
import { useFrappeGetCall } from 'frappe-react-sdk';

const RecruitmentWorkflow = () => {
    // Fetch counts for each step
    const { data: jobOpeningsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Job Opening',
    });

    const { data: jobApplicantsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Job Applicant',
    });

    const { data: interviewsData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Interview',
    });

    const { data: jobOffersData } = useFrappeGetCall('frappe.client.get_count', {
        doctype: 'Job Offer',
    });

    const jobOpeningsCount = jobOpeningsData?.message || 0;
    const jobApplicantsCount = jobApplicantsData?.message || 0;
    const interviewsCount = interviewsData?.message || 0;
    const jobOffersCount = jobOffersData?.message || 0;

    const steps: WorkflowStep[] = [
        {
            step: 1,
            title: "Create Job Opening",
            description: "Define the position and requirements",
            doctype: "Job Opening",
            action: "/hrms/recruitment/job-openings/new",
            completed: jobOpeningsCount > 0,
            count: jobOpeningsCount,
        },
        {
            step: 2,
            title: "Receive Applications",
            description: "Review and manage job applicants",
            doctype: "Job Applicant",
            action: "/hrms/recruitment/job-applicants",
            dependency: "Job Opening",
            completed: jobApplicantsCount > 0,
            count: jobApplicantsCount,
        },
        {
            step: 3,
            title: "Conduct Interviews",
            description: "Schedule and conduct interviews",
            doctype: "Interview",
            action: "/hrms/recruitment/interviews",
            dependency: "Job Applicant",
            completed: interviewsCount > 0,
            count: interviewsCount,
        },
        {
            step: 4,
            title: "Make Job Offer",
            description: "Send offer to selected candidate",
            doctype: "Job Offer",
            action: "/hrms/recruitment/job-offers/new",
            dependency: "Job Applicant",
            completed: jobOffersCount > 0,
            count: jobOffersCount,
        },
        {
            step: 5,
            title: "Create Employee",
            description: "Onboard accepted candidate as employee",
            doctype: "Employee",
            action: "/hrms/employees/new",
            dependency: "Job Offer",
            completed: false,
        },
    ];

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Recruitment Workflow</h1>
                <p className="text-muted-foreground">
                    Complete guide to hiring new employees - from job opening to onboarding
                </p>
            </div>

            <WorkflowCard
                title="Recruitment Journey"
                description="Hire new employees step by step"
                icon={Users}
                color="bg-blue-100 text-blue-700"
                steps={steps}
                link="/hrms/recruitment"
            />

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium">Active Openings</h3>
                    </div>
                    <p className="text-2xl font-bold">{jobOpeningsCount}</p>
                </div>

                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        <h3 className="font-medium">Applications</h3>
                    </div>
                    <p className="text-2xl font-bold">{jobApplicantsCount}</p>
                </div>

                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="h-5 w-5 text-purple-600" />
                        <h3 className="font-medium">Offers Made</h3>
                    </div>
                    <p className="text-2xl font-bold">{jobOffersCount}</p>
                </div>
            </div>
        </div>
    );
};

export default RecruitmentWorkflow;
