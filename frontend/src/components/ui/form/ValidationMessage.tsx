import React from 'react';
import { cn } from '../../../lib/utils';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ValidationStatus = 'success' | 'error' | 'warning' | 'info';

interface ValidationMessageProps {
    status: ValidationStatus;
    message: string;
    showIcon?: boolean;
    dismissible?: boolean;
    onDismiss?: () => void;
    className?: string;
    compact?: boolean;
    animate?: boolean;
}

const statusConfig = {
    success: {
        icon: CheckCircle2,
        baseClasses: 'text-green-700 bg-green-50 border-green-200',
        iconClasses: 'text-green-500',
        dismissButtonClasses: 'text-green-400 hover:text-green-600 hover:bg-green-100',
    },
    error: {
        icon: AlertCircle,
        baseClasses: 'text-red-700 bg-red-50 border-red-200',
        iconClasses: 'text-red-500',
        dismissButtonClasses: 'text-red-400 hover:text-red-600 hover:bg-red-100',
    },
    warning: {
        icon: AlertTriangle,
        baseClasses: 'text-amber-700 bg-amber-50 border-amber-200',
        iconClasses: 'text-amber-500',
        dismissButtonClasses: 'text-amber-400 hover:text-amber-600 hover:bg-amber-100',
    },
    info: {
        icon: Info,
        baseClasses: 'text-blue-700 bg-blue-50 border-blue-200',
        iconClasses: 'text-blue-500',
        dismissButtonClasses: 'text-blue-400 hover:text-blue-600 hover:bg-blue-100',
    },
};

export const ValidationMessage: React.FC<ValidationMessageProps> = ({
    status,
    message,
    showIcon = true,
    dismissible = false,
    onDismiss,
    className,
    compact = false,
    animate = true,
}) => {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <div
            className={cn(
                'flex items-start gap-2 border rounded-md transition-all duration-200',
                compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm',
                config.baseClasses,
                animate && 'animate-in slide-in-from-top-1 fade-in-0 duration-300',
                className
            )}
            role="alert"
            aria-live="polite"
        >
            {showIcon && (
                <Icon 
                    className={cn(
                        'shrink-0 mt-0.5',
                        compact ? 'h-3 w-3' : 'h-4 w-4',
                        config.iconClasses
                    )} 
                />
            )}
            
            <span className="flex-1 leading-relaxed">{message}</span>
            
            {dismissible && onDismiss && (
                <button
                    onClick={onDismiss}
                    className={cn(
                        'shrink-0 rounded-full p-1 transition-colors duration-150',
                        config.dismissButtonClasses
                    )}
                    aria-label="Dismiss message"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    );
};

// Inline validation message for form fields
interface InlineValidationProps {
    message?: string;
    status?: ValidationStatus;
    className?: string;
}

export const InlineValidation: React.FC<InlineValidationProps> = ({
    message,
    status = 'error',
    className,
}) => {
    if (!message) return null;

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <div
            className={cn(
                'flex items-center gap-1.5 mt-1 transition-all duration-200',
                'animate-in slide-in-from-top-1 fade-in-0 duration-300',
                className
            )}
            role="alert"
            aria-live="polite"
        >
            <Icon className={cn('h-3 w-3 shrink-0', config.iconClasses)} />
            <span className={cn('text-xs leading-tight', config.baseClasses.split(' ')[0])}>
                {message}
            </span>
        </div>
    );
};

// Field validation status indicator
interface ValidationIndicatorProps {
    status?: ValidationStatus;
    isValidating?: boolean;
    className?: string;
    size?: 'sm' | 'md';
}

export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({
    status,
    isValidating = false,
    className,
    size = 'md',
}) => {
    if (isValidating) {
        return (
            <div
                className={cn(
                    'animate-spin rounded-full border-2 border-muted border-t-primary',
                    size === 'sm' ? 'h-3 w-3' : 'h-4 w-4',
                    className
                )}
                aria-label="Validating..."
            />
        );
    }

    if (!status) return null;

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Icon
            className={cn(
                'shrink-0 transition-all duration-200',
                size === 'sm' ? 'h-3 w-3' : 'h-4 w-4',
                config.iconClasses,
                'animate-in zoom-in-50 fade-in-0 duration-200',
                className
            )}
            aria-label={`Validation status: ${status}`}
        />
    );
};

// Live validation as user types
interface LiveValidationProps {
    value: any;
    rules: Array<{
        test: (value: any) => boolean;
        message: string;
        status?: ValidationStatus;
    }>;
    debounceMs?: number;
    children: (props: {
        status?: ValidationStatus;
        message?: string;
        isValidating: boolean;
    }) => React.ReactNode;
}

export const LiveValidation: React.FC<LiveValidationProps> = ({
    value,
    rules,
    debounceMs = 300,
    children,
}) => {
    const [isValidating, setIsValidating] = React.useState(false);
    const [validationResult, setValidationResult] = React.useState<{
        status?: ValidationStatus;
        message?: string;
    }>({});

    React.useEffect(() => {
        if (!value) {
            setValidationResult({});
            return;
        }

        setIsValidating(true);
        
        const timer = setTimeout(() => {
            // Run validation rules
            for (const rule of rules) {
                if (!rule.test(value)) {
                    setValidationResult({
                        status: rule.status || 'error',
                        message: rule.message,
                    });
                    setIsValidating(false);
                    return;
                }
            }
            
            // All rules passed
            setValidationResult({
                status: 'success',
                message: undefined,
            });
            setIsValidating(false);
        }, debounceMs);

        return () => {
            clearTimeout(timer);
            setIsValidating(false);
        };
    }, [value, rules, debounceMs]);

    return (
        <>
            {children({
                ...validationResult,
                isValidating,
            })}
        </>
    );
};