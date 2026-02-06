import React from "react"
import { Bell, Loader2, BellOff, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/hooks/useNotifications"
import { NotificationItem } from "@/components/notifications/NotificationItem"
import { useNavigate } from "react-router-dom"

export const DashboardNotificationCard: React.FC = () => {
    const navigate = useNavigate()
    const {
        notifications,
        unreadCount,
        isLoading,
        hasMore,
        markAsRead,
        refresh,
        error
    } = useNotifications({
        limit: 10,
        enableSound: false,
        usePagination: true // Using pagination to properly handle limited list interaction
    })

    // Auto-reload on mount is handled by the hook

    const handleViewAll = () => {
        navigate('/notifications')
    }

    return (
        <Card className="border-0 shadow-sm rounded-2xl bg-white h-auto">
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Bell className="h-6 w-6 text-blue-500" />
                        <div>
                            <h3 className="text-base font-bold text-gray-900">Notifications</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">RECENT UPDATES</p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <Badge className="bg-red-50 text-red-600 border-0 px-2.5 py-1 rounded-lg font-bold text-xs">
                            {unreadCount} New
                        </Badge>
                    )}
                </div>

                {/* Content Area */}
                <div className="max-h-[350px] overflow-y-auto pr-1 -mr-1">
                    {/* Error State */}
                    {error && (
                        <div className="text-center py-8">
                            <p className="text-sm text-red-500 font-medium mb-2">Failed to load</p>
                            <Button variant="outline" size="sm" onClick={refresh} className="h-7 text-xs">
                                Retry
                            </Button>
                        </div>
                    )}

                    {/* Loading State (Initial) */}
                    {isLoading && notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                            <p className="text-xs text-gray-400">Loading updates...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                            <BellOff className="h-10 w-10 text-gray-300 mb-2" />
                            <p className="text-sm font-semibold text-gray-500">No updates yet</p>
                            <p className="text-xs text-gray-400">You're all caught up!</p>
                        </div>
                    )}

                    {/* List */}
                    {notifications.length > 0 && (
                        <div className="space-y-0 divide-y divide-gray-100">
                            {notifications.map((notification) => (
                                <div key={notification.name} className="py-1">
                                    <NotificationItem
                                        notification={notification}
                                        onMarkAsRead={markAsRead}
                                        onClose={() => { }} // No-op, not in a dropdown
                                    />
                                </div>
                            ))}

                            {/* Loading More Indicator (if loading pages) */}
                            {isLoading && notifications.length > 0 && (
                                <div className="flex justify-center p-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-2 border-t border-gray-50">
                    <Button
                        variant="ghost"
                        className="w-full text-blue-500 font-semibold hover:bg-blue-50 rounded-xl justify-between group"
                        onClick={handleViewAll}
                    >
                        View All Notifications
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
