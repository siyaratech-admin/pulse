import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import './index.css'
import App from './App.tsx'
import Login from './pages/Login.tsx';
import Dashboard from './pages/modules/Dashboard/Dashboard.tsx';
import Projects from './pages/modules/Projects/Projects.tsx';
import NewProjectForm from './pages/modules/Projects/NewProjectForm.tsx';
import EditProjectForm from './pages/modules/Projects/EditProjectForm.tsx';
import Safety from './pages/modules/Safety/Safety.tsx';
// import NewEarthPitInspectionForm from './pages/modules/Safety/NewEarthPitInspectionForm.tsx';
// import NewEhsAndToolBoxForm from './pages/modules/Safety/NewEhsAndToolBoxForm.tsx';
// import NewFullBodySafetyHarnessForm from './pages/modules/Safety/NewFullBodySafetyHarnessForm.tsx';
// import NewHeightWorkMonitoringReportForm from './pages/modules/Safety/NewHeightWorkMonitoringReportForm.tsx';
// import NewLabourOnboardingForm from './pages/modules/Safety/NewJoiningForm.tsx';
// import NewLiftingToolsForm from './pages/modules/Safety/NewLiftingToolsForm.tsx';
// import NewRccbTrackerForm from './pages/modules/Safety/NewRccbTrackerForm.tsx';
// import NewAccidentReportForm from './pages/modules/Safety/NewAccidentReportForm.tsx';
// import NewFirstAidReportForm from './pages/modules/Safety/NewFirstAidReportForm.tsx';
// import NewIncidentReportForm from './pages/modules/Safety/NewIncidentReportForm.tsx';
// import NewMaterialInspectionForm from './pages/modules/Quality/NewMaterialInspectionForm.tsx';
// import NewNearMissReportForm from './pages/modules/Safety/NewNearMissReportForm.tsx';
// import NewPreMedicalForm from './pages/modules/Safety/NewPreMedicalForm.tsx';
import Quality from './pages/modules/Quality/Quality.tsx';
import NewAluformChecklistTemplateForm from './pages/modules/Quality/NewAluformChecklistTemplateForm.tsx';
import NewQualityChecklistInspectionForm from './pages/modules/Quality/NewQualityChecklistInspectionForm.tsx';
import NewConcretePourCardForm from './pages/modules/Quality/NewConcretePourCardForm.tsx';
import NewDimensionsForm from './pages/modules/Quality/NewDimensionsForm.tsx';
import NewRccHandoverForm from './pages/modules/Quality/NewRccHandoverForm.tsx';
import NewRequestForInspectionForm from './pages/modules/Quality/NewRequestForInspectionForm.tsx';
import NewSlabSoffitLevelForm from './pages/modules/Quality/NewSlabSoffitLevelForm.tsx';
import NewUpstandDepthForm from './pages/modules/Quality/NewUpstandDepthForm.tsx';
import NewWallPlumbForm from './pages/modules/Quality/NewWallPlumbForm.tsx';
// import NewSafetyInspectionForm from './pages/modules/Safety/NewSafetyInspectionForm.tsx';
import PAndM from './pages/modules/PAndM/PAndM.tsx';
import NewMaterialRequestForm from './pages/modules/PAndM/NewMaterialRequestForm.tsx';
import NewStockEntryForm from './pages/modules/PAndM/NewStockEntryForm.tsx';
import {
  NewAssetPurchaseRequest,
  NewItemMaterialRequest,
  NewAssetTransfer,
  NewAssetIssue,
  NewItemMaterialTransfer,
  NewItemMaterialIssue
} from './pages/modules/PAndM/SpecializedPAndMForms.tsx';
import TaskManager from './pages/modules/TaskManager/TaskManager.tsx';
import TaskTree from './pages/modules/TaskManager/TaskTree.tsx';
import TaskList from './pages/modules/TaskManager/TaskList.tsx';
import DailyAssignment from './pages/modules/TaskManager/DailyAssignment.tsx';
import TaskLibrarySelection from './pages/modules/TaskManager/TaskLibrarySelection.tsx';
import LeaveDashboard from './pages/modules/HRMS/Leaves/LeaveDashboard.tsx';
import LeaveApplicationList from './pages/modules/HRMS/Leaves/LeaveApplicationList.tsx';
import LeaveApplicationForm from './pages/modules/HRMS/Leaves/LeaveApplicationForm.tsx';
import ExpenseClaimList from './pages/modules/HRMS/Expenses/ExpenseClaimList.tsx';
import ExpenseClaimForm from './pages/modules/HRMS/Expenses/ExpenseClaimForm.tsx';
import EmployeeAdvanceList from './pages/modules/HRMS/Advances/EmployeeAdvanceList.tsx';
import EmployeeAdvanceForm from './pages/modules/HRMS/Advances/EmployeeAdvanceForm.tsx';
import SalarySlipList from './pages/modules/HRMS/Payroll/SalarySlipList.tsx';
import SalarySlipDetail from './pages/modules/HRMS/Payroll/SalarySlipDetail.tsx';
import Profile from './pages/modules/HRMS/Core/Profile.tsx';
import Notifications from './pages/Notifications.tsx';
import Settings from './pages/modules/HRMS/Core/Settings.tsx';
import RecruitmentDashboard from './pages/modules/HRMS/Recruitment/RecruitmentDashboard.tsx';
import EmployeeLifecycleDashboard from './pages/modules/HRMS/Onboarding/EmployeeLifecycleDashboard.tsx';
import OnboardingTrainingDashboard from './pages/modules/HRMS/Onboarding/OnboardingTrainingDashboard.tsx';
import GenericHRMSList from './components/hrms/GenericHRMSList.tsx';
import GenericHRMSForm from './components/hrms/GenericHRMSForm.tsx';
import ExpenseDashboard from './pages/modules/HRMS/Expenses/ExpenseDashboard.tsx';
import PerformanceDashboard from './pages/modules/HRMS/Performance/PerformanceDashboard.tsx';
import PayrollDashboard from './pages/modules/HRMS/Payroll/PayrollDashboard.tsx';
import TaxBenefitsDashboard from './pages/modules/HRMS/TaxBenefits/TaxBenefitsDashboard.tsx';
import CentralHubDashboard from './pages/modules/CentralHub/Dashboard.tsx';
import StockDashboard from './pages/modules/Stock/StockDashboard.tsx';
import AssetsDashboard from './pages/modules/CentralHub/Assets/AssetsDashboard.tsx';
import SalarySlipsDashboard from "./pages/employee/modules/SalarySlipsDashboard";
import AttendanceHistory from "./pages/employee/modules/AttendanceHistory";
import EmployeeAdvancesDashboard from "./pages/employee/modules/EmployeeAdvancesDashboard";
import AssetReports from './pages/modules/CentralHub/Assets/AssetReports.tsx';
import StockReports from './pages/modules/Stock/StockReports.tsx';
import PlanningDashboard from './pages/modules/Planning/PlanningDashboard.tsx';
import PlanningComparison from './pages/modules/Planning/PlanningComparison.tsx';
import KBWorkAnalysis from './pages/modules/Planning/KBWorkAnalysis.tsx';
import ClientBaselineList from "./pages/modules/Planning/ClientBaselineList";
import OperationalScheduleList from "./pages/modules/Planning/OperationalScheduleList";
import PlanningGanttTab from './pages/modules/Planning/PlanningGanttTab.tsx';
import HRMSDashboard from './pages/modules/HRMS/Dashboard.tsx';
import ReportViewer from './components/common/ReportViewer.tsx';
import GenericList from './components/common/GenericList.tsx';
import GenericForm from './components/common/GenericForm.tsx';
import ErrorBoundary from './components/common/ErrorBoundary.tsx';
import RecruitmentWorkflow from './pages/modules/HRMS/Recruitment/RecruitmentWorkflow.tsx';
import LeaveAttendanceWorkflow from './pages/modules/HRMS/LeaveAttendance/LeaveAttendanceWorkflow.tsx';
import PayrollWorkflow from './pages/modules/HRMS/Payroll/PayrollWorkflow.tsx';
import ExpenseWorkflow from './pages/modules/HRMS/Expenses/ExpenseWorkflow.tsx';

import LabourManagement from './pages/modules/LabourManagement/LabourManagement.tsx';
import LabourManagementDashboard from "./pages/modules/Labour/LabourManagementDashboard";
import DailyLabourSummaryList from "./pages/modules/Labour/DailyLabourSummaryList";
import DailyLabourUsageList from "./pages/modules/Labour/DailyLabourUsageList";
// Task Manager Imports
import NewTaskForm from './pages/modules/TaskManager/NewTaskForm.tsx';
import EditTaskForm from './pages/modules/TaskManager/EditTaskForm.tsx';
import BulkTaskCreate from './pages/modules/TaskManager/BulkTaskCreate.tsx';
import TemplateTaskForm from './pages/modules/TaskManager/TemplateTaskForm.tsx';
import BulkTemplateTaskCreate from './pages/modules/TaskManager/BulkTemplateTaskCreate.tsx';
// HRMS Attendance Imports
import AttendancePanel from './pages/modules/HRMS/Attendance/AttendancePanel.tsx';
import AttendanceRequestList from './pages/modules/HRMS/Attendance/AttendanceRequestList.tsx';
import AttendanceRequestForm from './pages/modules/HRMS/Attendance/AttendanceRequestForm.tsx';
import ShiftRequestList from './pages/modules/HRMS/Attendance/ShiftRequestList.tsx';
import ShiftRequestForm from './pages/modules/HRMS/Attendance/ShiftRequestForm.tsx';
import ShiftAssignmentList from './pages/modules/HRMS/Attendance/ShiftAssignmentList.tsx';
import MyAttendance from './pages/modules/HRMS/Attendance/MyAttendance.tsx';
import MyLeaves from './pages/modules/HRMS/Leaves/MyLeaves.tsx';
import MyExpenses from './pages/modules/HRMS/Expenses/MyExpenses.tsx';
import MySalary from './pages/modules/HRMS/Payroll/MySalary.tsx';
import SubcontractorDashboard from "./pages/modules/Subcontractor/SubcontractorDashboard.tsx";
import PaymentStageForm from './pages/modules/Subcontractor/PaymentStageForm.tsx';
import EmployeeMainDashboard from './pages/modules/Dashboard/EmployeeMainDashboard.tsx';
import PerformanceMainDashboard from './pages/modules/Dashboard/PerformanceMainDashboard.tsx';
import { EmployeeLayout } from './pages/employee/EmployeeLayout.tsx';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard.tsx';
import FaceEnrollment from './pages/FaceEnrollment.tsx';


