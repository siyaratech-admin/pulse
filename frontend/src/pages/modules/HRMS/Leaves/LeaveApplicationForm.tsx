/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useFrappeGetCall,
    useFrappeGetDoc,
    useFrappeCreateDoc,
    useFrappeUpdateDoc,
    useFrappePostCall,
    useFrappeGetDocList,
    useFrappeAuth
} from 'frappe-react-sdk';
import { TabbedDynamicForm } from "@/components/form/TabbedDynamicForm";
import { Loader2, Edit2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { StandardHeader } from "@/components/common/StandardHeader";
import GenericComments from "@/components/common/GenericComments";
import { toast } from "sonner";
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

const LeaveApplicationForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = !id || id === 'new';
    const doctype = 'Leave Application';

    // 1. Data Fetching Hooks
    const { data: contextData, isLoading: contextLoading, mutate: refreshContext } =
        useFrappeGetCall('pulse.api.get_doctype_form_context.get_form_context', {
            doctype: doctype,
            name: isNew ? undefined : id
        });

    const { data: docData, isLoading: docLoading, mutate: refreshDoc } =
        useFrappeGetDoc(doctype, isNew ? undefined : id);

    const { data: employeeList } = useFrappeGetDocList('Employee', {
        filters: [['user_id', '=', useFrappeAuth().currentUser || ""]],
        fields: ['name']
    });
    const employeeData = employeeList?.[0];

    // 2. API Mutation Hooks
    const { createDoc, loading: createLoading } = useFrappeCreateDoc();
    const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();
    const { call: submitDoc, loading: submitLoading } = useFrappePostCall('frappe.client.submit');
    const { call: cancelDoc, loading: cancelLoading } = useFrappePostCall('frappe.client.cancel');

    // 3. UI State
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [localFormData, setLocalFormData] = useState<any>({});
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        if (docData) setLocalFormData(docData);
        else if (isNew && employeeData) setLocalFormData({ employee: employeeData.name });
    }, [docData, employeeData, isNew]);

    useEffect(() => {
        if (contextData?.message) setIsReadOnly(contextData.message.is_form_read_only);
    }, [contextData]);

    const refreshAll = async () => {
        await Promise.all([refreshDoc(), refreshContext()]);
    };

    /**
     * SAVE HANDLER
     */
    const handleSubmit = async (values: any, e?: React.FormEvent) => {
        if (e && e.preventDefault) e.preventDefault();
        try {
            if (isNew) {
                const response = await createDoc(doctype, { ...values, docstatus: 0 });
                if (response?.name) {
                    toast.success("Application created as Draft");
                    navigate(`/hrms/leave-applications/${response.name}`, { replace: true });
                }
            } else {
                const updatedDoc = await updateDoc(doctype, id!, values);
                if (updatedDoc) setLocalFormData(updatedDoc);
                setIsReadOnly(true);
                await refreshAll();
                toast.success("Changes saved successfully");
            }
        } catch (error: any) {
            const msg = getFrappeErrorMessage(error);
            toast.error("Save Failed", { description: msg });
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
            const result = await submitDoc({
                doc: { ...localFormData, status: "Approved", doctype, name: id }
            });

            if (result) {
                setShowSubmitConfirm(false);
                setSubmitSuccess(true);
                await refreshAll();
                setIsReadOnly(true);
                toast.success("Application Submitted & Approved");
                setTimeout(() => setSubmitSuccess(false), 3000);
            }
        } catch (error: any) {
            const msg = getFrappeErrorMessage(error);
            toast.error("Submission Failed", { description: msg });
            await refreshAll();
        }
    };

    /**
     * CANCEL HANDLER
     */
    const handleCancelDoc = async (e?: React.MouseEvent) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!id || !window.confirm("Are you sure you want to cancel?")) return;
        try {
            await cancelDoc({ doctype, name: id });
            await refreshAll();
            toast.success("Application Cancelled");
        } catch (error: any) {
            toast.error("Cancel Failed", { description: getFrappeErrorMessage(error) });
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
            const fieldsToDrop = ['name', 'creation', 'modified', 'modified_by', 'owner', 'docstatus', 'idx'];
            fieldsToDrop.forEach(f => delete amendmentData[f]);

            amendmentData['amended_from'] = id;
            const response = await createDoc(doctype, amendmentData);
            if (response?.name) {
                toast.success("Amendment created as Draft");
                navigate(`/hrms/leave-applications/${response.name}`, { replace: true });
            }
        } catch (error: any) {
            toast.error("Amend Failed", { description: getFrappeErrorMessage(error) });
        }
    };

    const processedFields = useMemo(() => contextData?.message?.fields || [], [contextData]);
    const actions = contextData?.message?.actions || {};

    if (contextLoading || (docLoading && !isNew)) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
            <div className="flex-1 overflow-y-auto">
                <StandardHeader
                    title={isNew ? "New Leave Application" : `Application: ${id}`}
                    showBack={true}
                    actions={
                        <div className="flex items-center gap-2">
                            {submitSuccess && (
                                <div className="flex items-center text-green-600 text-xs font-medium animate-in fade-in zoom-in duration-300 mr-2">
                                    <CheckCircle2 className="h-4 w-4 mr-1" /> Success
                                </div>
                            )}

                            {!isNew && isReadOnly && actions.can_save && docData?.docstatus === 0 && (
                                <Button onClick={() => setIsReadOnly(false)} className="h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold">
                                    <Edit2 className="h-3.5 w-3.5 mr-2" /> Edit
                                </Button>
                            )}

                            {docData?.docstatus === 1 && (
                                <div className="h-9 px-4 flex items-center bg-green-50 text-green-700 rounded-md text-xs font-bold border border-green-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" /> Submitted
                                </div>
                            )}

                            {docData?.docstatus === 2 && (
                                <div className="h-9 px-4 flex items-center bg-red-50 text-red-700 rounded-md text-xs font-bold border border-red-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" /> Cancelled
                                </div>
                            )}
                        </div>
                    }
                />

                <div className="p-6 mt-6 space-y-6 max-w-7xl mx-auto">
                    <div className="border border-border/60 rounded-xl shadow-sm overflow-hidden bg-white">
                        <div className="p-6">
                            <TabbedDynamicForm
                                doctype={doctype}
                                docname={!isNew ? id : undefined}
                                fields={processedFields}
                                initialData={localFormData}
                                onSubmit={handleSubmit}
                                onFieldChange={(f, v) => setLocalFormData((prev: any) => ({ ...prev, [f.fieldname]: v }))}
                                onSubmitDoc={actions.can_submit ? async (data) => {
                                    setShowSubmitConfirm(true);
                                } : undefined}
                                onCancelDoc={actions.can_cancel ? handleCancelDoc : undefined}
                                onAmendDoc={actions.can_amend ? handleAmendDoc : undefined}
                                onCancel={() => navigate('/hrms/leave-applications')}
                                loading={createLoading || updateLoading || submitLoading || cancelLoading}
                                readOnly={isReadOnly}
                                isSubmittable={contextData?.message?.is_submittable}
                            />
                        </div>
                    </div>
                    {!isNew && id && <GenericComments doctype={doctype} docname={id} />}
                </div>
            </div>

            <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <AlertCircle className="h-5 w-5" />
                            <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription>
                            Confirm leave application? This will finalize your leave balance.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="h-9 text-xs">Review</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmSubmit}
                            className="h-9 text-xs bg-primary hover:bg-primary/90"
                            disabled={submitLoading}
                        >
                            {submitLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : "Confirm & Submit"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default LeaveApplicationForm;