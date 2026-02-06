"use client"

import React, { useMemo } from "react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { format, eachDayOfInterval, isBefore, startOfDay, addDays, min, max, isValid } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SCurveChartProps {
    selectedProject: string
}

const SCurveChart: React.FC<SCurveChartProps> = ({ selectedProject }) => {
    // Fetch all Tasks for the project
    // We need dates and custom_points (weightage)
    const { data: tasks, isLoading } = useFrappeGetDocList("Task", {
        fields: [
            "name",
            "subject",
            "status",
            "exp_start_date", "exp_end_date", // Expected / Planned
            "custom_baseline_start_date_", "custom_baseline_end_date", // Baseline
            "custom_actual_start_date", "custom_actual_end_date", "completed_on", // Actual
            "custom_points", // Weightage
            "progress" // Progress %
        ],
        filters: selectedProject ? [["project", "=", selectedProject]] : undefined,
        limit: 5000,
        orderBy: { field: "exp_start_date", order: "asc" }
    })

    const chartData = useMemo(() => {
        if (!tasks || tasks.length === 0) return []

        // Helper to parse dates safely
        const parseDate = (dateStr: string | undefined | null) => {
            if (!dateStr) return null
            const d = new Date(dateStr)
            return isValid(d) ? d : null
        }

        // 1. Determine Global Timeline Range
        const allDates: Date[] = []
        let totalPoints = 0;

        tasks.forEach(t => {
            const d1 = parseDate(t.exp_start_date); if (d1) allDates.push(d1)
            const d2 = parseDate(t.exp_end_date); if (d2) allDates.push(d2)
            const d3 = parseDate(t.custom_baseline_start_date_); if (d3) allDates.push(d3)
            const d4 = parseDate(t.custom_baseline_end_date); if (d4) allDates.push(d4)
            const d5 = parseDate(t.custom_actual_start_date); if (d5) allDates.push(d5)
            const d6 = parseDate(t.custom_actual_end_date || t.completed_on); if (d6) allDates.push(d6)

            // Accumulate total weightage
            totalPoints += (t.custom_points || 0);
        })

        // If no valid dates found, return empty
        if (allDates.length === 0) return []

        // If total points is 0, we can't calculate weightage based S-Curve nicely, 
        // fall back to count-based (1 point per task) or just handle as 0.
        // Let's treat count as 1 if totalPoints is 0 to show *something*.
        const useCount = totalPoints === 0;
        if (useCount) totalPoints = tasks.length;

        const startDate = min(allDates)
        const endDate = max(allDates)

        // Generate daily timeline
        // Add a buffer to end date for visibility
        const timeline = eachDayOfInterval({ start: startDate, end: addDays(endDate, 7) })

        // 2. Calculate Cumulative Progress for each day
        return timeline.map(day => {
            const dayStart = startOfDay(day)

            let baselineCompletedPoints = 0
            let expectedCompletedPoints = 0
            let actualCompletedPoints = 0

            tasks.forEach(t => {
                const weight = useCount ? 1 : (t.custom_points || 0);

                // Baseline Progress
                // Task is "contributed" to progress if it should have finished by this day
                const bEnd = parseDate(t.custom_baseline_end_date)
                if (bEnd && (isBefore(bEnd, dayStart) || bEnd.getTime() === dayStart.getTime())) {
                    baselineCompletedPoints += weight
                }

                // Expected (Planned) Progress
                const eEnd = parseDate(t.exp_end_date)
                if (eEnd && (isBefore(eEnd, dayStart) || eEnd.getTime() === dayStart.getTime())) {
                    expectedCompletedPoints += weight
                }

                // Actual Progress
                // Only count if task is actually completed or we use % progress?
                // Using "Completed" status or progress = 100 is safer for "Actual Curve" based on finish dates.
                // However, user asked "based on actual tasks with dates".
                // Usually Actual S-Curve is: Sum(Weight * %Complete) or Sum(Weight) if Finished.
                // Strict interpretation: "Actual S-Curve" usually plots 100% of weight when task finishes.

                // Let's use: If task is completed AND completed_on <= day, add weight.
                // OR check progress? Standard S-Curve represents "Work Completed".
                // If we have partial progress updates history, we could trace it. 
                // Getting history is hard.
                // Simplified Actual: If Today >= Task Actual End Date (and task is done), it counts.

                // Better approach for "Actual": 
                // If status is Completed, use completed_on or actual_end_date.
                // If not completed, it contributes 0 (or partial if we want earn value, but simple S-Curve usually finished).

                if (t.status === "Completed") {
                    const aEnd = parseDate(t.completed_on || t.custom_actual_end_date);
                    if (aEnd && (isBefore(aEnd, dayStart) || aEnd.getTime() === dayStart.getTime())) {
                        actualCompletedPoints += weight
                    }
                }
            })

            return {
                date: format(day, "yyyy-MM-dd"),
                displayDate: format(day, "dd MMM"),
                // Baseline: parseFloat(((baselineCompletedPoints / totalPoints) * 100).toFixed(1)),
                // Expected: parseFloat(((expectedCompletedPoints / totalPoints) * 100).toFixed(1)),
                // Actual: parseFloat(((actualCompletedPoints / totalPoints) * 100).toFixed(1)),

                // Renaming to match typical S-Curve legend
                "Baseline Plan": parseFloat(((baselineCompletedPoints / totalPoints) * 100).toFixed(1)),
                "Expected Plan": parseFloat(((expectedCompletedPoints / totalPoints) * 100).toFixed(1)),
                "Actual Progress": parseFloat(((actualCompletedPoints / totalPoints) * 100).toFixed(1)),
            }
        })

    }, [tasks])

    if (isLoading) {
        return <div className="h-[400px] flex items-center justify-center">Loading S-Curve Data...</div>
    }

    if (!selectedProject) {
        return <div className="h-[400px] flex items-center justify-center text-muted-foreground">Select a project to view S-Curve</div>
    }

    if (chartData.length === 0) {
        return <div className="h-[400px] flex items-center justify-center text-muted-foreground">No task data available for this project</div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Project Progress S-Curve</CardTitle>
                <CardDescription>Cumulative % of task weightage (Energy Points) completed over time</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="displayDate"
                                tick={{ fontSize: 12 }}
                                minTickGap={30}
                            />
                            <YAxis
                                domain={[0, 100]}
                                unit="%"
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="Baseline Plan"
                                stroke="#f59e0b" // Amber
                                strokeWidth={2}
                                dot={false}
                                strokeDasharray="5 5"
                            />
                            <Line
                                type="monotone"
                                dataKey="Expected Plan"
                                stroke="#9333ea" // Purple
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="Actual Progress"
                                stroke="#10b981" // Green
                                strokeWidth={3}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export default SCurveChart
