/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { useFrappeGetCall, useFrappeDeleteDoc, useFrappeAuth, useFrappeGetDocList } from 'frappe-react-sdk';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Plus, Trash2, Edit, Loader2, Search, Filter,
    Download, List as ListIcon, LayoutGrid, Columns, RefreshCw
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import FilterBuilder, { type FilterCondition } from '@/components/common/FilterBuilder';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StandardHeader } from "@/components/common/StandardHeader";

const LeaveApplicationList = () => {
    const navigate = useNavigate();
    const { currentUser } = useFrappeAuth();

    const doctype = 'Leave Application';
    const title = 'Leave Applications';

    const listFields = ['name', 'leave_type', 'from_date', 'to_date', 'total_leave_days', 'docstatus'];

    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<FilterCondition[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'report'>('list');
    const [visibleColumns, setVisibleColumns] = useState<string[]>(listFields);

    // 1. Fetch Employee Info to ensure we filter by Employee Link, not just 'owner'
    // This solves the issue where "Open" applications were hidden in your screenshot
    const { data: employeeList } = useFrappeGetDocList('Employee', {
        filters: [['user_id', '=', currentUser || ""]],
        fields: ['name']
    });
    const employeeData = employeeList?.[0];

    // 2. Fetch MetaData for dynamic columns/filters
    const { data: metaData } = useFrappeGetCall('frappe.client.get', {
        doctype: 'DocType',
        name: doctype,
    });

    // 3. Memoized Filter Builder
    const frappeFilters = useMemo(() => {
        const baseFilters: any[] = filters
            .filter(f => f.field && f.value)
            .map(f => [f.field, f.operator, f.value]);

        // If not Admin, ensure user sees records where they are the employee
        if (currentUser !== 'Administrator' && employeeData?.name) {
            baseFilters.push(['employee', '=', employeeData.name]);
        }
        return baseFilters;
    }, [filters, currentUser, employeeData]);

    // 4. Dynamic Data Fetching
    // We use a dynamic cache key stringifying the filters so the SDK auto-refetches on change
    const { data, isLoading, error, mutate } = useFrappeGetCall('frappe.client.get_list', {
        doctype: doctype,
        fields: ['*'],
        filters: frappeFilters,
        limit_page_length: 50,
        order_by: 'creation desc'
    }, `leave-list-${JSON.stringify(frappeFilters)}`);

    const { deleteDoc, loading: deleteLoading } = useFrappeDeleteDoc();

    const handleDelete = async (name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                await deleteDoc(doctype, name);
                // Dynamic Sync: Tell the SDK to re-validate the list immediately
                mutate();
            } catch (e) {
                console.error("Failed to delete", e);
            }
        }
    };

    const filteredData = useMemo(() => {
        return data?.message?.filter((item: any) =>
            Object.values(item).some((val: any) =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        ) || [];
    }, [data, searchTerm]);

    const formatCellValue = (value: any, field: string) => {
        if (value === null || value === undefined) return '-';
        if (field === 'status') {
            const status = String(value);
            let colorClass = "bg-gray-100 text-gray-700 border-gray-200";
            if (status === 'Approved') colorClass = "bg-green-50 text-green-700 border-green-200";
            else if (status === 'Rejected' || status === 'Cancelled') colorClass = "bg-red-50 text-red-700 border-red-200";
            else if (status === 'Open') colorClass = "bg-orange-50 text-orange-700 border-orange-200";

            return (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
                    {status}
                </span>
            );
        }
        if (field === 'docstatus') {
            const label = value === 0 ? "Draft" : value === 1 ? "Submitted" : "Cancelled";
            const color = value === 0 ? "bg-slate-100" : value === 1 ? "bg-primary/10 text-primary" : "bg-red-50 text-red-700";
            return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${color}`}>{label}</span>;
        }
        return String(value);
    };

    const availableFields = metaData?.message?.fields?.map((field: any) => ({
        fieldname: field.fieldname,
        label: field.label || field.fieldname,
        fieldtype: field.fieldtype,
    })) || [];

    return (
        <div className="min-h-screen bg-background">
            <StandardHeader
                title={title}
                subtitle="View and manage your leave requests"
                showBack={true}
                actions={
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => mutate()}
                            className="h-9 w-9 border-border/60 text-primary bg-white hover:bg-primary/10"
                            title="Refresh Data"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                            onClick={() => navigate(`/hrms/leave-applications/new`)}
                            className="h-9 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            <Plus className="h-3.5 w-3.5 mr-2" /> New Application
                        </Button>
                    </div>
                }
            />

            <div className="p-6 mt-6 max-w-[1600px] mx-auto space-y-6">
                <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <CardTitle className="text-base font-medium">Leave History</CardTitle>

                            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                                <div className="relative flex-1 md:w-64 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                                    <Input
                                        placeholder="Search leaves..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 bg-background/50 h-9"
                                    />
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`h-9 border-border/60 ${showFilters ? "bg-primary/10 text-primary border-primary/20" : ""}`}
                                >
                                    <Filter className="h-4 w-4 mr-2" /> Filters {filters.length > 0 && `(${filters.length})`}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {showFilters && (
                            <div className="p-4 border-b border-border/40 bg-muted/30 animate-in slide-in-from-top-1 duration-200">
                                <FilterBuilder fields={availableFields} filters={filters} onFiltersChange={setFilters} />
                            </div>
                        )}

                        {error && (
                            <div className="p-6">
                                <Alert variant="destructive"><AlertDescription>Error: {error.message}</AlertDescription></Alert>
                            </div>
                        )}

                        {isLoading && !data ? (
                            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : (
                            <div className="relative w-full overflow-auto">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow className="hover:bg-transparent border-b border-border/60">
                                            {(viewMode === 'list' ? listFields : visibleColumns).map(field => (
                                                <TableHead key={field} className="h-10 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider pl-6">
                                                    {field.replace(/_/g, ' ')}
                                                </TableHead>
                                            ))}
                                            <TableHead className="h-10 w-[100px] text-right pr-6">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredData.map((item: any) => (
                                            <TableRow
                                                key={item.name}
                                                onClick={() => navigate(`/hrms/leave-applications/${item.name}`)}
                                                className="cursor-pointer hover:bg-muted/40 transition-colors border-b border-border/40 last:border-0"
                                            >
                                                {(viewMode === 'list' ? listFields : visibleColumns).map(field => (
                                                    <TableCell key={field} className="py-3 pl-6 font-medium text-sm text-foreground/80">
                                                        {formatCellValue(item[field], field)}
                                                    </TableCell>
                                                ))}
                                                <TableCell className="py-3 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-primary hover:bg-primary/10"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/hrms/leave-applications/${item.name}`, { state: { readOnly: false } })
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                                                            onClick={(e) => handleDelete(item.name, e)}
                                                            disabled={deleteLoading}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LeaveApplicationList;