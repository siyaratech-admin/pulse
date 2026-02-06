// Example: Using search_link functionality with SelectField
// This demonstrates how to use searchLinkDocuments for real-time search

import React, { useState } from 'react';
import { SelectField } from '../components/form/fields/SelectionFields';
import type { FieldMetadata } from '../types/form';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export const SearchLinkExample: React.FC = () => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Example: Customer search using link_search
  const customerLinkField: FieldMetadata = {
    fieldname: 'customer',
    label: 'Select Customer',
    fieldtype: 'Select',
    reqd: false,
    description: 'Search and select a customer using Frappe search widget',
    apiConfig: {
      apiType: 'link_search',
      doctype: 'Customer',
      params: {
        page_length: 20,
        searchfield: null,
        reference_doctype: null,
        ignore_user_permissions: false
      }
    }
  };

  // Example: User search using link_search
  const userLinkField: FieldMetadata = {
    fieldname: 'assigned_to',
    label: 'Assigned To',
    fieldtype: 'Select',
    reqd: true,
    description: 'Search and select a user',
    apiConfig: {
      apiType: 'link_search',
      doctype: 'User',
      params: {
        page_length: 50,
        searchfield: 'email'
      }
    }
  };

  // Example: Project search using link_search
  const projectLinkField: FieldMetadata = {
    fieldname: 'project',
    label: 'Related Project',
    fieldtype: 'Select',
    reqd: false,
    description: 'Search and select a project',
    apiConfig: {
      apiType: 'link_search',
      doctype: 'Project',
      params: {
        page_length: 30
      }
    }
  };

  // Example: Company search using link_search
  const companyLinkField: FieldMetadata = {
    fieldname: 'company',
    label: 'Company',
    fieldtype: 'Select',
    reqd: true,
    description: 'Search and select a company',
    apiConfig: {
      apiType: 'link_search',
      doctype: 'Company',
      params: {
        page_length: 20
      }
    }
  };

  const handleFieldChange = (fieldname: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldname]: value
    }));
  };

  const linkFields = [customerLinkField, userLinkField, projectLinkField, companyLinkField];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Link Examples</CardTitle>
          <p className="text-sm text-gray-600">
            Using searchLinkDocuments function for real-time document search (like your LinkField)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {linkFields.map((field) => (
              <div key={field.fieldname} className="space-y-2">
                <SelectField
                  field={field}
                  value={formData[field.fieldname]}
                  onChange={(value) => handleFieldChange(field.fieldname, value)}
                  disabled={false}
                />
                <p className="text-xs text-gray-500">
                  {field.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Selected Values:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>API Endpoint:</strong> <code>/api/method/frappe.desk.search.search_widget</code>
            </div>
            <div>
              <strong>Method:</strong> POST
            </div>
            <div>
              <strong>Request Body Example:</strong>
              <pre className="text-xs bg-gray-50 p-2 rounded mt-1">
{`{
  "doctype": "Customer",
  "txt": "search term",
  "page_length": 20,
  "searchfield": null,
  "reference_doctype": null,
  "ignore_user_permissions": false
}`}
              </pre>
            </div>
            <div>
              <strong>Features:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Real-time search as you type</li>
                <li>CSRF token authentication</li>
                <li>Respects user permissions</li>
                <li>Configurable page length</li>
                <li>Custom search fields</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchLinkExample;