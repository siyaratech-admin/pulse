# Custom Hooks Documentation

This directory contains optimized React hooks that separate business logic from UI components for better maintainability and reusability.

## Available Hooks

### 1. `usePagination`
Manages pagination state and calculations with optional Frappe document counting.

```typescript
import { usePagination } from '@/hooks/usePagination';

const Component = () => {
  const {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    limitStart,
    setCurrentPage,
    setPageSize,
    goToNextPage,
    goToPreviousPage,
    resetToFirstPage
  } = usePagination({
    doctype: 'Project', // Optional: for auto-count with Frappe
    initialPageSize: 20,
    initialPage: 1,
    totalItems: 100 // Optional: manual total items
  });
};
```

### 2. `useFilters`
Manages filter state with automatic Frappe filter format conversion.

```typescript
import { useFilters } from '@/hooks/useFilters';

const Component = () => {
  const {
    filters,
    activeFilters,
    hasActiveFilters,
    frappeFilters,
    setFilter,
    removeFilter,
    clearAllFilters
  } = useFilters({
    initialFilters: { status: 'open' },
    onFilterChange: (filters) => console.log('Filters changed:', filters)
  });

  // Usage
  setFilter('status', 'completed');
  removeFilter('status');
  clearAllFilters();
};
```

### 3. `useDataFetch`
Handles data fetching with Frappe integration and loading states.

```typescript
import { useDataFetch } from '@/hooks/useDataFetch';

const Component = () => {
  const { data, isLoading, error } = useDataFetch({
    doctype: 'Project',
    fields: ['name', 'project_name', 'status'],
    limitStart: 0,
    limit: 20,
    orderBy: { field: 'modified', order: 'desc' },
    filters: [['status', '=', 'open']]
  });
};
```

### 4. `useTableActions`
Provides optimized action handlers for table operations.

```typescript
import { useTableActions } from '@/hooks/useTableActions';

const Component = () => {
  const {
    handleView,
    handleEdit,
    handleDelete,
    handleBulkDelete,
    handleBulkExport,
    handleBulkArchive
  } = useTableActions({
    onView: (item) => navigate(`/view/${item.name}`),
    onEdit: (item) => navigate(`/edit/${item.name}`),
    onDelete: (item) => deleteItem(item.name),
    onBulkDelete: (ids) => bulkDelete(ids)
  });
};
```

### 5. `useBadgeVariants`
Manages badge styling and status configurations.

```typescript
import { useBadgeVariants } from '@/hooks/useBadgeVariants';

const Component = () => {
  const { getBadgeConfig, getAllStatuses } = useBadgeVariants({
    statusConfig: {
      'open': { variant: 'default', label: 'Open' },
      'completed': { variant: 'secondary', label: 'Completed' },
      'cancelled': { variant: 'destructive', label: 'Cancelled' }
    },
    defaultVariant: 'outline'
  });

  const statusList = getAllStatuses();
  const badgeConfig = getBadgeConfig('open');
};
```

## Benefits of Using These Hooks

### 1. **Separation of Concerns**
- Business logic is separated from UI rendering
- Components focus only on presentation
- Hooks handle state management and data operations

### 2. **Reusability**
- Hooks can be shared across multiple components
- Consistent behavior across the application
- Easy to test and maintain

### 3. **Performance**
- Optimized with `useCallback` and `useMemo`
- Prevents unnecessary re-renders
- Efficient state management

### 4. **Type Safety**
- Full TypeScript support
- Comprehensive interface definitions
- Better development experience with IntelliSense

## Example: Optimized Component

```typescript
// Before: Mixed logic and UI
const ProjectsOld = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const { data } = useFrappeGetDocList('Project', {/* config */});
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Additional logic...
  };
  
  // More mixed logic and state...
  
  return (
    <div>
      {/* UI rendering with embedded logic */}
    </div>
  );
};

// After: Clean separation with hooks
const ProjectsOptimized = () => {
  const pagination = usePagination({ doctype: 'Project' });
  const filters = useFilters();
  const { data, isLoading } = useDataFetch({
    doctype: 'Project',
    limitStart: pagination.limitStart,
    limit: pagination.pageSize,
    filters: filters.frappeFilters
  });
  const actions = useTableActions({
    onView: (item) => navigate(`/view/${item.name}`)
  });
  
  return (
    <div>
      {/* Clean UI rendering without embedded logic */}
    </div>
  );
};
```

## Best Practices

1. **Use hooks for complex state logic**: If your component has multiple useState calls and complex calculations, consider extracting to a custom hook.

2. **Keep components focused on rendering**: Components should primarily handle JSX rendering and user interactions.

3. **Leverage TypeScript**: Always use proper typing for better development experience and error prevention.

4. **Combine hooks strategically**: Use multiple hooks together to build complex functionality while maintaining separation of concerns.

5. **Test hooks independently**: Custom hooks can be tested in isolation, making your test suite more robust.