import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface EmployeeStats {
  rank: number
  total_points: number
  employee_name: string
  total_employees: number
}

interface EmployeeStatsSectionProps {
  stats: EmployeeStats
}

export const EmployeeStatsSection: React.FC<EmployeeStatsSectionProps> = ({ stats }) => {
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return { emoji: "🥇", color: "bg-yellow-100 text-yellow-800 border-yellow-300", label: "1st Place" }
    } else if (rank === 2) {
      return { emoji: "🥈", color: "bg-gray-100 text-gray-800 border-gray-300", label: "2nd Place" }
    } else if (rank === 3) {
      return { emoji: "🥉", color: "bg-orange-100 text-orange-800 border-orange-300", label: "3rd Place" }
    } else if (rank <= 10) {
      return { emoji: "⭐", color: "bg-blue-100 text-blue-800 border-blue-300", label: `${rank}th Place` }
    } else {
      return { emoji: "📊", color: "bg-slate-100 text-slate-800 border-slate-300", label: `${rank}th Place` }
    }
  }

  const rankBadge = getRankBadge(stats.rank)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Current Rank Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-10">
          <Trophy className="h-24 w-24" />
        </div>
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Current Rank</CardTitle>
          <Trophy className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-baseline gap-3">
            <div className="text-3xl font-bold text-primary">#{stats.rank}</div>
            <Badge className={`${rankBadge.color} border text-xs`}>
              <span className="mr-1">{rankBadge.emoji}</span>
              {rankBadge.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Out of {stats.total_employees} employees
          </p>
          {stats.rank <= 3 && (
            <div className="mt-3 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-md border border-yellow-200">
              <p className="text-xs font-medium text-yellow-800">
                Excellent work! You're in the top 3!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Energy Points Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-10">
          <Award className="h-24 w-24" />
        </div>
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Energy Points</CardTitle>
          <Award className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-primary">
            {stats.total_points.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Lifetime points earned</p>

          {/* Points Milestone Indicator */}
          {stats.total_points >= 1000 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="h-2 flex-1 bg-gradient-to-r from-green-200 to-green-500 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-green-600" style={{ width: `${Math.min((stats.total_points % 1000) / 10, 100)}%` }} />
              </div>
              <span className="text-xs font-medium text-green-600">
                {Math.floor(stats.total_points / 1000)}K+
              </span>
            </div>
          )}

          {stats.total_points === 0 && (
            <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-xs text-blue-800">
                Complete tasks to start earning energy points!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
