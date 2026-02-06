import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { DynamicForm } from '../../../components/form/DynamicForm';
import type { FieldMetadata, FormData } from '../../../types/form';
import {useFrappeCreateDoc} from 'frappe-react-sdk';

const NewRccbTrackerForm: React.FC = () => {
    const navigate = useNavigate();
    const [fieldsData, setFieldsData] = useState<FieldMetadata[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({});
    const doctype_name = 'RCCB Tracker';
    
    // Use Frappe React SDK hook for creating documents
    const { createDoc, loading: createLoading, error: createError, isCompleted, reset } = useFrappeCreateDoc();

    // Fetch RCCB Tracker DocType fields on component mount
    useEffect(() => {
        fetchRccbTrackerFields();
    }, []);

    // Handle successful form creation
    useEffect(() => {
        if (isCompleted && !createError) {
            // Small delay to show success message before navigation
            const timer = setTimeout(() => {
                navigate('/safety');
            }, 1500);
            
            return () => clearTimeout(timer);
        }
    }, [isCompleted, createError, navigate]);

    const fetchRccbTrackerFields = async () => {
        console.log('Fetching RCCB Tracker DocType fields...');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/v2/method/kbweb.api.get_fields_of_doctype.get_form_meta', {
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
            console.log('RCCB Tracker fields API Response:', data);

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
            
            console.log('Loaded', fieldsArray.length, 'RCCB Tracker fields');
            console.log('Sample field data:', fieldsArray[0]); // Debug field structure
            setFieldsData(fieldsArray);
        } catch (err) {
            console.error('Error fetching RCCB Tracker fields:', err);
            setError(err instanceof Error ? err.message : 'Failed to load RCCB Tracker fields');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submission using Frappe React SDK
    const handleFormSubmit = async (data: FormData) => {
        console.log('Creating new RCCB Tracker with data:', data);
        setError(null);
        reset();
        
        try {
            // Use the Frappe React SDK hook to create the document
            const result = await createDoc('RCCB Tracker', { ...data });
            console.log('RCCB Tracker created successfully:', result);
            // Navigation is handled in useEffect when isCompleted becomes true
        } catch (err) {
            console.error('RCCB Tracker creation error:', err);
            // The createError from the hook will also be set automatically
            setError(err instanceof Error ? err.message : 'Failed to create RCCB Tracker record');
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
                                onClick={() => navigate('/safety')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-0 h-auto font-normal"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Safety
                            </Button>
                        </div>
                        
                        {/* Page Title & Description */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                                    New RCCB Tracker Record
                                </h1>
                            </div>
                            <p className="text-gray-600 text-base max-w-3xl leading-relaxed">
                                Create a comprehensive RCCB (Residual Current Circuit Breaker) testing and tracking record. Monitor electrical safety systems, test results, and maintenance schedules.
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
                                    <h3 className="text-lg font-semibold text-gray-900">Loading RCCB Tracker Form</h3>
                                    <p className="text-gray-600 text-sm">Fetching DocType fields and preparing the electrical safety form...</p>
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
                                                onClick={fetchRccbTrackerFields}
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
                                        <div className="font-semibold text-green-800 mb-1">RCCB Tracker Record Created Successfully!</div>
                                        <div className="text-sm">Redirecting you to the safety module...</div>
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
                                initialData={formData}
                                onSubmit={handleFormSubmit}
                                onCancel={() => navigate('/safety')}
                                loading={createLoading}
                                doctype={doctype_name}
                                title="RCCB Tracker Details"
                                description="Complete all electrical safety testing details for RCCB (Residual Current Circuit Breaker) systems. Include test results, tripping times, and maintenance information."
                                onFieldChange={(field: FieldMetadata, value: any) => {
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

export default NewRccbTrackerForm;