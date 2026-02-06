import React from 'react';
import { cn } from '../../../lib/utils';

export interface PageCountProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  className?: string;
  showDetailedInfo?: boolean;
}

export const PageCount: React.FC<PageCountProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  className,
  showDetailedInfo = true
}) => {
  // Calculate the range of items being displayed
  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Format numbers with commas for better readability
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  if (!showDetailedInfo) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        Page {formatNumber(currentPage)} of {formatNumber(totalPages)}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col sm:flex-row gap-2 text-sm text-muted-foreground", className)}>
      {/* Items range display */}
      <div className="flex items-center gap-1">
        <span>Showing</span>
        <span className="font-medium text-foreground">
          {formatNumber(startItem)}
        </span>
        <span>to</span>
        <span className="font-medium text-foreground">
          {formatNumber(endItem)}
        </span>
        <span>of</span>
        <span className="font-medium text-foreground">
          {formatNumber(totalItems)}
        </span>
        <span>results</span>
      </div>

      {/* Page info display */}
      <div className="flex items-center gap-1">
        <span className="hidden sm:inline">•</span>
        <span>Page</span>
        <span className="font-medium text-foreground">
          {formatNumber(currentPage)}
        </span>
        <span>of</span>
        <span className="font-medium text-foreground">
          {formatNumber(totalPages)}
        </span>
      </div>
    </div>
  );
};

export default PageCount;