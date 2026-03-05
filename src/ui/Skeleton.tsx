import React from 'react';

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | false;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  animation = 'pulse',
}) => {
  const baseStyles = `
    bg-gray-200
    ${variant === 'circular' ? 'rounded-full' : ''}
    ${variant === 'rounded' ? 'rounded-lg' : ''}
    ${variant === 'rectangular' ? 'rounded-none' : ''}
    ${animation === 'pulse' ? 'animate-pulse' : ''}
    ${className}
  `;

  const style: React.CSSProperties = {
    ...(width && { width }),
    ...(height && { height }),
    ...(variant === 'text' && { height: '1em' }),
  };

  return <div className={baseStyles} style={style} />;
};

export interface SkeletonTextProps {
  lines?: number;
  spacing?: 'sm' | 'md' | 'lg';
  width?: string | number;
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 1,
  spacing = 'md',
  width = '100%',
  className = '',
}) => {
  const spacingStyles = {
    sm: 'space-y-1',
    md: 'space-y-2',
    lg: 'space-y-3',
  };

  return (
    <div className={`${spacingStyles[spacing]} ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? `${width}` : '100%'}
          height="0.875rem"
        />
      ))}
    </div>
  );
};

export interface SkeletonCardProps {
  showImage?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showText?: boolean;
  textLines?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showImage = true,
  showTitle = true,
  showSubtitle = false,
  showText = true,
  textLines = 3,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      {showImage && (
        <Skeleton variant="rectangular" width="100%" height="160px" className="mb-4 rounded-lg" />
      )}
      {showTitle && (
        <Skeleton variant="text" width="70%" height="1.5rem" className="mb-2 rounded" />
      )}
      {showSubtitle && (
        <Skeleton variant="text" width="50%" height="1rem" className="mb-3 rounded" />
      )}
      {showText && (
        <SkeletonText lines={textLines} spacing="sm" className="mb-2" />
      )}
      <div className="flex gap-2 mt-4">
        <Skeleton variant="rectangular" width="60px" height="32px" className="rounded" />
        <Skeleton variant="rectangular" width="60px" height="32px" className="rounded" />
      </div>
    </div>
  );
};

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" width="100px" height="1rem" className="flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="text"
              width="100px"
              height="1.25rem"
              className="flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
};
