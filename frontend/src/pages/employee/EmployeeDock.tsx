import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, Calendar, User, Briefcase, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const EmployeeDock = () => {
    const navItems = [
        {
            label: 'Home',
            icon: Home,
            to: '/employee/dashboard'
        },
        {
            label: 'Tasks',
            icon: CheckSquare,
            to: '/employee/tasks'
        },
        {
            label: 'Action', // Central Action Button
            icon: PlusCircle,
            to: '/employee/actions',
            isSpecial: true
        },
        {
            label: 'HR',
            icon: Calendar,
            to: '/employee/hr' // Leave, Attendance
        },
        {
            label: 'Profile',
            icon: User,
            to: '/employee/profile'
        }
    ];

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50">
            <div className="mx-auto max-w-md bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-2 flex items-center justify-around">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        className={({ isActive }) => cn(
                            "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300",
                            item.isSpecial
                                ? "bg-primary text-primary-foreground shadow-lg -mt-8 w-14 h-14 border-4 border-slate-100 dark:border-slate-900"
                                : isActive
                                    ? "text-primary bg-primary/10"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        <item.icon className={cn(
                            "transition-all",
                            item.isSpecial ? "w-6 h-6" : "w-5 h-5",
                            !item.isSpecial && "mb-0.5"
                        )} />
                        {!item.isSpecial && (
                            <span className="text-[10px] font-medium opacity-80">{item.label}</span>
                        )}
                    </NavLink>
                ))}
            </div>
        </div>
    );
};
