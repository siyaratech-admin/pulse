import frappe
from pulse.api.get_fields_of_doctype import get_form_meta

try:
    fields = get_form_meta("Subcontractor Work Order")
    found = False
    for f in fields:
        if f.get("fieldname") == "content":
            print("FOUND: content field is present in meta.")
            print(f)
            found = True
            break
    if not found:
        print("NOT FOUND: content field is missing from meta.")
        # Print all fields to see what's there
        print([f.get("fieldname") for f in fields])
except Exception as e:
    print(f"ERROR: {e}")
