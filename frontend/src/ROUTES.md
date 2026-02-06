# Application Routes

This document lists all available routes in the pulse frontend application.

## Main Routes

### Dashboard
- **Path**: `/`
- **Component**: `Dashboard`
- **Description**: Main dashboard with overview widgets

### Authentication
- **Path**: `/login`
- **Component**: `Login`
- **Description**: User login page

## Projects Module

### Projects List
- **Path**: `/projects`
- **Component**: `Projects`
- **Description**: Main projects listing with pagination, filtering, and table actions
- **Features**:
  - Optimized pagination using custom hooks
  - Status filtering
  - Bulk actions (delete, export, archive)
  - Individual row actions (view, edit, delete)

### New Project Form
- **Path**: `/projects/new`
- **Component**: `NewProjectForm`
- **Description**: New project creation form with API testing capabilities
- **Features**:
  - DocType fields API testing
  - Dynamic field metadata display
  - Multiple DocType support for testing
  - Visual field type indicators

## Quality Module

### Quality Dashboard
- **Path**: `/quality`
- **Component**: `Quality`
- **Description**: Quality management dashboard with comprehensive quality metrics and form navigation
- **Features**:
  - Quality score tracking (98.5% current score)
  - Active issues monitoring and resolution tracking
  - Monthly inspection completion metrics
  - Customer satisfaction ratings and trends
  - Categorized quality form shortcuts with custom shortcut cards
  - Quick actions for common quality tasks
  - Recent quality activities timeline
  - Visual dashboard with gradient category headers

### Quality Form Categories

#### Quality Control Forms
- **Product Inspection**: `/quality/new-product-inspection`
  - Comprehensive product quality inspection checklist
  - Multi-stage inspection workflow
  
- **Final QC Report**: `/quality/new-final-qc-report`
  - Final quality control report before shipment
  - Compliance verification and approval process
  
- **Defect Tracking**: `/quality/new-defect-tracking`
  - Track and manage product defects and issues
  - Root cause analysis and corrective action planning

- **Aluform Checklist Template**: `/quality/new-aluform-checklist-template`
  - Quality control checklist for aluminum formwork systems
  - Comprehensive template for formwork inspection and validation

- **Quality Checklist Inspection**: `/quality/new-quality-checklist-inspection`
  - Conduct quality inspections using predefined checklist templates
  - Template-based inspection with compliance tracking and signature workflow

#### Quality Assurance Forms  
- **Process Audit**: `/quality/new-process-audit`
  - Internal process audit and compliance check
  - Systematic evaluation of quality processes
  
- **Supplier Quality**: `/quality/new-supplier-quality`
  - Supplier quality assessment and rating
  - Vendor performance evaluation and monitoring
  
- **Corrective Action**: `/quality/new-corrective-action`
  - Corrective and preventive action plan (CAPA)
  - Non-conformance management and resolution

#### Quality Metrics Forms
- **Quality Dashboard**: `/quality/new-quality-dashboard`
  - Quality metrics and KPI tracking dashboard
  - Performance indicators and trend analysis
  
- **Customer Feedback**: `/quality/new-customer-feedback`
  - Customer quality feedback and satisfaction survey
  - Voice of customer integration and analysis

### New Concrete Pour Card
- **Path**: `/quality/new-concrete-pour-card`
- **Component**: `NewConcretePourCardForm`
- **Description**: Create comprehensive concrete pour card for documenting concrete pouring activities and quality control
- **Features**:
  - Dynamic form generation from DocType metadata
  - Section breaks for organized data collection (concrete_pour_card_section, section_break_bovh, section_break_u3ht, column_break_b4us, column_break_5yd3, column_break_vrna)
  - Document and revision number tracking with document linking
  - Date and time management with pour timing (Start Time, Completion Time)
  - Client and site information linkage with project tracking
  - DRG (Drawing) number and sector/tower identification
  - Structure and grade of concrete specification
  - Sr No tracking and date of cast recording
  - Quantity measurement and documentation
  - Concrete Pour Card Checklist with table format for quality control points
  - Observations field for any issues or notes (Small Text field)
  - Above observations attendance confirmation (Yes/No select with options)
  - HTML field for formatted content and additional documentation
  - Digital signature collection table for approvals and sign-offs
  - Format number tracking for document control
  - Comprehensive concrete quality assurance and construction compliance
  - Pour timing analysis and scheduling optimization
  - Multi-level quality control checklist verification
  - Construction documentation and audit trail

