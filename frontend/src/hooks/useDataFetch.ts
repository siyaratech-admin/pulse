import { useMemo } from 'react';
import { useFrappeGetDocList } from 'frappe-react-sdk';

export interface UseDataFetchProps {
  doctype: string;
  fields?: string[];
  limitStart: number;
  limit: number;
  orderBy?: { field: string; order: 'asc' | 'desc' };
  filters?: any[];
}

export interface UseDataFetchReturn {
  data: any[];
  isLoading: boolean;
  error?: any;
  refetch?: () => void;
}

export const useDataFetch = ({
  doctype,
  fields = ['*'],
  limitStart,
  limit,
  orderBy = { field: 'modified', order: 'desc' },
  filters = []
}: UseDataFetchProps): UseDataFetchReturn => {
  
  const { data, isLoading, error, mutate } = useFrappeGetDocList(doctype, {
    fields,
    limit_start: limitStart,
    limit,
    orderBy,
    filters,
  });

  const processedData = useMemo(() => data || [], [data]);

  return {
    data: processedData,
    isLoading,
    error,
    refetch: mutate,
  };
};