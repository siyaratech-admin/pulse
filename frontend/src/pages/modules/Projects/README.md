# Projects Module

This module contains components for managing projects in the pulse application.

## Components

### 1. `Projects.tsx`
- Main projects listing page with optimized pagination
- Uses custom hooks for better performance and maintainability
- Includes filtering, sorting, and bulk actions
- Features dynamic table with selection capabilities

### 2. `NewProjectForm.tsx` 
- New project form creation page
- **API Testing Component** - Tests the DocType fields API endpoint
- Fetches field metadata from: `/api/v2/method/pulse.api.get_fields_of_doctype.get_doctype_fields`
- Displays field information with visual formatting
- Supports multiple DocTypes for testing (Project, Item, Customer, User, Company)

## API Integration

### Backend API: `get_doctype_fields`
**Endpoint**: `/api/v2/method/pulse.api.get_fields_of_doctype.get_doctype_fields`

**Purpose**: Retrieves curated field metadata for any Frappe DocType

**Features**:
- Security-first with permission checking
- Filters UI-relevant fields (excludes layout fields)
- Handles complex field types (Select, Link, Table)
- **Recursive child table support**
- Returns structured metadata for dynamic form generation

### Sample Request:
```json
{
  "doctype": "Project"
}
```

### Sample Response:
```json
[
  {
    "fieldname": "project_name",
    "label": "Project Name",
    "fieldtype": "Data",
    "reqd": true,
    "default": null,
    "description": "Enter the project name",
    "hidden": false,
    "read_only": false
  }
]
```

## Usage

### Testing the API
1. Navigate to the New Project Form
2. Select a DocType from the buttons (Project, Item, Customer, etc.)
3. Click "Test API - Get [DocType] Fields"
4. View the field metadata response

### Field Types Supported
- **Data**: Text input fields
- **Select**: Dropdown with predefined options
- **Link**: References to other DocTypes
- **Table**: Child tables with recursive field definitions
- **Check**: Boolean checkbox fields
- **Date/Datetime**: Date picker fields
- **Currency/Float**: Number input fields
- **Text Editor**: Rich text fields

## Next Steps

This API testing component serves as the foundation for:
1. **Dynamic Form Generation** - Build forms automatically from DocType metadata
2. **Field Validation** - Use field properties for client-side validation
3. **Conditional Logic** - Show/hide fields based on other field values
4. **Child Table Management** - Handle nested table data structures

## File Structure
```
src/pages/modules/Projects/
├── index.ts              # Component exports
├── Projects.tsx          # Main projects list
├── NewProjectForm.tsx    # New project form + API testing
└── README.md            # This documentation
```