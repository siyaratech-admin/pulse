import { useState, useCallback, useMemo } from 'react';

export interface Filter {
  key: string;
  value: any;
  label?: string;
}

export interface UseFiltersProps {
  initialFilters?: Record<string, any>;
  onFilterChange?: (filters: Record<string, any>) => void;
}

export interface UseFiltersReturn {
  // State
  filters: Record<string, any>;
  activeFilters: Filter[];
  
  // Actions
  setFilter: (key: string, value: any) => void;
  removeFilter: (key: string) => void;
  clearAllFilters: () => void;
  
  // Computed
  hasActiveFilters: boolean;
  frappeFilters: any[];
}

export const useFilters = ({
  initialFilters = {},
  onFilterChange
}: UseFiltersProps = {}): UseFiltersReturn => {
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);

  // Convert filters to active filter objects for display
  const activeFilters = useMemo(() => {
    return Object.entries(filters)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => ({
        key,
        value,
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      }));
  }, [filters]);

  // Convert filters to Frappe format: [['field', 'operator', 'value']]
  const frappeFilters = useMemo(() => {
    return Object.entries(filters)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => [key, '=', value]);
  }, [filters]);

  const hasActiveFilters = useMemo(() => activeFilters.length > 0, [activeFilters]);

  // Actions
  const setFilter = useCallback((key: string, value: any) => {
    const newFilters = { 
      ...filters, 
      [key]: value === 'all' || value === '' ? null : value 
    };
    
    // Remove null values
    Object.keys(newFilters).forEach(k => {
      if (newFilters[k] === null) {
        delete newFilters[k];
      }
    });
    
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [filters, onFilterChange]);

  const removeFilter = useCallback((key: string) => {
    const { [key]: removed, ...newFilters } = filters;
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [filters, onFilterChange]);

  const clearAllFilters = useCallback(() => {
    setFilters({});
    onFilterChange?.({});
  }, [onFilterChange]);

  return {
    // State
    filters,
    activeFilters,
    
    // Actions
    setFilter,
    removeFilter,
    clearAllFilters,
    
    // Computed
    hasActiveFilters,
    frappeFilters,
  };
};