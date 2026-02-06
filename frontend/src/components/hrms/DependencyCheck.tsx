import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DependencyCheckProps {
    dependency: string;
    dependencyLink: string;
    currentDocType: string;
    hasDependency: boolean;
    children?: React.ReactNode;
}

export const DependencyCheck: React.FC<DependencyCheckProps> = ({
    dependency,
    dependencyLink,
    currentDocType,
    hasDependency,
    children,
}) => {
    const navigate = useNavigate();

    if (hasDependency) {
        return <>{children}</>;
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Missing Dependency</AlertTitle>
                <AlertDescription className="mt-2">
                    <p className="mb-4">
                        You need to create a <strong>{dependency}</strong> before you can create a{' '}
                        <strong>{currentDocType}</strong>.
                    </p>
                    <div className="flex gap-2">
                        <Button onClick={() => navigate(dependencyLink)}>
                            Create {dependency}
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                        <Button variant="outline" onClick={() => navigate(-1)}>
                            Go Back
                        </Button>
                    </div>
                </AlertDescription>
            </Alert>
        </div>
    );
};
