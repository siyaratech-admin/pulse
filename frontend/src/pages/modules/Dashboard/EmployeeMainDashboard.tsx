import React, { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, CheckCircle, Briefcase, FileText, Zap, Activity, CheckSquare, Check, Sun, Moon, ArrowRight, Receipt, Award, Target, TrendingUp, Plus, Calendar, Heart, Stethoscope } from "lucide-react"
import { useFrappeAuth, useFrappeGetDocList } from "frappe-react-sdk"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { DashboardNotificationCard } from "@/components/notifications/DashboardNotificationCard"

// Type definitions
interface Employee {
    name: string
    employee_name: string
    designation: string
    user_id: string
}

interface SkillItem {
    name: string
    skill: string
    person: string
    person_name: string
    criteria_met: number | boolean
    completed?: number | boolean
    priority?: string
    parent: string
    parentfield: string
    parenttype: string
    doctype: string
    checklistName?: string
    checklistPerson?: string
    modified?: string
    creation?: string
}

interface ChecklistDoc {
    name: string
    person: string
    person_name: string
    designation: string
    modified: string
    creation: string
    skills: SkillItem[]
    criteria_met?: number | boolean
    docstatus?: number
}

interface Task {
    name: string
    subject: string
    project: string
    progress: number
    priority: string
    status: string
}

interface Assignment {
    title: string
    dept: string
    progress: number
    priority: string
}

