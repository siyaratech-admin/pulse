import React, { useEffect, useState } from 'react';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Warehouse, MapPin, Box } from 'lucide-react';
import { Progress } from "@/components/ui/progress"

interface ItemStockDashboardProps {
    itemCode: string;
    type: 'Item' | 'Asset';
}

export const ItemStockDashboard: React.FC<ItemStockDashboardProps> = ({ itemCode, type }) => {
    const [warehouseData, setWarehouseData] = useState<any[]>([]);

    // Fetch Stock for Item
    const { data: binData, isLoading: binLoading } = useFrappeGetCall(
        'frappe.client.get_list',
        {
            doctype: 'Bin',
            filters: { item_code: itemCode },
            fields: ['warehouse', 'actual_qty', 'reserved_qty', 'projected_qty'],
            limit_page_length: 50
        },
        type === 'Item' ? undefined : null // Only run for Item
    );

    // Fetch Asset Count by Location (if type is Asset)
    // Assuming 'Asset' doctype has 'location' field and status
    const { data: assetData, isLoading: assetLoading } = useFrappeGetCall(
        'frappe.client.get_list',
        {
            doctype: 'Asset',
            filters: { item_code: itemCode, docstatus: 1 }, // Only active assets
            fields: ['location', 'status', 'name'],
            limit_page_length: 100
        },
        type === 'Asset' ? undefined : null
    );

    useEffect(() => {
        if (type === 'Item' && binData?.message) {
            // Filter out warehouses with 0 stock to reduce noise, unless we want to show all
            const stock = binData.message
                .filter((b: any) => b.actual_qty !== 0 || b.reserved_qty !== 0)
                .map((b: any) => ({
                    location: b.warehouse,
                    count: b.actual_qty,
                    reserved: b.reserved_qty,
                    projected: b.projected_qty,
                    type: 'Warehouse'
                }));
            setWarehouseData(stock);
        } else if (type === 'Asset' && assetData?.message) {
            // Group by location
            const locMap = new Map();
            assetData.message.forEach((a: any) => {
                const loc = a.location || 'Unassigned';
                if (!locMap.has(loc)) {
                    locMap.set(loc, { count: 0, statuses: {} });
                }
                const entry = locMap.get(loc);
                entry.count++;
                entry.statuses[a.status] = (entry.statuses[a.status] || 0) + 1;
            });

            const stock = Array.from(locMap.entries()).map(([loc, data]: any) => ({
                location: loc,
                count: data.count,
                details: data.statuses,
                type: 'Location'
            }));
            setWarehouseData(stock);
        }
    }, [binData, assetData, type]);

    if (binLoading || assetLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-400" /></div>;
    }

    if (!warehouseData.length) {
        return (
            <Card className="border-dashed border-slate-200 shadow-none bg-slate-50/50">
                <CardContent className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <Box className="w-10 h-10 mb-2 opacity-50" />
                    <p>No stock or asset data found for this item.</p>
                </CardContent>
            </Card>
        );
    }

    const totalQty = warehouseData.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Box className="w-5 h-5 text-indigo-500" />
                    Availability Overview
                </h3>
                <Badge variant="outline" className="text-sm px-3 py-1 border-indigo-200 text-indigo-700 bg-indigo-50">
                    Total: {totalQty}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {warehouseData.map((wh) => (
                    <Card key={wh.location} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2 text-slate-700 font-medium">
                                    {type === 'Item' ? <Warehouse className="w-4 h-4 text-slate-400" /> : <MapPin className="w-4 h-4 text-slate-400" />}
                                    <span className="truncate max-w-[180px]" title={wh.location}>{wh.location}</span>
                                </div>
                                <Badge className={`${wh.count > 0 ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-500'}`}>
                                    {wh.count} {type === 'Item' ? 'Qty' : 'Assets'}
                                </Badge>
                            </div>

                            {type === 'Item' && (
                                <div className="space-y-2 mt-3">
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Actual: {wh.count}</span>
                                        <span>Reserved: {wh.reserved}</span>
                                    </div>
                                    <Progress value={(wh.count / (totalQty || 1)) * 100} className="h-1.5" />
                                    <div className="text-xs text-slate-400 text-right mt-1">
                                        Projected: {wh.projected}
                                    </div>
                                </div>
                            )}

                            {type === 'Asset' && wh.details && (
                                <div className="mt-3 flex flex-wrap gap-1">
                                    {Object.entries(wh.details).map(([status, count]: any) => (
                                        <span key={status} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                            {status}: {count}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
