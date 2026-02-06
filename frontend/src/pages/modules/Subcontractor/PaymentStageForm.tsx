
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFrappeGetDoc, useFrappeCreateDoc, useFrappeUpdateDoc, useFrappePostCall } from "frappe-react-sdk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Re-using existing powerful field components
import { LinkField } from "@/components/form/fields/SelectionFields";
import { DateField } from "@/components/form/fields/DateTimeFields";

// Types based on DocType
interface PaymentStageItem {
    description: string;
    floor_to_floor_ht_m: number;
    area_sqft: number;
    percentage: number;
    amount: number;
    work_done_percentage: number;
    work_done_amount: number;
    holding_amount: number;
    bill_paid_amount: number;
    execution_task: string;
    holding_task: string;
}

interface PaymentStage {
    name_of_the_project: string;
    // New Fields
    payment_stage_name: string;
    name_of_the_sub_contractor: string;
    sub_contractor_name: string;
    date: string;
    payment_stage_type: string;
    payment_stage_type_name: string;
    rate: number;
    holding_percentage: number;
    payment_stage_items: PaymentStageItem[];
    total_area: number;
    total_bill_amount: number;
}

export const PaymentStageForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const isNew = !id || id === "new";

    // --- Data Fetching (if editing) ---
    const { data: existingDoc, isLoading: isLoadingDoc, mutate: reloadDoc } = useFrappeGetDoc(
        "KB Payment Stage",
        isNew ? null : id,
        isNew ? undefined : { limit: 0 } // Don't fetch if new
    );

    const { createDoc, loading: isCreating } = useFrappeCreateDoc();
    const { updateDoc, loading: isUpdating } = useFrappeUpdateDoc();
    const { call: getTaskDetails } = useFrappePostCall("frappe.client.get_value");

    // --- Form State ---
    const [formData, setFormData] = useState<PaymentStage>({
        name_of_the_project: "",
        payment_stage_name: "",
        name_of_the_sub_contractor: "",
        sub_contractor_name: "",
        date: new Date().toISOString().split('T')[0],
        payment_stage_type: "",
        payment_stage_type_name: "",
        rate: 0,
        holding_percentage: 5,
        payment_stage_items: [],
        total_area: 0,
        total_bill_amount: 0
    });

    // Initialize form data when doc loads
    useEffect(() => {
        if (existingDoc && !isNew) {
            setFormData({
                name_of_the_project: existingDoc.name_of_the_project,
                payment_stage_name: existingDoc.payment_stage_name,
                name_of_the_sub_contractor: existingDoc.name_of_the_sub_contractor,
                sub_contractor_name: existingDoc.sub_contractor_name,
                date: existingDoc.date,
                payment_stage_type: existingDoc.payment_stage_type,
                payment_stage_type_name: existingDoc.payment_stage_type_name,
                rate: existingDoc.rate,
                holding_percentage: existingDoc.holding_percentage,
                payment_stage_items: existingDoc.payment_stage_items || [],
                total_area: existingDoc.total_area,
                total_bill_amount: existingDoc.total_bill_amount
            });
        }
    }, [existingDoc, isNew]);

    // --- Calculations & Name Generation ---
    useEffect(() => {
        // 1. Calculate Total Area (Sum of all item areas)
        const totalArea = formData.payment_stage_items.reduce((acc, item) => acc + (item.area_sqft || 0), 0);

        // 2. Calculate Total Bill Amount (Total Area * Rate)
        const totalBillAmount = (formData.rate || 0) * totalArea;

        // 3. Update Child Items Calculations (Amount, Work Done, Holding, Paid)
        const holdingPercentage = formData.holding_percentage || 0;

        const updatedItems = formData.payment_stage_items.map(item => {
            // Amount = Total Bill Amount * (Percentage / 100)
            const amount = item.percentage ? (totalBillAmount * item.percentage / 100) : 0;

            // Work Done Amount = Amount * (Work Done % / 100)
            const workDoneAmount = item.work_done_percentage ? (amount * item.work_done_percentage / 100) : 0;

            // Holding Amount = Work Done Amount * (Holding % / 100)
            const holdingAmount = (workDoneAmount * holdingPercentage) / 100;

            // Bill Paid Amount = Work Done Amount - Holding Amount
            const billPaidAmount = workDoneAmount - holdingAmount;

            return {
                ...item,
                amount: amount,
                work_done_amount: workDoneAmount,
                holding_amount: holdingAmount,
                bill_paid_amount: billPaidAmount
            };
        });

        // 4. Generate Payment Stage Name
        // Logic: [Project, SubContractor, Type, Date].join(' - ')
        // Note: Using ID values for now as "names" since we don't have separate title fields fetched yet.
        // In real app, might want to fetch the 'titles' for project/subcon specifically.
        const stageNameParts = [
            formData.name_of_the_project,
            formData.name_of_the_sub_contractor, // Using ID as proxy for Name if unavailable
            formData.payment_stage_type, // Using ID/Type as proxy
            formData.date
        ].filter(Boolean);
        const generatedName = stageNameParts.join(' - ');


        // Only update state if something changed to avoid infinity loop
        const isItemsChanged = JSON.stringify(updatedItems) !== JSON.stringify(formData.payment_stage_items);
        const isTotalsChanged = totalArea !== formData.total_area || totalBillAmount !== formData.total_bill_amount;
        const isNameChanged = generatedName !== formData.payment_stage_name;

        if (isItemsChanged || isTotalsChanged || isNameChanged) {
            setFormData(prev => ({
                ...prev,
                payment_stage_items: updatedItems,
                total_area: totalArea,
                total_bill_amount: totalBillAmount,
                payment_stage_name: generatedName
            }));
        }

    }, [
        formData.rate,
        formData.holding_percentage,
        formData.payment_stage_items, // Be careful with this dependency
        // We need to check specific values that trigger this recalculation to avoid loop?
        // Actually, since we update 'payment_stage_items' inside, we MUST ensure we don't trigger if values are same.
        // The check `JSON.stringify(updatedItems) !== JSON.stringify(formData.payment_stage_items)` handles this.
        // Only problem is if `updatedItems` has floating point diffs that cause perpetual update.
        // Let's rely on primitive checks or deep equal for safety if needed, or just specific triggers.
        // Triggering on specific fields is safer but harder in React hook deps without separate states.
        // Let's trust strict equality check for now.
        // Actually adding `formData.payment_stage_items` here IS dangerous if we create new objects every time.
        // Better to depend on the *values* that drive the calculation:
        JSON.stringify(formData.payment_stage_items.map(i => ({ a: i.area_sqft, p: i.percentage, wdp: i.work_done_percentage }))),
        formData.name_of_the_project,
        formData.name_of_the_sub_contractor,
        formData.payment_stage_type,
        formData.date
    ]);

    // --- Handlers ---

    const handleHeaderChange = (field: keyof PaymentStage, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = async (index: number, field: keyof PaymentStageItem, value: any) => {
        setFormData(prev => {
            const items = [...prev.payment_stage_items];
            items[index] = { ...items[index], [field]: value };

            // Local Row Calculations
            const item = items[index];
            const rate = prev.rate || 0;

            if (field === "area_sqft" || field === "percentage" || field === "work_done_percentage") {
                // Should trigger effect
            }

            return { ...prev, payment_stage_items: items };
        });

        // Auto-fetch Task Description
        if (field === "execution_task" && value) {
            try {
                const res = await getTaskDetails({ doctype: "Task", fieldname: "description", name: value });
                if (res?.message?.description) {
                    // Update state carefully to avoid overwriting ongoing changes
                    setFormData(prev => {
                        const items = [...prev.payment_stage_items];
                        // Only update if the task is still the same (avoid race conditions)
                        if (items[index].execution_task === value) {
                            items[index] = { ...items[index], description: res.message.description };
                        }
                        return { ...prev, payment_stage_items: items };
                    });
                }
            } catch (e) {
                console.error("Failed to fetch task description", e);
            }
        }
    };


    // --- Render Loading State ---
    if (isLoadingDoc && !isNew) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    const handleAddRow = () => {
        setFormData(prev => ({
            ...prev,
            payment_stage_items: [
                ...prev.payment_stage_items,
                {
                    description: "",
                    floor_to_floor_ht_m: 0,
                    area_sqft: 0,
                    percentage: 100,
                    amount: 0,
                    work_done_percentage: 0,
                    work_done_amount: 0,
                    execution_task: "",
                    holding_task: "",
                    bill_paid_amount: 0,
                    holding_amount: 0
                }
            ]
        }));
    };

    const handleRemoveRow = (index: number) => {
        setFormData(prev => ({
            ...prev,
            payment_stage_items: prev.payment_stage_items.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const errors: string[] = [];

        if (!formData.name_of_the_project) errors.push("Project is required.");
        if (!formData.name_of_the_sub_contractor) errors.push("Sub Contractor is required.");
        if (!formData.payment_stage_type) errors.push("Payment Stage Type is required.");
        if (!formData.date) errors.push("Date is required.");
        if (formData.rate <= 0) errors.push("Rate must be greater than 0.");
        if (formData.holding_percentage < 0) errors.push("Holding Percentage cannot be negative.");

        if (formData.payment_stage_items.length === 0) {
            errors.push("At least one payment item is required.");
        }

        formData.payment_stage_items.forEach((item, idx) => {
            if (!item.execution_task) {
                errors.push(`Item #${idx + 1}: Execution Task is required.`);
            }
            if (item.area_sqft <= 0) {
                errors.push(`Item #${idx + 1}: Area must be greater than 0.`);
            }
            if (item.percentage < 0 || item.percentage > 100) {
                errors.push(`Item #${idx + 1}: Percentage must be between 0 and 100.`);
            }
        });

        return errors;
    };

    const handleSave = async () => {
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: validationErrors.join("\n"),
            });
            return;
        }

        try {
            // Re-calculate totals one last time before save
            const totalArea = formData.payment_stage_items.reduce((acc, i) => acc + (i.area_sqft || 0), 0);
            const totalBill = formData.payment_stage_items.reduce((acc, i) => acc + (i.amount || 0), 0);

            const payload = {
                ...formData,
                total_area: totalArea,
                total_bill_amount: totalBill
            };

            if (isNew) {
                const res = await createDoc("KB Payment Stage", payload);
                toast({ title: "Created", description: "Payment Stage created successfully." });
                navigate(`/subcontractor/payment-stages/${res.name}`);
            } else {
                await updateDoc("KB Payment Stage", id, payload);
                toast({ title: "Saved", description: "Payment Stage updated." });
                reloadDoc();
            }
        } catch (e: any) {
            console.error(e);
            toast({ variant: "destructive", title: "Error", description: e.message || "Failed to save." });
        }
    };

    if (isLoadingDoc && !isNew) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Custom Header */}
            <div className="border-b bg-white px-6 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-semibold">{isNew ? "New Payment Stage" : `Payment Stage: ${id}`}</h1>
                        <p className="text-sm text-gray-500">{formData.name_of_the_project || "Draft"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleSave} disabled={isCreating || isUpdating}>
                        {isCreating || isUpdating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* SECTION 1: Master Details */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Contract Details</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            {/* Mocking the field prop structure the LinkField expects */}
                            <LinkField
                                field={{ fieldname: "name_of_the_project", label: "Project", fieldtype: "Link", options: "Project", reqd: 1 }}
                                value={formData.name_of_the_project}
                                onChange={(val) => handleHeaderChange("name_of_the_project", val)}
                            />
                        </div>
                        <div className="space-y-1">
                            <LinkField
                                field={{ fieldname: "name_of_the_sub_contractor", label: "Sub Contractor", fieldtype: "Link", options: "Sub Contractor", reqd: 1 }}
                                value={formData.name_of_the_sub_contractor}
                                onChange={(val) => handleHeaderChange("name_of_the_sub_contractor", val)}
                            />
                        </div>
                        <div className="space-y-1">
                            <DateField
                                field={{ fieldname: "date", label: "Bill Date", fieldtype: "Date" }}
                                value={formData.date}
                                onChange={(val) => handleHeaderChange("date", val)}
                            />
                        </div>
                        <div className="space-y-1">
                            <LinkField
                                field={{ fieldname: "payment_stage_type", label: "Stage Type", fieldtype: "Link", options: "KB Payment Stage Type", reqd: 1 }}
                                value={formData.payment_stage_type}
                                onChange={(val) => handleHeaderChange("payment_stage_type", val)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Rate <span className="text-red-500">*</span></Label>
                            <Input
                                type="number"
                                min="0"
                                value={formData.rate}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (val < 0) return; // Prevent negative input
                                    handleHeaderChange("rate", val);
                                }}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Holding % <span className="text-red-500">*</span></Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.holding_percentage}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (val < 0 || val > 100) return; // Simple bounds check
                                    handleHeaderChange("holding_percentage", val);
                                }}
                            />
                        </div>

                        {/* Hidden/Read-only fields for completeness */}
                        <div className="space-y-1">
                            <Label className="text-gray-500">Stage Name (Auto)</Label>
                            <Input disabled value={formData.payment_stage_name} className="bg-gray-50" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-gray-500">Sub Contractor Name</Label>
                            <Input disabled value={formData.sub_contractor_name || formData.name_of_the_sub_contractor} className="bg-gray-50" />
                        </div>
                        <div className="space-y-1">
                            <Label>Total Area</Label>
                            <Input disabled value={formData.total_area?.toFixed(2)} className="bg-gray-100" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-auto overflow-x-auto pb-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Payment Items</CardTitle>
                        <Button variant="outline" size="sm" onClick={handleAddRow}>
                            <Plus className="h-4 w-4 mr-2" /> Add Item
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table className="w-full relative border-collapse">
                            <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                    <TableHead className="w-[50px] text-center font-semibold border-r border-gray-200">#</TableHead>
                                    <TableHead className="min-w-[220px] font-semibold border-r border-gray-200">Execution Task <span className="text-red-500">*</span></TableHead>
                                    <TableHead className="min-w-[250px] font-semibold border-r border-gray-200">Description</TableHead>
                                    <TableHead className="w-[100px] text-right font-semibold border-r border-gray-200">Floor Ht (m)</TableHead>
                                    <TableHead className="w-[100px] text-right font-semibold border-r border-gray-200">Area (Sqft)</TableHead>
                                    <TableHead className="w-[140px] text-right font-semibold border-r border-gray-200">%</TableHead>
                                    <TableHead className="w-[120px] text-right font-semibold bg-gray-50/50 border-r border-gray-200">Amount</TableHead>
                                    <TableHead className="w-[100px] text-right font-semibold border-r border-gray-200">Work Done %</TableHead>
                                    <TableHead className="w-[120px] text-right font-semibold bg-gray-50/50 border-r border-gray-200">Work Done Amt</TableHead>
                                    <TableHead className="w-[120px] text-right font-semibold bg-gray-50/50 border-r border-gray-200">Holding Amt</TableHead>
                                    <TableHead className="min-w-[200px] font-semibold border-r border-gray-200">Holding Task</TableHead>
                                    <TableHead className="w-[120px] text-right font-semibold bg-gray-50/50 border-r border-gray-200">Bill Paid Amt</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {formData.payment_stage_items.map((item, idx) => (
                                    <TableRow key={idx} className="hover:bg-gray-50/20">
                                        <TableCell className="text-center font-medium text-gray-500 border-r border-gray-200">{idx + 1}</TableCell>
                                        <TableCell className="border-r border-gray-200">
                                            <LinkField
                                                field={{
                                                    fieldname: `exec_task_${idx}`,
                                                    label: "",
                                                    fieldtype: "Link",
                                                    options: "Task",
                                                    reqd: 0
                                                }}
                                                filters={formData.name_of_the_project ? { project: formData.name_of_the_project } : undefined}
                                                value={item.execution_task}
                                                onChange={(val) => handleItemChange(idx, "execution_task", val)}
                                            />
                                        </TableCell>
                                        <TableCell className="border-r border-gray-200">
                                            <Textarea
                                                value={item.description}
                                                onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                                                className="border-0 shadow-none focus-visible:ring-1 min-h-[32px] h-auto resize-none px-2 py-1 leading-normal"
                                                placeholder="Description"
                                                rows={1}
                                                onInput={(e) => {
                                                    const target = e.target as HTMLTextAreaElement;
                                                    target.style.height = "auto";
                                                    target.style.height = `${target.scrollHeight}px`;
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell className="border-r border-gray-200">
                                            <Input
                                                type="number"
                                                value={item.floor_to_floor_ht_m}
                                                onChange={(e) => handleItemChange(idx, "floor_to_floor_ht_m", parseFloat(e.target.value))}
                                                className="border-0 shadow-none focus-visible:ring-1 h-8 text-right px-2"
                                                min="0"
                                            />
                                        </TableCell>
                                        <TableCell className="border-r border-gray-200">
                                            <Input
                                                type="number"
                                                value={item.area_sqft}
                                                onChange={(e) => handleItemChange(idx, "area_sqft", parseFloat(e.target.value))}
                                                className="border-0 shadow-none focus-visible:ring-1 h-8 text-right px-2"
                                                min="0"
                                            />
                                        </TableCell>
                                        <TableCell className="border-r border-gray-200">
                                            <Input
                                                type="number"
                                                value={item.percentage}
                                                onChange={(e) => handleItemChange(idx, "percentage", parseFloat(e.target.value))}
                                                className="border-0 shadow-none focus-visible:ring-1 h-8 text-right px-2"
                                                min="0"
                                                max="100"
                                            />
                                        </TableCell>
                                        <TableCell className="bg-gray-50/40 p-0 border-r border-gray-200">
                                            <div className="px-4 py-2 text-right font-medium text-gray-700">
                                                {item.amount?.toFixed(2)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="border-r border-gray-200">
                                            <Input
                                                type="number"
                                                value={item.work_done_percentage}
                                                onChange={(e) => handleItemChange(idx, "work_done_percentage", parseFloat(e.target.value))}
                                                className="border-0 shadow-none focus-visible:ring-1 h-8 text-right px-2"
                                                min="0"
                                                max="100"
                                            />
                                        </TableCell>
                                        <TableCell className="bg-gray-50/40 p-0 border-r border-gray-200">
                                            <div className="px-4 py-2 text-right font-medium text-gray-700">
                                                {item.work_done_amount?.toFixed(2)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="bg-gray-50/40 p-0 border-r border-gray-200">
                                            <div className="px-4 py-2 text-right font-medium text-gray-700">
                                                {item.holding_amount?.toFixed(2)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="border-r border-gray-200">
                                            <LinkField
                                                field={{
                                                    fieldname: `hold_task_${idx}`,
                                                    label: "",
                                                    fieldtype: "Link",
                                                    options: "Task",
                                                    reqd: 0
                                                }}
                                                filters={formData.name_of_the_project ? { project: formData.name_of_the_project } : undefined}
                                                value={item.holding_task}
                                                onChange={(val) => handleItemChange(idx, "holding_task", val)}
                                            />
                                        </TableCell>
                                        <TableCell className="bg-gray-50/40 p-0 border-r border-gray-200">
                                            <div className="px-4 py-2 text-right font-bold text-gray-900">
                                                {item.bill_paid_amount?.toFixed(2)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleRemoveRow(idx)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {formData.payment_stage_items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={13} className="text-center py-8 text-gray-500">
                                            No items added. Click "Add Item" to start.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* SECTION 3: Summary */}
                <div className="flex justify-end">
                    <Card className="w-[300px]">
                        <CardContent className="p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total Area</span>
                                <span className="font-medium">{formData.total_area?.toFixed(2) || 0} Sqft</span>
                            </div>
                            <div className="border-t my-2" />
                            <div className="flex justify-between text-base font-bold">
                                <span>Total Bill</span>
                                <span>₹ {formData.total_bill_amount?.toLocaleString() || 0}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default PaymentStageForm;
