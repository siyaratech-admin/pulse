import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export interface DashboardStat {
    title: string
    value: string | number
    subValue?: string
    icon?: React.ReactNode | string // Can be a component or image URL
    color?: string // text color class for value
}

export interface DashboardTab {
    value: string
    label: string
    content: React.ReactNode
}

interface HRMSDashboardLayoutProps {
    title: string
    description: string
    headerIcon?: string // URL for the header image
    stats?: DashboardStat[]
    tabs: DashboardTab[]
    defaultTab?: string
}

const HRMSDashboardLayout: React.FC<HRMSDashboardLayoutProps> = ({
    title,
    description,
    headerIcon,
    stats,
    tabs,
    defaultTab,
}) => {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value || "overview")

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="relative flex items-center justify-between bg-gradient-to-r from-blue-700 to-teal-500 text-white shadow-md shrink-0">
                <div className="p-6">
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    <p className="text-white/80 mt-1 text-lg">{description}</p>
                </div>
                {headerIcon && (
                    <img src={headerIcon} alt="Header Icon" className="h-32 w-auto p-4 object-contain opacity-90" />
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Stats Grid */}
                {stats && stats.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat, index) => (
                            <Card key={index} className="relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow border-border/60">
                                {typeof stat.icon === "string" ? (
                                    <img
                                        src={stat.icon}
                                        alt={stat.title}
                                        className="absolute right-4 top-4 h-16 w-16 object-contain opacity-10"
                                    />
                                ) : (
                                    <div className="absolute right-4 top-4 opacity-10 text-foreground">
                                        {stat.icon}
                                    </div>
                                )}
                                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="relative z-10 pt-0">
                                    <div className="flex flex-col gap-1">
                                        <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
                                        {stat.subValue && (
                                            <p className="text-xs text-muted-foreground">{stat.subValue}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                {tabs && tabs.length > 0 && (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-lg overflow-x-auto flex-nowrap">
                            {tabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="flex-1 min-w-[100px] py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {tabs.map((tab) => (
                            <TabsContent key={tab.value} value={tab.value} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {tab.content}
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </div>
        </div>
    )
}

export default HRMSDashboardLayout
