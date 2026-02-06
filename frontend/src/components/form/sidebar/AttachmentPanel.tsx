import React, { useRef, useState } from 'react';
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk';
import {
    Paperclip,
    X,
    Upload,
    FileIcon,
    Download,
    Loader2,
    Eye
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface AttachmentPanelProps {
    doctype: string;
    docname: string;
}

export const AttachmentPanel: React.FC<AttachmentPanelProps> = ({ doctype, docname }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: docData, mutate: reloadDocInfo } = useFrappeGetCall(
        'frappe.desk.form.load.getdoc',
        { doctype, name: docname }
    );

    const { call: removeAttachment } = useFrappePostCall(
        'frappe.desk.form.utils.remove_attach'
    );

    /* ----------------------------- File Select ---------------------------- */
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        setPreviewOpen(true);
    };

    /* ------------------------------ Upload -------------------------------- */
    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile, selectedFile.name);
        formData.append('is_private', '1');
        formData.append('doctype', doctype);
        formData.append('docname', docname);

        try {
            const response = await fetch('/api/method/upload_file', {
                method: 'POST',
                headers: {
                    'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || '',
                },
                body: formData
            });

            if (response.ok) {
                setTimeout(() => {
                    reloadDocInfo();
                    setIsOpen(false);
                    setPreviewOpen(false);
                    setSelectedFile(null);
                }, 500);
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    /* ------------------------------ Remove -------------------------------- */
    const handleRemove = async (fileId: string) => {
        try {
            await removeAttachment({ fid: fileId, dt: doctype, dn: docname });
            reloadDocInfo();
        } catch (e) {
            console.error(e);
        }
    };

    const attachments = docData?.docinfo?.attachments || [];

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Attachments
                </h4>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Upload className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[420px] rounded-xl p-0">
                        {/* Header */}
                        <div className="px-5 py-4 border-b">
                            <DialogHeader>
                                <DialogTitle>Upload Attachment</DialogTitle>
                                <DialogDescription>
                                    Attach a file to this document
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        {/* Body */}
                        <div className="px-5 py-6">
                            <Input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileSelect}
                                disabled={uploading}
                                className="h-24 cursor-pointer border-dashed"
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Attachments List */}
            <div className="space-y-2">
                {attachments.map((file: any) => (
                    <div
                        key={file.name}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50 group min-w-0"
                    >

                        <a
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 flex-1 min-w-0"
                        >
                            <FileIcon className="h-4 w-4 text-blue-500" />
                            <span
                                className="text-sm font-medium truncate max-w-[170px]"
                                title={file.file_name}
                            >
                                {file.file_name}
                            </span>

                        </a>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                            {/* <a href={file.file_url} download>
                                <Download className="h-4 w-4" />
                            </a> */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemove(file.name)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {attachments.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No attachments</p>
                )}
            </div>

            {/* Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Preview Attachment
                        </DialogTitle>
                        <DialogDescription>
                            Verify the file before uploading
                        </DialogDescription>
                    </DialogHeader>

                    {selectedFile && (
                        <div className="space-y-4">
                            <div className="rounded-lg border p-3 text-sm">
                                <p><b>Name:</b> {selectedFile.name}</p>
                                <p><b>Size:</b> {(selectedFile.size / 1024).toFixed(2)} KB</p>
                                <p><b>Type:</b> {selectedFile.type || 'Unknown'}</p>
                            </div>

                            {selectedFile.type.startsWith('image/') && (
                                <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="preview"
                                    className="max-h-48 rounded-md object-contain border"
                                />
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setPreviewOpen(false);
                                setSelectedFile(null);
                            }}
                            disabled={uploading}
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="bg-gradient-to-r from-blue-600 to-blue-400 text-white"
                        >
                            {uploading && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Upload
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};