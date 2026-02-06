import React from 'react';
import { cn } from '../../../lib/utils';

interface SkeletonProps {
    className?: string;
    animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
    className, 
    animate = true 
}) => {
    return (
        <div
            className={cn(
                'bg-muted rounded-md',
                animate && 'animate-pulse',
                className
            )}
            aria-label="Loading..."
        />
    );
};

// Field-specific skeleton loaders
interface FieldSkeletonProps {
    variant?: 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'table' | 'card';
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    showDescription?: boolean;
    className?: string;
    rows?: number; // for textarea and table variants
}

export const FieldSkeleton: React.FC<FieldSkeletonProps> = ({
    variant = 'input',
    size = 'md',
    showLabel = true,
    showDescription = false,
    className,
    rows = 3,
}) => {
    const sizeClasses = {
        sm: {
            input: 'h-8',
            label: 'h-4 w-24',
            description: 'h-3 w-32',
        },
        md: {
            input: 'h-10',
            label: 'h-4 w-32',
            description: 'h-3 w-40',
        },
        lg: {
            input: 'h-12',
            label: 'h-5 w-40',
            description: 'h-4 w-48',
        },
    };

    const classes = sizeClasses[size];

    const renderVariant = () => {
        switch (variant) {
            case 'input':
                return (
                    <div className="space-y-2">
                        {showLabel && <Skeleton className={classes.label} />}
                        <Skeleton className={classes.input} />
                        {showDescription && <Skeleton className={classes.description} />}
                    </div>
                );

            case 'textarea':
                return (
                    <div className="space-y-2">
                        {showLabel && <Skeleton className={classes.label} />}
                        <div className="space-y-2">
                            {Array.from({ length: rows }).map((_, i) => (
                                <Skeleton 
                                    key={i} 
                                    className={cn(
                                        'h-4',
                                        i === rows - 1 && 'w-3/4' // Last line shorter
                                    )}
                                />
                            ))}
                        </div>
                        {showDescription && <Skeleton className={classes.description} />}
                    </div>
                );

            case 'select':
                return (
                    <div className="space-y-2">
                        {showLabel && <Skeleton className={classes.label} />}
                        <div className="flex items-center justify-between">
                            <Skeleton className={cn(classes.input, 'flex-1 mr-2')} />
                            <Skeleton className="h-4 w-4" /> {/* Dropdown icon */}
                        </div>
                        {showDescription && <Skeleton className={classes.description} />}
                    </div>
                );

            case 'checkbox':
                return (
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4 rounded" />
                        {showLabel && <Skeleton className="h-4 w-24" />}
                    </div>
                );

            case 'radio':
                return (
                    <div className="space-y-3">
                        {showLabel && <Skeleton className={classes.label} />}
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center space-x-2">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            ))}
                        </div>
                        {showDescription && <Skeleton className={classes.description} />}
                    </div>
                );

            case 'table':
                return (
                    <div className="space-y-4">
                        {showLabel && <Skeleton className={classes.label} />}
                        <div className="border rounded-lg">
                            {/* Table header */}
                            <div className="flex items-center space-x-4 p-4 border-b">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-4 flex-1" />
                                ))}
                            </div>
                            {/* Table rows */}
                            {Array.from({ length: rows }).map((_, i) => (
                                <div key={i} className="flex items-center space-x-4 p-4 border-b last:border-b-0">
                                    {Array.from({ length: 4 }).map((_, j) => (
                                        <Skeleton key={j} className="h-6 flex-1" />
                                    ))}
                                </div>
                            ))}
                        </div>
                        {showDescription && <Skeleton className={classes.description} />}
                    </div>
                );

            case 'card':
                return (
                    <div className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            {showLabel && <Skeleton className="h-5 w-32" />}
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="space-y-3">
                            {Array.from({ length: rows }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-8" />
                                </div>
                            ))}
                        </div>
                        {showDescription && <Skeleton className={classes.description} />}
                    </div>
                );

            default:
                return <Skeleton className={classes.input} />;
        }
    };

    return (
        <div className={cn('animate-pulse', className)}>
            {renderVariant()}
        </div>
    );
};

// Loading overlay for form sections
interface FormLoadingOverlayProps {
    isLoading: boolean;
    message?: string;
    children: React.ReactNode;
    className?: string;
    blur?: boolean;
}

export const FormLoadingOverlay: React.FC<FormLoadingOverlayProps> = ({
    isLoading,
    message = 'Loading...',
    children,
    className,
    blur = false,
}) => {
    return (
        <div className={cn('relative', className)}>
            <div className={cn(
                'transition-all duration-300',
                isLoading && blur && 'blur-sm opacity-50'
            )}>
                {children}
            </div>
            
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                    <div className="flex flex-col items-center gap-3 p-6 bg-background border rounded-lg shadow-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-medium">{message}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Progressive loading for form fields
interface ProgressiveFieldLoaderProps {
    fields: Array<{
        id: string;
        type: FieldSkeletonProps['variant'];
        loaded?: boolean;
        error?: boolean;
    }>;
    className?: string;
    staggerDelay?: number;
}

export const ProgressiveFieldLoader: React.FC<ProgressiveFieldLoaderProps> = ({
    fields,
    className,
    staggerDelay = 100,
}) => {
    return (
        <div className={cn('space-y-6', className)}>
            {fields.map((field, index) => (
                <div
                    key={field.id}
                    style={{
                        animationDelay: `${index * staggerDelay}ms`,
                    }}
                    className="animate-in fade-in-0 slide-in-from-left-4 duration-500"
                >
                    {field.loaded ? (
                        <div className="animate-in fade-in-0 duration-300">
                            {/* Loaded field would be rendered here */}
                            <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                                <p className="text-sm text-green-700">
                                    Field "{field.id}" loaded successfully
                                </p>
                            </div>
                        </div>
                    ) : field.error ? (
                        <div className="animate-in fade-in-0 duration-300">
                            <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                                <p className="text-sm text-red-700">
                                    Failed to load field "{field.id}"
                                </p>
                            </div>
                        </div>
                    ) : (
                        <FieldSkeleton 
                            variant={field.type} 
                            showLabel 
                            showDescription 
                        />
                    )}
                </div>
            ))}
        </div>
    );
};