import React, { useState, useEffect } from "react";
import Gantt from "@/components/custom_components/Gantt";
import { useFrappeGetDocList, useFrappeUpdateDoc, useFrappeDeleteDoc, useFrappePostCall } from "frappe-react-sdk";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import DashboardLayout from "@/components/common/DashboardLayout";
import { planningModules } from "@/components/hrms/WorkflowTree";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

import TaskInformationModal from "./components/TaskInformationModal";

const PlanningComparison: React.FC = () => {
    const [selectedProject, setSelectedProject] = useState<string>("");

    // Fetch Projects
    const { data: projects } = useFrappeGetDocList("Project", {
        fields: ["name"],
        limit: 1000
    });

    return (
        <DashboardLayout
            title="Comparison View"
            subtitle="Compare Client Baseline vs Operational Schedules"
            modules={planningModules}
            hideSidebar={true}
        >
            <div className="space-y-4">
                <div className="flex justify-end">
                    <div className="w-[250px]">
                        <Select value={selectedProject} onValueChange={setSelectedProject}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects?.map((project) => (
                                    <SelectItem key={project.name} value={project.name}>
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {selectedProject ? (
                    <ComparisonGantt selectedProject={selectedProject} />
                ) : (
                    <div className="flex items-center justify-center h-[400px] border rounded-lg bg-muted/10">
                        <p className="text-muted-foreground">Select a Project to view comparison.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};


interface ComparisonGanttProps {
    selectedProject: string;
}

const ComparisonGantt: React.FC<ComparisonGanttProps> = ({ selectedProject }) => {
    const [zoomLevel, setZoomLevel] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Month');
    const { updateDoc } = useFrappeUpdateDoc();
    const { deleteDoc } = useFrappeDeleteDoc();
    const { call: calculateEndDate } = useFrappePostCall('kb_planning.kb_planning.utils.get_end_date_skipping_holidays');
    const { call: updateTaskAndPropagate } = useFrappePostCall('kb_planning.kb_planning.utils.update_task_and_propagate');
    const { call: updateBaselineItem } = useFrappePostCall('kb_planning.kb_planning.utils.update_baseline_item');
    const { toast } = useToast();

    // Task Modal State
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<any>(null);

    // Schedule Selection
    const [masterBaselineId, setMasterBaselineId] = useState<string>("");
    const [operationalScheduleIds, setOperationalScheduleIds] = useState<string[]>([]); // Multi-select array

    // 1. Fetch Client Baselines (MASTER / PRIMARY)
    const { data: baselines } = useFrappeGetDocList("KB Client Baseline", {
        fields: ["name", "is_active", "revision_date", "docstatus"],
        filters: selectedProject ? [["project", "=", selectedProject]] : undefined,
    });

    // 2. Fetch Operational Schedules (COMPARISON / EDITABLE)
    const { data: schedules, mutate: mutateSchedules } = useFrappeGetDocList("KB Operational Schedule", {
        fields: ["name", "schedule_type", "docstatus", "related_baseline"],
        filters: selectedProject ? [["project", "=", selectedProject]] : undefined,
    });

    // Auto-select Active Baseline
    useEffect(() => {
        if (baselines && baselines.length > 0 && !masterBaselineId) {
            const active = baselines.find(b => b.is_active);
            setMasterBaselineId(active ? active.name : baselines[0].name);
        }
    }, [baselines, masterBaselineId]);

    // 3. Fetch Items for MASTER Baseline
    const { call: fetchBaselineItems, loading: baselineLoading } = useFrappePostCall('kb_planning.kb_planning.utils.get_baseline_items');
    const [masterItems, setMasterItems] = useState<any[]>([]);

    useEffect(() => {
        if (masterBaselineId) {
            fetchBaselineItems({ baseline_id: masterBaselineId })
                .then((res) => {
                    if (res.message) setMasterItems(res.message);
                })
                .catch(e => {
                    console.error(e);
                    toast({ title: "Error", description: "Failed to load baseline items", variant: "destructive" });
                });
        } else {
            setMasterItems([]);
        }
    }, [masterBaselineId]);

    // 4. Fetch Items for OPERATIONAL Schedules (Comparison/Overlay)
    const { call: fetchComparisonItems, loading: comparisonLoading } = useFrappePostCall('kb_planning.kb_planning.utils.get_comparison_items');
    const [operationalItems, setOperationalItems] = useState<any[]>([]);

    useEffect(() => {
        const fetchItems = async () => {
            if (operationalScheduleIds.length === 0) {
                setOperationalItems([]);
                return;
            }

            try {
                // api returns { baseline_items: [], operational_items: [] }
                // We are passing Operational Schedule IDs, so they come back in operational_items
                const res = await fetchComparisonItems({ schedule_ids: operationalScheduleIds });
                if (res.message) {
                    setOperationalItems(res.message.operational_items || []);
                }
            } catch (e) {
                console.error("Failed to fetch operational items", e);
                toast({ title: "Error", description: "Failed to load operational data", variant: "destructive" });
            }
        };
        fetchItems();
    }, [operationalScheduleIds]);

    const mutate = () => {
        // Refresh both
        if (masterBaselineId) {
            fetchBaselineItems({ baseline_id: masterBaselineId }).then(res => res.message && setMasterItems(res.message));
        }
        if (operationalScheduleIds.length > 0) {
            fetchComparisonItems({ schedule_ids: operationalScheduleIds }).then(res => {
                if (res.message) setOperationalItems(res.message.operational_items || []);
            });
        }
    };


    if (baselineLoading) return <div>Loading Master View...</div>;
    // if (error) return <div>Error loading schedule: {error.message}</div>;

    const handleTaskUpdate = async (id: string, task: any) => {
        const startDate = format(new Date(task.start_date), "yyyy-MM-dd");

        // Use our custom API that propagates delays
        try {
            // Note: We update 'baseline_start_date' because that's the editable "Start Date" field in the doctype.
            // We pass the raw ID (hash/name) of the item.
            // If the ID passed from Gantt is formatted e.g. "OP-Schedule-ItemName", we need to extract "ItemName".
            // However, looking at processData, we assign owner_id = act.name. 
            // Gantt likely passes the original Task ID or we need to check how the library calls this.
            // Gantt standard: onTaskUpdate(task) -> task.id is the ID used in data.
            // Our data IDs are `OP-{schedule}-{name}`.
            // BUT wait, looking at processData (line 309), we put `owner_id: act.name`. 
            // Does this Gantt component pass back the whole task object? 
            // The signature is `handleTaskUpdate(id, task)`.
            // If `id` corresponds to the Gantt task ID, it will be the long string.
            // Let's rely on `task.owner_id` or parse `id`.

            let realId = id;
            if (task.owner_id) {
                realId = task.owner_id;
            } else if (id.startsWith("OP-")) {
                const parts = id.split("-");
                realId = parts[parts.length - 1];
            }

            const res = await updateTaskAndPropagate({
                item_name: realId,
                updates: {
                    baseline_start_date: startDate,
                    duration: task.duration,
                    dependencies_json: task.dependencies_json,
                    delay_end: task.delay_end
                }
            });

            if (res.message) {
                const updatedList = res.message;
                // Update local state to reflect propagated changes immediately
                setOperationalItems(prev => {
                    const newList = [...prev];
                    updatedList.forEach((u: any) => {
                        const idx = newList.findIndex(x => x.name === u.name);
                        if (idx > -1) {
                            // Merge updates
                            newList[idx] = { ...newList[idx], ...u };
                        }
                    });
                    return newList;
                });
                toast({ title: "Updated", description: "Activity and successors updated." });
            }
        } catch (e: any) {
            console.error(e);
            toast({ title: "Update Failed", description: e.message || "Unknown error", variant: "destructive" });
        }
    };

    const handleTaskClick = (id: string) => {
        // Check if it's an Operational Task (Editable)
        // ID format from processData logic below needed
        // Assuming Operational IDs are finding their way here.
        // If ID starts with 'OP-', it's operational.
        if (id.startsWith("OP-")) {
            const rawId = id.split("-").slice(2).join("-"); // OP-{scheduleId}-{itemId} -> we need to find the item. Actually wait, let's keep simple ID if possible or parse.
            // Let's rely on finding it in operationalItems
            // We need to know WHICH id it is.
            // If we construct ID as `OP-${scheduleId}-${item.name}`
            const parts = id.split("-");
            const opName = parts[parts.length - 1]; // last part is the item name (hash)

            const task = operationalItems.find(a => a.name === opName);
            if (task) {
                // IMPORTANT: Inject Gantt ID ('id') allowing onSave to function
                setSelectedTaskForEdit({ ...task, id: id, owner_id: task.name });
                setIsTaskModalOpen(true);
            }
        } else if (id.startsWith("M-")) {
            // Master Baseline Task
            const mName = id.replace("M-", "");
            const task = masterItems?.find(a => a.name === mName);
            if (task) {
                // IMPORTANT: Inject Gantt ID ('id')
                setSelectedTaskForEdit({ ...task, id: id, owner_id: task.name });
                setIsTaskModalOpen(true);
            }
        }
    }

    const handleLinkAdd = async (link: any) => {
        // Source = Predecessor, Target = Successor
        // Allow linking for both Operational and Master items now
        const targetId = link.target;
        const sourceId = link.source;

        // Extract real names
        const extractName = (id: string) => {
            if (id.startsWith("M-")) return id.replace("M-", "");
            if (id.startsWith("BL-")) {
                const parts = id.split("-");
                return parts[parts.length - 1];
            }
            if (id.startsWith("OP-")) {
                const parts = id.split("-");
                return parts[parts.length - 1];
            }
            return id;
        };

        // Determine type based on target ID
        const isMaster = targetId.startsWith("M-");

        if (!isMaster && !targetId.startsWith("OP-")) {
            // Only Master or OP Allowed (BL- usually read-only unless we decide otherwise, but user asked for Master)
            // BL- in Comparison view is usually the Operational View of the Baseline, so it shouldn't be edited directly?? 
            // Actually BL- is just display. Editing Master usually happens on M-.
            // Let's stick to M- and OP- for editing.
            toast({ title: "Error", description: "Cannot add dependencies to this item type.", variant: "destructive" });
            return;
        }

        const successorName = extractName(targetId);
        const predecessorName = extractName(sourceId);

        // Find the successor object to get current dependencies
        let successorItem: any = null;
        if (isMaster) {
            successorItem = masterItems.find(x => x.name === successorName);
        } else {
            successorItem = operationalItems.find(x => x.name === successorName);
        }

        if (!successorItem) return;

        let currentDeps = [];
        try {
            if (successorItem.dependencies_json) {
                currentDeps = JSON.parse(successorItem.dependencies_json);
            }
        } catch (e) { }

        // Check if already exists (Predecessor stores Task ID usually, but here we extracted Name/Hash)
        // Wait, for Master items, predecessor stores Task ID or Name?
        // In previous steps we saw Master Items using `task.name` (Task ID) or `activity_name` in dependencies.
        // `dependencies_json` structure: `[{ predecessor: "TASK-001", type: "FS" }]`
        // We need to store the correct ID.
        // If we are linking M-TaskA to M-TaskB:
        // Source is M-TaskA. Predecessor should be TaskA's Task ID (if available) or Name.
        // Let's look up the Task ID if available.

        let storedPredecessorId = predecessorName;
        // Logic to find Task ID if it's a Master Item linking to another Master Item?
        // Actually, existing logic uses what is in the DB.
        // If we extracted 'name' (hash), we should probably use that if it matches others.
        // But `dependencies_json` usually references Task Names (Task ID) for persistent linking?
        // Let's check `successorItem.task` or look up the source item.

        let sourceItem: any = null;
        if (sourceId.startsWith("M-")) {
            const mName = sourceId.replace("M-", "");
            sourceItem = masterItems.find(x => x.name === mName);
        } else if (sourceId.startsWith("OP-")) {
            // ...
        }

        // Ideally we use what the system expects.
        // For now, let's use the extracted name (Hash) if that's what we have, OR Task ID if available on source.
        if (sourceItem && sourceItem.task) {
            storedPredecessorId = sourceItem.task;
        }

        // Check exists
        if (currentDeps.find((d: any) => d.predecessor === storedPredecessorId || d.predecessor === predecessorName)) return;

        // Add new dep
        const newDep = {
            predecessor: storedPredecessorId, // Prefer Task ID
            type: "FS",
            lag: 0
        };

        const newDepsList = [...currentDeps, newDep];

        try {
            if (isMaster) {
                // Update Master Baseline
                await updateBaselineItem({
                    item_name: successorName,
                    updates: { dependencies_json: JSON.stringify(newDepsList) }
                });
                toast({ title: "Linked", description: "Baseline dependency added." });
                mutate(); // Refresh
            } else {
                // Update Operational
                const res = await updateTaskAndPropagate({
                    item_name: successorName,
                    updates: {
                        dependencies_json: JSON.stringify(newDepsList)
                    }
                });

                if (res.message) {
                    const updatedList = res.message;
                    setOperationalItems(prev => {
                        const newList = [...prev];
                        updatedList.forEach((u: any) => {
                            const idx = newList.findIndex(x => x.name === u.name);
                            if (idx > -1) {
                                newList[idx] = { ...newList[idx], ...u };
                            }
                        });
                        return newList;
                    });
                    toast({ title: "Linked", description: "Dependency added and dates updated." });
                }
            }
        } catch (e: any) {
            console.error(e);
            toast({ title: "Link Failed", description: e.message, variant: "destructive" });
        }
    };

    const handleLinkDelete = async (linkId: string) => {
        // Not implemented
    };

    const handleTaskDelete = async (id: string) => {
        if (!id.startsWith("CMP-") && !id.startsWith("BL-")) {
            await deleteDoc("KB Operational Schedule Item", id);
            mutate();
        }
    }


    // --- Gantt Data Processing ---
    const ganttColumns = [
        { name: "idx", label: "#", align: "center", width: 40, resize: true },
        { name: "text", label: "Task Name", tree: true, width: 250, resize: true },
        { name: "duration", label: "Duration", align: "center", width: 60, resize: true },
        { name: "start_date", label: "Start", align: "center", width: 80, resize: true },
        { name: "end_date", label: "Finish", align: "center", width: 80, resize: true },
        // { name: "predecessors", label: "Predecessors", align: "center", width: 80, resize: true }, // Logic needed to render this text
    ];

    // START DEBUG: processData function logic
    const processData = () => {
        const data: any[] = [];
        const links: any[] = [];
        const rowHeight = 40; // Approx unscaled height

        // 1. Process MASTER Baseline (Read-Only, Top Layer or Background?)
        // Let's render them. ID Prefix: M-
        // 1. Process MASTER Baseline
        const masterMap = new Map<string, string>(); // Name (Activity/Task) -> ID
        const taskToMasterIdMap = new Map<string, string>(); // Task ID (task.name) -> Master Gantt ID (M-...)
        const itemNameToMasterIdMap = new Map<string, string>(); // Item Name (Hash) -> Master Gantt ID

        masterItems?.forEach((act, idx) => {
            const startDate = act.start_date ? new Date(act.start_date) : null;
            if (startDate) {
                const id = `M-${act.name}`;
                const displayName = act.activity_name || act.task_name || "Unnamed";
                masterMap.set(displayName, id);
                itemNameToMasterIdMap.set(act.name, id); // Map Hash Name -> M-ID

                if (act.task) {
                    taskToMasterIdMap.set(act.task, id);
                }

                data.push({
                    id: id,
                    text: displayName, // Updated display text
                    start_date: format(startDate, "dd-MM-yyyy"),
                    duration: act.duration || 1,
                    parent: act.parent_task ? `M-${act.parent_task}` : 0,
                    type: "task",
                    color: "#64748b", // Slate-500 (Grey/Neutral for Baseline)

                    // readonly: true, // Allow editing for dependencies
                    idx: act.idx,
                    dependencies_json: act.dependencies_json,

                    owner_id: act.name // Ensure Master items have owner_id for dependency linking
                });
            }
        });

        // Process Links for Master Items (Second Pass to ensure all IDs populate map)
        masterItems?.forEach(act => {
            if (act.dependencies_json) {
                try {
                    const deps = JSON.parse(act.dependencies_json);
                    deps.forEach((d: any) => {
                        if (d.predecessor) {
                            // Predecessor is the Task ID (e.g., TASK-2024-001) or Item Name (Hash)
                            // We need to find the Master Item ID that corresponds to this Task ID
                            let sourceId = taskToMasterIdMap.get(d.predecessor);

                            // Fallback 1: Check by Item Name (Hash) - REQUIRED for user's case
                            if (!sourceId) sourceId = itemNameToMasterIdMap.get(d.predecessor);

                            // Fallback 2: Check if predecessor is an activity name or existing ID
                            if (!sourceId) sourceId = masterMap.get(d.predecessor);

                            if (sourceId) {
                                links.push({
                                    id: `L-${d.predecessor}-${act.name}`,
                                    source: sourceId,
                                    target: `M-${act.name}`,
                                    type: "0" // FS
                                });
                            }
                        }
                    });
                } catch (e) { }
            }
        });

        // 2. Process OPERATIONAL Schedules (Compare)
        operationalScheduleIds.forEach((scheduleId, index) => {
            // Get items for this schedule
            const items = operationalItems.filter(item => item.parent === scheduleId);

            // Assign color
            const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"]; // Blue, Red, Green, Amber
            const color = colors[index % colors.length];

            // Helper Map for this specific schedule: TaskID -> OpGanttID
            const scheduleTaskMap = new Map<string, string>();

            // First pass: Populate data and map
            items.forEach(act => {
                const startDateRaw = act.baseline_start_date || act.start_date;
                const startDate = startDateRaw ? new Date(startDateRaw) : null;

                if (startDate) {
                    // Try to find matching Master item to group
                    const opDisplayName = act.activity_name || act.task_name || "Unnamed";
                    const masterParentId = masterMap.get(opDisplayName);

                    // If match found, parent it to the Master Item. 
                    // Otherwise, try to maintain its own hierarchy or fallback to root.
                    const parentId = masterParentId
                        ? masterParentId
                        : (act.parent_task ? `BL-${scheduleId}-${act.parent_task}` : 0); // Changed OP- to BL-

                    const ganttId = `BL-${scheduleId}-${act.name}`; // Changed OP- to BL-
                    if (act.task) {
                        scheduleTaskMap.set(act.task, ganttId);
                    }

                    data.push({
                        id: ganttId,
                        text: `${act.activity_name || act.task_name || "Unnamed"} (${scheduleId})`,
                        start_date: format(startDate, "dd-MM-yyyy"),
                        duration: act.duration || 1,
                        parent: parentId,
                        type: "task",
                        color: color,
                        dependencies_json: act.dependencies_json,

                        owner_id: act.name, // Real ID for updates
                        delay_end: act.delay_end
                    });
                }
            });

            // Second pass: Process Links for Operational Items
            items.forEach(act => {
                if (act.dependencies_json) {
                    try {
                        const deps = JSON.parse(act.dependencies_json);
                        deps.forEach((d: any) => {
                            if (d.predecessor) {
                                // Predecessor is the Task ID -> Need to find Corresponding Operational Gantt Item ID
                                let sourceId = scheduleTaskMap.get(d.predecessor);

                                if (sourceId) {
                                    links.push({
                                        id: `L-${d.predecessor}-${act.name}`, // Unique Link ID
                                        source: sourceId,
                                        target: `BL-${scheduleId}-${act.name}`,
                                        type: "0"
                                    });
                                }
                            }
                        });
                    } catch (e) { }
                }
            });
        });

        return { data, links };
    };

    const { data: ganttData, links: ganttLinks } = processData();

    // Helper to toggle selection
    const toggleOperational = (id: string) => {
        setOperationalScheduleIds(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id);
            return [...prev, id];
        });
    };



    const handleModalSave = async (id: string, updatedData: any, successorUpdates?: Record<string, any>) => {
        // Detect if it is a Master Item (Baseline) or Operational Item
        // We can check the ID prefix or the item in ganttData
        const task = ganttData.find(t => t.id === id); // id from gantt (e.g., M-...) or the one passed might be original ID?
        // Wait, TaskInfoModal passes "task.id" which is the Gantt ID.
        // But for saving we need "task.owner_id" (Original Name).
        // Let's assume 'id' passed here is actually the 'owner_id' because TaskInfoModal logic calls onSave(task.id, ...)
        // In TaskInfoModal: onSave(task.id, ...) where task.id is usually the Gantt ID.
        // BUT invalid, we need backend ID.
        // TaskInfoModal uses "task.owner_id" internally but passes "task.id" (Gantt ID) to onSave.
        // Let's rely on finding the task in ganttData to know its type.

        const ganttTask = ganttData.find(t => t.id === id);
        if (!ganttTask) return;

        const realId = ganttTask.owner_id;
        const isMaster = id.startsWith("M-");

        if (isMaster) {
            // Update Baseline Item
            await updateBaselineItem({ item_name: realId, updates: updatedData });

            // Update Successors (Baseline Successors)
            if (successorUpdates) {
                for (const [succId, succData] of Object.entries(successorUpdates)) {
                    await updateBaselineItem({ item_name: succId, updates: succData });
                }
            }
            toast({ title: "Success", description: "Baseline task updated." });
            mutate(); // Refresh to reload data
        } else {
            // Update Operational Item (Existing Logic)
            await handleTaskUpdate(realId, updatedData); // This calls updateTaskAndPropagate

            // Update Operational Successors
            if (successorUpdates) {
                for (const [succId, succData] of Object.entries(successorUpdates)) {
                    await handleTaskUpdate(succId, succData);
                }
            }
        }
    };

    return (
        <Card className="p-4 space-y-4">
            <div className="flex justify-between items-center bg-muted/20 p-2 rounded-lg">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <Label className="text-xs text-muted-foreground font-semibold uppercase">Master Baseline</Label>
                        <select
                            className="bg-background border rounded px-2 py-1 text-sm w-[240px] h-9"
                            value={masterBaselineId}
                            onChange={(e) => setMasterBaselineId(e.target.value)}
                        >
                            <option value="" disabled>Select Master Baseline</option>
                            {baselines?.map(b => (
                                <option key={b.name} value={b.name}>
                                    {b.name} {b.is_active && "(Active)"}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <Label className="text-xs text-muted-foreground font-semibold uppercase">Operational Schedules (Compare)</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-[280px] justify-between h-9 px-2 text-sm">
                                    {operationalScheduleIds.length === 0 ? "Select Schedules..." : `${operationalScheduleIds.length} Selected`}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[280px] bg-white" align="start">
                                {schedules?.map(s => (
                                    <DropdownMenuCheckboxItem
                                        key={s.name}
                                        checked={operationalScheduleIds.includes(s.name)}
                                        onCheckedChange={() => toggleOperational(s.name)}
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        <span className="truncate">{s.name} ({s.schedule_type})</span>
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-2 mt-4 text-xs">
                        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-500 rounded-sm"></div> Master</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Op 1</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Op 2</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <ToggleGroup type="single" variant="outline" size="sm" value={zoomLevel} onValueChange={(v) => v && setZoomLevel(v as any)}>
                        <ToggleGroupItem value="Day">Day</ToggleGroupItem>
                        <ToggleGroupItem value="Week">Week</ToggleGroupItem>
                        <ToggleGroupItem value="Month">Month</ToggleGroupItem>
                    </ToggleGroup>
                    <Button size="sm" onClick={() => mutate()} variant="outline">Refresh</Button>
                </div>
            </div>

            <div className="border rounded-md overflow-hidden h-[650px] relative bg-white">
                <Gantt
                    tasks={{ data: ganttData, links: ganttLinks }}
                    zoomLevel={zoomLevel}
                    onTaskUpdate={handleTaskUpdate}
                    onLinkAdd={handleLinkAdd}
                    onLinkDelete={handleLinkDelete}
                    onTaskDelete={handleTaskDelete}
                    onTaskClick={handleTaskClick}
                    columns={ganttColumns}
                // Tooltip enabled by default with fix
                />
            </div>

            {/* Task Information Modal */}
            <TaskInformationModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                task={selectedTaskForEdit}
                onSave={handleModalSave}
                allTasks={ganttData} // Pass flattened data for predecessor lookup
            />
        </Card>
    );
};

export default PlanningComparison;
