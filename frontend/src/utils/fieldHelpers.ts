/**
 * Utility functions for handling Frappe field properties
 */

import type { FieldMetadata } from '../types/form';

/**
 * Convert Frappe boolean/number values to proper boolean
 * Frappe uses 0/1 for boolean values
 */
export const toBool = (value: number | boolean | undefined): boolean => {
    if (value === undefined || value === null) return false;
    if (typeof value === 'boolean') return value;
    return value === 1;
};

/**
 * Get field required status (handles both reqd and conditional requirements)
 */
export const isFieldRequired = (field: FieldMetadata, conditionalRequired = false): boolean => {
    return toBool(field.reqd) || conditionalRequired;
};

/**
 * Get field read-only status (handles both read_only and conditional read-only)
 */
export const isFieldReadOnly = (field: FieldMetadata, conditionalReadOnly = false): boolean => {
    return toBool(field.read_only) || conditionalReadOnly;
};

/**
 * Get field hidden status
 */
export const isFieldHidden = (field: FieldMetadata): boolean => {
    return toBool(field.hidden);
};

/**
 * Get field bold status for labels
 */
export const isFieldBold = (field: FieldMetadata): boolean => {
    return toBool(field.bold);
};

/**
 * Get field unique status
 */
export const isFieldUnique = (field: FieldMetadata): boolean => {
    return toBool(field.unique);
};

/**
 * Get field translatable status
 */
export const isFieldTranslatable = (field: FieldMetadata): boolean => {
    return toBool(field.translatable);
};

/**
 * Get field search index status
 */
export const hasSearchIndex = (field: FieldMetadata): boolean => {
    return toBool(field.search_index);
};

/**
 * Check if field should be printed
 */
export const shouldPrintField = (field: FieldMetadata): boolean => {
    return !toBool(field.print_hide);
};

/**
 * Check if field should be in list view
 */
export const shouldShowInList = (field: FieldMetadata): boolean => {
    return toBool(field.in_list_view);
};

/**
 * Check if field should be in global search
 */
export const shouldShowInGlobalSearch = (field: FieldMetadata): boolean => {
    return toBool(field.in_global_search);
};

/**
 * Get field width classes for responsive design
 */
export const getFieldWidthClass = (field: FieldMetadata): string => {
    if (field.columns) {
        return `col-span-${Math.min(field.columns, 12)}`;
    }
    if (field.width) {
        // Convert Frappe width percentages to Tailwind classes
        const width = field.width.replace('%', '');
        const widthNum = parseInt(width, 10);
        if (widthNum >= 75) return 'col-span-12';
        if (widthNum >= 50) return 'col-span-6';
        if (widthNum >= 33) return 'col-span-4';
        if (widthNum >= 25) return 'col-span-3';
        return 'col-span-2';
    }
    return 'col-span-1';
};

/**
 * Get CSS classes for field labels
 */
export const getFieldLabelClass = (field: FieldMetadata): string => {
    const classes = ['text-sm font-medium text-gray-700'];
    if (isFieldBold(field)) {
        classes.push('font-bold');
    }
    return classes.join(' ');
};

/**
 * Validate field precision for numeric inputs
 */
export const validatePrecision = (value: number, precision?: number): boolean => {
    if (!precision || !value) return true;
    const decimalPlaces = (value.toString().split('.')[1] || '').length;
    return decimalPlaces <= precision;
};

/**
 * Format number according to field precision
 */
export const formatNumber = (value: number, precision?: number): string => {
    if (!precision) return value.toString();
    return value.toFixed(precision);
};

/**
 * Check if field is a layout field (non-data field)
 */
export const isLayoutField = (fieldtype: string): boolean => {
    return ['Section Break', 'Column Break', 'Tab Break', 'HTML', 'Button'].includes(fieldtype);
};

/**
 * Check if field supports table data
 */
export const isTableField = (fieldtype: string): boolean => {
    return ['Table', 'Table MultiSelect'].includes(fieldtype);
};

/**
 * Check if field is a numeric field
 */
export const isNumericField = (fieldtype: string): boolean => {
    return ['Int', 'Float', 'Currency', 'Percent'].includes(fieldtype);
};

/**
 * Check if field is a text field
 */
export const isTextField = (fieldtype: string): boolean => {
    return ['Data', 'Text', 'Small Text', 'Long Text', 'Code', 'Text Editor'].includes(fieldtype);
};

/**
 * Check if field is a date/time field
 */
export const isDateTimeField = (fieldtype: string): boolean => {
    return ['Date', 'Time', 'Datetime'].includes(fieldtype);
};

/**
 * Get placeholder text for field
 */
export const getFieldPlaceholder = (field: FieldMetadata): string => {
    if (field.description) return field.description;
    
    const fieldLabel = field.label || field.fieldname;
    
    // Generate contextual placeholders based on field type
    switch (field.fieldtype) {
        case 'Data':
            return `Enter ${fieldLabel.toLowerCase()}`;
        case 'Int':
            return `Enter number`;
        case 'Float':
        case 'Currency':
            return `Enter decimal number`;
        case 'Password':
            return 'Enter password';
        case 'Email':
            return 'Enter email address';
        case 'Phone':
            return 'Enter phone number';
        case 'Date':
            return 'Select date';
        case 'Time':
            return 'Select time';
        case 'Datetime':
            return 'Select date and time';
        case 'Select':
            return `Select ${fieldLabel.toLowerCase()}`;
        case 'Link':
            return `Select ${field.options || fieldLabel.toLowerCase()}`;
        case 'Text':
        case 'Small Text':
        case 'Long Text':
            return `Enter ${fieldLabel.toLowerCase()}`;
        case 'Code':
            return 'Enter code';
        case 'Check':
            return '';
        default:
            return `Enter ${fieldLabel.toLowerCase()}`;
    }
};