import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useFrappeGetCall, useFrappeGetDoc, useFrappeCreateDoc, useFrappeUpdateDoc, useFrappePostCall } from 'frappe-react-sdk';
import { TabbedDynamicForm } from "@/components/form/TabbedDynamicForm";
import { Loader2, Eye, Edit2, Camera, AlertCircle, CheckCircle2, StopCircle, PlayCircle, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PrintButton } from "@/components/print/PrintButton";
import GenericComments from "@/components/common/GenericComments";
import { FormSidebar } from "@/components/form/sidebar/FormSidebar";
import { StandardHeader } from "@/components/common/StandardHeader";
import IntegratedSingleGantt from "@/pages/modules/Planning/IntegratedSingleGantt";
import { FormDashboard } from "@/components/form/FormDashboard";
import { ItemStockDashboard } from "@/components/dashboard/ItemStockDashboard";
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

interface GenericFormProps {
    doctype: string;
    title?: string;
    statusField?: string;
    initialDefaults?: Record<string, any>;
    fieldOverrides?: Record<string, any>;
}

/**
 * Helper to extract human-readable error messages from Frappe/ERPNext
 */
const getFrappeErrorMessage = (error: any): string => {
    if (error._server_messages) {
        try {
            const messages = JSON.parse(error._server_messages);
            const detail = JSON.parse(messages[0]);
            return detail.message || "An unexpected validation error occurred";
        } catch (e) {
            console.error("Error parsing server messages", e);
        }
    }
    return error.message || error.exception || "Server error. Please check your data.";
};

// Doctypes that should not show draft badge (non-submittable forms)
const HIDE_DRAFT_BADGE_DOCTYPES = [
    'Goal',
    'Appraisal Template',
    'KRA',
    'Employee Feedback Criteria',
    'Department',
    'Branch',
    'RCCB Tracker',
    'Lifting Tools and Tackles'
];

const GenericForm: React.FC<GenericFormProps> = ({
    doctype,
    title,
    statusField,
    initialDefaults,
    fieldOverrides
}) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isNew = !id || id === 'new';

    // Reference to the TabbedDynamicForm to call validation methods
    const formRef = React.useRef<any>(null);

    // UI State
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [isSubmittable, setIsSubmittable] = useState(false);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => doctype === 'Task');
    const [isDataReady, setIsDataReady] = useState(false);
    const [loadingTimeout, setLoadingTimeout] = useState(false);
    const [loadingError, setLoadingError] = useState(false);

    // Track local form data
    const [localFormData, setLocalFormData] = useState<any>({});

    // NEW: Validation errors state
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const ganttItemsRef = React.useRef<any[]>([]);

    // Fetch Form Context (permissions and actions)
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

    // API Mutation Hooks
    const { createDoc, loading: createLoading } = useFrappeCreateDoc();
    const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();
    const { call: submitDoc, loading: submitLoading } = useFrappePostCall('frappe.client.submit');
    const { call: cancelDoc, loading: cancelLoading } = useFrappePostCall('frappe.client.cancel');

    // Custom action hook for Material Request status update
    const { call: updateMaterialRequestStatus, loading: statusUpdateLoading } = useFrappePostCall(
        'erpnext.stock.doctype.material_request.material_request.update_status'
    );

    // Parse assignees
    const assignees = React.useMemo(() => {
        if (!docData?._assign) return [];
        try {
            return JSON.parse(docData._assign);
        } catch (e) {
            return [];
        }
    }, [docData?._assign]);

    // Add timeout for loading state to prevent infinite loading
    useEffect(() => {
        // If anything is loading for too long
        if (docLoading || metaLoading || contextLoading) {
            const timeoutDuration = 15000; // 15 seconds
            const timeout = setTimeout(() => {
                // If we are still loading after timeout
                if (docLoading || metaLoading || contextLoading) {
                    console.error('⚠️ Loading timeout - Network or Server Issue detected');
                    console.error('Status:', { docLoading, metaLoading, contextLoading, isDataReady });

                    // If we have NO data at all, show error
                    if (!isDataReady && !docData && !metaData) {
                        setLoadingError(true);
                    } else {
                        // We have some data, force proceed? No, safer to show error or just let it spin with a warning?
                        // Let's force timeout warning
                        setLoadingTimeout(true);
                    }
                }
            }, 10000); // 10 second timeout

            return () => clearTimeout(timeout);
        } else {
            // Nothing is loading
            setLoadingError(false);
            setLoadingTimeout(false);
        }
    }, [docLoading, metaLoading, contextLoading, isDataReady, docData, metaData]);

    // Update local form data when doc loads
    useEffect(() => {
        if (!isNew && docData) {
            console.log('✅ Setting localFormData from docData:', docData);
            setLocalFormData({ ...docData });
            setIsDataReady(true);
            setLoadingTimeout(false);
        } else if (isNew) {
            const defaults = {
                ...(initialDefaults || {}),
                ...(location.state?.defaults || {})
            };
            console.log('✅ New form - initializing with defaults:', defaults);
            setLocalFormData(defaults);
            setIsDataReady(true);
        }
    }, [docData, isNew, initialDefaults, location.state, title]);

    // Custom hook for fetching baseline
    const { call: getBaseline } = useFrappePostCall('frappe.client.get');

    // Auto-populate Items for Operational Schedule when Client Baseline is selected
    useEffect(() => {
        if (doctype === 'KB Operational Schedule' && localFormData?.related_baseline) {
            const fetchBaselineItems = async () => {
                try {
                    const baselineId = localFormData.related_baseline;
                    console.log('🔄 Auto-populate triggered for baseline:', baselineId);

                    if (localFormData.items && Array.isArray(localFormData.items) && localFormData.items.length > 0) {
                        console.log('⏭️ Skipping auto-populate: localFormData items exist', localFormData.items.length);
                        // Ensure ref is synced
                        ganttItemsRef.current = localFormData.items;
                        return;
                    }

                    console.log('✅ Fetching Client Baseline items for:', baselineId);
                    const response = await (window as any).frappe?.call({
                        method: 'frappe.client.get',
                        args: {
                            doctype: 'KB Client Baseline',
                            name: baselineId
                        }
                    });

                    if (response) {
                        const baseline = response.message || response;

                        if (!baseline || !baseline.items) {
                            console.warn("⚠️ No items found in baseline response", baseline);
                            return;
                        }

                        const baselineItems = baseline.items || [];
                        console.log('📦 Populating Schedule with', baselineItems.length, 'items:', baselineItems);

                        const newItems = baselineItems.map((item: any, index: number) => ({
                            name: `new-item-${Date.now()}-${index}`,
                            task: item.task,
                            task_name: item.task_name,
                            duration: item.duration,
                            baseline_start_date: item.start_date,
                            baseline_end_date: item.end_date,
                            start_date: item.start_date,
                            end_date: item.end_date,
                            dependencies_json: item.dependencies_json,
                            lag_days: item.lag_days || 0
                        }));

                        console.log('🎯 Transformed items:', newItems);

                        setLocalFormData((prev: any) => {
                            const updated = { ...prev, items: newItems };
                            console.log('💾 Updated localFormData:', updated);
                            return updated;
                        });

                        ganttItemsRef.current = newItems;
                        toast.success(`Populated ${newItems.length} activities from Client Baseline`, {
                            position: "top-right"
                        });
                    }
                } catch (error) {
                    console.error("❌ Failed to fetch baseline items", error);
                    toast.error("Failed to load baseline items", {
                        position: "top-right"
                    });
                }
            };

            fetchBaselineItems();
        }
    }, [localFormData?.related_baseline, doctype]);

    // Reset data ready flag when navigating to a different document
    useEffect(() => {
        // If we are navigating between different "new" forms (e.g., different titles), we must reset
        setIsDataReady(false);
        setLocalFormData({});
        setLoadingTimeout(false);
        setValidationErrors({}); // Clear validation errors on navigation
    }, [id]);

    // Update read-only state and submittable flag based on context
    useEffect(() => {
        if (contextData?.message) {
            setIsReadOnly(contextData.message.is_form_read_only);
            setIsSubmittable(contextData.message.is_submittable);
        }
    }, [contextData]);

    // Fallback: Check if doctype is submittable from metadata
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

    // Handle switching to edit mode
    const handleEnableEdit = () => {
        setIsReadOnly(false);
        navigate(location.pathname, { replace: true, state: { ...location.state, readOnly: false } });
    };

    // Helper function to convert ISO datetime to MySQL format
    const convertDateTimeFields = (data: any) => {
        const datetimeDoctypes: Record<string, string[]> = {
            'Asset Movement': ['transaction_date', 'schedule_date'],
            'Asset Repair': ['failure_date', 'repair_date', 'completion_date']
        };

        if (!datetimeDoctypes[doctype]) return data;

        const converted = { ...data };
        const fields = datetimeDoctypes[doctype];

        fields.forEach(field => {
            if (converted[field] && typeof converted[field] === 'string') {
                try {
                    const isoDate = new Date(converted[field]);
                    if (!isNaN(isoDate.getTime())) {
                        const year = isoDate.getFullYear();
                        const month = String(isoDate.getMonth() + 1).padStart(2, '0');
                        const day = String(isoDate.getDate()).padStart(2, '0');
                        const hours = String(isoDate.getHours()).padStart(2, '0');
                        const minutes = String(isoDate.getMinutes()).padStart(2, '0');
                        const seconds = String(isoDate.getSeconds()).padStart(2, '0');
                        converted[field] = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                    }
                } catch (e) {
                    console.warn(`Failed to convert datetime field ${field}:`, e);
                }
            }
        });

        return converted;
    };

    // Process fields for display with permission-based logic
    const processedFields = React.useMemo(() => {
        if (!metaData?.message) return [];

        let fields = [...metaData.message];

        // Get permission data from context
        const userRoles = contextData?.message?.user_roles || [];
        const permlevelPermissions = contextData?.message?.permlevel_permissions || {};

        // Helper to evaluate depends_on
        const evaluateDependsOn = (expression: string, doc: any): boolean => {
            if (!expression) return true;

            try {
                if (expression.startsWith('eval:')) {
                    const code = expression.substring(5);

                    // Helper functions matching Frappe server-side utils
                    const cint = (v: any) => {
                        if (v === true) return 1;
                        if (v === false) return 0;
                        const parsed = parseInt(v);
                        return isNaN(parsed) ? 0 : parsed;
                    };
                    const flt = (v: any) => parseFloat(v) || 0.0;
                    const cstr = (v: any) => String(v || '');
                    const nowdate = () => new Date().toISOString().split('T')[0];

                    // Pass helpers as arguments to the evaluated function
                    const fn = new Function('doc', 'cint', 'flt', 'cstr', 'nowdate', `return ${code}`);
                    return !!fn(doc, cint, flt, cstr, nowdate);
                }

                // Handle simple fieldname dependency
                const value = doc[expression];

                // Handle Frappe's falsy values explicitly (0, "0", false, null, undefined, empty string)
                if (value === 0 || value === '0' || value === false || value === null || value === undefined || value === '') {
                    return false;
                }

                return true;
            } catch (e) {
                console.warn('Failed to evaluate depends_on:', expression, e);
                return true; // Default to showing if error
            }
        };

        // Apply Overrides
        if (fieldOverrides) {
            fields = fields.map((field: any) => {
                const override = fieldOverrides?.[field.fieldname];
                if (override) {
                    if (field.fieldtype === 'Table' && override.child_overrides && field.table_fields) {
                        const childOverrides = override.child_overrides;
                        const newTableFields = field.table_fields.map((tf: any) => {
                            if (childOverrides[tf.fieldname]) {
                                return { ...tf, ...childOverrides[tf.fieldname] };
                            }
                            return tf;
                        });
                        return { ...field, ...override, table_fields: newTableFields };
                    }
                    return { ...field, ...override };
                }
                return field;
            });
        }

        // Apply permission-based field modifications AND depends_on logic
        fields = fields.map((field: any) => {
            const fieldPermlevel = field.permlevel || 0;
            const permissions = permlevelPermissions[fieldPermlevel];

            let newField = { ...field };

            // 1. Evaluate depends_on for visibility
            if (field.depends_on) {
                const isVisible = evaluateDependsOn(field.depends_on, localFormData);
                if (!isVisible) {
                    newField.hidden = 1;
                } else {
                    // If it depends_on something and that returns true, we explicitly unhide it
                    // unless it was originally hidden by some other permanent means?
                    // Usually in Frappe, depends_on controls visibility fully if present.
                    newField.hidden = 0;
                }
            }

            // [NEW] 1.5 Evaluate mandatory_depends_on
            if (field.mandatory_depends_on) {
                const isMandatory = evaluateDependsOn(field.mandatory_depends_on, localFormData);
                newField.reqd = isMandatory ? 1 : 0;
            }

            // 2. Apply Permissions
            // If we have permission data for this permlevel
            if (permissions !== undefined) {
                // If user doesn't have READ permission, hide the field completely
                if (!permissions.read) {
                    newField.hidden = 1;
                }

                // If user doesn't have WRITE permission, make field read-only
                if (!permissions.write && !newField.read_only) {
                    newField.read_only = 1;
                }
            }

            return newField;
        });

        let baseFields = fields.filter((f: any) => !f.hidden || (f.hidden && f.reqd));

        // Filter out fields that are both required AND read-only for new records
        if (isNew) {
            baseFields = baseFields.filter((field: any) => !(field.reqd === 1 && field.read_only === 1));
        }

        if (doctype === 'KB Operational Schedule' || doctype === 'KB Client Baseline') {
            return baseFields.filter((f: any) => f.fieldname !== 'items' && f.label !== 'Activities');
        }

        return baseFields;
    }, [metaData, doctype, isNew, fieldOverrides, contextData, localFormData]);

    /**
     * CLIENT-SIDE VALIDATION
     * Validates all required fields before submission
     * Respects permission levels - only validates fields user has write access to
     */
    const validateForm = (): { isValid: boolean; errors: Record<string, string>; firstErrorField?: any } => {
        const errors: Record<string, string> = {};
        let firstErrorField: any = null;

        // Get permission data
        const permlevelPermissions = contextData?.message?.permlevel_permissions || {};

        processedFields.forEach((field: any) => {
            // Get permission for this field's permlevel
            const fieldPermlevel = field.permlevel || 0;
            const permissions = permlevelPermissions[fieldPermlevel];

            // Check if field is required AND not read-only AND not hidden AND user has write permission
            if (field.reqd === 1 && !field.read_only && !field.hidden && permissions?.write !== false) {
                const value = localFormData[field.fieldname];

                // Check for empty values
                const isEmpty = value === undefined || value === null || value === '' ||
                    (Array.isArray(value) && value.length === 0);

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
     * SAVE HANDLER
     */
    const handleSubmit = async (values: any, e?: React.FormEvent) => {
        if (e && e.preventDefault) e.preventDefault();

        // Client-side validation
        const validation = validateForm();
        if (!validation.isValid) {
            setValidationErrors(validation.errors);

            // Get error count
            const errorCount = Object.keys(validation.errors).length;
            const fieldNames = Object.keys(validation.errors).map(key => {
                const field = processedFields.find((f: any) => f.fieldname === key);
                return field?.label || key;
            });

            // Show toast with errors
            toast.error(`Please fill in all required fields`, {
                description: `${errorCount} field${errorCount > 1 ? 's' : ''} ${errorCount > 1 ? 'are' : 'is'} required: ${fieldNames.slice(0, 3).join(', ')}${errorCount > 3 ? ` and ${errorCount - 3} more` : ''}`,
                duration: 5000,
                position: "top-right", // ✅ CHANGED
            });

            // Try to switch to the tab containing the first error and scroll to it
            if (validation.firstErrorField && formRef.current?.switchToFieldTab) {
                formRef.current.switchToFieldTab(validation.firstErrorField.fieldname);

                // Scroll to the field after a small delay to ensure tab switch completes
                setTimeout(() => {
                    const fieldElement = document.querySelector(`[data-fieldname="${validation.firstErrorField.fieldname}"]`);
                    if (fieldElement) {
                        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 300);
            }

            return;
        }

        // Clear validation errors if validation passed
        setValidationErrors({});

        console.log('💾 Saving with values:', values);

        try {
            if (isNew) {
                let payload = { ...values, docstatus: 0 };
                payload = convertDateTimeFields(payload);

                // Handle Gantt items logic (existing code)
                if (ganttItemsRef.current.length > 0 && (doctype === 'KB Client Baseline' || doctype === 'KB Operational Schedule')) {
                    // ...existing gantt logic...
                }

                const response = await createDoc(doctype, payload);

                if (response?.name) {
                    toast.success(
                        HIDE_DRAFT_BADGE_DOCTYPES.includes(doctype)
                            ? `${title || doctype} created successfully`
                            : `${title || doctype} created as Draft`,
                        { position: "top-right" } // ✅ CHANGED
                    );

                    const newName = response.name;
                    const newPath = location.pathname.replace(/\/new$/, `/${newName}`);
                    navigate(newPath, { replace: true, state: { readOnly: false } });
                }
            } else {
                const { modified, ...cleanValues } = values;
                const convertedValues = convertDateTimeFields(cleanValues);
                const updatedDoc = await updateDoc(doctype, id, convertedValues);

                if (updatedDoc) {
                    setLocalFormData({ ...updatedDoc });
                }

                await refreshAll();
                setIsReadOnly(true);

                toast.success("Changes saved successfully", {
                    position: "top-right" // ✅ CHANGED
                });
            }
        } catch (error: any) {
            console.error("Error saving document:", error);
            const msg = getFrappeErrorMessage(error);
            toast.error("Save Failed", {
                description: msg,
                position: "top-right" // ✅ CHANGED
            });

            if (error?.message?.includes('modified after you have opened it')) {
                if (window.confirm('This document has been modified by someone else. Would you like to reload and lose your changes?')) {
                    window.location.reload();
                }
            }
        }
    };

    /**
     * SUBMIT HANDLER
     */
    const confirmSubmit = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!id || !localFormData) return;

        try {
            // FIX: Ensure activity_name is present in items for submission payload (GenericForm submit doesn't run handleSubmit logic)
            let submitPayload = { ...localFormData, doctype, name: id };

            // Planning Modules: Sync from Ref and Check for Unsaved Changes
            if ((doctype === 'KB Operational Schedule' || doctype === 'KB Client Baseline') && ganttItemsRef.current.length > 0) {
                const hasUnsavedItems = ganttItemsRef.current.some(i => i.name && typeof i.name === 'string' && i.name.startsWith('new-'));
                if (hasUnsavedItems) {
                    toast.warning("Unsaved Changes Detected", {
                        description: "Please Save the changes to the Activities/Gantt before Submitting.",
                        position: "top-right" // ✅ CHANGED
                    });
                    return;
                }

                // Use the ref items (which should be current)
                submitPayload.items = ganttItemsRef.current;
            }

            if (submitPayload.items && Array.isArray(submitPayload.items)) {
                submitPayload.items = submitPayload.items.map((item: any) => ({
                    ...item,
                    activity_name: item.activity_name || item.task_name || item.task || "Activity"
                }));
            }

            const result = await submitDoc({ doc: submitPayload });

            if (result) {
                setShowSubmitConfirm(false);
                setSubmitSuccess(true);

                await refreshContext();
                await refreshDoc();

                if (contextData?.message) {
                    setIsReadOnly(contextData.message.is_form_read_only);
                }

                setIsReadOnly(true);

                toast.success(`${title || doctype} Submitted Successfully`, {
                    position: "top-right" // ✅ CHANGED
                });

                setTimeout(() => setSubmitSuccess(false), 3000);
            }
        } catch (error: any) {
            console.error("❌ Submission Error Details:", error);
            if (error._server_messages) {
                console.error("Server Messages:", error._server_messages);
            }
            const msg = getFrappeErrorMessage(error);
            toast.error("Submission Failed", {
                description: msg,
                position: "top-right" // ✅ CHANGED
            });

            await refreshAll();
        }
    };

    /**
     * CANCEL HANDLER
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

            toast.success(`${title || doctype} Cancelled`, {
                position: "top-right" // ✅ CHANGED
            });
        } catch (error: any) {
            toast.error("Cancel Failed", {
                description: getFrappeErrorMessage(error),
                position: "top-right" // ✅ CHANGED
            });
            setShowCancelConfirm(false);
        }
    };

    /**
     * AMEND HANDLER
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
                toast.success("Amendment created as Draft", {
                    position: "top-right" // ✅ CHANGED
                });

                const newName = response.name;
                const currentPath = location.pathname;
                const newPath = currentPath.substring(0, currentPath.lastIndexOf('/')) + `/${newName}`;
                navigate(newPath, { replace: true, state: { readOnly: false } });
            }
        } catch (error: any) {
            toast.error("Amend Failed", {
                description: getFrappeErrorMessage(error),
                position: "top-right" // ✅ CHANGED
            });
        }
    };

    /**
     * MATERIAL REQUEST - STOP HANDLER
     */
    const handleStopMaterialRequest = async () => {
        if (!id) return;
        if (!window.confirm(`Are you sure you want to stop this ${title || doctype}?`)) return;

        try {
            await updateMaterialRequestStatus({ name: id, status: 'Stopped' });
            toast.success(`${title || doctype} has been stopped`, {
                position: "top-right" // ✅ CHANGED
            });
            await refreshAll();
        } catch (error: any) {
            const msg = getFrappeErrorMessage(error);
            toast.error("Stop Failed", {
                description: msg,
                position: "top-right" // ✅ CHANGED
            });
        }
    };

    /**
     * MATERIAL REQUEST - RE-OPEN HANDLER
     */
    const handleReopenMaterialRequest = async () => {
        if (!id) return;
        if (!window.confirm(`Are you sure you want to re-open this ${title || doctype}?`)) return;

        try {
            await updateMaterialRequestStatus({ name: id, status: 'Pending' });
            toast.success(`${title || doctype} has been re-opened`, {
                position: "top-right" // ✅ CHANGED
            });
            await refreshAll();
        } catch (error: any) {
            const msg = getFrappeErrorMessage(error);
            toast.error("Re-open Failed", {
                description: msg,
                position: "top-right" // ✅ CHANGED
            });
        }
    };

    // Get actions from context
    // FIX: Force enable actions for Planning modules to ensure standard lifecycle UI
    const actions = React.useMemo(() => {
        const baseActions = contextData?.message?.actions || {};

        if (doctype === 'KB Operational Schedule' || doctype === 'KB Client Baseline' || doctype === 'Stock Entry' || doctype === 'Material Request') {
            return {
                ...baseActions,
                can_save: true,
                can_submit: docData?.docstatus === 0,
                can_cancel: docData?.docstatus === 1,
                can_amend: docData?.docstatus === 2,
                can_delete: docData?.docstatus === 0
            };
        }

        return baseActions;
    }, [contextData, doctype, docData?.docstatus]);

    // Force isSubmittable for these modules
    useEffect(() => {
        if (doctype === 'KB Operational Schedule' || doctype === 'KB Client Baseline' || doctype === 'Stock Entry' || doctype === 'Material Request') {
            setIsSubmittable(true);
        }
    }, [doctype]);

    // Check if Material Request is stopped
    const isMaterialRequestStopped = doctype === 'Material Request' && docData?.status === 'Stopped' && docData?.docstatus === 1;

    // Check if Material Request can be stopped
    const canStopMaterialRequest = doctype === 'Material Request' &&
        docData?.docstatus === 1 &&
        docData?.status !== 'Stopped' &&
        docData?.status !== 'Cancelled';

    // Get current document status dynamically
    const getCurrentStatus = () => {
        if (!docData) return null;

        // Priority 1: Custom status field
        if (statusField && docData[statusField]) {
            return {
                label: docData[statusField],
                color: docData[statusField] === 'Stopped' ? 'orange' :
                    docData[statusField] === 'Cancelled' ? 'red' :
                        docData[statusField] === 'Completed' ? 'green' : 'purple'
            };
        }

        // Priority 2: docstatus-based status
        if (docData.docstatus === 2) {
            return { label: 'Cancelled', color: 'red' };
        }
        if (docData.docstatus === 1) {
            return { label: 'Submitted', color: 'green' };
        }
        if (docData.docstatus === 0) {
            return { label: 'Draft', color: 'blue' };
        }

        return null;
    };

    const currentStatus = getCurrentStatus();

    // Enhanced loading state with timeout fallback
    if (
        metaLoading ||
        contextLoading ||
        (docLoading && !isNew && !loadingTimeout) ||
        (!isNew && !isDataReady && !loadingTimeout)
    ) {
        return (
            <div className="flex flex-col justify-center items-center h-screen gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                    {metaLoading ? 'Loading configuration...' :
                        contextLoading ? 'Checking permissions...' :
                            docLoading ? 'Fetching document...' : 'Initializing...'}
                </p>
            </div>
        );
    }

    // Error state
    if (metaError || docError) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertDescription>
                        Error loading form: {metaError?.message || docError?.message}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Don't render form if we're editing and don't have data yet (with timeout override)
    // FIX: Only show loading if we are ACTUALLY loading. If not loading and no data, show error/empty.
    if (!isNew && Object.keys(localFormData).length === 0 && !loadingTimeout && isLoading) {
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
                            : isReadOnly
                                ? `Viewing ${title?.toLowerCase() || doctype.toLowerCase()} details`
                                : `Update existing ${title?.toLowerCase() || doctype.toLowerCase()} details`
                    }
                    showBack={true}
                    actions={
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-1 -mb-1 px-1">
                            {/* Assignments */}
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

                            {/* Success Indicator */}
                            {submitSuccess && (
                                <div className="flex items-center text-green-600 text-xs font-medium animate-in fade-in zoom-in duration-300 mr-2 flex-shrink-0">
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Success
                                </div>
                            )}

                            {/* Edit Button */}
                            {!isNew && isReadOnly && actions.can_save && docData?.docstatus === 0 && (
                                <Button
                                    onClick={handleEnableEdit}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300 h-9 text-xs font-semibold flex-shrink-0"
                                >
                                    <Edit2 className="h-3.5 w-3.5 sm:mr-2" />
                                    <span className="hidden sm:inline">Edit Document</span>
                                </Button>
                            )}

                            {/* Read-Only Indicator */}
                            {!isNew && isReadOnly && docData?.docstatus === 0 && !HIDE_DRAFT_BADGE_DOCTYPES.includes(doctype) && (
                                <div className="hidden md:flex px-3 py-1.5 bg-primary/10 text-primary rounded-md text-xs font-medium border border-primary/20 items-center gap-1.5 flex-shrink-0">
                                    <Eye className="h-3.5 w-3.5" />
                                    Read-Only Mode
                                </div>
                            )}

                            {/* Material Request - Stop Button */}
                            {canStopMaterialRequest && (
                                <Button
                                    onClick={handleStopMaterialRequest}
                                    disabled={statusUpdateLoading}
                                    className="bg-orange-600 text-white hover:bg-orange-700 shadow-sm hover:shadow-md transition-all duration-300 h-9 text-xs font-semibold flex-shrink-0"
                                >
                                    {statusUpdateLoading ? (
                                        <Loader2 className="h-3.5 w-3.5 sm:mr-2 animate-spin" />
                                    ) : (
                                        <StopCircle className="h-3.5 w-3.5 sm:mr-2" />
                                    )}
                                    <span className="hidden sm:inline">Stop</span>
                                </Button>
                            )}

                            {/* Material Request - Re-open Button */}
                            {isMaterialRequestStopped && (
                                <Button
                                    onClick={handleReopenMaterialRequest}
                                    disabled={statusUpdateLoading}
                                    className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md transition-all duration-300 h-9 text-xs font-semibold flex-shrink-0"
                                >
                                    {statusUpdateLoading ? (
                                        <Loader2 className="h-3.5 w-3.5 sm:mr-2 animate-spin" />
                                    ) : (
                                        <PlayCircle className="h-3.5 w-3.5 sm:mr-2" />
                                    )}
                                    <span className="hidden sm:inline">Re-open</span>
                                </Button>
                            )}

                            {/* Dynamic Status Badge */}
                            {!isNew && currentStatus && (
                                <div
                                    className={cn(
                                        "px-2.5 py-0.5 flex items-center rounded-full text-[10px] uppercase tracking-wider font-bold border shadow-sm flex-shrink-0",
                                        currentStatus.color === 'green' && "bg-green-100 text-green-700 border-green-200",
                                        currentStatus.color === 'red' && "bg-red-100 text-red-700 border-red-200",
                                        currentStatus.color === 'blue' && "bg-primary/10 text-primary border-primary/20",
                                        currentStatus.color === 'orange' && "bg-orange-100 text-orange-700 border-orange-200",
                                        currentStatus.color === 'purple' && "bg-purple-100 text-purple-700 border-purple-200"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "w-1.5 h-1.5 rounded-full mr-1.5",
                                            currentStatus.color === 'green' && "bg-green-500",
                                            currentStatus.color === 'red' && "bg-red-500",
                                            currentStatus.color === 'blue' && "bg-primary",
                                            currentStatus.color === 'orange' && "bg-orange-500",
                                            currentStatus.color === 'purple' && "bg-purple-500"
                                        )}
                                    />
                                    {currentStatus.label}
                                </div>
                            )}

                            {/* Print Button */}
                            {!isNew && (
                                <div className="flex-shrink-0">
                                    <PrintButton doctype={doctype} docname={id!} />
                                </div>
                            )}

                            {/* Sidebar Toggle */}
                            {!isNew && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
                                    className="flex text-primary border-primary/20 bg-white hover:bg-primary/5 flex-shrink-0"
                                >
                                    {isSidebarOpen ? "Hide" : "Show"}
                                </Button>
                            )}

                            {/* Face Enrollment Button */}
                            {!isNew && (doctype === 'Employee' || doctype === 'Labour Onboarding') && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/face-enrollment?id=${id}&type=${doctype === 'Labour Onboarding' ? 'Labour' : 'Employee'}`)}
                                    title="Enroll Face"
                                    className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 h-9"
                                >
                                    <Camera className="w-3.5 h-3.5 sm:mr-2" />
                                    <span className="hidden sm:inline">Enroll Face</span>
                                </Button>
                            )}

                            {/* Custom DocType Actions */}
                            {!isNew && (
                                <DocTypeActions
                                    doctype={doctype}
                                    docname={id!}
                                    docData={docData}
                                    onUpdate={refreshAll}
                                />
                            )}

                            {/* Workflow Actions */}
                            {!isNew && (
                                <WorkflowActions
                                    doctype={doctype}
                                    docname={id!}
                                    onUpdate={refreshAll}
                                />
                            )}

                            {/* Make Menu */}
                            {!isNew && (
                                <MakeMenu
                                    doctype={doctype}
                                    docname={id!}
                                    className="mr-1"
                                />
                            )}

                            {/* Form Actions Menu */}
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
                                    console.log('📝 Field changed:', f.fieldname, v);
                                    setLocalFormData((prev: any) => ({ ...prev, [f.fieldname]: v }));

                                    // Clear validation error for this field when it's changed
                                    if (validationErrors[f.fieldname]) {
                                        setValidationErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors[f.fieldname];
                                            return newErrors;
                                        });
                                    }
                                }}
                                onSubmitDoc={actions.can_submit ? async () => {
                                    setShowSubmitConfirm(true);
                                } : undefined}
                                onCancelDoc={actions.can_cancel ? handleCancelDoc : undefined}
                                onAmendDoc={actions.can_amend ? handleAmendDoc : undefined}
                                onCancel={() => navigate(-1)}
                                loading={createLoading || updateLoading || submitLoading || cancelLoading}
                                readOnly={isReadOnly}
                                isSubmittable={isSubmittable}
                                validationErrors={validationErrors}
                                customTabs={[
                                    // Connections Dashboard Tab
                                    ...(!isNew && doctype !== 'Task' ? [{
                                        label: 'Connections',
                                        content: (
                                            <FormDashboard
                                                doctype={doctype}
                                                name={id!}
                                                doc={localFormData}
                                                className="border-none p-0"
                                            />
                                        )
                                    }] : []),

                                    // Operational Schedule/Baseline Gantt Tab
                                    ...(doctype === 'KB Operational Schedule' || doctype === 'KB Client Baseline' ? [{
                                        label: 'Activities',
                                        content: (
                                            <div className="h-[600px]">
                                                <IntegratedSingleGantt
                                                    scheduleId={!isNew ? id : undefined}
                                                    doctype={doctype as any}
                                                    project={localFormData?.project}
                                                    initialItems={isNew ? localFormData?.items : undefined}
                                                    onItemsChange={(items) => (ganttItemsRef.current = items)}
                                                    onBackendUpdate={() => refreshDoc()}
                                                />
                                            </div>
                                        )
                                    }] : []),

                                    // Item/Asset Stock Dashboard Tab
                                    ...(!isNew && (doctype === 'Item' || doctype === 'Asset') ? [{
                                        label: 'Inventory Dashboard',
                                        content: (
                                            <ItemStockDashboard
                                                itemCode={id!}
                                                type={doctype as 'Item' | 'Asset'}
                                            />
                                        )
                                    }] : [])
                                ]}
                                renderHeaderActions={(tabLabel: string) => {
                                    if ((tabLabel === "Address and Contact" || tabLabel === "Address & Contact") && !isNew && id) {
                                        return (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        navigate(`/address/new`, {
                                                            state: {
                                                                defaults: {
                                                                    links: [{ link_doctype: doctype, link_name: id }]
                                                                }
                                                            }
                                                        });
                                                    }}
                                                    className="h-8 text-xs bg-white"
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    New Address
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        navigate(`/contact/new`, {
                                                            state: {
                                                                defaults: {
                                                                    links: [{ link_doctype: doctype, link_name: id }]
                                                                }
                                                            }
                                                        });
                                                    }}
                                                    className="h-8 text-xs bg-white"
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    New Contact
                                                </Button>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
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

            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
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

            {/* Submit Confirmation Dialog */}
            <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <AlertCircle className="h-5 w-5" />
                            <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription>
                            Are you sure you want to submit this {title || doctype}? Once submitted, you cannot edit it directly.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="h-9 text-xs">Review Again</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmSubmit}
                            className="h-9 text-xs bg-primary hover:bg-primary/90"
                            disabled={submitLoading}
                        >
                            {submitLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                            Confirm & Submit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Cancel Confirmation Dialog */}
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

export default GenericForm;