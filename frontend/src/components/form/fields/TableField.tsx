/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from 'react';
import { useFrappePostCall } from 'frappe-react-sdk';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Plus, Trash2, ChevronDown, ChevronRight, Copy, Edit } from 'lucide-react';
import type { FormFieldProps, TableRowData, FieldMetadata } from '../../../types/form';
import { cn } from '../../../lib/utils';

// Import specific field components
import { DataField, IntField, FloatField, CurrencyField } from './BasicFields';
import { TextField, SmallTextField, LongTextField, CodeField, TextEditorField } from './TextFields';
import { CheckField } from './CheckField';
import { DateField, TimeField, DatetimeField } from './DateTimeFields';
import { SelectField, LinkField } from './SelectionFields';
import { AttachField } from './AttachField';

export const TableField: React.FC<FormFieldProps> = ({
    field,
    value,
    onChange,
    error,
    disabled,
    className,
    parentDoctype,
    formData
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set(Array.from({ length: 100 }, (_, i) => i)));

    const tableData: TableRowData[] = Array.isArray(value) ? value : [];
    const childFields = field.table_fields || [];

    const toggleRowExpansion = (rowIndex: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(rowIndex)) {
            newExpanded.delete(rowIndex);
        } else {
            newExpanded.add(rowIndex);
        }
        setExpandedRows(newExpanded);
    };

    const duplicateRow = (rowIndex: number, e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        const rowToCopy = { ...tableData[rowIndex] };
        delete rowToCopy.__isNew;
        rowToCopy.__isNew = true;
        const newData = [...tableData];
        newData.splice(rowIndex + 1, 0, rowToCopy);
        onChange(newData);
    };

    const cleanLabel = (label: string) => {
        if (!label) return '';
        return label.replace(/\d+$/, '').trim();
    };

    const visibleFields = childFields.filter(
        f => !f.hidden && !['Section Break', 'Column Break', 'Tab Break', 'HTML'].includes(f.fieldtype) && (f as any).in_list_view === 1
    );

    const addRow = useCallback((e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        const newRow: TableRowData = {
            __isNew: true,
            __idx: tableData.length,
            __uniqueId: `row_${Date.now()}_${Math.random()}`
        };
        childFields.forEach(childField => {
            if (childField.default !== undefined) {
                newRow[childField.label] = childField.default;
            }
        });
        onChange([...tableData, newRow]);
    }, [tableData, childFields, onChange]);

    const removeRow = useCallback((index: number, e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        const newData = tableData.filter((_, i) => i !== index);
        onChange(newData);
    }, [tableData, onChange]);

    const updateRowField = useCallback((rowIndex: number, fieldName: string, fieldValue: any) => {
        const newData = [...tableData];
        newData[rowIndex] = {
            ...newData[rowIndex],
            [fieldName]: fieldValue
        };
        onChange(newData);
    }, [tableData, onChange]);

    const renderChildField = useCallback((
        childField: any,
        rowIndex: number,
        value: any,
        isDesktop: boolean = false,
        hideMobileLabel: boolean = false
    ) => {
        const fieldProps = {
            field: {
                ...childField,
                label: (isDesktop || hideMobileLabel) ? '' : cleanLabel(childField.label || childField.fieldname)
            },
            value: value,
            onChange: (newValue: any) => updateRowField(rowIndex, childField.fieldname, newValue),
            disabled: Boolean(disabled || field.read_only || childField.read_only),
            className: (isDesktop || hideMobileLabel)
                ? "w-full space-y-0 [&>div]:space-y-0 [&>label]:hidden [&>div>label]:hidden [&_.space-y-1]:space-y-0 [&_.space-y-2]:space-y-0"
                : "w-full"
        };

        switch (childField.fieldtype) {
            case 'Data':
                // Use SmallTextField (textarea) for Data fields in table to allow wrapping
                if (isDesktop) {
                    return <SmallTextField {...fieldProps} showLabel={false} className={cn(fieldProps.className, "[&>textarea]:min-h-[36px] [&>textarea]:h-auto [&>textarea]:py-2")} />;
                }
                return <DataField {...fieldProps} showLabel={false} />;
            case 'Text':
                return <TextField {...fieldProps} showLabel={false} />;
            case 'SmallText':
                return <SmallTextField {...fieldProps} showLabel={false} />;
            case 'LongText':
                return <LongTextField {...fieldProps} showLabel={false} />;
            case 'TextEditor':
                return <TextEditorField {...fieldProps} showLabel={false} />;
            case 'Code':
                return <CodeField {...fieldProps} showLabel={false} />;
            case 'Int':
                return <IntField {...fieldProps} showLabel={false} />;
            case 'Float':
                return <FloatField {...fieldProps} showLabel={false} />;
            case 'Currency':
                return <CurrencyField {...fieldProps} showLabel={false} />;
            case 'Percent':
                return (
                    <div className="relative">
                        <FloatField {...fieldProps} />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                    </div>
                );
            case 'Check':
                return <CheckField {...fieldProps} />;
            case 'Date':
                return <DateField {...fieldProps} />;
            case 'Time':
                return <TimeField {...fieldProps} />;
            case 'Datetime':
                return <DatetimeField {...fieldProps} />;
            case 'Select':
                return <SelectField {...fieldProps} showLabel={false} />;
            case 'Link':
                return (
                    <div className={isDesktop ? "relative z-40" : "relative z-30"}>
                        <LinkField
                            {...fieldProps}
                            className={cn(
                                fieldProps.className,
                                isDesktop && "[&>div>div:last-child]:z-50 [&>div>div:last-child]:absolute"
                            )}
                        />
                    </div>
                );
            case 'DynamicLink':
                return (
                    <div className={isDesktop ? "relative z-40" : "relative z-30"}>
                        <LinkField
                            {...fieldProps}
                            className={cn(
                                fieldProps.className,
                                isDesktop && "[&>div>div:last-child]:z-50 [&>div>div:last-child]:absolute"
                            )}
                        />
                    </div>
                );
            case 'Autocomplete':
                return <SelectField {...fieldProps} />;
            case 'Attach':
            case 'AttachImage':
                return (
                    <AttachField
                        {...fieldProps}
                        showLabel={false}
                        uniqueId={`attach-${rowIndex}-${childField.fieldname}`}
                    />
                );
            case 'Password':
                return (
                    <div className="w-full">
                        <input
                            type="password"
                            value={value || ''}
                            onChange={(e) => updateRowField(rowIndex, childField.fieldname, e.target.value)}
                            disabled={Boolean(disabled || field.read_only || childField.read_only)}
                            placeholder={isDesktop ? '' : childField.label}
                            className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
                        />
                    </div>
                );
            case 'ReadOnly':
                return (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground bg-muted/50 rounded h-9 flex items-center">
                        {value || '-'}
                    </div>
                );
            case 'Color':
                return (
                    <div className="w-full">
                        <input
                            type="color"
                            value={value || '#000000'}
                            onChange={(e) => updateRowField(rowIndex, childField.fieldname, e.target.value)}
                            disabled={Boolean(disabled || field.read_only || childField.read_only)}
                            className="w-full h-9 border rounded cursor-pointer"
                        />
                    </div>
                );
            case 'Barcode':
            case 'Geolocation':
                return <DataField {...fieldProps} />;
            case 'Table':
            case 'TableMultiSelect':
                const nestedValue = value || [];
                return (
                    <div className="text-xs text-muted-foreground h-9 flex items-center">
                        {Array.isArray(nestedValue) ? `${nestedValue.length} rows` : 'No data'}
                    </div>
                );
            default:
                console.warn(`Unsupported field type in table: ${childField.fieldtype}`);
                return (
                    <div className="space-y-1">
                        <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => updateRowField(rowIndex, childField.fieldname, e.target.value)}
                            disabled={Boolean(disabled || field.read_only || childField.read_only)}
                            placeholder={isDesktop ? '' : childField.label}
                            className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
                        />
                        {!isDesktop && (
                            <div className="text-xs text-yellow-600">Unsupported: {childField.fieldtype}</div>
                        )}
                    </div>
                );
        }
    }, [updateRowField, disabled, field.read_only]);

    if (!childFields.length) {
        return (
            <div className={cn("space-y-2", className)}>
                <Label className="text-sm font-medium text-red-500">
                    Table field "{field.label}" has no child fields defined
                </Label>
            </div>
        );
    }

    function handleRowChange(rowIndex: number, fieldname: string, val: any) {
        const newData = [...tableData];
        newData[rowIndex] = {
            ...newData[rowIndex],
            [fieldname]: val,
        };
        onChange(newData);
    }

    const [showCreateTask, setShowCreateTask] = useState(false);
    const [newTaskSubject, setNewTaskSubject] = useState('');
    const [newTaskStartDate, setNewTaskStartDate] = useState('');
    const [newTaskEndDate, setNewTaskEndDate] = useState('');
    const [newTaskDuration, setNewTaskDuration] = useState('');
    const [isCalculatingDate, setIsCalculatingDate] = useState(false);
    const [creatingTask, setCreatingTask] = useState(false);
    const { call } = useFrappePostCall('frappe.client.insert');

    const calculateEndDate = useCallback(async (start_date: string, duration: number, project: string) => {
        if (!start_date || !duration || !project) return;
        setIsCalculatingDate(true);
        console.log(`📅 Calculating End Date: Start=${start_date}, Duration=${duration}, Project=${project}`);
        try {
            const response = await fetch('/api/method/kb_planning.kb_planning.utils.get_end_date_skipping_holidays', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || '',
                },
                body: JSON.stringify({
                    start_date: start_date,
                    duration: duration,
                    project: project
                })
            });
            const data = await response.json();
            if (data.message) {
                console.log(`✅ Calculated End Date: ${data.message}`);
                setNewTaskEndDate(data.message);
            }
        } catch (error) {
            console.error('Failed to calculate end date:', error);
        } finally {
            setIsCalculatingDate(false);
        }
    }, []);

    React.useEffect(() => {
        if (showCreateTask && newTaskStartDate && newTaskDuration) {
            const duration = parseFloat(newTaskDuration);
            if (!formData?.project) {
                console.warn('⚠️ Cannot calculate End Date: Project is not selected.');
                return;
            }
            if (!isNaN(duration) && duration > 0) {
                const timer = setTimeout(() => {
                    calculateEndDate(newTaskStartDate, duration, formData.project);
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [newTaskStartDate, newTaskDuration, showCreateTask, formData?.project, calculateEndDate]);

    const handleCreateTask = async () => {
        if (!newTaskSubject || !newTaskStartDate || !newTaskEndDate) {
            alert('Please fill in all fields (Subject, Start Date, End Date)');
            return;
        }
        setCreatingTask(true);
        try {
            const taskResponse = await call({
                doc: {
                    doctype: 'Task',
                    subject: newTaskSubject,
                    status: 'Open',
                    exp_start_date: newTaskStartDate,
                    exp_end_date: newTaskEndDate,
                    type: 'Baseline Task',
                    is_group: 0
                }
            });
            if (taskResponse) {
                const createdTask = taskResponse.message || taskResponse;
                console.log('Task Created Response:', taskResponse);
                const newRow: TableRowData = {
                    __isNew: true,
                    __idx: tableData.length,
                    __uniqueId: `row_${Date.now()}_${Math.random()}`,
                    task_name: createdTask.name,
                    task: createdTask.name,
                    subject: createdTask.subject,
                    start_date: newTaskStartDate,
                    end_date: newTaskEndDate
                };
                onChange([...tableData, newRow]);
                setShowCreateTask(false);
                setNewTaskSubject('');
                setNewTaskStartDate('');
                setNewTaskEndDate('');
                setNewTaskDuration('');
            }
        } catch (error) {
            console.error('Failed to create task:', error);
            alert('Failed to create task. Please try again.');
        } finally {
            setCreatingTask(false);
        }
    };

    return (
        <div className={cn("space-y-3", className)}>
            {/* Field Label */}
            <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-900">
                    {field.label}
                    {field.reqd && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {tableData.length > 0 && (
                    <Badge variant="secondary" className="text-xs font-medium">
                        {tableData.length} {tableData.length === 1 ? 'Row' : 'Rows'}
                    </Badge>
                )}
            </div>

            {/* Main Table Container */}
            {isExpanded && (
                <div className="w-full border border-gray-300 rounded-lg bg-white shadow-sm overflow-hidden">
                    {/* Action Bar */}
                    <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="flex items-center justify-end">
                            {(parentDoctype === 'KB Client Baseline') ? (
                                <Button
                                    size="sm"
                                    onClick={() => setShowCreateTask(true)}
                                    disabled={Boolean(disabled || field.read_only)}
                                    className="h-9 px-4 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-600 text-white font-medium shadow-sm"
                                    type="button"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Task
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={addRow}
                                    disabled={Boolean(disabled || field.read_only)}
                                    className="h-9 px-4 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-600 text-white font-medium shadow-sm"
                                    type="button"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Row
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="w-full">
                        {/* Desktop/Tablet Table View */}
                        <div className="hidden md:block w-full overflow-x-auto">
                            <Table className="min-w-full">
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
                                        <TableHead className="w-14 font-semibold text-gray-700 text-center">#</TableHead>
                                        {visibleFields.map(childField => (
                                            <TableHead
                                                key={childField.fieldname}
                                                className={cn(
                                                    "font-semibold text-gray-700",
                                                    childField.fieldtype === 'Link' && "min-w-[200px]",
                                                    "min-w-[140px]"
                                                )}
                                            >
                                                {cleanLabel(childField.label)}
                                                {!!childField.reqd && <span className="text-red-500 ml-1">*</span>}
                                            </TableHead>
                                        ))}
                                        <TableHead className="w-24 font-semibold text-gray-700 text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tableData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={visibleFields.length + 2} className="h-32">
                                                <div className="text-center py-8">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                                            <Plus className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="font-semibold text-gray-700 text-sm">No rows added yet</p>
                                                            <p className="text-xs text-gray-500">Click "Add Row" button above to get started</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        tableData.map((row, rowIndex) => (
                                            <TableRow
                                                key={row.__uniqueId || `row-${rowIndex}`}
                                                className="hover:bg-blue-50/50 transition-colors border-b border-gray-200"
                                            >
                                                <TableCell className="font-mono text-xs text-gray-600 text-center font-medium py-3">
                                                    {rowIndex + 1}
                                                </TableCell>
                                                {visibleFields.map((childField) => (
                                                    <TableCell key={childField.fieldname} className="p-2 align-top">
                                                        <div className="w-full">
                                                            {childField.fieldtype === 'Attach' || childField.fieldtype === 'AttachImage' ? (
                                                                <AttachField
                                                                    field={childField}
                                                                    value={row[childField.fieldname]}
                                                                    onChange={(val) => handleRowChange(rowIndex, childField.fieldname, val)}
                                                                    uniqueId={`attach-${rowIndex}-${childField.fieldname}`}
                                                                    disabled={Boolean(disabled) || Boolean(field.read_only)}
                                                                    showLabel={false}
                                                                />
                                                            ) : (
                                                                renderChildField(childField, rowIndex, row[childField.fieldname], true)
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                ))}
                                                <TableCell className="p-2 align-top text-center">
                                                    <div className="flex gap-1 justify-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                                            onClick={(e) => removeRow(rowIndex, e)}
                                                            disabled={Boolean(disabled || field.read_only)}
                                                            type="button"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden p-4">
                            {tableData.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                            <Plus className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="font-semibold text-gray-700 text-base">No rows added yet</p>
                                            <p className="text-sm text-gray-500">Click "Add Row" button above to get started</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {tableData.map((row, rowIndex) => (
                                        <div
                                            key={row.__uniqueId || `mobile-row-${rowIndex}`}
                                            className="border border-gray-300 rounded-lg bg-white shadow-sm overflow-hidden"
                                        >
                                            {/* Card Header */}
                                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs font-semibold">
                                                        #{rowIndex + 1}
                                                    </Badge>
                                                    <button
                                                        onClick={() => toggleRowExpansion(rowIndex)}
                                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                    >
                                                        {expandedRows.has(rowIndex) ? (
                                                            <ChevronDown className="h-4 w-4 text-gray-600" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4 text-gray-600" />
                                                        )}
                                                    </button>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={(e) => removeRow(rowIndex, e)}
                                                    disabled={Boolean(disabled || field.read_only)}
                                                    type="button"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            {/* Card Content */}
                                            {expandedRows.has(rowIndex) && (
                                                <div className="p-3 space-y-3 bg-white">
                                                    {visibleFields.map((childField) => (
                                                        <div key={childField.fieldname} className="space-y-1.5">
                                                            <label className="text-xs font-semibold text-gray-700 flex items-center">
                                                                {cleanLabel(childField.label)}
                                                                {!!childField.reqd && <span className="text-red-500 ml-1">*</span>}
                                                            </label>
                                                            <div className="w-full">
                                                                {childField.fieldtype === 'Attach' || childField.fieldtype === 'AttachImage' ? (
                                                                    <AttachField
                                                                        field={childField}
                                                                        value={row[childField.fieldname]}
                                                                        onChange={(val) => handleRowChange(rowIndex, childField.fieldname, val)}
                                                                        uniqueId={`mobile-attach-${rowIndex}-${childField.fieldname}`}
                                                                        disabled={Boolean(disabled) || Boolean(field.read_only)}
                                                                        showLabel={false}
                                                                    />
                                                                ) : (
                                                                    renderChildField(childField, rowIndex, row[childField.fieldname], false, true)
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Task Dialog */}
            {showCreateTask && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                            Create New Baseline Task
                        </h3>

                        {!formData?.project && (
                            <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-md text-sm text-yellow-800">
                                <div className="flex items-start gap-2">
                                    <span className="text-lg">⚠️</span>
                                    <p>Please select a <span className="font-semibold">Project</span> in the form above to enable automatic end date calculation.</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                                <input
                                    type="text"
                                    value={newTaskSubject}
                                    onChange={(e) => setNewTaskSubject(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    placeholder="Enter task subject"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Date</label>
                                    <input
                                        type="date"
                                        value={newTaskStartDate}
                                        onChange={(e) => setNewTaskStartDate(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Duration (Days)</label>
                                    <input
                                        type="number"
                                        value={newTaskDuration}
                                        onChange={(e) => setNewTaskDuration(e.target.value)}
                                        placeholder="e.g. 5"
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    End Date
                                    {isCalculatingDate && (
                                        <span className="text-xs text-blue-500 font-normal ml-2 animate-pulse">
                                            Calculating...
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="date"
                                    value={newTaskEndDate}
                                    onChange={(e) => setNewTaskEndDate(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                    readOnly
                                />
                                <p className="text-xs text-gray-500 mt-1.5">Automatically calculated based on working days & holidays</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                            <Button
                                variant="outline"
                                onClick={() => setShowCreateTask(false)}
                                disabled={creatingTask}
                                className="px-5 h-10"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateTask}
                                disabled={creatingTask}
                                className="px-5 h-10 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-600 text-white font-medium shadow-md"
                            >
                                {creatingTask ? 'Creating...' : 'Create Task'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {field.description && (
                <p className="text-xs text-gray-500 mt-1">{field.description}</p>
            )}
            {error && (
                <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>
            )}
        </div>
    );
};