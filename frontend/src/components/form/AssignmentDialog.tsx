import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { User, Loader2, X } from 'lucide-react';
import { useFrappePostCall, useFrappeGetCall } from 'frappe-react-sdk';
import { toast } from 'sonner';

interface AssignmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    doctype: string;
    docname: string;
    onAssign: () => void;
}

export const AssignmentDialog: React.FC<AssignmentDialogProps> = ({
    open,
    onOpenChange,
    doctype,
    docname,
    onAssign
}) => {
    const [assignedTo, setAssignedTo] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [dueDate, setDueDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { call: addAssignment } = useFrappePostCall('frappe.desk.form.assign_to.add');

    // Fetch users (simple search)
    const { data: usersData } = useFrappeGetCall('frappe.client.get_list', {
        doctype: 'User',
        fields: ['name', 'full_name', 'user_image'],
        filters: {
            enabled: 1,
            name: ['like', `%${searchQuery}%`]
        },
        limit_page_length: 10
    }, searchQuery ? undefined : undefined);

    const handleAssign = async () => {
        if (assignedTo.length === 0) {
            toast.error('Please select at least one user');
            return;
        }

        setIsLoading(true);
        try {
            await addAssignment({
                doctype,
                name: docname,
                assign_to: assignedTo,
                description,
                priority,
                date: dueDate
            });

            toast.success('Document assigned successfully');
            onAssign();
            onOpenChange(false);

            // Reset form
            setAssignedTo([]);
            setDescription('');
            setPriority('Medium');
            setDueDate('');
        } catch (error: any) {
            console.error('Assignment error:', error);
            toast.error('Failed to assign document', {
                description: error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleUser = (user: string) => {
        if (assignedTo.includes(user)) {
            setAssignedTo(assignedTo.filter(u => u !== user));
        } else {
            setAssignedTo([...assignedTo, user]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Assign To</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* User Selection */}
                    <div className="space-y-2">
                        <Label>Assign To</Label>
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        <div className="border rounded-md max-h-40 overflow-y-auto p-2 space-y-1">
                            {usersData?.message?.map((user: any) => (
                                <div
                                    key={user.name}
                                    className={`
                                        flex items-center gap-2 p-2 rounded-md cursor-pointer text-sm
                                        ${assignedTo.includes(user.name) ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50'}
                                    `}
                                    onClick={() => toggleUser(user.name)}
                                >
                                    <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                        {user.user_image ? (
                                            <img src={user.user_image} alt={user.full_name} className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-3 w-3 text-slate-500" />
                                        )}
                                    </div>
                                    <span>{user.full_name || user.name}</span>
                                    {assignedTo.includes(user.name) && (
                                        <CheckCircle2 className="h-4 w-4 ml-auto" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a comment..."
                            className="h-20 resize-none"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleAssign} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Assign
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

function CheckCircle2({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
