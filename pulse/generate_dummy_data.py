
import frappe
from frappe.utils import add_days, nowdate
import random

def execute():
    # 1. Get or Create a Project
    project_name = "Dummy Project 1"
    if not frappe.db.exists("KB Project", project_name):
        project = frappe.get_doc({
            "doctype": "KB Project",
            "project_name": project_name,
            "status": "Active"
        })
        project.insert(ignore_permissions=True)
        print(f"Created Project: {project_name}")
    else:
        print(f"Using Project: {project_name}")

    # 2. Create a Schedule (Draft)
    schedule = frappe.get_doc({
        "doctype": "KB Project Activity Schedule",
        "project": project_name,
        "schedule_date": nowdate(),
        "status": "Draft"
    })
    schedule.insert(ignore_permissions=True)
    print(f"Created Schedule: {schedule.name}")

    # 3. Add Activity Items
    activities = [
        "Site Mobilization",
        "Excavation",
        "Foundation Work",
        "Framework - Ground Floor",
        "Brickwork - Ground Floor",
        "Plastering",
        "Electrical Wiring",
        "Plumbing",
        "Flooring",
        "Finishing & Painting"
    ]

    base_date = nowdate()
    
    for idx, act_name in enumerate(activities):
        # Stagger start dates
        start_offset = idx * 5
        duration = random.randint(3, 10)
        
        # Client Dates (Baseline)
        client_start = add_days(base_date, start_offset)
        client_end = add_days(client_start, duration)
        
        # Internal Baseline (Slightly more aggressive)
        internal_start = add_days(client_start, -1)
        internal_duration = max(1, duration - 1)
        internal_end = add_days(internal_start, internal_duration)

        # Actuals (Some random delays for first few tasks)
        actual_start = None
        actual_end = None
        actual_duration = 0
        
        if idx < 4: # First 4 started
            actual_start = add_days(client_start, random.randint(0, 2))
            actual_duration = duration + random.randint(0, 3)
            actual_end = add_days(actual_start, actual_duration)

        item = frappe.get_doc({
            "doctype": "KB Project Activity Schedule Items",
            "parent": schedule.name,
            "parenttype": "KB Project Activity Schedule",
            "parentfield": "activity_details",
            "activity_name": act_name,
            "idx": idx + 1,
            # Client
            "client_start_date": client_start,
            "client_end_date": client_end,
            "duration_client": duration,
            # Internal
            "internal_baseline_start_date": internal_start,
            "internal_baseline_end_date": internal_end,
            "duration_internal_baseline": internal_duration,
            # Actual
            "actual_start_date": actual_start,
            "actual_end_date": actual_end,
            "duration_actual": actual_duration
        })
        item.insert(ignore_permissions=True)
        print(f"  Added Activity: {act_name}")

    frappe.db.commit()
    print("Done generating dummy data.")

