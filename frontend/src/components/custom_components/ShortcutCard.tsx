import React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';

interface ShortcutCardProps {
  /** Title of the shortcut card */
  title: string;
  /** Description text shown below the title */
  description: string;
  /** Icon component to display */
  icon: React.ReactNode;
  /** CSS classes for border color and hover effects */
  color?: string;
  /** Click handler function */
  onClick: () => void;
  /** Optional badge text to show in top-right corner */
  badge?: string;
  /** Whether to show external link icon instead of arrow */
  isExternal?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether the card is disabled */
  disabled?: boolean;
}

const ShortcutCard: React.FC<ShortcutCardProps> = ({ 
  title, 
  description, 
  icon, 
  color = "border-gray-200 hover:border-gray-300", 
  onClick,
  badge,
  isExternal = false,
  className = "",
  disabled = false
}) => {
  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  return (
    <div 
      className={`
        group p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 
        bg-white relative overflow-hidden
        ${disabled 
          ? 'opacity-50 cursor-not-allowed border-gray-100' 
          : `hover:shadow-md ${color}`
        }
        ${className}
      `}
      onClick={handleClick}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
          {badge}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Icon Container */}
          <div className={`
            flex-shrink-0 p-2 rounded-md transition-colors
            ${disabled 
              ? 'bg-gray-100' 
              : 'bg-gray-50 group-hover:bg-gray-100'
            }
          `}>
            {icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 pr-2">
            <h4 className={`
              text-sm font-medium transition-colors
              ${disabled 
                ? 'text-gray-400' 
                : 'text-gray-900 group-hover:text-gray-700'
              }
            `}>
              {title}
            </h4>
            <p className={`
              text-xs mt-1 line-clamp-2
              ${disabled 
                ? 'text-gray-300' 
                : 'text-gray-500'
              }
            `}>
              {description}
            </p>
          </div>
        </div>
        
        {/* Arrow/External Link Icon */}
        {!disabled && (
          isExternal ? (
            <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
          ) : (
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
          )
        )}
      </div>
    </div>
  );
};

export default ShortcutCard;