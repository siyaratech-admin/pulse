import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    MoreVertical,
    Copy,
    Edit3,
    Trash2,
    RefreshCw,
    FilePlus,
    Mail,
    Share2,
    History,
    Plus
} from 'lucide-react';
import { useFrappePostCall, useFrappeDeleteDoc } from 'frappe-react-sdk';
import { toast } from 'sonner';
import { EmailDialog } from './EmailDialog';
import { ShareDialog } from './ShareDialog';
import { VersionHistoryDialog } from './VersionHistoryDialog';
import { DOCTYPE_CONNECTIONS } from '@/config/doctype_connections';

interface FormActionsMenuProps {
    doctype: string;
    docname: string;
    onRefresh: () => void;
    canDelete?: boolean;
    canRename?: boolean;
    className?: string;
}

export const FormActionsMenu: React.FC<FormActionsMenuProps> = ({
    doctype,
    docname,
    onRefresh,
    canDelete = true,
    canRename = true,
    className
}) => {
    const navigate = useNavigate();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showRenameDialog, setShowRenameDialog] = useState(false);
    const [showEmailDialog, setShowEmailDialog] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [showVersionHistoryDialog, setShowVersionHistoryDialog] = useState(false);
    const [newName, setNewName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);

    const { call: renameDoc } = useFrappePostCall('frappe.client.rename_doc');
    const { deleteDoc } = useFrappeDeleteDoc();
    const { call: duplicateDoc } = useFrappePostCall('frappe.client.get_value');

    const handleDuplicate = async () => {
        try {
            // Fetch the current document
            const response = await fetch(`/api/resource/${doctype}/${docname}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Frappe-CSRF-Token': (window as any).csrf_token || ''
                }
            });

            if (!response.ok) throw new Error('Failed to fetch document');

            const { data } = await response.json();

            // Remove system fields
            const fieldsToDrop = [
                'name', 'creation', 'modified', 'modified_by', 'owner',
                'docstatus', 'parent', 'parentfield', 'parenttype', 'idx',
                '_user_tags', '_comments', '_assign', '_liked_by', 'workflow_state'
            ];

            const duplicateData = { ...data };
            fieldsToDrop.forEach(f => delete duplicateData[f]);

            // Navigate to new form with duplicate data
            navigate(`/app/${doctype}/new`, {
                state: { defaults: duplicateData }
            });

            toast.success('Document duplicated', {
                description: 'Creating a copy of the document'
            });
        } catch (error: any) {
            console.error('Duplicate error:', error);
            toast.error('Failed to duplicate document', {
                description: error.message
            });
        }
    };

    const handleRename = async () => {
        if (!newName.trim()) {
            toast.error('Please enter a new name');
            return;
        }

        setIsRenaming(true);
        try {
            await renameDoc({
                doctype,
                old_name: docname,
                new_name: newName.trim()
            });

            toast.success('Document renamed successfully');
            setShowRenameDialog(false);

            // Navigate to the renamed document
            const basePath = location.pathname.substring(0, location.pathname.lastIndexOf('/'));
            navigate(`${basePath}/${newName.trim()}`, { replace: true });
        } catch (error: any) {
            console.error('Rename error:', error);
            toast.error('Failed to rename document', {
                description: error.message || 'An error occurred'
            });
        } finally {
            setIsRenaming(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteDoc(doctype, docname);

            toast.success('Document deleted successfully');
            setShowDeleteDialog(false);

            // Navigate back to list
            navigate(`/app/list/${doctype}`);
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error('Failed to delete document', {
                description: error.message || 'An error occurred'
            });
            setIsDeleting(false);
        }
    };

    const handleReload = () => {
        onRefresh();
        toast.success('Document reloaded');
    };

    const handleNew = () => {
        navigate(`/app/${doctype}/new`);
    };



    // Inside component
    const handleCreateConnection = (targetDoctype: string) => {
        const defaultField = doctype.replace(/ /g, '_').toLowerCase();
        navigate(`/app/${targetDoctype}/new`, {
            state: {
                defaults: { [defaultField]: docname }
            }
        });
    };

    const connectionOptions = DOCTYPE_CONNECTIONS[doctype] || [];

    return (
        <div className="flex items-center gap-1">
            {connectionOptions.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex gap-2 h-9 border-dashed text-blue-600 border-blue-200 bg-blue-50">
                            <Plus className="h-4 w-4" />
                            <span className="whitespace-nowrap">Create</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {connectionOptions.map(target => (
                            <DropdownMenuItem key={target} onClick={() => handleCreateConnection(target)}>
                                {target}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-9 w-9 ${className || ''}`}
                        title="More actions"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="bottom" sideOffset={8} alignOffset={-5} className="w-48">
                    <DropdownMenuItem onClick={handleDuplicate}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                    </DropdownMenuItem>

                    {canRename && (
                        <DropdownMenuItem onClick={() => {
                            setNewName(docname);
                            setShowRenameDialog(true);
                        }}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Rename
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={handleReload}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reload
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleNew}>
                        <FilePlus className="h-4 w-4 mr-2" />
                        New {doctype}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => setShowEmailDialog(true)}>
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setShowVersionHistoryDialog(true)}>
                        <History className="h-4 w-4 mr-2" />
                        History
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {canDelete && (
                        <DropdownMenuItem
                            onClick={() => setShowDeleteDialog(true)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Rename Dialog */}
            <AlertDialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Rename {doctype}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Enter a new name for this document. This will update all references.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label htmlFor="new-name" className="text-sm font-medium">
                            New Name
                        </Label>
                        <Input
                            id="new-name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Enter new name"
                            className="mt-2"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleRename();
                                }
                            }}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRenaming}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRename}
                            disabled={isRenaming || !newName.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isRenaming ? 'Renaming...' : 'Rename'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Email Dialog */}
            <EmailDialog
                open={showEmailDialog}
                onOpenChange={setShowEmailDialog}
                doctype={doctype}
                docname={docname}
            />

            {/* Share Dialog */}
            <ShareDialog
                open={showShareDialog}
                onOpenChange={setShowShareDialog}
                doctype={doctype}
                docname={docname}
            />

            {/* Version History Dialog */}
            <VersionHistoryDialog
                open={showVersionHistoryDialog}
                onOpenChange={setShowVersionHistoryDialog}
                doctype={doctype}
                docname={docname}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600">Delete {doctype}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{docname}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
