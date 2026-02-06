"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
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
  BarChart3,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  FileCheck,
  Award,
  ClipboardCheck,
  Clock,
  Briefcase,
  Users,
} from "lucide-react"
import QA from "@/assets/icons/qa.svg"
import Certificate from "@/assets/icons/certificate.svg"
import Issues from "@/assets/icons/issues.svg"
import Inspection from "@/assets/icons/inspection.svg"
import { qualityModules } from "@/components/hrms/WorkflowTree"
import DashboardLayout from "@/components/common/DashboardLayout"
import HRMSCircularView from "@/components/hrms/HRMSCircularView"

const Quality: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview")

  const monthlyQualityData = [
    { month: "Jan", defects: 5, inspections: 25 },
    { month: "Feb", defects: 3, inspections: 28 },
    { month: "Mar", defects: 7, inspections: 24 },
    { month: "Apr", defects: 2, inspections: 30 },
    { month: "May", defects: 4, inspections: 32 },
    { month: "Jun", defects: 3, inspections: 29 },
  ]

  const qualityScoreData = [
    { month: "Jan", score: 96 },
    { month: "Feb", score: 97 },
    { month: "Mar", score: 95 },
    { month: "Apr", score: 99 },
    { month: "May", score: 98 },
    { month: "Jun", score: 98.5 },
  ]

  const categoryDistribution = [
    { name: "Quality Control", value: 40, color: "var(--chart-3)" },
    { name: "Quality Assurance", value: 30, color: "var(--chart-6)" },
    { name: "Quality Metrics", value: 20, color: "var(--chart-2)" },
    { name: "Customer Feedback", value: 10, color: "var(--chart-4)" },
  ]

  const stats = (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="relative overflow-hidden rounded-lg p-4">
        <img
          src={Certificate}
          alt="Quality Background"
          className="absolute right-4 top-4 h-24 w-24 object-contain opacity-10"
        />
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
          <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 flex justify-between p-0">
          <div className="flex-col items-baseline gap-2 w-full">
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <p className="text-xs text-muted-foreground">+1.2% from last month</p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden rounded-lg p-4">
        <img
          src={Issues}
          alt="Issues Background"
          className="absolute right-4 top-4 h-24 w-24 object-contain opacity-10"
        />
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
          <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 flex justify-between p-0">
          <div className="flex-col items-baseline gap-2 w-full">
            <div className="text-2xl font-bold text-orange-600">2</div>
            <p className="text-xs text-muted-foreground">5 resolved this week</p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden rounded-lg p-4">
        <img
          src={Inspection}
          alt="Inspection Background"
          className="absolute right-4 top-4 h-24 w-24 object-contain opacity-10"
        />
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-0">
          <CardTitle className="text-sm font-medium">Inspections Done</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 p-0">
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
    </div>
  )

  /* eslint-disable react/no-unescaped-entities */
  const navigate = useNavigate() // Add useNavigate hook

  const qualityFormCategories = [
    {
      title: "Inspection Protocols",
      description: "Standard inspection forms and checklists",
      color: "from-blue-500 to-blue-600",
      icon: <ClipboardCheck className="h-6 w-6 text-white" />,
      forms: [
        {
          title: "Request For Inspection",
          description: "Initiate new inspection requests",
          icon: <FileCheck className="h-4 w-4" />,
          route: "/quality/new-request-for-inspection",
        },
        {
          title: "Quality Checklist Inspection",
          description: "General quality checklist execution",
          icon: <ClipboardCheck className="h-4 w-4" />,
          route: "/quality/new-quality-checklist-inspection",
        },
        {
          title: "Material Inspection",
          description: "Incoming material quality verification",
          icon: <Briefcase className="h-4 w-4" />,
          route: "/quality/material-inspection",
        }
      ],
    },
    {
      title: "Concrete & Structure",
      description: "Concrete and structural element checks",
      color: "from-orange-500 to-orange-600",
      icon: <Award className="h-6 w-6 text-white" />,
      forms: [
        {
          title: "Concrete Pour Card",
          description: "Pre-pour and post-pour verification",
          icon: <FileCheck className="h-4 w-4" />,
          route: "/quality/new-concrete-pour-card",
        },
        {
          title: "RCC Handover",
          description: "Handover inspection for RCC Elements",
          icon: <Users className="h-4 w-4" />,
          route: "/quality/new-rcc-handover",
        },
      ],
    },
    {
      title: "Dimensional Checks",
      description: "Measurement and alignment verifications",
      color: "from-blue-500 to-blue-600",
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      forms: [
        {
          title: "Dimensions",
          description: "Record structural dimensions",
          icon: <Clock className="h-4 w-4" />,
          route: "/quality/new-dimensions",
        },
        {
          title: "Slab Soffit Level",
          description: "Level checks for slab soffits",
          icon: <TrendingUp className="h-4 w-4" />,
          route: "/quality/new-slab-soffit-level", // Assumed route based on naming convention
        },
        {
          title: "Upstand Depth",
          description: "Check depths of upstands",
          icon: <TrendingUp className="h-4 w-4" />,
          route: "/quality/new-upstand-depth", // Assumed route
        },
        {
          title: "Wall Plumb",
          description: "Verticality checks for walls",
          icon: <TrendingUp className="h-4 w-4" />,
          route: "/quality/new-wall-plumb", // Assumed route
        },
      ],
    },
    {
      title: "Finishing Works",
      description: "Finishing and other inspections",
      color: "from-teal-500 to-teal-600",
      icon: <Award className="h-6 w-6 text-white" />,
      forms: [
        {
          title: "Aluform Checklist",
          description: "Aluminium formwork inspection",
          icon: <ClipboardCheck className="h-4 w-4" />,
          route: "/quality/new-aluform-checklist-template",
        },
      ],
    }
  ]

  return (
    <DashboardLayout
      title="Quality Management"
      subtitle="Monitor and maintain quality standards across all processes and products"
      icon={<img src={QA} alt="Quality Icon" className="h-full w-40 p-2" />}
      stats={stats}
    // modules={qualityModules} // Hiding sidebar modules to avoid redundancy with the main grid
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="forms">Quality Forms</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Quality Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    defects: { label: "Defects", color: "#ef4444" },
                    inspections: { label: "Inspections", color: "#10b981" },
                  }}
                  className="h-[300px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyQualityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="defects" fill="var(--color-defects)" />
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
                  Quality Score Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    score: { label: "Quality Score", color: "#10b981" },
                  }}
                  className="h-[300px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={qualityScoreData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[90, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forms" className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <ClipboardCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quality Forms</h2>
              <p className="text-sm text-muted-foreground">Access all quality documentation and inspection checklists</p>
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {qualityFormCategories.map((category, categoryIndex) => (
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

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quality Category Distribution</CardTitle>
                <CardDescription>Distribution of quality activities by category</CardDescription>
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
                        label={({ name, percent }) => `${name} ${(percent ? (percent * 100).toFixed(0) : 0)}%`}
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
                <CardTitle>Quality Metrics Summary</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Defect Rate</span>
                  <span className="text-green-600 font-bold">0.8%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Inspection Compliance</span>
                  <span className="text-blue-600 font-bold">96%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">Audit Score</span>
                  <span className="text-purple-600 font-bold">97%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Quality Activities</CardTitle>
              <CardDescription>Latest quality inspections and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Concrete Batch QC-2409-001 Approved</p>
                      <p className="text-sm text-muted-foreground">Slump, cube strength, and temperature within acceptable limits</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">2 hours ago</div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Supplier Audit Scheduled</p>
                      <p className="text-sm text-muted-foreground">Cement Supplier – Quality assessment visit planned</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Yesterday</div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-blue-600" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">ISO 9001 Certification Renewed</p>
                      <p className="text-sm text-muted-foreground">Site quality management system certification updated</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">3 days ago</div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <ClipboardCheck className="h-5 w-5 text-purple-600" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">RCC Slab Level Check Completed</p>
                      <p className="text-sm text-muted-foreground">Deviation recorded at 3 mm, within tolerance limits</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">5 days ago</div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <FileCheck className="h-5 w-5 text-teal-600" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Formwork Inspection Passed</p>
                      <p className="text-sm text-muted-foreground">All shuttering and supports checked before concrete pour</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">1 week ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

export default Quality
