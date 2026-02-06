import frappe

@frappe.whitelist()
def get_form_meta(doctype_name):
  """
  Returns a list of fields and their metadata for a given DocType.
  If a field is a Table, it recursively fetches the fields of the child DocType.

  :param doctype_name: The name of the DocType (e.g., 'Project', 'Sales Order')
  """
  # Check if the DocType exists
  if not frappe.db.exists('DocType', doctype_name):
    frappe.throw(f"DocType '{doctype_name}' not found.")
    return

  # Get the metadata for the parent DocType
  meta = frappe.get_meta(doctype_name)
  fields_to_return = []

  # Check if autoname is prompt, if so, add a name field
  if meta.autoname and meta.autoname.lower() == 'prompt':
    fields_to_return.append({
      "fieldname": "name",
      "label": "Name",
      "fieldtype": "Data",
      "reqd": 1,
      "hidden": 0,
      "unique": 1
    })

  # A set of fieldtypes to ignore when building a form
  ignored_field_types = {'Button'}

  for df in meta.get('fields'):
    # Skip fields that are not meant for data input
    if df.fieldtype in ignored_field_types:
      continue

    # Convert df to dict to include all Frappe DocField properties
    field_properties = df.as_dict()

    # If the field is a Table, fetch its DocType's fields
    if df.fieldtype == 'Table':
      child_doctype_name = df.options
      if not child_doctype_name:
        continue

      child_meta = frappe.get_meta(child_doctype_name)
      child_fields = []
      for child_df in child_meta.get('fields'):
        if child_df.fieldtype in ignored_field_types:
          continue
        
        # Convert child df to dict as well
        child_fields.append(child_df.as_dict())
      
      # Add the child table's fields to the field properties
      field_properties['table_fields'] = child_fields

    fields_to_return.append(field_properties)
  
  return fields_to_return