"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  HardHat,
  Users,
  Wrench,
  Activity,
  Zap,
  Clipboard,
  Settings,
  Heart,
  FileX,
  Eye,
  Stethoscope,
  BarChart3,
  TrendingUp,
} from "lucide-react"
import Certificate from "@/assets/icons/certificate.svg"

import ConstructionWorkersLight from "@/assets/icons/construction-workers-light.svg"
import Inspection from "@/assets/icons/inspection.svg"
import Injury from "@/assets/icons/injury.svg"
import Days from "@/assets/icons/days.svg"
import { StandardHeader } from "@/components/common/StandardHeader"

const Safety: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")

  const monthlyIncidentsData = [
    { month: "Jan", incidents: 2, inspections: 15 },
    { month: "Feb", incidents: 1, inspections: 18 },
    { month: "Mar", incidents: 3, inspections: 16 },
    { month: "Apr", incidents: 0, inspections: 20 },
    { month: "May", incidents: 1, inspections: 22 },
    { month: "Jun", incidents: 2, inspections: 19 },
  ]

  const safetyScoreData = [
    { month: "Jan", score: 92 },
    { month: "Feb", score: 94 },
    { month: "Mar", score: 91 },
    { month: "Apr", score: 96 },
    { month: "May", score: 95 },
    { month: "Jun", score: 95 },
  ]

  const categoryDistribution = [
    { name: "Electrical", value: 25, color: "var(--chart-6)" },
    { name: "Equipment", value: 30, color: "var(--chart-7)" },
    { name: "Training", value: 20, color: "var(--chart-3)" },
    { name: "Incidents", value: 15, color: "var(--chart-5)" },
    { name: "Work Activities", value: 10, color: "var(--chart-2)" },
  ]

  const safetyFormCategories = [
    {
      title: "Electrical Safety",
      description: "Electrical systems and equipment safety forms",
      color: "from-blue-500 to-blue-600",
      icon: <Zap className="h-6 w-6 text-white" />,
      forms: [
        {
          title: "Earth Pit Inspection",
          description: "Conduct electrical earthing system inspections",
          icon: <Shield className="h-4 w-4" />,
          route: "/safety/new-earth-pit-inspection",
        },
        {
          title: "RCCB Tracker",
          description: "Residual Current Circuit Breaker testing and monitoring",
          icon: <Zap className="h-4 w-4" />,
          route: "/safety/new-rccb-tracker",
        },
      ],
    },
    {
      title: "Equipment & Tools",
      description: "Equipment inspection and tool safety forms",
      color: "from-orange-500 to-orange-600",
      icon: <Wrench className="h-6 w-6 text-white" />,
      forms: [
        {
          title: "Full Body Safety Harness",
          description: "Safety harness inspection and maintenance",
          icon: <Shield className="h-4 w-4" />,
          route: "/safety/new-full-body-safety-harness",
        },
        {
          title: "Lifting Tools and Tackles",
          description: "Inspection records for lifting equipment and tools",
          icon: <Wrench className="h-4 w-4" />,
          route: "/safety/new-lifting-tools",
        },
        {
          title: "Safety Checklist",
          description: "Safety inspections of construction materials and equipment",
          icon: <Clipboard className="h-4 w-4" />,
          route: "/safety/safety-inspection",
        },
        {
          title: "Material Inspection",
          description: "Material insepction of construction material and building assets",
          icon: <Clipboard className="h-4 w-4" />,
          route: "/safety/material-inspection"
        }
      ],
    },
    {
      title: "Training & Personnel",
      description: "Safety training and personnel management forms",
      color: "from-green-500 to-green-600",
      icon: <Users className="h-6 w-6 text-white" />,
      forms: [
        {
          title: "EHS and Tool Box",
          description: "Environmental, Health & Safety training records",
          icon: <HardHat className="h-4 w-4" />,
          route: "/safety/new-ehs-and-tool-box",
        },
        {
          title: "Labour Onboarding Form",
          description: "Employee joining and safety induction records",
          icon: <Users className="h-4 w-4" />,
          route: "/safety/new-labour-onboarding-form",
        },
        {
          title: "Pre Medical Form",
          description: "Pre-employment medical fitness certification",
          icon: <Stethoscope className="h-4 w-4" />,
          route: "/safety/new-pre-medical-form",
        },
      ],
    },
    {
      title: "Work Activities",
      description: "Work activity monitoring and reporting forms",
      color: "from-blue-500 to-blue-600",
      icon: <Activity className="h-6 w-6 text-white" />,
      forms: [
        {
          title: "Height Work Monitoring",
          description: "Monitor and report work at height activities",
          icon: <Activity className="h-4 w-4" />,
          route: "/safety/new-height-work-monitoring-report",
        },
      ],
    },
    {
      title: "Incident Reporting",
      description: "Accident and incident documentation forms",
      color: "from-red-500 to-red-600",
      icon: <AlertTriangle className="h-6 w-6 text-white" />,
      forms: [
        {
          title: "Accident Report",
          description: "Document accidents, injuries, and safety incidents",
          icon: <AlertTriangle className="h-4 w-4" />,
          route: "/safety/new-accident-report",
        },
        {
          title: "First Aid Report",
          description: "Document first aid treatment and medical assistance",
          icon: <Heart className="h-4 w-4" />,
          route: "/safety/new-first-aid-report",
        },
        {
          title: "Incident Report",
          description: "Document safety incidents and near-miss events",
          icon: <FileX className="h-4 w-4" />,
          route: "/safety/new-incident-report",
        },
        {
          title: "Near Miss Report",
          description: "Document near-miss events and potential hazards",
          icon: <Eye className="h-4 w-4" />,
          route: "/safety/new-near-miss-report",
        },
      ],
    },
  ]

  return (
    <>
      {/* Header */}
      <StandardHeader
        title="Safety Management"
        subtitle="Monitor and manage safety protocols and incidents"
        icon={<img src={ConstructionWorkersLight} alt="Safety Icon" className="h-full w-40 p-2" />}
        className="bg-gradient-to-r from-blue-700 to-teal-500"
      />

      <div className="space-y-6 p-6 bg-background">
        {/* Safety Stats - keeping unchanged as requested */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden rounded-lg p-4">
            <img
              src={Certificate}
              alt="Safety Background"
              className="absolute right-4 top-4 h-24 w-24 object-contain "
            />
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
              <CardTitle className="text-sm font-medium">Safety Score</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 flex justify-between p-0">
              <div className="flex-col items-baseline gap-2 w-full">
                <div className="text-2xl font-bold text-green-600">95%</div>
                <p className="text-xs text-muted-foreground">+2% from last month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden rounded-lg p-4">
            <img
              src={Injury}
              alt="Incident Background"
              className="absolute right-4 top-4 h-24 w-24 object-contain "
            />
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
              <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 flex justify-between p-0">
              <div className="flex-col items-baseline gap-2 w-full">
                <div className="text-2xl font-bold text-orange-600">3</div>
                <p className="text-xs text-muted-foreground">2 resolved this week</p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden rounded-lg p-4">
            <img
              src={Inspection}
              alt="Inspection Background"
              className="absolute right-4 top-4 h-24 w-24 object-contain "
            />
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
              <CardTitle className="text-sm font-medium">Inspections Completed</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 p-0">
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden rounded-lg p-4">
            <img
              src={Days}
              alt="Days Background"
              className="absolute right-4 top-4 h-24 w-24 object-contain "
            />
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
              <CardTitle className="text-sm font-medium">Days Without Incident</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 p-0">
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">New record this year</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="forms">Safety Forms</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 w-full">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Monthly Incidents vs Inspections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      incidents: { label: "Incidents", color: "var(--chart-5)" },
                      inspections: { label: "Inspections", color: "var(--chart-3)" },
                    }}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyIncidentsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="incidents" fill="var(--color-incidents)" />
                        <Bar dataKey="inspections" fill="var(--color-inspections)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Safety Score Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      score: { label: "Safety Score", color: "var(--chart-6)" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={safetyScoreData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[85, 100]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common safety management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-white hover:shadow-md transition-all bg-transparent"
                    onClick={() => navigate("/safety/new-incident-report")}
                  >
                    <FileText className="h-6 w-6" />
                    <span className="text-sm font-medium">View Reports</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-white hover:shadow-md transition-all bg-transparent"
                    onClick={() => navigate("/safety/new-incident-report")}
                  >
                    <AlertTriangle className="h-6 w-6" />
                    <span className="text-sm font-medium">Report Incident</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-white hover:shadow-md transition-all bg-transparent"
                    onClick={() => navigate("/safety/safety-inspection")}
                  >
                    <CheckCircle className="h-6 w-6" />
                    <span className="text-sm font-medium">Schedule Inspection</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-white hover:shadow-md transition-all bg-transparent"
                    onClick={() => navigate("/safety/new-ehs-and-tool-box")}
                  >
                    <HardHat className="h-6 w-6" />
                    <span className="text-sm font-medium">Safety Training</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Safety Category Distribution</CardTitle>
                  <CardDescription>Distribution of safety activities by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: { label: "Count", color: "var(--chart-1)" },
                    }}
                    className="h-[300px]"
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
                  <CardTitle>Safety Metrics Summary</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Incident Rate</span>
                    <span className="text-green-600 font-bold">0.2%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Training Completion</span>
                    <span className="text-blue-600 font-bold">98%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium">Equipment Compliance</span>
                    <span className="text-orange-600 font-bold">94%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">Inspection Coverage</span>
                    <span className="text-purple-600 font-bold">100%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="forms" className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clipboard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Safety Forms</h2>
                <p className="text-sm text-muted-foreground">Access all safety documentation and reporting forms</p>
              </div>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {safetyFormCategories.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color}`}>{category.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription className="text-xs">{category.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {category.forms.map((form, formIndex) => (
                        <div
                          key={formIndex}
                          onClick={() => navigate(form.route)}
                          className="p-3 rounded-lg border border-gray-200 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer bg-white hover:bg-gray-50"
                        >
                          <div className="flex items-start gap-2">
                            <div className="p-1 rounded bg-gray-100">{form.icon}</div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-xs text-gray-900 mb-1">{form.title}</h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">{form.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Safety Activities</CardTitle>
                <CardDescription>Latest safety inspections and incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Monthly Fire Safety Inspection</p>
                        <p className="text-sm text-muted-foreground">All systems operational</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">Today</div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Equipment Maintenance Required</p>
                        <p className="text-sm text-muted-foreground">Elevator #2 scheduled maintenance</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">2 days ago</div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Safety Training Completed</p>
                        <p className="text-sm text-muted-foreground">15 team members certified</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">1 week ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export default Safety
