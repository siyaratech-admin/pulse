/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Plus, Loader2 } from 'lucide-react';
import type { FormFieldProps } from '../../../types/form';
import { cn } from '../../../lib/utils';
import { FieldWrapper } from '../../ui/form/FieldWrapper';
import type { ValidationStatus } from '../../ui/form/ValidationMessage';
import {
    toBool,
    isFieldRequired,
    isFieldReadOnly,
    getFieldPlaceholder,
} from '../../../utils/fieldHelpers';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { useFrappeGetDocList } from 'frappe-react-sdk';

// Extended props
interface ExtendedFormFieldProps extends FormFieldProps {
    showLabel?: boolean;
    filters?: Record<string, any>;
}

// Child table row structure
interface ChildTableRow {
    name?: string;
    owner?: string;
    creation?: string;
    modified?: string;
    modified_by?: string;
    docstatus?: number;
    idx: number;
    user?: string; // This is the link field in the child table
    parent?: string;
    parentfield?: string;
    parenttype?: string;
    doctype?: string;
    __unsaved?: number;
}

// Link option structure
interface LinkOption {
    value: string;
    label: string;
}

// === TABLE MULTISELECT FIELD ===
export const TableMultiSelectField: React.FC<ExtendedFormFieldProps> = ({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    className,
    showLabel = true,
    filters,
}) => {
    const [selectedItems, setSelectedItems] = useState<ChildTableRow[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isRequired = isFieldRequired(field);
    const isReadOnly = isFieldReadOnly(field);
    const childDoctype = field.options as string; // e.g., "Interviewer"

    // Parse existing value
    useEffect(() => {
        if (value && Array.isArray(value)) {
            setSelectedItems(value);
        } else {
            setSelectedItems([]);
        }
    }, [value]);

    // Fetch link field options from child doctype
    // First, we need to get the child doctype meta to find the link field
    const { data: childDoctypeMeta } = useFrappeGetDocList(
        'DocField',
        {
            fields: ['fieldname', 'fieldtype', 'options', 'label'],
            filters: [
                ['parent', '=', childDoctype],
                ['fieldtype', 'in', ['Link', 'Data']]
            ],
            limit: 100
        }
    );

    // Find the main link field (usually the first Link field in child table)
    const linkFieldMeta = childDoctypeMeta?.find(f => f.fieldtype === 'Link');
    const linkFieldName = linkFieldMeta?.fieldname || 'user';
    const linkDoctype = linkFieldMeta?.options as string || 'User';

    // Fetch available options from the linked doctype
    const { data: linkOptions, isLoading: isLoadingOptions } = useFrappeGetDocList(
        linkDoctype,
        {
            fields: ['name'],
            filters: filters || [],
            limit: 1000
        }
    );

    // Convert to options format
    const availableOptions: LinkOption[] = linkOptions?.map(opt => ({
        value: opt.name,
        label: opt.name
    })) || [];

    // Filter out already selected items
    const selectedValues = selectedItems.map(item => item[linkFieldName as keyof ChildTableRow]);
    const filteredOptions = availableOptions.filter(opt =>
        !selectedValues.includes(opt.value) &&
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddItem = (optionValue: string) => {
        if (disabled || isReadOnly) return;

        // Create a new child table row
        const newRow: ChildTableRow = {
            name: `tkj${Math.random().toString(36).substr(2, 9)}`, // Generate temp ID
            owner: 'Administrator',
            creation: new Date().toISOString(),
            modified: new Date().toISOString(),
            modified_by: 'Administrator',
            docstatus: 0,
            idx: selectedItems.length + 1,
            [linkFieldName]: optionValue,
            parent: '', // Will be set when saved
            parentfield: field.fieldname,
            parenttype: field.parent || '',
            doctype: childDoctype,
            __unsaved: 1
        };

        const updatedItems = [...selectedItems, newRow];
        setSelectedItems(updatedItems);
        onChange(updatedItems);
        setSearchTerm('');
        setShowDropdown(false);
    };

    const handleRemoveItem = (index: number) => {
        if (disabled || isReadOnly) return;

        const updatedItems = selectedItems
            .filter((_, i) => i !== index)
            .map((item, i) => ({ ...item, idx: i + 1 })); // Re-index

        setSelectedItems(updatedItems);
        onChange(updatedItems);
    };

    const handleClearAll = () => {
        if (disabled || isReadOnly) return;
        setSelectedItems([]);
        onChange([]);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const getValidationStatus = (): ValidationStatus | undefined => {
        if (error) return 'error';
        return undefined;
    };

    return (
        <FieldWrapper
            fieldname={field.fieldname}
            label={showLabel ? field.label || field.fieldname || '' : undefined}
            required={isRequired}
            description={field.description}
            error={error}
            disabled={disabled || isReadOnly}
            validationStatus={getValidationStatus()}
            className={className}
            variant="default"
            badge={showLabel ? childDoctype : undefined}
        >
            <div className="relative" ref={dropdownRef}>
                {/* Selected Items Display */}
                <div
                    className={cn(
                        'min-h-[42px] w-full rounded-md border bg-white px-3 py-2',
                        'transition-all duration-200',
                        'focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500',
                        error && 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500/20',
                        (disabled || isReadOnly) && 'bg-gray-100 cursor-not-allowed opacity-90'
                    )}
                >
                    <div className="flex flex-wrap gap-2">
                        {/* Selected Items as Badges */}
                        {selectedItems.map((item, index) => {
                            const displayValue = item[linkFieldName as keyof ChildTableRow] as string;
                            return (
                                <Badge
                                    key={item.name || index}
                                    variant="secondary"
                                    className={cn(
                                        'flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700',
                                        'border border-blue-200 rounded-md font-medium text-sm',
                                        'hover:bg-blue-100 transition-colors'
                                    )}
                                >
                                    <span className="max-w-[200px] truncate">{displayValue}</span>
                                    {!disabled && !isReadOnly && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="ml-1 rounded-full hover:bg-blue-200 p-0.5 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </Badge>
                            );
                        })}

                        {/* Add Button */}
                        {!disabled && !isReadOnly && (
                            <button
                                type="button"
                                onClick={() => setShowDropdown(!showDropdown)}
                                className={cn(
                                    'flex items-center gap-1 px-3 py-1.5 rounded-md',
                                    'border border-dashed border-gray-300 text-gray-600',
                                    'hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50',
                                    'transition-all duration-200 text-sm font-medium'
                                )}
                            >
                                <Plus className="h-4 w-4" />
                                Add {field.label}
                            </button>
                        )}
                    </div>

                    {/* Empty State */}
                    {selectedItems.length === 0 && !disabled && !isReadOnly && (
                        <div className="text-sm text-gray-400 py-1">
                            No {field.label?.toLowerCase() || 'items'} selected
                        </div>
                    )}
                </div>

                {/* Clear All Button */}
                {selectedItems.length > 0 && !disabled && !isReadOnly && (
                    <button
                        type="button"
                        onClick={handleClearAll}
                        className={cn(
                            'absolute right-2 top-2 text-xs text-gray-500',
                            'hover:text-red-600 underline underline-offset-2',
                            'transition-colors focus:outline-none'
                        )}
                    >
                        Clear all
                    </button>
                )}

                {/* Dropdown Menu */}
                {showDropdown && (
                    <div className="absolute z-50 mt-2 w-full bg-white border rounded-md shadow-lg max-h-80 overflow-hidden">
                        {/* Search Input */}
                        <div className="p-3 border-b sticky top-0 bg-white">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder={`Search ${linkDoctype}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-9 text-sm"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Options List */}
                        <div className="overflow-y-auto max-h-60">
                            {isLoadingOptions ? (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                                    <span className="ml-2 text-sm text-gray-500">Loading options...</span>
                                </div>
                            ) : filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleAddItem(option.value)}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-4 py-3',
                                            'text-left transition-colors hover:bg-blue-50',
                                            'border-b border-gray-100 last:border-b-0'
                                        )}
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {option.label}
                                            </p>
                                        </div>
                                        <Plus className="h-4 w-4 text-gray-400" />
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500 font-medium">
                                        {searchTerm
                                            ? `No results found for "${searchTerm}"`
                                            : `No ${linkDoctype} available`}
                                    </p>
                                    {selectedItems.length > 0 && (
                                        <p className="text-xs text-gray-400 mt-2">
                                            All available options have been selected
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer Info */}
                        {filteredOptions.length > 0 && (
                            <div className="px-4 py-2 text-xs text-gray-400 border-t bg-gray-50">
                                Showing {filteredOptions.length} option{filteredOptions.length !== 1 ? 's' : ''}
                                {selectedItems.length > 0 && ` • ${selectedItems.length} selected`}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </FieldWrapper>
    );
};