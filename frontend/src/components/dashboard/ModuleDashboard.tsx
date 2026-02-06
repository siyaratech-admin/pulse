import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from 'lucide-react';

interface ShortcutItem {
    label: string;
    link?: string;
    action?: () => void;
    count?: number | string;
    countLabel?: string;
    color?: string; // e.g., "bg-green-100 text-green-800"
}

interface SectionItem {
    label: string;
    link?: string;
    action?: () => void;
}

interface Section {
    title: string;
    items: SectionItem[];
}

interface ModuleDashboardProps {
    title: string;
    shortcuts: ShortcutItem[];
    sections: Section[];
}

export const ModuleDashboard: React.FC<ModuleDashboardProps> = ({ title, shortcuts, sections }) => {
    const navigate = useNavigate();

    const handleNavigation = (item: ShortcutItem | SectionItem) => {
        if (item.action) {
            item.action();
        } else if (item.link) {
            navigate(item.link);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 space-y-8">
            {/* Header */}
            {/* <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
            </div> */}

            {/* Shortcuts Section */}
            {shortcuts.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-600">Your Shortcuts</h2>
                    <div className="flex flex-wrap gap-4">
                        {shortcuts.map((shortcut, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                className="h-auto py-2 px-4 bg-white hover:bg-gray-50 border-gray-200 rounded-lg flex items-center gap-3 shadow-sm"
                                onClick={() => handleNavigation(shortcut)}
                            >
                                <span className="font-medium text-gray-700">{shortcut.label}</span>
                                <ArrowUpRight className="h-3 w-3 text-gray-400" />
                                {shortcut.count !== undefined && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${shortcut.color || 'bg-gray-100 text-gray-600'}`}>
                                        {shortcut.count} {shortcut.countLabel}
                                    </span>
                                )}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Masters & Reports Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-600">Masters & Reports</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sections.map((section, index) => (
                        <Card key={index} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold text-gray-800">
                                    {section.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {section.items.map((item, itemIndex) => (
                                        <li key={itemIndex}>
                                            <button
                                                onClick={() => handleNavigation(item)}
                                                className="group flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors w-full text-left"
                                            >
                                                <span className="group-hover:underline decoration-gray-300 underline-offset-4">
                                                    {item.label}
                                                </span>
                                                <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};
