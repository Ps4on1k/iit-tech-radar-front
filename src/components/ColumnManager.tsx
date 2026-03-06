import React, { useState } from 'react';

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
}

interface ColumnManagerProps {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
  storageKey: string;
}

export const ColumnManager: React.FC<ColumnManagerProps> = ({
  columns,
  onColumnsChange,
  storageKey,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (key: string) => {
    const updated = columns.map(col =>
      col.key === key ? { ...col, visible: !col.visible } : col
    );
    onColumnsChange(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleReset = () => {
    const reset = columns.map(col => ({ ...col, visible: true }));
    onColumnsChange(reset);
    localStorage.setItem(storageKey, JSON.stringify(reset));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title="Настроить поля"
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#16213e] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 p-4">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Поля таблицы</h3>
              <button
                onClick={handleReset}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Сбросить
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {columns.map(column => (
                <label
                  key={column.key}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={column.visible}
                    onChange={() => handleToggle(column.key)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{column.label}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
