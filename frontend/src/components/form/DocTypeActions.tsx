import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Play } from 'lucide-react';

interface DocTypeActionsProps {
    doctype: string;
    docname: string;
    docData?: any;
    onUpdate: () => void;
}

interface DocTypeAction {
    label: string;
    action_type: 'Server Action' | 'Route';
    action: string;
    group: string;
    hidden?: number;
}

export const DocTypeActions: React.FC<DocTypeActionsProps> = ({
    doctype,
    docname,
    docData,
    onUpdate
}) => {
    const navigate = useNavigate();
    const [executingAction, setExecutingAction] = useState<string | null>(null);

    // Fetch DocType definition to get actions
    const { data: doctypeData, error } = useFrappeGetCall('frappe.client.get', {
        doctype: 'DocType',
        name: doctype
    });

    const { call: runDocMethod } = useFrappePostCall('frappe.client.run_doc_method');
    const { call: executeMethod } = useFrappePostCall('frappe.client.method'); // Fallback for global methods

    // If permission error or no actions, don't render anything
    if (error || !doctypeData?.message?.actions || doctypeData.message.actions.length === 0) {
        return null;
    }

    const actions: DocTypeAction[] = doctypeData.message.actions.filter((a: DocTypeAction) => !a.hidden);

    const handleAction = async (actionDef: DocTypeAction) => {
        setExecutingAction(actionDef.label);
        try {
            if (actionDef.action_type === 'Route') {
                // Navigate to route
                // Standard Frappe routes often use /app/...
                // We might need to adapt them to our React app routes if they are like /app/sales-order/new
                let route = actionDef.action;
                if (!route.startsWith('/')) route = '/' + route;
                navigate(route);
            } else if (actionDef.action_type === 'Server Action') {
                // Determine if it's a doc method or global method
                // Usually doc methods are just method names, global are dotted.paths
                const method = actionDef.action;

                if (method.includes('.')) {
                    // Likely global method
                    await executeMethod({
                        method: method,
                        args: {
                            doctype,
                            name: docname,
                            ...docData
                        }
                    });
                } else {
                    // Likely doc method
                    await runDocMethod({
                        dt: doctype,
                        dn: docname,
                        method: method
                    });
                }

                toast.success(`Action '${actionDef.label}' executed`);
                onUpdate();
            }
        } catch (error: any) {
            console.error('Action failed:', error);
            toast.error(`Action '${actionDef.label}' failed`, {
                description: error.message || error.exception
            });
        } finally {
            setExecutingAction(null);
        }
    };

    return (
        <>
            {actions.map((action, idx) => (
                <Button
                    key={`${action.label}-${idx}`}
                    variant="outline"
                    className="h-9 shadow-sm"
                    onClick={() => handleAction(action)}
                    disabled={!!executingAction}
                >
                    {executingAction === action.label ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Play className="h-4 w-4 mr-2 opacity-50" />
                    )}
                    {action.label}
                </Button>
            ))}
        </>
    );
};
