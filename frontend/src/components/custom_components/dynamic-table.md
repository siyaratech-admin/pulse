# DynamicTable Component

A reusable, feature-rich table component that automatically generates columns from data with configurable sticky columns, custom rendering, and built-in actions.

## Features

- **Automatic Column Generation**: Automatically creates columns based on data structure
- **Sticky Columns**: Configure which columns should stick to the left while scrolling
- **Type-Aware Rendering**: Different rendering for dates, numbers, badges, progress bars, etc.
- **Custom Renderers**: Override default rendering for specific fields
- **Custom Badge Variants**: Configure badge colors for different field values
- **Action Handlers**: Built-in support for view, edit, and delete actions
- **Responsive Design**: Horizontal scrolling with sticky positioning
- **Footer Statistics**: Automatic calculation of totals and averages
- **Loading States**: Built-in loading state handling

## Installation

```tsx
import { DynamicTable } from '../../../components/ui/dynamic-table';
```

## Basic Usage

```tsx
const MyComponent = () => {
  const data = [
    { name: 'Item 1', status: 'active', count: 10 },
    { name: 'Item 2', status: 'inactive', count: 5 },
  ];

  return (
    <DynamicTable
      data={data}
      caption="My dynamic table"
    />
  );
};
```

## Props

### Required Props

- **data**: `any[]` - Array of data objects to display

### Optional Props

- **stickyFields**: `string[]` - Field names that should be sticky (default: `[]`)
- **excludeFields**: `string[]` - Field names to exclude from the table (default: `['docstatus', 'idx', 'modified', 'modified_by', 'owner', 'creation']`)
- **caption**: `string` - Table caption text
- **isLoading**: `boolean` - Loading state (default: `false`)
- **showActions**: `boolean` - Show actions column (default: `true`)
- **onView**: `(item: any) => void` - View action handler
- **onEdit**: `(item: any) => void` - Edit action handler
- **onDelete**: `(item: any) => void` - Delete action handler
- **customRenderers**: `Record<string, (value: any, item: any) => React.ReactNode>` - Custom field renderers
- **badgeVariants**: `Record<string, Record<string, string>>` - Custom badge variant mappings

## Column Types

The component automatically detects column types based on field names and values:

- **text**: Default text display
- **number**: Formatted numbers with locale formatting
- **date**: Formatted dates (MM/DD/YYYY format)
- **badge**: Colored badges for status/category fields
- **progress**: Progress bars for percentage fields
- **boolean**: Active/Inactive badges for boolean values
- **actions**: View/Edit/Delete action buttons

## Custom Badge Variants

Configure custom colors for badge fields:

```tsx
const customBadgeVariants = {
  status: {
    'active': 'default',
    'inactive': 'secondary',
    'error': 'destructive',
  },
  priority: {
    'high': 'destructive',
    'medium': 'secondary',
    'low': 'outline',
  },
};

<DynamicTable
  data={data}
  badgeVariants={customBadgeVariants}
/>
```

## Custom Renderers

Override rendering for specific fields:

```tsx
const customRenderers = {
  email: (value, item) => (
    <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
      {value}
    </a>
  ),
  avatar: (value, item) => (
    <img src={value} alt={item.name} className="w-8 h-8 rounded-full" />
  ),
};

<DynamicTable
  data={data}
  customRenderers={customRenderers}
/>
```

## Sticky Columns

Configure which columns should remain visible while scrolling:

```tsx
<DynamicTable
  data={data}
  stickyFields={['name', 'id']} // These columns will stick to the left
/>
```

## Action Handlers

Handle table actions:

```tsx
const handleView = (item) => {
  console.log('Viewing:', item);
  // Navigate to detail page
};

const handleEdit = (item) => {
  console.log('Editing:', item);
  // Open edit modal/page
};

const handleDelete = (item) => {
  console.log('Deleting:', item);
  // Show confirmation dialog
};

<DynamicTable
  data={data}
  onView={handleView}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## Complete Example

```tsx
import React from 'react';
import { DynamicTable } from '../../../components/ui/dynamic-table';
import { useFrappeGetDocList } from 'frappe-react-sdk';

const ProjectsTable = () => {
  const { data, isLoading } = useFrappeGetDocList('Project', {
    fields: ['name', 'project_name', 'status', 'priority', 'percent_completed']
  });

  const customBadgeVariants = {
    status: {
      'open': 'default',
      'completed': 'secondary',
      'cancelled': 'destructive',
    },
    priority: {
      'high': 'destructive',
      'medium': 'secondary',
      'low': 'outline',
    },
  };

  const handleView = (project) => {
    window.location.href = `/projects/${project.name}`;
  };

  const handleEdit = (project) => {
    window.location.href = `/projects/${project.name}/edit`;
  };

  const handleDelete = async (project) => {
    if (confirm('Are you sure you want to delete this project?')) {
      // Delete logic here
    }
  };

  return (
    <DynamicTable
      data={data || []}
      stickyFields={['name', 'project_name']}
      excludeFields={['docstatus', 'idx', 'modified']}
      caption="Project Management Dashboard"
      isLoading={isLoading}
      showActions={true}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      badgeVariants={customBadgeVariants}
    />
  );
};
```

## Styling

The component uses Tailwind CSS classes and follows the shadcn/ui design system. All table elements are fully customizable through CSS classes.

## Type Safety

The component includes full TypeScript support with exported interfaces:

- `ColumnConfig`: Configuration for individual columns
- `DynamicTableProps`: Component props interface

## Performance

- Uses `useMemo` for column generation to prevent unnecessary re-renders
- Efficient sticky positioning with CSS
- Optimized for large datasets with proper table virtualization support