import React, { useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Share2, Loader2, UserPlus, Trash2 } from 'lucide-react';
import { useFrappePostCall, useFrappeGetCall } from 'frappe-react-sdk';
import { toast } from 'sonner';

interface ShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    doctype: string;
    docname: string;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
    open,
    onOpenChange,
    doctype,
    docname
}) => {
    const [user, setUser] = useState('');
    const [permission, setPermission] = useState('read'); // read, write, submit, share
    const [isLoading, setIsLoading] = useState(false);

    // Fetch existing shares
    const { data: sharesData, mutate: refreshShares } = useFrappeGetCall('frappe.share.get_users', {
        doctype,
        name: docname
    }, open ? undefined : null); // Only fetch when open

    const { call: addShare } = useFrappePostCall('frappe.share.add');
    const { call: removeShare } = useFrappePostCall('frappe.share.remove');

    const handleShare = async () => {
        if (!user) {
            toast.error('Please enter a user or email');
            return;
        }

        setIsLoading(true);
        try {
            await addShare({
                doctype,
                name: docname,
                user,
                read: 1,
                write: permission === 'write' || permission === 'submit' ? 1 : 0,
                submit: permission === 'submit' ? 1 : 0,
                share: permission === 'share' ? 1 : 0
            });

            toast.success(`Shared with ${user}`);
            refreshShares();
            setUser('');
        } catch (error: any) {
            console.error('Share error:', error);
            toast.error('Failed to share document', {
                description: error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (shareUser: string) => {
        try {
            await removeShare({
                doctype,
                name: docname,
                user: shareUser
            });
            toast.success(`Removed access for ${shareUser}`);
            refreshShares();
        } catch (error: any) {
            console.error('Remove share error:', error);
            toast.error('Failed to remove access');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Share Document</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-2">
                            <Label>User</Label>
                            <Input
                                placeholder="user@example.com"
                                value={user}
                                onChange={(e) => setUser(e.target.value)}
                            />
                        </div>
                        <div className="w-[120px] space-y-2">
                            <Label>Permission</Label>
                            <Select value={permission} onValueChange={setPermission}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="read">Can Read</SelectItem>
                                    <SelectItem value="write">Can Write</SelectItem>
                                    <SelectItem value="submit">Can Submit</SelectItem>
                                    <SelectItem value="share">Can Reuse</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleShare} disabled={isLoading} className="mb-0.5">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                        </Button>
                    </div>

                    <div className="space-y-2 mt-4">
                        <Label className="text-muted-foreground">Shared With</Label>
                        <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                            {sharesData?.message?.map((share: any) => (
                                <div key={share.user} className="flex items-center justify-between p-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                                            {share.user.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium">{share.full_name || share.user}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {share.write ? 'Can Write' : 'Can Read'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleRemove(share.user)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {(!sharesData?.message || sharesData.message.length === 0) && (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    Not shared with anyone yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
