import React from 'react';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';

const Settings = () => {
    // Fetch HR Settings
    const { data: settings, isLoading, error } = useFrappeGetCall('hrms.hrms.api.get_hr_settings');

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="text-red-500 p-10">Error loading settings: {error.message}</div>;

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="geo-tracking" className="flex flex-col space-y-1">
                            <span>Geolocation Tracking</span>
                            <span className="font-normal text-sm text-muted-foreground">
                                Allow the app to track your location for attendance.
                            </span>
                        </Label>
                        <Switch id="geo-tracking" checked={settings?.allow_geolocation_tracking} disabled />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="mobile-checkin" className="flex flex-col space-y-1">
                            <span>Mobile Check-in</span>
                            <span className="font-normal text-sm text-muted-foreground">
                                Allow check-in from mobile devices.
                            </span>
                        </Label>
                        <Switch id="mobile-checkin" checked={settings?.allow_employee_checkin_from_mobile_app} disabled />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Settings;
