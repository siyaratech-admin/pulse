// Utility functions for easy search_link usage

import type { FieldMetadata } from '../types/form';

/**
 * Create a search link field configuration using Frappe's search_link API
 * This is a simplified way to create link search fields
 */
export const createSearchLinkField = (
  fieldname: string,
  label: string,
  doctype: string,
  required: boolean = false,
  pageLength: number = 20,
  searchField?: string,
  filters?: Record<string, any> | string | any[],
  referenceDoctype?: string,
  ignoreUserPermissions: boolean = false
): FieldMetadata => ({
  fieldname,
  label,
  fieldtype: 'Select',
  reqd: required,
  description: `Search and select from ${doctype} using Frappe search_link API`,
  apiConfig: {
    apiType: 'link_search',
    doctype,
    params: {
      page_length: pageLength,
      searchfield: searchField || null,
      filters: filters || null,
      reference_doctype: referenceDoctype || null,
      ignore_user_permissions: ignoreUserPermissions
    }
  }
});

/**
 * Common search link field configurations
 * Based on typical Frappe DocTypes
 */
export const commonSearchLinkFields = {
  // Customer selection
  customer: (fieldname: string = 'customer', required: boolean = false) =>
    createSearchLinkField(fieldname, 'Customer', 'Customer', required, 20),

  // User selection
  user: (fieldname: string = 'user', required: boolean = false) =>
    createSearchLinkField(fieldname, 'User', 'User', required, 50, 'email'),

  // Project selection
  project: (fieldname: string = 'project', required: boolean = false) =>
    createSearchLinkField(fieldname, 'Project', 'Project', required, 30),

  // Company selection
  company: (fieldname: string = 'company', required: boolean = false) =>
    createSearchLinkField(fieldname, 'Company', 'Company', required, 20),

  // Item selection
  item: (fieldname: string = 'item', required: boolean = false) =>
    createSearchLinkField(fieldname, 'Item', 'Item', required, 50, 'item_code'),

  // Supplier selection
  supplier: (fieldname: string = 'supplier', required: boolean = false) =>
    createSearchLinkField(fieldname, 'Supplier', 'Supplier', required, 20),

  // Employee selection
  employee: (fieldname: string = 'employee', required: boolean = false) =>
    createSearchLinkField(fieldname, 'Employee', 'Employee', required, 30, 'employee_name'),

  // Territory selection
  territory: (fieldname: string = 'territory', required: boolean = false) =>
    createSearchLinkField(fieldname, 'Territory', 'Territory', required, 20),

  // Cost Center selection
  costCenter: (fieldname: string = 'cost_center', required: boolean = false) =>
    createSearchLinkField(fieldname, 'Cost Center', 'Cost Center', required, 20),

  // Department selection
  department: (fieldname: string = 'department', required: boolean = false) =>
    createSearchLinkField(fieldname, 'Department', 'Department', required, 20),
};

/**
 * Example usage:
 * 
 * // Simple usage
 * const customerField = commonSearchLinkFields.customer('customer_name', true);
 * const userField = commonSearchLinkFields.user('assigned_to', false);
 * 
 * // Custom search link field
 * const customField = createSearchLinkField(
 *   'custom_doctype', 
 *   'Custom DocType', 
 *   'Custom DocType', 
 *   true, 
 *   25, 
 *   'custom_field'
 * );
 */