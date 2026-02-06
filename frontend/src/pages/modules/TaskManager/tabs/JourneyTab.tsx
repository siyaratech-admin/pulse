import React, { useState, useMemo } from 'react';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { TaskJourney } from '../TaskJourney';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Map } from 'lucide-react';

export const JourneyTab: React.FC = () => {
    const [selectedTaskId, setSelectedTaskId] = useState<string>("");

    const { data: tasks, isLoading } = useFrappeGetDocList("Task", {
        fields: ["name", "subject", "status", "creation", "exp_end_date", "completed_on", "_assign"],
        limit: 100,
        orderBy: { field: "creation", order: "desc" }
    });

    const selectedTask = useMemo(() => {
        return tasks?.find(t => t.name === selectedTaskId) || tasks?.[0];
    }, [tasks, selectedTaskId]);

    // Update selectedTaskId if it's empty and tasks are loaded
    React.useEffect(() => {
        if (!selectedTaskId && tasks && tasks.length > 0) {
            setSelectedTaskId(tasks[0].name);
        }
    }, [tasks, selectedTaskId]);

    const journeyStages = useMemo(() => {
        if (!selectedTask) return [];

        const stages = [
            {
                id: 'created',
                label: 'Task Created',
                status: 'completed' as const,
                date: selectedTask.creation?.split(' ')[0],
                assignee: 'System'
            },
            {
                id: 'assigned',
                label: 'Assigned',
                status: selectedTask.status !== 'Open' ? 'completed' as const : 'current' as const,
                assignee: selectedTask._assign ? JSON.parse(selectedTask._assign).join(', ') : undefined
            },
            {
                id: 'in_progress',
                label: 'In Progress',
                status: ['Working', 'Pending Review', 'Overdue', 'Completed'].includes(selectedTask.status)
                    ? (selectedTask.status === 'Completed' ? 'completed' as const : 'current' as const)
                    : 'pending' as const,
            },
            {
                id: 'review',
                label: 'Pending Review',
                status: ['Pending Review', 'Completed'].includes(selectedTask.status)
                    ? (selectedTask.status === 'Completed' ? 'completed' as const : 'current' as const)
                    : 'pending' as const,
            },
            {
                id: 'completed',
                label: 'Completed',
                status: selectedTask.status === 'Completed' ? 'completed' as const : 'pending' as const,
                date: selectedTask.completed_on
            }
        ];

        return stages;
    }, [selectedTask]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!tasks || tasks.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Map className="h-12 w-12 mb-4 opacity-20" />
                    <p>No tasks found to visualize.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Task Lifecycle Journey</h3>
                    <p className="text-sm text-muted-foreground">Visualize the progress of your tasks from creation to completion.</p>
                </div>
                <div className="w-[300px]">
                    <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a task" />
                        </SelectTrigger>
                        <SelectContent>
                            {tasks.map(task => (
                                <SelectItem key={task.name} value={task.name}>
                                    {task.subject}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedTask && (
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <TaskJourney
                            stages={journeyStages}
                        />
                    </div>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Task Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Subject</label>
                                    <p className="text-sm font-medium">{selectedTask.subject}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                                    <p className="text-sm">{selectedTask.status}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Expected End Date</label>
                                    <p className="text-sm">{selectedTask.exp_end_date || 'Not set'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};
