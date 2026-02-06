import { useState, useEffect } from 'react';
import { searchLinkDocuments } from '../../utils/frappeApiHelpers';

interface LinkOption {
    value: string;
    label: string;
    description?: string;
}

interface UseLinkFieldProps {
    doctype: string | undefined;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    readOnly?: boolean;
    filters?: Record<string, any> | string | any[];
    searchField?: string;
    referenceDoctype?: string;
    ignoreUserPermissions?: boolean;
}

export const useLinkField = ({ 
    doctype, 
    value, 
    onChange, 
    disabled, 
    readOnly,
    filters,
    searchField,
    referenceDoctype,
    ignoreUserPermissions = false
}: UseLinkFieldProps) => {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [linkOptions, setLinkOptions] = useState<LinkOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userIsTyping, setUserIsTyping] = useState(false);

    // Fetch link options using search_link API
    const fetchLinkOptions = async (doctype: string, searchTerm: string) => {
        if (disabled || readOnly) return;
        
        setIsLoading(true);
        try {
            // Use the searchLinkDocuments helper function
            const options = await searchLinkDocuments(
                doctype,
                searchTerm,
                20, // page_length
                filters,
                searchField,
                referenceDoctype,
                ignoreUserPermissions
            );
            
            setLinkOptions(options);
        } catch (error) {
            console.error('Error fetching link options:', error);
            
            // Fallback to basic mock data on error (for development)
            const fallbackData = [
                { value: doctype.toLowerCase() + '_1', label: `Sample ${doctype} 1`, description: 'Development fallback' },
                { value: doctype.toLowerCase() + '_2', label: `Sample ${doctype} 2`, description: 'Development fallback' }
            ].filter(opt => 
                opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                opt.value.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            setLinkOptions(fallbackData);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle item selection
    const handleSelectItem = (selectedValue: string) => {
        const selectedOption = linkOptions.find(opt => opt.value === selectedValue);
        if (selectedOption) {
            onChange(selectedValue);
            setSearchValue(selectedOption.label);
        } else {
            onChange('');
            setSearchValue('');
        }
        setOpen(false);
        setUserIsTyping(false);
    };

    // Handle clear selection
    const handleClear = () => {
        onChange('');
        setSearchValue('');
        setOpen(false);
        setUserIsTyping(false);
    };

    // Custom search value change handler that tracks user typing
    const handleSearchValueChange = (newValue: string) => {
        setSearchValue(newValue);
        setUserIsTyping(true);
        
        // Clear typing flag after user stops typing for 1 second
        setTimeout(() => setUserIsTyping(false), 1000);
    };

    // Effect to fetch options when doctype or searchValue changes
    useEffect(() => {
        if (doctype) {
            // Debounce API calls to avoid excessive requests
            const timeoutId = setTimeout(() => {
                // Only search if there's a meaningful search term or initial load
                if (searchValue.length >= 2 || searchValue === '') {
                    fetchLinkOptions(doctype, searchValue);
                } else {
                    // Clear options for short search terms
                    setLinkOptions([]);
                }
            }, 300); // 300ms debounce

            return () => clearTimeout(timeoutId);
        }
    }, [doctype, searchValue, disabled, readOnly, JSON.stringify(filters), searchField, referenceDoctype, ignoreUserPermissions]);

    // Update search value when value prop changes (but only when user is not typing)
    useEffect(() => {
        // Don't interfere with user's typing - only update when dropdown is closed and user isn't actively typing
        if (!open && !userIsTyping) {
            const selectedOption = linkOptions.find(opt => opt.value === value);
            if (selectedOption) {
                setSearchValue(selectedOption.label);
            } else if (!value) {
                setSearchValue('');
            }
        }
    }, [value, linkOptions, open, userIsTyping]);

    // Get display value for the trigger button
    const getDisplayValue = () => {
        const selectedOption = linkOptions.find(opt => opt.value === value);
        return selectedOption?.label || value || '';
    };

    return {
        // State
        open,
        setOpen,
        searchValue,
        setSearchValue: handleSearchValueChange,
        linkOptions,
        isLoading,
        
        // Computed values
        displayValue: getDisplayValue(),
        
        // Actions
        handleSelectItem,
        handleClear,
    };
};