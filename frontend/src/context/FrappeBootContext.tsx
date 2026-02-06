import React, { createContext, useContext, useState, useEffect } from "react";
import { useFrappeAuth, useFrappePostCall } from "frappe-react-sdk";

// Define the shape of the Boot Data containing permissions
export interface BootData {
    user: {
        name: string;
        email: string;
        roles: string[];
        all_read: string[];
        all_reports: string[];
        allow_modules: string[];
        can_cancel: string[];
        can_create: string[];
        can_delete: string[];
        can_email: string[];
        can_export: string[];
        can_get_report: string[];
        can_import: string[];
        can_print: string[];
        can_read: string[];
        can_search: string[];
        can_select: string[];
        can_submit: string[];
        can_write: string[];
        defaults: Record<string, any>;
        [key: string]: any;
    };
    [key: string]: any;
}

interface FrappeBootContextType {
    boot: BootData | null;
    isLoading: boolean;
    refreshBoot: () => Promise<void>;
}

const FrappeBootContext = createContext<FrappeBootContextType>({
    boot: null,
    isLoading: true,
    refreshBoot: async () => { },
});

export const useFrappeBoot = () => useContext(FrappeBootContext);

export const FrappeBootProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useFrappeAuth();
    const [boot, setBoot] = useState<BootData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Use the dev endpoint or a production equivalent
    // In production, boot data is usually injected in the page template.
    // For this SPA, we fetch it.
    const { call: getDevContext } = useFrappePostCall('kbweb.kbweb.api.dev.get_context_for_dev');

    const fetchBootData = async () => {
        let hasCache = false;
        console.log("Environment DEV check:", import.meta.env.DEV);

        // 1. Try to load from local storage first in Dev mode for speed
        if (import.meta.env.DEV) {
            const cached = localStorage.getItem('frappe_boot');
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    setBoot(parsed);
                    hasCache = true;
                    setIsLoading(false); // Immediate render with cache
                    console.log("Loaded boot data from localStorage cache");
                } catch (e) {
                    console.warn("Invalid cached boot data", e);
                }
            }
        }

        // Only show loading spinner if we didn't have a cache
        if (!hasCache) {
            setIsLoading(true);
        }

        try {
            if (import.meta.env.DEV) {
                // Fetch from our custom dev endpoint
                console.log("Fetching boot data from API...");
                const res = await getDevContext({});
                console.log("API Response:", res);

                if (res && res.message) {
                    const data = typeof res.message === 'string' ? JSON.parse(res.message) : res.message;
                    setBoot(data);
                    // Cache it
                    localStorage.setItem('frappe_boot', JSON.stringify(data));
                    console.log("Boot data fetched and cached");
                }
            } else {
                // TODO: Handle production fetch
                const res = await getDevContext({});
                if (res && res.message) {
                    const data = typeof res.message === 'string' ? JSON.parse(res.message) : res.message;
                    setBoot(data);
                }
            }
        } catch (e) {
            console.error("Failed to fetch boot data:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchBootData();
        } else {
            setBoot(null);
            setIsLoading(false);
            localStorage.removeItem('frappe_boot');
        }
    }, [currentUser]);

    // Expose boot to window for debugging
    useEffect(() => {
        // We expose it even in non-DEV if available, just for sanity check right now, 
        // but guarding with DEV is fine if user insists.
        if (boot) {
            if (!(window as any).frappe) {
                (window as any).frappe = {};
            }
            (window as any).frappe.boot = boot;
            console.log("✅ frappe.boot is set globally:", (window as any).frappe.boot);
        }
    }, [boot]);

    return (
        <FrappeBootContext.Provider value={{ boot, isLoading, refreshBoot: fetchBootData }}>
            {children}
        </FrappeBootContext.Provider>
    );
};
