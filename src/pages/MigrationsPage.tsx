import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import type { TechRadarEntity } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface MigrationItem {
  id: string;
  name: string;
  currentVersion: string;
  upgradePath?: string;
  versionToUpdate?: string;
  versionUpdateDeadline?: string;
  recommendedAlternatives?: string[];
  category: string;
  riskLevel: string;
  owner: string;
}

export const MigrationsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [technologies, setTechnologies] = useState<TechRadarEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'needs-update' | 'has-alternatives'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchTechnologies = async () => {
      try {
        setLoading(true);
        const response = await api.get('/tech-radar');
        setTechnologies(response.data);
      } catch (err: any) {
        console.error('Ошибка загрузки технологий:', err);
        setError(err.response?.data?.message || 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    fetchTechnologies();
  }, [isAuthenticated]);

  const migrationItems: MigrationItem[] = useMemo(() => {
    return technologies
      .filter(tech => 
        tech.versionToUpdate || 
        tech.upgradePath || 
        (tech.recommendedAlternatives && tech.recommendedAlternatives.length > 0)
      )
      .map(tech => ({
        id: tech.id,
        name: tech.name,
        currentVersion: tech.version,
        upgradePath: tech.upgradePath,
        versionToUpdate: tech.versionToUpdate,
        versionUpdateDeadline: tech.versionUpdateDeadline,
        recommendedAlternatives: tech.recommendedAlternatives,
        category: tech.category,
        riskLevel: tech.riskLevel,
        owner: tech.owner,
      }));
  }, [technologies]);

  const filteredItems = useMemo(() => {
    return migrationItems.filter(item => {
      // Фильтр по типу миграции
      if (filter === 'needs-update' && !item.versionToUpdate) return false;
      if (filter === 'has-alternatives' && (!item.recommendedAlternatives || item.recommendedAlternatives.length === 0)) return false;

      // Поиск по названию
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      return true;
    });
  }, [migrationItems, filter, searchTerm]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      adopt: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
      trial: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
      assess: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
      hold: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
      drop: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    };
    return colors[category] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const getRiskColor = (risk: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
      medium: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
      high: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
      critical: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    };
    return colors[risk] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] transition-colors duration-200">
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] transition-colors duration-200">
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Миграции</h1>
          <p className="text-gray-600 dark:text-gray-400">
            План миграции и обновления технологий
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md p-4 transition-colors duration-200">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Всего миграций</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{migrationItems.length}</p>
          </div>
          <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md p-4 transition-colors duration-200">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Требуют обновления</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {migrationItems.filter(i => i.versionToUpdate).length}
            </p>
          </div>
          <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md p-4 transition-colors duration-200">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Есть альтернативы</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {migrationItems.filter(i => i.recommendedAlternatives && i.recommendedAlternatives.length > 0).length}
            </p>
          </div>
          <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md p-4 transition-colors duration-200">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">С дедлайном</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {migrationItems.filter(i => i.versionUpdateDeadline).length}
            </p>
          </div>
        </div>

        {/* Фильтры */}
        <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md p-4 mb-6 transition-colors duration-200">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Все ({migrationItems.length})
              </button>
              <button
                onClick={() => setFilter('needs-update')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  filter === 'needs-update'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Требуют обновления ({migrationItems.filter(i => i.versionToUpdate).length})
              </button>
              <button
                onClick={() => setFilter('has-alternatives')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  filter === 'has-alternatives'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Есть альтернативы ({migrationItems.filter(i => i.recommendedAlternatives && i.recommendedAlternatives.length > 0).length})
              </button>
            </div>
            <input
              type="text"
              placeholder="Поиск технологии..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Таблица миграций */}
        <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md overflow-hidden transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    Технология
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    Текущая версия
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    План миграции
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    Категория
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    Риск
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    Владелец
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      Нет данных для отображения
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-sm text-gray-900 dark:text-gray-100">
                          {item.currentVersion}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          {/* Версия для обновления */}
                          {item.versionToUpdate && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                Обновить до: {item.versionToUpdate}
                              </span>
                              {item.versionUpdateDeadline && (
                                <span className={`text-xs ${
                                  new Date(item.versionUpdateDeadline) < new Date()
                                    ? 'text-red-600 dark:text-red-400 font-semibold'
                                    : 'text-gray-500 dark:text-gray-500'
                                }`}>
                                  (до {new Date(item.versionUpdateDeadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: '2-digit' })})
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Путь обновления */}
                          {item.upgradePath && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                              📋 {item.upgradePath}
                            </div>
                          )}
                          
                          {/* Альтернативы */}
                          {item.recommendedAlternatives && item.recommendedAlternatives.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">Альтернативы:</span>
                              {item.recommendedAlternatives.map((alt, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded"
                                >
                                  {alt}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRiskColor(item.riskLevel)}`}>
                          {item.riskLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {item.owner}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
