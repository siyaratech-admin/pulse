import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Printer, Download, Eye, Settings, ChevronDown } from 'lucide-react';
import { PrintPreview } from './PrintPreview';
import { usePrint } from '@/hooks/usePrint';
import type { PrintButtonProps } from '@/types/print';

export const PrintButton: React.FC<PrintButtonProps> = ({
    doctype,
    docname,
    className,
}) => {
    const {
        isPrintPreviewOpen,
        openPrintPreview,
        closePrintPreview,
        downloadPDF,
    } = usePrint({ doctype, docname });

    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            await downloadPDF();
        } catch (err) {
            console.error('Failed to download PDF:', err);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="
        h-9 px-4 text-xs
        bg-transparent
        text-white
        border-white/40

        hover:bg-white/10
        hover:text-white
        hover:border-white/60

        focus-visible:ring-0
        focus-visible:ring-offset-0
        focus-visible:outline-none

        active:bg-white/15
        transition-colors
    "
                    >
                        <Printer className="h-3.5 w-3.5 mr-2" />
                        Print
                        <ChevronDown className="h-3.5 w-3.5 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={openPrintPreview}>
                        <Eye className="h-4 w-4 mr-2" />
                        Print Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadPDF} disabled={isDownloading}>
                        <Download className="h-4 w-4 mr-2" />
                        {isDownloading ? 'Downloading...' : 'Download PDF'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={openPrintPreview}>
                        <Settings className="h-4 w-4 mr-2" />
                        Print Settings
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <PrintPreview
                isOpen={isPrintPreviewOpen}
                onClose={closePrintPreview}
                doctype={doctype}
                docname={docname}
            />
        </>
    );
};
