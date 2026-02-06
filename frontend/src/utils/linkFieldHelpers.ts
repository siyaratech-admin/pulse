/**
 * Utility functions for handling Link field fetch_from functionality
 * Based on Frappe's client.get() API endpoint
 */

import type { FieldMetadata } from '../types/form';

/**
 * Fetch a document by doctype and name using Frappe's client.get API
 * @param doctype - The DocType to fetch from
 * @param name - The document name/ID to fetch
 * @returns Promise with the document data
 */
export async function fetchLinkedDocument(doctype: string, name: string): Promise<any> {
    if (!doctype || !name) {
        console.warn('fetchLinkedDocument: doctype and name are required');
        return null;
    }

    try {
        console.log(`🔗 Fetching linked document: ${doctype} -> ${name}`);

        const params = new URLSearchParams({
            doctype: doctype,
            name: name
        });

        const response = await fetch(`/api/method/frappe.client.get?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`📄 Fetched document data for ${doctype} ${name}:`, data);

        // Return the document data (usually in data.message)
        return data.message || data.data || data;

    } catch (err) {
        console.error(`❌ Error fetching linked document ${doctype} ${name}:`, err);
        return null;
    }
}

/**
 * Extract fetch_from relationships from field metadata
 * @param fields - Array of field metadata
 * @returns Map of source field -> dependent fields
 */
export function buildFetchFromMap(fields: any[]): Map<string, any[]> {
    const fetchFromMap = new Map<string, any[]>();

    fields.forEach(field => {
        if (field.fetch_from) {
            // Parse fetch_from: "source_field.target_property"
            const [sourceField, targetProperty] = field.fetch_from.split('.');

            if (sourceField && targetProperty) {
                if (!fetchFromMap.has(sourceField)) {
                    fetchFromMap.set(sourceField, []);
                }

                fetchFromMap.get(sourceField)!.push({
                    fieldname: field.fieldname,
                    targetProperty: targetProperty,
                    field: field
                });
            }
        }
    });

    console.log('🗺️ Built fetch_from map:', fetchFromMap);
    return fetchFromMap;
}

/**
 * Auto-populate fields based on fetch_from relationships
 * @param sourceFieldName - The field that changed
 * @param sourceFieldValue - The new value of the source field
 * @param sourceFieldOptions - The doctype that the link field points to
 * @param fetchFromMap - Map of fetch_from relationships
 * @param currentFormData - Current form data
 * @returns Promise with updated form data
 */
export async function autoPopulateFetchFromFields(
    sourceFieldName: string,
    sourceFieldValue: string,
    sourceFieldOptions: string,
    fetchFromMap: Map<string, any[]>,
    currentFormData: any,
    fields?: FieldMetadata[],
    parentDoctype?: string // NEW: Parent doctype for context-aware mapping
): Promise<any> {

    // Check if this field has dependent fetch_from fields
    const dependentFields = fetchFromMap.get(sourceFieldName);

    // Flag to track if we found any auto-population candidates
    // We will now try to be smarter about this
    let processingRequired = false;

    if (dependentFields && dependentFields.length > 0) {
        processingRequired = true;
    }

    // Heuristic: If we have field metadata, check if any TABLE fields match properties in the linked document
    // This allows implicit mapping (e.g. 'items' -> 'items') without explicit fetch_from
    let implicitTableMatches: FieldMetadata[] = [];
    if (fields) {
        implicitTableMatches = fields.filter(f =>
            f.fieldtype === 'Table' &&
            !f.fetch_from // Only if not already handled by explicit fetch_from
        );
        if (implicitTableMatches.length > 0) {
            processingRequired = true;
        }
    }

    // Keep special handling as a fallback for complex cases (schema mismatch)
    const hasSpecialHandling = [
        'Material Template',
        'Safety Checklist Template',
        'Job Offer Term Template',
        'Terms and Conditions',
        'KB Client Baseline' // Kept for backward compat, though Implicit Mapping should handle it now
    ].includes(sourceFieldOptions);

    if (!processingRequired && !hasSpecialHandling) {
        console.log(`ℹ️ No fetch_from dependencies or implicit table matches for field: ${sourceFieldName}`);
        return currentFormData;
    }

    console.log(`🔄 Processing fetch_from for ${sourceFieldName} = ${sourceFieldValue}`);
    if (dependentFields) {
        console.log(`📋 Dependent fields:`, dependentFields.map(f => f.fieldname));
    }

    // Fetch the linked document data
    const linkedDocumentData = await fetchLinkedDocument(sourceFieldOptions, sourceFieldValue);

    if (!linkedDocumentData) {
        console.warn(`⚠️ Could not fetch linked document data for ${sourceFieldOptions} ${sourceFieldValue}`);
        return currentFormData;
    }

    console.log(`📄 Successfully fetched linked document:`, linkedDocumentData);

    // Update form data with fetched values
    const updatedFormData = { ...currentFormData };
    let updatedCount = 0;

    // --- GENERIC EXPLICIT MAPPING (fetch_from) ---
    if (dependentFields) {
        dependentFields.forEach(({ fieldname, targetProperty, field }) => {
            const fetchedValue = linkedDocumentData[targetProperty];

            if (linkedDocumentData.hasOwnProperty(targetProperty)) {
                let valueToSet = fetchedValue;

                if (fetchedValue === null || fetchedValue === undefined) {
                    switch (field.fieldtype) {
                        case 'Check': valueToSet = 0; break;
                        case 'Int': case 'Float': case 'Currency': case 'Percent': valueToSet = ''; break;
                        default: valueToSet = ''; break;
                    }
                } else if (field.fieldtype === 'Table' && Array.isArray(fetchedValue)) {
                    // GENERIC TABLE COPY
                    // We assume the rows are compatible or standard fields match
                    // We create clean copies to avoid reference issues
                    console.log(`📋 Auto-populating Table field '${fieldname}' from '${targetProperty}'`);
                    valueToSet = fetchedValue.map((row: any) => {
                        const newRow: any = { ...row };
                        // Remove system fields that shouldn't be copied
                        delete newRow.name;
                        delete newRow.creation;
                        delete newRow.modified;
                        delete newRow.modified_by;
                        delete newRow.owner;
                        delete newRow.docstatus;
                        delete newRow.parent;
                        delete newRow.parentfield;
                        delete newRow.parenttype;
                        delete newRow.idx;
                        return newRow;
                    });
                }

                console.log(`✅ Auto-populating ${fieldname} = ${Array.isArray(valueToSet) ? `[Table with ${valueToSet.length} rows]` : valueToSet}`);
                updatedFormData[fieldname] = valueToSet;
                updatedCount++;
            } else {
                // Clear field if property missing
                switch (field.fieldtype) {
                    case 'Check': updatedFormData[fieldname] = 0; break;
                    case 'Table': updatedFormData[fieldname] = []; break;
                    default: updatedFormData[fieldname] = ''; break;
                }
            }
        });
    }

    // --- GENERIC IMPLICIT MAPPING (Name Match for Tables) ---
    if (implicitTableMatches.length > 0) {
        implicitTableMatches.forEach(field => {
            const fieldName = field.fieldname;
            // Check if linked doc has a property with the EXACT SAME name and it is an array
            if (linkedDocumentData.hasOwnProperty(fieldName) && Array.isArray(linkedDocumentData[fieldName])) {
                console.log(`✨ Implicitly mapping Table '${fieldName}' from linked document`);

                const sourceRows = linkedDocumentData[fieldName];
                const cleanRows = sourceRows.map((row: any) => {
                    const newRow: any = { ...row };
                    // Clean up system fields
                    delete newRow.name;
                    delete newRow.creation;
                    delete newRow.modified;
                    delete newRow.modified_by;
                    delete newRow.owner;
                    delete newRow.docstatus;
                    delete newRow.parent;
                    delete newRow.parentfield;
                    delete newRow.parenttype;
                    delete newRow.idx;
                    return newRow;
                });

                updatedFormData[fieldName] = cleanRows;
                updatedCount++;
            }
        });
    }

    // --- LEGACY / SPECIAL HANDLING (kept for schema mismatches) ---

    // Special handling for Material Template -> check_points (Schema Mismatch: questions -> check_points)
    if (sourceFieldOptions === 'Material Template' && linkedDocumentData.questions) {
        // Only run if not already populated (though explicit fetch_from would take precedence)
        if (!updatedFormData.check_points || updatedFormData.check_points.length === 0) {
            console.log(`📋 Found checklist data in Material Template:`, linkedDocumentData.questions);
            updatedFormData.check_points = linkedDocumentData.questions.map((item: any) => ({
                check_point: item.check_point,
                response: item.response,
                expected_response: item.expected_response,
                remark: item.remark,
            }));
            updatedCount++;
        }
    }

    // Safety Checklist Template -> check_points (Schema Mismatch: questions -> check_points)
    if (sourceFieldOptions === 'Safety Checklist Template' && linkedDocumentData.questions) {
        if (!updatedFormData.check_points || updatedFormData.check_points.length === 0) {
            updatedFormData.check_points = linkedDocumentData.questions.map((item: any) => ({
                check_point: item.check_point,
                response: item.response,
                expected_response: item.expected_response,
                remark: item.remark,
            }));
            updatedCount++;
        }
    }

    // Job Offer Term Template -> Job Offer Terms (Potentially Schema Mismatch or Ambiguity)
    // linkedDocumentData.offer_terms -> target logic
    if (sourceFieldOptions === 'Job Offer Term Template' && linkedDocumentData.offer_terms) {
        // We still need to find the target field if it's not named 'offer_terms'
        // If it was named 'offer_terms', the Implicit Logic above would have caught it!
        // So we only need to handle the case where target != 'offer_terms'

        let targetField = 'details'; // Default fallback
        let targetFieldFound = false;

        // Check if implicit logic already handled it
        if (updatedFormData.offer_terms && updatedFormData.offer_terms.length > 0) {
            console.log('✅ Job Offer Terms already populated by implicit mapping');
        } else {
            // Need to find target
            if (fields) {
                const tableField = fields.find(f =>
                    f.fieldtype === 'Table' &&
                    (f.fieldname === 'details' || f.label?.toLowerCase().includes('term'))
                );
                if (tableField) {
                    targetField = tableField.fieldname;
                    targetFieldFound = true;
                }
            }

            if (!targetFieldFound && currentFormData.hasOwnProperty('offer_terms')) {
                targetField = 'offer_terms';
                // If we are here, implicit mapping failed? Maybe it wasn't in 'fields'?
                // Or linkedDocumentData.offer_terms existed but target field in `fields` was missing?
            }

            // Map the terms
            const mappedTerms = linkedDocumentData.offer_terms.map((item: any) => ({
                offer_term: item.offer_term,
                value: item.value,
            }));

            // Only update if not already updated
            if (!updatedFormData[targetField] || updatedFormData[targetField].length === 0) {
                console.log(`✅ Auto-populating '${targetField}' field via fallback logic`);
                updatedFormData[targetField] = mappedTerms;
                updatedCount++;
            }
        }
    }

    // Terms and Conditions -> terms (Implicit Match should handle this if field is named 'terms')
    if (sourceFieldOptions === 'Terms and Conditions' && linkedDocumentData.terms) {
        if (!updatedFormData.terms) {
            updatedFormData.terms = linkedDocumentData.terms;
            updatedCount++;
        }
    }

    // KB Client Baseline -> items (Context-Aware Mapping)
    // Different parent doctypes need different field mappings:
    // - KB Operational Schedule: start_date -> baseline_start_date, end_date -> baseline_end_date
    // - Other doctypes: start_date -> planned_start_date, end_date -> planned_end_date
    if (sourceFieldOptions === 'KB Client Baseline' && linkedDocumentData.items) {
        console.log(`📋 Found items in KB Client Baseline (Context-Aware Mapping for ${parentDoctype || 'Unknown Parent'})`);

        const isOperationalSchedule = parentDoctype === 'KB Operational Schedule';

        updatedFormData.items = linkedDocumentData.items.map((item: any) => {
            if (isOperationalSchedule) {
                // Operational Schedule uses baseline_start_date and baseline_end_date
                return {
                    task_name: item.task_name,
                    task: item.task,
                    baseline_start_date: item.start_date,
                    baseline_end_date: item.end_date,
                    start_date: item.start_date,  // Also set for read-only display
                    end_date: item.end_date,      // Also set for read-only display
                    duration: item.duration,
                    dependencies_json: item.dependencies_json,
                    lag_days: item.lag_days || 0
                };
            } else {
                // Other doctypes use planned_start_date and planned_end_date
                return {
                    task_name: item.task_name,
                    task: item.task,
                    planned_start_date: item.start_date || item.planned_start_date,
                    planned_end_date: item.end_date || item.planned_end_date
                };
            }
        });
        updatedCount++;
    }

    console.log(`🎯 Successfully auto-populated ${updatedCount} fields from ${sourceFieldName}`);
    return updatedFormData;
}