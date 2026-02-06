import React, { useEffect, useState } from 'react';
import { useFrappeGetCall, useFrappeAuth, useFrappeGetDocList, useFrappeCreateDoc } from 'frappe-react-sdk';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Briefcase,
    Clock,
    MapPin,
    CalendarCheck,
    AlertCircle,
    CheckCircle2,
    Wallet,
    ChevronRight,
    Banknote,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { GeoTaggedCamera } from "@/components/common/GeoTaggedCamera";
import { toast } from "sonner";

export const EmployeeDashboard = () => {
    const { currentUser } = useFrappeAuth();
    const navigate = useNavigate();
    const [greeting, setGreeting] = useState('');
    const [showCheckInModal, setShowCheckInModal] = useState(false);
    const [isCheckingIn, setIsCheckingIn] = useState(false);

    // Fetch Employee Doc linked to User
    const { data: employeeData } = useFrappeGetCall('frappe.client.get_value', {
        doctype: 'Employee',
        filters: { user_id: currentUser },
        fieldname: ['name', 'employee_name', 'image', 'department', 'designation']
    });

    const employeeName = employeeData?.message?.employee_name || currentUser;
    const employeeId = employeeData?.message?.name;
    const designation = employeeData?.message?.designation || 'Team Member';

    // Fetch Last Checkin to determine status (Replaces broken API)
    // We expect list of 'Employee Checkin' documents
    const { data: checkinList, mutate: mutateCheckins } = useFrappeGetDocList('Employee Checkin', {
        filters: [['employee', '=', employeeId || ""]],
        fields: ['log_type', 'time', 'device_id'],
        orderBy: { field: 'time', order: 'desc' },
        limit: 1
    }, !employeeId ? null : undefined);

    const lastCheckin = checkinList?.[0];
    const isCheckedIn = lastCheckin?.log_type === 'IN';
    const statusText = isCheckedIn ? 'Checked In' : 'Not Checked In';

    // Hook to create new checkin
    const { createDoc } = useFrappeCreateDoc();

    // Fetch Open Tasks
    const { data: tasksData } = useFrappeGetDocList('Task', {
        filters: [
            ['_assign', 'like', `%${currentUser}%`],
            ['status', '!=', 'Completed']
        ],
        fields: ['name', 'subject', 'priority', 'exp_end_date'],
        limit: 5
    });

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    const uploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('is_private', '1');

        // Using standard fetch for file upload as SDK might not wrap this helper yet
        const response = await fetch('/api/method/upload_file', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || ''
            }
        });

        if (!response.ok) throw new Error('Image upload failed');
        const data = await response.json();
        return data.message.file_url;
    };

    const handleCheckIn = async (file: File) => {
        if (!employeeId) {
            toast.error("Employee details not found");
            return;
        }

        setIsCheckingIn(true);
        try {
            // 1. Upload Image
            let imageUrl = '';
            try {
                imageUrl = await uploadImage(file);
            } catch (e) {
                console.error("Upload failed", e);
                toast.error("Failed to upload image, but proceeding with check-in");
            }

            // 2. Get Geolocation & Create Record
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const newLogType = isCheckedIn ? 'OUT' : 'IN';
                const now = new Date();
                // Frappe datetime format: YYYY-MM-DD HH:mm:ss
                const timeStr = now.getFullYear() + "-"
                    + String(now.getMonth() + 1).padStart(2, '0') + "-"
                    + String(now.getDate()).padStart(2, '0') + " "
                    + String(now.getHours()).padStart(2, '0') + ":"
                    + String(now.getMinutes()).padStart(2, '0') + ":"
                    + String(now.getSeconds()).padStart(2, '0');

                try {
                    await createDoc('Employee Checkin', {
                        employee: employeeId,
                        log_type: newLogType,
                        time: timeStr,
                        device_id: 'PWA / Mobile',
                        latitude: latitude,
                        longitude: longitude,
                        // Note: Ensure your 'Employee Checkin' doctype has a field for image/photo if you want to save it
                        // Standard Frappe HR might not have 'image' field by default on Checkin, 
                        // but custom fields are common. We pass it just in case.
                    });

                    toast.success(`Successfully Checked ${newLogType}`);
                    setShowCheckInModal(false);
                    mutateCheckins(); // Refresh status
                } catch (docError) {
                    console.error("Doc creation failed", docError);
                    toast.error("Failed to save check-in record");
                } finally {
                    setIsCheckingIn(false);
                }

            }, (err) => {
                console.error("Geolocation error", err);
                toast.error("Location access denied. Cannot check in.");
                setIsCheckingIn(false);
            });

        } catch (e) {
            console.error("Check-in failed", e);
            toast.error("Check-in failed. Please try again.");
            setIsCheckingIn(false);
        }
    };

    return (
        <div className="pb-24 pt-6 px-4 space-y-6 bg-slate-50 min-h-screen">
            {/* Header / Greeting */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{greeting},</h1>
                    <p className="text-slate-500 font-medium">{employeeName}</p>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full mt-1 inline-block">
                        {designation}
                    </span>
                </div>
                <div className="bg-white p-1 rounded-full shadow-sm border border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-400">
                        {employeeData?.message?.image ? (
                            <img src={employeeData.message.image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <Briefcase className="w-6 h-6" />
                        )}
                    </div>
                </div>
            </div>

            {/* Attendance Card */}
            <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-16 -mt-16 opacity-50" />
                <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Today's Status</p>
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Clock className={`w-5 h-5 ${isCheckedIn ? 'text-green-600' : 'text-slate-400'}`} />
                                {statusText}
                            </h3>
                            {lastCheckin && (
                                <p className="text-xs text-slate-400 mt-1">
                                    Last log: {lastCheckin.log_type} at {lastCheckin.time.split(' ')[1].substring(0, 5)}
                                </p>
                            )}
                        </div>

                        <Dialog open={showCheckInModal} onOpenChange={setShowCheckInModal}>
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    className={`${isCheckedIn ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'} text-primary-foreground shadow-md transition-colors`}
                                >
                                    {isCheckedIn ? 'Check Out' : 'Check In'}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md p-0 bg-black border-slate-800 text-white overflow-hidden">
                                <div className="p-4 bg-slate-900 border-b border-slate-800">
                                    <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-blue-400" />
                                        {isCheckedIn ? 'Check Out' : 'Check In'} Verification
                                    </DialogTitle>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Please capture your face and location to verify attendance.
                                    </p>
                                </div>
                                <div className="p-4 bg-black">
                                    {showCheckInModal && (
                                        <GeoTaggedCamera
                                            onCapture={() => { }} // Not used as onSubmit handles the flow
                                            onSubmit={handleCheckIn}
                                            location={{ lat: 0, lng: 0 }} // Dummy/Initial loc, camera handles updates or internal logic checks
                                            address="Getting location..."
                                        />
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>Office Location</span>
                        </div>
                        <div className="h-3 w-px bg-slate-300" />
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>09:00 AM - 06:00 PM</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* QUICK ACTIONS */}
            <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Quick Actions</h3>
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: 'Leave', icon: CalendarCheck, color: 'text-orange-600', bg: 'bg-orange-50', path: '/employee/hr' },
                        { label: 'Payroll', icon: Banknote, color: 'text-secondary', bg: 'bg-secondary/10', path: '/employee/salary-slips' },
                        { label: 'Expense', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/employee/form/Expense Claim/new' },
                        { label: 'Task', icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50', path: '/employee/tasks' },
                    ].map((action, i) => (
                        <Button
                            key={i}
                            variant="ghost"
                            className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-white hover:shadow-sm transition-all rounded-xl"
                            onClick={() => action.path !== '#' && navigate(action.path)}
                        >
                            <div className={`w-12 h-12 rounded-2xl ${action.bg} flex items-center justify-center ${action.color}`}>
                                <action.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-slate-600">{action.label}</span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* MY TASKS */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">My Tasks</h3>
                <Button variant="link" className="text-primary text-xs p-0 h-auto font-semibold" onClick={() => navigate('/employee/tasks')}>View All</Button>
            </div>

            <div className="space-y-3">
                {(!tasksData || tasksData.length === 0) ? (
                    <div className="bg-white rounded-xl p-8 border border-slate-100 border-dashed text-center">
                        <span className="text-2xl mb-2 block">🎉</span>
                        <p className="text-slate-500 font-medium text-sm">No pending tasks!</p>
                    </div>
                ) : (
                    tasksData.map((task: any) => (
                        <Card
                            key={task.name}
                            className="border-none shadow-sm start-card active:scale-[0.99] transition-transform cursor-pointer"
                            onClick={() => navigate(`/employee/tasks/${task.name}`)}
                        >
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${task.priority === 'High' ? 'bg-red-100 text-red-600' :
                                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-semibold text-slate-800 truncate">{task.subject}</h4>
                                    <p className="text-xs text-slate-500 truncate mt-0.5">Due: {task.exp_end_date}</p>
                                </div>
                                <div className="shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
