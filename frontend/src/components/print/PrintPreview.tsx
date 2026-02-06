import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    Printer,
    Download,
    X,
    ZoomIn,
    ZoomOut,
    Maximize2,
    FileText,
    ChevronLeft,
    ChevronRight,
    Settings,
    Eye,
    RefreshCw,
    Minimize2
} from 'lucide-react';
import { PrintFormatSelector } from './PrintFormatSelector';
import { usePrint } from '@/hooks/usePrint';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PrintPreviewProps } from '@/types/print';
import { getEnhancedPrintStyles, getPreviewStyles } from './PrintStyle';

export const PrintPreview: React.FC<PrintPreviewProps> = ({
    isOpen,
    onClose,
    doctype,
    docname,
    printFormat,
    onFormatChange,
}) => {
    const {
        isLoading,
        error,
        printFormats,
        selectedFormat,
        htmlContent,
        getPrintHTML,
        downloadPDF,
        setSelectedFormat,
    } = usePrint({
        doctype,
        docname,
        printFormat
    });

    const [isDownloading, setIsDownloading] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch HTML when modal opens or format changes
    useEffect(() => {
        if (isOpen) {
            getPrintHTML();
        }
    }, [isOpen, selectedFormat]);

    const handleFormatChange = (format: string) => {
        setSelectedFormat(format);
        if (onFormatChange) {
            onFormatChange(format);
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow && htmlContent) {
            printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Print - ${docname}</title>
          <style>
            ${getEnhancedPrintStyles()}
            ${htmlContent.style || ''}
          </style>
        </head>
        <body>
          <div class="print-document">${htmlContent.html}</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 1000);
            };
          </script>
        </body>
        </html>
      `);
            printWindow.document.close();
        }
    };

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

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await getPrintHTML();
        } catch (err) {
            console.error('Failed to refresh:', err);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 10, 200));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 10, 50));
    };

    const resetZoom = () => {
        setZoom(100);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className={`${isFullscreen
                    ? 'max-w-full w-screen h-screen'
                    : 'max-w-[95vw] w-[95vw] h-[92vh] lg:max-w-[1400px]' // Added a larger max-width for desktop
                    } p-0 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 gap-0 border-none shadow-2xl transition-all duration-300`}
            >
                {/* Header */}
                <DialogHeader className='px-6 py-4 bg-white border-b border-slate-200 shadow-sm'>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl shadow-md">
                                <FileText className="h-5 w-5 text-white" />
                            </div>

                            <div>
                                <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    Print Preview
                                    <Badge variant="outline" className="text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200">
                                        {selectedFormat}
                                    </Badge>
                                </DialogTitle>
                                <p className="text-sm text-slate-500 font-medium mt-0.5">
                                    {doctype} • {docname}
                                </p>
                            </div>
                        </div>

                        {/* Desktop Controls */}
                        <div className="hidden md:flex items-center gap-2">
                            {/* Zoom Controls */}
                            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleZoomOut}
                                    disabled={zoom <= 50}
                                    className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={resetZoom}
                                    className="h-8 px-3 text-xs font-bold hover:bg-white hover:shadow-sm"
                                    title="Reset Zoom"
                                >
                                    {zoom}%
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleZoomIn}
                                    disabled={zoom >= 200}
                                    className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                                    title="Zoom In"
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                            </div>

                            <Separator orientation="vertical" className="h-6" />

                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                title="Refresh Preview"
                            >
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </Button>

                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={toggleFullscreen}
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="h-4 w-4" />
                                ) : (
                                    <Maximize2 className="h-4 w-4" />
                                )}
                            </Button>

                            <Separator orientation="vertical" className="h-6" />

                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onClose}
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                title="Close"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Mobile Close Button */}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onClose}
                            className="md:hidden h-8 w-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 flex flex-col md:flex-row gap-0 overflow-hidden">
                    {/* Sidebar */}
                    <div className={`${isSidebarOpen ? 'w-full md:w-72 lg:w-80' : 'w-0' // Use responsive widths
                        } flex-shrink-0 bg-white border-r border-slate-200 transition-all duration-300 overflow-hidden`}>
                        <div className="p-6 space-y-6 overflow-y-auto h-full">
                            <Tabs defaultValue="format" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="format" className="text-xs">
                                        <Settings className="h-3.5 w-3.5 mr-1.5" />
                                        Format
                                    </TabsTrigger>
                                    <TabsTrigger value="actions" className="text-xs">
                                        <Printer className="h-3.5 w-3.5 mr-1.5" />
                                        Actions
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="format" className="space-y-4 mt-4">
                                    {/* Format Selector */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                                            <Eye className="h-4 w-4" />
                                            Print Format
                                        </label>
                                        <PrintFormatSelector
                                            value={selectedFormat}
                                            onChange={handleFormatChange}
                                            formats={printFormats}
                                            isLoading={isLoading && printFormats.length === 0}
                                        />
                                    </div>

                                    {/* Document Info */}
                                    <div className="space-y-3">
                                        <Separator />
                                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Document Info
                                        </label>
                                        <div className="space-y-3">
                                            <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                                                <div className="text-xs text-blue-700 font-semibold mb-1">Document Type</div>
                                                <div className="text-sm font-bold text-blue-900">{doctype}</div>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-blue-50 to-pink-50 rounded-lg border border-purple-100">
                                                <div className="text-xs text-purple-700 font-semibold mb-1">Document Name</div>
                                                <div className="text-sm font-bold text-purple-900 truncate">{docname}</div>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                                                <div className="text-xs text-amber-700 font-semibold mb-1">Selected Format</div>
                                                <div className="text-sm font-bold text-amber-900">{selectedFormat}</div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="actions" className="space-y-3 mt-4">
                                    {/* Action Buttons */}
                                    <Button
                                        onClick={handlePrint}
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                                        disabled={isLoading || !htmlContent}
                                        size="lg"
                                    >
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print Document
                                    </Button>


                                    <Button
                                        onClick={handleDownloadPDF}
                                        variant="outline"
                                        className="w-full border-2 border-slate-200 hover:border-green-600 hover:bg-green-50 hover:text-green-700 font-semibold transition-all"
                                        disabled={isDownloading || isLoading}
                                        size="lg"
                                    >
                                        {isDownloading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Downloading...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="h-4 w-4 mr-2" />
                                                Download PDF
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        onClick={handleRefresh}
                                        variant="outline"
                                        className="w-full border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold transition-all"
                                        disabled={isRefreshing || isLoading}
                                        size="lg"
                                    >
                                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                        Refresh Preview
                                    </Button>

                                    {/* Mobile Zoom Controls */}
                                    <div className="md:hidden space-y-3 pt-3">
                                        <Separator />
                                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                                            Zoom Level
                                        </label>
                                        <div className="flex items-center justify-between gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleZoomOut}
                                                disabled={zoom <= 50}
                                                className="flex-1"
                                            >
                                                <ZoomOut className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={resetZoom}
                                                className="flex-1 font-bold"
                                            >
                                                {zoom}%
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleZoomIn}
                                                disabled={zoom >= 200}
                                                className="flex-1"
                                            >
                                                <ZoomIn className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            {error && (
                                <>
                                    <Separator />
                                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                                        <AlertDescription className="text-sm">
                                            {error.message}
                                        </AlertDescription>
                                    </Alert>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Toggle for Mobile */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="md:hidden fixed bottom-4 left-4 z-50 p-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                    >
                        {isSidebarOpen ? (
                            <ChevronLeft className="h-5 w-5" />
                        ) : (
                            <ChevronRight className="h-5 w-5" />
                        )}
                    </button>

                    {/* Preview Area */}
                    <div className="flex-1 overflow-hidden bg-slate-200/50 p-2 md:p-4 lg:p-6 flex flex-col">
                        <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                            {isLoading ? (
                                <div className="text-center space-y-4 bg-white p-12 rounded-2xl shadow-2xl">
                                    <div className="relative">
                                        <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto" />
                                        <div className="absolute inset-0 blur-xl bg-orange-400 opacity-20 animate-pulse"></div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-lg">Loading Preview</p>
                                        <p className="text-slate-500 text-sm mt-1">
                                            Please wait while we prepare your document...
                                        </p>
                                    </div>
                                </div>
                            ) : htmlContent ? (
                                <div
                                    className="w-full h-full overflow-auto bg-white rounded-lg shadow-2xl"
                                    style={{
                                        transform: zoom !== 100 ? `scale(${zoom / 100})` : 'none',
                                        transformOrigin: 'top center',
                                        transition: 'transform 0.2s ease-in-out',
                                    }}
                                >
                                    <iframe
                                        srcDoc={`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                          ${getPreviewStyles()}
                          ${htmlContent.style || ''}
                        </style>
                      </head>
                      <body>
                        <div class="print-document">${htmlContent.html}</div>
                      </body>
                      </html>
                    `}
                                        className="w-full h-full border-0"
                                        title="Print Preview"
                                        style={{ minHeight: '100%' }}
                                    />
                                </div>
                            ) : (
                                <div className="text-center space-y-4 bg-white p-12 rounded-2xl shadow-xl">
                                    <FileText className="h-16 w-16 text-slate-300 mx-auto" />
                                    <div>
                                        <p className="font-bold text-slate-900 text-lg">No Preview Available</p>
                                        <p className="text-slate-500 text-sm mt-1">
                                            Unable to load the document preview
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};