# Enhanced Form Field Components Documentation

## Overview

This document provides comprehensive guidance for using the enhanced form field components that have been redesigned with modern UI patterns, mobile responsiveness, improved validation, and sophisticated loading states.

## Table of Contents

1. [FieldWrapper Component](#fieldwrapper-component)
2. [Enhanced Combobox](#enhanced-combobox)
3. [Mobile-First Child Table](#mobile-first-child-table)
4. [Validation System](#validation-system)
5. [Loading States](#loading-states)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)

## FieldWrapper Component

The `FieldWrapper` is the foundational component that provides consistent styling, validation states, and enhanced UX patterns for all form fields.

### FieldWrapper Props Interface

```typescript
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
```

### FieldWrapper Key Features

- **Multiple Variants**: Choose from `default`, `card`, or `minimal` styling
- **Status Indicators**: Built-in support for error, success, warning, and info states
- **Interactive Elements**: Hover effects, focus states, and smooth animations
- **Mobile Optimization**: Touch-friendly targets and responsive design
- **Accessibility**: ARIA labels, screen reader support, and keyboard navigation

### FieldWrapper Usage Example

```tsx
import { FieldWrapper } from '../../ui/form/FieldWrapper';
import { Input } from '../../ui/input';

<FieldWrapper
    fieldname="user_email"
    label="Email Address"
    required
    helpText="We'll use this for account notifications"
    error={validationError}
    success={isValid ? "Email format is correct!" : undefined}
    variant="card"
    size="md"
>
    <Input
        id="user_email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
    />
</FieldWrapper>
```

## Enhanced Combobox

The enhanced Combobox provides a modern dropdown experience with mobile optimization, search functionality, and improved accessibility.

### Combobox Props Interface

```typescript
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
}
```

### Combobox Key Features

- **Mobile-First Design**: Touch-friendly interactions and responsive layouts
- **Advanced Search**: Real-time filtering with customizable search experience
- **Category Support**: Group options by categories for better organization
- **Loading States**: Built-in loading indicators and empty state handling
- **Accessibility**: Full keyboard navigation and screen reader support

### Combobox Usage Example

```tsx
import { Combobox } from '../../ui/form/Combobox';

const [isOpen, setIsOpen] = useState(false);
const [selectedValue, setSelectedValue] = useState('');

<Combobox
    open={isOpen}
    onOpenChange={setIsOpen}
    value={selectedValue}
    onSelect={setSelectedValue}
    options={[
        { value: 'option1', label: 'Option 1', description: 'First option' },
        { value: 'option2', label: 'Option 2', category: 'Category A' }
    ]}
    placeholder="Select an option..."
    searchPlaceholder="Search options..."
    size="md"
    variant="default"
    allowCustomValue
    showClearButton
/>
```

## Mobile-First Child Table

The redesigned TableField component provides an excellent mobile experience with collapsible cards, swipe actions, and touch-friendly controls.

### TableField Key Features

- **Responsive Design**: Automatic switching between table and card layouts
- **Collapsible Rows**: Expandable/collapsible mobile cards with summary previews
- **Swipe Actions**: Touch gestures for quick actions (duplicate, delete)
- **Enhanced Add Actions**: Prominent, touch-friendly add buttons
- **Status Indicators**: Visual feedback for new rows, validation states
- **Smooth Animations**: Fluid transitions between expanded/collapsed states

### Mobile Experience

- **Card Layout**: Each table row becomes an individual card on mobile
- **Primary Field Display**: First field value shown as card title
- **Quick Preview**: Key field values visible when collapsed
- **Swipe Gestures**: Swipe left to reveal action buttons
- **Touch Targets**: Minimum 44px height for all interactive elements

### TableField Usage Example

```tsx
import { TableField } from '../../form/fields/TableField';

<TableField
    field={{
        fieldname: 'line_items',
        label: 'Order Items',
        fieldtype: 'Table',
        table_fields: [
            { fieldname: 'item_name', label: 'Item', fieldtype: 'Data' },
            { fieldname: 'quantity', label: 'Qty', fieldtype: 'Int' },
            { fieldname: 'rate', label: 'Rate', fieldtype: 'Currency' }
        ]
    }}
    value={tableData}
    onChange={setTableData}
    disabled={false}
/>
```

## Validation System

The enhanced validation system provides real-time feedback, multiple validation states, and smooth animations.

### Validation Components

#### ValidationMessage

```typescript
interface ValidationMessageProps {
    status: 'success' | 'error' | 'warning' | 'info';
    message: string;
    showIcon?: boolean;
    dismissible?: boolean;
    onDismiss?: () => void;
    className?: string;
    compact?: boolean;
    animate?: boolean;
}
```

#### InlineValidation

```typescript
interface InlineValidationProps {
    message?: string;
    status?: ValidationStatus;
    className?: string;
}
```

#### LiveValidation

```typescript
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
```

### Validation Usage Example

```tsx
import { LiveValidation, ValidationMessage } from '../../ui/form/ValidationMessage';

// Real-time validation
<LiveValidation 
    value={email} 
    rules={[
        {
            test: (value) => value.length > 0,
            message: 'Email is required',
            status: 'error'
        },
        {
            test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: 'Please enter a valid email',
            status: 'error'
        }
    ]}
    debounceMs={300}
>
    {({ status, message, isValidating }) => (
        <FieldWrapper
            validationStatus={status}
            isValidating={isValidating}
            error={status === 'error' ? message : undefined}
        >
            <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
        </FieldWrapper>
    )}
</LiveValidation>

// Standalone validation message
<ValidationMessage
    status="success"
    message="Form submitted successfully!"
    dismissible
    onDismiss={() => setShowMessage(false)}
/>
```

## Loading States

Comprehensive loading state management with skeleton loaders, progressive loading, and overlay patterns.

### Loading Components

#### FieldSkeleton

```typescript
interface FieldSkeletonProps {
    variant?: 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'table' | 'card';
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    showDescription?: boolean;
    className?: string;
    rows?: number;
}
```

#### FormLoadingOverlay

```typescript
interface FormLoadingOverlayProps {
    isLoading: boolean;
    message?: string;
    children: React.ReactNode;
    className?: string;
    blur?: boolean;
}
```

#### ProgressiveFieldLoader

```typescript
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
```

### Loading Usage Examples

```tsx
// Skeleton loader while fields are loading
<FieldSkeleton 
    variant="input" 
    showLabel 
    showDescription 
    size="md" 
/>

// Form overlay during submission
<FormLoadingOverlay 
    isLoading={isSubmitting} 
    message="Saving your changes..."
    blur
>
    <MyForm />
</FormLoadingOverlay>

// Progressive field loading
<ProgressiveFieldLoader 
    fields={[
        { id: 'name', type: 'input', loaded: true },
        { id: 'email', type: 'input', loaded: false },
        { id: 'bio', type: 'textarea', loaded: false }
    ]}
    staggerDelay={200}
/>

// Individual field loading state
<FieldWrapper
    fieldname="async_field"
    label="Data Field"
    loading={isFieldLoading}
>
    <Input disabled={isFieldLoading} />
</FieldWrapper>
```

## Best Practices

### Design Consistency

- Always use FieldWrapper for consistent styling and behavior
- Stick to the established size variants (sm, md, lg)
- Use appropriate variants (default, card, minimal) based on context

### Mobile Optimization

- Ensure minimum 44px touch targets on mobile devices
- Use appropriate breakpoints for responsive behavior
- Test swipe gestures and touch interactions

### Accessibility

- Include proper ARIA labels and descriptions
- Ensure keyboard navigation works correctly
- Provide screen reader friendly error messages
- Use semantic HTML elements where possible

### Performance

- Implement debouncing for real-time validation (300-500ms)
- Use skeleton loaders for perceived performance
- Lazy load heavy form components when possible

### Validation UX

- Show validation feedback immediately for critical errors
- Use warning states for non-blocking issues
- Provide success confirmation for completed fields
- Include helpful error messages with correction guidance

### Loading State Best Practices

- Show skeleton loaders for initial content loading
- Use progressive loading for large forms
- Implement loading overlays for blocking operations
- Provide clear loading indicators and messages

## Component Integration

All components are designed to work seamlessly together:

```tsx
import { FieldWrapper } from '../../ui/form/FieldWrapper';
import { Combobox } from '../../ui/form/Combobox';
import { LiveValidation } from '../../ui/form/ValidationMessage';
import { FieldSkeleton } from '../../ui/form/FieldSkeleton';

// Complete field with all enhancements
const EnhancedSelectField = ({ field, value, onChange, isLoading }) => {
    if (isLoading) {
        return <FieldSkeleton variant="select" showLabel showDescription />;
    }

    return (
        <LiveValidation
            value={value}
            rules={[
                {
                    test: (val) => field.reqd ? !!val : true,
                    message: `${field.label} is required`,
                    status: 'error'
                }
            ]}
        >
            {({ status, message, isValidating }) => (
                <FieldWrapper
                    fieldname={field.fieldname}
                    label={field.label}
                    required={field.reqd}
                    error={status === 'error' ? message : undefined}
                    success={status === 'success' ? 'Selection valid!' : undefined}
                    isValidating={isValidating}
                    variant="card"
                >
                    <Combobox
                        value={value}
                        onSelect={onChange}
                        options={field.options}
                        placeholder={`Select ${field.label}...`}
                        error={status === 'error'}
                        size="md"
                    />
                </FieldWrapper>
            )}
        </LiveValidation>
    );
};
```

## Migration Guide

### From Basic Fields

1. Wrap existing inputs with FieldWrapper
2. Replace basic error display with enhanced validation
3. Add appropriate loading states
4. Test mobile responsiveness

### From Legacy Tables

1. Replace table components with enhanced TableField
2. Test mobile card layout
3. Configure swipe actions if needed
4. Update styling to match new design system

This documentation provides a comprehensive guide to implementing and using the enhanced form field components. Each component is designed with modern UX principles, accessibility, and mobile-first design in mind.