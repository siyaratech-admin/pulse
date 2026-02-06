
import React, { createContext, useContext, useMemo } from 'react';
import { useFrappeAuth, useFrappeGetCall } from 'frappe-react-sdk';

interface UserRoleContextType {
    userRoles: string[];
    hasRole: (requiredRoles?: string[]) => boolean;
    isLoading: boolean;
    error: any;
    debugData: any;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useFrappeAuth();

    // Fetch user info once at the top level
    const { data: userData, isLoading: userLoading, error: userError } = useFrappeGetCall(
        "pulse.api.get_current_user_info",
        null,
        // Only fetch if we have a current user, otherwise skip
        currentUser ? undefined : true
    );

    const userRoles = useMemo(() => {
        if (userData?.message?.roles) {
            return userData.message.roles;
        }
        return ["Guest"];
    }, [userData]);

    const hasRole = (requiredRoles?: string[]) => {
        if (!requiredRoles || requiredRoles.length === 0) return true;
        if (!userRoles) return false;

        if (userRoles.includes("System Manager") || userRoles.includes("Administrator")) return true;

        return requiredRoles.some(role => userRoles.includes(role));
    };

    const value = {
        userRoles,
        hasRole,
        isLoading: userLoading,
        error: userError,
        debugData: { userData }
    };

    return (
        <UserRoleContext.Provider value={value}>
            {children}
        </UserRoleContext.Provider>
    );
};

export const useUserRoleContext = () => {
    const context = useContext(UserRoleContext);
    if (context === undefined) {
        throw new Error('useUserRoleContext must be used within a UserRoleProvider');
    }
    return context;
};
