// API helper functions for Frappe integration (matching your existing patterns)

interface FrappeApiResponse<T = any> {
    message?: T;
    exc_type?: string;
    exception?: string;
    data?: T;
}

interface SelectOption {
    value: string;
    label: string;
    description?: string;
}

/**
 * Fetch select field options from Frappe DocType
 * Based on your existing API patterns from NewProjectForm
 */
export const fetchDocTypeSelectOptions = async (
    doctype: string,
    fieldname: string
): Promise<SelectOption[]> => {
    try {
        const response = await fetch('/api/v2/method/kbweb.api.get_fields_of_doctype.get_select_options', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || '',
            },
            credentials: 'include',
            body: JSON.stringify({
                doctype: doctype,
                fieldname: fieldname
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: FrappeApiResponse = await response.json();

        if (data.exc_type || data.exception) {
            throw new Error(data.exception || data.exc_type);
        }

        // Transform response to SelectOption format
        if (data.message && Array.isArray(data.message)) {
            return data.message.map((item: any) => ({
                value: typeof item === 'string' ? item : (item.value || item),
                label: typeof item === 'string' ? item : (item.label || item.value || item),
                description: typeof item === 'object' ? item.description : undefined
            }));
        }

        return [];
    } catch (error) {
        console.error('Error fetching DocType select options:', error);
        throw error;
    }
};

/**
 * Search for linked documents using Frappe's search_link API
 * This is the proper Link Field API endpoint
 */
export const searchLinkDocuments = async (
    doctype: string,
    searchTerm: string = '',
    pageLength: number = 20,
    filters?: Record<string, any> | string | any[],
    searchField?: string,
    referenceDoctype?: string,
    ignoreUserPermissions: boolean = false
): Promise<SelectOption[]> => {
    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (csrfToken) {
            headers['X-Frappe-CSRF-Token'] = csrfToken;
        }

        const params = new URLSearchParams();
        params.append('doctype', doctype);
        params.append('txt', searchTerm);
        params.append('page_length', pageLength.toString());

        if (filters) {
            params.append('filters', typeof filters === 'string' ? filters : JSON.stringify(filters));
        }

        if (searchField) {
            params.append('searchfield', searchField);
        }

        if (referenceDoctype) {
            params.append('reference_doctype', referenceDoctype);
        }

        if (ignoreUserPermissions) {
            params.append('ignore_user_permissions', '1');
        }

        const response = await fetch(`/api/method/frappe.desk.search.search_link?${params.toString()}`, {
            method: 'GET',
            headers,
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Authentication required');
            } else if (response.status === 403) {
                throw new Error('Permission denied');
            } else if (response.status === 404) {
                throw new Error('DocType not found');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }

        const data: FrappeApiResponse = await response.json();

        if (data.exc_type || data.exception) {
            throw new Error(data.exception || data.exc_type);
        }

        // Handle search_link response format (LinkSearchResults[])
        if (data.message && Array.isArray(data.message)) {
            return data.message.map((item: any) => ({
                value: item.value || item.name || item,
                label: item.label || item.value || item.name || item,
                description: item.description || undefined
            }));
        }

        return [];
    } catch (error) {
        console.error('Error searching link documents:', error);
        throw error;
    }
};

/**
 * Get resource list (for DocTypes with REST API access)
 */
export const fetchResourceList = async (
    doctype: string,
    fields?: string[],
    filters?: Record<string, any>,
    limit?: number
): Promise<SelectOption[]> => {
    try {
        const url = new URL(`/api/resource/${doctype}`, window.location.origin);

        if (fields && fields.length > 0) {
            url.searchParams.append('fields', JSON.stringify(fields));
        }

        if (filters && Object.keys(filters).length > 0) {
            url.searchParams.append('filters', JSON.stringify(filters));
        }

        if (limit) {
            url.searchParams.append('limit_page_length', limit.toString());
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: FrappeApiResponse = await response.json();

        if (data.exc_type || data.exception) {
            throw new Error(data.exception || data.exc_type);
        }

        // Handle different response formats
        let items: any[] = [];
        if (data.data && Array.isArray(data.data)) {
            items = data.data;
        } else if (data.message && Array.isArray(data.message)) {
            items = data.message;
        } else if (Array.isArray(data)) {
            items = data;
        }

        return items.map((item: any) => ({
            value: item.name || item.value || item,
            label: item.title || item.label || item.description || item.name || item.value || item,
            description: item.description !== (item.name || item.value) ? item.description : undefined
        }));
    } catch (error) {
        console.error('Error fetching resource list:', error);
        throw error;
    }
};

/**
 * Predefined field configurations for common use cases
 */
export const createApiSelectField = {
    // DocType select field (using your API pattern)
    docTypeSelect: (fieldname: string, label: string, doctype: string, fieldname_in_doctype: string, required = false): import('../types/form').FieldMetadata => ({
        fieldname,
        label,
        fieldtype: 'Select',
        reqd: required,
        api_endpoint: '/api/v2/method/kbweb.api.get_fields_of_doctype.get_select_options',
        api_method: 'POST',
        api_params: {
            doctype: doctype,
            fieldname: fieldname_in_doctype
        }
    }),

    // Link search field (using search widget)
    linkSearch: (fieldname: string, label: string, doctype: string, required = false): import('../types/form').FieldMetadata => ({
        fieldname,
        label,
        fieldtype: 'Select',
        reqd: required,
        api_endpoint: '/api/method/frappe.desk.search.search_widget',
        api_method: 'POST',
        api_params: {
            doctype: doctype,
            txt: '',
            page_length: 20
        }
    }),

    // Resource list field (using REST API)
    resourceList: (fieldname: string, label: string, doctype: string, nameField = 'name', titleField?: string, required = false): import('../types/form').FieldMetadata => ({
        fieldname,
        label,
        fieldtype: 'Select',
        reqd: required,
        api_endpoint: `/api/resource/${doctype}`,
        api_method: 'GET',
        api_params: {
            fields: titleField ? JSON.stringify([nameField, titleField]) : JSON.stringify([nameField]),
            filters: JSON.stringify({ disabled: 0 }),
            limit_page_length: 50
        }
    })
};

// Example usage matching your project structure
export const projectFormApiFields = [
    createApiSelectField.docTypeSelect('status', 'Project Status', 'Project', 'status', true),
    createApiSelectField.linkSearch('customer', 'Customer', 'Customer', false),
    createApiSelectField.linkSearch('project_manager', 'Project Manager', 'User', true),
    createApiSelectField.resourceList('department', 'Department', 'Department', 'name', 'department_name', false),
];