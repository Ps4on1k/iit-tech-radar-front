import React from 'react';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, size = 'md', className = '', ...props }, ref) => {
    const sizeStyles = {
      sm: 'w-9 h-5',
      md: 'w-11 h-6',
      lg: 'w-14 h-7',
    };

    const circleStyles = {
      sm: 'w-4 h-4 peer-checked:translate-x-4',
      md: 'w-5 h-5 peer-checked:translate-x-5',
      lg: 'w-6 h-6 peer-checked:translate-x-7',
    };

    return (
      <label className={`flex items-center cursor-pointer ${className}`}>
        <div className="relative">
          <input
            type="checkbox"
            ref={ref}
            className="sr-only peer"
            {...props}
          />
          {/* Фон свитча */}
          <div
            className={`
              ${sizeStyles[size]}
              bg-gray-300 dark:bg-gray-600
              rounded-full
              peer-checked:bg-blue-600
              transition-colors duration-200
            `}
          />
          {/* Кружок переключателя */}
          <div
            className={`
              absolute top-0.5 left-0.5
              ${circleStyles[size]}
              bg-white
              rounded-full
              transition-transform duration-200
              peer-checked:translate-x-full
              shadow-md
            `}
          />
        </div>
        {label && (
          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';
