import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, X, User as UserIcon } from 'lucide-react';
import { useFrappePostCall } from 'frappe-react-sdk';
import { toast } from 'sonner';
import { AssignmentDialog } from './AssignmentDialog';

interface AssignmentBadgeProps {
    doctype: string;
    docname: string;
    assignees: string[]; // List of user IDs (emails)
    onUpdate: () => void;
}

export const AssignmentBadge: React.FC<AssignmentBadgeProps> = ({
    doctype,
    docname,
    assignees = [],
    onUpdate
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { call: removeAssignment } = useFrappePostCall('frappe.desk.form.assign_to.remove');

    const handleRemove = async (user: string) => {
        try {
            await removeAssignment({
                doctype,
                name: docname,
                assign_to: user
            });
            toast.success(`Removed ${user} from assignments`);
            onUpdate();
        } catch (error: any) {
            console.error('Remove assignment error:', error);
            toast.error('Failed to remove assignment');
        }
    };

    // Valid JSON check for assignees if it comes as string, but prop expects array
    // The parent component should parse it.

    return (
        <div className="flex items-center gap-1 mr-2">
            <div className="flex -space-x-2 mr-1">
                {assignees.map((user) => (
                    <TooltipProvider key={user}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="relative group">
                                    <Avatar className="h-7 w-7 border-2 border-white ring-1 ring-slate-100 cursor-pointer transition-transform hover:z-10 hover:scale-105">
                                        {/* Ideally fetch user image, for now fallback */}
                                        <AvatarImage src={`/api/method/frappe.utils.get_user_gravatar?email=${user}`} />
                                        <AvatarFallback className="text-[10px] bg-indigo-50 text-indigo-700">
                                            {user.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Remove Button on Hover */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(user);
                                        }}
                                        className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-600"
                                        title="Remove assignment"
                                    >
                                        <X className="h-2 w-2" />
                                    </button>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Assigned to: {user}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>

            <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-full border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400 bg-transparent"
                onClick={() => setDialogOpen(true)}
                title="Assign to user"
            >
                <Plus className="h-3.5 w-3.5" />
            </Button>

            <AssignmentDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                doctype={doctype}
                docname={docname}
                onAssign={onUpdate}
            />
        </div>
    );
};
