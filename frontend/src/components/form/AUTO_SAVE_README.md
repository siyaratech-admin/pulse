# Form Auto-Save Feature Documentation

## Overview

The KBWeb form system now includes comprehensive auto-save functionality that automatically preserves user input to prevent data loss. The system uses localStorage to store form data and provides seamless restoration capabilities.

## Features

### 🔄 **Automatic Saving**
- **Debounced Auto-save**: Saves form data 2 seconds after user stops typing
- **Real-time Protection**: Prevents data loss from page refreshes, navigation, or browser crashes
- **Smart Storage**: Only saves non-empty fields and meaningful data
- **Doctype Separation**: Each form type uses separate storage keys

### 🔄 **Data Restoration**
- **Restore Notifications**: Shows notification when auto-saved data is available
- **One-click Restore**: Easy restoration with timestamp information
- **Merge Handling**: Combines initial data with auto-saved data intelligently

### 🧹 **Automatic Cleanup**
- **Form Completion**: Clears auto-save data when form is submitted successfully
- **Form Cancellation**: Clears auto-save data when user cancels the form
- **Expiration**: Auto-saves expire after 24 hours automatically
- **Storage Management**: Prevents localStorage from growing indefinitely

## Implementation

### Basic Usage

```tsx
import { DynamicForm } from '@/components/form';

function MyForm() {
  return (
    <DynamicForm
      fields={formFields}
      doctype="Project"           // Required: Used for auto-save key
      docname="project-123"       // Optional: For editing existing docs
      onSubmit={handleSubmit}     // Auto-save cleared on submit
      onCancel={handleCancel}     // Auto-save cleared on cancel
      title="Create Project"
      description="Form data will be auto-saved"
    />
  );
}
```

### Advanced Usage with Custom Hook

```tsx
import { useFormAutoSave } from '@/hooks/useFormAutoSave';

function CustomForm() {
  const [formData, setFormData] = useState({});
  
  const {
    saveFormData,
    clearFormData,
    hasAutoSaveData,
    restoreAutoSaveData
  } = useFormAutoSave({
    doctype: 'CustomForm',
    docname: 'form-123',
    debounceMs: 3000,           // Custom debounce time
    onRestore: (data) => {
      setFormData(data);
    }
  });

  // Save data manually
  const handleFieldChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    saveFormData(newData);      // Manual save trigger
  };

  return (
    <div>
      {hasAutoSaveData && (
        <button onClick={restoreAutoSaveData}>
          Restore Previous Data
        </button>
      )}
      {/* Your form fields */}
    </div>
  );
}
```

## API Reference

### DynamicForm Props

```typescript
interface DynamicFormProps {
  // ... existing props
  doctype?: string;    // Used for auto-save storage key
  docname?: string;    // Optional: For editing existing documents
}
```

### useFormAutoSave Hook

```typescript
interface UseFormAutoSaveOptions {
  doctype: string;              // Document type for storage key
  docname?: string;             // Optional document name
  debounceMs?: number;          // Debounce delay (default: 1000ms)
  enabled?: boolean;            // Enable/disable auto-save (default: true)
  onRestore?: (data: Record<string, any>) => void; // Restore callback
}

interface UseFormAutoSaveReturn {
  saveFormData: (data: Record<string, any>) => void;
  loadFormData: () => Record<string, any> | null;
  clearFormData: () => void;
  hasAutoSaveData: boolean;
  autoSaveTimestamp: number | null;
  restoreAutoSaveData: () => void;
}
```

### FormAutoSave Utility Class

```typescript
class FormAutoSave {
  // Save form data
  static saveFormData(
    doctype: string, 
    formData: Record<string, any>, 
    docname?: string
  ): void;

  // Load saved data
  static loadFormData(
    doctype: string, 
    docname?: string
  ): Record<string, any> | null;

  // Remove saved data
  static removeFormData(
    doctype: string, 
    docname?: string
  ): void;

  // Check if data exists
  static hasFormData(
    doctype: string, 
    docname?: string
  ): boolean;

  // Get save timestamp
  static getFormDataTimestamp(
    doctype: string, 
    docname?: string
  ): number | null;

  // Get all saved forms (debugging)
  static getAllSavedForms(): FormAutoSaveData[];

  // Clear all auto-save data
  static clearAllFormData(): void;
}
```

## Storage Format

### localStorage Key Format
```
kbweb_form_autosave_{doctype}_{docname?}
```

Examples:
- `kbweb_form_autosave_Project` (new document)
- `kbweb_form_autosave_Project_PRJ-001` (editing existing)
- `kbweb_form_autosave_Customer_CUST-123`

### Data Structure
```typescript
interface FormAutoSaveData {
  formData: Record<string, any>;  // The actual form data
  timestamp: number;              // When it was saved
  doctype: string;                // Document type
  docname?: string;               // Document name (if editing)
}
```

## User Experience

### Auto-save Status Indicator
The form footer shows the current auto-save status:

