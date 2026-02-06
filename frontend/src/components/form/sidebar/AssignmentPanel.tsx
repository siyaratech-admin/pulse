import React, { useState } from 'react';
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk';
import { Plus, X, User, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface AssignmentPanelProps {
    doctype: string;
    docname: string;
}

export const AssignmentPanel: React.FC<AssignmentPanelProps> = ({ doctype, docname }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [assignee, setAssignee] = useState('');
    const [openCombobox, setOpenCombobox] = useState(false);

    const { data: docData, mutate: reloadAssignments } = useFrappeGetCall('frappe.desk.form.load.getdoc', {
        doctype,
        name: docname
    });

    const { data: usersData } = useFrappeGetCall('frappe.client.get_list', {
        doctype: 'User',
        filters: { enabled: 1 },
        fields: ['email', 'full_name', 'user_image'],
        limit_page_length: 100
    });

    const { call: addAssignment, loading: adding } = useFrappePostCall('frappe.desk.form.assign_to.add');
    const { call: removeAssignment, loading: removing } = useFrappePostCall('frappe.desk.form.assign_to.remove');

    const handleAdd = async () => {
        if (!assignee) return;
        try {
            await addAssignment({
                doctype,
                name: docname,
                assign_to: [assignee],
                description: `Assignment for ${doctype} ${docname}`,
                priority: 'Medium'
            });
            setAssignee('');
            setIsOpen(false);
            reloadAssignments();
        } catch (e) {
            console.error(e);
        }
    };

    const handleRemove = async (assignTo: string) => {
        try {
            await removeAssignment({
                doctype,
                name: docname,
                assign_to: assignTo
            });
            reloadAssignments();
        } catch (e) {
            console.error(e);
        }
    };

    const assignmentList = docData?.docinfo?.assignments || [];
    const users = usersData?.message || [];

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Assigned To</h4>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Plus className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[420px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-0 overflow-hidden">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <DialogHeader>
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                            Assign To
                                        </DialogTitle>
                                        <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                                            Assign this task to a team member
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>
                        </div>

                        {/* Body */}
                        <div className="px-5 py-5 space-y-4">
                            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                    >
                                        {assignee
                                            ? users.find((u: any) => u.email === assignee)?.full_name || assignee
                                            : "Select user..."}
                                        <User className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-[300px] p-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md">
                                    <Command className="bg-white dark:bg-slate-950">
                                        <CommandInput placeholder="Search user..." />
                                        <CommandEmpty>No user found.</CommandEmpty>

                                        <CommandGroup className="max-h-[200px] overflow-y-auto">
                                            {users.map((user: any) => (
                                                <CommandItem
                                                    key={user.email}
                                                    value={user.email}
                                                    onSelect={(currentValue) => {
                                                        setAssignee(currentValue === assignee ? "" : currentValue);
                                                        setOpenCombobox(false);
                                                    }}
                                                    className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <div className="flex items-center gap-2 w-full">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={user.user_image} />
                                                            <AvatarFallback>
                                                                {user.full_name?.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>

                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">
                                                                {user.full_name}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {user.email}
                                                            </span>
                                                        </div>

                                                        <Check
                                                            className={cn(
                                                                "ml-auto h-4 w-4",
                                                                assignee === user.email ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={adding}
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={handleAdd}
                                disabled={adding || !assignee}
                                className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-md transition-all active:scale-95"
                            >
                                {adding ? "Adding..." : "Assign"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>

            <div className="space-y-2">
                {assignmentList.map((assignment: any) => (
                    <div key={assignment.owner} className="flex items-center justify-between p-2 rounded-md bg-muted/50 group">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={assignment.image} />
                                <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{assignment.fullname || assignment.owner}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemove(assignment.owner)}
                            disabled={removing}
                        >
                            <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </Button>
                    </div>
                ))}
                {assignmentList.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No assignments</p>
                )}
            </div>
        </div>
    );
};
