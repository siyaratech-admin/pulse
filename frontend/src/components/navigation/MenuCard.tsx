import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, ArrowRight, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

export interface MenuCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    link: string;
    count?: number;
    color?: string;
    badge?: string;
    disabled?: boolean;
    children?: React.ReactNode;
}

export const MenuCard: React.FC<MenuCardProps> = ({
    title,
    description,
    icon: Icon,
    link,
    count,
    color = "bg-blue-100 text-blue-700",
    badge,
    disabled = false,
    children,
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (!disabled) {
            navigate(link);
        }
    };

    return (
        <Card
            className={cn(
                "group cursor-pointer transition-all duration-200",
                "hover:shadow-lg hover:scale-[1.02]",
                disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleClick}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2.5 rounded-lg transition-colors", color)}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-base font-semibold">{title}</CardTitle>
                                {count !== undefined && (
                                    <Badge variant="secondary" className="text-xs font-medium">
                                        {count}
                                    </Badge>
                                )}
                                {badge && (
                                    <Badge className="text-xs">{badge}</Badge>
                                )}
                            </div>
                            <CardDescription className="text-sm mt-1">
                                {description}
                            </CardDescription>
                        </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
            </CardHeader>
            {children && (
                <CardContent className="pt-0">
                    {children}
                </CardContent>
            )}
        </Card>
    );
};
