import React from 'react';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar } from 'lucide-react';
import { StandardHeader } from '@/components/common/StandardHeader';


const SalarySlipsDashboard: React.FC = () => {
    const { data, isLoading, error } = useFrappeGetDocList('Salary Slip', {
        fields: ['name', 'net_pay', 'status', 'start_date', 'end_date'],
        orderBy: { field: 'start_date', order: 'desc' },
        limit: 20
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Submitted': return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
            case 'Draft': return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
            case 'Cancelled': return 'bg-red-100 text-red-700 hover:bg-red-100';
            case 'Paid': return 'bg-green-100 text-green-700 hover:bg-green-100';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Helper for formatting currency if util doesn't exist
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return { month: '', year: '' };
        const date = new Date(dateString);
        return {
            month: date.toLocaleString('default', { month: 'long' }),
            year: date.getFullYear()
        };
    };

    const handleDownload = (name: string) => {
        const url = `${window.location.origin}/api/method/frappe.utils.print_format.download_pdf?doctype=Salary%20Slip&name=${name}&format=Salary%20Slip%20Standard&no_letterhead=0`;
        window.open(url, '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <StandardHeader
                title="Salary Slips"
                subtitle="View and download your payslips"
                showBack={true}
            />

            <div className="p-4 space-y-4">
                {isLoading && (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                        Error loading salary slips. Please try again.
                    </div>
                )}

                {!isLoading && data?.length === 0 && (
                    <div className="text-center py-10 text-slate-400">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No salary slips found</p>
                    </div>
                )}

                {data?.map((slip: any) => {
                    const { month, year } = formatDate(slip.start_date);
                    return (
                        <Card key={slip.name} className="border-none shadow-sm overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-4 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-800">
                                                    {month} {year}
                                                </h3>
                                                <p className="text-xs text-slate-500">{slip.name}</p>
                                            </div>
                                        </div>
                                        <Badge className={`${getStatusColor(slip.status)} border-none shadow-none`}>
                                            {slip.status}
                                        </Badge>
                                    </div>

                                    <div className="flex items-end justify-between mt-2 pt-3 border-t border-slate-50">
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Net Pay</p>
                                            <p className="text-lg font-bold text-slate-800">{formatMoney(slip.net_pay)}</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-2 h-8 text-xs border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                                            onClick={() => handleDownload(slip.name)}
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default SalarySlipsDashboard;
