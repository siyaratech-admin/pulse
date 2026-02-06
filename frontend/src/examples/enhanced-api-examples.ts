// Enhanced API examples for SelectField with Frappe integration
// Based on your existing NewProjectForm patterns

import { createApiSelectField } from '../utils/frappeApiHelpers';
import type { FieldMetadata } from '../types/form';

// Example 1: Project status field using your DocType API
export const projectStatusWithApi: FieldMetadata = {
  fieldname: 'status',
  label: 'Project Status',
  fieldtype: 'Select',
  reqd: 1,
  // Using Frappe API helper configuration
  apiConfig: {
    apiType: 'doctype_select',
    doctype: 'Project',
    apiParams: {
      fieldname: 'status'
    }
  }
};

// Example 2: Customer selection using search widget (like your LinkField)
export const customerSelectWithApi: FieldMetadata = {
  fieldname: 'customer',
  label: 'Customer',
  fieldtype: 'Select',
  reqd: 0,
  // Using link search for real-time search
  apiConfig: {
    apiType: 'link_search',
    doctype: 'Customer',
    apiParams: {
      page_length: 20
    }
  }
};

// Example 3: User selection for project manager
export const projectManagerSelectWithApi: FieldMetadata = {
  fieldname: 'project_manager',
  label: 'Project Manager',
  fieldtype: 'Select',
  reqd: 1,
  apiConfig: {
    apiType: 'link_search',
    doctype: 'User',
    apiParams: {
      page_length: 50
    }
  }
};

// Example 4: Department using resource list
export const departmentSelectWithApi: FieldMetadata = {
  fieldname: 'department',
  label: 'Department',
  fieldtype: 'Select',
  reqd: 0,
  apiConfig: {
    apiType: 'resource_list',
    doctype: 'Department',
    apiParams: {
      fields: JSON.stringify(['name', 'department_name']),
      filters: JSON.stringify({ disabled: 0 }),
      limit_page_length: 100
    }
  }
};

// Example 5: Custom API endpoint (legacy compatibility)
export const customEndpointSelect: FieldMetadata = {
  fieldname: 'priority',
  label: 'Priority',
  fieldtype: 'Select',
  reqd: 0,
  apiConfig: {
    apiType: 'custom',
    apiEndpoint: '/api/v2/method/pulse.api.get_priorities',
    apiMethod: 'POST',
    apiParams: {
      project_type: 'internal'
    },
    transformResponse: (data: any) => {
      // Custom transformation for specific API format
      if (data.message && data.message.priorities) {
        return data.message.priorities.map((priority: any) => ({
          value: priority.name,
          label: priority.title,
          description: priority.description
        }));
      }
      return [];
    }
  }
};

// Usage example in component props
export const exampleFormFields = [
  projectStatusWithApi,
  customerSelectWithApi,
  projectManagerSelectWithApi,
  departmentSelectWithApi,
  customEndpointSelect
];

// Usage in component:
// <SelectField 
//   field={projectStatusWithApi} 
//   value={formData.status} 
//   onChange={(value) => setFormData({...formData, status: value})}
//   apiType="doctype_select"
//   doctype="Project"
//   apiParams={{ fieldname: 'status' }}
// />

// Alternative using helper functions:
export const quickApiFields = [
  createApiSelectField.docTypeSelect('status', 'Project Status', 'Project', 'status', true),
  createApiSelectField.linkSearch('customer', 'Customer', 'Customer', false),
  createApiSelectField.linkSearch('project_manager', 'Project Manager', 'User', true),
  createApiSelectField.resourceList('department', 'Department', 'Department', 'name', 'department_name', false),
];

export {
  projectStatusWithApi,
  customerSelectWithApi,
  projectManagerSelectWithApi,
  departmentSelectWithApi,
  customEndpointSelect
};