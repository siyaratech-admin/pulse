
import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { AlertCircle } from 'lucide-react';

const ErrorBoundary: React.FC = () => {
    const error = useRouteError();
    const navigate = useNavigate();

    let errorMessage: string;
    let errorTitle: string;

    if (isRouteErrorResponse(error)) {
        // Handle standard HTTP errors
        errorTitle = `${error.status} ${error.statusText}`;
        errorMessage = error.data?.message || error.statusText;
        if (error.status === 404) {
            errorMessage = "The page you are looking for does not exist.";
        }
    } else if (error instanceof Error) {
        // Handle generic JS errors
        errorTitle = "Application Error";
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorTitle = "Error";
        errorMessage = error;
    } else {
        errorTitle = "Unknown Error";
        errorMessage = "An unexpected error occurred.";
    }

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 text-center space-y-4 bg-background rounded-lg border border-border shadow-sm m-4">
            <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">{errorTitle}</h1>
            <p className="text-muted-foreground max-w-md">{errorMessage}</p>
            <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
                <Button onClick={() => window.location.reload()}>
                    Reload Page
                </Button>
            </div>
        </div>
    );
};

export default ErrorBoundary;
