import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { WorkflowNode } from '@/components/hrms/WorkflowTree';
import { cn } from '@/lib/utils';
import { Package, ChevronRight } from 'lucide-react';

interface CentralHubCircularViewProps {
    modules: WorkflowNode[];
    centerTitle?: string;
    centerSubtitle?: string;
}

const CentralHubCircularView: React.FC<CentralHubCircularViewProps> = ({ modules, centerTitle = "CENTRAL", centerSubtitle = "HUB" }) => {
    const navigate = useNavigate();
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

    const radius = 150; // Radius of the circle
    const center = { x: 200, y: 200 }; // Center of the container

    const getPosition = (index: number, total: number) => {
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start from top
        return {
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle),
        };
    };

    const selectedModule = modules.find(m => m.id === selectedModuleId);

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-8 min-h-[500px]">
            {/* Circular Layout */}
            <div className="relative w-[400px] h-[400px] flex-shrink-0">
                {/* Connecting Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <circle cx={center.x} cy={center.y} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" />
                    {modules.map((module, index) => {
                        const pos = getPosition(index, modules.length);
                        return (
                            <line
                                key={`line-${module.id}`}
                                x1={center.x}
                                y1={center.y}
                                x2={pos.x}
                                y2={pos.y}
                                stroke="#cbd5e1"
                                strokeWidth="2"
                            />
                        );
                    })}
                </svg>

                {/* Center Hub */}
                <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
                >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-xl text-white border-4 border-white">
                        <div className="text-center">
                            <Package className="w-8 h-8 mx-auto mb-1" />
                            <span className="text-xs font-bold block uppercase">{centerTitle}</span>
                            <span className="text-[10px] font-medium opacity-80 uppercase">{centerSubtitle}</span>
                        </div>
                    </div>
                </div>

                {/* Orbiting Modules */}
                {modules.map((module, index) => {
                    const pos = getPosition(index, modules.length);
                    const isSelected = selectedModuleId === module.id;

                    return (
                        <div
                            key={module.id}
                            className={cn(
                                "absolute w-20 h-20 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 z-30",
                                "border-4 shadow-lg hover:scale-110",
                                isSelected ? "border-blue-500 scale-110 ring-4 ring-blue-100" : "border-white"
                            )}
                            style={{
                                left: pos.x,
                                top: pos.y,
                                marginLeft: -40, // Half of width
                                marginTop: -40, // Half of height
                            }}
                            onClick={() => setSelectedModuleId(module.id === selectedModuleId ? null : module.id)}
                        >
                            <div className={cn(
                                "w-full h-full rounded-full flex items-center justify-center text-white",
                                module.color || "bg-gray-500"
                            )}>
                                {React.isValidElement(module.icon) && React.cloneElement(module.icon as React.ReactElement<any>, { className: "w-8 h-8" })}
                            </div>
                            <span className={cn(
                                "absolute -bottom-8 whitespace-nowrap text-sm font-semibold px-2 py-1 rounded-md bg-white/80 backdrop-blur-sm",
                                isSelected ? "text-blue-700" : "text-gray-700"
                            )}>
                                {module.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Selected Module Details Panel */}
            <div className="w-full max-w-md">
                {selectedModule ? (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-right-5 duration-300">
                        <div className={cn("p-4 text-white flex items-center gap-3", selectedModule.color || "bg-gray-500")}>
                            {selectedModule.icon}
                            <h3 className="text-lg font-bold">{selectedModule.label} Modules</h3>
                        </div>
                        <div className="p-4 max-h-[400px] overflow-y-auto">
                            <div className="grid grid-cols-1 gap-2">
                                {selectedModule.children?.map((child) => (
                                    <div
                                        key={child.id}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-colors group"
                                        onClick={() => navigate(child.route)}
                                    >
                                        <div className="p-2 bg-gray-100 rounded-md text-gray-600 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                                            {child.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{child.label}</div>
                                            {child.description && <div className="text-xs text-gray-500">{child.description}</div>}
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-[300px] flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        <Package className="w-12 h-12 mb-2 opacity-20" />
                        <p>Select a module to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CentralHubCircularView;
