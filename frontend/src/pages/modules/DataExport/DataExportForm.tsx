import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useFrappeGetDocList, useFrappeGetDoc, useFrappePostCall } from "frappe-react-sdk"
import { Download, Search, Plus, X, Filter as FilterIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { StandardHeader } from "@/components/common/StandardHeader"
import { useSearchParams } from "react-router-dom"

const DataExportForm = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    // Configuration State
    const [doctype, setDoctype] = useState(searchParams.get("doctype") || "")
    const [shouldFetchList, setShouldFetchList] = useState(!searchParams.get("doctype"))
    const [fileType, setFileType] = useState<"CSV" | "Excel">("CSV")
    const [exportWithData, setExportWithData] = useState(true)
    const [exportWithoutHeader, setExportWithoutHeader] = useState(false)

    // Update doctype state if URL param changes
    useEffect(() => {
        const paramDoctype = searchParams.get("doctype")
        if (paramDoctype && paramDoctype !== doctype) {
            setDoctype(paramDoctype)
        }
    }, [searchParams])

    // Filter State
    const [filters, setFilters] = useState<any[]>([])
    const [fieldSearchTerm, setFieldSearchTerm] = useState<Record<number, string>>({})

    // Field Selection State
    const [selectedFields, setSelectedFields] = useState<Record<string, string[]>>({})
    const [searchField, setSearchField] = useState("")

    // Fetch DocTypes
    const { data: doctypes, isLoading: isDocTypesLoading } = useFrappeGetDocList(
        shouldFetchList ? "DocType" : null,
        {
            fields: ['name'],
            filters: [['allow_import', '=', 1], ['issingle', '=', 0]],
            limit: 1000,
            orderBy: { field: 'name', order: 'asc' }
        }
    )

    // Auto-select first doctype if available and none selected
    useEffect(() => {
        if (!doctype && shouldFetchList && !isDocTypesLoading && doctypes && doctypes.length > 0) {
            setDoctype(doctypes[0].name)
        }
    }, [doctypes, doctype, isDocTypesLoading, shouldFetchList])

    // Fetch Parent Meta
    const { data: parentMeta } = useFrappeGetDoc("DocType", doctype || null as any)

    // Child Tables Meta State
    const [childMetas, setChildMetas] = useState<Record<string, any>>({})
    const { call: getDoc } = useFrappePostCall('frappe.client.get')

    // Fetch Child Tables
    useEffect(() => {
        if (!parentMeta) {
            setChildMetas({})
            setSelectedFields({})
            setFilters([])
            return
        }

        const fetchChildTables = async () => {
            const tables = parentMeta.fields.filter((f: any) => f.fieldtype === 'Table')
            const metas: Record<string, any> = {}

            // Initialize parent fields selection
            const parentFields = parentMeta.fields
                .filter((f: any) => !['Section Break', 'Column Break', 'Tab Break'].includes(f.fieldtype) && !f.hidden)
                .map((f: any) => f.fieldname)

            if (!parentFields.includes('name')) parentFields.unshift('name')

            const initials: Record<string, string[]> = { [doctype]: parentFields }

            for (const table of tables) {
                try {
                    const res = await getDoc({ doctype: 'DocType', name: table.options })
                    const meta = res.message || res
                    if (meta) {
                        metas[table.options] = meta
                        const childFields = meta.fields
                            .filter((f: any) => !['Section Break', 'Column Break', 'Tab Break'].includes(f.fieldtype) && !f.hidden)
                            .map((f: any) => f.fieldname)
                        if (!childFields.includes('parent')) childFields.unshift('parent')
                        initials[table.options] = childFields
                    }
                } catch (e) {
                    console.error(`Failed to fetch meta for ${table.options}`, e)
                }
            }
            setChildMetas(metas)
            setSelectedFields(initials)
        }

        fetchChildTables()
    }, [parentMeta])

    const toggleField = (table: string, field: string) => {
        setSelectedFields(prev => {
            const current = prev[table] || []
            const newFields = current.includes(field) ? current.filter(f => f !== field) : [...current, field]
            return { ...prev, [table]: newFields }
        })
    }

    const toggleAll = (table: string, fields: string[], select: boolean) => {
        setSelectedFields(prev => ({ ...prev, [table]: select ? fields : [] }))
    }

    const addFilter = () => {
        setFilters([...filters, { field: '', operator: '=', value: '' }])
    }

    const removeFilter = (index: number) => {
        setFilters(filters.filter((_, i) => i !== index))
        // Clear search term for this filter
        setFieldSearchTerm(prev => {
            const newTerms = { ...prev }
            delete newTerms[index]
            return newTerms
        })
    }

    const updateFilter = (index: number, key: string, value: string) => {
        const newFilters = [...filters]
        newFilters[index][key] = value
        setFilters(newFilters)
    }

    const updateFieldSearchTerm = (index: number, term: string) => {
        setFieldSearchTerm(prev => ({ ...prev, [index]: term }))
    }

    // Preview Logic
    const [previewData, setPreviewData] = useState<any[]>([])
    const [isLoadingPreview, setIsLoadingPreview] = useState(false)
    const { call: getList } = useFrappePostCall('frappe.client.get_list')

    const handlePreview = async () => {
        if (!doctype) return
        setIsLoadingPreview(true)
        try {
            const parentFields = selectedFields[doctype] || []
            const formattedFilters = filters
                .filter(f => f.field)
                .map(f => [doctype, f.field, f.operator, f.value])

            const res = await getList({
                doctype: doctype,
                fields: parentFields.length ? parentFields : ['name'],
                filters: formattedFilters,
                limit_page_length: 20
            })

            setPreviewData(res.message || [])
            if ((res.message || []).length === 0) toast.info("No data found for these filters")
        } catch (e) {
            console.error(e)
            toast.error("Failed to fetch preview")
        } finally {
            setIsLoadingPreview(false)
        }
    }

    const handleExport = () => {
        if (!doctype) {
            toast.error("Please select a DocType")
            return
        }

        const columns = selectedFields
        const formattedFilters = filters
            .filter(f => f.field)
            .map(f => [f.field, f.operator, f.value])

        const params = new URLSearchParams({
            doctype: doctype,
            select_columns: JSON.stringify(columns),
            filters: JSON.stringify(formattedFilters),
            file_type: fileType,
            template: String(true),
            with_data: String(exportWithData ? 1 : 0),
            export_without_column_meta: String(exportWithoutHeader)
        })

        const url = `/api/method/frappe.core.doctype.data_export.exporter.export_data?${params.toString()}`
        window.open(url, '_blank')
        toast.success("Download started")
    }

    // Get filterable fields for the current doctype
    const filterableFields = parentMeta?.fields.filter(
        (f: any) => !['Section Break', 'Column Break', 'Tab Break', 'Table'].includes(f.fieldtype)
    ) || []

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            <StandardHeader
                title="Data Export"
                subtitle="Export data to CSV or Excel"
                showBack={true}
            />

            <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6">
                {/* Enhanced Filters Card */}
                {doctype && parentMeta && (
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                                        <FilterIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">Filters</CardTitle>
                                        <CardDescription className="text-xs mt-0.5">
                                            {filters.length > 0
                                                ? `${filters.filter(f => f.field).length} active filter${filters.filter(f => f.field).length !== 1 ? 's' : ''}`
                                                : 'Add filters to refine your export'
                                            }
                                        </CardDescription>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={addFilter} className="h-9">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Filter
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-4">
                            {filters.length === 0 ? (
                                <div className="text-center py-8 px-4 border-2 border-dashed border-border/60 rounded-lg bg-muted/30">
                                    <FilterIcon className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                                    <p className="text-sm text-muted-foreground font-medium mb-1">No filters applied</p>
                                    <p className="text-xs text-muted-foreground/70">
                                        Click "Add Filter" to start filtering your data
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filters.map((filter, index) => {
                                        const searchTerm = fieldSearchTerm[index] || ''
                                        const filteredFields = filterableFields.filter((f: any) =>
                                            (f.label || f.fieldname).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            f.fieldname.toLowerCase().includes(searchTerm.toLowerCase())
                                        )

                                        return (
                                            <div
                                                key={index}
                                                className="flex gap-2 items-start flex-wrap md:flex-nowrap p-3 rounded-lg border border-border/60 bg-card/50 hover:bg-card transition-colors"
                                            >
                                                {/* Field Selection with Search */}
                                                <div className="w-full md:w-[240px] space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Field</Label>
                                                    <Select
                                                        value={filter.field}
                                                        onValueChange={(v) => {
                                                            updateFilter(index, 'field', v)
                                                            updateFieldSearchTerm(index, '') // Clear search when selected
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-full h-10 bg-white">
                                                            <SelectValue placeholder="Select field..." />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white border shadow-lg">
                                                            {/* Search Input */}
                                                            <div className="p-3 border-b bg-gray-50/80 sticky top-0 z-10">
                                                                <div className="relative">
                                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                                                    <Input
                                                                        placeholder="Search fields..."
                                                                        value={searchTerm}
                                                                        onChange={(e) => updateFieldSearchTerm(index, e.target.value)}
                                                                        className="pl-9 h-9 bg-white border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onKeyDown={(e) => e.stopPropagation()}
                                                                    />
                                                                    {searchTerm && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                updateFieldSearchTerm(index, '')
                                                                            }}
                                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                                        >
                                                                            <X className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Scrollable Field List */}
                                                            <ScrollArea className="h-[280px]">
                                                                {filteredFields.length === 0 ? (
                                                                    <div className="py-8 text-center text-sm text-gray-500">
                                                                        No fields found
                                                                    </div>
                                                                ) : (
                                                                    <div className="p-2">
                                                                        {filteredFields.map((f: any) => (
                                                                            <SelectItem
                                                                                key={f.fieldname}
                                                                                value={f.fieldname}
                                                                                className="cursor-pointer px-3 py-2.5 rounded-md hover:bg-blue-50 focus:bg-blue-50 data-[state=checked]:bg-blue-100"
                                                                            >
                                                                                <div className="flex flex-col gap-0.5">
                                                                                    <span className="font-medium text-sm text-gray-900">
                                                                                        {f.label || f.fieldname}
                                                                                    </span>
                                                                                    <span className="text-xs text-gray-500">
                                                                                        {f.fieldname} • {f.fieldtype}
                                                                                    </span>
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </ScrollArea>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Operator Selection */}
                                                <div className="w-full md:w-[160px] space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Operator</Label>
                                                    <Select
                                                        value={filter.operator}
                                                        onValueChange={(v) => updateFilter(index, 'operator', v)}
                                                    >
                                                        <SelectTrigger className="w-full h-10 bg-white">
                                                            <SelectValue placeholder="Operator" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white">
                                                            <SelectItem value="=">Equals</SelectItem>
                                                            <SelectItem value="!=">Not Equals</SelectItem>
                                                            <SelectItem value="like">Like</SelectItem>
                                                            <SelectItem value="not like">Not Like</SelectItem>
                                                            <SelectItem value=">">Greater Than</SelectItem>
                                                            <SelectItem value="<">Less Than</SelectItem>
                                                            <SelectItem value=">=">Greater or Equal</SelectItem>
                                                            <SelectItem value="<=">Less or Equal</SelectItem>
                                                            <SelectItem value="in">In</SelectItem>
                                                            <SelectItem value="not in">Not In</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Value Input */}
                                                <div className="flex-1 min-w-[180px] space-y-1">
                                                    <Label className="text-xs text-muted-foreground">
                                                        Value
                                                        {(filter.operator === 'in' || filter.operator === 'not in') && (
                                                            <span className="ml-1 text-blue-600">(comma-separated)</span>
                                                        )}
                                                    </Label>
                                                    <Input
                                                        placeholder={
                                                            filter.operator === 'in' || filter.operator === 'not in'
                                                                ? "value1, value2, value3"
                                                                : "Enter value"
                                                        }
                                                        value={filter.value}
                                                        onChange={(e) => updateFilter(index, 'value', e.target.value)}
                                                        className="h-10 bg-white"
                                                    />
                                                </div>

                                                {/* Remove Button */}
                                                <div className="flex items-end pb-0.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeFilter(index)}
                                                        className="h-10 w-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        title="Remove filter"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })}

                                    {/* Filter Summary */}
                                    {filters.length > 0 && (
                                        <div className="flex items-center justify-between pt-2 px-1 border-t border-border/40">
                                            <p className="text-xs text-muted-foreground">
                                                {filters.filter(f => f.field).length} of {filters.length} filter{filters.length !== 1 ? 's' : ''} complete
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setFilters([])}
                                                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                Clear All Filters
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Export Configuration Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Export Configuration</CardTitle>
                        <CardDescription>Select what you want to export</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Document Type</Label>
                                <Select
                                    value={doctype}
                                    onValueChange={setDoctype}
                                    onOpenChange={() => setShouldFetchList(true)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select DocType" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="max-h-[300px] overflow-y-auto p-1">
                                            {doctype && (!doctypes?.find((d: any) => d.name === doctype)) && (
                                                <SelectItem value={doctype}>{doctype}</SelectItem>
                                            )}
                                            {doctypes?.map((d: any) => (
                                                <SelectItem key={d.name} value={d.name}>
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                            {!shouldFetchList || isDocTypesLoading ? (
                                                <div className="p-2 text-xs text-muted-foreground text-center">
                                                    Loading...
                                                </div>
                                            ) : null}
                                        </div>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>File Type</Label>
                                <Select value={fileType} onValueChange={(v: any) => setFileType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CSV">CSV</SelectItem>
                                        <SelectItem value="Excel">Excel</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="exportWithData"
                                    checked={exportWithData}
                                    onCheckedChange={(c: any) => setExportWithData(c)}
                                />
                                <Label htmlFor="exportWithData">Export with Data</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="exportWithoutHeader"
                                    checked={exportWithoutHeader}
                                    onCheckedChange={(c: any) => setExportWithoutHeader(c)}
                                />
                                <Label htmlFor="exportWithoutHeader">
                                    Export without Main Header (Metadata)
                                </Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Field Selection Cards - Rest of your existing code */}
                {doctype && parentMeta && (
                    <div className="space-y-6">
                        {/* Parent Table */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>{doctype}</CardTitle>
                                        <CardDescription>Main Document Fields</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleAll(doctype, parentMeta.fields.map((f: any) => f.fieldname), true)}
                                        >
                                            Select All
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleAll(doctype, [], false)}
                                        >
                                            Unselect All
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {['name', ...parentMeta.fields.map((f: any) => f.fieldname)]
                                        .filter(f => {
                                            const field = parentMeta.fields.find((Field: any) => Field.fieldname === f)
                                            return !field || !['Section Break', 'Column Break', 'Tab Break'].includes(field.fieldtype)
                                        })
                                        .filter(f => {
                                            if (searchField) return f.toLowerCase().includes(searchField.toLowerCase())
                                            return true
                                        })
                                        .map((field: string) => {
                                            const df = parentMeta.fields.find((f: any) => f.fieldname === field)
                                            const label = df ? (df.label || df.fieldname) : field
                                            return (
                                                <div key={field} className="flex items-start space-x-2">
                                                    <Checkbox
                                                        id={`${doctype}-${field}`}
                                                        checked={selectedFields[doctype]?.includes(field)}
                                                        onCheckedChange={() => toggleField(doctype, field)}
                                                    />
                                                    <Label
                                                        htmlFor={`${doctype}-${field}`}
                                                        className="text-sm font-normal cursor-pointer leading-tight pt-0.5"
                                                    >
                                                        {label}
                                                        <span className="text-xs text-slate-400 block">{field}</span>
                                                    </Label>
                                                </div>
                                            )
                                        })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Child Tables */}
                        {Object.entries(childMetas).map(([tableName, meta]) => (
                            <Card key={tableName}>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>{meta.name}</CardTitle>
                                            <CardDescription>Child Table ({tableName})</CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => toggleAll(tableName, meta.fields.map((f: any) => f.fieldname), true)}
                                            >
                                                Select All
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => toggleAll(tableName, [], false)}
                                            >
                                                Unselect All
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {['parent', ...meta.fields.map((f: any) => f.fieldname)]
                                            .filter(f => {
                                                const field = meta.fields.find((Field: any) => Field.fieldname === f)
                                                return !field || !['Section Break', 'Column Break', 'Tab Break'].includes(field.fieldtype)
                                            })
                                            .filter(f => {
                                                if (searchField) return f.toLowerCase().includes(searchField.toLowerCase())
                                                return true
                                            })
                                            .map((field: string) => {
                                                const df = meta.fields.find((f: any) => f.fieldname === field)
                                                const label = df ? (df.label || df.fieldname) : field
                                                return (
                                                    <div key={field} className="flex items-start space-x-2">
                                                        <Checkbox
                                                            id={`${tableName}-${field}`}
                                                            checked={selectedFields[tableName]?.includes(field)}
                                                            onCheckedChange={() => toggleField(tableName, field)}
                                                        />
                                                        <Label
                                                            htmlFor={`${tableName}-${field}`}
                                                            className="text-sm font-normal cursor-pointer leading-tight pt-0.5"
                                                        >
                                                            {label}
                                                            <span className="text-xs text-slate-400 block">{field}</span>
                                                        </Label>
                                                    </div>
                                                )
                                            })}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handlePreview}
                        disabled={!doctype || isLoadingPreview}
                    >
                        {isLoadingPreview ? "Loading..." : "Preview Data"}
                    </Button>
                    <Button size="lg" onClick={handleExport} disabled={!doctype}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>

                {/* Preview Table */}
                {previewData.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Preview (Top 20)</CardTitle>
                            <CardDescription>
                                Previewing only parent fields based on current filters
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-secondary-foreground uppercase bg-secondary/20">
                                        <tr>
                                            {selectedFields[doctype]?.map((field) => (
                                                <th key={field} className="px-4 py-3 font-medium whitespace-nowrap">
                                                    {parentMeta?.fields.find((f: any) => f.fieldname === field)?.label || field}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.map((row, i) => (
                                            <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                                                {selectedFields[doctype]?.map((field) => (
                                                    <td key={field} className="px-4 py-3 max-w-[200px] truncate">
                                                        {String(row[field] ?? "")}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default DataExportForm