/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Save, X, Loader2, AlertCircle, RotateCcw, CheckCircle2, XCircle, Plus } from 'lucide-react';
import type { DynamicFormProps, FormData, FormErrors, FieldMetadata } from '../../types/form';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import { cn } from '../../lib/utils';
import { ConditionEvaluator } from '../../utils/conditionEvaluator';
import { useFormAutoSave } from '../../hooks/useFormAutoSave';
import { AutoSaveStatus } from './AutoSaveStatus';
import { buildFetchFromMap, autoPopulateFetchFromFields } from '../../utils/linkFieldHelpers';

const isHTMLEmpty = (html: string | null | undefined): boolean => {
    if (!html || html.trim() === '') return true;
    const text = html.replace(/<[^>]*>/g, '').trim();
    const cleanText = text
        .replace(/&nbsp;/g, '')
        .replace(/\u00a0/g, '')
        .replace(/\s+/g, '')
        .trim();
    return cleanText.length === 0;
};

export const DynamicForm: React.FC<DynamicFormProps> = ({
    fields,
    allFields,
    initialData = {},
    onSubmit,
    onCancel,
    loading = false,
    className,
    doctype: _doctype,
    title,
    description,
    docname,
    onFieldChange,
    onSubmitDoc,
    onCancelDoc,
    onAmendDoc,
    fieldErrors = {},
    hasAttemptedSubmit = false,
    showTitle = true,
    headerActions
}) => {
    const isNew = !docname || docname === 'new';
    const doctype = _doctype || 'DefaultForm';
    const logicFields = allFields || fields;

    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'saving' | 'submitting' | 'cancelling' | 'amending'>('idle');
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const fieldRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    // CRITICAL: Track if initialData effect should run
    const shouldProcessInitialDataRef = useRef(true);

    const initFormData = () => {
        const dataWithDefaults = { ...initialData };

        const getTodayDate = () => {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const getCurrentDateTime = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };

        logicFields.forEach(field => {
            if (field.default !== undefined && dataWithDefaults[field.fieldname] === undefined) {
                let defaultValue = field.default;

                if (field.fieldtype === 'Date') {
                    if (typeof defaultValue === 'string') {
                        const lowerDefault = defaultValue.toLowerCase().trim();
                        if (lowerDefault === 'today' || lowerDefault === 'now') {
                            defaultValue = getTodayDate();
                        } else if (lowerDefault === 'yesterday') {
                            const yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            const year = yesterday.getFullYear();
                            const month = String(yesterday.getMonth() + 1).padStart(2, '0');
                            const day = String(yesterday.getDate()).padStart(2, '0');
                            defaultValue = `${year}-${month}-${day}`;
                        } else if (lowerDefault === 'tomorrow') {
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            const year = tomorrow.getFullYear();
                            const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
                            const day = String(tomorrow.getDate()).padStart(2, '0');
                            defaultValue = `${year}-${month}-${day}`;
                        }
                    }
                } else if (field.fieldtype === 'Datetime') {
                    if (typeof defaultValue === 'string') {
                        const lowerDefault = defaultValue.toLowerCase().trim();
                        if (lowerDefault === 'now' || lowerDefault === 'today') {
                            defaultValue = getCurrentDateTime();
                        }
                    }
                }

                dataWithDefaults[field.fieldname] = defaultValue;
            }
        });

        console.log("🎬 [DynamicForm] initFormData:", dataWithDefaults);
        return dataWithDefaults;
    };

    const [formData, setFormData] = useState<FormData>(() => initFormData());
    const [errors, setErrors] = useState<FormErrors>({});
    const [showAutoSaveRestore, setShowAutoSaveRestore] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const [isPageRefresh] = useState(() => {
        const key = 'kbweb_page_loaded';
        const wasLoaded = sessionStorage.getItem(key);
        sessionStorage.setItem(key, 'true');
        return !wasLoaded;
    });

    // CRITICAL: Initialize auto-save hook with proper restore callback
    const {
        saveFormData: saveToAutoSave,
        clearFormData: clearAutoSave,
        hasAutoSaveData,
        autoSaveTimestamp,
        restoreAutoSaveData,
        isRestored,
    } = useFormAutoSave({
        doctype,
        docname,
        debounceMs: 2000,
        enabled: true,
        onRestore: (savedData) => {
            console.log("🔄 [DynamicForm] === onRestore CALLBACK ===");
            console.log("📦 [DynamicForm] Saved data received:", savedData);
            console.log("📊 [DynamicForm] Saved data keys:", Object.keys(savedData));

            // CRITICAL: Prevent initialData effect from running after restore
            shouldProcessInitialDataRef.current = false;

            setFormData(prevData => {
                console.log("📝 [DynamicForm] Previous formData:", prevData);
                console.log("📊 [DynamicForm] Previous data keys:", Object.keys(prevData));

                // Merge: saved data takes precedence over previous data
                const mergedData = { ...prevData, ...savedData };
                console.log("✅ [DynamicForm] Merged formData:", mergedData);
                console.log("📊 [DynamicForm] Merged data keys:", Object.keys(mergedData));
                console.log("✅ [DynamicForm] === RESTORE COMPLETE ===");
                return mergedData;
            });

            setShowAutoSaveRestore(false);
        }
    });

    const hasNoInitialData = Object.keys(initialData).length === 0;

    useEffect(() => {
        if (fieldErrors && Object.keys(fieldErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...fieldErrors }));
        }
    }, [fieldErrors]);

    useEffect(() => {
        if (!isInitialLoad) return;

        const isPageReload = performance.navigation?.type === 1 ||
            (performance.getEntriesByType('navigation')[0] as any)?.type === 'reload';

        if (hasAutoSaveData && hasNoInitialData && (isPageReload || isPageRefresh)) {
            console.log("🔔 [DynamicForm] Showing auto-save restore prompt");
            setShowAutoSaveRestore(true);
        }

        const timer = setTimeout(() => {
            setIsInitialLoad(false);
        }, 100);

        return () => clearTimeout(timer);
    }, [isInitialLoad, hasAutoSaveData, hasNoInitialData, isPageRefresh]);

    useEffect(() => {
        const handleScrollToError = (e: CustomEvent) => {
            const { fieldname } = e.detail;
            const fieldElement = fieldRefs.current[fieldname];

            if (fieldElement) {
                fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

                setTimeout(() => {
                    const inputElement = fieldElement.querySelector('input, textarea, select') as HTMLElement;
                    if (inputElement) {
                        inputElement.focus();
                    }
                    fieldElement.classList.add('animate-shake');
                    setTimeout(() => {
                        fieldElement.classList.remove('animate-shake');
                    }, 500);
                }, 300);
            }
        };

        window.addEventListener('scrollToError', handleScrollToError as EventListener);
        return () => {
            window.removeEventListener('scrollToError', handleScrollToError as EventListener);
        };
    }, []);

    useEffect(() => {
        return () => {
            setTimeout(() => {
                sessionStorage.removeItem('kbweb_page_loaded');
            }, 100);
        };
    }, []);

    // CRITICAL FIX: Only process initialData if we haven't restored from auto-save
    useEffect(() => {
        if (!shouldProcessInitialDataRef.current) {
            console.log("⏭️ [DynamicForm] Skipping initialData effect - already restored from auto-save");
            return;
        }

        if (isRestored) {
            console.log("⏭️ [DynamicForm] Skipping initialData effect - isRestored flag is true");
            return;
        }

        console.log("📥 [DynamicForm] Processing initialData effect");

        const dataWithDefaults = { ...initialData };

        logicFields.forEach(field => {
            if (field.default !== undefined && dataWithDefaults[field.fieldname] === undefined) {
                dataWithDefaults[field.fieldname] = field.default;
            }
        });

        console.log("📥 [DynamicForm] Setting formData from initialData:", dataWithDefaults);
        setFormData(dataWithDefaults);
        setErrors({});

        if (dataWithDefaults.docstatus === 1 || dataWithDefaults.docstatus === 2) {
            console.log("🔒 [DynamicForm] Document is submitted or cancelled");
        }
    }, [logicFields.length]); // Intentionally NOT dependent on initialData or isRestored

    const isSubmitted = formData.docstatus === 1;
    const isCancelled = formData.docstatus === 2;

    const fetchFromMap = useMemo(() => {
        return buildFetchFromMap(logicFields);
    }, [logicFields]);

    const fieldConditions = useMemo(() => {
        return ConditionEvaluator.evaluateFields(logicFields, formData);
    }, [logicFields, formData]);

    // CRITICAL: Completely rewritten handleFieldChange with proper state preservation
    const handleFieldChange = useCallback(async (field: FieldMetadata, value: any) => {
        const fieldName = field.fieldname;
        console.log("🔄 [DynamicForm] handleFieldChange:", { fieldName, value });

        if (field.fieldtype === 'TextEditor' || field.fieldtype === 'HTMLEditor') {
            console.log("📝 [DynamicForm] TextEditor change:", {
                fieldName,
                valueLength: value?.length,
                hasContent: value && value.replace(/<[^>]*>/g, '').trim().length > 0
            });
        }

        // CRITICAL: Use functional setState to ensure latest state
        setFormData(prev => {
            console.log("📦 [DynamicForm] Current state in setter:", Object.keys(prev));

            // Skip if value hasn't changed
            if (prev[fieldName] === value) {
                console.log("⏭️ [DynamicForm] Value unchanged, skipping");
                return prev;
            }

            // Create new state with the updated field
            // CRITICAL: Spread prev first to keep all existing fields
            const newState = {
                ...prev,
                [fieldName]: value
            };

            console.log("✅ [DynamicForm] New state created with keys:", Object.keys(newState));
            console.log("📊 [DynamicForm] Changed field:", fieldName, "=", value);

            // CRITICAL: Save COMPLETE state to auto-save
            // Use setTimeout to avoid state update conflicts
            setTimeout(() => {
                console.log("💾 [DynamicForm] Triggering auto-save with complete state");
                console.log("📊 [DynamicForm] Auto-save data keys:", Object.keys(newState));
                saveToAutoSave(newState);
            }, 0);

            return newState;
        });

        // Store current form data WITH the change for auto-populate
        const currentFormDataWithChange = {
            ...formData,
            [fieldName]: value
        };

        // Auto-populate logic for Link fields
        if (field.fieldtype === 'Link' && value && field.options) {
            const linkDoctype = typeof field.options === 'string' ? field.options : String(field.options);

            try {
                const updatedFormData = await autoPopulateFetchFromFields(
                    fieldName,
                    value,
                    linkDoctype,
                    fetchFromMap,
                    currentFormDataWithChange,
                    logicFields
                );

                console.log("🔄 [DynamicForm] Auto-populate result:", updatedFormData);

                if (JSON.stringify(updatedFormData) !== JSON.stringify(currentFormDataWithChange)) {
                    console.log("⚡ [DynamicForm] Applying auto-populated values");
                    setFormData(updatedFormData);

                    setTimeout(() => {
                        saveToAutoSave(updatedFormData);
                    }, 0);

                    // Notify parent about dependent field changes
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
                console.error(`❌ [DynamicForm] Error processing fetch_from for ${fieldName}:`, error);
            }
        }

        // Notify parent component
        if (onFieldChange) {
            onFieldChange(field, value);
        }

        // Clear field error
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }

        if (validationError) {
            setValidationError(null);
        }
    }, [saveToAutoSave, onFieldChange, fetchFromMap, formData, errors, validationError, fields, logicFields]);

    // ✅ FIXED: Improved validation for Table fields with casing handling
    const validateField = useCallback((field: FieldMetadata, value: any): string | null => {
        const conditions = fieldConditions[field.fieldname];

        if (!conditions?.visible) {
            return null;
        }

        const isRequired = field.reqd || conditions?.required;

        console.log(`🔍 [DynamicForm] validateField: ${field.fieldname}`, {
            fieldtype: field.fieldtype,
            isRequired,
            value,
            isArray: Array.isArray(value),
            valueLength: Array.isArray(value) ? value.length : 'N/A'
        });

        if (isRequired) {
            if (field.fieldtype === 'TextEditor' || field.fieldtype === 'HTMLEditor') {
                if (isHTMLEmpty(value)) {
                    return `${field.label} is required`;
                }
            } else if (field.fieldtype === 'Table' || field.fieldtype === 'TableMultiSelect') {
                // ✅ FIXED: Proper validation for Table fields with casing issue handling
                if (!Array.isArray(value) || value.length === 0) {
                    console.log(`❌ [DynamicForm] Table field ${field.fieldname} is required but empty`);
                    return `${field.label} is required`;
                }

                // ✅ FIX: Check if table rows have actual data, handling field name casing issues
                const hasValidData = value.some((row, rowIndex) => {
                    console.log(`🔍 [DynamicForm] Validating row ${rowIndex} of ${field.fieldname}:`, row);

                    // Filter out internal fields (starting with __)
                    const allKeys = Object.keys(row);
                    const dataFields = allKeys.filter(key => !key.startsWith('__'));

                    // ✅ FIX: Group fields by lowercase name to handle ERPNext casing issues
                    // Problem: ERPNext creates both "Date" (null) and "date" (has value)
                    const fieldsByLowercase = new Map<string, string[]>();
                    dataFields.forEach(key => {
                        const lowerKey = key.toLowerCase();
                        if (!fieldsByLowercase.has(lowerKey)) {
                            fieldsByLowercase.set(lowerKey, []);
                        }
                        fieldsByLowercase.get(lowerKey)!.push(key);
                    });

                    console.log(`   Fields grouped:`, Object.fromEntries(fieldsByLowercase));

                    // Check if at least one field has a non-empty value
                    // When duplicates exist (e.g., "Date" and "date"), prefer lowercase version
                    const hasNonEmptyField = Array.from(fieldsByLowercase.entries()).some(([lowerKey, keys]) => {
                        // Prefer lowercase version if it exists
                        const keyToCheck = keys.find(k => k === lowerKey) || keys[0];
                        const cellValue = row[keyToCheck];

                        console.log(`   Checking "${keyToCheck}" (from ${keys.join(', ')}):`, cellValue);

                        // Check for non-empty values
                        if (cellValue === null || cellValue === undefined || cellValue === '') {
                            return false;
                        }

                        // For numbers, 0 is valid
                        if (typeof cellValue === 'number') {
                            return true;
                        }

                        // For strings, check if not just whitespace
                        if (typeof cellValue === 'string') {
                            return cellValue.trim().length > 0;
                        }

                        // For other types (boolean, objects), consider them valid
                        return true;
                    });

                    console.log(`   Row ${rowIndex} has data: ${hasNonEmptyField}`);
                    return hasNonEmptyField;
                });

                if (!hasValidData) {
                    console.log(`❌ [DynamicForm] Table field ${field.fieldname} has rows but no actual data`);
                    return `${field.label} requires at least one complete entry`;
                }

                console.log(`✅ [DynamicForm] Table field ${field.fieldname} has ${value.length} rows with valid data`);
            } else {
                if (value === null || value === undefined || value === '') {
                    return `${field.label} is required`;
                }
            }
        }

        switch (field.fieldtype) {
            case 'Int':
                if (value !== null && value !== undefined && value !== '' && isNaN(Number(value))) {
                    return `${field.label} must be a valid number`;
                }
                break;
            case 'Float':
            case 'Currency':
                if (value !== null && value !== undefined && value !== '' && isNaN(Number(value))) {
                    return `${field.label} must be a valid decimal number`;
                }
                break;
            case 'Date':
                if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    return `${field.label} must be a valid date (YYYY-MM-DD)`;
                }
                break;
            case 'Time':
                if (value && !/^\d{2}:\d{2}$/.test(value)) {
                    return `${field.label} must be a valid time (HH:MM)`;
                }
                break;
            case 'Email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return `${field.label} must be a valid email address`;
                }
                break;
            case 'Phone':
                if (value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
                    return `${field.label} must be a valid phone number`;
                }
                break;
            case 'Data':
                if (value && field.length && value.length > field.length) {
                    return `${field.label} cannot exceed ${field.length} characters`;
                }
                break;
        }

        return null;
    }, [fieldConditions]);

    const scrollToFirstError = useCallback((errorFields: string[]) => {
        if (errorFields.length === 0) return;

        const firstErrorField = errorFields[0];
        const fieldElement = fieldRefs.current[firstErrorField];

        if (fieldElement) {
            fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

            setTimeout(() => {
                const inputElement = fieldElement.querySelector('input, textarea, select') as HTMLElement;
                if (inputElement) {
                    inputElement.focus();
                    fieldElement.classList.add('animate-shake');
                    setTimeout(() => {
                        fieldElement.classList.remove('animate-shake');
                    }, 500);
                }
            }, 300);
        }
    }, []);

    const validateForm = useCallback((): boolean => {
        console.log("🔍 [DynamicForm] validateForm called");
        console.log("📝 [DynamicForm] Current Form Data keys:", Object.keys(formData));
        console.log("📝 [DynamicForm] Current Form Data:", formData);

        const newErrors: FormErrors = {};
        let isValid = true;

        fields.forEach(field => {
            if (['Section Break', 'Column Break', 'Tab Break', 'HTML', 'Button'].includes(field.fieldtype)) {
                return;
            }

            const conditions = fieldConditions[field.fieldname] || { visible: true, required: false, readOnly: false };

            if (field.hidden || !conditions.visible || field.read_only || conditions.readOnly) {
                return;
            }

            const value = formData[field.fieldname];
            const isRequired = field.reqd || conditions?.required;

            console.log(`🔍 [DynamicForm] Validating field: ${field.fieldname}`, {
                fieldtype: field.fieldtype,
                isRequired,
                value,
                valueType: typeof value,
                isArray: Array.isArray(value)
            });

            if (isRequired) {
                let isEmpty = false;

                if (field.fieldtype === 'TextEditor' || field.fieldtype === 'HTMLEditor') {
                    isEmpty = isHTMLEmpty(value);
                } else if (field.fieldtype === 'Table' || field.fieldtype === 'TableMultiSelect') {
                    // ✅ FIXED: Check if Table field is empty OR has no valid data (with casing fix)
                    isEmpty = !Array.isArray(value) || value.length === 0;

                    console.log(`🔍 [DynamicForm] Table field ${field.fieldname} isEmpty: ${isEmpty}, length: ${Array.isArray(value) ? value.length : 'N/A'}`);

                    // ✅ FIX: Even if array has items, check if they contain actual data (handling casing issues)
                    if (!isEmpty) {
                        const hasValidData = value.some((row, rowIndex) => {
                            // Filter out internal fields (starting with __)
                            const allKeys = Object.keys(row);
                            const dataFields = allKeys.filter(key => !key.startsWith('__'));

                            // ✅ FIX: Group fields by lowercase name
                            const fieldsByLowercase = new Map<string, string[]>();
                            dataFields.forEach(key => {
                                const lowerKey = key.toLowerCase();
                                if (!fieldsByLowercase.has(lowerKey)) {
                                    fieldsByLowercase.set(lowerKey, []);
                                }
                                fieldsByLowercase.get(lowerKey)!.push(key);
                            });

                            // Check if at least one field has a non-empty value
                            // Prefer lowercase version when duplicates exist
                            return Array.from(fieldsByLowercase.entries()).some(([lowerKey, keys]) => {
                                const keyToCheck = keys.find(k => k === lowerKey) || keys[0];
                                const cellValue = row[keyToCheck];

                                // Check for non-empty values
                                if (cellValue === null || cellValue === undefined || cellValue === '') {
                                    return false;
                                }

                                // For numbers, 0 is valid
                                if (typeof cellValue === 'number') {
                                    return true;
                                }

                                // For strings, check if not just whitespace
                                if (typeof cellValue === 'string') {
                                    return cellValue.trim().length > 0;
                                }

                                // For other types (boolean, objects), consider them valid
                                return true;
                            });
                        });

                        if (!hasValidData) {
                            isEmpty = true;
                            console.log(`❌ [DynamicForm] Table field ${field.fieldname} has rows but no actual data`);
                        } else {
                            console.log(`✅ [DynamicForm] Table field ${field.fieldname} has valid data`);
                        }
                    }
                } else {
                    isEmpty = value === undefined ||
                        value === null ||
                        value === '' ||
                        (Array.isArray(value) && value.length === 0);
                }

                if (isEmpty) {
                    newErrors[field.fieldname] = field.fieldtype === 'Table' || field.fieldtype === 'TableMultiSelect'
                        ? `${field.label} requires at least one complete entry`
                        : `${field.label} is required`;
                    isValid = false;
                    console.log(`❌ [DynamicForm] Field ${field.fieldname} is required but empty`);
                }
            }

            const error = validateField(field, value);
            if (error) {
                newErrors[field.fieldname] = error;
                isValid = false;
            }
        });

        console.log("📋 [DynamicForm] Validation errors:", newErrors);
        setErrors(newErrors);

        if (!isValid) {
            const errorFieldNames = Object.keys(newErrors);
            const errorCount = errorFieldNames.length;
            const errorMessage = `Please fix ${errorCount} validation error${errorCount !== 1 ? 's' : ''} before submitting`;
            setValidationError(errorMessage);
            scrollToFirstError(errorFieldNames);
            setTimeout(() => {
                setValidationError(null);
            }, 5000);
            return false;
        }

        return true;
    }, [fields, formData, fieldConditions, validateField, scrollToFirstError]);

    // Add this enhanced cleanFormDataForSubmission function to your DynamicForm.tsx
    // Replace the existing cleanFormDataForSubmission function with this version

    const cleanFormDataForSubmission = useCallback((data: FormData) => {
        const cleanedData: any = {};

        const getTodayDate = () => {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const getCurrentDateTime = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };

        Object.keys(data).forEach(key => {
            const value = data[key];
            const field = fields.find(f => f.fieldname === key);

            // ✅ Handle empty/null values
            if (value === null || value === undefined || value === '') {
                if (field?.fieldtype === 'Check') {
                    cleanedData[key] = 0;
                }
                return;
            }

            if (field) {
                switch (field.fieldtype) {
                    case 'Check':
                        cleanedData[key] = value ? 1 : 0;
                        break;

                    case 'Int':
                        const intValue = parseInt(value, 10);
                        if (!isNaN(intValue)) {
                            cleanedData[key] = intValue;
                        }
                        break;

                    case 'Float':
                    case 'Currency':
                    case 'Percent':
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                            cleanedData[key] = numValue;
                        }
                        break;

                    case 'Time':
                        if (typeof value === 'string') {
                            if (/^\d{2}:\d{2}$/.test(value)) {
                                cleanedData[key] = `${value}:00`;
                            } else if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
                                cleanedData[key] = value;
                            }
                        }
                        break;

                    case 'Table':
                    case 'TableMultiSelect':
                        if (Array.isArray(value)) {
                            cleanedData[key] = value.map(row => {
                                const cleanRow: any = {};
                                Object.keys(row).forEach(rowKey => {
                                    if (rowKey.startsWith('__') || row[rowKey] === null || row[rowKey] === undefined || row[rowKey] === '') {
                                        return;
                                    }

                                    // ✅ FIX: Handle "Today" in child table date fields
                                    let cellValue = row[rowKey];

                                    // Check if this looks like a date field and has "Today"
                                    if (typeof cellValue === 'string') {
                                        const lowerValue = cellValue.toLowerCase().trim();

                                        // If field name contains 'date' and value is "Today"
                                        if (rowKey.toLowerCase().includes('date') &&
                                            (lowerValue === 'today' || lowerValue === 'now')) {
                                            cellValue = getTodayDate();
                                            console.log(`🔄 [cleanFormData] Converted child table "${rowKey}" from "Today" to ${cellValue}`);
                                        }
                                        // If field name contains 'time' and value is "Now"
                                        else if (rowKey.toLowerCase().includes('time') && lowerValue === 'now') {
                                            const now = new Date();
                                            const hours = String(now.getHours()).padStart(2, '0');
                                            const minutes = String(now.getMinutes()).padStart(2, '0');
                                            const seconds = String(now.getSeconds()).padStart(2, '0');
                                            cellValue = `${hours}:${minutes}:${seconds}`;
                                        }
                                    }

                                    cleanRow[rowKey] = cellValue;
                                });
                                return cleanRow;
                            });
                        }
                        break;

                    case 'Attach':
                    case 'AttachImage':
                        if (typeof value === 'string') {
                            cleanedData[key] = value;
                        }
                        break;

                    case 'Date':
                        if (typeof value === 'string') {
                            const lowerValue = value.toLowerCase().trim();
                            if (lowerValue === 'today' || lowerValue === 'now') {
                                cleanedData[key] = getTodayDate();
                            } else if (lowerValue === 'yesterday') {
                                const yesterday = new Date();
                                yesterday.setDate(yesterday.getDate() - 1);
                                const year = yesterday.getFullYear();
                                const month = String(yesterday.getMonth() + 1).padStart(2, '0');
                                const day = String(yesterday.getDate()).padStart(2, '0');
                                cleanedData[key] = `${year}-${month}-${day}`;
                            } else if (lowerValue === 'tomorrow') {
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                const year = tomorrow.getFullYear();
                                const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
                                const day = String(tomorrow.getDate()).padStart(2, '0');
                                cleanedData[key] = `${year}-${month}-${day}`;
                            } else {
                                const date = new Date(value);
                                if (!isNaN(date.getTime())) {
                                    const year = date.getFullYear();
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const day = String(date.getDate()).padStart(2, '0');
                                    cleanedData[key] = `${year}-${month}-${day}`;
                                } else {
                                    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                                        cleanedData[key] = value;
                                    }
                                }
                            }
                        } else if (value instanceof Date) {
                            const year = value.getFullYear();
                            const month = String(value.getMonth() + 1).padStart(2, '0');
                            const day = String(value.getDate()).padStart(2, '0');
                            cleanedData[key] = `${year}-${month}-${day}`;
                        }
                        break;

                    case 'Datetime':
                        if (typeof value === 'string') {
                            const lowerValue = value.toLowerCase().trim();
                            if (lowerValue === 'now' || lowerValue === 'today') {
                                cleanedData[key] = getCurrentDateTime();
                            } else {
                                const date = new Date(value);
                                if (!isNaN(date.getTime())) {
                                    const year = date.getFullYear();
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const hours = String(date.getHours()).padStart(2, '0');
                                    const minutes = String(date.getMinutes()).padStart(2, '0');
                                    const seconds = String(date.getSeconds()).padStart(2, '0');
                                    cleanedData[key] = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                                } else {
                                    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
                                        cleanedData[key] = value;
                                    }
                                }
                            }
                        } else if (value instanceof Date) {
                            const year = value.getFullYear();
                            const month = String(value.getMonth() + 1).padStart(2, '0');
                            const day = String(value.getDate()).padStart(2, '0');
                            const hours = String(value.getHours()).padStart(2, '0');
                            const minutes = String(value.getMinutes()).padStart(2, '0');
                            const seconds = String(value.getSeconds()).padStart(2, '0');
                            cleanedData[key] = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                        }
                        break;

                    default:
                        if (typeof value !== 'object' || value instanceof Date) {
                            cleanedData[key] = value;
                        }
                        break;
                }
            } else {
                // ✅ NEW: Field not found in metadata - apply catch-all "Today" conversion
                if (typeof value === 'string') {
                    const lowerValue = value.toLowerCase().trim();

                    // Check if it's a date-like field name with "Today"
                    if (key.toLowerCase().includes('date') &&
                        (lowerValue === 'today' || lowerValue === 'now')) {
                        console.warn(`⚠️ [cleanFormData] Field "${key}" not in metadata but contains "Today" - converting`);
                        cleanedData[key] = getTodayDate();
                    }
                    // Check if it's a datetime-like field with "Now"
                    else if (key.toLowerCase().includes('datetime') && lowerValue === 'now') {
                        console.warn(`⚠️ [cleanFormData] Field "${key}" not in metadata but contains "Now" - converting`);
                        cleanedData[key] = getCurrentDateTime();
                    }
                    else {
                        cleanedData[key] = value;
                    }
                } else if (typeof value !== 'object' || value instanceof Date) {
                    cleanedData[key] = value;
                }
            }
        });

        // ✅ FINAL CATCH-ALL: Scan all string values one more time for any remaining "Today"
        Object.keys(cleanedData).forEach(key => {
            const value = cleanedData[key];
            if (typeof value === 'string') {
                const lowerValue = value.toLowerCase().trim();
                if (lowerValue === 'today' || lowerValue === 'now') {
                    console.warn(`🔥 [cleanFormData] CATCH-ALL: Found remaining "Today" in field "${key}" - converting`);
                    cleanedData[key] = getTodayDate();
                }
            }
        });

        console.log("🧹 [DynamicForm] Cleaned form data:", cleanedData);
        return cleanedData;
    }, [fields]);

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        console.log("🚀 [DynamicForm] Form submit (Save) clicked");
        setSubmitError(null);
        setSubmitSuccess(false);
        setValidationError(null);

        const isFormValid = validateForm();
        if (!isFormValid) return;

        const cleanedData = cleanFormDataForSubmission(formData);

        setSubmissionStatus('saving');
        try {
            await onSubmit(cleanedData);
            clearAutoSave();
            setSubmitSuccess(true);
            setTimeout(() => {
                setSubmitSuccess(false);
            }, 3000);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save form';
            console.error("❌ [DynamicForm] Save error:", errorMessage, error);
            setSubmitError(errorMessage);
        } finally {
            setSubmissionStatus('idle');
        }
    }, [formData, validateForm, onSubmit, cleanFormDataForSubmission, clearAutoSave]);

    const handleCancel = useCallback(() => {
        clearAutoSave();
        if (onCancel) {
            onCancel();
        }
    }, [onCancel, clearAutoSave]);

    const fieldGroups = React.useMemo(() => {
        const groups: { title?: string; fields: FieldMetadata[] }[] = [];
        let currentGroup: { title?: string; fields: FieldMetadata[] } = { fields: [] };

        fields.forEach(field => {
            if (field.fieldtype === 'Section Break') {
                if (currentGroup.fields.length > 0) {
                    groups.push(currentGroup);
                }
                currentGroup = { title: field.label, fields: [] };
            } else if (!['Column Break', 'Tab Break', 'HTML', 'Button'].includes(field.fieldtype)) {
                const conditions = fieldConditions[field.fieldname];
                if (!field.hidden && conditions?.visible !== false) {
                    currentGroup.fields.push(field);
                }
            }
        });

        if (currentGroup.fields.length > 0) {
            groups.push(currentGroup);
        }

        const visibleFields = fields.filter(f => {
            if (['Section Break', 'Column Break', 'Tab Break', 'HTML', 'Button'].includes(f.fieldtype)) {
                return false;
            }
            if (f.hidden) return false;
            const conditions = fieldConditions[f.fieldname];
            return conditions?.visible !== false;
        });

        return groups.length > 0 ? groups : [{ fields: visibleFields }];
    }, [fields, fieldConditions]);

    const errorCount = Object.keys(errors).filter(key => errors[key]).length;

    return (
        <div className={cn("flex flex-col min-h-full relative", className)}>
            <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>

            {/* Loading Overlay */}
            {(submissionStatus !== 'idle' || loading) && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-8 shadow-2xl max-w-sm w-full mx-4">
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full border-2 border-blue-200 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-gray-900">Submitting Form...</h3>
                                <p className="text-gray-600 text-sm">Please wait while we save your data</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Validation Error Toast */}
            {validationError && (
                <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-5 duration-300">
                    <div className="bg-red-600 text-white rounded-lg shadow-2xl px-6 py-4 flex items-center gap-3 min-w-[320px] max-w-md">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-sm">Validation Error</h4>
                            <p className="text-xs text-red-50 mt-0.5">{validationError}</p>
                        </div>
                        <button
                            onClick={() => setValidationError(null)}
                            className="flex-shrink-0 text-red-100 hover:text-white transition-colors"
                            aria-label="Close notification"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Submit Error Alert */}
            {submitError && (
                <div className="px-6 pt-4">
                    <Alert className="border-red-200 bg-red-50">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="font-semibold text-red-800 mb-1">Submission Failed</div>
                                    <div className="text-sm">{submitError}</div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSubmitError(null)}
                                    className="text-red-700 hover:text-red-900 hover:bg-red-100 ml-4 shrink-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Auto-save Restore Banner */}
            {showAutoSaveRestore && (
                <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <RotateCcw className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-800">
                                Found auto-saved data from{' '}
                                {autoSaveTimestamp ? new Date(autoSaveTimestamp).toLocaleString() : 'earlier'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowAutoSaveRestore(false)}
                                className="text-xs h-7"
                            >
                                Dismiss
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => {
                                    console.log("🔄 [DynamicForm] Restore button clicked");
                                    restoreAutoSaveData();
                                }}
                                className="text-xs h-7"
                            >
                                Restore Data
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            {(title || description || (headerActions && showTitle !== false)) && (
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            {title && (showTitle ?? true) && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
                            {!isNew && (
                                <div
                                    className={cn(
                                        "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                        formData.docstatus === 1
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : formData.docstatus === 2
                                                ? "bg-red-50 text-red-700 border-red-200"
                                                : "bg-gray-100 text-gray-700 border-gray-200"
                                    )}
                                >
                                    {formData.docstatus === 1 ? "Submitted" : formData.docstatus === 2 ? "Cancelled" : "Draft"}
                                </div>
                            )}
                        </div>
                        {description && <p className="text-sm text-gray-600">{description}</p>}
                    </div>
                    {headerActions && (
                        <div className="flex gap-2">
                            {headerActions}
                        </div>
                    )}
                </div>
            )}

            {/* Form Content */}
            <div className="flex-1 pb-6 w-full">
                <div className="space-y-4 w-full">
                    {fieldGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className="w-full rounded-sm bg-white">
                            {group.title && (
                                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                                    <h3 className="text-base font-medium text-gray-900">{group.title}</h3>
                                </div>
                            )}
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                    {group.fields.map((field) => {
                                        const conditions = fieldConditions[field.fieldname] || { visible: true, required: false, readOnly: false };

                                        if (!conditions.visible) {
                                            return null;
                                        }

                                        const hasError = !!(errors[field.fieldname] || fieldErrors[field.fieldname]);
                                        const errorMessage = errors[field.fieldname] || fieldErrors[field.fieldname];

                                        return (
                                            <div
                                                key={field.fieldname}
                                                ref={(el) => {
                                                    fieldRefs.current[field.fieldname] = el;
                                                }}
                                                className={cn(
                                                    "w-full transition-all duration-200 relative",
                                                    field.fieldtype === 'Table' && "sm:col-span-2",
                                                    ['Text', 'Long Text', 'Text Editor', 'Code'].includes(field.fieldtype) && "sm:col-span-2",
                                                    (field.fieldname === 'terms' || field.label?.includes('Terms and Conditions')) && "min-h-[400px] sm:col-span-2",
                                                    hasError && hasAttemptedSubmit && "ring-2 ring-red-500 rounded-lg p-3 -m-3 bg-red-50/50"
                                                )}
                                            >
                                                {hasError && hasAttemptedSubmit && (
                                                    <div className="absolute -top-1 -right-1 z-20">
                                                        <div className="relative">
                                                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                                                            <div className="relative bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                                                                <AlertCircle className="h-3 w-3" />
                                                                Required
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <DynamicFieldRenderer
                                                    field={{
                                                        ...field,
                                                        reqd: field.reqd || conditions.required,
                                                        read_only: field.read_only || conditions.readOnly
                                                    }}
                                                    value={formData[field.fieldname]}
                                                    onChange={(value) => handleFieldChange(field, value)}
                                                    error={errorMessage}
                                                    disabled={loading || submissionStatus !== 'idle' || conditions.readOnly || isSubmitted || isCancelled}
                                                    formData={formData}
                                                    parentDoctype={doctype}
                                                />

                                                {hasError && errorMessage && hasAttemptedSubmit && (
                                                    <div className="mt-2 flex items-start gap-2 text-red-700 bg-red-100 border border-red-300 rounded-md p-2 animate-in slide-in-from-top-2">
                                                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                        <p className="text-sm font-medium">{errorMessage}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sticky Footer */}
            <div
                className={cn(
                    "fixed bottom-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40",
                    "left-0",
                    "lg:left-[260px]",
                    "xl:left-[290px]"
                )}
            >
                <div className="w-full px-4 py-3 sm:px-8">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                            {errorCount > 0 && (
                                <Alert className="w-auto border-red-300 bg-red-50 py-2">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-700 font-medium text-sm">
                                        {errorCount} error{errorCount !== 1 ? 's' : ''} found
                                    </AlertDescription>
                                </Alert>
                            )}
                            <AutoSaveStatus isAutoSaveEnabled={true} lastSaved={autoSaveTimestamp} />
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                            {onCancel && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={loading || submissionStatus !== 'idle'}
                                    className="min-w-[100px]"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Close
                                </Button>
                            )}

                            {!isSubmitted && !isCancelled && (
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={loading || submissionStatus !== 'idle'}
                                        variant="outline"
                                        className="min-w-[100px]"
                                    >
                                        {loading || submissionStatus === 'saving' ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-1" />
                                                Save
                                            </>
                                        )}
                                    </Button>

                                    {onSubmitDoc && docname && !isNew && (
                                        <Button
                                            type="button"
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();

                                                const isValid = validateForm();
                                                if (!isValid) return;

                                                const cleanedData = cleanFormDataForSubmission(formData);

                                                setSubmissionStatus('submitting');
                                                try {
                                                    await onSubmitDoc(cleanedData);
                                                } catch (error: any) {
                                                    setSubmitError(error.message || "Failed to submit");
                                                } finally {
                                                    setSubmissionStatus('idle');
                                                }
                                            }}
                                            disabled={loading || submissionStatus !== 'idle'}
                                            className="min-w-[100px] bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-700 hover:to-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {submissionStatus === 'submitting' ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                                    Submit
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            )}

                            {isSubmitted && onCancelDoc && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={async () => {
                                        setSubmissionStatus('cancelling');
                                        try {
                                            await onCancelDoc();
                                        } catch (error: any) {
                                            setSubmitError(error.message || "Failed to cancel");
                                        } finally {
                                            setSubmissionStatus('idle');
                                        }
                                    }}
                                    disabled={loading || submissionStatus !== 'idle'}
                                    className="min-w-[100px] text-white"
                                >
                                    {submissionStatus === 'cancelling' ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                            Cancelling...
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 mr-1" />
                                            Cancel
                                        </>
                                    )}
                                </Button>
                            )}

                            {isCancelled && onAmendDoc && (
                                <Button
                                    type="button"
                                    onClick={async () => {
                                        setSubmissionStatus('amending');
                                        try {
                                            await onAmendDoc();
                                        } catch (error: any) {
                                            setSubmitError(error.message || "Failed to amend");
                                            setSubmissionStatus('idle');
                                        }
                                    }}
                                    disabled={loading || submissionStatus !== 'idle'}
                                    className="min-w-[100px]"
                                >
                                    {submissionStatus === 'amending' ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                            Amending...
                                        </>
                                    ) : (
                                        <>
                                            <RotateCcw className="h-4 w-4 mr-1" />
                                            Amend
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};