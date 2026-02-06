import React from 'react';
import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';
import type { FormFieldProps } from '../../../types/form';
import { cn } from '../../../lib/utils';
import { toBool, isFieldRequired, isFieldReadOnly } from '../../../utils/fieldHelpers';

export const CheckField: React.FC<FormFieldProps> = ({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    className
}) => {
    const isRequired = isFieldRequired(field);
    const isReadOnly = isFieldReadOnly(field);

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id={field.fieldname}
                    checked={Boolean(value)}
                    onCheckedChange={(checked) => onChange(checked ? 1 : 0)}
                    onBlur={onBlur}
                    disabled={disabled || isReadOnly}
                    className={cn(
                        error && "border-red-500",
                        isReadOnly && "cursor-not-allowed opacity-90"
                    )}
                />
                <Label
                    htmlFor={field.fieldname}
                    className={cn(
                        "text-sm font-medium",
                        isReadOnly && "cursor-not-allowed opacity-90 text-gray-600"
                    )}
                >
                    {field.label}
                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                </Label>
            </div>
            {field.description && (
                <p className="text-xs text-gray-500 ml-6">{field.description}</p>
            )}
            {error && (
                <p className="text-xs text-red-500 ml-6">{error}</p>
            )}
        </div>
    );
};