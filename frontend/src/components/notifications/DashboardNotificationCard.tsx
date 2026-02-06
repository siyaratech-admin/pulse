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
        <Card className="border-0 shadow-lg rounded-2xl bg-white h-auto overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2"></div>
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
                            <Bell className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900">Notifications</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">RECENT UPDATES</p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <Badge className="bg-rose-50 text-rose-600 border border-rose-200 px-2.5 py-1 rounded-lg font-bold text-xs">
                            {unreadCount} New
                        </Badge>
                    )}
                </div>

                {/* Content Area */}
                <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Error State */}
                    {error && (
                        <div className="text-center py-8 bg-rose-50 rounded-xl border border-rose-100">
                            <p className="text-sm text-rose-600 font-semibold mb-3">Failed to load notifications</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={refresh}
                                className="h-8 text-xs rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50"
                            >
                                Retry
                            </Button>
                        </div>
                    )}

                    {/* Loading State (Initial) */}
                    {isLoading && notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10">
                            <Loader2 className="h-10 w-10 animate-spin text-orange-600 mb-3" />
                            <p className="text-sm text-gray-600 font-medium">Loading updates...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 border-dashed">
                            <div className="p-4 bg-white rounded-2xl shadow-sm mb-3">
                                <BellOff className="h-12 w-12 text-orange-300" />
                            </div>
                            <p className="text-sm font-bold text-gray-700">No updates yet</p>
                            <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
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
                                <div className="flex justify-center p-3">
                                    <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        className="w-full text-orange-600 font-semibold hover:bg-orange-50 rounded-xl justify-between group transition-all"
                        onClick={handleViewAll}
                    >
                        View All Notifications
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
            </CardContent>

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
        </Card>
    )
}