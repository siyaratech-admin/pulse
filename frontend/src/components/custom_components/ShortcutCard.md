# ShortcutCard Component

A reusable React component for creating interactive shortcut cards with consistent styling and behavior.

## Features

- ✅ **Interactive Design**: Hover effects and smooth transitions
- ✅ **Flexible Styling**: Customizable colors and CSS classes
- ✅ **TypeScript Support**: Full type safety with detailed prop interfaces
- ✅ **Accessibility**: Keyboard navigation and screen reader support
- ✅ **Badge Support**: Optional badge text for additional context
- ✅ **External Links**: Support for external link icons
- ✅ **Disabled State**: Built-in disabled state handling

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | ✅ | - | Title of the shortcut card |
| `description` | `string` | ✅ | - | Description text shown below the title |
| `icon` | `React.ReactNode` | ✅ | - | Icon component to display |
| `onClick` | `() => void` | ✅ | - | Click handler function |
| `color` | `string` | ❌ | `"border-gray-200 hover:border-gray-300"` | CSS classes for border color and hover effects |
| `badge` | `string` | ❌ | - | Optional badge text to show in top-right corner |
| `isExternal` | `boolean` | ❌ | `false` | Whether to show external link icon instead of arrow |
| `className` | `string` | ❌ | `""` | Additional CSS classes |
| `disabled` | `boolean` | ❌ | `false` | Whether the card is disabled |

## Usage Examples

### Basic Usage

```tsx
import { ShortcutCard } from '../../../components/custom_components';
import { FileText } from 'lucide-react';

<ShortcutCard
  title="Create Report"
  description="Generate a new safety report"
  icon={<FileText className="h-4 w-4" />}
  onClick={() => navigate('/reports/new')}
/>
```

### With Custom Styling

```tsx
<ShortcutCard
  title="Earth Pit Inspection"
  description="Conduct electrical earthing system inspections"
  icon={<Shield className="h-4 w-4" />}
  color="border-blue-200 hover:border-blue-300"
  onClick={() => navigate('/safety/new-earth-pit-inspection')}
/>
```

### With Badge

```tsx
<ShortcutCard
  title="RCCB Tracker"
  description="Residual Current Circuit Breaker testing and monitoring"
  icon={<Zap className="h-4 w-4" />}
  badge="New"
  onClick={() => navigate('/safety/new-rccb-tracker')}
/>
```

### External Link

```tsx
<ShortcutCard
  title="Safety Guidelines"
  description="View external safety documentation"
  icon={<ExternalLink className="h-4 w-4" />}
  isExternal={true}
  onClick={() => window.open('https://safety-docs.com', '_blank')}
/>
```

### Disabled State

```tsx
<ShortcutCard
  title="Coming Soon"
  description="This feature is under development"
  icon={<Settings className="h-4 w-4" />}
  disabled={true}
  onClick={() => {}}
/>
```

## Color Variants

### Predefined Color Schemes

```tsx
// Blue theme
color="border-blue-200 hover:border-blue-300"

// Orange theme
color="border-orange-200 hover:border-orange-300"

// Green theme
color="border-green-200 hover:border-green-300"

// Purple theme
color="border-purple-200 hover:border-purple-300"

// Red theme
color="border-red-200 hover:border-red-300"
```

## Implementation in Safety Module

The ShortcutCard component is used in the Safety module to create categorized form shortcuts:

```tsx
{category.forms.map((form, formIndex) => (
  <ShortcutCard 
    key={formIndex}
    title={form.title}
    description={form.description}
    icon={form.icon}
    color={form.color}
    onClick={() => navigate(form.route)}
  />
))}
```

## Styling Notes

- Uses Tailwind CSS for styling
- Responsive design with grid layouts
- Smooth transitions and hover effects
- Consistent spacing and typography
- Line clamping for long descriptions

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- Proper focus indicators
- Semantic HTML structure