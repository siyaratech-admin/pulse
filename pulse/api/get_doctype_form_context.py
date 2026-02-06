import frappe

@frappe.whitelist()
def get_form_context(doctype, name=None):
    """
    Returns:
    - Fields meta (with calculated read-only states)
    - Docstatus
    - Allowed actions (Save/Submit/Cancel/Amend)
    - Global Form Read-only state
    - Permission Rules (NEW)
    - User Roles (NEW)
    """

    if not frappe.db.exists("DocType", doctype):
        return {"error": f"DocType {doctype} not found"}

    meta = frappe.get_meta(doctype)
    is_submittable = meta.is_submittable
    
    doc = None
    docstatus = 0
    
    if name:
        if frappe.db.exists(doctype, name):
            doc = frappe.get_doc(doctype, name)
            docstatus = doc.docstatus
        else:
            return {"error": f"Document {name} not found"}

    can_create = frappe.has_permission(doctype, "create")
    can_write  = frappe.has_permission(doctype, "write", doc=doc)
    can_submit = frappe.has_permission(doctype, "submit", doc=doc)
    can_cancel = frappe.has_permission(doctype, "cancel", doc=doc)
    
    can_amend = can_create 

    actions = {
        "can_save": docstatus == 0 and (can_write if name else can_create),

        "can_submit": docstatus == 0 and is_submittable and can_submit and name is not None,

        "can_cancel": docstatus == 1 and is_submittable and can_cancel,

        "can_amend": docstatus == 2 and is_submittable and can_amend,
    }
    is_form_read_only = (docstatus > 0) or (name and not can_write)

    user_roles = frappe.get_roles(frappe.session.user)
    
    permission_rules = frappe.get_all(
        'Custom DocPerm',
        filters={'parent': doctype},
        fields=[
            'role',
            'permlevel',
            'select',
            'read',
            'write',
            'create',
            'delete',
            'submit',
            'cancel',
            'amend',
            'report',
            'export',
            'import',
            'share',
            'print',
            'email',
            'if_owner'
        ],
        order_by='permlevel, idx'
    )
    
    if not permission_rules:
        permission_rules = frappe.get_all(
            'DocPerm',
            filters={'parent': doctype},
            fields=[
                'role',
                'permlevel',
                'select',
                'read',
                'write',
                'create',
                'delete',
                'submit',
                'cancel',
                'amend',
                'report',
                'export',
                'import',
                'share',
                'print',
                'email',
                'if_owner'
            ],
            order_by='permlevel, idx'
        )
    
    user_permission_rules = [
        perm for perm in permission_rules 
        if perm.get('role') in user_roles
    ]
    
    permlevel_permissions = {}
    for perm in user_permission_rules:
        level = perm.get('permlevel', 0)
        if level not in permlevel_permissions:
            permlevel_permissions[level] = {
                'read': False,
                'write': False,
                'create': False,
                'delete': False,
                'submit': False,
                'cancel': False,
                'amend': False
            }
        
        for perm_type in ['read', 'write', 'create', 'delete', 'submit', 'cancel', 'amend']:
            if perm.get(perm_type):
                permlevel_permissions[level][perm_type] = True

    fields = []
    ignored_field_types = {"Button", "Section Break", "Column Break", "Tab Break"}

    for df in meta.fields:
        if df.fieldtype in ignored_field_types:
            continue

        field_dict = df.as_dict()

        is_field_read_only = df.read_only

        field_permlevel = df.permlevel or 0
        permlevel_perm = permlevel_permissions.get(field_permlevel, {})
        
        if not permlevel_perm.get('write', False):
            is_field_read_only = 1

        if docstatus == 1:
            if not df.allow_on_submit:
                is_field_read_only = 1
        
        elif docstatus == 2:
            is_field_read_only = 1
            
        field_dict["read_only"] = is_field_read_only
        fields.append(field_dict)

    return {
        "fields": fields,
        "docstatus": docstatus,
        "actions": actions,
        "is_submittable": is_submittable,
        "is_form_read_only": is_form_read_only,
        "name": name,
        # NEW: Permission data
        "user_roles": user_roles,
        "permission_rules": permission_rules,
        "user_permission_rules": user_permission_rules,
        "permlevel_permissions": permlevel_permissions
    }