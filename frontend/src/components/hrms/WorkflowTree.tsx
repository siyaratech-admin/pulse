import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFrappeGetCall } from 'frappe-react-sdk';
import {
    Users,
    Briefcase,
    FileText,
    UserCheck,
    UserPlus,
    Award,
    Calendar,
    Clock,
    Banknote,
    Receipt,
    CheckSquare,
    ClipboardList,
    TrendingUp,
    GraduationCap,
    Shield,
    DollarSign,
    FileSpreadsheet,
    Target,
    ArrowDown,
    Settings,
    Package,
    Layers,
    Wrench,
    Truck,
    Map,
    BookOpen,
    Zap,
    FileCheck,
    Calculator,
    Landmark,
    Warehouse,
    ChevronRight,
    LayoutDashboard,
    Ruler,
    Activity,
    BarChart3,
    HardHat,
    ClipboardCheck,
    Clipboard,
    CheckCircle,
    Plus,
    BarChart,
    ShoppingBag,
    MoveRight,
    Package2
} from 'lucide-react';
import { cn } from "@/lib/utils";

export interface WorkflowNode {
    id: string;
    label: string;
    route: string;
    icon: React.ReactNode;
    description?: string;
    count?: number;
    color?: string; // Tailwind class for background/border
    children?: WorkflowNode[];
    doctype?: string; // DocType to fetch count for
}

interface HRMSModulesOverviewProps {
    modules: WorkflowNode[];
    title: string;
}

const ModuleColumn: React.FC<{ module: WorkflowNode }> = ({ module }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-row items-center min-h-[60px]">
            {/* Left Module Card */}
            <Card
                className={cn(
                    "w-48 h-24 cursor-pointer transition-all hover:shadow-lg border-0 mr-4 relative z-10 flex-shrink-0",
                    "flex flex-col items-center justify-center text-white",
                    module.color || "bg-secondary"
                )}
                onClick={() => navigate(module.route)}
            >
                <CardContent className="p-4 flex flex-col items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                        {React.isValidElement(module.icon) && React.cloneElement(module.icon as React.ReactElement<any>, { className: "h-6 w-6 text-white" })}
                    </div>
                    <span className="font-bold text-sm text-center leading-tight">{module.label}</span>
                </CardContent>
            </Card>

            {/* Children Flow - Horizontal */}
            {module.children && module.children.length > 0 && (
                <div className="flex flex-row items-center gap-0">
                    {module.children.map((child) => (
                        <ModuleChildNode key={child.id} child={child} />
                    ))}
                </div>
            )}
        </div>
    );
};

