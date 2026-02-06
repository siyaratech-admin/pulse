
import React, { useEffect, useState } from 'react';
import { useAccessControl } from '@/hooks/useAccessControl';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { hasRole, isLoading, userRoles } = useAccessControl();
    const navigate = useNavigate();
    const [loadingTimeout, setLoadingTimeout] = useState(false);

    // Add a timeout to prevent infinite loading
    useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(() => {
                setLoadingTimeout(true);
            }, 3000); // 3 second timeout
            return () => clearTimeout(timer);
        } else {
            setLoadingTimeout(false);
        }
    }, [isLoading]);

    if (isLoading && !loadingTimeout) {
        return <div className="p-8 text-center text-muted-foreground">Checking permissions...</div>;
    }

    if (!hasRole(allowedRoles)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
                <p className="text-gray-600 mb-6 max-w-md">
                    You do not have permission to view this page. Please contact your system administrator if you believe this is an error.
                </p>
                <Button onClick={() => navigate('/')} variant="outline">
                    Return to Dashboard
                </Button>

                {/* DEBUG SECTION - TO BE REMOVED */}
                <div className="mt-8 p-4 bg-gray-100 rounded text-xs text-left">
                    <p className="font-bold">Debug Info:</p>
                    <p>Required Roles: {JSON.stringify(allowedRoles)}</p>
                    <p>Your Roles: {JSON.stringify(userRoles)}</p>
                    <p>Loading Timeout: {loadingTimeout ? 'Yes' : 'No'}</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
