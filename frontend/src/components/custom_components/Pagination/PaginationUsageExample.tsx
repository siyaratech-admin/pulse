import React, { useState } from 'react';
import { Pagination } from './SimplePagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';

/**
 * Example demonstrating both ways to use the Pagination component
 */
export const PaginationUsageExample: React.FC = () => {
  const [manualPage, setManualPage] = useState(1);
  const [frappeBasedPage, setFrappeBasedPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Example 1: Manual total count
  const manualTotalItems = 245;
  const pageSize = 20;
  const manualTotalPages = Math.ceil(manualTotalItems / pageSize);

  // Example 2: Frappe-based filters for Projects
  const projectFilters = statusFilter 
    ? [['status', '=', statusFilter]] as Array<[string, string, any]>
    : [];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Pagination Component Examples</h1>
      
      {/* Example 1: Manual Total Count */}
      <Card>
        <CardHeader>
          <CardTitle>Example 1: Manual Total Count</CardTitle>
          <CardDescription>
            When you already know the total count and pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Total Items: {manualTotalItems}</p>
              <p>Page Size: {pageSize}</p>
              <p>Current Page: {manualPage}</p>
            </div>
            
            <Pagination
              currentPage={manualPage}
              totalPages={manualTotalPages}
              totalItems={manualTotalItems}
              pageSize={pageSize}
              onPageChange={setManualPage}
              showPageInfo={true}
              showFirstLast={true}
            />
            
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h4 className="font-medium mb-2">Code Example:</h4>
              <pre className="text-xs overflow-x-auto">
{`<Pagination
  currentPage={${manualPage}}
  totalPages={${manualTotalPages}}
  totalItems={${manualTotalItems}}
  pageSize={${pageSize}}
  onPageChange={setCurrentPage}
/>`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example 2: Frappe-based Count */}
      <Card>
        <CardHeader>
          <CardTitle>Example 2: Frappe-based Auto Count</CardTitle>
          <CardDescription>
            Automatically fetches count from Frappe using doctype and filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium">Status Filter:</label>
              <select 
                value={statusFilter} 
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setFrappeBasedPage(1); // Reset to page 1 when filter changes
                }}
                className="px-2 py-1 border rounded"
              >
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Doctype: Project</p>
              <p>Filters: {projectFilters.length > 0 ? JSON.stringify(projectFilters) : 'None'}</p>
              <p>Current Page: {frappeBasedPage}</p>
            </div>
            
            <Pagination
              currentPage={frappeBasedPage}
              pageSize={pageSize}
              onPageChange={setFrappeBasedPage}
              doctype="Project"
              filters={projectFilters}
              showPageInfo={true}
              showFirstLast={true}
            />
            
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h4 className="font-medium mb-2">Code Example:</h4>
              <pre className="text-xs overflow-x-auto">
{`const filters = ${statusFilter ? `[['status', '=', '${statusFilter}']]` : '[]'};

<Pagination
  currentPage={${frappeBasedPage}}
  pageSize={${pageSize}}
  onPageChange={setCurrentPage}
  doctype="Project"
  filters={filters}
/>`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Two Usage Patterns:</h4>
            <div className="ml-4 space-y-2">
              <div>
                <strong>1. Manual Count:</strong> Provide <code>totalItems</code> and/or <code>totalPages</code>
              </div>
              <div>
                <strong>2. Auto Count:</strong> Provide <code>doctype</code> and optional <code>filters</code>
              </div>
            </div>
            
            <h4 className="font-medium mt-4">Key Features:</h4>
            <ul className="ml-4 space-y-1 list-disc">
              <li>Automatic last page detection (Next button disabled on last page)</li>
              <li>Responsive design for mobile and desktop</li>
              <li>Optional first/last navigation buttons</li>
              <li>Detailed page information display</li>
              <li>Loading states when using Frappe auto-count</li>
              <li>TypeScript support with proper prop types</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaginationUsageExample;