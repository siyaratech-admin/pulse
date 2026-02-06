import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Download, RefreshCw, BarChart3, Loader2, FileText, AlertCircle, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StandardHeader } from "@/components/common/StandardHeader";
import { DynamicFieldRenderer } from "@/components/form/DynamicFieldRenderer";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FilterConfig {
    filter_based_on: string;
    month: string;
    year: string;
    company: string;
    include_company_descendants: boolean;
    summarized_view: boolean;
    employee: string;
    group_by: string;
}

const MonthlyAttendanceReport = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [filters, setFilters] = useState<FilterConfig>({
        filter_based_on: 'Month',
        month: currentMonth.toString(),
        year: currentYear.toString(),
        company: '',
        include_company_descendants: true,
        summarized_view: false,
        employee: '',
        group_by: ''
    });

    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Fetch available years
    const { data: yearsData } = useFrappeGetCall('hrms.hr.report.monthly_attendance_sheet.monthly_attendance_sheet.get_attendance_years');

    const availableYears = useMemo(() => {
        if (!yearsData?.message) return [currentYear.toString()];
        const years = yearsData.message.split('\n').filter((y: string) => y);
        return years.length > 0 ? years : [currentYear.toString()];
    }, [yearsData, currentYear]);

    const months = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    // Filter fields configuration for DynamicFieldRenderer
    const filterFields = [
        {
            fieldname: 'month',
            fieldtype: 'Select',
            label: 'Month',
            options: months.map(m => m.label).join('\n'),
            reqd: 1
        },
        {
            fieldname: 'year',
            fieldtype: 'Select',
            label: 'Year',
            options: availableYears.join('\n'),
            reqd: 1
        },
        {
            fieldname: 'employee',
            fieldtype: 'Link',
            label: 'Employee',
            options: 'Employee',
            reqd: 0
        },
        {
            fieldname: 'company',
            fieldtype: 'Link',
            label: 'Company',
            options: 'Company',
            reqd: 1
        },
        {
            fieldname: 'group_by',
            fieldtype: 'Select',
            label: 'Group By',
            options: '\nDepartment\nDesignation\nBranch',
            reqd: 0
        },
        {
            fieldname: 'include_company_descendants',
            fieldtype: 'Check',
            label: 'Include Company Descendants',
            reqd: 0
        },
        {
            fieldname: 'summarized_view',
            fieldtype: 'Check',
            label: 'Summarized View',
            reqd: 0
        }
    ];

    // Validate filters before fetching report
    const validateFilters = (): boolean => {
        const errors: string[] = [];

        if (!filters.company || filters.company.trim() === '') {
            errors.push('Company is required');
        }

        if (!filters.month || filters.month.trim() === '') {
            errors.push('Month is required');
        }

        if (!filters.year || filters.year.trim() === '') {
            errors.push('Year is required');
        }

        setValidationErrors(errors);

        if (errors.length > 0) {
            toast.error("Please fix validation errors", {
                description: errors.join(', '),
                position: "top-right"
            });
            return false;
        }

        return true;
    };

    const fetchReport = async () => {
        // Validate filters first
        if (!validateFilters()) {
            return;
        }

        setLoading(true);
        setError(null);
        setValidationErrors([]);

        try {
            // Convert month label to number
            const monthIndex = months.findIndex(m => m.label === filters.month);
            const monthValue = monthIndex >= 0 ? (monthIndex + 1).toString() : filters.month;

            const filterParams: any = {
                filter_based_on: filters.filter_based_on,
                month: monthValue,
                year: filters.year,
                company: filters.company,
                include_company_descendants: filters.include_company_descendants ? 1 : 0,
                summarized_view: filters.summarized_view ? 1 : 0
            };

            if (filters.employee) filterParams.employee = filters.employee;
            if (filters.group_by) filterParams.group_by = filters.group_by;

            const params = new URLSearchParams({
                report_name: 'Monthly Attendance Sheet',
                filters: JSON.stringify(filterParams),
                ignore_prepared_report: 'false',
                are_default_filters: 'false',
                _: Date.now().toString()
            });

            const response = await fetch(`/api/method/frappe.desk.query_report.run?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.message) {
                setReportData(data.message);
                toast.success("Report generated successfully", {
                    position: "top-right"
                });
            } else {
                throw new Error('No data returned from server');
            }
        } catch (error: any) {
            console.error('Error fetching report:', error);
            const errorMsg = error.message || 'Failed to fetch report';
            setError(errorMsg);
            toast.error("Failed to generate report", {
                description: errorMsg,
                position: "top-right"
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle field changes
    const handleFieldChange = (field: any, value: any) => {
        setFilters(prev => ({
            ...prev,
            [field.fieldname]: value
        }));

        // Clear validation errors when user starts fixing them
        if (validationErrors.length > 0) {
            setValidationErrors([]);
        }
    };

    // Get status color for attendance badges
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'P': 'bg-green-500 text-white',
            'A': 'bg-red-500 text-white',
            'L': 'bg-blue-500 text-white',
            'H': 'bg-gray-500 text-white',
            'WO': 'bg-gray-400 text-white',
            'HD/A': 'bg-orange-500 text-white',
            'HD/P': 'bg-purple-500 text-white',
            'WFH': 'bg-green-400 text-white'
        };
        return colors[status] || 'bg-gray-200 text-gray-700';
    };

    // Prepare chart data
    const prepareChartData = () => {
        if (!reportData?.chart?.data) return [];
        const { labels, datasets } = reportData.chart.data;
        return labels.map((label: string, index: number) => {
            const dataPoint: any = { name: label };
            datasets.forEach((dataset: any) => {
                dataPoint[dataset.name] = dataset.values[index];
            });
            return dataPoint;
        });
    };

    // Export to Excel/CSV
    const handleExport = async () => {
        if (!reportData) {
            toast.error("No data to export", {
                position: "top-right"
            });
            return;
        }

        // Validate filters before exporting
        if (!validateFilters()) {
            return;
        }

        try {
            toast.info("Preparing export...", {
                position: "top-right"
            });

            // Convert month label to number
            const monthIndex = months.findIndex(m => m.label === filters.month);
            const monthValue = monthIndex >= 0 ? (monthIndex + 1).toString() : filters.month;

            const filterParams: any = {
                filter_based_on: filters.filter_based_on,
                month: monthValue,
                year: filters.year,
                company: filters.company,
                include_company_descendants: filters.include_company_descendants ? 1 : 0,
                summarized_view: filters.summarized_view ? 1 : 0
            };

            if (filters.employee) filterParams.employee = filters.employee;
            if (filters.group_by) filterParams.group_by = filters.group_by;

            // Create form data for the export request
            const formData = new URLSearchParams({
                doctype: '',
                report_name: 'Monthly Attendance Sheet',
                filters: JSON.stringify(filterParams),
                file_type: 'Excel',
                method: 'Export'
            });

            // Make the export request
            const response = await fetch('/api/method/frappe.core.doctype.access_log.access_log.make_access_log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: formData.toString()
            });

            if (!response.ok) {
                throw new Error(`Export failed with status: ${response.status}`);
            }

            // Now trigger the actual file download
            const downloadUrl = `/api/method/frappe.desk.query_report.export_query?` + new URLSearchParams({
                report_name: 'Monthly Attendance Sheet',
                filters: JSON.stringify(filterParams),
                file_format_type: 'Excel',
                include_indentation: '0',
                visible_idx: ''
            }).toString();

            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `Monthly_Attendance_Sheet_${filters.month}_${filters.year}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Report exported successfully", {
                position: "top-right"
            });

        } catch (error: any) {
            console.error('Export error:', error);
            toast.error("Failed to export report", {
                description: error.message || 'Please try again',
                position: "top-right"
            });
        }
    };

    // Render table based on view type
    const renderTable = () => {
        if (!reportData?.result || !reportData?.columns) return null;

        if (filters.summarized_view) {
            return renderSummarizedTable();
        } else {
            return renderDetailedTable();
        }
    };

    // Render summarized view table
    const renderSummarizedTable = () => {
        return (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {reportData.columns.map((col: any, index: number) => (
                                    <th
                                        key={col.fieldname}
                                        className={cn(
                                            "px-4 py-3 text-left text-xs font-semibold text-gray-700",
                                            index === 0 && "sticky left-0 bg-gray-50 z-10",
                                            index === 1 && "sticky left-[135px] bg-gray-50 z-10"
                                        )}
                                        style={{ minWidth: col.width || 120 }}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reportData.result.map((row: any, rowIndex: number) => (
                                <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                                    {reportData.columns.map((col: any, colIndex: number) => (
                                        <td
                                            key={col.fieldname}
                                            className={cn(
                                                "px-4 py-3 text-sm",
                                                colIndex === 0 && "sticky left-0 bg-white font-medium text-gray-900",
                                                colIndex === 1 && "sticky left-[135px] bg-white text-gray-900",
                                                colIndex > 1 && "text-gray-600"
                                            )}
                                        >
                                            {col.fieldtype === 'Link' ? (
                                                <a
                                                    href={`/${col.options?.toLowerCase()}/${row[col.fieldname]}`}
                                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {row[col.fieldname] || '-'}
                                                </a>
                                            ) : col.fieldtype === 'Float' ? (
                                                <span className="font-mono">{row[col.fieldname] || '0.0'}</span>
                                            ) : (
                                                <span>{row[col.fieldname] || '-'}</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Render detailed view table with daily attendance
    const renderDetailedTable = () => {
        const dateColumns = reportData.columns.filter((col: any) => col.fieldname.includes('-'));
        const metaColumns = reportData.columns.filter((col: any) => !col.fieldname.includes('-'));

        return (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">#</th>
                                {metaColumns.map((col: any, index: number) => (
                                    <th
                                        key={col.fieldname}
                                        className={cn(
                                            "px-4 py-3 text-left text-xs font-semibold text-gray-700",
                                            index === 0 && "sticky left-12 bg-gray-50 z-10 min-w-[150px]",
                                            index === 1 && "min-w-[180px]"
                                        )}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                                {dateColumns.map((col: any) => (
                                    <th
                                        key={col.fieldname}
                                        className="px-2 py-3 text-center text-xs font-semibold text-gray-700 min-w-[50px]"
                                    >
                                        <div className="flex flex-col">
                                            <span>{col.label.replace(/(\d+)/, '$1')}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reportData.result.map((row: any, rowIndex: number) => (
                                <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-600 sticky left-0 bg-white">{rowIndex + 1}</td>
                                    {metaColumns.map((col: any, colIndex: number) => (
                                        <td
                                            key={col.fieldname}
                                            className={cn(
                                                "px-4 py-3 text-sm",
                                                colIndex === 0 && "sticky left-12 bg-white font-medium text-gray-900",
                                                colIndex > 0 && "text-gray-600"
                                            )}
                                        >
                                            {col.fieldtype === 'Link' ? (
                                                <a
                                                    href={`/${col.options?.toLowerCase()}/${row[col.fieldname]}`}
                                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {row[col.fieldname] || '-'}
                                                </a>
                                            ) : (
                                                <span>{row[col.fieldname] || '-'}</span>
                                            )}
                                        </td>
                                    ))}
                                    {dateColumns.map((col: any) => (
                                        <td key={col.fieldname} className="px-2 py-3 text-center">
                                            {row[col.fieldname] ? (
                                                <span
                                                    className={cn(
                                                        "inline-block px-2 py-1 text-xs font-bold rounded",
                                                        getStatusColor(row[col.fieldname])
                                                    )}
                                                >
                                                    {row[col.fieldname]}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            <div className="flex-1 overflow-y-auto">
                <StandardHeader
                    title="Monthly Attendance Sheet"
                    subtitle="View and analyze employee attendance records"
                    showBack={false}
                    actions={
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchReport}
                                disabled={loading}
                                className="h-9 text-xs border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400"
                            >
                                <RefreshCw className={cn("h-3.5 w-3.5 mr-2", loading && "animate-spin")} />
                                Refresh
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExport}
                                disabled={!reportData || loading}
                                className="h-9 text-xs border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download className="h-3.5 w-3.5 mr-2" />
                                Export
                            </Button>
                        </div>
                    }
                />

                <div className="p-6 mt-6 space-y-6">
                    {/* Filters Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Report Filters</h2>
                        </div>

                        {/* Validation Errors */}
                        {validationErrors.length > 0 && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <div className="font-semibold mb-1">Please fix the following errors:</div>
                                    <ul className="list-disc list-inside space-y-1">
                                        {validationErrors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {filterFields.map((field) => (
                                <DynamicFieldRenderer
                                    key={field.fieldname}
                                    field={field}
                                    value={filters[field.fieldname as keyof FilterConfig]}
                                    onChange={(value) => handleFieldChange(field, value)}
                                    readOnly={false}
                                />
                            ))}
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                {reportData && (
                                    <span>
                                        <FileText className="inline h-4 w-4 mr-1" />
                                        {reportData.result?.length || 0} records found
                                        {reportData.execution_time && (
                                            <span className="ml-2">• Execution time: {reportData.execution_time.toFixed(3)}s</span>
                                        )}
                                    </span>
                                )}
                            </div>
                            <Button
                                onClick={fetchReport}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white h-9 text-xs font-semibold"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <BarChart3 className="h-3.5 w-3.5 mr-2" />
                                        Generate Report
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Legend - Only show in detailed view */}
                    {reportData && !filters.summarized_view && (
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                                    <span className="text-sm font-medium">Present - P</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-red-500 rounded"></div>
                                    <span className="text-sm font-medium">Absent - A</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-orange-500 rounded"></div>
                                    <span className="text-sm font-medium">Half Day/Absent - HD/A</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-purple-500 rounded"></div>
                                    <span className="text-sm font-medium">Half Day/Present - HD/P</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-green-400 rounded"></div>
                                    <span className="text-sm font-medium">Work From Home - WFH</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-blue-500 rounded"></div>
                                    <span className="text-sm font-medium">On Leave - L</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-gray-500 rounded"></div>
                                    <span className="text-sm font-medium">Holiday - H</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-gray-400 rounded"></div>
                                    <span className="text-sm font-medium">Weekly Off - WO</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chart */}
                    {reportData?.chart?.data && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={prepareChartData()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            padding: '12px'
                                        }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="Absent"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        dot={{ fill: '#ef4444', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Present"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={{ fill: '#10b981', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Leave"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ fill: '#3b82f6', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Report Table */}
                    {renderTable()}

                    {/* Loading State */}
                    {loading && !reportData && (
                        <div className="flex justify-center items-center py-12 bg-white rounded-lg shadow-md">
                            <div className="text-center">
                                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                                <p className="text-gray-600">Generating report...</p>
                            </div>
                        </div>
                    )}

                    {/* Empty State - No Filters Set */}
                    {!loading && !reportData && !error && !filters.company && (
                        <div className="flex justify-center items-center py-16 bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300">
                            <div className="text-center max-w-md">
                                <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Filters Set</h3>
                                <p className="text-gray-600 mb-4">
                                    Please select required filters (Company, Month, Year) to generate the attendance report.
                                </p>
                                <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                                        <span>Company is required</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                                        <span>Month is required</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                                        <span>Year is required</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty State - Filters Set but No Data */}
                    {!loading && !reportData && !error && filters.company && (
                        <div className="flex justify-center items-center py-12 bg-white rounded-lg shadow-md">
                            <div className="text-center">
                                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 mb-2">No report data available</p>
                                <p className="text-sm text-gray-500">Click "Generate Report" to view attendance data</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MonthlyAttendanceReport;