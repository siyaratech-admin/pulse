# API-Enabled Select Fields Documentation

This documentation explains how to use the enhanced SelectField component that supports fetching options from APIs.

## Features

✅ **Static Options Support** - Traditional string array or newline-separated options  
✅ **API Integration** - Fetch options dynamically from REST APIs  
✅ **Frappe API Compatible** - Built-in support for Frappe API response formats  
✅ **Loading States** - Visual feedback during API calls  
✅ **Error Handling** - Graceful fallback on API failures  
✅ **Caching** - Automatic caching of API responses  
✅ **TypeScript Support** - Full type safety with proper interfaces  

## Usage

### 1. Static Options (Existing Functionality)

```typescript
const staticField: FieldMetadata = {
    fieldname: 'priority',
    label: 'Priority',
    fieldtype: 'Select',
    reqd: false,
    options: ['Low', 'Medium', 'High', 'Critical']
};
```

### 2. API Configuration via Field Properties

```typescript
const apiField: FieldMetadata = {
    fieldname: 'status',
    label: 'Status',
    fieldtype: 'Select',
    reqd: true,
    api_endpoint: '/api/method/get_status_options',
    api_method: 'POST',
    api_params: {
        doctype: 'Task',
        filters: { active: 1 }
    }
};
```

### 3. API Configuration via Options Object

```typescript
const apiFieldAlt: FieldMetadata = {
    fieldname: 'customer',
    label: 'Customer',
    fieldtype: 'Select',
    reqd: false,
    options: {
        endpoint: '/api/method/frappe.desk.search.search_widget',
        method: 'POST',
        params: {
            doctype: 'Customer',
            page_length: 50
        }
    }
};
```

## API Response Formats

The SelectField supports multiple API response formats:

### Frappe-style Response
```json
{
    "message": [
        { "value": "open", "label": "Open", "description": "Task is open" },
        { "value": "closed", "label": "Closed", "description": "Task is completed" }
    ]
}
```

### Direct Array Response
```json
[
    { "value": "option1", "label": "Option 1" },
    { "value": "option2", "label": "Option 2" }
]
```

### Nested Data Response
```json
{
    "data": [
        { "name": "dept1", "department_name": "Sales Department" },
        { "name": "dept2", "department_name": "HR Department" }
    ]
}
```

### Simple String Array
```json
["Option 1", "Option 2", "Option 3"]
```

## Field Configuration Properties

| Property | Type | Description |
|----------|------|-------------|
| `api_endpoint` | `string` | API endpoint URL |
| `api_method` | `'GET' \| 'POST'` | HTTP method (default: 'GET') |
| `api_params` | `Record<string, any>` | Parameters to send with request |
| `options` | `string[] \| string \| ApiConfig` | Static options or API configuration |

## ApiConfig Interface

```typescript
interface ApiConfig {
    endpoint: string;
    method?: 'GET' | 'POST';
    params?: Record<string, any>;
}
```

## Authentication

The API calls automatically include:
- **Cookies**: `credentials: 'include'` for session-based auth
- **CSRF Tokens**: Automatically extracted from meta tags (Frappe compatibility)
- **Content-Type**: Set to `application/json`

## Error Handling

The component handles various error scenarios:

1. **Network Errors**: Shows "Failed to load options"
2. **HTTP Errors**: Displays status-specific messages
3. **Invalid Response**: Falls back to empty options
4. **Timeout**: Built-in request timeout handling

## Loading States

Visual feedback is provided during API calls:
- Loading spinner in dropdown
- "Loading options..." text
- Disabled state during fetch

## Caching

API responses are automatically cached based on:
- Endpoint URL
- Request parameters
- HTTP method

Cache is cleared when component unmounts or dependencies change.

## Examples

### Example 1: Status Field with Frappe API
```typescript
const statusField: FieldMetadata = {
    fieldname: 'status',
    label: 'Status',
    fieldtype: 'Select',
    reqd: true,
    api_endpoint: '/api/method/frappe.core.doctype.doctype.get_select_options',
    api_method: 'POST',
    api_params: {
        doctype: 'Task',
        fieldname: 'status'
    }
};
```

### Example 2: Customer Lookup
```typescript
const customerField: FieldMetadata = {
    fieldname: 'customer',
    label: 'Customer',
    fieldtype: 'Select',
    reqd: false,
    options: {
        endpoint: '/api/method/frappe.desk.search.search_widget',
        method: 'POST',
        params: {
            doctype: 'Customer',
            txt: '', // Search term (can be dynamic)
            page_length: 20
        }
    }
};
```

### Example 3: Department List with GET API
```typescript
const departmentField: FieldMetadata = {
    fieldname: 'department',
    label: 'Department',
    fieldtype: 'Select',
    reqd: false,
    api_endpoint: '/api/resource/Department',
    api_method: 'GET',
    api_params: {
        fields: '["name", "department_name"]',
        filters: '{"disabled": 0}',
        limit_page_length: 100
    }
};
```

## Integration with Forms

```typescript
import { DynamicForm } from '../components/form/DynamicForm';
import { exampleFormFields } from '../examples/api-select-examples';

function MyForm() {
    return (
        <DynamicForm
            fields={exampleFormFields}
            onSubmit={(data) => console.log('Form submitted:', data)}
            title="Example Form with API Select Fields"
        />
    );
}
```

## Performance Considerations

1. **Debouncing**: API calls are debounced by 300ms to prevent excessive requests
2. **Caching**: Responses are cached to avoid duplicate requests
3. **Lazy Loading**: Options are only fetched when component mounts or dependencies change
4. **Error Boundaries**: Failed API calls don't break the entire form

## Troubleshooting

### Common Issues

**Options not loading:**
- Check network tab for API errors
- Verify endpoint URL and authentication
- Check API response format matches expected structure

**Slow loading:**
- Consider pagination for large datasets
- Implement server-side filtering
- Use appropriate page_length parameter

**Authentication failures:**
- Ensure cookies are properly set
- Check CSRF token configuration
- Verify API endpoint permissions

### Debug Mode

Enable debug logging by setting:
```typescript
// In your environment or config
window.DEBUG_SELECT_FIELD = true;
```

This will log:
- API requests and responses
- Error details
- Cache hits/misses
- Performance metrics