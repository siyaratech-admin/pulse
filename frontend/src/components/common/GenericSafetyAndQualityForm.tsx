/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from 'react';
import { cn } from "@/lib/utils";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useFrappeGetCall, useFrappeGetDoc, useFrappeCreateDoc, useFrappeUpdateDoc, useFrappePostCall } from 'frappe-react-sdk';
import { TabbedDynamicForm } from "@/components/form/TabbedDynamicForm";
import { Loader2, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PrintButton } from "@/components/print/PrintButton";
import GenericComments from "@/components/common/GenericComments";
import { FormSidebar } from "@/components/form/sidebar/FormSidebar";
import { StandardHeader } from "@/components/common/StandardHeader";
import { FormDashboard } from "@/components/form/FormDashboard";
import { toast } from "sonner";
import { FormActionsMenu } from "@/components/form/FormActionsMenu";
import { MakeMenu } from "@/components/form/MakeMenu";
import { AssignmentBadge } from "@/components/form/AssignmentBadge";
import { WorkflowActions } from "@/components/form/WorkflowActions";
import { DocTypeActions } from "@/components/form/DocTypeActions";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Helper to parse HTML content and convert it to React elements
 */
const parseHTMLContent = (htmlString: string): React.ReactNode => {
    if (!htmlString) return null;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    const parseNode = (node: Node): React.ReactNode => {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            const tagName = element.tagName.toLowerCase();
            const children = Array.from(element.childNodes).map((child, index) => (
                <React.Fragment key={index}>{parseNode(child)}</React.Fragment>
            ));

            switch (tagName) {
                case 'b':
                case 'strong':
                    return <strong className="font-bold text-gray-900">{children}</strong>;
                case 'i':
                case 'em':
                    return <em className="italic">{children}</em>;
                case 'u':
                    return <u className="underline">{children}</u>;
                case 'a':
                    return (
                        <a
                            href={element.getAttribute('href') || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline font-medium"
                        >
                            {children}
                        </a>
                    );
                case 'br':
                    return <br />;
                case 'li':
                    return <li className="ml-4 mb-1 list-disc">{children}</li>;
                case 'ul':
                    return <ul className="my-2 space-y-1">{children}</ul>;
                case 'ol':
                    return <ol className="my-2 space-y-1 list-decimal ml-4">{children}</ol>;
                case 'p':
                    return <p className="mb-2">{children}</p>;
                case 'div':
                    return <div className="mb-1">{children}</div>;
                case 'span':
                    return <span>{children}</span>;
                case 'code':
                    return <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>;
                default:
                    return <span>{children}</span>;
            }
        }

        return null;
    };

    return Array.from(tempDiv.childNodes).map((node, index) => (
        <React.Fragment key={index}>{parseNode(node)}</React.Fragment>
    ));
};

/**
 * Helper to extract human-readable error messages from Frappe/ERPNext
 */
const getFrappeErrorMessage = (error: any): { title: string; content: React.ReactNode } => {
    let rawMessage = '';

    if (error._server_messages) {
        try {
            const messages = JSON.parse(error._server_messages);
            const detail = JSON.parse(messages[0]);
            rawMessage = detail.message || detail.description || "An unexpected validation error occurred";
        } catch (e) {
            console.error("Error parsing server messages", e);
            rawMessage = error._server_messages;
        }
    } else if (error.exception) {
        rawMessage = error.exception;
    } else if (error.message) {
        rawMessage = error.message;
    } else {
        rawMessage = "Server error. Please check your data.";
    }

    const parsedContent = parseHTMLContent(rawMessage);

    return {
        title: "Error",
        content: parsedContent || rawMessage
    };
};

/**
 * Custom toast components
 */
const showErrorToast = (errorData: { title: string; content: React.ReactNode }) => {
    toast.error(
        <div className="space-y-2 max-w-2xl">
            <div className="font-semibold text-base">{errorData.title}</div>
            <div className="text-sm leading-relaxed text-gray-700 max-h-96 overflow-y-auto">
                {errorData.content}
            </div>
        </div>,
        {
            duration: 8000,
            position: "top-right",
            className: "min-w-[400px] max-w-2xl",
            style: {
                minWidth: '400px',
                maxWidth: '600px',
                padding: '16px',
            }
        }
    );
};

const showSuccessToast = (message: string, description?: string) => {
    toast.success(
        <div className="space-y-1">
            <div className="font-semibold text-base">{message}</div>
            {description && (
                <div className="text-sm text-gray-600">{description}</div>
            )}
        </div>,
        {
            duration: 4000,
            position: "bottom-right",
            className: "min-w-[350px]",
            style: {
                minWidth: '350px',
                padding: '14px',
            }
        }
    );
};

const showInfoToast = (message: string, description?: string) => {
    toast.info(
        <div className="space-y-1">
            <div className="font-semibold text-base">{message}</div>
            {description && (
                <div className="text-sm text-gray-600">{description}</div>
            )}
        </div>,
        {
            duration: 3000,
            position: "bottom-right",
            className: "min-w-[350px]",
            style: {
                minWidth: '350px',
                padding: '14px',
            }
        }
    );
};

const showWarningToast = (message: string, description?: string) => {
    toast.warning(
        <div className="space-y-1">
            <div className="font-semibold text-base">{message}</div>
            {description && (
                <div className="text-sm text-gray-600">{description}</div>
            )}
        </div>,
        {
            duration: 3000,
            position: "bottom-right",
            className: "min-w-[350px]",
            style: {
                minWidth: '350px',
                padding: '14px',
            }
        }
    );
};

/**
 * DOCTYPE CONFIGURATIONS
 */
const CHECKLIST_DOCTYPES = {
    'SafetyChecklist': {
        childTable: 'check_points',
        responseField: 'response',
        resultField: 'result',
        passValue: 'Yes',
        failValue: 'No'
    },
    'MaterialInspection': {
        childTable: 'check_points',
        responseField: 'response',
        resultField: 'result',
        passValue: 'Yes',
        failValue: 'No'
    },
    'EarthPitInspection': {
        childTable: 'check_points',
        responseField: 'response',
        resultField: 'result',
        passValue: 'Yes',
        failValue: 'No'
    },
    'RCCBTracker': {
        childTable: 'check_points',
        responseField: 'response',
        resultField: 'result',
        passValue: 'Yes',
        failValue: 'No'
    },
    'SafetyChecklistTemplate': {
        childTable: 'check_points',
        responseField: 'response',
        resultField: 'result',
        passValue: 'Yes',
        failValue: 'No'
    },
    'MaterialTemplate': {
        childTable: 'check_points',
        responseField: 'response',
        resultField: 'result',
        passValue: 'Yes',
        failValue: 'No'
    },
    'AluformChecklistInspection': {
        childTable: 'check_points',
        responseField: 'response',
        resultField: 'result',
        passValue: 'Yes',
        failValue: 'No'
    },
    'QualityChecklistInspection': {
        childTable: 'check_points',
        responseField: 'response',
        resultField: 'result',
        passValue: 'Yes',
        failValue: 'No'
    }
};

interface SafetyQualityProps {
    doctype: string;
    title?: string;
    statusField?: string;
}

const GenericSafetyAndQualityForm: React.FC<SafetyQualityProps> = ({
    doctype,
    title,
    statusField = 'status'
}) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isNew = !id || id === 'new';

    const formRef = React.useRef<any>(null);

    // UI State
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [isSubmittable, setIsSubmittable] = useState(false);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDataReady, setIsDataReady] = useState(false);
    const [loadingTimeout, setLoadingTimeout] = useState(false);

    const [localFormData, setLocalFormData] = useState<any>({});
    const [savedStatus, setSavedStatus] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const checklistConfig = CHECKLIST_DOCTYPES[doctype as keyof typeof CHECKLIST_DOCTYPES];

    // Fetch Form Context
    const { data: contextData, isLoading: contextLoading, mutate: refreshContext } = useFrappeGetCall(
        'kbweb.api.get_doctype_form_context.get_form_context',
        { doctype: doctype, name: isNew ? undefined : id }
    );

    // Fetch Meta
    const { data: metaData, isLoading: metaLoading, error: metaError } = useFrappeGetCall(
        'kbweb.api.get_fields_of_doctype.get_form_meta',
        { doctype_name: doctype }
    );

    // Fetch Doc if editing
    const { data: docData, isLoading: docLoading, error: docError, mutate: refreshDoc } = useFrappeGetDoc(
        doctype,
        isNew ? undefined : id
    );

    // Fetch current user info
    const { data: currentUserData } = useFrappeGetCall('frappe.auth.get_logged_user');

    // API Mutation Hooks
    const { createDoc, loading: createLoading } = useFrappeCreateDoc();
    const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();
    const { call: submitDoc, loading: submitLoading } = useFrappePostCall('frappe.client.submit');
    const { call: cancelDoc, loading: cancelLoading } = useFrappePostCall('frappe.client.cancel');

    // Parse assignees
    const assignees = React.useMemo(() => {
        if (!docData?._assign) return [];
        try {
            return JSON.parse(docData._assign);
        } catch (e) {
            return [];
        }
    }, [docData?._assign]);

    // Timeout for loading
    useEffect(() => {
        if (!isNew && (docLoading || metaLoading || contextLoading || !isDataReady)) {
            const timeout = setTimeout(() => {
                if (!isDataReady && !docData) {
                    console.error('⚠️ Loading timeout - forcing data ready state');
                    setLoadingTimeout(true);
                    setIsDataReady(true);
                }
            }, 10000); // 10 second timeout
            return () => clearTimeout(timeout);
        }
    }, [docLoading, metaLoading, contextLoading, isDataReady, isNew]);

    // Update local form data when doc loads
    useEffect(() => {
        if (docData && !isNew) {
            console.log('✅ Setting localFormData from docData:', docData);

            // ✅ FIX: Use inspection_status for SafetyChecklist instead of status
            const actualStatusField = doctype === 'SafetyChecklist' ? 'inspection_status' : statusField;
            const currentStatus = docData[actualStatusField] || null;

            console.log(`🔍 [${doctype}] Status field: "${actualStatusField}", Status value: "${currentStatus}"`);

            setLocalFormData({ ...docData });
            setSavedStatus(currentStatus);
            setIsDataReady(true);
            setLoadingTimeout(false);
        } else if (isNew && location.state?.defaults) {
            console.log('✅ Setting localFormData from defaults:', location.state.defaults);
            setLocalFormData(location.state.defaults);
            setSavedStatus(null);
            setIsDataReady(true);
        } else if (isNew) {
            console.log('✅ New form - data ready');
            setSavedStatus(null);
            setIsDataReady(true);
        }
    }, [docData, isNew, location.state, statusField, doctype]);

    // Reset data ready flag when navigating
    useEffect(() => {
        setIsDataReady(false);
        setLocalFormData({});
        setLoadingTimeout(false);
        setValidationErrors({});
        setSavedStatus(null);
    }, [id]);

    // Update read-only state
    useEffect(() => {
        if (contextData?.message) {
            setIsReadOnly(contextData.message.is_form_read_only);
            setIsSubmittable(contextData.message.is_submittable);
        }
    }, [contextData]);

    // Fallback: Check if doctype is submittable
    useEffect(() => {
        if (metaData?.message && !contextData?.message) {
            const submittable = metaData.message.find((field: any) => field.fieldname === 'is_submittable')?.default === 1;
            const isSubmittableFromMeta = metaData.is_submittable === 1 || metaData.message.some((f: any) => f.is_submittable);
            setIsSubmittable(isSubmittableFromMeta || submittable);
        }
    }, [metaData, contextData]);

    // Refresh all data
    const refreshAll = async () => {
        await Promise.all([
            refreshDoc(),
            refreshContext()
        ]);
    };

    // --- DYNAMIC FIELD FILTERING LOGIC ---
    const STATUS_SEQUENCE = [
        'Prepared',
        'Checked',
        'Reviewed',
        'Verified',
        'Approved',
    ];

    /**
     * ✅ FIXED: Dynamic field mapping that checks what fields actually exist
     * This builds the map from actual metadata instead of hardcoded values
     */
    const getStatusFieldMap = (fields: any[]): Record<string, string[]> => {
        const map: Record<string, string[]> = {
            Prepared: [],
            Checked: [],
            Reviewed: [],
            Verified: [],
            Approved: [],
        };

        // Find all fields that contain status-related keywords
        fields.forEach(field => {
            const fieldname = field.fieldname.toLowerCase();

            // Check for each status level
            if (fieldname.includes('prepared')) {
                map.Prepared.push(field.fieldname);
            }
            if (fieldname.includes('checked')) {
                map.Checked.push(field.fieldname);
            }
            if (fieldname.includes('reviewed')) {
                map.Reviewed.push(field.fieldname);
            }
            if (fieldname.includes('verified')) {
                map.Verified.push(field.fieldname);
            }
            if (fieldname.includes('approved')) {
                map.Approved.push(field.fieldname);
            }
        });

        console.log(`🗺️ [${doctype}] Dynamic STATUS_FIELD_MAP:`, map);
        return map;
    };

    /**
     * DOCTYPES WHERE STATUS FIELDS ARE ALWAYS VISIBLE
     */
    const ALWAYS_SHOW_STATUS_FIELDS_DOCTYPES = [
        'EHSandToolBox',
        'WorkPermitTemplate',
        'RequestForInspection',
        'SafetyChecklist',
    ];

    /**
     * AUTO-POPULATE STATUS CHANGE FIELDS
     */
    useEffect(() => {
        // ✅ FIX: Use inspection_status for SafetyChecklist
        const actualStatusField = doctype === 'SafetyChecklist' ? 'inspection_status' : statusField;
        const currentStatus = localFormData?.[actualStatusField];

        if (!currentStatus || isReadOnly || isNew) {
            return;
        }

        const currentStatusIndex = STATUS_SEQUENCE.indexOf(currentStatus);
        const savedStatusIndex = savedStatus ? STATUS_SEQUENCE.indexOf(savedStatus) : -1;

        if (currentStatusIndex > savedStatusIndex) {
            console.log(`🔄 [${doctype}] Status being changed to:`, currentStatus);

            // Get dynamic field map
            const rawFields: any[] = metaData?.message || [];
            const STATUS_FIELD_MAP = getStatusFieldMap(rawFields);
            const fieldsToPopulate = STATUS_FIELD_MAP[currentStatus];

            if (fieldsToPopulate && currentUserData && fieldsToPopulate.length > 0) {
                const updates: any = {};
                const currentUser = currentUserData.message || currentUserData;
                const userName = currentUser.full_name || currentUser.name || currentUser;
                const currentDate = new Date().toISOString().split('T')[0];
                const currentTime = new Date().toTimeString().split(' ')[0];

                fieldsToPopulate.forEach(fieldName => {
                    if (!localFormData[fieldName]) {
                        if (fieldName.includes('_by') && !fieldName.includes('date') && !fieldName.includes('time') && !fieldName.includes('signature')) {
                            updates[fieldName] = userName;
                        } else if (fieldName.includes('name_')) {
                            updates[fieldName] = userName;
                        } else if (fieldName.includes('date_')) {
                            updates[fieldName] = currentDate;
                        } else if (fieldName.includes('time_')) {
                            updates[fieldName] = currentTime;
                        }
                    }
                });

                if (Object.keys(updates).length > 0) {
                    console.log(`✅ [${doctype}] Auto-populating fields for status`, currentStatus, ':', updates);
                    setLocalFormData((prev: any) => ({ ...prev, ...updates }));

                    showInfoToast(
                        `${currentStatus} fields will be saved on document save`,
                        `Fields prepared for ${userName}`
                    );
                }
            }
        }
    }, [localFormData?.[doctype === 'SafetyChecklist' ? 'inspection_status' : statusField], savedStatus, currentUserData, statusField, isReadOnly, isNew, doctype, metaData]);

    // Data cleaning
    const cleanFormDataForSubmission = (data: any, fields: any[]) => {
        const cleaned = { ...data };

        const formatDate = (date: any) => {
            if (!date) return null;
            if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) return date;
            const d = new Date(date);
            if (isNaN(d.getTime())) return date;
            return d.toISOString().split('T')[0];
        };

        const formatTime = (time: any) => {
            if (!time) return null;
            if (typeof time === 'string' && time.match(/^\d{2}:\d{2}:\d{2}$/)) return time;
            const d = new Date(`1970-01-01T${time}`);
            if (isNaN(d.getTime())) return time;
            return d.toTimeString().split(' ')[0];
        };

        fields?.forEach(field => {
            const value = cleaned[field.fieldname];
            if (value !== undefined && value !== null) {
                if (field.fieldtype === 'Date') {
                    cleaned[field.fieldname] = formatDate(value);
                } else if (field.fieldtype === 'Time') {
                    cleaned[field.fieldname] = formatTime(value);
                } else if (field.fieldtype === 'Table' && Array.isArray(value)) {
                    cleaned[field.fieldname] = value.map((row: any) => {
                        const newRow = { ...row };
                        Object.keys(newRow).forEach(key => {
                            if (key.toLowerCase().includes('date') && newRow[key]) {
                                newRow[key] = formatDate(newRow[key]);
                            }
                            if (key.toLowerCase().includes('time') && newRow[key]) {
                                newRow[key] = formatTime(newRow[key]);
                            }
                        });
                        return newRow;
                    });
                }
            }
        });

        return cleaned;
    };

    /**
     * AUTO-FAIL LOGIC
     */
    const calculateChecklistResult = (checkPoints: any[]): 'Pass' | 'Fail' => {
        if (!checklistConfig || !Array.isArray(checkPoints) || checkPoints.length === 0) {
            return 'Pass';
        }

        const { responseField, failValue } = checklistConfig;
        const hasFailure = checkPoints.some((row: any) => {
            const response = row[responseField];
            return response === failValue;
        });

        return hasFailure ? 'Fail' : 'Pass';
    };

    /**
     * Auto-update result field
     */
    useEffect(() => {
        if (!checklistConfig || isReadOnly) return;

        const { childTable, resultField } = checklistConfig;
        const checkPoints = localFormData?.[childTable];

        if (Array.isArray(checkPoints) && checkPoints.length > 0) {
            const calculatedResult = calculateChecklistResult(checkPoints);
            const currentResult = localFormData[resultField];

            if (calculatedResult !== currentResult) {
                console.log(`🔄 [${doctype}] Auto-updating result from "${currentResult}" to "${calculatedResult}"`);
                setLocalFormData((prev: any) => ({ ...prev, [resultField]: calculatedResult }));

                if (calculatedResult === 'Fail') {
                    showWarningToast(`Result automatically set to "Fail" due to checklist response`);
                } else {
                    showSuccessToast(`Result automatically set to "Pass"`);
                }
            }
        }
    }, [localFormData?.[checklistConfig?.childTable || ''], doctype, checklistConfig, isReadOnly]);

    /**
     * ✅ COMPLETELY REWRITTEN: Get visible status fields dynamically
     */
    const getVisibleStatusFields = (currentSavedStatus: string | null, rawFields: any[]): string[] => {
        console.log(`🔍 [${doctype}] getVisibleStatusFields called`);
        console.log(`📊 [${doctype}] Saved status:`, currentSavedStatus);
        console.log(`📝 [${doctype}] Total fields in metadata:`, rawFields.length);

        // Build dynamic field map
        const STATUS_FIELD_MAP = getStatusFieldMap(rawFields);

        // Check if this doctype should always show status fields
        if (ALWAYS_SHOW_STATUS_FIELDS_DOCTYPES.includes(doctype)) {
            console.log(`🔓 [${doctype}] Always showing all status fields (exception doctype)`);
            const allStatusFields: string[] = [];
            STATUS_SEQUENCE.forEach(status => {
                const fields = STATUS_FIELD_MAP[status];
                if (fields && fields.length > 0) {
                    allStatusFields.push(...fields);
                }
            });
            console.log(`📋 [${doctype}] All status fields to show:`, allStatusFields);
            return allStatusFields;
        }

        // Check for mandatory status fields
        const mandatoryStatusFields: string[] = [];
        Object.values(STATUS_FIELD_MAP).forEach(fields => {
            fields.forEach(fieldName => {
                const field = rawFields.find(f => f.fieldname === fieldName);
                if (field && field.reqd === 1) {
                    console.log(`🔒 [${doctype}] Mandatory status field found: ${fieldName}`);
                    mandatoryStatusFields.push(...fields);
                }
            });
        });

        if (mandatoryStatusFields.length > 0) {
            const uniqueFields = [...new Set(mandatoryStatusFields)];
            console.log(`📌 [${doctype}] Showing mandatory status fields:`, uniqueFields);
            return uniqueFields;
        }

        // Default: Progressive reveal
        if (!currentSavedStatus) {
            console.log(`🔒 [${doctype}] No saved status - hiding all status fields`);
            return [];
        }

        const currentIndex = STATUS_SEQUENCE.indexOf(currentSavedStatus);
        if (currentIndex === -1) {
            console.log(`⚠️ [${doctype}] Unknown status: ${currentSavedStatus}`);
            return [];
        }

        const visibleFields: string[] = [];
        for (let i = 0; i <= currentIndex; i++) {
            const status = STATUS_SEQUENCE[i];
            const fields = STATUS_FIELD_MAP[status];
            if (fields && fields.length > 0) {
                visibleFields.push(...fields);
            }
        }

        console.log(`✅ [${doctype}] Progressive reveal - showing fields for statuses 0-${currentIndex}:`, visibleFields);
        return visibleFields;
    };

    const processedFields = useMemo(() => {
        const rawFields: any[] = metaData?.message || [];
        if (!rawFields.length) return [];

        console.log(`🔍 [${doctype}] processedFields - Processing ${rawFields.length} fields`);
        console.log(`📊 [${doctype}] processedFields - Saved status:`, savedStatus);

        const visibleStatusFields = getVisibleStatusFields(savedStatus, rawFields);
        console.log(`👀 [${doctype}] processedFields - Visible status fields:`, visibleStatusFields);

        return rawFields
            .map((field) => {
                // Request for Inspection patches
                if (doctype === 'RequestForInspection') {
                    const forceVisible = [
                        'signature_requested_by',
                        'name_requested_by',
                        'designation_requested_by',
                        'date_requested_by',
                        'time_requested_by',
                        'signature_received_by',
                        'name_received_by',
                        'designation_received_by',
                        'date_received_by',
                        'time_received_by'
                    ];
                    if (forceVisible.includes(field.fieldname)) {
                        return { ...field, hidden: 0 };
                    }
                    if (field.fieldname === 'others_specify') {
                        return { ...field, reqd: 0 };
                    }
                }

                // Checklist result field read-only
                if (checklistConfig && field.fieldname === checklistConfig.resultField) {
                    console.log(`🔒 [${doctype}] Making result field read-only`);
                    return { ...field, read_only: 1 };
                }

                // Fix duplicate date1 field
                if (doctype === 'FullBodysafetyHarness' && field.fieldname === 'date1') {
                    return null;
                }

                return field;
            })
            .filter((field) => {
                if (!field) return false;

                if (field.hidden === 1 || field.hidden === true) {
                    console.log(`🙈 [${doctype}] Field ${field.fieldname} is hard hidden`);
                    return false;
                }

                // Check if this is a status-controlled field
                const fieldLower = field.fieldname.toLowerCase();
                const isStatusField = ['prepared', 'checked', 'reviewed', 'verified', 'approved']
                    .some(status => fieldLower.includes(status));

                if (isStatusField) {
                    const shouldShow = visibleStatusFields.includes(field.fieldname);
                    if (shouldShow) {
                        console.log(`✅ [${doctype}] Showing status field: ${field.fieldname}`);
                    } else {
                        console.log(`🔒 [${doctype}] Hiding status field: ${field.fieldname}`);
                    }
                    return shouldShow;
                }

                return true;
            })
            .sort((a, b) => (a.idx || 0) - (b.idx || 0));
    }, [metaData, savedStatus, doctype, checklistConfig]);

    // Log final processed fields
    useEffect(() => {
        console.log(`📋 [${doctype}] Final field count:`, processedFields.length);
        console.log(`📝 [${doctype}] Final field names:`, processedFields.map((f: any) => f.fieldname));

        // Log specifically which status fields are visible
        const statusFields = processedFields.filter((f: any) => {
            const fieldLower = f.fieldname.toLowerCase();
            return ['prepared', 'checked', 'reviewed', 'verified', 'approved']
                .some(status => fieldLower.includes(status));
        });
        console.log(`🔍 [${doctype}] Visible status fields:`, statusFields.map((f: any) => f.fieldname));
    }, [processedFields, doctype]);

    // Get actions
    const actions = contextData?.message?.actions || {};

    // Hide draft badge for certain doctypes
    const HIDE_DRAFT_BADGE_DOCTYPES = [
        'RCCBTracker',
        'LiftingToolsandTackles',
        'FullBodysafetyHarness',
        'EHSandToolBox',
        'LabourOnboarding'
    ];

    // Get current status
    const getCurrentStatus = () => {
        if (!docData) return null;

        // ✅ FIX: Use inspection_status for SafetyChecklist
        const actualStatusField = doctype === 'SafetyChecklist' ? 'inspection_status' : statusField;

        if (actualStatusField && docData[actualStatusField]) {
            return {
                label: docData[actualStatusField],
                color:
                    docData[actualStatusField] === 'Approved' ? 'green' :
                        docData[actualStatusField] === 'Verified' ? 'emerald' :
                            docData[actualStatusField] === 'Reviewed' ? 'blue' :
                                docData[actualStatusField] === 'Checked' ? 'purple' :
                                    docData[actualStatusField] === 'Prepared' ? 'orange' : 'gray'
            };
        }

        if (docData.docstatus === 2) {
            return { label: 'Cancelled', color: 'red' };
        }
        if (docData.docstatus === 1) {
            return { label: 'Submitted', color: 'green' };
        }
        if (docData.docstatus === 0) {
            if (HIDE_DRAFT_BADGE_DOCTYPES.includes(doctype)) {
                return null;
            }
            if (!isSubmittable) {
                return { label: 'Saved', color: 'gray' };
            }
            return { label: 'Draft', color: 'blue' };
        }

        return null;
    };

    const currentStatus = getCurrentStatus();

    /**
     * Validation
     */
    const validateForm = (): { isValid: boolean; errors: Record<string, string>; firstErrorField?: any } => {
        const errors: Record<string, string> = {};
        let firstErrorField: any = null;

        processedFields.forEach((field: any) => {
            if (field.reqd === 1 && !field.read_only) {
                const value = localFormData[field.fieldname];
                const isEmpty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);

                if (isEmpty) {
                    errors[field.fieldname] = `${field.label} is required`;
                    if (!firstErrorField) {
                        firstErrorField = field;
                    }
                }
            }
        });

        return { isValid: Object.keys(errors).length === 0, errors, firstErrorField };
    };

    /**
     * Save Handler
     */
    const handleSubmit = async (values: any, e?: React.FormEvent) => {
        if (e && e.preventDefault) e.preventDefault();

        const validation = validateForm();
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            const errorCount = Object.keys(validation.errors).length;
            const fieldNames = Object.keys(validation.errors).map(key => {
                const field = processedFields.find((f: any) => f.fieldname === key);
                return field?.label || key;
            });

            toast.error(
                <div className="space-y-2">
                    <div className="font-semibold text-base">Please fill in all required fields</div>
                    <div className="text-sm text-gray-700">
                        {errorCount} field{errorCount > 1 ? 's' : ''} {errorCount > 1 ? 'are' : 'is'} required:
                        <ul className="mt-1 ml-4 list-disc space-y-0.5">
                            {fieldNames.slice(0, 5).map((name, idx) => (
                                <li key={idx}>{name}</li>
                            ))}
                            {errorCount > 5 && <li className="font-semibold">and {errorCount - 5} more...</li>}
                        </ul>
                    </div>
                </div>,
                {
                    duration: 6000,
                    position: "bottom-right",
                    className: "min-w-[400px]",
                    style: { minWidth: '400px', padding: '16px' }
                }
            );

            if (validation.firstErrorField && formRef.current?.switchToFieldTab) {
                formRef.current.switchToFieldTab(validation.firstErrorField.fieldname);
                setTimeout(() => {
                    const fieldElement = document.querySelector(`[data-fieldname="${validation.firstErrorField.fieldname}"]`);
                    if (fieldElement) {
                        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 300);
            }

            return;
        }

        setValidationErrors({});
        console.log(`💾 [${doctype}] Saving with values:`, values);

        try {
            let payload = { ...values };
            payload = cleanFormDataForSubmission(payload, processedFields);

            if (doctype === 'FullBodysafetyHarness' && payload.date) {
                payload.date1 = payload.date;
            }

            if (checklistConfig && payload[checklistConfig.childTable]) {
                const calculatedResult = calculateChecklistResult(payload[checklistConfig.childTable]);
                payload[checklistConfig.resultField] = calculatedResult;
                console.log(`✅ [${doctype}] Setting result to "${calculatedResult}" before save`);
            }

            if (isNew) {
                payload.docstatus = 0;
                const response = await createDoc(doctype, payload);

                if (response?.name) {
                    const statusMsg = HIDE_DRAFT_BADGE_DOCTYPES.includes(doctype) ? 'Created Successfully' : 'Created as Draft';
                    showSuccessToast(`${title || doctype} ${statusMsg}`);

                    // ✅ FIX: Get status from correct field
                    const actualStatusField = doctype === 'SafetyChecklist' ? 'inspection_status' : statusField;
                    const newStatus = response[actualStatusField] || null;
                    console.log(`✅ [${doctype}] New document created with status:`, newStatus);
                    setSavedStatus(newStatus);

                    const newName = response.name;
                    const newPath = location.pathname.replace(/\/new$/, `/${newName}`);
                    navigate(newPath, { replace: true, state: { readOnly: false } });
                }
            } else {
                const updatedDoc = await updateDoc(doctype, id, payload);

                if (updatedDoc) {
                    const oldStatus = savedStatus;

                    // ✅ FIX: Get status from correct field
                    const actualStatusField = doctype === 'SafetyChecklist' ? 'inspection_status' : statusField;
                    const newStatus = updatedDoc[actualStatusField] || null;

                    console.log(`✅ [${doctype}] Document updated. Old status: "${oldStatus}", New status: "${newStatus}"`);

                    setLocalFormData({ ...updatedDoc });
                    setSavedStatus(newStatus);

                    if (newStatus && newStatus !== oldStatus) {
                        showSuccessToast(
                            `Status updated to "${newStatus}"`,
                            "Status fields are now visible"
                        );
                    } else {
                        showSuccessToast("Changes saved successfully");
                    }
                }

                await refreshAll();
                setIsReadOnly(true);
            }
        } catch (error: any) {
            console.error(`❌ [${doctype}] Error saving document:`, error);
            const errorData = getFrappeErrorMessage(error);
            showErrorToast(errorData);

            if (error?.message?.includes('modified after you have opened it')) {
                if (window.confirm('This document has been modified by someone else. Would you like to reload and lose your changes?')) {
                    window.location.reload();
                }
            }
        }
    };

    /**
     * Submit Handler
     */
    const confirmSubmit = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!id || !localFormData) return;

        try {
            let docToSubmit = { ...localFormData, doctype, name: id };

            if (checklistConfig && docToSubmit[checklistConfig.childTable]) {
                const calculatedResult = calculateChecklistResult(docToSubmit[checklistConfig.childTable]);
                docToSubmit[checklistConfig.resultField] = calculatedResult;
                console.log(`✅ [${doctype}] Final result before submit: "${calculatedResult}"`);
            }

            const result = await submitDoc({ doc: docToSubmit });

            if (result) {
                setShowSubmitConfirm(false);
                setSubmitSuccess(true);
                await refreshAll();
                setIsReadOnly(true);
                showSuccessToast(`${title || doctype} Submitted Successfully`);
                setTimeout(() => setSubmitSuccess(false), 3000);
            }
        } catch (error: any) {
            const errorData = getFrappeErrorMessage(error);
            showErrorToast(errorData);
            await refreshAll();
        }
    };

    /**
     * Cancel Handler
     */
    const handleCancelDoc = async (e?: React.MouseEvent) => {
        if (e && e.preventDefault) e.preventDefault();
        setShowCancelConfirm(true);
    };

    const confirmCancelDoc = async () => {
        if (!id) return;

        try {
            await cancelDoc({ doctype, name: id });
            await refreshAll();
            setShowCancelConfirm(false);
            showSuccessToast(`${title || doctype} Cancelled`);
        } catch (error: any) {
            const errorData = getFrappeErrorMessage(error);
            showErrorToast(errorData);
            setShowCancelConfirm(false);
        }
    };

    /**
     * Amend Handler
     */
    const handleAmendDoc = async (e?: React.MouseEvent) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!docData) return;

        try {
            const amendmentData = { ...docData };
            const fieldsToDrop = ['name', 'creation', 'modified', 'modified_by', 'owner', 'docstatus', 'parent', 'parentfield', 'parenttype', 'idx', '_user_tags', '_comments', '_assign', '_liked_by', 'workflow_state'];
            fieldsToDrop.forEach(f => delete amendmentData[f]);
            amendmentData['amended_from'] = id;

            const response = await createDoc(doctype, amendmentData);

            if (response?.name) {
                showSuccessToast("Amendment created as Draft");
                const newName = response.name;
                const currentPath = location.pathname;
                const newPath = currentPath.substring(0, currentPath.lastIndexOf('/')) + `/${newName}`;
                navigate(newPath, { replace: true, state: { readOnly: false } });
            }
        } catch (error: any) {
            const errorData = getFrappeErrorMessage(error);
            showErrorToast(errorData);
        }
    };


    const isLoading = (metaLoading || contextLoading || (docLoading && !isNew) || (!isNew && !isDataReady)) && !loadingTimeout;
    const [showSlowLoadingMsg, setShowSlowLoadingMsg] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isLoading) {
            timer = setTimeout(() => setShowSlowLoadingMsg(true), 3000);
        } else {
            setShowSlowLoadingMsg(false);
        }
        return () => clearTimeout(timer);
    }, [isLoading]);

    // Enhanced loading state with timeout fallback
    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen gap-3 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading {isNew ? 'form' : 'document'}...</p>
                {showSlowLoadingMsg && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <p className="text-xs text-muted-foreground mt-2">
                            Taking longer than expected?
                        </p>
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs mt-1" onClick={() => window.location.reload()}>
                            Refresh Page
                        </Button>
                    </div>
                )}
            </div >
        );
    }

    // Error state
    if (metaError || docError) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Form</AlertTitle>
                    <AlertDescription>
                        {metaError?.message || docError?.message}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Don't render if no data yet
    if (!isNew && Object.keys(localFormData).length === 0 && !loadingTimeout) {
        return (
            <div className="flex flex-col justify-center items-center h-screen gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading document data...</p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            <div className="flex-1 overflow-y-auto">
                <StandardHeader
                    title={isNew ? `New ${title || doctype}` : `${title || doctype}: ${id}`}
                    subtitle={
                        isNew
                            ? `Create a new ${title?.toLowerCase() || doctype.toLowerCase()} record`
                            : `${title?.toLowerCase() || doctype.toLowerCase()} details`
                    }
                    showBack={true}
                    actions={
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-1 -mb-1 px-1">
                            {!isNew && (
                                <div className="hidden sm:block flex-shrink-0">
                                    <AssignmentBadge
                                        doctype={doctype}
                                        docname={id!}
                                        assignees={assignees}
                                        onUpdate={refreshAll}
                                    />
                                </div>
                            )}

                            {submitSuccess && (
                                <div className="flex items-center text-green-600 text-xs font-medium animate-in fade-in zoom-in duration-300 mr-2 flex-shrink-0">
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Success
                                </div>
                            )}

                            {!isNew && currentStatus && (
                                <div
                                    className={cn(
                                        "px-2.5 py-0.5 flex items-center rounded-full text-[10px] uppercase tracking-wider font-bold border shadow-sm flex-shrink-0",
                                        currentStatus.color === 'green' && "bg-green-100 text-green-700 border-green-200",
                                        currentStatus.color === 'emerald' && "bg-emerald-100 text-emerald-700 border-emerald-200",
                                        currentStatus.color === 'red' && "bg-red-100 text-red-700 border-red-200",
                                        currentStatus.color === 'blue' && "bg-blue-100 text-blue-700 border-blue-200",
                                        currentStatus.color === 'orange' && "bg-orange-100 text-orange-700 border-orange-200",
                                        currentStatus.color === 'purple' && "bg-purple-100 text-purple-700 border-purple-200",
                                        currentStatus.color === 'gray' && "bg-gray-100 text-gray-700 border-gray-200"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "w-1.5 h-1.5 rounded-full mr-1.5",
                                            currentStatus.color === 'green' && "bg-green-500",
                                            currentStatus.color === 'emerald' && "bg-emerald-500",
                                            currentStatus.color === 'red' && "bg-red-500",
                                            currentStatus.color === 'blue' && "bg-blue-500",
                                            currentStatus.color === 'orange' && "bg-orange-500",
                                            currentStatus.color === 'purple' && "bg-purple-500",
                                            currentStatus.color === 'gray' && "bg-gray-500"
                                        )}
                                    />
                                    {currentStatus.label}
                                </div>
                            )}

                            {!isNew && checklistConfig && localFormData[checklistConfig.resultField] && (
                                <div
                                    className={cn(
                                        "px-2.5 py-0.5 flex items-center rounded-full text-[10px] uppercase tracking-wider font-bold border shadow-sm flex-shrink-0",
                                        localFormData[checklistConfig.resultField] === 'Pass' && "bg-green-100 text-green-700 border-green-200",
                                        localFormData[checklistConfig.resultField] === 'Fail' && "bg-red-100 text-red-700 border-red-200"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "w-1.5 h-1.5 rounded-full mr-1.5",
                                            localFormData[checklistConfig.resultField] === 'Pass' && "bg-green-500",
                                            localFormData[checklistConfig.resultField] === 'Fail' && "bg-red-500"
                                        )}
                                    />
                                    {localFormData[checklistConfig.resultField]}
                                </div>
                            )}

                            {!isNew && (
                                <div className="flex-shrink-0">
                                    <PrintButton doctype={doctype} docname={id!} />
                                </div>
                            )}

                            {!isNew && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
                                    className="flex text-blue-700 border-blue-300 bg-white hover:bg-blue-50 flex-shrink-0"
                                >
                                    {isSidebarOpen ? "Hide" : "Show"}
                                </Button>
                            )}

                            {!isNew && (
                                <DocTypeActions
                                    doctype={doctype}
                                    docname={id!}
                                    docData={docData}
                                    onUpdate={refreshAll}
                                />
                            )}

                            {!isNew && (
                                <WorkflowActions
                                    doctype={doctype}
                                    docname={id!}
                                    onUpdate={refreshAll}
                                />
                            )}

                            {!isNew && (
                                <MakeMenu
                                    doctype={doctype}
                                    docname={id!}
                                    className="mr-1"
                                />
                            )}

                            {!isNew && (
                                <FormActionsMenu
                                    doctype={doctype}
                                    docname={id!}
                                    onRefresh={refreshAll}
                                    canDelete={actions.can_delete}
                                    canRename={!isSubmittable || docData?.docstatus === 0}
                                />
                            )}
                        </div>
                    }
                />

                <div className="p-6 mt-6 space-y-6">
                    {!isNew && (
                        <FormDashboard
                            doctype={doctype}
                            name={id!}
                            doc={localFormData}
                            className="rounded-xl border border-slate-200 shadow-sm"
                        />
                    )}

                    {!isNew && docData?.[doctype === 'SafetyChecklist' ? 'inspection_status' : statusField] && (
                        <div className="px-6 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                                <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                                    Verification Status: {docData[doctype === 'SafetyChecklist' ? 'inspection_status' : statusField]}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="border border-border/60 rounded-xl shadow-sm overflow-hidden bg-white">
                        <div className="p-6">
                            <TabbedDynamicForm
                                ref={formRef}
                                key={isNew ? 'new' : `${doctype}-${id}`}
                                doctype={doctype}
                                docname={!isNew ? id : undefined}
                                fields={processedFields}
                                initialData={localFormData}
                                onSubmit={handleSubmit}
                                onFieldChange={(f, v) => {
                                    console.log(`📝 [${doctype}] Field changed:`, f.fieldname, v);
                                    setLocalFormData((prev: any) => ({ ...prev, [f.fieldname]: v }));

                                    if (validationErrors[f.fieldname]) {
                                        setValidationErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors[f.fieldname];
                                            return newErrors;
                                        });
                                    }
                                }}
                                onSubmitDoc={
                                    actions.can_submit
                                        ? async () => {
                                            setShowSubmitConfirm(true);
                                        }
                                        : undefined
                                }
                                onCancelDoc={actions.can_cancel ? handleCancelDoc : undefined}
                                onAmendDoc={actions.can_amend ? handleAmendDoc : undefined}
                                onCancel={() => navigate(-1)}
                                loading={createLoading || updateLoading || submitLoading || cancelLoading}
                                readOnly={isReadOnly}
                                isSubmittable={isSubmittable}
                                validationErrors={validationErrors}
                            />
                        </div>
                    </div>

                    {!isNew && id && (
                        <div className="mt-8">
                            <GenericComments doctype={doctype} docname={id} />
                        </div>
                    )}
                </div>
            </div>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {!isNew && id && (
                <div
                    className={cn(
                        "fixed inset-y-0 right-0 z-50 w-[320px] bg-white dark:bg-zinc-950 border-l shadow-2xl transition-all duration-300",
                        "md:relative md:z-0 md:shadow-none md:border-l md:border-border/50",
                        isSidebarOpen
                            ? "translate-x-0 md:w-[320px] md:opacity-100"
                            : "translate-x-full md:w-0 md:opacity-0 md:translate-x-0"
                    )}
                >
                    <div className="w-[320px] h-full">
                        <FormSidebar
                            doctype={doctype}
                            docname={id}
                            onClose={() => setIsSidebarOpen(false)}
                        />
                    </div>
                </div>
            )}

            <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <AlertCircle className="h-5 w-5" />
                            <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription>
                            Are you sure you want to submit this {title || doctype}? Once submitted, you cannot edit it directly.
                            {checklistConfig && localFormData[checklistConfig.resultField] && (
                                <div className="mt-3 p-3 bg-slate-50 rounded-md border border-slate-200">
                                    <p className="text-sm font-semibold text-slate-700">
                                        Current Result:{' '}
                                        <span
                                            className={cn(
                                                "font-bold",
                                                localFormData[checklistConfig.resultField] === 'Pass' ? "text-green-600" : "text-red-600"
                                            )}
                                        >
                                            {localFormData[checklistConfig.resultField]}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="h-9 text-xs">Review Again</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmSubmit}
                            className="h-9 text-xs bg-blue-600 hover:bg-blue-700"
                            disabled={submitLoading}
                        >
                            {submitLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                            Confirm & Submit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2 text-red-600 mb-2">
                            <AlertCircle className="h-5 w-5" />
                            <AlertDialogTitle>Confirm Cancellation</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this {title || doctype}? This action will mark the document as cancelled.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="h-9 text-xs">Go Back</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmCancelDoc}
                            className="h-9 text-xs bg-red-600 hover:bg-red-700"
                            disabled={cancelLoading}
                        >
                            {cancelLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                            Yes, Cancel Document
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default GenericSafetyAndQualityForm;