- 🔄 **"Saved just now"** - Data saved within last 5 seconds
- 🔄 **"Saved 30s ago"** - Shows time since last save
- ☁️ **"Saved 2:30 PM"** - Shows time for older saves
- 💾 **"No changes to save"** - No data entered yet
- ⚠️ **"Auto-save disabled"** - Auto-save is turned off

### Restore Notification
When auto-saved data is available, users see a blue notification bar:

```
🔄 Found auto-saved data from 2:30 PM
                              [Dismiss] [Restore Data]
```

## Data Filtering

### What Gets Saved
- ✅ **Text fields** with content
- ✅ **Number fields** with values
- ✅ **Date/time selections**
- ✅ **Checkbox states**
- ✅ **Dropdown selections**
- ✅ **Table data** with content

### What Gets Filtered Out
- ❌ **Empty strings**
- ❌ **Null/undefined values**
- ❌ **File objects** (files need separate upload handling)
- ❌ **Empty array items**
- ❌ **Objects with no meaningful data**

## Configuration Options

### Debounce Timing
```tsx
// Fast auto-save (every 500ms after typing stops)
<DynamicForm debounceMs={500} />

// Standard auto-save (every 2s - default)
<DynamicForm debounceMs={2000} />

// Slow auto-save (every 5s)
<DynamicForm debounceMs={5000} />
```

### Disabling Auto-save
```tsx
const { saveFormData } = useFormAutoSave({
  doctype: 'MyForm',
  enabled: false  // Disable auto-save
});
```

## Browser Compatibility

- ✅ **Chrome 45+**
- ✅ **Firefox 40+**
- ✅ **Safari 11+**
- ✅ **Edge 12+**
- ✅ **Mobile browsers**

### localStorage Limits
- **Desktop**: ~5-10MB per domain
- **Mobile**: ~2-5MB per domain
- **Cleanup**: Automatic removal of expired data

## Security Considerations

### Data Sensitivity
- 🔒 **No sensitive data**: Avoid auto-saving passwords, tokens, or PII
- 🔒 **Local only**: Data stays in browser localStorage
- 🔒 **No transmission**: Auto-save data is never sent to servers
- 🔒 **User device**: Only accessible on the same browser/device

### Best Practices
```tsx
// Filter sensitive fields before auto-save
const cleanDataForAutoSave = (data) => {
  const { password, token, ...safeData } = data;
  return safeData;
};
```

## Debugging

### View Saved Data
```javascript
// In browser console
import { FormAutoSave } from '@/utils/formAutoSave';

// View all saved forms
console.log(FormAutoSave.getAllSavedForms());

// Check specific form
console.log(FormAutoSave.hasFormData('Project', 'PRJ-001'));

// View raw localStorage
Object.keys(localStorage)
  .filter(key => key.startsWith('kbweb_form_autosave_'))
  .forEach(key => console.log(key, localStorage.getItem(key)));
```

### Clear All Auto-save Data
```javascript
// Clear all auto-save data (useful for testing)
FormAutoSave.clearAllFormData();
```

## Troubleshooting

### Common Issues

**1. Auto-save not working**
- Check if localStorage is available
- Verify `doctype` prop is provided
- Check browser console for errors

**2. Data not restored**
- Ensure you're using the same `doctype` and `docname`
- Check if data has expired (24 hours)
- Verify localStorage permissions

**3. Storage quota exceeded**
- Use `FormAutoSave.clearAllFormData()` to free space
- Consider reducing auto-save frequency
- Filter out large objects before saving

### Debug Mode
```tsx
// Enable debug logging
const { saveFormData } = useFormAutoSave({
  doctype: 'MyForm',
  debug: true  // Logs all auto-save operations
});
```

## Migration from Manual Save

### Before (Manual Save)
```tsx
function OldForm() {
  const [data, setData] = useState({});
  
  // User had to manually save
  const handleSave = () => {
    localStorage.setItem('form_data', JSON.stringify(data));
  };
  
  return <form onSubmit={handleSave}>...</form>;
}
```

### After (Auto-save)
```tsx
function NewForm() {
  return (
    <DynamicForm
      doctype="MyForm"
      fields={fields}
      onSubmit={handleSubmit}
      // Auto-save happens automatically!
    />
  );
}
```

## Performance Impact

- **Memory**: ~1-5KB per form (depending on field count)
- **Storage**: Minimal localStorage usage with cleanup
- **CPU**: Debounced saves prevent excessive operations
- **Network**: No network requests for auto-save operations

## Future Enhancements

### Planned Features
- [ ] **Cloud sync**: Optional cloud backup for auto-save data
- [ ] **Conflict resolution**: Handle concurrent editing scenarios
- [ ] **Field-level tracking**: Track which fields have been modified
- [ ] **Undo/redo**: Implement undo/redo using auto-save history
- [ ] **Smart suggestions**: Suggest completing forms based on auto-save data

### Integration Points
- [ ] **Analytics**: Track auto-save usage patterns
- [ ] **A/B testing**: Test different auto-save intervals
- [ ] **User preferences**: Allow users to customize auto-save settings