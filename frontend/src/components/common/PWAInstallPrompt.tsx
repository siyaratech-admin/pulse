import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Share } from 'lucide-react';

interface PWAInstallPromptProps {
    className?: string;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ className }) => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIosDevice);

        // Detect PWA installable event
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsOpen(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Detect if already installed related
        window.addEventListener('appinstalled', () => {
            setIsOpen(false);
            setDeferredPrompt(null);
            console.log('PWA Installed');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
        setIsOpen(false);
    };

    if (!isOpen && !isIOS) return null; // Don't show if not triggered (unless we want to force show for iOS instructions)

    // For iOS we might want to show instructions if strictly PWA mode is desired, 
    // but typically we only show if user is on mobile and not standalone.
    // Checking standalone mode:
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (isStandalone) return null;

    if (!isOpen && isIOS) {
        // Show iOS subtle prompt? Or only if logic dictates. 
        // User asked "trigger a popup to install... on hitting the app"
        // Let's assume we show it.
    }

    if (!isOpen && !isIOS && !isStandalone) return null;

    return (
        <div className={`fixed bottom-4 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-10 duration-500 ${className}`}>
            <div className="bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-white/10 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-sm">Install App</h3>
                        <p className="text-xs text-slate-300 mt-1">
                            Install PramodOne for a better experience.
                        </p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                            setDeferredPrompt(null);
                        }}
                        className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {isIOS ? (
                    <div className="text-xs bg-slate-800 p-2 rounded border border-white/5 z-50">
                        Tap <Share className="w-3 h-3 inline mx-1" /> and then "Add to Home Screen" <span className="font-bold border border-white/20 rounded px-1">+</span>
                    </div>
                ) : (
                    <Button
                        size="sm"
                        onClick={handleInstallClick}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium z-50"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Install Now
                    </Button>
                )}
            </div>
        </div>
    );
};
