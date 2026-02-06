// Demonstration component showing SelectField with Frappe API integration
// Based on your existing NewProjectForm patterns

import React, { useState } from 'react';
import { SelectField } from '../components/form/fields/SelectionFields';
import type { FieldMetadata } from '../types/form';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

// Example field configurations using your API patterns
const exampleFields: FieldMetadata[] = [
  {
    fieldname: 'project_status',
    label: 'Project Status',
    fieldtype: 'Select',
    reqd: true,
    description: 'Status from Project DocType using your API',
    apiConfig: {
      apiType: 'doctype_select',
      doctype: 'Project',
      params: {
        fieldname: 'status'
      }
    }
  },
  {
    fieldname: 'customer',
    label: 'Customer',
    fieldtype: 'Select',
    reqd: false,
    description: 'Customer search using Frappe search widget',
    apiConfig: {
      apiType: 'link_search',
      doctype: 'Customer',
      params: {
        page_length: 20
      }
    }
  },
  {
    fieldname: 'project_manager',
    label: 'Project Manager',
    fieldtype: 'Select',
    reqd: true,
    description: 'User selection with search capability',
    apiConfig: {
      apiType: 'link_search',
      doctype: 'User',
      params: {
        page_length: 50
      }
    }
  },
  {
    fieldname: 'department',
    label: 'Department',
    fieldtype: 'Select',
    reqd: false,
    description: 'Department list from resource API',
    apiConfig: {
      apiType: 'resource_list',
      doctype: 'Department',
      params: {
        fields: JSON.stringify(['name', 'department_name']),
        filters: JSON.stringify({ disabled: 0 }),
        limit_page_length: 100
      }
    }
  },
  {
    fieldname: 'priority',
    label: 'Priority',
    fieldtype: 'Select',
    reqd: false,
    description: 'Custom API endpoint example',
    apiConfig: {
      apiType: 'custom',
      endpoint: '/api/v2/method/kbweb.api.get_priorities',
      method: 'POST',
      params: {
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
  },
  {
    fieldname: 'static_field',
    label: 'Static Options',
    fieldtype: 'Select',
    reqd: false,
    description: 'Traditional static options for comparison',
    options: ['Option 1', 'Option 2', 'Option 3', 'Option 4']
  }
];

export const ApiSelectFieldDemo: React.FC = () => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (fieldname: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldname]: value
    }));
    
    // Clear error when field is changed
    if (errors[fieldname]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldname];
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    // Simple validation
    const newErrors: Record<string, string> = {};
    
    exampleFields.forEach(field => {
      if (field.reqd && !formData[field.fieldname]) {
        newErrors[field.fieldname] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit logic here
    console.log('Form Data:', formData);
    alert('Check console for form data');
  };

  const handleReset = () => {
    setFormData({});
    setErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced SelectField with Frappe API Integration</CardTitle>
          <p className="text-sm text-gray-600">
            Demonstration of SelectField components using your existing API patterns from NewProjectForm
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exampleFields.map((field) => (
              <div key={field.fieldname} className="space-y-2">
                <SelectField
                  field={field}
                  value={formData[field.fieldname]}
                  onChange={(value) => handleFieldChange(field.fieldname, value)}
                  error={errors[field.fieldname]}
                  disabled={false}
                />
                {field.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {field.description}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSubmit} className="flex-1">
              Submit Form
            </Button>
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
          </div>

          {/* Debug information */}
          <details className="mt-6 p-4 bg-gray-50 rounded-lg">
            <summary className="cursor-pointer font-medium text-sm">
              Debug Information
            </summary>
            <div className="mt-3 space-y-3">
              <div>
                <h4 className="text-sm font-medium">Current Form Data:</h4>
                <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </div>
              
              {Object.keys(errors).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-red-600">Validation Errors:</h4>
                  <pre className="text-xs bg-red-50 p-2 rounded border overflow-auto">
                    {JSON.stringify(errors, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium">API Configuration Summary:</h4>
                <ul className="text-xs space-y-1 mt-1">
                  <li><strong>DocType Select:</strong> {exampleFields[0].fieldname} - Uses /api/v2/method/kbweb.api.get_fields_of_doctype</li>
                  <li><strong>Link Search:</strong> {exampleFields[1].fieldname}, {exampleFields[2].fieldname} - Uses /api/method/frappe.desk.search.search_widget</li>
                  <li><strong>Resource List:</strong> {exampleFields[3].fieldname} - Uses /api/resource/Department</li>
                  <li><strong>Custom Endpoint:</strong> {exampleFields[4].fieldname} - Uses /api/v2/method/kbweb.api.get_priorities</li>
                  <li><strong>Static Options:</strong> {exampleFields[5].fieldname} - Traditional array-based options</li>
                </ul>
              </div>
            </div>
          </details>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">1. DocType Select Field (Project Status):</h4>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
{`const statusField: FieldMetadata = {
  fieldname: 'status',
  label: 'Project Status', 
  fieldtype: 'Select',
  reqd: true,
  apiConfig: {
    apiType: 'doctype_select',
    doctype: 'Project',
    params: { fieldname: 'status' }
  }
};`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">2. Link Search Field (Customer):</h4>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
{`const customerField: FieldMetadata = {
  fieldname: 'customer',
  label: 'Customer',
  fieldtype: 'Select', 
  reqd: false,
  apiConfig: {
    apiType: 'link_search',
    doctype: 'Customer',
    params: { page_length: 20 }
  }
};`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">3. Custom API with Transform:</h4>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
{`const priorityField: FieldMetadata = {
  fieldname: 'priority',
  label: 'Priority',
  fieldtype: 'Select',
  reqd: false,
  apiConfig: {
    apiType: 'custom',
    endpoint: '/api/v2/method/kbweb.api.get_priorities',
    method: 'POST',
    params: { project_type: 'internal' },
    transformResponse: (data: any) => {
      return data.message.priorities.map((p: any) => ({
        value: p.name,
        label: p.title,
        description: p.description
      }));
    }
  }
};`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiSelectFieldDemo;