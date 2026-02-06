/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Button } from '../button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '../command';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Check, X, Search, ChevronDown, Plus } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ComboboxOption {
    value: string;
    label: string;
    description?: string;
    category?: string;
    disabled?: boolean;
}

interface ComboboxProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    value?: string;
    placeholder?: string;
    searchValue?: string;
    onSearchValueChange?: (value: string) => void;
    searchPlaceholder?: string;
    options: ComboboxOption[];
    onSelect: (value: string) => void;
    onClear?: () => void;
    isLoading?: boolean;
    loadingText?: string;
    emptyText?: string;
    emptyIcon?: React.ReactNode;
    disabled?: boolean;
    error?: boolean;
    className?: string;
    showClearButton?: boolean;
    children?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'ghost' | 'outline';
    allowCustomValue?: boolean;
    maxHeight?: string;
    showAddButton?: boolean;
    addButtonText?: string;
    onAddClick?: () => void;
}

export const Combobox: React.FC<ComboboxProps> = ({
    open,
    onOpenChange,
    value,
    placeholder = 'Select option...',
    searchValue,
    onSearchValueChange,
    searchPlaceholder = 'Search...',
    options,
    onSelect,
    onClear,
    isLoading = false,
    loadingText = 'Loading...',
    emptyText = 'No options found.',
    emptyIcon,
    disabled = false,
    error = false,
    className,
    showClearButton = true,
    children,
    size = 'md',
    variant = 'default',
    allowCustomValue = false,
    maxHeight = '300px',
    showAddButton = false,
    addButtonText = "Add Item",
    onAddClick,
}) => {
    const [isMobile, setIsMobile] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // CRITICAL FIX: Ensure value is always a string
    const safeValue = value != null ? String(value) : '';
    const selectedOption = options.find((opt) => opt.value === safeValue);
    const displayValue = selectedOption?.label || safeValue || '';

    // Group options by category
    const groupedOptions = options.reduce((acc, option) => {
        const category = option.category || 'Default';
        if (!acc[category]) acc[category] = [];
        acc[category].push(option);
        return acc;
    }, {} as Record<string, ComboboxOption[]>);

    const sizeClasses = {
        sm: 'h-8 text-sm px-2',
        md: 'h-10 px-3',
        lg: 'h-12 text-lg px-4',
    };

    const variantClasses = {
        default: 'border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'border-transparent bg-transparent hover:bg-accent hover:text-accent-foreground',
        outline: 'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground',
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientY);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStart) return;
        const touchEnd = e.changedTouches[0].clientY;
        const diff = touchStart - touchEnd;
        if (Math.abs(diff) > 50) {
            // swipe handling if needed
        }
        setTouchStart(null);
    };

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-label={placeholder}
                    className={cn(
                        'w-full justify-between transition-all duration-200',
                        sizeClasses[size],
                        variantClasses[variant],
                        !displayValue && "text-muted-foreground",
                        error && "border-destructive ring-2 ring-destructive/20",
                        disabled && "bg-gray-100 text-gray-800 cursor-not-allowed opacity-90 font-medium pointer-events-none",
                        open && "ring-2 ring-ring ring-offset-2",
                        isMobile && "min-h-[44px]",
                        className
                    )}
                    disabled={disabled}
                    type="button"
                >
                    <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                        <span
                            className={cn(
                                'truncate text-left block min-w-0 overflow-hidden text-ellipsis',
                                displayValue ? 'text-foreground' : 'text-muted-foreground'
                            )}
                            title={displayValue || placeholder}
                        >
                            {displayValue || placeholder}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                        {/* FIXED: Changed from Button to div to avoid nested buttons */}
                        {safeValue && showClearButton && onClear && !disabled && (
                            <div
                                role="button"
                                aria-label="Clear selection"
                                className={cn(
                                    "h-4 w-4 p-0 hover:bg-destructive/10 rounded-full flex items-center justify-center cursor-pointer transition-colors",
                                    isMobile && "h-6 w-6"
                                )}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onClear();
                                }}
                                tabIndex={-1}
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Clear selection</span>
                            </div>
                        )}
                        <ChevronDown
                            className={cn(
                                'h-4 w-4 shrink-0 opacity-50 transition-transform duration-200',
                                open && 'rotate-180'
                            )}
                        />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={cn(
                    'p-0 shadow-lg border z-[9999]',
                    'w-[var(--radix-popover-trigger-width)] min-w-[200px] max-w-[600px]',
                    isMobile && 'w-[95vw] max-w-[95vw]'
                )}
                align={isMobile ? 'center' : 'start'}
                sideOffset={4}
            >
                <Command className="w-full">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                        <CommandInput
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onValueChange={onSearchValueChange}
                            className={cn(
                                "pl-10 border-0 border-b focus:ring-0 w-full",
                                isMobile && "h-12 text-base"
                            )}
                        />
                    </div>
                    <CommandList
                        style={{ maxHeight }}
                        className={cn(
                            "overflow-y-auto overflow-x-hidden w-full",
                            isMobile && "max-h-[50vh]"
                        )}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    <div className="text-sm text-muted-foreground">{loadingText}</div>
                                </div>
                            </div>
                        ) : options.length === 0 ? (
                            <CommandEmpty>
                                <div className="flex flex-col items-center justify-center py-8">
                                    {emptyIcon && <div className="mb-2 text-muted-foreground">{emptyIcon}</div>}
                                    <div className="font-medium text-center mb-3">Not available</div>
                                    <div className="text-sm text-muted-foreground text-center px-4 mt-1">
                                        {emptyText}
                                    </div>
                                    {allowCustomValue && searchValue && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => onSelect(searchValue)}
                                            type="button"
                                        >
                                            + Add
                                        </Button>
                                    )}
                                </div>
                            </CommandEmpty>
                        ) : (
                            <>
                                {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
                                    <CommandGroup
                                        key={category}
                                        heading={category !== 'Default' ? category : undefined}
                                    >
                                        {categoryOptions.map((option) => (
                                            <CommandItem
                                                key={option.value}
                                                value={option.value}
                                                disabled={option.disabled}
                                                onSelect={() => {
                                                    if (!option.disabled) onSelect(option.value);
                                                }}
                                                className={cn(
                                                    "cursor-pointer transition-colors duration-150",
                                                    "focus:bg-accent focus:text-accent-foreground",
                                                    isMobile && "min-h-[44px] px-4",
                                                    option.disabled && "opacity-50 cursor-not-allowed",
                                                    safeValue === option.value && "bg-accent text-accent-foreground"
                                                )}
                                            >
                                                <Check
                                                    className={cn(
                                                        'mr-3 h-4 w-4 shrink-0 transition-opacity duration-150',
                                                        safeValue === option.value ? 'opacity-100' : 'opacity-0'
                                                    )}
                                                />
                                                <div className="flex flex-col gap-1 flex-1 min-w-0 overflow-hidden">
                                                    <span className="font-medium truncate">{option.label}</span>
                                                    {option.description && (
                                                        <span className="text-sm text-muted-foreground line-clamp-2">
                                                            {option.description}
                                                        </span>
                                                    )}
                                                    {option.value !== option.label && (
                                                        <span className="text-xs text-muted-foreground/70 font-mono truncate">
                                                            {option.value}
                                                        </span>
                                                    )}
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                ))}
                                {children}
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};