import { useState, useMemo } from 'react';

interface UseAutocompleteFieldProps {
    options: string[] | string | undefined;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    readOnly?: boolean;
}

export const useAutocompleteField = ({ 
    options, 
    value, 
    onChange, 
    disabled, 
    readOnly 
}: UseAutocompleteFieldProps) => {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    // Process options to ensure they're in array format
    const processedOptions = Array.isArray(options) 
        ? options 
        : typeof options === 'string' 
            ? options.split('\n').filter(Boolean) 
            : [];

    // Filter options based on search value
    const filteredOptions = useMemo(() => {
        if (!searchValue) return processedOptions;
        
        return processedOptions.filter(option =>
            option.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [processedOptions, searchValue]);

    // Handle item selection
    const handleSelectItem = (selectedValue: string) => {
        const newValue = selectedValue === value ? '' : selectedValue;
        onChange(newValue);
        setOpen(false);
        setSearchValue('');
    };

    // Handle clear selection
    const handleClear = () => {
        onChange('');
        setSearchValue('');
        setOpen(false);
    };

    // Get display value for the trigger button
    const getDisplayValue = () => {
        return value || '';
    };

    return {
        // State
        open,
        setOpen,
        searchValue,
        setSearchValue,
        
        // Computed values
        processedOptions,
        filteredOptions,
        displayValue: getDisplayValue(),
        isDisabled: disabled || readOnly,
        
        // Actions
        handleSelectItem,
        handleClear,
    };
};