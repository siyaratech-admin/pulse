import React, { useState, useEffect, useMemo } from "react";
// Use GanttWrapper to avoid dhtmlx-gantt initialization issues
import GanttWrapper from "@/components/custom_components/GanttWrapper";
import { useFrappeGetDocList, useFrappeGetDoc, useFrappeUpdateDoc, useFrappeCreateDoc, useFrappeDeleteDoc, useFrappePostCall } from "frappe-react-sdk";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Lock, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PlanningGanttTabProps {
    selectedProject?: string;
    scheduleId?: string;
    doctype?: 'KB Operational Schedule' | 'KB Client Baseline';
}

const PlanningGanttTab: React.FC<PlanningGanttTabProps> = ({ selectedProject, scheduleId, doctype }) => {
    const [zoomLevel, setZoomLevel] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Month');
    const { updateDoc } = useFrappeUpdateDoc();
    const { createDoc } = useFrappeCreateDoc();
    const { deleteDoc } = useFrappeDeleteDoc();
    const { call } = useFrappePostCall('frappe.client.submit');
    const { toast } = useToast();

    // Doctype Selection
    const [selectedDoctype, setSelectedDoctype] = useState<'KB Operational Schedule' | 'KB Client Baseline'>(doctype || 'KB Operational Schedule');
    const itemDoctype = selectedDoctype === 'KB Operational Schedule' ? 'KB Operational Schedule Item' : 'KB Client Baseline Item';

    // Update selectedDoctype if prop changes
    useEffect(() => {
        if (doctype) setSelectedDoctype(doctype);
    }, [doctype]);

    // Field Mapping
    const fieldMap = useMemo(() => {
        if (selectedDoctype === 'KB Operational Schedule') {
            return {
                startDate: 'baseline_start_date',
                endDate: 'baseline_end_date',
                taskName: 'task_name', // read_only
                taskLink: 'task'
            };
        } else {
            return {
                startDate: 'start_date',
                endDate: 'end_date',
                taskName: 'task_name',
                taskLink: 'task'
            };
        }
    }, [selectedDoctype]);

    // Schedule Selection
    const [selectedSchedule, setSelectedSchedule] = useState<string>(scheduleId || "");
    const [comparisonSchedule, setComparisonSchedule] = useState<string>("");

    // Update selectedSchedule if prop changes
    useEffect(() => {
        if (scheduleId) setSelectedSchedule(scheduleId);
    }, [scheduleId]);

    // State
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState("");

    // Add filtering for task search
    const [taskSearch, setTaskSearch] = useState("");

    const [activityForm, setActivityForm] = useState({
        duration: 0,
        start_date: "",
        end_date: ""
    });

    const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

    const { data: singleSchedule } = useFrappeGetDoc(selectedDoctype, scheduleId, undefined, {
        enabled: !!scheduleId
    });

    // Resolve circular dependency by using initial project for schedules fetch
    const initialProject = selectedProject || singleSchedule?.project;

    // 1. Fetch Schedules/Baselines for the selected project
    // Note: If no project is selected/inferred, this fetches all (subject to permissions/limit)
    const { data: schedules, mutate: mutateSchedules, isLoading: isLoadingSchedules } = useFrappeGetDocList(selectedDoctype, {
        fields: ["name", selectedDoctype === 'KB Operational Schedule' ? "schedule_type" : "project", "docstatus", "related_baseline"],
        filters: initialProject ? [["project", "=", initialProject]] : undefined,
    });

    const currentScheduleDoc = scheduleId ? singleSchedule : schedules?.find((s: any) => s.name === selectedSchedule);
    const effectiveProject = initialProject || currentScheduleDoc?.project;

    const isSubmitted = currentScheduleDoc?.docstatus === 1;

    // 2. Fetch Tasks for the dropdown
    const { data: projectTasks } = useFrappeGetDocList("Task", {
        fields: ["name", "subject"],
        filters: effectiveProject ? [["project", "=", effectiveProject]] : undefined,
        limit: 1000
    });

    // Auto-select first schedule
    useEffect(() => {
        if (!scheduleId && schedules && schedules.length > 0) {
            if (!selectedSchedule || !schedules.find(s => s.name === selectedSchedule)) {
                setSelectedSchedule(schedules[0].name);
            }
        } else if (!scheduleId) {
            setSelectedSchedule("");
        }
    }, [schedules, selectedDoctype, scheduleId]);

    // 3. Fetch Items for PRIMARY schedule
    const { data: activities, mutate, isLoading: isLoadingActivities } = useFrappeGetDocList(itemDoctype, {
        fields: ["name", "task", "task_name", "idx", "parent", "duration", fieldMap.startDate, fieldMap.endDate, "dependencies_json"],
        filters: selectedSchedule ? [["parent", "=", selectedSchedule]] : undefined,
        limit: 1000,
        orderBy: { field: "idx", order: "asc" }
    });

    // 3b. Fetch Items for COMPARISON schedule
    const comparisonDoctype = selectedDoctype;
    const comparisonItemDoctype = itemDoctype;

    const { data: compActivities } = useFrappeGetDocList(comparisonItemDoctype, {
        fields: ["name", "task_name", "duration", fieldMap.startDate, fieldMap.endDate],
        filters: comparisonSchedule ? [["parent", "=", comparisonSchedule]] : undefined,
        limit: 1000
    });

    // --- Auto-Populate Logic (Frontend Only) ---
    const { call: getBaselineDoc } = useFrappePostCall("frappe.client.get");
    const [isPopulating, setIsPopulating] = useState(false);

    useEffect(() => {
        const populateFromBaseline = async () => {
            if (
                selectedDoctype === 'KB Operational Schedule' &&
                selectedSchedule &&
                activities &&
                activities.length === 0 &&
                !isPopulating
            ) {
                const currentSched = schedules?.find(s => s.name === selectedSchedule);
                if (currentSched && currentSched.related_baseline) {
                    setIsPopulating(true);
                    try {
                        // 1. Fetch Client Baseline
                        const baselineRes = await getBaselineDoc({ doctype: "KB Client Baseline", name: currentSched.related_baseline });
                        const baselineDoc = baselineRes.message;

                        if (baselineDoc && baselineDoc.items && baselineDoc.items.length > 0) {
                            let addedCount = 0;
                            toast({ title: "Populating...", description: `Found ${baselineDoc.items.length} items in Client Baseline. Copying...` });

                            // 2. Create Items one by one
                            // Using a loop to ensure sequential creation and avoid overwhelming the server
                            for (const bItem of baselineDoc.items) {
                                await createDoc(itemDoctype, {
                                    project: currentSched.project,
                                    parent: selectedSchedule,
                                    parenttype: selectedDoctype,
                                    parentfield: "items",
                                    task: bItem.task,
                                    task_name: bItem.task_name,
                                    activity_name: bItem.activity_name,
                                    // Map dates
                                    baseline_start_date: bItem.start_date,
                                    baseline_end_date: bItem.end_date,
                                    duration: bItem.duration,
                                    // Helper
                                    start_date: bItem.start_date,
                                    end_date: bItem.end_date,
                                    client_duration: bItem.duration
                                });
                                addedCount++;
                            }

                            toast({ title: "Success", description: `Added ${addedCount} activities from Client Baseline.` });
                            mutate(); // Refresh list
                        }
                    } catch (e: any) {
                        console.error("Failed to populate from baseline", e);
                        toast({ title: "Population Failed", description: e.message || "Unknown error", variant: "destructive" });
                    } finally {
                        setIsPopulating(false);
                    }
                }
            }
        };

        populateFromBaseline();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSchedule, selectedDoctype, activities?.length, schedules]);

    const handleSubmitSchedule = async () => {
        if (!selectedSchedule) return;
        try {
            await call({ doc: { doctype: selectedDoctype, name: selectedSchedule } });
            toast({ title: "Submitted", description: `${selectedDoctype.replace('KB ', '')} has been locked.` });
            mutateSchedules();
            mutate();
        } catch (e: any) {
            toast({ title: "Submission Failed", description: e.message, variant: "destructive" });
        }
    }

    const handleTaskUpdate = async (id: string, task: any) => {
        if (isSubmitted) {
            toast({ title: "Locked", description: "This schedule is submitted.", variant: "destructive" });
            mutate();
            return;
        }

        const startDate = format(new Date(task.start_date), "yyyy-MM-dd");

        try {
            await updateDoc(itemDoctype, id, {
                [fieldMap.startDate]: startDate,
                duration: task.duration
            });
            toast({ title: "Updated", description: "Activity updated." });
            mutate();
        } catch (e: any) {
            toast({ title: "Update Failed", description: e.message, variant: "destructive" });
        }
    };

    const handleLinkAdd = async (link: any) => {
        const sourceId = link.source.toString();
        const targetId = link.target.toString();

        const targetActivity = activities?.find(a => a.name === targetId);
        if (!targetActivity) return;

        let currentDependencies: any[] = [];
        try {
            if (targetActivity.dependencies_json) currentDependencies = JSON.parse(targetActivity.dependencies_json);
        } catch (e) { currentDependencies = []; }

        if (currentDependencies.some((d: any) => d.predecessor === sourceId)) return;

        const updatedDependencies = [...currentDependencies, { predecessor: sourceId, type: "FS", lag: 0 }];

        try {
            await updateDoc(itemDoctype, targetId, {
                dependencies_json: JSON.stringify(updatedDependencies)
            });
            mutate();
        } catch (e: any) {
            toast({ title: "Link Failed", description: e.message, variant: "destructive" });
        }
    };

    const handleLinkDelete = async (linkId: string) => {
        const [sourceId, targetId] = linkId.split('-');
        if (!sourceId || !targetId) return;

        const targetActivity = activities?.find(a => a.name === targetId);
        if (!targetActivity) return;

        let currentDependencies: any[] = [];
        try { targetActivity.dependencies_json && (currentDependencies = JSON.parse(targetActivity.dependencies_json)) } catch (e) { }

        const updatedDependencies = currentDependencies.filter((d: any) => d.predecessor !== sourceId);

        try {
            await updateDoc(itemDoctype, targetId, { dependencies_json: JSON.stringify(updatedDependencies) });
            mutate();
        } catch (e) { }
    };

    const handleSaveActivity = async () => {
        if (!selectedTask || !selectedSchedule) {
            toast({ title: "Missing Information", description: "Please select a task.", variant: "destructive" });
            return;
        }

        const data: any = {
            task: selectedTask,
            duration: activityForm.duration || 1,
            [fieldMap.startDate]: activityForm.start_date || undefined
        };

        try {
            if (editingActivityId) {
                await updateDoc(itemDoctype, editingActivityId, data);
                toast({ title: "Updated", description: `Updated activity` });
            } else {
                await createDoc(itemDoctype, {
                    project: selectedProject,
                    parent: selectedSchedule,
                    parenttype: selectedDoctype,
                    parentfield: "items", // Child Table Field Name
                    ...data
                });
                toast({ title: "Created", description: `Added activity` });
            }
            setIsAddDialogOpen(false);
            resetForm();
            mutate();
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    };

    const handleTaskDelete = async (id: string) => {
        if (isSubmitted) return;
        try {
            await deleteDoc(itemDoctype, id);
            mutate();
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    };

    const openEditDialog = (activity: any) => {
        setEditingActivityId(activity.name);
        setSelectedTask(activity.task);
        setActivityForm({
            duration: activity.duration || 0,
            start_date: activity[fieldMap.startDate] || "",
            end_date: activity[fieldMap.endDate] || ""
        });
        setIsAddDialogOpen(true);
    };

    const resetForm = () => {
        setEditingActivityId(null);
        setSelectedTask("");
        setActivityForm({ duration: 0, start_date: "", end_date: "" });
    };

    // --- Gantt Data Processing ---
    const ganttColumns = [
        { name: "idx", label: "#", align: "center", width: 40, resize: true },
        { name: "text", label: "Task Name", tree: true, width: 220, resize: true, editor_type: "text" },
        { name: "start_date", label: "Start", align: "center", width: 90, resize: true, editor_type: "date_input" },
        { name: "duration", label: "Duration", align: "center", width: 60, resize: true, editor_type: "number" },
        { name: "end_date", label: "Finish", align: "center", width: 90, resize: true },
    ];

    const processData = () => {
        const data: any[] = [];
        const links: any[] = [];

        // 1. Process Activities
        activities?.forEach(act => {
            const startDateStr = act[fieldMap.startDate];
            const startDate = startDateStr ? new Date(startDateStr) : null;
            const taskName = act.task_name || act.task || 'Unnamed Task';

            if (startDate) {
                data.push({
                    id: act.name,
                    text: taskName,
                    start_date: format(startDate, "dd-MM-yyyy"),
                    duration: act.duration || 1,
                    parent: 0,
                    type: "task",
                    color: "#3b82f6", // Blue
                    idx: act.idx,
                    readonly: isSubmitted
                });
            }

            // Dependencies
            if (act.dependencies_json) {
                try {
                    const deps = JSON.parse(act.dependencies_json);
                    deps.forEach((d: any) => {
                        if (d.predecessor) {
                            links.push({
                                id: `${d.predecessor}-${act.name}`,
                                source: d.predecessor,
                                target: act.name,
                                type: "0"
                            });
                        }
                    });
                } catch (e) { }
            }
        });

        // 2. Process Comparison Activities (ONLY if NOT in embedded mode and comparison selected)
        if (!scheduleId && comparisonSchedule && compActivities) {
            compActivities.forEach(comp => {
                const matchingPrimary = activities?.find(a => (a.task && a.task === comp.task) || (a.task_name && a.task_name === comp.task_name));

                if (matchingPrimary && comp[fieldMap.startDate]) {
                    data.push({
                        id: `CMP-${comp.name}`,
                        text: `${comp.task_name || comp.task} (Ref)`,
                        start_date: format(new Date(comp[fieldMap.startDate]), "dd-MM-yyyy"),
                        duration: comp.duration || 1,
                        parent: matchingPrimary.name,
                        type: "task",
                        color: "#9ca3af", // Grey
                        readonly: true
                    });
                }
            });
        }

        return { data, links };
    };

    const { data: ganttData, links: ganttLinks } = processData();

    return (
        <Card className="p-4 space-y-4 shadow-none border-0">
            {!scheduleId && (
                <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Tabs value={selectedDoctype} onValueChange={(v) => setSelectedDoctype(v as any)} className="w-[400px]">
                                <TabsList>
                                    <TabsTrigger value="KB Operational Schedule">Operational Schedule</TabsTrigger>
                                    <TabsTrigger value="KB Client Baseline">Client Baseline</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <ToggleGroup type="single" variant="outline" size="sm" value={zoomLevel} onValueChange={(v) => v && setZoomLevel(v as any)}>
                            <ToggleGroupItem value="Day">Day</ToggleGroupItem>
                            <ToggleGroupItem value="Week">Week</ToggleGroupItem>
                            <ToggleGroupItem value="Month">Month</ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    <div className="flex justify-between items-center bg-muted/20 p-2 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <Label className="text-xs text-muted-foreground mb-1">Select Schedule</Label>
                                {isLoadingSchedules ? <span className="text-xs">Loading...</span> : (
                                    <Select value={selectedSchedule} onValueChange={setSelectedSchedule}>
                                        <SelectTrigger className="w-[250px] h-8 text-xs">
                                            <SelectValue placeholder="Select Schedule" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {schedules?.map(s => (
                                                <SelectItem key={s.name} value={s.name}>
                                                    {s.name} {s.schedule_type ? `- ${s.schedule_type}` : ''} {s.docstatus === 1 ? '🔒' : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <Label className="text-xs text-muted-foreground mb-1">Compare With</Label>
                                <Select value={comparisonSchedule} onValueChange={setComparisonSchedule}>
                                    <SelectTrigger className="w-[250px] h-8 text-xs">
                                        <SelectValue placeholder="Select Schedule to Compare" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {schedules?.filter(s => s.name !== selectedSchedule).map(s => (
                                            <SelectItem key={s.name} value={s.name}>
                                                {s.name} {s.schedule_type ? `- ${s.schedule_type}` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {isSubmitted && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded border border-amber-200 self-end mb-1">Read Only</span>}
                        </div>

                        <div className="flex items-center gap-2">
                            {!isSubmitted && selectedSchedule && (
                                <Button size="sm" variant="default" onClick={handleSubmitSchedule} className="bg-blue-600 hover:bg-blue-700 h-8">
                                    <Lock className="w-3 h-3 mr-1" /> Lock
                                </Button>
                            )}
                            <Button size="sm" onClick={() => { resetForm(); setIsAddDialogOpen(true); }} disabled={!selectedSchedule || isSubmitted} className="h-8">
                                Add Activity
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Embedded Control Header */}
            {scheduleId && (
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium">Gantt Timeline</h3>
                        {isSubmitted && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">Read Only</span>}
                    </div>
                    <div className="flex items-center gap-2">
                        <ToggleGroup type="single" variant="outline" size="sm" value={zoomLevel} onValueChange={(v) => v && setZoomLevel(v as any)}>
                            <ToggleGroupItem value="Day" className="h-7 text-xs px-2">Day</ToggleGroupItem>
                            <ToggleGroupItem value="Week" className="h-7 text-xs px-2">Week</ToggleGroupItem>
                            <ToggleGroupItem value="Month" className="h-7 text-xs px-2">Month</ToggleGroupItem>
                        </ToggleGroup>
                        <Button size="sm" onClick={() => { resetForm(); setIsAddDialogOpen(true); }} disabled={isSubmitted} className="h-7 text-xs">
                            Add Activity
                        </Button>
                    </div>
                </div>
            )}

            <div className="border rounded-md overflow-hidden h-[600px] relative">
                {isLoadingActivities ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">Loading Gantt...</div>
                ) : !selectedSchedule ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">Select a schedule to view Gantt</div>
                ) : (
                    <GanttWrapper
                        tasks={{ data: ganttData, links: ganttLinks }}
                        onTaskUpdate={handleTaskUpdate}
                        onLinkAdd={handleLinkAdd}
                        onLinkDelete={handleLinkDelete}
                        onTaskDelete={handleTaskDelete}
                        onTaskClick={(id) => {
                            if (!id.startsWith("CMP-")) {
                                const act = activities?.find(a => a.name === id);
                                if (act) openEditDialog(act);
                            }
                        }}
                        columns={ganttColumns}
                    />
                )}
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingActivityId ? "Edit Activity" : "Add Activity"}</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <div className="flex justify-between items-center">
                                <Label>Task</Label>
                                {effectiveProject && (
                                    <a href={`/app/task/new?project=${effectiveProject}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                                        + Create New Task
                                    </a>
                                )}
                            </div>
                            <Select value={selectedTask} onValueChange={setSelectedTask} disabled={!!editingActivityId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={projectTasks?.length === 0 ? "No tasks found in this project" : "Select Task"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {projectTasks?.map(t => (
                                        <SelectItem key={t.name} value={t.name}>
                                            {t.subject} ({t.name})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-muted-foreground">
                                Only tasks linked to project {effectiveProject} are shown.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Start Date</Label>
                                <Input type="date" value={activityForm.start_date} onChange={(e) => setActivityForm(p => ({ ...p, start_date: e.target.value }))} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Duration (Days)</Label>
                                <Input type="number" value={activityForm.duration} onChange={(e) => setActivityForm(p => ({ ...p, duration: parseInt(e.target.value) || 0 }))} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveActivity}>{editingActivityId ? "Update" : "Save"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default PlanningGanttTab;
