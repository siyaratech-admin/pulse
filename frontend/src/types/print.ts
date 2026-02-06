// Print-related TypeScript interfaces and types

export interface PrintFormat {
    name: string;
    standard: string;
    disabled: number;
    doc_type?: string;
}

export interface PrintHTMLResponse {
    html: string;
    style: string | null;
}

export interface UsePrintOptions {
    doctype: string;
    docname: string;
    printFormat?: string;
    letterhead?: string;
    noLetterhead?: boolean;
}

export interface UsePrintReturn {
    // State
    isLoading: boolean;
    error: Error | null;
    printFormats: PrintFormat[];
    selectedFormat: string;
    htmlContent: PrintHTMLResponse | null;

    // Methods
    getPrintHTML: () => Promise<PrintHTMLResponse>;
    downloadPDF: () => Promise<void>;
    openPrintPreview: () => void;
    closePrintPreview: () => void;
    setSelectedFormat: (format: string) => void;
    fetchPrintFormats: () => Promise<void>;

    // UI State
    isPrintPreviewOpen: boolean;
}

export interface PrintButtonProps {
    doctype: string;
    docname: string;
    className?: string;
}

export interface PrintPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    doctype: string;
    docname: string;
    printFormat?: string;
    onFormatChange?: (format: string) => void;
}

export interface PrintFormatSelectorProps {
    value: string;
    onChange: (format: string) => void;
    formats: PrintFormat[];
    isLoading?: boolean;
}
