import React, { useMemo } from 'react';
import { useFrappeGetDocList, useFrappeDeleteDoc } from 'frappe-react-sdk';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, Building2, Calendar, UserCheck, ClipboardList, FileText, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/common/DashboardLayout";
import { labourManagementModules } from "@/components/hrms/WorkflowTree";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DailyLabourUsageList: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { deleteDoc } = useFrappeDeleteDoc();

    const { data, mutate, isLoading, error } = useFrappeGetDocList("Daily Labour Usage", {
        fields: [
            "name",
            "project",
            "project_name",
            "date",
            "sub_contractor",
            "sub_contractor_name",
            "docstatus",
        ],
        limit: 100,
    });

    // Calculate summary statistics
    const statistics = useMemo(() => {
        if (!data || data.length === 0) {
            return {
                totalRecords: 0,
                uniqueProjects: 0,
                uniqueContractors: 0,
                submittedRecords: 0,
                draftRecords: 0
            };
        }

        const uniqueProjects = new Set(data.map(item => item.project).filter(Boolean)).size;
        const uniqueContractors = new Set(data.map(item => item.sub_contractor).filter(Boolean)).size;
        const submittedRecords = data.filter(item => item.docstatus === 1).length;
        const draftRecords = data.filter(item => item.docstatus === 0).length;

        return {
            totalRecords: data.length,
            uniqueProjects: uniqueProjects,
            uniqueContractors: uniqueContractors,
            submittedRecords: submittedRecords,
            draftRecords: draftRecords
        };
    }, [data]);

    const handleDelete = async (e: React.MouseEvent, name: string) => {
        e.stopPropagation();

        if (!confirm("Are you sure you want to delete this attendance record?")) return;

        try {
            await deleteDoc("Daily Labour Usage", name);
            toast({
                title: "Deleted",
                description: "Attendance record has been deleted successfully.",
            });
            mutate();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err?.message || "Failed to delete",
                variant: "destructive",
            });
        }
    };

    const handleEdit = (e: React.MouseEvent, name: string) => {
        e.stopPropagation();
        navigate(`/labour-management/daily-labour-usage/${name}?mode=edit`);
    };

    const getStatusBadge = (docstatus: number) => {
        switch (docstatus) {
            case 0:
                return (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
                        Draft
                    </Badge>
                );
            case 1:
                return (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white">
                        Submitted
                    </Badge>
                );
            case 2:
                return (
                    <Badge className="bg-red-500 hover:bg-red-600 text-white">
                        Cancelled
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline">
                        Unknown
                    </Badge>
                );
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Loading State
    if (isLoading) {
        return (
            <DashboardLayout
                title="Daily Labour Usage (Attendance)"
                subtitle="Manage daily labour attendance and usage"
                modules={labourManagementModules}
            >
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    // Error State
    if (error) {
        return (
            <DashboardLayout
                title="Daily Labour Usage (Attendance)"
                subtitle="Manage daily labour attendance and usage"
                modules={labourManagementModules}
            >
                <Alert variant="destructive">
                    <AlertDescription>
                        Error loading data: {error?.message || "Unknown error occurred"}
                    </AlertDescription>
                </Alert>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Daily Labour Usage (Attendance)"
            subtitle="Manage daily labour attendance and usage"
            modules={labourManagementModules}
        >
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Records</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {statistics.totalRecords}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <ClipboardList className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Submitted</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {statistics.submittedRecords}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Draft</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {statistics.draftRecords}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {statistics.uniqueProjects}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Sub Contractors</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {statistics.uniqueContractors}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <UserCheck className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Usage Logs</CardTitle>
                    <Button
                        onClick={() =>
                            navigate('/labour-management/daily-labour-usage/new')
                        }
                        className="bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-700 hover:to-blue-600"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Usage
                    </Button>

                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-gray-500 font-medium">Project</TableHead>
                                <TableHead className="text-gray-500 font-medium">Date</TableHead>
                                <TableHead className="text-gray-500 font-medium">Sub Contractor</TableHead>
                                <TableHead className="text-gray-500 font-medium">Status</TableHead>
                                <TableHead className="text-right text-gray-500 font-medium">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {data && data.length > 0 ? (
                                data.map((item) => (
                                    <TableRow
                                        key={item.name}
                                        onClick={() =>
                                            navigate(
                                                `/labour-management/daily-labour-usage/${item.name}`
                                            )
                                        }
                                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-gray-400" />
                                                {item.project_name || item.project || "—"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                {formatDate(item.date)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <UserCheck className="h-4 w-4 text-gray-400" />
                                                {item.sub_contractor_name || item.sub_contractor || "—"}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            {getStatusBadge(item.docstatus)}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) =>
                                                        handleEdit(e, item.name)
                                                    }
                                                    className="h-8 w-8 hover:bg-blue-50"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4 text-blue-600" />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) =>
                                                        handleDelete(e, item.name)
                                                    }
                                                    className="h-8 w-8 hover:bg-red-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        No attendance records found. Create your first record to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
};

export default DailyLabourUsageList;