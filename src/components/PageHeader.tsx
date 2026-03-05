import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  const auth = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-[#16213e] shadow-md border-b border-gray-200 dark:border-[#0f3460] transition-colors duration-200">
      <div className="max-w-[1400px] mx-auto px-4 py-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400 no-underline hover:underline">Tech Radar</Link>
            {auth.isAdmin && (
              <div className="flex gap-4">
                <Link
                  to="/users"
                  className={`text-sm ${isActive('/users') ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-300'} no-underline hover:underline transition-colors`}
                >
                  Пользователи
                </Link>
                <Link
                  to="/import"
                  className={`text-sm ${isActive('/import') ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-300'} no-underline hover:underline transition-colors`}
                >
                  Импорт/Экспорт
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {auth.isAdmin && (
              <span className="px-2.5 py-1 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                Администратор
              </span>
            )}
            <span className="text-gray-600 dark:text-gray-300 text-sm">
              {auth.user?.firstName} {auth.user?.lastName}
            </span>
            <ThemeToggle size="md" />
            <button
              onClick={() => auth.logout()}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 border-none cursor-pointer transition-colors rounded"
            >
              Выйти
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {title && (
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 m-0">{title}</h1>
          )}
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 m-0 text-sm">{subtitle}</p>
          )}
        </div>
      </div>
    </nav>
  );
};
