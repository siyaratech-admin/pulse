// Form field types based on Frappe DocType field metadata

export interface ApiConfig {
    endpoint?: string;
    method?: 'GET' | 'POST';
    params?: Record<string, any>;
    // Enhanced Frappe-specific configuration
    apiType?: 'doctype_select' | 'link_search' | 'resource_list' | 'custom';
    doctype?: string; // For link_search and resource_list
    searchField?: string; // For link_search
    transformResponse?: (data: any) => Array<{ value: string; label: string; description?: string }>;
}

export interface FieldMetadata {
    // Core Properties
    fieldname: string;
    label: string;
    fieldtype: string;
    reqd?: number | boolean;

    // Enhanced Frappe DocField Properties (matching API response)
    bold?: number | boolean;
    columns?: number;
    default?: any;
    depends_on?: string;
    description?: string;
    fetch_from?: string;
    fetch_if_empty?: number | boolean;
    hidden?: number | boolean;
    ignore_user_permissions?: number | boolean;
    ignore_xss_filter?: number | boolean;
    in_global_search?: number | boolean;
    in_list_view?: number | boolean;
    in_preview?: number | boolean;
    in_standard_filter?: number | boolean;
    length?: number;
    mandatory_depends_on?: string;
    no_copy?: number | boolean;
    options?: string | string[] | ApiConfig;
    permlevel?: number;
    precision?: number;
    print_hide?: number | boolean;
    print_hide_if_no_value?: number | boolean;
    print_width?: string;
    read_only?: number | boolean;
    read_only_depends_on?: string;
    report_hide?: number | boolean;
    search_index?: number | boolean;
    translatable?: number | boolean;
    unique?: number | boolean;
    width?: string;

    // Table fields for Table fieldtype
    table_fields?: FieldMetadata[];

    // Legacy API configuration (keeping for backward compatibility)
    api_endpoint?: string;
    api_method?: 'GET' | 'POST';
    api_params?: Record<string, any>;

    // Enhanced API configuration 
    apiConfig?: ApiConfig;

    // Custom properties for client-side logic
    triggers_update?: boolean;
}

export interface FormFieldProps {
    field: FieldMetadata;
    value: any;
    onChange: (value: any) => void;
    onBlur?: () => void;
    error?: string;
    disabled?: boolean;
    className?: string; // Allow custom styling injection
    formData?: FormData; // Added for condition evaluation
    parentDoctype?: string; // Added for parent context awareness
    doc?: any; // Pass entire document for dependency/link filtering context
    allFields?: FieldMetadata[]; // NEW: Pass all fields for cross-dependency logic
}

export interface TableRowData {
    [key: string]: any;
    __isNew?: boolean; // Track new rows for UI purposes
    __idx?: number; // Row index
}

export interface FormData {
    [key: string]: any;
}

export interface FormErrors {
    [key: string]: string | undefined;
}

export interface ValidationRule {
    field: string;
    rule: (value: any, formData: FormData) => string | null;
}

// Frappe field types
export const FrappeFieldType = {
    // Basic Data Fields
    DATA: 'Data',
    TEXT: 'Text',
    SMALL_TEXT: 'Small Text',
    LONG_TEXT: 'Long Text',
    TEXT_EDITOR: 'Text Editor',
    CODE: 'Code',

    // Number & Boolean Fields
    INT: 'Int',
    FLOAT: 'Float',
    CURRENCY: 'Currency',
    PERCENT: 'Percent',
    CHECK: 'Check',

    // Date & Time Fields
    DATE: 'Date',
    TIME: 'Time',
    DATETIME: 'Datetime',

    // Selection & Link Fields
    SELECT: 'Select',
    LINK: 'Link',
    DYNAMIC_LINK: 'Dynamic Link',
    AUTOCOMPLETE: 'Autocomplete',

    // File & Media Fields
    ATTACH: 'Attach',
    ATTACH_IMAGE: 'Attach Image',

    // Specialized Fields
    PASSWORD: 'Password',
    SIGNATURE: 'Signature',
    READ_ONLY: 'Read Only',
    COLOR: 'Color',
    BARCODE: 'Barcode',
    GEOLOCATION: 'Geolocation',
    PHONE: 'Phone',
    RATING: 'Rating',
    DURATION: 'Duration',

    // Structural Fields
    TABLE: 'Table',
    TABLE_MULTISELECT: 'Table MultiSelect',

    // Layout Fields (not for data input)
    SECTION_BREAK: 'Section Break',
    COLUMN_BREAK: 'Column Break',
    TAB_BREAK: 'Tab Break',
    HTML: 'HTML',
    BUTTON: 'Button'
} as const;

export type FrappeFieldTypeValue = typeof FrappeFieldType[keyof typeof FrappeFieldType];

export interface DynamicFormProps {
    fields: FieldMetadata[];
    allFields?: FieldMetadata[]; // For cross-tab dependencies and lookups
    initialData?: FormData;
    onSubmit: (data: FormData) => void;
    onCancel?: () => void;
    loading?: boolean;
    className?: string;
    title?: string;
    description?: string;
    doctype?: string;
    docname?: string; // For auto-save functionality
    onFieldChange?: (field: FieldMetadata, value: any) => void;
    onSubmitDoc?: (data: FormData) => Promise<void>;
    onCancelDoc?: () => Promise<void>;
    onAmendDoc?: () => Promise<void>;
    fieldErrors?: Record<string, string>;
    hasAttemptedSubmit?: boolean;
    showTitle?: boolean; // Control visibility of the form title header
    headerActions?: React.ReactNode; // Custom actions to render in the header
}