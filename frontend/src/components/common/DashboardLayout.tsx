import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { WorkflowNode } from "@/components/hrms/WorkflowTree";
import { Settings, ChevronRight, Menu, X, ChevronLeft } from "lucide-react";
import { StandardHeader } from "@/components/common/StandardHeader";

interface DashboardLayoutProps {
    title: string;
    subtitle?: string;
    icon?: string | React.ReactNode;
    stats?: React.ReactNode;
    children: React.ReactNode;
    modules?: WorkflowNode[];
    hideSidebar?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    title,
    subtitle,
    icon,
    stats,
    children,
    modules = [],
    hideSidebar = false
}) => {
    const navigate = useNavigate();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isQuickActionsCollapsed, setIsQuickActionsCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-yellow-50 flex flex-col">
            {/* Header */}
            <StandardHeader title={title} subtitle={subtitle} icon={icon} />

            <div className="flex-1 p-3 sm:p-4 md:p-6">
                <div className="flex flex-col xl:flex-row gap-4 md:gap-6">
                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0 space-y-4 md:space-y-6">
                        {/* Stats Section */}
                        {stats && (
                            <div className="w-full">{stats}</div>
                        )}

                        {/* Charts & Other Content - Centered on Mobile */}
                        <div className="w-full flex flex-col items-center">
                            <div className="w-full max-w-full">
                                {children}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Quick Actions Button */}
                    {!hideSidebar && modules && modules.length > 0 && (
                        <Button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="xl:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white z-40"
                            size="icon"
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                    )}

                    {/* Desktop Sidebar - Hidden on mobile */}
                    {!hideSidebar && modules && modules.length > 0 && (
                        <div className={cn(
                            "hidden xl:block flex-shrink-0 transition-all duration-300",
                            isQuickActionsCollapsed ? "w-16" : "w-80"
                        )}>
                            <Card className={cn(
                                "h-[calc(100vh-8rem)] border-2 border-orange-400 shadow-lg rounded-2xl sticky top-6 bg-white flex flex-col transition-all duration-300 overflow-hidden",
                                isQuickActionsCollapsed && "items-center"
                            )}>
                                {/* Orange accent strip */}
                                <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2"></div>

                                <CardHeader className={cn(
                                    "pb-4 border-b border-orange-100 transition-all duration-300",
                                    isQuickActionsCollapsed ? "p-3" : "px-4 py-3"
                                )}>
                                    <div className="flex items-center justify-between">
                                        {!isQuickActionsCollapsed && (
                                            <div className="flex-1">
                                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                                                    <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                                                        <Settings className="h-5 w-5 text-orange-600" />
                                                    </div>
                                                    Quick Actions
                                                </CardTitle>
                                                <CardDescription className="text-xs text-gray-600 mt-1">Navigate to modules</CardDescription>
                                            </div>
                                        )}
                                        {isQuickActionsCollapsed && (
                                            <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                                                <Settings className="h-5 w-5 text-orange-600" />
                                            </div>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsQuickActionsCollapsed(!isQuickActionsCollapsed)}
                                            className={cn(
                                                "h-8 w-8 hover:bg-orange-50 transition-transform duration-300 text-orange-600",
                                                !isQuickActionsCollapsed && "ml-2"
                                            )}
                                            title={isQuickActionsCollapsed ? "Expand Quick Actions" : "Collapse Quick Actions"}
                                        >
                                            <ChevronLeft className={cn(
                                                "h-4 w-4 transition-transform duration-300",
                                                isQuickActionsCollapsed && "rotate-180"
                                            )} />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 flex-1 min-h-0">
                                    <ScrollArea className="h-full">
                                        <div className={cn(
                                            "transition-all duration-300",
                                            isQuickActionsCollapsed ? "p-2" : "p-3"
                                        )}>
                                            {isQuickActionsCollapsed ? (
                                                // Collapsed view - show only icons
                                                <div className="flex flex-col gap-2">
                                                    {modules.map((module) => (
                                                        <Button
                                                            key={module.id}
                                                            variant="ghost"
                                                            size="icon"
                                                            className={cn(
                                                                "w-12 h-12 rounded-lg transition-all duration-200",
                                                                "hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50",
                                                                "text-gray-600 hover:text-orange-600 border border-transparent hover:border-orange-200"
                                                            )}
                                                            onClick={() => navigate(module.route)}
                                                            title={module.label}
                                                        >
                                                            {React.isValidElement(module.icon) &&
                                                                React.cloneElement(module.icon as React.ReactElement<any>, {
                                                                    className: "h-5 w-5"
                                                                })}
                                                        </Button>
                                                    ))}
                                                </div>
                                            ) : (
                                                // Expanded view - show full accordion
                                                <Accordion type="single" collapsible className="w-full space-y-2">
                                                    {modules.map((module) => (
                                                        <AccordionItem
                                                            key={module.id}
                                                            value={module.id}
                                                            className="border-0 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-orange-200"
                                                        >
                                                            <AccordionTrigger
                                                                className={cn(
                                                                    "hover:no-underline py-3 px-4 rounded-lg transition-all duration-200 group",
                                                                    "hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50",
                                                                    "data-[state=open]:bg-gradient-to-r data-[state=open]:from-orange-50 data-[state=open]:to-amber-50"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-3 text-left w-full">
                                                                    <div
                                                                        className={cn(
                                                                            "p-2 rounded-md transition-all duration-200 shadow-sm",
                                                                            "bg-white border border-orange-100",
                                                                            "group-hover:border-orange-300 group-hover:shadow-md group-hover:scale-110",
                                                                            "text-gray-600 group-hover:text-orange-600"
                                                                        )}
                                                                    >
                                                                        {React.isValidElement(module.icon) &&
                                                                            React.cloneElement(module.icon as React.ReactElement<any>, {
                                                                                className: "h-4 w-4"
                                                                            })}
                                                                    </div>
                                                                    <div className="flex flex-col flex-1">
                                                                        <span className="font-semibold text-sm text-gray-700 group-hover:text-orange-600 transition-colors">
                                                                            {module.label}
                                                                        </span>
                                                                        {module.description && (
                                                                            <span className="text-xs text-gray-600 font-normal line-clamp-1">
                                                                                {module.description}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent className="pb-3 pt-2 px-4">
                                                                <div className="flex flex-col gap-1.5 pl-4 border-l-2 border-orange-300 ml-4 mt-2">
                                                                    {module.children?.map((child) => (
                                                                        <Button
                                                                            key={child.id}
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className={cn(
                                                                                "justify-start h-9 px-3 text-gray-600 font-normal w-full rounded-md",
                                                                                "hover:text-orange-600 hover:bg-orange-50 hover:pl-4 transition-all duration-200"
                                                                            )}
                                                                            onClick={() => navigate(child.route)}
                                                                        >
                                                                            <span className="truncate text-sm">{child.label}</span>
                                                                            {child.doctype && (
                                                                                <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-30 group-hover:opacity-100 transition-opacity" />
                                                                            )}
                                                                        </Button>
                                                                    ))}
                                                                    {(!module.children || module.children.length === 0) && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="justify-start h-9 px-3 text-gray-600 hover:text-orange-600 hover:bg-orange-50 w-full rounded-md"
                                                                            onClick={() => navigate(module.route)}
                                                                        >
                                                                            Open {module.label}
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    ))}
                                                </Accordion>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Mobile Sidebar - Slides in from right */}
                    {!hideSidebar && modules && modules.length > 0 && (
                        <>
                            {/* Overlay */}
                            {isMobileSidebarOpen && (
                                <div
                                    className="xl:hidden fixed inset-0 bg-black/50 z-50 animate-in fade-in"
                                    onClick={() => setIsMobileSidebarOpen(false)}
                                />
                            )}

                            {/* Mobile Sidebar */}
                            <div
                                className={cn(
                                    "xl:hidden fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl",
                                    "transform transition-transform duration-300 ease-in-out flex flex-col",
                                    isMobileSidebarOpen ? "translate-x-0" : "translate-x-full"
                                )}
                            >
                                {/* Orange accent strip */}
                                <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2"></div>

                                {/* Mobile Header */}
                                <div className="flex items-center justify-between p-4 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-white rounded-lg shadow-sm border border-orange-100">
                                            <Settings className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
                                            <p className="text-xs text-gray-600">Navigate to modules</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsMobileSidebarOpen(false)}
                                        className="h-9 w-9 hover:bg-white text-orange-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>

                                {/* Mobile Content - Scrollable */}
                                <div className="flex-1 overflow-y-auto bg-gradient-to-br from-orange-50/20 via-white to-amber-50/20">
                                    <div className="p-4">
                                        <Accordion type="single" collapsible className="w-full space-y-3">
                                            {modules.map((module) => (
                                                <AccordionItem
                                                    key={module.id}
                                                    value={module.id}
                                                    className="border-0 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-orange-200"
                                                >
                                                    <AccordionTrigger
                                                        className={cn(
                                                            "hover:no-underline py-4 px-4 rounded-xl transition-all duration-200 group",
                                                            "hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50",
                                                            "data-[state=open]:bg-gradient-to-r data-[state=open]:from-orange-50 data-[state=open]:to-amber-50"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-4 text-left w-full">
                                                            <div
                                                                className={cn(
                                                                    "p-3 rounded-xl transition-all duration-200 shadow-sm",
                                                                    "bg-white border border-orange-100",
                                                                    "group-hover:border-orange-300 group-hover:shadow-md group-hover:scale-110",
                                                                    "text-gray-600 group-hover:text-orange-600"
                                                                )}
                                                            >
                                                                {React.isValidElement(module.icon) &&
                                                                    React.cloneElement(module.icon as React.ReactElement<any>, {
                                                                        className: "h-5 w-5"
                                                                    })}
                                                            </div>
                                                            <div className="flex flex-col flex-1">
                                                                <span className="font-semibold text-base text-gray-700 group-hover:text-orange-600 transition-colors">
                                                                    {module.label}
                                                                </span>
                                                                {module.description && (
                                                                    <span className="text-xs text-gray-600 font-normal line-clamp-1 mt-0.5">
                                                                        {module.description}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="pb-4 pt-2 px-4">
                                                        <div className="flex flex-col gap-2 pl-5 border-l-2 border-orange-300 ml-5 mt-2">
                                                            {module.children?.map((child) => (
                                                                <Button
                                                                    key={child.id}
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className={cn(
                                                                        "justify-start h-10 px-4 text-gray-600 font-normal w-full rounded-lg",
                                                                        "hover:text-orange-600 hover:bg-orange-50 hover:pl-5 transition-all duration-200",
                                                                        "active:scale-95"
                                                                    )}
                                                                    onClick={() => {
                                                                        navigate(child.route);
                                                                        setIsMobileSidebarOpen(false);
                                                                    }}
                                                                >
                                                                    <span className="truncate text-sm">{child.label}</span>
                                                                    {child.doctype && (
                                                                        <ChevronRight className="ml-auto h-4 w-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                                                                    )}
                                                                </Button>
                                                            ))}
                                                            {(!module.children || module.children.length === 0) && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="justify-start h-10 px-4 text-gray-600 hover:text-orange-600 hover:bg-orange-50 w-full rounded-lg"
                                                                    onClick={() => {
                                                                        navigate(module.route);
                                                                        setIsMobileSidebarOpen(false);
                                                                    }}
                                                                >
                                                                    Open {module.label}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #fff7ed;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #f97316, #fb923c);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #ea580c, #f97316);
                }
            `}</style>
        </div>
    );
};

export default DashboardLayout;