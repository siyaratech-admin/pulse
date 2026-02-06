
import React from 'react';
import { useFrappeGetDocList, useFrappeDeleteDoc } from 'frappe-react-sdk';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/common/DashboardLayout";
import { planningModules } from "@/components/hrms/WorkflowTree";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const ClientBaselineList: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { deleteDoc } = useFrappeDeleteDoc();

    const { data, mutate } = useFrappeGetDocList("KB Client Baseline", {
        fields: ["name", "project", "start_date", "end_date", "is_active", "revision_date", "docstatus"],
        limit: 100
    });

    const handleDelete = async (name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                await deleteDoc("KB Client Baseline", name);
                toast({ title: "Deleted", description: `${name} has been deleted.` });
                mutate();
            } catch (e: any) {
                toast({ title: "Error", description: e.message || "Failed to delete", variant: "destructive" });
            }
        }
    };

    return (
        <DashboardLayout
            title="Client Baselines"
            subtitle="Manage client baseline schedules"
            modules={planningModules}
        >
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Baselines</CardTitle>
                    <Button onClick={() => window.open('/app/kb-client-baseline/new', '_blank')}>
                        <Plus className="mr-2 h-4 w-4" /> New Baseline
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Active</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.map((item) => (
                                <TableRow key={item.name}>
                                    <TableCell className="font-medium">
                                        <a href={`/app/kb-client-baseline/${item.name}`} target="_blank" className="hover:underline text-blue-600">
                                            {item.name}
                                        </a>
                                    </TableCell>
                                    <TableCell>{item.project}</TableCell>
                                    <TableCell>{item.start_date}</TableCell>
                                    <TableCell>{item.end_date}</TableCell>
                                    <TableCell>
                                        {item.is_active ? <Badge variant="default">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                                    </TableCell>
                                    <TableCell>
                                        {item.docstatus === 1 ? <Badge className="bg-green-500">Submitted</Badge> : <Badge variant="outline">Draft</Badge>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.name)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
};

export default ClientBaselineList;
