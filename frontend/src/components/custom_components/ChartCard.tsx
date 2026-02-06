import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { BarChart3, TrendingUp } from 'lucide-react';

interface ChartCardProps {
  title: string;
  description?: string;
  data?: any[];
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  data,
  className
}) => {
  // Sample data for demonstration
  const sampleData = data || [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 500 },
    { name: 'Apr', value: 280 },
    { name: 'May', value: 590 },
    { name: 'Jun', value: 320 },
  ];

  const maxValue = Math.max(...sampleData.map(d => d.value));

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </div>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Simple bar chart visualization */}
          <div className="flex items-end space-x-1 h-20">
            {sampleData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                  style={{ height: `${(item.value / maxValue) * 100}%` }}
                />
                <span className="text-xs text-muted-foreground mt-1">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
          
          {/* Summary stats */}
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
            <span>+12.5% from last month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartCard;