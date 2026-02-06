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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Mail } from 'lucide-react';
import { useFrappePostCall } from 'frappe-react-sdk';
import { toast } from 'sonner';

interface EmailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    doctype: string;
    docname: string;
}

export const EmailDialog: React.FC<EmailDialogProps> = ({
    open,
    onOpenChange,
    doctype,
    docname
}) => {
    const [recipients, setRecipients] = useState('');
    const [cc, setCc] = useState('');
    const [bcc, setBcc] = useState('');
    const [subject, setSubject] = useState(`${doctype}: ${docname}`);
    const [message, setMessage] = useState('');
    const [attachPdf, setAttachPdf] = useState(true);
    const [sendMeCopy, setSendMeCopy] = useState(true); // Default enabled
    const [isLoading, setIsLoading] = useState(false);

    const { call: sendEmail } = useFrappePostCall('frappe.core.doctype.communication.email.make');

    const handleSend = async () => {
        if (!recipients) {
            toast.error('Please enter at least one recipient');
            return;
        }

        setIsLoading(true);
        try {
            await sendEmail({
                recipients,
                cc,
                bcc,
                subject,
                content: message,
                doctype,
                name: docname,
                send_email: 1,
                print_html: attachPdf ? 1 : 0, // Flag to attach print
                send_me_a_copy: sendMeCopy ? 1 : 0
            });

            toast.success('Email sent successfully');
            onOpenChange(false);

            // Reset form
            setRecipients('');
            setCc('');
            setBcc('');
            setMessage('');
        } catch (error: any) {
            console.error('Email error:', error);
            toast.error('Failed to send email', {
                description: error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Send Email</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>To</Label>
                        <Input
                            placeholder="user@example.com"
                            value={recipients}
                            onChange={(e) => setRecipients(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>CC</Label>
                            <Input
                                placeholder="cc@example.com"
                                value={cc}
                                onChange={(e) => setCc(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>BCC</Label>
                            <Input
                                placeholder="bcc@example.com"
                                value={bcc}
                                onChange={(e) => setBcc(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            className="h-32 resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="attach-pdf" checked={attachPdf} onCheckedChange={(c) => setAttachPdf(!!c)} />
                            <Label htmlFor="attach-pdf">Attach PDF</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="send-copy" checked={sendMeCopy} onCheckedChange={(c) => setSendMeCopy(!!c)} />
                            <Label htmlFor="send-copy">Send me a copy</Label>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSend} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                        Send
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
