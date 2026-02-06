import React, { useState, useEffect, useMemo } from "react";
import GanttWrapper from "@/components/custom_components/GanttWrapper";
import { useFrappeGetDocList, useFrappeGetDoc, useFrappeGetCall, useFrappePostCall, useFrappeUpdateDoc, useFrappeCreateDoc, useFrappeDeleteDoc } from "frappe-react-sdk";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import TaskInformationModal from "./components/TaskInformationModal";

interface IntegratedSingleGanttProps {
    doctype: 'KB Operational Schedule' | 'KB Client Baseline';
    scheduleId?: string;
    project?: string;
    initialItems?: any[]; // For new forms, pass items directly
    onItemsChange?: (items: any[]) => void;
    onBackendUpdate?: () => void;
}

const IntegratedSingleGantt: React.FC<IntegratedSingleGanttProps> = ({ doctype, scheduleId, project, initialItems, onItemsChange, onBackendUpdate }) => {
    const { toast } = useToast();
    const [zoomLevel, setZoomLevel] = useState<'Day' | 'Week' | 'Month'>('Month');
    const [localItems, setLocalItems] = useState<any[]>(initialItems || []);

    // 1. Fetch the main document to check for 'related_baseline' and 'docstatus'
    const { data: scheduleDoc, isLoading: isLoadingDoc } = useFrappeGetDoc(doctype, scheduleId);

    // 2. Determine Source
    // OLD: const isInherited = doctype === 'KB Operational Schedule' && !!scheduleDoc?.related_baseline;
    // FIX: KB Operational Schedule has its own items copy. We should NOT switch source to Client Baseline.
    // We only view Client Baseline if we are literally in 'KB Client Baseline' doctype.
    const isInherited = false; // Disable inheritance logic prevents viewing Client items in Operational Context
    const isSubmitted = scheduleDoc?.docstatus === 1;
    // Read only if inherited, submitted. If !scheduleId (new doc), it IS editable (locally).
    const isReadOnly = isInherited || isSubmitted;

    const sourceDoctype = isInherited ? 'KB Client Baseline' : doctype;
    const sourceId = isInherited ? scheduleDoc.related_baseline : scheduleId;

    const itemDoctype = sourceDoctype === 'KB Client Baseline' ? 'KB Client Baseline Item' : 'KB Operational Schedule Item';
    const effectiveProject = scheduleDoc?.project || project; // Prop project for new docs

    // 3. Fetch Source Document (to get items safely without permission issues)
    // If sourceId is same as scheduleId, we can reuse scheduleDoc if strictly needed, 
    // but separate hook is cleaner for "Inherited" case switching.
    const { data: sourceDoc, mutate: mutateSource, isLoading: isLoadingSource } = useFrappeGetDoc(sourceDoctype, sourceId);

    const fieldMap = useMemo(() => ({
        startDate: sourceDoctype === 'KB Operational Schedule' ? 'baseline_start_date' : 'start_date',
        endDate: sourceDoctype === 'KB Operational Schedule' ? 'baseline_end_date' : 'end_date',
        taskName: 'task_name'
    }), [sourceDoctype]);

    const shouldFetchItems = !!scheduleId && !isInherited;
    // 3. Fetch Items: Rely on sourceDoc from useFrappeGetDoc
    // We previously tried to fetch items explicitly via get_list, but that causes PermissionErrors on child tables.
    // sourceDoc (fetched via frappe.client.get) includes all child items and fields (including dependencies_json).
    const backendItems: any[] = []; // Placeholder if we ever need separate fetching
    const isLoadingItems = false;

    // Fallback/Mutate helper
    const mutateItems = () => {
        // No explicit item fetching, so no specific mutateItems needed.
        // Rely on mutateSource for full document refresh.
    };

    // Sync initialItems with localItems when they change (for new forms)
    useEffect(() => {
        if (initialItems && initialItems.length > 0) {
            // Check if initialItems are different from localItems
            const itemsChanged = JSON.stringify(initialItems) !== JSON.stringify(localItems);
            if (itemsChanged) {
                console.log('🔄 Syncing initialItems to localItems:', initialItems);
                setLocalItems(initialItems);
                // CRITICAL: Update parent's ref immediately
                if (onItemsChange) onItemsChange(initialItems);
            }
        }
    }, [initialItems]);

    // Use items from the document directly or local items
    // Merge backend items with local items (for placeholders during editing)
    const activities = useMemo(() => {
        // If we have explicitly fetched backend items, use them.
        // Otherwise (inherited or new), use sourceDoc.items or empty.
        const sourceItems = (backendItems && backendItems.length > 0) ? backendItems : (sourceDoc?.items || []);

        // If we are in "New" mode (no scheduleId), use localItems/initialItems.
        if (!scheduleId) return localItems;

        // If we are in "Edit" mode, we might still have local overrides (optimistic updates)
        // ideally we should merge. But for now, let's rely on backend items + optimistic handling if needed.
        // For simple edit, backendItems is source of truth.
        return [...(sourceItems || []), ...localItems.filter(l => l.name && l.name.startsWith('new-'))];
    }, [scheduleId, sourceDoc?.items, backendItems, localItems]);

    const isLoadingActivities = isLoadingSource;

    // Helper to refresh
    const mutate = () => {
        if (scheduleId) {
            mutateSource();
            if (mutateItems) mutateItems();
        }
    };

    // 4. Fetch Tasks for Dropdown (Filtered by Project)
    const { data: projectTasks } = useFrappeGetDocList("Task", {
        fields: ["name", "subject"],
        filters: effectiveProject ? [["project", "=", effectiveProject]] : undefined,
        limit: 1000
    });

    // --- Actions ---
    const { createDoc } = useFrappeCreateDoc();
    const { updateDoc } = useFrappeUpdateDoc();
    const { deleteDoc } = useFrappeDeleteDoc();

    // --- Modal State ---
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<any>(null);
    // Added back for compatibility with legacy handlers if needed, though mostly handled by modal now
    const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

    const handleModalSave = async (id: string, updatedData: any, successorUpdates?: Record<string, any>) => {
        if (!scheduleId) {
            // Local Mode
            let newItems = [...localItems];
            let newTaskId = "";

            // Defer Task Creation to the Parent Form Save (GenericForm.tsx)
            // We just update the local item state here.

            // Ensure subject/text is synced
            const effectiveSubject = updatedData.subject || updatedData.text || "New Task";
            updatedData.subject = effectiveSubject;
            updatedData.task_name = effectiveSubject;
            updatedData.activity_name = effectiveSubject; // Sync activity_name as well

            const mergedData = { ...updatedData };
            if (newTaskId) {
                mergedData.task = newTaskId; // Link the new task
            }
            // Ensure task_name is synced
            if (mergedData.subject || mergedData.text) {
                mergedData.task_name = mergedData.subject || mergedData.text;
                mergedData.activity_name = mergedData.task_name;
            }

            // Handle Main Task Update
            if (editingActivityId) {
                newItems = newItems.map(i => i.name === editingActivityId ? { ...i, ...mergedData } : i);
            } else {
                const idx = newItems.findIndex(i => i.name === id);
                if (idx > -1) {
                    newItems[idx] = { ...newItems[idx], ...mergedData };
                }
            }

            // Handle Successors (Local Propagate)
            if (successorUpdates) {
                for (const [succId, succData] of Object.entries(successorUpdates)) {
                    const idx = newItems.findIndex(i => i.name === succId);
                    if (idx > -1) {
                        newItems[idx] = { ...newItems[idx], ...succData };
                    }
                }
            }

            setLocalItems(newItems);
            if (onItemsChange) onItemsChange(newItems);
            toast({ title: "Updated", description: "Activity updated (Draft)" });
        } else {
            // Backend Mode
            try {
                // Check if this is a NEW item (placeholder)
                if (id.startsWith("new-")) {
                    // 1. Create the ACTUAL Task in Frappe "Task" doctype
                    // We need the Subject (text) and Project
                    const taskPayload = {
                        subject: updatedData.subject || updatedData.text || "New Task",
                        project: effectiveProject || scheduleDoc?.project,
                        status: "Open",
                        ...(updatedData.start_date && { exp_start_date: updatedData.start_date }),
                        ...(updatedData.end_date && { exp_end_date: updatedData.end_date }),
                        ...(updatedData.duration && { expected_time: updatedData.duration * 8 }), // Assuming 8hr days
                        // Include resources
                        custom_labour_details: updatedData.custom_labour_details || [],
                        custom_machinery_details: updatedData.custom_machinery_details || [],
                        custom_material_details: updatedData.custom_material_details || [],
                        custom_concrete_details: updatedData.custom_concrete_details || []
                    };

                    const taskRes = await createDoc("Task", taskPayload);
                    const newTaskId = taskRes?.name;

                    if (!newTaskId) throw new Error("Failed to create Task document");

                    // 2. Create the Baseline/Schedule Item linked to this Task
                    const itemPayload = {
                        parent: sourceId,
                        parenttype: sourceDoctype,
                        parentfield: "items",
                        ...updatedData, // SPREAD FIRST so we can overwrite/clean specific fields
                        task: newTaskId, // LINK to the created Task (Ensure this overwrite any empty task field from updatedData)
                    };

                    // Auto-calculate End Date if missing
                    if (!itemPayload.end_date && itemPayload.start_date && itemPayload.duration) {
                        const start = new Date(itemPayload.start_date);
                        const end = new Date(start);
                        // Simple calculation (excluding holidays for now, or match current logic)
                        end.setDate(start.getDate() + (itemPayload.duration - 1));
                        // Format YYYY-MM-DD
                        itemPayload.end_date = end.getFullYear() + "-" + String(end.getMonth() + 1).padStart(2, '0') + "-" + String(end.getDate()).padStart(2, '0');
                    }

                    // Map specific fields if needed
                    if (itemPayload.start_date && fieldMap.startDate !== 'start_date') {
                        itemPayload[fieldMap.startDate] = itemPayload.start_date;
                        delete itemPayload.start_date;
                    }
                    if (itemPayload.end_date && fieldMap.endDate !== 'end_date') {
                        itemPayload[fieldMap.endDate] = itemPayload.end_date;
                        delete itemPayload.end_date;
                    }

                    delete itemPayload.text; // Don't send 'text' generic field
                    delete itemPayload.id;   // Don't send 'id' generic field

                    // CRITICAL FIX: Strip Gantt-specific fields that might cause errors
                    // DO NOT DELETE PARENT FOR NEW ITEMS! It is mandatory.
                    itemPayload.parent = sourceId; // Enforce correct parent

                    delete itemPayload.open;
                    delete itemPayload.idx;

                    // Clean up resource fields from Item Payload as they live on Task
                    delete itemPayload.custom_labour_details;
                    delete itemPayload.custom_machinery_details;
                    delete itemPayload.custom_material_details;
                    delete itemPayload.custom_concrete_details;

                    await createDoc(itemDoctype, itemPayload);

                    // 3. Cleanup local placeholder
                    setLocalItems(prev => prev.filter(i => i.name !== id));

                    toast({ title: "Created", description: `Task '${newTaskId}' created and added to schedule.` });
                    mutate();
                    if (onBackendUpdate) onBackendUpdate();

                } else {
                    // Existing Item Update (Legacy Logic)
                    const mappedUpdates: any = { ...updatedData };
                    if (mappedUpdates.start_date && fieldMap.startDate !== 'start_date') {
                        mappedUpdates[fieldMap.startDate] = mappedUpdates.start_date;
                        delete mappedUpdates.start_date;
                    }
                    if (mappedUpdates.end_date && fieldMap.endDate !== 'end_date') {
                        mappedUpdates[fieldMap.endDate] = mappedUpdates.end_date;
                        delete mappedUpdates.end_date;
                    }

                    // Remove 'modified' timestamp to avoid mismatch errors (Last Write Wins)
                    delete mappedUpdates.modified;

                    // CRITICAL FIX: Remove 'parent' field. 
                    // It was set to 0 for Gantt display, but must not be sent to backend as 0.
                    // The backend already knows the correct parent.
                    delete mappedUpdates.parent;
                    delete mappedUpdates.open;
                    delete mappedUpdates.idx;

                    // Extract resources to update the Linked Task
                    const { custom_labour_details, custom_machinery_details, custom_material_details, custom_concrete_details, ...itemUpdates } = mappedUpdates;

                    // Find the linked Task ID
                    const existingItem = activities.find(a => a.name === id);
                    const linkedTaskId = existingItem?.task;

                    if (linkedTaskId) {
                        try {
                            const resourceUpdates: any = {};
                            if (custom_labour_details) resourceUpdates.custom_labour_details = custom_labour_details;
                            if (custom_machinery_details) resourceUpdates.custom_machinery_details = custom_machinery_details;
                            if (custom_material_details) resourceUpdates.custom_material_details = custom_material_details;
                            if (custom_concrete_details) resourceUpdates.custom_concrete_details = custom_concrete_details;

                            if (Object.keys(resourceUpdates).length > 0) {
                                await updateDoc("Task", linkedTaskId, resourceUpdates);
                            }
                        } catch (taskErr) {
                            console.error("Failed to update linked task resources", taskErr);
                            toast({ title: "Task Update Warning", description: "Failed to update task resources.", variant: "destructive" });
                        }
                    }

                    await updateDoc(itemDoctype, id, itemUpdates);

                    // Update Successors
                    if (successorUpdates) {
                        for (const [succId, succData] of Object.entries(successorUpdates)) {
                            const succMapped: any = { ...succData };
                            if (succMapped.start_date && fieldMap.startDate !== 'start_date') {
                                succMapped[fieldMap.startDate] = succMapped.start_date;
                                delete succMapped.start_date;
                            }
                            await updateDoc(itemDoctype, succId, succMapped);
                        }
                    }

                    toast({ title: "Updated", description: "Activity and successors updated" });
                    mutate();
                    if (onBackendUpdate) onBackendUpdate();
                }

            } catch (e: any) {
                console.error(e);
                toast({ title: "Update Failed", description: e.message || e.exception, variant: "destructive" });
            }
        }
    };

    // Add New Task (Simple Handler for the + Add Task button to create a placeholder or open modal?)
    // The previous implementation had a dialog for "Add".
    // TaskInformationModal is designed more for "Editing" an existing Gantt task.
    // For "Add", let's keep a simplified flow OR create a blank task then open modal?
    // Let's create a blank task immediately then open modal for it.
    const handleAddTask = async () => {
        // Create a default task placeholder
        const defaultData = {
            task: "",
            duration: 1,
            [fieldMap.startDate]: format(new Date(), "yyyy-MM-dd"),
            task_name: "New Task",
            activity_name: "New Task" // Ensure activity_name exists to prevent backend AttributeError
        };

        const newItem = {
            name: `new-${Date.now()}`,
            idx: (activities.length || 0) + 1,
            ...defaultData
        };

        // Add to local items (for both local and backend modes temporarily)
        const newItems = [...localItems, newItem];
        setLocalItems(newItems);
        if (!scheduleId && onItemsChange) onItemsChange(newItems);

        // Open Modal
        setEditingActivityId(newItem.name);
        setSelectedTaskForEdit({ ...newItem, id: newItem.name, text: newItem.task_name });
        setIsTaskModalOpen(true);
    };

    const handleTaskUpdate = async (id: string, task: any) => {
        const startDate = format(new Date(task.start_date), "yyyy-MM-dd");

        if (isReadOnly) return;

        if (!scheduleId || id.startsWith("new-")) {
            const newItems = localItems.map(i => i.name === id ? { ...i, [fieldMap.startDate]: startDate, duration: task.duration } : i);
            setLocalItems(newItems);
            if (onItemsChange) onItemsChange(newItems);
            return;
        }

        try {
            await updateDoc(itemDoctype, id, {
                [fieldMap.startDate]: startDate,
                duration: task.duration
            });
            mutate();
            if (onBackendUpdate) onBackendUpdate();
        } catch (e: any) {
            toast({ title: "Update Failed", description: e.message, variant: "destructive" });
        }
    };

    const handleLinkAdd = async (link: any) => {
        if (isReadOnly) return;

        // Same link logic as before
        const sourceIdLink = link.source.toString();
        const targetIdLink = link.target.toString();
        const targetActivity = activities?.find(a => a.name === targetIdLink);
        if (!targetActivity) return;

        let currentDependencies: any[] = [];
        try { if (targetActivity.dependencies_json) currentDependencies = JSON.parse(targetActivity.dependencies_json); } catch (e) { }

        if (currentDependencies.some((d: any) => d.predecessor === sourceIdLink)) return;
        const updatedDependencies = [...currentDependencies, { predecessor: sourceIdLink, type: "FS", lag: 0 }];
        const depsJson = JSON.stringify(updatedDependencies);

        if (!scheduleId) {
            const newItems = localItems.map(i => i.name === targetIdLink ? { ...i, dependencies_json: depsJson } : i);
            setLocalItems(newItems);
            if (onItemsChange) onItemsChange(newItems);
            return;
        }

        await updateDoc(itemDoctype, targetIdLink, { dependencies_json: depsJson });
        await updateDoc(itemDoctype, targetIdLink, { dependencies_json: depsJson });
        mutate();
        if (onBackendUpdate) onBackendUpdate();
    };

    const handleLinkDelete = async (linkId: string) => {
        if (isReadOnly) return;

        const [sourceIdLink, targetIdLink] = linkId.split('-');
        const targetActivity = activities?.find(a => a.name === targetIdLink);
        if (!targetActivity) return;

        let currentDependencies: any[] = [];
        try { if (targetActivity.dependencies_json) currentDependencies = JSON.parse(targetActivity.dependencies_json); } catch (e) { }
        const updated = currentDependencies.filter((d: any) => d.predecessor !== sourceIdLink);
        const depsJson = JSON.stringify(updated);

        if (!scheduleId) {
            const newItems = localItems.map(i => i.name === targetIdLink ? { ...i, dependencies_json: depsJson } : i);
            setLocalItems(newItems);
            if (onItemsChange) onItemsChange(newItems);
            return;
        }

        await updateDoc(itemDoctype, targetIdLink, { dependencies_json: depsJson });
        await updateDoc(itemDoctype, targetIdLink, { dependencies_json: depsJson });
        mutate();
        if (onBackendUpdate) onBackendUpdate();
    };

    const handleTaskDelete = async (id: string) => {
        if (isReadOnly) return;

        if (!scheduleId) {
            const newItems = localItems.filter(i => i.name !== id);
            setLocalItems(newItems);
            if (onItemsChange) onItemsChange(newItems);
            return;
        }

        await deleteDoc(itemDoctype, id);
        await deleteDoc(itemDoctype, id);
        mutate();
        if (onBackendUpdate) onBackendUpdate();
    };

    // --- Process Data ---
    const ganttData = useMemo(() => {
        console.log('🎯 Gantt Data Preparation:', { activities: activities?.length, localItems: localItems?.length, initialItems: initialItems?.length, scheduleId, sourceDoctype });

        const data: any[] = [];
        const links: any[] = [];

        // Pass 1: Parse All Tasks and Assign IDs First
        // This ensures that when we resolve links in Pass 2, all potential targets exist with their final IDs.
        const parsedTasks = (activities || []).map((act: any, index: number) => {
            console.log('📊 Processing activity pass 1:', {
                name: act.name,
                task_name: act.task_name
            });

            // Use actual name from database if available, otherwise generate temporary ID
            // For saved items, act.name will be the database ID (e.g., "abc123...")
            // For new items, act.name will be undefined, so we generate a temporary ID
            const activityId = act.name || `new-activity-${index}`;

            const startDateStr = act[fieldMap.startDate];
            // Only log date parsing for first few items to reduce console noise
            if (index < 3) {
                console.log('📅 Date Parsing:', {
                    name: act.task_name,
                    rawDate: startDateStr,
                    field: fieldMap.startDate
                });
            }

            if (!startDateStr) {
                console.warn('⚠️ Skipping activity without valid start date:', act);
                return null;
            }

            const startDate = new Date(startDateStr);
            if (!startDate || isNaN(startDate.getTime())) {
                console.error('❌ Could not parse start date:', startDateStr);
                return null;
            }

            const endDateStr = act[fieldMap.endDate];
            const endDate = endDateStr ? new Date(endDateStr) : null;

            const duration = act.duration || (endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 1);

            return {
                // SPREAD FIRST to avoid overwriting id/name if they exist in act but are wrong/empty
                ...act,

                id: activityId,
                name: activityId, // Store ID in name for lookup
                text: act.task_name || act.task || 'Unnamed Task',
                start_date: format(startDate, "yyyy-MM-dd"), // Fixed format for consistency
                duration: duration,
                progress: 0,
                status: act.status || 'Open',
                idx: index + 1,
                open: true, // Force open
                // CRITICAL FIX: Frappe child items have a 'parent' field pointing to the DocName.
                // DHTMLX interprets this as a parent Task ID. Since that Task ID doesn't exist in the chart,
                // the row is hidden (orphan). We must override it to 0 (root) or a valid task ID.
                parent: 0
            };
        }).filter((t: any) => t !== null);

        // Push all parsed tasks to data array
        data.push(...parsedTasks);
        console.log(`✅ Pass 1 Complete: Valid Tasks: ${parsedTasks.length}`);

        // Pass 2: Generate Links using the Parsed Tasks (which now have valid IDs)
        parsedTasks.forEach((task: any) => {
            if (task.dependencies_json) {
                try {
                    const deps = JSON.parse(task.dependencies_json);
                    deps.forEach((d: any) => {
                        if (d.predecessor) {
                            let sourceId = d.predecessor;
                            let resolvedViaTask = false;

                            // Resolve Predecessor ID to Valid Task ID
                            // 1. Check direct match (ID match) in parsedTasks
                            const directMatch = parsedTasks.some((a: any) => a.id === sourceId);

                            if (!directMatch) {
                                // 2. Check match via 'task' field (e.g. "TASK-2026-...")
                                // This is crucial when importing from baseline where dependencies refer to Task IDs
                                const taskMatch = parsedTasks.find((a: any) => a.task === sourceId);
                                if (taskMatch) {
                                    sourceId = taskMatch.id;
                                    resolvedViaTask = true;
                                }
                            }

                            // Only add if source exists in current view (parsedTasks)
                            if (parsedTasks.some((a: any) => a.id === sourceId)) {
                                links.push({
                                    id: `${sourceId}-${task.id}`,
                                    source: sourceId,
                                    target: task.id,
                                    type: "0" // FS link
                                });
                                // Log successful resolution via Task ID for verification
                                if (resolvedViaTask) {
                                    console.log(`🔗 Link Resolved via Task ID: ${d.predecessor} -> ${sourceId}`);
                                }
                            } else {
                                console.warn(`⚠️ Link Skipped: Predecessor '${d.predecessor}' not found. Resolved ID: '${sourceId}'. ResolvedViaTask: ${resolvedViaTask}`);
                                // console.log('Available Tasks:', parsedTasks.map((a: any) => a.task));
                            }
                        }
                    });
                } catch (e) {
                    console.warn('Error parsing dependencies_json', e);
                }
            }
        });

        console.log('✅ Gantt data prepared:', { dataCount: data.length, linksCount: links.length });
        console.log('🔗 Generated Links:', links);

        if (links.length === 0 && activities?.some((a: any) => a.dependencies_json && a.dependencies_json !== '[]')) {
            console.warn('⚠️ No links generated despite dependencies existing!');
            // Helper log for debugging
            const sample = activities.find((a: any) => a.dependencies_json && a.dependencies_json !== '[]');
            if (sample) {
                console.log('Sample Dependency JSON:', sample.dependencies_json);
            }
        }
        return { data, links };
    }, [activities, isReadOnly, fieldMap]);



    return (
        <Card className="p-4 space-y-4 border-none shadow-none">
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <h3 className="font-semibold text-sm">Activities</h3>
                    {isInherited && (
                        <p className="text-xs text-muted-foreground">
                            Viewing tasks from Linked Baseline: <span className="font-medium text-primary">{sourceId}</span>
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <ToggleGroup type="single" variant="outline" size="sm" value={zoomLevel} onValueChange={(v) => v && setZoomLevel(v as any)}>
                        <ToggleGroupItem value="Day" className="h-7 text-xs">Day</ToggleGroupItem>
                        <ToggleGroupItem value="Week" className="h-7 text-xs">Week</ToggleGroupItem>
                        <ToggleGroupItem value="Month" className="h-7 text-xs">Month</ToggleGroupItem>
                    </ToggleGroup>

                    {!isReadOnly && (
                        <Button size="sm" className="h-7 text-xs" onClick={handleAddTask}>
                            + Add Task
                        </Button>
                    )}
                </div>
            </div>

            <div className="border rounded-md h-[500px] overflow-auto">
                {activities.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm flex-col gap-2">
                        <p>{doctype === 'KB Operational Schedule' ? 'Please link a Client Baseline or create tasks manually.' : 'Start by adding tasks.'}</p>
                        {!isReadOnly && <Button variant="outline" size="sm" onClick={handleAddTask}>Add First Task</Button>}
                    </div>
                ) : (
                    <GanttWrapper
                        tasks={ganttData}
                        onTaskUpdate={handleTaskUpdate}
                        onLinkAdd={handleLinkAdd}
                        onLinkDelete={handleLinkDelete}
                        onTaskDelete={handleTaskDelete}
                        onTaskClick={(id: string | number) => {
                            console.log('📌 Task clicked in IntegratedSingleGantt:', id);
                            console.log('🔍 Available Gantt data:', ganttData.data.map(d => ({ id: d.id, name: d.name, text: d.text })));

                            // Look up in ganttData.data instead of activities, since that's where the IDs are
                            const ganttTask = ganttData.data.find(d => d.id === id);
                            console.log('📋 Found Gantt task:', ganttTask);

                            if (ganttTask) {
                                setEditingActivityId(ganttTask.id);
                                // The ganttTask already has all the original activity data spread into it
                                const taskForModal = {
                                    ...ganttTask,
                                    text: ganttTask.task_name || ganttTask.task || ganttTask.text,
                                    start_date: ganttTask[fieldMap.startDate],
                                    end_date: ganttTask[fieldMap.endDate]
                                };
                                console.log('🎯 Opening modal with task:', taskForModal);
                                setSelectedTaskForEdit(taskForModal);
                                setIsTaskModalOpen(true);
                            } else {
                                console.error('❌ Task not found! Clicked ID:', id, 'Available IDs:', ganttData.data.map(d => d.id));
                            }
                        }}
                        columns={[
                            { name: "text", label: "Task", tree: true, width: 200, resize: true },
                            { name: "start_date", label: "Start", align: "center", width: 90 },
                            { name: "end_date", label: "End Date", align: "center", width: 90 },
                            { name: "duration", label: "Days", align: "center", width: 50 },
                        ]}
                    />
                )}
            </div>

            <TaskInformationModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                task={selectedTaskForEdit}
                onSave={handleModalSave}
                allTasks={ganttData.data}
                isReadOnly={isReadOnly}
                doctype={doctype}
            />
        </Card>
    );
};

export default IntegratedSingleGantt;
