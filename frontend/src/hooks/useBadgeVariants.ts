import { useMemo } from 'react';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export interface StatusBadgeConfig {
  variant: BadgeVariant;
  label: string;
  className?: string;
}

export interface UseBadgeVariantsProps {
  statusConfig?: Record<string, StatusBadgeConfig>;
  defaultVariant?: BadgeVariant;
}

export interface UseBadgeVariantsReturn {
  getBadgeConfig: (status: string) => StatusBadgeConfig;
  getAllStatuses: () => string[];
}

const defaultStatusConfig: Record<string, StatusBadgeConfig> = {
  'Open': {
    variant: 'default',
    label: 'Open',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  },
  'In Progress': {
    variant: 'secondary',
    label: 'In Progress',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
  },
  'Completed': {
    variant: 'outline',
    label: 'Completed',
    className: 'bg-green-100 text-green-800 hover:bg-green-200'
  },
  'On Hold': {
    variant: 'destructive',
    label: 'On Hold',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-200'
  },
  'Cancelled': {
    variant: 'destructive',
    label: 'Cancelled',
    className: 'bg-red-100 text-red-800 hover:bg-red-200'
  },
  'Template': {
    variant: 'outline',
    label: 'Template',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  }
};

export const useBadgeVariants = ({
  statusConfig = defaultStatusConfig,
  defaultVariant = 'default'
}: UseBadgeVariantsProps = {}): UseBadgeVariantsReturn => {
  
  const getBadgeConfig = useMemo(() => {
    return (status: string): StatusBadgeConfig => {
      return statusConfig[status] || {
        variant: defaultVariant,
        label: status,
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      };
    };
  }, [statusConfig, defaultVariant]);

  const getAllStatuses = useMemo(() => {
    return (): string[] => {
      return Object.keys(statusConfig);
    };
  }, [statusConfig]);

  return {
    getBadgeConfig,
    getAllStatuses,
  };
};