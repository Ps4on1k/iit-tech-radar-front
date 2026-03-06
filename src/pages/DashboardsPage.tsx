import React from 'react';
import { useAuth } from '../context/AuthContext';

export const DashboardsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] transition-colors duration-200">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Дашборды</h1>
        
        <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md p-8 text-center transition-colors duration-200">
          <div className="text-gray-600 dark:text-gray-400">
            <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-xl font-semibold mb-2">Дашборды в разработке</p>
            <p className="text-sm">
              В этом разделе скоро появятся интерактивные дашборды для анализа технологий и метрик.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
