import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from 'lucide-react';
import { useFrappePostCall } from 'frappe-react-sdk';
import { toast } from 'sonner';

interface MakeMenuProps {
    doctype: string;
    docname: string;
    className?: string;
}

// Configuration for "Make" menu options
const MAKE_OPTIONS: Record<string, Array<{
    doctype: string; // Target doctype
    label: string;
    method?: string; // Optional custom mapping method
}>> = {
    'Sales Order': [
        { doctype: 'Delivery Note', label: 'Delivery Note' },
        { doctype: 'Sales Invoice', label: 'Sales Invoice' },
        { doctype: 'Payment Entry', label: 'Payment Entry' },
        { doctype: 'Project', label: 'Project' },
        { doctype: 'Material Request', label: 'Material Request' },
    ],
    'Purchase Order': [
        { doctype: 'Purchase Receipt', label: 'Purchase Receipt' },
        { doctype: 'Purchase Invoice', label: 'Purchase Invoice' },
        { doctype: 'Payment Entry', label: 'Payment Entry' },
    ],
    'Quotation': [
        { doctype: 'Sales Order', label: 'Sales Order' },
    ],
    'Supplier Quotation': [
        { doctype: 'Purchase Order', label: 'Purchase Order' },
    ],
    'Opportunity': [
        { doctype: 'Quotation', label: 'Quotation' },
    ],
    'Lead': [
        { doctype: 'Opportunity', label: 'Opportunity' },
        { doctype: 'Customer', label: 'Customer' },
    ],
    'Delivery Note': [
        { doctype: 'Sales Invoice', label: 'Sales Invoice' },
        { doctype: 'Installation Note', label: 'Installation Note' },
    ],
    'Purchase Receipt': [
        { doctype: 'Purchase Invoice', label: 'Purchase Invoice' },
    ],
    'Material Request': [
        { doctype: 'Purchase Order', label: 'Purchase Order' },
        { doctype: 'Stock Entry', label: 'Stock Entry' },
    ],
    'Project': [
        { doctype: 'Task', label: 'Task' },
    ]
};

export const MakeMenu: React.FC<MakeMenuProps> = ({ doctype, docname, className }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const options = MAKE_OPTIONS[doctype];

    const { call: makeMappedDoc } = useFrappePostCall('frappe.model.mapper.make_mapped_doc');

    if (!options || options.length === 0) return null;

    const handleMake = async (targetDoctype: string, customMethod?: string) => {
        setIsLoading(true);
        const toastId = toast.loading(`Creating ${targetDoctype}...`);

        try {
            // Use standard mapper
            const response = await makeMappedDoc({
                source_name: docname,
                target_doc: targetDoctype,
                method: customMethod || undefined
            });

            if (response) {
                // The response is the new temporary document object
                // We navigate to the new form and pass this data as defaults
                toast.success(`${targetDoctype} created`, { id: toastId });

                // Clear system fields from the mapped doc to ensure it's treated as new
                const cleanDoc = { ...response };
                const systemFields = ['name', 'creation', 'modified', 'modified_by', 'owner', 'docstatus', 'idx'];
                systemFields.forEach(f => delete cleanDoc[f]);

                navigate(`/app/${targetDoctype}/new`, {
                    state: {
                        defaults: cleanDoc
                    }
                });
            }
        } catch (error: any) {
            console.error('Make error:', error);

            // Fallback: Just navigate to new form with basic link
            // This is useful if the server mapper fails or isn't whitelisted
            toast.error(`Failed to map document: ${error.message || 'Unknown error'}. Opening blank form.`, { id: toastId });

            const linkField = doctype.replace(/ /g, '_').toLowerCase();
            navigate(`/app/${targetDoctype}/new`, {
                state: {
                    defaults: { [linkField]: docname }
                }
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="default" // Primary style for "Make"
                    size="sm"
                    className={`h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm ${className || ''}`}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create
                    <ChevronDown className="h-4 w-4 ml-2 opacity-70" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {options.map((option) => (
                    <DropdownMenuItem
                        key={option.doctype}
                        onClick={() => handleMake(option.doctype, option.method)}
                    >
                        {option.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
