import type { FieldMetadata } from '../types/form';

// Example field configurations for API-enabled SelectFields (compatible with your Frappe setup)

// Example 1: Project Status using your existing DocType API pattern
export const projectStatusField: FieldMetadata = {
    fieldname: 'status',
    label: 'Project Status',
    fieldtype: 'Select',
    reqd: true,
    api_endpoint: '/api/v2/method/pulse.api.get_fields_of_doctype.get_select_options',
    api_method: 'POST',
    api_params: {
        doctype: 'Project',
        fieldname: 'status'
    }
};

// Example 2: Customer field using Frappe search (like your LinkField pattern)
export const customerSelectField: FieldMetadata = {
    fieldname: 'customer',
    label: 'Customer',
    fieldtype: 'Select',
    reqd: false,
    api_endpoint: '/api/method/frappe.desk.search.search_widget',
    api_method: 'POST',
    api_params: {
        doctype: 'Customer',
        txt: '',
        page_length: 20
    }
};

// Example 2: Using options as ApiConfig object
export const customerFieldWithApi: FieldMetadata = {
    fieldname: 'customer',
    label: 'Customer',
    fieldtype: 'Select',
    reqd: false,
    options: {
        endpoint: '/api/method/frappe.desk.search.search_widget',
        method: 'POST',
        params: {
            doctype: 'Customer',
            page_length: 50
        }
    }
};

// Example 3: Priority field with static options (existing functionality)
export const priorityField: FieldMetadata = {
    fieldname: 'priority',
    label: 'Priority',
    fieldtype: 'Select',
    reqd: false,
    options: ['Low', 'Medium', 'High', 'Critical']
};

// Example 4: Department field with GET API
export const departmentField: FieldMetadata = {
    fieldname: 'department',
    label: 'Department',
    fieldtype: 'Select',
    reqd: false,
    api_endpoint: '/api/resource/Department',
    api_method: 'GET',
    api_params: {
        fields: '["name", "department_name"]',
        filters: '{"disabled": 0}'
    }
};

// Example usage in a form
export const exampleFormFields: FieldMetadata[] = [
    projectStatusField,
    customerSelectField,
    priorityField,
    departmentField
];

// Example API endpoint implementations for testing
export const mockApiEndpoints = {
    // Mock Frappe select options endpoint
    '/api/method/frappe.core.doctype.doctype.get_select_options': {
        message: [
            { value: 'open', label: 'Open' },
            { value: 'working', label: 'Working' },
            { value: 'pending_review', label: 'Pending Review' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' }
        ]
    },
    
    // Mock customer search endpoint
    '/api/method/frappe.desk.search.search_widget': {
        message: [
            { value: 'CUST-001', label: 'Acme Corporation', description: 'Technology Company' },
            { value: 'CUST-002', label: 'Global Industries', description: 'Manufacturing Company' },
            { value: 'CUST-003', label: 'Tech Solutions Inc', description: 'IT Services' },
            { value: 'CUST-004', label: 'Alpha Enterprises', description: 'Retail Chain' }
        ]
    },
    
    // Mock department resource endpoint
    '/api/resource/Department': {
        data: [
            { name: 'sales', department_name: 'Sales Department' },
            { name: 'marketing', department_name: 'Marketing Department' },
            { name: 'hr', department_name: 'Human Resources' },
            { name: 'it', department_name: 'Information Technology' },
            { name: 'finance', department_name: 'Finance & Accounting' }
        ]
    }
};