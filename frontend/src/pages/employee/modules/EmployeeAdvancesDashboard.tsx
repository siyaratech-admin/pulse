import React from 'react';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, FileText } from 'lucide-react';
import { StandardHeader } from '@/components/common/StandardHeader';
import { useNavigate } from 'react-router-dom';

const EmployeeAdvancesDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { data, isLoading, error } = useFrappeGetDocList('Employee Advance', {
        fields: ['name', 'posting_date', 'advance_amount', 'status', 'purpose', 'currency'],
        orderBy: { field: 'posting_date', order: 'desc' },
        limit: 20
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-700';
            case 'Unpaid': return 'bg-orange-100 text-orange-700';
            case 'Draft': return 'bg-gray-100 text-gray-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            case 'Submitted': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatMoney = (amount: number, currency: string = 'INR') => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <StandardHeader
                title="Advances"
                subtitle="Track your advance requests"
                showBack={true}
                actions={
                    <Button
                        size="icon"
                        className="rounded-full bg-white/20 hover:bg-white/30 text-white border-0 shadow-lg"
                        onClick={() => navigate('/employee/form/Employee Advance/new')}
                    >
                        <Plus className="w-5 h-5" />
                    </Button>
                }
            />

            <div className="p-4 space-y-4">
                {isLoading && (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />
                        ))}
                    </div>
                )}

                {!isLoading && data?.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-medium mb-1">No Advances</h3>
                        <p className="text-sm text-slate-500 mb-4">You haven't requested any advances yet</p>
                        <Button
                            variant="outline"
                            className="text-blue-600 border-blue-200 bg-blue-50"
                            onClick={() => navigate('/employee/form/Employee Advance/new')}
                        >
                            Request Advance
                        </Button>
                    </div>
                )}

                {data?.map((advance: any) => (
                    <Card
                        key={advance.name}
                        className="border-none shadow-sm overflow-hidden active:scale-[0.99] transition-transform"
                        onClick={() => navigate(`/employee/form/Employee Advance/${advance.name}`)}
                    >
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">
                                            {formatMoney(advance.advance_amount, advance.currency)}
                                        </h3>
                                        <p className="text-xs text-slate-500">{advance.posting_date}</p>
                                    </div>
                                </div>
                                <Badge className={`${getStatusColor(advance.status)} border-none shadow-none`}>
                                    {advance.status}
                                </Badge>
                            </div>

                            {advance.purpose && (
                                <div className="mt-3 pt-3 border-t border-slate-50">
                                    <p className="text-sm text-slate-600 line-clamp-2">
                                        {advance.purpose}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default EmployeeAdvancesDashboard;
