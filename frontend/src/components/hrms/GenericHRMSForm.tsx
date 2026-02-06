/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useFrappeGetCall, useFrappeGetDoc, useFrappeCreateDoc, useFrappeUpdateDoc, useFrappePostCall } from 'frappe-react-sdk';
import { TabbedDynamicForm } from "@/components/form/TabbedDynamicForm";
import { Loader2, Edit2, CheckCircle2, Eye, AlertCircle, Camera } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PrintButton } from "@/components/print/PrintButton";
import { FormSidebar } from "@/components/form/sidebar/FormSidebar";
import { StandardHeader } from "@/components/common/StandardHeader";
import GenericComments from "@/components/common/GenericComments";
import { FormDashboard } from "@/components/form/FormDashboard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GeofencingMap } from "./GeofencingMap";
import { FormActionsMenu } from "@/components/form/FormActionsMenu";
import { MakeMenu } from "@/components/form/MakeMenu";
import { AssignmentBadge } from "@/components/form/AssignmentBadge";
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

interface GenericHRMSFormProps {
    doctype: string;
    title?: string;
    basePath?: string;
    excludeDocTypes?: string[];
    excludeFields?: string[];
    statusField?: string;
}

const GenericHRMSForm: React.FC<GenericHRMSFormProps> = ({
    doctype,
    title,
    basePath,
    excludeDocTypes,
    excludeFields,
    statusField
}) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isNew = !id || id === 'new';

    // Reference to the TabbedDynamicForm to call validation methods
    const formRef = useRef<any>(null);

    // UI State
    const [localFormData, setLocalFormData] = useState<any>({});
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [isSubmittable, setIsSubmittable] = useState(false);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDataReady, setIsDataReady] = useState(false);
    const [loadingTimeout, setLoadingTimeout] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Fetch Form Meta
    const { data: metaData, isLoading: metaLoading, error: metaError } = useFrappeGetCall(
        'pulse.api.get_fields_of_doctype.get_form_meta',
        { doctype_name: doctype }
    );

    // Fetch Form Context (permissions and actions)
    const { data: contextData, isLoading: contextLoading, mutate: refreshContext } = useFrappeGetCall(
        'pulse.api.get_doctype_form_context.get_form_context',
        { doctype: doctype, name: isNew ? undefined : id }
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

    // Parse assignees
    const assignees = useMemo(() => {
        if (!docData?._assign) return [];
        try {
            return JSON.parse(docData._assign);
        } catch (e) {
            return [];
        }
    }, [docData?._assign]);

    // Add timeout for loading state to prevent infinite loading
    useEffect(() => {
        if (!isNew && (docLoading || metaLoading || contextLoading || !isDataReady)) {
            const timeout = setTimeout(() => {
                console.error('⚠️ Loading timeout - forcing data ready state');
                setLoadingTimeout(true);
                setIsDataReady(true);
            }, 10000); // 10 second timeout
            return () => clearTimeout(timeout);
        }
    }, [docLoading, metaLoading, contextLoading, isDataReady, isNew]);

    // Update local form data when doc loads
    useEffect(() => {
        if (!isNew && docData) {
            console.log('✅ Setting localFormData from docData:', docData);
            setLocalFormData({ ...docData });
            setIsDataReady(true);
            setLoadingTimeout(false);
        } else if (isNew) {
            const defaults = location.state?.defaults || {};
            console.log('✅ New form - initializing with defaults:', defaults);
            setLocalFormData(defaults);
            setIsDataReady(true);
        }
    }, [docData, isNew, location.state]);

    // Reset data ready flag when navigating to a different document
    useEffect(() => {
        setIsDataReady(false);
        setLocalFormData({});
        setLoadingTimeout(false);
        setValidationErrors({});
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
        await Promise.all([refreshDoc(), refreshContext()]);
    };

    // Handle switching to edit mode
    const handleEnableEdit = () => {
        setIsReadOnly(false);
        navigate(location.pathname, { replace: true, state: { ...location.state, readOnly: false } });
    };

    // Process fields for display
    const processedFields = useMemo(() => {
        if (!metaData?.message) return [];

        let filteredFields = metaData.message.filter((field: any) => !field.hidden);

        if (excludeDocTypes) {
            filteredFields = filteredFields.filter((field: any) => !excludeDocTypes.includes(field.options));
        }

        if (excludeFields) {
            filteredFields = filteredFields.filter((field: any) => !excludeFields.includes(field.fieldname));
        }

        // Filter out fields that are both required (reqd=1) AND read-only (read_only=1) for new records
        if (isNew) {
            filteredFields = filteredFields.filter((field: any) => !(field.reqd === 1 && field.read_only === 1));
        }

        return filteredFields.map((field: any) => {
            // Make 'name' field read-only for existing records
            if (field.fieldname === 'name' && !isNew) {
                return { ...field, read_only: 1 };
            }

            // Custom rendering for feedback field in Interview Feedback
            if (doctype === 'Interview Feedback' && field.fieldname === 'feedback') {
                return {
                    ...field,
                    // Add custom CSS class for monospace font
                    _customProps: {
                        className: 'font-mono text-sm leading-relaxed',
                        style: {
                            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                            lineHeight: '1.6',
                            whiteSpace: 'pre-wrap'
                        }
                    }
                };
            }

            return field;
        });
    }, [metaData, excludeDocTypes, excludeFields, isNew]);

    // Get actions from context
    const actions = contextData?.message?.actions || {};

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

    /**
     * CLIENT-SIDE VALIDATION
     * Validates all required fields before submission
     */
    const validateForm = (): { isValid: boolean; errors: Record<string, string>; firstErrorField?: any } => {
        const errors: Record<string, string> = {};
        let firstErrorField: any = null;

        processedFields.forEach((field: any) => {
            // Check if field is required
            if (field.reqd === 1 && !field.read_only) {
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
     * ✅ TYPE CONVERSION HELPER
     * Converts form data to proper types based on field metadata
     */
    const convertFieldTypes = (data: any, fields: any[]): any => {
        const converted = { ...data };

        fields.forEach((field: any) => {
            const fieldname = field.fieldname;
            const value = converted[fieldname];

            // Skip if value is null, undefined, or empty string
            if (value === null || value === undefined || value === '') {
                // Special case: Check fields should be 0 when empty
                if (field.fieldtype === 'Check') {
                    converted[fieldname] = 0;
                }
                return;
            }

            // Convert based on field type
            switch (field.fieldtype) {
                case 'Int':
                    converted[fieldname] = parseInt(value, 10);
                    if (isNaN(converted[fieldname])) {
                        delete converted[fieldname];
                    }
                    break;

                case 'Check':
                    converted[fieldname] = value ? 1 : 0;
                    break;

                case 'Float':
                case 'Currency':
                case 'Percent':
                    converted[fieldname] = parseFloat(value);
                    if (isNaN(converted[fieldname])) {
                        delete converted[fieldname];
                    }
                    break;

                case 'Time':
                    // Ensure time is in HH:MM:SS format
                    if (typeof value === 'string') {
                        if (/^\d{2}:\d{2}$/.test(value)) {
                            converted[fieldname] = `${value}:00`;
                        } else if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
                            converted[fieldname] = value;
                        }
                    }
                    break;

                case 'Date':
                    // Keep dates in YYYY-MM-DD format
                    if (typeof value === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                        const date = new Date(value);
                        if (!isNaN(date.getTime())) {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            converted[fieldname] = `${year}-${month}-${day}`;
                        }
                    }
                    break;

                case 'Datetime':
                    // Ensure datetime is in YYYY-MM-DD HH:MM:SS format
                    if (typeof value === 'string') {
                        const date = new Date(value);
                        if (!isNaN(date.getTime())) {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const hours = String(date.getHours()).padStart(2, '0');
                            const minutes = String(date.getMinutes()).padStart(2, '0');
                            const seconds = String(date.getSeconds()).padStart(2, '0');
                            converted[fieldname] = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                        }
                    }
                    break;

                case 'Table':
                case 'Table MultiSelect':
                    // Clean child table data
                    if (Array.isArray(value)) {
                        converted[fieldname] = value.map((row: any) => {
                            const cleanRow: any = {};
                            Object.keys(row).forEach(key => {
                                if (!key.startsWith('__') && row[key] !== null && row[key] !== undefined && row[key] !== '') {
                                    cleanRow[key] = row[key];
                                }
                            });
                            return cleanRow;
                        });
                    }
                    break;
            }
        });

        return converted;
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
                position: "top-right",
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

        let payload = { ...values };

        // ✅ CRITICAL: Convert field types before sending
        payload = convertFieldTypes(payload, processedFields);

        if (isNew) {
            payload.docstatus = 0; // Always create as draft
        }

        try {
            // Special handling for Timesheet
            if (doctype === 'Timesheet') {
                // Fix for offset-naive/aware datetime mismatch
                console.log('🕒 Cleaning Timesheet dates...');
                const dateFields = ['start_date', 'end_date', 'from_time', 'to_time', 'time_logs'];

                // Helper to clean a single datetime string
                const cleanDatetime = (val: any) => {
                    if (typeof val === 'string' && val.includes('T')) {
                        // Keep only YYYY-MM-DD HH:mm:ss part, strip T and Z/offset
                        return val.replace('T', ' ').split('.')[0].substring(0, 19);
                    }
                    return val;
                };

                // Clean top-level fields
                dateFields.forEach(field => {
                    if (payload[field]) {
                        payload[field] = cleanDatetime(payload[field]);
                    }
                });

                // Clean child table: time_logs
                if (Array.isArray(payload.time_logs)) {
                    payload.time_logs = payload.time_logs.map((log: any) => ({
                        ...log,
                        from_time: cleanDatetime(log.from_time),
                        to_time: cleanDatetime(log.to_time)
                    }));
                }
            }

            // Special handling for Employee Referral
            if (doctype === 'Employee Referral' && isNew && !payload.status) {
                payload.status = 'Pending';
            }

            console.log('📤 Final payload being sent:', payload);

            if (isNew) {
                const response = await createDoc(doctype, payload);
                if (response?.name) {
                    toast.success(`${title || doctype} created as Draft`, {
                        position: "top-right",
                    });

                    const newName = response.name;
                    const newPath = location.pathname.replace(/\/new$/, `/${newName}`);
                    navigate(newPath, { replace: true, state: { readOnly: false } });
                }
            } else {
                const updatedDoc = await updateDoc(doctype, id, payload);
                if (updatedDoc) {
                    setLocalFormData({ ...updatedDoc });
                }

                // Refresh to get latest state
                await refreshAll();

                // Set to read-only after successful save
                setIsReadOnly(true);

                toast.success("Changes saved successfully", {
                    position: "top-right",
                });
            }
        } catch (error: any) {
            console.error("Error saving document:", error);
            const msg = getFrappeErrorMessage(error);
            toast.error("Save Failed", {
                description: msg,
                position: "top-right",
            });

            // Handle timestamp mismatch gracefully
            if (error?.message?.includes('modified after you have opened it')) {
                if (window.confirm('This document has been modified by someone else. Would you like to reload and lose your changes?')) {
                    window.location.reload();
                }
            }
        }
    };

    /**
     * SPECIAL HANDLING: Interview Feedback
     * Auto-populates skills from Interview Round
     */
    // We need to fetch the Interview Round details when it's selected
    const { data: interviewRoundData, mutate: fetchInterviewRound } = useFrappeGetDoc(
        'Interview Round',
        localFormData?.interview_round || undefined,
        // Only fetch if we have an ID and we are in Interview Feedback form
        doctype === 'Interview Feedback' && localFormData?.interview_round ? undefined : null
    );

    useEffect(() => {
        if (doctype === 'Interview Feedback' && isNew && localFormData?.interview_round && interviewRoundData) {
            console.log('🎯 Interview Round data loaded:', interviewRoundData);

            if (interviewRoundData.expected_skill_set && (!localFormData.skill_assessment || localFormData.skill_assessment.length === 0)) {
                const skills = interviewRoundData.expected_skill_set.map((skill: any) => ({
                    skill: skill.skill,
                    score: 0 // Default score
                }));

                console.log('✅ Auto-populating skills:', skills);
                setLocalFormData((prev: any) => ({
                    ...prev,
                    skill_assessment: skills
                }));
            }
        }
    }, [doctype, isNew, localFormData?.interview_round, interviewRoundData]);

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
            const result = await submitDoc({ doc: { ...localFormData, doctype, name: id } });

            if (result) {
                setShowSubmitConfirm(false);
                setSubmitSuccess(true);

                // CRITICAL: Refresh context first to recognize new state permissions
                await refreshContext();
                await refreshDoc();

                // Force state update based on new data
                if (contextData?.message) {
                    setIsReadOnly(contextData.message.is_form_read_only);
                }

                setIsReadOnly(true);

                toast.success(`${title || doctype} Submitted Successfully`, {
                    position: "top-right",
                });

                setTimeout(() => setSubmitSuccess(false), 3000);
            }
        } catch (error: any) {
            const msg = getFrappeErrorMessage(error);
            toast.error("Submission Failed", {
                description: msg,
                position: "top-right",
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
                position: "top-right",
            });
        } catch (error: any) {
            toast.error("Cancel Failed", {
                description: getFrappeErrorMessage(error),
                position: "top-right",
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

            // Remove system fields
            const fieldsToDrop = ['name', 'creation', 'modified', 'modified_by', 'owner', 'docstatus', 'parent', 'parentfield', 'parenttype', 'idx', '_user_tags', '_comments', '_assign', '_liked_by', 'workflow_state'];
            fieldsToDrop.forEach(f => delete amendmentData[f]);

            amendmentData['amended_from'] = id;

            const response = await createDoc(doctype, amendmentData);

            if (response?.name) {
                toast.success("Amendment created as Draft", {
                    position: "top-right",
                });

                const newName = response.name;
                const currentPath = location.pathname;
                const newPath = currentPath.substring(0, currentPath.lastIndexOf('/')) + `/${newName}`;
                navigate(newPath, { replace: true, state: { readOnly: false } });
            }
        } catch (error: any) {
            toast.error("Amend Failed", {
                description: getFrappeErrorMessage(error),
                position: "top-right",
            });
        }
    };

    /**
     * AI INTERVIEW CALL HANDLER
     */
    const { call: callAPI } = useFrappePostCall('ai_calling_agent.api.start_ai_call');
    const { call: getSkills } = useFrappeGetCall('hrms.hr.doctype.interview.interview.get_expected_skill_set', {}, null, { revalidateOnFocus: false });
    const { call: getApplicant } = useFrappeGetDoc('Job Applicant', null, null); // Placeholder, adjusted below

    // Correct Hook Usage
    const { call: fetchValue } = useFrappePostCall('frappe.client.get_value');
    const { call: fetchSkills } = useFrappePostCall('hrms.hr.doctype.interview.interview.get_expected_skill_set');
    const { call: startAICall } = useFrappePostCall('ai_calling_agent.api.start_ai_call');

    const handleStartAICall = async () => {
        if (!docData?.job_applicant) {
            toast.error("No Job Applicant linked");
            return;
        }

        try {
            // 1. Fetch Applicant Details (Phone, Job Opening Link, Name)
            const applicantRes = await fetchValue({
                doctype: 'Job Applicant',
                filters: { name: docData.job_applicant },
                fieldname: ['phone_number', 'job_title', 'applicant_name']
            });

            const { phone_number: phone, job_title: jobOpening, applicant_name: applicantName } = applicantRes?.message || {};

            if (!phone) {
                toast.error("Job Applicant has no phone number");
                return;
            }

            // 2. Fetch Job Description (if Job Opening exists)
            let jobDescription = "Standard Role";
            if (jobOpening) {
                const jdRes = await fetchValue({
                    doctype: 'Job Opening',
                    filters: { name: jobOpening },
                    fieldname: 'description'
                });

                if (jdRes?.message?.description) {
                    jobDescription = jdRes.message.description;
                }
            }

            // 3. Fetch Skills/Questions
            let questions = [];
            if (docData.interview_round) {
                const skillsRes = await fetchSkills({ interview_round: docData.interview_round });

                if (skillsRes?.message) {
                    questions = skillsRes.message.map((s: any) => `Please explain your experience with ${s.skill}.`);
                }
            }

            if (questions.length === 0) {
                questions = [
                    "Tell me about your background.",
                    "Why are you interested in this position?",
                    "What are your key strengths?"
                ];
            }

            // 4. Confirm
            // Clean JD for display if too long
            const shortJd = jobDescription.length > 50 ? jobDescription.substring(0, 50) + '...' : jobDescription;
            const confirmMsg = `Start AI Interview with ${applicantName} (${phone})?\n\nJob: ${shortJd}\nQuestions: ${questions.length}`;

            if (!window.confirm(confirmMsg)) return;

            // 5. Call Agent
            const callRes = await startAICall({
                phone_number: phone,
                contact_docname: id,
                party_type: 'Interview',
                extra_metadata: JSON.stringify({
                    interview_questions: questions,
                    job_description: jobDescription,
                    party: applicantName || docData.job_applicant
                })
            });

            if (callRes?.message?.status === 'success') {
                toast.success("AI Call Initiated");
                refreshAll();
            } else {
                toast.error("Failed to start call", { description: callRes?.message?.message });
            }
        } catch (e: any) {
            toast.error("Error", { description: e.message });
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
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <p className="text-sm text-muted-foreground">Loading {isNew ? 'form' : 'document'}...</p>
                {showSlowLoadingMsg && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <p className="text-xs text-muted-foreground mt-2">Taking longer than expected?</p>
                        <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs mt-1"
                            onClick={() => window.location.reload()}
                        >
                            Refresh Page
                        </Button>
                    </div>
                )}
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
    if (!isNew && Object.keys(localFormData).length === 0 && !loadingTimeout) {
        return (
            <div className="flex flex-col justify-center items-center h-screen gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <p className="text-sm text-muted-foreground">Loading document data...</p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            {/* Main Content Area */}
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
                        <div className="flex items-center gap-2">
                            {/* Assignments */}
                            {!isNew && (
                                <AssignmentBadge
                                    doctype={doctype}
                                    docname={id!}
                                    assignees={assignees}
                                    onUpdate={refreshAll}
                                />
                            )}

                            {/* Success Indicator */}
                            {submitSuccess && (
                                <div className="flex items-center text-orange-500 text-xs font-medium animate-in fade-in zoom-in duration-300 mr-2">
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Success
                                </div>
                            )}

                            {/* Edit Button - Show only for Draft documents when in read-only mode and form is submittable */}
                            {!isNew && isReadOnly && actions.can_save && docData?.docstatus === 0 && isSubmittable && (
                                <Button
                                    onClick={handleEnableEdit}
                                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-200 transition-all duration-300 h-9 text-xs font-semibold"
                                >
                                    <Edit2 className="h-3.5 w-3.5 mr-2" />
                                    Edit Document
                                </Button>
                            )}

                            {/* Read-Only Indicator for Draft - Only for submittable forms */}
                            {!isNew && isReadOnly && docData?.docstatus === 0 && isSubmittable && (
                                <div className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-md text-xs font-medium border border-orange-200 flex items-center gap-1.5">
                                    <Eye className="h-3.5 w-3.5" />
                                    Read-Only Mode
                                </div>
                            )}

                            {/* Dynamic Status Badge - Only show for submittable forms */}
                            {!isNew && currentStatus && isSubmittable && (
                                <div
                                    className={cn(
                                        "h-9 px-4 flex items-center rounded-md text-xs font-bold border",
                                        currentStatus.color === 'green' && "bg-green-50 text-green-700 border-green-200",
                                        currentStatus.color === 'red' && "bg-red-50 text-red-700 border-red-200",
                                        currentStatus.color === 'blue' && "bg-orange-50 text-orange-600 border-orange-200",
                                        currentStatus.color === 'orange' && "bg-orange-50 text-orange-700 border-orange-200",
                                        currentStatus.color === 'purple' && "bg-purple-50 text-purple-700 border-purple-200"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "w-1.5 h-1.5 rounded-full mr-2",
                                            currentStatus.color === 'green' && "bg-green-500",
                                            currentStatus.color === 'red' && "bg-red-500",
                                            currentStatus.color === 'blue' && "bg-orange-500",
                                            currentStatus.color === 'orange' && "bg-orange-500",
                                            currentStatus.color === 'purple' && "bg-purple-500"
                                        )}
                                    />
                                    {currentStatus.label}
                                </div>
                            )}

                            {/* DocType Actions */}
                            {!isNew && (
                                <DocTypeActions
                                    doctype={doctype}
                                    docname={id!}
                                    docData={docData}
                                    onUpdate={refreshAll}
                                />
                            )}

                            {/* CUSTOM: AI Interview Call Button */}
                            {!isNew && doctype === 'Interview' && docData?.status === 'Pending' && (
                                <Button
                                    onClick={() => handleStartAICall()}
                                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-sm transition-all duration-300 h-9 text-xs font-semibold ml-2"
                                >
                                    <span className="mr-2">✨</span>
                                    Start AI Call
                                </Button>
                            )}

                            {/* Print Button */}
                            {!isNew && <PrintButton doctype={doctype} docname={id!} />}

                            {/* Sidebar Toggle */}
                            {!isNew && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
                                    className="text-orange-600 border-orange-200 bg-white hover:bg-orange-50"
                                >
                                    {isSidebarOpen ? "Hide Details" : "Show Details"}
                                </Button>
                            )}

                            {/* Face Enrollment Button for Employee/Labour */}
                            {!isNew && (doctype === 'Employee' || doctype === 'Labour Onboarding') && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/face-enrollment?id=${id}&type=${doctype === 'Labour Onboarding' ? 'Labour' : 'Employee'}`)}
                                    title="Enroll Face"
                                    className="bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
                                >
                                    <Camera className="w-3.5 h-3.5 mr-2" />
                                    Enroll Face
                                </Button>
                            )}

                            {/* Make Menu (Create related documents) */}
                            {!isNew && <MakeMenu doctype={doctype} docname={id!} className="mr-1" />}

                            {/* Form Actions Menu (Three-dot menu) */}
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
                    <div className="border-2 border-orange-400 rounded-2xl shadow-lg overflow-hidden bg-white">
                        {/* Orange gradient top border */}
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-t-2xl"></div>

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
                                onCancel={() => {
                                    if (basePath) navigate(basePath);
                                    else navigate(-1);
                                }}
                                loading={createLoading || updateLoading || submitLoading || cancelLoading}
                                readOnly={isReadOnly}
                                isSubmittable={isSubmittable}
                                validationErrors={validationErrors}
                                customTabs={[
                                    ...(!isNew ? [{
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
                                    ...(doctype === 'Shift Type' ? [{
                                        label: 'Geofencing',
                                        content: (
                                            <div className="space-y-4">
                                                <GeofencingMap
                                                    latitude={localFormData?.latitude}
                                                    longitude={localFormData?.longitude}
                                                    radius={localFormData?.geofence_radius}
                                                    onLocationChange={(lat, lng) => {
                                                        setLocalFormData((prev: any) => ({
                                                            ...prev,
                                                            latitude: lat,
                                                            longitude: lng
                                                        }));
                                                    }}
                                                    onRadiusChange={(r) => {
                                                        setLocalFormData((prev: any) => ({
                                                            ...prev,
                                                            geofence_radius: r
                                                        }));
                                                    }}
                                                    readOnly={isReadOnly}
                                                />
                                            </div>
                                        )
                                    }] : [])
                                ]}
                            />
                        </div>
                    </div>

                    {/* Comments Section */}
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
                            className="h-9 text-xs bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
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
                            className="h-9 text-xs bg-red-600 hover:bg-red-700 text-white"
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

export default GenericHRMSForm;