import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { DynamicForm } from '../../../components/form/DynamicForm';
import type { FieldMetadata, FormData } from '../../../types/form';
import { useFrappeGetDoc, useFrappeUpdateDoc } from 'frappe-react-sdk';

const EditProjectForm: React.FC = () => {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const [fieldsData, setFieldsData] = useState<FieldMetadata[] | null>(null);
    const [isLoadingFields, setIsLoadingFields] = useState(true);
    const [fieldsError, setFieldsError] = useState<string | null>(null);
    const doctype_name = 'Project';

    // Fetch existing project data
    const {
        data: projectData,
        isLoading: isProjectLoading,
        error: projectError,
        mutate: refreshProject
    } = useFrappeGetDoc('Project', projectId);

    // Update document hook
    const {
        updateDoc,
        loading: updateLoading,
        error: updateError,
        isCompleted: isUpdateCompleted,
        reset: resetUpdate
    } = useFrappeUpdateDoc();

    // Fetch Project DocType fields on component mount
    useEffect(() => {
        fetchProjectFields();
    }, []);

    // Handle successful project update
    useEffect(() => {
        if (isUpdateCompleted && !updateError) {
            // Small delay to show success message before navigation
            const timer = setTimeout(() => {
                navigate('/projects');
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [isUpdateCompleted, updateError, navigate]);

    const fetchProjectFields = async () => {
        console.log('Fetching Project DocType fields...');
        setIsLoadingFields(true);
        setFieldsError(null);

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

            setFieldsData(fieldsArray);
        } catch (err) {
            console.error('Error fetching Project fields:', err);
            setFieldsError(err instanceof Error ? err.message : 'Failed to load Project fields');
        } finally {
            setIsLoadingFields(false);
        }
    };

    // Handle form submission
    const handleFormSubmit = async (formData: FormData) => {
        if (!projectId) return;

        console.log('Updating project with data:', formData);
        resetUpdate(); // Reset any previous state from the hook

        try {
            await updateDoc('Project', projectId, formData);
        } catch (err) {
            console.error('Project update error:', err);
        }
    };

    const isLoading = isLoadingFields || isProjectLoading;
    const error = fieldsError || (projectError ? projectError.message : null);

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
                                onClick={() => navigate('/projects')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-0 h-auto font-normal"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Projects
                            </Button>
                        </div>

                        {/* Page Title & Description */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                                    Edit Project: {projectId}
                                </h1>
                            </div>
                            <p className="text-gray-600 text-base max-w-3xl leading-relaxed">
                                Update the project details below. All required fields are marked with an asterisk (*).
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
                                    <h3 className="text-lg font-semibold text-gray-900">Loading Project Details</h3>
                                    <p className="text-gray-600 text-sm">Fetching project data and form configuration...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {(error || updateError) && (
                        <Alert className="border-red-200 bg-red-50 rounded-sm">
                            <AlertDescription className="text-red-700">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="font-semibold text-red-800 mb-1">
                                            {updateError ? 'Update Failed' : 'Unable to Load Project'}
                                        </div>
                                        <div className="text-sm">{error || updateError?.message}</div>
                                    </div>
                                    <div className="flex gap-2 ml-4 shrink-0">
                                        {!updateError && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    fetchProjectFields();
                                                    refreshProject();
                                                }}
                                                className="text-xs border-red-300 text-red-700 hover:bg-red-100"
                                            >
                                                Try Again
                                            </Button>
                                        )}
                                        {updateError && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => resetUpdate()}
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
                    {isUpdateCompleted && (
                        <Alert className="border-green-200 bg-green-50 rounded-sm">
                            <AlertDescription className="text-green-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-green-800 mb-1">Project Updated Successfully!</div>
                                        <div className="text-sm">Redirecting you to the projects list...</div>
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Dynamic Form */}
                    {fieldsData && projectData && !isLoading && (
                        <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
                            <DynamicForm
                                fields={fieldsData}
                                initialData={projectData}
                                onSubmit={handleFormSubmit}
                                onCancel={() => navigate('/projects')}
                                loading={updateLoading}
                                doctype={doctype_name}
                                docname={projectId}
                                title="Project Details"
                                description="Update the project details below."
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditProjectForm;
