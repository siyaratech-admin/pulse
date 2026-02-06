import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { DynamicForm } from '../../../components/form/DynamicForm';
import type { FieldMetadata, FormData } from '../../../types/form';
import { useFrappeCreateDoc } from 'frappe-react-sdk';

const NewQualityChecklistInspectionForm: React.FC = () => {
    const navigate = useNavigate();
    const [fieldsData, setFieldsData] = useState<FieldMetadata[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [template, setTemplate] = useState<string | null>(null);
    const [checklistData, setChecklistData] = useState<any[]>([]);
    const [formData, setFormData] = useState<FormData>({});
    const [templateOptions, setTemplateOptions] = useState<{ label: string; value: string }[]>([]);
    const doctype_name = 'Quality Checklist Inspection';

    // Use Frappe React SDK hook for creating documents
    const { createDoc, loading: createLoading, error: createError, isCompleted, reset } = useFrappeCreateDoc();

    useEffect(() => {
        fetchInitialFormData();
    }, []);

    useEffect(() => {
        if (template) {
            // Checklist fetching is now handled by the fetch_from logic in DynamicForm
            // No need for separate API call since we get the data in the auto-population
            console.log(`📋 Template selected: ${template} - checklist will be auto-populated via fetch_from`);
        }
    }, [template]);

    useEffect(() => {
        // Checklist data is now handled by the fetch_from auto-population logic
        // This useEffect is no longer needed since check_points are auto-populated
        // when the Template is selected in the DynamicForm
        console.log('📋 Checklist data handling moved to fetch_from auto-population');
    }, [checklistData]);

    // Fetch Quality Checklist Inspection DocType fields on component mount
    useEffect(() => {
        fetchQualityChecklistFields();
    }, []);

    // Handle successful document creation
    useEffect(() => {
        if (isCompleted && !createError) {
            // Small delay to show success message before navigation
            const timer = setTimeout(() => {
                navigate('/quality');
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [isCompleted, createError, navigate]);

    const fetchQualityChecklistFields = async () => {
        console.log('Fetching Quality Checklist Inspection DocType fields...');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/v2/method/pulse.api.get_fields_of_doctype.get_form_meta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || '',
                },
                body: JSON.stringify({
                    doctype_name: doctype_name
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Quality Checklist Inspection fields API Response:', data);

            // Handle different response formats
            let fieldsArray = null;
            if (data.message) {
                fieldsArray = data.message;
            } else if (data.data && Array.isArray(data.data)) {
                fieldsArray = data.data;
            } else if (Array.isArray(data)) {
                fieldsArray = data;
            } else {
                throw new Error('Invalid response format - expected array of fields');
            }

            if (!Array.isArray(fieldsArray)) {
                throw new Error('Fields data is not an array');
            }

            console.log('Loaded', fieldsArray.length, 'Quality Checklist Inspection fields');
            console.log('Sample field data:', fieldsArray[0]); // Debug field structure
            setFieldsData(fieldsArray);
        } catch (err) {
            console.error('Error fetching Quality Checklist Inspection fields:', err);
            setError(err instanceof Error ? err.message : 'Failed to load Quality Checklist Inspection fields');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchInitialFormData = async () => {
        console.log('Fetching Quality Checklist Inspection DocType fields and Template options...');
        setIsLoading(true);
        setError(null);

        try {
            // Fetch Quality Checklist Inspection fields
            const fieldsResponse = await fetch('/api/v2/method/pulse.api.get_fields_of_doctype.get_form_meta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || '',
                },
                body: JSON.stringify({
                    doctype_name: doctype_name
                })
            });

            if (!fieldsResponse.ok) {
                throw new Error(`HTTP error! status: ${fieldsResponse.status}`);
            }

            const fieldsData = await fieldsResponse.json();

            console.log("Fields API Response:", fieldsData);

            let fieldsArray = fieldsData.message || fieldsData.data || fieldsData;
            if (!Array.isArray(fieldsArray)) {
                throw new Error('Invalid fields response format');
            }

            // Check if there are template-related Link fields that need special handling
            // Look for fields that might reference templates or checklists
            const updatedFields = fieldsArray.map(field => {
                // Based on the data structure, the template field is 'name_of_the_template'
                if (field.fieldname === 'name_of_the_template' && field.fieldtype === 'Link') {
                    // This is the template link field - enhance it for special handling
                    return {
                        ...field,
                        // Add a custom property to identify this field for special handling in DynamicForm
                        triggers_update: true,
                    };
                }
                return field;
            });

            setFieldsData(updatedFields);

        } catch (err) {
            console.error('Error fetching initial form data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load form data');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchChecklist = async (template: string) => {
        console.log(`Fetching checklist for template: ${template}...`);
        setIsLoading(true);
        setError(null);

        try {
            // Based on the data structure, the template doctype is "Quality Checklist Template"
            const templateDoctype = 'Quality Checklist Template';
            
            const response = await fetch('/api/v2/method/frappe.client.get', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || '',
                },
                body: JSON.stringify({
                    doctype: templateDoctype,
                    name: template
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - Template '${template}' not found in ${templateDoctype}`);
            }

            const data = await response.json();
            console.log('Checklist API Response:', data);

            // Based on the data structure, checklist items are in the 'checklist' field
            if (data.data && data.data.checklist) {
                console.log(`📋 Found ${data.data.checklist.length} checklist items for template '${template}'`);
                setChecklistData(data.data.checklist);
                
                // Auto-populate the checklist child table in formData
                setFormData(prev => ({
                    ...prev,
                    checklist: data.data.checklist.map((item: any) => ({
                        particulars: item.particulars,
                        activity_check: item.activity_check,
                        response: item.response || '',
                        remarks: item.remarks || ''
                    }))
                }));
            } else {
                console.warn('No checklist items found in template');
                setChecklistData([]);
            }

        } catch (err) {
            console.error('Error fetching checklist:', err);
            setError(err instanceof Error ? err.message : 'Failed to load checklist');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submission using Frappe React SDK
    const handleFormSubmit = async (submittedFormData: FormData) => {
        console.log('Creating new Quality Checklist Inspection with data:', submittedFormData);
        setError(null);
        reset(); // Reset any previous state from the hook

        try {
            // Use the Frappe React SDK hook to create the document
            const result = await createDoc('Quality Checklist Inspection', submittedFormData);
            console.log('Quality Checklist Inspection created successfully:', result);
            // Navigation is handled in useEffect when isCompleted becomes true
        } catch (err) {
            console.error('Quality Checklist Inspection creation error:', err);
            // The createError from the hook will also be set automatically
            setError(err instanceof Error ? err.message : 'Failed to create quality checklist inspection');
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-6">
                        {/* Breadcrumb Navigation */}
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/quality')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-0 h-auto font-normal"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Quality
                            </Button>
                        </div>

                        {/* Page Title & Description */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                                    Create New Quality Checklist Inspection
                                </h1>
                            </div>
                            <p className="text-gray-600 text-base max-w-3xl leading-relaxed">
                                Conduct a comprehensive quality inspection using predefined checklist templates. This inspection will evaluate
                                compliance with quality standards, document findings, and track corrective actions. All required fields are marked with an asterisk (*).
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center space-y-4">
                                <div className="mx-auto w-14 h-14 bg-blue-50 rounded-sm border border-gray-200 flex items-center justify-center">
                                    <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-900">Loading Quality Checklist Inspection Form</h3>
                                    <p className="text-gray-600 text-sm">Fetching Quality Checklist Inspection DocType fields and preparing the form...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {(error || createError) && (
                        <Alert className="border-red-200 bg-red-50 rounded-sm">
                            <AlertDescription className="text-red-700">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="font-semibold text-red-800 mb-1">Unable to Load Form</div>
                                        <div className="text-sm">{error || createError?.message}</div>
                                    </div>
                                    <div className="flex gap-2 ml-4 shrink-0">
                                        {error && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={fetchQualityChecklistFields}
                                                className="text-xs border-red-300 text-red-700 hover:bg-red-100"
                                            >
                                                Try Again
                                            </Button>
                                        )}
                                        {createError && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    reset();
                                                    setError(null);
                                                }}
                                                className="text-xs border-red-300 text-red-700 hover:bg-red-100"
                                            >
                                                Clear Error
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Success State */}
                    {isCompleted && (
                        <Alert className="border-green-200 bg-green-50 rounded-sm">
                            <AlertDescription className="text-green-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-green-800 mb-1">Quality Checklist Inspection Created Successfully!</div>
                                        <div className="text-sm">Redirecting you to the quality dashboard...</div>
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Dynamic Form */}
                    {fieldsData && !isLoading && (
                        <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
                            <DynamicForm
                                fields={fieldsData}
                                onSubmit={handleFormSubmit}
                                onFieldChange={(field: FieldMetadata, value: any) => {
                                    setFormData(prev => ({ ...prev, [field.fieldname]: value }));
                                    
                                    // Handle Template selection to fetch checklist
                                    if (field.fieldname === 'name_of_the_template' && field.triggers_update) {
                                        console.log(`🎯 Quality Checklist Template selected: ${value}`);
                                        setTemplate(value);

                                        // Fetch the checklist data immediately when template is selected
                                        if (value) {
                                            fetchChecklist(value);
                                        }
                                    }
                                }}
                                initialData={formData}
                                onCancel={() => navigate('/quality')}
                                loading={createLoading}
                                doctype={doctype_name}
                                title="Quality Checklist Inspection Details"
                                description="Complete all required fields to conduct your quality checklist inspection. Use predefined templates for consistent quality evaluation and compliance tracking."
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewQualityChecklistInspectionForm;