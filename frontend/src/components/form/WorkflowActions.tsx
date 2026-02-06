import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, GitMerge, Loader2 } from 'lucide-react';
import { useFrappePostCall, useFrappeGetCall } from 'frappe-react-sdk';
import { toast } from 'sonner';

interface WorkflowActionsProps {
    doctype: string;
    docname: string;
    onUpdate: () => void;
}

interface WorkflowTransition {
    action: string;
    next_state: string;
    allowed: boolean;
    allow_self_approval: boolean;
}

export const WorkflowActions: React.FC<WorkflowActionsProps> = ({
    doctype,
    docname,
    onUpdate
}) => {
    const [isLoading, setIsLoading] = useState(false);

    // Fetch available transitions
    // Note: This will error for DocTypes without workflows, which is expected
    const { data: transitionsData, mutate: refreshTransitions, error } = useFrappeGetCall('frappe.model.workflow.get_transitions', {
        doc: { doctype, name: docname } // Pass basic doc reference
    }, undefined, {
        // Suppress errors for DocTypes without workflows
        onError: (err) => {
            // Silently handle "DoesNotExistError" and "Workflow not found"
            const msg = err?.message || '';
            const exc = err?.exc_type || '';

            // Check for specific error types or messages typical of missing workflows
            if (exc === 'DoesNotExistError' || msg.includes('Workflow not found') || msg.includes('not found')) {
                // Determine if we should log based on environment? For now, silent.
                return;
            }
            console.error('Workflow fetch error:', err);
        },
        shouldRetryOnError: false,
        revalidateOnFocus: false
    });

    const { call: applyWorkflow } = useFrappePostCall('frappe.model.workflow.apply_workflow');

    // Filter valid transitions
    const transitions: WorkflowTransition[] = transitionsData?.message || [];

    // If error (likely no workflow) or no transitions, return null
    if (error || !transitions || transitions.length === 0) return null;

    const handleAction = async (action: string) => {
        setIsLoading(true);
        try {
            await applyWorkflow({
                doc: { doctype, name: docname },
                action: action
            });

            toast.success(`Workflow action '${action}' applied`);
            onUpdate();
            refreshTransitions();
        } catch (error: any) {
            console.error('Workflow error:', error);
            toast.error('Failed to apply workflow action', {
                description: error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    // If only one action, show as button
    if (transitions.length === 1) {
        const t = transitions[0];
        const isDestructive = t.action.toLowerCase().includes('reject') || t.action.toLowerCase().includes('cancel');
        const isPositive = t.action.toLowerCase().includes('approve') || t.action.toLowerCase().includes('submit');

        return (
            <Button
                variant={isDestructive ? "destructive" : isPositive ? "default" : "outline"}
                className={`
                    h-9 shadow-sm
                    ${isPositive ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                `}
                onClick={() => handleAction(t.action)}
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GitMerge className="h-4 w-4 mr-2" />}
                {t.action}
            </Button>
        );
    }

    // If multiple actions, show dropdown
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 shadow-sm" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GitMerge className="h-4 w-4 mr-2" />}
                    Actions
                    <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {transitions.map((t) => (
                    <DropdownMenuItem
                        key={t.action}
                        onClick={() => handleAction(t.action)}
                        className={t.action.toLowerCase().includes('reject') ? 'text-red-600' : ''}
                    >
                        {t.action}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
