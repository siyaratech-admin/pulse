
import { useState, useEffect } from 'react';
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

interface ChecklistItem {
    skill: string;
    checklist_name: string;
    completed: number;
}

interface DailyChecklistResponse {
    exists: boolean;
    items: ChecklistItem[];
}

export function MyTodoTab() {
    const [date, setDate] = useState<Date>(new Date());
    const [items, setItems] = useState<ChecklistItem[]>([]);

    // Fetch checklist
    const { data, isLoading, mutate } = useFrappeGetCall<DailyChecklistResponse>(
        'kb_task.api.todo_api.get_daily_checklist',
        { date: format(date, 'yyyy-MM-dd') },
        'daily_checklist' // Cache key
    );

    // Update local state when data changes
    useEffect(() => {
        // Handle standard Frappe response wrapping
        const responseData = data as any;
        if (responseData?.message?.items) {
            setItems(responseData.message.items);
        } else if (data?.items) {
            setItems(data.items);
        } else if (Array.isArray(data)) {
            setItems(data as any);
        } else {
            setItems([]);
        }
    }, [data]);

    // Toggle item mutation
    const { call: toggleItem } = useFrappePostCall('kb_task.api.todo_api.toggle_checklist_item');

    // Sync checklist mutation
    const { call: syncChecklist, loading: isSyncing } = useFrappePostCall('kb_task.api.todo_api.get_daily_checklist');

    const handleToggle = async (skill: string, currentStatus: number) => {
        const newStatus = currentStatus === 1 ? 0 : 1;


        // Optimistic update
        setItems(prev => prev.map(item =>
            item.skill === skill ? { ...item, completed: newStatus } : item
        ));

        try {
            await toggleItem({
                date: format(date, 'yyyy-MM-dd'),
                skill: skill,
                status: newStatus
            });
            // We don't need to mutate/refetch if the API returns the updated list, 
            // but for safety we can, or just trust the optimistic update + eventual consistency.
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
            // Revert optimistic update
            setItems(prev => prev.map(item =>
                item.skill === skill ? { ...item, completed: currentStatus } : item
            ));
        }
    };

    const completedCount = items.filter(i => i.completed).length;
    const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">My Daily Checklist</h3>
                    <p className="text-sm text-gray-500">Track your daily required skills and tasks</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => mutate()} // Normal refresh
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </Button>
                    <Button
                        size="sm"
                        disabled={isSyncing}
                        onClick={() => {
                            const promise = syncChecklist({
                                date: format(date, 'yyyy-MM-dd'),
                                sync: true
                            }).then((r: any) => {
                                if (r && r.items) {
                                    setItems(r.items)
                                    mutate()
                                } else if (r && r.message && r.message.items) {
                                    setItems(r.message.items)
                                    mutate()
                                }
                            });

                            toast.promise(promise, {
                                loading: 'Syncing checklist...',
                                success: 'Checklist updated',
                                error: 'Failed to sync'
                            });
                        }}
                        className="bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-700 hover:to-blue-600 flex items-center justify-center"
                    >
                        {isSyncing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Generate / Sync
                    </Button>


                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => d && setDate(d)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Progress Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Daily Progress</span>
                    <span className="text-sm font-bold text-gray-900">{progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-brand-purple transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                {isLoading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No checklist items found for your designation.
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.skill}
                            className={cn(
                                "p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer group",
                                item.completed && "bg-gray-50/50"
                            )}
                            onClick={() => handleToggle(item.skill, item.completed)}
                        >
                            <button
                                className={cn(
                                    "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                    item.completed
                                        ? "bg-green-500 border-green-500 text-white"
                                        : "border-gray-300 text-transparent group-hover:border-brand-purple"
                                )}
                            >
                                <CheckCircle2 className="h-4 w-4" />
                            </button>

                            <div className="flex-1">
                                <p className={cn(
                                    "font-medium text-gray-900 transition-all",
                                    item.completed && "text-gray-500 line-through"
                                )}>
                                    {item.checklist_name || item.skill}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
