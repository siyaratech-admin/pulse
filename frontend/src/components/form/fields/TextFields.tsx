/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from 'react';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import type { FormFieldProps } from '../../../types/form';
import { cn } from '../../../lib/utils';
import RichTextEditor from '../controls/RichTextEditor';
import { FieldWrapper } from '../../ui/form/FieldWrapper';

// Extended props interface for text fields
interface TextFieldPropsExtended extends FormFieldProps {
    showLabel?: boolean; // Controls label visibility (default: true for forms)
    scrollToError?: boolean; // Enable auto-scroll to error (default: true)
    isFirstError?: boolean; // Flag to indicate if this is the first error field
}

const renderLabel = (field: any) => (
    <Label htmlFor={field.fieldname} className="text-sm font-medium">
        {field.label}
        {!!field.reqd && <span className="text-red-500 ml-1">*</span>}
    </Label>
);

const renderError = (error?: string) =>
    error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <span className="inline-block">⚠</span>
            {error}
        </p>
    );

const renderDescription = (description?: string) =>
    description && <p className="text-xs text-gray-500 mt-1">{description}</p>;

// Custom hook for auto-resizing textarea
const useAutoResize = (value: any) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        // Set new height based on content
        textarea.style.height = `${textarea.scrollHeight}px`;
    }, [value]);

    return textareaRef;
};

// Custom hook for error scrolling
const useErrorScroll = (
    error: string | undefined,
    isFirstError: boolean,
    scrollToError: boolean
) => {
    const fieldRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (error && isFirstError && scrollToError && fieldRef.current) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                fieldRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });

                // Focus the input field
                const textarea = fieldRef.current?.querySelector('textarea');
                textarea?.focus();
            }, 100);
        }
    }, [error, isFirstError, scrollToError]);

    return fieldRef;
};

// ✅ Helper function to safely get label text
const getSafeLabel = (label: any): string => {
    if (typeof label === 'string' && label.trim()) {
        return label.toLowerCase();
    }
    return 'value';
};

export const TextField: React.FC<TextFieldPropsExtended> = ({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    className,
    showLabel = true,
    scrollToError = true,
    isFirstError = false,
}) => {
    const fieldRef = useErrorScroll(error, isFirstError, scrollToError);
    const textareaRef = useAutoResize(value);
    const safeLabel = getSafeLabel(field.label);

    return (
        <div ref={fieldRef} className={className}>
            <FieldWrapper
                fieldname={field.fieldname}
                label={showLabel ? (field.label || '') : undefined}
                required={Boolean(field.reqd)}
                description={field.description}
                error={error}
                disabled={disabled || Boolean(field.read_only)}
                className="w-full"
            >
                <Textarea
                    ref={textareaRef}
                    id={field.fieldname}
                    name={field.fieldname}
                    data-fieldname={field.fieldname || ''}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    disabled={disabled || Boolean(field.read_only)}
                    placeholder={field.description ?? `Enter ${safeLabel}`}
                    rows={3}
                    maxLength={field.length || 1000}
                    className={cn(
                        "resize-none overflow-hidden min-h-[80px]", // Auto-resize styles
                        error && "border-red-500 focus:ring-red-500 focus:border-red-500",
                        field.read_only && "bg-gray-100 text-gray-800 cursor-not-allowed opacity-90 font-medium"
                    )}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${field.fieldname}-error` : undefined}
                />
            </FieldWrapper>
        </div>
    );
};

export const SmallTextField: React.FC<TextFieldPropsExtended> = ({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    className,
    showLabel = true,
    scrollToError = true,
    isFirstError = false,
}) => {
    const fieldRef = useErrorScroll(error, isFirstError, scrollToError);
    const textareaRef = useAutoResize(value);
    // ✅ FIX: Safely handle null/undefined label
    const safeLabel = getSafeLabel(field.label);

    return (
        <div ref={fieldRef} className={className}>
            <FieldWrapper
                fieldname={field.fieldname}
                label={showLabel ? (field.label || '') : undefined}
                required={Boolean(field.reqd)}
                description={field.description}
                error={error}
                disabled={disabled || Boolean(field.read_only)}
                className="w-full"
            >
                <Textarea
                    ref={textareaRef}
                    id={field.fieldname}
                    name={field.fieldname}
                    data-fieldname={field.fieldname || ''}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    disabled={disabled || Boolean(field.read_only)}
                    placeholder={field.description || `Enter ${safeLabel}`}
                    rows={2}
                    maxLength={field.length || 500}
                    className={cn(
                        "resize-none overflow-hidden min-h-[60px]",
                        error && "border-red-500 focus:ring-red-500 focus:border-red-500",
                        field.read_only && "bg-gray-100 text-gray-800 cursor-not-allowed opacity-90 font-medium"
                    )}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${field.fieldname}-error` : undefined}
                />
            </FieldWrapper>
        </div>
    );
};

