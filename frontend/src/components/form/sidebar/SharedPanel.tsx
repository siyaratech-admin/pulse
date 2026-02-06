import React, { useState } from 'react';
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk';
import { Plus, X, Share2, User, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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

interface SharedPanelProps {
    doctype: string;
    docname: string;
}

export const SharedPanel: React.FC<SharedPanelProps> = ({ doctype, docname }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState('');
    const [permission, setPermission] = useState('read');
    const [openCombobox, setOpenCombobox] = useState(false);

    const { data: docData, mutate: reloadDocInfo } = useFrappeGetCall('frappe.desk.form.load.getdoc', {
        doctype,
        name: docname
    });

    const { data: usersData } = useFrappeGetCall('frappe.client.get_list', {
        doctype: 'User',
        filters: { enabled: 1 },
        fields: ['email', 'full_name', 'user_image'],
        limit_page_length: 100
    });

    const { call: shareDoc, loading: sharing } = useFrappePostCall('frappe.share.add');
    const { call: unshareDoc, loading: unsharing } = useFrappePostCall('frappe.share.remove');

    const handleShare = async () => {
        if (!user) return;
        try {
            await shareDoc({
                doctype,
                name: docname,
                user: user,
                [permission]: 1
            });
            setUser('');
            setIsOpen(false);
            reloadDocInfo();
        } catch (e) {
            console.error(e);
        }
    };

    const handleUnshare = async (userToUnshare: string) => {
        try {
            await unshareDoc({
                doctype,
                name: docname,
                user: userToUnshare
            });
            reloadDocInfo();
        } catch (e) {
            console.error(e);
        }
    };

    const sharedWith = docData?.docinfo?.shared || [];
    const users = usersData?.message || [];

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Shared With</h4>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>

                    <DialogContent
                        className="sm:max-w-[420px] bg-white border border-slate-200 shadow-xl rounded-xl p-0"
                    >
                        {/* Header */}
                        <DialogHeader className="px-5 py-4 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-blue-100">
                                    <User className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <DialogTitle className="text-base font-semibold text-slate-900">
                                        Share Document
                                    </DialogTitle>
                                    <p className="text-sm text-slate-500">
                                        Give access to this document
                                    </p>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Body */}
                        <div className="px-5 py-4 space-y-4">
                            {/* User selector */}
                            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCombobox}
                                        className="w-full justify-between rounded-lg"
                                    >
                                        {user
                                            ? users.find((u: any) => u.email === user)?.full_name || user
                                            : "Select user"}
                                        <User className="h-4 w-4 text-slate-400" />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-[300px] p-0 bg-white border border-slate-200 shadow-lg rounded-lg">
                                    <Command>
                                        <CommandInput placeholder="Search user..." />
                                        <CommandEmpty>No user found.</CommandEmpty>
                                        <CommandGroup className="max-h-[200px] overflow-y-auto">
                                            {users.map((u: any) => (
                                                <CommandItem
                                                    key={u.email}
                                                    value={u.email}
                                                    onSelect={(currentValue) => {
                                                        setUser(currentValue === user ? "" : currentValue);
                                                        setOpenCombobox(false);
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2 w-full">
                                                        <Avatar className="h-7 w-7">
                                                            <AvatarImage src={u.user_image} />
                                                            <AvatarFallback>
                                                                {u.full_name?.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>

                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">
                                                                {u.full_name}
                                                            </span>
                                                            <span className="text-xs text-slate-500">
                                                                {u.email}
                                                            </span>
                                                        </div>

                                                        <Check
                                                            className={cn(
                                                                "ml-auto h-4 w-4 text-blue-600",
                                                                user === u.email ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            {/* Permission selector */}
                            <Select value={permission} onValueChange={setPermission}>
                                <SelectTrigger className="rounded-lg">
                                    <SelectValue placeholder="Permission level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="read">Can Read</SelectItem>
                                    <SelectItem value="write">Can Write</SelectItem>
                                    <SelectItem value="share">Can Share</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Action */}
                            <div className="flex items-center gap-3 pt-2">
                                <Button
                                    onClick={handleShare}
                                    disabled={sharing || !user}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-600 text-white font-semibold"
                                >
                                    {sharing ? "Sharing..." : "Share"}
                                </Button>
                            </div>

                            {/* Helper text */}
                            <p className="text-xs text-center text-slate-400">
                                Select a user and permission to share this document
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>

            <div className="space-y-2">
                {sharedWith.map((share: any) => (
                    <div key={share.user} className="flex items-center justify-between p-2 rounded-md bg-muted/50 group">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{share.user}</span>
                                <span className="text-xs text-muted-foreground">
                                    {share.write ? 'Can Write' : 'Can Read'}
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleUnshare(share.user)}
                            disabled={unsharing}
                        >
                            <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </Button>
                    </div>
                ))}
                {sharedWith.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">Not shared with anyone</p>
                )}
            </div>
        </div>
    );
};
