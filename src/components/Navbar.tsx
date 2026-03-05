import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VersionModal } from './VersionModal';
import { ThemeToggle } from '../ui/ThemeToggle';

export const Navbar: React.FC = () => {
  const auth = useAuth();
  const location = useLocation();
  const [showVersionModal, setShowVersionModal] = useState(false);

  if (!auth.isAuthenticated) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-[#16213e] shadow-md border-b border-gray-200 dark:border-[#0f3460] transition-colors duration-200">
      <div className="max-w-[1400px] mx-auto px-4 py-4 flex justify-between items-center">
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
                to="/audit"
                className={`text-sm ${isActive('/audit') ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-300'} no-underline hover:underline transition-colors`}
              >
                Аудит
              </Link>
              <Link
                to="/import"
                className={`text-sm ${isActive('/import') ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-300'} no-underline hover:underline transition-colors`}
              >
                Импорт/Экспорт
              </Link>
            </div>
          )}
          {auth.user?.role === 'manager' && (
            <Link
              to="/import"
              className={`text-sm ${isActive('/import') ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-300'} no-underline hover:underline transition-colors`}
            >
              Импорт/Экспорт
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          {auth.isAdmin && (
            <span className="px-2.5 py-1 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              Администратор
            </span>
          )}
          {auth.user?.role === 'manager' && (
            <span className="px-2.5 py-1 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              Менеджер
            </span>
          )}
          <span className="text-gray-600 dark:text-gray-300 text-sm">
            {auth.user?.firstName} {auth.user?.lastName}
          </span>
          <ThemeToggle size="md" />
          <button
            onClick={() => {
              console.log('Version button clicked!');
              setShowVersionModal(true);
            }}
            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center cursor-pointer border-none shadow-md transition-colors"
            title="О системе (версии)"
          >
            ?
          </button>
          <button
            onClick={() => auth.logout()}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 border-none cursor-pointer transition-colors rounded"
          >
            Выйти
          </button>
        </div>
      </div>
      <VersionModal isOpen={showVersionModal} onClose={() => setShowVersionModal(false)} />
    </nav>
  );
};
