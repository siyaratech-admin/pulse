import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useState, useEffect, useMemo } from "react"
import { useFrappeGetDoc, useFrappePostCall } from "frappe-react-sdk"
import { Loader2, Download, CheckSquare, Square } from "lucide-react"
import { toast } from "sonner"

interface TemplateFieldSelectionModalProps {
    doctype: string
    isOpen: boolean
    onClose: () => void
}

interface FieldInfo {
    fieldname: string
    label: string
    reqd: boolean
    fieldtype: string
    options?: string
    isChild?: boolean
    parentDoctype?: string
}

export const TemplateFieldSelectionModal = ({ doctype, isOpen, onClose }: TemplateFieldSelectionModalProps) => {
    const [selectedFields, setSelectedFields] = useState<string[]>([])
    const [fileType, setFileType] = useState<"CSV" | "Excel">("CSV")
    const [exportRecords, setExportRecords] = useState<"blank_template" | "5_records" | "all">("blank_template")
    const [isLoadingFields, setIsLoadingFields] = useState(false)
    const [fields, setFields] = useState<FieldInfo[]>([])

    const { call, loading: isDownloading } = useFrappePostCall('frappe.core.doctype.data_import.data_import.download_template')

    // Fetch DocType Metadata
    // We use getDoc("DocType", doctype) to get the main fields
    const { data: doctypeMeta, isLoading: isMetaLoading } = useFrappeGetDoc("DocType", doctype, undefined, {
        enabled: isOpen && !!doctype
    })

    useEffect(() => {
        if (doctypeMeta && isOpen) {
            processFields(doctypeMeta)
        }
    }, [doctypeMeta, isOpen])

    const processFields = async (meta: any) => {
        setIsLoadingFields(true)
        const newFields: FieldInfo[] = []

        // Add ID field for updates (optional but good to have)
        newFields.push({ fieldname: "name", label: "ID (Name)", reqd: false, fieldtype: "Data" })

        // Process main fields
        if (meta.fields) {
            meta.fields.forEach((f: any) => {
                if (!['Section Break', 'Column Break', 'HTML', 'Button', 'Tab Break'].includes(f.fieldtype)) {
                    newFields.push({
                        fieldname: f.fieldname,
                        label: f.label,
                        // Robust check for mandatory (can be 1, '1', true)
                        reqd: f.reqd === 1 || f.reqd === '1' || f.reqd === true,
                        fieldtype: f.fieldtype,
                        options: f.options
                    })
                }
            })
        }

        // Auto-select mandatory fields
        const mandatory = newFields.filter(f => f.fieldname === 'name' || f.reqd).map(f => f.fieldname)
        setSelectedFields(mandatory)

        setFields(newFields)
        setIsLoadingFields(false)
    }

    const handleSelectAll = () => {
        setSelectedFields(fields.map(f => f.fieldname))
    }

    const handleUnselectAll = () => {
        // Keep mandatory fields selected
        const mandatory = fields.filter(f => f.reqd).map(f => f.fieldname)
        setSelectedFields(mandatory)
    }

    const toggleField = (fieldname: string) => {
        const field = fields.find(f => f.fieldname === fieldname)
        if (field?.reqd) return // Cannot uncheck mandatory fields

        setSelectedFields(prev =>
            prev.includes(fieldname)
                ? prev.filter(f => f !== fieldname)
                : [...prev, fieldname]
        )
    }

    const handleDownload = async () => {
        if (selectedFields.length === 0) {
            toast.error("Please select at least one field")
            return
        }

        try {
            // Construct export_fields structure
            // For now simplest version: parent fields only
            // TODO: Add support for Child Table fields if needed by fetching their metadata too
            const exportFieldsMap = {
                [doctype]: selectedFields
            }

            const response = await call({
                doctype: doctype,
                export_fields: JSON.stringify(exportFieldsMap),
                export_records: exportRecords,
                file_type: fileType,
                export_filters: JSON.stringify({})
            })

            // internal helper to download blob
            downloadFile(response, `${doctype}_Template.${fileType.toLowerCase() === 'csv' ? 'csv' : 'xlsx'}`)

            toast.success("Template downloaded successfully")
            onClose()
        } catch (e) {
            console.error(e)
            toast.error("Failed to download template")
        }
    }

    // Helper to trigger browser download from blob/string response
    const downloadFile = (data: any, filename: string) => {
        // Frappe usually returns CSV string. For Excel it might return different encoding.
        // If the response is the raw CSV string:
        const blob = new Blob([data.message || data], { type: fileType === 'CSV' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* Added overflow-hidden and fixed height constraints */}
            <DialogContent className="max-w-3xl h-[90vh] md:h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">

                <DialogHeader className="p-6 pb-4 shrink-0 border-b">
                    <DialogTitle>Select Fields for Template ({doctype})</DialogTitle>
                </DialogHeader>

                {/* This wrapper ensures the middle section is the only part that expands/scrolls */}
                <div className="flex-1 overflow-hidden flex flex-col px-6">

                    {/* Top Selectors: shrink-0 prevents them from being compressed */}
                    <div className="grid grid-cols-2 gap-4 py-4 shrink-0">
                        <div className="space-y-2">
                            <Label>File Type</Label>
                            <Select value={fileType} onValueChange={(v: "CSV" | "Excel") => setFileType(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CSV">CSV</SelectItem>
                                    <SelectItem value="Excel">Excel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Export Data</Label>
                            <Select value={exportRecords} onValueChange={(v: any) => setExportRecords(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="blank_template">Blank Template</SelectItem>
                                    <SelectItem value="5_records">5 Records (Sample)</SelectItem>
                                    <SelectItem value="all">All Records</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-2 shrink-0">
                        <Label className="text-base font-semibold">Fields</Label>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleSelectAll} className="h-7 text-xs">
                                <CheckSquare className="w-3 h-3 mr-1" /> Select All
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleUnselectAll} className="h-7 text-xs">
                                <Square className="w-3 h-3 mr-1" /> Deselect All
                            </Button>
                        </div>
                    </div>

                    {/* SCROLL AREA FIX: 
                        1. Parent has flex-1 and overflow-hidden
                        2. Native scroll div has flex-1 and overflow-y-auto
                    */}
                    <div className="flex-1 w-full rounded-md border bg-slate-50/30 mb-4 overflow-y-auto">
                        <div className="p-4">
                            {isMetaLoading || isLoadingFields ? (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {fields.map(field => (
                                        <div key={field.fieldname} className="flex items-start space-x-2 p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-md transition-colors">
                                            <Checkbox
                                                id={field.fieldname}
                                                checked={field.reqd || selectedFields.includes(field.fieldname)}
                                                disabled={field.reqd}
                                                onCheckedChange={() => toggleField(field.fieldname)}
                                            />
                                            <div className="grid gap-0.5 leading-none">
                                                <label
                                                    htmlFor={field.fieldname}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {field.label}
                                                </label>
                                                <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                                    {field.fieldname} {field.reqd && <span className="text-red-500">*</span>}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer: shrink-0 keeps it at the bottom */}
                <DialogFooter className="p-4 px-6 border-t bg-slate-50 shrink-0">
                    <div className="flex flex-row justify-end gap-3 w-full">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDownload}
                            disabled={isDownloading || selectedFields.length === 0}
                        >
                            {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                            Download Template
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}