import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showTotal?: boolean;
  showQuickJumper?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showTotal = true,
  showQuickJumper = false,
  className = '',
}) => {
  const [jumpPage, setJumpPage] = React.useState('');

  const handleJump = () => {
    const page = parseInt(jumpPage, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
      setJumpPage('');
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 ${className}`}>
      {showTotal && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Показано {startIndex}-{endIndex} из {totalItems}
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-gray-100 dark:hover:bg-gray-700
                     text-gray-700 dark:text-gray-300"
        >
          ←
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, index) =>
          page === '...' ? (
            <span key={index} className="px-2 text-gray-400">...</span>
          ) : (
            <button
              key={index}
              onClick={() => onPageChange(page as number)}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                currentPage === page
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-gray-100 dark:hover:bg-gray-700
                     text-gray-700 dark:text-gray-300"
        >
          →
        </button>
      </div>

      {/* Items per page selector */}
      {onItemsPerPageChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Показывать:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value, 10))}
            className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 
                       rounded-lg bg-white dark:bg-gray-800
                       text-gray-700 dark:text-gray-300"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      )}

      {/* Quick jumper */}
      {showQuickJumper && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Перейти:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJump()}
            className="w-16 px-2 py-1.5 border border-gray-300 dark:border-gray-600 
                       rounded-lg bg-white dark:bg-gray-800
                       text-gray-700 dark:text-gray-300"
          />
          <button
            onClick={handleJump}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg 
                       hover:bg-blue-700 transition-colors"
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
};
