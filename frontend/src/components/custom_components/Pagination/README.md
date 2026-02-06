# Pagination Component

A comprehensive pagination component with support for both manual and Frappe-based automatic count calculation.

## Features

- ✅ **Dual Usage Modes**: Manual count or Frappe automatic count
- ✅ **Last Page Detection**: Next button automatically disabled on last page  
- ✅ **Responsive Design**: Optimized for both mobile and desktop
- ✅ **TypeScript Support**: Fully typed with proper interfaces
- ✅ **Customizable Display**: Optional page info, first/last buttons
- ✅ **Frappe Integration**: Uses `useFrappeGetDocCount` for automatic counting
- ✅ **Accessibility**: Proper ARIA labels and keyboard navigation

## Installation & Usage

### Import the Component

```tsx
import { Pagination } from './components/custom_components/Pagination';
// or
import Pagination from './components/custom_components/Pagination';
```

### Usage Pattern 1: Manual Count

When you already know the total count:

```tsx
const MyComponent = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = 245;
  const pageSize = 20;
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={setCurrentPage}
    />
  );
};
```

### Usage Pattern 2: Frappe Automatic Count

Let the component fetch the count automatically:

```tsx
const MyComponent = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  
  const filters = statusFilter 
    ? [['status', '=', statusFilter]] 
    : [];

  return (
    <Pagination
      currentPage={currentPage}
      pageSize={20}
      onPageChange={setCurrentPage}
      doctype="Project"
      filters={filters}
    />
  );
};
```

## Props Interface

```tsx
interface PaginationProps {
  // Required props
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  
  // Option 1: Manual count
  totalPages?: number;
  totalItems?: number;
  
  // Option 2: Frappe automatic count
  doctype?: string;
  filters?: Filter[];
  
  // Display options
  showPageInfo?: boolean;      // Default: true
  showFirstLast?: boolean;     // Default: true
  className?: string;
  disabled?: boolean;          // Default: false
}

// Filter type for Frappe
type Filter = [string, string, any] | [string, string, any, boolean];
```

## Key Features Explained

### 🚫 **Last Page Restriction**
The Next button is automatically disabled when `currentPage >= totalPages`, preventing navigation beyond available data.

### 📱 **Responsive Design** 
- Mobile: Stacked layout with essential navigation
- Desktop: Horizontal layout with full information display

### 🔍 **Automatic Count Integration**
When `doctype` is provided:
- Uses `useFrappeGetDocCount(doctype, filters)` 
- Automatically calculates `totalPages` based on count and `pageSize`
- Handles loading states gracefully

### 🎨 **Customizable Display**
- `showPageInfo={false}`: Hide item range and page info
- `showFirstLast={false}`: Hide first/last navigation buttons
- Custom `className` for styling overrides

## Component Architecture

```
Pagination/
├── index.ts                     # Main exports
├── SimplePagination.tsx         # Main pagination component
├── CurrentPageNumber.tsx        # Editable page number sub-component
├── PageCount.tsx               # Page information display sub-component  
├── Pagination.tsx              # Advanced version with sub-components
├── PaginationUsageExample.tsx  # Usage examples
└── README.md                   # This documentation
```

## Sub-Components

### CurrentPageNumber
- Displays current page with click-to-edit functionality
- Input validation for page numbers
- Keyboard navigation (Enter/Escape)

### PageCount  
- Shows detailed item range and page information
- Responsive text layout
- Formatted numbers with locale support

## Examples

See `PaginationUsageExample.tsx` for complete working examples of both usage patterns.

## Integration with DynamicTable

Perfect companion for data tables:

```tsx
<DynamicTable
  data={data}
  // ... other props
/>
<Pagination
  currentPage={currentPage}
  pageSize={pageSize}
  onPageChange={handlePageChange}
  doctype="YourDoctype"
  filters={currentFilters}
/>
```

## Browser Support

- Modern browsers with ES6+ support
- React 16.8+ (hooks required)
- TypeScript 4.0+ (if using TypeScript)