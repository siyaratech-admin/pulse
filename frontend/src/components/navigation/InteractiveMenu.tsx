import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ChevronRight, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

export interface MenuItem {
    id: string;
    label: string;
    icon?: LucideIcon;
    link?: string;
    count?: number;
    badge?: string;
    children?: MenuItem[];
    description?: string;
    disabled?: boolean;
}

export interface MenuSection {
    title: string;
    icon?: LucideIcon;
    items: MenuItem[];
    collapsible?: boolean;
    defaultExpanded?: boolean;
}

interface InteractiveMenuProps {
    sections: MenuSection[];
    searchable?: boolean;
    className?: string;
}

export const InteractiveMenu: React.FC<InteractiveMenuProps> = ({
    sections,
    searchable = true,
    className,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(sections.filter(s => s.defaultExpanded !== false).map(s => s.title))
    );
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const navigate = useNavigate();

    const toggleSection = (title: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(title)) {
            newExpanded.delete(title);
        } else {
            newExpanded.add(title);
        }
        setExpandedSections(newExpanded);
    };

    const toggleItem = (id: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedItems(newExpanded);
    };

    const handleItemClick = (item: MenuItem) => {
        if (item.disabled) return;

        if (item.children && item.children.length > 0) {
            toggleItem(item.id);
        } else if (item.link) {
            navigate(item.link);
        }
    };

    const filterItems = (items: MenuItem[]): MenuItem[] => {
        if (!searchQuery) return items;

        return items.filter(item => {
            const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const hasMatchingChildren = item.children?.some(child =>
                child.label.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return matchesSearch || hasMatchingChildren;
        });
    };

    const renderMenuItem = (item: MenuItem, level: number = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.has(item.id);
        const Icon = item.icon;

        return (
            <div key={item.id} className={cn("select-none", level > 0 && "ml-4")}>
                <div
                    className={cn(
                        "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                        "hover:bg-accent",
                        item.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => handleItemClick(item)}
                >
                    {hasChildren && (
                        isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )
                    )}
                    {!hasChildren && <div className="w-4" />}

                    {Icon && <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />}

                    <span className="flex-1 text-sm font-medium">{item.label}</span>

                    {item.count !== undefined && (
                        <Badge variant="secondary" className="text-xs">
                            {item.count}
                        </Badge>
                    )}

                    {item.badge && (
                        <Badge className="text-xs">{item.badge}</Badge>
                    )}
                </div>

                {item.description && !hasChildren && (
                    <p className="text-xs text-muted-foreground ml-10 mt-1 mb-2">
                        {item.description}
                    </p>
                )}

                {hasChildren && isExpanded && (
                    <div className="mt-1">
                        {item.children!.map(child => renderMenuItem(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                {searchable && (
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {sections.map((section) => {
                    const SectionIcon = section.icon;
                    const isSectionExpanded = expandedSections.has(section.title);
                    const filteredItems = filterItems(section.items);

                    if (filteredItems.length === 0 && searchQuery) return null;

                    return (
                        <div key={section.title} className="space-y-2">
                            <div
                                className={cn(
                                    "flex items-center gap-2 cursor-pointer",
                                    section.collapsible && "hover:text-primary transition-colors"
                                )}
                                onClick={() => section.collapsible && toggleSection(section.title)}
                            >
                                {section.collapsible && (
                                    isSectionExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )
                                )}
                                {SectionIcon && <SectionIcon className="h-4 w-4" />}
                                <CardTitle className="text-sm font-semibold">{section.title}</CardTitle>
                            </div>

                            {(!section.collapsible || isSectionExpanded) && (
                                <div className="space-y-1">
                                    {filteredItems.map(item => renderMenuItem(item))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};
