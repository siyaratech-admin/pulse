export const DOCTYPE_CONNECTIONS: Record<string, string[]> = {
    // Selling
    'Lead': ['Opportunity', 'Quotation', 'Customer'],
    'Opportunity': ['Quotation', 'Buying', 'Project'],
    'Quotation': ['Sales Order', 'Customer', 'Address'],
    'Sales Order': ['Delivery Note', 'Sales Invoice', 'Material Request', 'Project', 'Payment Entry'],
    'Delivery Note': ['Sales Invoice', 'Stock Entry', 'Quality Inspection'],
    'Sales Invoice': ['Payment Entry', 'Delivery Note', 'Journal Entry'],
    'Customer': ['Opportunity', 'Quotation', 'Sales Order', 'Sales Invoice', 'Project', 'Address', 'Contact', 'Issue'],

    // Buying
    'Material Request': ['Purchase Order', 'Request for Quotation', 'Stock Entry'],
    'Request for Quotation': ['Supplier Quotation'],
    'Supplier Quotation': ['Purchase Order', 'Quotation'],
    'Purchase Order': ['Purchase Receipt', 'Purchase Invoice', 'Payment Entry', 'Stock Entry'],
    'Purchase Receipt': ['Purchase Invoice', 'Stock Entry', 'Quality Inspection', 'Asset'],
    'Purchase Invoice': ['Payment Entry', 'Journal Entry', 'Purchase Receipt', 'Asset'],
    'Supplier': ['Purchase Order', 'Supplier Quotation', 'Address', 'Contact', 'Account'],

    // Stock
    'Stock Entry': ['Stock Ledger Entry', 'Quality Inspection'],
    'Item': ['BOM', 'Stock Entry', 'Purchase Order', 'Sales Order', 'Material Request', 'Quality Inspection'],
    'Warehouse': ['Stock Entry', 'Bin', 'Account'],
    'Batch': ['Stock Entry', 'Stock Ledger Entry'],
    'Serial No': ['Stock Entry', 'Stock Ledger Entry', 'Warranty Claim'],

    // Projects
    'Project': ['Task', 'Project Update', 'Material Request', 'expense Claim', 'Stock Entry', 'Sales Order', 'Purchase Order'],
    'Task': ['Timesheet', 'Project', 'Issue'],
    'Timesheet': ['Salary Slip', 'Sales Invoice', 'Project'],

    // HRMS
    'Employee': [
        'Leave Application', 'Attendance', 'Salary Slip', 'Appraisal',
        'Employee Checkin', 'Employee Promotion', 'Employee Grievance',
        'Employee Onboarding', 'Employee Separation', 'Shift Request',
        'Expense Claim', 'Timesheet', 'Employee Advance', 'Training Request'
    ],
    'Leave Application': ['Employee', 'Leave Allocation'],
    'Expense Claim': ['Employee', 'Payment Entry'],
    'Salary Slip': ['Employee', 'Journal Entry'],
    'Job Applicant': ['Job Offer', 'Interview'],
    'Job Offer': ['Employee', 'Job Applicant'],

    // Support / CRM
    'Issue': ['Task', 'Project', 'Customer'],
    'Warranty Claim': ['Customer', 'Serial No', 'Item'],
};

export const CATEGORIES: Record<string, string[]> = {
    'Selling': ['Lead', 'Opportunity', 'Quotation', 'Sales Order', 'Delivery Note', 'Sales Invoice', 'Customer', 'Address', 'Contact'],
    'Buying': ['Material Request', 'Request for Quotation', 'Supplier Quotation', 'Purchase Order', 'Purchase Receipt', 'Purchase Invoice', 'Supplier'],
    'Stock': ['Stock Entry', 'Item', 'Warehouse', 'Batch', 'Serial No', 'Quality Inspection', 'BOM'],
    'Projects': ['Project', 'Task', 'Timesheet', 'Project Update', 'Issue'],
    'HRMS': ['Employee', 'Leave Application', 'Attendance', 'Salary Slip', 'Appraisal', 'Employee Checkin', 'Employee Promotion', 'Employee Grievance', 'Employee Onboarding', 'Employee Separation', 'Shift Request', 'Expense Claim', 'Employee Advance', 'Training Request', 'Job Applicant', 'Job Offer', 'Interview'],
    'Support': ['Issue', 'Warranty Claim']
};