const EmployeeMainDashboard = () => {
    const navigate = useNavigate()
    const [userData, setUserData] = useState<Employee | null>(null)
    const [todoTab, setTodoTab] = useState<'active' | 'completed'>('active')
    const [frequencyTab, setFrequencyTab] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily')
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [newSkillData, setNewSkillData] = useState({
        skill: '',
        person_name: '',
        priority: 'Medium',
        completed: 0
    })
    const [isUpdating, setIsUpdating] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<string>('')
    const lastUpdateTime = useRef(0)
    const performanceScore = 82

    const getPerformanceColor = (score: number) => {
        if (score >= 80) return "text-teal-600"
        if (score >= 50) return "text-amber-500"
        return "text-rose-500"
    }

    const getPerformanceBg = (score: number) => {
        if (score >= 80) return "bg-teal-500 hover:bg-teal-600"
        if (score >= 50) return "bg-amber-500 hover:bg-amber-600"
        return "bg-rose-500 hover:bg-rose-600"
    }

    const recentExpenses = [
        { id: "EXP-001", purpose: "Medical Supplies", amount: 350, status: "Approved" },
        { id: "EXP-002", purpose: "Equipment Maintenance", amount: 125.50, status: "Pending" },
    ]

    const { currentUser } = useFrappeAuth()

    const { data: employeeList, isLoading: empLoading } = useFrappeGetDocList(
        'Employee',
        {
            filters: [['user_id', '=', currentUser]],
            fields: ['name', 'employee_name', 'designation', 'user_id'],
            limit: 1
        },
        currentUser ? undefined : null
    )

    const employee = employeeList?.[0]

    // Fetch actual tasks from ERPNext
    const { data: tasks, isLoading: tasksLoading } = useFrappeGetDocList(
        'Task',
        {
            fields: ['name', 'subject', 'project', 'progress', 'priority', 'status'],
            filters: [
                ['_assign', 'like', `%${currentUser}%`],
                ['status', 'not in', ['Completed', 'Cancelled']]
            ],
            orderBy: {
                field: 'modified',
                order: 'desc'
            },
            limit: 6
        },
        currentUser ? undefined : null
    )

    // Fetch juniors (direct reports)
    const { data: juniors } = useFrappeGetDocList(
        'Employee',
        {
            fields: ['name', 'employee_name'],
            filters: [['reports_to', '=', employee?.name]],
            limit: 100
        },
        employee?.name ? undefined : null
    )

    useEffect(() => {
        if (employee?.name && !selectedEmployee) {
            setSelectedEmployee(employee.name)
        }
    }, [employee, selectedEmployee])

    // Transform tasks to match the UI structure
    const activeAssignments: Assignment[] = tasks?.map(task => ({
        title: task.subject || 'Untitled Task',
        dept: task.project || 'No Project',
        progress: task.progress || 0,
        priority: task.priority || 'Medium'
    })) || []

    const doctypeMap = {
        daily: 'Daily Skill Checklist',
        weekly: 'Weekly Skill Checklist',
        monthly: 'Monthly Skill Checklist',
        yearly: 'Yearly Skill Checklist'
    }

    const currentDoctype = doctypeMap[frequencyTab]

    const { data: checklists, isLoading: checklistsLoading, mutate: mutateChecklists } = useFrappeGetDocList(
        currentDoctype,
        {
            fields: ['name', 'person', 'person_name', 'designation', 'modified', 'creation', 'date', 'docstatus'],
            filters: [['person', '=', selectedEmployee || employee?.name || '']],
            orderBy: {
                field: 'date',
                order: 'desc'
            },
            limit: 1
        },
        employee?.name ? undefined : null
    )

    const [checklistDetails, setChecklistDetails] = useState<ChecklistDoc[]>([])
    const [loadingDetails, setLoadingDetails] = useState(false)

    useEffect(() => {
        if (employee) {
            setUserData(employee)
            setNewSkillData(prev => ({ ...prev, person_name: employee.employee_name }))
        }
    }, [employee])

    const fetchDetails = useCallback(async () => {
        if (isUpdating) {
            return
        }
        const timeSinceLastUpdate = Date.now() - lastUpdateTime.current
        if (timeSinceLastUpdate < 2000) {
            return
        }
        if (!checklists || checklists.length === 0) {
            setChecklistDetails([])
            return
        }
        setLoadingDetails(true)
        try {
            const detailsPromises = checklists.map(async (checklist) => {
                try {
                    const response = await fetch(`/api/resource/${currentDoctype}/${checklist.name}`, {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        }
                    })
                    if (!response.ok) throw new Error('Failed to fetch')
                    const result = await response.json()
                    return result.data
                } catch (error) {
                    console.error(`Error fetching details for ${checklist.name}:`, error)
                    return null
                }
            })
            const details = await Promise.all(detailsPromises)
            setChecklistDetails(details.filter((d): d is ChecklistDoc => d !== null))
        } catch (error) {
            console.error('Error fetching checklist details:', error)
            setChecklistDetails([])
        } finally {
            setLoadingDetails(false)
        }
    }, [checklists, currentDoctype, isUpdating])

    useEffect(() => {
        fetchDetails()
    }, [fetchDetails])

    const allSkills: SkillItem[] = checklistDetails.flatMap(doc =>
        (doc.skills || []).map(skill => ({
            ...skill,
            checklistName: doc.name,
            checklistPerson: doc.person,
            modified: doc.modified,
            creation: doc.creation
        }))
    )

    const filteredSkills = allSkills.filter(skill => {
        const isCompleted = skill.criteria_met === 1 || skill.criteria_met === true
        return todoTab === 'active' ? !isCompleted : isCompleted
    })

    const totalSkills = allSkills.length
    const completedSkills = allSkills.filter(skill => skill.criteria_met === 1 || skill.criteria_met === true).length
    const progressPercentage = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0
    const totalPendingChecks = allSkills.filter(skill => {
        const isCompleted = skill.criteria_met === 1 || skill.criteria_met === true
        return !isCompleted
    }).length

    const handleSkillToggle = async (skill: SkillItem) => {
        const checklistName = skill.checklistName
        if (!checklistName) {
            toast.error('Checklist name not found')
            return
        }

        const previousDetails = [...checklistDetails]

        try {
            setIsUpdating(true)
            lastUpdateTime.current = Date.now()
            const newCriteriaMet = skill.criteria_met ? 0 : 1
            const checklistDoc = checklistDetails.find(doc => doc.name === checklistName)

            if (!checklistDoc) {
                toast.error('Checklist record not found.')
                setIsUpdating(false)
                return
            }

            setChecklistDetails(prevDocs =>
                prevDocs.map(d => {
                    if (d.name === checklistName) {
                        const updatedSkills = d.skills.map((s) => {
                            if (s.name === skill.name) {
                                return { ...s, criteria_met: newCriteriaMet, completed: newCriteriaMet }
                            }
                            return s
                        })
                        const allCompleted = updatedSkills.every(s => s.criteria_met === 1 || s.criteria_met === true)
                        return { ...d, skills: updatedSkills, criteria_met: allCompleted ? 1 : 0 }
                    }
                    return d
                })
            )

            const fetchResponse = await fetch(`/api/resource/${currentDoctype}/${checklistName}`)
            if (!fetchResponse.ok) throw new Error('Failed to fetch current document')
            const currentDoc = await fetchResponse.json()

            const updatedSkills = currentDoc.data.skills.map((s: SkillItem) => {
                if (s.name === skill.name) {
                    return { ...s, criteria_met: newCriteriaMet, completed: newCriteriaMet }
                }
                return s
            })

            const allSkillsCompleted = updatedSkills.every((s: SkillItem) => s.criteria_met === 1 || s.criteria_met === true)

            const updatePayload = {
                ...currentDoc.data,
                skills: updatedSkills,
                criteria_met: allSkillsCompleted ? 1 : 0,
            }

            const updateResponse = await fetch(`/api/resource/${currentDoctype}/${checklistName}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatePayload),
            })

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json()
                throw new Error(errorData.message || 'Update failed')
            }

            const updatedDoc = await updateResponse.json()
            setChecklistDetails(prevDocs =>
                prevDocs.map(d => d.name === checklistName ? updatedDoc.data : d)
            )

            toast.success(newCriteriaMet ? 'Skill marked as completed! ✓' : 'Skill marked as active')
        } catch (error: any) {
            console.error('Error toggling skill:', error)
            setChecklistDetails(previousDetails)
            toast.error(error?.message || 'Failed to update skill. Please try again.')
        } finally {
            setTimeout(() => {
                setIsUpdating(false)
            }, 2000)
        }
    }

    const handleAddSkill = async () => {
        if (!newSkillData.skill.trim()) {
            toast.error('Please enter a skill description')
            return
        }

        setIsAdding(true)
        setIsUpdating(true)
        lastUpdateTime.current = Date.now()

        try {
            let skillName = newSkillData.skill

            try {
                const skillResponse = await fetch('/api/resource/Skill', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        skill_name: newSkillData.skill,
                    })
                })

                if (skillResponse.ok) {
                    const skillResult = await skillResponse.json()
                    skillName = skillResult.data.name
                }
            } catch (skillError) {
                console.warn('Skill creation failed, using plain text:', skillError)
            }

            let parentDoc: ChecklistDoc

            if (checklistDetails.length > 0) {
                parentDoc = checklistDetails[0]
            } else {
                const createResponse = await fetch(`/api/resource/${currentDoctype}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        person: employee?.name,
                        person_name: employee?.employee_name,
                        designation: employee?.designation,
                        criteria_met: 0,
                        skills: []
                    })
                })

                if (!createResponse.ok) throw new Error('Failed to create checklist document')
                const createResult = await createResponse.json()
                parentDoc = createResult.data
            }

            const fetchResponse = await fetch(`/api/resource/${currentDoctype}/${parentDoc.name}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            })

            if (!fetchResponse.ok) throw new Error('Failed to fetch document')
            const fetchResult = await fetchResponse.json()
            const latestDoc = fetchResult.data

            const newSkillItem = {
                skill: skillName,
                priority: newSkillData.priority,
                criteria_met: 0,
                completed: 0,
                person: employee?.name,
                person_name: newSkillData.person_name || employee?.employee_name
            }

            const updatedSkills = [
                ...(latestDoc.skills || []).map((skill: SkillItem) => ({
                    name: skill.name,
                    skill: skill.skill,
                    priority: skill.priority || 'Medium',
                    criteria_met: skill.criteria_met || 0,
                    completed: skill.completed || skill.criteria_met || 0,
                    person: skill.person,
                    person_name: skill.person_name
                })),
                newSkillItem
            ]

            const updateResponse = await fetch(`/api/resource/${currentDoctype}/${latestDoc.name}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    person: latestDoc.person,
                    person_name: latestDoc.person_name,
                    designation: latestDoc.designation,
                    criteria_met: 0,
                    skills: updatedSkills
                })
            })

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json()
                throw new Error(errorData.exception || 'Failed to add skill')
            }

            const updatedDoc = await updateResponse.json()

            if (checklistDetails.length > 0) {
                setChecklistDetails(prev => prev.map(d => d.name === parentDoc.name ? updatedDoc.data : d))
            } else {
                setChecklistDetails([updatedDoc.data])
            }

            setNewSkillData({
                skill: '',
                person_name: employee?.employee_name || '',
                priority: 'Medium',
                completed: 0
            })
            setShowAddDialog(false)
            toast.success('Skill added successfully!')
        } catch (error: any) {
            console.error('Error adding skill:', error)
            toast.error(error.message || 'Failed to add skill. Please try again.')
        } finally {
            setIsAdding(false)
            setTimeout(() => {
                setIsUpdating(false)
            }, 2000)
        }
    }

    const isLoading = empLoading || checklistsLoading || loadingDetails || tasksLoading

    if (empLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50/30 to-yellow-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        )
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour >= 5 && hour < 12) return { text: "Good Morning", icon: Sun, color: "text-amber-600" }
        if (hour >= 12 && hour < 17) return { text: "Good Afternoon", icon: Sun, color: "text-orange-500" }
        if (hour >= 17 && hour < 21) return { text: "Good Evening", icon: Moon, color: "text-indigo-500" }
        return { text: "Good Night", icon: Moon, color: "text-slate-600" }
    }

    const greeting = getGreeting()
    const GreetingIcon = greeting.icon

    return (
        <div className="min-h-full w-full bg-gradient-to-br from-orange-50 via-amber-50/30 to-yellow-50 p-6 md:p-8">
            {/* HEADER SECTION */}
            <div className="mb-8 relative">
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-4 right-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl"></div>

                <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm border border-orange-100">
                            <GreetingIcon className={`h-5 w-5 ${greeting.color}`} />
                        </div>
                        <span className={`text-base font-semibold ${greeting.color}`}>{greeting.text}</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">{userData?.employee_name || "Employee"}!</span>
                    </h1>
                    <p className="text-gray-600 mt-2 flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">{userData?.designation || "Healthcare Professional"}</span>
                    </p>
                </div>
            </div>

            {/* TOP STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: "PENDING TASKS", value: totalPendingChecks, icon: CheckSquare, gradient: "from-orange-500 to-amber-500", bg: "bg-gradient-to-br from-orange-50 to-amber-50", iconColor: "text-orange-500", borderColor: "border-orange-400" },
                    { label: "ACTIVE PROJECTS", value: activeAssignments.length, icon: Briefcase, gradient: "from-amber-500 to-yellow-500", bg: "bg-gradient-to-br from-amber-50 to-yellow-50", iconColor: "text-amber-500", borderColor: "border-amber-400" },
                    { label: "COMPLETED", value: completedSkills, icon: CheckCircle, gradient: "from-yellow-500 to-orange-500", bg: "bg-gradient-to-br from-yellow-50 to-orange-50", iconColor: "text-yellow-600", borderColor: "border-orange-400" },
                    { label: "ACHIEVEMENTS", value: "12", icon: Award, gradient: "from-orange-600 to-red-500", bg: "bg-gradient-to-br from-orange-50 to-red-50", iconColor: "text-orange-600", borderColor: "border-orange-500" },
                ].map((stat, i) => (
                    <Card key={i} className={`border-2 ${stat.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white overflow-hidden group`}>
                        <CardContent className={`p-6 ${stat.bg}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">{stat.label}</p>
                                    <p className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT COLUMN - 8 cols */}
                <div className="lg:col-span-8 space-y-6">
                    {/* MY SKILLS CHECKLIST */}
                    <Card className="border-2 border-orange-400 shadow-lg rounded-2xl bg-white overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2"></div>
                        <CardContent className="p-6">
                            {/* Header */}
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
                                        <CheckCircle className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {selectedEmployee === employee?.name ? 'My' : 'Team'} Skills Checklist
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">Track and manage daily activities</p>
                                    </div>
                                    {checklists && juniors && juniors.length > 0 && (
                                        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                            <SelectTrigger className="w-[180px] h-9 text-xs ml-2 border-orange-200 focus:ring-orange-500">
                                                <SelectValue placeholder="Select Employee" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={employee?.name || ''}>
                                                    My Checklist
                                                </SelectItem>
                                                {juniors?.map((junior) => (
                                                    <SelectItem key={junior.name} value={junior.name}>
                                                        {junior.employee_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <button
                                        onClick={() => setTodoTab('active')}
                                        className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${todoTab === 'active'
                                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
                                            }`}
                                    >
                                        Active
                                    </button>
                                    <button
                                        onClick={() => setTodoTab('completed')}
                                        className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${todoTab === 'completed'
                                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
                                            }`}
                                    >
                                        Completed
                                    </button>
                                    <Button
                                        onClick={() => navigate(`/hrms/designation-skill/${frequencyTab}`)}
                                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl px-5 py-2 font-semibold shadow-lg shadow-orange-200"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Assign Skills
                                    </Button>
                                </div>
                            </div>

                            {/* Frequency Tabs */}
                            <div className="flex gap-2 mb-6 overflow-auto pb-2">
                                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((freq) => (
                                    <button
                                        key={freq}
                                        onClick={() => setFrequencyTab(freq)}
                                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${frequencyTab === freq
                                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-orange-300'
                                            }`}
                                    >
                                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {/* Progress Section */}
                            <div className="mb-6 p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Activity className="h-5 w-5 text-orange-600" />
                                            <p className="text-sm font-bold text-gray-800 uppercase tracking-wide">OVERALL PROGRESS</p>
                                        </div>
                                        <p className="text-xs text-gray-600">{completedSkills} of {totalSkills} tasks completed</p>
                                        {checklists && checklists.length > 0 && (
                                            <div className="flex gap-2 mt-2">
                                                <Badge variant="outline" className={`text-xs font-semibold
                                                    ${checklists[0].docstatus === 0 ? 'bg-gray-100 text-gray-700 border-gray-300' : ''}
                                                    ${checklists[0].docstatus === 1 ? 'bg-orange-50 text-orange-700 border-orange-300' : ''}
                                                    ${checklists[0].docstatus === 2 ? 'bg-rose-50 text-rose-700 border-rose-300' : ''}
                                                `}>
                                                    {checklists[0].docstatus === 0 ? 'Draft' :
                                                        checklists[0].docstatus === 1 ? 'Submitted' :
                                                            checklists[0].docstatus === 2 ? 'Cancelled' : ''}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{progressPercentage}%</p>
                                    </div>
                                </div>
                                <Progress value={progressPercentage} className="h-3 bg-white/50 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-amber-500 rounded-full" />
                                <div className="flex items-center gap-3 mt-4">
                                    <Badge className="bg-white/80 text-orange-700 border-0 px-4 py-1.5 rounded-lg font-semibold shadow-sm">
                                        {totalPendingChecks} Pending
                                    </Badge>
                                    <Badge className="bg-white/80 text-amber-700 border-0 px-4 py-1.5 rounded-lg font-semibold shadow-sm">
                                        {completedSkills} Completed
                                    </Badge>
                                </div>
                            </div>

                            {/* Skills List */}
                            <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-64">
                                        <div className="text-center">
                                            <Loader2 className="h-10 w-10 animate-spin text-orange-600 mx-auto mb-3" />
                                            <p className="text-gray-600 font-medium">Loading tasks...</p>
                                        </div>
                                    </div>
                                ) : filteredSkills.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-center">
                                        <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl mb-4">
                                            <CheckSquare className="h-16 w-16 text-orange-300" />
                                        </div>
                                        <p className="text-lg font-semibold text-gray-700">No {todoTab} tasks</p>
                                        <p className="text-sm text-gray-500 mt-1">for {frequencyTab} checklist</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredSkills.map((skill, idx) => {
                                            const isSkillCompleted = skill.criteria_met === 1 || skill.criteria_met === true
                                            return (
                                                <div
                                                    key={`${skill.checklistName}-${skill.name || idx}`}
                                                    className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-orange-200 transition-all group"
                                                >
                                                    <div
                                                        className="cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleSkillToggle(skill)
                                                        }}
                                                    >
                                                        <div
                                                            className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSkillCompleted
                                                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-orange-500'
                                                                : 'border-gray-300 hover:border-orange-400 group-hover:scale-110'
                                                                }`}
                                                        >
                                                            {isSkillCompleted && (
                                                                <Check className="h-4 w-4 text-white stroke-[3]" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p
                                                            className={`text-sm font-medium transition-all ${isSkillCompleted ? 'text-gray-400 line-through' : 'text-gray-800'
                                                                }`}
                                                        >
                                                            {skill.skill || 'Unnamed skill'}
                                                        </p>
                                                        {skill.person_name && (
                                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                                <Heart className="h-3 w-3 text-orange-500" />
                                                                {skill.person_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {skill.priority && (
                                                            <Badge
                                                                className={`text-xs font-semibold px-3 py-1 rounded-lg ${skill.priority === 'High'
                                                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                                    : skill.priority === 'Medium'
                                                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                                        : 'bg-orange-50 text-orange-700 border border-orange-200'
                                                                    }`}
                                                            >
                                                                {skill.priority}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* ASSIGNMENTS */}
                    <Card className="border-2 border-amber-400 shadow-lg rounded-2xl bg-white overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2"></div>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl">
                                    <Briefcase className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Active Assignments</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Current projects and tasks</p>
                                </div>
                            </div>

                            {tasksLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="text-center">
                                        <Loader2 className="h-10 w-10 animate-spin text-amber-600 mx-auto mb-3" />
                                        <p className="text-gray-600 font-medium">Loading assignments...</p>
                                    </div>
                                </div>
                            ) : activeAssignments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl mb-4">
                                        <Briefcase className="h-16 w-16 text-amber-300" />
                                    </div>
                                    <p className="text-lg font-semibold text-gray-700">No active assignments</p>
                                    <p className="text-sm text-gray-500 mt-1">Tasks assigned to you will appear here</p>
                                </div>
                            ) : (
                                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                    {activeAssignments.map((asgn, i) => (
                                        <div key={i} className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-amber-200 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="text-base font-bold text-gray-900 flex-1 pr-2">{asgn.title}</h4>
                                                <Badge
                                                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border flex-shrink-0 ${asgn.priority === 'High'
                                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                        : asgn.priority === 'Medium'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                            : 'bg-orange-50 text-orange-700 border-orange-200'
                                                        }`}
                                                >
                                                    {asgn.priority}
                                                </Badge>
                                            </div>
                                            {asgn.dept && asgn.dept !== 'No Project' && (
                                                <p className="text-xs text-gray-600 mb-3 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-100 w-fit">
                                                    <Briefcase className="h-3.5 w-3.5 text-amber-600" />
                                                    {asgn.dept}
                                                </p>
                                            )}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-semibold text-gray-700">
                                                    <span>Progress</span>
                                                    <span className="text-amber-600">{asgn.progress}%</span>
                                                </div>
                                                <Progress
                                                    value={asgn.progress}
                                                    className={`h-2.5 bg-gray-200 rounded-full ${asgn.priority === 'High'
                                                        ? '[&>div]:bg-gradient-to-r [&>div]:from-rose-500 [&>div]:to-pink-500'
                                                        : asgn.priority === 'Medium'
                                                            ? '[&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-500'
                                                            : '[&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-amber-500'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN - 4 cols */}
                <div className="lg:col-span-4 space-y-6">
                    {/* NOTIFICATIONS */}
                    <DashboardNotificationCard />

                    {/* PERFORMANCE INDEX */}
                    <Card className="border-2 border-orange-400 shadow-lg rounded-2xl bg-white overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2"></div>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                                    <Target className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">Performance Index</h3>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">MONTHLY EFFICIENCY</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center py-6">
                                <div className="relative mb-6">
                                    <svg width="180" height="180" viewBox="0 0 180 180">
                                        <defs>
                                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#f97316" />
                                                <stop offset="100%" stopColor="#fbbf24" />
                                            </linearGradient>
                                        </defs>
                                        <circle cx="90" cy="90" r="70" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                                        <circle
                                            cx="90"
                                            cy="90"
                                            r="70"
                                            fill="none"
                                            stroke="url(#progressGradient)"
                                            strokeWidth="12"
                                            strokeDasharray={`${(performanceScore / 100) * 439.6} 439.6`}
                                            strokeLinecap="round"
                                            transform="rotate(-90 90 90)"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-5xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{performanceScore}%</span>
                                    </div>
                                </div>
                                <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 px-6 py-2 rounded-xl font-bold text-sm mb-3 shadow-lg">
                                    TOP PERFORMER
                                </Badge>
                                <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                    <TrendingUp className="h-4 w-4 text-amber-600" />
                                    <span className="font-semibold text-amber-600">+4%</span> from last month
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* RECENT CLAIMS */}
                    <Card className="border-2 border-yellow-400 shadow-lg rounded-2xl bg-white overflow-hidden">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2"></div>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
                                    <Receipt className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">Recent Claims</h3>
                                    <p className="text-xs text-gray-500">Latest expense submissions</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {recentExpenses.map((exp, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                                                <FileText className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{exp.purpose}</p>
                                                <Badge
                                                    className={`text-[10px] uppercase font-semibold mt-1.5 px-2.5 py-0.5 rounded-md ${exp.status === 'Approved'
                                                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                        }`}
                                                >
                                                    {exp.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <p className="text-base font-bold text-gray-900">₹{exp.amount}</p>
                                    </div>
                                ))}
                                <Button variant="ghost" className="w-full text-orange-600 font-semibold hover:bg-orange-50 rounded-xl group">
                                    View All Claims
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ADD SKILL DIALOG */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="sm:max-w-[500px] rounded-2xl border-0 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg">
                                <Plus className="h-5 w-5 text-orange-600" />
                            </div>
                            Add New Skill
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-600">
                            Add a new skill to your {frequencyTab} checklist.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="skill" className="text-sm font-semibold text-gray-700">
                                Skill Description <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="skill"
                                placeholder="Enter skill or task..."
                                value={newSkillData.skill}
                                onChange={(e) => setNewSkillData(prev => ({ ...prev, skill: e.target.value }))}
                                className="border-gray-200 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="person_name" className="text-sm font-semibold text-gray-700">
                                Person Name
                            </Label>
                            <Input
                                id="person_name"
                                placeholder="Enter person name..."
                                value={newSkillData.person_name}
                                onChange={(e) => setNewSkillData(prev => ({ ...prev, person_name: e.target.value }))}
                                className="border-gray-200 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priority" className="text-sm font-semibold text-gray-700">
                                Priority
                            </Label>
                            <Select
                                value={newSkillData.priority}
                                onValueChange={(value) => setNewSkillData(prev => ({ ...prev, priority: value }))}
                            >
                                <SelectTrigger className="border-gray-200 rounded-xl focus:ring-orange-500">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowAddDialog(false)
                                setNewSkillData({
                                    skill: '',
                                    person_name: employee?.employee_name || '',
                                    priority: 'Medium',
                                    completed: 0
                                })
                            }}
                            className="rounded-xl border-gray-200 hover:bg-gray-50"
                            disabled={isAdding}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddSkill}
                            disabled={isAdding || !newSkillData.skill.trim()}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-lg"
                        >
                            {isAdding ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Skill
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #f97316, #fbbf24);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #ea580c, #f59e0b);
                }
            `}</style>
        </div>
    )
}

export default EmployeeMainDashboard