/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import type { FormFieldProps } from '../../../types/form';
import { cn } from '../../../lib/utils';
import { FieldWrapper } from '../../ui/form/FieldWrapper';

// Extended props interface for duration fields
interface DurationFieldPropsExtended extends FormFieldProps {
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

// Custom hook for error scrolling
const useErrorScroll = (
    error: string | undefined,
    isFirstError: boolean,
    scrollToError: boolean
) => {
    const fieldRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (error && isFirstError && scrollToError && fieldRef.current) {
            setTimeout(() => {
                fieldRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
                const input = fieldRef.current?.querySelector('input');
                input?.focus();
            }, 100);
        }
    }, [error, isFirstError, scrollToError]);

    return fieldRef;
};

// Helper functions to convert between seconds and display format
const secondsToDisplay = (totalSeconds: number | null, hideSeconds: boolean): string => {
    if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) {
        return '';
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (hideSeconds) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const displayToSeconds = (displayValue: string, hideSeconds: boolean): number | null => {
    if (!displayValue || displayValue.trim() === '') {
        return null;
    }

    const parts = displayValue.split(':').map(part => parseInt(part, 10));

    if (hideSeconds) {
        // Format: HH:MM
        if (parts.length !== 2 || parts.some(isNaN)) {
            return null;
        }
        const [hours, minutes] = parts;
        return hours * 3600 + minutes * 60;
    } else {
        // Format: HH:MM:SS
        if (parts.length !== 3 || parts.some(isNaN)) {
            return null;
        }
        const [hours, minutes, seconds] = parts;
        return hours * 3600 + minutes * 60 + seconds;
    }
};

const formatDurationInput = (value: string, hideSeconds: boolean): string => {
    // Remove any non-digit and non-colon characters
    let cleaned = value.replace(/[^\d:]/g, '');

    // Split by colon
    const parts = cleaned.split(':');

    if (hideSeconds) {
        // Format: HH:MM
        if (parts.length === 1) {
            return cleaned;
        } else if (parts.length === 2) {
            const hours = parts[0].slice(0, 4); // Max 9999 hours
            const minutes = parts[1].slice(0, 2);
            return `${hours}:${minutes}`;
        }
        // If more colons, just take first two parts
        return `${parts[0].slice(0, 4)}:${parts[1].slice(0, 2)}`;
    } else {
        // Format: HH:MM:SS
        if (parts.length === 1) {
            return cleaned;
        } else if (parts.length === 2) {
            const hours = parts[0].slice(0, 4);
            const minutes = parts[1].slice(0, 2);
            return `${hours}:${minutes}`;
        } else if (parts.length >= 3) {
            const hours = parts[0].slice(0, 4);
            const minutes = parts[1].slice(0, 2);
            const seconds = parts[2].slice(0, 2);
            return `${hours}:${minutes}:${seconds}`;
        }
    }

    return cleaned;
};

export const DurationField: React.FC<DurationFieldPropsExtended> = ({
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hideSeconds = Boolean((field as any).hide_seconds);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hideDays = Boolean((field as any).hide_days);

    // Local state for display value
    const [displayValue, setDisplayValue] = useState<string>(() => {
        if (typeof value === 'number') {
            return secondsToDisplay(value, hideSeconds);
        }
        return '';
    });

    // Update display value when prop value changes
    useEffect(() => {
        if (typeof value === 'number') {
            setDisplayValue(secondsToDisplay(value, hideSeconds));
        } else if (value === null || value === undefined || value === '') {
            setDisplayValue('');
        }
    }, [value, hideSeconds]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const formatted = formatDurationInput(inputValue, hideSeconds);
        setDisplayValue(formatted);
    };

    const handleBlur = () => {
        // Convert display value to seconds when focus is lost
        const seconds = displayToSeconds(displayValue, hideSeconds);

        if (seconds !== null) {
            // Reformat to ensure proper padding
            const reformatted = secondsToDisplay(seconds, hideSeconds);
            setDisplayValue(reformatted);
            onChange(seconds);
        } else if (displayValue === '') {
            onChange(null);
        }

        if (onBlur) {
            onBlur();
        }
    };

    const placeholder = hideSeconds
        ? 'HH:MM (e.g., 02:30)'
        : 'HH:MM:SS (e.g., 02:30:45)';

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
                <div className="relative">
                    <Input
                        id={field.fieldname}
                        name={field.fieldname}
                        type="text"
                        value={displayValue}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        disabled={disabled || Boolean(field.read_only)}
                        placeholder={(field as any).placeholder || placeholder}
                        className={cn(
                            "font-mono",
                            error && "border-red-500 focus:ring-red-500 focus:border-red-500",
                            field.read_only && "bg-gray-100 text-gray-800 cursor-not-allowed opacity-90 font-medium"
                        )}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${field.fieldname}-error` : undefined}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                        {hideSeconds ? 'HH:MM' : 'HH:MM:SS'}
                    </span>
                </div>
            </FieldWrapper>
        </div>
    );
};