const ModuleChildNode: React.FC<{ child: WorkflowNode }> = ({ child }) => {
    const navigate = useNavigate();
    const { data: countData } = useFrappeGetCall('frappe.client.get_count', { doctype: child.doctype }, child.doctype ? undefined : null);
    const count = child.count !== undefined ? child.count : (countData?.message || 0);

    return (
        <div className="flex flex-row items-center">
            {/* Arrow Right */}
            <div className="w-8 h-px bg-gray-200 relative flex items-center justify-center">
                <ChevronRight className="h-4 w-4 text-gray-300 absolute right-0" />
            </div>

            {/* Child Card */}
            <Card
                className="w-48 cursor-pointer transition-all hover:shadow-md border border-gray-200 bg-white mr-0 z-10"
                onClick={() => navigate(child.route)}
            >
                <CardContent className="p-3 flex items-center gap-3">
                    <div className={cn(
                        "p-1.5 rounded-md flex-shrink-0",
                        "bg-gray-50"
                    )}>
                        {React.isValidElement(child.icon) && React.cloneElement(child.icon as React.ReactElement<any>, { className: "h-4 w-4 text-gray-600" })}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-900 leading-tight">
                                {child.label}
                            </span>
                            {(child.doctype || child.count !== undefined) && (
                                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                    ({count})
                                </span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export const HRMSModulesOverview: React.FC<HRMSModulesOverviewProps> = ({ modules, title }) => {
    return (
        <div className="w-full overflow-x-auto pb-8">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Visualize and navigate all modules and their dependencies in one place.
                </p>
            </div>

            <div className="flex flex-col gap-6 px-4 min-w-max">
                {modules.map((module) => (
                    <ModuleColumn key={module.id} module={module} />
                ))}
            </div>
        </div>
    );
};

// HRMS Modules Data
export const hrmsModules: WorkflowNode[] = [
    {
        id: 'recruitment',
        label: 'Recruitment',
        route: '/hrms/recruitment',
        icon: <Briefcase />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'staffing-plan',
                label: 'Staffing Plan',
                route: '/hrms/recruitment/staffing-plan',
                icon: <Target />,
                doctype: 'Staffing Plan'
            },
            {
                id: 'job-opening',
                label: 'Job Opening',
                route: '/hrms/recruitment/job-openings',
                icon: <FileText />,
                doctype: 'Job Opening'
            },
            {
                id: 'job-applicant',
                label: 'Job Applicant',
                route: '/hrms/recruitment/job-applicants',
                icon: <Users />,
                doctype: 'Job Applicant'
            },
            {
                id: 'job-offer',
                label: 'Job Offer',
                route: '/hrms/recruitment/job-offers',
                icon: <FileText />,
                doctype: 'Job Offer'
            },
        ],
    },
    {
        id: 'employee-lifecycle',
        label: 'Employee Lifecycle',
        route: '/hrms/employee-lifecycle',
        icon: <UserPlus />,
        color: 'bg-primary hover:bg-primary/90',
        children: [
            {
                id: 'lifecycle-dashboard',
                label: 'Dashboard',
                route: '/hrms/employee-lifecycle',
                icon: <LayoutDashboard />
            },
            {
                id: 'onboarding-process',
                label: 'Onboarding',
                route: '/hrms/employee-lifecycle/onboarding',
                icon: <UserCheck />
            },
            {
                id: 'training',
                label: 'Training',
                route: '/hrms/employee-lifecycle/training',
                icon: <GraduationCap />
            },
            {
                id: 'grievance',
                label: 'Grievance',
                route: '/hrms/employee-lifecycle/grievance',
                icon: <Shield />
            },
            {
                id: 'lifecycle-reports',
                label: 'Reports',
                route: '/hrms/employee-lifecycle/reports',
                icon: <FileSpreadsheet />
            }
        ]
    },
    {
        id: 'attendance',
        label: 'Attendance',
        route: '/hrms/attendance',
        icon: <Clock />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'shift-type',
                label: 'Shift Type',
                route: '/hrms/attendance/shift-type',
                icon: <Clock />,
                doctype: 'Shift Type'
            },
            {
                id: 'shift-assignment',
                label: 'Shift Assignment',
                route: '/hrms/attendance/shift-assignment',
                icon: <ClipboardList />,
                doctype: 'Shift Assignment'
            },
            {
                id: 'attendance-request',
                label: 'Attendance Request',
                route: '/hrms/attendance-requests',
                icon: <FileText />,
                doctype: 'Attendance Request'
            },
        ],
    },
    {
        id: 'leaves',
        label: 'Leave Management',
        route: '/hrms/leaves',
        icon: <Calendar />,
        color: 'bg-primary hover:bg-primary/90',
        children: [
            {
                id: 'leave-type',
                label: 'Leave Type',
                route: '/hrms/leaves/leave-type',
                icon: <FileText />,
                doctype: 'Leave Type'
            },
            {
                id: 'leave-allocation',
                label: 'Leave Allocation',
                route: '/hrms/leaves/allocation',
                icon: <CheckSquare />,
                doctype: 'Leave Allocation'
            },
            {
                id: 'leave-application',
                label: 'Leave Application',
                route: '/hrms/leave-applications',
                icon: <Calendar />,
                doctype: 'Leave Application'
            },
        ],
    },
    {
        id: 'payroll',
        label: 'Payroll',
        route: '/hrms/payroll',
        icon: <Banknote />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'payroll-processing',
                label: 'Payroll Processing',
                route: '/hrms/payroll/processing',
                icon: <DollarSign />,
                children: [
                    {
                        id: 'salary-slip',
                        label: 'Salary Slip',
                        route: '/hrms/payroll/salary-slip',
                        icon: <FileText />,
                        doctype: 'Salary Slip'
                    },
                    {
                        id: 'payroll-entry',
                        label: 'Payroll Entry',
                        route: '/hrms/payroll/payroll-entry',
                        icon: <DollarSign />,
                        doctype: 'Payroll Entry'
                    },
                    {
                        id: 'additional-salary',
                        label: 'Additional Salary',
                        route: '/hrms/payroll/additional-salary',
                        icon: <DollarSign />,
                        doctype: 'Additional Salary'
                    },
                    {
                        id: 'employee-incentive',
                        label: 'Employee Incentive',
                        route: '/hrms/payroll/employee-incentive',
                        icon: <Award />,
                        doctype: 'Employee Incentive'
                    },
                    {
                        id: 'arrear',
                        label: 'Arrear',
                        route: '/hrms/payroll/arrear',
                        icon: <Banknote />,
                        doctype: 'Arrear'
                    },
                    {
                        id: 'payroll-correction',
                        label: 'Payroll Correction',
                        route: '/hrms/payroll/payroll-correction',
                        icon: <Wrench />,
                        doctype: 'Payroll Correction'
                    },
                    {
                        id: 'full-and-final-statement',
                        label: 'Full & Final',
                        route: '/hrms/payroll/full-and-final-statement',
                        icon: <FileText />,
                        doctype: 'Full and Final Statement'
                    },
                    {
                        id: 'gratuity',
                        label: 'Gratuity',
                        route: '/hrms/payroll/gratuity',
                        icon: <Award />,
                        doctype: 'Gratuity'
                    },
                    {
                        id: 'interest',
                        label: 'Interest',
                        route: '/hrms/payroll/interest',
                        icon: <TrendingUp />,
                        doctype: 'Interest'
                    }
                ]
            },
            {
                id: 'payroll-setup',
                label: 'Payroll Setup',
                route: '/hrms/payroll/setup',
                icon: <Settings />,
                children: [
                    {
                        id: 'salary-structure',
                        label: 'Salary Structure',
                        route: '/hrms/payroll/salary-structure',
                        icon: <FileSpreadsheet />,
                        doctype: 'Salary Structure'
                    },
                    {
                        id: 'salary-structure-assignment',
                        label: 'Structure Assignment',
                        route: '/hrms/payroll/salary-structure-assignment',
                        icon: <UserCheck />,
                        doctype: 'Salary Structure Assignment'
                    },
                    {
                        id: 'salary-component',
                        label: 'Salary Component',
                        route: '/hrms/payroll/salary-component',
                        icon: <FileText />,
                        doctype: 'Salary Component'
                    },
                    {
                        id: 'payroll-period',
                        label: 'Payroll Period',
                        route: '/hrms/payroll/payroll-period',
                        icon: <Calendar />,
                        doctype: 'Payroll Period'
                    },
                    {
                        id: 'income-tax-slab',
                        label: 'Income Tax Slab',
                        route: '/hrms/payroll/income-tax-slab',
                        icon: <FileText />,
                        doctype: 'Income Tax Slab'
                    },
                    {
                        id: 'employee-tax-exemption-declaration',
                        label: 'Tax Exemption Declaration',
                        route: '/hrms/payroll/employee-tax-exemption-declaration',
                        icon: <FileText />,
                        doctype: 'Employee Tax Exemption Declaration'
                    },
                    {
                        id: 'employee-tax-exemption-proof-submission',
                        label: 'Tax Proof Submission',
                        route: '/hrms/payroll/employee-tax-exemption-proof-submission',
                        icon: <FileCheck />,
                        doctype: 'Employee Tax Exemption Proof Submission'
                    },
                    {
                        id: 'employee-benefit-application',
                        label: 'Benefit Application',
                        route: '/hrms/payroll/employee-benefit-application',
                        icon: <FileText />,
                        doctype: 'Employee Benefit Application'
                    },
                    {
                        id: 'employee-benefit-claim',
                        label: 'Benefit Claim',
                        route: '/hrms/payroll/employee-benefit-claim',
                        icon: <Clock />,
                        doctype: 'Employee Benefit Claim'
                    },
                    {
                        id: 'employee-benefit-detail',
                        label: 'Benefit Detail',
                        route: '/hrms/payroll/employee-benefit-detail',
                        icon: <FileText />,
                        doctype: 'Employee Benefit Detail'
                    },
                    {
                        id: 'employee-benefit-ledger',
                        label: 'Benefit Ledger',
                        route: '/hrms/payroll/employee-benefit-ledger',
                        icon: <BookOpen />,
                        doctype: 'Employee Benefit Ledger'
                    },
                    {
                        id: 'employee-other-income',
                        label: 'Other Income',
                        route: '/hrms/payroll/employee-other-income',
                        icon: <DollarSign />,
                        doctype: 'Employee Other Income'
                    },
                    {
                        id: 'gratuity-rule',
                        label: 'Gratuity Rule',
                        route: '/hrms/payroll/gratuity-rule',
                        icon: <Ruler />,
                        doctype: 'Gratuity Rule'
                    },
                    {
                        id: 'payroll-settings',
                        label: 'Payroll Settings',
                        route: '/hrms/payroll/payroll-settings',
                        icon: <Settings />,
                        doctype: 'Payroll Settings'
                    }
                ]
            }
        ],
    },
    {
        id: 'expenses',
        label: 'Expenses',
        route: '/hrms/expenses',
        icon: <Receipt />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'expense-claim',
                label: 'Expense Claim',
                route: '/hrms/expense-claims',
                icon: <Receipt />,
                doctype: 'Expense Claim'
            },
            {
                id: 'employee-advance',
                label: 'Employee Advance',
                route: '/hrms/advances',
                icon: <DollarSign />,
                doctype: 'Employee Advance'
            },
        ],
    },
    {
        id: 'performance',
        label: 'Performance',
        route: '/hrms/performance',
        icon: <TrendingUp />,
        color: 'bg-primary hover:bg-primary/90',
        children: [
            {
                id: 'appraisal',
                label: 'Appraisal',
                route: '/hrms/performance/appraisal',
                icon: <Award />,
                doctype: 'Appraisal'
            },
            {
                id: 'goal',
                label: 'Goal',
                route: '/hrms/performance/goals',
                icon: <Target />,
                doctype: 'Goal'
            },
        ],
    },
];

export const recruitmentModules: WorkflowNode[] = [
    {
        id: 'recruitment-process',
        label: 'Recruitment Process',
        route: '/hrms/recruitment',
        icon: <Briefcase />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'job-opening',
                label: 'Job Opening',
                route: '/hrms/recruitment/job-openings',
                icon: <FileText />,
                doctype: 'Job Opening'
            },
            {
                id: 'job-applicant',
                label: 'Job Applicant',
                route: '/hrms/recruitment/job-applicants',
                icon: <Users />,
                doctype: 'Job Applicant'
            },
            {
                id: 'job-offer',
                label: 'Job Offer',
                route: '/hrms/recruitment/job-offers',
                icon: <FileText />,
                doctype: 'Job Offer'
            },
            {
                id: 'appointment-letter',
                label: 'Appointment Letter',
                route: '/hrms/recruitment/appointment-letters',
                icon: <FileText />,
                doctype: 'Appointment Letter'
            }
        ]
    },
    {
        id: 'recruitment-setup',
        label: 'Setup & Planning',
        route: '/hrms/recruitment/setup',
        icon: <Settings />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'staffing-plan',
                label: 'Staffing Plan',
                route: '/hrms/recruitment/staffing-plan',
                icon: <Target />,
                doctype: 'Staffing Plan'
            },
            {
                id: 'interview-type',
                label: 'Interview Type',
                route: '/hrms/recruitment/interview-type',
                icon: <Users />,
                doctype: 'Interview Type'
            },
            {
                id: 'job-applicant-source',
                label: 'Applicant Source',
                route: '/hrms/recruitment/job-applicant-source',
                icon: <Target />,
                doctype: 'Job Applicant Source'
            },
            {
                id: 'offer-term',
                label: 'Offer Term',
                route: '/hrms/recruitment/offer-term',
                icon: <FileText />,
                doctype: 'Offer Term'
            },
            {
                id: 'job-offer-term-template',
                label: 'Offer Term Template',
                route: '/hrms/recruitment/job-offer-term-template',
                icon: <FileText />,
                doctype: 'Job Offer Term Template'
            }
        ]
    }
];

export const employeeLifecycleModules: WorkflowNode[] = [
    {
        id: 'onboarding-process',
        label: 'Onboarding Process',
        route: '/hrms/employee-lifecycle/onboarding',
        icon: <UserCheck />,
        color: 'bg-primary hover:bg-primary/90',
        children: [
            {
                id: 'employee-onboarding',
                label: 'Employee Onboarding',
                route: '/hrms/onboarding/onboarding',
                icon: <UserPlus />,
                doctype: 'Employee Onboarding'
            },
            {
                id: 'onboarding-template',
                label: 'Onboarding Template',
                route: '/hrms/onboarding/template',
                icon: <FileText />,
                doctype: 'Employee Onboarding Template'
            },
            {
                id: 'employee-skill-map',
                label: 'Employee Skill Map',
                route: '/hrms/onboarding/skill-map',
                icon: <FileText />,
                doctype: 'Employee Skill Map'
            }
        ]
    },
    {
        id: 'training',
        label: 'Training',
        route: '/hrms/employee-lifecycle/training',
        icon: <GraduationCap />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'training-program',
                label: 'Training Program',
                route: '/hrms/training/program',
                icon: <BookOpen />,
                doctype: 'Training Program'
            },
            {
                id: 'training-event',
                label: 'Training Event',
                route: '/hrms/training/event',
                icon: <Calendar />,
                doctype: 'Training Event'
            },
            {
                id: 'training-result',
                label: 'Training Result',
                route: '/hrms/training/result',
                icon: <Award />,
                doctype: 'Training Result'
            },
            {
                id: 'training-feedback',
                label: 'Training Feedback',
                route: '/hrms/training/feedback',
                icon: <FileText />,
                doctype: 'Training Feedback'
            }
        ]
    },
    {
        id: 'grievance',
        label: 'Grievance',
        route: '/hrms/employee-lifecycle/grievance',
        icon: <Shield />,
        color: 'bg-red-600 hover:bg-red-700',
        children: [
            {
                id: 'grievance-type',
                label: 'Grievance Type',
                route: '/hrms/grievance/type',
                icon: <FileText />,
                doctype: 'Grievance Type'
            },
            {
                id: 'employee-grievance',
                label: 'Employee Grievance',
                route: '/hrms/grievance/grievance',
                icon: <FileText />,
                doctype: 'Employee Grievance'
            }
        ]
    },
    {
        id: 'separation',
        label: 'Separation',
        route: '/hrms/employee-lifecycle/separation',
        icon: <UserCheck />, // Using UserCheck as a placeholder, maybe UserMinus would be better if available
        color: 'bg-rose-600 hover:bg-rose-700',
        children: [
            {
                id: 'employee-separation',
                label: 'Employee Separation',
                route: '/hrms/separation/separation',
                icon: <UserCheck />,
                doctype: 'Employee Separation'
            },
            {
                id: 'separation-template',
                label: 'Separation Template',
                route: '/hrms/separation/template',
                icon: <FileText />,
                doctype: 'Employee Separation Template'
            },
            {
                id: 'employee-transfer',
                label: 'Employee Transfer',
                route: '/hrms/employee-lifecycle/employee-transfer',
                icon: <Truck />,
                doctype: 'Employee Transfer'
            },
            {
                id: 'exit-interview',
                label: 'Exit Interview',
                route: '/hrms/employee-lifecycle/exit-interview',
                icon: <FileText />,
                doctype: 'Exit Interview'
            }
        ]
    },
    {
        id: 'lifecycle-reports',
        label: 'Reports',
        route: '/hrms/employee-lifecycle/reports',
        icon: <FileSpreadsheet />,
        color: 'bg-orange-600 hover:bg-orange-700',
        children: [
            {
                id: 'employee-exits',
                label: 'Employee Exits',
                route: '/hrms/reports/Employee Exits',
                icon: <FileText />,
                doctype: 'Report'
            },
            {
                id: 'employee-birthday',
                label: 'Employee Birthday',
                route: '/hrms/reports/Employee Birthday',
                icon: <FileText />,
                doctype: 'Report'
            },
            {
                id: 'employee-information',
                label: 'Employee Information',
                route: '/hrms/reports/Employee Information',
                icon: <FileText />,
                doctype: 'Report'
            },
            {
                id: 'employee-analytics',
                label: 'Employee Analytics',
                route: '/hrms/reports/Employee Analytics',
                icon: <FileText />,
                doctype: 'Report'
            }
        ]
    }
];

export const attendanceModules: WorkflowNode[] = [
    {
        id: 'attendance-management',
        label: 'Attendance',
        route: '/hrms/attendance',
        icon: <Clock />,
        color: 'bg-green-600 hover:bg-green-700',
        children: [
            {
                id: 'mark-attendance',
                label: 'Attendance',
                route: '/hrms/attendance/mark',
                icon: <CheckSquare />,
                doctype: 'Attendance'
            },
            {
                id: 'attendance-request',
                label: 'Attendance Request',
                route: '/hrms/attendance-requests',
                icon: <FileText />,
                doctype: 'Attendance Request'
            },
            {
                id: 'upload-attendance',
                label: 'Upload Attendance',
                route: '/hrms/attendance/upload-attendance',
                icon: <ArrowDown />,
                doctype: 'Upload Attendance'
            },
            {
                id: 'employee-checkin',
                label: 'Employee Checkin',
                route: '/hrms/attendance/employee-checkin',
                icon: <CheckSquare />,
                doctype: 'Employee Checkin'
            },
            {
                id: 'employee-attendance-tool',
                label: 'Attendance Tool',
                route: '/hrms/attendance/employee-attendance-tool',
                icon: <Wrench />,
                doctype: 'Employee Attendance Tool'
            }
        ]
    },
    {
        id: 'shift-management',
        label: 'Shift Management',
        route: '/hrms/attendance/shifts',
        icon: <Calendar />,
        color: 'bg-primary hover:bg-primary/90',
        children: [
            {
                id: 'shift-type',
                label: 'Shift Type',
                route: '/hrms/attendance/shift-type',
                icon: <Clock />,
                doctype: 'Shift Type'
            },
            {
                id: 'shift-assignment',
                label: 'Shift Assignment',
                route: '/hrms/attendance/shift-assignment',
                icon: <ClipboardList />,
                doctype: 'Shift Assignment'
            },
            {
                id: 'shift-request',
                label: 'Shift Request',
                route: '/hrms/attendance/shift-requests',
                icon: <FileText />,
                doctype: 'Shift Request'
            },
            {
                id: 'shift-location',
                label: 'Shift Location',
                route: '/hrms/attendance/shift-location',
                icon: <Map />,
                doctype: 'Shift Location'
            },
            {
                id: 'shift-schedule',
                label: 'Shift Schedule',
                route: '/hrms/attendance/shift-schedule',
                icon: <Calendar />,
                doctype: 'Shift Schedule'
            },
            {
                id: 'shift-schedule-assignment',
                label: 'Schedule Assignment',
                route: '/hrms/attendance/shift-schedule-assignment',
                icon: <UserCheck />,
                doctype: 'Shift Schedule Assignment'
            },
            {
                id: 'shift-assignment-tool',
                label: 'Assignment Tool',
                route: '/hrms/attendance/shift-assignment-tool',
                icon: <Wrench />,
                doctype: 'Shift Assignment Tool'
            }
        ]
    }
];

export const leaveModules: WorkflowNode[] = [
    {
        id: 'leave-transactions',
        label: 'Leave Transactions',
        route: '/hrms/leaves',
        icon: <Calendar />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'leave-application',
                label: 'Leave Application',
                route: '/hrms/leave-applications',
                icon: <FileText />,
                doctype: 'Leave Application'
            },
            {
                id: 'leave-allocation',
                label: 'Leave Allocation',
                route: '/hrms/leaves/allocation',
                icon: <CheckSquare />,
                doctype: 'Leave Allocation'
            },
            {
                id: 'compensatory-leave',
                label: 'Compensatory Request',
                route: '/hrms/leaves/compensatory-request',
                icon: <Clock />,
                doctype: 'Compensatory Leave Request'
            },
            {
                id: 'leave-adjustment',
                label: 'Leave Adjustment',
                route: '/hrms/leaves/leave-adjustment',
                icon: <Wrench />,
                doctype: 'Leave Adjustment'
            },
            {
                id: 'leave-ledger-entry',
                label: 'Leave Ledger',
                route: '/hrms/leaves/leave-ledger-entry',
                icon: <BookOpen />,
                doctype: 'Leave Ledger Entry'
            },
            {
                id: 'leave-encashment',
                label: 'Leave Encashment',
                route: '/hrms/leaves/encashment',
                icon: <Banknote />,
                doctype: 'Leave Encashment'
            }
        ]
    },
    {
        id: 'leave-setup',
        label: 'Leave Setup',
        route: '/hrms/leaves/setup',
        icon: <Settings />,
        color: 'bg-primary hover:bg-primary/90',
        children: [
            {
                id: 'leave-type',
                label: 'Leave Type',
                route: '/hrms/leaves/leave-type',
                icon: <FileText />,
                doctype: 'Leave Type'
            },
            {
                id: 'leave-policy',
                label: 'Leave Policy',
                route: '/hrms/leaves/leave-policy',
                icon: <FileText />,
                doctype: 'Leave Policy'
            },
            {
                id: 'leave-period',
                label: 'Leave Period',
                route: '/hrms/leaves/leave-period',
                icon: <Calendar />,
                doctype: 'Leave Period'
            },
            {
                id: 'holiday-list',
                label: 'Holiday List',
                route: '/hrms/leaves/holiday-list',
                icon: <Calendar />,
                doctype: 'Holiday List'
            },
            {
                id: 'leave-control-panel',
                label: 'Leave Control Panel',
                route: '/hrms/leaves/leave-control-panel',
                icon: <Settings />,
                doctype: 'Leave Control Panel'
            },
            {
                id: 'leave-block-list',
                label: 'Leave Block List',
                route: '/hrms/leaves/leave-block-list',
                icon: <Settings />,
                doctype: 'Leave Block List'
            }
        ]
    }
];

export const taskManagerModules: WorkflowNode[] = [
    {
        id: 'task-management',
        label: 'Task Management',
        route: '/task-manager',
        icon: <CheckSquare />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'browse-projects',
                label: 'Browse Projects',
                route: '/projects',
                icon: <Activity />,
                doctype: 'Project'
            },
            {
                id: 'task-list',
                label: 'Task List',
                route: '/task-manager/tasks',
                icon: <CheckSquare />,
                doctype: 'Task'
            },
            {
                id: 'create-task',
                label: 'Create Task',
                route: '/task-manager/new',
                icon: <Plus />,
            },
            {
                id: 'task-tree-view',
                label: 'Task Tree View',
                route: '/task-manager/tree',
                icon: <Layers />,
            }
        ]
    },
    {
        id: 'projects',
        label: 'Projects',
        route: '/projects',
        icon: <Users />,
        color: 'bg-primary hover:bg-primary/90',
        children: [
            {
                id: 'all-projects',
                label: 'All Projects',
                route: '/projects',
                icon: <Users />,
                doctype: 'Project'
            },
            {
                id: 'new-project',
                label: 'New Project',
                route: '/projects/new',
                icon: <LayoutDashboard />
            }
        ]
    },
    // {
    //     id: 'related-modules',
    //     label: 'Related Modules',
    //     route: '/task-manager',
    //     icon: <Layers />,
    //     color: 'bg-purple-600 hover:bg-purple-700',
    //     children: [
    //         {
    //             id: 'safety-management',
    //             label: 'Safety Management',
    //             route: '/safety',
    //             icon: <Shield />
    //         },
    //         {
    //             id: 'quality-control',
    //             label: 'Quality Control',
    //             route: '/quality',
    //             icon: <CheckSquare />
    //         }
    //     ]
    // }
];

