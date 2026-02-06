import React from 'react';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CalendarCheck, CalendarX, AlertCircle } from 'lucide-react';
import { StandardHeader } from '@/components/common/StandardHeader';
import { format } from 'date-fns';

const AttendanceHistory: React.FC = () => {
    const { data, isLoading, error } = useFrappeGetDocList('Attendance', {
        fields: ['name', 'attendance_date', 'status', 'shift', 'in_time', 'out_time', 'working_hours'],
        orderBy: { field: 'attendance_date', order: 'desc' },
        limit: 30
    });

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'Present': return { color: 'bg-green-50 text-green-700', icon: CalendarCheck };
            case 'Absent': return { color: 'bg-red-50 text-red-700', icon: CalendarX };
            case 'Half Day': return { color: 'bg-orange-50 text-orange-700', icon: Clock };
            case 'On Leave': return { color: 'bg-blue-50 text-blue-700', icon: AlertCircle };
            default: return { color: 'bg-gray-50 text-gray-700', icon: Clock };
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <StandardHeader
                title="Attendance History"
                subtitle="Your last 30 days attendance"
                showBack={true}
            />

            <div className="p-4 space-y-3">
                {isLoading && (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />
                        ))}
                    </div>
                )}

                {!isLoading && data?.length === 0 && (
                    <div className="text-center py-10 text-slate-400">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No attendance records found</p>
                    </div>
                )}

                {data?.map((record: any) => {
                    const config = getStatusConfig(record.status);
                    const Icon = config.icon;

                    return (
                        <Card key={record.name} className="border-none shadow-sm overflow-hidden">
                            <CardContent className="p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.color.split(' ')[0]}`}>
                                        <Icon className={`w-5 h-5 ${config.color.split(' ')[1]}`} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">
                                            {format(new Date(record.attendance_date), 'EEE, dd MMM yyyy')}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                            {record.in_time && (
                                                <span>In: {record.in_time.split(' ')[1]?.substring(0, 5)}</span>
                                            )}
                                            {record.out_time && (
                                                <>
                                                    <span>•</span>
                                                    <span>Out: {record.out_time.split(' ')[1]?.substring(0, 5)}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <Badge variant="outline" className={`${config.color} border-none font-semibold shadow-none`}>
                                        {record.status}
                                    </Badge>
                                    {record.working_hours > 0 && (
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {record.working_hours.toFixed(1)} hrs
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default AttendanceHistory;
