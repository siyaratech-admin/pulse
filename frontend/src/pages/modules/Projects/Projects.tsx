/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { StandardHeader } from '../../../components/common/StandardHeader';
import {
  CalendarDays,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { DynamicTable } from '../../../components/custom_components/dynamic-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { useFrappeDeleteDoc } from 'frappe-react-sdk';
import { useToast } from '@/hooks/use-toast';

// Custom hooks for optimization
import { usePagination } from '../../../hooks/usePagination';
import { useFilters } from '../../../hooks/useFilters';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { useTableActions } from '../../../hooks/useTableActions';
import { useBadgeVariants } from '../../../hooks/useBadgeVariants';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { deleteDoc } = useFrappeDeleteDoc();
  const { toast } = useToast();

  // State for status filter display
  const [currentStatusFilter, setCurrentStatusFilter] = useState<string>('all');

  // Filters hook (initialize first to pass filters to pagination)
  const {
    filters,
    setFilter,
    removeFilter,
    clearAllFilters,
    hasActiveFilters,
    frappeFilters,
  } = useFilters();

  // Pagination hook
  const {
    currentPage,
    pageSize,
    setPageSize,
    goToNextPage,
    goToPreviousPage,
    resetToFirstPage,
    hasNextPage,
    hasPreviousPage,
    limitStart,
    totalPages,
    totalItems,
    isLoading: paginationLoading,
  } = usePagination({
    doctype: 'Project',
    filters: frappeFilters,
  });

  // Memoize orderBy to prevent infinite loops in useDataFetch
  const orderBy = React.useMemo(() => ({
    field: 'modified',
    order: 'desc' as const,
  }), []);

  // Data fetching hook
  const { data: projectData = [], isLoading: dataLoading } = useDataFetch({
    doctype: 'Project',
    fields: ['*'],
    limitStart,
    limit: pageSize,
    orderBy,
    filters: frappeFilters,
  });

  // Combined loading state
  const isLoading = dataLoading || paginationLoading;

  // Memoize status config for useBadgeVariants
  const statusConfig = React.useMemo(() => ({
    open: { variant: 'default' as const, label: 'Open' },
    active: { variant: 'default' as const, label: 'Active' },
    inprogress: { variant: 'secondary' as const, label: 'In Progress' },
    planning: { variant: 'outline' as const, label: 'Planning' },
    completed: { variant: 'secondary' as const, label: 'Completed' },
    closed: { variant: 'secondary' as const, label: 'Closed' },
    cancelled: { variant: 'destructive' as const, label: 'Cancelled' },
  }), []);

  // Badge variants hook
  useBadgeVariants({ statusConfig });

  // Memoize table actions config
  const tableActionsConfig = React.useMemo(() => ({
    onEdit: (project: any) => {
      console.log('Editing project:', project);
      navigate(`/projects/edit/${project.name}`);
    },
    onDelete: async (project: any) => {
      if (!confirm(`Are you sure you want to delete project "${project.project_name}"? This action cannot be undone.`)) return;

      try {
        await deleteDoc('Project', project.name);
        toast({
          title: "Success",
          description: `Project "${project.project_name}" deleted successfully`,
        });
        // Refresh by resetting pagination or invalidating cache (if using SWR/React Query directly, but here we rely on useDataFetch which might need a trigger)
        // Since useDataFetch depends on filters/pagination, we can trigger a refresh by calling resetToFirstPage() which updates state
        resetToFirstPage();
      } catch (err: any) {
        console.error('Failed to delete project', err);

        // Try to parse server messages for detailed error
        let errorMessage = "An error occurred while deleting the project.";
        let detailedError = "";

        if (err._server_messages) {
          try {
            const messages = JSON.parse(err._server_messages);
            if (Array.isArray(messages) && messages.length > 0) {
              const msgObj = JSON.parse(messages[0]);
              if (msgObj.message) {
                detailedError = msgObj.message;
                errorMessage = msgObj.message.replace(/<[^>]*>/g, '');
              }
            }
          } catch (e) {
            console.error("Failed to parse server messages", e);
          }
        } else if (err.exception) {
          errorMessage = err.exception;
        }

        toast({
          title: "Failed to delete project",
          description: errorMessage,
          variant: "destructive",
        });

        if (err.exc_type === "LinkExistsError" || detailedError) {
          alert(`Cannot delete project:\n\n${detailedError.replace(/<[^>]*>/g, '') || errorMessage}`);
        }
      }
    },
    onBulkDelete: (selectedIds: string[]) => {
      console.log('Bulk delete:', selectedIds);
      // Add bulk delete API call here
    },
    onBulkExport: (selectedIds: string[]) => {
      console.log('Bulk export:', selectedIds);
      // Add bulk export logic here
    },
    onBulkArchive: (selectedIds: string[]) => {
      console.log('Bulk archive:', selectedIds);
      // Add bulk archive logic here
    },
  }), []);

  // Custom badge variants for project-specific fields
  const customBadgeVariants = React.useMemo(() => ({
    status: {
      open: 'default',
      active: 'default',
      inprogress: 'secondary',
      planning: 'outline',
      completed: 'secondary',
      closed: 'secondary',
      cancelled: 'destructive',
    },
    priority: {
      critical: 'destructive',
      urgent: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline',
    },
    project_type: {
      internal: 'secondary',
      external: 'outline',
    },
  }), []);

  // Table actions hook
  const {
    handleView,
    handleEdit,
    handleDelete,
    handleBulkDelete,
    handleBulkExport,
    handleBulkArchive,
  } = useTableActions(tableActionsConfig);

  // Filter handlers
  const handleStatusChange = (value: string) => {
    // Update the display state first
    setCurrentStatusFilter(value);

    // Then update the filter
    if (value === 'all') {
      removeFilter('status');
    } else {
      setFilter('status', value);
    }
    resetToFirstPage();
  };

  const handleClearFilters = () => {
    setCurrentStatusFilter('all'); // Reset display state
    clearAllFilters();
    resetToFirstPage();
  };

  // Page size change handler
  const handlePageSizeChange = (newPageSize: number) => {
    console.log('Changing page size from', pageSize, 'to', newPageSize);
    setPageSize(newPageSize);
    resetToFirstPage();
    console.log('Page size changed and reset to first page');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <StandardHeader
        title="Projects"
        subtitle="Manage and track all your projects in one place with selection and bulk actions"
        actions={
          <Button
            className="flex items-center gap-2 bg-white text-primary hover:bg-gray-100"
            onClick={() => {
              console.log('Navigate to new project form');
              navigate('/projects/new');
            }}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        }
      />

      <div className="p-6 space-y-6">

        {/* Filters Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <Label htmlFor="status-filter" className="text-sm font-medium">
                    Project Status
                  </Label>
                  <Select
                    value={currentStatusFilter}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Active filters:</span>
                  {filters.status && (
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
                      Status: {filters.status.value}
                    </span>
                  )}
                  <button
                    onClick={handleClearFilters}
                    className="text-primary hover:text-primary/80 underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Projects Table Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Projects Overview - Enhanced Dynamic Table
            </CardTitle>
            <CardDescription>
              Dynamic table with multi-selection, bulk actions, and individual row
              actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="text-muted-foreground text-sm font-medium">
                  Loading projects...
                </div>
              </div>
            ) : projectData.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">
                  {hasActiveFilters
                    ? 'No projects found with current filters.'
                    : 'No projects found.'}
                </div>
              </div>
            ) : (
              <DynamicTable
                data={projectData}
                stickyFields={['name']}
                caption="A list of all Projects with their current status and details."
                isLoading={false}
                showActions={true}
                showSelection={true}
                showBulkActions={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onBulkDelete={handleBulkDelete}
                onBulkExport={handleBulkExport}
                onBulkArchive={handleBulkArchive}
                badgeVariants={customBadgeVariants}
                showPagination={false}
              />
            )}

            {/* Custom Pagination Display */}
            <div className="border-t pt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    Show page:{' '}
                    <span className="font-medium text-foreground">
                      {currentPage}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium text-foreground">
                      {totalPages}
                    </span>
                    {totalItems > 0 && (
                      <span className="ml-2">({totalItems} total items)</span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>Size:</span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) =>
                        handlePageSizeChange(parseInt(value, 10))
                      }
                    >
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('Previous page clicked, current page:', currentPage);
                      goToPreviousPage();
                    }}
                    disabled={!hasPreviousPage}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Back</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('Next page clicked, current page:', currentPage);
                      goToNextPage();
                    }}
                    disabled={!hasNextPage}
                    className="flex items-center gap-1"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Projects;