export const payrollModules: WorkflowNode[] = [
    {
        id: 'payroll-processing',
        label: 'Payroll Processing',
        route: '/hrms/payroll',
        icon: <Banknote />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'salary-slip',
                label: 'Salary Slip',
                route: '/hrms/payroll/salary-slip',
                icon: <FileText />,
                doctype: 'Salary Slip'
            },
            {
                id: 'payroll-entry',
                label: 'Payroll Entry',
                route: '/hrms/payroll/payroll-entry',
                icon: <DollarSign />,
                doctype: 'Payroll Entry'
            },
            {
                id: 'additional-salary',
                label: 'Additional Salary',
                route: '/hrms/payroll/additional-salary',
                icon: <DollarSign />,
                doctype: 'Additional Salary'
            },
            {
                id: 'arrear',
                label: 'Arrear',
                route: '/hrms/payroll/arrear',
                icon: <Banknote />,
                doctype: 'Arrear'
            },
            {
                id: 'payroll-correction',
                label: 'Payroll Correction',
                route: '/hrms/payroll/payroll-correction',
                icon: <Wrench />,
                doctype: 'Payroll Correction'
            },
            {
                id: 'full-and-final-statement',
                label: 'Full & Final',
                route: '/hrms/payroll/full-and-final-statement',
                icon: <FileText />,
                doctype: 'Full and Final Statement'
            },
            {
                id: 'gratuity',
                label: 'Gratuity',
                route: '/hrms/payroll/gratuity',
                icon: <Award />,
                doctype: 'Gratuity'
            },
            {
                id: 'interest',
                label: 'Interest',
                route: '/hrms/payroll/interest',
                icon: <TrendingUp />,
                doctype: 'Interest'
            },
            {
                id: 'employee-incentive',
                label: 'Employee Incentive',
                route: '/hrms/payroll/employee-incentive',
                icon: <Award />,
                doctype: 'Employee Incentive'
            }
        ]
    },
    {
        id: 'payroll-setup',
        label: 'Payroll Setup',
        route: '/hrms/payroll/setup',
        icon: <Settings />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'salary-structure',
                label: 'Salary Structure',
                route: '/hrms/payroll/salary-structure',
                icon: <FileSpreadsheet />,
                doctype: 'Salary Structure'
            },
            {
                id: 'salary-structure-assignment',
                label: 'Structure Assignment',
                route: '/hrms/payroll/salary-structure-assignment',
                icon: <UserCheck />,
                doctype: 'Salary Structure Assignment'
            },
            {
                id: 'salary-component',
                label: 'Salary Component',
                route: '/hrms/payroll/salary-component',
                icon: <FileText />,
                doctype: 'Salary Component'
            },
            {
                id: 'income-tax-slab',
                label: 'Income Tax Slab',
                route: '/hrms/payroll/income-tax-slab',
                icon: <FileText />,
                doctype: 'Income Tax Slab'
            },
            {
                id: 'payroll-settings',
                label: 'Payroll Settings',
                route: '/hrms/payroll/payroll-settings',
                icon: <Settings />,
                doctype: 'Payroll Settings'
            },
            {
                id: 'gratuity-rule',
                label: 'Gratuity Rule',
                route: '/hrms/payroll/gratuity-rule',
                icon: <Ruler />,
                doctype: 'Gratuity Rule'
            },
            {
                id: 'employee-benefit-detail',
                label: 'Benefit Detail',
                route: '/hrms/payroll/employee-benefit-detail',
                icon: <FileText />,
                doctype: 'Employee Benefit Detail'
            },
            {
                id: 'employee-benefit-ledger',
                label: 'Benefit Ledger',
                route: '/hrms/payroll/employee-benefit-ledger',
                icon: <BookOpen />,
                doctype: 'Employee Benefit Ledger'
            },
            {
                id: 'employee-other-income',
                label: 'Other Income',
                route: '/hrms/payroll/employee-other-income',
                icon: <DollarSign />,
                doctype: 'Employee Other Income'
            },
            {
                id: 'payroll-period',
                label: 'Payroll Period',
                route: '/hrms/payroll/payroll-period',
                icon: <Calendar />,
                doctype: 'Payroll Period'
            },
            {
                id: 'employee-tax-exemption-declaration',
                label: 'Tax Exemption Declaration',
                route: '/hrms/payroll/employee-tax-exemption-declaration',
                icon: <FileText />,
                doctype: 'Employee Tax Exemption Declaration'
            },
            {
                id: 'employee-tax-exemption-proof-submission',
                label: 'Tax Proof Submission',
                route: '/hrms/payroll/employee-tax-exemption-proof-submission',
                icon: <FileCheck />,
                doctype: 'Employee Tax Exemption Proof Submission'
            },
            {
                id: 'employee-benefit-application',
                label: 'Benefit Application',
                route: '/hrms/payroll/employee-benefit-application',
                icon: <FileText />,
                doctype: 'Employee Benefit Application'
            },
            {
                id: 'employee-benefit-claim',
                label: 'Benefit Claim',
                route: '/hrms/payroll/employee-benefit-claim',
                icon: <Clock />,
                doctype: 'Employee Benefit Claim'
            }
        ]
    }
];

export const stockModules: WorkflowNode[] = [
    {
        id: 'stock-transactions',
        label: 'Stock Transactions',
        route: '/stock',
        icon: <Package />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'material-request',
                label: 'Material Request',
                route: '/stock/material-request',
                icon: <FileText />,
                doctype: 'Material Request'
            },
            {
                id: 'stock-entry',
                label: 'Stock Entry',
                route: '/stock/stock-entry',
                icon: <ArrowDown />,
                doctype: 'Stock Entry'
            },
            {
                id: 'purchase-receipt',
                label: 'Purchase Receipt',
                route: '/stock/purchase-receipt',
                icon: <Receipt />,
                doctype: 'Purchase Receipt'
            },
            {
                id: 'delivery-note',
                label: 'Delivery Note',
                route: '/stock/delivery-note',
                icon: <FileText />,
                doctype: 'Delivery Note'
            }
        ]
    },
    {
        id: 'stock-master',
        label: 'Stock Masters',
        route: '/stock/masters',
        icon: <Settings />,
        color: 'bg-primary hover:bg-primary/90',
        children: [
            {
                id: 'item',
                label: 'Item',
                route: '/stock/item',
                icon: <Package />,
                doctype: 'Item'
            },
            {
                id: 'warehouse',
                label: 'Warehouse',
                route: '/stock/warehouse',
                icon: <Briefcase />,
                doctype: 'Warehouse'
            },
            {
                id: 'item-group',
                label: 'Item Group',
                route: '/stock/item-group',
                icon: <Layers />,
                doctype: 'Item Group'
            },
            {
                id: 'stock-reconciliation',
                label: 'Stock Reconciliation',
                route: '/stock/stock-reconciliation',
                icon: <CheckSquare />,
                doctype: 'Stock Reconciliation'
            },
            {
                id: 'dmrc-report',
                label: 'DMRC Report',
                route: '/stock/dmrc-report',
                icon: <FileText />,
                doctype: 'DMRC Report'
            },
            {
                id: 'print-heading',
                label: 'Print Heading',
                route: '/stock/print-heading',
                icon: <Settings />,
                doctype: 'Print Heading'
            }
        ]
    }
];

export const assetsModules: WorkflowNode[] = [
    {
        id: 'asset-management',
        label: 'Asset Management',
        route: '/assets',
        icon: <Briefcase />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'asset',
                label: 'Asset',
                route: '/assets/asset',
                icon: <Package />,
                doctype: 'Asset'
            },
            {
                id: 'asset-movement',
                label: 'Asset Movement',
                route: '/assets/asset-movement',
                icon: <ArrowDown />,
                doctype: 'Asset Movement'
            },
            {
                id: 'asset-repair',
                label: 'Asset Repair',
                route: '/assets/asset-repair',
                icon: <Wrench />,
                doctype: 'Asset Repair'
            }
        ]
    },
    {
        id: 'asset-maintenance',
        label: 'Maintenance',
        route: '/assets/maintenance',
        icon: <Wrench />,
        color: 'bg-primary hover:bg-primary/90',
        children: [
            {
                id: 'asset-maintenance',
                label: 'Asset Maintenance',
                route: '/assets/asset-maintenance',
                icon: <Wrench />,
                doctype: 'Asset Maintenance'
            },
            {
                id: 'maintenance-team',
                label: 'Maintenance Team',
                route: '/assets/maintenance-team',
                icon: <Users />,
                doctype: 'Asset Maintenance Team'
            },
            {
                id: 'maintenance-log',
                label: 'Maintenance Log',
                route: '/assets/maintenance-log',
                icon: <FileText />,
                doctype: 'Asset Maintenance Log'
            }
        ]
    },
    {
        id: 'operations-compliance',
        label: 'Operations & Compliance',
        route: '/assets/operations',
        icon: <ClipboardList />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'asset-rent',
                label: 'Asset Rent',
                route: '/assets/asset-rent',
                icon: <Receipt />,
                doctype: 'Asset Rent'
            },
            {
                id: 'machinery-log',
                label: 'Machinery Log',
                route: '/assets/machinery-log',
                icon: <ClipboardList />,
                doctype: 'Machinery Log'
            },
            {
                id: 'monthly-checklist',
                label: 'Monthly Checklist',
                route: '/assets/monthly-checklist',
                icon: <CheckSquare />,
                doctype: 'Monthly Checklist'
            },
            {
                id: 'weekly-checklist',
                label: 'Weekly Checklist',
                route: '/assets/weekly-checklist',
                icon: <CheckSquare />,
                doctype: 'Weekly Checklist'
            },

            {
                id: 'vehicle-maintenance',
                label: 'Vehicle Maintenance',
                route: '/assets/vehicle-maintenance',
                icon: <Wrench />,
                doctype: 'Vehicle Maintenance Reminder'
            }
        ]
    }
];

export const expenseModules: WorkflowNode[] = [
    {
        id: 'expense-management',
        label: 'Expense Management',
        route: '/hrms/expenses',
        icon: <Receipt />,
        color: 'bg-primary hover:bg-primary/90',
        children: [
            {
                id: 'expense-claim',
                label: 'Expense Claim',
                route: '/hrms/expenses/claim',
                icon: <Receipt />,
                doctype: 'Expense Claim'
            },
            {
                id: 'employee-advance',
                label: 'Employee Advance',
                route: '/hrms/expenses/advance',
                icon: <DollarSign />,
                doctype: 'Employee Advance'
            },
            {
                id: 'travel-request',
                label: 'Travel Request',
                route: '/hrms/expenses/travel-request',
                icon: <Map />,
                doctype: 'Travel Request'
            }
        ]
    },
    {
        id: 'fleet-management',
        label: 'Fleet Management',
        route: '/hrms/expenses/fleet',
        icon: <Truck />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'vehicle',
                label: 'Vehicle',
                route: '/hrms/expenses/vehicle',
                icon: <Truck />,
                doctype: 'Vehicle'
            },
            {
                id: 'vehicle-log',
                label: 'Vehicle Log',
                route: '/hrms/expenses/vehicle-log',
                icon: <FileText />,
                doctype: 'Vehicle Log'
            },
            {
                id: 'vehicle-repair',
                label: 'Vehicle Repair',
                route: '/hrms/expenses/vehicle-repair',
                icon: <Wrench />,
                doctype: 'Vehicle Repair'
            }
        ]
    }
];

export const performanceModules: WorkflowNode[] = [
    {
        id: 'performance-appraisal',
        label: 'Appraisals',
        route: '/hrms/performance',
        icon: <Award />,
        color: 'bg-primary hover:bg-primary/90',
        children: [
            {
                id: 'appraisal',
                label: 'Appraisal',
                route: '/hrms/performance/appraisal',
                icon: <FileCheck />,
                doctype: 'Appraisal'
            },
            {
                id: 'goal',
                label: 'Goal',
                route: '/hrms/performance/goal',
                icon: <Target />,
                doctype: 'Goal'
            },
            {
                id: 'kpi',
                label: 'KPI',
                route: '/hrms/performance/kpi',
                icon: <Target />,
                doctype: 'KPI'
            }
        ]
    },
    {
        id: 'performance-setup',
        label: 'Setup & Logs',
        route: '/hrms/performance/setup',
        icon: <Settings />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'appraisal-template',
                label: 'Appraisal Template',
                route: '/hrms/performance/template',
                icon: <FileText />,
                doctype: 'Appraisal Template'
            },
            {
                id: 'energy-point-log',
                label: 'Energy Point Log',
                route: '/hrms/performance/energy-points',
                icon: <Zap />,
                doctype: 'Energy Point Log'
            },
            {
                id: 'energy-point-rule',
                label: 'Energy Point Rule',
                route: '/hrms/performance/energy-point-rule',
                icon: <Settings />,
                doctype: 'Energy Point Rule'
            }
        ]
    }
];

export const taxBenefitsModules: WorkflowNode[] = [
    {
        id: 'tax-management',
        label: 'Tax Management',
        route: '/hrms/tax',
        icon: <Calculator />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'income-tax-slab',
                label: 'Income Tax Slab',
                route: '/hrms/tax/slabs',
                icon: <FileSpreadsheet />,
                doctype: 'Income Tax Slab'
            },
            {
                id: 'tax-exemption-declaration',
                label: 'Exemption Declaration',
                route: '/hrms/tax/declaration',
                icon: <FileText />,
                doctype: 'Employee Tax Exemption Declaration'
            },
            {
                id: 'tax-exemption-proof',
                label: 'Proof Submission',
                route: '/hrms/tax/proof',
                icon: <FileCheck />,
                doctype: 'Employee Tax Exemption Proof Submission'
            }
        ]
    },
    {
        id: 'benefits',
        label: 'Benefits & Structure',
        route: '/hrms/tax/benefits',
        icon: <Landmark />,
        color: 'bg-primary hover:bg-primary/90',
        children: [
            {
                id: 'salary-structure-assignment',
                label: 'Structure Assignment',
                route: '/hrms/payroll/salary-structure-assignment',
                icon: <UserCheck />,
                doctype: 'Salary Structure Assignment'
            },
            {
                id: 'retention-bonus',
                label: 'Retention Bonus',
                route: '/hrms/tax/retention-bonus',
                icon: <Award />,
                doctype: 'Retention Bonus'
            },
            {
                id: 'employee-benefit-application',
                label: 'Benefit Application',
                route: '/hrms/tax/benefit-application',
                icon: <FileText />,
                doctype: 'Employee Benefit Application'
            }
        ]
    }
];
export const centralHubModules: WorkflowNode[] = [
    {
        id: 'asset-management',
        label: 'Asset Management',
        route: '/assets',
        icon: <Briefcase />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'asset',
                label: 'Asset',
                route: '/assets/asset',
                icon: <Package />,
                doctype: 'Asset'
            },
            {
                id: 'asset-movement',
                label: 'Asset Movement',
                route: '/assets/asset-movement',
                icon: <ArrowDown />,
                doctype: 'Asset Movement'
            }
        ]
    },
    {
        id: 'asset-maintenance',
        label: 'Maintenance',
        route: '/assets/maintenance',
        icon: <Wrench />,
        color: 'bg-primary hover:bg-primary/90',
        children: [
            {
                id: 'asset-maintenance',
                label: 'Asset Maintenance',
                route: '/assets/asset-maintenance',
                icon: <Wrench />,
                doctype: 'Asset Maintenance'
            },
            {
                id: 'asset-repair',
                label: 'Asset Repair',
                route: '/assets/asset-repair',
                icon: <Wrench />,
                doctype: 'Asset Repair'
            },
            {
                id: 'maintenance-team',
                label: 'Maintenance Team',
                route: '/assets/maintenance-team',
                icon: <Users />,
                doctype: 'Asset Maintenance Team'
            },
            {
                id: 'maintenance-log',
                label: 'Maintenance Log',
                route: '/assets/maintenance-log',
                icon: <FileText />,
                doctype: 'Asset Maintenance Log'
            }
        ]
    },
    {
        id: 'operations-compliance',
        label: 'Operations & Compliance',
        route: '/assets/operations',
        icon: <ClipboardList />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'asset-rent',
                label: 'KB Asset Rent',
                route: '/assets/asset-rent',
                icon: <Receipt />,
                doctype: 'Asset Rent'
            },
            {
                id: 'machinery-log',
                label: 'Machinery Resource',
                route: '/assets/machinery-log',
                icon: <ClipboardList />,
                doctype: 'Machinery Log'
            },
            {
                id: 'monthly-checklist',
                label: 'Monthly Checklist',
                route: '/assets/monthly-checklist',
                icon: <CheckSquare />,
                doctype: 'Monthly Checklist'
            },
            {
                id: 'weekly-checklist',
                label: 'Weekly Checklist',
                route: '/assets/weekly-checklist',
                icon: <CheckSquare />,
                doctype: 'Weekly Checklist'
            },
            // {
            //     id: 'vehicle-maintenance',
            //     label: 'Vehicle Maintenance',
            //     route: '/assets/vehicle-maintenance',
            //     icon: <Wrench />,
            //     doctype: 'Vehicle Maintenance Reminder'
            // }
        ]
    }
];

export const planningModules: WorkflowNode[] = [
    {
        id: 'project-planning',
        label: 'Project Planning',
        route: '/planning',
        icon: <ClipboardList />,
        color: 'bg-primary hover:bg-primary/90',
        children: [
            {
                id: 'concrete-measurement',
                label: 'Measurement',
                route: '/planning/concrete-measurement',
                icon: <Ruler />,
                doctype: 'KB Concrete and Shuttering Measurement'
            },
            {
                id: 'client-baseline',
                label: 'Client Baseline',
                route: '/planning/client-baseline',
                icon: <Calendar />, // Using Calendar for now
                doctype: 'KB Client Baseline'
            },
            {
                id: 'operational-schedule',
                label: 'Operational Schedule',
                route: '/planning/operational-schedule',
                icon: <Calendar />, // Using Calendar for now
                doctype: 'KB Operational Schedule'
            }
        ]
    },
    {
        id: 'budgeting-estimation',
        label: 'Budgeting & Estimation',
        route: '/planning/budgeting',
        icon: <DollarSign />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'planned-budget',
                label: 'Planned Budget',
                route: '/planning/planned-budget',
                icon: <DollarSign />,
                doctype: 'Planned Budget'
            },
            {
                id: 'rate-analysis',
                label: 'Rate Analysis',
                route: '/planning/rate-analysis',
                icon: <Calculator />,
                doctype: 'Rate Analysis'
            },
            {
                id: 'quotation',
                label: 'Quotation',
                route: '/planning/quotation',
                icon: <FileText />,
                doctype: 'Quotation'
            }
        ]
    },
    {
        id: 'work-analysis',
        label: 'Work Analysis',
        route: '/planning/analysis',
        icon: <TrendingUp />,
        color: 'bg-blue-600 hover:bg-blue-700',
        children: [
            {
                id: 'work-details',
                label: 'Work Details',
                route: '/planning/work-details',
                icon: <FileText />,
                doctype: 'Work Details'
            },
            {
                id: 'kb-work-analysis',
                label: 'KB Work Analysis',
                route: '/planning/work-analysis',
                icon: <TrendingUp />,
                doctype: 'KB Work Analysis'
            }
        ]
    }
];

export const labourManagementModules: WorkflowNode[] = [
    {
        id: 'attendance-time',
        label: 'Attendance & Time',
        route: '/labour-management/attendance',
        icon: <Clock />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'daily-labour-summary',
                label: 'Daily Labour Summary',
                route: '/labour-management/daily-labour-summary',
                icon: <ClipboardList />,
                doctype: 'Daily Labour Summary'
            },
            {
                id: 'daily-labour-usage',
                label: 'Daily Labour Usage',
                route: '/labour-management/daily-labour-usage',
                icon: <Clock />,
                doctype: 'Daily Labour Usage'
            }
        ]
    },
    {
        id: 'worker-management',
        label: 'Worker Management',
        route: '/labour-management/worker-management',
        icon: <Users />,
        color: 'bg-primary hover:bg-primary/90',
        children: [
            {
                id: 'labour-onboarding',
                label: 'Labour Onboarding',
                route: '/labour-management/labour-onboarding',
                icon: <UserPlus />,
                doctype: 'Labour Onboarding'
            },
            {
                id: 'sub-contractor',
                label: 'Sub Contractor',
                route: '/labour-management/sub-contractor',
                icon: <Briefcase />,
                doctype: 'Sub Contractor'
            },
            {
                id: 'sub-contractor-labour-rates',
                label: 'Sub Contractor Labour Rates',
                route: '/subcontractor/sub-contractor-labour-rates',
                icon: <FileText />,
                doctype: 'Sub Contractor Labour Rates'
            },
            {
                id: 'sub-contractor-workhead',
                label: 'Sub Contractor Workhead',
                route: '/labour-management/sub-contractor-workhead',
                icon: <FileText />,
                doctype: 'Sub Contractor Workhead'
            },
            {
                id: 'labour-attendance',
                label: 'Labour Attendance',
                route: '/labour-management/labour-attendance',
                icon: <ClipboardCheck />,
                doctype: 'Labour Attendance'
            }
        ]
    },
    // {
    //     id: 'billing-costs',
    //     label: 'Billing & Costs',
    //     route: '/labour-management/billing',
    //     icon: <Calculator />,
    //     color: 'bg-orange-600 hover:bg-orange-700',
    //     children: [
    //         {
    //             id: 'kb-kharchi',
    //             label: 'Kharchi (Expenses)',
    //             route: '/labour-management/kb-kharchi',
    //             icon: <Banknote />,
    //             doctype: 'KB Kharchi'
    //         },
    //         {
    //             id: 'daily-labour-cost-report',
    //             label: 'Daily Labour Cost Report',
    //             route: '/labour-management/daily-labour-cost-report',
    //             icon: <FileText />,
    //             doctype: 'KB Daily Labour Cost Report'
    //         }
    //     ]
    // },
    {
        id: 'master-data',
        label: 'Master Data',
        route: '/labour-management/master-data',
        icon: <Settings />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'kb-labour-type',
                label: 'KB Labour Type',
                route: '/labour-management/kb-labour-type',
                icon: <Settings />,
                doctype: 'KB Labour Type'
            },
            {
                id: 'kb-nature-of-work',
                label: 'KB Nature of Work',
                route: '/labour-management/kb-nature-of-work',
                icon: <Settings />,
                doctype: 'KB Nature of Work'
            },
            {
                id: 'workhead-template',
                label: 'Workhead Template',
                route: '/labour-management/workhead-template',
                icon: <Settings />,
                doctype: 'Workhead Template'
            }
        ]
    }
];

export const pAndMModules: WorkflowNode[] = [
    {
        id: 'material-management',
        label: 'Material Management',
        route: '/p-and-m/material-management',
        icon: <Package />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'material-request',
                label: 'Material Request',
                route: '/p-and-m/new-material-request',
                icon: <ClipboardList />,
                doctype: 'Material Request'
            },
            {
                id: 'stock-entry',
                label: 'Stock Entry',
                route: '/p-and-m/new-stock-entry',
                icon: <Package />,
                doctype: 'Stock Entry'
            }
        ]
    },
    {
        id: 'asset-requests',
        label: 'Asset Requests',
        route: '/p-and-m/requests',
        icon: <ShoppingBag />,
        color: 'bg-primary hover:bg-primary/90',
        children: [
            {
                id: 'asset-purchase-request',
                label: 'Asset Purchase Request',
                route: '/p-and-m/material-request',
                icon: <ShoppingBag />,
                doctype: 'Material Request'
            },
            {
                id: 'item-material-request',
                label: 'Item Material Request',
                route: '/p-and-m/new-item-material-request',
                icon: <ClipboardList />,
                doctype: 'Material Request'
            }
        ]
    },
    {
        id: 'transfers-issues',
        label: 'Transfers & Issues',
        route: '/p-and-m/transfers',
        icon: <MoveRight />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'asset-transfer',
                label: 'Asset Transfer',
                route: '/p-and-m/stock-entry',
                icon: <MoveRight />,
                doctype: 'Stock Entry'
            },
            {
                id: 'asset-issue',
                label: 'Asset Issue',
                route: '/p-and-m/stock-entry',
                icon: <Package2 />,
                doctype: 'Stock Entry'
            },
            {
                id: 'item-material-transfer',
                label: 'Item Material Transfer',
                route: '/p-and-m/new-item-material-transfer',
                icon: <MoveRight />,
                doctype: 'Stock Entry'
            },
            {
                id: 'item-material-issue',
                label: 'Item Material Issue',
                route: '/p-and-m/new-item-material-issue',
                icon: <Package2 />,
                doctype: 'Stock Entry'
            }
        ]
    }
];

