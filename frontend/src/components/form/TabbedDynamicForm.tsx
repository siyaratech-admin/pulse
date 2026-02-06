//============================================
// IMPROVED TabbedDynamicForm.tsx
//============================================
import React, { useState, useMemo, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DynamicForm } from './DynamicForm';
import type { FieldMetadata, FormData } from '@/types/form';
import { Badge } from "@/components/ui/badge";
import { ConditionEvaluator } from '../../utils/conditionEvaluator';
import { buildFetchFromMap, autoPopulateFetchFromFields } from '../../utils/linkFieldHelpers';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

interface TabSection {
    label: string;
    fields: FieldMetadata[];
}

interface TabbedDynamicFormProps {
    fields: FieldMetadata[];
    initialData?: FormData;
    onSubmit: (data: FormData) => void | Promise<void>;
    onCancel?: () => void;
    loading?: boolean;
    className?: string;
    doctype?: string;
    docname?: string;
    onFieldChange?: (field: FieldMetadata, value: any) => void;
    onSubmitDoc?: (data: FormData) => Promise<void>;
    onCancelDoc?: () => Promise<void>;
    onAmendDoc?: () => Promise<void>;
    customTabs?: { label: string; content: React.ReactNode }[];
    additionalTabContent?: Record<string, React.ReactNode>;
    readOnly?: boolean;
    isSubmittable?: boolean;
    validationErrors?: Record<string, string>;
    renderHeaderActions?: (tabLabel: string) => React.ReactNode;
}

// ✅ NEW: Helper function to check if HTML content is empty
const isHTMLEmpty = (html: string | null | undefined): boolean => {
    if (!html || html.trim() === '') return true;
    const text = html.replace(/<[^>]*>/g, '').trim();
    const cleanText = text.replace(/&nbsp;/g, '').replace(/\u00a0/g, '').replace(/\s+/g, '').trim();
    return cleanText.length === 0;
};

// ✅ NEW: Helper function to check if a table field has valid data
// Now handles fieldname casing issues (e.g., "Date" vs "date")
const hasValidTableData = (value: any): boolean => {
    console.log('🔍 [hasValidTableData] Checking value:', value);

    if (!Array.isArray(value) || value.length === 0) {
        console.log('❌ [hasValidTableData] Not an array or empty');
        return false;
    }

    console.log(`📊 [hasValidTableData] Array has ${value.length} row(s)`);

    // Check if at least one row has actual data
    const hasData = value.some((row, rowIndex) => {
        console.log(`\n🔍 [hasValidTableData] Checking row ${rowIndex}:`, row);

        // Get all keys from the row
        const allKeys = Object.keys(row);
        console.log(`All keys:`, allKeys);

        // Filter out internal fields (starting with __)
        const dataFields = allKeys.filter(key => !key.startsWith('__'));
        console.log(`Data fields (excluding __):`, dataFields);

        // ✅ FIX: Group fields by lowercase name to handle casing issues
        // Problem: ERPNext may create both "Date" (null) and "date" (actual value)
        const fieldsByLowercase = new Map<string, string[]>();
        dataFields.forEach(key => {
            const lowerKey = key.toLowerCase();
            if (!fieldsByLowercase.has(lowerKey)) {
                fieldsByLowercase.set(lowerKey, []);
            }
            fieldsByLowercase.get(lowerKey)!.push(key);
        });
        console.log(`Fields grouped by lowercase:`, Object.fromEntries(fieldsByLowercase));

        // Check if at least one field has a non-empty value
        // When there are duplicate fields (e.g., "Date" and "date"), prefer the lowercase version
        const hasNonEmptyField = Array.from(fieldsByLowercase.entries()).some(([lowerKey, keys]) => {
            // Prefer lowercase version if it exists, otherwise use the first one
            const keyToCheck = keys.find(k => k === lowerKey) || keys[0];
            const cellValue = row[keyToCheck];

            console.log(`Checking field "${keyToCheck}" (from group: ${keys.join(', ')}):`, cellValue, `(type: ${typeof cellValue})`);

            // Check for null/undefined/empty string
            if (cellValue === null || cellValue === undefined || cellValue === '') {
                console.log(`❌ Empty or null`);
                return false;
            }

            // For numbers, 0 is valid
            if (typeof cellValue === 'number') {
                console.log(`✅ Valid number: ${cellValue}`);
                return true;
            }

            // For booleans, any value is valid
            if (typeof cellValue === 'boolean') {
                console.log(`✅ Valid boolean: ${cellValue}`);
                return true;
            }

            // For strings, check if not just whitespace
            if (typeof cellValue === 'string') {
                const hasContent = cellValue.trim().length > 0;
                console.log(`${hasContent ? '✅' : '❌'} String content: "${cellValue}" (trimmed: "${cellValue.trim()}")`);
                return hasContent;
            }

            // For objects/arrays
            if (typeof cellValue === 'object') {
                console.log(`⚠️ Object/Array value:`, cellValue);
                return true; // Consider objects as valid data
            }

            console.log(`⚠️ Unknown type, considering valid`);
            return true;
        });

        console.log(`Row ${rowIndex} has data: ${hasNonEmptyField}`);
        return hasNonEmptyField;
    });

    console.log(`\n${hasData ? '✅' : '❌'} [hasValidTableData] Final result: ${hasData}\n`);
    return hasData;
};

