/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Edit,
  Trash2,
  Eye,
  Download,
  Archive,
  MoreVertical,
  AlertCircle,
} from 'lucide-react';

// TypeScript interfaces for dynamic table
export interface ColumnConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'badge' | 'progress' | 'boolean' | 'actions';
  sticky?: boolean;
  stickyLeft?: number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  variant?: string;
  required?: boolean;
  validate?: (value: any, item: any) => string | null;
}

export interface FieldError {
  rowId: string;
  field: string;
  message: string;
}

export interface DynamicTableProps {
  data: any[];
  stickyFields?: string[];
  excludeFields?: string[];
  caption?: string;
  isLoading?: boolean;
  showActions?: boolean;
  showSelection?: boolean;
  showBulkActions?: boolean;
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onBulkDelete?: (selectedIds: string[]) => void;
  onBulkExport?: (selectedIds: string[]) => void;
  onBulkArchive?: (selectedIds: string[]) => void;
  customRenderers?: Record<string, (value: any, item: any) => React.ReactNode>;
  badgeVariants?: Record<string, Record<string, string>>;

  // Error handling props
  errors?: FieldError[];
  validationRules?: Record<string, (value: any, item: any) => string | null>;
  onErrorsChange?: (errors: FieldError[]) => void;

  // Pagination properties
  showPagination?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

// Helper functions
export const formatFieldLabel = (fieldName: string): string => {
  return fieldName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getFieldType = (
  fieldName: string,
  value: any
): ColumnConfig['type'] => {
  const fieldTypeMap: Record<string, ColumnConfig['type']> = {
    status: 'badge',
    project_type: 'badge',
    priority: 'badge',
    is_active: 'boolean',
    percent_completed: 'progress',
    percent_complete: 'progress',
  };

  if (fieldTypeMap[fieldName]) {
    return fieldTypeMap[fieldName];
  }

  if (fieldName.includes('date') || fieldName.includes('time')) {
    return 'date';
  }

  if (
    typeof value === 'number' ||
    fieldName.includes('percent') ||
    fieldName.includes('amount') ||
    fieldName.includes('cost')
  ) {
    return 'number';
  }

  return 'text';
};

export const generateColumnsFromData = (
  data: any[],
  stickyFields: string[] = [],
  excludeFields: string[] = [
    'docstatus',
    'idx',
    'modified',
    'modified_by',
    'owner',
    'creation',
  ],
  showSelection: boolean = false,
  showActions: boolean = false
): ColumnConfig[] => {
  if (!data || data.length === 0) return [];

  const firstItem = data[0];
  const columns: ColumnConfig[] = [];
  let currentStickyLeft = 0;

  if (showSelection) {
    columns.push({
      key: 'selection',
      label: '',
      type: 'actions',
      sticky: true,
      stickyLeft: currentStickyLeft,
      minWidth: 50,
      align: 'center',
    });
    currentStickyLeft += 50;
  }

  if (showActions) {
    columns.push({
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      sticky: true,
      stickyLeft: currentStickyLeft,
      minWidth: 60,
      align: 'center',
    });
    currentStickyLeft += 60;
  }

  const allFields = Object.keys(firstItem).filter(
    field => !excludeFields.includes(field)
  );
  const dataFieldsOnly = allFields.filter(
    field => !['selection', 'actions'].includes(field)
  );

  const orderedFields = [
    ...stickyFields.filter(field => dataFieldsOnly.includes(field)),
    ...dataFieldsOnly.filter(field => !stickyFields.includes(field)),
  ];

  orderedFields.forEach(fieldName => {
    const isSticky = stickyFields.includes(fieldName);
    const fieldType = getFieldType(fieldName, firstItem[fieldName]);

    const column: ColumnConfig = {
      key: fieldName,
      label: formatFieldLabel(fieldName),
      type: fieldType,
      sticky: isSticky,
      stickyLeft: isSticky ? currentStickyLeft : undefined,
      minWidth: getMinWidthForField(fieldName, fieldType),
      align: getAlignmentForField(fieldType),
    };

    if (isSticky) {
      currentStickyLeft += column.minWidth || 120;
    }

    columns.push(column);
  });

  return columns;
};

export const getMinWidthForField = (
  fieldName: string,
  type: ColumnConfig['type']
): number => {
  const widthMap: Record<string, number> = {
    name: 120,
    project_name: 200,
    status: 100,
    project_type: 120,
    is_active: 100,
    percent_complete_method: 150,
    percent_completed: 120,
    expected_start_date: 130,
    expected_end_date: 130,
    priority: 100,
    department: 120,
    actions: 100,
  };

  return widthMap[fieldName] || (type === 'text' ? 120 : 100);
};

export const getAlignmentForField = (
  type: ColumnConfig['type']
): ColumnConfig['align'] => {
  switch (type) {
    case 'number':
    case 'progress':
    case 'boolean':
    case 'actions':
      return 'center';
    default:
      return 'left';
  }
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const defaultBadgeVariants = {
  status: {
    open: 'default',
    active: 'default',
    completed: 'secondary',
    closed: 'secondary',
    cancelled: 'destructive',
  },
  priority: {
    critical: 'destructive',
    urgent: 'destructive',
    high: 'destructive',
    medium: 'secondary',
    low: 'outline',
  },
  project_type: {
    internal: 'secondary',
    external: 'outline',
  },
};

export const renderCellContent = (
  value: any,
  column: ColumnConfig,
  item: any,
  customRenderers?: Record<string, (value: any, item: any) => React.ReactNode>,
  badgeVariants?: Record<string, Record<string, string>>,
  onView?: (item: any) => void,
  onEdit?: (item: any) => void,
  onDelete?: (item: any) => void,
  isSelected?: boolean,
  onSelectionChange?: (id: string, checked: boolean) => void,
  error?: string | null
) => {
  if (column.key === 'selection') {
    const itemId = item.name || item.id || '';
    return (
      <Checkbox
        checked={isSelected || false}
        onCheckedChange={checked => {
          onSelectionChange?.(itemId, Boolean(checked));
        }}
      />
    );
  }

  if (column.key === 'actions') {
    const itemId = item.name || item.id || '';
    return (
      <div className="flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 touch-manipulation hover:bg-muted"
              onClick={e => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[160px] touch-manipulation"
            sideOffset={5}
          >
            {onView && (
              <DropdownMenuItem
                className="cursor-pointer touch-manipulation min-h-[44px] flex items-center"
                onClick={e => {
                  e.stopPropagation();
                  onView(item);
                }}
              >
                <Eye className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">View</span>
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem
                className="cursor-pointer touch-manipulation min-h-[44px] flex items-center"
                onClick={e => {
                  e.stopPropagation();
                  onEdit(item);
                }}
              >
                <Edit className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Edit</span>
              </DropdownMenuItem>
            )}
            {(onView || onEdit) && onDelete && <DropdownMenuSeparator />}
            {onDelete && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer touch-manipulation min-h-[44px] flex items-center"
                onClick={e => {
                  e.stopPropagation();
                  onDelete(item);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Delete</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  if (customRenderers && customRenderers[column.key]) {
    return customRenderers[column.key](value, item);
  }

  if (value === null || value === undefined) {
    return '-';
  }

  const content = (() => {
    switch (column.type) {
      case 'badge':
        const variants = badgeVariants || defaultBadgeVariants;
        const fieldVariants = (variants as any)[column.key] || {};
        const variant = fieldVariants[value?.toLowerCase()] || 'outline';
        return <Badge variant={variant as any}>{value}</Badge>;

      case 'boolean':
        const isActive = value === 1 || value === true;
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );

      case 'progress':
        const percentage = typeof value === 'number' ? value : 0;
        return (
          <div className="space-y-1 w-full max-w-[100px]">
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-center block">
              {percentage}%
            </span>
          </div>
        );

      case 'date':
        return <span className="text-sm">{formatDate(value)}</span>;

      case 'number':
        return (
          <span className="text-sm font-mono">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
        );

      default:
        return <span className="text-sm">{String(value)}</span>;
    }
  })();

  if (error) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          {content}
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
        </div>
        <p className="text-xs text-destructive">{error}</p>
      </div>
    );
  }

  return content;
};

const EMPTY_ARRAY: any[] = [];
const DEFAULT_EXCLUDE_FIELDS = [
  'docstatus',
  'idx',
  'modified',
  'modified_by',
  'owner',
  'creation',
];
const EMPTY_OBJECT = {};

// Main Dynamic Table Component
export const DynamicTable: React.FC<DynamicTableProps> = ({
  data,
  stickyFields = EMPTY_ARRAY,
  excludeFields = DEFAULT_EXCLUDE_FIELDS,
  caption,
  isLoading = false,
  showActions = true,
  showSelection = true,
  showBulkActions = true,
  onView,
  onEdit,
  onDelete,
  onBulkDelete,
  onBulkExport,
  onBulkArchive,
  customRenderers,
  badgeVariants,

  // Error props
  errors = EMPTY_ARRAY,
  validationRules = EMPTY_OBJECT,
  onErrorsChange,

  // Pagination props
  showPagination = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [internalErrors, setInternalErrors] = useState<FieldError[]>(errors);
  const tableRef = useRef<HTMLDivElement>(null);
  const errorRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());

  // Update internal errors when external errors change
  useEffect(() => {
    setInternalErrors(errors);
  }, [errors]);

  // Validate data on mount and when data/validation rules change
  useEffect(() => {
    if (Object.keys(validationRules).length > 0) {
      validateAllFields();
    }
  }, [data, validationRules]);

  const allItemIds = useMemo(
    () => data.map(item => item.name || item.id || '').filter(id => id),
    [data]
  );

  // Validate all fields
  const validateAllFields = () => {
    const newErrors: FieldError[] = [];

    data.forEach(item => {
      const itemId = item.name || item.id || '';

      Object.keys(validationRules).forEach(field => {
        const value = item[field];
        const rule = (validationRules as Record<string, (value: any, item: any) => string | null>)[field];
        const errorMessage = rule ? rule(value, item) : null;

        if (errorMessage) {
          newErrors.push({
            rowId: itemId,
            field,
            message: errorMessage,
          });
        }
      });
    });

    setInternalErrors(newErrors);
    onErrorsChange?.(newErrors);
  };

  // Get error for specific field
  const getFieldError = (rowId: string, field: string): string | null => {
    const error = internalErrors.find(
      err => err.rowId === rowId && err.field === field
    );
    return error ? error.message : null;
  };

  // Check if row has any errors
  const hasRowError = (rowId: string): boolean => {
    return internalErrors.some(err => err.rowId === rowId);
  };

  // Scroll to first error
  const scrollToFirstError = () => {
    if (internalErrors.length === 0) return;

    const firstError = internalErrors[0];
    const errorRow = errorRefs.current.get(firstError.rowId);

    if (errorRow && tableRef.current) {
      errorRow.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Add highlight animation
      errorRow.classList.add('bg-destructive/10');
      setTimeout(() => {
        errorRow.classList.remove('bg-destructive/10');
      }, 2000);
    }
  };

  const handleSelectionChange = (id: string, checked: boolean) => {
    const newSelectedItems = new Set(selectedItems);
    if (checked) {
      newSelectedItems.add(id);
    } else {
      newSelectedItems.delete(id);
    }
    setSelectedItems(newSelectedItems);
    setSelectAll(
      newSelectedItems.size === allItemIds.length && allItemIds.length > 0
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(allItemIds));
      setSelectAll(true);
    } else {
      setSelectedItems(new Set());
      setSelectAll(false);
    }
  };

  const handleBulkAction = (action: 'delete' | 'export' | 'archive') => {
    const selectedIds = Array.from(selectedItems);

    switch (action) {
      case 'delete':
        onBulkDelete?.(selectedIds);
        break;
      case 'export':
        onBulkExport?.(selectedIds);
        break;
      case 'archive':
        onBulkArchive?.(selectedIds);
        break;
    }

    setSelectedItems(new Set());
    setSelectAll(false);
  };

  const columns = useMemo(() => {
    return generateColumnsFromData(
      data,
      stickyFields,
      excludeFields,
      showSelection,
      showActions
    );
  }, [data, stickyFields, excludeFields, showSelection, showActions]);

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          {isLoading ? 'Loading data...' : 'No data available'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Error Summary */}
      {internalErrors.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-destructive mb-1">
              {internalErrors.length} Validation Error{internalErrors.length > 1 ? 's' : ''}
            </h4>
            <p className="text-sm text-destructive/90 mb-2">
              Please fix the highlighted errors before proceeding.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={scrollToFirstError}
              className="border-destructive/30 text-destructive hover:bg-destructive/20"
            >
              Go to First Error
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {showSelection && selectedItems.size > 0 && showBulkActions && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedItems.size} item{selectedItems.size === 1 ? '' : 's'}{' '}
            selected
          </span>
          <div className="flex items-center gap-1 w-full sm:w-auto sm:ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('export')}
              className="flex-1 sm:flex-none flex items-center justify-center"
            >
              <Download className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline ml-1">Export</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('archive')}
              className="flex-1 sm:flex-none flex items-center justify-center"
            >
              <Archive className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline ml-1">Archive</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkAction('delete')}
              className="flex-1 sm:flex-none flex items-center justify-center"
            >
              <Trash2 className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline ml-1">Delete</span>
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div ref={tableRef} className="overflow-x-auto border rounded-md">
        <Table className="min-w-full border-collapse border border-gray-200">
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              {columns.map(column => (
                <TableHead
                  key={column.key}
                  className={`${column.sticky
                    ? 'sticky left-0 bg-white border-l border-r border-gray-200 z-30'
                    : 'border-r border-gray-200'
                    } ${column.align === 'center'
                      ? 'text-center'
                      : column.align === 'right'
                        ? 'text-right'
                        : ''
                    } ${column.key === 'actions' ? 'w-[60px] text-center' : ''
                    } ${column.key === 'name' || column.key === 'project_name'
                      ? 'min-w-[200px] max-w-[300px]'
                      : ''
                    }`}
                  style={{
                    ...(column.sticky && column.stickyLeft !== undefined
                      ? { left: `${column.stickyLeft}px` }
                      : {}),
                    ...(column.minWidth
                      ? { minWidth: `${column.minWidth}px` }
                      : {}),
                  }}
                >
                  {column.key === 'selection' ? (
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                    />
                  ) : column.key === 'actions' ? (
                    <span className="hidden sm:inline">Actions</span>
                  ) : (
                    <span className="truncate">{column.label}</span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => {
              const itemId = item.name || item.id || '';
              const rowHasError = hasRowError(itemId);

              return (
                <TableRow
                  key={itemId || index}
                  ref={el => {
                    if (el && rowHasError) {
                      errorRefs.current.set(itemId, el);
                    }
                  }}
                  className={`hover:bg-muted/50 border-b border-gray-200 transition-colors ${rowHasError ? 'bg-destructive/5' : ''
                    }`}
                >
                  {columns.map(column => {
                    const fieldError = getFieldError(itemId, column.key);

                    return (
                      <TableCell
                        key={column.key}
                        className={`${column.sticky
                          ? 'sticky left-0 bg-white border-l border-r border-gray-200 z-20'
                          : 'border-r border-gray-200'
                          } ${column.align === 'center'
                            ? 'text-center'
                            : column.align === 'right'
                              ? 'text-right'
                              : ''
                          } ${column.key === 'name' ||
                            column.key === 'project_name' ||
                            column.key === 'item_name'
                            ? 'font-medium'
                            : ''
                          } ${column.key === 'actions' ? 'w-[60px] text-center' : ''
                          } ${column.key === 'name' || column.key === 'project_name'
                            ? 'max-w-[300px]'
                            : ''
                          } ${rowHasError && fieldError ? 'bg-destructive/5' : ''}`}
                        style={
                          column.sticky && column.stickyLeft !== undefined
                            ? { left: `${column.stickyLeft}px` }
                            : undefined
                        }
                      >
                        <div className="truncate">
                          {renderCellContent(
                            item[column.key],
                            column,
                            item,
                            customRenderers,
                            badgeVariants,
                            onView,
                            onEdit,
                            onDelete,
                            selectedItems.has(itemId),
                            handleSelectionChange,
                            fieldError
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{' '}
              entries
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Rows per page:
              </span>
              <Select
                value={pageSize.toString()}
                onValueChange={value => onPageSizeChange?.(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map(size => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      if (currentPage > 1) {
                        onPageChange?.(currentPage - 1);
                      }
                    }}
                    className={
                      currentPage <= 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {(() => {
                  const totalPages = Math.ceil(totalItems / pageSize);
                  const pages: React.ReactNode[] = [];
                  let startPage = Math.max(1, currentPage - 2);
                  let endPage = Math.min(totalPages, currentPage + 2);

                  if (endPage - startPage < 4) {
                    if (startPage === 1) {
                      endPage = Math.min(totalPages, startPage + 4);
                    } else {
                      startPage = Math.max(1, endPage - 4);
                    }
                  }

                  if (startPage > 1) {
                    pages.push(
                      <PaginationItem key={1}>
                        <PaginationLink
                          href="#"
                          onClick={e => {
                            e.preventDefault();
                            onPageChange?.(1);
                          }}
                          className="cursor-pointer"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                    );

                    if (startPage > 2) {
                      pages.push(
                        <PaginationItem key="ellipsis-start">
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === i}
                          onClick={e => {
                            e.preventDefault();
                            onPageChange?.(i);
                          }}
                          className="cursor-pointer"
                        >
                          {i}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }

                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <PaginationItem key="ellipsis-end">
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    pages.push(
                      <PaginationItem key={totalPages}>
                        <PaginationLink
                          href="#"
                          onClick={e => {
                            e.preventDefault();
                            onPageChange?.(totalPages);
                          }}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }

                  return pages;
                })()}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      const totalPages = Math.ceil(totalItems / pageSize);
                      if (currentPage < totalPages) {
                        onPageChange?.(currentPage + 1);
                      }
                    }}
                    className={
                      currentPage >= Math.ceil(totalItems / pageSize)
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicTable;