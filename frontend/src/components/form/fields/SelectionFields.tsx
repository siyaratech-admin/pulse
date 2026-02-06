/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Search } from 'lucide-react';
import type { FormFieldProps } from '../../../types/form';
import {
    useSelectField,
    useLinkField,
    useAutocompleteField,
} from '../../../hooks/form';
import { Combobox } from '../../ui/form/Combobox';
import { FieldWrapper } from '../../ui/form/FieldWrapper';
import {
    toBool,
    isFieldRequired,
    isFieldReadOnly,
} from '../../../utils/fieldHelpers';

// ========================
// Select Field Component
// ========================
export const SelectField: React.FC<FormFieldProps & { showLabel?: boolean }> = ({
    field,
    value,
    onChange,
    error,
    disabled,
    className,
    showLabel = true,
}) => {
    const hasApiConfig = !!field.api_endpoint || !!field.apiConfig;
    const apiConfig = field.apiConfig || {};
    const apiEndpoint = field.api_endpoint || apiConfig.endpoint;
    const apiParams = field.api_params || apiConfig.params || {};
    const apiMethod = (field.api_method || apiConfig.method || 'GET') as
        | 'GET'
        | 'POST';
    const apiType = apiConfig.apiType || 'custom';
    const doctype = apiConfig.doctype;
    const searchField = apiConfig.searchField;
    const transformResponse = apiConfig.transformResponse;

    const staticOptions = hasApiConfig
        ? undefined
        : Array.isArray(field.options) || typeof field.options === 'string'
            ? field.options
            : undefined;

    const {
        open,
        setOpen,
        processedOptions,
        isDisabled,
        handleSelectItem,
        isLoading,
        error: apiError,
        apiOptions,
        searchValue,
        setSearchValue,
    } = useSelectField({
        options: staticOptions,
        value: value || '',
        onChange,
        disabled,
        readOnly: isFieldReadOnly(field),
        apiEndpoint,
        apiParams,
        apiMethod,
        apiType,
        doctype,
        searchField,
        transformResponse,
    });

    const comboboxOptions =
        hasApiConfig && apiOptions.length > 0
            ? apiOptions
            : processedOptions.map((option) => ({
                value: option,
                label: option,
            }));

    const combinedError = error || apiError || undefined;

    // CRITICAL FIX: Ensure value is always a string
    const safeValue = value != null ? String(value) : '';

    return (
        <FieldWrapper
            fieldname={field.fieldname}
            label={showLabel ? field.label : ""}
            required={false}
            description={field.description}
            error={combinedError}
            className={className}
        >
            <Combobox
                open={open}
                onOpenChange={setOpen}
                value={safeValue}
                placeholder={`Select ${field.label.toLowerCase()}`}
                searchValue={hasApiConfig && apiType === 'link_search' ? searchValue : undefined}
                onSearchValueChange={
                    hasApiConfig && apiType === 'link_search' ? setSearchValue : undefined
                }
                searchPlaceholder={`Search ${field.label.toLowerCase()}...`}
                options={comboboxOptions}
                onSelect={handleSelectItem}
                disabled={isDisabled}
                error={!!combinedError}
                isLoading={isLoading}
                loadingText="Loading options..."
                emptyText={apiError ? 'Failed to load options' : 'No options available'}
                showClearButton={true}
            />
        </FieldWrapper>
    );
};

// ========================
// Autocomplete Field Component
// ========================
export const AutocompleteField: React.FC<FormFieldProps & { showLabel?: boolean }> = ({
    field,
    value,
    onChange,
    error,
    disabled,
    className,
    showLabel = true,
}) => {
    const {
        open,
        setOpen,
        searchValue,
        setSearchValue,
        filteredOptions,
        isDisabled,
        handleSelectItem,
    } = useAutocompleteField({
        options:
            Array.isArray(field.options) || typeof field.options === 'string'
                ? field.options
                : undefined,
        value: value || '',
        onChange,
        disabled,
        readOnly: isFieldReadOnly(field),
    });

    const comboboxOptions = filteredOptions.map((option) => ({
        value: option,
        label: option,
    }));

    // CRITICAL FIX: Ensure value is always a string
    const safeValue = value != null ? String(value) : '';

    return (
        <FieldWrapper
            fieldname={field.fieldname}
            label={showLabel ? field.label : ""}
            required={false}
            description={field.description}
            error={error}
            className={className}
        >
            <Combobox
                open={open}
                onOpenChange={setOpen}
                value={safeValue}
                placeholder={`Select ${field.label.toLowerCase()}`}
                searchValue={searchValue}
                onSearchValueChange={setSearchValue}
                searchPlaceholder={`Search ${field.label.toLowerCase()}...`}
                options={comboboxOptions}
                onSelect={handleSelectItem}
                disabled={isDisabled}
                error={!!error}
                showClearButton={false}
            />
        </FieldWrapper>
    );
};

// ========================
// Link Field Component
// ========================
export const LinkField: React.FC<
    FormFieldProps & {
        showLabel?: boolean;
        showBadge?: boolean;
        filters?: Record<string, any>;
    }
> = ({
    field,
    value,
    onChange,
    error,
    disabled,
    className,
    showLabel = true,
    showBadge = false,
    filters,
}) => {
        const linkFieldConfig = field.apiConfig || {};

        const {
            open,
            setOpen,
            searchValue,
            setSearchValue,
            linkOptions,
            isLoading,
            handleSelectItem,
            handleClear,
        } = useLinkField({
            doctype: field.options as string,
            value: value || '',
            onChange,
            disabled,
            readOnly: isFieldReadOnly(field),
            filters: {
                ...linkFieldConfig.params?.filters,
                ...filters,
            },
            searchField: linkFieldConfig.params?.searchfield,
            referenceDoctype: linkFieldConfig.params?.reference_doctype,
            ignoreUserPermissions:
                linkFieldConfig.params?.ignore_user_permissions || false,
        });

        // CRITICAL FIX: Ensure value is always a string
        const safeValue = value != null ? String(value) : '';
        const selectedOption = linkOptions.find((opt) => opt.value === safeValue);

        return (
            <FieldWrapper
                fieldname={field.fieldname}
                label={showLabel ? field.label : ""}
                required={false}
                badge={
                    showBadge
                        ? showLabel
                            ? (field.options as string)
                            : undefined
                        : undefined
                }
                description={field.description}
                error={error}
                className={className}
            >
                <Combobox
                    open={open}
                    onOpenChange={setOpen}
                    value={safeValue}
                    placeholder={`Search ${field.options || 'documents'}...`}
                    searchValue={searchValue}
                    onSearchValueChange={setSearchValue}
                    searchPlaceholder={`Search ${field.options || 'documents'}...`}
                    options={linkOptions}
                    onSelect={handleSelectItem}
                    onClear={handleClear}
                    isLoading={isLoading}
                    loadingText="Loading..."
                    emptyText={
                        searchValue
                            ? `No results found for "${searchValue}"`
                            : `No ${field.options} documents available`
                    }
                    emptyIcon={<Search className="h-8 w-8 text-gray-300" />}
                    disabled={disabled || isFieldReadOnly(field)}
                    error={!!error}
                    showClearButton={true}
                >
                    {linkOptions.length >= 20 && (
                        <div className="px-3 py-2 text-xs text-gray-400 text-center border-t">
                            Showing first 20 results. Refine your search for more specific results.
                        </div>
                    )}
                </Combobox>
            </FieldWrapper>
        );
    };