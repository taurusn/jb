'use client';

import { useState, ReactNode } from 'react';

export interface TabItem {
  key: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  items: TabItem[];
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultActiveKey,
  onChange,
  className = '',
  variant = 'default',
  size = 'md',
}) => {
  const [activeKey, setActiveKey] = useState(defaultActiveKey || items[0]?.key || '');

  const handleTabClick = (key: string) => {
    setActiveKey(key);
    onChange?.(key);
  };

  const getTabClasses = (isActive: boolean) => {
    const baseClasses = 'relative flex items-center gap-1 sm:gap-2 font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-opacity-50 flex-1 justify-center min-w-0';
    
    const sizeClasses = {
      sm: 'px-2 sm:px-3 py-2 text-xs sm:text-sm',
      md: 'px-2 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base',
      lg: 'px-3 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg',
    };

    const variantClasses = {
      default: isActive
        ? 'bg-brand-yellow text-brand-dark border-brand-yellow'
        : 'bg-transparent text-gray-400 border-dark-300 hover:text-brand-light hover:border-brand-yellow/50',
      pills: isActive
        ? 'bg-brand-yellow text-brand-dark rounded-lg'
        : 'bg-dark-400 text-gray-400 rounded-lg hover:bg-dark-300 hover:text-brand-light',
      underlined: isActive
        ? 'text-brand-yellow border-b-2 border-brand-yellow'
        : 'text-gray-400 border-b-2 border-transparent hover:text-brand-light hover:border-brand-yellow/50',
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
  };

  const getTabContainerClasses = () => {
    const baseClasses = 'flex';
    
    const variantClasses = {
      default: 'border-2 border-dark-300 rounded-lg p-1 bg-dark-400',
      pills: 'gap-2',
      underlined: 'gap-6 border-b border-dark-300',
    };

    return `${baseClasses} ${variantClasses[variant]}`;
  };

  const activeItem = items.find(item => item.key === activeKey);

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Navigation */}
      <div className={getTabContainerClasses()}>
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => handleTabClick(item.key)}
            className={getTabClasses(item.key === activeKey)}
          >
            {item.icon && (
              <span className="flex-shrink-0">
                {item.icon}
              </span>
            )}
            <span className="truncate hidden sm:inline">{item.label}</span>
            <span className="truncate sm:hidden text-xs">{item.label.split(' ')[0]}</span>
            {item.badge && (
              <span className={`
                flex-shrink-0 min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 px-1 sm:px-1.5 text-xs font-bold rounded-full flex items-center justify-center
                ${item.key === activeKey 
                  ? 'bg-brand-dark text-brand-yellow' 
                  : 'bg-brand-yellow text-brand-dark'
                }
              `}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeItem?.content}
      </div>
    </div>
  );
};

export default Tabs;