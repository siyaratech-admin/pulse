"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
    Calendar,
    Ruler,
    DollarSign,
    Calculator,
    FileText,
    TrendingUp,
    ClipboardList,
    Plus,
    LayoutGrid,
    BarChart3,
    ChevronRight,
    FolderKanban,
    CheckCircle,
    Clock,
    AlertCircle,
    ListTodo,
    ArrowUpRight,
    Activity,
} from "lucide-react"
import { useFrappeGetDocList } from 'frappe-react-sdk'
// import { planningModules } from "@/components/hrms/WorkflowTree"
import SCurveChart from "./SCurveChart"
import DashboardLayout from "@/components/common/DashboardLayout"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"

// Planning module structure
const planningModulesStructure = [
    {
        id: 'project-planning',
        label: 'Project Planning',
        // route: '/planning',
        icon: ClipboardList,


        gradient: '', // removed
        borderColor: 'border-t-purple-500',

        children: [
            {
                id: 'concrete-measurement',
                label: 'Measurement',
                route: '/planning/concrete-measurement',
                icon: Ruler,
                doctype: 'KB Concreteand Shuttering Measurement'
            },
            {
                id: 'client-baseline',
                label: 'Client Baseline',
                route: '/planning/client-baseline',
                icon: Calendar,
                doctype: 'KB Client Baseline'
            },
            {
                id: 'operational-schedule',
                label: 'Operational Schedule',
                route: '/planning/operational-schedule',
                icon: Calendar,
                doctype: 'KB Operational Schedule'
            }
        ]
    },
    {
        id: 'budgeting-estimation',
        label: 'Budgeting & Estimation',
        // route: '/planning/budgeting',
        icon: DollarSign,


        gradient: '', // removed
        borderColor: 'border-t-orange-500',

        children: [
            {
                id: 'planned-budget',
                label: 'Planned Budget',
                route: '/planning/planned-budget',
                icon: DollarSign,
                doctype: 'KB Client Baseline'
            },
            {
                id: 'rate-analysis',
                label: 'Rate Analysis',
                route: '/planning/rate-analysis',
                icon: Calculator,
                doctype: 'Rate Analysis'
            },
            {
                id: 'quotation',
                label: 'Quotation',
                route: '/planning/quotation',
                icon: FileText,
                doctype: 'Quotation'
            }
        ]
    },
    {
        id: 'work-analysis',
        label: 'Work Analysis',
        // route: '/planning/analysis',
        icon: TrendingUp,
        color: 'bg-purple-500 hover:bg-purple-600',
        gradient: 'from-purple-500 to-purple-600',
        borderColor: 'border-t-purple-500',
        children: [
            {
                id: 'work-details',
                label: 'Work Details',
                route: '/planning/work-details',
                icon: FileText,
                doctype: 'Work Details'
            },
            {
                id: 'kb-work-analysis',
                label: 'KB Work Analysis',
                route: '/planning/work-analysis',
                icon: TrendingUp,
                doctype: 'KB Work Analysis'
            }
        ]
    }
];

