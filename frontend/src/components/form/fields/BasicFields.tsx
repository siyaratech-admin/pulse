/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import type { FormFieldProps } from '../../../types/form';
import { cn } from '../../../lib/utils';
import { FieldWrapper } from '../../ui/form/FieldWrapper';
import type { ValidationStatus } from '../../ui/form/ValidationMessage';
import {
    toBool,
    isFieldRequired,
    isFieldReadOnly,
    getFieldPlaceholder
} from '../../../utils/fieldHelpers';

// ✅ Extend props to include showLabel
interface ExtendedFormFieldProps extends FormFieldProps {
    showLabel?: boolean;
}

export const DataField: React.FC<ExtendedFormFieldProps> = ({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    className,
    showLabel = true,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value && String(value).length > 0;
    const isRequired = isFieldRequired(field);
    const isReadOnly = isFieldReadOnly(field);
    const maxLength = field.length || 140;

    const getValidationStatus = (): ValidationStatus | undefined => {
        if (error) return 'error';
        return undefined;
    };

    const currentLength = String(value || '').length;
    const isNearLimit = maxLength && currentLength > maxLength * 0.8;

    return (
        <FieldWrapper
            fieldname={field.fieldname}
            label={showLabel ? (field.label || field.fieldname || '') : undefined} // 👈 hide label if false
            required={isRequired}
            description={field.description}
            error={error}
            warning={isNearLimit ? `${maxLength - currentLength} characters remaining` : undefined}
            helpText={field.description}
            disabled={disabled || isReadOnly}
            validationStatus={getValidationStatus()}
            className={className}
            variant="default"
        >
            <div className="relative">
                <Input
                    id={field.fieldname}
                    name={field.fieldname}
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={() => {
                        setIsFocused(false);
                        onBlur?.();
                    }}
                    onFocus={() => setIsFocused(true)}
                    disabled={disabled || isReadOnly}
                    placeholder={getFieldPlaceholder(field)}
                    maxLength={maxLength}
                    className={cn(
                        'transition-all duration-200',
                        error && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
                        // Removed green border on success as per user request
                        isReadOnly && 'bg-gray-100 text-gray-800 cursor-not-allowed opacity-90 font-medium',
                        isFocused && 'ring-2 ring-blue-500/20'
                    )}
                />

                {maxLength && isFocused && (
                    <div
                        className={cn(
                            'absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono',
                            isNearLimit ? 'text-amber-600' : 'text-muted-foreground'
                        )}
                    >
                        {currentLength}/{maxLength}
                    </div>
                )}
            </div>
        </FieldWrapper>
    );
};

// === INT FIELD ===
export const IntField: React.FC<ExtendedFormFieldProps> = ({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    className,
    showLabel = true,
}) => {
    const isRequired = isFieldRequired(field);
    const isReadOnly = isFieldReadOnly(field);

    return (
        <FieldWrapper
            fieldname={field.fieldname}
            label={showLabel ? (field.label || '') : undefined}
            required={isRequired}
            description={field.description}
            error={error}
            disabled={disabled || isReadOnly}
            className={className}
        >
            <Input
                id={field.fieldname}
                name={field.fieldname}
                type="number"
                step="1"
                value={value || ''}
                onChange={(e) => {
                    const val = e.target.value;
                    onChange(val ? parseInt(val, 10) : null);
                }}
                onBlur={onBlur}
                disabled={disabled || isReadOnly}
                placeholder={getFieldPlaceholder(field)}
                className={cn(
                    error && 'border-red-500 focus:ring-red-500',
                    isReadOnly && 'bg-gray-50 cursor-not-allowed'
                )}
            />
        </FieldWrapper>
    );
};

// === FLOAT FIELD ===
export const FloatField: React.FC<ExtendedFormFieldProps> = ({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    className,
    showLabel = true,
}) => {
    const precision = field.precision || 2;
    const isRequired = isFieldRequired(field);
    const isReadOnly = isFieldReadOnly(field);

    return (
        <FieldWrapper
            fieldname={field.fieldname}
            label={showLabel ? (field.label || '') : undefined}
            required={isRequired}
            description={field.description}
            error={error}
            disabled={disabled || isReadOnly}
            className={className}
        >
            <Input
                id={field.fieldname}
                name={field.fieldname}
                type="number"
                step={1 / Math.pow(10, precision)}
                value={value || ''}
                onChange={(e) => {
                    const val = e.target.value;
                    onChange(val ? parseFloat(val) : null);
                }}
                onBlur={onBlur}
                disabled={disabled || isReadOnly}
                placeholder={getFieldPlaceholder(field)}
                className={cn(
                    error && 'border-red-500 focus:ring-red-500',
                    isReadOnly && 'bg-gray-50 cursor-not-allowed'
                )}
            />
        </FieldWrapper>
    );
};

// === CURRENCY FIELD ===
export const CurrencyField: React.FC<ExtendedFormFieldProps> = ({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    className,
    showLabel = true,
}) => {
    const precision = field.precision || 2;
    const isRequired = isFieldRequired(field);
    const isReadOnly = isFieldReadOnly(field);

    return (
        <FieldWrapper
            fieldname={field.fieldname}
            label={showLabel ? (field.label || '') : undefined}
            required={isRequired}
            description={field.description}
            error={error}
            disabled={disabled || isReadOnly}
            className={className}
        >
            <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                    id={field.fieldname}
                    name={field.fieldname}
                    type="number"
                    step={1 / Math.pow(10, precision)}
                    value={value || ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        onChange(val ? parseFloat(val) : null);
                    }}
                    onBlur={onBlur}
                    disabled={disabled || isReadOnly}
                    placeholder="0.00"
                    className={cn(
                        'pl-8',
                        error && 'border-red-500 focus:ring-red-500',
                        isReadOnly && 'bg-gray-50 cursor-not-allowed'
                    )}
                />
            </div>
        </FieldWrapper>
    );
};

// === PASSWORD FIELD ===
export const PasswordField: React.FC<ExtendedFormFieldProps> = ({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    className,
    showLabel = true,
}) => {
    const isRequired = isFieldRequired(field);
    const isReadOnly = isFieldReadOnly(field);

    return (
        <FieldWrapper
            fieldname={field.fieldname}
            label={showLabel ? (field.label || '') : undefined}
            required={isRequired}
            description={field.description}
            error={error}
            disabled={disabled || isReadOnly}
            className={className}
        >
            <Input
                id={field.fieldname}
                name={field.fieldname}
                type="password"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                disabled={disabled || isReadOnly}
                placeholder={getFieldPlaceholder(field)}
                className={cn(
                    error && 'border-red-500 focus:ring-red-500',
                    isReadOnly && 'bg-gray-50 cursor-not-allowed'
                )}
            />
        </FieldWrapper>
    );
};
