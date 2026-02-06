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
import { Plus, Trash2, Pencil, Users, DollarSign, Calendar, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/common/DashboardLayout";
import { labourManagementModules } from "@/components/hrms/WorkflowTree";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const DailyLabourSummaryList: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { deleteDoc } = useFrappeDeleteDoc();

    const { data, mutate } = useFrappeGetDocList("Daily Labour Summary", {
        fields: [
            "name",
            "project",
            "date",
            "total_labours_worked",
            "total_labour_cost",
            "docstatus",
        ],
        limit: 100,
        orderBy: {
            field: 'date',
            order: 'desc'
        }
    });

    // Calculate summary statistics
    const statistics = useMemo(() => {
        if (!data || data.length === 0) {
            return {
                totalSummaries: 0,
                totalLabours: 0,
                totalCost: 0,
                averageCostPerDay: 0,
                averageLaboursPerDay: 0
            };
        }

        const totalLabours = data.reduce((sum, item) => sum + (item.total_labours_worked || 0), 0);
        const totalCost = data.reduce((sum, item) => sum + (item.total_labour_cost || 0), 0);

        return {
            totalSummaries: data.length,
            totalLabours: totalLabours,
            totalCost: totalCost,
            averageCostPerDay: data.length > 0 ? totalCost / data.length : 0,
            averageLaboursPerDay: data.length > 0 ? totalLabours / data.length : 0
        };
    }, [data]);

    const handleDelete = async (e: React.MouseEvent, name: string) => {
        e.stopPropagation();

        if (!confirm("Are you sure you want to delete this summary?")) return;

        try {
            await deleteDoc("Daily Labour Summary", name);
            toast({
                title: "Deleted",
                description: "Summary has been deleted successfully.",
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
        navigate(`/labour-management/daily-labour-summary/${name}?mode=edit`);
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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <DashboardLayout
            title="Daily Labour Summary"
            subtitle="Manage daily labour expenses and summaries"
            modules={labourManagementModules}
        >
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Summaries</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {statistics.totalSummaries}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Labours</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {statistics.totalLabours}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(statistics.totalCost)}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg. Cost/Day</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(statistics.averageCostPerDay)}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg. Labours/Day</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {statistics.averageLaboursPerDay.toFixed(1)}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Users className="h-6 w-6 text-indigo-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Summaries</CardTitle>
                    <Button
                        onClick={() =>
                            navigate('/labour-management/daily-labour-summary/new')
                        }
                        className="bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-700 hover:to-blue-600"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Summary
                    </Button>

                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-gray-500 font-medium">Project</TableHead>
                                <TableHead className="text-gray-500 font-medium">Date</TableHead>
                                <TableHead className="text-gray-500 font-medium">Total Labours</TableHead>
                                <TableHead className="text-gray-500 font-medium">Total Cost</TableHead>
                                <TableHead className="text-gray-500 font-medium">Status</TableHead>
                                <TableHead className="text-right text-gray-500 font-medium">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {data?.map((item) => (
                                <TableRow
                                    key={item.name}
                                    onClick={() =>
                                        navigate(
                                            `/labour-management/daily-labour-summary/${item.name}`
                                        )
                                    }
                                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <TableCell className="font-medium">{item.project}</TableCell>
                                    <TableCell>{formatDate(item.date)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium">{item.total_labours_worked}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold text-green-600">
                                        {formatCurrency(item.total_labour_cost)}
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
                            ))}

                            {(!data || data.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        No summaries found. Create your first summary to get started.
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

export default DailyLabourSummaryList;