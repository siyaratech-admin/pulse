/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from 'react';
import { useFrappeGetCall, useFrappeDeleteDoc } from 'frappe-react-sdk';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit, Loader2, Search, Filter, Download, LayoutGrid, List as ListIcon, Columns, RefreshCw, X, Upload, Check } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StandardHeader } from "@/components/common/StandardHeader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FilterCondition = {
    field: string
    operator: string
    value: any
}

interface GenericListProps {
    doctype: string;
    title?: string;
    listFields?: string[];
    columnLabels?: Record<string, string>;
}

// Searchable Field Selector Component
interface FieldSelectorProps {
    value: string;
    onChange: (value: string) => void;
    availableFields: any[];
}

const FieldSelector: React.FC<FieldSelectorProps> = ({ value, onChange, availableFields }) => {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFields = availableFields
        .filter((f: any) => !['Section Break', 'Column Break', 'Tab Break', 'Table'].includes(f.fieldtype))
        .filter((f: any) => {
            if (!searchQuery) return true;
            const label = (f.label || f.fieldname).toLowerCase();
            const fieldname = f.fieldname.toLowerCase();
            return label.includes(searchQuery.toLowerCase()) || fieldname.includes(searchQuery.toLowerCase());
        });

    const selectedField = availableFields.find((f: any) => f.fieldname === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="h-8 justify-between text-xs font-normal w-full"
                >
                    <span className="truncate">
                        {selectedField ? (selectedField.label || selectedField.fieldname) : "Select field..."}
                    </span>
                    <Filter className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder="Search fields..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        className="h-8 text-xs"
                    />
                    <CommandList>
                        <CommandEmpty className="py-6 text-xs text-center text-muted-foreground">
                            No field found.
                        </CommandEmpty>
                        <CommandGroup className="max-h-[250px] overflow-auto">
                            {filteredFields.map((field: any) => (
                                <CommandItem
                                    key={field.fieldname}
                                    value={field.fieldname}
                                    onSelect={() => {
                                        onChange(field.fieldname);
                                        setOpen(false);
                                        setSearchQuery('');
                                    }}
                                    className="text-xs"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-3 w-3",
                                            value === field.fieldname ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span className="truncate">{field.label || field.fieldname}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

// Individual Filter Row Component
interface FilterRowProps {
    filter: FilterCondition;
    index: number;
    availableFields: any[];
    onUpdate: (index: number, updates: Partial<FilterCondition>) => void;
    onRemove: (index: number) => void;
}

const FilterRow: React.FC<FilterRowProps> = ({
    filter,
    index,
    availableFields,
    onUpdate,
    onRemove
}) => {
    return (
        <div className="flex gap-2 items-center p-2.5 bg-muted/20 rounded-md border border-border/40">
            {/* Field Selection with Search */}
            <div className="flex-1 min-w-0">
                <FieldSelector
                    value={filter.field}
                    onChange={(value) => onUpdate(index, { field: value })}
                    availableFields={availableFields}
                />
            </div>

            {/* Operator Selection */}
            <div className="w-[130px]">
                <Select
                    value={filter.operator}
                    onValueChange={(value) => onUpdate(index, { operator: value })}
                >
                    <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                        <SelectItem value="=" className="text-xs">Equals</SelectItem>
                        <SelectItem value="!=" className="text-xs">Not Equals</SelectItem>
                        <SelectItem value="like" className="text-xs">Like</SelectItem>
                        <SelectItem value="not like" className="text-xs">Not Like</SelectItem>
                        <SelectItem value=">" className="text-xs">Greater Than</SelectItem>
                        <SelectItem value="<" className="text-xs">Less Than</SelectItem>
                        <SelectItem value=">=" className="text-xs">Greater or Equal</SelectItem>
                        <SelectItem value="<=" className="text-xs">Less or Equal</SelectItem>
                        <SelectItem value="in" className="text-xs">In</SelectItem>
                        <SelectItem value="not in" className="text-xs">Not In</SelectItem>
                        <SelectItem value="is" className="text-xs">Is</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Value Input */}
            <div className="flex-1 min-w-0">
                <Input
                    placeholder={
                        filter.operator === 'in' || filter.operator === 'not in'
                            ? "val1, val2, val3"
                            : "Enter value"
                    }
                    value={filter.value}
                    onChange={(e) => onUpdate(index, { value: e.target.value })}
                    className="h-8 text-xs"
                />
            </div>

            {/* Remove Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(index)}
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                title="Remove filter"
            >
                <X className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
};

const GenericList: React.FC<GenericListProps> = ({
    doctype,
    title,
    listFields = ['name', 'title', 'status', 'docstatus', 'modified'],
    columnLabels = {}
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<FilterCondition[]>([]);
    const [showFilterPopover, setShowFilterPopover] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterCondition[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

    // Sync columns
    useEffect(() => {
        let defaults = [...listFields];
        if (!defaults.includes('name')) defaults.unshift('name');
        if (visibleColumns.length === 0) setVisibleColumns(defaults);
    }, [listFields, visibleColumns.length]);

    // Reset page to 0 when filters or search change
    useEffect(() => {
        setPageIndex(0);
    }, [filters, searchTerm]);

    // Metadata for filters
    const { data: metaData } = useFrappeGetCall(
        'frappe.client.get',
        { doctype: 'DocType', name: doctype },
    );

    // Convert filters to Frappe format: [[field, operator, value], ...]
    const frappeFilters = useMemo(() => {
        const validFilters = filters.filter(f => f.field && f.value);
        if (validFilters.length === 0) return undefined;

        // Format: [[field, operator, value], ...]
        return validFilters.map(f => {
            let value = f.value;

            // Handle special operators
            if (f.operator === 'like' || f.operator === 'not like') {
                // Add wildcards for LIKE queries if not present
                if (!value.includes('%')) {
                    value = `%${value}%`;
                }
            } else if (f.operator === 'in' || f.operator === 'not in') {
                // Split comma-separated values for IN queries
                if (typeof value === 'string') {
                    value = value.split(',').map(v => v.trim());
                }
            }

            return [f.field, f.operator, value];
        });
    }, [filters]);

    // Data Fetching with Refresh (Mutate) Capability
    const { data, isLoading, error, mutate } = useFrappeGetCall(
        'frappe.client.get_list',
        {
            doctype: doctype,
            fields: ['*'],
            filters: frappeFilters,
            limit_start: pageIndex * pageSize,
            limit_page_length: pageSize,
            order_by: 'modified desc'
        },
        `${doctype}-list-${JSON.stringify(frappeFilters)}-${pageIndex}-${pageSize}`,
        {
            // Disable automatic refresh - we'll use mutate manually
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    const { deleteDoc, loading: deleteLoading } = useFrappeDeleteDoc();

    const handleDelete = async (name: string) => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                await deleteDoc(doctype, name);
                toast.success("Record deleted");
                mutate();
            } catch (e) {
                console.error("Failed to delete", e);
                toast.error("Delete failed");
            }
        }
    };

    const handleRowClick = (itemName: string) => {
        navigate(`${location.pathname}/${itemName}`);
    };

    const handleEditClick = (itemName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`${location.pathname}/${itemName}`);
    };

    const filteredData = useMemo(() => {
        const items = data?.message || []
        if (!searchTerm) return items
        return items.filter((item: any) =>
            Object.values(item).some((val: any) => {
                if (val === null || val === undefined) return false
                return String(val).toLowerCase().includes(searchTerm.toLowerCase())
            })
        )
    }, [data?.message, searchTerm])

    const formatCellValue = (value: any, field: string) => {
        if (value === null || value === undefined) return '-';

        if (field === 'status' || field === 'workflow_state') {
            const status = String(value);
            let colorClass = "bg-gray-100 text-gray-700 border-gray-200";
            if (['Submitted', 'Active', 'Enabled', 'Paid', 'Completed', 'Approved'].includes(status))
                colorClass = "bg-green-50 text-green-700 border-green-200";
            else if (['Cancelled', 'Rejected', 'Overdue', 'Unpaid', 'Error'].includes(status))
                colorClass = "bg-red-50 text-red-700 border-red-200";
            return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>{status}</span>;
        }

        if (field === 'docstatus') {
            const statusLabel = value === 0 ? "Draft" : value === 1 ? "Submitted" : "Cancelled";
            const colorClass = value === 0 ? "bg-gray-100 text-gray-700 border-gray-200" :
                value === 1 ? "bg-green-50 text-green-700 border-green-200" :
                    "bg-red-50 text-red-700 border-red-200";
            return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>{statusLabel}</span>;
        }

        return String(value);
    };

    const availableFields = metaData?.message?.fields?.map((field: any) => ({
        fieldname: field.fieldname,
        label: field.label || field.fieldname,
        fieldtype: field.fieldtype,
    })) || [];

    const hasNextPage = filteredData.length === pageSize;

    const columnsToRender = useMemo(() => {
        const cols = viewMode === 'list' ? listFields : visibleColumns;
        return ['name', ...cols.filter(c => c !== 'name')];
    }, [viewMode, listFields, visibleColumns]);

    // Filter management functions
    const openFilterPopover = () => {
        setTempFilters([...filters]);
        setShowFilterPopover(true);
    };

    const addTempFilter = () => {
        setTempFilters([...tempFilters, { field: '', operator: '=', value: '' }]);
    };

    const removeTempFilter = (index: number) => {
        setTempFilters(tempFilters.filter((_, i) => i !== index));
    };

    const updateTempFilter = (index: number, updates: Partial<FilterCondition>) => {
        const newFilters = [...tempFilters];
        newFilters[index] = { ...newFilters[index], ...updates };
        setTempFilters(newFilters);
    };

    const applyFilters = () => {
        // Only apply filters that have all fields filled
        const validFilters = tempFilters.filter(f => f.field && f.operator && f.value);
        setFilters(validFilters);
        setShowFilterPopover(false);
        toast.success(`${validFilters.length} filter${validFilters.length !== 1 ? 's' : ''} applied`);
    };

    const clearAllFilters = () => {
        setFilters([]);
        setTempFilters([]);
        setShowFilterPopover(false);
        toast.success("All filters cleared");
    };

    return (
        <div className="flex flex-col min-h-full bg-background">
            {/* ========== HEADER WITH PROPER SPACING ========== */}
            <StandardHeader
                title={title || doctype}
                subtitle={`Manage your ${title?.toLowerCase() || doctype.toLowerCase()} records`}
                showBack={true}
                actions={
                    <div className="flex items-center gap-3">
                        {/* Refresh Button */}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => mutate()}
                            className="h-10 w-10 border-border/60 bg-white text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
                            title="Refresh Data"
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>

                        <Button
                            onClick={() => navigate(`/bulk-data-import/new?doctype=${doctype}`)}
                            variant="outline"
                            className="h-10 px-4 text-sm font-semibold border-border/60 bg-white text-slate-700 hover:bg-slate-50 shadow-sm transition-all duration-300"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Import
                        </Button>

                        {/* New Record Button */}
                        <Button
                            onClick={() => navigate(`${location.pathname}/new`)}
                            className="h-10 px-4 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-300"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New {title || doctype}
                        </Button>
                    </div>
                }
            />

            {/* ========== MAIN CONTENT WITH PROPER MARGINS ========== */}
            <div className="p-6 mt-4 max-w-[1600px] mx-auto w-full space-y-6">
                <Card className="border-border/60 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                                    <ListIcon className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-lg font-semibold">All Records</CardTitle>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                                {/* Search Input */}
                                <div className="relative flex-1 md:w-72 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                                    <Input
                                        placeholder="Search records..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-10 h-10 bg-background/50 border-border/60 focus:bg-background transition-all"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            title="Clear search"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                {/* View Mode Toggle */}
                                <div className="flex items-center border border-border/60 rounded-md bg-background/50 overflow-hidden">
                                    <Button
                                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        className="px-3 rounded-none h-10"
                                        onClick={() => setViewMode('list')}
                                        title="List View"
                                    >
                                        <ListIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        className="px-3 rounded-none h-10"
                                        onClick={() => setViewMode('grid')}
                                        title="Grid View"
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Column Selector - Only show in grid view */}
                                {viewMode === 'grid' && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            {/* <Button variant="outline" size="sm" className="border-border/60 h-10 px-4">
                                                <Columns className="h-4 w-4 mr-2" />
                                                Columns
                                            </Button> */}
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <ScrollArea className="h-72">
                                                {availableFields.map((field: any) => (
                                                    <DropdownMenuCheckboxItem
                                                        key={field.fieldname}
                                                        checked={visibleColumns.includes(field.fieldname)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked)
                                                                setVisibleColumns([...visibleColumns, field.fieldname]);
                                                            else
                                                                setVisibleColumns(visibleColumns.filter((col) => col !== field.fieldname));
                                                        }}
                                                    >
                                                        {field.label}
                                                    </DropdownMenuCheckboxItem>
                                                ))}
                                            </ScrollArea>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}

                                {/* Filters Button with Popover */}
                                <Popover open={showFilterPopover} onOpenChange={setShowFilterPopover}>
                                    <PopoverTrigger asChild>
                                        <div className="relative">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-10 px-4 border-border/60 ${filters.length > 0 ? "bg-primary/10 text-primary border-primary/20" : ""}`}
                                                onClick={openFilterPopover}
                                            >
                                                <Filter className="h-4 w-4 mr-2" />
                                                Add Filters
                                                {filters.length > 0 && (
                                                    <span className="ml-2 px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-xs font-bold">
                                                        {filters.length}
                                                    </span>
                                                )}
                                            </Button>
                                            {filters.length > 0 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        clearAllFilters();
                                                    }}
                                                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm z-10"
                                                    title="Clear all filters"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-[650px] p-0"
                                        align="end"
                                        side="bottom"
                                        sideOffset={8}
                                    >
                                        <div className="flex flex-col h-full">
                                            {/* Header */}
                                            <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-sm font-semibold flex items-center gap-2">
                                                            <Filter className="h-4 w-4 text-primary" />
                                                            Add Filters
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            Filter {doctype} records by specific criteria
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => setShowFilterPopover(false)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Filter List - FIXED HEIGHT WITH SCROLL */}
                                            <div className="overflow-y-auto max-h-[400px] flex-1">
                                                <div className="px-4 py-3 space-y-2.5">
                                                    {tempFilters.length === 0 ? (
                                                        <div className="text-center py-8 text-muted-foreground">
                                                            <Filter className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                                            <p className="text-xs">No filters added yet</p>
                                                            <p className="text-xs text-muted-foreground/60 mt-1">Click "Add a Filter" below to start</p>
                                                        </div>
                                                    ) : (
                                                        tempFilters.map((filter, index) => (
                                                            <FilterRow
                                                                key={index}
                                                                filter={filter}
                                                                index={index}
                                                                availableFields={availableFields}
                                                                onUpdate={updateTempFilter}
                                                                onRemove={removeTempFilter}
                                                            />
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            {/* Footer - FIXED AT BOTTOM */}
                                            <div className="px-4 py-3 border-t bg-muted/20 flex items-center justify-between gap-2 flex-shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={addTempFilter}
                                                    className="text-xs h-8"
                                                >
                                                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                                                    Add a Filter
                                                </Button>

                                                <div className="flex gap-2">
                                                    {tempFilters.length > 0 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setTempFilters([])}
                                                            className="text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            Clear All
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setShowFilterPopover(false)}
                                                        className="text-xs h-8"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={applyFilters}
                                                        size="sm"
                                                        className="text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                                                    >
                                                        Apply Filters
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                {/* Export Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-10 px-4 border-border/60"
                                    onClick={() => navigate(`/data-export?doctype=${doctype}`)}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {error && (
                            <div className="p-6">
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        Error fetching data: {error.message}
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Search className="h-14 w-14 text-muted-foreground/30 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No records found</h3>
                                <p className="text-sm text-muted-foreground max-w-md">
                                    {searchTerm
                                        ? `No results for "${searchTerm}". Try a different search term.`
                                        : 'Try adjusting your filters or search term.'}
                                </p>
                                {searchTerm && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSearchTerm('')}
                                        className="mt-4"
                                    >
                                        Clear Search
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="relative w-full overflow-auto">
                                {searchTerm && (
                                    <div className="px-6 py-3 bg-primary/10 border-b border-primary/20">
                                        <p className="text-sm text-primary">
                                            <span className="font-semibold">{filteredData.length}</span> result{filteredData.length !== 1 ? 's' : ''} found for "{searchTerm}"
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="ml-2 text-primary hover:text-primary/80 underline"
                                            >
                                                Clear
                                            </button>
                                        </p>
                                    </div>
                                )}

                                {/* List View */}
                                {viewMode === 'list' && (
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow className="border-b border-border/60">
                                                {columnsToRender.map(field => (
                                                    <TableHead
                                                        key={field}
                                                        className="h-12 font-semibold text-muted-foreground uppercase text-xs tracking-wider pl-6"
                                                    >
                                                        {columnLabels[field] || field.replace(/_/g, ' ')}
                                                    </TableHead>
                                                ))}
                                                <TableHead className="text-right pr-6">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredData.map((item: any) => (
                                                <TableRow
                                                    key={item.name}
                                                    onClick={() => handleRowClick(item.name)}
                                                    className="cursor-pointer hover:bg-muted/40 transition-colors border-b border-border/40 group"
                                                >
                                                    {columnsToRender.map(field => (
                                                        <TableCell key={field} className="py-4 pl-6 text-sm text-foreground/80">
                                                            {formatCellValue(item[field], field)}
                                                        </TableCell>
                                                    ))}
                                                    <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 text-primary hover:bg-primary/10"
                                                                onClick={(e) => handleEditClick(item.name, e)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 text-red-600 hover:bg-red-50"
                                                                onClick={() => handleDelete(item.name)}
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
                                )}

                                {/* Grid View */}
                                {viewMode === 'grid' && (
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {filteredData.map((item: any) => (
                                                <Card
                                                    key={item.name}
                                                    className="cursor-pointer hover:shadow-md transition-all duration-200 border-border/60 hover:border-primary/40"
                                                    onClick={() => handleRowClick(item.name)}
                                                >
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-sm font-semibold truncate">
                                                            {item.name}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-2">
                                                        {listFields.slice(1).map(field => (
                                                            <div key={field} className="flex justify-between items-start gap-2">
                                                                <span className="text-xs text-muted-foreground uppercase">
                                                                    {columnLabels[field] || field.replace(/_/g, ' ')}:
                                                                </span>
                                                                <span className="text-xs font-medium text-right truncate">
                                                                    {formatCellValue(item[field], field)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        <div className="flex gap-2 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="flex-1 text-xs h-8"
                                                                onClick={(e) => handleEditClick(item.name, e)}
                                                            >
                                                                <Edit className="h-3 w-3 mr-1" />
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="flex-1 text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleDelete(item.name)}
                                                                disabled={deleteLoading}
                                                            >
                                                                <Trash2 className="h-3 w-3 mr-1" />
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pagination Footer */}
                        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/5">
                            <div className="text-sm text-muted-foreground">
                                Showing {filteredData.length} records • Page {pageIndex + 1}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPageIndex(p => Math.max(0, p - 1))}
                                    disabled={pageIndex === 0 || isLoading}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPageIndex(p => p + 1)}
                                    disabled={!hasNextPage || isLoading}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default GenericList;