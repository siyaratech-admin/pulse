import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Loader2, Save, Edit, ShieldCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { DynamicForm } from '../../../components/form/DynamicForm';
import type { FieldMetadata, FormData } from '../../../types/form';
import {
    useFrappeCreateDoc,
    useFrappeUpdateDoc,
    useFrappeGetDoc
} from 'frappe-react-sdk';

const EarthPitInspectionForm: React.FC = () => {
    const navigate = useNavigate();
    const { id: urlId } = useParams<{ id?: string }>();

    const doctype_name = 'Earth Pit Inspection';

    // 1. Logic to avoid the 404 "new" error
    const isEditMode = useMemo(() => {
        return !!urlId && urlId !== 'new' && urlId !== 'create';
    }, [urlId]);

    const documentId = isEditMode ? urlId : undefined;

    // 2. State
    const [rawFields, setRawFields] = useState<FieldMetadata[] | null>(null);
    const [metaLoading, setMetaLoading] = useState(true);
    const [metaError, setMetaError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({});

    // --- Frappe Hooks ---
    const { data: existingDoc, isLoading: docLoading, error: docFetchError } = useFrappeGetDoc(doctype_name, documentId, {
        enabled: !!documentId
    });

    const { createDoc, loading: createLoading, error: createError, isCompleted: createCompleted, reset: resetCreate } = useFrappeCreateDoc();
    const { updateDoc, loading: updateLoading, error: updateError, isCompleted: updateCompleted, reset: resetUpdate } = useFrappeUpdateDoc();

    // --- Helper: Extract Frappe Validation Message ---
    const getErrorMessage = (error: any) => {
        if (!error) return null;

        // Check for Frappe's _server_messages (this is where the Approver Template error lives)
        if (error._server_messages) {
            try {
                const messages = JSON.parse(error._server_messages);
                // messages is a list of stringified JSON objects
                const detail = JSON.parse(messages[0]);
                // Remove HTML tags like <b> if they exist
                return detail.message.replace(/<[^>]*>?/gm, '');
            } catch (e) {
                return error.message || "An unexpected error occurred";
            }
        }

        if (error.message) return error.message;
        return "Something went wrong";
    };

    // --- Logic: Metadata Processing ---
    const processedFields = useMemo(() => {
        if (!rawFields) return [];

        return rawFields
            .filter((field) => field.hidden !== 1 && field.hidden !== true)
            .sort((a, b) => (a.idx || 0) - (b.idx || 0))
            .filter((field) => {
                if (!field.depends_on) return true;
                try {
                    if (field.depends_on.startsWith('eval:')) {
                        const condition = field.depends_on.replace('eval:', '');
                        const fn = new Function('doc', `return ${condition}`);
                        return fn(formData);
                    }
                    return true;
                } catch (e) {
                    return true;
                }
            });
    }, [rawFields, formData]);

    // --- Effects ---
    useEffect(() => {
        const fetchMeta = async () => {
            setMetaLoading(true);
            try {
                const response = await fetch('/api/v2/method/kbweb.api.get_fields_of_doctype.get_form_meta', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || '',
                    },
                    body: JSON.stringify({ doctype_name: 'Earth Pit Inspection' })
                });
                const result = await response.json();
                const fields = result.data || result.message || result;
                if (!Array.isArray(fields)) throw new Error("Metadata response is not an array");
                setRawFields(fields);
            } catch (err: any) {
                setMetaError(err.message);
            } finally {
                setMetaLoading(false);
            }
        };
        fetchMeta();
    }, []);

    useEffect(() => {
        if (existingDoc) setFormData(existingDoc);
    }, [existingDoc]);

    useEffect(() => {
        if ((createCompleted && !createError) || (updateCompleted && !updateError)) {
            const timer = setTimeout(() => navigate('/safety'), 1500);
            return () => clearTimeout(timer);
        }
    }, [createCompleted, createError, updateCompleted, updateError, navigate]);

    // --- Handlers ---
    const handleFormSubmit = async (data: FormData) => {
        resetCreate();
        resetUpdate();
        try {
            if (isEditMode && documentId) {
                await updateDoc(doctype_name, documentId, data);
            } else {
                await createDoc(doctype_name, data);
            }
        } catch (e) {
            // Errors are caught by the SDK hooks and stored in createError/updateError
            console.error("Form Submission Failed", e);
        }
    };

    const isLoading = metaLoading || (isEditMode && docLoading);
    const isSubmitting = createLoading || updateLoading;

    // Consolidate specific server error messages
    const serverError = getErrorMessage(createError || updateError);
    const activeError = metaError || docFetchError?.message || serverError;

    const isSuccess = (createCompleted && !createError) || (updateCompleted && !updateError);

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/safety')} className="text-gray-500 hover:bg-gray-100">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back
                        </Button>
                        <div className="h-6 w-px bg-gray-200" />
                        <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-blue-600" />
                            {isEditMode ? `Edit Inspection` : 'New Earth Pit Inspection'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {isEditMode && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded border border-blue-100 uppercase">
                                ID: {documentId}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-6">
                {/* Error Alert - Now displays the specific Validation Error from Backend */}
                {activeError && (
                    <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50 text-red-900 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Action Required</AlertTitle>
                        <AlertDescription className="mt-1 font-medium">
                            {activeError}
                        </AlertDescription>
                    </Alert>
                )}

                {isSuccess && (
                    <Alert className="mb-6 bg-emerald-50 border-emerald-200 text-emerald-800">
                        <AlertDescription className="font-medium">
                            Inspection submitted successfully. Redirecting...
                        </AlertDescription>
                    </Alert>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white border rounded-xl shadow-sm">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
                        <p className="text-gray-500 animate-pulse">Loading Document structure...</p>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                            <div>
                                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-tight">Technical Inspection</h2>
                                <p className="text-xs text-gray-500 mt-1">Fields marked with * are mandatory for compliance.</p>
                            </div>
                            {isSubmitting && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
                        </div>

                        <div className="p-2">
                            <DynamicForm
                                fields={processedFields}
                                initialData={formData}
                                onSubmit={handleFormSubmit}
                                onCancel={() => navigate('/safety')}
                                loading={isSubmitting}
                                doctype={doctype_name}
                                onFieldChange={(field, value) => {
                                    setFormData(prev => ({ ...prev, [field.fieldname]: value }));
                                }}
                            />
                        </div>

                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between">
                            <p className="text-[10px] text-gray-400">
                                Environment: Production | Doctype: {doctype_name}
                            </p>
                            <p className="text-[10px] text-gray-400">
                                v1.0.4
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EarthPitInspectionForm;