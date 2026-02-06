import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import type { PrintFormatSelectorProps } from '@/types/print';

export const PrintFormatSelector: React.FC<PrintFormatSelectorProps> = ({
    value,
    onChange,
    formats,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading formats...
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">Print Format</label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                    {formats.map((format) => (
                        <SelectItem key={format.name} value={format.name}>
                            {format.name}
                            {format.standard === 'Yes' && (
                                <span className="ml-2 text-xs text-muted-foreground">(Standard)</span>
                            )}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};
