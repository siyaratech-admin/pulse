// Test component to verify SelectField API integration works
// This mimics your NewProjectForm usage patterns

import React, { useState, useEffect } from 'react';
import { SelectField } from '../components/form/fields/SelectionFields';
import type { FieldMetadata } from '../types/form';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CheckCircle, XCircle, Loader2, Info } from 'lucide-react';

interface TestResult {
  fieldname: string;
  label: string;
  status: 'pending' | 'success' | 'error' | 'loading';
  message?: string;
  data?: any[];
}

export const ApiSelectFieldTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isTestingAll, setIsTestingAll] = useState(false);

  // Test fields matching your API setup
  const testFields: FieldMetadata[] = [
    {
      fieldname: 'test_doctype_select',
      label: 'Project Status (DocType API)',
      fieldtype: 'Select',
      reqd: false,
      apiConfig: {
        apiType: 'doctype_select',
        doctype: 'Project',
        params: {
          fieldname: 'status'
        }
      }
    },
    {
      fieldname: 'test_customer_search',
      label: 'Customer (Link Search)',
      fieldtype: 'Select', 
      reqd: false,
      apiConfig: {
        apiType: 'link_search',
        doctype: 'Customer',
        params: {
          page_length: 10
        }
      }
    },
    {
      fieldname: 'test_user_search',
      label: 'User (Link Search)',
      fieldtype: 'Select',
      reqd: false,
      apiConfig: {
        apiType: 'link_search',
        doctype: 'User',
        params: {
          page_length: 10
        }
      }
    },
    {
      fieldname: 'test_resource_list',
      label: 'Department (Resource API)',
      fieldtype: 'Select',
      reqd: false,
      apiConfig: {
        apiType: 'resource_list',
        doctype: 'Department',
        params: {
          fields: JSON.stringify(['name', 'department_name']),
          limit_page_length: 20
        }
      }
    },
    {
      fieldname: 'test_custom_api',
      label: 'Custom Endpoint Test',
      fieldtype: 'Select',
      reqd: false,
      apiConfig: {
        apiType: 'custom',
        endpoint: '/api/v2/method/kbweb.api.get_fields_of_doctype',
        method: 'POST',
        params: {
          doctype: 'Project',
          fieldname: 'priority'
        }
      }
    }
  ];

  const initTestResults = () => {
    setTestResults(testFields.map(field => ({
      fieldname: field.fieldname,
      label: field.label,
      status: 'pending'
    })));
  };

  useEffect(() => {
    initTestResults();
  }, []);

  const testApiEndpoint = async (field: FieldMetadata): Promise<TestResult> => {
    const result: TestResult = {
      fieldname: field.fieldname,
      label: field.label,
      status: 'loading'
    };

    try {
      const { apiConfig } = field;
      if (!apiConfig) {
        throw new Error('No API configuration found');
      }

      let response: Response;
      
      if (apiConfig.apiType === 'doctype_select') {
        response = await fetch('/api/v2/method/kbweb.api.get_fields_of_doctype.get_select_options', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || '',
          },
          credentials: 'include',
          body: JSON.stringify({
            doctype: apiConfig.doctype,
            fieldname: apiConfig.params?.fieldname
          })
        });
      } else if (apiConfig.apiType === 'link_search') {
        response = await fetch('/api/method/frappe.desk.search.search_link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || '',
          },
          credentials: 'include',
          body: JSON.stringify({
            doctype: apiConfig.doctype,
            txt: '',
            page_length: apiConfig.params?.page_length || 10,
            filters: apiConfig.params?.filters,
            searchfield: apiConfig.params?.searchfield,
            reference_doctype: apiConfig.params?.reference_doctype,
            ignore_user_permissions: apiConfig.params?.ignore_user_permissions || false
          })
        });
      } else if (apiConfig.apiType === 'resource_list') {
        const url = `/api/resource/${apiConfig.doctype}?limit_page_length=${apiConfig.params?.limit_page_length || 20}`;
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        });
      } else {
        // Custom API
        response = await fetch(apiConfig.endpoint || '', {
          method: apiConfig.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || '',
          },
          credentials: 'include',
          body: apiConfig.method === 'POST' ? JSON.stringify(apiConfig.params) : undefined
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.exc_type || data.exception) {
        throw new Error(data.exception || data.exc_type);
      }

      // Extract data array based on response format
      let dataArray: any[] = [];
      if (data.message && Array.isArray(data.message)) {
        dataArray = data.message;
      } else if (data.data && Array.isArray(data.data)) {
        dataArray = data.data;
      } else if (Array.isArray(data)) {
        dataArray = data;
      }

      result.status = 'success';
      result.message = `Success! Received ${dataArray.length} items`;
      result.data = dataArray.slice(0, 5); // Show first 5 items

    } catch (error) {
      result.status = 'error';
      result.message = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  };

  const testSingleField = async (field: FieldMetadata) => {
    setTestResults(prev => prev.map(result => 
      result.fieldname === field.fieldname 
        ? { ...result, status: 'loading' }
        : result
    ));

    const result = await testApiEndpoint(field);
    
    setTestResults(prev => prev.map(existing => 
      existing.fieldname === result.fieldname ? result : existing
    ));
  };

  const testAllFields = async () => {
    setIsTestingAll(true);
    initTestResults();

    for (const field of testFields) {
      setTestResults(prev => prev.map(result => 
        result.fieldname === field.fieldname 
          ? { ...result, status: 'loading' }
          : result
      ));

      const result = await testApiEndpoint(field);
      
      setTestResults(prev => prev.map(existing => 
        existing.fieldname === result.fieldname ? result : existing
      ));

      // Add delay between requests to avoid overwhelming server
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsTestingAll(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SelectField API Integration Test</CardTitle>
          <p className="text-sm text-gray-600">
            Test your existing Frappe API endpoints with the enhanced SelectField components
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-6">
            <Button 
              onClick={testAllFields} 
              disabled={isTestingAll}
              className="flex items-center gap-2"
            >
              {isTestingAll && <Loader2 className="h-4 w-4 animate-spin" />}
              Test All APIs
            </Button>
            <Button onClick={initTestResults} variant="outline">
              Reset Results
            </Button>
          </div>

          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              This test verifies that your SelectField components can successfully connect to your existing Frappe API endpoints.
              Make sure you're authenticated and your server is running.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {testResults.map((result, index) => {
              const field = testFields[index];
              return (
                <Card key={result.fieldname} className="border-l-4 border-l-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <CardTitle className="text-sm">{result.label}</CardTitle>
                          <p className="text-xs text-gray-500">
                            {field.apiConfig?.apiType} - {field.apiConfig?.doctype || field.apiConfig?.endpoint}
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => testSingleField(field)}
                        disabled={result.status === 'loading' || isTestingAll}
                        size="sm"
                        variant="outline"
                      >
                        Test
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {result.message && (
                        <p className={`text-sm ${
                          result.status === 'error' ? 'text-red-600' : 
                          result.status === 'success' ? 'text-green-600' : 
                          'text-gray-600'
                        }`}>
                          {result.message}
                        </p>
                      )}

                      {result.data && result.data.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-2">Sample Data:</p>
                          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      )}

                      {result.status === 'success' && (
                        <div className="border-t pt-3">
                          <p className="text-xs font-medium text-gray-600 mb-2">Test SelectField Component:</p>
                          <SelectField
                            field={field}
                            value={formData[field.fieldname]}
                            onChange={(value: any) => setFormData(prev => ({ ...prev, [field.fieldname]: value }))}
                            disabled={false}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {Object.keys(formData).length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Selected Values</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiSelectFieldTest;