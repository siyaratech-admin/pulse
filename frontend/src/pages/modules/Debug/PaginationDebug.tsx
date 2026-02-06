import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

// Import hooks for testing
import { usePagination } from '../../../hooks/usePagination';
import { useFrappeGetDocList, useFrappeGetDocCount } from 'frappe-react-sdk';

const PaginationDebug: React.FC = () => {
  // Test with Currency doctype which should have data
  const doctype = 'Currency';
  
  // Test raw Frappe hooks first
  const { data: rawData, isLoading: rawLoading } = useFrappeGetDocList(doctype, {
    fields: ['*'],
    limit_start: 0,
    limit: 5,
  });
  
  const { data: rawCount, isLoading: countLoading } = useFrappeGetDocCount(doctype);
  
  // Test our pagination hook
  const {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    limitStart,
    goToNextPage,
    goToPreviousPage,
    setPageSize
  } = usePagination({
    doctype,
    initialPageSize: 5
  });

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Pagination Debug</h1>
      
      {/* Raw Frappe Data */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Frappe Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Loading:</strong> {rawLoading ? 'Yes' : 'No'}</p>
            <p><strong>Data Count:</strong> {rawData?.length || 0}</p>
            <p><strong>Count Loading:</strong> {countLoading ? 'Yes' : 'No'}</p>
            <p><strong>Total Count:</strong> {rawCount || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Hook Debug */}
      <Card>
        <CardHeader>
          <CardTitle>Pagination Hook Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Current Page:</strong> {currentPage}</p>
            <p><strong>Page Size:</strong> {pageSize}</p>
            <p><strong>Total Items:</strong> {totalItems}</p>
            <p><strong>Total Pages:</strong> {totalPages}</p>
            <p><strong>Limit Start:</strong> {limitStart}</p>
            <p><strong>Has Next:</strong> {hasNextPage ? 'Yes' : 'No'}</p>
            <p><strong>Has Previous:</strong> {hasPreviousPage ? 'Yes' : 'No'}</p>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button 
              size="sm" 
              onClick={goToPreviousPage} 
              disabled={!hasPreviousPage}
            >
              Previous
            </Button>
            <Button 
              size="sm" 
              onClick={goToNextPage} 
              disabled={!hasNextPage}
            >
              Next
            </Button>
            <Button 
              size="sm" 
              onClick={() => setPageSize(10)}
            >
              Set Size to 10
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sample Data Display */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Data</CardTitle>
        </CardHeader>
        <CardContent>
          {rawLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-2">
              {rawData?.map((item, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded">
                  {JSON.stringify(item, null, 2)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaginationDebug;