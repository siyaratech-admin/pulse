import React, { useState } from 'react';
import { Label } from '../label';
import { Badge } from '../badge';
import { cn } from '../../../lib/utils';
import { AlertCircle, CheckCircle2, Info, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip';
import { ValidationIndicator, InlineValidation } from './ValidationMessage';
import type { ValidationStatus } from './ValidationMessage';

interface FieldWrapperProps {
    fieldname: string;
    label: string;
    required?: boolean;
    badge?: string;
    description?: string;
    error?: string;
    success?: string;
    warning?: string;
    helpText?: string;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'card' | 'minimal';
    validationStatus?: ValidationStatus;
    isValidating?: boolean;
    showInlineValidation?: boolean;
}

export const FieldWrapper: React.FC<FieldWrapperProps> = ({
    fieldname,
    label,
    required = false,
    badge,
    description,
    error,
    success,
    warning,
    helpText,
    loading = false,
    disabled = false,
    className,
    children,
    size = 'md',
    variant = 'default',
    validationStatus,
    isValidating = false,
    showInlineValidation = true
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const sizeClasses = {
        sm: 'space-y-1',
        md: 'space-y-2',
        lg: 'space-y-3'
    };

    const variantClasses = {
        default: '',
        card: 'p-4 border border-gray-200 rounded-sm bg-white transition-colors duration-200',
        minimal: 'border-0'
    };

    // Determine current validation status
    const currentValidationStatus = (): ValidationStatus | undefined => {
        if (error) return 'error';
        if (success) return 'success';
        if (warning) return 'warning';
        return validationStatus;
    };

    const validationMessage = error || success || warning;
    const currentStatus = currentValidationStatus();

    const getStatusIcon = () => {
        if (loading || isValidating) return <div className="animate-spin h-3 w-3 border border-gray-300 border-t-blue-600 rounded-full" />;
        if (error) return <AlertCircle className="h-3 w-3 text-red-500" />;
        // Success icon removed as per user request
        if (warning) return <AlertCircle className="h-3 w-3 text-yellow-500" />;
        return currentStatus ? <ValidationIndicator status={currentStatus} size={size === 'lg' ? 'md' : 'sm'} /> : null;
    };

    const getStatusMessage = () => {
        if (error) return { message: error, className: 'text-red-600 bg-red-50 border-red-200' };
        if (success) return { message: success, className: 'text-green-600 bg-green-50 border-green-200' };
        if (warning) return { message: warning, className: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
        return null;
    };

    const statusMessage = getStatusMessage();

    const statusIcon = getStatusIcon();
    const hasHeader = label || badge || helpText || statusIcon;

    return (
        <div
            className={cn(
                sizeClasses[size],
                variantClasses[variant],
                disabled && 'opacity-60 pointer-events-none',
                isFocused && variant === 'card' && 'border-[rgb(37,99,235)]',
                "w-full",
                className
            )}
            onFocusCapture={() => setIsFocused(true)}
            onBlurCapture={() => setIsFocused(false)}
        >
            {/* Label Row */}
            {hasHeader && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {label && (
                            <Label
                                htmlFor={fieldname}
                                className={cn(
                                    "font-medium transition-colors duration-200",
                                    size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm',
                                    disabled ? 'text-gray-400' : 'text-gray-700',
                                    isFocused && 'text-blue-700'
                                )}
                            >
                                {label}
                                {!!required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                        )}

                        {badge && (
                            <Badge
                                variant="outline"
                                className={cn(
                                    "transition-colors duration-200",
                                    size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'
                                )}
                            >
                                → {badge}
                            </Badge>
                        )}

                        {helpText && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs text-sm">{helpText}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>

                    {/* Status Icon */}
                    {statusIcon && (
                        <div className="flex items-center">
                            {statusIcon}
                        </div>
                    )}
                </div>
            )}

            {/* Field Content */}
            <div className="relative">
                {children}
            </div>

            {/* Description */}
            {description && (
                <div className="flex items-start gap-2">
                    <Info className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className={cn(
                        "text-gray-600 leading-relaxed",
                        size === 'sm' ? 'text-xs' : 'text-sm'
                    )}>
                        {description}
                    </p>
                </div>
            )}

            {/* Enhanced Validation Messages */}
            {showInlineValidation && validationMessage && (
                <InlineValidation
                    message={validationMessage}
                    status={currentStatus}
                />
            )}

            {/* Legacy Status Messages (for backwards compatibility) */}
            {!showInlineValidation && statusMessage && (
                <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md border text-sm",
                    statusMessage.className
                )}>
                    {getStatusIcon()}
                    <span className="flex-1">{statusMessage.message}</span>
                </div>
            )}

            {/* Loading Indicator */}
            {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="animate-pulse">Loading...</div>
                </div>
            )}
        </div>
    );
};