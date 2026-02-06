/**
 * Frappe File Upload Utilities
 * Handles file uploads and document creation with proper file references
 */

export interface FileUploadResponse {
    message: {
        doctype: string;
        name: string;
        file_name: string;
        file_url: string;
        file_size: number;
        content_hash?: string;
    };
}

export interface DocumentSubscription {
    message: any;
}

/**
 * Upload a file to Frappe server
 */
export async function uploadFile(
    file: File, 
    doctype?: string, 
    docname?: string,
    fieldname?: string
): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_private', '0'); // Public file by default
    
    if (doctype) formData.append('doctype', doctype);
    if (docname) formData.append('docname', docname);
    if (fieldname) formData.append('fieldname', fieldname);

    const response = await fetch('/api/method/upload_file', {
        method: 'POST',
        headers: {
            'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || '',
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error(`File upload failed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Subscribe to document updates via realtime API
 */
export async function subscribeToDocument(
    doctype: string, 
    docname: string
): Promise<DocumentSubscription> {
    const response = await fetch('/api/method/frappe.realtime.can_subscribe_doc', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || '',
        },
        // Add query parameters
        body: JSON.stringify({
            doctype,
            docname
        })
    });

    if (!response.ok) {
        throw new Error(`Document subscription failed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Create a new document with file handling
 */
export async function createDocumentWithFiles(
    doctype: string,
    formData: any,
    fileFields: { [fieldname: string]: File }
): Promise<any> {
    try {
        // Step 1: Create a temporary document first to get docname
        const tempDocResponse = await fetch('/api/v2/method/frappe.desk.form.save.savedocs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || '',
            },
            body: JSON.stringify({
                doc: JSON.stringify({
                    doctype,
                    ...formData,
                    __islocal: 1,
                    __newname: null
                }),
                action: 'Save'
            })
        });

        if (!tempDocResponse.ok) {
            throw new Error(`Document creation failed: ${tempDocResponse.statusText}`);
        }

        const tempDoc = await tempDocResponse.json();
        const docname = tempDoc.docs?.[0]?.name;

        if (!docname) {
            throw new Error('Failed to get document name from server response');
        }

        // Step 2: Upload files and get file references
        const fileUploadPromises = Object.entries(fileFields).map(async ([fieldname, file]) => {
            const uploadResult = await uploadFile(file, doctype, docname, fieldname);
            return {
                fieldname,
                file_url: uploadResult.message.file_url,
                file_name: uploadResult.message.file_name
            };
        });

        const uploadedFiles = await Promise.all(fileUploadPromises);

        // Step 3: Update form data with file references
        const updatedFormData = { ...formData };
        uploadedFiles.forEach(({ fieldname, file_url }) => {
            updatedFormData[fieldname] = file_url;
        });

        // Step 4: Subscribe to document for real-time updates
        await subscribeToDocument(doctype, docname);

        // Step 5: Update the document with file references
        const finalResponse = await fetch('/api/v2/method/frappe.desk.form.save.savedocs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || '',
            },
            body: JSON.stringify({
                doc: JSON.stringify({
                    doctype,
                    name: docname,
                    ...updatedFormData
                }),
                action: 'Save'
            })
        });

        if (!finalResponse.ok) {
            throw new Error(`Document update failed: ${finalResponse.statusText}`);
        }

        return finalResponse.json();

    } catch (error) {
        console.error('Error creating document with files:', error);
        throw error;
    }
}

/**
 * Extract file fields from form data and field metadata
 */
export function extractFileFields(
    formData: any, 
    fields: any[]
): { cleanFormData: any; fileFields: { [fieldname: string]: File } } {
    const cleanFormData = { ...formData };
    const fileFields: { [fieldname: string]: File } = {};

    fields.forEach(field => {
        if (['Attach', 'Attach Image'].includes(field.fieldtype)) {
            const value = formData[field.fieldname];
            if (value instanceof File) {
                fileFields[field.fieldname] = value;
                // Remove file from form data, will be replaced with file URL
                delete cleanFormData[field.fieldname];
            }
        }
    });

    return { cleanFormData, fileFields };
}