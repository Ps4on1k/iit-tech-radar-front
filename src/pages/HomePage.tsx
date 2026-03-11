import React, { useState, useEffect, useCallback } from 'react';
import { TechRadarChart, TechRadarTable, TechRadarModal } from '../components';
import type { TechRadarEntity, TechRadarCategory, TechRadarType } from '../types';
import { techRadarApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { isAuthenticated, isAdminOrManager } = useAuth();
  const [data, setData] = useState<TechRadarEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<TechRadarEntity | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Фильтры из радара
  const [radarCategory, setRadarCategory] = useState<TechRadarCategory | undefined>();
  const [radarType, setRadarType] = useState<TechRadarType | undefined>();

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const result = await techRadarApi.getAll();
      setData(result || []);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      setError('Ошибка при загрузке данных');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && data.length === 0) {
      fetchData();
    }
  }, [isAuthenticated, data.length, fetchData]);

  const handleRadarFilter = useCallback((category?: TechRadarCategory, type?: TechRadarType) => {
    setRadarCategory(category);
    setRadarType(type);
  }, []);

  const handlePointClick = useCallback((entity: TechRadarEntity) => {
    setSelectedEntity(entity);
  }, []);

  const handleRowClick = useCallback((entity: TechRadarEntity) => {
    // Для всех пользователей - открываем страницу просмотра
    window.location.href = `/technology/${entity.id}`;
  }, []);

  const handleEdit = useCallback((entity: TechRadarEntity) => {
    // Для Admin/Manager - открываем модалку редактирования
    setSelectedEntity(entity);
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#1a1a2e] transition-colors duration-200">
        <div className="flex items-center justify-center h-[calc(100vh-140px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#1a1a2e] transition-colors duration-200">
        <div className="flex items-center justify-center h-[calc(100vh-140px)]">
          <div className="text-center text-red-600 dark:text-red-400">
            <p className="text-xl">{error}</p>
            <button
              onClick={() => fetchData()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Применяем фильтры радара к данным
  const filteredData = data.filter(entity => {
    if (radarCategory && entity.category !== radarCategory) return false;
    if (radarType && entity.type !== radarType) return false;
    return true;
  });

  // Статистика по типам
  const statsByType = {
    frameworks: filteredData.filter(d => d.type === 'фреймворк').length,
    libraries: filteredData.filter(d => d.type === 'библиотека').length,
    languages: filteredData.filter(d => d.type === 'язык программирования').length,
    tools: filteredData.filter(d => d.type === 'инструмент').length,
  };

  // Статистика по категориям
  const statsByCategory = {
    adopt: filteredData.filter(d => d.category === 'adopt').length,
    trial: filteredData.filter(d => d.category === 'trial').length,
    assess: filteredData.filter(d => d.category === 'assess').length,
    holdDrop: filteredData.filter(d => d.category === 'hold' || d.category === 'drop').length,
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#1a1a2e] transition-colors duration-200">
      <main className="max-w-[1800px] mx-auto px-4 py-8">
        {/* Заголовок страницы */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Обзор технологического стэка</h1>
        </div>

        {/* Грид: Радар слева, плитки справа - общий фон */}
        <div className="bg-gray-50 dark:bg-[#1a1a3e] rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Левая колонка - Радар (2/3 ширины) */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Техрадар</h2>
              <TechRadarChart
                data={data}
                radarCategory={radarCategory}
                radarType={radarType}
                onPointClick={handlePointClick}
                onFilter={handleRadarFilter}
              />
            </div>

            {/* Правая колонка - Плитки (1/3 ширины) - flex для выравнивания по высоте */}
            <div className="flex flex-col justify-between h-full">
              <div className="space-y-6 flex-1">
            {/* Плитки по категориям */}
            <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md p-4">
              <h3 className="text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">По категориям</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow p-3 text-center">
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">Adopt</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-200">{statsByCategory.adopt}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow p-3 text-center">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Trial</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{statsByCategory.trial}</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow p-3 text-center">
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Assess</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">{statsByCategory.assess}</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg shadow p-3 text-center">
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Hold/Drop</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-200">{statsByCategory.holdDrop}</p>
                </div>
              </div>
            </div>

            {/* Плитки по типам */}
            <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md p-4">
              <h3 className="text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">По типам</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg shadow p-3 text-center">
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Фреймворки</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">{statsByType.frameworks}</p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg shadow p-3 text-center">
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Библиотеки</p>
                  <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-200">{statsByType.libraries}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow p-3 text-center">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">Языки</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-200">{statsByType.languages}</p>
                </div>
                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg shadow p-3 text-center">
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">Инструменты</p>
                  <p className="text-2xl font-bold text-teal-900 dark:text-teal-200">{statsByType.tools}</p>
                </div>
              </div>
            </div>

            {/* Общая статистика */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 rounded-lg shadow-md p-4 text-white">
              <p className="text-xs opacity-80">Всего технологий</p>
              <p className="text-4xl font-bold">{filteredData.length}</p>
              {(radarCategory || radarType) && (
                <p className="text-xs mt-2 opacity-75">
                  (отфильтровано из {data.length})
                </p>
              )}
            </div>
              </div>
            </div>
          </div>
        </div>

        {/* Таблица на всю ширину */}
        <div className="bg-white dark:bg-[#16213e] rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              Технологии {filteredData.length !== data.length && `(отфильтровано: ${filteredData.length} из ${data.length})`}
            </h2>
            {isAdminOrManager && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
              >
                <span>+</span> Добавить технологию
              </button>
            )}
          </div>
          <TechRadarTable
            data={filteredData}
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            radarCategory={radarCategory}
            radarType={radarType}
            onRadarFilter={handleRadarFilter}
            isAdminOrManager={isAdminOrManager}
          />
        </div>
      </main>

      {selectedEntity && (
        <TechRadarModal entity={selectedEntity} onClose={() => setSelectedEntity(null)} onUpdate={fetchData} />
      )}

      {isCreateModalOpen && (
        <TechRadarModal entity={null} onClose={() => setIsCreateModalOpen(false)} onUpdate={fetchData} />
      )}
    </div>
  );
};
