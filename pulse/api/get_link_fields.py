import frappe

@frappe.whitelist()
def get_link_fields(doctype):
    """
    Get all Link fields that point to the specified doctype.
    Returns a list of {parent: str, fieldname: str} objects.
    
    This runs with system permissions to avoid PermissionError.
    """
    try:
        # Use frappe.get_all with ignore_permissions to bypass user restrictions
        # Standard DocFields
        standard_links = frappe.get_all(
            'DocField',
            filters={
                'fieldtype': 'Link',
                'options': doctype
            },
            fields=['parent', 'fieldname'],
            ignore_permissions=True
        )
        
        # Custom Fields
        custom_links = frappe.get_all(
            'Custom Field',
            filters={
                'fieldtype': 'Link',
                'options': doctype
            },
            fields=['dt as parent', 'fieldname'],
            ignore_permissions=True
        )
        
        return {
            'standard': standard_links,
            'custom': custom_links
        }
    except Exception as e:
        frappe.log_error(f"Error fetching link fields for {doctype}: {str(e)}")
        return {
            'standard': [],
            'custom': []
        }
