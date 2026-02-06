import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskStage {
    id: string;
    label: string;
    status: 'completed' | 'current' | 'pending';
    date?: string;
    assignee?: string;
}

interface TaskJourneyProps {
    stages: TaskStage[];
}

export const TaskJourney: React.FC<TaskJourneyProps> = ({ stages }) => {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg font-medium">Task Journey</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

                    <div className="space-y-8 relative">
                        {stages.map((stage) => {
                            const isCompleted = stage.status === 'completed';
                            const isCurrent = stage.status === 'current';

                            return (
                                <div key={stage.id} className="flex gap-4 items-start group">
                                    {/* Icon/Status Indicator */}
                                    <div className={cn(
                                        "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 bg-background",
                                        isCompleted ? "border-primary text-primary" :
                                            isCurrent ? "border-primary ring-4 ring-primary/20 text-primary" :
                                                "border-muted text-muted-foreground"
                                    )}>
                                        {isCompleted ? (
                                            <CheckCircle2 className="h-6 w-6" />
                                        ) : isCurrent ? (
                                            <Clock className="h-6 w-6 animate-pulse" />
                                        ) : (
                                            <Circle className="h-6 w-6" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className={cn(
                                        "flex-1 pt-1.5 transition-opacity duration-200",
                                        stage.status === 'pending' && "opacity-60"
                                    )}>
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className={cn(
                                                "text-base font-semibold",
                                                isCurrent ? "text-primary" : "text-foreground"
                                            )}>
                                                {stage.label}
                                            </h4>
                                            {stage.date && (
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    {stage.date}
                                                </span>
                                            )}
                                        </div>

                                        {stage.assignee && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline" className="text-xs font-normal">
                                                    {stage.assignee}
                                                </Badge>
                                            </div>
                                        )}

                                        {isCurrent && (
                                            <div className="mt-3 flex items-center gap-2 text-sm text-primary font-medium">
                                                <span>In Progress</span>
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
