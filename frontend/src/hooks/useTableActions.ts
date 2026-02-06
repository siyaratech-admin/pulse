import { useCallback } from 'react';

export interface UseTableActionsProps {
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onBulkDelete?: (ids: string[]) => void;
  onBulkExport?: (ids: string[]) => void;
  onBulkArchive?: (ids: string[]) => void;
}

export interface UseTableActionsReturn {
  handleView: (item: any) => void;
  handleEdit: (item: any) => void;
  handleDelete: (item: any) => void;
  handleBulkDelete: (ids: string[]) => void;
  handleBulkExport: (ids: string[]) => void;
  handleBulkArchive: (ids: string[]) => void;
}

export const useTableActions = ({
  onView,
  onEdit,
  onDelete,
  onBulkDelete,
  onBulkExport,
  onBulkArchive,
}: UseTableActionsProps = {}): UseTableActionsReturn => {
  
  const handleView = useCallback((item: any) => {
    console.log('Viewing item:', item);
    onView?.(item);
  }, [onView]);

  const handleEdit = useCallback((item: any) => {
    console.log('Editing item:', item);
    onEdit?.(item);
  }, [onEdit]);

  const handleDelete = useCallback((item: any) => {
    console.log('Deleting item:', item);
    onDelete?.(item);
  }, [onDelete]);

  const handleBulkDelete = useCallback((ids: string[]) => {
    console.log('Bulk delete:', ids);
    onBulkDelete?.(ids);
  }, [onBulkDelete]);

  const handleBulkExport = useCallback((ids: string[]) => {
    console.log('Bulk export:', ids);
    onBulkExport?.(ids);
  }, [onBulkExport]);

  const handleBulkArchive = useCallback((ids: string[]) => {
    console.log('Bulk archive:', ids);
    onBulkArchive?.(ids);
  }, [onBulkArchive]);

  return {
    handleView,
    handleEdit,
    handleDelete,
    handleBulkDelete,
    handleBulkExport,
    handleBulkArchive,
  };
};