import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Lock, ArrowRight, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

export interface WorkflowStep {
    step: number;
    title: string;
    description: string;
    doctype: string;
    action: string;
    dependency?: string;
    completed?: boolean;
    count?: number;
}

interface WorkflowCardProps {
    title: string;
    description: string;
    icon: type ;
    color: string;
    steps: WorkflowStep[];
    link?: string;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
    title,
    description,
    icon: Icon,
    color,
    steps,
    link,
}) => {
    const navigate = useNavigate();

    const completedSteps = steps.filter(s => s.completed).length;
    const totalSteps = steps.length;
    const progress = (completedSteps / totalSteps) * 100;

    // Find the next incomplete step
    const nextStep = steps.find(s => !s.completed);
    const canProceed = !nextStep?.dependency || steps.find(s => s.doctype === nextStep.dependency)?.completed;

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-3 rounded-lg", color)}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                    </div>
                    {link && (
                        <Button variant="ghost" size="sm" onClick={() => navigate(link)}>
                            View All
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{completedSteps}/{totalSteps} steps</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                        <div
                            className={cn("h-2 rounded-full transition-all", color.replace('text-', 'bg-'))}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-3">
                    {steps.map((step) => {
                        const isCompleted = step.completed;
                        const isNext = step === nextStep;
                        const isLocked = step.dependency && !steps.find(s => s.doctype === step.dependency)?.completed;

                        return (
                            <div
                                key={step.step}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg transition-colors",
                                    isNext && "bg-primary/5 border border-primary/20",
                                    isCompleted && "opacity-60"
                                )}
                            >
                                <div className="flex-shrink-0 mt-0.5">
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    ) : isLocked ? (
                                        <Lock className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className={cn(
                                            "font-medium text-sm",
                                            isCompleted && "line-through text-muted-foreground"
                                        )}>
                                            {step.title}
                                        </h4>
                                        {step.count !== undefined && step.count > 0 && (
                                            <Badge variant="secondary" className="text-xs">
                                                {step.count}
                                            </Badge>
                                        )}
                                        {isNext && (
                                            <Badge className="text-xs">Next</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {step.description}
                                    </p>
                                    {step.dependency && isLocked && (
                                        <p className="text-xs text-amber-600 mt-1">
                                            Requires: {step.dependency}
                                        </p>
                                    )}
                                </div>

                                <div className="flex-shrink-0">
                                    {isNext && canProceed && (
                                        <Button
                                            size="sm"
                                            onClick={() => navigate(step.action)}
                                        >
                                            Start
                                        </Button>
                                    )}
                                    {!isCompleted && !isNext && !isLocked && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => navigate(step.action)}
                                        >
                                            Go
                                        </Button>
                                    )}
                                    {isCompleted && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => navigate(step.action.replace('/new', ''))}
                                        >
                                            View
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
