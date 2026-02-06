import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { History, ArrowRight } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface VersionHistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    doctype: string;
    docname: string;
}

interface Version {
    name: string;
    owner: string;
    creation: string;
    data: string;
    ref_doctype: string;
    docname: string;
}

export const VersionHistoryDialog: React.FC<VersionHistoryDialogProps> = ({
    open,
    onOpenChange,
    doctype,
    docname
}) => {
    // Fetch versions
    const { data: versionsData, isLoading } = useFrappeGetCall('frappe.client.get_list', {
        doctype: 'Version',
        filters: {
            ref_doctype: doctype,
            docname: docname
        },
        fields: ['name', 'owner', 'creation', 'data'],
        order_by: 'creation desc',
        limit_page_length: 20
    }, open ? undefined : null);

    const versions: Version[] = versionsData?.message || [];

    const parseChanges = (data: string) => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.changed && Array.isArray(parsed.changed)) {
                return parsed.changed.map((change: any) => ({
                    field: change[0],
                    oldValue: change[1],
                    newValue: change[2]
                }));
            }
            return [];
        } catch (e) {
            return [];
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Version History
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6 pt-2">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No version history found
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {versions.map((version) => {
                                const changes = parseChanges(version.data);
                                return (
                                    <div key={version.name} className="relative pl-6 border-l-2 border-muted pb-6 last:pb-0">
                                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-background border-2 border-primary" />

                                        <div className="flex flex-col gap-1 mb-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-sm">{version.owner}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(version.creation), 'MMM d, yyyy HH:mm')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {changes.map((change: any, idx: number) => (
                                                <div key={idx} className="text-sm bg-muted/50 rounded-md p-2">
                                                    <div className="font-medium text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                                                        {change.field}
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50 hover:text-red-700 font-normal">
                                                            {String(change.oldValue || 'Empty')}
                                                        </Badge>
                                                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 hover:text-green-700 font-normal">
                                                            {String(change.newValue || 'Empty')}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                            {changes.length === 0 && (
                                                <div className="text-xs text-muted-foreground italic">
                                                    No field changes recorded
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};
