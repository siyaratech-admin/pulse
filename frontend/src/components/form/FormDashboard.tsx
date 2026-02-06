import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { fetchResourceList } from '@/utils/frappeApiHelpers';
import { Loader2, Plus, ArrowRight, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FormDashboardProps {
    doctype: string;
    name: string;
    doc?: any;
    className?: string;
}

interface LinkCount {
    doctype: string;
    count: number;
    label?: string;
    firstDocName?: string;
}

import { DOCTYPE_CONNECTIONS as KNOWN_LINKS, CATEGORIES } from '@/config/doctype_connections';

export const FormDashboard: React.FC<FormDashboardProps> = ({ doctype, name, doc, className }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<LinkCount[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchConnections = async () => {
            if (!doctype || !name) return;

            setIsLoading(true);

            try {
                // Use backend API to fetch link fields (avoids PermissionError)
                const response = await fetch(
                    `/api/method/pulse.api.get_link_fields.get_link_fields?doctype=${encodeURIComponent(doctype)}`,
                    {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                        },
                        credentials: 'include',
                    }
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch link fields: ${response.status}`);
                }

                const data = await response.json();
                const linkFieldsData = data.message || { standard: [], custom: [] };

                const discoveredMap = new Map<string, string>(); // Doctype -> Fieldname

                // Process standard fields
                (linkFieldsData.standard || []).forEach((item: any) => {
                    if (item.parent && item.fieldname) {
                        discoveredMap.set(item.parent, item.fieldname);
                    }
                });

                // Process custom fields
                (linkFieldsData.custom || []).forEach((item: any) => {
                    if (item.parent && item.fieldname) {
                        discoveredMap.set(item.parent, item.fieldname);
                    }
                });

                // 2. Merge with KNOWN_LINKS (explicit favorites)
                // We trust KNOWN_LINKS to exist, but we still prefer discovered fieldnames if available.
                const explicitDocs = KNOWN_LINKS[doctype] || [];

                // Combine all unique target doctypes
                const allTargetDocs = new Set([...explicitDocs, ...discoveredMap.keys()]);

                // Remove self (recursive links handled elsewhere usually?) and system doctypes
                allTargetDocs.delete(doctype);
                allTargetDocs.delete('DocType');

                if (allTargetDocs.size === 0) {
                    setStats([]);
                    setIsLoading(false);
                    return;
                }

                // 3. Fetch counts for each target
                const newStats: LinkCount[] = [];

                await Promise.all(Array.from(allTargetDocs).map(async (targetDt) => {
                    try {
                        // Determine the fieldname to filter by
                        // 1. Use discovered fieldname if available
                        // 2. Special override for Job Offer -> Employee (legacy logic)
                        // 3. Fallback to snake_case of current doctype

                        let filterField = discoveredMap.get(targetDt);

                        if (!filterField) {
                            if (doctype === 'Job Offer' && targetDt === 'Employee' && doc?.job_applicant) {
                                filterField = 'job_applicant';
                            } else {
                                filterField = doctype.split(' ').join('_').toLowerCase();
                            }
                        }

                        let filterValue = name;
                        // Legacy override value
                        if (doctype === 'Job Offer' && targetDt === 'Employee' && doc?.job_applicant) {
                            filterValue = doc.job_applicant;
                        }

                        const filters = { [filterField!]: filterValue };

                        // We use fetchResourceList here just to get the count/first record
                        // We only need 'name' field
                        const list = await fetchResourceList(targetDt, ['name'], filters, 20);

                        newStats.push({
                            doctype: targetDt,
                            count: list.length,
                            firstDocName: list.length > 0 ? list[0].value : undefined
                        });
                    } catch (e) {
                        // Push 0 count on error, allowing "Create New"
                        newStats.push({
                            doctype: targetDt,
                            count: 0
                        });
                    }
                }));

                // Sort by count (desc) then name
                newStats.sort((a, b) => b.count - a.count || a.doctype.localeCompare(b.doctype));
                setStats(newStats);

            } catch (error) {
                console.error("Dashboard error", error);
                setStats([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConnections();
    }, [doctype, name, doc]);

    // Group stats by category
    const getCategory = (dt: string) => {
        for (const [cat, items] of Object.entries(CATEGORIES)) {
            if (items.includes(dt)) return cat;
        }
        return 'Other';
    };

    const groupedStats = stats.reduce((acc, stat) => {
        const cat = getCategory(stat.doctype);
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(stat);
        return acc;
    }, {} as Record<string, LinkCount[]>);

    if (stats.length === 0 && !isLoading) return null;

    const handleCardClick = (s: LinkCount) => {
        if (s.count === 0) {
            // If no records, clicking the card actions as "Create New"
            const defaultField = doctype.replace(/ /g, '_').toLowerCase();
            navigate(`/app/${s.doctype}/new`, {
                state: {
                    defaults: { [defaultField]: name }
                }
            });
            return;
        }

        if (s.count === 1 && s.firstDocName) {
            // Go directly to the document
            navigate(`/app/${s.doctype}/${s.firstDocName}`);
        } else {
            // Go to list view with filter
            navigate(`/app/list/${s.doctype}?${doctype}=${name}`);
        }
    };

    const handlePlusClick = (e: React.MouseEvent, s: LinkCount) => {
        e.stopPropagation();
        // Navigate to new form with defaults
        const defaultField = doctype.replace(/ /g, '_').toLowerCase();
        navigate(`/app/${s.doctype}/new`, {
            state: {
                defaults: { [defaultField]: name }
            }
        });
    };

    return (
        <div className={`space-y-6 p-1 ${className || ''}`}>
            {isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading connections...
                </div>
            )}

            {Object.entries(groupedStats).map(([category, items]) => (
                <div key={category} className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider pl-1 border-l-2 border-primary/20">
                        {category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {items.map(s => (
                            <Card
                                key={s.doctype}
                                className={`
                                    group relative overflow-hidden transition-all hover:shadow-md border-slate-200 cursor-pointer
                                    ${s.count > 0 ? 'bg-white' : 'bg-slate-50/50'}
                                `}
                                onClick={() => handleCardClick(s)}
                            >
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            p-2 rounded-lg 
                                            ${s.count > 0 ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}
                                        `}>
                                            <LinkIcon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className={`font-medium text-sm ${s.count > 0 ? 'text-slate-900' : 'text-slate-500'}`}>
                                                {s.doctype}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {s.count} record{s.count !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded-full hover:bg-slate-100"
                                            onClick={(e) => handlePlusClick(e, s)}
                                            title={`Create new ${s.doctype}`}
                                        >
                                            <Plus className="h-4 w-4 text-slate-600" />
                                        </Button>
                                        {s.count > 0 && (
                                            <ArrowRight className="h-4 w-4 text-slate-400" />
                                        )}
                                    </div>
                                </CardContent>
                                {s.count > 0 && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            ))}

            {stats.length === 0 && !isLoading && (
                <div className="text-center py-10 text-muted-foreground">
                    No connections available for this document.
                </div>
            )}
        </div>
    );
};
