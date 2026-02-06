import React from 'react';
import { useFrappeGetDoc, useFrappePostCall } from 'frappe-react-sdk';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import { toast } from "sonner";

const SalarySlipDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: salarySlip, isLoading, error } = useFrappeGetDoc('Salary Slip', id);
    const { call, loading: downloading } = useFrappePostCall('hrms.hrms.api._download_pdf');

    const handleDownload = async () => {
        try {
            const response = await call({ doctype: 'Salary Slip', docname: id });
            if (response) {
                const link = document.createElement('a');
                link.href = response;
                link.download = `${id}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to download PDF.");
        }
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="text-red-500 p-10">Error loading salary slip: {error.message}</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleDownload} disabled={downloading}>
                    {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Download PDF
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Salary Slip: {salarySlip.month} {salarySlip.year}</CardTitle>
                        <Badge>{salarySlip.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Employee Name</p>
                            <p>{salarySlip.employee_name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Designation</p>
                            <p>{salarySlip.designation}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Department</p>
                            <p>{salarySlip.department}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Bank Account</p>
                            <p>{salarySlip.bank_account_no || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Earnings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableBody>
                                        {salarySlip.earnings?.map((item: any) => (
                                            <TableRow key={item.salary_component}>
                                                <TableCell>{item.salary_component}</TableCell>
                                                <TableCell className="text-right">{item.amount}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="font-bold">
                                            <TableCell>Gross Pay</TableCell>
                                            <TableCell className="text-right">{salarySlip.gross_pay}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Deductions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableBody>
                                        {salarySlip.deductions?.map((item: any) => (
                                            <TableRow key={item.salary_component}>
                                                <TableCell>{item.salary_component}</TableCell>
                                                <TableCell className="text-right">{item.amount}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="font-bold">
                                            <TableCell>Total Deduction</TableCell>
                                            <TableCell className="text-right">{salarySlip.total_deduction}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end">
                        <Card className="w-full md:w-1/2 bg-primary/5">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center text-xl font-bold">
                                    <span>Net Pay</span>
                                    <span>{salarySlip.currency_symbol} {salarySlip.net_pay}</span>
                                </div>
                                <div className="text-right text-sm text-muted-foreground mt-1">
                                    ({salarySlip.total_in_words})
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SalarySlipDetail;
