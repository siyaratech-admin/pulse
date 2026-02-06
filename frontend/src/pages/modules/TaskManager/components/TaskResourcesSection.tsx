import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFrappeGetDocList } from "frappe-react-sdk";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { Combobox } from "@/components/ui/form/Combobox";
import { ValidationMessage } from "@/components/ui/form/ValidationMessage";

// --- Resource Row Component ---
interface ResourceRowProps {
    item: any;
    index: number;
    type: 'labour' | 'machinery' | 'material' | 'concrete';
    label: string;
    itemField: string;
    options: any[];
    isReadOnly?: boolean;
    isQtyReadOnly?: boolean;
    updateResource: (type: string, index: number, field: string, value: any, extraData?: any) => void;
    removeResource: (type: string, index: number) => void;
    extraFields?: {
        key: string;
        label: string;
        editable?: boolean;
        type?: string;
        options?: any[];
    }[];
    qtyField: string; // Dynamic quantity field name
}

const ResourceRow: React.FC<ResourceRowProps> = ({
    item,
    index,
    type,
    label,
    itemField,
    options,
    isReadOnly,
    isQtyReadOnly,
    updateResource,
    removeResource,
    extraFields = [],
    qtyField
}) => {
    const [open, setOpen] = useState(false);

    return (
        <TableRow className="hover:bg-muted/50">
            {/* 1. Main Item Selection */}
            <TableCell className="align-top min-w-[200px]">
                <Combobox
                    open={open}
                    onOpenChange={setOpen}
                    value={item[itemField]}
                    onSelect={(value) => {
                        const selectedOption = options.find((opt: any) => opt.value === value);
                        updateResource(type, index, itemField, value, selectedOption?.originalData);
                        setOpen(false);
                    }}
                    options={options}
                    placeholder={`Select ${label}...`}
                    className="w-full"
                    disabled={isReadOnly}
                />
            </TableCell>

            {/* 2. Extra Fields */}
            {extraFields.map((field: any) => (
                <TableCell key={field.key} className="align-top min-w-[100px]">
                    {field.editable && !isReadOnly ? (
                        field.type === 'select' ? (
                            <select
                                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={item[field.key] || ""}
                                onChange={(e) => updateResource(type, index, field.key, e.target.value)}
                            >
                                <option value="" disabled>Select...</option>
                                {field.options?.map((opt: any) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        ) : field.type === 'date' ? (
                            <Input
                                className="h-9"
                                type="date"
                                value={item[field.key] || ""}
                                onChange={(e) => updateResource(type, index, field.key, e.target.value)}
                                placeholder={field.label}
                            />
                        ) : (
                            <Input
                                className="h-9"
                                type={
                                    field.key.includes('rate') ||
                                        field.key.includes('amount') ||
                                        field.key.includes('cost')
                                        ? 'number'
                                        : 'text'
                                }
                                value={item[field.key] || ""}
                                onChange={(e) => updateResource(type, index, field.key, e.target.value)}
                                placeholder={field.label}
                            />
                        )
                    ) : (
                        <div className="py-2 px-1 text-sm font-medium truncate" title={item[field.key]}>
                            {item[field.key] || "-"}
                        </div>
                    )}
                </TableCell>
            ))}

            {/* 3. Qty */}
            <TableCell className="align-top w-[100px]">
                <Input
                    type="number"
                    className="h-9"
                    value={item[qtyField] || 0}
                    onChange={(e) => updateResource(type, index, qtyField, parseFloat(e.target.value))}
                    disabled={isReadOnly || isQtyReadOnly}
                />
            </TableCell>

            {/* 4. Delete Action */}
            <TableCell className="align-top w-[50px]">
                {!isReadOnly && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeResource(type, index)}
                        className="hover:text-red-500 text-muted-foreground h-9 w-9"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </TableCell>
        </TableRow>
    );
};

// --- Main Section Component ---
interface TaskResourcesSectionProps {
    formData: any;
    onChange: (field: string, value: any) => void;
    isReadOnly?: boolean;
    arePlannedResourcesReadOnly?: boolean;
    hiddenFieldsConfig?: {
        concrete: string[];
        machinery: string[];
        material: string[];
        labour: string[];
    };
    parentResources?: any;
}

const TaskResourcesSection: React.FC<TaskResourcesSectionProps> = ({
    formData,
    onChange,
    isReadOnly = false,
    arePlannedResourcesReadOnly = false,
    hiddenFieldsConfig,
    parentResources
}) => {
    // Helper to update formData safely
    const updateResourcesState = (
        type: 'labour' | 'machinery' | 'material' | 'concrete',
        newItems: any[]
    ) => {
        const fieldMap: any = {
            labour: "custom_labour_details",
            machinery: "custom_machinery_details",
            material: "custom_material_details",
            concrete: "custom_concrete_details"
        };
        onChange(fieldMap[type], newItems);
    };

    // Helper to check if a field should be hidden
    const isFieldHidden = (type: 'labour' | 'machinery' | 'material' | 'concrete', fieldKey: string): boolean => {
        if (!hiddenFieldsConfig) return false;
        return hiddenFieldsConfig[type]?.includes(fieldKey) || false;
    };

    // Data Fetching for Dropdowns
    const { data: labourTypes } = useFrappeGetDocList("KBLabourType", {
        fields: ["name", "labour_type"],
        limit: 1000
    });

    const { data: natureOfWorkList } = useFrappeGetDocList("KBNatureofWork", {
        fields: ["name", "nature_of_work"],
        limit: 1000
    });

    const { data: assets } = useFrappeGetDocList("Asset", {
        fields: ["name", "item_name", "asset_category", "item_code"],
        limit: 1000
    });

    const { data: items } = useFrappeGetDocList("Item", {
        fields: ["name", "item_name", "item_code", "stock_uom", "item_group", "valuation_rate"],
        limit: 1000
    });

    const { data: concreteGrades } = useFrappeGetDocList("ConcreteGrade", {
        fields: ["name", "concrete_grade"],
        limit: 100
    });

    const labourOptions = (labourTypes || []).map((d: any) => ({
        label: d.labour_type,
        value: d.name,
        originalData: d
    }));

    const natureOfWorkOptions = (natureOfWorkList || []).map((d: any) => ({
        label: d.nature_of_work || d.name,
        value: d.name,
        originalData: d
    }));

    const assetOptions = (assets || []).map((d: any) => ({
        label: d.item_name ? `${d.item_name} (${d.name})` : d.name,
        value: d.name,
        originalData: d
    }));

    const itemOptions = (items || []).map((d: any) => ({
        label: d.item_name ? `${d.item_name} (${d.item_code})` : d.name,
        value: d.item_code,
        originalData: d
    }));

    const concreteGradeOptions = (concreteGrades || []).map((d: any) => ({
        label: d.name,
        value: d.name,
        originalData: d
    }));

    // Actions
    const updateResource = (
        type: 'labour' | 'machinery' | 'material' | 'concrete',
        index: number,
        field: string,
        value: any,
        extraData?: any
    ) => {
        const fieldName =
            type === 'labour'
                ? 'custom_labour_details'
                : type === 'machinery'
                    ? 'custom_machinery_details'
                    : type === 'material'
                        ? 'custom_material_details'
                        : 'custom_concrete_details';

        const currentList = [...(formData[fieldName] || [])];

        // Ensure item exists
        if (!currentList[index]) return;

        let updatedItem = {
            ...currentList[index],
            [field]: value
        };

        // Auto-populate
        if (extraData) {
            if (type === 'labour') {
                // custom_labour_details does not seem to have rate/uom in standard schema, but we keep if needed
            } else if (type === 'material') {
                // updatedItem.item_group = extraData.item_group; // Not in schema, but maybe useful context
                updatedItem.unit = extraData.stock_uom;
                updatedItem.planned_rate = extraData.valuation_rate || 0;
            } else if (type === 'machinery') {
                // updatedItem.asset_category = extraData.asset_category;
            } else if (type === 'concrete') {
                updatedItem.unit = extraData.stock_uom || "Nos";
            }
        }

        // Recalculate Totals
        if (type === 'material') {
            const qty = field === 'planned_qty' ? parseFloat(value) || 0 : parseFloat(updatedItem.planned_qty) || 0;
            const rate = field === 'planned_rate' ? parseFloat(value) || 0 : parseFloat(updatedItem.planned_rate) || 0;
            updatedItem.planned_amount = qty * rate;

            const actualQty = field === 'actual_qty' ? parseFloat(value) || 0 : parseFloat(updatedItem.actual_qty) || 0;
            const actualRate = field === 'actual_rate' ? parseFloat(value) || 0 : parseFloat(updatedItem.actual_rate) || 0;
            updatedItem.actual_amount = actualQty * actualRate;
        } else if (type === 'machinery') {
            const hours = field === 'planned_hours' ? parseFloat(value) || 0 : parseFloat(updatedItem.planned_hours) || 0;
            const rate = field === 'planned_rate_per_hr' ? parseFloat(value) || 0 : parseFloat(updatedItem.planned_rate_per_hr) || 0;
            updatedItem.planned_cost = hours * rate;

            const actualHours = field === 'actual_hours' ? parseFloat(value) || 0 : parseFloat(updatedItem.actual_hours) || 0;
            const actualRate = field === 'actual_rate_per_hr' ? parseFloat(value) || 0 : parseFloat(updatedItem.actual_rate_per_hr) || 0;
            updatedItem.actual_cost = actualHours * actualRate;
        } else if (type === 'concrete') {
            const qty = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(updatedItem.quantity) || 0;
            const rate = field === 'rate' ? parseFloat(value) || 0 : parseFloat(updatedItem.rate) || 0;
            updatedItem.amount = qty * rate;
        }

        currentList[index] = updatedItem;
        updateResourcesState(type, currentList);
    };

    const addResource = (type: 'labour' | 'machinery' | 'material' | 'concrete') => {
        const fieldName =
            type === 'labour'
                ? 'custom_labour_details'
                : type === 'machinery'
                    ? 'custom_machinery_details'
                    : type === 'material'
                        ? 'custom_material_details'
                        : 'custom_concrete_details';

        const currentList = [...(formData[fieldName] || [])];
        let newItem: any = {};

        if (type === 'material') {
            newItem = {
                material_name: '',
                planned_qty: '1',
                unit: '',
                planned_rate: '0',
                planned_amount: 0
            };
        } else if (type === 'concrete') {
            newItem = {
                item: '',
                quantity: 1,
                unit: '',
                rate: 0,
                amount: 0
            };
        } else if (type === 'machinery') {
            newItem = {
                machinery_name: '',
                planned_hours: 1,
                planned_rate_per_hr: 0,
                planned_cost: 0
            };
        } else {
            newItem = {
                labour_type: '',
                labour_count: 1,
                nature_of_work: '',
                task: '',
                date: ''
            };
        }

        currentList.push(newItem);
        updateResourcesState(type, currentList);
    };

    const removeResource = (type: 'labour' | 'machinery' | 'material' | 'concrete', index: number) => {
        const fieldName =
            type === 'labour'
                ? 'custom_labour_details'
                : type === 'machinery'
                    ? 'custom_machinery_details'
                    : type === 'material'
                        ? 'custom_material_details'
                        : 'custom_concrete_details';

        const currentList = [...(formData[fieldName] || [])];
        currentList.splice(index, 1);
        updateResourcesState(type, currentList);
    };

    const getValidationError = (
        type: 'labour' | 'machinery' | 'material' | 'concrete',
        resources: any[],
        itemField: string,
        qtyField: string
    ) => {
        if (!parentResources) return null;

        const fieldName =
            type === 'labour'
                ? 'custom_labour_details'
                : type === 'machinery'
                    ? 'custom_machinery_details'
                    : type === 'material'
                        ? 'custom_material_details'
                        : 'custom_concrete_details';

        const parentItems = parentResources[fieldName] || [];
        if (parentItems.length === 0) return null;

        // Group totals
        const currentTotals = resources.reduce((acc: any, item: any) => {
            const key = item[itemField];
            if (!key) return acc;
            acc[key] = (acc[key] || 0) + (parseFloat(item[qtyField]) || 0);
            return acc;
        }, {});

        const parentTotals = parentItems.reduce((acc: any, item: any) => {
            const key = item[itemField];
            if (!key) return acc;
            acc[key] = (acc[key] || 0) + (parseFloat(item[qtyField]) || 0);
            return acc;
        }, {});

        // Check for overages
        const violations: string[] = [];
        Object.keys(currentTotals).forEach(key => {
            if (parentTotals[key] !== undefined && currentTotals[key] > parentTotals[key]) {
                const label = type === "labour" && labourOptions.find((o) => o.value === key)?.label || key;
                violations.push(`${label}: Used ${currentTotals[key]} / Planned ${parentTotals[key]}`);
            }
        });

        if (violations.length > 0) {
            return `Exceeds Parent Planned Resources: ${violations.join(', ')}`;
        }
        return null;
    };

    const renderTable = (
        type: 'labour' | 'machinery' | 'material' | 'concrete',
        title: string,
        itemField: string,
        label: string,
        qtyField: string,
        qtyLabel: string = "Qty"
    ) => {
        let options: any[] = [];
        let extraFields: any[] = [];

        if (type === 'labour') {
            options = labourOptions;
            extraFields = [
                { key: 'task', label: 'Task', editable: !arePlannedResourcesReadOnly },
                { key: 'date', label: 'Date', editable: !arePlannedResourcesReadOnly, type: 'date' },
                { key: 'nature_of_work', label: 'Nature of Work', editable: !arePlannedResourcesReadOnly, type: 'select', options: natureOfWorkOptions }
            ];
        } else if (type === 'machinery') {
            options = assetOptions;
            extraFields = [
                { key: 'planned_rate_per_hr', label: 'Planned Rate/Hr', editable: !arePlannedResourcesReadOnly },
                { key: 'planned_cost', label: 'Planned Cost', editable: false },
                { key: 'actual_hours', label: 'Actual Hours', editable: true },
                { key: 'actual_rate_per_hr', label: 'Actual Rate/Hr', editable: true },
                { key: 'actual_cost', label: 'Actual Cost', editable: false }
            ];
        } else if (type === 'material') {
            options = itemOptions;
            extraFields = [
                { key: 'unit', label: 'Unit', editable: !arePlannedResourcesReadOnly },
                { key: 'planned_rate', label: 'Planned Rate', editable: !arePlannedResourcesReadOnly },
                { key: 'planned_amount', label: 'Planned Amount', editable: false },
                // FIX: Removed duplicate 'planned_qty' field since it's the main Qty column
                { key: 'actual_qty', label: 'Actual Qty', editable: true },
                { key: 'actual_rate', label: 'Actual Rate', editable: true },
                { key: 'actual_amount', label: 'Actual Amount', editable: false },
            ];
        } else if (type === 'concrete') {
            options = itemOptions;
            // Define all fields first, then filter based on hiddenFieldsConfig
            const allConcreteFields = [
                { key: 'unit', label: 'Unit', editable: !arePlannedResourcesReadOnly },
                { key: 'rate', label: 'Rate', editable: !arePlannedResourcesReadOnly },
                { key: 'concrete_grade', label: 'Grade', editable: !arePlannedResourcesReadOnly, type: 'select', options: concreteGradeOptions },
                { key: 'amount', label: 'Amount', editable: false }
            ];

            // Filter out hidden fields
            extraFields = allConcreteFields.filter(field => !isFieldHidden('concrete', field.key));
        }

        // Apply hiding for other resource types too
        if (type === 'machinery') {
            extraFields = extraFields.filter(field => !isFieldHidden('machinery', field.key));
        } else if (type === 'material') {
            extraFields = extraFields.filter(field => !isFieldHidden('material', field.key));
        } else if (type === 'labour') {
            extraFields = extraFields.filter(field => !isFieldHidden('labour', field.key));
        }

        const fieldName =
            type === 'labour'
                ? 'custom_labour_details'
                : type === 'machinery'
                    ? 'custom_machinery_details'
                    : type === 'material'
                        ? 'custom_material_details'
                        : 'custom_concrete_details';

        const resources = formData[fieldName] || [];
        const validationError = getValidationError(type, resources, itemField, qtyField);

        return (
            <div className="space-y-4 pt-4">
                {validationError && (
                    <ValidationMessage status="warning" message={validationError} className="mb-2" />
                )}
                <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">{title}</Label>
                    {!isReadOnly && !arePlannedResourcesReadOnly && (
                        <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            className="border-dashed"
                            onClick={() => addResource(type)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                        </Button>
                    )}
                </div>

                <div className="border rounded-md overflow-hidden bg-white dark:bg-black">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[40%]">{label}</TableHead>
                                {extraFields.map((f: any) => (
                                    <TableHead key={f.key}>{f.label}</TableHead>
                                ))}
                                <TableHead className="w-[100px]">{qtyLabel}</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {resources.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={extraFields.length + 3}
                                        className="text-center text-muted-foreground py-8 italic"
                                    >
                                        No {title.toLowerCase()} added.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                resources.map((item: any, index: number) => (
                                    <ResourceRow
                                        key={index}
                                        item={item}
                                        index={index}
                                        type={type}
                                        label={label}
                                        itemField={itemField}
                                        options={options}
                                        isReadOnly={isReadOnly}
                                        isQtyReadOnly={arePlannedResourcesReadOnly}
                                        updateResource={updateResource as any}
                                        removeResource={removeResource as any}
                                        extraFields={extraFields}
                                        qtyField={qtyField}
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    };

    return (
        <Tabs defaultValue="labour" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="labour">Labour</TabsTrigger>
                <TabsTrigger value="machinery">Machinery</TabsTrigger>
                <TabsTrigger value="material">Material</TabsTrigger>
                <TabsTrigger value="concrete">Concrete</TabsTrigger>
            </TabsList>

            <TabsContent value="labour">
                {renderTable('labour', 'Labour', 'labour_type', 'Labour Type', 'labour_count', 'Count')}
            </TabsContent>

            <TabsContent value="machinery">
                {renderTable('machinery', 'Machinery', 'machinery_name', 'Machine', 'planned_hours', 'Planned Hrs')}
            </TabsContent>

            <TabsContent value="material">
                {renderTable('material', 'Material', 'material_name', 'Item', 'planned_qty', 'Planned Qty')}
            </TabsContent>

            <TabsContent value="concrete">
                {renderTable('concrete', 'Concrete', 'item', 'Item', 'quantity', 'Quantity')}
            </TabsContent>
        </Tabs>
    );
};

export default TaskResourcesSection;