const PlanningDashboard: React.FC = () => {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("overview")
    const [selectedProject, setSelectedProject] = useState<string>("")

    // Fetch Projects
    const { data: projects } = useFrappeGetDocList("Project", {
        fields: ["name", "project_name", "status", "expected_start_date", "expected_end_date"],
        filters: [["status", "=", "Open"]],
        limit: 1000
    })


    // Fetch Measurements
    const { data: measurements } = useFrappeGetDocList("KB Concreteand Shuttering Measurement", {
        fields: ["name", "project", "measurement_date", "status", "modified"],
        limit: 1000
    })

    // Fetch Client Baselines (Planned Budgets)
    const { data: clientBaselines } = useFrappeGetDocList("KB Client Baseline", {
        fields: ["name", "project", "total_amount", "status", "creation"],
        limit: 1000
    })

    // Fetch Operational Schedules (Open Quotations)
    const { data: operationalSchedules } = useFrappeGetDocList("KB Operational Schedule", {
        fields: ["name", "project", "status", "creation"],
        limit: 1000
    })

    // Calculate counts
    const measurementCount = measurements?.length || 0
    const budgetCount = clientBaselines?.length || 0
    const quotationCount = operationalSchedules?.length || 0


    const recentMeasurements = useMemo(() => {
        if (!measurements) return []
        return [...measurements]
            .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
            .slice(0, 5)
    }, [measurements])

    // Calculate stats
    const planningStats = useMemo(() => {
        const totalProjects = projects?.length || 0
        const activeProjects = projects?.filter(p => p.status === 'Open').length || 0

        return {
            totalProjects,
            activeProjects,
            totalBudget: clientBaselines?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0,
            avgBudgetPerProject: clientBaselines?.length ?
                (clientBaselines.reduce((sum, b) => sum + (b.total_amount || 0), 0) / clientBaselines.length) : 0
        }
    }, [projects, clientBaselines])

    // Quick action buttons
    const quickActions = [
        {
            label: "Create Budget",
            icon: DollarSign,
            action: () => navigate("/planning/client-baseline"),
            variant: "outline" as const,
            badge: budgetCount,
        },
        {
            label: "View Projects",
            icon: FolderKanban,
            action: () => navigate("/projects"),
            variant: "outline" as const,
            badge: planningStats.activeProjects,
        },
    ]

    const stats = (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {/* Measurements Card */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-green-500">
                <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-green-50/50 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">
                        Measurements
                    </CardTitle>
                    <div className="p-2.5 rounded-xl bg-green-600 shadow-md shadow-green-200">
                        <Ruler className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-green-700">
                        {measurementCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Recorded measurements</p>
                </CardContent>
            </Card>

            {/* Planned Budgets Card */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-purple-500">
                <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-purple-50/50 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">
                        Planned Budgets
                    </CardTitle>
                    <div className="p-2.5 rounded-xl bg-purple-600 shadow-md shadow-purple-200">
                        <DollarSign className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-purple-700">
                        {budgetCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Client baselines</p>
                </CardContent>
            </Card>

            {/* Open Quotations Card */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-t-4 border-t-orange-500">
                <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-orange-50/50 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">
                        Operational Schedules
                    </CardTitle>
                    <div className="p-2.5 rounded-xl bg-orange-600 shadow-md shadow-orange-200">
                        <FileText className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-orange-700">
                        {quotationCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Active schedules</p>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DashboardLayout
            title="Planning"
            subtitle="Manage project schedules, measurements, and budgets"
            icon={
                <img
                    src="assets/Planning/ActivitySchedules.png"
                    alt="Planning Icon"
                    className="h-full w-40 p-2 object-contain"
                />
            }
            stats={stats}
        // modules={planningModules}
        >
            <div className="space-y-6">
                {/* Enhanced Action Bar */}
                <Card className="border shadow-sm rounded-xl">
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            {/* Quick Actions */}
                            <div className="flex flex-wrap gap-3">
                                {quickActions.map((action) => (
                                    <Button
                                        key={action.label}
                                        onClick={action.action}
                                        variant={action.variant}
                                        size="lg"
                                        className={`relative group ${action.className || ""}`}
                                    >
                                        <action.icon className="h-5 w-5 mr-2" />
                                        {action.label}
                                        {action.badge !== undefined && action.badge > 0 && (
                                            <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-white/20 rounded-full">
                                                {action.badge}
                                            </span>
                                        )}
                                        <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Project Summary */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <Activity className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">Planning Overview</p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(), "EEEE, MMMM d, yyyy")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-purple-600">
                                            {planningStats.activeProjects}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Active Projects</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-orange-500">{budgetCount}</p>
                                        <p className="text-xs text-muted-foreground">Budgets</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Module Navigation Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    {planningModulesStructure.map((module) => (
                        <Card
                            key={module.id}
                            className={`relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-t-4 ${module.borderColor} cursor-pointer`}
                            onClick={() => navigate(module.route)}
                        >
                            <div className={`absolute right-0 top-0 -mr-12 -mt-12 h-40 w-40 rounded-full ${module.color.replace('hover:', '')} opacity-5 group-hover:scale-110 transition-transform duration-500`} />


                            <CardHeader className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${module.color} shadow-lg`}>
                                        <module.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                </div>
                                <CardTitle className="text-lg font-bold">{module.label}</CardTitle>
                                <CardDescription className="text-xs">
                                    {module.children.length} sub-modules available
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="relative z-10">
                                <div className="space-y-2">
                                    {module.children.map((child) => (
                                        <button
                                            key={child.id}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(child.route)
                                            }}
                                            className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group/item"
                                        >
                                            <div className="flex items-center gap-2">
                                                <child.icon className="h-4 w-4 text-gray-600" />
                                                <span className="text-sm font-medium text-gray-700">
                                                    {child.label}
                                                </span>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover/item:translate-x-1 transition-transform" />
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Enhanced Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-gray-100 rounded-xl">
                        <TabsTrigger
                            value="overview"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-3 font-semibold transition-all"
                        >
                            <LayoutGrid className="h-4 w-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="analytics"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-3 font-semibold transition-all"
                        >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                        </TabsTrigger>
                        <TabsTrigger
                            value="recent"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-3 font-semibold transition-all"
                        >
                            <Clock className="h-4 w-4 mr-2" />
                            Recent Activity
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 mt-6">
                        {/* Project Selector for S-Curve */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                                        Select Project:
                                    </label>
                                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                                        <SelectTrigger className="w-full max-w-md bg-gray-50 border-gray-200">
                                            <SelectValue placeholder="Select Project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Projects</SelectItem>
                                            {projects?.map((project) => (
                                                <SelectItem key={project.name} value={project.name}>
                                                    {project.project_name || project.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                        <SCurveChart selectedProject={selectedProject} />
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6 mt-6">
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Schedule Performance</CardTitle>
                                    <CardDescription>Project timeline adherence</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span className="font-medium">On Time Completion</span>
                                        <span className="text-green-600 font-bold">85%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                        <span className="font-medium">Schedule Variance</span>
                                        <span className="text-purple-600 font-bold">-2 days</span>
                                    </div>

                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Budget Performance</CardTitle>
                                    <CardDescription>Cost control metrics</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span className="font-medium">Under Budget Projects</span>
                                        <span className="text-green-600 font-bold">60%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                        <span className="font-medium">Cost Variance</span>
                                        <span className="text-orange-600 font-bold">+5%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                        <span className="font-medium">Total Budget</span>
                                        <span className="text-orange-600 font-bold">
                                            ₹{(planningStats.totalBudget / 10000000).toFixed(2)}Cr
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Work Analysis</CardTitle>
                                    <CardDescription>Current work status</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                        <span className="font-medium">Measurements Recorded</span>
                                        <span className="text-purple-600 font-bold">{measurementCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                        <span className="font-medium">Operational Schedules</span>
                                        <span className="text-orange-600 font-bold">{quotationCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-purple-100 rounded-lg">
                                        <span className="font-medium">Active Projects</span>
                                        <span className="text-purple-700 font-bold">{planningStats.activeProjects}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Project Distribution</CardTitle>
                                    <CardDescription>Overview of all projects</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span className="font-medium">Total Projects</span>
                                        <span className="text-green-600 font-bold">{planningStats.totalProjects}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                        <span className="font-medium">Active Projects</span>
                                        <span className="text-purple-600 font-bold">{planningStats.activeProjects}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                        <span className="font-medium">Avg Budget/Project</span>
                                        <span className="text-orange-600 font-bold">
                                            ₹{(planningStats.avgBudgetPerProject / 100000).toFixed(2)}L
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="recent" className="space-y-6 mt-6">
                        <div className="grid gap-6 grid-cols-1">
                            {/* Recent Measurements */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Ruler className="h-5 w-5 text-green-600" />
                                        Recent Measurements
                                    </CardTitle>
                                    <CardDescription>Latest measurement records</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentMeasurements && recentMeasurements.length > 0 ? (
                                            recentMeasurements.map((measurement) => (
                                                <div
                                                    key={measurement.name}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                                    onClick={() => navigate(`/app/kb-concreteand-shuttering-measurement/${measurement.name}`)}
                                                >
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-800">{measurement.name}</p>
                                                        <p className="text-xs text-gray-600">{measurement.project || 'N/A'}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {measurement.modified ? format(new Date(measurement.modified), "MMM dd, yyyy") : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 text-center py-4">No recent measurements</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}

export default PlanningDashboard