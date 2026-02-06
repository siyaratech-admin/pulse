import React from 'react';
import { useFrappeGetDocList, useFrappeAuth } from 'frappe-react-sdk';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Bell } from 'lucide-react';

const Notifications = () => {
    const { currentUser } = useFrappeAuth();

    // Fetch notifications
    const { data: notifications, isLoading, error } = useFrappeGetDocList('PWA Notification', {
        fields: ['name', 'title', 'message', 'read', 'creation'],
        filters: [['to_user', '=', currentUser ?? '']],
        orderBy: { field: 'creation', order: 'desc' },
        limit: 50
    }, currentUser ? undefined : null);

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="text-red-500 p-10">Error loading notifications: {error.message}</div>;

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>

            <div className="space-y-4">
                {notifications?.map((notif: any) => (
                    <Card key={notif.name} className={notif.read ? 'opacity-70' : ''}>
                        <CardContent className="p-4 flex items-start space-x-4">
                            <div className={`p-2 rounded-full ${notif.read ? 'bg-gray-100' : 'bg-primary/10'}`}>
                                <Bell className={`h-4 w-4 ${notif.read ? 'text-gray-500' : 'text-primary'}`} />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="font-medium">{notif.title}</p>
                                <p className="text-sm text-muted-foreground">{notif.message}</p>
                                <p className="text-xs text-muted-foreground pt-2">{notif.creation}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {(!notifications || notifications.length === 0) && (
                    <div className="text-center text-muted-foreground py-10">
                        No notifications found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
