import React, { useState, useEffect } from 'react';
import { useFrappeGetDocList, useFrappeCreateDoc, useFrappeAuth, useFrappeGetDoc } from 'frappe-react-sdk';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MapPin, LogIn, LogOut, Loader2, Calendar as CalendarIcon, User } from 'lucide-react';
import { GeoTaggedCamera } from "@/components/common/GeoTaggedCamera";

const AttendancePanel = () => {
    const { currentUser } = useFrappeAuth();
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationStatus, setLocationStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [attendanceImage, setAttendanceImage] = useState<File | null>(null);

    // Fetch HR Settings
    const { data: hrSettings } = useFrappeGetDoc('HRSettings', 'HRSettings');

    // Fetch Employee Record
    const { data: employees } = useFrappeGetDocList('Employee', {
        fields: ['name', 'employee_name', 'first_name', 'designation', 'department'],
        filters: [['user_id', '=', currentUser || '']],
        limit: 1
    });
    const employee = employees?.[0];

    // Fetch recent checkins
    const { data: checkins, mutate: mutateCheckins } = useFrappeGetDocList('EmployeeCheckin', {
        fields: ['name', 'log_type', 'time'],
        filters: [['employee', '=', employee?.name]],
        orderBy: { field: 'time', order: 'desc' },
        limit: 1
    }, employee ? undefined : null);

    const lastLog = checkins?.[0];
    const isCheckedIn = lastLog?.log_type === 'IN';
    const { createDoc } = useFrappeCreateDoc();

    const fetchLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('Geolocation is not supported');
            return;
        }
        setLocationStatus('Locating...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                setLocationStatus(`Lat: ${position.coords.latitude.toFixed(5)}, Lng: ${position.coords.longitude.toFixed(5)}`);
            },
            (error) => {
                setLocationStatus('Unable to retrieve location');
                toast.error("Please enable location services.");
            }
        );
    };

    useEffect(() => {
        fetchLocation();
    }, []);

    const handleImageCapture = (file: File) => {
        setAttendanceImage(file);
    };

    const uploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('is_private', '1');
        try {
            const response = await fetch('/api/method/upload_file', {
                method: 'POST',
                headers: { 'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || '' },
                body: formData
            });
            const data = await response.json();
            return data.message?.file_url || data.file_url;
        } catch (error) {
            throw error;
        }
    };

    const handleAttendance = async (type: 'IN' | 'OUT') => {
        if (!employee) { toast.error("Employee not found."); return; }
        if (hrSettings?.allow_geolocation_tracking && !location) {
            toast.error("Location required.");
            fetchLocation();
            return;
        }
        if (type === 'IN' && !attendanceImage) {
            toast.error("Photo required to check in.");
            return;
        }

        setLoading(true);
        try {
            let imageUrl = '';
            if (attendanceImage) imageUrl = await uploadImage(attendanceImage);

            await createDoc('EmployeeCheckin', {
                employee: employee.name,
                log_type: type,
                time: new Date().toISOString().replace('T', ' ').split('.')[0],
                latitude: location?.lat,
                longitude: location?.lng,
                device_id: 'pulse',
                custom_attendance_image: imageUrl
            });

            toast.success(`Successfully Checked ${type}!`);
            setAttendanceImage(null);
            mutateCheckins();
        } catch (error: any) {
            toast.error(error.message || "Attendance failed.");
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) return <div className="p-12 text-center font-medium">Please login to access attendance.</div>;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <Card className="shadow-xl border-slate-200">
                <CardHeader className="border-b bg-slate-50/50">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                            Attendance Dashboard
                        </CardTitle>
                        <div className="text-sm px-3 py-1 bg-white border rounded-full font-medium text-slate-600 shadow-sm">
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                        {/* LEFT COLUMN: Camera and Map */}
                        <div className="space-y-6">
                            {location && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-100 p-2.5 rounded-lg border border-slate-200 shadow-sm">
                                        <MapPin className="h-4 w-4 text-red-500" />
                                        {locationStatus}
                                    </div>

                                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-inner bg-slate-50">
                                        {!isCheckedIn ? (
                                            <div className="p-1">
                                                <GeoTaggedCamera
                                                    onCapture={handleImageCapture}
                                                    location={location}
                                                    address={locationStatus}
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-[400px] w-full">
                                                <iframe
                                                    width="100%" height="100%" frameBorder="0"
                                                    src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
                                                    title="Location Map"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Status and Controls */}
                        <div className="flex flex-col justify-between space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-5 bg-primary/5 rounded-2xl border border-primary/10 shadow-sm">
                                    <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-md">
                                        <User className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                                            {employee ? employee.first_name : 'Employee'}
                                        </h2>
                                        <p className="text-slate-500 text-sm font-medium">
                                            {employee?.designation || 'Staff Member'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Status</p>
                                        <p className={`text-base font-bold mt-1 ${isCheckedIn ? "text-green-600" : "text-amber-600"}`}>
                                            {isCheckedIn ? "Checked In" : "Checked Out"}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Activity</p>
                                        <p className="text-base font-bold mt-1 text-slate-700">
                                            {lastLog ? new Date(lastLog.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ADJUSTED BUTTON HEIGHTS HERE */}
                            <div className="space-y-4">
                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={() => handleAttendance('IN')}
                                        disabled={loading || isCheckedIn || (!attendanceImage && !isCheckedIn)}
                                        className="h-12 text-base font-bold shadow-md transition-all active:scale-95"
                                        variant={isCheckedIn ? "outline" : "default"}
                                    >
                                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                                        Confirm Check-In
                                    </Button>

                                    <Button
                                        onClick={() => handleAttendance('OUT')}
                                        disabled={loading || !isCheckedIn}
                                        className="h-12 text-base font-bold shadow-md transition-all active:scale-95"
                                        variant={!isCheckedIn ? "outline" : "destructive"}
                                    >
                                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogOut className="mr-2 h-5 w-5" />}
                                        Confirm Check-Out
                                    </Button>
                                </div>

                                <p className="text-center text-[11px] text-slate-400 leading-relaxed">
                                    Attendance is geo-fenced and requires photo verification.
                                </p>
                            </div>
                        </div>

                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AttendancePanel;