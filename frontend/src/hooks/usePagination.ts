import { useState, useMemo, useCallback } from 'react';
import { useFrappeGetDocCount} from 'frappe-react-sdk';

export interface UsePaginationProps {
  initialPage?: number;
  initialPageSize?: number;
  doctype: string;
  filters?: any[];
  totalItems?: number; // Allow manual total items override
}

export interface UsePaginationReturn {
  // State
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
  
  // Actions
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  resetToFirstPage: () => void;
  
  // Computed values
  limitStart: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const usePagination = ({
  initialPage = 1,
  initialPageSize = 20,
  doctype,
  filters = [],
  totalItems: manualTotalItems
}: UsePaginationProps): UsePaginationReturn => {
  const [currentPage, setCurrentPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  // Get total count from Frappe
  const { data: countData, isLoading } = useFrappeGetDocCount(doctype, filters);
  
  const totalItems = useMemo(() => {
    console.log('Pagination totalItems calculation:', {
      manualTotalItems,
      countData,
      doctype,
      filters
    });
    return manualTotalItems ?? countData ?? 0;
  }, [countData, manualTotalItems, doctype, filters]);
  const totalPages = useMemo(() => Math.ceil(totalItems / pageSize), [totalItems, pageSize]);
  const limitStart = useMemo(() => (currentPage - 1) * pageSize, [currentPage, pageSize]);
  
  const hasNextPage = useMemo(() => currentPage < totalPages, [currentPage, totalPages]);
  const hasPreviousPage = useMemo(() => currentPage > 1, [currentPage]);

  // Actions
  const setCurrentPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPageState(validPage);
  }, [totalPages]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPageState(1); // Reset to first page when page size changes
  }, []);

  const goToNextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, hasNextPage, setCurrentPage]);

  const goToPreviousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage, hasPreviousPage, setCurrentPage]);

  const resetToFirstPage = useCallback(() => {
    setCurrentPageState(1);
  }, []);

  return {
    // State
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    isLoading,
    
    // Actions
    setCurrentPage,
    setPageSize,
    goToNextPage,
    goToPreviousPage,
    resetToFirstPage,
    
    // Computed values
    limitStart,
    hasNextPage,
    hasPreviousPage,
  };
};