import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DynamicForm } from "@/components/form/DynamicForm";
import type { FieldMetadata, FormData } from "@/types/form";
import { useFrappeCreateDoc, useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk';

const EmployeeAdvanceForm = () => {
    const navigate = useNavigate();
    const [fieldsData, setFieldsData] = useState<FieldMetadata[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({});
    const doctype_name = 'Employee Advance';

    // Fetch current employee
    // Fetch current employee
    const { data: employeeList } = useFrappeGetDocList('Employee', {
        filters: [['user_id', '=', (window as any).frappe?.session?.user || 'Administrator']],
        fields: ['name', 'company']
    });
    const employeeData = employeeList?.[0];

    // Use Frappe React SDK hook for creating documents
    const { createDoc, loading: createLoading, error: createError, isCompleted, reset } = useFrappeCreateDoc();

    useEffect(() => {
        if (employeeData) {
            setFormData(prev => ({
                ...prev,
                employee: employeeData.name,
                company: employeeData.company
            }));
        }
    }, [employeeData]);

    useEffect(() => {
        fetchFormFields();
    }, []);

    // Handle successful creation
    useEffect(() => {
        if (isCompleted && !createError) {
            const timer = setTimeout(() => {
                navigate('/hrms/employee-advances');
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isCompleted, createError, navigate]);

    const fetchFormFields = async () => {
        console.log(`Fetching ${doctype_name} fields...`);
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/v2/method/pulse.api.get_fields_of_doctype.get_form_meta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
            console.log('Fields API Response:', data);

            let fieldsArray = data.message || data.data || data;

            if (!Array.isArray(fieldsArray)) {
                throw new Error('Invalid response format - expected array of fields');
            }

            setFieldsData(fieldsArray);

        } catch (err) {
            console.error(`Error fetching ${doctype_name} fields:`, err);
            setError(err instanceof Error ? err.message : 'Failed to load form fields');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = async (data: FormData) => {
        console.log(`Creating new ${doctype_name} with data:`, data);
        setError(null);
        reset();

        try {
            await createDoc(doctype_name, {
                ...data,
                employee: employeeData?.name,
                company: employeeData?.company,
                docstatus: 0
            });
        } catch (err) {
            console.error(`${doctype_name} creation error:`, err);
            setError(err instanceof Error ? err.message : `Failed to create ${doctype_name}`);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-6">
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/hrms/employee-advances')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-0 h-auto font-normal"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Advances
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                                New Employee Advance
                            </h1>
                            <p className="text-gray-600 text-base max-w-3xl leading-relaxed">
                                Request a new employee advance.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">

                    {isLoading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center space-y-4">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                <p className="text-muted-foreground">Loading form...</p>
                            </div>
                        </div>
                    )}

                    {(error || createError) && (
                        <Alert className="border-red-200 bg-red-50">
                            <AlertDescription className="text-red-700">
                                {error || createError?.message}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchFormFields}
                                    className="ml-4 border-red-300 text-red-700 hover:bg-red-100"
                                >
                                    Try Again
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {isCompleted && (
                        <Alert className="border-green-200 bg-green-50">
                            <AlertDescription className="text-green-700">
                                Employee Advance submitted successfully! Redirecting...
                            </AlertDescription>
                        </Alert>
                    )}

                    {fieldsData && !isLoading && (
                        <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
                            <DynamicForm
                                fields={fieldsData}
                                initialData={formData}
                                onSubmit={handleFormSubmit}
                                onCancel={() => navigate('/hrms/employee-advances')}
                                loading={createLoading}
                                doctype={doctype_name}
                                title="Advance Details"
                                description="Please fill in the details below."
                                onFieldChange={(field, value) => {
                                    setFormData(prev => ({ ...prev, [field.fieldname]: value }));
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeAdvanceForm;