export const TabbedDynamicForm = forwardRef<any, TabbedDynamicFormProps>(
    (
        {
            fields,
            initialData = {},
            onSubmit,
            onCancel,
            loading = false,
            className,
            doctype,
            docname,
            onFieldChange,
            onSubmitDoc,
            onCancelDoc,
            onAmendDoc,
            customTabs = [],
            additionalTabContent = {},
            validationErrors = {},
            renderHeaderActions
        },
        ref
    ) => {
        const [activeTab, setActiveTab] = useState<string>('0');
        const [formData, setFormData] = useState<FormData>(initialData);
        const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
        const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

        // Expose method to switch to tab containing a specific field
        useImperativeHandle(ref, () => ({
            switchToFieldTab: (fieldname: string) => {
                // Find which tab contains this field
                const tabIndex = tabSections.findIndex(section =>
                    section.fields.some(f => f.fieldname === fieldname)
                );

                if (tabIndex !== -1) {
                    console.log(`🎯 Switching to tab ${tabIndex} for field ${fieldname}`);
                    setActiveTab(tabIndex.toString());

                    // After tab switch, scroll to the field
                    setTimeout(() => {
                        const event = new CustomEvent('scrollToError', { detail: { fieldname } });
                        window.dispatchEvent(event);
                    }, 300);
                }
            }
        }));

        // Update fieldErrors when validationErrors prop changes
        useEffect(() => {
            if (validationErrors && Object.keys(validationErrors).length > 0) {
                setFieldErrors(validationErrors);
                setHasAttemptedSubmit(true);
            }
        }, [validationErrors]);

        // Group fields by tabs or section breaks
        const tabSections = useMemo(() => {
            const hasTabBreaks = fields.some(f => f.fieldtype === 'Tab Break');
            const sections: TabSection[] = [];
            let currentSection: TabSection = { label: 'General', fields: [] };

            fields.forEach((field) => {
                if (field.hidden) return;

                if (hasTabBreaks) {
                    if (field.fieldtype === 'Tab Break') {
                        if (currentSection.fields.length > 0) {
                            sections.push(currentSection);
                        }
                        currentSection = { label: field.label || 'Tab', fields: [] };
                    } else {
                        currentSection.fields.push(field);
                    }
                } else {
                    if (field.fieldtype === 'Section Break') {
                        if (currentSection.fields.length > 0) {
                            sections.push(currentSection);
                        }
                        currentSection = { label: field.label || 'Section', fields: [] };
                    } else if (field.fieldtype !== 'Column Break') {
                        currentSection.fields.push(field);
                    }
                }
            });

            if (currentSection.fields.length > 0) {
                sections.push(currentSection);
            }

            if (sections.length === 0) {
                sections.push({
                    label: 'General',
                    fields: fields.filter(f =>
                        f.fieldtype !== 'Section Break' &&
                        f.fieldtype !== 'Column Break' &&
                        f.fieldtype !== 'Tab Break'
                    )
                });
            }

            return sections;
        }, [fields]);

        React.useEffect(() => {
            if (initialData && Object.keys(initialData).length > 0) {
                setFormData(prev => ({ ...prev, ...initialData }));
            }
        }, [initialData]);

        // Track which tabs have errors
        const tabsWithErrors = useMemo(() => {
            const tabErrors: Record<string, number> = {};

            Object.keys(fieldErrors).forEach(fieldname => {
                tabSections.forEach((section, index) => {
                    if (section.fields.some(f => f.fieldname === fieldname)) {
                        tabErrors[index.toString()] = (tabErrors[index.toString()] || 0) + 1;
                    }
                });
            });

            return tabErrors;
        }, [fieldErrors, tabSections]);

        const fetchFromMap = useMemo(() => buildFetchFromMap(fields), [fields]);

        const handleFieldChange = async (field: FieldMetadata, value: any) => {
            const fieldName = field.fieldname;
            const currentFormDataWithChange = { ...formData, [fieldName]: value };

            setFormData(prev => ({ ...prev, [fieldName]: value }));

            // Clear error for this field when it's changed
            if (fieldErrors[fieldName]) {
                setFieldErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[fieldName];
                    return newErrors;
                });
            }

            if (field.fieldtype === 'Link' && value && field.options) {
                const linkDoctype = typeof field.options === 'string' ? field.options : String(field.options);

                try {
                    const updatedFormData = await autoPopulateFetchFromFields(
                        fieldName,
                        value,
                        linkDoctype,
                        fetchFromMap,
                        currentFormDataWithChange,
                        fields,
                        doctype
                    );

                    if (JSON.stringify(updatedFormData) !== JSON.stringify(currentFormDataWithChange)) {
                        setFormData(updatedFormData);

                        if (onFieldChange) {
                            Object.keys(updatedFormData).forEach(key => {
                                if (updatedFormData[key] !== currentFormDataWithChange[key]) {
                                    const changedField = fields.find(f => f.fieldname === key) || { fieldname: key } as FieldMetadata;
                                    onFieldChange(changedField, updatedFormData[key]);
                                }
                            });
                        }
                    }
                } catch (error) {
                    console.error(`Error processing fetch_from for ${fieldName}:`, error);
                }
            }

            if (onFieldChange) {
                onFieldChange(field, value);
            }
        };

        // ✅ FIXED: Use the data parameter passed from DynamicForm, not the stale formData state
        const handleSubmit = useCallback(
            async (data: FormData, e?: React.BaseSyntheticEvent) => {
                if (e && e.preventDefault) {
                    e.preventDefault();
                }

                console.log('🔍 TabbedDynamicForm validation starting...');
                console.log('📦 TabbedDynamicForm received data:', data);
                console.log('📊 Data keys:', Object.keys(data));

                setHasAttemptedSubmit(true);

                // ✅ CRITICAL: Use the data parameter, not formData state
                // Evaluate conditions for all fields using the passed data
                const conditions = ConditionEvaluator.evaluateFields(fields, data);

                // Validate all required fields across all tabs
                const errors: Record<string, string> = {};
                const errorFieldsByTab: Record<string, string[]> = {};

                fields.forEach(field => {
                    const fieldConditions = conditions[field.fieldname];

                    // Skip hidden or invisible fields
                    if (field.hidden || (fieldConditions && !fieldConditions.visible)) {
                        return;
                    }

                    // Skip read-only fields
                    if (field.read_only || (fieldConditions && fieldConditions.readOnly)) {
                        return;
                    }

                    const isRequired = field.reqd || (fieldConditions && fieldConditions.required);

                    if (isRequired) {
                        // ✅ CRITICAL: Use data parameter, not formData state
                        const value = data[field.fieldname];

                        console.log(`🔍 TabbedDynamicForm checking required field: ${field.fieldname}`, {
                            value,
                            fieldtype: field.fieldtype,
                            isArray: Array.isArray(value),
                            arrayLength: Array.isArray(value) ? value.length : 'N/A'
                        });

                        let isEmpty = false;

                        // ✅ FIXED: Proper validation based on field type
                        if (field.fieldtype === 'Text Editor' || field.fieldtype === 'HTML Editor') {
                            isEmpty = isHTMLEmpty(value);
                        } else if (field.fieldtype === 'Table' || field.fieldtype === 'Table MultiSelect') {
                            // ✅ FIXED: Check if table has valid data, not just if array exists
                            isEmpty = !hasValidTableData(value);
                            if (isEmpty) {
                                console.log(`❌ [TabbedDynamicForm] Table field ${field.fieldname} is empty or has no valid data`);
                            } else {
                                console.log(`✅ [TabbedDynamicForm] Table field ${field.fieldname} has valid data`);
                            }
                        } else {
                            // Standard empty check for other field types
                            isEmpty =
                                value === null ||
                                value === undefined ||
                                value === '' ||
                                (Array.isArray(value) && value.length === 0);
                        }

                        if (isEmpty) {
                            errors[field.fieldname] =
                                field.fieldtype === 'Table' || field.fieldtype === 'Table MultiSelect'
                                    ? `${field.label} requires at least one complete entry`
                                    : `${field.label} is required`;

                            // Track which tab this error belongs to
                            tabSections.forEach((section, index) => {
                                if (section.fields.some(f => f.fieldname === field.fieldname)) {
                                    if (!errorFieldsByTab[index.toString()]) {
                                        errorFieldsByTab[index.toString()] = [];
                                    }
                                    errorFieldsByTab[index.toString()].push(field.fieldname);
                                }
                            });
                        }
                    }
                });

                if (Object.keys(errors).length > 0) {
                    console.log('❌ Validation errors found:', errors);
                    console.log('📋 Errors by tab:', errorFieldsByTab);

                    setFieldErrors(errors);

                    // Find the first tab with errors
                    const firstErrorTab = Object.keys(errorFieldsByTab)[0];
                    const errorCount = Object.keys(errors).length;

                    if (firstErrorTab) {
                        console.log(`🎯 Switching to tab ${firstErrorTab} with errors`);
                        setActiveTab(firstErrorTab);

                        // Wait for tab to render, then scroll to first error
                        setTimeout(() => {
                            const firstErrorField = errorFieldsByTab[firstErrorTab][0];

                            // Emit custom event to notify DynamicForm to scroll
                            const scrollEvent = new CustomEvent('scrollToError', {
                                detail: { fieldname: firstErrorField }
                            });
                            window.dispatchEvent(scrollEvent);

                            // Show toast notification
                            const errorFields = Object.keys(errors)
                                .slice(0, 3)
                                .map(key => {
                                    const field = fields.find(f => f.fieldname === key);
                                    return field?.label || key;
                                });

                            const moreCount = errorCount > 3 ? errorCount - 3 : 0;

                            toast.error('Please fill in all required fields', {
                                description: `${errorCount} field${errorCount !== 1 ? 's' : ''} required: ${errorFields.join(', ')}${moreCount > 0 ? ` and ${moreCount} more` : ''}`,
                                duration: 5000,
                                position: "bottom-right",
                            });
                        }, 300);
                    }

                    return;
                }

                console.log('✅ Validation passed, submitting...');
                setFieldErrors({});

                // ✅ Pass the data parameter to onSubmit, not formData state
                await onSubmit(data);
            },
            [fields, tabSections, onSubmit]
        );

        // Single section optimization
        if (tabSections.length === 1 && customTabs.length === 0 && Object.keys(additionalTabContent).length === 0) {
            return (
                <div className={className}>
                    <DynamicForm
                        fields={fields}
                        initialData={initialData}
                        onSubmit={onSubmit}
                        onCancel={onCancel}
                        loading={loading}
                        className={className}
                        doctype={doctype}
                        docname={docname}
                        onFieldChange={onFieldChange}
                        onSubmitDoc={onSubmitDoc}
                        onCancelDoc={onCancelDoc}
                        onAmendDoc={onAmendDoc}
                        fieldErrors={fieldErrors}
                        hasAttemptedSubmit={hasAttemptedSubmit}
                    />
                    {additionalTabContent['General'] || additionalTabContent[tabSections[0].label]}
                </div>
            );
        }

        return (
            <div className={className}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-2 overflow-x-auto flex-nowrap no-scrollbar mb-2 border-b pb-1">
                        {tabSections.map((section, index) => (
                            <TabsTrigger
                                key={index}
                                value={index.toString()}
                                className="relative h-10 rounded-none px-4 font-medium text-muted-foreground hover:text-foreground bg-transparent border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 shadow-none transition-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            >
                                <span className="text-sm">{section.label}</span>
                                {tabsWithErrors[index.toString()] && (
                                    <Badge
                                        variant="destructive"
                                        className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full animate-pulse"
                                    >
                                        {tabsWithErrors[index.toString()]}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        ))}
                        {customTabs.map((tab, index) => (
                            <TabsTrigger
                                key={`custom-${index}`}
                                value={`custom-${index}`}
                                className="relative h-10 rounded-t-md border-b-2 border-transparent px-4 font-medium text-muted-foreground hover:text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:border-none bg-transparent shadow-none transition-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            >
                                <span className="text-sm">{tab.label}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {tabSections.map((section, index) => (
                        <TabsContent
                            key={index}
                            value={index.toString()}
                            className="mt-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                        >
                            <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                                {/* Show tab-level error summary if there are errors in this tab */}
                                {tabsWithErrors[index.toString()] && hasAttemptedSubmit && (
                                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-red-800 mb-1">
                                                    {tabsWithErrors[index.toString()]} Required Field{tabsWithErrors[index.toString()] > 1 ? 's' : ''} Missing
                                                </h4>
                                                <p className="text-xs text-red-700">
                                                    Please fill in all required fields marked with red borders below.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <DynamicForm
                                    fields={section.fields}
                                    allFields={fields}
                                    initialData={formData}
                                    onSubmit={handleSubmit}
                                    onCancel={onCancel}
                                    loading={loading}
                                    doctype={doctype}
                                    docname={docname}
                                    onFieldChange={handleFieldChange}
                                    title={section.label}
                                    onSubmitDoc={onSubmitDoc}
                                    onCancelDoc={onCancelDoc}
                                    onAmendDoc={onAmendDoc}
                                    fieldErrors={fieldErrors}
                                    hasAttemptedSubmit={hasAttemptedSubmit}
                                    showTitle={false}
                                    headerActions={renderHeaderActions?.(section.label)}
                                />

                                {additionalTabContent[section.label] && (
                                    <div className="mt-6">{additionalTabContent[section.label]}</div>
                                )}
                            </div>
                        </TabsContent>
                    ))}

                    {customTabs.map((tab, index) => (
                        <TabsContent
                            key={`custom-${index}`}
                            value={`custom-${index}`}
                            className="mt-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                        >
                            <div className="animate-in fade-in-from-bottom-2 duration-300">
                                {tab.content}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        );
    }
);

TabbedDynamicForm.displayName = 'TabbedDynamicForm';