export const qualityModules: WorkflowNode[] = [
    {
        id: 'quality-control',
        label: 'Quality Control',
        route: '/quality/quality-control',
        icon: <CheckSquare />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'concrete-pour-card',
                label: 'Concrete Pour Card',
                route: '/quality/new-concrete-pour-card',
                icon: <ClipboardList />,
                doctype: 'Concrete Pour Card'
            },
            {
                id: 'dimensions',
                label: 'Dimensions',
                route: '/quality/new-dimensions',
                icon: <Target />,
                doctype: 'Dimensions'
            },
            {
                id: 'rcc-handover',
                label: 'RCC Handover',
                route: '/quality/new-rcc-handover',
                icon: <FileCheck />,
                doctype: 'RCC Handover'
            },
            {
                id: 'slab-soffit-level',
                label: 'Slab Soffit Level',
                route: '/quality/new-slab-soffit-level',
                icon: <BarChart3 />,
                doctype: 'Slab Soffit Level'
            },
            {
                id: 'upstand-depth',
                label: 'Upstand Depth',
                route: '/quality/new-upstand-depth',
                icon: <Target />,
                doctype: 'Upstand Depth'
            },
            {
                id: 'wall-plumb',
                label: 'Wall Plumb',
                route: '/quality/new-wall-plumb',
                icon: <Target />,
                doctype: 'Wall Plumb'
            }
        ]
    },
    {
        id: 'quality-assurance',
        label: 'Quality Assurance',
        route: '/quality/quality-assurance',
        icon: <Award />,
        color: 'bg-primary hover:bg-primary/90',
        children: [
            {
                id: 'request-for-inspection',
                label: 'Request For Inspection',
                route: '/quality/new-request-for-inspection',
                icon: <ClipboardList />,
                doctype: 'Request For Inspection'
            },
            {
                id: 'aluform-checklist-template',
                label: 'Aluform Checklist Template',
                route: '/quality/new-aluform-checklist-template',
                icon: <FileCheck />,
                doctype: 'Aluform Checklist Template'
            },
            {
                id: 'quality-checklist-inspection',
                label: 'Quality Checklist Inspection',
                route: '/quality/new-quality-checklist-inspection',
                icon: <Shield />,
                doctype: 'Quality Checklist Inspection'
            }
        ]
    }
];

export const safetyModules: WorkflowNode[] = [
    {
        id: 'electrical-safety',
        label: 'Electrical Safety',
        route: '/safety/electrical-safety',
        icon: <Zap />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'earth-pit-inspection',
                label: 'Earth Pit Inspection',
                route: '/safety/new-earth-pit-inspection',
                icon: <Shield />,
                doctype: 'Earth Pit Inspection'
            },
            {
                id: 'rccb-tracker',
                label: 'RCCB Tracker',
                route: '/safety/new-rccb-tracker',
                icon: <Zap />,
                doctype: 'RCCB Tracker'
            }
        ]
    },
    {
        id: 'equipment-tools',
        label: 'Equipment & Tools',
        route: '/safety/equipment-tools',
        icon: <Wrench />,
        color: 'bg-primary hover:bg-primary/90',
        children: [
            {
                id: 'full-body-safety-harness',
                label: 'Full Body Safety Harness',
                route: '/safety/new-full-body-safety-harness',
                icon: <Shield />,
                doctype: 'Full Body Safety Harness'
            },
            {
                id: 'lifting-tools-and-tackles',
                label: 'Lifting Tools & Tackles',
                route: '/safety/new-lifting-tools',
                icon: <Wrench />,
                doctype: 'Lifting Tools and Tackles'
            },
            {
                id: 'safety-inspection',
                label: 'Safety Inspection',
                route: '/safety/safety-inspection',
                icon: <ClipboardList />,
                doctype: 'Safety Inspection'
            }
        ]
    },
    {
        id: 'training-personnel',
        label: 'Training & Personnel',
        route: '/safety/training-personnel',
        icon: <Users />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'ehs-and-tool-box',
                label: 'EHS and Tool Box',
                route: '/safety/new-ehs-and-tool-box',
                icon: <HardHat />,
                doctype: 'EHS and Tool Box'
            },
            {
                id: 'labour-onboarding-form',
                label: 'Labour Onboarding Form',
                route: '/safety/new-labour-onboarding-form',
                icon: <Users />,
                doctype: 'Labour Onboarding Form'
            },
            {
                id: 'pre-medical-form',
                label: 'Pre Medical Form',
                route: '/safety/new-pre-medical-form',
                icon: <Activity />,
                doctype: 'Pre Medical Form'
            }
        ]
    },
    {
        id: 'work-activities',
        label: 'Work Activities',
        route: '/safety/work-activities',
        icon: <Activity />,
        color: 'bg-secondary hover:bg-secondary/90',
        children: [
            {
                id: 'height-work-monitoring-report',
                label: 'Height Work Monitoring',
                route: '/safety/new-height-work-monitoring-report',
                icon: <Activity />,
                doctype: 'Height Work Monitoring Report'
            }
        ]
    },
    {
        id: 'incident-reporting',
        label: 'Incident Reporting',
        route: '/safety/incident-reporting',
        icon: <Shield />,
        color: 'bg-red-600 hover:bg-red-700',
        children: [
            {
                id: 'accident-report',
                label: 'Accident Report',
                route: '/safety/new-accident-report',
                icon: <Shield />,
                doctype: 'Accident Report'
            },
            {
                id: 'first-aid-report',
                label: 'First Aid Report',
                route: '/safety/new-first-aid-report',
                icon: <Activity />,
                doctype: 'First Aid Report'
            },
            {
                id: 'incident-report',
                label: 'Incident Report',
                route: '/safety/new-incident-report',
                icon: <FileText />,
                doctype: 'Incident Report'
            },
            {
                id: 'near-miss-report',
                label: 'Near Miss Report',
                route: '/safety/new-near-miss-report',
                icon: <Shield />,
                doctype: 'Near Miss Report'
            }
        ]
    }
];

export const subcontractorModules: WorkflowNode[] = [
    {
        id: 'subcontractor-management',
        label: 'Subcontractors',
        route: '/subcontractor/dashboard',
        icon: <Briefcase />,
        color: 'bg-amber-600 hover:bg-amber-700',
        children: [
            {
                id: 'sub-contractor',
                label: 'Sub Contractor',
                route: '/labour-management/sub-contractor',
                icon: <Briefcase />,
                doctype: 'Sub Contractor'
            },
            {
                id: 'sub-contractor-labour-rates',
                label: 'Labour Rates',
                route: '/subcontractor/sub-contractor-labour-rates',
                icon: <TrendingUp />,
                doctype: 'Sub Contractor Labour Rates'
            },
            {
                id: 'sub-contractor-workhead',
                label: 'Workhead',
                route: '/subcontractor/sub-contractor-workhead',
                icon: <HardHat />,
                doctype: 'Sub Contractor Workhead'
            },
            {
                id: 'subcontractor-work-order',
                label: 'Work Order',
                route: '/subcontractor/subcontractor-work-order',
                icon: <ClipboardCheck />,
                doctype: 'Subcontractor Work Order'
            },
            {
                id: 'work-order-type',
                label: 'Work Order Type',
                route: '/subcontractor/work-order-type',
                icon: <Settings />,
                doctype: 'Work Order Type'
            },
            {
                id: 'subwork',
                label: 'Sub Work',
                route: '/subcontractor/subwork',
                icon: <Layers />,
                doctype: 'SubWork'
            }
        ]
    }
];

export const onboardingModules: WorkflowNode[] = [
    employeeLifecycleModules[0],
    employeeLifecycleModules[1]
];


