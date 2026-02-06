import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface Performer {
  rank: number
  user: string
  name: string
  employee_id: string | null
  image: string | null
  points: number
  trend: "up" | "down" | "neutral"
}

interface TopPerformersListProps {
  performers: Performer[]
}

export const TopPerformersList: React.FC<TopPerformersListProps> = ({ performers }) => {
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return { emoji: "🥇", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", textColor: "text-yellow-700" }
    } else if (rank === 2) {
      return { emoji: "🥈", bgColor: "bg-gray-50", borderColor: "border-gray-200", textColor: "text-gray-700" }
    } else if (rank === 3) {
      return { emoji: "🥉", bgColor: "bg-orange-50", borderColor: "border-orange-200", textColor: "text-orange-700" }
    }
    return { emoji: `#${rank}`, bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-700" }
  }

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getInitials = (name: string) => {
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>Top 10 performers by total energy points</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {performers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No leaderboard data available</p>
            <p className="text-xs text-muted-foreground mt-1">Rankings will appear as employees earn points</p>
          </div>
        ) : (
          <div className="space-y-2">
            {performers.map((performer) => {
              const rankBadge = getRankBadge(performer.rank)

              return (
                <div
                  key={performer.rank}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`flex items-center justify-center h-10 w-10 rounded-full border-2 ${rankBadge.bgColor} ${rankBadge.borderColor} shrink-0`}
                    >
                      <span className={`text-sm font-bold ${rankBadge.textColor}`}>
                        {rankBadge.emoji}
                      </span>
                    </div>

                    {/* Employee Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Avatar */}
                      {performer.image ? (
                        <img
                          src={performer.image}
                          alt={performer.name}
                          className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">
                            {getInitials(performer.name)}
                          </span>
                        </div>
                      )}

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{performer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {performer.employee_id || performer.user}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Points and Trend */}
                  <div className="flex items-center gap-3 shrink-0">
                    {getTrendIcon(performer.trend)}
                    <Badge variant="secondary" className="font-mono">
                      {performer.points.toLocaleString()} pts
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
