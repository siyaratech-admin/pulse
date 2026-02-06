import React, { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, CheckCircle, Briefcase, FileText, Zap, Activity, CheckSquare, Check, Sun, Moon, ArrowRight, Receipt, Award, Target, TrendingUp, Plus, Calendar } from "lucide-react"
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
        if (score >= 80) return "text-emerald-500"
        if (score >= 50) return "text-amber-500"
        return "text-red-500"
    }

    const getPerformanceBg = (score: number) => {
        if (score >= 80) return "bg-emerald-500 hover:bg-emerald-600"
        if (score >= 50) return "bg-amber-500 hover:bg-amber-600"
        return "text-red-500 hover:bg-red-600"
    }

    const recentExpenses = [
        { id: "EXP-001", purpose: "Office Supplies", amount: 350, status: "Approved" },
        { id: "EXP-002", purpose: "Client Lunch", amount: 125.50, status: "Pending" },
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
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
            </div>
        )
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour >= 5 && hour < 12) return { text: "Good Morning", icon: Sun, color: "text-orange-500" }
        if (hour >= 12 && hour < 17) return { text: "Good Afternoon", icon: Sun, color: "text-orange-500" }
        if (hour >= 17 && hour < 21) return { text: "Good Evening", icon: Moon, color: "text-purple-500" }
        return { text: "Good Night", icon: Moon, color: "text-slate-600" }
    }

    const greeting = getGreeting()
    const GreetingIcon = greeting.icon

    return (
        <div className="min-h-full w-full bg-gray-50 p-6 md:p-8">
            {/* HEADER SECTION */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <GreetingIcon className={`h-5 w-5 ${greeting.color}`} />
                    <span className={`text-base font-semibold ${greeting.color}`}>{greeting.text}</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900">
                    Welcome back, <span className="text-purple-600">{userData?.employee_name || "Employee"}!</span>
                </h1>
            </div>

            {/* TOP STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: "PENDING CHECKS", value: totalPendingChecks, icon: CheckSquare, color: "text-purple-500", bg: "bg-purple-50" },
                    { label: "PROJECTS", value: activeAssignments.length, icon: Briefcase, color: "text-purple-600", bg: "bg-purple-100" },
                    { label: "ENERGY", value: completedSkills, icon: Zap, color: "text-orange-500", bg: "bg-orange-50" },
                    { label: "AWARDS", value: "12", icon: Award, color: "text-amber-500", bg: "bg-amber-50" },
                ].map((stat, i) => (
                    <Card key={i} className="border-0 shadow-sm rounded-2xl bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
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
                    <Card className="border-0 shadow-sm rounded-2xl bg-white">
                        <CardContent className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6 w-full">
                                <div className="flex flex-col lg:flex-row items-center gap-3 w-full ">
                                    <CheckCircle className="h-6 w-6 text-purple-600" />
                                    <h3 className="flex  text-md lg;text-xl font-bold text-gray-900">
                                        {selectedEmployee === employee?.name ? 'My' : 'Team'} Skills Checklist
                                    </h3>
                                    {/* Team Selection Dropdown */}
                                    {checklists && (
                                        <div className="ml-2 flex ">
                                            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                                <SelectTrigger className="w-[180px] h-9 text-xs">
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
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 w-full">
                                    <button
                                        onClick={() => setTodoTab('active')}
                                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${todoTab === 'active'
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        Active
                                    </button>
                                    <button
                                        onClick={() => setTodoTab('completed')}
                                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${todoTab === 'completed'
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        Completed
                                    </button>
                                    <Button
                                        onClick={() => navigate(`/hrms/designation-skill/${frequencyTab}`)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 py-2.5 font-semibold shadow-md"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Assign Skills
                                    </Button>
                                </div>
                            </div>

                            {/* Frequency Tabs */}
                            <div className="flex gap-2 mb-6 w-full overflow-auto">
                                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((freq) => (
                                    <button
                                        key={freq}
                                        onClick={() => setFrequencyTab(freq)}
                                        className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${frequencyTab === freq
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {/* Progress Section */}
                            <div className="mb-6 p-5 bg-gray-50 rounded-2xl">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex flex-col gap-1">
                                        <div>
                                            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">OVERALL PROGRESS</p>
                                            <p className="text-xs text-gray-500 mt-1">{completedSkills} of {totalSkills} tasks completed</p>
                                        </div>
                                        {checklists && checklists.length > 0 && (
                                            <div className="flex gap-2 mt-1">
                                                <Badge variant="outline" className={`
                                                    ${checklists[0].docstatus === 0 ? 'bg-gray-100 text-gray-600 border-gray-200' : ''}
                                                    ${checklists[0].docstatus === 1 ? 'bg-green-50 text-green-600 border-green-200' : ''}
                                                    ${checklists[0].docstatus === 2 ? 'bg-red-50 text-red-600 border-red-200' : ''}
                                                `}>
                                                    {checklists[0].docstatus === 0 ? 'Draft' :
                                                        checklists[0].docstatus === 1 ? 'Submitted' :
                                                            checklists[0].docstatus === 2 ? 'Cancelled' : ''}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-3xl font-bold text-purple-700">{progressPercentage}%</p>
                                </div>
                                <Progress value={progressPercentage} className="h-2.5 bg-gray-200 [&>div]:bg-purple-600" />
                                <div className="flex items-center gap-3 mt-4">
                                    <Badge className="bg-purple-50 text-purple-600 border-0 px-4 py-1.5 rounded-lg font-semibold">
                                        {totalPendingChecks} Pending
                                    </Badge>
                                    <Badge className="bg-green-50 text-green-600 border-0 px-4 py-1.5 rounded-lg font-semibold">
                                        {completedSkills} Completed
                                    </Badge>
                                </div>
                            </div>

                            {/* Skills List */}
                            <div className="h-[500px] overflow-y-auto pr-2">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                                    </div>
                                ) : filteredSkills.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <CheckSquare className="h-16 w-16 text-gray-300 mb-4" />
                                        <p className="text-lg font-semibold text-gray-500">No {todoTab} skills found for {frequencyTab}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredSkills.map((skill, idx) => {
                                            const isSkillCompleted = skill.criteria_met === 1 || skill.criteria_met === true
                                            return (
                                                <div
                                                    key={`${skill.checklistName}-${skill.name || idx}`}
                                                    className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all"
                                                >
                                                    <div
                                                        className="cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleSkillToggle(skill)
                                                        }}
                                                    >
                                                        <div
                                                            className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${isSkillCompleted
                                                                ? 'bg-green-500 border-green-500'
                                                                : 'border-gray-300 hover:border-purple-400'
                                                                }`}
                                                        >
                                                            {isSkillCompleted && (
                                                                <Check className="h-3 w-3 text-white stroke-[3]" />
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
                                                            <p className="text-xs text-gray-500 mt-1">Assigned to: {skill.person_name}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {skill.priority && (
                                                            <Badge
                                                                className={`text-xs font-semibold px-3 py-1 rounded-lg ${skill.priority === 'High'
                                                                    ? 'bg-red-50 text-red-600 border-0'
                                                                    : skill.priority === 'Medium'
                                                                        ? 'bg-yellow-50 text-yellow-700 border-0'
                                                                        : 'bg-purple-50 text-purple-600 border-0'
                                                                    }`}
                                                            >
                                                                {skill.priority}
                                                            </Badge>
                                                        )}
                                                        <Badge className="text-xs bg-purple-50 text-purple-600 border-0 px-3 py-1 rounded-lg font-medium">
                                                            {skill.checklistName}
                                                        </Badge>
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
                    <Card className="border-0 shadow-sm rounded-2xl bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Activity className="h-6 w-6 text-purple-600" />
                                <h3 className="text-xl font-bold text-gray-900">Assignments</h3>
                            </div>

                            {tasksLoading ? (
                                <div className="flex items-center justify-center h-40">
                                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                                </div>
                            ) : activeAssignments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-center">
                                    <Briefcase className="h-12 w-12 text-gray-300 mb-3" />
                                    <p className="text-sm font-semibold text-gray-500">No active assignments</p>
                                    <p className="text-xs text-gray-400 mt-1">Tasks assigned to you will appear here</p>
                                </div>
                            ) : (
                                <div className="h-[400px] overflow-y-auto pr-2 space-y-4">
                                    {activeAssignments.map((asgn, i) => (
                                        <div key={i} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-sm transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="text-base font-bold text-gray-900 flex-1 pr-2">{asgn.title}</h4>
                                                <Badge
                                                    className={`text-xs font-semibold px-3 py-1 rounded-lg border-0 flex-shrink-0 ${asgn.priority === 'High'
                                                        ? 'bg-red-50 text-red-600'
                                                        : asgn.priority === 'Medium'
                                                            ? 'bg-yellow-50 text-yellow-700'
                                                            : 'bg-purple-50 text-purple-600'
                                                        }`}
                                                >
                                                    {asgn.priority}
                                                </Badge>
                                            </div>
                                            {asgn.dept && asgn.dept !== 'No Project' && (
                                                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                                                    <Briefcase className="h-3 w-3" />
                                                    {asgn.dept}
                                                </p>
                                            )}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-semibold text-gray-600">
                                                    <span>Progress</span>
                                                    <span>{asgn.progress}%</span>
                                                </div>
                                                <Progress
                                                    value={asgn.progress}
                                                    className={`h-2 bg-gray-200 ${asgn.priority === 'High'
                                                        ? '[&>div]:bg-red-500'
                                                        : asgn.priority === 'Medium'
                                                            ? '[&>div]:bg-yellow-500'
                                                            : '[&>div]:bg-purple-500'
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
                    {/* PERFORMANCE INDEX */}
                    <Card className="border-0 shadow-sm rounded-2xl bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Target className="h-6 w-6 text-blue-500" />
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">Performance Index</h3>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">MONTHLY EFFICIENCY</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center py-6">
                                <div className="relative mb-6">
                                    <svg width="180" height="180" viewBox="0 0 180 180">
                                        <circle cx="90" cy="90" r="70" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                                        <circle
                                            cx="90"
                                            cy="90"
                                            r="70"
                                            fill="none"
                                            stroke="#10b981"
                                            strokeWidth="12"
                                            strokeDasharray={`${(performanceScore / 100) * 439.6} 439.6`}
                                            strokeLinecap="round"
                                            transform="rotate(-90 90 90)"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-5xl font-black text-green-500">{performanceScore}%</span>
                                    </div>
                                </div>
                                <Badge className="bg-green-500 text-white border-0 px-6 py-2 rounded-xl font-bold text-sm mb-3">
                                    TOP PERFORMER
                                </Badge>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                    +4% from last month
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* RECENT CLAIMS */}
                    <Card className="border-0 shadow-sm rounded-2xl bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Receipt className="h-6 w-6 text-blue-500" />
                                <h3 className="text-base font-bold text-gray-900">Recent Claims</h3>
                            </div>
                            <div className="space-y-4">
                                {recentExpenses.map((exp, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg">
                                                <FileText className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{exp.purpose}</p>
                                                <Badge
                                                    className={`text-[10px] uppercase font-semibold mt-1 px-2 py-0.5 rounded ${exp.status === 'Approved'
                                                        ? 'bg-green-50 text-green-700 border-0'
                                                        : 'bg-yellow-50 text-yellow-700 border-0'
                                                        }`}
                                                >
                                                    {exp.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <p className="text-base font-bold text-gray-900">₹{exp.amount}</p>
                                    </div>
                                ))}
                                <Button variant="ghost" className="w-full text-blue-500 font-semibold hover:bg-blue-50 rounded-xl">
                                    View All
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ADD SKILL DIALOG */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="sm:max-w-[500px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-blue-500" />
                            Add New Skill
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500">
                            Add a new skill to your {frequencyTab} checklist.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="skill" className="text-sm font-semibold text-gray-700">
                                Skill Description <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="skill"
                                placeholder="Enter skill or task..."
                                value={newSkillData.skill}
                                onChange={(e) => setNewSkillData(prev => ({ ...prev, skill: e.target.value }))}
                                className="border-gray-200 rounded-xl"
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
                                className="border-gray-200 rounded-xl"
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
                                <SelectTrigger className="border-gray-200 rounded-xl">
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
                            className="rounded-xl"
                            disabled={isAdding}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddSkill}
                            disabled={isAdding || !newSkillData.skill.trim()}
                            className="bg-blue-500 hover:bg-blue-600 rounded-xl"
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
        </div>
    )
}

export default EmployeeMainDashboard