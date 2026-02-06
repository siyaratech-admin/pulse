import { useState, useEffect } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useFrappeGetDoc, useFrappeGetCall, useFrappePostCall, useFrappeGetDocList, useFrappeFileUpload } from "frappe-react-sdk"
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle2, Play, Download, Loader2, AlertTriangle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { DataImportPreview } from "./DataImportPreview"
import { TemplateFieldSelectionModal } from "./TemplateFieldSelectionModal"
import { StandardHeader } from "@/components/common/StandardHeader"

const DataImportForm = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    // Treat 'null' string as new - fixes hypothetical issue where nav goes to /null
    const isNew = !id || id === 'new' || id === 'undefined' || id === 'null'

    // State
    const [doctype, setDoctype] = useState(searchParams.get("doctype") || "")
    const [shouldFetchList, setShouldFetchList] = useState(!searchParams.get("doctype"))
    const [importType, setImportType] = useState<"Insert New Records" | "Update Existing Records">("Insert New Records")
    const [file, setFile] = useState<File | null>(null)
    const [previewData, setPreviewData] = useState<any>(null)
    const [logs, setLogs] = useState<any[]>([])
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
    const [progress, setProgress] = useState<any>(null) // { success: X, failed: Y, total: Z }
    const [isPolling, setIsPolling] = useState(false)

    // Safe hook call: pass null/undefined as ID to disable fetching if new
    const { data: doc, mutate: mutateDoc, isLoading: isDocLoading } = useFrappeGetDoc("Data Import", isNew ? null as any : id)

    const { data: doctypes, isLoading: isDocTypesLoading } = useFrappeGetDocList(shouldFetchList ? "DocType" : null, {
        fields: ['name'],
        filters: [['allow_import', '=', 1], ['issingle', '=', 0]],
        limit: 1000,
        order_by: 'name asc'
    })

    // Auto-select first doctype if available and none selected (only if user didn't provide one and we fetched list)
    useEffect(() => {
        if (!doctype && shouldFetchList && !isDocTypesLoading && doctypes && doctypes.length > 0) {
            setDoctype(doctypes[0].name)
        }
    }, [doctypes, doctype, isDocTypesLoading, shouldFetchList])

    // Update doctype state if URL param changes
    useEffect(() => {
        const paramDoctype = searchParams.get("doctype")
        if (paramDoctype && paramDoctype !== doctype) {
            setDoctype(paramDoctype)
        }
    }, [searchParams])

    // Fetch Meta for Mapping
    // Fetch Meta for Mapping
    const { data: doctypeMeta } = useFrappeGetDoc("DocType", doctype || null as any, undefined)

    const { upload, loading: isUploading } = useFrappeFileUpload()
    const { call: createDoc, loading: isCreating } = useFrappePostCall('frappe.client.save')
    const { call: getPreview, loading: isPreviewLoading } = useFrappePostCall('frappe.core.doctype.data_import.data_import.get_preview_from_template')
    const { call: startImport, loading: isStarting } = useFrappePostCall('frappe.core.doctype.data_import.data_import.form_start_import')
    const { call: getLogs } = useFrappePostCall('frappe.core.doctype.data_import.data_import.get_import_logs')
    const { call: getStatus } = useFrappePostCall('frappe.core.doctype.data_import.data_import.get_import_status')

    // Effect: Load initial data if editing
    useEffect(() => {
        if (doc) {
            setDoctype(doc.reference_doctype)
            setImportType(doc.import_type)
            if (doc.status === 'Pending' && !previewData) {
                fetchPreview(doc.name)
            }
            if (['Partial Success', 'Success', 'Error', 'Timed Out'].includes(doc.status)) {
                fetchLogs(doc.name)
                fetchStatus(doc.name)
            }
        }
    }, [doc])

    // Polling for progress
    useEffect(() => {
        let interval: NodeJS.Timeout

        const isImporting = doc && ['Pending', 'Partial Success'].includes(doc.status)
        // Poll if we just started (isPolling) OR if we have records to process
        const shouldPoll = isImporting && (isPolling || (progress && progress.total_records > (progress.success + (progress.failed || 0))))

        if (shouldPoll) {
            interval = setInterval(() => {
                fetchStatus(doc.name)
                // Also fetch logs periodically if needed, or stick to status
                fetchLogs(doc.name)
                mutateDoc()
            }, 2000)
        }

        // Auto-stop polling if terminal state
        if (doc && ['Success', 'Error', 'Timed Out'].includes(doc.status)) {
            setIsPolling(false)
        }

        return () => clearInterval(interval)
    }, [doc, progress, isPolling])


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleSave = async () => {
        if (!doctype || !file) {
            toast.error("Please select DocType and File")
            return
        }

        try {
            // 1. Upload File
            const fileDoc = await upload(file, {
                isPrivate: true,
                folder: 'Home',
                doctype: 'Data Import', // Will attach later but need prelim upload
            })

            // 2. Create Data Import Doc
            const newDoc = {
                doctype: "Data Import",
                reference_doctype: doctype,
                import_type: importType,
                import_file: fileDoc.file_url
            }

            const res = await createDoc({ doc: newDoc, action: 'Save' })

            // Handle various response structures
            // 1. { message: { ...doc... } } - Standard Frappe RPC
            // 2. { docs: [ ...doc... ] } - Standard Frappe REST
            // 3. { ...doc... } - Direct Object
            let createdDoc = res.message || (res.docs && res.docs.length > 0 ? res.docs[0] : res);

            if (createdDoc && createdDoc.name && createdDoc.name !== 'null') {
                toast.success("Data Import created")
                navigate(`/bulk-data-import/${createdDoc.name}`)
            } else {
                console.error("Invalid response key:", createdDoc)
                toast.error("Created document has no ID")
            }
        } catch (e: any) {
            console.error(e)
            // Try to parse server messages
            let errorMsg = "Failed to create Data Import"
            if (e._server_messages) {
                try {
                    const messages = JSON.parse(e._server_messages)
                    const messageObj = JSON.parse(messages[0])
                    errorMsg = messageObj.message || errorMsg
                } catch (err) { /* ignore */ }
            } else if (e.message) {
                errorMsg = e.message
            }
            // Strip HTML is risky but simple:
            const tmp = document.createElement("DIV");
            tmp.innerHTML = errorMsg;
            toast.error(tmp.textContent || errorMsg)
        }
    }

    const handleMapColumn = async (colIndex: number, fieldname: string) => {
        if (!doc) return;

        // Parse existing options or create new
        const options = doc.template_options ? JSON.parse(doc.template_options) : {};
        if (!options.column_to_field_map) options.column_to_field_map = {};

        // Update map
        if (fieldname === "Don't Import") {
            options.column_to_field_map[colIndex] = "Don't Import";
        } else {
            options.column_to_field_map[colIndex] = fieldname;
        }

        // Optimistic update or just save and refresh
        // We'll save the doc with new options
        try {
            await createDoc({
                doc: {
                    ...doc,
                    template_options: JSON.stringify(options)
                },
                action: 'Save'
            })
            toast.success("Mapping updated")
            mutateDoc() // Refresh doc
            fetchPreview(doc.name) // Refresh preview
        } catch (e) {
            console.error(e)
            toast.error("Failed to update mapping")
        }
    }

    const fetchPreview = async (importName: string) => {
        try {
            const res = await getPreview({ data_import: importName })
            setPreviewData(res.message || res)
        } catch (e: any) {
            toast.error(e.message || "Failed to get preview")
        }
    }

    const handleStartImport = async () => {
        if (!doc) return
        try {
            await startImport({ data_import: doc.name })
            toast.success("Import started in background")
            setIsPolling(true)
            mutateDoc()
            fetchStatus(doc.name)
        } catch (e) {
            toast.error("Failed to start import")
        }
    }

    const fetchLogs = async (importName: string) => {
        const res = await getLogs({ data_import: importName })
        setLogs(res.message || res || [])
    }

    const fetchStatus = async (importName: string) => {
        const res = await getStatus({ data_import_name: importName })
        setProgress(res.message || res)
    }

    if (!isNew && !doc && isDocLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>
    // Prevent rendering undefined doc properties
    if (!isNew && !doc) return <div className="p-10 text-center">Data Import not found.</div>

    const renderStatusBadge = (status: string) => {
        const colors: any = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Success': 'bg-green-100 text-green-800',
            'Partial Success': 'bg-orange-100 text-orange-800',
            'Error': 'bg-red-100 text-red-800',
            'Timed Out': 'bg-gray-100 text-gray-800'
        }
        return <Badge className={colors[status] || 'bg-slate-100'}>{status}</Badge>
    }

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Header */}
            {/* Header */}
            <StandardHeader
                title={isNew ? "New Data Import" : doc?.name || "Data Import"}
                subtitle={isNew ? "Import data in bulk" : `Importing ${doc?.reference_doctype}`}
                showBack={true}
                onBack={() => navigate(-1)}
                actions={
                    <div className="flex gap-2">
                        {!isNew && doc?.status === 'Pending' && (
                            <Button
                                onClick={handleStartImport}
                                disabled={isStarting}
                                variant="secondary"
                                size="sm"
                            >
                                {isStarting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                Start Import
                            </Button>
                        )}
                        {isNew && (
                            <Button
                                onClick={handleSave}
                                disabled={isUploading || isCreating}
                                variant="secondary"
                                size="sm"
                            >
                                {(isUploading || isCreating) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                Save & Continue
                            </Button>
                        )}
                    </div>
                }
            />

            <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6">

                {/* Configuration Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Configuration</CardTitle>
                        <CardDescription>Select what you want to import</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Document Type</Label>
                                <Select value={doctype} onValueChange={setDoctype} disabled={!isNew} onOpenChange={() => setShouldFetchList(true)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select DocType" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="max-h-[300px] overflow-y-auto p-1">
                                            {/* Ensure selected doctype is always in the list even if loading or not present in initial fetch */}
                                            {doctype && (!doctypes?.find((d: any) => d.name === doctype)) && (
                                                <SelectItem value={doctype}>{doctype}</SelectItem>
                                            )}
                                            {doctypes?.map((d: any) => (
                                                <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                                            ))}
                                            {!shouldFetchList || isDocTypesLoading ? (
                                                <div className="p-2 text-xs text-muted-foreground text-center">Loading...</div>
                                            ) : null}
                                        </div>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Import Action</Label>
                                <Select value={importType} onValueChange={(v: any) => setImportType(v)} disabled={!isNew}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Insert New Records">Insert New Records</SelectItem>
                                        <SelectItem value="Update Existing Records">Update Existing Records</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {isNew && (
                            <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
                                <div className="flex justify-between items-center">
                                    <Label className="text-base">1. Download Template</Label>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setIsTemplateModalOpen(true)}
                                        disabled={!doctype}
                                        className="bg-white border hover:bg-slate-50 text-slate-700 shadow-sm"
                                    >
                                        <Download className="mr-2 h-4 w-4 text-blue-600" /> Download Template
                                    </Button>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <Label className="text-base">2. Upload Data</Label>
                                    <Input type="file" onChange={handleFileChange} accept=".csv, .xlsx, .xls" />
                                    <p className="text-xs text-slate-500">Supported formats: CSV, Excel</p>
                                </div>
                            </div>
                        )}
                        {!isNew && (
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded border">
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className="h-8 w-8 text-green-600" />
                                    <div>
                                        <p className="font-medium text-sm">Import File</p>
                                        <a href={doc?.import_file} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Download Uploaded File</a>
                                    </div>
                                </div>
                                {doc?.status && renderStatusBadge(doc.status)}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Progress Section */}
                {!isNew && progress && (
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-base">Import Progress</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => fetchStatus(doc.name)}><RefreshCcw className="h-3 w-3" /></Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>Success: {progress.success || 0}</span>
                                    <span>Failed: {progress.failed || 0}</span>
                                    <span>Total: {progress.total_records || 0}</span>
                                </div>
                                <Progress value={((progress.success + (progress.failed || 0)) / (progress.total_records || 1)) * 100} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Preview Section */}
                {!isNew && doc.status === 'Pending' && (
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between">
                                <CardTitle>Data Preview</CardTitle>
                                <Button variant="outline" size="sm" onClick={() => fetchPreview(doc.name)} disabled={isPreviewLoading}>
                                    {isPreviewLoading ? <Loader2 className="animate-spin h-3 w-3" /> : "Refresh Preview"}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {previewData ? (
                                <DataImportPreview
                                    previewData={previewData}
                                    doctype={doctype}
                                    fields={doctypeMeta?.fields}
                                    onMapColumn={handleMapColumn}
                                />
                            ) : (
                                <div className="text-center py-10 text-slate-400 text-sm">Preview not loaded</div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Logs Section */}
                {!isNew && logs.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Import Logs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-md max-h-[400px] overflow-y-auto divide-y">
                                {logs.map((log: any, idx: number) => {
                                    let rowsParsed = "Unknown";
                                    try {
                                        rowsParsed = JSON.parse(log.row_indexes).join(", ")
                                    } catch (e) {
                                        rowsParsed = log.row_indexes
                                    }

                                    let messagesParsed: any[] = [];
                                    try {
                                        if (typeof log.messages === 'string') {
                                            messagesParsed = JSON.parse(log.messages)
                                        } else {
                                            messagesParsed = log.messages || []
                                        }
                                    } catch (e) {
                                        messagesParsed = [{ message: log.messages }]
                                    }

                                    return (
                                        <div key={idx} className={`p-3 text-sm flex gap-3 ${log.success ? 'bg-white' : 'bg-red-50'}`}>
                                            {log.success ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                            ) : (
                                                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                            )}
                                            <div className="space-y-1 w-full overflow-hidden">
                                                <div className="font-medium">
                                                    Rows: {rowsParsed}
                                                    {log.docname && <span className="text-slate-500 ml-2">({log.docname})</span>}
                                                </div>
                                                {!log.success && messagesParsed.length > 0 && (
                                                    <div className="text-red-700 text-xs whitespace-pre-wrap space-y-1">
                                                        {messagesParsed.map((m: any, mIdx: number) => (
                                                            <div key={mIdx}>
                                                                {m.title && <span className="font-semibold mr-1">{m.title}:</span>}
                                                                {m.message}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {!log.success && log.exception && (
                                                    <details className="text-xs text-red-800 mt-1 cursor-pointer">
                                                        <summary>View Exception</summary>
                                                        <pre className="mt-1 p-2 bg-red-100 rounded overflow-x-auto whitespace-pre-wrap font-mono">
                                                            {log.exception}
                                                        </pre>
                                                    </details>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <TemplateFieldSelectionModal
                doctype={doctype}
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
            />
        </div>
    )
}

export default DataImportForm
