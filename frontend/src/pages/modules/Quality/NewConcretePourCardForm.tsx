import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { DynamicForm } from '../../../components/form/DynamicForm';
import type { FieldMetadata, FormData } from '../../../types/form';
import {useFrappeCreateDoc} from 'frappe-react-sdk';

const NewConcretePourCardForm: React.FC = () => {
    const navigate = useNavigate();
    const [fieldsData, setFieldsData] = useState<FieldMetadata[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({});
    const doctype_name = 'Concrete Pour Card';
    
    // Use Frappe React SDK hook for creating documents
    const { createDoc, loading: createLoading, error: createError, isCompleted, reset } = useFrappeCreateDoc();

    // Fetch Concrete Pour Card DocType fields on component mount
    useEffect(() => {
        fetchConcretePourCardFields();
    }, []);

    // Handle successful form creation
    useEffect(() => {
        if (isCompleted && !createError) {
            // Small delay to show success message before navigation
            const timer = setTimeout(() => {
                navigate('/quality');
            }, 1500);
            
            return () => clearTimeout(timer);
        }
    }, [isCompleted, createError, navigate]);

    const fetchConcretePourCardFields = async () => {
        console.log('Fetching Concrete Pour Card DocType fields...');
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
            console.log('Concrete Pour Card fields API Response:', data);

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
            
            console.log('Loaded', fieldsArray.length, 'Concrete Pour Card fields');
            console.log('Sample field data:', fieldsArray[0]); // Debug field structure
            setFieldsData(fieldsArray);
        } catch (err) {
            console.error('Error fetching Concrete Pour Card fields:', err);
            setError(err instanceof Error ? err.message : 'Failed to load Concrete Pour Card fields');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submission using Frappe React SDK
    const handleFormSubmit = async (submittedFormData: FormData) => {
        console.log('Creating new Concrete Pour Card with data:', submittedFormData);
        setError(null);
        reset(); // Reset any previous state from the hook
        
        try {
            // Use the Frappe React SDK hook to create the document
            const result = await createDoc('Concrete Pour Card', submittedFormData);
            console.log('Concrete Pour Card created successfully:', result);
            // Navigation is handled in useEffect when isCompleted becomes true
        } catch (err) {
            console.error('Concrete Pour Card creation error:', err);
            // The createError from the hook will also be set automatically
            setError(err instanceof Error ? err.message : 'Failed to create Concrete Pour Card record');
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
                                    New Concrete Pour Card
                                </h1>
                            </div>
                            <p className="text-gray-600 text-base max-w-3xl leading-relaxed">
                                Create a comprehensive concrete pour card to document concrete pouring activities, quality control measures, and compliance with construction standards. Track concrete grades, quantities, timing, and inspection checklists.
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
                                    <h3 className="text-lg font-semibold text-gray-900">Loading Concrete Pour Card Form</h3>
                                    <p className="text-gray-600 text-sm">Fetching DocType fields and preparing the quality control form...</p>
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
                                                onClick={fetchConcretePourCardFields}
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
                                        <div className="font-semibold text-green-800 mb-1">Concrete Pour Card Created Successfully!</div>
                                        <div className="text-sm">Redirecting you to the quality module...</div>
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
                                    setFormData(prev => ({
                                        ...prev,
                                        [field.fieldname]: value
                                    }));
                                }}
                                initialData={formData}
                                onCancel={() => navigate('/quality')}
                                loading={createLoading}
                                doctype={doctype_name}
                                title="Concrete Pour Card Details"
                                description="Document concrete pouring activities with comprehensive quality control information. Include project details, concrete specifications, timing data, quality checklists, and inspection signatures."
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewConcretePourCardForm;