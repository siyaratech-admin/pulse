import React from "react"
import { EnergyPointsChart } from "../components/EnergyPointsChart"
import { TopPerformersChart } from "../components/TopPerformersChart"
import type { FrequencyType } from "../EmployeeDashboard"

interface ChartsSectionProps {
  energyPointsData: Array<{
    date: string
    label: string
    points: number
    cumulative_points: number
  }>
  topPerformersWeekly: Array<{
    user: string
    name: string
    employee_id: string | null
    points: number
  }>
  frequency: FrequencyType
  onFrequencyChange: (frequency: FrequencyType) => void
  isLoadingEnergyPoints?: boolean
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  energyPointsData,
  topPerformersWeekly,
  frequency,
  onFrequencyChange,
  isLoadingEnergyPoints
}) => {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Energy Points Line Chart */}
      <EnergyPointsChart
        data={energyPointsData}
        frequency={frequency}
        onFrequencyChange={onFrequencyChange}
        isLoading={isLoadingEnergyPoints}
      />

      {/* Top Performers Bar Chart */}
      <TopPerformersChart data={topPerformersWeekly} />
    </div>
  )
}
