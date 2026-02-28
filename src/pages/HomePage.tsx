import React, { useState, useEffect, useCallback } from 'react';
import { TechRadarChart, TechRadarTable, TechRadarModal, PageHeader } from '../components';
import type { TechRadarEntity, TechRadarCategory, TechRadarType } from '../types';
import { techRadarApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<TechRadarEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<TechRadarEntity | null>(null);
  
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
    } catch (err: any) {
      console.error('Ошибка загрузки:', err);
      setError('Ошибка при загрузке данных');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && data.length === 0 && !loading) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleRadarFilter = useCallback((category?: TechRadarCategory, type?: TechRadarType) => {
    setRadarCategory(category);
    setRadarType(type);
  }, []);

  const handlePointClick = useCallback((entity: TechRadarEntity) => {
    setSelectedEntity(entity);
  }, []);

  const handleRowClick = useCallback((entity: TechRadarEntity) => {
    setSelectedEntity(entity);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedEntity(null);
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <PageHeader title="Обзор технологического стэка" />
        <div className="flex items-center justify-center h-[calc(100vh-140px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <PageHeader title="Обзор технологического стэка" />
        <div className="flex items-center justify-center h-[calc(100vh-140px)]">
          <div className="text-center text-red-600">
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

  const stats = {
    adopt: filteredData.filter(d => d.category === 'adopt').length,
    trial: filteredData.filter(d => d.category === 'trial').length,
    assess: filteredData.filter(d => d.category === 'assess').length,
    holdDrop: filteredData.filter(d => d.category === 'hold' || d.category === 'drop').length,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PageHeader title="Обзор технологического стэка" />
      <main className="max-w-[100%] mx-auto px-4 py-8">
        {/* Радар */}
        <div className="mb-8">
          <TechRadarChart 
            data={data}
            radarCategory={radarCategory}
            radarType={radarType}
            onPointClick={handlePointClick}
            onFilter={handleRadarFilter}
          />
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded shadow p-4">
            <p className="text-xs text-gray-500">Всего</p>
            <p className="text-xl font-bold">{filteredData.length}</p>
          </div>
          <div className="bg-green-50 rounded shadow p-4">
            <p className="text-xs text-green-600">Adopt</p>
            <p className="text-xl font-bold text-green-900">{stats.adopt}</p>
          </div>
          <div className="bg-blue-50 rounded shadow p-4">
            <p className="text-xs text-blue-600">Trial</p>
            <p className="text-xl font-bold text-blue-900">{stats.trial}</p>
          </div>
          <div className="bg-yellow-50 rounded shadow p-4">
            <p className="text-xs text-yellow-600">Assess</p>
            <p className="text-xl font-bold text-yellow-900">{stats.assess}</p>
          </div>
          <div className="bg-orange-50 rounded shadow p-4">
            <p className="text-xs text-orange-600">Hold/Drop</p>
            <p className="text-xl font-bold text-orange-900">{stats.holdDrop}</p>
          </div>
        </div>

        {/* Таблица */}
        <div>
          <h2 className="text-xl font-bold mb-4">
            Технологии {(radarCategory || radarType) ? `(отфильтровано: ${filteredData.length})` : ''}
          </h2>
          <TechRadarTable 
            data={filteredData} 
            onRowClick={handleRowClick}
            radarCategory={radarCategory}
            radarType={radarType}
            onRadarFilter={handleRadarFilter}
          />
        </div>
      </main>

      {selectedEntity && (
        <TechRadarModal entity={selectedEntity} onClose={handleCloseModal} />
      )}
    </div>
  );
};
