import { useState, useEffect } from 'react';
import { 
  fetchDocTypeSelectOptions, 
  searchLinkDocuments, 
  fetchResourceList 
} from '../../utils/frappeApiHelpers';

interface SelectOption {
    value: string;
    label: string;
    description?: string;
}

interface UseSelectFieldProps {
    options: string[] | string | undefined;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    readOnly?: boolean;
    // Enhanced API-related props
    apiEndpoint?: string;
    apiParams?: Record<string, any>;
    apiMethod?: 'GET' | 'POST';
    // Frappe-specific API configurations
    apiType?: 'doctype_select' | 'link_search' | 'resource_list' | 'custom';
    doctype?: string; // For link_search and resource_list
    searchField?: string; // For link_search
    transformResponse?: (data: any) => SelectOption[];
}

export const useSelectField = ({ 
    options, 
    value, 
    onChange, 
    disabled, 
    readOnly,
    apiEndpoint,
    apiParams = {},
    apiMethod = 'GET',
    apiType,
    doctype,
    searchField,
    transformResponse
}: UseSelectFieldProps) => {
    const [open, setOpen] = useState(false);
    const [apiOptions, setApiOptions] = useState<SelectOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState('');
    const [userIsTyping, setUserIsTyping] = useState(false);

    // Enhanced API fetching with Frappe helpers (inspired by your LinkField implementation)
    const fetchOptionsFromAPI = async () => {
        if (disabled || readOnly) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            let transformedOptions: SelectOption[] = [];

            // Use Frappe API helpers based on configuration type
            if (apiType === 'doctype_select' && doctype && apiParams?.fieldname) {
                transformedOptions = await fetchDocTypeSelectOptions(
                    doctype, 
                    apiParams.fieldname
                );
            } else if (apiType === 'link_search' && doctype) {
                transformedOptions = await searchLinkDocuments(
                    doctype,
                    searchValue, // Use current search value
                    apiParams?.page_length || 20,
                    apiParams?.filters,
                    apiParams?.searchfield,
                    apiParams?.reference_doctype,
                    apiParams?.ignore_user_permissions || false
                );
            } else if (apiType === 'resource_list' && doctype) {
                transformedOptions = await fetchResourceList(
                    doctype,
                    apiParams?.fields ? JSON.parse(apiParams.fields) : undefined,
                    apiParams?.filters ? JSON.parse(apiParams.filters) : undefined,
                    apiParams?.limit_page_length
                );
            } else if (apiEndpoint) {
                // Fallback to legacy custom API implementation
                transformedOptions = await fetchCustomAPI();
            }
            
            setApiOptions(transformedOptions);
        } catch (error) {
            console.error('Error fetching select field options:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch options');
            
            // Fallback data in development (like in your LinkField)
            if (import.meta.env.DEV) {
                const fallbackData = [
                    { value: 'option_1', label: 'Sample Option 1', description: 'Development fallback' },
                    { value: 'option_2', label: 'Sample Option 2', description: 'Development fallback' }
                ];
                setApiOptions(fallbackData);
            } else {
                setApiOptions([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Legacy custom API implementation for backward compatibility
    const fetchCustomAPI = async (): Promise<SelectOption[]> => {
        if (!apiEndpoint) return [];

        // Get CSRF token for Frappe API calls (like in your LinkField)
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        
        // Add CSRF token if available
        if (csrfToken) {
            headers['X-Frappe-CSRF-Token'] = csrfToken;
        }

        let url: string;
        let requestConfig: RequestInit = {
            method: apiMethod,
            headers,
            credentials: 'include', // Include cookies for session authentication
        };

        // Handle URL and parameters based on method
        if (apiMethod === 'GET') {
            const urlObj = new URL(apiEndpoint, window.location.origin);
            Object.entries(apiParams).forEach(([key, value]) => {
                urlObj.searchParams.append(key, String(value));
            });
            url = urlObj.toString();
        } else {
            url = apiEndpoint.startsWith('/') ? apiEndpoint : `/${apiEndpoint}`;
            requestConfig.body = JSON.stringify(apiParams);
        }

        const response = await fetch(url, requestConfig);

        if (!response.ok) {
            // Handle specific HTTP errors (like in your LinkField)
            if (response.status === 401) {
                throw new Error('Authentication required');
            } else if (response.status === 403) {
                throw new Error('Permission denied');
            } else if (response.status === 404) {
                throw new Error('API endpoint not found');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }

        const data = await response.json();
        
        // Use custom transform response if provided
        if (transformResponse) {
            return transformResponse(data);
        }
        
        // Transform API response to SelectOption format
        let transformedOptions: SelectOption[] = [];
        
        if (data.message && Array.isArray(data.message)) {
            // Frappe-style API response (like in your LinkField)
            transformedOptions = data.message.map((item: any) => ({
                value: typeof item === 'string' ? item : (item.value || item.name || item),
                label: typeof item === 'string' ? item : (item.label || item.title || item.value || item.name || item),
                description: typeof item === 'object' ? item.description : undefined
            }));
        } else if (Array.isArray(data)) {
            // Direct array response
            transformedOptions = data.map((item: any) => ({
                value: typeof item === 'string' ? item : (item.value || item.name || item),
                label: typeof item === 'string' ? item : (item.label || item.title || item.value || item.name || item),
                description: typeof item === 'object' ? item.description : undefined
            }));
        } else if (data.data && Array.isArray(data.data)) {
            // Nested data response
            transformedOptions = data.data.map((item: any) => ({
                value: typeof item === 'string' ? item : (item.value || item.name || item),
                label: typeof item === 'string' ? item : (item.label || item.title || item.value || item.name || item),
                description: typeof item === 'object' ? item.description : undefined
            }));
        } else if (data.exc_type || data.exception) {
            // Handle Frappe exceptions (like in your LinkField)
            console.error('Frappe API error:', data.exception || data.exc_type);
            throw new Error('API returned an error: ' + (data.exception || data.exc_type));
        } else {
            console.warn('Unexpected API response format:', data);
            throw new Error('Unexpected response format from API');
        }
        
        return transformedOptions;
    };

    // Effect to fetch API options when component mounts or dependencies change
    useEffect(() => {
        if (apiEndpoint || apiType) {
            // Debounce search for link_search types
            if (apiType === 'link_search' && searchValue) {
                const timeoutId = setTimeout(() => {
                    fetchOptionsFromAPI();
                }, 300); // 300ms debounce
                return () => clearTimeout(timeoutId);
            } else if (!searchValue || apiType !== 'link_search') {
                fetchOptionsFromAPI();
            }
        }
    }, [apiEndpoint, apiType, doctype, JSON.stringify(apiParams), apiMethod, disabled, readOnly, searchValue]);

    // Process options - prioritize API options over static options
    const processedOptions = apiEndpoint && apiOptions.length > 0 
        ? apiOptions.map(opt => opt.value)
        : Array.isArray(options) 
            ? options 
            : typeof options === 'string' 
                ? options.split('\n').filter(Boolean) 
                : [];

    // Get option details for display
    const getOptionDetails = (optionValue: string): SelectOption | undefined => {
        if (apiEndpoint && apiOptions.length > 0) {
            return apiOptions.find(opt => opt.value === optionValue);
        }
        return { value: optionValue, label: optionValue };
    };

    // Handle item selection
    const handleSelectItem = (selectedValue: string) => {
        const newValue = selectedValue === value ? '' : selectedValue;
        onChange(newValue);
        setOpen(false);
        setUserIsTyping(false);
        
        // For link_search types, update search value to show selected option label
        if (apiType === 'link_search') {
            const selectedOption = apiOptions.find(opt => opt.value === selectedValue);
            if (selectedOption) {
                setSearchValue(selectedOption.label);
            } else if (!newValue) {
                setSearchValue('');
            }
        }
    };

    // Handle clear selection
    const handleClear = () => {
        onChange('');
        setOpen(false);
        setUserIsTyping(false);
        
        // Clear search value for link_search types
        if (apiType === 'link_search') {
            setSearchValue('');
        }
    };

    // Get display value for the trigger button
    const getDisplayValue = () => {
        if (!value) return '';
        const optionDetails = getOptionDetails(value);
        return optionDetails?.label || value;
    };

    // Custom search value change handler that tracks user typing
    const handleSearchValueChange = (newValue: string) => {
        setSearchValue(newValue);
        setUserIsTyping(true);
        
        // Clear typing flag after user stops typing for 1 second
        setTimeout(() => setUserIsTyping(false), 1000);
    };

    // Effect to sync search value with selected value when user is not typing (for link_search)
    useEffect(() => {
        if (apiType === 'link_search' && !userIsTyping && !open) {
            const selectedOption = apiOptions.find(opt => opt.value === value);
            if (selectedOption) {
                setSearchValue(selectedOption.label);
            } else if (!value) {
                setSearchValue('');
            }
        }
    }, [value, apiOptions, userIsTyping, open, apiType]);

    // Refresh API data manually
    const refreshOptions = () => {
        if (apiEndpoint) {
            fetchOptionsFromAPI();
        }
    };

    return {
        // State
        open,
        setOpen,
        isLoading,
        error,
        searchValue,
        setSearchValue: handleSearchValueChange,
        
        // Computed values
        processedOptions,
        displayValue: getDisplayValue(),
        isDisabled: disabled || readOnly,
        
        // Actions
        handleSelectItem,
        handleClear,
        refreshOptions,
        
        // API-specific data
        apiOptions,
        getOptionDetails,
    };
};