"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Package,
  Truck,
  ClipboardList,
  BarChart3,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react"
import { pAndMModules } from "@/components/hrms/WorkflowTree"
import DashboardLayout from "@/components/common/DashboardLayout"
import HRMSCircularView from "@/components/hrms/HRMSCircularView"

const PAndM: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview")

  const monthlyRequestData = [
    { month: "Jan", requests: 12, fulfilled: 10 },
    { month: "Feb", requests: 15, fulfilled: 13 },
    { month: "Mar", requests: 10, fulfilled: 9 },
    { month: "Apr", requests: 18, fulfilled: 16 },
    { month: "May", requests: 14, fulfilled: 12 },
    { month: "Jun", requests: 16, fulfilled: 14 },
  ]

  const utilizationData = [
    { month: "Jan", rate: 85 },
    { month: "Feb", rate: 88 },
    { month: "Mar", rate: 82 },
    { month: "Apr", rate: 90 },
    { month: "May", rate: 87 },
    { month: "Jun", rate: 89 },
  ]

  const categoryDistribution = [
    { name: "Material Requests", value: 45, color: "var(--chart-1)" },
    { name: "Equipment", value: 30, color: "var(--chart-2)" },
    { name: "Machinery", value: 15, color: "var(--chart-3)" },
    { name: "Tools", value: 10, color: "var(--chart-4)" },
  ]

  const stats = (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden rounded-lg p-4">
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
          <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="relative z-10 flex justify-between p-0 pt-2">
          <div className="flex-col items-baseline gap-2 w-full">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <p className="text-xs text-muted-foreground">Pending approval</p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden rounded-lg p-4">
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
          <CardTitle className="text-sm font-medium">Fulfilled Today</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="relative z-10 flex justify-between p-0 pt-2">
          <div className="flex-col items-baseline gap-2 w-full">
            <div className="text-2xl font-bold text-green-600">8</div>
            <p className="text-xs text-muted-foreground">+3 from yesterday</p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden rounded-lg p-4">
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
          <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="relative z-10 p-0 pt-2">
          <div className="text-2xl font-bold">89%</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden rounded-lg p-4">
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
          <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="relative z-10 p-0 pt-2">
          <div className="text-2xl font-bold">2.5h</div>
          <p className="text-xs text-muted-foreground">Below target</p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <DashboardLayout
      title="Plant & Machinery Management"
      subtitle="Manage materials, equipment, and machinery resources"
      icon={<Package className="h-32 w-32 p-4 opacity-20" />}
      stats={stats}
      modules={pAndMModules}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Requests & Fulfillment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    requests: { label: "Requests", color: "#3b82f6" },
                    fulfilled: { label: "Fulfilled", color: "#10b981" },
                  }}
                  className="h-[300px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRequestData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="requests" fill="var(--color-requests)" />
                      <Bar dataKey="fulfilled" fill="var(--color-fulfilled)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Utilization Rate Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    rate: { label: "Utilization %", color: "#6366f1" },
                  }}
                  className="h-[300px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={utilizationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[75, 95]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="rate" stroke="var(--color-rate)" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
              <HRMSCircularView modules={pAndMModules} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Distribution of P&M activities by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: { label: "Count", color: "#8884d8" },
                  }}
                  className="h-[300px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>P&M Metrics Summary</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Request Fulfillment</span>
                  <span className="text-blue-600 font-bold">94%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">On-Time Delivery</span>
                  <span className="text-green-600 font-bold">88%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">Resource Availability</span>
                  <span className="text-purple-600 font-bold">92%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent P&M Activities</CardTitle>
              <CardDescription>Latest material requests and deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Material Request MR-2024-089 Approved</p>
                      <p className="text-sm text-muted-foreground">Construction materials delivered to Site A</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">1 hour ago</div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Material Request MR-2024-090 Pending</p>
                      <p className="text-sm text-muted-foreground">Awaiting manager approval</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">3 hours ago</div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Equipment Transfer Completed</p>
                      <p className="text-sm text-muted-foreground">Excavator moved to Site B - Tower 3</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Yesterday</div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Inventory Restocked</p>
                      <p className="text-sm text-muted-foreground">50 items added to central warehouse</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">2 days ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

export default PAndM
