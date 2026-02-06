import React, { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCheck, Bell, UserPlus, Share2, Zap, AlertCircle } from "lucide-react"
import { useNotifications } from "@/hooks/useNotifications"
import { NotificationList } from "@/components/notifications/NotificationList"
import { SoundToggle } from "@/components/notifications/SoundToggle"
import { TestSoundButton } from "@/components/notifications/TestSoundButton"
import type { NotificationType } from "@/types/notification"

type TabType = "all" | NotificationType

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 50

  // Fetch notifications with filtering
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    markAsRead,
    markAllAsRead,
    refresh,
  } = useNotifications({
    limit: pageSize,
    start: (currentPage - 1) * pageSize,
    typeFilter: activeTab,
    usePagination: true,
    enableSound: true,
  })

  // Calculate counts per type for tab badges
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: notifications.length,
      Mention: 0,
      "Energy Point": 0,
      Assignment: 0,
      Share: 0,
      Alert: 0,
      "": 0,
    }

    notifications.forEach((notification) => {
      const type = notification.type || ""
      if (counts[type] !== undefined) {
        counts[type]++
      }
    })

    return counts
  }, [notifications])

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType)
    setCurrentPage(1) // Reset to first page when changing tabs
  }

  // Handle load more
  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1)
  }

  // Get empty message based on active tab
  const getEmptyMessage = () => {
    if (activeTab === "all") {
      return "You're all caught up! No notifications to display."
    }
    return `No ${activeTab} notifications to display.`
  }

  // Get icon for notification type
  const getTypeIcon = (type: TabType) => {
    const icons = {
      all: Bell,
      Mention: UserPlus,
      "Energy Point": Zap,
      Assignment: CheckCheck,
      Share: Share2,
      Alert: AlertCircle,
      "": Bell,
    }
    return icons[type] || Bell
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Bell className="h-6 w-6 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription className="mt-1">
                Stay updated with all your notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount} unread
                  </Badge>
                )}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {/* Test Sound Button */}
              <TestSoundButton />

              {/* Sound Toggle */}
              <SoundToggle variant="outline" size="sm" />

              {/* Mark All as Read */}
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
                  <CheckCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Mark all as read</span>
                  <span className="sm:hidden">Mark all</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            {/* Tabs List */}
            <div className="border-b border-gray-200 px-4 md:px-6">
              <TabsList className="w-full justify-start bg-transparent h-auto p-0 gap-1">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent gap-2"
                >
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">All</span>
                  {typeCounts.all > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-xs">
                      {typeCounts.all}
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="Mention"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Mentions</span>
                  {typeCounts.Mention > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-xs">
                      {typeCounts.Mention}
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="Assignment"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent gap-2"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Assignments</span>
                  {typeCounts.Assignment > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-xs">
                      {typeCounts.Assignment}
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="Share"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Shared</span>
                  {typeCounts.Share > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-xs">
                      {typeCounts.Share}
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="Energy Point"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent gap-2"
                >
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">Energy</span>
                  {typeCounts["Energy Point"] > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-xs">
                      {typeCounts["Energy Point"]}
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="Alert"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Alerts</span>
                  {typeCounts.Alert > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-xs">
                      {typeCounts.Alert}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content - Same for all tabs */}
            <TabsContent value={activeTab} className="m-0">
              <NotificationList
                notifications={notifications}
                isLoading={isLoading}
                hasMore={hasMore}
                emptyMessage={getEmptyMessage()}
                onMarkAsRead={markAsRead}
                onLoadMore={handleLoadMore}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default Notifications
