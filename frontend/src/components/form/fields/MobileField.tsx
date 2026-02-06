/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
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
    getFieldPlaceholder,
} from '../../../utils/fieldHelpers';

// Extended props to include showLabel
interface ExtendedFormFieldProps extends FormFieldProps {
    showLabel?: boolean;
}

// Popular country codes
const COUNTRY_CODES = [
    { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
    { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
    { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
    { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
    { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE' },
    { code: '+65', country: 'SG', flag: '🇸🇬', name: 'Singapore' },
    { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
    { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
    { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
    { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
    { code: '+39', country: 'IT', flag: '🇮🇹', name: 'Italy' },
    { code: '+34', country: 'ES', flag: '🇪🇸', name: 'Spain' },
    { code: '+7', country: 'RU', flag: '🇷🇺', name: 'Russia' },
    { code: '+55', country: 'BR', flag: '🇧🇷', name: 'Brazil' },
    { code: '+27', country: 'ZA', flag: '🇿🇦', name: 'South Africa' },
    { code: '+20', country: 'EG', flag: '🇪🇬', name: 'Egypt' },
    { code: '+52', country: 'MX', flag: '🇲🇽', name: 'Mexico' },
    { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
    { code: '+60', country: 'MY', flag: '🇲🇾', name: 'Malaysia' },
    { code: '+62', country: 'ID', flag: '🇮🇩', name: 'Indonesia' },
];

// === PHONE FIELD ===
export const PhoneField: React.FC<ExtendedFormFieldProps> = ({
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
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [countryCode, setCountryCode] = useState('+91'); // Default to India
    const [phoneNumber, setPhoneNumber] = useState('');

    const isRequired = isFieldRequired(field);
    const isReadOnly = isFieldReadOnly(field);

    // Parse existing value on mount or when value changes
    useEffect(() => {
        if (value && typeof value === 'string') {
            // Try to parse the phone number
            const match = value.match(/^(\+\d+)\s*(.*)$/);
            if (match) {
                setCountryCode(match[1]);
                setPhoneNumber(match[2]);
            } else {
                // If no country code, assume it's just the number
                setPhoneNumber(value);
            }
        }
    }, [value]);

    const handleCountryCodeChange = (code: string) => {
        setCountryCode(code);
        setShowDropdown(false);
        setSearchTerm('');
        // Update the full value
        const fullNumber = phoneNumber ? `${code} ${phoneNumber}` : code;
        onChange(fullNumber);
    };

    const handlePhoneNumberChange = (num: string) => {
        // Only allow digits and common phone number characters
        const cleaned = num.replace(/[^\d\s()-]/g, '');
        setPhoneNumber(cleaned);
        // Update the full value
        const fullNumber = cleaned ? `${countryCode} ${cleaned}` : '';
        onChange(fullNumber);
    };

    const filteredCountries = COUNTRY_CODES.filter(
        (c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.code.includes(searchTerm) ||
            c.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode);

    const getValidationStatus = (): ValidationStatus | undefined => {
        if (error) return 'error';
        return undefined;
    };

    return (
        <FieldWrapper
            fieldname={field.fieldname}
            label={showLabel ? field.label || field.fieldname || '' : undefined}
            required={isRequired}
            description={field.description}
            error={error}
            disabled={disabled || isReadOnly}
            validationStatus={getValidationStatus()}
            className={className}
            variant="default"
        >
            <div className="relative flex gap-2">
                {/* Country Code Selector */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => !disabled && !isReadOnly && setShowDropdown(!showDropdown)}
                        disabled={disabled || isReadOnly}
                        className={cn(
                            'flex items-center gap-2 px-3 h-10 border rounded-md bg-white',
                            'hover:bg-gray-50 transition-colors',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                            (disabled || isReadOnly) && 'bg-gray-100 cursor-not-allowed opacity-90',
                            error && 'border-red-300'
                        )}
                    >
                        <span className="text-lg">{selectedCountry?.flag || '🌐'}</span>
                        <span className="text-sm font-medium min-w-[50px]">{countryCode}</span>
                        <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>

                    {/* Dropdown */}
                    {showDropdown && (
                        <div className="absolute z-50 mt-1 w-72 bg-white border rounded-md shadow-lg max-h-80 overflow-hidden">
                            {/* Search */}
                            <div className="p-2 border-b sticky top-0 bg-white">
                                <Input
                                    type="text"
                                    placeholder="Search country..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-8 text-sm"
                                    autoFocus
                                />
                            </div>

                            {/* Country List */}
                            <div className="overflow-y-auto max-h-64">
                                {filteredCountries.length > 0 ? (
                                    filteredCountries.map((country) => (
                                        <button
                                            key={country.code + country.country}
                                            type="button"
                                            onClick={() => handleCountryCodeChange(country.code)}
                                            className={cn(
                                                'w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50',
                                                'text-left transition-colors',
                                                countryCode === country.code && 'bg-blue-50'
                                            )}
                                        >
                                            <span className="text-lg">{country.flag}</span>
                                            <span className="flex-1 text-sm">{country.name}</span>
                                            <span className="text-sm font-medium text-gray-600">
                                                {country.code}
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-gray-500">
                                        No countries found
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Phone Number Input */}
                <div className="flex-1 relative">
                    <Input
                        id={field.fieldname}
                        name={field.fieldname}
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => handlePhoneNumberChange(e.target.value)}
                        onBlur={() => {
                            setIsFocused(false);
                            setShowDropdown(false);
                            onBlur?.();
                        }}
                        onFocus={() => setIsFocused(true)}
                        disabled={disabled || isReadOnly}
                        placeholder={getFieldPlaceholder(field) || 'Enter phone number'}
                        className={cn(
                            'transition-all duration-200',
                            error && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
                            isReadOnly &&
                            'bg-gray-100 text-gray-800 cursor-not-allowed opacity-90 font-medium',
                            isFocused && 'ring-2 ring-blue-500/20'
                        )}
                    />
                </div>
            </div>

            {/* Click outside to close dropdown */}
            {showDropdown && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                />
            )}
        </FieldWrapper>
    );
};