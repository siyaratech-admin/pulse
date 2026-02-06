import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';

export interface FilterCondition {
    field: string;
    operator: string;
    value: string;
}

interface FilterBuilderProps {
    fields: Array<{ fieldname: string; label: string; fieldtype: string }>;
    filters: FilterCondition[];
    onFiltersChange: (filters: FilterCondition[]) => void;
}

const OPERATORS = [
    { value: '=', label: 'Equals' },
    { value: '!=', label: 'Not Equals' },
    { value: '>', label: 'Greater Than' },
    { value: '<', label: 'Less Than' },
    { value: '>=', label: 'Greater or Equal' },
    { value: '<=', label: 'Less or Equal' },
    { value: 'like', label: 'Contains' },
    { value: 'not like', label: 'Not Contains' },
    { value: 'in', label: 'In' },
    { value: 'not in', label: 'Not In' },
];

const FilterBuilder: React.FC<FilterBuilderProps> = ({ fields, filters, onFiltersChange }) => {
    const addFilter = () => {
        const newFilter: FilterCondition = {
            field: fields[0]?.fieldname || '',
            operator: '=',
            value: '',
        };
        onFiltersChange([...filters, newFilter]);
    };

    const removeFilter = (index: number) => {
        const newFilters = filters.filter((_, i) => i !== index);
        onFiltersChange(newFilters);
    };

    const updateFilter = (index: number, key: keyof FilterCondition, value: string) => {
        const newFilters = [...filters];
        newFilters[index] = { ...newFilters[index], [key]: value };
        onFiltersChange(newFilters);
    };

    const clearAllFilters = () => {
        onFiltersChange([]);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Filters</h3>
                <div className="flex gap-2">
                    {filters.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAllFilters}
                            className="h-8"
                        >
                            Clear All
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={addFilter}
                        className="h-8"
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Filter
                    </Button>
                </div>
            </div>

            {filters.length > 0 && (
                <div className="space-y-2">
                    {filters.map((filter, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                            <Select
                                value={filter.field}
                                onValueChange={(value) => updateFilter(index, 'field', value)}
                            >
                                <SelectTrigger className="w-[180px] h-8">
                                    <SelectValue placeholder="Select field" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fields.map((field) => (
                                        <SelectItem key={field.fieldname} value={field.fieldname}>
                                            {field.label || field.fieldname}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filter.operator}
                                onValueChange={(value) => updateFilter(index, 'operator', value)}
                            >
                                <SelectTrigger className="w-[140px] h-8">
                                    <SelectValue placeholder="Operator" />
                                </SelectTrigger>
                                <SelectContent>
                                    {OPERATORS.map((op) => (
                                        <SelectItem key={op.value} value={op.value}>
                                            {op.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                value={filter.value}
                                onChange={(e) => updateFilter(index, 'value', e.target.value)}
                                placeholder="Value"
                                className="flex-1 h-8"
                            />

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFilter(index)}
                                className="h-8 w-8 flex-shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FilterBuilder;
