import React from 'react';
import { DynamicForm } from '../components/form/DynamicForm';
import { FrappeFieldType } from '../types/form';

/**
 * Example usage of DynamicForm with auto-save functionality
 * 
 * Auto-save features:
 * - Automatically saves form data to localStorage every 2 seconds after user stops typing
 * - Shows restore notification if previous auto-saved data exists
 * - Clears auto-save data when form is submitted or cancelled
 * - Uses doctype and docname to create unique storage keys
 */

export const FormWithAutoSaveExample: React.FC = () => {
  // Example fields for a Project form
  const projectFields = [
    {
      fieldname: 'project_name',
      label: 'Project Name',
      fieldtype: FrappeFieldType.DATA,
      reqd: true,
      description: 'Enter a unique name for the project'
    },
    {
      fieldname: 'project_type',
      label: 'Project Type',
      fieldtype: FrappeFieldType.SELECT,
      reqd: true,
      options: 'Internal\nExternal\nContract\nMaintenance'
    },
    {
      fieldname: 'client',
      label: 'Client',
      fieldtype: FrappeFieldType.LINK,
      options: 'Customer',
      depends_on: 'eval:doc.project_type == "External"'
    },
    {
      fieldname: 'start_date',
      label: 'Start Date',
      fieldtype: FrappeFieldType.DATE,
      reqd: true
    },
    {
      fieldname: 'end_date',
      label: 'End Date',
      fieldtype: FrappeFieldType.DATE,
      reqd: false
    },
    {
      fieldname: 'priority',
      label: 'Priority',
      fieldtype: FrappeFieldType.SELECT,
      reqd: true,
      options: 'Low\nMedium\nHigh\nCritical',
      default: 'Medium'
    },
    {
      fieldname: 'budget',
      label: 'Budget',
      fieldtype: FrappeFieldType.CURRENCY,
      reqd: false
    },
    {
      fieldname: 'description',
      label: 'Project Description',
      fieldtype: FrappeFieldType.TEXT,
      reqd: false
    },
    {
      fieldname: 'is_active',
      label: 'Is Active',
      fieldtype: FrappeFieldType.CHECK,
      default: 1
    }
  ];

  // Initial data (if editing existing project)
  const initialData = {
    // project_name: 'Website Redesign', // Uncomment to test with initial data
    // project_type: 'External',
    // priority: 'High',
    // is_active: 1
  };

  const handleSubmit = (formData: any) => {
    console.log('Form submitted:', formData);
    
    // Simulate API call
    alert('Project saved successfully!\n\nAuto-save data has been cleared.');
    
    // In real implementation, you would make an API call:
    // try {
    //   const response = await frappeRequest('/api/v2/document/Project', {
    //     method: 'POST',
    //     data: formData
    //   });
    //   console.log('Project created:', response);
    // } catch (error) {
    //   console.error('Error creating project:', error);
    // }
  };

  const handleCancel = () => {
    console.log('Form cancelled');
    alert('Form cancelled!\n\nAuto-save data has been cleared.');
    
    // Navigate back or close form
    // router.back();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Create New Project</h1>
        <p className="text-gray-600">
          This form demonstrates auto-save functionality. Try typing in the fields,
          then refresh the page to see the auto-save restoration feature.
        </p>
      </div>

      <DynamicForm
        fields={projectFields}
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        doctype="Project"
        docname={undefined} // Use undefined for new documents, or provide docname for editing
        title="Project Details"
        description="Enter the project information below. Your progress will be automatically saved."
        className="bg-white rounded-lg shadow"
      />

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Auto-save Features:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Form data is automatically saved to localStorage every 2 seconds after you stop typing</li>
          <li>• If you refresh the page or navigate away and come back, you'll see a restore notification</li>
          <li>• Auto-save data is cleared when you submit the form or click cancel</li>
          <li>• Each doctype uses a separate storage key to avoid conflicts</li>
          <li>• Auto-save data expires after 24 hours automatically</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-2">Testing Auto-save:</h3>
        <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
          <li>Fill in some form fields above</li>
          <li>Wait 2-3 seconds for auto-save to trigger</li>
          <li>Refresh this page (Ctrl+R or Cmd+R)</li>
          <li>You should see a blue notification bar asking if you want to restore your data</li>
          <li>Click "Restore Data" to see your previous input restored</li>
        </ol>
      </div>
    </div>
  );
};

export default FormWithAutoSaveExample;