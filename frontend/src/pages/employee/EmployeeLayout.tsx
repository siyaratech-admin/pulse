import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { EmployeeDock } from './EmployeeDock';
import { useFrappeAuth } from 'frappe-react-sdk';
import { Menu, Bell, Search, LayoutDashboard, Clock, Calendar, Banknote, Wallet, CheckSquare, User, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Custom_Sidebar from '@/components/custom_components/Custom_Sidebar';
import { Toaster } from "@/components/ui/sonner";

export const EmployeeLayout = () => {
    const { logout } = useFrappeAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Check if we are in a form view (to hide PWA header)
    const isFormView = location.pathname.includes('/form/');

    // Scroll effect for header
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        // Only attach to window if we are scrolling body (mobile behavior usually)
        // But with new layout, we might scroll a div. 
        // For simplicity, we can keep this for mobile or adjust.
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-[280px] flex-shrink-0 h-full border-r border-slate-200 bg-white">
                <Custom_Sidebar
                    isCollapsed={false}
                    onToggle={() => { }}
                    className="border-none h-full"
                />
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">

                {/* Mobile Header - Hide on Desktop & Form Views */}
                {!isFormView && (
                    <header className={`md:hidden fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-4 py-3 flex items-center justify-between ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
                        <div className="flex items-center gap-2">
                            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-slate-700">
                                        <Menu className="w-6 h-6" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="bg-white z-[60]">
                                    <SheetHeader>
                                        <SheetTitle className="text-left text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                            PramodOne
                                        </SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-6 flex flex-col gap-1">
                                        {[
                                            { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
                                            { label: 'Attendance', path: '/employee/attendance', icon: Clock },
                                            { label: 'My Leaves', path: '/employee/hr', icon: Calendar },
                                            { label: 'Payroll', path: '/employee/salary-slips', icon: Banknote },
                                            { label: 'Expenses', path: '/employee/advances', icon: Wallet },
                                            { label: 'My Tasks', path: '/employee/tasks', icon: CheckSquare },
                                            { label: 'Profile', path: '/employee/profile', icon: User },
                                        ].map((item) => (
                                            <Button
                                                key={item.path}
                                                variant="ghost"
                                                className={`justify-start gap-3 h-12 px-4 rounded-xl text-slate-600 hover:text-primary hover:bg-primary/10 ${location.pathname === item.path ? 'bg-primary/10 text-primary font-medium' : ''}`}
                                                onClick={() => {
                                                    navigate(item.path);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                            >
                                                <item.icon className="w-5 h-5" />
                                                {item.label}
                                            </Button>
                                        ))}

                                        <div className="h-px bg-slate-100 my-2" />

                                        <Button variant="ghost" className="justify-start gap-3 h-12 px-4 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                                            <LogOut className="w-5 h-5" />
                                            Logout
                                        </Button>
                                    </div>
                                </SheetContent>
                            </Sheet>
                            <span className="font-bold text-lg text-slate-800 tracking-tight">
                                PramodOne
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="text-slate-500">
                                <Search className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-slate-500 relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
                            </Button>
                        </div>
                    </header>
                )}

                {/* Main Content Area - Scrollable */}
                {/* On mobile: add padding top/bottom for header/dock. On desktop: no padding needed (or just padding for aesthetics) */}
                <main className={`flex-1 overflow-y-auto scroll-smooth 
                    ${isFormView ? 'pt-0' : 'pt-16 md:pt-0'} 
                    pb-24 md:pb-0 
                    animate-in fade-in duration-500`
                }>
                    <Outlet />
                </main>

                {/* Mobile Bottom Dock - Hide on Desktop */}
                <div className="md:hidden">
                    <EmployeeDock />
                </div>
            </div>

            <Toaster />
        </div>
    );
};