### New Dimensions
- **Path**: `/quality/new-dimensions`
- **Component**: `NewDimensionsForm`
- **Description**: Create comprehensive dimensions records for structural measurements and dimensional quality control
- **Features**:
  - Dynamic form generation from DocType metadata
  - Dimension type selection (Room, Door, etc.) with select field dropdown
  - Site information linkage (Name of the Site with Project options)
  - Structural hierarchy tracking (Tower and Floor linking)
  - Date recording for measurement activities
  - Dimension Details table for comprehensive measurement data
  - Multi-level digital signature collection system:
    - Signature of KB Site Engineer (Attach field)
    - Signature of KB Quality Inc. (Attach field)  
    - Signature of VTP Site/Tower Incharge (Attach field)
    - Signature of VTP Quality (Attach field)
  - Structural measurement documentation and verification
  - Quality assurance workflow with multiple approval levels
  - Construction dimensional compliance tracking
  - Measurement accuracy validation and sign-off process
  - Project-specific dimension control and monitoring
  - Site hierarchy integration (Project → Site → Tower → Floor)
  - Comprehensive dimensional quality control documentation

### New RCC Handover
- **Path**: `/quality/new-rcc-handover`
- **Component**: `NewRccHandoverForm`
- **Description**: Create comprehensive RCC (Reinforced Cement Concrete) handover records for construction completion and quality certification
- **Features**:
  - Dynamic form generation from DocType metadata
  - RCC Handover Template selection with dropdown options
  - Project Name linking with Project options
  - Section breaks for organized data collection (section_break_uv28, section_break_rqwi, section_break_bqyp, section_break_ftpo, section_break_chm3)
  - Client and Contractor information linking
  - Package and Description of work documentation
  - Column breaks for structured layout (column_break_qp0g, column_break_ng3e, column_break_ekiu)
  - Inspection Report Number and Date tracking
  - Structural Member and Grade of Concrete specification
  - Floor, Location, Level, and Grid information
  - Inspected By employee linking and Inspection Time recording
  - RCC Handover Checklist table for quality control points
  - Strength of cubes table (RCC Cube Strength) for concrete testing results
  - Date of Casting and Date of Removal of Shuttering tracking
  - Corrective actions suggested field (Small Text) for improvement notes
  - Above suggestions implemented status (Yes/No select field)
  - HTML field for formatted content and additional documentation
  - Digital signature collection table (RCC Handover Checklist Officer Signature List)
  - Construction completion certification and handover workflow
  - Quality assurance with concrete strength testing integration
  - Multi-level approval process with signature tracking
  - Comprehensive RCC construction documentation and compliance

### New Request For Inspection
- **Path**: `/quality/new-request-for-inspection`
- **Component**: `NewRequestForInspectionForm`
- **Description**: Create comprehensive inspection requests to initiate quality control procedures and approval workflows
- **Features**:
  - Dynamic form generation from DocType metadata
  - Project linking with Project options for project-specific inspection requests
  - Section breaks for organized data collection (column_break_fly7, section_break_sk5k, section_break_9aaq, section_break_xnjr, section_break_jqzc, column_break_baq6, section_break_qu7s, section_break_zo0v)
  - Inspection Application type selection with check fields:
    - Electrical (Check field for electrical inspections)
    - Civil (Check field for civil engineering inspections)
    - Mechanical (Check field for mechanical system inspections)
  - Others Specify field (Link to Department) for additional inspection types
  - RFI (Request For Inspection) number and Reference DRG documentation
  - Column breaks for structured layout (column_break_newi)
  - Date and Time tracking for inspection scheduling
  - Inspection Required for field (Small Text) for detailed requirements
  - HTML fields for formatted content and additional documentation (html_aniz, signature2)
  - Multi-level signature workflow system:
    - Requested by section: Signature (Attach), Name (Employee Link), Designation (Link), Date, Time
    - Received by section: Signature (Attach), Name (Employee Link), Designation (Link), Date, Time
  - Inspection Results and Comments section (section_break_jqzc):
    - Date Inspected and Time Inspected tracking
    - Results and Comments field (Small Text) for inspection findings
    - Inspected by (Employee Link) and Signature/Name (Attach)
    - Returned to field (Data) and Signature/Name (Attach) for completion tracking
  - Re-Inspection Results and Comments section (section_break_zo0v):
    - Date for re-inspection tracking
    - Results and Comments for re-inspection (Small Text)
    - Inspected by for re-inspection (Employee Link)
    - Returned to for re-inspection (Employee Link)
  - Comprehensive inspection workflow management from request to completion
  - Multi-departmental inspection type support (Electrical, Civil, Mechanical)
  - Formal approval and signature tracking at multiple stages
  - Re-inspection capability for quality assurance follow-up

### New Slab Soffit Level
- **Path**: `/quality/new-slab-soffit-level`
- **Component**: `NewSlabSoffitLevelForm`
- **Description**: Create comprehensive slab soffit level measurement records for structural quality control and construction compliance
- **Features**:
  - Dynamic form generation from DocType metadata
  - Site hierarchy integration with link fields:
    - Name of the Site (Link to Project options)
    - Tower (Link to Tower options)
    - Floor (Link to Floor options)
  - Date field for measurement activity tracking
  - Soffit Level Readings table (Slab Soffit Level Details) for comprehensive measurement data collection
  - Multi-level digital signature workflow with attachment fields:
    - Signature of KB Site Engineer (Attach field)
    - Signature of KB Quality (Attach field)
    - Signature of VTP Site Incharge (Attach field)
    - Signature of VTP Quality (Attach field)
  - Structural level measurement documentation and verification
  - Site-specific measurement tracking with full hierarchy support (Project → Site → Tower → Floor)
  - Quality assurance workflow with multiple approval levels
  - Construction compliance verification through detailed level readings
  - Comprehensive measurement data management with tabular format
  - Multi-party approval system for quality control validation
  - Structural engineering compliance and documentation support

### Quality Quick Actions
- **Quality Reports**: `/quality/reports` - Comprehensive quality reporting
- **Analytics**: `/quality/analytics` - Quality metrics and trend analysis  
- **Schedule Audit**: `/quality/schedule` - Audit planning and scheduling
- **Standards**: `/quality/standards` - Quality standards management

## Safety Module

### Safety Dashboard
- **Path**: `/safety`
- **Component**: `Safety`
- **Description**: Safety management dashboard with statistics and recent activities

### New Earth Pit Inspection
- **Path**: `/safety/new-earth-pit-inspection`
- **Component**: `NewEarthPitInspectionForm`
- **Description**: Create new earth pit inspection records
- **Features**:
  - Dynamic form generation from DocType metadata
  - Earth pit resistance measurement recording
  - Site and employee information linking
  - Comprehensive validation and error handling

### New EHS and Tool Box
- **Path**: `/safety/new-ehs-and-tool-box`
- **Component**: `NewEhsAndToolBoxForm`
- **Description**: Create new EHS (Environmental Health and Safety) and Tool Box records
- **Features**:
  - Dynamic form generation from DocType metadata
  - Safety training documentation
  - Participants list management with table field
  - Document compliance tracking
  - Signature and approval workflow

### New Full Body Safety Harness
- **Path**: `/safety/new-full-body-safety-harness`
- **Component**: `NewFullBodySafetyHarnessForm`
- **Description**: Create new Full Body Safety Harness inspection records
- **Features**:
  - Dynamic form generation from DocType metadata
  - Equipment identification and manufacturer tracking
  - Comprehensive safety inspection checklist
  - Condition assessment for all harness components
  - Compliance documentation and reporting

### New Height Work Monitoring Report
- **Path**: `/safety/new-height-work-monitoring-report`
- **Component**: `NewHeightWorkMonitoringReportForm`
- **Description**: Create new Height Work Monitoring Report records
- **Features**:
  - Dynamic form generation from DocType metadata
  - Task and checkpoint tracking for elevated work
  - Start and end date monitoring
  - Safety compliance documentation for work at height
  - Progress tracking and reporting capabilities

### New Joining Form
- **Path**: `/safety/new-joining-form`
- **Component**: `NewJoiningForm`
- **Description**: Create new employee joining/onboarding forms
- **Features**:
  - Dynamic form generation from DocType metadata
  - Comprehensive employee information collection
  - Personal and professional details management
  - Address information (present and permanent)
  - Identity verification and contact details
  - Legal compliance and undertaking documentation
  - Induction training tracking
  - Multi-level approval workflow (Prepared, Reviewed, Approved)

### New Lifting Tools and Tackles
- **Path**: `/safety/new-lifting-tools`
- **Component**: `NewLiftingToolsForm`
- **Description**: Create comprehensive inspection records for lifting tools, tackle, gear, and equipment
- **Features**:
  - Dynamic form generation from DocType metadata
  - Project and location linkage
  - Equipment identification and specifications (Make/Model/Sr.No, Identification No)
  - Capacity and SWL (Safe Working Load) tracking
  - In-house inspection scheduling and tracking
  - TPI (Third Party Inspection) management
  - Authorized operator assignment
  - Major maintenance records and duration tracking
  - Color coding system for equipment status
  - Contractor information linkage
  - Complete maintenance history documentation

### New RCCB Tracker
- **Path**: `/safety/new-rccb-tracker`
- **Component**: `NewRccbTrackerForm`
- **Description**: Create comprehensive RCCB (Residual Current Circuit Breaker) testing and tracking records
- **Features**:
  - Dynamic form generation from DocType metadata
  - Document and revision number tracking
  - Site and project linkage with location details
  - Monthly tracking and safety member assignment
  - Contact information and project name references
  - SDB (Switch Distribution Board) and RCCB number tracking
  - RCCB current rating (mA) specification
  - Test result recording (Pass/Fail status)
  - Tripping time measurement and analysis
  - Detailed remarks and observations
  - Electrical safety compliance monitoring
  - Comprehensive testing history documentation

### New Accident Report
- **Path**: `/safety/new-accident-report`
- **Component**: `NewAccidentReportForm`
- **Description**: Create comprehensive accident and incident report documentation
- **Features**:
  - Dynamic form generation from DocType metadata
  - Document and revision number tracking
  - Site location and project details linkage
  - Monthly tracking and safety member assignment
  - Contact information and employee assignment
  - Accident description and evidence image attachment
  - Date, time, and injured person details
  - Age, gender, and company/contractor information
  - ID number and designation tracking
  - Type and body part of injury documentation
  - Nature of work and investigation findings
  - Corrective and preventive action suggestions
  - Date of resuming duty and man days lost calculation
  - Comprehensive incident tracking and follow-up
  - Safety compliance and regulatory reporting

### New First Aid Report
- **Path**: `/safety/new-first-aid-report`
- **Component**: `NewFirstAidReportForm`
- **Description**: Create comprehensive first aid and medical treatment documentation
- **Features**:
  - Dynamic form generation from DocType metadata
  - Document and revision number tracking
  - Site location and project details linkage
  - Monthly tracking and safety member assignment
  - Contact information and project assignment
  - Accident description and evidence image attachment
  - Date, time, and injured person details
  - Age, gender, and company/contractor information
  - ID number and designation tracking
  - Type and body part of injury documentation
  - Nature of work and investigation findings
  - Corrective and preventive action suggestions
  - Date of resuming duty and man days lost calculation
  - Incident type classification (Near Miss, etc.)
  - Medical treatment and first aid documentation
  - Healthcare provider and treatment details
  - Recovery timeline and follow-up tracking

### New Incident Report
- **Path**: `/safety/new-incident-report`
- **Component**: `NewIncidentReportForm`
- **Description**: Create comprehensive incident and near-miss event documentation
- **Features**:
  - Dynamic form generation from DocType metadata
  - Document and revision number tracking
  - Site location and project details linkage
  - Monthly tracking and safety member assignment
  - Contact information and project assignment
  - Accident description and evidence image attachment
  - Date, time, and injured person details
  - Age, gender, and company/contractor information
  - ID number and designation tracking
  - Type and body part of injury documentation
  - Nature of work and investigation findings
  - Corrective and preventive action suggestions
  - Date of resuming duty and man days lost calculation
  - Incident type classification (Near Miss, etc.)
  - Comprehensive incident tracking and analysis
  - Risk assessment and hazard identification
  - Prevention strategies and safety improvements

