// Demo showing search_link API usage
// This demonstrates the proper Frappe Link Field API

import React, { useState } from 'react';
import { SelectField } from '../components/form/fields/SelectionFields';
import { commonSearchLinkFields } from '../utils/searchLinkHelpers';
import type { FieldMetadata } from '../types/form';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export const SearchLinkDemo: React.FC = () => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Example fields using search_link API
  const searchLinkFields: FieldMetadata[] = [
    // Customer with custom filters
    {
      fieldname: 'customer',
      label: 'Customer',
      fieldtype: 'Select',
      reqd: false,
      description: 'Customer search using search_link with filters',
      apiConfig: {
        apiType: 'link_search',
        doctype: 'Customer',
        params: {
          page_length: 20,
          filters: { disabled: 0 }, // Only active customers
          searchfield: 'customer_name',
          ignore_user_permissions: false
        }
      }
    },

    // User with email search
    commonSearchLinkFields.user('assigned_to', false),

    // Project with custom search field
    {
      fieldname: 'project',
      label: 'Project',
      fieldtype: 'Select',
      reqd: false,
      description: 'Project search using search_link',
      apiConfig: {
        apiType: 'link_search',
        doctype: 'Project',
        params: {
          page_length: 15,
          searchfield: 'project_name',
          filters: { status: ['!=', 'Completed'] }, // Exclude completed projects
          ignore_user_permissions: false
        }
      }
    },

    // Item with item code search
    {
      fieldname: 'item',
      label: 'Item',
      fieldtype: 'Select',
      reqd: false,
      description: 'Item search using search_link with item_code',
      apiConfig: {
        apiType: 'link_search',
        doctype: 'Item',
        params: {
          page_length: 25,
          searchfield: 'item_code',
          filters: { disabled: 0, has_variants: 0 },
          ignore_user_permissions: false
        }
      }
    },

    // Company selection
    commonSearchLinkFields.company('company', false),

    // Supplier with advanced filters
    {
      fieldname: 'supplier',
      label: 'Supplier',
      fieldtype: 'Select',
      reqd: false,
      description: 'Supplier search with advanced filtering',
      apiConfig: {
        apiType: 'link_search',
        doctype: 'Supplier',
        params: {
          page_length: 20,
          searchfield: 'supplier_name',
          filters: { 
            disabled: 0,
            is_frozen: 0
          },
          ignore_user_permissions: false
        }
      }
    }
  ];

  const handleFieldChange = (fieldname: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldname]: value
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Frappe search_link API Demo
            <Badge variant="secondary">Updated API</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Using <code>/api/method/frappe.desk.search.search_link</code> - the proper Link Field API
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchLinkFields.map((field) => (
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

          {Object.keys(formData).length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Selected Values:</h4>
              <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>search_link vs search_widget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">✅ search_link (Recommended)</h4>
              <div className="text-sm space-y-2">
                <div><strong>Endpoint:</strong> <code>/api/method/frappe.desk.search.search_link</code></div>
                <div><strong>Purpose:</strong> Designed specifically for Link Fields</div>
                <div><strong>Response:</strong> Optimized LinkSearchResults format</div>
                <div><strong>Features:</strong></div>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Built-in autosuggest formatting</li>
                  <li>Proper label/description handling</li>
                  <li>Title field support</li>
                  <li>Optimized for UI components</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-orange-600">⚠️ search_widget (Generic)</h4>
              <div className="text-sm space-y-2">
                <div><strong>Endpoint:</strong> <code>/api/method/frappe.desk.search.search_widget</code></div>
                <div><strong>Purpose:</strong> Generic search functionality</div>
                <div><strong>Response:</strong> Raw tuple format</div>
                <div><strong>Limitations:</strong></div>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Requires manual formatting</li>
                  <li>No built-in label handling</li>
                  <li>More complex response parsing</li>
                  <li>Used by search boxes, not Link Fields</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Key Differences:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div><strong>Response Format:</strong> search_link returns formatted LinkSearchResults with value, label, description</div>
              <div><strong>Title Field Handling:</strong> search_link automatically handles meta.show_title_field_in_link</div>
              <div><strong>UI Optimization:</strong> search_link is optimized for autosuggest/dropdown UI components</div>
              <div><strong>API Contract:</strong> search_link follows the official Link Field API contract</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Examples */}
      <Card>
        <CardHeader>
          <CardTitle>API Request Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">search_link Request:</h4>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
{`POST /api/method/frappe.desk.search.search_link

{
  "doctype": "Customer",
  "txt": "search term",
  "page_length": 20,
  "filters": {"disabled": 0},
  "searchfield": "customer_name",
  "reference_doctype": null,
  "ignore_user_permissions": false
}`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">search_link Response:</h4>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
{`{
  "message": [
    {
      "value": "CUST-001",
      "label": "Customer Name",
      "description": "Customer Group, Territory"
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchLinkDemo;