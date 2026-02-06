/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Home,
  Users,
  Shield,
  Building2,
  Package,
  X,
  Layers,
  Settings,
  UserCircle,
  CheckCircle,
  ClipboardCheck,
  Briefcase,
  Warehouse,
  Activity,
  Zap,
  ChevronDown,
  LayoutDashboard,
  Computer,
  GanttChart,
  Kanban,
  UserCog,
  User2,
  Database,
  Phone,
  MessageSquare
} from "lucide-react"
import { useFrappeAuth } from "frappe-react-sdk"
import { motion, AnimatePresence } from "framer-motion"
import { useAccessControl } from "@/hooks/useAccessControl"

// Logic-based grouping for better bifurcation
export const navigationGroups = [
  {
    group: "Dashboards",
    items: [
      {
        title: "Employee Dashboard",
        href: "/employee-main-dashboard",
        icon: Home,
        color: "text-orange-600"
      },
      {
        title: "Performance Dashboard",
        href: "/performance-main-dashboard",
        icon: Activity,
        color: "text-orange-500"
      },
    ]
  },
  {
    group: "Business",
    items: [
      {
        title: "CRM",
        icon: Users,
        color: "text-orange-600",
        roles: ["Sales User", "Sales Manager", "System Manager", "Administrator"],
        subItems: [
          { title: "Dashboard", href: "/crm/dashboard" },
          {
            title: "Sales Pipeline",
            subItems: [
              { title: "Contacts", href: "/crm/contacts" },
              { title: "Leads", href: "/crm/leads" },
              { title: "Deals", href: "/crm/deals" },
              { title: "Quotations", href: "/crm/quotations" },
            ]
          },
          {
            title: "AI Agent",
            subItems: [
              { title: "Bulk Calling", href: "/crm/bulk-calling" },
              { title: "Call Logs", href: "/crm/call-logs" },
            ]
          },
          {
            title: "Relationships",
            subItems: [
              { title: "Organizations", href: "/crm/organizations" },
            ]
          },
          {
            title: "Communication",
            subItems: [
              { title: "Newsletter", href: "/crm/newsletter" },
            ]
          }
        ]
      }
    ]
  },
  {
    group: "Core Operations",
    items: [
      {
        title: "Planning & Budget",
        icon: Layers,
        color: "text-cyan-600",
        roles: ["Planning Manager", "Planning User", "System Manager", "Administrator"],
        subItems: [
          { title: "Dashboard", href: "/planning" },
          { title: "Comparison View", href: "/planning/comparison" },
          { title: "Rate Analysis", href: "/planning/rate-analysis" },
          { title: "Planned Budget", href: "/planning/planned-budget" },
          { title: "Bulk Data Import", href: "/bulk-data-import" },
          { title: "Data Export", href: "/data-export" },
        ]
      },
      {
        title: "Task Management",
        icon: ClipboardCheck,
        color: "text-violet-600",
        roles: ["Project Manager", "Projects User", "System Manager", "Administrator"],
        subItems: [
          { title: "Main Dashboard", href: "/task-manager" },
          { title: "Create Task", href: "/task-manager/new" },
          { title: "Schedule Tasks", href: "/task-manager/library-selection" },
        ]
      },
      {
        title: "Subcontractors",
        icon: Briefcase,
        color: "text-amber-600",
        roles: ["Purchase Manager", "Purchase User", "System Manager", "Administrator"],
        subItems: [
          { title: "Dashboard", href: "/subcontractor/dashboard" },
          { title: "Work Orders", href: "/subcontractor/subcontractor-work-order" },
          { title: "Labour Rates", href: "/subcontractor/sub-contractor-labour-rates" },
          { title: "Payment Stages", href: "/subcontractor/payment-stages" },
          { title: "Payment Stage Types", href: "/subcontractor/kb-payment-stage-type" },
        ]
      }
    ]
  },
  {
    group: "Workforce & HR",
    items: [
      {
        title: "Labour Management",
        icon: Users,
        color: "text-orange-600",
        roles: ["HR Manager", "HR User", "System Manager", "Administrator"],
        subItems: [
          { title: "Dashboard", href: "/labour-management" },
          { title: "Labour Onboarding", href: "/labour-management/labour-onboarding" },
          { title: "Daily Summary", href: "/labour-management/daily-labour-summary" },
        ]
      },
      {
        title: "HR Management",
        icon: UserCog,
        color: "text-pink-600",
        roles: ["HR Manager", "HR User", "System Manager", "Administrator"],
        subItems: [
          { title: "HR Dashboard", href: "/hrms/dashboard" },
          { title: "Employee", href: "/hrms/employee" },
          {
            title: "Recruitment",
            subItems: [
              {
                title: "Jobs",
                subItems: [
                  { title: "Staffing Plan", href: "/hrms/recruitment/staffing-plan" },
                  { title: "Job Requisition", href: "/hrms/recruitment/job-requisitions" },
                  { title: "Job Openings", href: "/hrms/recruitment/job-openings" },
                  { title: "Job Applicants", href: "/hrms/recruitment/job-applicants" },
                  { title: "Job Offers", href: "/hrms/recruitment/job-offers" },
                  { title: "Employee Referral", href: "/hrms/recruitment/employee-referrals" },
                  // { title: "Job Opening Template", href: "/hrms/recruitment/job-opening-template" },
                ]
              },
              {
                title: "Interviews",
                subItems: [
                  { title: "Interview Type", href: "/hrms/recruitment/interview-types" },
                  { title: "Interview Round", href: "/hrms/recruitment/interview-rounds" },
                  { title: "Interview", href: "/hrms/recruitment/interviews" },
                  { title: "Interview Feedback", href: "/hrms/recruitment/interview-feedback" },
                ]
              },
              {
                title: "Appointment",
                subItems: [
                  { title: "Appt. Letter Template", href: "/hrms/recruitment/appointment-letter-templates" },
                  { title: "Appointment Letter", href: "/hrms/recruitment/appointment-letters" },
                ]
              },
              {
                title: "Reports",
                subItems: [
                  { title: "Recruitment Analytics", href: "/hrms/recruitment/analytics" },
                ]
              },
              {
                title: "Setup",
                subItems: [
                  { title: "Applicant Source", href: "/hrms/recruitment/job-applicant-source" },
                  { title: "Offer Term", href: "/hrms/recruitment/offer-term" },
                  { title: "Offer Term Template", href: "/hrms/recruitment/job-offer-term-template" },
                ]
              }
            ]
          },
          {
            title: "Employee Lifecycle",
            subItems: [
              { title: "Dashboard", href: "/hrms/employee-lifecycle" },
              { title: "Onboarding", href: "/hrms/employee-lifecycle/onboarding" },
              // Training
              {
                title: "Training",
                subItems: [
                  { title: "Training Program", href: "/hrms/training/program" },
                  { title: "Training Event", href: "/hrms/training/event" },
                  { title: "Training Result", href: "/hrms/training/result" },
                  { title: "Training Feedback", href: "/hrms/training/feedback" },
                ]
              },
              {
                title: "Grievance",
                subItems: [
                  // { title: "Dashboard", href: "/hrms/employee-lifecycle/grievance" },
                  { title: "Employee Grievance", href: "/hrms/grievance/grievance" },
                  { title: "Grievance Type", href: "/hrms/grievance/type" },
                ]
              },
              {
                title: "Separation",
                subItems: [
                  { title: "Employee Separation", href: "/hrms/separation/separation" },
                  { title: "Separation Template", href: "/hrms/separation/template" },
                  { title: "Exit Interview", href: "/hrms/employee-lifecycle/exit-interview" },
                  { title: "Employee Transfer", href: "/hrms/employee-lifecycle/employee-transfer" },
                ]
              },
            ]
          },
          {
            title: "Attendance",
            subItems: [
              {
                title: "Shifts",
                subItems: [
                  { title: "Shift Type", href: "/hrms/attendance/shift-type" },
                  { title: "Shift Assignment", href: "/hrms/attendance/shift-assignment" },
                  { title: "Shift Schedule", href: "/hrms/attendance/shift-schedule" },
                  { title: "Shift Schedule Assignment", href: "/hrms/attendance/shift-schedule-assignment" },
                  { title: "Shift Request", href: "/hrms/attendance/shift-requests" },
                  { title: "Shift Location", href: "/hrms/attendance/shift-location" },
                  // { title: "Shift Assignment Tool", href: "/hrms/attendance/shift-assignment-tool" },
                ]
              },
              {
                title: "Attendance",
                subItems: [
                  { title: "Mark Attendance", href: "/hrms/attendance/mark" },
                  { title: "Attendance Request", href: "/hrms/attendance-requests" },
                  { title: "Employee Checkin", href: "/hrms/attendance/employee-checkin" },
                  { title: "My Attendance", href: "/hrms/attendance/my-attendance" },
                  { title: "Attendance", href: "/hrms/attendance" },
                  { title: "Employee Attendance Tool", href: "/hrms/attendance/employee-attendance-tool" },
                  // { title: "Daily Work Summary", href: "/hrms/attendance/daily-work-summary" },
                  // { title: "Daily Work Summary Group", href: "/hrms/attendance/daily-work-summary-group" },
                  // { title: "Upload Attendance", href: "/hrms/attendance/upload" },
                ]
              },
              {
                title: "Time",
                subItems: [
                  { title: "Timesheet", href: "/hrms/attendance/timesheets" },
                  { title: "Activity Type", href: "/hrms/attendance/activity-types" },
                ]
              },
              // {
              //   title: "Reports",
              //   subItems: [
              //     { title: "Monthly Attendance", href: "/hrms/attendance/reports/monthly-attendance" },
              //     { title: "Shift Attendance", href: "/hrms/attendance/reports/Shift%20Attendance" },
              //     { title: "Hours Utilization", href: "/hrms/attendance/reports/Employee%20Hours%20Utilization%20Based%20On%20Timesheet" },
              //     { title: "Project Profitability", href: "/hrms/attendance/reports/Project%20Profitability" },
              //     // { title: "Holiday Workers", href: "/hrms/attendance/reports/holiday-workers" },
              //   ]
              // }
            ]
          },
          {
            title: "Leaves",
            subItems: [
              { title: "Leave Applications", href: "/hrms/leave-applications" },
              { title: "Leave Type", href: "/hrms/leaves/leave-type" },
              { title: "Leave Allocation", href: "/hrms/leaves/allocation" },
              { title: "Compensatory Request", href: "/hrms/leaves/compensatory-request" },
              // { title: "Leave Adjustment", href: "/hrms/leaves/leave-adjustment" },
              { title: "Leave Ledger", href: "/hrms/leaves/leave-ledger-entry" },
              { title: "Leave Encashment", href: "/hrms/leaves/encashment" },
            ]
          },
          {
            title: "Leave Setup",
            subItems: [
              { title: "Leave Policy", href: "/hrms/leaves/leave-policy" },
              { title: "Leave Period", href: "/hrms/leaves/leave-period" },
              { title: "Holiday List", href: "/hrms/leaves/holiday-list" },
              // { title: "Leave Control Panel", href: "/hrms/leaves/leave-control-panel" },
              { title: "Leave Block List", href: "/hrms/leaves/leave-block-list" },
              { title: "Leave Policy Assignment", href: "/hrms/leaves/leave-policy-assignment" },
            ]
          },
          {
            title: "Payroll",
            subItems: [
              {
                title: "Payroll Processing",
                subItems: [
                  { title: "Salary Slip", href: "/hrms/payroll/salary-slip" },
                  { title: "Payroll Entry", href: "/hrms/payroll/payroll-entry" },
                  { title: "Additional Salary", href: "/hrms/payroll/additional-salary" },
                  { title: "Employee Incentive", href: "/hrms/payroll/employee-incentive" },
                  // { title: "Arrear", href: "/hrms/payroll/arrear" },
                  // { title: "Payroll Correction", href: "/hrms/payroll/payroll-correction" },
                  { title: "Full & Final", href: "/hrms/payroll/full-and-final-statement" },
                  { title: "Gratuity", href: "/hrms/payroll/gratuity" },
                  { title: "Interest", href: "/hrms/payroll/interest" },
                ]
              },
              {
                title: "Payroll Setup",
                subItems: [
                  { title: "Salary Structure", href: "/hrms/payroll/salary-structure" },
                  { title: "Structure Assignment", href: "/hrms/payroll/salary-structure-assignment" },
                  { title: "Salary Component", href: "/hrms/payroll/salary-component" },
                  { title: "Payroll Period", href: "/hrms/payroll/payroll-period" },
                  { title: "Income Tax Slab", href: "/hrms/payroll/income-tax-slab" },
                  { title: "Tax Exemption Declaration", href: "/hrms/payroll/employee-tax-exemption-declaration" },
                  { title: "Tax Proof Submission", href: "/hrms/payroll/employee-tax-exemption-proof-submission" },
                  { title: "Benefit Application", href: "/hrms/payroll/employee-benefit-application" },
                  { title: "Benefit Claim", href: "/hrms/payroll/employee-benefit-claim" },
                  // { title: "Benefit Detail", href: "/hrms/payroll/employee-benefit-detail" },
                  // { title: "Benefit Ledger", href: "/hrms/payroll/employee-benefit-ledger" },
                  { title: "Other Income", href: "/hrms/payroll/employee-other-income" },
                  { title: "Gratuity Rule", href: "/hrms/payroll/gratuity-rule" },
                  // { title: "Payroll Settings", href: "/hrms/payroll/payroll-settings" },
                  { title: "Employee Health Insurance", href: "/hrms/payroll/employee-health-insurance" },
                ]
              }
            ]
          },
          {
            title: "Performance",
            subItems: [
              {
                title: "Appraisal",
                subItems: [
                  { title: "Appraisal", href: "/hrms/performance/appraisal" },
                  { title: "Appraisal Cycle", href: "/hrms/performance/appraisal-cycles" },
                  { title: "Feedback", href: "/hrms/performance/feedback" },
                  { title: "Goals", href: "/hrms/performance/goals" },
                  { title: "Appraisal Template", href: "/hrms/performance/appraisal-templates" },
                  { title: "Employee Performance Feedback", href: "/hrms/performance/employee-performance-feedback" },
                ]
              },
              {
                title: "Masters",
                subItems: [
                  { title: "KRA", href: "/hrms/performance/kra" },
                  { title: "Feedback Criteria", href: "/hrms/performance/feedback-criteria" },
                  // { title: "Employee Feedback Criteria", href: "/hrms/performance/employee-feedback-criteria" },
                ]
              },
              {
                title: "Energy Points",
                subItems: [
                  { title: "Rules", href: "/hrms/performance/energy-point-rules" },
                  { title: "Settings", href: "/hrms/performance/energy-point-settings" },
                  { title: "Logs", href: "/hrms/performance/energy-point-logs" },
                ]
              },
              { title: "Promotions", href: "/hrms/performance/promotions" },
              { title: "Employee Promotion", href: "/hrms/performance/employee-promotion" },
            ]
          },
          {
            title: "Expenses",
            subItems: [
              { title: "Expense Claim", href: "/hrms/expenses/expense-claim" },
              { title: "Employee Advance", href: "/hrms/expenses/employee-advance" },
              { title: "Travel Request", href: "/hrms/expenses/travel-request" },
              { title: "Expense Claim Type", href: "/hrms/expenses/expense-claim-type" },
              { title: "Purpose of Travel", href: "/hrms/expenses/purpose-of-travel" },
            ]
          },
          {
            title: "Fleet Management",
            subItems: [
              { title: "Vehicle", href: "/hrms/expenses/vehicle" },
              { title: "Vehicle Log", href: "/hrms/expenses/vehicle-log" },
              // { title: "Vehicle Repair", href: "/hrms/expenses/vehicle-repair" },
              { title: "Vehicle Service Item", href: "/hrms/expenses/vehicle-service-item" },
            ]
          },
          {
            title: "Setup",
            subItems: [
              { title: "HR Settings", href: "/hrms/setup/hr-settings" },
              { title: "Staff Directory", href: "/hrms/setup/employee-group" },
              { title: "Departments", href: "/hrms/setup/department" },
              { title: "Designations", href: "/hrms/setup/designation" },
              { title: "Checklist Items", href: "/hrms/setup/skill" },
              { title: "Branches", href: "/hrms/setup/branch" },
              { title: "Employee Grade", href: "/hrms/setup/employee-grade" },
              { title: "Employment Type", href: "/hrms/setup/employment-type" },
              { title: "Identification Document Type", href: "/hrms/setup/identification-document-type" },
              { title: "PWA Notification", href: "/hrms/setup/pwa-notification" },
            ]
          },
        ]
      }
    ]
  },
  {
    group: "Assets & Logistics",
    items: [
      {
        title: "Stock & Inventory",
        icon: Warehouse,
        color: "text-slate-700",
        roles: ["Stock User", "Stock Manager", "System Manager", "Administrator"],
        subItems: [
          { title: "Inventory Dashboard", href: "/stock" },
          { title: "Material Resources", href: "/stock/material-resource-items" },
          { title: "Material Requests", href: "/stock/material-request" },
          { title: "Stock Entry", href: "/stock/stock-entry" },
          {
            title: "Item Requests",
            subItems: [
              { title: "Item Request", href: "/p-and-m/new-item-material-request" },
              { title: "Item Transfer", href: "/p-and-m/new-item-material-transfer" },
              { title: "Item Issue", href: "/p-and-m/new-item-material-issue?request_for=Item&purpose=Material Issue" },
            ]
          }
        ]
      },
      {
        title: "Central Asset Hub",
        icon: Package,
        color: "text-indigo-700",
        roles: ["Asset Manager", "Stock Manager", "System Manager", "Administrator"],
        subItems: [
          { title: "Dashboard", href: "/central-hub" },
          { title: "Asset Registry", href: "/assets/asset" },
          { title: "Maintenance Log", href: "/assets/maintenance-log" },
          { title: "Asset Movement", href: "/assets/asset-movement" },
          {
            title: "Asset Requests",
            subItems: [
              { title: "Purchase Request", href: "/p-and-m/new-asset-purchase-request" },
              { title: "Asset Transfer", href: "/p-and-m/new-asset-transfer" },
              { title: "Asset Issue", href: "/p-and-m/new-asset-issue" },
            ]
          },
          { title: "Machinery Resources", href: "/assets/machinery-resource-items" },
        ]
      }
    ]
  },
  {
    group: "Compliance & HSEQ",
    items: [
      {
        title: "Safety",
        icon: Shield,
        color: "text-red-600",
        roles: ["Safety User", "Safety Manager", "System Manager", "Administrator"],
        subItems: [
          { title: "Safety Dashboard", href: "/safety" },
          { title: "Incident Reporting", href: "/safety/new-incident-report" },
          { title: "Safety Inspection Template", href: "/safety/safety-checklist-template" },
          // { title: "Perm Level Test", href: "/safety/perm-level-test" },
          {
            title: "Setup",
            subItems: [
              { title: "Approver Template", href: "/approvals/approver-template" },
            ]
          }
        ]
      },
      {
        title: "Quality",
        icon: ClipboardCheck,
        color: "text-green-600",
        roles: ["Quality User", "Quality Manager", "System Manager", "Administrator"],
        subItems: [
          { title: "Quality Dashboard", href: "/quality" },
          { title: "Quality Checklists", href: "/quality/new-quality-checklist-inspection" },
          { title: "Material Inspection", href: "/quality/material-inspection" },
          {
            title: "Setup",
            subItems: [
              { title: "Approver Template", href: "/approvals/approver-template" },
              { title: "Material Template", href: "/quality/material-template" },
              { title: "Aluform Checklist Template", href: "/quality/aluform-checklist-template" },
              { title: "Quality Checklist Template", href: "/quality/quality-checklist-template" },
            ]
          }
        ]
      }
    ]
  },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  isMobile?: boolean
  className?: string
}

