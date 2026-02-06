import React, { useMemo } from 'react';
import { Button } from '../../ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { CurrentPageNumber } from './CurrentPageNumber';
import { PageCount } from './PageCount';
import { useFrappeGetDocCount } from 'frappe-react-sdk';

// Type for Frappe filters
export type Filter = [string, string, any] | [string, string, any, boolean];

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  // Optional: provide total count manually
  totalPages?: number;
  totalItems?: number;
  // Or: use Frappe to automatically get count
  doctype?: string;
  filters?: Filter[];
  // Display options
  showPageInfo?: boolean;
  showFirstLast?: boolean;
  className?: string;
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages: providedTotalPages,
  totalItems: providedTotalItems,
  pageSize,
  onPageChange,
  doctype,
  filters = [],
  showPageInfo = true,
  showFirstLast = true,
  className,
  disabled = false
}) => {
  // Use Frappe hook to get document count if doctype is provided
  const shouldFetchCount = !!doctype && providedTotalItems === undefined;
  const { data: countData } = useFrappeGetDocCount(
    shouldFetchCount ? doctype! : '',
    shouldFetchCount ? (filters as any) : []
  );

  // Calculate total items and pages
  const totalItems = useMemo(() => {
    if (providedTotalItems !== undefined) {
      return providedTotalItems;
    }
    if (doctype && countData !== undefined) {
      return countData;
    }
    return 0;
  }, [providedTotalItems, countData, doctype]);

  const totalPages = useMemo(() => {
    if (providedTotalPages !== undefined) {
      return providedTotalPages;
    }
    return Math.ceil(totalItems / pageSize);
  }, [providedTotalPages, totalItems, pageSize]);
  // Calculate if navigation buttons should be disabled
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage >= totalPages;
  
  // Handle navigation
  const goToFirstPage = () => !disabled && !isFirstPage && onPageChange(1);
  const goToPreviousPage = () => !disabled && !isFirstPage && onPageChange(currentPage - 1);
  const goToNextPage = () => !disabled && !isLastPage && onPageChange(currentPage + 1);
  const goToLastPage = () => !disabled && !isLastPage && onPageChange(totalPages);

  // Don't render if there's only one page or no items
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4",
      className
    )}>
      {/* Page Information */}
      {showPageInfo && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <PageCount
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
          />
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        {/* First Page Button */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToFirstPage}
            disabled={disabled || isFirstPage}
            className="h-8 w-8 p-0"
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Previous Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousPage}
          disabled={disabled || isFirstPage}
          className="h-8 w-8 p-0"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Current Page Number */}
        <CurrentPageNumber
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          disabled={disabled}
        />

        {/* Next Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextPage}
          disabled={disabled || isLastPage}
          className="h-8 w-8 p-0"
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page Button */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToLastPage}
            disabled={disabled || isLastPage}
            className="h-8 w-8 p-0"
            aria-label="Go to last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Pagination;