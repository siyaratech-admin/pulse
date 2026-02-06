"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import Custom_Sidebar from "./Custom_Sidebar"
import { cn } from "../../lib/utils"
import { useFrappeAuth } from "frappe-react-sdk"
import { Button } from "../ui/button"
import { LogOut, User, Menu, Plus, Bell, Search, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { NotificationBell } from "../notifications/NotificationBell"
import { CommandPalette } from "../common/CommandPalette"
import TaskCreationOptionsModal from "../../pages/modules/TaskManager/components/TaskCreationOptionsModal"

interface MainLayoutProps {
  children?: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const { currentUser, logout } = useFrappeAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Handle keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsCommandPaletteOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Check for mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setSidebarCollapsed(true)
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Handle logout
  const handleLogout = () => {
    logout()
  }

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    )
  }

  // Task creation handlers
  const handleOpenTaskModal = () => {
    setIsTaskModalOpen(true)
  }

  const handleCreateNewTask = () => {
    navigate("/task-manager/new?returnUrl=/task-manager")
  }

  const handleCreateFromLibrary = () => {
    navigate("/task-manager/library-selection?returnUrl=/task-manager")
  }

  const handleBulkCreate = () => {
    navigate("/task-manager/bulk-create?returnUrl=/task-manager")
  }

  // Helper functions for dynamic page titles
  function getPageTitle(pathname: string): string {
    const routes: Record<string, string> = {
      "/": "Dashboard",
      "/projects": "Projects",
      "/safety": "Safety Management",
      "/task-manager": "Task Manager",
      "/team": "Team",
      "/analytics": "Analytics",
      "/reports": "Reports",
      "/inventory": "Inventory",
      "/documents": "Documents",
    }
    const matchedRoute = Object.keys(routes).find(route =>
      route !== "/" && pathname.startsWith(route)
    )
    return matchedRoute ? routes[matchedRoute] : routes[pathname] || "Dashboard"
  }

  function getPageDescription(pathname: string): string {
    const descriptions: Record<string, string> = {
      "/": "Welcome back! Here's what's happening in your workspace.",
      "/projects": "Manage and track all your projects in one place",
      "/safety": "Monitor and manage safety protocols and incidents",
      "/task-manager": "Organize, track, and manage your tasks efficiently",
      "/team": "Manage team members and departments",
      "/analytics": "View performance metrics and insights",
      "/reports": "Generate and view detailed reports",
      "/inventory": "Track and manage inventory items",
      "/documents": "Organize and manage documents",
    }
    const matchedRoute = Object.keys(descriptions).find(route =>
      route !== "/" && pathname.startsWith(route)
    )
    return matchedRoute ? descriptions[matchedRoute] : descriptions[pathname] || "Navigate through your workspace"
  }

  return (
    <div className="flex h-full overflow-hidden bg-background text-foreground font-sans">
      {/* Sidebar */}
      {/* On mobile, sidebar is positioned absolutely inside Custom_Sidebar */}
      {/* On desktop, it remains in the layout flow */}
      {!isMobile && (
        <aside
          className={cn(
            "relative z-30 flex-shrink-0 transition-all duration-300 ease-in-out h-full",
            sidebarCollapsed ? "w-20" : "w-72",
          )}
        >
          <Custom_Sidebar
            isCollapsed={sidebarCollapsed}
            isMobile={isMobile}
            onToggle={toggleSidebar}
            className="h-full"
          />
        </aside>
      )}

      {/* Mobile sidebar - rendered separately to avoid layout issues */}
      {isMobile && (
        <Custom_Sidebar
          isCollapsed={sidebarCollapsed}
          isMobile={isMobile}
          onToggle={toggleSidebar}
          className={cn("h-full shadow-2xl", sidebarCollapsed && "hidden")}
        />
      )}

      {/* Mobile overlay */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-gradient-to-br from-orange-50/30 via-amber-50/20 to-white">
        {/* Top header */}
        <header className="flex h-16 items-center justify-between bg-white px-4 md:px-8 border-b border-orange-200/30 z-20 sticky top-0 shadow-sm">
          <div className="flex items-center gap-3 md:gap-6">
            {/* Mobile sidebar trigger */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="md:hidden hover:bg-orange-50 hover:text-orange-700"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            {/* Page Title - Dynamic based on route - REMOVED to avoid double headers */}
            {/* <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight text-foreground">{getPageTitle(location.pathname)}</h1>
              <p className="text-xs text-muted-foreground hidden md:block">{getPageDescription(location.pathname)}</p>
            </div> */}
          </div>

          {/* Search Bar (Awesome Bar Trigger) */}
          <div className="flex-1 w-full max-w-xl mx-2 sm:mx-4">
            <div
              className="relative group cursor-pointer"
              onClick={() => setIsCommandPaletteOpen(true)}
            >
              {/* Search Icon */}
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600/70 group-hover:text-orange-600 transition-colors" />

              {/* Input Shell */}
              <div className="relative w-full h-10 pl-10 pr-4 rounded-xl bg-gradient-to-r from-orange-50/50 to-amber-50/50 border border-orange-200/30 hover:bg-white hover:border-orange-400/40 hover:ring-2 hover:ring-orange-500/20 transition-all flex items-center overflow-hidden">

                {/* Centered Text - Responsive */}
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-gray-600 pointer-events-none whitespace-nowrap">
                  <span className="hidden sm:inline">Search or type a command...</span>
                  <span className="sm:hidden">Search...</span>
                </span>

                {/* Shortcut (hide on mobile) */}
                <kbd className="ml-auto pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-orange-300/50 bg-gradient-to-r from-orange-50 to-amber-50 px-1.5 font-mono text-[10px] font-medium text-orange-700">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
          </div>



          {/* Header Actions */}
          <div className="flex items-center gap-2 md:gap-4">


            {/* Notification Bell */}
            <NotificationBell />

            {/* Username display - hidden on small mobile, visible on larger screens */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-800">{currentUser || "Administrator"}</span>
                    <span className="text-[10px] bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-medium">View Profile</span>
                  </div>
                  <Avatar className="h-9 w-9 ring-2 ring-orange-200 shadow-md transition-transform hover:scale-105 hover:ring-orange-400">
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold text-xs">
                      {getUserInitials(currentUser || "Administrator")}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 border-orange-200/50">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser || "Administrator"}</p>
                    <p className="text-xs leading-none text-muted-foreground">User ID: {currentUser || "admin"}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-orange-200/30" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>


          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto scroll-smooth bg-gradient-to-br from-orange-50/20 via-amber-50/10 to-slate-50">
          <div className="mx-auto max-w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Content goes here - either children prop or Outlet for routing */}
            {children || <Outlet />}
          </div>
        </main>
      </div>

      {/* Task Creation Options Modal */}
      <TaskCreationOptionsModal
        open={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreateNew={handleCreateNewTask}
        onCreateFromLibrary={handleCreateFromLibrary}
        onBulkCreate={handleBulkCreate}
      />

      <CommandPalette open={isCommandPaletteOpen} setOpen={setIsCommandPaletteOpen} />


    </div>
  )
}

export default MainLayout