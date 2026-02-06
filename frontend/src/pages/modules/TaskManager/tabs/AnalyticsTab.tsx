import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface AnalyticsTabProps {
  priorityDistribution: Array<{
    name: string
    value: number
    color: string
  }>
  taskStats: {
    total: number
    completed: number
    inProgress: number
    overdue: number
  }
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  priorityDistribution,
  taskStats,
}) => {
  const completionRate =
    taskStats.total > 0
      ? ((taskStats.completed / taskStats.total) * 100).toFixed(0)
      : 0

  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 640

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

        {/* Priority Distribution */}
        <Card className="w-full min-w-0">
          <CardHeader>
            <CardTitle>Task Priority Distribution</CardTitle>
            <CardDescription>
              Distribution of tasks by priority level
            </CardDescription>
          </CardHeader>

          <CardContent className="w-full min-w-0 overflow-hidden">
            <ChartContainer
              config={{
                value: { label: "Count", color: "var(--chart-1)" },
              }}
              className="h-[260px] sm:h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 35 : 45}
                    outerRadius={isMobile ? 70 : 90}
                    paddingAngle={2}
                    dataKey="value"
                    label={
                      isMobile
                        ? false
                        : ({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {priorityDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>

                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="w-full min-w-0">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Key performance indicators
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium">Completion Rate</span>
              <span className="text-green-600 font-bold">
                {completionRate}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="font-medium">Total Tasks</span>
              <span className="text-blue-600 font-bold">
                {taskStats.total}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="font-medium">In Progress</span>
              <span className="text-orange-600 font-bold">
                {taskStats.inProgress}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="font-medium">Overdue</span>
              <span className="text-red-600 font-bold">
                {taskStats.overdue}
              </span>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
