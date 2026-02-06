// Practical example: Using search_link in a form component
// This shows how to integrate search_link functionality in your actual forms

import React, { useState } from 'react';
import { SelectField } from '../components/form/fields/SelectionFields';
import { commonSearchLinkFields, createSearchLinkField } from '../utils/searchLinkHelpers';
import type { FieldMetadata } from '../types/form';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export const ProjectFormWithSearchLink: React.FC = () => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Define form fields using search_link
  const formFields: FieldMetadata[] = [
    // Project name (regular input - for comparison)
    {
      fieldname: 'project_name',
      label: 'Project Name',
      fieldtype: 'Data',
      reqd: true,
    },

    // Customer selection using search_link
    commonSearchLinkFields.customer('customer', true),

    // Project manager using search_link
    commonSearchLinkFields.user('project_manager', true),

    // Company using search_link
    commonSearchLinkFields.company('company', true),

    // Parent project using search_link (project linking to another project)
    commonSearchLinkFields.project('parent_project', false),

    // Department using search_link
    commonSearchLinkFields.department('department', false),

    // Cost center using search_link
    commonSearchLinkFields.costCenter('cost_center', false),

    // Custom field: Related opportunity
    createSearchLinkField(
      'opportunity',
      'Related Opportunity', 
      'Opportunity',
      false,
      15,
      'opportunity_from'
    ),
  ];

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
    
    formFields.forEach(field => {
      if (field.reqd && !formData[field.fieldname]) {
        newErrors[field.fieldname] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Here you would normally send the data to your API
    console.log('Submitting form data:', formData);
    alert('Form submitted! Check console for data.');
  };

  const handleReset = () => {
    setFormData({});
    setErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Form with Search Link Fields</CardTitle>
          <p className="text-sm text-gray-600">
            Demonstration of using search_link functionality for linked document selection
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formFields.map((field) => (
              <div key={field.fieldname} className="space-y-2">
                {field.fieldtype === 'Data' ? (
                  // Regular input field for comparison
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{field.label}</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData[field.fieldname] || ''}
                      onChange={(e) => handleFieldChange(field.fieldname, e.target.value)}
                      placeholder={`Enter ${field.label}`}
                    />
                    {errors[field.fieldname] && (
                      <p className="text-sm text-red-600">{errors[field.fieldname]}</p>
                    )}
                  </div>
                ) : (
                  // SelectField with search_link
                  <SelectField
                    field={field}
                    value={formData[field.fieldname]}
                    onChange={(value) => handleFieldChange(field.fieldname, value)}
                    error={errors[field.fieldname]}
                    disabled={false}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <Button onClick={handleSubmit} className="flex-1">
              Create Project
            </Button>
            <Button onClick={handleReset} variant="outline">
              Reset Form
            </Button>
          </div>

          {/* Show current form data */}
          {Object.keys(formData).length > 0 && (
            <details className="mt-6 p-4 bg-gray-50 rounded-lg">
              <summary className="cursor-pointer font-medium text-sm mb-3">
                Current Form Data (Click to expand)
              </summary>
              <pre className="text-xs bg-white p-3 rounded border overflow-auto">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>

      {/* Usage guide */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Search Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">1. Using Common Search Link Fields:</h4>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
{`import { commonSearchLinkFields } from '../utils/searchLinkHelpers';

// Create common fields
const customerField = commonSearchLinkFields.customer('customer', true);
const userField = commonSearchLinkFields.user('project_manager', true);
const companyField = commonSearchLinkFields.company('company', true);`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">2. Creating Custom Search Link Fields:</h4>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
{`import { createSearchLinkField } from '../utils/searchLinkHelpers';

const customField = createSearchLinkField(
  'opportunity',        // fieldname
  'Related Opportunity', // label
  'Opportunity',        // doctype
  false,               // required
  15,                  // page_length
  'opportunity_from'   // search_field
);`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. Features of Search Link:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Real-time search as you type in the field</li>
                <li>Respects Frappe user permissions</li>
                <li>Configurable page length for results</li>
                <li>Custom search fields for better filtering</li>
                <li>CSRF token authentication</li>
                <li>Error handling for network issues</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">4. API Endpoint Details:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Endpoint:</strong> <code>/api/method/frappe.desk.search.search_widget</code></li>
                <li><strong>Method:</strong> POST</li>
                <li><strong>Authentication:</strong> Session cookies + CSRF token</li>
                <li><strong>Response format:</strong> Frappe standard with message array</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectFormWithSearchLink;