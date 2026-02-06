"use client"

import * as React from "react"
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    Search,
    Command,
    Plus,
    FileText,
    BarChart3,
    Building2,
    Shield,
    Package,
    Users,
    Banknote,
    PieChart,
    Layers,
    GitBranch,
    TrendingUp,
    Wrench,
    Warehouse,
    ClipboardCheck,
    Clock,
    UserPlus,
    Briefcase,
    DollarSign,
    HardHat,
    Zap,
    Home,
    Activity,
    CheckCircle,
    Ruler,
    Calculator as CalcIcon,
    Award,
    UserCircle
} from "lucide-react"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import { useNavigate } from "react-router-dom"
import { navigationGroups } from "@/components/custom_components/Custom_Sidebar"
import { useFrappeGetCall } from "frappe-react-sdk"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CommandPaletteProps {
    open: boolean
    setOpen: (open: boolean) => void
}

interface NavigationLink {
    title: string
    href: string
    icon: any
    category: string
    subcategory?: string
    color?: string
}

const CATEGORY_STYLES: Record<string, { icon: any, color: string }> = {
    "Dashboards": { icon: BarChart3, color: "from-blue-500 to-indigo-600" },
    "Core Operations": { icon: Layers, color: "from-cyan-500 to-blue-600" },
    "Workforce & HR": { icon: Users, color: "from-orange-500 to-red-600" },
    "Assets & Logistics": { icon: Package, color: "from-indigo-500 to-purple-600" },
    "Compliance & HSEQ": { icon: Shield, color: "from-red-500 to-rose-600" },
}

export function CommandPalette({ open, setOpen }: CommandPaletteProps) {
    const navigate = useNavigate()
    const [query, setQuery] = React.useState("")
    const [debouncedQuery, setDebouncedQuery] = React.useState("")

    // Debounce query
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query)
        }, 300)
        return () => clearTimeout(timer)
    }, [query])

    // Global Search
    const { data: searchResults, isLoading: searchLoading } = useFrappeGetCall(
        "frappe.search.search",
        { txt: debouncedQuery },
        debouncedQuery.length > 2 ? undefined : null
    )

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [setOpen])

    // Flatten sidebar config for easier searching - Updated for new structure
    const getAllLinks = (): NavigationLink[] => {
        const links: NavigationLink[] = []

        const processItems = (items: any[], category: string, subcategory?: string) => {
            items.forEach(item => {
                if (item.href) {
                    links.push({
                        title: item.title,
                        href: item.href,
                        icon: item.icon,
                        category,
                        subcategory,
                        color: item.color
                    })
                }
                // Handle nested items (subItems in the new structure)
                if (item.subItems) {
                    processItems(item.subItems, category, item.title)
                }
            })
        }

        navigationGroups.forEach((section) => {
            if (section.items && Array.isArray(section.items)) {
                processItems(section.items, section.group, undefined)
            }
        })

        return links
    }

    const allLinks = getAllLinks()

    // Group links by category for better organization
    const linksByCategory = React.useMemo(() => {
        const grouped: Record<string, NavigationLink[]> = {}
        allLinks.forEach(link => {
            if (!grouped[link.category]) {
                grouped[link.category] = []
            }
            grouped[link.category].push(link)
        })
        return grouped
    }, [allLinks])

    // Get category icon and color
    const getCategoryStyle = (category: string) => {
        return CATEGORY_STYLES[category] || { icon: FileText, color: 'from-gray-500 to-gray-600' }
    }

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <div className="border-b border-border/50 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <Search className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-slate-900">Command Palette</h3>
                        <p className="text-[10px] text-slate-600">Quick navigation and search</p>
                    </div>
                </div>
                <CommandInput
                    placeholder="Type a command or search..."
                    value={query}
                    onValueChange={setQuery}
                    className="border-0 bg-white shadow-sm pl-4"
                />

            </div>

            <CommandList className="max-h-[400px]">
                <CommandEmpty>
                    <div className="py-6 text-center">
                        <Search className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">No results found.</p>
                    </div>
                </CommandEmpty>

                {/* Global Search Results */}
                {debouncedQuery.length > 2 && searchResults?.message && searchResults.message.length > 0 && (
                    <>
                        <CommandGroup heading="🔍 Global Search Results">
                            {searchResults.message.slice(0, 5).map((result: any, index: number) => (
                                <CommandItem
                                    key={`${result.doctype}-${result.name}-${index}`}
                                    onSelect={() => runCommand(() => {
                                        const route = `/${result.doctype.toLowerCase().replace(/ /g, '-')}/${result.name}`
                                        navigate(route)
                                    })}
                                    className="flex items-center gap-3 px-3 py-2"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
                                        <FileText className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate">{result.name}</div>
                                        <div className="text-xs text-muted-foreground">{result.doctype}</div>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator className="my-2" />
                    </>
                )}

                {/* Quick Actions */}
                <CommandGroup heading="⚡ Quick Actions">
                    <CommandItem
                        onSelect={() => runCommand(() => navigate('/task-manager/new'))}
                        className="flex items-center gap-3 px-3 py-2"
                    >
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
                            <Plus className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-sm">New Task</span>
                        <CommandShortcut>⌘T</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => navigate('/projects/new'))}
                        className="flex items-center gap-3 px-3 py-2"
                    >
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                            <Plus className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-sm">New Project</span>
                        <CommandShortcut>⌘P</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => navigate('/hrms/attendance'))}
                        className="flex items-center gap-3 px-3 py-2"
                    >
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-sm">
                            <Clock className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-sm">Mark Attendance</span>
                        <CommandShortcut>⌘A</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => navigate('/reports/new'))}
                        className="flex items-center gap-3 px-3 py-2"
                    >
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm">
                            <FileText className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-sm">Create Report</span>
                        <CommandShortcut>⌘R</CommandShortcut>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator className="my-2" />

                {/* Navigation by Category */}
                {Object.entries(linksByCategory).map(([category, links]) => {
                    const { icon: CategoryIcon, color } = getCategoryStyle(category)

                    return (
                        <React.Fragment key={category}>
                            <CommandGroup
                                heading={
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "h-4 w-4 rounded flex items-center justify-center bg-gradient-to-br shadow-sm",
                                            color.replace('from-', 'from-').replace('to-', 'to-')
                                        )}>
                                            <CategoryIcon className="h-2.5 w-2.5 text-white" />
                                        </div>
                                        <span>{category}</span>
                                    </div>
                                }
                            >
                                {links.slice(0, 8).map((link, index) => {
                                    const Icon = link.icon || FileText
                                    return (
                                        <CommandItem
                                            key={`${link.href}-${index}`}
                                            onSelect={() => runCommand(() => navigate(link.href))}
                                            className="flex items-center gap-3 px-3 py-2"
                                        >
                                            <Icon className={cn("h-4 w-4", link.color || "text-slate-500")} />
                                            <div className="flex-1 flex items-center justify-between min-w-0">
                                                <span className="font-medium text-sm truncate">{link.title}</span>
                                                {link.subcategory && (
                                                    <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0">
                                                        {link.subcategory}
                                                    </Badge>
                                                )}
                                            </div>
                                        </CommandItem>
                                    )
                                })}
                                {links.length > 8 && (
                                    <CommandItem disabled className="text-xs text-muted-foreground italic">
                                        +{links.length - 8} more items...
                                    </CommandItem>
                                )}
                            </CommandGroup>
                            <CommandSeparator className="my-2" />
                        </React.Fragment>
                    )
                })}

                {/* Settings & Profile */}
                <CommandGroup heading="⚙️ Settings">
                    <CommandItem
                        onSelect={() => runCommand(() => navigate('/hrms/profile'))}
                        className="flex items-center gap-3 px-3 py-2"
                    >
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shadow-sm">
                            <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-sm">My Profile</span>
                        <CommandShortcut>⌘,</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => navigate('/settings'))}
                        className="flex items-center gap-3 px-3 py-2"
                    >
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shadow-sm">
                            <Settings className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-sm">Settings</span>
                        <CommandShortcut>⌘S</CommandShortcut>
                    </CommandItem>
                </CommandGroup>

                {/* Search Hint */}
                {!debouncedQuery && (
                    <div className="px-4 py-3 border-t border-border/50 bg-muted/30">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Search className="h-3 w-3" />
                            <span>Type at least 3 characters to search globally</span>
                        </div>
                    </div>
                )}
            </CommandList>
        </CommandDialog>
    )
}