export const LongTextField: React.FC<TextFieldPropsExtended> = ({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    className,
    showLabel = true,
    scrollToError = true,
    isFirstError = false,
}) => {
    const fieldRef = useErrorScroll(error, isFirstError, scrollToError);
    const textareaRef = useAutoResize(value);
    // ✅ FIX: Safely handle null/undefined label
    const safeLabel = getSafeLabel(field.label);

    return (
        <div ref={fieldRef} className={className}>
            <FieldWrapper
                fieldname={field.fieldname}
                label={showLabel ? (field.label || '') : undefined}
                required={Boolean(field.reqd)}
                description={field.description}
                error={error}
                disabled={disabled || Boolean(field.read_only)}
                className="w-full"
            >
                <Textarea
                    ref={textareaRef}
                    id={field.fieldname}
                    name={field.fieldname}
                    data-fieldname={field.fieldname || ''}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    disabled={disabled || Boolean(field.read_only)}
                    placeholder={field.description || `Enter ${safeLabel}`}
                    rows={8}
                    className={cn(
                        "resize-none overflow-hidden min-h-[150px]",
                        error && "border-red-500 focus:ring-red-500 focus:border-red-500",
                        field.read_only && "bg-gray-100 text-gray-800 cursor-not-allowed opacity-90 font-medium"
                    )}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${field.fieldname}-error` : undefined}
                />
            </FieldWrapper>
        </div>
    );
};

export const CodeField: React.FC<TextFieldPropsExtended> = ({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    className,
    showLabel = true,
    scrollToError = true,
    isFirstError = false,
}) => {
    const fieldRef = useErrorScroll(error, isFirstError, scrollToError);
    const textareaRef = useAutoResize(value);
    // ✅ FIX: Safely handle null/undefined label
    const safeLabel = getSafeLabel(field.label);

    return (
        <div ref={fieldRef} className={className}>
            <FieldWrapper
                fieldname={field.fieldname}
                label={showLabel ? (field.label || '') : undefined}
                required={Boolean(field.reqd)}
                description={field.description}
                error={error}
                disabled={disabled || Boolean(field.read_only)}
                className="w-full"
            >
                <Textarea
                    ref={textareaRef}
                    id={field.fieldname}
                    name={field.fieldname}
                    data-fieldname={field.fieldname || ''}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    disabled={disabled || Boolean(field.read_only)}
                    placeholder={field.description || `Enter ${safeLabel}`}
                    rows={6}
                    className={cn(
                        "font-mono text-sm resize-none overflow-hidden min-h-[150px]",
                        error && "border-red-500 focus:ring-red-500 focus:border-red-500",
                        field.read_only && "bg-gray-100 text-gray-800 cursor-not-allowed opacity-90 font-medium"
                    )}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${field.fieldname}-error` : undefined}
                />
            </FieldWrapper>
        </div>
    );
};

export const TextEditorField: React.FC<TextFieldPropsExtended> = ({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    className,
    showLabel = true,
    scrollToError = true,
    isFirstError = false,
}) => {
    const fieldRef = useErrorScroll(error, isFirstError, scrollToError);

    const handleChange = (newValue: string) => {
        console.log('📝 [1] TextEditorField.handleChange called:', {
            fieldname: field.fieldname,
            newValue,
            newValueLength: newValue?.length,
            hasContent: newValue && newValue.replace(/<[^>]*>/g, '').trim().length > 0
        });

        // CRITICAL: Call onChange immediately
        onChange(newValue);
    };

    console.log('🔄 [0] TextEditorField render:', {
        fieldname: field.fieldname,
        currentValue: value,
        valueLength: value?.length,
        hasError: !!error
    });

    return (
        <div ref={fieldRef} className={className}>
            <FieldWrapper
                fieldname={field.fieldname}
                label={showLabel ? (field.label || '') : undefined}
                required={Boolean(field.reqd)}
                description={field.description}
                error={error}
                disabled={disabled || Boolean(field.read_only)}
                className="w-full"
            >
                <div
                    className={cn(
                        "relative",
                        error && "ring-2 ring-red-500 rounded-md"
                    )}
                >
                    <RichTextEditor
                        value={value || ''}
                        onChange={handleChange}
                        disabled={disabled || Boolean(field.read_only)}
                        placeholder={field.description || "Enter rich text content"}
                    />
                </div>
            </FieldWrapper>
        </div>
    );
};