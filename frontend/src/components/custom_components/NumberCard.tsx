import type React from "react"
import { Card, CardContent } from "../ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "../../lib/utils"

interface NumberCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    trend: "up" | "down"
    description?: string
  }
  icon?: React.ReactNode
  className?: string
}

const NumberCard: React.FC<NumberCardProps> = ({ title, value, change, icon, className }) => {
  const formatValue = (val: string | number) => {
    if (typeof val === "number") {
      // Format numbers with commas for thousands
      return val.toLocaleString()
    }
    return val
  }

  const getTrendColor = (trend: "up" | "down") => {
    return trend === "up" ? "text-green-600" : "text-red-600"
  }

  const getTrendIcon = (trend: "up" | "down") => {
    return trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
  }

  return (
    <Card className={cn("shadow-sm hover:shadow-md transition-shadow duration-200", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-muted-foreground tracking-tight">{title}</h3>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-bold text-foreground">{formatValue(value)}</div>

          {change && (
            <div className="flex items-center space-x-1 text-xs">
              <div className={cn("flex items-center space-x-1", getTrendColor(change.trend))}>
                {getTrendIcon(change.trend)}
                <span className="font-medium">{Math.abs(change.value)}%</span>
              </div>
              {change.description && <span className="text-muted-foreground">{change.description}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default NumberCard
