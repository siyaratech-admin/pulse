import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import {
    ArrowLeft,
    Download,
    Filter,
    Loader2,
    RefreshCw,
    Search,
    X,
    FileSpreadsheet,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown
} from "lucide-react"
import { toast } from "sonner"

const ReportViewer: React.FC = () => {
    const { reportName } = useParams<{ reportName: string }>()
    const navigate = useNavigate()
    const [filters, setFilters] = useState<Record<string, any>>({})
    const [reportData, setReportData] = useState<any[]>([])
    const [columns, setColumns] = useState<any[]>([])
    const [filterMetadata, setFilterMetadata] = useState<any[]>([])
    const [filtersInitialized, setFiltersInitialized] = useState(false)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(25)

    // Fetch Report Metadata (Filters & Columns)
    const { data: metaData, isLoading: metaLoading } = useFrappeGetCall(
        "frappe.desk.query_report.get_script",
        { report_name: reportName },
        reportName ? undefined : "swr-disabled"
    )

    // Fetch Global Defaults
    const { data: globalDefaults } = useFrappeGetCall(
        "frappe.client.get",
        { doctype: "Global Defaults", name: "Global Defaults" }
    )

    // Hook for running the report
    const { call: runReport, loading: reportLoading } = useFrappePostCall("frappe.desk.query_report.run")

    const isLoading = metaLoading || reportLoading

    // Initialize filters from metadata
    useEffect(() => {
        if (metaData?.message) {
            const loadedFilters = metaData.message.filters || []
            setFilterMetadata(loadedFilters)

            // Initialize default filters
            const initialFilters: Record<string, any> = {}
            loadedFilters.forEach((f: any) => {
                if (f.default) {
                    initialFilters[f.fieldname] = f.default
                } else if (f.fieldname === "company" && globalDefaults?.message?.default_company) {
                    initialFilters[f.fieldname] = globalDefaults.message.default_company
                } else if (f.fieldname === "from_date" && !initialFilters.from_date) {
                    const d = new Date()
                    d.setMonth(d.getMonth() - 1)
                    initialFilters[f.fieldname] = d.toISOString().split('T')[0]
                } else if (f.fieldname === "to_date" && !initialFilters.to_date) {
                    initialFilters[f.fieldname] = new Date().toISOString().split('T')[0]
                } else if (f.fieldtype === "MultiSelect" || f.fieldtype === "TableMultiSelect") {
                    initialFilters[f.fieldname] = []
                }
            })
            setFilters(initialFilters)
            setFiltersInitialized(true)
        }
    }, [metaData, globalDefaults])

    // Fetch Report Data
    const fetchReportData = async () => {
        if (!reportName) return

        if (!filtersInitialized) {
            console.warn("Filters not initialized, skipping fetch")
            return
        }

        try {
            // Ensure date filters are present
            const effectiveFilters = { ...filters }
            if (!effectiveFilters.from_date) {
                const d = new Date()
                d.setMonth(d.getMonth() - 1)
                effectiveFilters.from_date = d.toISOString().split('T')[0]
            }
            if (!effectiveFilters.to_date) {
                effectiveFilters.to_date = new Date().toISOString().split('T')[0]
            }

            const response = await runReport({
                report_name: reportName,
                filters: effectiveFilters,
                ignore_prepared_report: true,
                are_default_filters: false,
            })

            console.log("Report Response:", response)
            if (response?.message) {
                let result = []
                if (Array.isArray(response.message)) {
                    result = response.message
                } else if (Array.isArray(response.message.result)) {
                    result = response.message.result
                }

                console.log("Parsed Result:", result)
                setReportData(result)

                // Columns often come with the result
                if (response.message.columns && columns.length === 0) {
                    setColumns(response.message.columns)
                }
            } else {
                console.warn("No message in response")
                toast.info("No data returned for this report.")
            }
        } catch (error) {
            console.error("Failed to fetch report data", error)
            toast.error("Failed to fetch report data. " + (error as any).message)
        }
    }

    // Initial fetch when filters are ready
    useEffect(() => {
        if (!metaLoading && filterMetadata && filtersInitialized) {
            fetchReportData()
        }
    }, [filtersInitialized, metaLoading, filterMetadata])

    const handleFilterChange = (fieldname: string, value: any) => {
        setFilters((prev) => ({ ...prev, [fieldname]: value }))
    }

    const formatCellValue = (row: any, col: any) => {
        const val = row[col.fieldname]
        if (val === null || val === undefined) return "-"

        // Format currency fields
        if (col.fieldname.includes("value") || col.fieldname.includes("rate")) {
            const numVal = typeof val === 'number' ? val : parseFloat(val)
            return isNaN(numVal) ? val : `₹${numVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }

        // Format quantity fields
        if (col.fieldname.includes("qty") || col.fieldname.includes("level")) {
            const numVal = typeof val === 'number' ? val : parseFloat(val)
            return isNaN(numVal) ? val : numVal.toLocaleString('en-IN')
        }

        return String(val)
    }

    // Export to CSV function
    const exportToCSV = () => {
        try {
            if (filteredData.length === 0) {
                toast.error("No data to export")
                return
            }

            if (columns.length === 0) {
                toast.error("No columns defined")
                return
            }

            // Create CSV header
            const headers = columns.map(col => col.label || col.fieldname)

            // Create CSV rows
            const csvRows = filteredData.map(row => {
                return columns.map(col => {
                    const val = row[col.fieldname]

                    // Handle null/undefined
                    if (val === null || val === undefined) return ''

                    // Convert value to string and escape quotes
                    let cellValue = String(val).replace(/"/g, '""')

                    // Wrap in quotes if contains comma, newline, or quote
                    if (cellValue.includes(',') || cellValue.includes('\n') || cellValue.includes('"')) {
                        cellValue = `"${cellValue}"`
                    }

                    return cellValue
                }).join(',')
            })

            // Combine header and rows
            const csvContent = [
                headers.map(h => {
                    let header = h.replace(/"/g, '""')
                    if (header.includes(',') || header.includes('\n') || header.includes('"')) {
                        header = `"${header}"`
                    }
                    return header
                }).join(','),
                ...csvRows
            ].join('\n')

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0]
            const filename = `${reportName?.replace(/\s+/g, '_')}_${timestamp}.csv`

            link.setAttribute('href', url)
            link.setAttribute('download', filename)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success(`Exported ${filteredData.length} records to ${filename}`)
        } catch (error) {
            console.error("Export failed:", error)
            toast.error("Failed to export data: " + (error as any).message)
        }
    }

    const filteredData = reportData.filter(row =>
        Object.values(row).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    )

    const totalPages = Math.ceil(filteredData.length / rowsPerPage)
    const paginatedData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    )

    const activeFiltersCount = Object.keys(filters).filter(key => filters[key]).length

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className="h-6 w-6 text-blue-500" />
                                    <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                        {reportName}
                                    </h1>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">
                                    {filteredData.length} records • {columns.length} columns • Last updated just now
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={fetchReportData} disabled={isLoading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                                Refresh
                            </Button>
                            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filters
                                        {activeFiltersCount > 0 && (
                                            <span className="ml-2 h-5 w-5 flex items-center justify-center bg-blue-500 text-white text-xs rounded-full">
                                                {activeFiltersCount}
                                            </span>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="bg-background w-[400px] sm:w-[540px] overflow-y-auto">
                                    <SheetHeader>
                                        <SheetTitle className="flex items-center gap-2">
                                            <Filter className="h-5 w-5" />
                                            Report Filters
                                        </SheetTitle>
                                        <SheetDescription>
                                            Customize your report data with filters
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="py-6 space-y-4">
                                        {filterMetadata.map((filter: any) => (
                                            <div key={filter.fieldname} className="space-y-2">
                                                <Label htmlFor={filter.fieldname} className="text-sm font-medium">
                                                    {filter.label}
                                                    {filter.fieldname.includes("date") && (
                                                        <Calendar className="inline h-3 w-3 ml-1 text-slate-400" />
                                                    )}
                                                </Label>
                                                <Input
                                                    id={filter.fieldname}
                                                    type={filter.fieldtype === "Date" ? "date" : "text"}
                                                    value={filters[filter.fieldname] || ""}
                                                    onChange={(e) => handleFilterChange(filter.fieldname, e.target.value)}
                                                    placeholder={`Enter ${filter.label.toLowerCase()}`}
                                                />
                                            </div>
                                        ))}
                                        <div className="flex gap-2 pt-4">
                                            <Button
                                                className="flex-1 bg-blue-500 hover:bg-blue-600"
                                                onClick={() => {
                                                    fetchReportData()
                                                    setIsFilterOpen(false)
                                                }}
                                            >
                                                Apply Filters
                                            </Button>
                                            <Button variant="outline" onClick={() => setFilters({})}>
                                                Reset
                                            </Button>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                            <Button
                                variant="outline"
                                onClick={exportToCSV}
                                disabled={filteredData.length === 0 || columns.length === 0}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {activeFiltersCount > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-slate-600">Active Filters:</span>
                                {Object.entries(filters).map(([key, value]) =>
                                    value ? (
                                        <span
                                            key={key}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm"
                                        >
                                            {key}: {String(value)}
                                            <button
                                                onClick={() => handleFilterChange(key, "")}
                                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ) : null
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Search across all columns..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="pl-10 pr-10 h-12"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-slate-100 rounded-full p-1"
                            >
                                <X className="h-4 w-4 text-slate-400" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Table Card */}
                <Card className="overflow-hidden shadow-lg border-slate-200">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex h-96 items-center justify-center">
                                <div className="text-center space-y-4">
                                    <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
                                    <p className="text-slate-600 font-medium">Loading report data...</p>
                                </div>
                            </div>
                        ) : paginatedData.length === 0 ? (
                            <div className="flex h-96 items-center justify-center">
                                <div className="text-center space-y-3">
                                    <FileSpreadsheet className="h-16 w-16 text-slate-300 mx-auto" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-700">No data found</h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {searchTerm ? "Try adjusting your search term" : "No records match your filters"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-auto max-h-[calc(100vh-400px)]">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-gradient-to-r from-slate-50 to-slate-100 z-10 border-b-2 border-slate-300 shadow-sm">
                                            <TableRow>
                                                {columns.map((col: any, idx: number) => (
                                                    <TableHead
                                                        key={col.fieldname}
                                                        style={{ minWidth: col.width || 120 }}
                                                        className={`text-left px-4 py-4 font-semibold text-slate-700 whitespace-nowrap border-r border-slate-200 ${idx === 0 ? 'sticky left-0 z-20 bg-slate-50' : ''
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {col.label}
                                                            <ArrowUpDown className="h-3 w-3 text-slate-400" />
                                                        </div>
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedData.map((row: any, rowIdx: number) => (
                                                <TableRow
                                                    key={rowIdx}
                                                    className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors"
                                                >
                                                    {columns.map((col: any, colIdx: number) => (
                                                        <TableCell
                                                            key={col.fieldname}
                                                            className={`px-4 py-3 text-slate-700 text-sm border-r border-slate-100 ${colIdx === 0 ? 'sticky left-0 z-10 bg-white font-medium' : ''
                                                                }`}
                                                        >
                                                            {formatCellValue(row, col)}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-600">Rows per page:</span>
                                            <select
                                                value={rowsPerPage}
                                                onChange={(e) => {
                                                    setRowsPerPage(Number(e.target.value))
                                                    setCurrentPage(1)
                                                }}
                                                className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value={10}>10</option>
                                                <option value={25}>25</option>
                                                <option value={50}>50</option>
                                                <option value={100}>100</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <span className="text-sm text-slate-600">
                                                Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} entries
                                            </span>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                    disabled={currentPage === 1}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>

                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                        let pageNum
                                                        if (totalPages <= 5) {
                                                            pageNum = i + 1
                                                        } else if (currentPage <= 3) {
                                                            pageNum = i + 1
                                                        } else if (currentPage >= totalPages - 2) {
                                                            pageNum = totalPages - 4 + i
                                                        } else {
                                                            pageNum = currentPage - 2 + i
                                                        }

                                                        return (
                                                            <Button
                                                                key={pageNum}
                                                                variant={currentPage === pageNum ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => setCurrentPage(pageNum)}
                                                                className={currentPage === pageNum ? "bg-blue-500 hover:bg-blue-600" : ""}
                                                            >
                                                                {pageNum}
                                                            </Button>
                                                        )
                                                    })}
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ReportViewer