### New Material Inspection
- **Path**: `/safety/new-material-inspection`
- **Component**: `NewMaterialInspectionForm`
- **Description**: Create comprehensive material and equipment safety inspection records
- **Features**:
  - Dynamic form generation from DocType metadata
  - Material template linkage and identification
  - Document and revision number tracking
  - Project details and contractor information
  - Location and site-specific inspection data
  - Safety checklist questions with table format
  - Multi-level approval workflow (Checked, Verified, Client/Consultant Representative)
  - Three-tier approval process (Prepared, Reviewed, Approved)
  - Employee assignment for various inspection roles
  - Comprehensive material safety compliance tracking
  - Quality assurance and safety standard verification
  - Detailed inspection checklist with pass/fail criteria
  - Material template integration for standardized inspections
  - Project-specific material safety requirements

### New Near Miss Report
- **Path**: `/safety/new-near-miss-report`
- **Component**: `NewNearMissReportForm`
- **Description**: Create comprehensive near-miss event documentation and hazard identification
- **Features**:
  - Dynamic form generation from DocType metadata
  - Document and revision number tracking
  - Site location and project details linkage
  - Monthly tracking and safety member assignment
  - Contact information and project assignment
  - Accident description and evidence image attachment
  - Date, time, and injured person details
  - Age, gender, and company/contractor information
  - ID number and designation tracking
  - Type and body part of injury documentation
  - Nature of work and investigation findings
  - Corrective and preventive action suggestions
  - Date of resuming duty and man days lost calculation
  - Near-miss event classification and analysis
  - Potential hazard identification and assessment
  - Risk mitigation strategies and prevention measures
  - Safety awareness and learning opportunity documentation
  - Proactive safety management and continuous improvement

### New Pre Medical Form
- **Path**: `/safety/new-pre-medical-form`
- **Component**: `NewPreMedicalForm`
- **Description**: Create comprehensive pre-employment medical fitness certification and health assessment
- **Features**:
  - Dynamic form generation from DocType metadata
  - Employment history tracking (Working Since date)
  - Medical certificate number and date documentation
  - Job profile and employee name recording
  - Family relationship details (Son/Daughter/Wife of relation options)
  - Personal identification with photo attachment
  - Family member information (Father's Name, Name of the Relation)
  - Identity verification (Aadhar No) and gender selection (Male/Female)
  - Residence and date of birth information
  - Age calculation and fitness status assessment (Fit/Unfit options)
  - Employment suitability evaluation and advice documentation
  - Medical certificate text with HTML formatting
  - Digital signature collection (Worker and Medical Inspector signatures)
  - Certificate validation controls (Refusal and Revocation checkboxes)
  - HTML content management for certificate formatting
  - Comprehensive medical clearance workflow
  - Pre-employment health screening documentation

### Tasks (Coming Soon)
- **Path**: `/tasks`
- **Description**: Task management module

### Team Management (Coming Soon)
- **Path**: `/team`
- **Children**:
  - `/team/members` - Team members
  - `/team/departments` - Department management

### Reports (Coming Soon)
- **Path**: `/reports`
- **Children**:
  - `/reports/analytics` - Analytics dashboard
  - `/reports/activity` - Activity reports

### Other Modules (Coming Soon)
- `/inventory` - Inventory management
- `/documents` - Document management
- `/settings` - Application settings

## Navigation

### In Projects.tsx:
- "New Project" button → navigates to `/projects/new`

### In NewProjectForm.tsx:
- "Back to Projects" button → navigates to `/projects`

## Router Configuration

The application uses React Router v6 with:
- **Base Path**: Configurable via `VITE_BASE_PATH` environment variable
- **Browser Router**: For clean URLs without hash
- **Nested Routes**: Organized by modules with child routes