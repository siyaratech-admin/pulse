import React from 'react';
import { Pagination } from './Pagination';

/**
 * Example usage of the Pagination component
 * This demonstrates how to implement pagination in your components
 */

interface PaginationExampleProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const PaginationExample: React.FC<PaginationExampleProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <h3 className="font-medium mb-2">Pagination Example Usage:</h3>
        <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`// Basic usage
<Pagination
  currentPage={${currentPage}}
  totalPages={${totalPages}}
  totalItems={${totalItems}}
  pageSize={${pageSize}}
  onPageChange={handlePageChange}
/>

// With custom options
<Pagination
  currentPage={${currentPage}}
  totalPages={${totalPages}}
  totalItems={${totalItems}}
  pageSize={${pageSize}}
  onPageChange={handlePageChange}
  showPageInfo={true}
  showFirstLast={true}
  disabled={false}
/>`}
        </pre>
      </div>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
        showPageInfo={true}
        showFirstLast={true}
      />
    </div>
  );
};

export default PaginationExample;