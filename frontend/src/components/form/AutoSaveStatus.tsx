import React from 'react';
import { Cloud, CloudOff, Save } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AutoSaveStatusProps {
  isAutoSaveEnabled?: boolean;
  lastSaved?: number | null;
  className?: string;
}

export const AutoSaveStatus: React.FC<AutoSaveStatusProps> = ({
  isAutoSaveEnabled = true,
  lastSaved,
  className
}) => {
  const getStatusText = () => {
    if (!isAutoSaveEnabled) {
      return 'Auto-save disabled';
    }
    
    if (!lastSaved) {
      return 'No changes to save';
    }
    
    const now = Date.now();
    const timeDiff = now - lastSaved;
    
    if (timeDiff < 5000) { // Less than 5 seconds
      return 'Saved just now';
    } else if (timeDiff < 60000) { // Less than 1 minute
      return `Saved ${Math.floor(timeDiff / 1000)}s ago`;
    } else if (timeDiff < 3600000) { // Less than 1 hour
      return `Saved ${Math.floor(timeDiff / 60000)}m ago`;
    } else {
      return `Saved ${new Date(lastSaved).toLocaleTimeString()}`;
    }
  };

  const getIcon = () => {
    if (!isAutoSaveEnabled) {
      return <CloudOff className="h-3 w-3" />;
    }
    
    if (!lastSaved) {
      return <Save className="h-3 w-3 text-gray-400" />;
    }
    
    return <Cloud className="h-3 w-3 text-green-500" />;
  };

  return (
    <div className={cn(
      "flex items-center gap-1 text-xs text-gray-500",
      className
    )}>
      {getIcon()}
      <span>{getStatusText()}</span>
    </div>
  );
};