import EarthPitInspectionForm from './pages/modules/Safety/NewEarthPitInspectionForm.tsx';
import GenericSafetyAndQualityForm from './components/common/GenericSafetyAndQualityForm.tsx';
import EmployeeAttendanceTool from './pages/modules/HRMS/Attendance/EmployeeAttendanceTool.tsx';
import MonthlyAttendanceReport from './pages/modules/HRMS/Attendance/MonthlyAttendanceReport.tsx';
import { GenericRouteFormWrapper, GenericRouteListWrapper } from './components/common/GenericRouteWrappers.tsx';
import HRSettings from './pages/modules/HRMS/HRSettings.tsx';
import EnergyPointSettings from './pages/modules/HRMS/EnergyPointSettings.tsx';
import ShiftAssignmentTool from './pages/modules/HRMS/ShiftAssignmentTool.tsx';
import DataImportDashboard from './pages/modules/BulkDataImport/DataImportDashboard.tsx';
import DataImportForm from './pages/modules/BulkDataImport/DataImportForm.tsx';
import DataExportForm from './pages/modules/DataExport/DataExportForm.tsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.tsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      // Employee PWA Routes
      {
        path: "employee",
        element: <EmployeeLayout />,
        children: [
          { path: "dashboard", element: <EmployeeDashboard /> },
          { path: "profile", element: <Profile /> },
          { path: "tasks", element: <GenericList doctype="Task" /> },
          { path: "tasks/:id", element: <EditTaskForm /> },
          { path: "hr", element: <MyLeaves /> },
          { path: "salary-slips", element: <SalarySlipsDashboard /> },
          { path: "attendance", element: <AttendanceHistory /> },
          { path: "advances", element: <EmployeeAdvancesDashboard /> },
          { path: "actions", element: <NewTaskForm /> },
          // PWA Form Routes - Rendered inside EmployeeLayout
          { path: "form/:doctype/:id", element: <GenericRouteFormWrapper /> },
          { path: "form/:doctype", element: <GenericRouteFormWrapper /> }, // Handles /new case implicitly if mapped correctly or use specific route

        ]
      },
      {
        path: "projects",
        element: <GenericList doctype="Project" listFields={["project_name", "status", "percent_complete", "expected_start_date", "expected_end_date"]} />,
      },
      {
        path: "projects/:id",
        element: <GenericForm doctype="Project" />,
      },
      {
        path: "safety",
        element: (
          <ProtectedRoute allowedRoles={["Safety User", "Safety Manager", "System Manager", "Administrator"]}>
            <Safety />
          </ProtectedRoute>
        ),
      },

      // SAFETY LIST AND IMPLEMENTATION

      {
        path: "safety/new-earth-pit-inspection",
        element: <GenericList doctype='Earth Pit Inspection' title='Earth Pit Inspection' listFields={[
          'earth_pit_no', 'task', 'document_no', 'inspection_status'
        ]} />
      },
      {
        path: "safety/new-earth-pit-inspection/:id",
        element: <GenericSafetyAndQualityForm doctype={'Earth Pit Inspection'} statusField='inspection_status' title='Earth Pit Inspection' />
      },
      {
        path: "safety/new-rccb-tracker",
        element: <GenericList doctype='RCCB Tracker' title='RCCB Tracker' />,
      },
      {
        path: "safety/new-rccb-tracker/:id",
        element: <GenericSafetyAndQualityForm doctype={'RCCB Tracker'} title='RCCB Tracker' />,
      }, // <-- Added comma here
      {
        path: "safety/material-inspection",
        element: <GenericList doctype='Material Inspection' title='Material Inspection' listFields={[
          'document_no', 'name_of_the_material', 'inspection_status', 'result'
        ]} />
      },
      {
        path: "safety/material-inspection/:id",
        element: <GenericSafetyAndQualityForm doctype='Material Inspection' statusField='inspection_status' title='Material Inspection' />
      },


      /////////

      {
        path: "safety/new-ehs-and-tool-box",
        element: <GenericList doctype='EHS and Tool Box' title='EHS and Tool Box' />,
      },
      {
        path: "safety/new-ehs-and-tool-box/:id",
        element: <GenericSafetyAndQualityForm doctype='EHS and Tool Box' statusField='inspection_status' title='EHS and Tool Box' />,
      },

      // {
      //   path: "safety/perm-level-test",
      //   element: <GenericList doctype='Perm_level_test' title='Perm Level Test' />
      // },
      // {
      //   path: "safety/perm-level-test/new",
      //   element: <GenericForm doctype='Perm_level_test' title='Perm Level Test' />
      // },
      // {
      //   path: "safety/perm-level-test/:id",
      //   element: <GenericForm doctype='Perm_level_test' title='Perm Level Test' />
      // },

      {
        path: "safety/new-full-body-safety-harness",
        element: (
          <GenericList
            doctype="Full Body safety Harness"
            title="Full Body Safety Harness"

          />
        ),
      },
      {
        path: "safety/new-full-body-safety-harness/:id",
        element: <GenericSafetyAndQualityForm doctype='Full Body safety Harness' title='Full Body safety Harness' />,
      },

      {
        path: "safety/new-height-work-monitoring-report",
        element: (
          <GenericList
            doctype="Height Work Monitoring Report"
            title="Height Work Monitoring Report"

          />
        ),
      },
      {
        path: "safety/new-height-work-monitoring-report/:id",
        element: <GenericSafetyAndQualityForm doctype='Height Work Monitoring Report' title='Height Work Monitoring Report' />,
      },

      {
        path: "safety/new-labour-onboarding-form",
        element: (
          <GenericList
            doctype="Labour Onboarding"
            title="Labour Onboarding"

          />
        ),
      },
      {
        path: "safety/new-labour-onboarding-form/:id",
        element: <GenericSafetyAndQualityForm doctype='Labour Onboarding' title='Labour Onboarding' />,
      },

      {
        path: "safety/new-lifting-tools",
        element: (
          <GenericList
            doctype="Lifting Tools and Tackles"
            title="Lifting Tools and Tackles"

          />
        ),
      },
      {
        path: "safety/new-lifting-tools/:id",
        element: <GenericSafetyAndQualityForm doctype='Lifting Tools and Tackles' title='Lifting Tools and Tackles' />,
      },

      {
        path: "safety/new-accident-report",
        element: (
          <GenericList
            doctype="Accident Report"
            title="Accident Report"

          />
        ),
      },
      {
        path: "safety/new-accident-report/:id",
        element: <GenericSafetyAndQualityForm doctype='Accident Report' title='Accident Report' />,
      },

      {
        path: "safety/new-first-aid-report",
        element: (
          <GenericList
            doctype="First Aid Report"
            title="First Aid Report"

          />
        ),
      },
      {
        path: "safety/new-first-aid-report/:id",
        element: <GenericSafetyAndQualityForm doctype='First Aid Report' title='First Aid Report' />,
      },

      {
        path: "safety/new-incident-report",
        element: (
          <GenericList
            doctype="Incident Report"
            title="Incident Report"

          />
        ),
      },
      {
        path: "safety/new-incident-report/:id",
        element: <GenericSafetyAndQualityForm doctype='Incident Report' title='Incident Report' />,
      },

      // {
      //   path: "safety/new-material-inspection",
      //   element: (
      //     <GenericList
      //       doctype="Material Inspection"
      //       title="Material Inspection"
      //       
      //     />
      //   ),
      // },
      // {
      //   path: "safety/new-material-inspection/:id",
      //   element: <GenericSafetyAndQualityForm doctype='Material Inspection' title='Material Inspection'  />,
      // },

      {
        path: "safety/safety-inspection",
        element: (
          <GenericList
            doctype="Safety Checklist"
            title="Safety Checklist"

          />
        ),
      },
      {
        path: "safety/safety-inspection/:id",
        element: <GenericSafetyAndQualityForm doctype='Safety Checklist' title='Safety Checklist' statusField='inspection_field' />,
      },

      {
        path: "safety/new-near-miss-report",
        element: (
          <GenericList
            doctype="Near Miss Report"
            title="Near Miss Report"

          />
        ),
      },
      {
        path: "safety/new-near-miss-report/:id",
        element: <GenericSafetyAndQualityForm doctype='Near Miss Report' title='Near Miss Report' />,
      },

      {
        path: "safety/safety-checklist-template",
        element: (
          <GenericList
            doctype="Safety Checklist Template"
            title="Safety Checklist Template"

          />
        ),
      },
      {
        path: "safety/safety-checklist-template/:id",
        element: <GenericForm doctype='Safety Checklist Template' />,
      },

      {
        path: "safety/new-pre-medical-form",
        element: (
          <GenericList
            doctype="Pre Medical Form"
            title="Pre Medical Form"

          />
        ),
      },
      {
        path: "safety/new-pre-medical-form/:id",
        element: <GenericSafetyAndQualityForm doctype='Pre Medical Form' title='Pre Medical Form' />,
      },



      // {
      //   path: "safety/new-full-body-safety-harness",
      //   element: <NewFullBodySafetyHarnessForm />,
      // },
      // {
      //   path: "safety/new-height-work-monitoring-report",
      //   element: <NewHeightWorkMonitoringReportForm />,
      // },
      // {
      //   path: "safety/new-labour-onboarding-form",
      //   element: <NewLabourOnboardingForm />,
      // },
      // {
      //   path: "safety/new-lifting-tools",
      //   element: <NewLiftingToolsForm />,
      // },
      // {
      //   path: "safety/new-accident-report",
      //   element: <NewAccidentReportForm />,
      // },
      // {
      //   path: "safety/new-first-aid-report",
      //   element: <NewFirstAidReportForm />,
      // },
      // {
      //   path: "safety/new-incident-report",
      //   element: <NewIncidentReportForm />,
      // },
      // {
      //   path: "safety/new-material-inspection",
      //   element: <NewMaterialInspectionForm />,
      // },

      // {
      //   path: "safety/safety-inspection",
      //   element: <NewSafetyInspectionForm />,
      // },
      // {
      //   path: "safety/new-near-miss-report",
      //   element: <NewNearMissReportForm />,
      // },
      // {
      //   path: "safety/new-pre-medical-form",
      //   element: <NewPreMedicalForm />,
      // },
      {
        path: "labour-management",
        element: (
          <ProtectedRoute allowedRoles={["HR Manager", "HR User", "System Manager", "Administrator"]}>
            <LabourManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "labour-management/dashboard",
        element: <LabourManagementDashboard />,
      },
      {
        path: "planning/work-analysis",
        element: <KBWorkAnalysis />,
      },
      {
        path: "planning/client-baseline",
        element: <GenericList
          doctype="KB Client Baseline"
          title="Client Baselines"
          listFields={['name', 'project', 'start_date', 'end_date', 'is_active', 'docstatus']}
          columnLabels={{
            'is_active': 'Active',
            'docstatus': 'Status'
          }}
        />,
      },
      { path: "planning/client-baseline/:id", element: <GenericForm doctype="KB Client Baseline" /> },
      {
        path: "planning/operational-schedule",
        element: <GenericList
          doctype="KB Operational Schedule"
          title="Operational Schedules"
          listFields={['name', 'project', 'schedule_type', 'start_date', 'docstatus']}
          columnLabels={{
            'schedule_type': 'Type',
            'docstatus': 'Status'
          }}
        />,
      },
      { path: "planning/operational-schedule/new", element: <GenericForm doctype="KB Operational Schedule" /> },
      { path: "planning/operational-schedule/:id", element: <GenericForm doctype="KB Operational Schedule" /> },
      {
        path: "planning/kb-operational-schedule/:id",
        element: (
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <PlanningGanttTab doctype="KB Operational Schedule" />
          </Suspense>
        )
      },

      { path: "stock/material-resource-items", element: <GenericList doctype="Material Resource" title="Material Resources" /> },
      { path: "stock/material-resource-items/:id", element: <GenericForm doctype="Material Resource" title="Material Resource" /> },

      { path: "assets/machinery-resource-items", element: <GenericList doctype="Machinery Resource" title="Machinery Resources" /> },
      { path: "assets/machinery-resource-items/:id", element: <GenericForm doctype="Machinery Resource" title="Machinery Resource" /> },

      { path: "face-enrollment", element: <FaceEnrollment /> },

      // --- Labour Management Routes ---
      { path: "labour-management/daily-labour-summary", element: <DailyLabourSummaryList /> },
      { path: "labour-management/daily-labour-summary/:id", element: <GenericForm doctype="Daily Labour Summary" /> },
      { path: "labour-management/daily-labour-usage", element: <DailyLabourUsageList /> },
      { path: "labour-management/daily-labour-usage/:id", element: <GenericForm doctype="Daily Labour Usage" /> },
      {
        path: "labour-management/labour-onboarding",
        element: <GenericList
          doctype="Labour Onboarding"
          title="Labour Onboarding"
          listFields={['full_name', 'mobile_no', 'gender', 'age', 'sub_contractor_name']}
          columnLabels={{
            'full_name': 'Full Name',
            'mobile_no': 'Mobile Number',
            'gender': 'Gender',
            'age': 'Age',
            'sub_contractor_name': 'Sub Contractor'
          }}
        />
      }, { path: "labour-management/labour-onboarding/:id", element: <GenericForm doctype="Labour Onboarding" /> },
      {
        path: "labour-management/sub-contractor",
        element: <GenericList
          doctype="Sub Contractor"
          title="Sub-Contractors"
          listFields={['sub_contractor_name', 'sub_contractor_type', 'contact', 'pan_no', 'gst_id']}
          columnLabels={{
            'sub_contractor_name': 'Contractor Name',
            'sub_contractor_type': 'Type',
            'contact': 'Contact',
            'pan_no': 'PAN No',
            'gst_id': 'GST ID'
          }}
        />
      },
      { path: "labour-management/sub-contractor/:id", element: <GenericForm doctype="Sub Contractor" /> },
      {
        path: "subcontractor/payment-stages",
        element: <GenericList
          doctype="KB Payment Stage"
          title="Payment Stages"
          listFields={['payment_stage_name', 'name_of_the_project', 'name_of_the_sub_contractor', 'total_bill_amount', 'date']}
          columnLabels={{
            'payment_stage_name': 'Name',
            'name_of_the_project': 'Project',
            'name_of_the_sub_contractor': 'Sub Contractor',
            'total_bill_amount': 'Amount',
            'date': 'Date'
          }}
        />
      }, { path: "subcontractor/payment-stages/:id", element: <PaymentStageForm /> },

      {
        path: "labour-management/kb-labour-type",
        element: <GenericList
          doctype="KB Labour Type"
          title="Labour Types"
          listFields={['labour_type', 'modified', 'modified_by']}
          columnLabels={{
            'labour_type': 'Labour Type',
            'modified': 'Last Modified',
            'modified_by': 'Modified By'
          }}
        />
      },
      { path: "labour-management/kb-labour-type/:id", element: <GenericForm doctype="KB Labour Type" /> },
      {
        path: "labour-management/kb-nature-of-work",
        element: <GenericList
          doctype="KB Nature of Work"
          title="Nature of Work"
          listFields={['nature_of_work', 'modified', 'modified_by']}
          columnLabels={{
            'nature_of_work': 'Nature of Work',
            'modified': 'Last Modified',
            'modified_by': 'Modified By'
          }}
        />
      }, { path: "labour-management/kb-nature-of-work/:id", element: <GenericForm doctype="KB Nature of Work" /> },

      {
        path: "labour-management/workhead-template",
        element: <GenericList
          doctype="Workhead Template"
          title="Workhead Templates"
          listFields={['project', 'workhead_template_name', 'modified', 'modified_by']}
          columnLabels={{
            'project': 'Project',
            'workhead_template_name': 'Template Name',
            'modified': 'Last Modified',
            'modified_by': 'Modified By'
          }}
        />
      }, { path: "labour-management/workhead-template/:id", element: <GenericForm doctype="Workhead Template" /> },
      {
        path: "quality",
        element: (
          <ProtectedRoute allowedRoles={["Quality User", "Quality Manager", "System Manager", "Administrator"]}>
            <Quality />
          </ProtectedRoute>
        ),
      },

      //////////////////////////////////////////////////////

      {
        path: "quality/new-aluform-checklist-template",
        element: <GenericList doctype='Aluform Checklist Inspection' title='Aluform Checklist Inspection' />,
      },
      {
        path: "quality/new-aluform-checklist-template/:id",
        element: <GenericSafetyAndQualityForm doctype='Aluform Checklist Inspection' title='Aluform Checklist Inspection' />,
      },

      {
        path: "quality/new-quality-checklist-inspection",
        element: (
          <GenericList
            doctype="Quality Checklist Inspection"
            title="Quality Checklist Inspection"

          />
        ),
      },
      {
        path: "quality/new-quality-checklist-inspection/:id",
        element: <GenericForm doctype='Quality Checklist Inspection' title='Quality Checklist Inspection' />,
      },

      {
        path: "quality/new-concrete-pour-card",
        element: (
          <GenericList
            doctype="Concrete Pour Card"
            title="Concrete Pour Card"
          />
        ),
      },
      {
        path: "quality/new-concrete-pour-card/:id",
        element: <GenericSafetyAndQualityForm doctype='Concrete Pour Card' title='Concrete Pour Card' />,
      },

      {
        path: "quality/new-dimensions",
        element: (
          <GenericList
            doctype="Dimensions"
            title="Dimensions"
          />
        ),
      },
      {
        path: "quality/new-dimensions/:id",
        element: <GenericSafetyAndQualityForm doctype='Dimensions' title='Dimensions' />,
      },

      {
        path: "quality/new-rcc-handover",
        element: (
          <GenericList
            doctype="RCC Handover"
            title="RCC Handover"

          />
        ),
      },
      {
        path: "quality/new-rcc-handover/:id",
        element: <GenericSafetyAndQualityForm doctype='RCC Handover' title='RCC Handover' />,
      },

      {
        path: "quality/new-request-for-inspection",
        element: (
          <GenericList
            doctype="Request For Inspection"
            title="Request for Inspection"

          />
        ),
      },
      {
        path: "quality/new-request-for-inspection/:id",
        element: <GenericSafetyAndQualityForm doctype='Request For Inspection' title='Request For Inspection' />,
      },

      {
        path: "quality/material-inspection",
        element: <GenericList doctype='Material Inspection' title='Material Inspection' listFields={[
          'document_no', 'name_of_the_material', 'inspection_status', 'result'
        ]} />
      },
      {
        path: "quality/material-inspection/:id",
        element: <GenericSafetyAndQualityForm doctype='Material Inspection' statusField='inspection_status' title='Material Inspection' />
      },

      {
        path: "quality/new-slab-soffit-level",
        element: (
          <GenericList
            doctype="Slab Soffit Level"
            title="Slab Soffit Level"

          />
        ),
      },
      {
        path: "quality/new-slab-soffit-level/:id",
        element: <GenericSafetyAndQualityForm doctype='Slab Soffit Level' title='Slab Soffit Level' />,
      },

      {
        path: "quality/new-upstand-depth",
        element: (
          <GenericList
            doctype="Upstand Depth"
            title="Upstand Depth"

          />
        ),
      },
      {
        path: "quality/new-upstand-depth/:id",
        element: <GenericSafetyAndQualityForm doctype='Upstand Depth' title='Upstand Depth' />,
      },

      {
        path: "quality/new-wall-plumb",
        element: (
          <GenericList
            doctype="Wall Plumb"
            title="Wall Plumb"

          />
        ),
      },
      {
        path: "quality/new-wall-plumb/:id",
        element: <GenericSafetyAndQualityForm doctype='Wall Plumb' title='Wall Plumb' />,
      },


      //////////////////////////////////////////////////////

      // {
      //   path: "quality/new-quality-checklist-inspection",
      //   element: <NewQualityChecklistInspectionForm />,
      // },
      // {
      //   path: "quality/new-concrete-pour-card",
      //   element: <NewConcretePourCardForm />,
      // },
      // {
      //   path: "quality/new-dimensions",
      //   element: <NewDimensionsForm />,
      // },
      // {
      //   path: "quality/new-rcc-handover",
      //   element: <NewRccHandoverForm />,
      // },
      // {
      //   path: "quality/new-request-for-inspection",
      //   element: <NewRequestForInspectionForm />,
      // },
      // {
      //   path: "quality/new-slab-soffit-level",
      //   element: <NewSlabSoffitLevelForm />,
      // },
      // {
      //   path: "quality/new-upstand-depth",
      //   element: <NewUpstandDepthForm />,
      // },
      // {
      //   path: "quality/new-wall-plumb",
      //   element: <NewWallPlumbForm />,
      // },





      {
        path: "p-and-m",
        element: (
          <ProtectedRoute allowedRoles={["Asset Manager", "Asset User", "System Manager", "Administrator"]}>
            <PAndM />
          </ProtectedRoute>
        ),
      },
      {
        path: "p-and-m/new-material-request",
        element: <NewMaterialRequestForm />,
      },

      {
        path: "p-and-m/new-stock-entry",
        element: <NewStockEntryForm />,
      },

      // SPECIALIZED P&M ROUTES
      { path: "p-and-m/new-asset-purchase-request", element: <NewAssetPurchaseRequest /> },
      { path: "p-and-m/new-item-material-request", element: <NewItemMaterialRequest /> },
      { path: "p-and-m/new-asset-transfer", element: <NewAssetTransfer /> },
      { path: "p-and-m/new-asset-issue", element: <NewAssetIssue /> },
      { path: "p-and-m/new-item-material-transfer", element: <NewItemMaterialTransfer /> },
      { path: "p-and-m/new-item-material-issue", element: <NewItemMaterialIssue /> },

      {
        path: "subcontractor/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["Purchase Manager", "Purchase User", "System Manager", "Administrator"]}>
            <SubcontractorDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "labour-management/sub-contractor",
        element: <GenericList
          doctype="Sub Contractors"
          title="Sub Contractors"
          listFields={['sub_contractor_name', 'sub_contractor_type', 'contact', 'pan_no', 'gst_id']}
        />
      }, { path: "labour-management/sub-contractor/:id", element: <GenericForm doctype="Sub Contractor" /> },
      {
        path: "subcontractor/sub-contractor-labour-rates",
        element: (
          <GenericList
            doctype="Sub Contractor Labour Rates"
            title="Labour Rates"
            listFields={[
              "name",
              "sub_contractor",
              "sub_contractor_name",
              "project",
              "project_name",
            ]}
          />
        ),
      },
      {
        path: "subcontractor/sub-contractor-labour-rates/:id",
        element: <GenericForm doctype="Sub Contractor Labour Rates" />,
      },
      {
        path: "labour-management/labour-attendance",
        element: (
          <GenericList
            doctype="Labour Attendance"   // use EXACT doctype name
            title="Labour Attendance"
            listFields={[
              "name",
              "employee",
              "attendance_date",
              "status"
            ]}
          />
        )
      },
      {
        path: "labour-management/labour-attendance/:id",
        element: <GenericForm doctype="Labour Attendance" />
      },

      {
        path: "subcontractor/kb-kharchi",
        element: (
          <GenericList
            doctype="KB Kharchi"
            title="Kharchi"
            listFields={[
              "name",
              "subcontractor",
              "project",
              "date",
              "kharchi_amount",
              "reference_no"
            ]}
            columnLabels={{
              "subcontractor": "Subcontractor",
              "project": "Project",
              "date": "Date",
              "kharchi_amount": "Amount",
              "reference_no": "Reference No"
            }}
          />
        )
      },
      {
        path: "subcontractor/kb-kharchi/:id",
        element: <GenericForm doctype="KB Kharchi" />
      },

      {
        path: "labour-management/daily-labour-cost-report",
        element: (
          <GenericList
            doctype="KB Daily Labour Cost Report"
            title="Daily Labour Cost Report"
            listFields={[
              "name",
              "project",
              "date",
              "total_labour_cost",
              "status"
            ]}
          />
        )
      },
      {
        path: "labour-management/daily-labour-cost-report/:id",
        element: <GenericForm doctype="KB Daily Labour Cost Report" />
      },

      {
        path: "subcontractor/sub-contractor-workhead",
        element: <GenericList
          doctype="Sub Contractor Workhead"
          title="Workheads"
          listFields={['workhead_name', 'uom', 'description']}
        />
      }, { path: "subcontractor/sub-contractor-workhead/:id", element: <GenericForm doctype="Sub Contractor Workhead" /> },

      {
        path: "labour-management/sub-contractor-workhead",
        element: <GenericList
          doctype="Sub Contractor Workhead"
          title="Workheads"
          listFields={['workhead_name', 'uom', 'description']}
        />
      }, { path: "labour-management/sub-contractor-workhead/:id", element: <GenericForm doctype="Sub Contractor Workhead" /> },
      {
        path: "subcontractor/subcontractor-work-order",
        element: <GenericList
          doctype="Subcontractor Work Order"
          title="Work Orders"
          listFields={['subcontractor', 'work_order_date', 'status', 'project']}
        />
      }, { path: "subcontractor/subcontractor-work-order/:id", element: <GenericForm doctype="Subcontractor Work Order" /> },
      {
        path: "subcontractor/work-order-type",
        element: <GenericList
          doctype="Work Order Type"
          title="Work Order Types"
          listFields={['work_order_type']}
        />
      }, { path: "subcontractor/work-order-type/:id", element: <GenericForm doctype="Work Order Type" /> },
      {
        path: "subcontractor/subwork",
        element: <GenericList
          doctype="SubWork"
          title="Sub Work"
          listFields={['project', 'rcc_type', 'net_rate']}
        />
      }, { path: "subcontractor/subwork/:id", element: <GenericForm doctype="SubWork" /> },
      { path: "subcontractor/subwork/:id", element: <GenericForm doctype="SubWork" /> },

      {
        path: "subcontractor/kb-payment-stage-type",
        element: <GenericList
          doctype="KB Payment Stage Type"
          title="Payment Stage Types"
          listFields={['payment_stage_type']}
        />
      }, { path: "subcontractor/kb-payment-stage-type/:id", element: <GenericForm doctype="KB Payment Stage Type" /> },



      {
        path: "task-manager",
        element: (
          <ProtectedRoute allowedRoles={["Project Manager", "Projects User", "System Manager", "Administrator"]}>
            <TaskManager />
          </ProtectedRoute>
        ),
      },
      {
        path: "task-manager/tree",
        element: (
          <ProtectedRoute allowedRoles={["Project Manager", "Projects User", "System Manager", "Administrator"]}>
            <TaskTree />
          </ProtectedRoute>
        ),
      },
      {
        path: "task-manager/tasks",
        element: (
          <ProtectedRoute allowedRoles={["Project Manager", "Projects User", "System Manager", "Administrator"]}>
            <TaskList />
          </ProtectedRoute>
        ),
      },
      {
        path: "employee-main-dashboard",
        element: <EmployeeMainDashboard />
      },
      {
        path: "performance-main-dashboard",
        element: <PerformanceMainDashboard />
      },
      {
        path: "task-manager/daily-assignment",
        element: <DailyAssignment />,
      },
      {
        path: "task-manager/library-selection",
        element: <TaskLibrarySelection />,
      },
      {
        path: "task-manager/new",
        element: <NewTaskForm />,
      },
      {
        path: "task-manager/edit/:taskName",
        element: <EditTaskForm />,
      },
      {
        path: "task-manager/bulk-create",
        element: <BulkTaskCreate />,
      },
      {
        path: "task-manager/bulk-template-create",
        element: <BulkTemplateTaskCreate />,
      },
      {
        path: "/task-manager/template/new",
        element: <TemplateTaskForm />
      },
      {
        path: "/task-manager/template/new",
        element: <TemplateTaskForm />
      },
      {
        path: "tasks",
        element: <div>Tasks Coming Soon...</div>,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
      {
        path: "team",
        element: <div>Team Management Coming Soon...</div>,
        children: [
          {
            path: "members",
            element: <div>Team Members</div>,
          },
          {
            path: "departments",
            element: <div>Departments</div>,
          },
        ],
      },
      {
        path: "reports",
        element: <div>Reports Coming Soon...</div>,
        children: [
          {
            path: "analytics",
            element: <div>Analytics</div>,
          },
          {
            path: "activity",
            element: <div>Activity Reports</div>,
          },
        ],
      },
      {
        path: "inventory",
      },
      {
        path: "hrms/payroll/workflow",
        element: <PayrollWorkflow />,
      },
      {
        path: "hrms/expenses/workflow",
        element: <ExpenseWorkflow />,
      },


      {
        path: "hrms/attendance",
        element: <GenericHRMSList doctype='Attendance' />
      },
      {
        path: "hrms/attendance/:id",
        element: <GenericHRMSForm doctype='Attendance' title='Attendance' />,
      },
      {
        path: "hrms/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["HR Manager", "HR User", "System Manager", "Administrator"]}>
            <HRMSDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "hrms/employee-dashboard",
        element: <EmployeeMainDashboard />,
      },
      {
        path: "hrms/attendance/my-attendance",
        element: <MyAttendance />,
      },
      {
        path: "hrms/attendance-requests",
        element: <GenericHRMSList doctype='Attendance Request' />,
      },
      {
        path: "hrms/attendance-requests/:id",
        element: <GenericHRMSForm doctype='Attendance Request' title='Attendance Request' />,
      },

      { path: "hrms/shifts", element: <ShiftAssignmentList />, },

      { path: "hrms/shift" },

      { path: "hrms/attendance/attendance", element: <GenericHRMSList doctype="Attendance" /> },

      { path: "hrms/recruitment/job-requisitions", element: <GenericHRMSList doctype='Job Requisition' /> },
      { path: "hrms/recruitment/job-requisitions/:id", element: <GenericHRMSForm doctype='Job Requisition' /> },

      { path: "hrms/recruitment/employee-referrals", element: <GenericHRMSList doctype='Employee Referral' /> },
      { path: "hrms/recruitment/employee-referrals/:id", element: <GenericHRMSForm doctype='Employee Referral' /> },

      { path: "hrms/recruitment/interview-types", element: <GenericHRMSList doctype='Interview Type' /> },
      { path: "hrms/recruitment/interview-types/:id", element: <GenericHRMSForm doctype='Interview Type' /> },

      { path: "hrms/recruitment/interview-rounds", element: <GenericHRMSList doctype='Interview Round' /> },
      { path: "hrms/recruitment/interview-rounds/:id", element: <GenericHRMSForm doctype='Interview Round' /> },

      { path: "hrms/recruitment/interviews", element: <GenericHRMSList doctype='Interview' /> },
      { path: "hrms/recruitment/interviews/:id", element: <GenericHRMSForm doctype='Interview' /> },

      { path: "hrms/recruitment/appointment-letter-templates", element: <GenericHRMSList doctype='Appointment Letter Template' /> },
      { path: "hrms/recruitment/appointment-letter-templates/:id", element: <GenericHRMSForm doctype='Appointment Letter Template' /> },

      { path: "hrms/recruitment/appointment-letters", element: <GenericHRMSList doctype='Appointment Letter' /> },
      { path: "hrms/recruitment/appointment-letters/:id", element: <GenericHRMSForm doctype='Appointment Letter' /> },

      { path: "hrms/recruitment/analytics", element: <RecruitmentDashboard defaultTab="analytics" /> },
      { path: "hrms/recruitment/analytics/:id", element: <GenericHRMSForm doctype='Recruitment Analytics' /> },

      { path: "hrms/attendance/attendance/:id", element: <GenericHRMSForm doctype="Attendance" /> },
      // Alias for WorkflowTree route
      { path: "hrms/attendance/mark", element: <AttendancePanel /> },
      { path: "hrms/attendance/mark/:id", element: <GenericHRMSForm doctype="Attendance" /> },

      { path: "hrms/attendance/upload-attendance", element: <GenericHRMSList doctype="Upload Attendance" /> },
      { path: "hrms/attendance/upload-attendance/:id", element: <GenericHRMSForm doctype="Upload Attendance" /> },

      { path: "hrms/attendance/employee-attendance-tool", element: <EmployeeAttendanceTool /> },

      { path: "hrms/attendance/upload", element: <GenericHRMSList doctype='Upload Attendance' /> },
      { path: "hrms/attendance/upload/:id", element: <GenericHRMSForm doctype='Upload Attendance' /> },

      { path: "hrms/attendance/timesheets", element: <GenericHRMSList doctype='Timesheet' /> },
      { path: "hrms/attendance/timesheets/:id", element: <GenericHRMSForm doctype='Timesheet' /> },

      { path: "hrms/attendance/activity-types", element: <GenericHRMSList doctype='Activity Type' /> },
      { path: "hrms/attendance/activity-types/:id", element: <GenericHRMSForm doctype='Activity Type' /> },

      { path: "hrms/attendance/reports/:reportName", element: <ReportViewer /> },

      // Shift Type Routes (Added)
      { path: "hrms/attendance/shift-type", element: <GenericHRMSList doctype="Shift Type" /> },
      { path: "hrms/attendance/shift-type/:id", element: <GenericHRMSForm doctype="Shift Type" /> },

      { path: "hrms/attendance/shift-assignment", element: <GenericHRMSList doctype="Shift Assignment" /> },
      { path: "hrms/attendance/shift-assignment/:id", element: <GenericHRMSForm doctype="Shift Assignment" /> },

      { path: "hrms/attendance/shift-assignment-tool", element: <ShiftAssignmentTool /> },
      // { path: "hrms/attendance/shift-assignment-tool/:id", element: <GenericHRMSForm doctype="Shift Assignment Tool" /> },

      // Shift Request Routes (Matching WorkflowTree)
      { path: "hrms/attendance/shift-requests", element: <GenericHRMSList doctype='Shift Request' /> },
      { path: "hrms/attendance/shift-requests/new", element: <GenericHRMSForm doctype='Shift Request' title='Shift Request' /> },

      // {
      //   path: "hrms/shift-requests",
      //   element: <GenericHRMSList doctype='Shift Request' />,
      // },
      // {
      //   path: "hrms/shift-requests/new",
      //   element: <GenericHRMSForm doctype='Shift Request' title='Shift Request' />,
      // },

      { path: "hrms/attendance/shift-location", element: <GenericHRMSList doctype="Shift Location" /> },
      { path: "hrms/attendance/shift-location/:id", element: <GenericHRMSForm doctype="Shift Location" /> },
      { path: "hrms/attendance/shift-schedule", element: <GenericHRMSList doctype="Shift Schedule" /> },
      { path: "hrms/attendance/shift-schedule/:id", element: <GenericHRMSForm doctype="Shift Schedule" /> },
      { path: "hrms/attendance/shift-schedule-assignment", element: <GenericHRMSList doctype="Shift Schedule Assignment" /> },
      { path: "hrms/attendance/shift-schedule-assignment/:id", element: <GenericHRMSForm doctype="Shift Schedule Assignment" /> },
      { path: "hrms/attendance/employee-checkin", element: <GenericHRMSList doctype="Employee Checkin" /> },
      { path: "hrms/attendance/employee-checkin/:id", element: <GenericHRMSForm doctype="Employee Checkin" /> },
      {
        path: "hrms/leaves",
        element: <LeaveDashboard />,
      },
      {
        path: "hrms/leaves/my-leaves",
        element: <MyLeaves />,
      },
      {
        path: "hrms/leave-applications",
        element: <LeaveApplicationList />,
      },
      {
        path: "hrms/leave-applications/:id",
        element: <GenericHRMSForm doctype='Leave Application' />,
      },
      {
        path: "hrms/leave-applications/new",
        element: <GenericHRMSForm doctype='Leave Application' />,
      },
      {
        path: "hrms/expenses",
        element: <ExpenseDashboard />,
      },
      {
        path: "hrms/expenses/my-expenses",
        element: <MyExpenses />,
      },
      {
        path: "hrms/expense-claims",
        element: <ExpenseClaimList />,
      },
      {
        path: "hrms/expense-claims/new",
        element: <ExpenseClaimForm />,
      },
      {
        path: "hrms/advances",
        element: <EmployeeAdvanceList />,
      },
      {
        path: "hrms/advances/new",
        element: <EmployeeAdvanceForm />,
      },
      {
        path: "hrms/salary-slips",
        element: <SalarySlipList />,
      },
      {
        path: "hrms/salary-slips/my-salary",
        element: <MySalary />,
      },
      {
        path: "hrms/salary-slips/:id",
        element: <SalarySlipDetail />,
      },
      {
        path: "hrms/profile",
        element: <Profile />,
      },
      {
        path: "hrms/notifications",
        element: <Notifications />,
      },
      {
        path: "hrms/recruitment",
        element: <RecruitmentDashboard />,
      },
      {
        path: "hrms/onboarding",
        element: <EmployeeLifecycleDashboard />,
      },
      {
        path: "hrms/employee-lifecycle",
        element: <EmployeeLifecycleDashboard />,
      },

      {
        path: "hrms/employee-lifecycle/onboarding",
        element: <GenericHRMSList doctype='Employee Onboarding' />
      },
      {
        path: "hrms/employee-lifecycle/onboarding/:id",
        element: <GenericHRMSForm doctype='Employee Onboarding' title='Employee Onboarding' />,
      },

      {
        path: "hrms/employee-lifecycle/training",
        element: <OnboardingTrainingDashboard />
        //         element: <GenericHRMSList doctype='Training Event' title='Training Event' />
      },
      {
        path: "hrms/employee-lifecycle/training/:id",
        element: <GenericHRMSForm doctype='Training Event' title='Training Event' />,
      },

      {
        path: "hrms/employee-lifecycle/grievance",
        element: <GenericHRMSList doctype='Employee Grievance' />
      },
      {
        path: "hrms/employee-lifecycle/grievance/:id",
        element: <GenericHRMSForm doctype='Employee Grievance' title='Employee Grievance
' />,
      },
      {
        path: "hrms/employee-lifecycle/separation",
        element: <EmployeeLifecycleDashboard />,
      },
      {
        path: "hrms/employee-lifecycle/reports",
        element: <EmployeeLifecycleDashboard />,
      },
      {
        path: "hrms/reports/:reportName",
        element: <ReportViewer />,
      },
      {
        path: "hrms/settings",
        element: <Settings />,
      },
      // --- Recruitment Routes ---
      { path: "hrms/recruitment/job-openings", element: <GenericHRMSList doctype="Job Opening" listFields={['job_title', 'status', 'department']} /> },
      { path: "hrms/recruitment/job-openings/:id", element: <GenericHRMSForm doctype="Job Opening" /> },
      { path: "hrms/recruitment/job-applicants", element: <GenericHRMSList doctype="Job Applicant" listFields={['applicant_name', 'status', 'email_id']} /> },
      { path: "hrms/recruitment/job-applicants/:id", element: <GenericHRMSForm doctype="Job Applicant" /> },
      { path: "hrms/recruitment/job-offers", element: <GenericHRMSList doctype="Job Offer" listFields={['applicant_name', 'status', 'offer_date']} /> },
      { path: "hrms/recruitment/job-offers/:id", element: <GenericHRMSForm doctype="Job Offer" /> },
      { path: "hrms/recruitment/staffing-plan", element: <GenericHRMSList doctype="Staffing Plan" /> },
      { path: "hrms/recruitment/staffing-plan/:id", element: <GenericHRMSForm doctype="Staffing Plan" /> },
      { path: "hrms/recruitment/job-requisition", element: <GenericHRMSList doctype="Job Requisition" /> },
      { path: "hrms/recruitment/job-requisition/:id", element: <GenericHRMSForm doctype="Job Requisition" /> },
      { path: "hrms/recruitment/employee-referral", element: <GenericHRMSList doctype="Employee Referral" /> },
      { path: "hrms/recruitment/employee-referral/:id", element: <GenericHRMSForm doctype="Employee Referral" /> },
      { path: "hrms/recruitment/interviews", element: <GenericHRMSList doctype="Interview" /> },
      { path: "hrms/recruitment/interviews/:id", element: <GenericHRMSForm doctype="Interview" /> },
      { path: "hrms/recruitment/interview-type", element: <GenericHRMSList doctype="Interview Type" /> },
      { path: "hrms/recruitment/interview-type/:id", element: <GenericHRMSForm doctype="Interview Type" /> },

      // Employee Routes
      { path: "hrms/employee", element: <GenericHRMSList doctype="Employee" listFields={['employee_name', 'designation', 'department']} /> },
      { path: "hrms/employee/:id", element: <GenericHRMSForm doctype="Employee" /> },

      // Designation Routes
      { path: "hrms/designation", element: <GenericHRMSList doctype="Designation" /> },
      { path: "hrms/designation/:id", element: <GenericHRMSForm doctype="Designation" /> },

      { path: "hrms/recruitment/interview-round", element: <GenericHRMSList doctype="Interview Round" /> },
      { path: "hrms/recruitment/interview-round/:id", element: <GenericHRMSForm doctype="Interview Round" /> },
      { path: "hrms/recruitment/interview-feedback", element: <GenericHRMSList doctype="Interview Feedback" /> },
      { path: "hrms/recruitment/interview-feedback/:id", element: <GenericHRMSForm doctype="Interview Feedback" /> },
      { path: "hrms/recruitment/appointment-letter", element: <GenericHRMSList doctype="Appointment Letter" /> },
      { path: "hrms/recruitment/appointment-letter/:id", element: <GenericHRMSForm doctype="Appointment Letter" /> },
      { path: "hrms/recruitment/appointment-letter-template", element: <GenericHRMSList doctype="Appointment Letter Template" /> },
      { path: "hrms/recruitment/appointment-letter-template/:id", element: <GenericHRMSForm doctype="Appointment Letter Template" /> },
      { path: "hrms/recruitment/job-applicant-source", element: <GenericHRMSList doctype="Job Applicant Source" /> },
      { path: "hrms/recruitment/job-applicant-source/:id", element: <GenericHRMSForm doctype="Job Applicant Source" /> },
      { path: "hrms/recruitment/job-offer-term-template", element: <GenericHRMSList doctype="Job Offer Term Template" /> },
      { path: "hrms/recruitment/job-offer-term-template/:id", element: <GenericHRMSForm doctype="Job Offer Term Template" /> },
      { path: "hrms/recruitment/offer-term", element: <GenericHRMSList doctype="Offer Term" /> },
      { path: "hrms/recruitment/offer-term/:id", element: <GenericHRMSForm doctype="Offer Term" /> },

      // --- Onboarding & Training Routes ---
      { path: "hrms/onboarding/template", element: <GenericHRMSList doctype="Employee Onboarding Template" /> },
      { path: "hrms/onboarding/template/:id", element: <GenericHRMSForm doctype="Employee Onboarding Template" /> },
      /////
      { path: "hrms/onboarding/onboarding", element: <GenericHRMSList doctype="Employee Onboarding" /> },
      { path: "hrms/onboarding/onboarding/:id", element: <GenericHRMSForm doctype="Employee Onboarding" /> },
      /////
      { path: "hrms/onboarding/skill-map", element: <GenericHRMSList doctype="Employee Skill Map" /> },
      { path: "hrms/onboarding/skill-map/:id", element: <GenericHRMSForm doctype="Employee Skill Map" /> },
      { path: "hrms/grievance/type", element: <GenericHRMSList doctype="Grievance Type" /> },
      { path: "hrms/grievance/type/:id", element: <GenericHRMSForm doctype="Grievance Type" /> },
      { path: "hrms/grievance/grievance", element: <GenericHRMSList doctype="Employee Grievance" /> },
      { path: "hrms/grievance/grievance/:id", element: <GenericHRMSForm doctype="Employee Grievance" /> },
      { path: "hrms/training/program", element: <GenericHRMSList doctype="Training Program" /> },
      { path: "hrms/training/program/:id", element: <GenericHRMSForm doctype="Training Program" /> },
      { path: "hrms/training/event", element: <GenericHRMSList doctype="Training Event" /> },
      { path: "hrms/training/event/:id", element: <GenericHRMSForm doctype="Training Event" /> },
      { path: "hrms/training/feedback", element: <GenericHRMSList doctype="Training Feedback" /> },
      { path: "hrms/training/feedback/:id", element: <GenericHRMSForm doctype="Training Feedback" /> },
      { path: "hrms/training/result", element: <GenericHRMSList doctype="Training Result" /> },
      { path: "hrms/training/result/:id", element: <GenericHRMSForm doctype="Training Result" /> },


      { path: "hrms/daily-work-summary/summary", element: <GenericHRMSList doctype="Daily Work Summary" title='Daily Work Summary' /> },
      { path: "hrms/daily-work-summary/summary/new", element: <GenericHRMSForm doctype="Daily Work Summary" title='Daily Work Summary' /> },
      { path: "hrms/daily-work-summary/group", element: <GenericHRMSList doctype="Daily Work Summary Group" title='Daily Work Summary Group' /> },
      { path: "hrms/daily-work-summary/group/new", element: <GenericHRMSForm doctype="Daily Work Summary Group" title='Daily Work Summary Group' /> },


      { path: "hrms/daily-work-summary/replies", element: <GenericHRMSList doctype="Daily Work Summary Replies" /> },
      { path: "hrms/daily-work-summary/replies/:id", element: <GenericHRMSForm doctype="Daily Work Summary Replies" /> },


      //-- Report Attendance Part --
      { path: "" },

      // --- Separation Routes ---
      { path: "hrms/separation/separation", element: <GenericHRMSList doctype="Employee Separation" /> },
      { path: "hrms/separation/separation/:id", element: <GenericHRMSForm doctype="Employee Separation" /> },
      { path: "hrms/separation/template", element: <GenericHRMSList doctype="Employee Separation Template" /> },
      { path: "hrms/separation/template/:id", element: <GenericHRMSForm doctype="Employee Separation Template" /> },
      { path: "hrms/employee-lifecycle/employee-transfer", element: <GenericHRMSList doctype="Employee Transfer" /> },
      { path: "hrms/employee-lifecycle/employee-transfer/:id", element: <GenericHRMSForm doctype="Employee Transfer" /> },
      { path: "hrms/employee-lifecycle/exit-interview", element: <GenericHRMSList doctype="Exit Interview" /> },
      { path: "hrms/employee-lifecycle/exit-interview/:id", element: <GenericHRMSForm doctype="Exit Interview" /> },

      // --- Leaves Routes ---
      { path: "hrms/leaves/holiday-list", element: <GenericHRMSList doctype="Holiday List" /> },
      { path: "hrms/leaves/holiday-list/:id", element: <GenericHRMSForm doctype="Holiday List" /> },
      { path: "hrms/leaves/leave-type", element: <GenericHRMSList doctype="Leave Type" /> },
      { path: "hrms/leaves/leave-type/:id", element: <GenericHRMSForm doctype="Leave Type" /> },
      { path: "hrms/leaves/leave-period", element: <GenericHRMSList doctype="Leave Period" /> },
      { path: "hrms/leaves/leave-period/:id", element: <GenericHRMSForm doctype="Leave Period" /> },
      { path: "hrms/leaves/leave-policy", element: <GenericHRMSList doctype="Leave Policy" /> },

      { path: "hrms/leaves/leave-policy-assignment", element: <GenericHRMSList doctype='Leave Policy Assignment' /> },
      { path: "hrms/leaves/leave-policy-assignment/:id", element: <GenericHRMSForm doctype='Leave Policy Assignment' /> },

      // --- Skill Checklist Routes ---
      { path: "hrms/designation-skill/daily", element: <GenericHRMSList doctype="Daily Skill Checklist" listFields={['date', 'person_name', 'designation']} /> },
      { path: "hrms/designation-skill/daily/:id", element: <GenericHRMSForm doctype="Daily Skill Checklist" /> },
      { path: "hrms/designation-skill/weekly", element: <GenericHRMSList doctype="Weekly Skill Checklist" listFields={['date', 'person_name', 'designation']} /> },
      { path: "hrms/designation-skill/weekly/:id", element: <GenericHRMSForm doctype="Weekly Skill Checklist" /> },
      { path: "hrms/designation-skill/monthly", element: <GenericHRMSList doctype="Monthly Skill Checklist" listFields={['date', 'person_name', 'designation']} /> },
      { path: "hrms/designation-skill/monthly/:id", element: <GenericHRMSForm doctype="Monthly Skill Checklist" /> },
      { path: "hrms/designation-skill/yearly", element: <GenericHRMSList doctype="Yearly Skill Checklist" listFields={['date', 'person_name', 'designation']} /> },
      { path: "hrms/designation-skill/yearly/:id", element: <GenericHRMSForm doctype="Yearly Skill Checklist" /> },
      { path: "hrms/leaves/leave-policy/:id", element: <GenericHRMSForm doctype="Leave Policy" /> },
      { path: "hrms/leaves/leave-block-list", element: <GenericHRMSList doctype="Leave Block List" /> },
      { path: "hrms/leaves/leave-block-list/:id", element: <GenericHRMSForm doctype="Leave Block List" /> },
      { path: "hrms/leaves/allocation", element: <GenericHRMSList doctype="Leave Allocation" /> },
      { path: "hrms/leaves/allocation/:id", element: <GenericHRMSForm doctype="Leave Allocation" /> },
      { path: "hrms/leaves/policy-assignment", element: <GenericHRMSList doctype="Leave Policy Assignment" /> },
      { path: "hrms/leaves/policy-assignment/:id", element: <GenericHRMSForm doctype="Leave Policy Assignment" /> },
      { path: "hrms/leaves/compensatory-request", element: <GenericHRMSList doctype="Compensatory Leave Request" /> },
      { path: "hrms/leaves/compensatory-request/:id", element: <GenericHRMSForm doctype="Compensatory Leave Request" /> },
      { path: "hrms/leaves/encashment", element: <GenericHRMSList doctype="Leave Encashment" /> },
      { path: "hrms/leaves/encashment/:id", element: <GenericHRMSForm doctype="Leave Encashment" /> },
      { path: "hrms/leaves/leave-adjustment", element: <GenericHRMSList doctype="Leave Adjustment" /> },
      { path: "hrms/leaves/leave-adjustment/:id", element: <GenericHRMSForm doctype="Leave Adjustment" /> },
      { path: "hrms/leaves/leave-control-panel", element: <GenericHRMSList doctype="Leave Control Panel" /> },
      { path: "hrms/leaves/leave-control-panel/:id", element: <GenericHRMSForm doctype="Leave Control Panel" /> },
      { path: "hrms/leaves/leave-ledger-entry", element: <GenericHRMSList doctype="Leave Ledger Entry" /> },
      { path: "hrms/leaves/leave-ledger-entry/:id", element: <GenericHRMSForm doctype="Leave Ledger Entry" /> },

      // --- Setup/Core Routes ---
      { path: "hrms/setup/company", element: <GenericHRMSList doctype="Company" /> },
      { path: "hrms/setup/company/:id", element: <GenericHRMSForm doctype="Company" /> },
      { path: "hrms/setup/branch", element: <GenericHRMSList doctype="Branch" /> },
      { path: "hrms/setup/branch/:id", element: <GenericHRMSForm doctype="Branch" /> },
      { path: "hrms/setup/department", element: <GenericHRMSList doctype="Department" /> },
      { path: "hrms/setup/department/:id", element: <GenericHRMSForm doctype="Department" /> },
      { path: "hrms/setup/designation", element: <GenericHRMSList doctype="Designation" /> },
      { path: "hrms/setup/designation/:id", element: <GenericHRMSForm doctype="Designation" /> },
      { path: "hrms/setup/employee-group", element: <GenericHRMSList doctype="Employee Group" /> },
      { path: "hrms/setup/employee-group/:id", element: <GenericHRMSForm doctype="Employee Group" /> },
      { path: "hrms/setup/employee-grade", element: <GenericHRMSList doctype="Employee Grade" /> },
      { path: "hrms/setup/employee-grade/:id", element: <GenericHRMSForm doctype="Employee Grade" /> },
      { path: "hrms/employees", element: <GenericHRMSList doctype="Employee" listFields={['employee_name', 'status', 'department', 'designation']} /> },
      { path: "hrms/employees/:id", element: <GenericHRMSForm doctype="Employee" /> },
      { path: "hrms/setup/employment-type", element: <GenericHRMSList doctype="Employment Type" /> },
      { path: "hrms/setup/employment-type/:id", element: <GenericHRMSForm doctype="Employment Type" /> },
      { path: "hrms/setup/hr-settings", element: <HRSettings /> },
      { path: "hrms/setup/hr-settings/:id", element: <GenericHRMSForm doctype="HR Settings" /> },
      { path: "hrms/setup/identification-document-type", element: <GenericHRMSList doctype="Identification Document Type" /> },
      { path: "hrms/setup/identification-document-type/:id", element: <GenericHRMSForm doctype="Identification Document Type" /> },
      { path: "hrms/setup/skill", element: <GenericHRMSList doctype="Skill" title='Checklist Items' /> },
      { path: "hrms/setup/skill/:id", element: <GenericHRMSForm doctype="Skill" title='Checklist Items' /> },
      { path: "hrms/setup/pwa-notification", element: <GenericHRMSList doctype="PWA Notification" /> },
      { path: "hrms/setup/pwa-notification/:id", element: <GenericHRMSForm doctype="PWA Notification" /> },

      // --- Expenses Routes ---
      { path: "hrms/expenses", element: <ExpenseDashboard /> },
      { path: "hrms/expenses/expense-claim", element: <GenericHRMSList doctype="Expense Claim" /> },
      { path: "hrms/expenses/expense-claim/:id", element: <GenericHRMSForm doctype="Expense Claim" /> },
      { path: "hrms/expenses/expense-claim-type", element: <GenericHRMSList doctype="Expense Claim Type" /> },
      { path: "hrms/expenses/expense-claim-type/:id", element: <GenericHRMSForm doctype="Expense Claim Type" /> },
      { path: "hrms/expenses/employee-advance", element: <GenericHRMSList doctype="Employee Advance" /> },
      { path: "hrms/expenses/employee-advance/:id", element: <GenericHRMSForm doctype="Employee Advance" /> },
      { path: "hrms/expenses/payment-entry", element: <GenericHRMSList doctype="Payment Entry" /> },
      { path: "hrms/expenses/payment-entry/:id", element: <GenericHRMSForm doctype="Payment Entry" /> },
      { path: "hrms/expenses/journal-entry", element: <GenericHRMSList doctype="Journal Entry" /> },
      { path: "hrms/expenses/journal-entry/:id", element: <GenericHRMSForm doctype="Journal Entry" /> },
      { path: "hrms/expenses/vehicle", element: <GenericHRMSList doctype="Vehicle" /> },
      { path: "hrms/expenses/vehicle/:id", element: <GenericHRMSForm doctype="Vehicle" /> },
      { path: "hrms/expenses/vehicle-service", element: <GenericHRMSList doctype="Vehicle Service" /> },
      { path: "hrms/expenses/vehicle-service/:id", element: <GenericHRMSForm doctype="Vehicle Service" /> },
      { path: "hrms/expenses/driver", element: <GenericHRMSList doctype="Driver" /> },
      { path: "hrms/expenses/driver/:id", element: <GenericHRMSForm doctype="Driver" /> },
      { path: "hrms/expenses/vehicle-service-item", element: <GenericHRMSList doctype="Vehicle Service Item" /> },
      { path: "hrms/expenses/vehicle-service-item/:id", element: <GenericHRMSForm doctype="Vehicle Service Item" /> },
      { path: "hrms/expenses/vehicle-log", element: <GenericHRMSList doctype="Vehicle Log" /> },
      { path: "hrms/expenses/vehicle-log/:id", element: <GenericHRMSForm doctype="Vehicle Log" /> },
      { path: "hrms/expenses/vehicle-expenses", element: <GenericHRMSList doctype="Vehicle Expenses" /> },
      { path: "hrms/expenses/vehicle-expenses/:id", element: <GenericHRMSForm doctype="Vehicle Expenses" /> },
      { path: "hrms/expenses/travel-request", element: <GenericHRMSList doctype="Travel Request" /> },
      { path: "hrms/expenses/travel-request/:id", element: <GenericHRMSForm doctype="Travel Request" /> },
      { path: "hrms/expenses/purpose-of-travel", element: <GenericHRMSList doctype="Purpose of Travel" /> },
      { path: "hrms/expenses/purpose-of-travel/:id", element: <GenericHRMSForm doctype="Purpose of Travel" /> },
      // { path: "hrms/expenses/vehicle-repair", element: <GenericHRMSList doctype="Vehicle Repair" /> },
      // { path: "hrms/expenses/vehicle-repair/:id", element: <GenericHRMSForm doctype="Vehicle Repair" /> },

      // --- Attendance Reports --

      { path: "hrms/attendance/reports/monthly-attendance", element: <MonthlyAttendanceReport /> },

      // --- Core/CRM Routes for Address & Contact ---
      { path: "address", element: <GenericHRMSList doctype="Address" listFields={['address_title', 'address_type', 'city', 'country']} /> },
      { path: "address/:id", element: <GenericForm doctype="Address" /> },
      { path: "contact", element: <GenericHRMSList doctype="Contact" listFields={['full_name', 'email_id', 'mobile_no']} /> },
      { path: "contact/:id", element: <GenericForm doctype="Contact" /> },

      // --- Performance Routes ---
      { path: "hrms/performance", element: <PerformanceDashboard /> },
      { path: "hrms/performance/appraisal", element: <GenericHRMSList doctype="Appraisal" /> },
      { path: "hrms/performance/appraisal/:id", element: <GenericHRMSForm doctype="Appraisal" /> },

      { path: "hrms/performance/appraisal-templates", element: <GenericHRMSList doctype="Appraisal Template" /> },
      { path: "hrms/performance/appraisal-templates/:id", element: <GenericHRMSForm doctype="Appraisal Template" /> },

      { path: "hrms/performance/feedback", element: <GenericHRMSList doctype="Employee Performance Feedback" /> },
      { path: "hrms/performance/feedback/:id", element: <GenericHRMSForm doctype="Employee Performance Feedback" /> },
      { path: "hrms/performance/goal", element: <GenericHRMSList doctype="Goal" /> },
      { path: "hrms/performance/goal/:id", element: <GenericHRMSForm doctype="Goal" /> },
      { path: "hrms/performance/appraisal-template", element: <GenericHRMSList doctype="Appraisal Template" /> },
      { path: "hrms/performance/appraisal-template/:id", element: <GenericHRMSForm doctype="Appraisal Template" /> },
      { path: "hrms/performance/kra", element: <GenericHRMSList doctype="KRA" /> },
      { path: "hrms/performance/kra/:id", element: <GenericHRMSForm doctype="KRA" /> },
      { path: "hrms/performance/feedback-criteria", element: <GenericHRMSList doctype="Employee Feedback Criteria" /> },
      { path: "hrms/performance/feedback-criteria/:id", element: <GenericHRMSForm doctype="Employee Feedback Criteria" /> },
      { path: "hrms/performance/appraisal-cycles", element: <GenericHRMSList doctype="Appraisal Cycle" /> },
      { path: "hrms/performance/appraisal-cycles/:id", element: <GenericHRMSForm doctype="Appraisal Cycle" /> },
      { path: "hrms/performance/goals", element: <GenericHRMSList doctype="Goal" /> },
      { path: "hrms/performance/goals/:id", element: <GenericHRMSForm doctype="Goal" /> },
      { path: "hrms/performance/energy-point-rules", element: <GenericHRMSList doctype="Energy Point Rule" /> },
      { path: "hrms/performance/energy-point-rules/:id", element: <GenericHRMSForm doctype="Energy Point Rule" /> },

      { path: "hrms/performance/energy-point-settings", element: <EnergyPointSettings /> },

      { path: "hrms/performance/energy-point-logs", element: <GenericHRMSList doctype="Energy Point Log" /> },
      { path: "hrms/performance/energy-point-logs/:id", element: <GenericHRMSForm doctype="Energy Point Log" /> },
      { path: "hrms/performance/promotions", element: <GenericHRMSList doctype="Employee Promotion" /> },
      { path: "hrms/performance/promotions/:id", element: <GenericHRMSForm doctype="Employee Promotion" /> },

      { path: "hrms/performance/employee-performance-feedback", element: <GenericHRMSList doctype="Employee Performance Feedback" /> },
      { path: "hrms/performance/employee-performance-feedback/:id", element: <GenericHRMSForm doctype="Employee Performance Feedback" /> },

      { path: "hrms/performance/employee-promotion", element: <GenericHRMSList doctype="Employee Promotion" /> },
      { path: "hrms/performance/employee-promotion/:id", element: <GenericHRMSForm doctype="Employee Promotion" /> },

      // --- Payroll Routes ---
      { path: "hrms/payroll", element: <PayrollDashboard /> },
      { path: "hrms/payroll/salary-slip", element: <GenericHRMSList doctype="Salary Slip" /> },
      { path: "hrms/payroll/salary-slip/:id", element: <GenericHRMSForm doctype="Salary Slip" /> },
      { path: "hrms/payroll/overtime-slip", element: <GenericHRMSList doctype="Overtime Slip" /> },
      { path: "hrms/payroll/overtime-slip/:id", element: <GenericHRMSForm doctype="Overtime Slip" /> },
      { path: "hrms/payroll/payroll-entry", element: <GenericHRMSList doctype="Payroll Entry" /> },
      { path: "hrms/payroll/payroll-entry/:id", element: <GenericHRMSForm doctype="Payroll Entry" /> },
      { path: "hrms/payroll/salary-component", element: <GenericHRMSList doctype="Salary Component" /> },
      { path: "hrms/payroll/salary-component/:id", element: <GenericHRMSForm doctype="Salary Component" /> },
      { path: "hrms/payroll/salary-structure", element: <GenericHRMSList doctype="Salary Structure" /> },
      { path: "hrms/payroll/salary-structure/:id", element: <GenericHRMSForm doctype="Salary Structure" excludeDocTypes={['Leave Allocation']} excludeFields={['carry_forwarded_leaves']} /> },
      { path: "hrms/payroll/income-tax-slab", element: <GenericHRMSList doctype="Income Tax Slab" /> },
      { path: "hrms/payroll/income-tax-slab/:id", element: <GenericHRMSForm doctype="Income Tax Slab" /> },
      { path: "hrms/payroll/payroll-period", element: <GenericHRMSList doctype="Payroll Period" /> },
      { path: "hrms/payroll/payroll-period/:id", element: <GenericHRMSForm doctype="Payroll Period" /> },
      { path: "hrms/payroll/salary-structure-assignment", element: <GenericHRMSList doctype="Salary Structure Assignment" /> },
      { path: "hrms/payroll/salary-structure-assignment/:id", element: <GenericHRMSForm doctype="Salary Structure Assignment" /> },
      { path: "hrms/payroll/bulk-salary-structure-assignment", element: <GenericHRMSList doctype="Bulk Salary Structure Assignment" /> },
      { path: "hrms/payroll/bulk-salary-structure-assignment/:id", element: <GenericHRMSForm doctype="Bulk Salary Structure Assignment" /> },
      { path: "hrms/payroll/salary-withholding", element: <GenericHRMSList doctype="Salary Withholding" /> },
      { path: "hrms/payroll/salary-withholding/:id", element: <GenericHRMSForm doctype="Salary Withholding" /> },
      { path: "hrms/payroll/additional-salary", element: <GenericHRMSList doctype="Additional Salary" /> },
      { path: "hrms/payroll/additional-salary/:id", element: <GenericHRMSForm doctype="Additional Salary" /> },
      { path: "hrms/payroll/employee-incentive", element: <GenericHRMSList doctype="Employee Incentive" /> },
      { path: "hrms/payroll/employee-incentive/:id", element: <GenericHRMSForm doctype="Employee Incentive" /> },
      { path: "hrms/payroll/retention-bonus", element: <GenericHRMSList doctype="Retention Bonus" /> },
      { path: "hrms/payroll/retention-bonus/:id", element: <GenericHRMSForm doctype="Retention Bonus" /> },
      { path: "hrms/payroll/arrear", element: <GenericHRMSList doctype="Arrear" /> },
      { path: "hrms/payroll/arrear/:id", element: <GenericHRMSForm doctype="Arrear" /> },

      { path: "hrms/attendance/reports/Monthly%20Attendance%20Sheet", element: <MonthlyAttendanceReport /> },

      // { path: "hrms/payroll/employee-benefit-detail", element: <GenericHRMSList doctype="Employee Benefit Detail" /> },
      // { path: "hrms/payroll/employee-benefit-detail/:id", element: <GenericHRMSForm doctype="Employee Benefit Detail" /> },

      // { path: "hrms/payroll/employee-benefit-ledger", element: <GenericHRMSList doctype="Employee Benefit Ledger" /> },
      // { path: "hrms/payroll/employee-benefit-ledger/:id", element: <GenericHRMSForm doctype="Employee Benefit Ledger" /> },
      { path: "hrms/payroll/employee-other-income", element: <GenericHRMSList doctype="Employee Other Income" /> },
      { path: "hrms/payroll/employee-other-income/:id", element: <GenericHRMSForm doctype="Employee Other Income" /> },
      { path: "hrms/payroll/full-and-final-statement", element: <GenericHRMSList doctype="Full and Final Statement" /> },
      { path: "hrms/payroll/full-and-final-statement/:id", element: <GenericHRMSForm doctype="Full and Final Statement" /> },
      { path: "hrms/payroll/gratuity", element: <GenericHRMSList doctype="Gratuity" /> },
      { path: "hrms/payroll/gratuity/:id", element: <GenericHRMSForm doctype="Gratuity" /> },
      { path: "hrms/payroll/gratuity-rule", element: <GenericHRMSList doctype="Gratuity Rule" /> },
      { path: "hrms/payroll/gratuity-rule/:id", element: <GenericHRMSForm doctype="Gratuity Rule" /> },
      { path: "hrms/payroll/interest", element: <GenericHRMSList doctype="Interest" /> },
      { path: "hrms/payroll/interest/:id", element: <GenericHRMSForm doctype="Interest" /> },
      { path: "hrms/payroll/payroll-correction", element: <GenericHRMSList doctype="Payroll Correction" /> },
      { path: "hrms/payroll/payroll-correction/:id", element: <GenericHRMSForm doctype="Payroll Correction" /> },
      { path: "hrms/payroll/payroll-settings", element: <GenericHRMSList doctype="Payroll Settings" /> },
      { path: "hrms/payroll/payroll-settings/:id", element: <GenericHRMSForm doctype="Payroll Settings" /> },

      { path: "hrms/payroll/employee-tax-exemption-declaration", element: <GenericHRMSList doctype='Employee Tax Exemption Declaration' /> },
      { path: "hrms/payroll/employee-tax-exemption-declaration/:id", element: <GenericHRMSForm doctype='Employee Tax Exemption Declaration' /> },

      { path: "hrms/payroll/employee-tax-exemption-proof-submission", element: <GenericHRMSList doctype='Employee Tax Exemption Proof Submission' /> },
      {
        path: "hrms/payroll/employee-tax-exemption-proof-submission/:id", element: <GenericHRMSForm doctype='Employee Tax Exemption Proof Submission' />
      },

      { path: "hrms/payroll/employee-benefit-application", element: <GenericHRMSList doctype='Employee Benefit Application' /> },
      { path: "hrms/payroll/employee-benefit-application/:id", element: <GenericHRMSForm doctype='Employee Benefit Application' /> },

      { path: "hrms/payroll/employee-benefit-claim", element: <GenericHRMSList doctype='Employee Benefit Claim' /> },
      { path: "hrms/payroll/employee-benefit-claim/:id", element: <GenericHRMSForm doctype='Employee Benefit Claim' /> },

      { path: "hrms/payroll/employee-health-insurance", element: <GenericHRMSList doctype='Employee Health Insurance' /> },
      { path: "hrms/payroll/employee-health-insurance/:id", element: <GenericHRMSForm doctype='Employee Health Insurance' /> },


      // --- Tax & Benefits Routes ---
      { path: "hrms/tax", element: <TaxBenefitsDashboard /> },
      { path: "hrms/tax/exemption-declaration", element: <GenericHRMSList doctype="Employee Tax Exemption Declaration" /> },
      { path: "hrms/tax/exemption-declaration/:id", element: <GenericHRMSForm doctype="Employee Tax Exemption Declaration" /> },
      { path: "hrms/tax/exemption-category", element: <GenericHRMSList doctype="Employee Tax Exemption Category" /> },
      { path: "hrms/tax/exemption-category/:id", element: <GenericHRMSForm doctype="Employee Tax Exemption Category" /> },
      { path: "hrms/tax/exemption-sub-category", element: <GenericHRMSList doctype="Employee Tax Exemption Sub Category" /> },
      { path: "hrms/tax/exemption-sub-category/:id", element: <GenericHRMSForm doctype="Employee Tax Exemption Sub Category" /> },
      { path: "hrms/tax/proof-submission", element: <GenericHRMSList doctype="Employee Tax Exemption Proof Submission" /> },
      { path: "hrms/tax/proof-submission/:id", element: <GenericHRMSForm doctype="Employee Tax Exemption Proof Submission" /> },
      { path: "hrms/tax/benefit-application", element: <GenericHRMSList doctype="Employee Benefit Application" /> },
      { path: "hrms/tax/benefit-application/:id", element: <GenericHRMSForm doctype="Employee Benefit Application" /> },
      { path: "hrms/tax/benefit-claim", element: <GenericHRMSList doctype="Employee Benefit Claim" /> },
      { path: "hrms/tax/benefit-claim/:id", element: <GenericHRMSForm doctype="Employee Benefit Claim" /> },
      { path: "hrms/tax/employee-health-insurance", element: <GenericHRMSList doctype="Employee Health Insurance" /> },
      { path: "hrms/tax/employee-health-insurance/:id", element: <GenericHRMSForm doctype="Employee Health Insurance" /> },

      // --- Accounting Routes (Linked from HRMS) ---
      { path: "hrms/accounts/chart-of-accounts", element: <GenericHRMSList doctype="Account" /> },
      { path: "hrms/accounts/chart-of-accounts/:id", element: <GenericHRMSForm doctype="Account" /> },
      { path: "hrms/accounts/chart-of-cost-centers", element: <GenericHRMSList doctype="Cost Center" /> },
      { path: "hrms/accounts/chart-of-cost-centers/:id", element: <GenericHRMSForm doctype="Cost Center" /> },
      { path: "hrms/accounts/payment-entry", element: <GenericHRMSList doctype="Payment Entry" /> },
      { path: "hrms/accounts/payment-entry/:id", element: <GenericHRMSForm doctype="Payment Entry" /> },
      { path: "hrms/accounts/journal-entry", element: <GenericHRMSList doctype="Journal Entry" /> },
      { path: "hrms/accounts/journal-entry/:id", element: <GenericHRMSForm doctype="Journal Entry" /> },
      { path: "hrms/accounts/settings", element: <GenericHRMSForm doctype="Accounts Settings" /> }, // Single Doc
      { path: "hrms/accounts/dimension", element: <GenericHRMSList doctype="Accounting Dimension" /> },
      { path: "hrms/accounts/dimension/:id", element: <GenericHRMSForm doctype="Accounting Dimension" /> },
      { path: "hrms/accounts/currency", element: <GenericHRMSList doctype="Currency" /> },
      { path: "hrms/accounts/currency/:id", element: <GenericHRMSForm doctype="Currency" /> },

      // ==================== ASSET MANAGEMENT ROUTES ====================

      // --- Central Hub Dashboard ---
      {
        path: "central-hub",
        element: (
          <ProtectedRoute allowedRoles={["Asset Manager", "Stock Manager", "System Manager", "Administrator"]}>
            <CentralHubDashboard />
          </ProtectedRoute>
        ),
      },

      // --- Assets Dashboard ---
      {
        path: "assets",
        element: (
          <ProtectedRoute allowedRoles={["Asset Manager", "Stock Manager", "System Manager", "Administrator"]}>
            <AssetsDashboard />
          </ProtectedRoute>
        ),
      },

      // --- Assets Module Routes ---
      { path: "assets/asset", element: <GenericList doctype="Asset" listFields={['asset_name', 'status', 'asset_status', 'location']} /> },
      { path: "assets/asset/:id", element: <GenericForm doctype="Asset" statusField="status" /> },
      { path: "assets/asset-movement", element: <GenericList doctype="Asset Movement" /> },
      { path: "assets/asset-movement/:id", element: <GenericForm doctype="Asset Movement" /> },
      { path: "assets/asset-repair", element: <GenericList doctype="Asset Repair" /> },
      { path: "assets/asset-repair/:id", element: <GenericForm doctype="Asset Repair" /> },
      { path: "assets/asset-maintenance", element: <GenericList doctype="Asset Maintenance" /> },
      { path: "assets/asset-maintenance/:id", element: <GenericForm doctype="Asset Maintenance" /> },
      { path: "assets/maintenance-team", element: <GenericList doctype="Asset Maintenance Team" /> },
      { path: "assets/maintenance-team/:id", element: <GenericForm doctype="Asset Maintenance Team" /> },
      { path: "assets/maintenance-log", element: <GenericList doctype="Asset Maintenance Log" /> },
      { path: "assets/maintenance-log/:id", element: <GenericForm doctype="Asset Maintenance Log" /> },

      // --- Asset Reports Routes ---
      { path: "assets/reports", element: <AssetReports /> },
      { path: "assets/reports/:reportName", element: <ReportViewer /> },

      // --- Setup / Approvals Routes ---
      {
        path: "approvals/approver-template",
        element: <GenericList doctype="Approver Template" title="Approver Templates" listFields={["name_of_project", "date", "applies_to_doctype"]} />
      },
      {
        path: "approvals/approver-template/:id",
        element: <GenericForm
          doctype="Approver Template"
          title="Approver Template"
          fieldOverrides={{
            "approver_details": {
              child_overrides: {
                "corrective_action_owner": { in_list_view: 1 },
                "designation_4": { in_list_view: 1 }
              }
            }
          }}
        />
      },

      // --- Quality Templates ---
      {
        path: "quality/material-template",
        element: <GenericList doctype="Material Template" title="Material Templates" />
      },
      {
        path: "quality/material-template/:id",
        element: <GenericForm doctype="Material Template" />
      },
      {
        path: "quality/aluform-checklist-template",
        element: <GenericList doctype="Aluform Checklist Template" title="Aluform Checklist Templates" />
      },
      {
        path: "quality/aluform-checklist-template/:id",
        element: <GenericForm doctype="Aluform Checklist Template" />
      },
      {
        path: "quality/quality-checklist-template",
        element: <GenericList doctype="Quality Checklist Template" title="Quality Checklist Templates" />
      },
      {
        path: "quality/quality-checklist-template/:id",
        element: <GenericForm doctype="Quality Checklist Template" />
      },

      // --- KB P&M Asset Management Routes ---
      { path: "assets/asset-rent", element: <GenericList doctype="KB Asset Rent" /> },
      { path: "assets/asset-rent/:id", element: <GenericForm doctype="KB Asset Rent" /> },
      { path: "assets/machinery-log", element: <GenericList doctype="Machinery Log" /> },
      { path: "assets/machinery-log/:id", element: <GenericForm doctype="Machinery Log" /> },
      { path: "assets/monthly-checklist", element: <GenericList doctype="Monthly Checklist" /> },
      { path: "assets/monthly-checklist/:id", element: <GenericForm doctype="Monthly Checklist" /> },
      { path: "assets/weekly-checklist", element: <GenericList doctype="Weekly Checklist" /> },
      { path: "assets/weekly-checklist/:id", element: <GenericForm doctype="Weekly Checklist" /> },
      { path: "assets/vehicle-maintenance", element: <GenericList doctype="Vehicle Maintenance Reminder" /> },
      { path: "assets/vehicle-maintenance/:id", element: <GenericForm doctype="Vehicle Maintenance Reminder" /> },

      // ==================== STOCK MANAGEMENT ROUTES ====================

      // --- Stock Dashboard ---
      {
        path: "stock",
        element: (
          <ProtectedRoute allowedRoles={["Stock User", "Stock Manager", "System Manager", "Administrator"]}>
            <StockDashboard />
          </ProtectedRoute>
        ),
      },

      // --- Stock Module Routes ---
      { path: "stock/material-request", element: <GenericList doctype="Material Request" /> },
      { path: "stock/material-request/:id", element: <GenericForm doctype="Material Request" /> },
      { path: "stock/stock-entry", element: <GenericList doctype="Stock Entry" /> },
      { path: "stock/stock-entry/:id", element: <GenericForm doctype="Stock Entry" /> },
      { path: "stock/purchase-receipt", element: <GenericList doctype="Purchase Receipt" /> },
      { path: "stock/purchase-receipt/:id", element: <GenericForm doctype="Purchase Receipt" /> },
      { path: "stock/delivery-note", element: <GenericList doctype="Delivery Note" /> },
      { path: "stock/delivery-note/:id", element: <GenericForm doctype="Delivery Note" /> },
      { path: "stock/item", element: <GenericList doctype="Item" /> },
      { path: "stock/item/:id", element: <GenericForm doctype="Item" /> },
      { path: "stock/warehouse", element: <GenericList doctype="Warehouse" /> },
      { path: "stock/warehouse/:id", element: <GenericForm doctype="Warehouse" /> },
      { path: "stock/item-group", element: <GenericList doctype="Item Group" /> },
      { path: "stock/item-group/:id", element: <GenericForm doctype="Item Group" /> },
      { path: "stock/stock-reconciliation", element: <GenericList doctype="Stock Reconciliation" /> },
      { path: "stock/stock-reconciliation/:id", element: <GenericForm doctype="Stock Reconciliation" /> },

      // --- Stock Reports Routes ---
      { path: "stock/reports", element: <StockReports />, errorElement: <ErrorBoundary /> },
      { path: "stock/reports/:reportName", element: <ReportViewer />, errorElement: <ErrorBoundary /> },

      // --- KB P&M Stock Management Routes ---
      { path: "central-hub", element: <CentralHubDashboard /> },
      { path: "central-hub/asset-request", element: <GenericList doctype="Material Request" title="Asset Request" /> },
      { path: "central-hub/asset-request/:id", element: <GenericForm doctype="Material Request" title="Asset Request" /> },
      { path: "warehouse", element: <GenericList doctype="Warehouse" /> },
      { path: "warehouse/:id", element: <GenericForm doctype="Warehouse" /> },
      { path: "stock/logistics-info", element: <GenericList doctype="Logistics Info" /> },
      { path: "stock/logistics-info/:id", element: <GenericForm doctype="Logistics Info" /> },
      { path: "stock/daily-cash-report", element: <GenericList doctype="Daily Cash Report" /> },
      { path: "stock/daily-cash-report/:id", element: <GenericForm doctype="Daily Cash Report" /> },
      { path: "stock/material-activity", element: <GenericList doctype="Material Activity" /> },
      { path: "stock/material-activity/:id", element: <GenericForm doctype="Material Activity" /> },
      { path: "stock/material-activity-summary", element: <GenericList doctype="Material Activity Summary" /> },
      { path: "stock/material-activity-summary/:id", element: <GenericForm doctype="Material Activity Summary" /> },
      { path: "stock/daily-diesel-issue", element: <GenericList doctype="Daily Diesel Issue" /> },
      { path: "stock/daily-diesel-issue/:id", element: <GenericForm doctype="Daily Diesel Issue" /> },
      { path: "stock/dmrc-report", element: <GenericList doctype="DMRC Report" /> },
      { path: "stock/dmrc-report/:id", element: <GenericForm doctype="DMRC Report" /> },
      { path: "stock/print-heading", element: <GenericList doctype="Print Heading" /> },
      { path: "stock/print-heading/:id", element: <GenericForm doctype="Print Heading" /> },

      // ==================== WAREHOUSE ROUTES ====================
      {
        path: "warehouse",
        element: <GenericList doctype="Warehouse" />, // Pointing to Warehouse list for now as per plan
      },

      // --- Bulk Data Import Routes ---
      {
        path: "bulk-data-import",
        element: <DataImportDashboard />,
      },
      {
        path: "bulk-data-import/:id",
        element: <DataImportForm />
      },
      {
        path: "data-export",
        element: <DataExportForm />
      },

      // --- Planning Module Routes ---
      {
        path: "planning",
        element: (
          <ProtectedRoute allowedRoles={["Planning Manager", "Planning User", "System Manager", "Administrator"]}>
            <PlanningDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "planning/activity-schedule",
        element: <GenericList
          doctype="KB Project Activity Schedule"
          columnLabels={{
            name: "Schedule ID",
            project: "Project Name",
            remarks: "Remarks"
          }}
        />
      },
      { path: "planning/comparison", element: <PlanningComparison /> },
      { path: "planning/activity-schedule/:id", element: <GenericForm doctype="KB Project Activity Schedule" /> },
      { path: "planning/concrete-measurement", element: <GenericList doctype="KB Concrete and Shuttering Measurement" /> },
      { path: "planning/concrete-measurement/:id", element: <GenericForm doctype="KB Concrete and Shuttering Measurement" /> },
      { path: "planning/planned-budget", element: <GenericList doctype="Planned Budget" /> },
      { path: "planning/planned-budget/:id", element: <GenericForm doctype="Planned Budget" /> },
      { path: "planning/rate-analysis", element: <GenericList doctype="Rate Analysis" /> },
      { path: "planning/rate-analysis/:id", element: <GenericForm doctype="Rate Analysis" /> },
      { path: "planning/work-details", element: <GenericList doctype="Work Details" /> },
      { path: "planning/work-details/:id", element: <GenericForm doctype="Work Details" /> },
      { path: "planning/work-analysis", element: <GenericList doctype="KB Work Analysis" /> },
      { path: "planning/work-analysis/:id", element: <GenericForm doctype="KB Work Analysis" /> },
      { path: "planning/quotation", element: <GenericList doctype="Quotation" /> },
      { path: "planning/quotation/:id", element: <GenericForm doctype="Quotation" /> },

      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "app/:doctype",
        element: <GenericRouteListWrapper />
      },
      {
        path: "app/:doctype/:id",
        element: <GenericRouteFormWrapper />
      },
    ]
  }
], {
  basename: import.meta.env.VITE_BASE_PATH || ''
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