const Custom_Sidebar: React.FC<SidebarProps> = ({
  isCollapsed: _isCollapsed,
  onToggle,
  isMobile,
  className
}) => {
  // IGNORE collapsed prop, always expanded
  const isCollapsed = false;
  const location = useLocation()
  const { currentUser } = useFrappeAuth()
  const { hasRole, userRoles, error: rolesError, debugData } = useAccessControl();

  // Track expanded menus
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Initialize expanded menus based on current path
  useEffect(() => {
    const findParents = (items: any[], path: string, parents: string[] = []): string[] | null => {
      for (const item of items) {
        if (item.href === path) return parents;
        if (item.subItems) {
          const found = findParents(item.subItems, path, [...parents, item.title]);
          if (found) return found;
        }
      }
      return null;
    };
  }, [location.pathname]);

  const filteredNavigationGroups = useMemo(() => {
    // if (!userRoles || userRoles.length === 0) return navigationGroups;

    return navigationGroups.map(group => {
      const filteredItems = group.items.filter(item => {
        // Wrapper for hasRole
        return hasRole((item as any).roles);
      });

      return { ...group, items: filteredItems };
    }).filter(group => group.items.length > 0);
  }, [userRoles, hasRole]);

  useEffect(() => {
    const findParents = (items: any[], path: string, parents: string[] = []): string[] | null => {
      for (const item of items) {
        if (item.href === path) return parents;
        if (item.subItems) {
          const found = findParents(item.subItems, path, [...parents, item.title]);
          if (found) return found;
        }
      }
      return null;
    };

    filteredNavigationGroups.forEach(group => {
      const parents = findParents(group.items, location.pathname);
      if (parents) {
        setExpandedMenus(prev => [...new Set([...prev, ...parents])]);
      }
    });
  }, [location.pathname, filteredNavigationGroups]);

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const isItemActive = (item: any): boolean => {
    if (item.href && location.pathname === item.href) return true;
    if (item.subItems) {
      return item.subItems.some((sub: any) => isItemActive(sub));
    }
    return false;
  };

  const renderMenuItem = (item: any, level = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isActive = isItemActive(item);
    const isExpanded = expandedMenus.includes(item.title);
    const isLeaf = !hasSubItems;

    return (
      <div key={item.title} className="w-full">
        {isLeaf ? (
          <Link to={item.href} className="block w-full">
            <div
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200",
                // Different styling for top-level vs nested
                level === 0 ? "mb-1 py-2.5" : "text-sm",
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200"
                  : "text-slate-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:text-orange-900"
              )}
            >
              {/* Icon only for top level */}
              {level === 0 && item.icon && (
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-white" : item.color
                  )}
                />
              )}
              <span className={cn("truncate font-medium")}>{item.title}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </div>
          </Link>
        ) : (
          <div className="w-full">
            <button
              onClick={() => toggleMenu(item.title)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 group",
                level === 0 ? "mb-1 py-2.5" : "text-sm",
                isActive && !isExpanded
                  ? "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-900"
                  : "text-slate-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:text-orange-900"
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {level === 0 && item.icon && (
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive ? "text-orange-600" : item.color
                    )}
                  />
                )}
                <span className="truncate font-medium">{item.title}</span>
              </div>
              <ChevronDown
                size={14}
                className={cn(
                  "transition-transform duration-200 shrink-0 opacity-50",
                  isExpanded ? "rotate-180" : ""
                )}
              />
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 pl-3 border-l border-orange-200 space-y-1 mt-1 mb-1">
                    {item.subItems.map((sub: any) => renderMenuItem(sub, level + 1))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "h-full bg-white border-r border-orange-200/30 flex flex-col transition-all duration-300 ease-in-out z-50",
        "w-[280px]", // Fixed width
        isMobile && "fixed inset-y-0 left-0 shadow-2xl",
        className
      )}
    >
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-6 shrink-0 border-b border-orange-200/30 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div className="animate-in fade-in duration-500">
            <h1 className="font-black text-lg tracking-tight text-slate-900 leading-none">Pulse</h1>
            <p className="text-[10px] bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-bold uppercase mt-1 tracking-wider">
              Enterprise Suite
            </p>
          </div>
        </div>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onToggle} className="hover:bg-orange-50">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-thin">
        {filteredNavigationGroups.map((group, idx) => (
          <div key={idx} className="space-y-3">
            <div className="flex items-center gap-2 px-3">
              <span className="text-[10px] font-black text-orange-600/70 uppercase tracking-[2px] whitespace-nowrap">
                {group.group}
              </span>
              <div className="h-[1px] w-full bg-orange-200/50" />
            </div>
            <div className="space-y-1">
              {group.items.map((item: any) => renderMenuItem(item))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-orange-200/30 bg-gradient-to-r from-orange-50/30 to-amber-50/30">
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-2xl bg-white border border-orange-200 shadow-sm",
            "hover:border-orange-400 hover:shadow-md hover:shadow-orange-100 transition-all"
          )}
        >
          <Avatar className="h-9 w-9 shrink-0 shadow-sm bg-gradient-to-br from-orange-500 to-amber-500 p-[2px]">
            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold text-xs">
              {currentUser?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-900 truncate leading-tight">
              {currentUser || "Admin User"}
            </p>
            <div className="flex items-center gap-1 mt-0.5"></div>
          </div>
          <Settings className="h-4 w-4 text-orange-600/70 hover:text-orange-600 transition-colors cursor-pointer" />
        </div>
      </div>
    </div>
  )
}

export default Custom_Sidebar