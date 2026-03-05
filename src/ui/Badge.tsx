import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

// Category badges with specific colors
export const CategoryBadge: React.FC<{ category: string } & Partial<BadgeProps>> = ({
  category,
  ...props
}) => {
  const categoryVariants: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'purple'> = {
    adopt: 'success',
    trial: 'info',
    assess: 'warning',
    hold: 'danger',
    drop: 'danger',
  };

  return (
    <Badge variant={categoryVariants[category] || 'default'} {...props}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </Badge>
  );
};

// Type badges
export const TypeBadge: React.FC<{ type: string } & Partial<BadgeProps>> = ({
  type,
  ...props
}) => {
  const typeIcons: Record<string, string> = {
    'фреймворк': '⚡',
    'библиотека': '📦',
    'язык программирования': '💻',
    'инструмент': '🔧',
  };

  return (
    <Badge variant="info" {...props}>
      {typeIcons[type]} {type}
    </Badge>
  );
};
