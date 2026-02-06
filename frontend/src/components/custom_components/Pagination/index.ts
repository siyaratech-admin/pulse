// Main Pagination Components
export { Pagination as default, Pagination } from './SimplePagination';
export type { PaginationProps } from './SimplePagination';

// Alternative version with sub-components (if needed)
export { Pagination as AdvancedPagination } from './Pagination';

// Sub-components
export { CurrentPageNumber } from './CurrentPageNumber';
export type { CurrentPageNumberProps } from './CurrentPageNumber';

export { PageCount } from './PageCount';
export type { PageCountProps } from './PageCount';

// Usage examples
export { PaginationUsageExample } from './PaginationUsageExample';

// Re-export everything for convenience
export * from './SimplePagination';
export * from './CurrentPageNumber';
export * from './PageCount';