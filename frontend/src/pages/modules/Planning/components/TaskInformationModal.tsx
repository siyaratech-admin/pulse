import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Trash2, Plus, Save, X } from "lucide-react";
import { useFrappeGetDoc, useFrappeUpdateDoc, useFrappeGetDocList, useFrappeCreateDoc } from "frappe-react-sdk";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/ui/form/Combobox";
import { cn } from "@/lib/utils";

// --- Custom Right-Side Modal Component ---
const RightSideModal = ({ isOpen, onClose, title, children, footer }: any) => {
    // Handle escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={cn(
                    "absolute right-0 top-0 bottom-0 h-full bg-white dark:bg-zinc-950 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
                    "w-full md:w-1/2 lg:w-1/2", // 50% on larger screens, full on mobile
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/10">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="p-6 border-t bg-gray-50/50 dark:bg-zinc-900/50">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};


// Sub-component for Resource Row with EXTRA COLUMNS
const ResourceRow = ({
    item,
    index,
    type,
    label,
    itemField,
    options,
    isReadOnly,
    isQtyReadOnly,
    updateResource,
    removeResource,
    extraFields = [], // Array of { key, label, readOnly }
    qtyField = 'qty' // Default to qty if not provided
}: any) => {
    const [open, setOpen] = useState(false);

    return (
        <TableRow className="hover:bg-muted/50">
            {/* 1. Main Item Selection */}
            <TableCell className="align-top min-w-[200px]">
                <Combobox
                    open={open}
                    onOpenChange={setOpen}
                    value={item[itemField]}
                    onSelect={(value) => {
                        // Find the selected option object to populate extra fields
                        const selectedOption = options.find((opt: any) => opt.value === value);
                        updateResource(type, index, itemField, value, selectedOption?.originalData);
                        setOpen(false);
                    }}
                    options={options}
                    placeholder={`Select ${label}...`}
                    className="w-full"
                    disabled={isReadOnly}
                />
            </TableCell>

            {/* 2. Extra Fields */}
            {extraFields.map((field: any) => (
                <TableCell key={field.key} className="align-top min-w-[100px]">
                    {field.editable && !isReadOnly ? (
                        field.type === 'select' ? (
                            <select
                                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={item[field.key] || ""}
                                onChange={(e) => updateResource(type, index, field.key, e.target.value)}
                            >
                                <option value="" disabled>Select...</option>
                                {field.options?.map((opt: any) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <Input
                                className="h-9"
                                type={field.key.includes('rate') || field.key.includes('amount') ? 'number' : 'text'}
                                value={item[field.key] || ""}
                                onChange={(e) => updateResource(type, index, field.key, e.target.value)}
                                placeholder={field.label}
                            />
                        )
                    ) : (
                        <div className="py-2 px-1 text-sm font-medium truncate" title={item[field.key]}>
                            {item[field.key] || "-"}
                        </div>
                    )}
                </TableCell>
            ))}

            {/* 3. Qty */}
            <TableCell className="align-top w-[100px]">
                <Input
                    type="number"
                    className="h-9"
                    value={item[qtyField] || 0}
                    onChange={(e) => updateResource(type, index, qtyField, parseFloat(e.target.value))}
                    disabled={isReadOnly || isQtyReadOnly}
                />
            </TableCell>

            {/* 4. Delete Action */}
            <TableCell className="align-top w-[50px]">
                {!isReadOnly && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeResource(type, index)}
                        className="hover:text-red-500 text-muted-foreground h-9 w-9"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </TableCell>
        </TableRow>
    );
};

interface TaskInformationModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: any | null;
    onSave: (taskId: string, updatedData: any, successorUpdates?: Record<string, any>) => void;
    allTasks: any[]; // For predecessor selection
    isReadOnly?: boolean;
    doctype?: 'KB Operational Schedule' | 'KB Client Baseline'; // Add doctype to determine which fields to show
}

const TaskInformationModal: React.FC<TaskInformationModalProps> = ({
    isOpen,
    onClose,
    task,
    onSave,
    allTasks = [],
    isReadOnly = false,
    doctype = 'KB Client Baseline', // Default to Client Baseline
}) => {
    const [activeTab, setActiveTab] = useState("general");
    const [formData, setFormData] = useState<any>({});
    const [predecessors, setPredecessors] = useState<any[]>([]);
    const [successors, setSuccessors] = useState<any[]>([]);

    // --- Resources Support ---
    const { task: taskId } = task || {}; // Link ID to Task Doctype

    const { data: taskDoc, mutate: mutateTask } = useFrappeGetDoc("Task", taskId, {
        enabled: !!taskId && !taskId.startsWith("new-"),
        fields: ["*", "custom_labour_details", "custom_machinery_details", "custom_material_details", "custom_concrete_details"]
    });

    const { updateDoc: updateTask } = useFrappeUpdateDoc();
    const { createDoc: createTask } = useFrappeCreateDoc();

    // Fetch lists for dropdowns with EXTRA fields
    // Removed 'labour_name' and 'uom' as they caused DataErrors.
    const { data: labourTypes } = useFrappeGetDocList("KB Labour Type", {
        fields: ["name", "labour_type"],
        limit: 1000
    });

    const { data: natureOfWorkList } = useFrappeGetDocList("KB Nature of Work", {
        fields: ["name", "nature_of_work"],
        limit: 1000
    });

    const { data: assets } = useFrappeGetDocList("Asset", {
        fields: ["name", "item_name", "asset_category", "item_code"],
        limit: 1000
    });

    const { data: items } = useFrappeGetDocList("Item", {
        fields: ["name", "item_name", "item_code", "stock_uom", "item_group", "valuation_rate"],
        limit: 1000
    });

    const { data: itemGroups } = useFrappeGetDocList("Item Group", {
        fields: ["name"],
        limit: 1000
    });

    const { data: concreteGrades } = useFrappeGetDocList("Concrete Grade", {
        fields: ["name", "concrete_grade"],
        limit: 100
    });


    // Helper to format options AND keep original data
    const labourOptions = (labourTypes || []).map((d: any) => ({
        label: d.labour_type, // Fallback to name since labour_name is invalid
        value: d.name,
        originalData: d
    }));

    const natureOfWorkOptions = (natureOfWorkList || []).map((d: any) => ({
        label: d.nature_of_work || d.name,
        value: d.name,
        originalData: d
    }));

    const assetOptions = (assets || []).map((d: any) => ({
        label: d.item_name ? `${d.item_name} (${d.name})` : d.name,
        value: d.name,
        originalData: d
    }));

    const itemOptions = (items || []).map((d: any) => ({
        label: d.item_name ? `${d.item_name} (${d.item_code})` : d.name,
        value: d.item_code,
        originalData: d
    }));

    const concreteGradeOptions = (concreteGrades || []).map((d: any) => ({
        label: d.name,
        value: d.name,
        originalData: d
    }));


    const [resources, setResources] = useState<{
        labour: any[];
        machinery: any[];
        material: any[];
        concrete: any[];
    }>({ labour: [], machinery: [], material: [], concrete: [] });

    useEffect(() => {
        if (taskDoc) {
            setResources({
                labour: taskDoc.custom_labour_details || [],
                machinery: taskDoc.custom_machinery_details || [],
                material: taskDoc.custom_material_details || [],
                concrete: taskDoc.custom_concrete_details || []
            });
        }
    }, [taskDoc]);

    useEffect(() => {
        if (task && isOpen) {
            setFormData({
                ...task,
                subject: task.text || task.subject || "", // Map text to subject for editing
                start_date: task.start_date
                    ? format(new Date(task.start_date), "yyyy-MM-dd")
                    : "",
                end_date: task.end_date
                    ? format(new Date(task.end_date), "yyyy-MM-dd")
                    : "",
            });

            // 1. Parse Predecessors
            let initialPredecessors = [];
            if (task.dependencies_json) {
                try {
                    initialPredecessors = JSON.parse(task.dependencies_json);
                } catch (e) {
                    console.error("Failed to parse dependencies", e);
                }
            }
            setPredecessors(initialPredecessors);

            // 2. Derive Successors
            // In the current data structure from IntegratedSingleGantt, 'id' is the unique key (Item Name)
            const myId = task.id;
            const derivedSuccessors: any[] = [];
            const processedSuccessorIds = new Set();

            if (myId) {
                allTasks.forEach(t => {
                    if (t.dependencies_json) {
                        try {
                            const deps = JSON.parse(t.dependencies_json);
                            // Check if this task (t) has ME (myId) as a predecessor
                            const link = deps.find((d: any) => d.predecessor === myId);
                            const successorId = t.id;

                            if (link && !processedSuccessorIds.has(successorId)) {
                                processedSuccessorIds.add(successorId);
                                derivedSuccessors.push({
                                    task_id: successorId,
                                    text: t?.text || "Unknown Task",
                                    type: link.type || "FS",
                                    lag: link.lag || 0
                                });
                            }
                        } catch (e) { }
                    }
                });
            }
            setSuccessors(derivedSuccessors);
        }
    }, [task?.id, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        let finalTaskId = taskId;

        try {
            const taskData = {
                subject: formData.subject,
                duration: parseInt(formData.duration || 0),
                exp_start_date: formData.start_date ? formData.start_date : null,
                exp_end_date: formData.end_date ? formData.end_date : null,
                delay_end: parseInt(formData.delay_end || 0),
                custom_labour_details: resources.labour,
                custom_machinery_details: resources.machinery,
                custom_material_details: resources.material,
                custom_concrete_details: resources.concrete,
            };

            if (taskId && taskId.startsWith("new-") && !isReadOnly) {
                const newDoc = await createTask("Task", taskData);
                if (newDoc && newDoc.name) {
                    finalTaskId = newDoc.name;
                }
            }
            else if (taskId && !isReadOnly) {
                await updateTask("Task", taskId, taskData);
                mutateTask();
            }
        } catch (e) {
            console.error("Failed to save/update task", e);
        }

        const updatedData = {
            ...formData,
            id: finalTaskId,
            text: formData.subject, // Map subject back to text for Gantt
            dependencies_json: JSON.stringify(predecessors),
            // Pass resources back to parent for storage/saving
            custom_labour_details: resources.labour,
            custom_machinery_details: resources.machinery,
            custom_material_details: resources.material,
            custom_concrete_details: resources.concrete,
            // link_id: finalTaskId // Not really used in simplified flow
        };

        const successorUpdates: Record<string, any> = {};
        const myId = task.id; // Item ID (name)

        if (myId) {
            const originalSuccessorsIds = new Set<string>();
            allTasks.forEach(t => {
                if (t.dependencies_json) {
                    try {
                        const deps = JSON.parse(t.dependencies_json);
                        if (deps.find((d: any) => d.predecessor === myId)) {
                            originalSuccessorsIds.add(t.id);
                        }
                    } catch (e) { }
                }
            });

            const currentSuccessorIds = new Set<string>();
            successors.forEach(s => {
                // s.task_id is the Item ID of the successor
                currentSuccessorIds.add(s.task_id);
            });

            // 1. Add/Update new successors
            successors.forEach(succ => {
                const succTask = allTasks.find(t => t.id === succ.task_id);
                if (!succTask) return;

                let deps = [];
                try { deps = JSON.parse(succTask.dependencies_json || "[]"); } catch (e) { }

                // Remove existing link to me (to update it)
                deps = deps.filter((d: any) => d.predecessor !== myId);

                // Add new link to me
                deps.push({
                    predecessor: myId,
                    type: succ.type,
                    lag: succ.lag
                });
                successorUpdates[succTask.id] = { dependencies_json: JSON.stringify(deps) };
            });

            // 2. Remove old successors
            originalSuccessorsIds.forEach((oldId: string) => {
                if (!currentSuccessorIds.has(oldId)) {
                    const succTask = allTasks.find(t => t.id === oldId);
                    if (succTask) {
                        let deps = [];
                        try { deps = JSON.parse(succTask.dependencies_json || "[]"); } catch (e) { }
                        const newDeps = deps.filter((d: any) => d.predecessor !== myId);
                        if (newDeps.length !== deps.length) {
                            successorUpdates[oldId] = { dependencies_json: JSON.stringify(newDeps) };
                        }
                    }
                }
            });
        }

        onSave(task.id, updatedData, successorUpdates);
        onClose();
    };

    // --- Resources Helpers (Enhanced) ---
    const updateResource = (type: 'labour' | 'machinery' | 'material' | 'concrete', index: number, field: string, value: any, extraData?: any) => {
        setResources(prev => {
            const updated = [...prev[type]];
            let updatedItem = { ...updated[index], [field]: value };

            // Auto-populate related fields if extraData is provided
            if (extraData) {
                if (type === 'labour') {
                    // updatedItem.rate = extraData.rate || 0; // Not in schema for Labour Count
                } else if (type === 'material') {
                    // updatedItem.item_group = extraData.item_group; 
                    updatedItem.unit = extraData.stock_uom;
                    updatedItem.planned_rate = extraData.valuation_rate || 0;
                } else if (type === 'machinery') {
                    // updatedItem.asset_category = extraData.asset_category;
                } else if (type === 'concrete') {
                    updatedItem.unit = extraData.stock_uom || "Nos";
                }
            }

            // Recalculate Totals
            if (type === 'material') {
                const qty = field === 'planned_qty' ? parseFloat(value) || 0 : parseFloat(updatedItem.planned_qty) || 0;
                const rate = field === 'planned_rate' ? parseFloat(value) || 0 : parseFloat(updatedItem.planned_rate) || 0;
                updatedItem.planned_amount = qty * rate;
            } else if (type === 'machinery') {
                const hours = field === 'planned_hours' ? parseFloat(value) || 0 : parseFloat(updatedItem.planned_hours) || 0;
                const rate = field === 'planned_rate_per_hr' ? parseFloat(value) || 0 : parseFloat(updatedItem.planned_rate_per_hr) || 0;
                updatedItem.planned_cost = hours * rate;
            } else if (type === 'concrete') {
                const qty = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(updatedItem.quantity) || 0;
                const rate = field === 'rate' ? parseFloat(value) || 0 : parseFloat(updatedItem.rate) || 0;
                updatedItem.amount = qty * rate;
            }

            // CRITICAL FIX: Ensure correct keys are used if not already (redundancy removed as we use correct keys now)

            updated[index] = updatedItem;
            return { ...prev, [type]: updated };
        });
    };

    const addResource = (type: 'labour' | 'machinery' | 'material' | 'concrete') => {
        setResources(prev => {
            let newItem: any = {};
            if (type === 'material') {
                newItem = { material_name: '', planned_qty: '1', unit: '', planned_rate: '0', planned_amount: 0 };
            } else if (type === 'concrete') {
                newItem = { item: '', quantity: 1, unit: '', rate: 0, amount: 0 };
            } else if (type === 'machinery') {
                newItem = { machinery_name: '', planned_hours: 1, planned_rate_per_hr: 0, planned_cost: 0 };
            } else {
                newItem = { labour_type: '', labour_count: 1, nature_of_work: '' };
            }
            return {
                ...prev,
                [type]: [...prev[type], newItem]
            }
        });
    };

    const removeResource = (type: 'labour' | 'machinery' | 'material' | 'concrete', index: number) => {
        setResources(prev => {
            const updated = [...prev[type]];
            updated.splice(index, 1);
            return { ...prev, [type]: updated };
        });
    };


    const renderResourceTable = (type: 'labour' | 'machinery' | 'material' | 'concrete', title: string, itemField: string, label: string, qtyField: string) => {
        let options: any[] = [];
        let extraFields: any[] = [];

        // Determine if planned resources should be read-only
        const arePlannedResourcesReadOnly = doctype === 'KB Operational Schedule';

        if (type === 'labour') {
            options = labourOptions;
            extraFields = [
                { key: 'nature_of_work', label: 'Nature of Work', editable: !arePlannedResourcesReadOnly, type: 'select', options: natureOfWorkOptions }
            ];
        } else if (type === 'machinery') {
            options = assetOptions;
            extraFields = [
                { key: 'planned_rate_per_hr', label: 'Rate/Hr', editable: !arePlannedResourcesReadOnly },
                { key: 'planned_cost', label: 'Cost', editable: false } // Read Only
            ];
        } else if (type === 'material') {
            options = itemOptions;
            extraFields = [
                { key: 'unit', label: 'Unit', editable: !arePlannedResourcesReadOnly },
                { key: 'planned_rate', label: 'Rate', editable: !arePlannedResourcesReadOnly },
                { key: 'planned_amount', label: 'Amount', editable: false } // Read Only
            ];
        } else if (type === 'concrete') {
            options = itemOptions; // Assuming concrete uses Item list logic
            extraFields = [
                { key: 'unit', label: 'UOM', editable: !arePlannedResourcesReadOnly },
                { key: 'rate', label: 'Rate', editable: !arePlannedResourcesReadOnly },
                { key: 'concrete_grade', label: 'Grade', editable: !arePlannedResourcesReadOnly, type: 'select', options: concreteGradeOptions },
                { key: 'amount', label: 'Amount', editable: false } // Read Only
            ];
        }

        return (
            <div className="space-y-4 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">{title}</Label>
                    {!isReadOnly && !arePlannedResourcesReadOnly && (
                        <Button size="sm" variant="outline" type="button" className="border-dashed" onClick={() => addResource(type)}>
                            <Plus className="h-4 w-4 mr-2" /> Add
                        </Button>
                    )}
                </div>

                <div className="border rounded-md overflow-hidden bg-white dark:bg-black">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[40%]">{label}</TableHead>
                                {extraFields.map((f: any) => (
                                    <TableHead key={f.key}>{f.label}</TableHead>
                                ))}
                                <TableHead className="w-[100px]">Qty</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {resources[type].length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={extraFields.length + 3} className="text-center text-muted-foreground py-8 italic">
                                        No {title.toLowerCase()} added.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                resources[type].map((item, index) => (
                                    <ResourceRow
                                        key={index}
                                        item={item}
                                        index={index}
                                        type={type}
                                        label={label}
                                        itemField={itemField}
                                        options={options}
                                        isReadOnly={isReadOnly}
                                        isQtyReadOnly={arePlannedResourcesReadOnly}
                                        updateResource={updateResource}
                                        removeResource={removeResource}
                                        extraFields={extraFields}
                                        qtyField={qtyField}
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    };

    // ...
    // Predecessors/Successors
    const updatePredecessor = (index: number, field: string, value: any) => {
        const newPreds = [...predecessors];
        newPreds[index] = { ...newPreds[index], [field]: value };
        setPredecessors(newPreds);
    };
    const removePredecessor = (index: number) => { setPredecessors(prev => { const n = [...prev]; n.splice(index, 1); return n; }); };
    const addPredecessor = () => setPredecessors(prev => [...prev, { predecessor: "", type: "FS", lag: 0 }]);

    const updateSuccessor = (index: number, field: string, value: any) => {
        const newSuccs = [...successors];
        newSuccs[index] = { ...newSuccs[index], [field]: value };
        setSuccessors(newSuccs);
    };
    const removeSuccessor = (index: number) => { setSuccessors(prev => { const n = [...prev]; n.splice(index, 1); return n; }); };
    const addSuccessor = () => setSuccessors(prev => [...prev, { task_id: "", type: "FS", lag: 0 }]);


    const renderDependencyTable = (items: any[], isSuccessor: boolean, updateFunc: any, removeFunc: any) => (
        <div className="border rounded-md overflow-hidden bg-white dark:bg-zinc-950">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead>Activity</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Lag (days)</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <select
                                    className="bg-transparent text-sm border rounded h-8 px-2 w-full max-w-[300px]"
                                    value={isSuccessor ? item.task_id : item.predecessor}
                                    onChange={(e) => updateFunc(index, isSuccessor ? "task_id" : "predecessor", e.target.value)}
                                    disabled={isReadOnly}
                                >
                                    <option value="" disabled>Select Activity</option>
                                    {allTasks.filter(t => t.id !== task?.id).map(t => (
                                        <option key={t.id} value={t.id}>{t.text || "Unknown"}</option>
                                    ))}
                                </select>
                            </TableCell>
                            <TableCell>
                                <select className="bg-transparent text-sm border rounded h-8 px-2" value={item.type || "FS"} onChange={(e) => updateFunc(index, "type", e.target.value)} disabled={isReadOnly}>
                                    <option value="FS">Finish-to-Start (FS)</option>
                                    <option value="SS">Start-to-Start (SS)</option>
                                    <option value="FF">Finish-to-Finish (FF)</option>
                                    <option value="SF">Start-to-Finish (SF)</option>
                                </select>
                            </TableCell>
                            <TableCell>
                                <Input type="number" value={item.lag || 0} onChange={(e) => updateFunc(index, "lag", e.target.value)} className="h-8 w-20" disabled={isReadOnly} />
                            </TableCell>
                            <TableCell>
                                {!isReadOnly && <Button variant="ghost" size="sm" type="button" onClick={() => removeFunc(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                            </TableCell>
                        </TableRow>
                    ))}
                    {items.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No links.</TableCell></TableRow>}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <RightSideModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Task: ${formData.subject || task?.text || "New Task"}`}
            footer={
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    {!isReadOnly && <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white"><Save className="h-4 w-4 mr-2" />Save Changes</Button>}
                </div>
            }
        >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                    <TabsTrigger value="predecessors">Preds</TabsTrigger>
                    <TabsTrigger value="successors">Succs</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                    <div className="flex flex-col gap-6 bg-white dark:bg-zinc-900 p-6 rounded-lg border">
                        <div className="space-y-2"><Label>Task Name</Label><Input name="subject" value={formData.subject || ""} onChange={handleChange} disabled={isReadOnly} /></div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2"><Label>Duration</Label><Input name="duration" type="number" value={formData.duration || 0} onChange={handleChange} disabled={isReadOnly} /></div>
                            <div className="space-y-2"><Label>Delay</Label><Input name="delay_end" type="number" value={formData.delay_end || 0} onChange={handleChange} disabled={isReadOnly} /></div>

                            {/* Conditional fields based on doctype */}
                            {doctype === 'KB Operational Schedule' ? (
                                <>
                                    <div className="space-y-2"><Label>Baseline Start (Read-only)</Label><Input name="baseline_start_date" type="date" value={formData.baseline_start_date || ""} onChange={handleChange} disabled={true} /></div>
                                    <div className="space-y-2"><Label>Baseline End (Read-only)</Label><Input name="baseline_end_date" type="date" value={formData.baseline_end_date || ""} onChange={handleChange} disabled={true} /></div>
                                    <div className="space-y-2"><Label>Start Date</Label><Input name="start_date" type="date" value={formData.start_date || ""} onChange={handleChange} disabled={isReadOnly} /></div>
                                    <div className="space-y-2"><Label>End Date</Label><Input name="end_date" type="date" value={formData.end_date || ""} onChange={handleChange} disabled={isReadOnly} /></div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2"><Label>Start</Label><Input name="start_date" type="date" value={formData.start_date || ""} onChange={handleChange} disabled={isReadOnly} /></div>
                                    <div className="space-y-2"><Label>Finish</Label><Input name="end_date" type="date" value={formData.end_date || ""} onChange={handleChange} disabled={isReadOnly} /></div>
                                </>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="resources" className="space-y-6">
                    <Tabs defaultValue="labour">
                        <TabsList className="grid w-full grid-cols-4 mb-4"><TabsTrigger value="labour">Labour</TabsTrigger><TabsTrigger value="machinery">Machinery</TabsTrigger><TabsTrigger value="material">Material</TabsTrigger><TabsTrigger value="concrete">Concrete</TabsTrigger></TabsList>
                        <TabsContent value="labour">{renderResourceTable('labour', 'Labour', 'labour_type', 'Labour Type', 'labour_count')}</TabsContent>
                        <TabsContent value="machinery">{renderResourceTable('machinery', 'Machinery', 'machinery_name', 'Machine', 'planned_hours')}</TabsContent>
                        <TabsContent value="material">{renderResourceTable('material', 'Material', 'material_name', 'Item', 'planned_qty')}</TabsContent>
                        <TabsContent value="concrete">{renderResourceTable('concrete', 'Concrete', 'item', 'Item', 'quantity')}</TabsContent>
                    </Tabs>
                </TabsContent>

                <TabsContent value="predecessors" className="space-y-4">
                    <div className="flex justify-between items-center"><h4 className="text-sm font-medium">Predecessors</h4>{!isReadOnly && <Button size="sm" variant="outline" onClick={addPredecessor}>Add</Button>}</div>
                    {renderDependencyTable(predecessors, false, updatePredecessor, removePredecessor)}
                </TabsContent>
                <TabsContent value="successors" className="space-y-4">
                    <div className="flex justify-between items-center"><h4 className="text-sm font-medium">Successors</h4>{!isReadOnly && <Button size="sm" variant="outline" onClick={addSuccessor}>Add</Button>}</div>
                    {renderDependencyTable(successors, true, updateSuccessor, removeSuccessor)}
                </TabsContent>
            </Tabs>
        </RightSideModal>
    );
};

export default TaskInformationModal;
