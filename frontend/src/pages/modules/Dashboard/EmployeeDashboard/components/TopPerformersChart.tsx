import React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

interface TopPerformersChartProps {
  data: Array<{
    user: string
    name: string
    employee_id: string | null
    points: number
  }>
}

export const TopPerformersChart: React.FC<TopPerformersChartProps> = ({ data }) => {
  // Colors for top 3 performers
  const getBarColor = (index: number) => {
    if (index === 0) return "#fbbf24" // Gold
    if (index === 1) return "#9ca3af" // Silver
    if (index === 2) return "#f97316" // Bronze
    return "#60a5fa" // Default blue
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium">{payload[0].payload.name}</p>
          <p className="text-xs text-blue-600 mt-1">
            Points: <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  // Truncate long names
  const formatName = (name: string) => {
    if (name.length > 15) {
      return name.substring(0, 12) + "..."
    }
    return name
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Top Performers This Week</CardTitle>
            <CardDescription>Leading team members by energy points</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-center">
            <div>
              <p className="text-muted-foreground">No performance data available</p>
              <p className="text-xs text-muted-foreground mt-1">Data will appear when team members earn points</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                stroke="#888"
                tickFormatter={formatName}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#888"
                label={{ value: "Points", angle: -90, position: "insideLeft", style: { fontSize: 12 } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="points"
                fill="#60a5fa"
                radius={[8, 8, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {data.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-[#fbbf24]" />
              <span>1st</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-[#9ca3af]" />
              <span>2nd</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-[#f97316]" />
              <span>3rd</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-[#60a5fa]" />
              <span>Others</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
