
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { realEstateStore, type Unit, type UnitStatus } from "@/lib/realEstateMockData";
import { cn } from "@/lib/utils";
import { Building2, Layers, Home, IndianRupee, MoveRight } from "lucide-react";

interface UnitHeatmapProps {
    onUnitClick?: (unit: Unit) => void;
}

const getStatusColor = (status: UnitStatus) => {
    switch (status) {
        case 'Available': return 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200';
        case 'Booked': return 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200';
        case 'Sold': return 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200';
        case 'On Hold': return 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200';
        case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200';
        case 'Possession Given': return 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

export const UnitHeatmap: React.FC<UnitHeatmapProps> = () => {
    const units = realEstateStore.units;
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

    // Group by Tower -> Floor
    const groupedData = useMemo(() => {
        const towers: Record<string, Record<number, Unit[]>> = {};

        units.forEach(unit => {
            if (!towers[unit.tower]) towers[unit.tower] = {};
            if (!towers[unit.tower][unit.floor]) towers[unit.tower][unit.floor] = [];
            towers[unit.tower][unit.floor].push(unit);
        });

        // Sort floors descending (top floor first)
        Object.keys(towers).forEach(tower => {
            // Ensure floors are numeric for sorting
            // No explicit sort needed if we iterate keys and sort there, but good to have structure
        });

        return towers;
    }, [units]);

    return (
        <div className="space-y-8">
            {Object.entries(groupedData).map(([tower, floors]) => (
                <Card key={tower} className="overflow-hidden bg-slate-50/50">
                    <CardHeader className="border-b bg-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-100">
                                    <Building2 className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Tower {tower}</CardTitle>
                                    <CardDescription>Residential Block • {Object.keys(floors).length} Floors</CardDescription>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                    {Object.values(floors).flat().filter(u => u.status === 'Available').length} Available
                                </Badge>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {Object.values(floors).flat().filter(u => u.status === 'Booked').length} Booked
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {Object.entries(floors)
                                .sort((a, b) => Number(b[0]) - Number(a[0])) // Top floor first
                                .map(([floor, floorUnits]) => (
                                    <div key={floor} className="flex gap-4 items-stretch">
                                        <div className="w-24 shrink-0 flex flex-col justify-center items-center bg-white rounded-lg border border-slate-200 p-2 shadow-sm">
                                            <Layers className="h-4 w-4 text-slate-400 mb-1" />
                                            <span className="text-sm font-bold text-slate-600">Floor {floor}</span>
                                        </div>

                                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                            {floorUnits.sort((a, b) => a.number.localeCompare(b.number)).map(unit => (
                                                <button
                                                    key={unit.id}
                                                    onClick={() => setSelectedUnit(unit)}
                                                    className={cn(
                                                        "relative group flex flex-col items-start p-3 rounded-xl border transition-all duration-200 ease-out hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                                                        getStatusColor(unit.status)
                                                    )}
                                                >
                                                    <div className="flex justify-between w-full mb-1">
                                                        <span className="font-bold text-sm tracking-tight">{unit.number}</span>
                                                        <span className="text-[10px] uppercase font-bold opacity-70">{unit.type}</span>
                                                    </div>
                                                    <div className="text-[10px] font-medium opacity-80 flex items-center gap-1">
                                                        {unit.superArea} sqft
                                                    </div>
                                                    <div className="mt-2 w-full pt-2 border-t border-black/5 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[10px] font-bold">{unit.status}</span>
                                                        {unit.status === 'Available' && <MoveRight className="h-3 w-3" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* UNIT DETAILS DIALOG */}
            <Dialog open={!!selectedUnit} onOpenChange={(open) => !open && setSelectedUnit(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Home className="h-5 w-5 text-blue-600" />
                            Unit {selectedUnit?.number} Details
                        </DialogTitle>
                        <DialogDescription>
                            {selectedUnit?.project} • Tower {selectedUnit?.tower} • Floor {selectedUnit?.floor}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUnit && (
                        <div className="grid gap-6 py-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Current Status</p>
                                    <Badge className={cn("mt-1", getStatusColor(selectedUnit.status).split(' ')[0], getStatusColor(selectedUnit.status).split(' ')[1])}>
                                        {selectedUnit.status}
                                    </Badge>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-slate-500">Total Agreement Value</p>
                                    <p className="text-xl font-bold text-slate-900 flex items-center justifyContent-end gap-1">
                                        <IndianRupee className="h-4 w-4" />
                                        {formatCurrency(selectedUnit.totalValue).replace('₹', '')}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Configuration</p>
                                    <p className="text-sm font-medium">{selectedUnit.type} Apartment</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Facing</p>
                                    <p className="text-sm font-medium">{selectedUnit.facing}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Super Built-up Area</p>
                                    <p className="text-sm font-medium">{selectedUnit.superArea} sq. ft.</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Carpet Area</p>
                                    <p className="text-sm font-medium">{selectedUnit.carpetArea} sq. ft.</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Base Rate</p>
                                    <p className="text-sm font-medium">{formatCurrency(selectedUnit.baseRate)} / sq. ft.</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Parking</p>
                                    <p className="text-sm font-medium">{selectedUnit.parking}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        {selectedUnit?.status === 'Available' && (
                            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">Book Unit</Button>
                        )}
                        {selectedUnit?.status === 'Booked' && (
                            <Button variant="outline" className="w-full sm:w-auto">View Booking Details</Button>
                        )}
                        <Button variant="secondary" onClick={() => setSelectedUnit(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
