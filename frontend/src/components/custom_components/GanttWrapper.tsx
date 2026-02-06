import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface GanttWrapperProps {
    tasks: {
        data: any[];
        links: any[];
    };
    onTaskUpdate?: (id: string, task: any) => void;
    onLinkAdd?: (link: any) => void;
    onLinkDelete?: (id: string) => void;
    onTaskDelete?: (id: string) => void;
    onTaskClick?: (id: string) => void;
    expandAll?: boolean;
    columns?: any[];
    enableTooltip?: boolean;
}

/**
 * Dynamic wrapper for Gantt component to avoid dhtmlx-gantt initialization issues
 * This component dynamically imports the Gantt component only after mount
 */
const GanttWrapper: React.FC<GanttWrapperProps> = (props) => {
    const [GanttComponent, setGanttComponent] = useState<React.ComponentType<any> | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Dynamically import the Gantt component after component mounts
        import('@/components/custom_components/Gantt')
            .then((module) => {
                setGanttComponent(() => module.default);
            })
            .catch((err) => {
                console.error('Failed to load Gantt component:', err);
                setError('Failed to load Gantt chart. Please refresh the page.');
            });
    }, []);

    if (error) {
        return (
            <div className="flex items-center justify-center h-96 text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    if (!GanttComponent) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading Gantt chart...</span>
            </div>
        );
    }

    return <GanttComponent {...props} />;
};

export default GanttWrapper;
