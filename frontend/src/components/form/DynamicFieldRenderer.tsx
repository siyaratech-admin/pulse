import React from 'react';
import type { FormFieldProps } from '../../types/form';
import { FrappeFieldType } from '../../types/form';
import { ConditionEvaluator } from '../../utils/conditionEvaluator';

// Import all field components
import { DataField, IntField, FloatField, CurrencyField, PasswordField } from './fields/BasicFields';
import { TextField, SmallTextField, LongTextField, CodeField, TextEditorField } from './fields/TextFields';
import { CheckField } from './fields/CheckField';
import { DateField, TimeField, DatetimeField } from './fields/DateTimeFields';
import { SelectField, AutocompleteField, LinkField } from './fields/SelectionFields';
import { AttachField } from './fields/AttachField';
import { PhoneField } from './fields/MobileField';
import { RateStarField } from './fields/RateStarField';
import { TableMultiSelectField } from './fields/TableMultiSelectField';
import { GeolocationField } from './fields/GeolocationField';
import { DurationField } from './fields/DurationField';



// Lazy load TableField to avoid circular dependency - IMPORTANT: declare outside component!
const TableFieldLazy = React.lazy(() => import('./fields/TableField').then(module => ({ default: module.TableField })));

// Special fields (simplified implementations for now)
const ReadOnlyField: React.FC<FormFieldProps> = ({ field, value, className }) => (
    <div className={className}>
        <label className="text-sm font-medium text-gray-700">{field.label}</label>
        <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded border">
            {value || '—'}
        </div>
    </div>
);



const ColorField: React.FC<FormFieldProps> = ({ field, value, onChange, error, disabled, className }) => {
    const isRequired = Boolean(field.reqd);
    const isReadOnly = Boolean(field.read_only);

    return (
        <div className={className}>
            <label className="text-sm font-medium text-gray-700">
                {field.label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex gap-2 mt-1">
                <input
                    type="color"
                    value={value || '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled || isReadOnly}
                    className="h-10 w-20 rounded border border-gray-300"
                />
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

// Main field renderer component
export const DynamicFieldRenderer: React.FC<FormFieldProps> = (props) => {
    const { field, formData } = props;

    // Skip layout fields
    if (['Section Break', 'Column Break', 'Tab Break', 'HTML', 'Button'].includes(field.fieldtype)) {
        return null;
    }

    // Skip hidden fields (static)
    if (field.hidden) {
        return null;
    }

    // Skip fields that don't meet depends_on conditions
    if (field.depends_on && formData) {
        if (!ConditionEvaluator.evaluate(field.depends_on, formData)) {
            return null;
        }
    }

    // Render appropriate field based on type
    switch (field.fieldtype) {
        // Basic Data Fields
        case FrappeFieldType.DATA:
            return <DataField {...props} />;
        case FrappeFieldType.INT:
            return <IntField {...props} />;
        case FrappeFieldType.FLOAT:
        case FrappeFieldType.PERCENT:
            return <FloatField {...props} />;
        case FrappeFieldType.CURRENCY:
            return <CurrencyField {...props} />;
        case FrappeFieldType.PASSWORD:
            return <PasswordField {...props} />;

        // Text Fields
        case FrappeFieldType.TEXT:
            return <TextField {...props} />;
        case FrappeFieldType.SMALL_TEXT:
            return <SmallTextField {...props} />;
        case FrappeFieldType.LONG_TEXT:
            return <LongTextField {...props} />;
        case FrappeFieldType.CODE:
            return <CodeField {...props} />;
        case FrappeFieldType.TEXT_EDITOR:
            return <TextEditorField {...props} />;

        // Boolean Field
        case FrappeFieldType.CHECK:
            return <CheckField {...props} />;

        // Date & Time Fields
        case FrappeFieldType.DATE:
            return <DateField {...props} />;
        case FrappeFieldType.TIME:
            return <TimeField {...props} />;
        case FrappeFieldType.DATETIME:
            return <DatetimeField {...props} />;

        // Selection & Link Fields
        case FrappeFieldType.SELECT:
            return <SelectField {...props} />;
        case FrappeFieldType.AUTOCOMPLETE:
            return <AutocompleteField {...props} />;
        case FrappeFieldType.LINK:
        case FrappeFieldType.DYNAMIC_LINK:
            return <LinkField {...props} />;

        // Table Field - Lazy import to avoid circular dependency
        case FrappeFieldType.TABLE:
            // case FrappeFieldType.TABLE_MULTISELECT:
            return (
                <React.Suspense fallback={<div>Loading table...</div>}>
                    <TableFieldLazy {...props} parentDoctype={props.parentDoctype} formData={props.formData} />
                </React.Suspense>
            );

        // Special Fields
        case FrappeFieldType.READ_ONLY:
            return <ReadOnlyField {...props} />;
        case FrappeFieldType.ATTACH:
        case FrappeFieldType.ATTACH_IMAGE:
        case FrappeFieldType.SIGNATURE:
            return <AttachField {...props} />;
        case FrappeFieldType.COLOR:
            return <ColorField {...props} />;
        case FrappeFieldType.PHONE: // or "Phone" if it's a custom string
            return <PhoneField {...props} />;
        case FrappeFieldType.RATING:
            return <RateStarField {...props} />;
        case FrappeFieldType.TABLE_MULTISELECT:
            return <TableMultiSelectField {...props} />;
        case FrappeFieldType.DURATION:
            return <DurationField {...props} />;

        // Unsupported field types
        case FrappeFieldType.BARCODE:
        case FrappeFieldType.GEOLOCATION:
            return <GeolocationField {...props} />;

        // Unsupported field types
        case FrappeFieldType.BARCODE:
            return (
                <div className={props.className}>
                    <label className="text-sm font-medium text-gray-700">
                        {field.label}
                        {!!field.reqd && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">
                            This field type is not yet supported
                        </p>
                    </div>
                </div>
            );

        default:
            return (
                <div className={props.className}>
                    <label className="text-sm font-medium text-gray-700">
                        {field.label}
                        {!!field.reqd && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">
                            Unsupported field type
                        </p>
                    </div>
                </div>
            );
    }
};