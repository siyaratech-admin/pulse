import React from 'react';
import { AssignmentPanel } from './AssignmentPanel';
import { AttachmentPanel } from './AttachmentPanel';
import { TagsPanel } from './TagsPanel';
import { SharedPanel } from './SharedPanel';
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface FormSidebarProps {
    doctype: string;
    docname: string;
    onClose?: () => void;
}

export const FormSidebar: React.FC<FormSidebarProps> = ({ doctype, docname, onClose }) => {
    return (
        <div className="w-80 min-w-0 border-l bg-white dark:bg-zinc-950 h-full flex flex-col relative z-0">
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-sm">Info</h3>
                {onClose && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                    <AssignmentPanel doctype={doctype} docname={docname} />
                    <Separator />
                    <AttachmentPanel doctype={doctype} docname={docname} />
                    <Separator />
                    <TagsPanel doctype={doctype} docname={docname} />
                    <Separator />
                    <SharedPanel doctype={doctype} docname={docname} />
                </div>
            </ScrollArea>
        </div>
    );
};
