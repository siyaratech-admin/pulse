import React, { useState, useMemo } from "react"
import { useFrappeAuth, useFrappeGetCall } from "frappe-react-sdk"
import {
    Loader2,
    TrendingUp,
    Trophy,
    Award,
    Target,
    Activity,
    Zap,
    Calendar,
    ArrowUp,
    ArrowDown,
    Minus,
    PieChart,
    BarChart3,
    Medal,
    Users
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    PieChart as RechartsPie,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    BarChart,
    Bar
} from "recharts"

export type FrequencyType = "daily" | "monthly" | "yearly"

const PerformanceMainDashboard: React.FC = () => {
    const { currentUser } = useFrappeAuth()
    const [frequency, setFrequency] = useState<FrequencyType>("monthly")

    const { data, isLoading, error, mutate } = useFrappeGetCall<any>(
        "kb_task.api.employee_leaderboard.get_employee_dashboard_data",
        { user_id: currentUser },
        undefined,
        { revalidateOnFocus: false, revalidateOnReconnect: false }
    )

    const { data: energyPointsData, isLoading: isLoadingEnergyPoints } = useFrappeGetCall<any>(
        "kb_task.api.employee_leaderboard.get_employee_energy_points",
        { user_id: currentUser, frequency: frequency },
        `employee-energy-points-${frequency}`,
        { revalidateOnFocus: false }
    )

    const analytics = useMemo(() => {
        const stats = data?.message?.stats || data?.stats
        const energyData = energyPointsData?.message || energyPointsData || []
        if (!stats) return null

        const totalPoints = stats.total_energy_points || 0

        return {
            totalPoints,
            rank: stats.current_rank || 0,
            totalEmployees: stats.total_employees || 0,
            performanceByCategory: [
                { name: "Task Completion", value: 40, color: "#f97316" }, // orange-500
                { name: "Quality Score", value: 30, color: "#fb923c" }, // orange-400
                { name: "Timeliness", value: 20, color: "#f59e0b" }, // amber-500
                { name: "Collaboration", value: 10, color: "#fbbf24" } // amber-400
            ],
            skillsData: [
                { skill: "Productivity", value: 80 },
                { skill: "Quality", value: 90 },
                { skill: "Speed", value: 70 },
                { skill: "Consistency", value: 85 },
                { skill: "Innovation", value: 60 }
            ]
        }
    }, [data, energyPointsData])

    if (isLoading)
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-orange-50/30 via-amber-50/20 to-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        )

    if (error)
        return (
            <div className="p-8 bg-gradient-to-br from-orange-50/30 via-amber-50/20 to-slate-50 min-h-screen">
                <Alert variant="destructive" className="shadow-lg border-red-200">
                    <AlertTitle>Connection Error</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
            </div>
        )

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-amber-50/20 to-slate-50 p-4 md:p-8 space-y-8 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg shadow-orange-200">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Advanced Performance Analytics
                        </h1>
                    </div>
                    <p className="text-slate-500 text-sm font-medium ml-12">
                        Comprehensive insights • Trends • Predictions
                    </p>
                </div>
                <div className="flex bg-white/80 backdrop-blur-md border border-orange-200 p-1.5 rounded-2xl shadow-sm self-start">
                    {(['daily', 'monthly', 'yearly'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFrequency(f)}
                            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${frequency === f
                                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200"
                                    : "text-slate-500 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:text-orange-900"
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top Row: Hero Rank Cards with distinct background shading */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="relative overflow-hidden border-orange-200/40 shadow-md bg-white group transition-all hover:shadow-lg hover:shadow-orange-100/50">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-400" />
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                Current Rank
                            </p>
                            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                <Trophy className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-3">
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
                                #{analytics?.rank}
                            </h2>
                            <Badge className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 hover:from-orange-200 hover:to-amber-200 border-none rounded-full px-4 py-1 font-bold">
                                Top Performer
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mt-2 font-medium">
                            Out of {analytics?.totalEmployees} active employees
                        </p>
                        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl text-xs text-orange-900 leading-relaxed italic">
                            "Excellent work! You are maintaining a consistent lead in your department."
                        </div>
                        <Trophy className="absolute -right-6 -bottom-6 h-32 w-32 text-orange-100 opacity-40 -rotate-12 transition-transform group-hover:scale-110" />
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-orange-200/40 shadow-md bg-white group transition-all hover:shadow-lg hover:shadow-orange-100/50">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                Total Energy Points
                            </p>
                            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                <Zap className="h-5 w-5" />
                            </div>
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
                            {analytics?.totalPoints}
                        </h2>
                        <p className="text-sm text-slate-400 mt-2 font-medium">
                            Accumulated lifetime points
                        </p>
                        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl text-xs text-orange-700 font-semibold flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Keep completing tasks to reach the next milestone!
                        </div>
                        <Medal className="absolute -right-6 -bottom-6 h-32 w-32 text-orange-100 opacity-40 rotate-12 transition-transform group-hover:scale-110" />
                    </CardContent>
                </Card>
            </div>

            {/* Middle Row: Small Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    {
                        label: "Weekly Trend",
                        value: "+12%",
                        sub: "Growth from last week",
                        icon: TrendingUp,
                        color: "text-emerald-600",
                        bg: "bg-emerald-50",
                        border: "border-emerald-100"
                    },
                    {
                        label: "Daily Average",
                        value: "84.5",
                        sub: "Avg points per day",
                        icon: Calendar,
                        color: "text-orange-600",
                        bg: "bg-orange-50",
                        border: "border-orange-100"
                    },
                    {
                        label: "Peak Score",
                        value: "142",
                        sub: "Best single-day output",
                        icon: Zap,
                        color: "text-amber-600",
                        bg: "bg-amber-50",
                        border: "border-amber-100"
                    },
                    {
                        label: "Department Rank",
                        value: `#${analytics?.rank}`,
                        sub: "Lead developer group",
                        icon: Users,
                        color: "text-orange-700",
                        bg: "bg-orange-50",
                        border: "border-orange-200"
                    }
                ].map((s, i) => (
                    <Card
                        key={i}
                        className="border-orange-200/40 shadow-sm bg-white hover:border-orange-300 hover:shadow-md hover:shadow-orange-100/30 transition-all"
                    >
                        <CardContent className="p-6 flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    {s.label}
                                </p>
                                <h4 className="text-2xl font-bold text-slate-900">{s.value}</h4>
                                <p className="text-[11px] text-slate-500 font-medium mt-1">{s.sub}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${s.bg} ${s.border} border`}>
                                <s.icon className={`h-5 w-5 ${s.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Bottom Row: Large Chart Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-orange-200/40 shadow-lg bg-white overflow-hidden hover:shadow-xl hover:shadow-orange-100/40 transition-all">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg shadow-md shadow-orange-200">
                                <PieChart className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold text-slate-800">
                                    Performance Distribution
                                </CardTitle>
                                <CardDescription className="text-xs font-medium">
                                    Efficiency breakdown by category
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[350px] pt-6 bg-white">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPie>
                                <Pie
                                    data={analytics?.performanceByCategory}
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {analytics?.performanceByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    align="center"
                                    iconType="circle"
                                    wrapperStyle={{
                                        paddingTop: '20px',
                                        fontSize: '11px',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-orange-200/40 shadow-lg bg-white overflow-hidden hover:shadow-xl hover:shadow-orange-100/40 transition-all">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg shadow-md shadow-orange-200">
                                <Target className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold text-slate-800">
                                    Skills Assessment
                                </CardTitle>
                                <CardDescription className="text-xs font-medium">
                                    Multi-dimensional ability radar
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[350px] pt-6 bg-white">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={analytics?.skillsData}>
                                <PolarGrid stroke="#fed7aa" />
                                <PolarAngleAxis
                                    dataKey="skill"
                                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                                />
                                <Radar
                                    name="Current Level"
                                    dataKey="value"
                                    stroke="#f97316"
                                    fill="#f97316"
                                    fillOpacity={0.3}
                                    strokeWidth={3}
                                />
                                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default PerformanceMainDashboard