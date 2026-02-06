import React from 'react';
import { useFrappeGetCall, useFrappeAuth, useFrappeGetDocList } from 'frappe-react-sdk';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Phone, Building, Briefcase, MapPin } from 'lucide-react';

const Profile = () => {
    const { currentUser } = useFrappeAuth();

    // Fetch current employee
    const { data: employeeList, isLoading, error } = useFrappeGetDocList('Employee', {
        filters: [['user_id', '=', currentUser || ""]],
        fields: ['name', 'employee_name', 'image', 'designation', 'status', 'user_id', 'department', 'company', 'reports_to']
    });

    const employee = employeeList?.[0];

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="text-red-500 p-10">Error loading profile: {error.message}</div>;

    if (!employee) return <div className="p-10">Employee record not found.</div>;

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center space-y-4">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={employee.image} />
                            <AvatarFallback>{employee.employee_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold">{employee.employee_name}</h1>
                            <p className="text-muted-foreground">{employee.designation}</p>
                            <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'} className="mt-2">
                                {employee.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <div className="flex items-center space-x-3 p-3 bg-secondary/20 rounded-lg">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                <p className="text-sm">{employee.user_id}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-secondary/20 rounded-lg">
                            <Building className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Department</p>
                                <p className="text-sm">{employee.department}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-secondary/20 rounded-lg">
                            <Briefcase className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Company</p>
                                <p className="text-sm">{employee.company}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-secondary/20 rounded-lg">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Reports To</p>
                                <p className="text-sm">{employee.reports_to || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Profile;
