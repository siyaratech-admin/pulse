/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
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
import { Star } from 'lucide-react';

// Extended props to include showLabel
interface ExtendedFormFieldProps extends FormFieldProps {
    showLabel?: boolean;
    maxStars?: number; // Allow customization of max stars (default 5)
    allowHalfStars?: boolean; // Enable half-star ratings
}

// === RATE STAR FIELD ===
export const RateStarField: React.FC<ExtendedFormFieldProps> = ({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    className,
    showLabel = true,
    maxStars = 5,
    allowHalfStars = true,
}) => {
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);
    const [selectedRating, setSelectedRating] = useState<number>(0);
    const [isHoveringLeft, setIsHoveringLeft] = useState(false);

    const isRequired = isFieldRequired(field);
    const isReadOnly = isFieldReadOnly(field);

    // Convert ERPNext rating (0-1 scale) to star rating
    // With half stars: 0.1 = 0.5 stars, 0.2 = 1 star, 0.3 = 1.5 stars, etc.
    useEffect(() => {
        if (value !== undefined && value !== null && value !== '') {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            // Convert from 0-1 scale to 0-5 scale
            const stars = numValue * maxStars;
            setSelectedRating(stars);
        } else {
            setSelectedRating(0);
        }
    }, [value, maxStars]);

    const handleStarClick = (starIndex: number, isLeftHalf: boolean) => {
        if (disabled || isReadOnly) return;

        let newRating: number;

        if (allowHalfStars && isLeftHalf) {
            // Clicked on left half - set to half star
            newRating = starIndex - 0.5;
        } else {
            // Clicked on right half or half stars disabled - set to full star
            newRating = starIndex;
        }

        setSelectedRating(newRating);

        // Convert from star rating to ERPNext's 0-1 scale
        const ratingValue = newRating / maxStars;

        // Round to 1 decimal place to match ERPNext format
        const formattedValue = parseFloat(ratingValue.toFixed(2));

        onChange(formattedValue);
    };

    const handleStarHover = (starIndex: number | null, isLeftHalf: boolean) => {
        if (disabled || isReadOnly) return;
        setHoveredStar(starIndex);
        setIsHoveringLeft(isLeftHalf);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>, starIndex: number) => {
        if (!allowHalfStars || disabled || isReadOnly) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const isLeft = x < rect.width / 2;
        setIsHoveringLeft(isLeft);
        setHoveredStar(starIndex);
    };

    const getValidationStatus = (): ValidationStatus | undefined => {
        if (error) return 'error';
        return undefined;
    };

    // Calculate display rating (what to show when hovering)
    const getDisplayRating = (): number => {
        if (hoveredStar !== null) {
            return allowHalfStars && isHoveringLeft ? hoveredStar - 0.5 : hoveredStar;
        }
        return selectedRating;
    };

    const displayRating = getDisplayRating();

    // Helper to determine if a star should be filled
    const getStarFillState = (starIndex: number): 'empty' | 'half' | 'full' => {
        const displayValue = displayRating;

        if (starIndex <= Math.floor(displayValue)) {
            return 'full';
        } else if (allowHalfStars && starIndex === Math.ceil(displayValue) && displayValue % 1 !== 0) {
            return 'half';
        }
        return 'empty';
    };

    // Get rating label
    const getRatingLabel = (rating: number): string => {
        if (rating === 0) return 'No rating';
        if (rating <= 1) return 'Poor';
        if (rating <= 2) return 'Fair';
        if (rating <= 3) return 'Good';
        if (rating <= 4) return 'Very Good';
        return 'Excellent';
    };

    // Get rating color
    const getRatingColor = (rating: number): string => {
        if (rating === 0) return 'text-gray-400';
        if (rating <= 1) return 'text-red-500';
        if (rating <= 2) return 'text-orange-500';
        if (rating <= 3) return 'text-yellow-500';
        if (rating <= 4) return 'text-lime-500';
        return 'text-green-500';
    };

    // Get progress bar color
    const getProgressColor = (rating: number): string => {
        if (rating <= 1) return 'bg-red-400';
        if (rating <= 2) return 'bg-orange-400';
        if (rating <= 3) return 'bg-yellow-400';
        if (rating <= 4) return 'bg-lime-400';
        return 'bg-green-400';
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
            <div className="flex flex-col gap-3">
                {/* Stars Container */}
                <div
                    className={cn(
                        'flex items-center gap-1 p-3 border rounded-lg bg-white transition-all duration-200',
                        'focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500',
                        error && 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500/20',
                        (disabled || isReadOnly) && 'bg-gray-100 cursor-not-allowed opacity-90',
                        !disabled && !isReadOnly && 'hover:border-gray-400'
                    )}
                    onMouseLeave={() => {
                        setHoveredStar(null);
                        setIsHoveringLeft(false);
                    }}
                    role="radiogroup"
                    aria-label="Rating"
                >
                    {Array.from({ length: maxStars }, (_, index) => {
                        const starNumber = index + 1;
                        const fillState = getStarFillState(starNumber);

                        return (
                            <button
                                key={starNumber}
                                type="button"
                                onClick={(e) => {
                                    if (!allowHalfStars) {
                                        handleStarClick(starNumber, false);
                                        return;
                                    }
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    const isLeft = x < rect.width / 2;
                                    handleStarClick(starNumber, isLeft);
                                }}
                                onMouseMove={(e) => handleMouseMove(e, starNumber)}
                                onMouseEnter={() => handleStarHover(starNumber, false)}
                                disabled={disabled || isReadOnly}
                                className={cn(
                                    'relative transition-all duration-200 transform',
                                    'focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-sm',
                                    !disabled && !isReadOnly && 'hover:scale-110 active:scale-95',
                                    (disabled || isReadOnly) && 'cursor-not-allowed'
                                )}
                                aria-label={`Rate ${starNumber} star${starNumber > 1 ? 's' : ''}`}
                                role="radio"
                                aria-checked={starNumber === Math.ceil(selectedRating)}
                            >
                                {/* Half Star (Left Side) */}
                                {fillState === 'half' ? (
                                    <div className="relative w-8 h-8">
                                        {/* Background (empty) star */}
                                        <Star
                                            className="absolute inset-0 w-8 h-8 fill-transparent text-gray-300"
                                            strokeWidth={1.5}
                                        />
                                        {/* Half-filled star using clip-path */}
                                        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }}>
                                            <Star
                                                className="w-8 h-8 fill-yellow-400 text-yellow-400 drop-shadow-md"
                                                strokeWidth={1.5}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <Star
                                        className={cn(
                                            'w-8 h-8 transition-all duration-200',
                                            fillState === 'full'
                                                ? 'fill-yellow-400 text-yellow-400 drop-shadow-md'
                                                : 'fill-transparent text-gray-300',
                                            !disabled &&
                                            !isReadOnly &&
                                            hoveredStar !== null &&
                                            'cursor-pointer'
                                        )}
                                        strokeWidth={1.5}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Rating Display */}
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                'text-sm font-semibold transition-colors',
                                selectedRating > 0 ? 'text-gray-900' : 'text-gray-400'
                            )}
                        >
                            {selectedRating > 0 ? (
                                <>
                                    {selectedRating % 1 === 0 ? selectedRating : selectedRating.toFixed(1)}{' '}
                                    {selectedRating === 1 ? 'Star' : 'Stars'}
                                </>
                            ) : (
                                'No rating selected'
                            )}
                        </span>
                        {selectedRating > 0 && (
                            <span className="text-xs text-gray-500 font-medium">
                                ({(selectedRating / maxStars).toFixed(2)})
                            </span>
                        )}
                    </div>

                    {/* Clear Button */}
                    {selectedRating > 0 && !disabled && !isReadOnly && (
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedRating(0);
                                onChange(0);
                            }}
                            className={cn(
                                'text-xs text-gray-500 hover:text-red-600 transition-colors',
                                'underline underline-offset-2 focus:outline-none focus:ring-2',
                                'focus:ring-red-500/20 rounded px-2 py-1'
                            )}
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Rating Label and Progress */}
                {selectedRating > 0 && (
                    <div className="flex justify-between items-center px-1">
                        <span className={cn('text-xs font-medium', getRatingColor(selectedRating))}>
                            {getRatingLabel(selectedRating)}
                        </span>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: maxStars }, (_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        'h-1.5 w-6 rounded-full transition-all duration-300',
                                        i < Math.ceil(selectedRating)
                                            ? getProgressColor(selectedRating)
                                            : 'bg-gray-200',
                                        i === Math.floor(selectedRating) && selectedRating % 1 !== 0 && 'opacity-50'
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Helper Text for Half Stars */}
                {allowHalfStars && !disabled && !isReadOnly && selectedRating === 0 && (
                    <p className="text-xs text-gray-400 px-1">
                        Tip: Click left side for half star, right side for full star
                    </p>
                )}
            </div>
        </FieldWrapper>
    );
};