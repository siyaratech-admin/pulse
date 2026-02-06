import React from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import {
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle
} from "lucide-react"

interface OverviewTabProps {
  monthlyTasksData: Array<{
    month: string
    completed: number
    pending: number
  }>
  completionRateData: Array<{
    month: string
    rate: number
  }>
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  monthlyTasksData,
  completionRateData,
}) => {
  const navigate = useNavigate()

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640

  // Calculate insights
  const latestMonth = completionRateData[completionRateData.length - 1]
  const previousMonth = completionRateData[completionRateData.length - 2]
  const trend = latestMonth && previousMonth ? latestMonth.rate - previousMonth.rate : 0
  const avgCompletionRate =
    completionRateData.length > 0
      ? completionRateData.reduce((sum, item) => sum + item.rate, 0) / completionRateData.length
      : 0

  return (
    <div className="space-y-6 w-full">
      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-3xl font-bold mt-2 text-blue-600">
                  {latestMonth ? Math.round(latestMonth.rate) : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Completion Rate</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            {trend !== 0 && (
              <div className="mt-4 pt-4 border-t flex items-center gap-2">
                <ArrowUpRight
                  className={`h-4 w-4 ${trend > 0 ? "text-green-600" : "text-red-600 rotate-90"}`}
                />
                <span className={`text-sm font-semibold ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
                  {Math.abs(trend).toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rate</p>
                <p className="text-3xl font-bold mt-2 text-green-600">
                  {Math.round(avgCompletionRate)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">All Time</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${avgCompletionRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Completed</p>
                <p className="text-3xl font-bold mt-2 text-purple-600">
                  {monthlyTasksData.reduce((sum, item) => sum + item.completed, 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Tasks</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                {monthlyTasksData.reduce((sum, item) => sum + item.pending, 0)} pending tasks
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Monthly Task Status */}
        <Card className="w-full min-w-0 shadow-md border-2 hover:shadow-xl transition-shadow">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Monthly Task Status</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Completed vs Pending tasks</p>
                </div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="w-full min-w-0 overflow-hidden pt-6">
            <ChartContainer
              config={{
                completed: { label: "Completed", color: "hsl(142, 76%, 36%)" },
                pending: { label: "Pending", color: "hsl(25, 95%, 53%)" },
              }}
              className="h-[280px] sm:h-[320px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyTasksData}
                  barCategoryGap={isMobile ? "25%" : "15%"}
                  margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
                >
                  <defs>
                    <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                  <XAxis
                    dataKey="month"
                    angle={isMobile ? -30 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    interval={0}
                    height={isMobile ? 60 : 30}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />

                  <YAxis width={40} allowDecimals={false} tick={{ fill: "#6b7280", fontSize: 12 }} />

                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                  />

                  <Bar dataKey="completed" fill="url(#completedGradient)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="pending" fill="url(#pendingGradient)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-600" />
                <span className="text-sm font-medium text-gray-700">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-sm font-medium text-gray-700">Pending</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Completion Rate */}
        <Card className="w-full min-w-0 shadow-md border-2 hover:shadow-xl transition-shadow">
          <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Task Completion Rate</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Performance trend over time</p>
                </div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="w-full min-w-0 overflow-hidden pt-6">
            <ChartContainer
              config={{
                rate: { label: "Completion Rate (%)", color: "hsl(142, 76%, 36%)" },
              }}
              className="h-[280px] sm:h-[320px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={completionRateData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                  <XAxis
                    dataKey="month"
                    angle={isMobile ? -30 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    interval={0}
                    height={isMobile ? 60 : 30}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />

                  <YAxis
                    domain={[0, 100]}
                    width={40}
                    allowDecimals={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    label={{ value: "%", position: "insideLeft", offset: -5 }}
                  />

                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "5 5" }}
                  />

                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(142, 76%, 36%)"
                    strokeWidth={3}
                    dot={{ fill: "hsl(142, 76%, 36%)", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, strokeWidth: 2 }}
                    fill="url(#lineGradient)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Performance indicator */}
            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
              {latestMonth && (
                <>
                  {latestMonth.rate >= 80 ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">Excellent Performance</span>
                    </div>
                  ) : latestMonth.rate >= 60 ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-full">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-700">Good Progress</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 rounded-full">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-semibold text-orange-700">Needs Improvement</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Card */}
      {/* <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors bg-gradient-to-br from-gray-50 to-white">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Want more insights?</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            View detailed analytics including priority distribution, team performance, and task trends
          </p>
          <Button
            onClick={() => navigate("?tab=analytics")}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            View Analytics
          </Button>
        </CardContent>
      </Card> */}
    </div>
  )
}