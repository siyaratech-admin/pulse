# Form Template Population Guidelines

## Overview
This document provides comprehensive guidelines for implementing template selection and data population logic in React forms using Frappe framework integration. This pattern ensures consistent behavior across all forms that require template-based child table population.

## Table of Contents
1. [Core Architecture](#core-architecture)
2. [State Management](#state-management)
3. [API Integration](#api-integration)
4. [Template Selection Logic](#template-selection-logic)
5. [Child Table Population](#child-table-population)
6. [Error Handling](#error-handling)
7. [Performance Optimization](#performance-optimization)
8. [Implementation Checklist](#implementation-checklist)
9. [Examples](#examples)

## Core Architecture

### Form Component Structure
```typescript
const FormComponent: React.FC = () => {
    // Core form states
    const [fieldsData, setFieldsData] = useState<FieldMetadata[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({});
    
    // Template-specific states
    const [template, setTemplate] = useState<string | null>(null);
    const [checklistData, setChecklistData] = useState<any[]>([]);
    const [templateOptions, setTemplateOptions] = useState<{ label: string; value: string }[]>([]);
    
    // Frappe SDK integration
    const { createDoc, loading: createLoading, error: createError, isCompleted, reset } = useFrappeCreateDoc();
};
```

## State Management

### Required State Variables

#### 1. Core Form States
- **`fieldsData`**: Stores DocType field metadata
- **`isLoading`**: Controls loading states during API calls
- **`error`**: Manages error states and messages
- **`formData`**: Maintains current form data state

#### 2. Template-Specific States
- **`template`**: Currently selected template name
- **`checklistData`**: Raw checklist data from template
- **`templateOptions`**: Available template options for dropdowns

#### 3. Frappe SDK States
- **`createDoc`**: Function to create documents
- **`createLoading`**: Loading state for document creation
- **`createError`**: Error state for document creation
- **`isCompleted`**: Success state after document creation

### State Initialization Pattern
```typescript
useEffect(() => {
    fetchInitialFormData();
}, []);

useEffect(() => {
    if (template) {
        console.log(`📋 Template selected: ${template}`);
        // Template-specific logic here
    }
}, [template]);

useEffect(() => {
    if (isCompleted && !createError) {
        const timer = setTimeout(() => {
            navigate('/module-dashboard');
        }, 1500);
        return () => clearTimeout(timer);
    }
}, [isCompleted, createError, navigate]);
```

## API Integration

### 1. Initial Form Data Fetching

#### Pattern: `fetchInitialFormData()`
```typescript
const fetchInitialFormData = async () => {
    console.log('Fetching DocType fields and Template options...');
    setIsLoading(true);
    setError(null);

    try {
        // Step 1: Fetch DocType fields
        const fieldsResponse = await fetch('/api/v2/method/kbweb.api.get_fields_of_doctype.get_form_meta', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || '',
            },
            body: JSON.stringify({
                doctype_name: doctype_name
            })
        });

        if (!fieldsResponse.ok) {
            throw new Error(`HTTP error! status: ${fieldsResponse.status}`);
        }

        const fieldsData = await fieldsResponse.json();
        let fieldsArray = fieldsData.message || fieldsData.data || fieldsData;
        
        if (!Array.isArray(fieldsArray)) {
            throw new Error('Invalid fields response format');
        }

        // Step 2: Enhance template fields
        const updatedFields = fieldsArray.map(field => {
            if (field.fieldname === 'TEMPLATE_FIELD_NAME' && field.fieldtype === 'Link') {
                return {
                    ...field,
                    triggers_update: true, // Mark for special handling
                };
            }
            return field;
        });

        setFieldsData(updatedFields);

    } catch (err) {
        console.error('Error fetching initial form data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load form data');
    } finally {
        setIsLoading(false);
    }
};
```

### 2. Template Data Fetching

#### Pattern: `fetchChecklist()` or `fetchTemplateData()`
```typescript
const fetchChecklist = async (template: string) => {
    console.log(`Fetching data for template: ${template}...`);
    setIsLoading(true);
    setError(null);

    try {
        const templateDoctype = 'TEMPLATE_DOCTYPE_NAME'; // e.g., 'Quality Checklist Template'
        
        const response = await fetch('/api/v2/method/frappe.client.get', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || '',
            },
            body: JSON.stringify({
                doctype: templateDoctype,
                name: template
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - Template '${template}' not found`);
        }

        const data = await response.json();
        console.log('Template API Response:', data);

        // Step 1: Store raw data
        if (data.data && data.data.CHILD_TABLE_FIELD) {
            console.log(`📋 Found ${data.data.CHILD_TABLE_FIELD.length} items for template '${template}'`);
            setChecklistData(data.data.CHILD_TABLE_FIELD);
            
            // Step 2: Auto-populate form data
            setFormData(prev => ({
                ...prev,
                CHILD_TABLE_FIELD: data.data.CHILD_TABLE_FIELD.map((item: any) => ({
                    // Map template fields to form fields
                    field1: item.field1,
                    field2: item.field2,
                    field3: item.field3 || '', // Default values
                }))
            }));
        } else {
            console.warn('No data found in template');
            setChecklistData([]);
        }

    } catch (err) {
        console.error('Error fetching template data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load template data');
    } finally {
        setIsLoading(false);
    }
};
```

## Template Selection Logic

### Field Detection and Enhancement
```typescript
// 1. Identify template fields during initial data fetch
const updatedFields = fieldsArray.map(field => {
    // Use specific field names based on your DocType
    if (field.fieldname === 'template_field_name' && field.fieldtype === 'Link') {
        return {
            ...field,
            triggers_update: true, // Enable special handling
        };
    }
    return field;
});
```

### onFieldChange Handler
```typescript
onFieldChange={(field: FieldMetadata, value: any) => {
    // Always update form data
    setFormData(prev => ({ ...prev, [field.fieldname]: value }));
    
    // Handle template selection
    if (field.fieldname === 'TEMPLATE_FIELD_NAME' && field.triggers_update) {
        console.log(`🎯 Template selected: ${value}`);
        setTemplate(value);

        // Fetch template data immediately
        if (value) {
            fetchTemplateData(value);
        }
    }
}}
```

## Child Table Population

### Data Mapping Patterns

#### 1. Direct Field Mapping
```typescript
// For identical field names
CHILD_TABLE_FIELD: templateData.map((item: any) => ({
    field1: item.field1,
    field2: item.field2,
    field3: item.field3,
}))
```

#### 2. Field Transformation
```typescript
// For different field names or data transformation
checklist: templateData.map((item: any) => ({
    particulars: item.question_text,           // Rename field
    activity_check: item.check_type,           // Rename field
    response: item.default_response || '',     // Default value
    remarks: item.notes || '',                 // Default value
    custom_field: `${item.prefix}_${item.id}`, // Computed field
}))
```

#### 3. Index-based Population
```typescript
// For maintaining order and adding metadata
checklist: templateData.map((item: any, index: number) => ({
    idx: index + 1,                    // Frappe index
    ...item,                          // Spread original data
    parent: null,                     // Will be set on save
    parentfield: 'checklist',         // Child table field name
    parenttype: 'Parent DocType',     // Parent DocType name
}))
```

### Dynamic Child Table Updates
```typescript
// Update specific child table row
const updateChildTableRow = (rowIndex: number, field: string, value: any) => {
    setFormData(prev => ({
        ...prev,
        CHILD_TABLE_FIELD: prev.CHILD_TABLE_FIELD?.map((row, index) => 
            index === rowIndex 
                ? { ...row, [field]: value }
                : row
        ) || []
    }));
};

// Add new child table row
const addChildTableRow = (newRow: any) => {
    setFormData(prev => ({
        ...prev,
        CHILD_TABLE_FIELD: [...(prev.CHILD_TABLE_FIELD || []), newRow]
    }));
};

// Remove child table row
const removeChildTableRow = (rowIndex: number) => {
    setFormData(prev => ({
        ...prev,
        CHILD_TABLE_FIELD: prev.CHILD_TABLE_FIELD?.filter((_, index) => index !== rowIndex) || []
    }));
};
```

## Error Handling

### Comprehensive Error Management
```typescript
const handleApiError = (error: any, context: string) => {
    const errorMessage = error instanceof Error ? error.message : `Failed to ${context}`;
    console.error(`Error in ${context}:`, error);
    setError(errorMessage);
    
    // Optional: Send error to monitoring service
    // errorMonitoring.captureError(error, { context });
};

// Usage in API calls
try {
    // API call
} catch (err) {
    handleApiError(err, 'fetch template data');
} finally {
    setIsLoading(false);
}
```

### Error Recovery Patterns
```typescript
// Retry mechanism
const retryApiCall = async (apiFunction: () => Promise<any>, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await apiFunction();
        } catch (error) {
            if (attempt === maxRetries) throw error;
            console.warn(`Attempt ${attempt} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
};
```

## Performance Optimization

### 1. Caching Strategies

#### Template Options Caching
```typescript
// Cache template options to avoid repeated API calls
const templateOptionsCache = new Map<string, any[]>();

const fetchTemplateOptions = async (doctype: string) => {
    if (templateOptionsCache.has(doctype)) {
        return templateOptionsCache.get(doctype);
    }
    
    const options = await apiCall(); // Your API call
    templateOptionsCache.set(doctype, options);
    return options;
};
```

#### Template Data Caching
```typescript
// Cache template data for reuse
const templateDataCache = new Map<string, any>();

const fetchCachedTemplateData = async (templateName: string) => {
    const cacheKey = `template_${templateName}`;
    
    if (templateDataCache.has(cacheKey)) {
        console.log('📦 Using cached template data');
        return templateDataCache.get(cacheKey);
    }
    
    const data = await fetchTemplateData(templateName);
    templateDataCache.set(cacheKey, data);
    return data;
};
```

### 2. Debouncing

#### Search and Selection Debouncing
```typescript
import { useCallback } from 'react';
import { debounce } from 'lodash';

const debouncedTemplateSearch = useCallback(
    debounce(async (searchTerm: string) => {
        if (searchTerm.length > 2) {
            await searchTemplates(searchTerm);
        }
    }, 300),
    []
);
```

### 3. Memoization

#### Expensive Computations
```typescript
import { useMemo } from 'react';

const processedChecklistData = useMemo(() => {
    if (!checklistData.length) return [];
    
    return checklistData.map(item => ({
        ...item,
        computed_field: expensiveComputation(item),
    }));
}, [checklistData]);
```

## Implementation Checklist

### ✅ Initial Setup
- [ ] Import required React hooks and types
- [ ] Set up Frappe SDK integration (`useFrappeCreateDoc`)
- [ ] Define DocType name constant
- [ ] Initialize all required state variables

### ✅ State Management
- [ ] Core form states (fieldsData, isLoading, error, formData)
- [ ] Template-specific states (template, checklistData, templateOptions)
- [ ] Proper useEffect hooks for lifecycle management

### ✅ API Integration
- [ ] `fetchInitialFormData()` function
- [ ] `fetchTemplateData()` function  
- [ ] Proper error handling in all API calls
- [ ] CSRF token handling

### ✅ Field Enhancement
- [ ] Identify template fields in field metadata
- [ ] Add `triggers_update` property to template fields
- [ ] Handle field mapping and transformation

### ✅ Event Handling
- [ ] Implement `onFieldChange` handler
- [ ] Template selection detection logic
- [ ] Immediate template data fetching

### ✅ Child Table Population
- [ ] Data mapping from template to form structure
- [ ] Handle default values and field transformations
- [ ] Update formData state with child table data

### ✅ Error Handling
- [ ] Comprehensive try-catch blocks
- [ ] User-friendly error messages
- [ ] Error state management and display

### ✅ Performance
- [ ] Implement caching where appropriate
- [ ] Add debouncing for search operations
- [ ] Use memoization for expensive computations

### ✅ User Experience
- [ ] Loading states during API calls
- [ ] Success/error feedback
- [ ] Proper navigation after completion

## Examples

### Example 1: Material Inspection Form

**Template Field**: `name_of_the_material`  
**Template DocType**: `Material Template`  
**Child Table**: `questions` (from template) → `check_points` (in form)

```typescript
// Field detection
if (field.fieldname === 'name_of_the_material' && field.fieldtype === 'Link') {
    return { ...field, triggers_update: true };
}

// Template selection
if (field.fieldname === 'name_of_the_material' && field.triggers_update) {
    setTemplate(value);
    // Note: Uses fetch_from for auto-population
}
```

### Example 2: Quality Checklist Inspection Form

**Template Field**: `name_of_the_template`  
**Template DocType**: `Quality Checklist Template`  
**Child Table**: `checklist` (both template and form)

```typescript
// Field detection
if (field.fieldname === 'name_of_the_template' && field.fieldtype === 'Link') {
    return { ...field, triggers_update: true };
}

// Template selection and immediate fetching
if (field.fieldname === 'name_of_the_template' && field.triggers_update) {
    setTemplate(value);
    if (value) {
        fetchChecklist(value);
    }
}

// Data population
setFormData(prev => ({
    ...prev,
    checklist: data.data.checklist.map((item: any) => ({
        particulars: item.particulars,
        activity_check: item.activity_check,
        response: item.response || '',
        remarks: item.remarks || ''
    }))
}));
```

## Common Patterns by Use Case

### Pattern A: Fetch_from Integration (Material Inspection)
- Template selection triggers Frappe's fetch_from mechanism
- Data auto-population handled by DynamicForm
- Minimal manual intervention required

### Pattern B: Immediate Fetching (Quality Checklist)
- Template selection immediately triggers API call
- Manual data mapping and form state updates
- Full control over data transformation

### Pattern C: Hybrid Approach
- Initial fetch_from for basic fields
- Additional API calls for complex child tables
- Combines automatic and manual population

## Best Practices

1. **Consistency**: Use the same state variable names across all forms
2. **Error Handling**: Always provide user-friendly error messages
3. **Loading States**: Show appropriate loading indicators during API calls
4. **Caching**: Cache frequently accessed data to improve performance
5. **Logging**: Add comprehensive console logging for debugging
6. **Type Safety**: Use TypeScript interfaces for all data structures
7. **Documentation**: Comment complex logic and API integrations
8. **Testing**: Test template selection and data population scenarios

## Troubleshooting

### Common Issues

1. **Template Data Not Populating**
   - Check field name mapping
   - Verify template DocType name
   - Ensure triggers_update is set

2. **Child Table Empty**
   - Verify child table field names
   - Check data mapping logic
   - Ensure template has data

3. **Performance Issues**
   - Implement caching
   - Add debouncing
   - Optimize API calls

4. **Error States**
   - Check CSRF token
   - Verify API endpoints
   - Handle network errors

---

*This guideline should be updated as new patterns emerge or requirements change. Always test implementations thoroughly before deploying to production.*