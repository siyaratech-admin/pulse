import React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Loader2 } from "lucide-react"
import type { FrequencyType } from "../EmployeeDashboard"

interface EnergyPointsChartProps {
  data: Array<{
    date: string
    label: string
    points: number
    cumulative_points: number
  }>
  frequency: FrequencyType
  onFrequencyChange: (frequency: FrequencyType) => void
  isLoading?: boolean
}

export const EnergyPointsChart: React.FC<EnergyPointsChartProps> = ({
  data,
  frequency,
  onFrequencyChange,
  isLoading
}) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium">{payload[0].payload.label}</p>
          <p className="text-xs text-blue-600 mt-1">
            Points: <span className="font-semibold">{payload[0].value}</span>
          </p>
          <p className="text-xs text-purple-600">
            Total: <span className="font-semibold">{payload[1]?.value || 0}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Energy Points Over Time</CardTitle>
              <CardDescription>Track your performance progress</CardDescription>
            </div>
          </div>
          <Select value={frequency} onValueChange={(value) => onFrequencyChange(value as FrequencyType)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-center">
            <div>
              <p className="text-muted-foreground">No data available for this period</p>
              <p className="text-xs text-muted-foreground mt-1">Complete tasks to start tracking your progress</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                stroke="#888"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#888"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="points"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
                name="Points Earned"
              />
              <Line
                type="monotone"
                dataKey="cumulative_points"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#8b5cf6", r: 3 }}
                name="Cumulative Points"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
