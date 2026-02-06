import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"; // Assuming standard shadcn Dialog
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Info, ChevronRight } from "lucide-react";
import { WorkflowNode } from "./hrms/WorkflowTree";
import { cn } from "@/lib/utils";

interface ModuleGuideProps {
  isOpen: boolean;
  onClose: () => void;
  modules: WorkflowNode[];
}

export const ModuleGuide: React.FC<ModuleGuideProps> = ({
  isOpen,
  onClose,
  modules,
}) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);

  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
      fontFamily: "inherit",
    });
  }, []);

  // Generate Mermaid Graph Definition
  const generateMermaidGraph = (nodes: WorkflowNode[]) => {
    let graphDefinition = "graph LR\n";
    const addedNodes = new Set<string>();

    // Helper to escape labels
    const escapeLabel = (label: string) => {
        return label.replace(/["()]/g, '');
    };

    const traverse = (node: WorkflowNode, parentId?: string) => {
      const nodeId = node.id.replace(/-/g, "_"); // Mermaid doesn't like hyphens in IDs sometimes or just to be safe
      
      if (!addedNodes.has(nodeId)) {
        let label = escapeLabel(node.label);
        // Style main modules differently
        if (!parentId) {
            graphDefinition += `${nodeId}["${label}"]\n`;
            graphDefinition += `style ${nodeId} fill:#2563eb,stroke:#1d4ed8,stroke-width:2px,color:#fff\n`;
        } else {
            graphDefinition += `${nodeId}("${label}")\n`;
            graphDefinition += `style ${nodeId} fill:#f1f5f9,stroke:#cbd5e1,stroke-width:1px,color:#334155\n`;
        }
        
        // Add click event
        graphDefinition += `click ${nodeId} call moduleGuideCallback("${node.id}")\n`;
        
        addedNodes.add(nodeId);
      }

      if (parentId) {
        const parentNodeId = parentId.replace(/-/g, "_");
        graphDefinition += `${parentNodeId} --> ${nodeId}\n`;
      }

      if (node.children) {
        node.children.forEach((child) => traverse(child, node.id));
      }
    };

    nodes.forEach((node) => traverse(node));
    return graphDefinition;
  };

  // Render Diagram
  useEffect(() => {
    if (isOpen && mermaidRef.current) {
      const graphDef = generateMermaidGraph(modules);
      
      // Clear previous
      mermaidRef.current.innerHTML = "";
      
      // Unique ID for this render to avoid conflicts if multiple
      const id = `mermaid-${Date.now()}`;
      
      try {
        mermaid.render(id, graphDef).then(({ svg }) => {
            if(mermaidRef.current) {
                mermaidRef.current.innerHTML = svg;
                
                // Bind the callback function to window so mermaid can call it
                // We need to map the ID back to the actual node object
                (window as any).moduleGuideCallback = (nodeId: string) => {
                    const findNode = (nodes: WorkflowNode[]): WorkflowNode | undefined => {
                        for (const node of nodes) {
                            if (node.id === nodeId) return node;
                            if (node.children) {
                                const found = findNode(node.children);
                                if (found) return found;
                            }
                        }
                    };
                    const node = findNode(modules);
                    setSelectedNode(node || null);
                };
            }
        });
      } catch (error) {
        console.error("Mermaid render error:", error);
        if(mermaidRef.current) mermaidRef.current.innerHTML = "Error rendering diagram.";
      }
    }
    
    return () => {
        // Cleanup global callback if needed, though mostly harmless
        delete (window as any).moduleGuideCallback;
    }
  }, [isOpen, modules]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden flex flex-row">
        
        {/* Main Diagram Area */}
        <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                 <Button variant="outline" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                 </Button>
            </div>
            
            <div className="p-4 border-b bg-white flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Info className="text-blue-600" />
                    Module Guide
                </h2>
                <p className="text-sm text-gray-500 mr-12">
                    Click on nodes to view details
                </p>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-dot-pattern">
                 <div ref={mermaidRef} className="w-full h-full flex items-center justify-center" />
            </div>
        </div>

        {/* Details Sidebar */}
        <div className={cn(
            "w-80 border-l bg-white h-full flex flex-col transition-all duration-300 ease-in-out",
            selectedNode ? "translate-x-0" : "translate-x-full hidden" // Simple toggle
        )}>
            {selectedNode ? (
                <>
                    <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                        <h3 className="font-semibold text-lg truncate" title={selectedNode.label}>
                            {selectedNode.label}
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-6">
                             {/* Icon & Basic Info */}
                             <div className="flex flex-col items-center p-6 bg-slate-50 rounded-xl border border-slate-100">
                                   <div className={cn(
                                       "h-16 w-16 rounded-full flex items-center justify-center text-white text-3xl mb-3 shadow-md",
                                       selectedNode.color || "bg-blue-500" // Fallback color
                                   )}>
                                     {/* We need to render the icon appropriately if it's a ReactNode. 
                                         However, since we can't easily clone it with new classes here without type assertions or cloning:
                                         We'll just wrapper it.
                                     */}
                                     <div className="text-white [&>svg]:w-8 [&>svg]:h-8">
                                         {selectedNode.icon}
                                     </div>
                                   </div>
                                   <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                       {selectedNode.id}
                                   </div>
                             </div>

                             {/* Details */}
                             <div className="space-y-4">
                                 <div>
                                     <label className="text-xs font-semibold text-gray-500 uppercase">Route</label>
                                     <div className="flex items-center gap-2 mt-1 text-sm bg-gray-100 p-2 rounded">
                                         <ChevronRight className="h-3 w-3" />
                                         <code>{selectedNode.route}</code>
                                     </div>
                                 </div>

                                 {selectedNode.doctype && (
                                     <div>
                                         <label className="text-xs font-semibold text-gray-500 uppercase">Associated DocType</label>
                                        <div className="mt-1 text-sm font-bold text-gray-900 border-l-4 border-blue-500 pl-3">
                                            {selectedNode.doctype}
                                        </div>
                                     </div>
                                 )}
                                 
                                 {selectedNode.description && (
                                      <div>
                                         <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                                         <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                                             {selectedNode.description}
                                         </p>
                                     </div>
                                 )}

                                 {/* Children List */}
                                 {selectedNode.children && selectedNode.children.length > 0 && (
                                     <div>
                                         <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">
                                             Sub-Modules ({selectedNode.children.length})
                                         </label>
                                         <div className="space-y-2">
                                             {selectedNode.children.map(child => (
                                                 <div 
                                                    key={child.id} 
                                                    className="flex items-center gap-2 p-2 rounded border hover:bg-gray-50 cursor-pointer text-sm"
                                                    onClick={() => setSelectedNode(child)}
                                                 >
                                                     <div className="p-1 bg-gray-200 rounded">
                                                         {/* Tiny icon placeholder if we handled it, or just a dot */}
                                                         <div className="h-2 w-2 bg-gray-500 rounded-full"/>
                                                     </div>
                                                     <span>{child.label}</span>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 )}
                             </div>
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t bg-gray-50">
                        <Button className="w-full" onClick={() => window.location.href = selectedNode.route}>
                            Navigate to Module
                        </Button>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                    <Info className="h-12 w-12 mb-4 opacity-20" />
                    <p>Select a node in the diagram to view its details.</p>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
