import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StandardHeaderProps {
    title: string;
    subtitle?: string;
    icon?: string | React.ReactNode;
    showBack?: boolean;
    onBack?: () => void;
    actions?: React.ReactNode;
    className?: string;
}

export const StandardHeader: React.FC<StandardHeaderProps> = ({
    title,
    subtitle,
    icon,
    showBack = false,
    onBack,
    actions,
    className
}) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <div className={`relative flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg ${className}`}>
            <div className="px-3 py-3 md:px-6 md:py-8 flex items-center gap-2 md:gap-4 min-w-0 flex-1">
                {showBack && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="h-8 w-8 md:h-9 md:w-9 rounded-full text-white hover:bg-white/20 hover:text-white transition-colors flex-shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                )}
                <div className="min-w-0 flex-1">
                    <h1 className="text-base md:text-2xl font-bold tracking-tight truncate">{title}</h1>
                    {subtitle && <p className="text-white/90 mt-0.5 md:mt-1 text-[10px] md:text-xs truncate hidden sm:block">{subtitle}</p>}
                </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2 px-2 md:px-6 flex-shrink-0">
                {actions}
                {icon && (
                    typeof icon === 'string' ? (
                        <img src={icon} alt={`${title} Icon`} className="h-full w-32 p-2 object-contain opacity-90 hidden lg:block" />
                    ) : (
                        <div className="opacity-90 hidden lg:block">{icon}</div>
                    )
                )}
            </div>
        </div>
    );
};