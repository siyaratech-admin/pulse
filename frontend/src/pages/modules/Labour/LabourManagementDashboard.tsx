import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LabourManagementDashboard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Labour Management Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="max-w-sm">
                    <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Daily Labour Summary
                    </h5>
                    <p className="font-normal text-gray-700 dark:text-gray-400">
                        View and manage daily labour summaries.
                    </p>
                    <Button onClick={() => navigate('/labour-management/daily-labour-summary-list')}>
                        Go to Summary List
                    </Button>
                </Card>
                <Card className="max-w-sm">
                    <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Daily Labour Usage
                    </h5>
                    <p className="font-normal text-gray-700 dark:text-gray-400">
                        View and manage daily labour usage.
                    </p>
                    <Button onClick={() => navigate('/labour-management/daily-labour-usage-list')}>
                        Go to Usage List
                    </Button>
                </Card>
            </div>
        </div>
    );
};

export default LabourManagementDashboard;
