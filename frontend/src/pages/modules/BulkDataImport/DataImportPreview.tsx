import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, FileWarning } from "lucide-react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface DataImportPreviewProps {
    previewData: any
    doctype?: string
    fields?: any[]
    onMapColumn?: (colIndex: number, fieldname: string) => void
}

export const DataImportPreview = ({ previewData, fields, onMapColumn }: DataImportPreviewProps) => {
    if (!previewData || !previewData.data || !previewData.columns) return null

    const columns = previewData.columns
    const data = previewData.data
    const warnings = previewData.warnings || []

    const getColumnColor = (col: any) => {
        if (col.skip_import) return "bg-red-50 border-red-200"
        if (!col.df) return "bg-yellow-50 border-yellow-200"
        return "bg-green-50 border-green-200"
    }

    return (
        <div className="space-y-6">
            {/* Warnings Section */}
            {warnings.length > 0 && (
                <Alert variant="destructive">
                    <FileWarning className="h-4 w-4" />
                    <AlertTitle>Warnings Found</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc pl-4 mt-2 max-h-40 overflow-y-auto text-xs">
                            {warnings.map((w: any, idx: number) => (
                                <li key={idx}>
                                    {w.row ? `Row ${w.row}: ` : ''}{w.message}
                                </li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            {/* Preview Table */}
            <div className="border rounded-md">
                <ScrollArea className="w-full whitespace-nowrap rounded-md">
                    <div className="w-full">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                                <tr>
                                    {columns.map((col: any, idx: number) => (
                                        <th key={idx} className={`px-4 py-3 font-medium min-w-[200px] border-b-2 ${getColumnColor(col)}`}>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between items-center">
                                                    <span>{col.header_title}</span>
                                                    {!!col.df?.reqd && <Badge variant="destructive" className="text-[10px] h-4 px-1">Req</Badge>}
                                                </div>

                                                {onMapColumn && fields ? (
                                                    <Select
                                                        value={col.df?.fieldname || (col.skip_import ? "Don't Import" : "")}
                                                        onValueChange={(val) => onMapColumn(col.index, val)} // col.index is 0-based from raw data
                                                    >
                                                        <SelectTrigger className="h-7 text-xs bg-white/50">
                                                            <SelectValue placeholder="Map to field..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <div className="max-h-[200px] overflow-y-auto">
                                                                <SelectItem value="Don't Import" className="text-red-500">Don't Import</SelectItem>
                                                                {fields.map((f: any) => (
                                                                    <SelectItem key={f.fieldname} value={f.fieldname}>
                                                                        {f.label} ({f.fieldname})
                                                                    </SelectItem>
                                                                ))}
                                                            </div>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <div className="text-[10px] text-slate-500 font-normal normal-case">
                                                        {col.df?.fieldname || col.df?.label || '-'}
                                                    </div>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.map((row: any[], rIdx: number) => (
                                    <tr key={rIdx} className="hover:bg-slate-50/50">
                                        {row.map((cell: any, cIdx: number) => (
                                            <td key={cIdx} className="px-4 py-2 text-slate-600 truncate max-w-[200px]" title={String(cell)}>
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>

                {previewData.max_rows_exceeded && (
                    <div className="p-3 bg-slate-50 border-t text-center text-xs text-slate-500">
                        Showing first {previewData.max_rows_in_preview} rows of {previewData.total_number_of_rows}.
                    </div>
                )}
            </div>
        </div>
    )
}
