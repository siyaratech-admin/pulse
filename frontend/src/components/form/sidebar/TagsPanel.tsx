
import React, { useState } from 'react';
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk';
import { Plus, X, Tag, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface TagsPanelProps {
    doctype: string;
    docname: string;
}

export const TagsPanel: React.FC<TagsPanelProps> = ({ doctype, docname }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tag, setTag] = useState('');

    const { data: docData, mutate: reloadDocInfo } = useFrappeGetCall('frappe.desk.form.load.getdoc', {
        doctype,
        name: docname
    });

    // Change these two lines
    const { call: addTag, loading: adding } = useFrappePostCall('frappe.desk.doctype.tag.tag.add_tag');
    const { call: removeTag, loading: removing } = useFrappePostCall('frappe.desk.doctype.tag.tag.remove_tag');

    const handleAdd = async () => {
        if (!tag.trim()) return;
        try {
            const res = await addTag({ dt: doctype, dn: docname, tag: tag.trim() });
            console.log('Tag added:', res);
            setTag('');
            setIsOpen(false);
            reloadDocInfo();
        } catch (e: any) {
            console.error(e);
            alert(e.message || 'Failed to add tag');
        }
    };


    const handleRemove = async (tagToRemove: string) => {
        try {
            await removeTag({
                dt: doctype,
                dn: docname,
                tag: tagToRemove
            });
            reloadDocInfo();
        } catch (e) {
            console.error(e);
        }
    };

    // Parse tags string into array
    const tags = docData?.docinfo?.tags ? docData.docinfo.tags.split(',').filter((t: string) => t) : [];

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tags</h4>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <Plus className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </Button>
                    </DialogTrigger>

                    <DialogContent
                        className="sm:max-w-[420px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-0 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <DialogHeader>
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                        <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                            Add New Tag
                                        </DialogTitle>
                                        <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                                            Create a label to organize this document
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>
                        </div>

                        {/* Body */}
                        <div className="px-5 py-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                                    Tag Name
                                </label>

                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Urgent, Pending, Reviewed"
                                        value={tag}
                                        onChange={(e) => setTag(e.target.value)}
                                        autoFocus
                                        className="flex-1 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500"
                                    />

                                    <Button
                                        onClick={handleAdd}
                                        disabled={adding || !tag.trim()}
                                        className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-md transition-all active:scale-95"
                                    >
                                        {adding ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Add'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800">
                            <p className="text-xs text-center text-slate-400">
                                Press <span className="font-medium">Enter</span> or click <span className="font-medium">Add</span> to save the tag
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>

            <div className="flex flex-wrap gap-2 pt-2">
                {tags.map((t: string) => (
                    <Badge
                        key={t}
                        variant="outline"
                        className="pl-2.5 pr-1 py-1 h-7 flex items-center gap-1.5 bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <span className="text-xs font-medium truncate max-w-[120px]">
                            {t}
                        </span>
                        <button
                            type="button"
                            className="flex items-center justify-center rounded-full p-0.5 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-all focus:outline-none"
                            onClick={(e) => {
                                e.preventDefault();
                                handleRemove(t);
                            }}
                            disabled={removing}
                            title="Remove Tag"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}

                {tags.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No Tags</p>
                )}
            </div>
        </div>
    );
};
